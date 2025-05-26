// components/DataPurchase.tsx
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DataPurchaseProps {
    purchases: any[];
    onRecordPayment: (purchaseId: string, amount: number) => Promise<void>;
    onShowPaymentHistory: (purchaseId: string) => Promise<void>;
    loading: boolean;
}

export const DataPurchase: React.FC<DataPurchaseProps> = ({ 
    purchases, 
    onRecordPayment, 
    onShowPaymentHistory, 
    loading 
}) => {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const toggleExpand = (purchaseId: string) => {
        const newExpandedItems = new Set(expandedItems);
        if (expandedItems.has(purchaseId)) {
            newExpandedItems.delete(purchaseId);
        } else {
            newExpandedItems.add(purchaseId);
        }
        setExpandedItems(newExpandedItems);
    };

    const handlePayment = (purchaseId: string) => {
        Alert.prompt(
            'Tambah Pembayaran',
            'Masukkan jumlah pembayaran:',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Bayar',
                    onPress: (amount) => {
                        if (amount && !isNaN(parseFloat(amount))) {
                            onRecordPayment(purchaseId, parseFloat(amount));
                        } else {
                            Alert.alert('Error', 'Masukkan jumlah yang valid');
                        }
                    },
                },
            ],
            'plain-text',
            '',
            'numeric'
        );
    };

    // Filter data untuk 5 bulan terakhir dan urutkan dari terbaru
    const filterAndSortPurchases = (purchases: any[]) => {
        const now = new Date();
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(now.getMonth() - 5);
        
        return purchases
            .filter(purchase => {
                if (!purchase.sale_date) return false;
                const purchaseDate = new Date(purchase.sale_date);
                return purchaseDate >= fiveMonthsAgo;
            })
            .sort((a, b) => {
                const dateA = new Date(a.sale_date || 0);
                const dateB = new Date(b.sale_date || 0);
                return dateB.getTime() - dateA.getTime(); // Terbaru ke terlama
            });
    };

    const allPurchases = filterAndSortPurchases(purchases || []);
    const pendingPurchases = allPurchases.filter(purchase => 
        !purchase.status && purchase.remaining_debt > 0
    );
    const totalDebt = pendingPurchases.reduce((sum, purchase) => 
        sum + (purchase.remaining_debt || 0), 0
    );

    const renderPurchaseCard = (purchase: any) => {
        const isExpanded = expandedItems.has(purchase.purchase_id);
        const supplierName = purchase.supplier_name || 'Supplier Tidak Diketahui';
        const isPaid = purchase.status;
        const hasDebt = (purchase.remaining_debt || 0) > 0;

        return (
            <View key={purchase.purchase_id} style={styles.card}>
                {/* Header */}
                <TouchableOpacity
                    onPress={() => toggleExpand(purchase.purchase_id)}
                    style={styles.cardHeader}
                    activeOpacity={0.7}
                >
                    <View style={styles.headerLeft}>
                        <View style={styles.supplierInfo}>
                            <Text style={styles.supplierName}>{supplierName}</Text>
                            <Text style={styles.purchaseDate}>
                                {purchase.sale_date ? 
                                    new Date(purchase.sale_date).toLocaleDateString('id-ID') : 
                                    'Tanggal tidak tersedia'
                                }
                            </Text>
                        </View>
                        <View style={styles.amountInfo}>
                            <Text style={styles.totalAmount}>
                                {formatCurrency(purchase.total_amount || 0)}
                            </Text>
                            {hasDebt && (
                                <Text style={styles.debtAmount}>
                                    Sisa: {formatCurrency(purchase.remaining_debt || 0)}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.unpaidBadge]}>
                            <Text style={styles.statusText}>
                                {isPaid ? 'Lunas' : 'Belum Lunas'}
                            </Text>
                        </View>
                        <MaterialIcons 
                            name={isExpanded ? "expand-less" : "expand-more"} 
                            size={24} 
                            color="#718096" 
                        />
                    </View>
                </TouchableOpacity>

                {/* Expanded Content */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        {/* Payment Summary */}
                        <View style={styles.paymentSummary}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Pembelian:</Text>
                                <Text style={styles.summaryValue}>
                                    {formatCurrency(purchase.total_amount || 0)}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Sudah Dibayar:</Text>
                                <Text style={[styles.summaryValue, { color: '#48bb78' }]}>
                                    {formatCurrency(purchase.paid_amount || 0)}
                                </Text>
                            </View>
                            <View style={[styles.summaryRow, styles.summaryRowLast]}>
                                <Text style={styles.summaryLabel}>Sisa Hutang:</Text>
                                <Text style={[styles.summaryValue, { 
                                    color: hasDebt ? '#e53e3e' : '#48bb78',
                                    fontWeight: '600'
                                }]}>
                                    {formatCurrency(purchase.remaining_debt || 0)}
                                </Text>
                            </View>
                        </View>

                        {/* Items */}
                        {purchase.items && purchase.items.length > 0 && (
                            <View style={styles.itemsSection}>
                                <Text style={styles.sectionTitle}>
                                    Barang ({purchase.items.length})
                                </Text>
                                {purchase.items.map((item: any, index: number) => (
                                    <View key={index} style={styles.itemRow}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>
                                                {item.product_name || 'Produk Tidak Diketahui'}
                                            </Text>
                                            <Text style={styles.itemDetails}>
                                                {item.quantity || 0} × {formatCurrency(item.price || 0)}
                                            </Text>
                                        </View>
                                        <Text style={styles.itemTotal}>
                                            {formatCurrency((item.price || 0) * (item.quantity || 0))}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                onPress={() => onShowPaymentHistory(purchase.purchase_id)}
                                style={[styles.actionButton, styles.historyButton]}
                                disabled={loading}
                            >
                                <MaterialIcons name="history" size={16} color="#4a5568" />
                                <Text style={styles.historyButtonText}>Riwayat</Text>
                            </TouchableOpacity>
                            
                            {!isPaid && hasDebt && (
                                <TouchableOpacity
                                    onPress={() => handlePayment(purchase.purchase_id)}
                                    style={[styles.actionButton, styles.paymentButton]}
                                    disabled={loading}
                                >
                                    <MaterialIcons name="payment" size={16} color="white" />
                                    <Text style={styles.paymentButtonText}>Bayar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    if (allPurchases.length === 0) {
        return (
            <View style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={64} color="#a0aec0" />
                <Text style={styles.emptyTitle}>Belum Ada Pembelian</Text>
                <Text style={styles.emptyText}>
                    Tidak ada pembelian dalam 5 bulan terakhir
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{allPurchases.length}</Text>
                    <Text style={styles.statLabel}>Total (5 Bulan)</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{pendingPurchases.length}</Text>
                    <Text style={styles.statLabel}>Belum Lunas</Text>
                </View>
                <View style={[styles.statCard, styles.debtCard]}>
                    <Text style={[styles.statNumber, styles.debtNumber]}>
                        {formatCurrency(totalDebt)}
                    </Text>
                    <Text style={styles.statLabel}>Total Hutang</Text>
                </View>
            </View>

            {/* Pending Purchases Alert */}
            {pendingPurchases.length > 0 && (
                <View style={styles.alertContainer}>
                    <MaterialIcons name="warning-amber" size={20} color="#d69e2e" />
                    <Text style={styles.alertText}>
                        {pendingPurchases.length} pembelian memerlukan pembayaran
                    </Text>
                </View>
            )}

            {/* Purchases List */}
            <View style={styles.listContainer}>
                {allPurchases.map(renderPurchaseCard)}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7fafc',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4a5568',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    debtCard: {
        backgroundColor: '#fef5e7',
        borderWidth: 1,
        borderColor: '#fed7aa',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: 4,
    },
    debtNumber: {
        fontSize: 14,
        color: '#c05621',
    },
    statLabel: {
        fontSize: 12,
        color: '#718096',
        textAlign: 'center',
    },
    alertContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fefcbf',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#d69e2e',
    },
    alertText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#744210',
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    supplierInfo: {
        flex: 1,
    },
    supplierName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 4,
    },
    purchaseDate: {
        fontSize: 13,
        color: '#718096',
    },
    amountInfo: {
        alignItems: 'flex-end',
        marginRight: 12,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: 2,
    },
    debtAmount: {
        fontSize: 13,
        color: '#e53e3e',
        fontWeight: '500',
    },
    headerRight: {
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
    },
    paidBadge: {
        backgroundColor: '#c6f6d5',
    },
    unpaidBadge: {
        backgroundColor: '#fed7d7',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    expandedContent: {
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        padding: 16,
        paddingTop: 16,
    },
    paymentSummary: {
        backgroundColor: '#f7fafc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    summaryRowLast: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        marginTop: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#4a5568',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3748',
    },
    itemsSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4a5568',
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f7fafc',
        borderRadius: 6,
        marginBottom: 6,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2d3748',
        marginBottom: 2,
    },
    itemDetails: {
        fontSize: 12,
        color: '#718096',
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3748',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    historyButton: {
        backgroundColor: '#edf2f7',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    historyButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4a5568',
    },
    paymentButton: {
        backgroundColor: '#3182ce',
    },
    paymentButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
    },
});

export default DataPurchase;
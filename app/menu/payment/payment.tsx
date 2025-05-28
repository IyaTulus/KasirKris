import { PaymentHistory, PurchaseDetail } from '@/hooks/purchases';
import { usePurchases } from '@/hooks/purchases/PurchasesManagement';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const PaymentScreen = () => {
    const { purchase_id } = useLocalSearchParams();
    const {
        purchaseDetails,
        recordPayment,
        getPaymentHistory,
        loading: hookLoading
    } = usePurchases();

    const [purchaseData, setPurchaseData] = useState<PurchaseDetail | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [showProductDetails, setShowProductDetails] = useState(false);

    // Memoize loadPaymentHistory function
    const loadPaymentHistory = useCallback(async () => {
        if (purchase_id && typeof purchase_id === 'string') {
            try {
                const history = await getPaymentHistory(purchase_id);
                setPaymentHistory(history || []);
            } catch (error) {
                console.error('Failed to load payment history:', error);
                setPaymentHistory([]);
            }
        }
    }, [purchase_id, getPaymentHistory]);

    useEffect(() => {
        const foundPurchase = purchaseDetails.find(
            (p: PurchaseDetail) => p.purchase_id === purchase_id
        );

        if (foundPurchase) {
            setPurchaseData(foundPurchase);
            // setPaymentAmount(foundPurchase.remaining_debt.toString());
            setPaymentDate(new Date().toISOString().split('T')[0]);
            loadPaymentHistory();
        }
    }, [purchase_id, purchaseDetails, loadPaymentHistory]);

    const formatCurrency = (amount: number) => {
        if (isNaN(amount) || amount === null || amount === undefined) {
            return 'Rp 0';
        }
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const formatInputCurrency = (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (!numericValue) return '';
        const formatted = parseInt(numericValue).toLocaleString('id-ID');
        return `Rp ${formatted}`;
    };

    const handlePayment = async () => {
        const numericAmount = paymentAmount.replace(/[^0-9]/g, '');
        const amount = parseInt(numericAmount, 10) || 0;

        if (amount <= 0) {
            Alert.alert('Error', 'Masukkan jumlah pembayaran yang valid');
            return;
        }

        if (purchaseData && amount > purchaseData.remaining_debt) {
            Alert.alert('Error', 'Jumlah pembayaran melebihi sisa hutang');
            return;
        }

        if (!paymentDate) {
            Alert.alert('Error', 'Masukkan tanggal pembayaran');
            return;
        }

        setLoading(true);

        try {
            await recordPayment(purchase_id as string, amount);

            const isFullyPaid = purchaseData && (purchaseData.remaining_debt - amount) <= 0;

            Alert.alert(
                'Pembayaran Berhasil',
                `Pembayaran sebesar ${formatCurrency(amount)} telah dicatat.\n${isFullyPaid ? 'Pembelian telah lunas!' : `Sisa hutang: ${formatCurrency(purchaseData!.remaining_debt - amount)}`
                }`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            loadPaymentHistory();
                            // Reset payment amount for next payment
                            if (purchaseData) {
                                const newDebt = purchaseData.remaining_debt - amount;
                                setPaymentAmount(newDebt > 0 ? newDebt.toString() : '');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Gagal memproses pembayaran');
            console.error('Payment error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: boolean) => {
        return status ? '#00b894' : '#e17055';
    };

    const getStatusText = (status: boolean) => {
        return status ? 'LUNAS' : 'BELUM LUNAS';
    };

    const calculateTotalItems = () => {
        if (!purchaseData?.items || !Array.isArray(purchaseData.items)) return 0;
        return purchaseData.items.reduce((total, item) => total + (item.quantity || 0), 0);
    };

    if (hookLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#6c5ce7" />
                <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
        );
    }

    if (!purchaseData) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <View style={styles.errorContainer}>
                    <Ionicons name="receipt-outline" size={80} color="#ddd" />
                    <Text style={styles.errorTitle}>Data Tidak Ditemukan</Text>
                    <Text style={styles.errorText}>Data pembelian tidak dapat ditemukan</Text>
                    <TouchableOpacity
                        style={styles.backButtonError}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Kembali</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <>
        <Stack.Screen
                options={{
                    header: () => (
                        <View
                            style={styles.header}
                        >
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <View style={styles.headerContent}>
                                <Text style={styles.headerTitle}>Pembayaran</Text>
                                <Text style={styles.headerSubtitle}>ID: {purchaseData.purchase_id}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.historyButton}
                                onPress={() => setShowPaymentHistory(!showPaymentHistory)}
                            >
                                <Ionicons name={showPaymentHistory ? "time" : "time-outline"} size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6c5ce7" />

            {/* Header */}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Purchase Summary Card */}
                <View style={styles.card}>
                    <LinearGradient
                        colors={['#6c5ce7', '#a29bfe']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardHeaderGradient}
                    >
                        <Ionicons name="receipt" size={24} color="white" />
                        <Text style={styles.cardTitleWhite}>Ringkasan Pembelian</Text>
                    </LinearGradient>

                    <View style={styles.cardContent}>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <View style={styles.infoIconContainer}>
                                    <Ionicons name="business-outline" size={20} color="#6c5ce7" />
                                </View>
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Supplier</Text>
                                    <Text style={styles.infoValue}>{purchaseData.supplier_name || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <View style={styles.infoIconContainer}>
                                    <Ionicons name="calendar-outline" size={20} color="#6c5ce7" />
                                </View>
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Tanggal Pembelian</Text>
                                    <Text style={styles.infoValue}>{formatDate(purchaseData.sale_date)}</Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <View style={styles.infoIconContainer}>
                                    <Ionicons name="cube-outline" size={20} color="#6c5ce7" />
                                </View>
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Total Item</Text>
                                    <Text style={styles.infoValue}>{calculateTotalItems()}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.statusContainer}>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(purchaseData.status) }]}>
                                <Ionicons
                                    name={purchaseData.status ? "checkmark-circle" : "time"}
                                    size={16}
                                    color="white"
                                />
                                <Text style={styles.statusText}>{getStatusText(purchaseData.status)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Products Detail Card with Dropdown */}
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.dropdownHeader}
                        onPress={() => setShowProductDetails(!showProductDetails)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.dropdownHeaderLeft}>
                            <View style={styles.dropdownIconContainer}>
                                <Ionicons name="basket" size={24} color="#6c5ce7" />
                            </View>
                            <Text style={styles.cardTitle}>Detail Produk</Text>
                            <View style={styles.itemCountBadge}>
                                <Text style={styles.itemCountText}>{purchaseData.items?.length || 0}</Text>
                            </View>
                        </View>
                        <View style={styles.chevronContainer}>
                            <Ionicons
                                name={showProductDetails ? "chevron-up" : "chevron-down"}
                                size={24}
                                color="#6c5ce7"
                            />
                        </View>
                    </TouchableOpacity>

                    {showProductDetails && (
                        <View style={styles.cardContent}>
                            {purchaseData.items && Array.isArray(purchaseData.items) && purchaseData.items.length > 0 ? (
                                purchaseData.items.map((item, index) => (
                                    <View key={item.subCollection_id || index} style={styles.productItem}>
                                        <View style={styles.productHeader}>
                                            <View style={styles.productImageContainer}>
                                                <Ionicons name="cube" size={24} color="#6c5ce7" />
                                            </View>
                                            <View style={styles.productInfo}>
                                                <Text style={styles.productName} numberOfLines={2}>
                                                    {item.product_name || 'Produk Tidak Diketahui'}
                                                </Text>
                                                <Text style={styles.productId}>ID: {item.product_id || 'N/A'}</Text>
                                            </View>
                                            <View style={styles.productTotal}>
                                                <Text style={styles.productTotalAmount}>{formatCurrency(item.subtotal || 0)}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.productDetails}>
                                            <View style={styles.productDetailRow}>
                                                <View style={styles.productDetailItem}>
                                                    <Text style={styles.productDetailLabel}>Harga Satuan</Text>
                                                    <Text style={styles.productDetailValue}>{formatCurrency(item.price || 0)}</Text>
                                                </View>

                                                <View style={styles.productDetailItem}>
                                                    <Text style={styles.productDetailLabel}>Quantity</Text>
                                                    <Text style={styles.productDetailValue}>{item.quantity || 0}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.productDetailSeparator} />
                                            <View style={styles.productDetailItem}>
                                                <Text style={styles.productDetailLabel}>Subtotal</Text>
                                                <Text style={[styles.productDetailValue, styles.subtotalHighlight]}>
                                                    {formatCurrency(item.subtotal || 0)}
                                                </Text>
                                            </View>
                                        </View>

                                        {index < purchaseData.items.length - 1 && <View style={styles.productSeparator} />}
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="basket-outline" size={48} color="#ddd" />
                                    <Text style={styles.emptyText}>Tidak ada item</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Financial Summary Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderIconContainer}>
                            <Ionicons name="calculator" size={24} color="#6c5ce7" />
                        </View>
                        <Text style={styles.cardTitle}>Rincian Keuangan</Text>
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.financialSummary}>
                            <View style={styles.financialRow}>
                                <View style={styles.financialLabelContainer}>
                                    <Ionicons name="card-outline" size={16} color="#636e72" />
                                    <Text style={styles.financialLabel}>Total Pembelian</Text>
                                </View>
                                <Text style={styles.financialValue}>{formatCurrency(purchaseData.total_amount || 0)}</Text>
                            </View>

                            <View style={styles.financialRow}>
                                <View style={styles.financialLabelContainer}>
                                    <Ionicons name="checkmark-circle-outline" size={16} color="#00b894" />
                                    <Text style={styles.financialLabel}>Sudah Dibayar</Text>
                                </View>
                                <Text style={[styles.financialValue, { color: '#00b894' }]}>
                                    {formatCurrency(purchaseData.paid_amount || 0)}
                                </Text>
                            </View>

                            <View style={styles.financialSeparator} />

                            <View style={[styles.financialRow, styles.debtRow]}>
                                <View style={styles.financialLabelContainer}>
                                    <Ionicons name="alert-circle-outline" size={18} color="#e17055" />
                                    <Text style={styles.debtLabel}>Sisa Hutang</Text>
                                </View>
                                <Text style={styles.debtValue}>{formatCurrency(purchaseData.remaining_debt || 0)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Payment History Card */}
                {showPaymentHistory && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderIconContainer}>
                                <Ionicons name="time" size={24} color="#6c5ce7" />
                            </View>
                            <Text style={styles.cardTitle}>Riwayat Pembayaran</Text>
                        </View>

                        <View style={styles.cardContent}>
                            {paymentHistory.length > 0 ? (
                                paymentHistory.map((payment, index) => (
                                    <View key={payment.payment_id || index} style={styles.paymentHistoryItem}>
                                        <View style={styles.paymentHistoryHeader}>
                                            <View style={styles.paymentHistoryIcon}>
                                                <Ionicons name="cash" size={20} color="#00b894" />
                                            </View>
                                            <View style={styles.paymentHistoryInfo}>
                                                <Text style={styles.paymentHistoryAmount}>
                                                    {formatCurrency(payment.amount || 0)}
                                                </Text>
                                                <Text style={styles.paymentHistoryDate}>
                                                    {formatDate(payment.payment_date)}
                                                </Text>
                                            </View>
                                        </View>
                                        {index < paymentHistory.length - 1 && <View style={styles.paymentHistorySeparator} />}
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="receipt-outline" size={48} color="#ddd" />
                                    <Text style={styles.emptyText}>Belum ada riwayat pembayaran</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Payment Form Card */}
                {(purchaseData.remaining_debt || 0) > 0 && (
                    <View style={styles.card}>
                        <LinearGradient
                            colors={['#6c5ce7', '#a29bfe']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.cardHeaderGradient}
                        >
                            <Ionicons name="card" size={24} color="white" />
                            <Text style={styles.cardTitleWhite}>Form Pembayaran</Text>
                        </LinearGradient>

                        <View style={styles.cardContent}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Jumlah Pembayaran</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="cash-outline" size={20} color="#6c5ce7" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        keyboardType="numeric"
                                        placeholder="Masukkan nominal"
                                        placeholderTextColor="#a0a0a0"
                                        value={formatInputCurrency(paymentAmount)}
                                        onChangeText={(text) => {
                                            const numericValue = text.replace(/[^0-9]/g, '');
                                            setPaymentAmount(numericValue);
                                        }}
                                    />
                                </View>
                                <Text style={styles.helperText}>
                                    Maksimal: {formatCurrency(purchaseData.remaining_debt || 0)}
                                </Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Tanggal Pembayaran</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="calendar-outline" size={20} color="#6c5ce7" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor="#a0a0a0"
                                        value={paymentDate}
                                        onChangeText={setPaymentDate}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.paymentButton, loading && styles.paymentButtonDisabled]}
                                onPress={handlePayment}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={loading ? ['#ddd', '#ccc'] : ['#6c5ce7', '#a29bfe']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.paymentButtonGradient}
                                >
                                    {loading ? (
                                        <>
                                            <ActivityIndicator size="small" color="white" />
                                            <Text style={styles.paymentButtonText}>Memproses...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="card" size={20} color="white" />
                                            <Text style={styles.paymentButtonText}>Bayar Sekarang</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Bottom spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#636e72',
        fontWeight: '500',
    },
    errorContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
        marginTop: 20,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#636e72',
        textAlign: 'center',
        marginBottom: 30,
    },
    header: {
        backgroundColor: '#6c5ce7',
        paddingTop: StatusBar.currentHeight || 40,
        paddingBottom: 24,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    historyButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 12,
    },
    cardHeaderIconContainer: {
        marginRight: 12,
    },
    cardHeaderGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 16,
    },
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e8ed',
    },
    dropdownHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dropdownIconContainer: {
        marginRight: 12,
    },
    chevronContainer: {
        padding: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
        flex: 1,
    },
    cardTitleWhite: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 12,
        flex: 1,
    },
    cardContent: {
        padding: 20,
        paddingTop: 16,
    },
    itemCountBadge: {
        backgroundColor: '#6c5ce7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
        marginLeft: 12,
    },
    itemCountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoGrid: {
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#636e72',
        marginBottom: 4,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 15,
        color: '#2d3436',
        fontWeight: '600',
    },
    statusContainer: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    productItem: {
        marginBottom: 20,
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    productImageContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    productInfo: {
        flex: 1,
        marginRight: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 6,
        lineHeight: 22,
    },
    productId: {
        fontSize: 12,
        color: '#636e72',
        fontWeight: '500',
    },
    productTotal: {
        alignItems: 'flex-end',
    },
    productTotalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6c5ce7',
    },
    productDetails: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
    },
    productDetailRow: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    productDetailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        marginBottom: 8,
    },
    productDetailLabel: {
        fontSize: 14,
        color: '#636e72',
        fontWeight: '500',
    },
    productDetailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3436',
    },
    productDetailSeparator: {
        height: 1,
        backgroundColor: '#e1e8ed',
        marginVertical: 8,
    },
    subtotalHighlight: {
        color: '#6c5ce7',
        fontWeight: 'bold',
        fontSize: 15,
    },
    productSeparator: {
        height: 1,
        backgroundColor: '#e1e8ed',
        marginVertical: 20,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: '#636e72',
        fontWeight: '500',
    },
    financialSummary: {
        marginBottom: 20,
    },
    financialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    financialLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    financialLabel: {
        fontSize: 14,
        color: '#636e72',
        fontWeight: '500',
        marginLeft: 8,
    },
    financialValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
    },
    financialSeparator: {
        height: 1,
        backgroundColor: '#e1e8ed',
        marginVertical: 12,
    },
    debtRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffecec',
        paddingVertical: 12,
        borderRadius: 8,
    },
    debtLabel: {
        fontSize: 16,
        color: '#e17055',
        fontWeight: '600',
    },
    debtValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e17055',
    },
    paymentHistoryItem: {
        marginBottom: 16,
    },
    paymentHistoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    paymentHistoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 180, 148, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    paymentHistoryInfo: {
        flex: 1,
    },
    paymentHistoryAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00b894',
    },
    paymentHistoryDate: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 4,
    },
    paymentHistorySeparator: {
        height: 1,
        backgroundColor: '#e1e8ed',
        marginVertical: 12,
    },
    paymentButton: {
        marginTop: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    paymentButtonDisabled: {
        opacity: 0.6,
    },
    paymentButtonGradient: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#636e72',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e1e8ed',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    inputIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#2d3436',
    },
    helperText: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 4,
    },
    bottomSpacing: {
        height: 20,
    },
    backButtonError: {
        marginTop: 24,
        backgroundColor: '#6c5ce7',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: 'center',
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PaymentScreen;
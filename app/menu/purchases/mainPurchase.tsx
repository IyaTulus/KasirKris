// components/PurchaseExample.tsx
import React, { useState, useCallback } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePurchases } from '../../../hooks/purchases/PurchasesManagement';
import { router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import CreatePurchase from './createPurchases';
import DataPurchase from './dataPurchase';

const { width, height } = Dimensions.get('window');

interface PaymentHistoryItem {
    amount: number;
    payment_date: string;
    id?: string;
}

export const PurchaseExample = () => {
    const {
        purchaseDetails,
        createPurchase,
        recordPayment,
        getPaymentHistory,
        loading
    } = usePurchases();

    const [activeTab, setActiveTab] = useState<'create' | 'data'>('create');

    const formatCurrency = useCallback((amount: number) => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return 'Rp 0';
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    }, []);

    const handleCreatePurchase = useCallback(async (purchaseData: any) => {
        try {
            if (!createPurchase) {
                throw new Error('Fungsi buat pembelian tidak tersedia');
            }

            await createPurchase(purchaseData);
            Alert.alert(
                'Berhasil', 
                'Pembelian berhasil dibuat!',
                [
                    {
                        text: 'Lihat Data',
                        onPress: () => setActiveTab('data')
                    },
                    {
                        text: 'Buat Lagi',
                        style: 'cancel'
                    }
                ]
            );
        } catch (error) {
            console.error('Gagal membuat pembelian:', error);
            Alert.alert('Error', 'Gagal membuat pembelian. Silakan coba lagi.');
        }
    }, [createPurchase]);

    const handleRecordPayment = useCallback(async (purchaseId: string, amount: number) => {
        try {
            if (!recordPayment) {
                throw new Error('Fungsi catat pembayaran tidak tersedia');
            }

            if (!purchaseId || typeof amount !== 'number' || amount <= 0) {
                throw new Error('Data pembayaran tidak valid');
            }

            await recordPayment(purchaseId, amount);
            Alert.alert('Berhasil', 'Pembayaran berhasil dicatat!');
        } catch (error) {
            console.error('Gagal mencatat pembayaran:', error);
            Alert.alert('Error', 'Gagal mencatat pembayaran. Silakan coba lagi.');
        }
    }, [recordPayment]);

    const handleShowPaymentHistory = useCallback(async (purchaseId: string) => {
        try {
            if (!getPaymentHistory) {
                throw new Error('Fungsi riwayat pembayaran tidak tersedia');
            }

            if (!purchaseId) {
                throw new Error('ID pembelian tidak valid');
            }

            const history: PaymentHistoryItem[] = await getPaymentHistory(purchaseId);
            
            if (!Array.isArray(history) || history.length === 0) {
                Alert.alert('Riwayat Pembayaran', 'Belum ada pembayaran untuk pembelian ini.');
                return;
            }

            const historyText = history
                .map((payment, index) => {
                    const amount = typeof payment.amount === 'number' ? payment.amount : 0;
                    const date = payment.payment_date ? new Date(payment.payment_date) : new Date();
                    
                    return `${index + 1}. ${formatCurrency(amount)} - ${date.toLocaleDateString('id-ID')}`;
                })
                .join('\n');

            Alert.alert(
                'Riwayat Pembayaran', 
                `Total Pembayaran: ${history.length}\n\n${historyText}`,
                [{ text: 'Tutup', style: 'default' }]
            );
        } catch (error) {
            console.error('Gagal memuat riwayat pembayaran:', error);
            Alert.alert('Error', 'Gagal memuat riwayat pembayaran. Silakan coba lagi.');
        }
    }, [getPaymentHistory, formatCurrency]);

    const handleBackPress = useCallback(() => {
        try {
            router.back();
        } catch (error) {
            console.warn('Kesalahan navigasi:', error);
        }
    }, []);

    const handleInfoPress = useCallback(() => {
        Alert.alert(
            'Ringkasan Pembelian',
            `Total Pembelian: ${totalPurchases}\n` +
            `Total Nominal: ${formatCurrency(totalAmount)}\n` +
            `Total Terbayar: ${formatCurrency(totalPaid)}\n` +
            `Sisa Hutang: ${formatCurrency(totalDebt)}`,
            [{ text: 'Tutup', style: 'default' }]
        );
    }, [formatCurrency]);

    // Safe calculations with fallbacks
    const safePurchaseDetails = Array.isArray(purchaseDetails) ? purchaseDetails : [];
    const totalPurchases = safePurchaseDetails.length;
    const totalAmount = safePurchaseDetails.reduce((sum, purchase) => {
        const amount = typeof purchase?.total_amount === 'number' ? purchase.total_amount : 0;
        return sum + amount;
    }, 0);
    const totalPaid = safePurchaseDetails.reduce((sum, purchase) => {
        const amount = typeof purchase?.paid_amount === 'number' ? purchase.paid_amount : 0;
        return sum + amount;
    }, 0);
    const totalDebt = safePurchaseDetails.reduce((sum, purchase) => {
        const amount = typeof purchase?.remaining_debt === 'number' ? purchase.remaining_debt : 0;
        return sum + amount;
    }, 0);

    return (
        <>
            <Stack.Screen
                options={{
                    header: () => (
                        <View style={styles.header}>
                            <View style={styles.headerTop}>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={handleBackPress}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="arrow-back" size={24} color="#2d3748" />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>Pembelian</Text>
                                <TouchableOpacity
                                    style={styles.infoButton}
                                    onPress={handleInfoPress}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons name="info-outline" size={24} color="#4a5568" />
                                </TouchableOpacity>
                            </View>
                            {totalDebt > 0 && (
                                <View style={styles.debtIndicator}>
                                    <Text style={styles.debtText}>
                                        Sisa Hutang: {formatCurrency(totalDebt)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ),
                }}
            />
            
            <View style={styles.container}>
                {/* Simple Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'create' && styles.activeTab]}
                        onPress={() => setActiveTab('create')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
                            Buat Baru
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'data' && styles.activeTab]}
                        onPress={() => setActiveTab('data')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'data' && styles.activeTabText]}>
                            Data ({totalPurchases})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <View style={styles.content}>
                    {activeTab === 'create' ? (
                        <CreatePurchase 
                            onCreatePurchase={handleCreatePurchase}
                            loading={loading || false}
                        />
                    ) : (
                        <DataPurchase
                            purchases={safePurchaseDetails}
                            onRecordPayment={handleRecordPayment}
                            onShowPaymentHistory={handleShowPaymentHistory}
                            loading={loading || false}
                        />
                    )}
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#6c5ce7',
        paddingTop: height * 0.05,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        color: '#ffffff',
        alignItems: 'center',
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        flex: 1,
        textAlign: 'center',
    },
    infoButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    debtIndicator: {
        backgroundColor: '#fef5e7',
        marginHorizontal: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#f6ad55',
    },
    debtText: {
        fontSize: 13,
        color: '#c05621',
        fontWeight: '500',
        textAlign: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f7fafc',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        margin: 16,
        borderRadius: 8,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#718096',
    },
    activeTabText: {
        color: '#2d3748',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
});

export default PurchaseExample;
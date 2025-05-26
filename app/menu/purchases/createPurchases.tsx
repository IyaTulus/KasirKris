// components/CreatePurchase.tsx
import React, { useState, useEffect } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useCallback } from 'react';

interface PurchaseItem {
    productName: string;
    price: number;
    quantity: number; // Now supports decimal values
    hargaBeli: number;
    hargaJual: number;
}

interface Product {
    id: string;
    name: string;
    lastPrice?: number;
    lastHargaBeli?: number;
    lastHargaJual?: number;
}

interface Supplier {
    id: string;
    name: string;
    lastPurchaseDate?: string;
}

interface CreatePurchaseProps {
    onCreatePurchase: (data: any) => Promise<void>;
    loading: boolean;
    // Mock data - replace with actual API calls
    products?: Product[];
    suppliers?: Supplier[];
}

const { width } = Dimensions.get('window');

const CreatePurchase: React.FC<CreatePurchaseProps> = ({ 
    onCreatePurchase, 
    loading,
    products = [],
    suppliers = []
}) => {
    const [supplierName, setSupplierName] = useState('');
    const [items, setItems] = useState<PurchaseItem[]>([]);
    const [currentItem, setCurrentItem] = useState<PurchaseItem>({
        productName: '',
        price: 0,
        quantity: 0,
        hargaBeli: 0,
        hargaJual: 0
    });
    const [paidAmount, setPaidAmount] = useState(0);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    
    // Dropdown states
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    // Mock data for demonstration
    // Ambil data produk dari Firebase Realtime Database

    const [mockProducts, setMockProducts] = useState<Product[]>([]);

    useEffect(() => {
        const db = getDatabase();
        const productsRef = ref(db, 'tb_product');
        const handleValue = (snapshot: any) => {
            const data = snapshot.val();
            if (data) {
                const productsArray: Product[] = Object.entries(data).map(([id, value]: [string, any]) => ({
                    id,
                    name: value.name,
                    lastPrice: value.lastPrice,
                    lastHargaBeli: value.lastHargaBeli,
                    lastHargaJual: value.lastHargaJual,
                }));
                setMockProducts(productsArray);
            } else {
                setMockProducts([]);
            }
        };
        onValue(productsRef, handleValue);
        return () => off(productsRef, 'value', handleValue);
    }, []);

    // Ambil data supplier dari Firebase Realtime Database
    const [mockSuppliers, setMockSuppliers] = useState<Supplier[]>([]);

    useEffect(() => {
        const db = getDatabase();
        const suppliersRef = ref(db, 'tb_suppliers');
        const handleValue = (snapshot: any) => {
            const data = snapshot.val();
            if (data) {
                const suppliersArray: Supplier[] = Object.entries(data).map(([id, value]: [string, any]) => ({
                    id,
                    name: value.name,
                    lastPurchaseDate: value.lastPurchaseDate,
                }));
                setMockSuppliers(suppliersArray);
            } else {
                setMockSuppliers([]);
            }
        };
        onValue(suppliersRef, handleValue);
        return () => off(suppliersRef, 'value', handleValue);
    }, []);

    useEffect(() => {
        // Filter suppliers based on input
        if (supplierName.trim() === '') {
            setFilteredSuppliers([]);
            setShowSupplierDropdown(false);
        } else {
            const filtered = mockSuppliers.filter(supplier =>
                supplier.name.toLowerCase().includes(supplierName.toLowerCase())
            );
            setFilteredSuppliers(filtered);
            setShowSupplierDropdown(filtered.length > 0);
        }
    }, [supplierName]);

    useEffect(() => {
        // Filter products based on input
        if (currentItem.productName.trim() === '') {
            setFilteredProducts([]);
            setShowProductDropdown(false);
        } else {
            const filtered = mockProducts.filter(product =>
                product.name.toLowerCase().includes(currentItem.productName.toLowerCase())
            );
            setFilteredProducts(filtered);
            setShowProductDropdown(filtered.length > 0);
        }
    }, [currentItem.productName]);

    const selectSupplier = (supplier: Supplier) => {
        setSupplierName(supplier.name);
        setShowSupplierDropdown(false);
    };

    const selectProduct = (product: Product) => {
        setCurrentItem({
            ...currentItem,
            productName: product.name,
            price: product.lastPrice || 0,
            hargaBeli: product.lastHargaBeli || 0,
            hargaJual: product.lastHargaJual || 0,
        });
        setShowProductDropdown(false);
    };

    const addItem = () => {
        if (currentItem.productName && currentItem.price > 0 && currentItem.quantity > 0) {
            setItems([...items, currentItem]);
            setCurrentItem({
                productName: '',
                price: 0,
                quantity: 0,
                hargaBeli: 0,
                hargaJual: 0
            });
        } else {
            Alert.alert('Error', 'Mohon isi semua kolom yang diperlukan (Nama Produk, Harga, dan Jumlah)');
        }
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatQuantity = (quantity: number) => {
        // Format quantity to show decimal places only if needed
        return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
    };

    const handleCreatePurchase = async () => {
        try {
            if (!supplierName.trim()) {
                Alert.alert('Error', 'Mohon masukkan nama supplier');
                return;
            }
            
            if (items.length === 0) {
                Alert.alert('Error', 'Mohon tambahkan minimal satu item');
                return;
            }

            await onCreatePurchase({
                supplierName: supplierName.trim(),
                userId: 'user123', // Ganti dengan user ID sebenarnya
                items,
                paidAmount,
                saleDate: new Date().toISOString()
            });

            // Reset form setelah berhasil
            setSupplierName('');
            setItems([]);
            setPaidAmount(0);
            setCurrentItem({
                productName: '',
                price: 0,
                quantity: 0,
                hargaBeli: 0,
                hargaJual: 0
            });

        } catch (error) {
            console.error('Error creating purchase:', error);
        }
    };

    const renderInput = (
        placeholder: string, 
        value: string | number, 
        onChangeText: (text: string) => void, 
        keyboardType: 'default' | 'numeric' | 'decimal-pad' = 'default', 
        inputKey: string,
        description?: string,
        required?: boolean,
        showDropdown?: boolean,
        onFocus?: () => void
    ) => (
        <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>
                    {placeholder}
                    {required && <Text style={styles.requiredMark}> *</Text>}
                </Text>
                {description && <Text style={styles.inputDescription}>{description}</Text>}
            </View>
            <TextInput
                placeholder={placeholder}
                value={value.toString()}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                style={[styles.input, focusedInput === inputKey && styles.inputFocused]}
                onFocus={() => {
                    setFocusedInput(inputKey);
                    onFocus?.();
                }}
                onBlur={() => setFocusedInput(null)}
            />
            {showDropdown && (
                <View style={styles.dropdown}>
                    <FlatList
                        data={inputKey === 'supplier' ? filteredSuppliers : filteredProducts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => {
                                    if (inputKey === 'supplier') {
                                        selectSupplier(item as Supplier);
                                    } else {
                                        selectProduct(item as Product);
                                    }
                                }}
                            >
                                <View style={styles.dropdownItemContent}>
                                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                                    {inputKey === 'supplier' && (item as Supplier).lastPurchaseDate && (
                                        <Text style={styles.dropdownItemSubtext}>
                                            Terakhir: {new Date((item as Supplier).lastPurchaseDate!).toLocaleDateString('id-ID')}
                                        </Text>
                                    )}
                                    {inputKey === 'productName' && (item as Product).lastPrice && (
                                        <Text style={styles.dropdownItemSubtext}>
                                            Harga terakhir: {formatCurrency((item as Product).lastPrice!)}
                                        </Text>
                                    )}
                                </View>
                                <MaterialIcons name="chevron-right" size={20} color="#636e72" />
                            </TouchableOpacity>
                        )}
                        style={styles.dropdownList}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.headerIconContainer}>
                        <MaterialIcons name="add-shopping-cart" size={24} color="#6c5ce7" />
                    </View>
                    <View>
                        <Text style={styles.sectionTitle}>Buat Pembelian Baru</Text>
                        <Text style={styles.sectionSubtitle}>Tambah transaksi pembelian dari supplier</Text>
                    </View>
                </View>

                {/* Supplier Information */}
                <View style={styles.formSection}>
                    <Text style={styles.formSectionTitle}>
                        <MaterialIcons name="business" size={18} color="#6c5ce7" /> Informasi Supplier
                    </Text>
                    <Text style={styles.formSectionDescription}>
                        Masukkan atau pilih supplier dari daftar yang tersedia
                    </Text>
                    
                    {renderInput(
                        'Nama Supplier', 
                        supplierName, 
                        setSupplierName, 
                        'default', 
                        'supplier',
                        'Ketik nama supplier untuk melihat saran',
                        true,
                        showSupplierDropdown
                    )}
                </View>

                {/* Add Items Section */}
                <View style={styles.formSection}>
                    <Text style={styles.formSectionTitle}>
                        <MaterialIcons name="inventory" size={18} color="#6c5ce7" /> Tambah Barang
                    </Text>
                    <Text style={styles.formSectionDescription}>
                        Tambahkan produk dan detailnya ke pembelian ini
                    </Text>

                    {renderInput(
                        'Nama Produk', 
                        currentItem.productName, 
                        (text) => setCurrentItem({ ...currentItem, productName: text }), 
                        'default', 
                        'productName',
                        'Ketik nama produk untuk melihat saran atau masukkan produk baru',
                        true,
                        showProductDropdown
                    )}

                    <View style={styles.rowInputs}>
                        <View style={styles.halfInput}>
                            {renderInput(
                                'Harga', 
                                currentItem.price, 
                                (text) => setCurrentItem({ ...currentItem, price: parseFloat(text) || 0 }), 
                                'numeric', 
                                'price',
                                'Harga per satuan',
                                true
                            )}
                        </View>
                        <View style={styles.halfInput}>
                            {renderInput(
                                'Jumlah', 
                                currentItem.quantity, 
                                (text) => {
                                    // Allow decimal input for quantity
                                    const numValue = parseFloat(text);
                                    setCurrentItem({ 
                                        ...currentItem, 
                                        quantity: isNaN(numValue) ? 0 : numValue 
                                    });
                                }, 
                                'decimal-pad', 
                                'quantity',
                                'Jumlah barang',
                                true
                            )}
                        </View>
                    </View>

                    <View style={styles.rowInputs}>
                        <View style={styles.halfInput}>
                            {renderInput(
                                'Harga Beli', 
                                currentItem.hargaBeli, 
                                (text) => setCurrentItem({ ...currentItem, hargaBeli: parseFloat(text) || 0 }), 
                                'numeric', 
                                'hargaBeli',
                                'Harga beli dari supplier'
                            )}
                        </View>
                        <View style={styles.halfInput}>
                            {renderInput(
                                'Harga Jual', 
                                currentItem.hargaJual, 
                                (text) => setCurrentItem({ ...currentItem, hargaJual: parseFloat(text) || 0 }), 
                                'numeric', 
                                'hargaJual',
                                'Rencana harga jual'
                            )}
                        </View>
                    </View>

                    <TouchableOpacity onPress={addItem} style={styles.addItemButton}>
                        <MaterialIcons name="add" size={20} color="white" />
                        <Text style={styles.addItemButtonText}>Tambah ke Daftar</Text>
                    </TouchableOpacity>
                </View>

                {/* Items List */}
                {items.length > 0 && (
                    <View style={styles.formSection}>
                        <Text style={styles.formSectionTitle}>
                            <MaterialIcons name="list" size={18} color="#6c5ce7" /> Daftar Barang ({items.length})
                        </Text>
                        <Text style={styles.formSectionDescription}>
                            Cek kembali barang yang sudah ditambahkan
                        </Text>
                        
                        <View style={styles.itemsList}>
                            {items.map((item, index) => (
                                <View key={index} style={styles.itemCard}>
                                    <View style={styles.itemHeader}>
                                        <Text style={styles.itemName}>{item.productName}</Text>
                                        <TouchableOpacity 
                                            onPress={() => removeItem(index)}
                                            style={styles.removeButton}
                                        >
                                            <MaterialIcons name="close" size={18} color="#e17055" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemDetailText}>
                                            Jumlah: {formatQuantity(item.quantity)} × {formatCurrency(item.price)} = {formatCurrency(item.quantity * item.price)}
                                        </Text>
                                        {item.hargaBeli > 0 && (
                                            <Text style={styles.itemDetailText}>
                                                Beli: {formatCurrency(item.hargaBeli)} | Jual: {formatCurrency(item.hargaJual)}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                            
                            <View style={styles.totalContainer}>
                                <Text style={styles.totalLabel}>Total Pembelian:</Text>
                                <Text style={styles.totalAmount}>{formatCurrency(calculateTotal())}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Payment Section */}
                <View style={styles.formSection}>
                    <Text style={styles.formSectionTitle}>
                        <MaterialIcons name="payment" size={18} color="#6c5ce7" /> Informasi Pembayaran
                    </Text>
                    <Text style={styles.formSectionDescription}>
                        Masukkan jumlah yang dibayar saat pembelian (bisa pembayaran sebagian)
                    </Text>
                    
                    {renderInput(
                        'Jumlah Dibayar', 
                        paidAmount, 
                        (text) => setPaidAmount(parseFloat(text) || 0), 
                        'numeric', 
                        'paidAmount',
                        'Jumlah yang dibayar sekarang (isi 0 jika hutang penuh)'
                    )}

                    {items.length > 0 && (
                        <View style={styles.paymentSummary}>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Total:</Text>
                                <Text style={styles.paymentValue}>{formatCurrency(calculateTotal())}</Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentLabel}>Dibayar:</Text>
                                <Text style={styles.paymentValue}>{formatCurrency(paidAmount)}</Text>
                            </View>
                            <View style={[styles.paymentRow, styles.paymentRowHighlight]}>
                                <Text style={styles.paymentLabelBold}>Sisa Hutang:</Text>
                                <Text style={[styles.paymentValueBold, { 
                                    color: (calculateTotal() - paidAmount) > 0 ? '#e17055' : '#00b894' 
                                }]}>
                                    {formatCurrency(calculateTotal() - paidAmount)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Create Button */}
                <TouchableOpacity
                    onPress={handleCreatePurchase}
                    disabled={loading || items.length === 0 || !supplierName.trim()}
                    style={[
                        styles.createButton, 
                        (loading || items.length === 0 || !supplierName.trim()) && styles.createButtonDisabled
                    ]}
                >
                    <MaterialIcons 
                        name={loading ? "hourglass-empty" : "save"} 
                        size={20} 
                        color="white" 
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.createButtonText}>
                        {loading ? 'Membuat Pembelian...' : 'Buat Pembelian'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9ff',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f8f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#636e72',
    },
    formSection: {
        marginBottom: 25,
        position: 'relative',
    },
    formSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    formSectionDescription: {
        fontSize: 13,
        color: '#636e72',
        marginBottom: 15,
        lineHeight: 18,
    },
    inputGroup: {
        marginBottom: 15,
        position: 'relative',
    },
    inputLabelContainer: {
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3436',
    },
    requiredMark: {
        color: '#e17055',
        fontWeight: 'bold',
    },
    inputDescription: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 2,
        fontStyle: 'italic',
    },
    input: {
        backgroundColor: '#f8f9ff',
        borderWidth: 1,
        borderColor: '#e6e7ff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#2d3436',
    },
    inputFocused: {
        borderColor: '#6c5ce7',
        borderWidth: 2,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
        maxHeight: 200,
    },
    dropdownList: {
        borderRadius: 12,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemContent: {
        flex: 1,
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#2d3436',
        fontWeight: '500',
    },
    dropdownItemSubtext: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 2,
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 10,
    },
    halfInput: {
        flex: 1,
    },
    addItemButton: {
        backgroundColor: '#74b9ff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    addItemButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    itemsList: {
        backgroundColor: '#f8f9ff',
        borderRadius: 12,
        padding: 15,
    },
    itemCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#6c5ce7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        flex: 1,
    },
    removeButton: {
        padding: 4,
        borderRadius: 12,
        backgroundColor: '#ffeaa7',
    },
    itemDetails: {
        gap: 4,
    },
    itemDetailText: {
        fontSize: 14,
        color: '#636e72',
    },
    totalContainer: {
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        borderRadius: 10,
        padding: 15,
        marginTop: 8,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        color: '#636e72',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6c5ce7',
    },
    paymentSummary: {
        backgroundColor: '#f8f9ff',
        borderRadius: 12,
        padding: 15,
        marginTop: 10,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    paymentRowHighlight: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e6e7ff',
        marginTop: 4,
    },
    paymentLabel: {
        fontSize: 14,
        color: '#636e72',
    },
    paymentValue: {
        fontSize: 14,
        color: '#2d3436',
        fontWeight: '500',
    },
    paymentLabelBold: {
        fontSize: 16,
        color: '#2d3436',
        fontWeight: 'bold',
    },
    paymentValueBold: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    createButton: {
        backgroundColor: '#6c5ce7',
        paddingVertical: 18,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6c5ce7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginTop: 10,
    },
    createButtonDisabled: {
        backgroundColor: '#a8a8a8',
        shadowOpacity: 0,
        elevation: 0,
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    buttonIcon: {
        marginRight: -8,
    },
});

export default CreatePurchase;
// components/CreatePurchase.tsx
import React, { useState, useEffect } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProductManagement } from '../../../hooks/product/ProductManagement';
import { useSupplierManagement } from '../../../hooks/supplier/SupplierManagement';

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
}

const { width } = Dimensions.get('window');

const CreatePurchase: React.FC<CreatePurchaseProps> = ({ 
    onCreatePurchase, 
    loading
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
    const [transactionDate, setTransactionDate] = useState(new Date());
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    
    // Modal states untuk picker
    const [showSupplierPicker, setShowSupplierPicker] = useState(false);
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
    const [productSearchQuery, setProductSearchQuery] = useState('');

    // Input text states untuk handling decimal
    const [priceText, setPriceText] = useState('');
    const [quantityText, setQuantityText] = useState('');
    const [hargaBeliText, setHargaBeliText] = useState('');
    const [hargaJualText, setHargaJualText] = useState('');
    const [paidAmountText, setPaidAmountText] = useState('');
    const [transactionDateText, setTransactionDateText] = useState('');

    // Menggunakan hooks untuk data
    const { products } = useProductManagement();
    const { suppliers } = useSupplierManagement();

    // Initialize transaction date text on component mount
    useEffect(() => {
        const today = new Date();
        const formattedDate = formatDateForInput(today);
        setTransactionDateText(formattedDate);
    }, []);

    // Filter data berdasarkan search query
    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(supplierSearchQuery.toLowerCase())
    );

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
    );

    // Helper function untuk format tanggal untuk input (DD/MM/YYYY)
    const formatDateForInput = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Helper function untuk parse input tanggal
    const parseDateFromInput = (dateText: string): Date => {
        if (!dateText || dateText.trim() === '') {
            return new Date(); // Return current date if empty
        }

        // Remove any non-numeric characters except /
        const cleanText = dateText.replace(/[^0-9/]/g, '');
        const parts = cleanText.split('/');

        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[2], 10);

            // Basic validation
            if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
                const date = new Date(year, month, day);
                // Check if the date is valid (handles cases like 31/02/2023)
                if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
                    return date;
                }
            }
        }

        // Return current date if parsing fails
        return new Date();
    };

    // Helper function untuk format input tanggal dengan validasi
    const formatDateInputText = (text: string): string => {
        // Remove all non-numeric characters except /
        let cleanText = text.replace(/[^0-9/]/g, '');
        
        // Auto-add slashes as user types
        if (cleanText.length >= 2 && cleanText.charAt(2) !== '/') {
            cleanText = cleanText.substring(0, 2) + '/' + cleanText.substring(2);
        }
        if (cleanText.length >= 5 && cleanText.charAt(5) !== '/') {
            cleanText = cleanText.substring(0, 5) + '/' + cleanText.substring(5);
        }
        
        // Limit to DD/MM/YYYY format
        if (cleanText.length > 10) {
            cleanText = cleanText.substring(0, 10);
        }
        
        return cleanText;
    };

    // Helper function untuk validasi dan parsing decimal
    const parseDecimalInput = (text: string): number => {
        if (!text || text === '') return 0;
        
        // Remove all non-numeric characters except decimal point
        const cleanText = text.replace(/[^0-9.]/g, '');
        
        // Handle multiple decimal points
        const parts = cleanText.split('.');
        const formattedText = parts.length > 1 ? 
            parts[0] + '.' + parts.slice(1).join('') : 
            cleanText;
        
        const numValue = parseFloat(formattedText);
        return isNaN(numValue) ? 0 : numValue;
    };

    // Helper function untuk format input text
    const formatInputText = (text: string): string => {
        if (!text || text === '') return '';
        
        // Remove all non-numeric characters except decimal point
        let cleanText = text.replace(/[^0-9.]/g, '');
        
        // Handle case where user types decimal point first
        if (cleanText.startsWith('.')) {
            cleanText = '0' + cleanText;
        }
        
        // Ensure only one decimal point
        const parts = cleanText.split('.');
        if (parts.length > 2) {
            cleanText = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Limit decimal places to 2
        if (parts.length === 2 && parts[1].length > 2) {
            cleanText = parts[0] + '.' + parts[1].substring(0, 2);
        }
        
        return cleanText;
    };

    const selectSupplier = (supplier: Supplier) => {
        setSupplierName(supplier.name);
        setShowSupplierPicker(false);
        setSupplierSearchQuery('');
    };

    const selectProduct = (product: Product) => {
        setCurrentItem({
            ...currentItem,
            productName: product.name,
            price: product.lastPrice || 0,
            hargaBeli: product.lastHargaBeli || 0,
            hargaJual: product.lastHargaJual || 0,
        });
        
        // Update text states
        setPriceText(product.lastPrice ? product.lastPrice.toString() : '');
        setHargaBeliText(product.lastHargaBeli ? product.lastHargaBeli.toString() : '');
        setHargaJualText(product.lastHargaJual ? product.lastHargaJual.toString() : '');
        
        setShowProductPicker(false);
        setProductSearchQuery('');
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
            
            // Reset text states
            setPriceText('');
            setQuantityText('');
            setHargaBeliText('');
            setHargaJualText('');
            
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

            // Parse the transaction date, use current date if invalid
            const finalTransactionDate = parseDateFromInput(transactionDateText);

            await onCreatePurchase({
                supplierName: supplierName.trim(),
                userId: 'user123', // Ganti dengan user ID sebenarnya
                items,
                paidAmount,
                saleDate: finalTransactionDate.toISOString()
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

            // Reset text states
            setPriceText('');
            setQuantityText('');
            setHargaBeliText('');
            setHargaJualText('');
            setPaidAmountText('');
            
            // Reset transaction date to today
            const today = new Date();
            setTransactionDate(today);
            setTransactionDateText(formatDateForInput(today));

        } catch (error) {
            console.error('Error creating purchase:', error);
        }
    };

    const renderInput = (
        placeholder: string, 
        value: string, 
        onChangeText: (text: string) => void, 
        keyboardType: 'default' | 'numeric' | 'decimal-pad' = 'default', 
        inputKey: string,
        description?: string,
        required?: boolean
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
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                style={[styles.input, focusedInput === inputKey && styles.inputFocused]}
                onFocus={() => setFocusedInput(inputKey)}
                onBlur={() => setFocusedInput(null)}
            />
        </View>
    );

    // Modal untuk memilih supplier
    const renderSupplierPickerModal = () => (
        <Modal
            visible={showSupplierPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowSupplierPicker(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Pilih Supplier</Text>
                        <TouchableOpacity onPress={() => setShowSupplierPicker(false)}>
                            <MaterialIcons name="close" size={24} color="#636e72" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.searchContainer}>
                        <MaterialIcons name="search" size={20} color="#636e72" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Cari supplier..."
                            value={supplierSearchQuery}
                            onChangeText={setSupplierSearchQuery}
                            style={styles.searchInput}
                            autoFocus={true}
                        />
                    </View>

                    <FlatList
                        data={filteredSuppliers}
                        keyExtractor={(item) => item.id}
                        style={styles.modalList}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => selectSupplier(item)}
                            >
                                <View style={styles.modalItemContent}>
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                    {item.lastPurchaseDate && (
                                        <Text style={styles.modalItemSubtext}>
                                            Terakhir: {new Date(item.lastPurchaseDate).toLocaleDateString('id-ID')}
                                        </Text>
                                    )}
                                </View>
                                <MaterialIcons name="chevron-right" size={20} color="#636e72" />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <MaterialIcons name="business" size={48} color="#ddd" />
                                <Text style={styles.emptyText}>
                                    {supplierSearchQuery ? 'Supplier tidak ditemukan' : 'Belum ada supplier'}
                                </Text>
                                {supplierSearchQuery && (
                                    <Text style={styles.emptySubtext}>
                                        Coba kata kunci lain atau tambah supplier baru
                                    </Text>
                                )}
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    // Modal untuk memilih produk
    const renderProductPickerModal = () => (
        <Modal
            visible={showProductPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowProductPicker(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Pilih Produk</Text>
                        <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                            <MaterialIcons name="close" size={24} color="#636e72" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.searchContainer}>
                        <MaterialIcons name="search" size={20} color="#636e72" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Cari produk..."
                            value={productSearchQuery}
                            onChangeText={setProductSearchQuery}
                            style={styles.searchInput}
                            autoFocus={true}
                        />
                    </View>

                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.id}
                        style={styles.modalList}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => selectProduct(item)}
                            >
                                <View style={styles.modalItemContent}>
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                    {item.lastPrice && (
                                        <Text style={styles.modalItemSubtext}>
                                            Harga terakhir: {formatCurrency(item.lastPrice)}
                                        </Text>
                                    )}
                                </View>
                                <MaterialIcons name="chevron-right" size={20} color="#636e72" />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <MaterialIcons name="inventory" size={48} color="#ddd" />
                                <Text style={styles.emptyText}>
                                    {productSearchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                                </Text>
                                {productSearchQuery && (
                                    <Text style={styles.emptySubtext}>
                                        Coba kata kunci lain atau tambah produk baru
                                    </Text>
                                )}
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
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
                        Pilih supplier dari daftar atau masukkan nama supplier baru
                    </Text>
                    
                    <View style={styles.inputGroup}>
                        <View style={styles.inputLabelContainer}>
                            <Text style={styles.inputLabel}>
                                Nama Supplier
                                <Text style={styles.requiredMark}> *</Text>
                            </Text>
                            <Text style={styles.inputDescription}>Ketik nama atau pilih dari daftar</Text>
                        </View>
                        <View style={styles.inputWithButton}>
                            <TextInput
                                placeholder="Nama Supplier"
                                value={supplierName}
                                onChangeText={setSupplierName}
                                style={[styles.inputFlex, focusedInput === 'supplier' && styles.inputFocused]}
                                onFocus={() => setFocusedInput('supplier')}
                                onBlur={() => setFocusedInput(null)}
                            />
                            <TouchableOpacity 
                                style={styles.pickerButton}
                                onPress={() => setShowSupplierPicker(true)}
                            >
                                <MaterialIcons name="arrow-drop-down" size={24} color="#6c5ce7" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Transaction Date Input */}
                    <View style={styles.inputGroup}>
                        <View style={styles.inputLabelContainer}>
                            <Text style={styles.inputLabel}>Tanggal Transaksi</Text>
                            <Text style={styles.inputDescription}>
                                Format: DD/MM/YYYY (kosongkan untuk hari ini)
                            </Text>
                        </View>
                        <View style={styles.dateInputContainer}>
                            <MaterialIcons name="event" size={20} color="#6c5ce7" style={styles.dateIcon} />
                            <TextInput
                                placeholder="DD/MM/YYYY"
                                value={transactionDateText}
                                onChangeText={(text) => {
                                    const formattedText = formatDateInputText(text);
                                    setTransactionDateText(formattedText);
                                    setTransactionDate(parseDateFromInput(formattedText));
                                }}
                                keyboardType="numeric"
                                style={[styles.dateInput, focusedInput === 'transactionDate' && styles.inputFocused]}
                                onFocus={() => setFocusedInput('transactionDate')}
                                onBlur={() => setFocusedInput(null)}
                                maxLength={10}
                            />
                        </View>
                        <Text style={styles.datePreview}>
                            Tanggal: {transactionDate.toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>
                </View>

                {/* Add Items Section */}
                <View style={styles.formSection}>
                    <Text style={styles.formSectionTitle}>
                        <MaterialIcons name="inventory" size={18} color="#6c5ce7" /> Tambah Barang
                    </Text>
                    <Text style={styles.formSectionDescription}>
                        Tambahkan produk dan detailnya ke pembelian ini
                    </Text>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputLabelContainer}>
                            <Text style={styles.inputLabel}>
                                Nama Produk
                                <Text style={styles.requiredMark}> *</Text>
                            </Text>
                            <Text style={styles.inputDescription}>Ketik nama atau pilih dari daftar produk</Text>
                        </View>
                        <View style={styles.inputWithButton}>
                            <TextInput
                                placeholder="Nama Produk"
                                value={currentItem.productName}
                                onChangeText={(text) => setCurrentItem({ ...currentItem, productName: text })}
                                style={[styles.inputFlex, focusedInput === 'productName' && styles.inputFocused]}
                                onFocus={() => setFocusedInput('productName')}
                                onBlur={() => setFocusedInput(null)}
                            />
                            <TouchableOpacity 
                                style={styles.pickerButton}
                                onPress={() => setShowProductPicker(true)}
                            >
                                <MaterialIcons name="arrow-drop-down" size={24} color="#6c5ce7" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.rowInputs}>
                        <View style={styles.halfInput}>
                            {renderInput(
                                'Harga', 
                                priceText, 
                                (text) => {
                                    const formattedText = formatInputText(text);
                                    setPriceText(formattedText);
                                    setCurrentItem({ ...currentItem, price: parseDecimalInput(formattedText) });
                                }, 
                                'decimal-pad', 
                                'price',
                                'Harga per satuan',
                                true
                            )}
                        </View>
                        <View style={styles.halfInput}>
                            <View style={styles.inputGroup}>
                                <View style={styles.inputLabelContainer}>
                                    <Text style={styles.inputLabel}>
                                        Jumlah
                                        <Text style={styles.requiredMark}> *</Text>
                                    </Text>
                                    <Text style={styles.inputDescription}>Jumlah barang</Text>
                                </View>
                                <TextInput
                                    placeholder="Jumlah"
                                    value={quantityText}
                                    onChangeText={(text) => {
                                        const formattedText = formatInputText(text);
                                        setQuantityText(formattedText);
                                        setCurrentItem({ ...currentItem, quantity: parseDecimalInput(formattedText) });
                                    }}
                                    keyboardType="decimal-pad"
                                    style={[styles.input, focusedInput === 'quantity' && styles.inputFocused]}
                                    onFocus={() => setFocusedInput('quantity')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.rowInputs}>
                        <View style={styles.halfInput}>
                            {renderInput(
                                'Harga Beli', 
                                hargaBeliText, 
                                (text) => {
                                    const formattedText = formatInputText(text);
                                    setHargaBeliText(formattedText);
                                    setCurrentItem({ ...currentItem, hargaBeli: parseDecimalInput(formattedText) });
                                }, 
                                'decimal-pad', 
                                'hargaBeli',
                                'Harga beli dari supplier'
                            )}
                        </View>
                        <View style={styles.halfInput}>
                            {renderInput(
                                'Harga Jual', 
                                hargaJualText, 
                                (text) => {
                                    const formattedText = formatInputText(text);
                                    setHargaJualText(formattedText);
                                    setCurrentItem({ ...currentItem, hargaJual: parseDecimalInput(formattedText) });
                                }, 
                                'decimal-pad', 
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
                        paidAmountText, 
                        (text) => {
                            const formattedText = formatInputText(text);
                            setPaidAmountText(formattedText);
                            setPaidAmount(parseDecimalInput(formattedText));
                        }, 
                        'decimal-pad', 
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

            {/* Modals */}
            {renderSupplierPickerModal()}
            {renderProductPickerModal()}
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
    inputWithButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputFlex: {
        backgroundColor: '#f8f9ff',
        borderWidth: 1,
        borderColor: '#e6e7ff',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        borderRightWidth: 0,
        padding: 15,
        fontSize: 16,
        color: '#2d3436',
        flex: 1,
        height: 50,
    },
    pickerButton: {
        backgroundColor: '#f8f9ff',
        borderWidth: 1,
        borderColor: '#e6e7ff',
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9ff',
        borderWidth: 1,
        borderColor: '#e6e7ff',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
    },
    dateIcon: {
        marginRight: 10,
    },
    dateInput: {
        flex: 1,
        fontSize: 16,
        color: '#2d3436',
    },
    datePreview: {
        fontSize: 14,
        color: '#636e72',
        marginTop: 5,
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    halfInput: {
        flex: 1,
        marginRight: 10,
        position: 'relative',
    },
    halfInputLast: {
        flex: 1,
        position: 'relative',
    },
    addItemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6c5ce7',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    addItemButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 10,
    },
    itemsList: {
        backgroundColor: '#f8f9ff',
        borderRadius: 12,
        padding: 15,
        marginTop: 10,
    },
    itemCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
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
    },
    removeButton: {
        padding: 5,
        borderRadius: 50,
        backgroundColor: '#ffe6e6',
    },
    itemDetails: {
        marginLeft: 10,
    },
    itemDetailText: {
        fontSize: 14,
        color: '#636e72',
        marginBottom: 4,
    },
    totalContainer: {
        marginTop: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#e6e7ff',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
        marginTop: 4,
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
    paymentLabel: {
        fontSize: 14,
        color: '#636e72',
    },
    paymentValue: {
        fontSize: 16,
        color: '#2d3436',
    },
    paymentRowHighlight: {
        borderTopWidth: 1,
        borderTopColor: '#e6e7ff',
        paddingTop: 8,
    },
    paymentLabelBold: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    paymentValueBold: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    createButton: {
        backgroundColor: '#6c5ce7',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    createButtonDisabled: {
        backgroundColor: '#dfe6e9',
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonIcon: {
        marginRight: 10,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9ff',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#2d3436',
    },
    modalList: {
        maxHeight: '60%',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e6e7ff',
    },
    modalItemContent: {
        flex: 1,
        marginRight: 10,
    },
    modalItemText: {
        fontSize: 16,
        color: '#2d3436',
    },
    modalItemSubtext: {
        fontSize: 14,
        color: '#636e72',
        marginTop: 4,
    },
    modalItemTextBold: {
        fontWeight: 'bold',
        color: '#2d3436',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#636e72',
        marginTop: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#b2bec3',
        textAlign: 'center',
        marginTop: 5,
    },
})

export default CreatePurchase;
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useProductManagement } from '../../../hooks/product/ProductManagement';

const { width, height } = Dimensions.get('window');

interface FormData {
    name: string;
    hargaBeli: string;
    hargaJual: string;
    satuan: string;
    stock: string;
}

const CreateProduct: React.FC = () => {
    const { createProduct } = useProductManagement();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        hargaBeli: '',
        hargaJual: '',
        satuan: 'pcs', // Default satuan
        stock: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string>('');
    const [showSatuanModal, setShowSatuanModal] = useState(false);

    const satuanOptions = [
        { value: 'pcs', label: 'Pcs (Pieces)' },
        { value: 'Kg', label: 'Kg (Kilogram)' },
        { value: 'Unit', label: 'Unit' }
    ];

    // Fungsi validasi
    const validateName = (name: string): string => {
        if (!name.trim()) return 'Nama produk wajib diisi';
        if (name.trim().length < 2) return 'Nama produk minimal 2 karakter';
        return '';
    };

    const validatePrice = (price: string, fieldName: string): string => {
        if (!price.trim()) return `${fieldName} wajib diisi`;
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return `${fieldName} harus berupa angka yang valid`;
        if (numPrice <= 0) return `${fieldName} harus lebih dari 0`;
        if (numPrice > 999999999) return `${fieldName} terlalu besar`;
        return '';
    };

    const validateStock = (stock: string): string => {
        if (!stock.trim()) return 'Stok wajib diisi';
        const numStock = parseInt(stock);
        if (isNaN(numStock)) return 'Stok harus berupa angka yang valid';
        if (numStock < 0) return 'Stok tidak boleh negatif';
        if (numStock > 999999) return 'Stok terlalu besar';
        if (!Number.isInteger(parseFloat(stock))) return 'Stok harus berupa angka bulat';
        return '';
    };

    const validateSatuan = (satuan: string): string => {
        if (!satuan) return 'Satuan wajib dipilih';
        return '';
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        newErrors.name = validateName(formData.name);
        newErrors.hargaBeli = validatePrice(formData.hargaBeli, 'Harga beli');
        newErrors.hargaJual = validatePrice(formData.hargaJual, 'Harga jual');
        newErrors.satuan = validateSatuan(formData.satuan);
        newErrors.stock = validateStock(formData.stock);

        // Validasi tambahan: harga jual harus lebih besar dari harga beli
        if (!newErrors.hargaBeli && !newErrors.hargaJual) {
            const purchasePrice = parseFloat(formData.hargaBeli);
            const sellingPrice = parseFloat(formData.hargaJual);
            if (sellingPrice <= purchasePrice) {
                newErrors.hargaJual = 'Harga jual harus lebih besar dari harga beli';
            }
        }

        // Hapus error yang kosong
        Object.keys(newErrors).forEach(key => {
            if (!newErrors[key]) delete newErrors[key];
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateProduct = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Konversi input string ke angka
            const productData = {
                name: formData.name.trim(),
                hargaBeli: parseFloat(formData.hargaBeli),
                hargaJual: parseFloat(formData.hargaJual),
                satuan: formData.satuan,
                stock: parseInt(formData.stock)
            };

            await createProduct(productData);

            Alert.alert(
                '✅ Berhasil!',
                'Produk berhasil ditambahkan',
                [{
                    text: 'Tambah Lagi',
                    onPress: () => {
                        setFormData({ name: '', hargaBeli: '', hargaJual: '', satuan: 'pcs', stock: '' });
                        setErrors({});
                    }
                }, {
                    text: 'Kembali ke Daftar',
                    onPress: () => router.back(),
                    style: 'default'
                }]
            );
        } catch (error) {
            Alert.alert('❌ Gagal', 'Gagal menambah produk. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateFormData = (field: keyof FormData, value: string) => {
        // Untuk field numerik, hanya izinkan input angka yang valid
        if (['hargaBeli', 'hargaJual', 'stock'].includes(field)) {
            if (field === 'stock') {
                if (value !== '' && !/^\d*$/.test(value)) return;
            } else {
                if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
                if (value.split('.').length > 2) return;
            }
        }

        setFormData(prev => ({ ...prev, [field]: value }));

        // Hapus error saat user mulai mengetik
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const formatCurrency = (amount: string): string => {
        if (!amount) return '';
        const num = parseFloat(amount);
        if (isNaN(num)) return amount;
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const calculateProfit = (): { profit: number; margin: string } => {
        const purchase = parseFloat(formData.hargaBeli) || 0;
        const selling = parseFloat(formData.hargaJual) || 0;
        const profit = selling - purchase;
        const margin = purchase > 0 ? ((profit / purchase) * 100).toFixed(1) : '0';
        return { profit, margin };
    };

    const { profit, margin } = calculateProfit();

    const handleSatuanSelect = (value: string) => {
        updateFormData('satuan', value);
        setShowSatuanModal(false);
    };

    const renderSatuanSelect = () => (
        <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>Satuan</Text>
                <Text style={styles.required}>*</Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.selectWrapper,
                    errors.satuan && styles.inputWrapperError
                ]}
                onPress={() => setShowSatuanModal(true)}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    <MaterialIcons
                        name="straighten"
                        size={20}
                        color={errors.satuan ? '#EF4444' : '#6B7280'}
                    />
                </View>

                <Text style={[
                    styles.selectText,
                    !formData.satuan && styles.selectPlaceholder
                ]}>
                    {formData.satuan 
                        ? satuanOptions.find(opt => opt.value === formData.satuan)?.label 
                        : 'Pilih satuan produk'
                    }
                </Text>

                <MaterialIcons
                    name="keyboard-arrow-down"
                    size={24}
                    color={errors.satuan ? '#EF4444' : '#6B7280'}
                />
            </TouchableOpacity>

            {errors.satuan && (
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.satuan}</Text>
                </View>
            )}
        </View>
    );

    const renderSatuanModal = () => (
        <Modal
            visible={showSatuanModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSatuanModal(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowSatuanModal(false)}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Pilih Satuan</Text>
                        <TouchableOpacity
                            onPress={() => setShowSatuanModal(false)}
                            style={styles.modalCloseButton}
                        >
                            <MaterialIcons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalOptionsContainer}>
                        {satuanOptions.map((option, index) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.modalOption,
                                    formData.satuan === option.value && styles.modalOptionSelected,
                                    index === satuanOptions.length - 1 && styles.modalOptionLast
                                ]}
                                onPress={() => handleSatuanSelect(option.value)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.modalOptionContent}>
                                    <View>
                                        <Text style={[
                                            styles.modalOptionText,
                                            formData.satuan === option.value && styles.modalOptionTextSelected
                                        ]}>
                                            {option.label}
                                        </Text>
                                        <Text style={styles.modalOptionSubtext}>
                                            {option.value}
                                        </Text>
                                    </View>
                                    
                                    {formData.satuan === option.value && (
                                        <MaterialIcons
                                            name="check-circle"
                                            size={24}
                                            color="#4F46E5"
                                        />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderInput = (
        field: keyof FormData,
        label: string,
        placeholder: string,
        icon: string,
        keyboardType: 'default' | 'numeric' = 'default',
        prefix?: string
    ) => (
        <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                {label.includes('*') && <Text style={styles.required}>*</Text>}
            </View>

            <View style={[
                styles.inputWrapper,
                focusedField === field && styles.inputWrapperFocused,
                errors[field] && styles.inputWrapperError
            ]}>
                <View style={styles.iconContainer}>
                    <MaterialIcons
                        name={icon as any}
                        size={20}
                        color={focusedField === field ? '#4F46E5' : errors[field] ? '#EF4444' : '#6B7280'}
                    />
                </View>

                {prefix && (
                    <View style={styles.prefixContainer}>
                        <Text style={styles.inputPrefix}>{prefix}</Text>
                    </View>
                )}

                <TextInput
                    style={[
                        styles.input,
                        prefix && styles.inputWithPrefix
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={formData[field]}
                    onChangeText={(value) => updateFormData(field, value)}
                    onBlur={() => setFocusedField('')}
                    keyboardType={keyboardType}
                    autoCapitalize={field === 'name' ? 'words' : 'none'}
                    selectTextOnFocus={false}
                />
            </View>

            {/* Tampilkan format rupiah di bawah input saat tidak fokus */}
            {['hargaBeli', 'hargaJual'].includes(field) && formData[field] && focusedField !== field && (
                <View style={styles.formattedValueContainer}>
                    <Text style={styles.formattedValueLabel}>Format: </Text>
                    <Text style={styles.formattedValue}>
                        Rp {formatCurrency(formData[field])}
                    </Text>
                </View>
            )}

            {errors[field] && (
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{errors[field]}</Text>
                </View>
            )}
        </View>
    );

    return (
        <>
            <Stack.Screen
                options={{
                    header: () => (
                        <View style={[styles.appBar, { height: height * 0.12, paddingTop: height * 0.04 }]}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <MaterialIcons name="arrow-back" size={width * 0.06} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.appBarText}>Manajemen Produk</Text>
                            <View style={styles.backButton} />
                        </View>
                    ),
                }}
            />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        {/* Header Section */}
                        <View style={styles.headerSection}>
                            <View style={styles.iconWrapper}>
                                <MaterialIcons name="add-shopping-cart" size={32} color="#4F46E5" />
                            </View>
                            <Text style={styles.title}>Tambah Produk Baru</Text>
                            <Text style={styles.subtitle}>
                                Isi detail produk untuk menambahkannya ke inventaris Anda
                            </Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formCard}>
                            {renderInput('name', 'Nama Produk*', 'Masukkan nama produk', 'inventory-2')}

                            {renderInput('hargaBeli', 'Harga Beli*', 'Masukkan harga beli', 'shopping-cart', 'numeric', 'Rp')}

                            {renderInput('hargaJual', 'Harga Jual*', 'Masukkan harga jual', 'sell', 'numeric', 'Rp')}

                            {renderSatuanSelect()}

                            {renderInput('stock', 'Jumlah Stok*', 'Masukkan stok awal', 'storage', 'numeric')}

                            {/* Profit Analysis Card */}
                            {formData.hargaBeli && formData.hargaJual && (
                                <View style={styles.profitCard}>
                                    <View style={styles.profitHeader}>
                                        <MaterialIcons name="trending-up" size={20} color="#059669" />
                                        <Text style={styles.profitTitle}>Analisis Keuntungan</Text>
                                    </View>

                                    <View style={styles.profitContent}>
                                        <View style={styles.profitItem}>
                                            <Text style={styles.profitLabel}>Keuntungan per unit</Text>
                                            <Text style={[
                                                styles.profitValue,
                                                { color: profit > 0 ? '#059669' : '#DC2626' }
                                            ]}>
                                                Rp {formatCurrency(profit.toString())}
                                            </Text>
                                        </View>

                                        <View style={styles.profitDivider} />

                                        <View style={styles.profitItem}>
                                            <Text style={styles.profitLabel}>Margin keuntungan</Text>
                                            <Text style={[
                                                styles.profitValue,
                                                { color: profit > 0 ? '#059669' : '#DC2626' }
                                            ]}>
                                                {margin}%
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Tombol Submit */}
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isLoading && styles.submitButtonDisabled
                                ]}
                                onPress={handleCreateProduct}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <>
                                        <MaterialIcons name="add" size={20} color="#FFFFFF" />
                                        <Text style={styles.submitButtonText}>Tambah Produk</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {renderSatuanModal()}
        </>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },

    // Header Styles
    appBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#6c5ce7',
        paddingHorizontal: width * 0.04,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        width: width * 0.1,
        height: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: width * 0.05,
    },
    appBarText: {
        color: '#fff',
        fontSize: width * 0.05,
        fontWeight: 'bold'
    },
    appBarTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    headerSpacer: {
        width: 40,
    },

    // Header Section
    headerSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },

    // Form Styles
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        elevation: 6,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    inputContainer: {
        marginBottom: 24,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    required: {
        fontSize: 15,
        color: '#EF4444',
        marginLeft: 4,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        backgroundColor: '#FAFBFC',
        minHeight: 52,
        paddingHorizontal: 16,
    },
    inputWrapperFocused: {
        borderColor: '#4F46E5',
        backgroundColor: '#FFFFFF',
        elevation: 4,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    inputWrapperError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    iconContainer: {
        marginRight: 12,
    },
    prefixContainer: {
        marginRight: 8,
    },
    inputPrefix: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        paddingVertical: 0,
        fontWeight: '500',
    },
    inputWithPrefix: {
        marginLeft: 0,
    },
    formattedValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        paddingLeft: 4,
    },
    formattedValueLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    formattedValue: {
        fontSize: 12,
        color: '#4F46E5',
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        paddingLeft: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginLeft: 6,
        fontWeight: '500',
        flex: 1,
    },

    // Select Styles
    selectWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        backgroundColor: '#FAFBFC',
        minHeight: 52,
        paddingHorizontal: 16,
    },
    selectText: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    selectPlaceholder: {
        color: '#9CA3AF',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 0,
        width: '100%',
        maxWidth: 400,
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalOptionsContainer: {
        paddingVertical: 8,
    },
    modalOption: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalOptionLast: {
        borderBottomWidth: 0,
    },
    modalOptionSelected: {
        backgroundColor: '#EEF2FF',
    },
    modalOptionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    modalOptionTextSelected: {
        color: '#4F46E5',
    },
    modalOptionSubtext: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },

    // Profit Analysis Styles
    profitCard: {
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    profitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    profitTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginLeft: 8,
    },
    profitContent: {
        gap: 12,
    },
    profitItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profitLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    profitValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    profitDivider: {
        height: 1,
        backgroundColor: '#D1D5DB',
        opacity: 0.3,
    },

    // Button Styles
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4F46E5',
        paddingVertical: 16,
        borderRadius: 12,
        elevation: 6,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        minHeight: 56,
    },
    submitButtonDisabled: {
        backgroundColor: '#9CA3AF',
        elevation: 0,
        shadowOpacity: 0,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
        letterSpacing: 0.5,
    },
});

export default CreateProduct;
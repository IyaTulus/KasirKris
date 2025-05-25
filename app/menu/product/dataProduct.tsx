import { MaterialIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { 
    Dimensions, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View, 
    FlatList, 
    TextInput, 
    Alert,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager
} from "react-native";
import { useProductManagement } from "../../../hooks/product/ProductManagement";
import { useState, useEffect } from "react";
import { navigate } from "expo-router/build/global-state/routing";

const { width, height } = Dimensions.get('window');

// Aktifkan LayoutAnimation di Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Product = {
    product_id: string;
    name: string;
    hargaBeli: number;
    hargaJual: number;
    stock: number;
};

const DataProductScreen = () => {
        const { products, deleteProduct } = useProductManagement();
        const [searchTerm, setSearchTerm] = useState("");
        const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
        const [filteredProducts, setFilteredProducts] = useState<Product[]>(products || []);

        // Filter produk berdasarkan kata kunci pencarian
        useEffect(() => {
                if (!products) return;
                
                if (searchTerm.trim() === "") {
                        setFilteredProducts(products);
                } else {
                        const filtered = products.filter(product =>
                                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.product_id.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        setFilteredProducts(filtered);
                }
        }, [searchTerm, products]);

        const handleDeleteProduct = (productId: string, productName: string) => {
                Alert.alert(
                        "Hapus Produk",
                        `Apakah Anda yakin ingin menghapus "${productName}"?`,
                        [
                                {
                                        text: "Batal",
                                        style: "cancel"
                                },
                                {
                                        text: "Hapus",
                                        style: "destructive",
                                        onPress: () => {
                                                deleteProduct(productId);
                                                // Tutup tampilan detail jika produk yang dihapus sedang terbuka
                                                if (expandedProduct === productId) {
                                                        setExpandedProduct(null);
                                                }
                                        }
                                }
                        ]
                );
        };

        const toggleProductExpansion = (productId: string) => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setExpandedProduct(expandedProduct === productId ? null : productId);
        };

        const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                }).format(amount);
        };

        const calculateProfit = (hargaBeli: number, hargaJual: number) => {
                return hargaJual - hargaBeli;
        };

        const calculateProfitMargin = (hargaBeli: number, hargaJual: number) => {
                return ((hargaJual - hargaBeli) / hargaBeli * 100).toFixed(1);
        };

        const getStockStatus = (stock: number) => {
                if (stock === 0) return { text: 'Stok Habis', color: '#e74c3c' };
                if (stock < 10) return { text: 'Stok Rendah', color: '#f39c12' };
                return { text: 'Stok Aman', color: '#27ae60' };
        };

        const renderProductCard = ({ item }: { item: Product }) => {
                const isExpanded = expandedProduct === item.product_id;
                const stockStatus = getStockStatus(item.stock);
                const profit = calculateProfit(item.hargaBeli, item.hargaJual);
                const profitMargin = calculateProfitMargin(item.hargaBeli, item.hargaJual);

                return (
                        <View style={styles.productCard}>
                                <TouchableOpacity
                                        style={styles.productHeader}
                                        onPress={() => toggleProductExpansion(item.product_id)}
                                        activeOpacity={0.7}
                                >
                                        <View style={styles.productMainInfo}>
                                                <View style={styles.productTitleRow}>
                                                        <Text style={styles.productName}>{item.name}</Text>
                                                        <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                                                                <Text style={styles.stockBadgeText}>{item.stock}</Text>
                                                        </View>
                                                </View>
                                                <Text style={styles.productId}>ID: {item.product_id}</Text>
                                                <View style={styles.priceRow}>
                                                        <Text style={styles.sellPrice}>{formatCurrency(item.hargaJual)}</Text>
                                                        <Text style={[styles.stockStatus, { color: stockStatus.color }]}>
                                                                {stockStatus.text}
                                                        </Text>
                                                </View>
                                        </View>
                                        <MaterialIcons 
                                                name={isExpanded ? "expand-less" : "expand-more"} 
                                                size={24} 
                                                color="#666" 
                                        />
                                </TouchableOpacity>

                                {isExpanded && (
                                        <View style={styles.expandedContent}>
                                                <View style={styles.detailsGrid}>
                                                        <View style={styles.detailItem}>
                                                                <Text style={styles.detailLabel}>Harga Beli</Text>
                                                                <Text style={styles.detailValue}>{formatCurrency(item.hargaBeli)}</Text>
                                                        </View>
                                                        <View style={styles.detailItem}>
                                                                <Text style={styles.detailLabel}>Harga Jual</Text>
                                                                <Text style={styles.detailValue}>{formatCurrency(item.hargaJual)}</Text>
                                                        </View>
                                                        <View style={styles.detailItem}>
                                                                <Text style={styles.detailLabel}>Laba per Unit</Text>
                                                                <Text style={[styles.detailValue, { color: profit > 0 ? '#27ae60' : '#e74c3c' }]}>
                                                                        {formatCurrency(profit)}
                                                                </Text>
                                                        </View>
                                                        <View style={styles.detailItem}>
                                                                <Text style={styles.detailLabel}>Margin Laba</Text>
                                                                <Text style={[styles.detailValue, { color: profit > 0 ? '#27ae60' : '#e74c3c' }]}>
                                                                        {profitMargin}%
                                                                </Text>
                                                        </View>
                                                        <View style={styles.detailItem}>
                                                                <Text style={styles.detailLabel}>Jumlah Stok</Text>
                                                                <Text style={styles.detailValue}>{item.stock} unit</Text>
                                                        </View>
                                                        <View style={styles.detailItem}>
                                                                <Text style={styles.detailLabel}>Total Nilai</Text>
                                                                <Text style={styles.detailValue}>
                                                                        {formatCurrency(item.hargaBeli * item.stock)}
                                                                </Text>
                                                        </View>
                                                </View>

                                                <View style={styles.actionButtons}>
                                                        <TouchableOpacity
                                                                style={[styles.actionButton, styles.editButton]}
                                                                onPress={() => navigate(`/menu/product/editProduct?product_id=${item.product_id}`)}
                                                        >
                                                                <MaterialIcons name="edit" size={18} color="#fff" />
                                                                <Text style={styles.actionButtonText}>Edit</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                                style={[styles.actionButton, styles.deleteButton]}
                                                                onPress={() => handleDeleteProduct(item.product_id, item.name)}
                                                        >
                                                                <MaterialIcons name="delete" size={18} color="#fff" />
                                                                <Text style={styles.actionButtonText}>Hapus</Text>
                                                        </TouchableOpacity>
                                                </View>
                                        </View>
                                )}
                        </View>
                );
        };

        const EmptyState = () => (
                <View style={styles.emptyState}>
                        <MaterialIcons name="inventory" size={80} color="#ccc" />
                        <Text style={styles.emptyStateTitle}>Produk Tidak Ditemukan</Text>
                        <Text style={styles.emptyStateText}>
                                {searchTerm ? "Coba ubah kata kunci pencarian Anda" : "Mulai dengan membuat produk pertama Anda"}
                        </Text>
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
                        <View style={styles.container}>
                                {/* Kolom Pencarian */}
                                <View style={styles.searchContainer}>
                                        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
                                        <TextInput
                                                style={styles.searchInput}
                                                placeholder="Cari produk berdasarkan nama atau ID..."
                                                value={searchTerm}
                                                onChangeText={setSearchTerm}
                                                placeholderTextColor="#999"
                                        />
                                        {searchTerm !== "" && (
                                                <TouchableOpacity onPress={() => setSearchTerm("")}>
                                                        <MaterialIcons name="clear" size={20} color="#666" />
                                                </TouchableOpacity>
                                        )}
                                </View>

                                {/* Statistik Ringkas */}
                                <View style={styles.statsContainer}>
                                        <View style={styles.statItem}>
                                                <Text style={styles.statNumber}>{filteredProducts.length}</Text>
                                                <Text style={styles.statLabel}>Produk</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                                <Text style={styles.statNumber}>
                                                        {filteredProducts.reduce((sum, product) => sum + product.stock, 0)}
                                                </Text>
                                                <Text style={styles.statLabel}>Total Stok</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                                <Text style={styles.statNumber}>
                                                        {filteredProducts.filter(p => p.stock < 10).length}
                                                </Text>
                                                <Text style={styles.statLabel}>Stok Rendah</Text>
                                        </View>
                                </View>

                                {/* Tombol Buat Produk */}
                                <TouchableOpacity
                                        style={styles.createButton}
                                        onPress={() => router.push('/menu/product/createProduct')}
                                >
                                        <MaterialIcons name="add" size={20} color="#fff" />
                                        <Text style={styles.createButtonText}>Buat Produk Baru</Text>
                                </TouchableOpacity>

                                {/* Daftar Produk */}
                                <FlatList
                                        data={filteredProducts}
                                        renderItem={renderProductCard}
                                        keyExtractor={(item) => item.product_id}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.listContainer}
                                        ListEmptyComponent={EmptyState}
                                />
                        </View>
                </>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: 16,
        },
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
        searchContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 16,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
        },
        searchIcon: {
                marginRight: 8,
        },
        searchInput: {
                flex: 1,
                fontSize: 16,
                color: '#333',
        },
        statsContainer: {
                flexDirection: 'row',
                justifyContent: 'space-around',
                backgroundColor: '#fff',
                borderRadius: 12,
                paddingVertical: 16,
                marginBottom: 16,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
        },
        statItem: {
                alignItems: 'center',
        },
        statNumber: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#6c5ce7',
        },
        statLabel: {
                fontSize: 12,
                color: '#666',
                marginTop: 4,
        },
        createButton: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#6c5ce7',
                paddingVertical: 14,
                borderRadius: 12,
                marginBottom: 16,
                elevation: 3,
                shadowColor: '#6c5ce7',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
        },
        createButtonText: {
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 16,
                marginLeft: 8,
        },
        listContainer: {
                paddingBottom: 20,
        },
        productCard: {
                backgroundColor: '#fff',
                borderRadius: 12,
                marginBottom: 12,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                overflow: 'hidden',
        },
        productHeader: {
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
        },
        productMainInfo: {
                flex: 1,
        },
        productTitleRow: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4,
        },
        productName: {
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333',
                flex: 1,
                marginRight: 8,
        },
        stockBadge: {
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                minWidth: 30,
                alignItems: 'center',
        },
        stockBadgeText: {
                color: '#fff',
                fontSize: 12,
                fontWeight: 'bold',
        },
        productId: {
                fontSize: 12,
                color: '#666',
                marginBottom: 8,
        },
        priceRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
        },
        sellPrice: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#27ae60',
        },
        stockStatus: {
                fontSize: 12,
                fontWeight: '600',
        },
        expandedContent: {
                borderTopWidth: 1,
                borderTopColor: '#f0f0f0',
                padding: 16,
        },
        detailsGrid: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginBottom: 16,
        },
        detailItem: {
                width: '50%',
                marginBottom: 12,
                paddingRight: 8,
        },
        detailLabel: {
                fontSize: 12,
                color: '#666',
                marginBottom: 4,
        },
        detailValue: {
                fontSize: 14,
                fontWeight: '600',
                color: '#333',
        },
        actionButtons: {
                flexDirection: 'row',
                justifyContent: 'space-around',
        },
        actionButton: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                flex: 0.45,
                justifyContent: 'center',
        },
        editButton: {
                backgroundColor: '#3498db',
        },
        deleteButton: {
                backgroundColor: '#e74c3c',
        },
        actionButtonText: {
                color: '#fff',
                fontWeight: '600',
                marginLeft: 6,
        },
        emptyState: {
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 60,
        },
        emptyStateTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: '#666',
                marginTop: 16,
                marginBottom: 8,
        },
        emptyStateText: {
                fontSize: 14,
                color: '#999',
                textAlign: 'center',
                paddingHorizontal: 32,
        },
});

export default DataProductScreen;
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { navigate } from 'expo-router/build/global-state/routing';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface User {
    name: string;
    username: string;
    role: string;
    user_id: string;
}

interface ActionItem {
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    colors: [string, string]; // More specific type definition
    onPress: () => void;
}

const SettingScreen: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const stored = await AsyncStorage.getItem('user');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setUser(parsed);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUser();
    }, []);

    const handleLogout = async () => {
        Alert.alert('Konfirmasi', 'Yakin ingin keluar?', [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Keluar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await AsyncStorage.removeItem('user');
                        router.replace('/auth/login');
                    } catch (error) {
                        console.error('Error during logout:', error);
                    }
                },
            },
        ]);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleColor = (role?: string) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return '#FF6B6B';
            case 'manager':
                return '#4ECDC4';
            case 'kasir':
                return '#45B7D1';
            default:
                return '#95A5A6';
        }
    };

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    // Admin quick actions with explicit color arrays
    const adminActions: ActionItem[] = [
        {
            title: 'Catatan Hutang Customer',
            icon: 'person-outline',
            colors: ['#4facfe', '#00f2fe'],
            onPress: () => {
                // Navigate to customer debt screen
                console.log('Navigate to customer debt screen');
            }
        },
        {
            title: 'Catatan Hutang Toko',
            icon: 'store',
            colors: ['#43e97b', '#38f9d7'],
            onPress: () => {
                // Navigate to store debt screen
                console.log('Navigate to store debt screen');
            }
        },
        {
            title: 'Pembelian',
            icon: 'shopping-cart',
            colors: ['#fa709a', '#fee140'],
            onPress: () => {
                // Navigate to purchase screen
                console.log('Navigate to purchase screen');
            }
        }
    ];

    // Kasir quick actions with explicit color arrays
    const kasirActions: ActionItem[] = [
        {
            title: 'Transaksi',
            icon: 'receipt',
            colors: ['#667eea', '#764ba2'],
            onPress: () => {
                // Navigate to transaction screen
                console.log('Navigate to transaction screen');
            }
        },
        {
            title: 'Produk',
            icon: 'inventory',
            colors: ['#f093fb', '#f5576c'],
            onPress: () => navigate('/menu/product/dataProduct')
        },
        {
            title: 'Suppliers',
            icon: 'local-shipping',
            colors: ['#4facfe', '#00f2fe'],
            onPress: () => {
                // Navigate to suppliers screen
                console.log('Navigate to suppliers screen');
            }
        },
        {
            title: 'Customer',
            icon: 'people',
            colors: ['#43e97b', '#38f9d7'],
            onPress: () => {
                // Navigate to customer screen
                console.log('Navigate to customer screen');
            }
        }
    ];

    const currentActions = isAdmin ? [...adminActions, ...kasirActions] : kasirActions;

    // Add fallback colors in case of undefined
    const getFallbackColors = (colors: [string, string] | undefined): [string, string] => {
        return colors || ['#6366F1', '#8B5CF6'];
    };

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
                            <Text style={styles.appBarText}>User Menu</Text>
                            <View style={styles.backButton} />
                        </View>
                    ),
                }}
            />
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        {/* Avatar Section */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>
                                    {user?.name ? getInitials(user.name) : 'U'}
                                </Text>
                            </View>
                            <View style={styles.statusDot} />
                        </View>

                        {/* User Info */}
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                                {user?.name || 'User Name'}
                            </Text>
                            <Text style={styles.userUsername}>
                                @{user?.username || 'username'}
                            </Text>

                            {/* Role Badge */}
                            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role) }]}>
                                <MaterialIcons name="verified-user" size={width * 0.035} color="#fff" />
                                <Text style={styles.roleText}>
                                    {user?.role?.toUpperCase() || 'USER'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions Card */}
                    <View style={styles.quickActionsCard}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="dashboard" size={width * 0.05} color="#6366F1" />
                            <Text style={styles.cardTitle}>Quick Actions</Text>
                        </View>

                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.actionsScrollContainer}
                        >
                            <View style={styles.actionsGrid}>
                                {currentActions.map((action, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.actionItem}
                                        onPress={action.onPress}
                                    >
                                        <LinearGradient
                                            colors={getFallbackColors(action.colors)}
                                            style={styles.actionGradient}
                                        >
                                            <MaterialIcons name={action.icon} size={width * 0.06} color="#fff" />
                                        </LinearGradient>
                                        <Text style={styles.actionText}>{action.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Menu Items */}
                    <View style={styles.menuContainer}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="menu" size={width * 0.05} color="#6366F1" />
                            <Text style={styles.cardTitle}>Menu</Text>
                        </View>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
                                    <MaterialIcons name="person" size={width * 0.05} color="#6366F1" />
                                </View>
                                <Text style={styles.menuItemText}>Edit Profile</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={width * 0.05} color="#9CA3AF" />
                        </TouchableOpacity>

                        {isAdmin && (
                            <TouchableOpacity style={styles.menuItem} onPress={() => navigate('/menu/admin/manageUser')}>
                                <View style={styles.menuItemLeft}>
                                    <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                                        <MaterialIcons name="manage-accounts" size={width * 0.05} color="#F59E0B" />
                                    </View>
                                    <View style={styles.menuTextContainer}>
                                        <Text style={styles.menuItemText}>Manage User</Text>
                                        <Text style={styles.adminBadgeText}>Admin Only</Text>
                                    </View>
                                </View>
                                <MaterialIcons name="chevron-right" size={width * 0.05} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {/* Logout Button */}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#EF4444', '#DC2626']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.logoutGradient}
                        >
                            <MaterialIcons name="logout" size={width * 0.05} color="#fff" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Version Info */}
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    appBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#6c5ce7',
        paddingHorizontal: width * 0.04,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
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
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        flex: 1,
        paddingTop: height * 0.03,
        paddingHorizontal: width * 0.05,
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.05,
        padding: width * 0.06,
        alignItems: 'center',
        marginBottom: height * 0.025,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: height * 0.02,
    },
    avatarCircle: {
        width: width * 0.25,
        height: width * 0.25,
        borderRadius: width * 0.125,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    avatarText: {
        fontSize: width * 0.09,
        fontWeight: '700',
        color: '#fff',
    },
    statusDot: {
        position: 'absolute',
        bottom: width * 0.02,
        right: width * 0.02,
        width: width * 0.05,
        height: width * 0.05,
        borderRadius: width * 0.025,
        backgroundColor: '#10B981',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: width * 0.06,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: height * 0.005,
    },
    userUsername: {
        fontSize: width * 0.04,
        color: '#6B7280',
        marginBottom: height * 0.015,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.03,
        paddingVertical: height * 0.008,
        borderRadius: width * 0.05,
        gap: 4,
    },
    roleText: {
        fontSize: width * 0.03,
        fontWeight: '600',
        color: '#fff',
    },
    quickActionsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.04,
        padding: width * 0.05,
        marginBottom: height * 0.025,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.02,
        gap: width * 0.025,
    },
    cardTitle: {
        fontSize: width * 0.045,
        fontWeight: '700',
        color: '#1F2937',
    },
    actionsScrollContainer: {
        paddingRight: width * 0.05,
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: width * 0.04,
    },
    actionItem: {
        alignItems: 'center',
        width: width * 0.25,
    },
    actionGradient: {
        width: width * 0.15,
        height: width * 0.15,
        borderRadius: width * 0.075,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: height * 0.01,
    },
    actionText: {
        fontSize: width * 0.03,
        fontWeight: '500',
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: width * 0.035,
    },
    menuContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.04,
        padding: width * 0.05,
        marginBottom: height * 0.025,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: height * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        width: width * 0.1,
        height: width * 0.1,
        borderRadius: width * 0.03,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width * 0.03,
    },
    menuItemText: {
        fontSize: width * 0.04,
        fontWeight: '500',
        color: '#1F2937',
    },
    menuTextContainer: {
        flexDirection: 'column',
    },
    adminBadgeText: {
        fontSize: width * 0.03,
        color: '#F59E0B',
        fontWeight: '500',
        marginTop: 2,
    },
    logoutButton: {
        borderRadius: width * 0.04,
        marginBottom: height * 0.025,
        shadowColor: '#EF4444',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: height * 0.02,
        borderRadius: width * 0.04,
        gap: width * 0.02,
    },
    logoutText: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#fff',
    },
    versionText: {
        textAlign: 'center',
        fontSize: width * 0.03,
        color: '#9CA3AF',
        marginBottom: height * 0.050,
    },
});

export default SettingScreen;
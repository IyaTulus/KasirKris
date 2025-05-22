import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
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

const SettingScreen: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const stored = await AsyncStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                setUser(parsed);
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
                    await AsyncStorage.removeItem('user');
                    router.replace('/auth/login');
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
            case 'user':
                return '#45B7D1';
            default:
                return '#95A5A6';
        }
    };

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    return (
        <>
            <Stack.Screen
                options={{
                    header: () => (
                        <View style={[styles.appBar, { height: height * 0.12, paddingTop: height * 0.04 }]}>
                            <Text style={styles.appBarText}>User Menu</Text>
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
                        
                        <View style={styles.actionsGrid}>
                            <TouchableOpacity style={styles.actionItem}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    style={styles.actionGradient}
                                >
                                    <MaterialIcons name="receipt" size={width * 0.06} color="#fff" />
                                </LinearGradient>
                                <Text style={styles.actionText}>Transaksi</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionItem}>
                                <LinearGradient
                                    colors={['#f093fb', '#f5576c']}
                                    style={styles.actionGradient}
                                >
                                    <MaterialIcons name="inventory" size={width * 0.06} color="#fff" />
                                </LinearGradient>
                                <Text style={styles.actionText}>Produk</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionItem}>
                                <LinearGradient
                                    colors={['#4facfe', '#00f2fe']}
                                    style={styles.actionGradient}
                                >
                                    <MaterialIcons name="analytics" size={width * 0.06} color="#fff" />
                                </LinearGradient>
                                <Text style={styles.actionText}>Laporan</Text>
                            </TouchableOpacity>
                        </View>
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
                            <TouchableOpacity style={styles.menuItem}>
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
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionItem: {
        alignItems: 'center',
        width: '22%',
        marginBottom: height * 0.02,
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
    activityCard: {
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
    activityContent: {
        gap: height * 0.015,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.03,
    },
    activityDot: {
        width: width * 0.03,
        height: width * 0.03,
        borderRadius: width * 0.015,
        backgroundColor: '#10B981',
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: width * 0.04,
        fontWeight: '500',
        color: '#1F2937',
    },
    activityTime: {
        fontSize: width * 0.035,
        color: '#6B7280',
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
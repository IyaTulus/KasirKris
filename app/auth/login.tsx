import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginUser } from '../../hooks/useAuth';
import { navigate } from 'expo-router/build/global-state/routing';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const user = await loginUser(username, password);
            Alert.alert('Sukses', 'Berhasil masuk!');
            setUsername('');
            setPassword('');
            // Mengirim user_id ke dashboard sebagai parameter
            router.replace({ pathname: '/dashboard/dashboard', params: { user_id: user?.user_id } });
        } catch (error: any) {
            Alert.alert('Gagal', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
        <View style={styles.container}>
            <Text style={styles.title}>Masuk</Text>
            <View style={styles.inputContainer}>
                <FontAwesome name="user" size={22} color="#888" style={styles.icon} />
                <TextInput
                    placeholder="Username"
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
            </View>
            <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={22} color="#888" style={styles.icon} />
                <TextInput
                    placeholder="Password"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />
            </View>
            <TouchableOpacity
                style={[styles.button, loading && { backgroundColor: '#aaa' }]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Masuk...' : 'Masuk'}</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center', marginTop: 18 }}>
                <Text>
                    Belum punya akun?{' '}
                    <Text
                        style={{ color: '#0984e3', fontWeight: 'bold' }}
                        onPress={() => navigate('/auth/register')}
                    >
                        Daftar
                    </Text>
                </Text>
            </View>
        </View>
        </>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#f7f8fa',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 32,
        alignSelf: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 18,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#0984e3',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

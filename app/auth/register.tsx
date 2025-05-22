import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registerUser } from '../../hooks/useAuth';
import { Stack } from 'expo-router';
import { navigate } from 'expo-router/build/global-state/routing';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        try {
            await registerUser(name, username, password);
            Alert.alert('Sukses', 'Akun berhasil dibuat!');
            setName('');
            setUsername('');
            setPassword('');
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
                <Text style={styles.title}>Buat Akun Baru</Text>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="person" size={22} color="#888" style={styles.icon} />
                    <TextInput
                        placeholder="Nama Lengkap"
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                </View>
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
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Mendaftar...' : 'Daftar'}</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'center', marginTop: 18 }}>
                    <Text>
                        Sudah punya akun?{' '}
                        <Text
                            style={{ color: '#0984e3', fontWeight: 'bold' }}
                            onPress={() => navigate('/auth/login')}
                        >
                            Login
                        </Text>
                    </Text>
                </View>
            </View>
        </>
    );
};

export default RegisterScreen;

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

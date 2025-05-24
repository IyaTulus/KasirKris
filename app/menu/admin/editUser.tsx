import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUserManagement } from '../../../hooks/UserManagement';
import { navigate } from 'expo-router/build/global-state/routing';

const { width, height } = Dimensions.get('window');

type RoleOption = {
    value: string;
    label: string;
    icon: string;
    description: string;
    color: string;
};

const roleOptions: RoleOption[] = [
    {
        value: 'admin',
        label: 'Administrator',
        icon: 'shield-checkmark',
        description: 'Full system access and user management',
        color: '#4338CA',
    },
    {
        value: 'kasir',
        label: 'Kasir',
        icon: 'card',
        description: 'Point of sale and transaction management',
        color: '#B45309',
    }
];

const EditUserScreen = () => {
    const { user_id } = useLocalSearchParams();
    const { users, editUser } = useUserManagement();

    const userData = users.find(user => user.user_id === user_id);

    const [formData, setFormData] = useState({
        user_id: '',
        name: '',
        username: '',
        password: '',
        role: 'kasir',
    });

    useEffect(() => {
        if (userData) {
            setFormData({   
                user_id: userData.user_id,
                name: userData.name,
                username: userData.username,
                password: userData.password,
                role: userData.role,
            });
        }
    }, [userData]);

    const [showPassword, setShowPassword] = useState(false);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.trim().length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.role) {
            newErrors.role = 'Please select a role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateUser = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await editUser(formData.user_id, formData);
            Alert.alert(
                'Success',
                'User update successfully!',
                [{
                    text: 'OK', onPress: () => {
                        // Reset form
                        setFormData({user_id: '', name: '', username: '', password: '', role: 'kasir' });
                        setErrors({});
                    }
                }]
            );

            navigate('/menu/admin/manageUser');
        } catch (error) {
            Alert.alert('Error', 'Failed to update user. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/menu/admin/manageUser');
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const selectedRole = roleOptions.find(role => role.value === formData.role);

    const renderRoleOption = (option: RoleOption) => (
        <TouchableOpacity
            key={option.value}
            style={[
                styles.roleOption,
                formData.role === option.value && {
                    borderColor: option.color,
                    backgroundColor: `${option.color}15`
                }
            ]}
            onPress={() => {
                updateFormData('role', option.value);
                setShowRoleSelector(false);
            }}
        >
            <View style={styles.roleOptionContent}>
                <View style={[styles.roleIconContainer, { backgroundColor: option.color }]}>
                    <Ionicons name={option.icon as any} size={20} color="#fff" />
                </View>
                <View style={styles.roleTextContainer}>
                    <Text style={styles.roleOptionLabel}>{option.label}</Text>
                    <Text style={styles.roleOptionDescription}>{option.description}</Text>
                </View>
                {formData.role === option.value && (
                    <Ionicons name="checkmark-circle" size={20} color={option.color} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#6c5ce7" />
            <Stack.Screen
                options={{
                    header: () => (
                        <View style={styles.appBar}>
                            <View style={styles.appBarContent}>
                                <Text style={styles.appBarText}>Edit User</Text>
                                <Text style={styles.appBarSubtext}>Edit a team member</Text>
                            </View>
                        </View>
                    ),
                }}
            />
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.formCard}>
                        <View style={styles.formHeader}>
                            <View style={styles.formIconContainer}>
                                <Feather name="edit" size={24} color="#6c5ce7" />
                            </View>
                            <Text style={styles.formTitle}>User Information</Text>
                            <Text style={styles.formSubtitle}>Fill in the details below</Text>
                        </View>

                        {/* Full Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={[styles.inputGroup, errors.name && styles.inputError]}>
                                <MaterialCommunityIcons name="account-outline" size={20} color="#6B7280" />
                                <TextInput
                                    placeholder="Enter full name"
                                    style={styles.input}
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.name}
                                    onChangeText={(value) => updateFormData('name', value)}
                                    autoCapitalize="words"
                                />
                            </View>
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        {/* Username Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Username</Text>
                            <View style={[styles.inputGroup, errors.username && styles.inputError]}>
                                <MaterialCommunityIcons name="at" size={20} color="#6B7280" />
                                <TextInput
                                    placeholder="Enter username"
                                    style={styles.input}
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.username}
                                    onChangeText={(value) => updateFormData('username', value.toLowerCase())}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={[styles.inputGroup, errors.password && styles.inputError]}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color="#6B7280" />
                                <TextInput
                                    placeholder="Enter password"
                                    style={styles.input}
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.password}
                                    onChangeText={(value) => updateFormData('password', value)}
                                    secureTextEntry={!showPassword}
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.passwordToggle}
                                >
                                    <Feather
                                        name={showPassword ? "eye-off" : "eye"}
                                        size={18}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        {/* Role Selection */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Role</Text>
                            <TouchableOpacity
                                style={[styles.roleSelector, errors.role && styles.inputError]}
                                onPress={() => setShowRoleSelector(!showRoleSelector)}
                            >
                                <View style={styles.roleSelectorContent}>
                                    <View style={[styles.roleIconContainer, { backgroundColor: selectedRole?.color }]}>
                                        <Ionicons name={selectedRole?.icon as any} size={16} color="#fff" />
                                    </View>
                                    <View style={styles.roleTextContainer}>
                                        <Text style={styles.selectedRoleLabel}>{selectedRole?.label}</Text>
                                        <Text style={styles.selectedRoleDescription}>{selectedRole?.description}</Text>
                                    </View>
                                    <Feather
                                        name={showRoleSelector ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </View>
                            </TouchableOpacity>
                            {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

                            {showRoleSelector && (
                                <View style={styles.roleOptionsContainer}>
                                    {roleOptions.map(renderRoleOption)}
                                </View>
                            )}
                        </View>

                        {/* Buttons Container */}
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity
                                style={[styles.cancelButton, isLoading && styles.cancelButtonDisabled]}
                                onPress={handleCancel}
                                disabled={isLoading}
                            >
                                <Feather name="x" size={18} color="#e74c3c" />
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.createButton, isLoading && styles.createButtonDisabled]}
                                onPress={handleCreateUser}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Text style={styles.createButtonText}>Updating...</Text>
                                ) : (
                                    <>
                                        <Feather name="edit" size={18} color="#fff" />
                                        <Text style={styles.createButtonText}>Edit User</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

const styles = StyleSheet.create({
    keyboardAvoid: {
        flex: 1,
    },
    appBar: {
        height: Platform.OS === 'ios' ? height * 0.14 : height * 0.12,
        backgroundColor: '#6c5ce7',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingHorizontal: 20,
        justifyContent: 'flex-end',
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 12,
    },
    appBarContent: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    appBarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F9FAFB',
        letterSpacing: 0.5,
    },
    appBarSubtext: {
        fontSize: 14,
        color: '#E0E7FF',
        fontWeight: '500',
        marginTop: 4,
        opacity: 0.9,
    },
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    formHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    formIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 2,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 52,
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    passwordToggle: {
        padding: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        marginLeft: 2,
    },
    roleSelector: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 16,
    },
    roleSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roleIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    roleTextContainer: {
        flex: 1,
    },
    selectedRoleLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    selectedRoleDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    roleOptionsContainer: {
        marginTop: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    roleOption: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    roleOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    roleOptionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    roleOptionDescription: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    createButton: {
        flex: 1,
        backgroundColor: '#6c5ce7',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6c5ce7',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 8,
        letterSpacing: 0.5,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e74c3c',
    },
    cancelButtonDisabled: {
        opacity: 0.6,
    },
    cancelButtonText: {
        color: '#e74c3c',
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 8,
        letterSpacing: 0.5,
    },
});

export default EditUserScreen;
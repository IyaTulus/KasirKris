import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { navigate } from 'expo-router/build/global-state/routing';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useUserManagement } from '../../../hooks/UserManagement';

type User = {
  user_id: string;
  name: string;
  username: string;
  role: string;
};

const { width, height } = Dimensions.get('window');

const roleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Ionicons name="shield-checkmark" size={12} color="#fff" />;
    case 'staff':
      return <FontAwesome5 name="user-tie" size={10} color="#fff" />;
    case 'kasir':
      return <MaterialIcons name="point-of-sale" size={12} color="#fff" />;
    default:
      return <FontAwesome5 name="user" size={10} color="#fff" />;
  }
};

const getRoleBadgeStyle = (role: string) => {
  const baseStyle = {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    alignSelf: 'flex-start' as const,
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  };

  const colors = {
    admin: '#4338CA',
    staff: '#059669',
    kasir: '#B45309',
  };

  return {
    ...baseStyle,
    backgroundColor: colors[role as keyof typeof colors] || colors.kasir,
  };
};

const getInitials = (name: string) => {
  if (!name) return 'US';
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name: string) => {
  if (!name) return '#2563EB';

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#2563EB', // blue
    '#059669', // emerald
    '#D97706', // amber
    '#DC2626', // red
    '#7C3AED', // violet
    '#DB2777', // pink
    '#14B8A6', // teal
    '#6366F1', // indigo
  ];

  return colors[Math.abs(hash) % colors.length];
};

const UserManagementScreen = () => {
  const { users, deleteUser } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (userId: string, username: string) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete user ${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => deleteUser(userId),
          style: 'destructive'
        },
      ]
    );
  };

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderUserCard = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.cardContent}>
        <View style={styles.profileSection}>
          <View style={[styles.avatarCircle, { backgroundColor: getAvatarColor(item.name) }]}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>
          <View style={styles.userTextContainer}>
            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.userUsername} numberOfLines={1} ellipsizeMode="tail">
              @{item.username}
            </Text>
            <View style={getRoleBadgeStyle(item.role)}>
              {roleIcon(item.role)}
              <Text style={styles.roleText}>{item.role}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => navigate(`/menu/admin/editUser?user_id=${item.user_id}`)}
            style={[styles.iconButton, styles.editButton]}
            accessibilityLabel={`Edit user ${item.name}`}
          >
            <Feather name="edit-2" size={18} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.user_id, item.username)}
            style={[styles.iconButton, styles.deleteButton]}
            accessibilityLabel={`Delete user ${item.name}`}
          >
            <MaterialIcons name="delete-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="people" size={20} color="#6c5ce7" />
        </View>
        <Text style={styles.statNumber}>{users.length}</Text>
        <Text style={styles.statLabel}>Total Users</Text>
      </View>
      <View style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name="shield-checkmark" size={20} color="#4338CA" />
        </View>
        <Text style={styles.statNumber}>
          {users.filter(u => u.role === 'admin').length}
        </Text>
        <Text style={styles.statLabel}>Admins</Text>
      </View>
      <View style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <MaterialIcons name="point-of-sale" size={20} color="#B45309" />
        </View>
        <Text style={styles.statNumber}>
          {users.filter(u => u.role === 'kasir').length}
        </Text>
        <Text style={styles.statLabel}>Kasir</Text>
      </View>
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
              <Text style={styles.appBarText}>User Menu</Text>
              <View style={styles.backButton} />
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        {renderStatsCard()}

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            placeholder="Search users by name, username, or role..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchTerm !== '' && (
            <TouchableOpacity
              onPress={() => setSearchTerm('')}
              style={styles.clearButton}
            >
              <Feather name="x" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {filteredUsers.length > 0 ? (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.user_id}
            renderItem={renderUserCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="users" size={48} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyText}>
              {searchTerm ? 'No users found' : 'No users yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Add your first team member to get started'
              }
            </Text>
            {!searchTerm && (
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => navigate('/menu/admin/createUser')}
              >
                <Text style={styles.emptyActionText}>Add User</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigate('/menu/admin/createUser')}
          accessibilityLabel="Add new user"
        >
          <Feather name="user-plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 0,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  userTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  userUsername: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  editButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  separator: {
    height: 16,
  },
  listContent: {
    paddingBottom: 120,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    color: '#475569',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActionButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#6c5ce7',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fabButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    backgroundColor: '#6c5ce7',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
});

export default UserManagementScreen;
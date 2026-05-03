import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../hooks/useAuth';
import { useAppModal } from '../../hooks/useAppModal';
import profileService from '../../services/profileService';

const { width, height } = Dimensions.get('window');

const MENU_ITEMS = [
  { 
    id: 'orders', 
    title: 'My Orders', 
    subtitle: 'Track your ongoing orders', 
    icon: 'basket-outline', 
    color: '#E0F2FE', 
    iconColor: '#0284C7'
  },
  { 
    id: 'payment', 
    title: 'Payment Methods', 
    subtitle: 'Manage your cards and wallets', 
    icon: 'card-outline', 
    color: '#F3E8FF', 
    iconColor: '#9333EA'
  },
  { 
    id: 'settings', 
    title: 'Settings', 
    subtitle: 'Account and app preferences', 
    icon: 'settings-outline', 
    color: '#F1F5F9', 
    iconColor: '#475569'
  },
  { 
    id: 'help', 
    title: 'Help Center', 
    subtitle: 'FAQs and support chat', 
    icon: 'information-circle-outline', 
    color: '#FFEDD5', 
    iconColor: '#EA580C'
  },
];

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { showModal } = useAppModal();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const statsScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(statsScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleUpdateAvatar = () => {
    navigation.navigate('EditProfile');
  };

  const handleMenuPress = (id) => {
    switch (id) {
      case 'orders':
        navigation.navigate('MyOrders');
        break;
      case 'payment':
        navigation.navigate('PaymentMethod');
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'help':
        navigation.navigate('HelpCenter');
        break;
      default:
        const item = MENU_ITEMS.find(i => i.id === id);
        showModal({
          type: 'info',
          title: 'Coming Soon!',
          message: `Fitur ${item ? item.title : id} sedang dalam tahap pengembangan dan akan segera hadir untuk Anda.`,
          confirmText: 'Dimengerti'
        });
    }
  };

  const handleLogout = () => {
    showModal({
      type: 'confirm',
      title: 'Sign Out',
      message: 'Apakah Anda yakin ingin keluar dari akun Anda?',
      confirmText: 'Sign Out',
      onConfirm: async () => {
        try {
          await logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          style={{ opacity: fadeAnim }}
        >
          {/* Profile Header */}
          <View style={styles.headerContainer}>
            <View style={styles.profileInfoWrapper}>
              <View style={styles.avatarShadow}>
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: user?.avatar_url || profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=0D8ABC&color=fff&size=128' }}
                    style={styles.avatar}
                  />
                  <TouchableOpacity style={styles.updateAvatarBtn} onPress={handleUpdateAvatar}>
                    <Ionicons name="camera" size={20} color={Colors.surface} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.userName}>{profile?.name || user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role === 'admin' ? 'Administrator' : 'Customer'}</Text>
              </View>
            </View>
          </View>

          {/* Stats Section - Separate Cards */}
          <View style={styles.statsContainer}>
            <Animated.View style={[styles.statCard, { transform: [{ scale: statsScale }] }]}>
              <Ionicons name="bag-handle" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </Animated.View>
            
            <Animated.View style={[styles.statCard, styles.statCardMiddle, { transform: [{ scale: statsScale }] }]}>
              <Ionicons name="star" size={24} color="#FBBF24" />
              <Text style={styles.statValue}>2.4k</Text>
              <Text style={styles.statLabel}>Points</Text>
            </Animated.View>
            
            <Animated.View style={[styles.statCard, { transform: [{ scale: statsScale }] }]}>
              <Ionicons name="heart" size={24} color={Colors.error} />
              <Text style={styles.statValue}>{wishlist?.length || 0}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </Animated.View>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            {MENU_ITEMS.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  activeOpacity={0.7}
                  onPress={() => handleMenuPress(item.id)}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <Ionicons name={item.icon} size={22} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.border} />
                </TouchableOpacity>
                {index < MENU_ITEMS.length - 1 && <View style={styles.menuSeparator} />}
              </React.Fragment>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={24} color={Colors.error} />
            </View>
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Version 1.0.2 (Build 42)</Text>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  profileInfoWrapper: {
    alignItems: 'center',
  },
  avatarShadow: {
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  updateAvatarBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
    elevation: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: 'rgba(13, 138, 188, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(13, 138, 188, 0.2)',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 30,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statCardMiddle: {
    marginHorizontal: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuSeparator: {
    height: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#FFE4E4',
    elevation: 4,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.error,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(13, 138, 188, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Logout Modal Specific Styles
  modalActionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  confirmLogoutBtnText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

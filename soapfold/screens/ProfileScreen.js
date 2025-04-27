import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { auth, getUserDataFromLocalStorage } from '../config/firebase';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, setDarkMode, theme: activeTheme } = useTheme();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Get user data from AsyncStorage
          const userData = await getUserDataFromLocalStorage();
          if (userData) {
            setUser(userData);
            console.log('Using user data from AsyncStorage in profile');
          } else {
            // If no user data found, create basic user data from auth
            const basicUserData = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'User',
              email: currentUser.email,
              photoURL: currentUser.photoURL,
            };
            setUser(basicUserData);
            console.log('Created basic user data from auth in profile');
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = async (value) => {
    setDarkMode(value);
  };

  // Handle navigation to edit profile
  const goToEditProfile = () => {
    navigation.navigate('EditProfile', { user });
  };

  // Show the logout modal
  const showLogoutModal = () => {
    setLogoutModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Hide the logout modal
  const hideLogoutModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setLogoutModalVisible(false);
    });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Hide the modal first
      hideLogoutModal();
      
      // Wait for animation to complete
      setTimeout(async () => {
        // Clear user data from AsyncStorage, including onboarding status
        // to redirect user to onboarding screen
        const keys = ['@userData', '@user', '@authUser', '@userToken', '@hasSeenOnboarding'];
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
        console.log('Cleared AsyncStorage including @hasSeenOnboarding to show onboarding after logout');
      
      // Then sign out from Firebase
        if (auth) {
      await signOut(auth);
        }
        
        // The auth state listener in App.js will handle navigation automatically
      }, 300);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeTheme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Helper to get user's initials
  const getUserInitials = () => {
    if (!user || !user.displayName) return '?';
    
    const nameParts = user.displayName.trim().split(/\s+/);
    
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    const firstInitial = nameParts[0].charAt(0);
    const lastInitial = nameParts[nameParts.length - 1].charAt(0);
    
    return (firstInitial + lastInitial).toUpperCase();
  };
  
  // Modal animations
  const translateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: activeTheme.colors.border }]}>
        <Text style={[styles.profileHeaderText, { color: activeTheme.colors.text }]}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <MaterialIcons name="settings" size={24} color={activeTheme.colors.icon} />
            </TouchableOpacity>
        </View>
        
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileSection, { backgroundColor: activeTheme.colors.cardBackground }]}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
                <Image 
                source={{ uri: user.photoURL }} 
                style={styles.avatarImage}
                onError={(e) => {
                  console.log('Error loading profile image:', e);
                  }}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getUserInitials()}</Text>
                </View>
              )}
            <TouchableOpacity style={styles.editIconContainer} onPress={goToEditProfile}>
              <MaterialIcons name="edit" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.userName, { color: activeTheme.colors.text }]}>{user?.displayName || 'User'}</Text>
          <Text style={[styles.userEmail, { color: activeTheme.colors.lightText }]}>{user?.email || ''}</Text>
        </View>

        <View style={[styles.menuSection, { backgroundColor: activeTheme.colors.cardBackground }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: activeTheme.colors.divider }]} onPress={goToEditProfile}>
            <MaterialIcons name="person-outline" size={24} color={activeTheme.colors.icon} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: activeTheme.colors.text }]}>Edit Profile</Text>
            <MaterialIcons name="chevron-right" size={24} color={activeTheme.colors.icon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: activeTheme.colors.divider }]} onPress={() => navigation.navigate('NotificationSettings')}>
            <MaterialIcons name="notifications-none" size={24} color={activeTheme.colors.icon} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: activeTheme.colors.text }]}>Notification</Text>
            <MaterialIcons name="chevron-right" size={24} color={activeTheme.colors.icon} />
          </TouchableOpacity>
          
          <View style={[styles.menuItem, { borderBottomColor: activeTheme.colors.divider }]}>
            <MaterialIcons name="dark-mode" size={24} color={activeTheme.colors.icon} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: activeTheme.colors.text }]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#DDDDDD', true: activeTheme.colors.switch }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#DDDDDD"
              style={styles.switch}
            />
          </View>
          
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: activeTheme.colors.divider }]} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <MaterialIcons name="lock-outline" size={24} color={activeTheme.colors.icon} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: activeTheme.colors.text }]}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={24} color={activeTheme.colors.icon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: activeTheme.colors.divider }]} onPress={() => navigation.navigate('HelpCenter')}>
            <MaterialIcons name="help-outline" size={24} color={activeTheme.colors.icon} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: activeTheme.colors.text }]}>Help Center</Text>
            <MaterialIcons name="chevron-right" size={24} color={activeTheme.colors.icon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: activeTheme.colors.divider }]} onPress={() => navigation.navigate('InviteFriends')}>
            <MaterialIcons name="people-outline" size={24} color={activeTheme.colors.icon} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: activeTheme.colors.text }]}>Invite Friends</Text>
            <MaterialIcons name="chevron-right" size={24} color={activeTheme.colors.icon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={showLogoutModal}>
            <MaterialIcons name="logout" size={24} color="#FF3B30" style={styles.menuIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={hideLogoutModal}>
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer, 
              { transform: [{ translateY: translateY }] }
            ]}>
            <LinearGradient
              colors={['#FFFFFF', '#FFFFFF']}
              style={styles.modalGradient}>
              <Text style={styles.logoutTitle}>Logout</Text>
              <Text style={styles.logoutConfirmText}>Are you sure you want to log out?</Text>
              
              <View style={styles.logoutButtonsContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={hideLogoutModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmLogoutButton} 
                  onPress={handleLogout}>
                  <Text style={styles.confirmLogoutButtonText}>Yes, Logout</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  profileHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 6,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#777777',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8E44AD',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    marginRight: 16,
    width: 26,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#FF3B30',
  },
  // Logout Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  logoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  logoutConfirmText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 25,
    textAlign: 'center',
  },
  logoutButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  confirmLogoutButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1.5,
    alignItems: 'center',
  },
  confirmLogoutButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ProfileScreen; 
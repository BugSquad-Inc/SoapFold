import React, { useState, useEffect, useContext } from 'react';
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
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { auth, getUserDataFromLocalStorage, saveUserDataToLocalStorage, db } from '../config/firebase';
import { signOut, updateProfile, deleteUser } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from '../utils/imageUpload';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

const SettingsScreen = ({ navigation, route }) => {
  const { theme: activeTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));
  const [deleteModalAnimation] = useState(new Animated.Value(0));
  const [imageActionModalVisible, setImageActionModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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
      backgroundColor: '#F5F5F5',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    avatarImage: {
      width: 90,
      height: 90,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      borderWidth: 4,
      borderColor: isDarkMode ? '#FFFFFF' : '#000000',
    },
    avatarPlaceholder: {
      width: 90,
      height: 90,
      borderRadius: 16,
      backgroundColor: '#E1E1E1',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: isDarkMode ? '#FFFFFF' : '#000000',
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
      backgroundColor: isDarkMode ? '#FFFFFF' : '#000000',
      width: 26,
      height: 26,
      borderRadius: 8,
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
    content: {
      padding: 16,
      paddingBottom: 80,
    },
    menuCard: {
      borderRadius: 12,
      marginBottom: 12,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    menuCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    menuCardLeft: {
      flex: 1,
    },
    menuCardTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    menuCardSubtitle: {
      fontSize: 14,
    },
    menuCardRight: {
      marginLeft: 16,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      width: '100%',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    modalText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 8,
      backgroundColor: '#243D6E',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#CCCCCC',
    },
    confirmButton: {
      backgroundColor: '#243D6E',
    },
    deleteButton: {
      backgroundColor: '#FF3B30',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    imageActionModal: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    },
    imageActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },
    imageActionText: {
      fontSize: 16,
      marginLeft: 16,
    },
    removeImageButton: {
      borderBottomWidth: 0,
    },
    warningIcon: {
      alignSelf: 'center',
      marginBottom: 16,
    },
    fullScreenLoading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      marginLeft: 16,
      textTransform: 'uppercase',
    },
    sectionContent: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
    },
    settingItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingItemText: {
      fontSize: 16,
      marginLeft: 12,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 18,
      borderBottomWidth: 0,
      marginBottom: 8,
      backgroundColor: '#243D6E',
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#fff',
    },
    avatarHeaderContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: activeTheme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: activeTheme.colors.cardBackground,
    },
    avatarHeaderImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    avatarHeaderPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#E1E1E1',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarHeaderText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#777777',
    },
    sectionBlock: {
      marginBottom: 28,
      paddingHorizontal: 16,
    },
    sectionLabel: {
      fontSize: 17,
      fontWeight: 'bold',
      marginBottom: 10,
      marginLeft: 4,
      color: activeTheme.colors.text,
    },
    cardBlock: {
      borderRadius: 18,
      backgroundColor: activeTheme.colors.cardBackground,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
      paddingVertical: 2,
      marginBottom: 2,
    },
  });

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
  }, [route.params?.userUpdated]);

  // Handle navigation to edit profile
  const goToEditProfile = () => {
    navigation.navigate('EditProfile', { user });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Deleting your account...');
      const user = auth.currentUser;
      
      if (user) {
        // Clear all user data from AsyncStorage
        await AsyncStorage.clear();
        // Delete the user account
        await deleteUser(user);
        setLoadingMessage('Account deleted successfully');
        
        // Reset navigation to Auth stack with SignIn screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth', params: { screen: 'SignIn', params: { message: 'Your account has been deleted successfully.' } } }],
        });
      } else {
        throw new Error('No user found');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      let errorMessage = 'Failed to delete account. ';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage += 'Please sign in again and try once more.';
        // Sign out the user to force re-authentication
        await signOut(auth);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth', params: { screen: 'SignIn', params: { message: 'Please sign in again to delete your account.' } } }],
        });
      } else {
        errorMessage += 'Please try again later.';
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
      setShowDeleteModal(false);
    }
  };

  // Handle profile image actions
  const handleProfileImagePress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', 'Remove Photo'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          } else if (buttonIndex === 3) {
            removeProfileImage();
          }
        }
      );
    } else {
      setImageActionModalVisible(true);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take a photo');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImageSelection(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library permissions to select a photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImageSelection(result.assets[0].uri);
    }
  };

  const handleImageSelection = async (uri) => {
    try {
      setLoading(true);
      // Upload image to Cloudinary
      const photoURL = await uploadToCloudinary(uri);
      
      if (photoURL) {
        // Update Firebase profile
        await updateProfile(auth.currentUser, {
          photoURL: photoURL
        });

        // Update local user data
        const updatedUser = { ...user, photoURL };
        await saveUserDataToLocalStorage(updatedUser);
        setUser(updatedUser);
      } else {
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert('Error', 'Failed to update profile image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeProfileImage = async () => {
    try {
      setLoading(true);
      // Update Firebase profile
      await updateProfile(auth.currentUser, {
        photoURL: ''
      });

      // Update local user data
      const updatedUser = { ...user, photoURL: '' };
      await saveUserDataToLocalStorage(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error removing profile image:', error);
      Alert.alert('Error', 'Failed to remove profile image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      await AsyncStorage.setItem('notificationsEnabled', newValue.toString());
      // Here you can also implement the actual notification permission logic
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}>
        <View style={[styles.fullScreenLoading, { backgroundColor: activeTheme.colors.background }]}>
          <ActivityIndicator size="large" color={activeTheme.colors.primary} />
          {loadingMessage && (
            <Text style={[styles.loadingText, { color: activeTheme.colors.text }]}>
              {loadingMessage}
            </Text>
          )}
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

  const deleteModalTranslateY = deleteModalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const MenuCard = ({ title, subtitle, icon, onPress, rightElement }) => (
    <TouchableOpacity 
      style={[styles.menuCard, { backgroundColor: activeTheme.colors.cardBackground }]} 
      onPress={onPress}
    >
      <View style={styles.menuCardContent}>
        <View style={styles.menuCardLeft}>
          <Text style={[styles.menuCardTitle, { color: activeTheme.colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.menuCardSubtitle, { color: activeTheme.colors.lightText }]}>{subtitle}</Text>
          )}
        </View>
        <View style={styles.menuCardRight}>
          {rightElement || <MaterialIcons name="chevron-right" size={24} color={activeTheme.colors.icon} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSettingItem = (icon, title, onPress, showArrow = true, rightComponent = null) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: activeTheme.colors.border }]}
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={24} color={activeTheme.colors.icon} />
        <Text style={[styles.settingItemText, { color: activeTheme.colors.text }]}>{title}</Text>
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={24} color={activeTheme.colors.icon} />
      ))}
    </TouchableOpacity>
  );

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: activeTheme.colors.lightText }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: activeTheme.colors.cardBackground }]}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}>
      <View style={[styles.headerRow, { borderBottomColor: activeTheme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: activeTheme.colors.text }]}>Settings</Text>
        <TouchableOpacity style={styles.avatarHeaderContainer} onPress={goToEditProfile}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarHeaderImage} />
          ) : (
            <View style={styles.avatarHeaderPlaceholder}>
              <Text style={styles.avatarHeaderText}>{getUserInitials()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.cardBlock}>
            {renderSettingItem('person-outline', 'Edit Profile', goToEditProfile)}
            {renderSettingItem('lock-closed-outline', 'Change Password', () => navigation.navigate('ChangePassword'))}
          </View>
        </View>
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.cardBlock}>
            {renderSettingItem('help-circle-outline', 'Help Center', () => navigation.navigate('HelpCenter'))}
            {renderSettingItem('information-circle-outline', 'About', () => navigation.navigate('About'))}
            {renderSettingItem('mail-outline', 'Send Feedback', () => navigation.navigate('SendFeedback'))}
          </View>
        </View>
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.cardBlock}>
            <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <View style={styles.settingItemLeft}>
                <Ionicons name="notifications-outline" size={24} color={activeTheme.colors.icon} />
                <Text style={[styles.settingItemText, { color: activeTheme.colors.text }]}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#767577', true: '#243D6E' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          </View>
        </View>
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Login</Text>
          <View style={styles.cardBlock}>
            {renderSettingItem('log-out-outline', 'Sign Out', () => setShowLogoutModal(true))}
            {renderSettingItem('trash-outline', 'Delete Account', () => setShowDeleteModal(true))}
          </View>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Sign Out</Text>
            <Text style={[styles.modalText, { color: theme.colors.text }]}>
              Are you sure you want to sign out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Delete Account</Text>
            <Text style={[styles.modalText, { color: theme.colors.text }]}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteAccount}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Action Modal for Android */}
      <Modal
        visible={imageActionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageActionModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageActionModalVisible(false)}
        >
          <View style={[styles.imageActionModal, { backgroundColor: theme.colors.cardBackground }]}>
            <TouchableOpacity 
              style={styles.imageActionButton}
              onPress={() => {
                setImageActionModalVisible(false);
                takePhoto();
              }}
            >
              <MaterialIcons name="camera-alt" size={24} color={theme.colors.text} />
              <Text style={[styles.imageActionText, { color: theme.colors.text }]}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imageActionButton}
              onPress={() => {
                setImageActionModalVisible(false);
                pickImage();
              }}
            >
              <MaterialIcons name="photo-library" size={24} color={theme.colors.text} />
              <Text style={[styles.imageActionText, { color: theme.colors.text }]}>Choose from Library</Text>
            </TouchableOpacity>
            
            {user?.photoURL && (
              <TouchableOpacity 
                style={[styles.imageActionButton, styles.removeImageButton]}
                onPress={() => {
                  setImageActionModalVisible(false);
                  removeProfileImage();
                }}
              >
                <MaterialIcons name="delete" size={24} color="#FF3B30" />
                <Text style={[styles.imageActionText, { color: '#FF3B30' }]}>Remove Photo</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setImageActionModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen; 
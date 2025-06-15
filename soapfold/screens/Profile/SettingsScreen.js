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
import { auth, firestore } from '../../config/firebase';
import { theme } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from '../../utils/imageUpload';
import GoogleSignin from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { doc, updateDoc, getDoc } from '@react-native-firebase/firestore';

const SettingsScreen = ({ navigation }) => {
  const { theme: activeTheme, toggleDarkMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [modalAnimation] = useState(new Animated.Value(0));
  const [deleteModalAnimation] = useState(new Animated.Value(0));
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (user) {
        // 1. Update Firestore user status
        try {
          const userRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists) {
            await updateDoc(userRef, {
              lastLogout: new Date().toISOString(),
              isOnline: false
            });
          }
        } catch (firestoreError) {
          console.warn('[Auth] Firestore update failed:', firestoreError);
        }

        // 2. Handle provider-specific sign out
        const providers = user.providerData;
        for (const provider of providers) {
          switch (provider.providerId) {
            case 'google.com':
              try {
                await GoogleSignin.signOut();
                console.log('[Auth] Google sign out successful');
              } catch (googleError) {
                console.warn('[Auth] Google sign out error:', googleError);
              }
              break;
            
            case 'phone':
              // Phone auth doesn't require special cleanup
              console.log('[Auth] Phone auth cleanup completed');
              break;
            
            case 'password':
              // Email auth doesn't require special cleanup
              console.log('[Auth] Email auth cleanup completed');
              break;
          }
        }

        // 3. Sign out from Firebase
        await auth.signOut();
        console.log('[Auth] Firebase sign out successful');

        // 4. Clear local storage
        await AsyncStorage.multiRemove([
          '@user_data',
          '@auth_token',
          '@onboarding_complete',
          '@user_profile',
          '@user_settings',
          '@has_seen_onboarding'
        ]);

        // Use the root navigation
        navigation.getParent()?.reset({
          index: 0,
          routes: [
            { 
              name: 'SignIn',
              params: {
                fromSignOut: true
              }
            }
          ],
        });
      }
    } catch (error) {
      console.error('[Auth] Error signing out:', error);
      Alert.alert(
        'Error',
        'Failed to sign out. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setShowSignOutModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoadingMessage('Deleting your account...');
      const user = auth.currentUser;
      
      if (user) {
        // Delete user from Firestore first
        await user.delete();
        // Auth state listener in App.js will handle navigation
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setLoadingMessage('');
      setShowDeleteModal(false);
    }
  };

  const handleUpdateProfile = async (updates) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        await updateDoc(userRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        await fetchUserData(); // Refresh user data
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: activeTheme.colors.background,
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
      borderBottomColor: activeTheme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: activeTheme.colors.text,
    },
    scrollView: {
      flex: 1,
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
      color: activeTheme.colors.lightText,
    },
    sectionContent: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: activeTheme.colors.cardBackground,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: activeTheme.colors.border,
    },
    settingItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingItemText: {
      fontSize: 16,
      marginLeft: 12,
      color: activeTheme.colors.text,
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
      backgroundColor: activeTheme.colors.cardBackground,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
      color: activeTheme.colors.text,
    },
    modalText: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
      color: activeTheme.colors.text,
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
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: activeTheme.colors.border,
    },
    confirmButton: {
      backgroundColor: activeTheme.colors.primary,
    },
    deleteButton: {
      backgroundColor: '#FF3B30',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      color: '#FFFFFF',
    },
    cancelButtonText: {
      color: activeTheme.colors.text,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={activeTheme.colors.primary} />
          {loadingMessage && (
            <Text style={[styles.modalText, { marginTop: 16 }]}>
              {loadingMessage}
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const renderSettingItem = (icon, title, onPress, showArrow = true, rightComponent = null) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={24} color={activeTheme.colors.icon} />
        <Text style={styles.settingItemText}>{title}</Text>
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={24} color={activeTheme.colors.icon} />
      ))}
    </TouchableOpacity>
  );

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSection('Account', (
          <>
            {renderSettingItem('person-outline', 'Edit Profile', () => navigation.navigate('EditProfile'))}
            {renderSettingItem('lock-closed-outline', 'Change Password', () => navigation.navigate('ChangePassword'))}
          </>
        ))}
        {renderSection('Support', (
          <>
            {renderSettingItem('help-circle-outline', 'Help Center', () => navigation.navigate('HelpCenter'))}
            {renderSettingItem('information-circle-outline', 'About', () => navigation.navigate('About'))}
            {renderSettingItem('mail-outline', 'Send Feedback', () => navigation.navigate('SendFeedback'))}
          </>
        ))}
        {renderSection('Login', (
          <>
            {renderSettingItem('log-out-outline', 'Sign Out', () => setShowSignOutModal(true))}
            {renderSettingItem('trash-outline', 'Delete Account', () => setShowDeleteModal(true))}
          </>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalText}>
              Are you sure you want to sign out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSignOut}
              >
                <Text style={styles.buttonText}>Sign Out</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen; 
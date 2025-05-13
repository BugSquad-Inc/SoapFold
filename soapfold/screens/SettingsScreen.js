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
import { auth, getUserFromFirestore, updateUserInFirestore } from '../config/firebase';
import { signOut, updateProfile, deleteUser } from 'firebase/auth';
import { theme } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from '../utils/imageUpload';

const SettingsScreen = ({ navigation }) => {
  const { theme: activeTheme, toggleDarkMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageActions, setShowImageActions] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [modalAnimation] = useState(new Animated.Value(0));
  const [deleteModalAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const firestoreUserData = await getUserFromFirestore(user.uid);
        if (firestoreUserData) {
          setUserData(firestoreUserData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Auth state listener in App.js will handle navigation
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoadingMessage('Deleting your account...');
      const user = auth.currentUser;
      
      if (user) {
        // Delete user from Firestore first
        await deleteUser(user);
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
        await updateUserInFirestore(user.uid, updates);
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
            {renderSettingItem('log-out-outline', 'Sign Out', () => setShowDeleteModal(true))}
            {renderSettingItem('trash-outline', 'Delete Account', () => setShowDeleteModal(true))}
          </>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>

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
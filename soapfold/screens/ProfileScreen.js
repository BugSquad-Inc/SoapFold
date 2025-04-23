import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadToCloudinary } from '../utils/imageUpload';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localImageUri, setLocalImageUri] = useState(null);
  
  // Editable fields
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Try to get cached user data first
          try {
            const cachedUserData = await AsyncStorage.getItem('@userData');
            if (cachedUserData) {
              const userData = JSON.parse(cachedUserData);
              setUser(userData);
              setDisplayName(userData.displayName || '');
              setLocation(userData.location || '');
              setLocalImageUri(userData.photoURL || null);
              console.log('Using cached user data in profile');
            }
          } catch (cacheError) {
            console.log('No cached user data available in profile');
          }
          
          // Then fetch from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            setDisplayName(userData.displayName || '');
            setLocation(userData.location || '');
            setLocalImageUri(userData.photoURL || null);
            
            // Update cache
            await AsyncStorage.setItem('@userData', JSON.stringify(userData));
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
    
    // Request permissions on component mount
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera and photo library permissions to make this work!');
        }
      }
    })();
  }, []);

  const handleImageSelection = () => {
    if (!editing) return;
    
    // Check if cloudinary is configured properly
    import('../config/cloudinary').then((module) => {
      const cloudinaryConfig = module.default;
      
      if (cloudinaryConfig.cloudName === 'YOUR_CLOUD_NAME_HERE' || 
          cloudinaryConfig.uploadPreset === 'YOUR_UPLOAD_PRESET_HERE') {
        Alert.alert(
          'Cloudinary Setup Required',
          'Please configure your Cloudinary settings in config/cloudinary.js:\n\n' +
          '1. Create a free account at cloudinary.com\n' +
          '2. Create an upload preset in Settings > Upload\n' +
          '3. Update cloudName, uploadPreset and apiUrl with your details',
          [{ text: 'OK' }]
        );
        return;
      }
      
      Alert.alert(
        'Change Profile Photo',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: takePhoto,
          },
          {
            text: 'Choose from Library',
            onPress: pickImage,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    });
  };
  
  const takePhoto = async () => {
    try {
      // Use string value 'images' directly instead of MediaType.Images
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      // Handle both the new and old API response format
      if (!result.canceled) {
        if (result.assets && result.assets[0]) {
          setLocalImageUri(result.assets[0].uri);
        } else if (result.uri) {
          // For backward compatibility with older Expo versions
          setLocalImageUri(result.uri);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };
  
  const pickImage = async () => {
    try {
      // Use string value 'images' directly instead of MediaType.Images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      // Handle both the new and old API response format
      if (!result.canceled) {
        if (result.assets && result.assets[0]) {
          setLocalImageUri(result.assets[0].uri);
        } else if (result.uri) {
          // For backward compatibility with older Expo versions
          setLocalImageUri(result.uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  const uploadImage = async (uri) => {
    if (!uri) return null;
    
    try {
      setUploadingImage(true);
      console.log('Starting image upload process using Cloudinary');
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No authenticated user found when trying to upload image');
        setUploadingImage(false);
        return null;
      }
      
      // Define folder with user ID for organization
      const folder = `users/${currentUser.uid}`;
      
      // Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(uri, folder);
      
      if (!imageUrl) {
        throw new Error('Failed to get image URL from Cloudinary');
      }
      
      console.log('Image upload complete:', imageUrl);
      setUploadingImage(false);
      return imageUrl;
    } catch (error) {
      console.error('Error in image upload:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload image. Please try again.');
      setUploadingImage(false);
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Define photoURL with a default value of current photoURL or null
        let photoURL = user?.photoURL || null;
        
        // Upload new image if changed
        if (localImageUri && localImageUri !== user?.photoURL) {
          try {
            const uploadedImageUrl = await uploadImage(localImageUri);
            if (uploadedImageUrl) {
              photoURL = uploadedImageUrl;
            }
          } catch (uploadError) {
            console.error('Error during image upload:', uploadError);
            // Continue with the update but without changing the photo
          }
        }
        
        // Update auth profile with safe values
        await updateProfile(currentUser, {
          displayName: displayName,
          ...(photoURL && { photoURL })
        });
        
        // Create updated user data without undefined fields
        const updatedUserData = {
          displayName: displayName,
          location: location || '',
          updatedAt: new Date().toISOString(),
        };
        
        // Only add photoURL if it exists
        if (photoURL) {
          updatedUserData.photoURL = photoURL;
        }
        
        console.log('Updating user doc with data:', updatedUserData);
        
        // Update Firestore
        await updateDoc(doc(db, 'users', currentUser.uid), updatedUserData);
        
        // Update local state
        const newUserData = {
          ...user,
          ...updatedUserData
        };
        
        setUser(newUserData);
        
        // Update cache
        await AsyncStorage.setItem('@userData', JSON.stringify(newUserData));
        
        Alert.alert('Success', 'Profile updated successfully');
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear user data from AsyncStorage, but keep onboarding status
      const keys = ['@userData', '@user', '@authUser', '@userToken'];
      console.log('Removing keys from AsyncStorage:', keys);
      
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      console.log('AsyncStorage items removed (keeping @hasSeenOnboarding)');
      
      // Then sign out from Firebase
      if (auth) {
        console.log('Signing out from Firebase Auth');
        await signOut(auth);
        console.log('Firebase Auth sign out successful');
      } else {
        console.error('Auth object is undefined or null, cannot sign out');
      }
      
      console.log('User signed out and local storage cleared');
      
      // The auth state listener in App.js will handle navigation automatically
      // No need to navigate here as the auth state change will trigger App.js to show the Auth stack
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: handleLogout,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

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
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFCA28" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (editing) {
                Alert.alert(
                  'Discard Changes',
                  'Are you sure you want to discard your changes?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Discard', onPress: () => {
                      setEditing(false);
                      setDisplayName(user?.displayName || '');
                      setLocation(user?.location || '');
                      setLocalImageUri(user?.photoURL || null);
                      navigation.goBack();
                    }}
                  ]
                );
              } else {
                navigation.goBack();
              }
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Profile</Text>
          
          {editing ? (
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveProfile}
              disabled={saving || uploadingImage}
            >
              {saving || uploadingImage ? (
                <ActivityIndicator size="small" color="#FFCA28" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setEditing(true)}
            >
              <MaterialIcons name="edit" size={20} color="#FFCA28" />
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileSection}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleImageSelection}
              disabled={!editing}
            >
              {localImageUri ? (
                <Image 
                  source={{ uri: localImageUri }} 
                  style={styles.avatar}
                  onError={() => {
                    console.log('Error loading profile image');
                    setLocalImageUri(null);
                  }}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getUserInitials()}</Text>
                </View>
              )}
              
              {editing && (
                <View style={styles.editImageButton}>
                  <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.infoContainer}>
              {editing ? (
                <TextInput
                  style={styles.nameInput}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.nameText}>{user?.displayName || 'User'}</Text>
              )}
              <Text style={styles.emailText}>{user?.email || ''}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>{user?.email || 'Not provided'}</Text>
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Location</Text>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Enter your location"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.fieldValue}>{user?.location || 'Not provided'}</Text>
              )}
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Member Since</Text>
              <Text style={styles.fieldValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={confirmLogout}
          >
            <MaterialIcons name="logout" size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidContainer: {
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 202, 40, 0.2)',
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFCA28',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFCA28',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFCA28',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFCA28',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoContainer: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFCA28',
    minWidth: 200,
  },
  emailText: {
    fontSize: 14,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 20,
  },
  detailsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  fieldInput: {
    fontSize: 16,
    color: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFCA28',
    paddingVertical: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default ProfileScreen; 
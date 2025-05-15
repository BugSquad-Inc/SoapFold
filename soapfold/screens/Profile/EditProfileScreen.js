import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { auth, saveUserDataToLocalStorage } from '../../config/firebase';
import { updateProfile } from 'firebase/auth';
import { useTheme } from '../../utils/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from '../../utils/imageUpload';

// Sample countries data
const countries = [
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  // Add more countries as needed
];

const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

const EditProfileScreen = ({ navigation, route }) => {
  const { theme: activeTheme, isDarkMode } = useTheme();
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [showImageActionModal, setShowImageActionModal] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFullName(user.displayName || '');
      setEmail(user.email || '');
      if (user.displayName) {
        const names = user.displayName.split(' ');
        setFirstName(names[0] || '');
      }
      setUsername(user.reloadUserInfo?.screenName || '');
      setUser(user);
    }
  }, []);

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    setLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: fullName,
        photoURL: user?.photoURL || null
      });

      // Update local user data
      const updatedUser = {
        ...user,
        displayName: fullName,
        photoURL: user?.photoURL || null
      };
      await saveUserDataToLocalStorage(updatedUser);
      setUser(updatedUser);

      // Notify other screens of the update
      navigation.navigate('Settings', { userUpdated: true });
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
    setLoading(false);
  };

  const handleProfileImagePress = async () => {
    setShowImageActionModal(true);
  };

  const handleTakePhoto = async () => {
    setShowImageActionModal(false);
    try {
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
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChooseFromLibrary = async () => {
    setShowImageActionModal(false);
    try {
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
        await handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error choosing image:', error);
      Alert.alert('Error', 'Failed to choose image. Please try again.');
    }
  };

  const handleRemovePhoto = async () => {
    setShowImageActionModal(false);
    try {
      setLoading(true);
      // Update Firebase Auth profile only
      await updateProfile(auth.currentUser, {
        photoURL: null
      });
      // Update local state
      const updatedUser = { ...user, photoURL: null };
      setUser(updatedUser);
      Alert.alert('Success', 'Profile image removed successfully');
    } catch (error) {
      console.error('Error removing photo:', error);
      Alert.alert('Error', 'Failed to remove photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (uri) => {
    try {
      setLoading(true);
      const photoURL = await uploadToCloudinary(uri);
      if (photoURL) {
        // Update Firebase Auth profile only
        await updateProfile(auth.currentUser, {
          photoURL: photoURL
        });
        // Update local state
        const updatedUser = { ...user, photoURL };
        setUser(updatedUser);
        Alert.alert('Success', 'Profile image updated successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPickerInput = (label, value, onPress, placeholder) => (
    <TouchableOpacity onPress={onPress} style={styles.inputContainer}>
      <Text style={[styles.label, { color: activeTheme.colors.text }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: activeTheme.colors.cardBackground }]}>
        <Text style={[styles.pickerText, { color: value ? activeTheme.colors.text : activeTheme.colors.lightText }]}>
          {value || placeholder}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={24} color={activeTheme.colors.text} />
      </View>
    </TouchableOpacity>
  );

  const renderPicker = (visible, onClose, data, onSelect, title) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.pickerContainer, { backgroundColor: activeTheme.colors.cardBackground }]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: activeTheme.colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={activeTheme.colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => (typeof item === 'string' ? item : item.code)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => {
                  onSelect(typeof item === 'string' ? item : item.name);
                  onClose();
                }}
              >
                <Text style={[styles.pickerItemText, { color: activeTheme.colors.text }]}>
                  {typeof item === 'string' ? item : item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              navigation.goBack();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={26} color={isDarkMode ? '#fff' : '#243D6E'} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.editHeader, { color: activeTheme.colors.text }]}>Edit Profile</Text>
          </View>
          <View style={styles.backButton} />
        </View>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ padding: 16, paddingBottom: 220, alignItems: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.avatarEditContainer, { marginTop: -24 }]}>
            {user?.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={[
                  styles.avatarEditImage,
                  {
                    borderColor: isDarkMode ? '#fff' : '#000',
                    backgroundColor: isDarkMode ? '#222' : '#fff',
                    width: 120,
                    height: 120,
                  },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.avatarEditPlaceholder,
                  {
                    borderColor: isDarkMode ? '#fff' : '#000',
                    backgroundColor: isDarkMode ? '#222' : '#fff',
                    width: 120,
                    height: 120,
                  },
                ]}
              >
                <Text style={[styles.avatarEditText, { color: isDarkMode ? '#fff' : '#222', fontSize: 44 }]}>{user?.displayName ? user.displayName[0] : '?'}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.avatarEditIcon,
                {
                  backgroundColor: isDarkMode ? '#fff' : '#000',
                  right: -8,
                  bottom: -8,
                },
              ]}
              onPress={handleProfileImagePress}
            >
              <MaterialIcons name="edit" size={24} color={isDarkMode ? '#000' : '#fff'} />
            </TouchableOpacity>
          </View>
          <View style={[styles.cardField, { backgroundColor: isDarkMode ? '#181A20' : '#fff', borderColor: isDarkMode ? '#222' : '#eee' }]}> 
            <Text style={[styles.fieldLabel, { color: isDarkMode ? '#bbb' : '#888' }]}>Name</Text>
            <View style={styles.fieldRow}>
              <TextInput
                style={[styles.fieldInput, { color: activeTheme.colors.text }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your name"
                placeholderTextColor={activeTheme.colors.lightText}
              />
              <MaterialIcons name="edit" size={18} color="#243D6E" style={styles.fieldEditIcon} />
            </View>
          </View>
          <View style={[styles.cardField, { backgroundColor: isDarkMode ? '#181A20' : '#fff', borderColor: isDarkMode ? '#222' : '#eee' }]}> 
            <Text style={[styles.fieldLabel, { color: isDarkMode ? '#bbb' : '#888' }]}>Username</Text>
            <View style={styles.fieldRow}>
              <TextInput
                style={[styles.fieldInput, { color: activeTheme.colors.text }]}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={activeTheme.colors.lightText}
              />
              <MaterialIcons name="edit" size={18} color="#243D6E" style={styles.fieldEditIcon} />
            </View>
          </View>
          <View style={[styles.cardField, { backgroundColor: isDarkMode ? '#181A20' : '#fff', borderColor: isDarkMode ? '#222' : '#eee' }]}> 
            <Text style={[styles.fieldLabel, { color: isDarkMode ? '#bbb' : '#888' }]}>Email</Text>
            <View style={styles.fieldRow}>
              <TextInput
                style={[styles.fieldInput, { color: activeTheme.colors.text }]}
                value={email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor={activeTheme.colors.lightText}
              />
              <MaterialIcons name="content-copy" size={18} color="#243D6E" style={styles.fieldEditIcon} />
            </View>
          </View>
          <View style={[styles.cardField, { backgroundColor: isDarkMode ? '#181A20' : '#fff', borderColor: isDarkMode ? '#222' : '#eee' }]}> 
            <Text style={[styles.fieldLabel, { color: isDarkMode ? '#bbb' : '#888' }]}>Phone</Text>
            <View style={styles.fieldRow}>
              <TextInput
                style={[styles.fieldInput, { color: activeTheme.colors.text }]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Phone number"
                placeholderTextColor={activeTheme.colors.lightText}
              />
              <MaterialIcons name="edit" size={18} color="#243D6E" style={styles.fieldEditIcon} />
            </View>
          </View>
          <View style={[styles.cardField, { backgroundColor: isDarkMode ? '#181A20' : '#fff', borderColor: isDarkMode ? '#222' : '#eee' }]}> 
            <Text style={[styles.fieldLabel, { color: isDarkMode ? '#bbb' : '#888' }]}>Date of Birth</Text>
            <View style={styles.fieldRow}>
              <TextInput
                style={[styles.fieldInput, { color: activeTheme.colors.text }]}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={activeTheme.colors.lightText}
              />
              <MaterialIcons name="edit" size={18} color="#243D6E" style={styles.fieldEditIcon} />
            </View>
          </View>
          <View style={[styles.cardField, { backgroundColor: isDarkMode ? '#181A20' : '#fff', borderColor: isDarkMode ? '#222' : '#eee' }]}> 
            <Text style={[styles.fieldLabel, { color: isDarkMode ? '#bbb' : '#888' }]}>Gender</Text>
            <View style={styles.fieldRow}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowGenderPicker(true)}>
                <Text style={[styles.fieldInput, { color: activeTheme.colors.text }]}>{gender}</Text>
              </TouchableOpacity>
              <MaterialIcons name="edit" size={18} color="#243D6E" style={styles.fieldEditIcon} />
            </View>
          </View>
          <View style={[styles.cardField, { backgroundColor: isDarkMode ? '#181A20' : '#fff', borderColor: isDarkMode ? '#222' : '#eee' }]}> 
            <Text style={[styles.fieldLabel, { color: isDarkMode ? '#bbb' : '#888' }]}>Address</Text>
            <View style={styles.fieldRow}>
              <TextInput
                style={[styles.fieldInput, { color: activeTheme.colors.text }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Address"
                placeholderTextColor={activeTheme.colors.lightText}
              />
              <MaterialIcons name="edit" size={18} color="#243D6E" style={styles.fieldEditIcon} />
            </View>
          </View>
        </ScrollView>
        <View style={[styles.bottomContainer, { backgroundColor: activeTheme.colors.background, position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10, paddingBottom: 48 }]}> 
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: '#243D6E', shadowColor: activeTheme.colors.shadow || '#000', marginBottom: 18 }]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={[styles.updateButtonText, { color: isDarkMode ? '#000' : '#FFFFFF' }]}>Update</Text>
          </TouchableOpacity>
        </View>
        {renderPicker(
          showGenderPicker,
          () => setShowGenderPicker(false),
          genders,
          setGender,
          'Select Gender'
        )}

        {/* Image Action Modal */}
        <Modal
          visible={showImageActionModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowImageActionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: activeTheme.colors.cardBackground }]}>
              <TouchableOpacity 
                style={styles.imageActionButton}
                onPress={handleTakePhoto}
              >
                <MaterialIcons name="camera-alt" size={24} color={activeTheme.colors.text} />
                <Text style={[styles.imageActionText, { color: activeTheme.colors.text }]}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.imageActionButton}
                onPress={handleChooseFromLibrary}
              >
                <MaterialIcons name="photo-library" size={24} color={activeTheme.colors.text} />
                <Text style={[styles.imageActionText, { color: activeTheme.colors.text }]}>Choose from Library</Text>
              </TouchableOpacity>
              
              {user?.photoURL && (
                <TouchableOpacity 
                  style={[styles.imageActionButton, styles.removeImageButton]}
                  onPress={handleRemovePhoto}
                >
                  <MaterialIcons name="delete" size={24} color="#FF3B30" />
                  <Text style={[styles.imageActionText, { color: '#FF3B30' }]}>Remove Photo</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowImageActionModal(false)}
              >
                <Text style={[styles.buttonText, { color: activeTheme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  editHeader: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditContainer: {
    alignSelf: 'center',
    marginBottom: 28,
    marginTop: 8,
    position: 'relative',
  },
  avatarEditImage: {
    width: 92,
    height: 92,
    borderRadius: 18,
    borderWidth: 3,
  },
  avatarEditPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  avatarEditText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  avatarEditIcon: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  cardField: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#888',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#222',
  },
  fieldEditIcon: {
    marginLeft: 8,
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 32,
  },
  updateButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#243D6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  pickerItemText: {
    fontSize: 16,
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
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
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#243D6E',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginTop: 24,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EditProfileScreen; 
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import { auth } from '../../config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@react-native-firebase/auth';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      Alert.alert(
        'Success',
        'Password updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: theme.colors.text }]}>Change Password</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Current Password</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.cardBackground }]}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor={theme.colors.lightText}
          secureTextEntry
        />
        <Text style={[styles.label, { color: theme.colors.text }]}>New Password</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.cardBackground }]}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor={theme.colors.lightText}
          secureTextEntry
        />
        <Text style={[styles.label, { color: theme.colors.text }]}>Confirm New Password</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.cardBackground }]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor={theme.colors.lightText}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleChangePassword} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  form: { marginTop: 16 },
  label: { fontSize: 15, fontWeight: '500', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#243D6E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChangePasswordScreen; 
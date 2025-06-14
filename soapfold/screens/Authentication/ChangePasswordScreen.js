import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';

const ChangePasswordScreen = ({ navigation }) => {
  const { theme: activeTheme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const user = auth().currentUser;
      const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);
      Alert.alert('Success', 'Password updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}> 
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={activeTheme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: activeTheme.colors.text }]}>Change Password</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.form}>
        <Text style={[styles.label, { color: activeTheme.colors.text }]}>Current Password</Text>
        <TextInput
          style={[styles.input, { color: activeTheme.colors.text, backgroundColor: activeTheme.colors.cardBackground }]}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor={activeTheme.colors.lightText}
          secureTextEntry
        />
        <Text style={[styles.label, { color: activeTheme.colors.text }]}>New Password</Text>
        <TextInput
          style={[styles.input, { color: activeTheme.colors.text, backgroundColor: activeTheme.colors.cardBackground }]}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor={activeTheme.colors.lightText}
          secureTextEntry
        />
        <Text style={[styles.label, { color: activeTheme.colors.text }]}>Confirm New Password</Text>
        <TextInput
          style={[styles.input, { color: activeTheme.colors.text, backgroundColor: activeTheme.colors.cardBackground }]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor={activeTheme.colors.lightText}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: activeTheme.colors.primary }]} onPress={handleChangePassword} disabled={loading}>
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
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { getCustomerProfile } from '../../config/firestore';

const MenuBar = () => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const profile = await getCustomerProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Starting logout process from MenuBar...');
      await signOut(auth);
      console.log('User signed out from MenuBar');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      
      {userProfile && (
        <View style={styles.profileSection}>
          <Text style={styles.profileName}>{userProfile.name}</Text>
          <Text style={styles.profileEmail}>{userProfile.email}</Text>
          {userProfile.phone && (
            <Text style={styles.profilePhone}>{userProfile.phone}</Text>
          )}
        </View>
      )}

      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('ProfileScreen')}
      >
        <Text style={styles.menuItemText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('AddressBookScreen')}
      >
        <Text style={styles.menuItemText}>Address Book</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('SettingsScreen')}
      >
        <Text style={styles.menuItemText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MenuBar;

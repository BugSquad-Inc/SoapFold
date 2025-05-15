import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../utils/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = ({ navigation }) => {
  const { theme: activeTheme } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}> 
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={activeTheme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: activeTheme.colors.text }]}>About</Text>
        <View style={{ width: 32 }} />
      </View>
      <Text style={[styles.text, { color: activeTheme.colors.text }]}>SoapFold is your trusted laundry partner. We provide fast, reliable, and eco-friendly laundry and dry cleaning services. Our mission is to make laundry day effortless for everyone. Version 1.0.0</Text>
      <Text style={[styles.text, { color: activeTheme.colors.text, marginTop: 18 }]}>Contact us: support@soapfold.com</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { padding: 4, marginRight: 8 },
  header: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  text: { fontSize: 16 },
});

export default AboutScreen; 
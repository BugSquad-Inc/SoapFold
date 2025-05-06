import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const HelpCenterScreen = ({ navigation }) => {
  const { theme: activeTheme } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.colors.background }]}> 
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={activeTheme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: activeTheme.colors.text }]}>Help Center</Text>
        <View style={styles.faqBlock}>
          <Text style={[styles.faqQ, { color: activeTheme.colors.primary }]}>Q: How do I book a laundry service?</Text>
          <Text style={[styles.faqA, { color: activeTheme.colors.text }]}>A: Go to the Home screen, select your service, and follow the booking steps.</Text>
          <Text style={[styles.faqQ, { color: activeTheme.colors.primary }]}>Q: How do I change my profile details?</Text>
          <Text style={[styles.faqA, { color: activeTheme.colors.text }]}>A: Tap your profile in Settings, then tap Edit Profile to update your info.</Text>
          <Text style={[styles.faqQ, { color: activeTheme.colors.primary }]}>Q: How do I contact support?</Text>
          <Text style={[styles.faqA, { color: activeTheme.colors.text }]}>A: Use the Send Feedback option in Settings or email us at support@soapfold.com.</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>
      <Text style={[styles.text, { color: activeTheme.colors.text }]}>How can we help you? (Coming soon)</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { padding: 4, marginRight: 8 },
  header: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  text: { fontSize: 16 },
  faqBlock: { marginTop: 12 },
  faqQ: { fontWeight: 'bold', marginTop: 16, fontSize: 16 },
  faqA: { marginTop: 4, fontSize: 15, marginBottom: 8 },
});

export default HelpCenterScreen; 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../utils/ThemeContext';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const mockNotifications = [
  {
    id: '1',
    title: 'Payment Successful!',
    subtitle: 'You have made a services payment',
    icon: 'check-circle',
    color: '#7B61FF',
    date: 'Today',
  },
  {
    id: '2',
    title: 'New Category Services!',
    subtitle: 'Now the plumbing service is available',
    icon: 'grid',
    color: '#FF4D67',
    date: 'Today',
  },
  {
    id: '3',
    title: "Today's Special Offers",
    subtitle: 'You got a special promo today!',
    icon: 'star',
    color: '#FFD600',
    date: 'Yesterday',
  },
  {
    id: '4',
    title: 'Credit Card Connected!',
    subtitle: 'Credit Card has been linked',
    icon: 'credit-card',
    color: '#7B61FF',
    date: 'December 22, 2024',
  },
  {
    id: '5',
    title: 'Account Setup Successful!',
    subtitle: 'Your account has been created',
    icon: 'check-circle',
    color: '#00C48C',
    date: 'December 22, 2024',
  },
];

const groupByDate = (notifications) => {
  const groups = {};
  notifications.forEach((notif) => {
    if (!groups[notif.date]) groups[notif.date] = [];
    groups[notif.date].push(notif);
  });
  return groups;
};

const NotificationScreen = ({ navigation }) => {
  const { theme: activeTheme } = useTheme();
  const grouped = groupByDate(mockNotifications);
  const dateSections = Object.keys(grouped);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F5F1FF' }]}> 
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Notification</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {dateSections.map((date) => (
          <View key={date}>
            <Text style={styles.sectionTitle}>{date}</Text>
            {grouped[date].map((notif) => (
              <View key={notif.id} style={styles.card}>
                <View style={[styles.iconCircle, { backgroundColor: notif.color }]}> 
                  <Feather name={notif.icon} size={22} color="#fff" />
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.titleText}>{notif.title}</Text>
                  <Text style={styles.subtitleText}>{notif.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0, backgroundColor: '#F5F1FF' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 18, backgroundColor: 'transparent' },
  backButton: { padding: 4, marginRight: 8 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#222', flex: 1, textAlign: 'center' },
  sectionTitle: { color: '#222', fontWeight: 'bold', fontSize: 16, marginTop: 24, marginBottom: 10, marginLeft: 18 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 16, marginBottom: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textBlock: { flex: 1 },
  titleText: { color: '#222', fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  subtitleText: { color: '#888', fontSize: 13 },
});

export default NotificationScreen;

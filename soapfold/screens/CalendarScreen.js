import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.helloText}>Hello 👋</Text>
          <Text style={styles.nameText}>Sarah Wilson</Text>
        </View>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
          style={styles.avatar}
        />
      </View>

      <Text style={styles.title}>Your Laundry Calendar</Text>

      {/* Calendar */}
      <View style={styles.card}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#ffc93c',
              dotColor: '#ff9f1c',
              marked: true
            }
          }}
          theme={{
            backgroundColor: '#fff',
            calendarBackground: '#fff',
            todayTextColor: '#ff9f1c',
            selectedDayTextColor: '#000',
            arrowColor: '#ff9f1c',
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textMonthFontSize: 18,
            textDayFontSize: 16,
            selectedDayBackgroundColor: '#ffc93c',
          }}
        />
      </View>

      {/* CTA */}
      {selectedDate !== '' && (
        <LinearGradient
          colors={['#ff9f1c', '#ffc93c']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity>
            <Text style={styles.buttonText}>
              Book Pickup for {selectedDate}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30
  },
  helloText: {
    fontSize: 16,
    color: '#444'
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000'
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333'
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 10,
    elevation: 4,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 30
  },
  button: {
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16
  }
});

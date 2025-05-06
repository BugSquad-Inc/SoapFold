import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar
} from 'react-native';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import ScreenContainer from '../components/ScreenContainer';

// Service category grid component
const AllServicesScreen = ({ navigation }) => {
  // Define service categories
  const serviceCategories = [
    { id: '1', name: 'Cleaning', icon: 'cleaning-services', color: '#8E44AD' },
    { id: '2', name: 'Repairing', icon: 'build', color: '#F39C12' },
    { id: '3', name: 'Painting', icon: 'format-paint', color: '#3498DB' },
    { id: '4', name: 'Laundry', icon: 'local-laundry-service', color: '#1ABC9C' },
    { id: '5', name: 'Appliance', icon: 'kitchen', color: '#E74C3C' },
    { id: '6', name: 'Plumbing', icon: 'plumbing', color: '#2ECC71' },
    { id: '7', name: 'Shifting', icon: 'luggage', color: '#9B59B6' },
    { id: '8', name: 'Beauty', icon: 'spa', color: '#E91E63' },
    { id: '9', name: 'AC Repair', icon: 'ac-unit', color: '#00BCD4' },
    { id: '10', name: 'Vehicle', icon: 'directions-car', color: '#607D8B' },
    { id: '11', name: 'Electronics', icon: 'devices', color: '#795548' },
    { id: '12', name: 'Massage', icon: 'spa', color: '#FF5722' },
    { id: '13', name: "Men's Salon", icon: 'content-cut', color: '#4CAF50' }
  ];

  // Render each category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => navigation.navigate('ServiceCategoryScreen', { category: item.name })}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <MaterialIcons name={item.icon} size={24} color="#FFF" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Services</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Feather name="search" size={22} color="#000" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={serviceCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          numColumns={4}
          contentContainerStyle={styles.categoriesContainer}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    backgroundColor: '#243D6E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  searchButton: {
    padding: 8,
  },
  categoriesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  }
});

export default AllServicesScreen; 
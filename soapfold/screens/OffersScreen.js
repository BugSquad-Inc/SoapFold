import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { theme, getTextStyle } from '../utils/theme';

const OffersScreen = ({ navigation }) => {
  // Sample data for all active promotions
  const promotions = [
    {
      id: '1',
      title: 'UP TO',
      subtitle: '50% OFF',
      description: 'Dry cleaning services',
      backgroundColor: '#000000',
      accentColor: '#FF3B30',
      buttonText: 'Redeem Now',
      iconName: 'arrow-right-circle',
      image: require('../assets/images/ironing.jpg'),
      validity: 'Valid until Dec 31, 2023'
    },
    {
      id: '2',
      title: 'UP TO',
      subtitle: '40% OFF',
      description: 'Wash & fold services',
      backgroundColor: '#000000',
      accentColor: '#007AFF',
      buttonText: 'Redeem Now',
      iconName: 'arrow-right-circle',
      image: require('../assets/images/laundry.jpg'),
      validity: 'Valid until Nov 15, 2023'
    },
    {
      id: '3',
      title: 'FLAT',
      subtitle: '25% OFF',
      description: 'First order ironing service',
      backgroundColor: '#222222',
      accentColor: '#5AC8FA',
      buttonText: 'Redeem Now',
      iconName: 'arrow-right-circle',
      image: require('../assets/images/ironing.jpg'),
      validity: 'Valid until Oct 31, 2023'
    },
    {
      id: '4',
      title: 'EXTRA',
      subtitle: '15% OFF',
      description: 'Weekend orders only',
      backgroundColor: '#222222',
      accentColor: '#FFCC00',
      buttonText: 'Redeem Now',
      iconName: 'arrow-right-circle',
      image: require('../assets/images/laundry.jpg'),
      validity: 'Valid on weekends'
    },
    {
      id: '5',
      title: 'GET',
      subtitle: '₹100 OFF',
      description: 'Orders above ₹500',
      backgroundColor: '#222222',
      accentColor: '#4CD964',
      buttonText: 'Redeem Now',
      iconName: 'arrow-right-circle',
      image: require('../assets/images/ironing.jpg'),
      validity: 'Valid for 1 month'
    },
    {
      id: '6',
      title: 'NEW USER',
      subtitle: '30% OFF',
      description: 'First time customers only',
      backgroundColor: '#000000',
      accentColor: '#FF9500',
      buttonText: 'Redeem Now',
      iconName: 'arrow-right-circle',
      image: require('../assets/images/laundry.jpg'),
      validity: 'Valid for new users'
    }
  ];

  const handlePromotionSelect = (promotion) => {
    navigation.navigate('RedeemScreen', { promotion });
  };

  const renderPromotionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.promotionCard}
      onPress={() => handlePromotionSelect(item)}
    >
      <View style={[styles.promotionHeader, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.promotionTitleContainer}>
          <Text style={styles.promotionTitle}>{item.title}</Text>
          <Text style={[styles.promotionSubtitle, { color: item.accentColor }]}>{item.subtitle}</Text>
          <Text style={styles.promotionDescription}>{item.description}</Text>
        </View>
      </View>
      
      <View style={styles.promotionFooter}>
        <Text style={styles.validityText}>{item.validity}</Text>
        <TouchableOpacity
          style={[styles.redeemButton, { backgroundColor: item.accentColor }]}
          onPress={() => handlePromotionSelect(item)}
        >
          <Text style={styles.redeemButtonText}>Redeem</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Offers</Text>
          <View style={styles.placeholder} />
        </View>
        
        <FlatList
          data={promotions}
          renderItem={renderPromotionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 8,
  },
  promotionCard: {
    width: '94%',
    marginVertical: 8,
    marginHorizontal: '3%',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  promotionHeader: {
    padding: 12,
    height: 120,
  },
  promotionTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  promotionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  promotionSubtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promotionDescription: {
    fontSize: 12,
    color: '#fff',
  },
  promotionFooter: {
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validityText: {
    fontSize: 10,
    color: '#777',
    flex: 1,
  },
  redeemButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  redeemButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

export default OffersScreen; 
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { firestore } from './firebase';

// Utility function to validate date string
const isValidDateString = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.getFullYear() > 1970 && date.getFullYear() < 3000;
};

// Orders Collection
export const ordersCollection = collection(firestore, 'orders');

export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(ordersCollection, {
      ...orderData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(firestore, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getCustomerOrders = async (customerId) => {
  try {
    console.log('Querying orders for customerId:', customerId);
    const q = query(ordersCollection, where('customerId', '==', customerId));
    const querySnapshot = await getDocs(q);
    
    console.log('Orders query snapshot size:', querySnapshot.size);
    
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Processed orders:', orders);
    return orders;
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    throw error;
  }
};

// Payments Collection
export const paymentsCollection = collection(firestore, 'payments');

export const createPayment = async (paymentData) => {
  try {
    const docRef = await addDoc(paymentsCollection, {
      ...paymentData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const paymentRef = doc(firestore, 'payments', paymentId);
    await updateDoc(paymentRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Customers Collection
export const customersCollection = collection(firestore, 'customers');

export const createCustomer = async (customerData) => {
  try {
    const docRef = await addDoc(customersCollection, {
      ...customerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      orders: []
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (customerId, customerData) => {
  try {
    const customerRef = doc(firestore, 'customers', customerId);
    await updateDoc(customerRef, {
      ...customerData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const getCustomerProfile = async (customerId) => {
  try {
    const customerDoc = await getDoc(doc(firestore, 'customers', customerId));
    if (customerDoc.exists) {
      return {
        id: customerDoc.id,
        ...customerDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    throw error;
  }
};

// Offers Collection
export const offersCollection = collection(firestore, 'offers');

export const createOffer = async (offerData) => {
  try {
    const docRef = await addDoc(offersCollection, {
      ...offerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      usedBy: []
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

export const getActiveOffers = async () => {
  try {
    const q = query(offersCollection, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting offers:', error);
    throw error;
  }
};

export const applyOffer = async (offerId, customerId) => {
  try {
    const offerRef = doc(firestore, 'offers', offerId);
    await updateDoc(offerRef, {
      usedBy: serverTimestamp(),
      usageLimit: serverTimestamp()
    });
  } catch (error) {
    console.error('Error applying offer:', error);
    throw error;
  }
};

// Services Collection
export const servicesCollection = collection(firestore, 'services');

export const getServices = async () => {
  try {
    const q = query(servicesCollection, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting services:', error);
    throw error;
  }
};

// Reviews Collection
export const reviewsCollection = collection(firestore, 'reviews');

export const createReview = async (reviewData) => {
  try {
    const docRef = await addDoc(reviewsCollection, {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getOrderReviews = async (orderId) => {
  try {
    const q = query(reviewsCollection, where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching order reviews:', error);
    throw error;
  }
};

// User Management
export const createUserInFirestore = async (userId, userData) => {
  try {
    await firestore.collection('users').doc(userId).set(userData);
    return true;
  } catch (error) {
    console.error('Error creating user in Firestore:', error);
    throw error;
  }
};

export const getUserFromFirestore = async (userId) => {
  try {
    const userDoc = await firestore.collection('users').doc(userId).get();
    return userDoc.exists ? userDoc.data() : null;
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    throw error;
  }
};

export const updateUserInFirestore = async (userId, userData) => {
  try {
    await firestore.collection('users').doc(userId).update(userData);
    return true;
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw error;
  }
};

// Address Management
export const saveAddress = async (userId, addressData) => {
  try {
    const addressesRef = collection(firestore, 'users', userId, 'addresses');
    const docRef = await addDoc(addressesRef, {
      ...addressData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving address:', error);
    throw error;
  }
};

export const getUserAddresses = async (userId) => {
  try {
    const addressesRef = collection(firestore, 'users', userId, 'addresses');
    const q = query(addressesRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting addresses:', error);
    throw error;
  }
}; 
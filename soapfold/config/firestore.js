import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  arrayUnion,
  increment,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Utility function to validate date string
const isValidDateString = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.getFullYear() > 1970 && date.getFullYear() < 3000;
};

// Orders Collection
export const ordersCollection = collection(db, 'orders');

export const createOrder = async (orderData) => {
  try {
    const orderToSave = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending',
    };

    if (isValidDateString(orderData.pickupDateString)) {
      orderToSave.pickupDate = Timestamp.fromDate(new Date(orderData.pickupDateString));
    }
    if (isValidDateString(orderData.deliveryDateString)) {
      orderToSave.deliveryDate = Timestamp.fromDate(new Date(orderData.deliveryDateString));
    }

    const orderRef = await addDoc(ordersCollection, orderToSave);
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
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
    const q = query(
      ordersCollection,
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    console.log('Orders query snapshot size:', snapshot.size);
    
    const orders = snapshot.docs.map(doc => ({
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
export const paymentsCollection = collection(db, 'payments');

export const createPayment = async (paymentData) => {
  try {
    // Validate required fields
    if (!paymentData.orderId || !paymentData.customerId || !paymentData.amount || !paymentData.method) {
      throw new Error('Missing required payment fields');
    }

    const paymentToSave = {
      orderId: paymentData.orderId,
      customerId: paymentData.customerId,
      amount: paymentData.amount,
      status: paymentData.status || 'pending',
      method: paymentData.method,
      transactionId: paymentData.transactionId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const paymentRef = await addDoc(paymentsCollection, paymentToSave);
    return paymentRef.id;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
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
export const customersCollection = collection(db, 'customers');

export const createCustomer = async (customerData) => {
  try {
    const customerRef = await addDoc(customersCollection, {
      ...customerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      orders: []
    });
    return customerRef.id;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (customerId, customerData) => {
  try {
    const customerRef = doc(db, 'customers', customerId);
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
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    if (customerDoc.exists()) {
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
export const offersCollection = collection(db, 'offers');

export const createOffer = async (offerData) => {
  try {
    const offerRef = await addDoc(offersCollection, {
      ...offerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      usedBy: []
    });
    return offerRef.id;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

export const getActiveOffers = async () => {
  try {
    const now = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const q = query(
      offersCollection,
      where('status', '==', true),
      where('endDate', '>', now),
      orderBy('endDate', 'asc')
    );
    
    const snapshot = await getDocs(q);
    const offers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().endDate || null, // Use endDate as expiryDate for UI
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
    }));
    
    console.log('[Firestore] Raw offers data:', JSON.stringify(offers, null, 2));
    offers.forEach((offer, idx) => {
      console.log(`[Firestore] Offer ${idx + 1}:`, offer);
    });
    console.log('[Firestore] Total offers fetched:', offers.length);
    
    return offers;
  } catch (error) {
    console.error('Error fetching active offers:', error);
    throw error;
  }
};

export const applyOffer = async (offerId, customerId) => {
  try {
    const offerRef = doc(db, 'offers', offerId);
    await updateDoc(offerRef, {
      usedBy: arrayUnion(customerId),
      usageLimit: increment(-1)
    });
  } catch (error) {
    console.error('Error applying offer:', error);
    throw error;
  }
};

// Services Collection
export const servicesCollection = collection(db, 'services');

export const getServices = async () => {
  try {
    const snapshot = await getDocs(servicesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Reviews Collection
export const reviewsCollection = collection(db, 'reviews');

export const createReview = async (reviewData) => {
  try {
    const reviewRef = await addDoc(reviewsCollection, {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return reviewRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getOrderReviews = async (orderId) => {
  try {
    const q = query(
      reviewsCollection,
      where('orderId', '==', orderId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching order reviews:', error);
    throw error;
  }
};

// Notifications Collection
export const notificationsCollection = collection(db, 'notifications');

export const createNotification = async (notificationData) => {
  try {
    const notificationToSave = {
      ...notificationData,
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const notificationRef = await addDoc(notificationsCollection, notificationToSave);
    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId) => {
  try {
    const q = query(
      notificationsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    const q = query(
      notificationsCollection,
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}; 
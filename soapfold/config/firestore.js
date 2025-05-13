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
    const q = query(
      ordersCollection,
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    throw error;
  }
};

// Payments Collection
export const paymentsCollection = collection(db, 'payments');

export const createPayment = async (paymentData) => {
  try {
    const paymentRef = await addDoc(paymentsCollection, {
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
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
    const now = new Date();
    const q = query(
      offersCollection,
      where('isActive', '==', true),
      where('validFrom', '<=', now),
      where('validTo', '>=', now)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
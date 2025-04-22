import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'default-key-for-development',
    },
  };
}; 
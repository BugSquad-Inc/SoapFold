import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      firebaseApiKey: process.env.FIREBASE_API_KEY || "AIzaSyA25WB_mlRL8tPj-_WD2-ieNkF7NSHRnuI",
    },
  };
}; 
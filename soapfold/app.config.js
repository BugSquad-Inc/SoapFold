import 'dotenv/config';

export default ({ config }) => {
  const apiKey = "AIzaSyA25WB_mlRL8tPj-_WD2-ieNkF7NSHRnuI";
  console.log("Loading Firebase API key in app.config.js:", apiKey);
  
  return {
    ...config,
    extra: {
      ...config.extra,
      firebaseApiKey: apiKey,
    },
  };
}; 
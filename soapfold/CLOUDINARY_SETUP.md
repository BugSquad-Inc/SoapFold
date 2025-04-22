# Cloudinary Setup Guide for SoapFold

This guide will help you set up Cloudinary for image uploads in the SoapFold app.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary's website](https://cloudinary.com/users/register/free) and sign up for a free account
2. After signing up and logging in, you'll be taken to your Dashboard

## Step 2: Get Your Account Details

From your Cloudinary Dashboard, note down:

- **Cloud Name**: This is shown prominently on your dashboard

## Step 3: Create an Upload Preset

1. In the Cloudinary Dashboard, go to **Settings > Upload**
2. Scroll down to the "Upload presets" section
3. Click **Add upload preset**
4. Set a Name for your preset (e.g., "soapfold")
5. Set Signing Mode to "Unsigned"
6. Set Folder to "soapfold" (or any folder name you prefer)
7. Click **Save**

## Step 4: Update the App Configuration

You only need to update one file in your app:

### Update `config/cloudinary.js`:

```javascript
// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: 'YOUR_ACTUAL_CLOUD_NAME', // Replace with your cloud name
  uploadPreset: 'YOUR_ACTUAL_PRESET_NAME', // Replace with your upload preset
  apiUrl: 'https://api.cloudinary.com/v1_1/YOUR_ACTUAL_CLOUD_NAME/image/upload' 
};

export default cloudinaryConfig;
```

Make sure to replace:
- `YOUR_ACTUAL_CLOUD_NAME` (in two places)
- `YOUR_ACTUAL_PRESET_NAME`

with the values from steps 2 and 3.

## Step 5: Test the Upload

1. Run your app
2. Go to the Profile page
3. Tap on Edit
4. Tap on your profile image
5. Select an image from your gallery or take a photo
6. Save your profile

If everything is set up correctly, the image should upload successfully to Cloudinary.

## Cloudinary Free Tier Limits

- 25GB of storage
- 25GB of monthly bandwidth
- 25,000 transformations per month
- Up to 10MB per image upload

For more information, visit [Cloudinary's pricing page](https://cloudinary.com/pricing). 
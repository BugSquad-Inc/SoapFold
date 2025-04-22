import cloudinaryConfig from '../config/cloudinary';

/**
 * Upload an image to Cloudinary
 * @param {string} uri - Local URI of the image
 * @param {string} folder - Optional folder path for organizing images
 * @returns {Promise<string|null>} - URL of the uploaded image or null if upload failed
 */
export const uploadToCloudinary = async (uri, folder = 'profile_images') => {
  try {
    console.log('Starting Cloudinary upload:', uri);
    
    // Create form data for the upload
    const formData = new FormData();
    
    // Get file name from URI
    const fileName = uri.split('/').pop();
    
    // Get file type
    let fileType = 'image/jpeg';
    if (uri.endsWith('.png')) {
      fileType = 'image/png';
    }
    
    // Create file object
    const file = {
      uri: uri,
      type: fileType,
      name: fileName
    };
    
    // Append the image file
    formData.append('file', file);
    
    // Add upload preset (for authentication)
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    
    // Add folder if specified
    if (folder) {
      formData.append('folder', folder);
    }
    
    console.log('Sending request to Cloudinary...');
    
    // Make the POST request to Cloudinary API
    const response = await fetch(cloudinaryConfig.apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    // Parse the response
    const data = await response.json();
    
    // Check for success
    if (data && data.secure_url) {
      console.log('Upload successful, URL:', data.secure_url);
      return data.secure_url;
    } else {
      console.error('Cloudinary upload failed:', data);
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}; 
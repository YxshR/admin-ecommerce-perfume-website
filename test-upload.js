// Simple script to test Cloudinary uploads
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure with hardcoded values
cloudinary.config({
  cloud_name: 'dzzxpyqif',
  api_key: '992368173733427',
  api_secret: 'kQuf9IxR7a503I0y-J_QVzx4RI8',
  secure: true
});

console.log('Cloudinary upload test:');

// Create a simple test image if one doesn't exist
const testImagePath = path.join(__dirname, 'test-image.jpg');

// Function to create a simple test image
function createTestImage() {
  // If the test image already exists, use it
  if (fs.existsSync(testImagePath)) {
    console.log('Using existing test image:', testImagePath);
    return testImagePath;
  }

  // Otherwise, use a data URL for a simple 1x1 pixel image
  console.log('No test image found, using a data URL instead');
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

// Test upload function
async function testUpload() {
  try {
    const imageSource = createTestImage();
    
    console.log('\nUploading test image to Cloudinary...');
    const result = await cloudinary.uploader.upload(imageSource, {
      folder: 'test_uploads',
    });
    
    console.log('\nUpload successful!');
    console.log('- Public ID:', result.public_id);
    console.log('- URL:', result.secure_url);
    console.log('- Format:', result.format);
    
    return true;
  } catch (error) {
    console.error('\nUpload failed:', error);
    return false;
  }
}

testUpload(); 
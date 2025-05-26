// Simple script to test Cloudinary configuration
const cloudinary = require('cloudinary').v2;

// Configure with hardcoded values
cloudinary.config({
  cloud_name: 'dzzxpyqif',
  api_key: '992368173733427',
  api_secret: 'kQuf9IxR7a503I0y-J_QVzx4RI8',
  secure: true
});

console.log('Cloudinary configuration test:');
console.log('- Cloud name:', cloudinary.config().cloud_name);
console.log('- API key:', cloudinary.config().api_key);

// Test connection by getting account info
async function testConnection() {
  try {
    console.log('\nTesting connection to Cloudinary...');
    const result = await cloudinary.api.ping();
    console.log('Connection successful!', result);
    
    // Get account usage info
    const usage = await cloudinary.api.usage();
    console.log('\nAccount usage:', usage);
    
    return true;
  } catch (error) {
    console.error('\nConnection failed:', error);
    return false;
  }
}

testConnection(); 
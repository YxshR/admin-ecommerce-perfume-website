// Script to create a proper .env.local file for the application
const fs = require('fs');
const path = require('path');

// Define the environment variables
const envContent = `# MongoDB Connection
MONGODB_URI=mongodb+srv://Yash:f500A06khWmFn4Qd@yash.pweao0h.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Secret for authentication
JWT_SECRET=fraganote_admin_secret_key_2025

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PHONE=8126518755

# Google Cloud Storage
GOOGLE_STORAGE_BUCKET_NAME=ecommerce-app-444531.appspot.com
GOOGLE_STORAGE_PROJECT_ID=ecommerce-app-444531
`;

// Write to .env.local file
const envPath = path.join(process.cwd(), '.env.local');
fs.writeFileSync(envPath, envContent);

console.log('\x1b[32m%s\x1b[0m', '✅ .env.local file created successfully!');
console.log('\x1b[36m%s\x1b[0m', 'Please restart your development server for changes to take effect.'); 
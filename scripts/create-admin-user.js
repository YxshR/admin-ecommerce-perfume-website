/**
 * Script to create an admin user in the MongoDB database
 * 
 * Run this script with: node scripts/create-admin-user.js
 */

const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Admin user details - you can change these
const adminEmail = 'admin@example.com';
const adminPassword = 'admin123'; 
const adminName = 'Admin User';

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function createAdminUser() {
  console.log('Starting admin user creation process...');
  
  const client = new MongoClient(uri);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    // Get database name from connection string
    const dbName = uri.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    
    // Get users collection
    const usersCollection = db.collection('users');
    
    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      console.log('You can use this admin account to login.');
      return;
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Create admin user document
    const adminUser = {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert admin user
    const result = await usersCollection.insertOne(adminUser);
    
    if (result.acknowledged) {
      console.log(`Admin user created successfully with ID: ${result.insertedId}`);
      console.log(`Use these credentials to login:`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    } else {
      console.log('Failed to create admin user');
    }
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
createAdminUser(); 
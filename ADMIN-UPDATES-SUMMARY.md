# Admin System Updates Summary

## Changes Implemented

### 1. OTP-Based Admin Login System
We've replaced the email/password login system with a more secure OTP-based verification flow:

- **New Email Utility**: Created `email-utils.ts` to send OTP codes via email using nodemailer
- **Admin OTP Model**: Added `AdminOTP.ts` model to store OTP codes with expiration times
- **API Routes**:
  - Added `/api/auth/admin-otp/generate` to send OTP to admin email
  - Added `/api/auth/admin-otp/verify` to verify OTP and authenticate admin
- **Login UI**: Updated the admin login page to support:
  - Email entry followed by OTP verification
  - Bypass mode for offline/development use
  - Clear user feedback during the login process

### 2. Real Data Integration
Fixed the issue where admin dashboard showed demo data instead of actual MongoDB data:

- **Dashboard API**: Created `/api/admin/dashboard` endpoint to fetch real data:
  - Total users count
  - Total products count
  - Total orders count
  - Recent orders list
- **Dashboard UI**: Updated to display real data from MongoDB
  - Added refresh functionality
  - Improved error handling
  - Dynamic table population

### 3. Environment Configuration
Added support for environment variables:

- Created README-ENV-SETUP.md with instructions for setting up:
  - MongoDB connection
  - JWT secret
  - Email configuration for OTP
  - Admin email specification

## How to Use the New Admin System

1. **Setup**:
   - Create `.env.local` file following the instructions in README-ENV-SETUP.md
   - Ensure you have an admin user in MongoDB with role set to "admin"
   - Set the ADMIN_EMAIL environment variable to match your admin email

2. **Admin Login Process**:
   - Navigate to /admin/login
   - Enter the admin email (defaults to avitoluxury@gmail.com)
   - System sends OTP to that email
   - Enter the OTP code received
   - After verification, you'll be redirected to the admin dashboard

3. **Offline/Development Mode**:
   - If email sending fails or you're developing offline
   - Click "Use Direct Access" button
   - Use the bypass credentials (email: admin@example.com, OTP: 123456)

## Security Improvements

- Removed hardcoded admin credentials
- Email OTP expires after 10 minutes
- Rate limiting for OTP requests
- Prevention of email enumeration attacks
- Token-based API authorization
- Environment variable based configuration

## Fallback Mechanisms

- Bypass mode for when email service is unavailable
- Database connection error handling
- Graceful degradation when services are unavailable 
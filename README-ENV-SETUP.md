# Environment Setup for Admin OTP System

To enable the admin OTP login system, you need to create an `.env.local` file in the root directory of your project with the following configuration:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-mongodb-connection-string

# JWT Secret for authentication
JWT_SECRET=your-jwt-secret-key

# Email Configuration for OTP
EMAIL_USER=avitoluxury@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Admin Email
ADMIN_EMAIL=avitoluxury@gmail.com
```

## Important Notes:

### For Gmail:
1. The `EMAIL_PASSWORD` should be an "App Password", not your regular Gmail password
2. To generate an App Password:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification if not already enabled
   - Go to "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Name it "Avito Admin OTP" or similar
   - Copy the generated 16-character password

### Security:
- Never commit your `.env.local` file to version control
- Keep your JWT_SECRET secure and complex
- Ensure that your MongoDB connection string is properly secured

### MongoDB Setup:
- Make sure your MongoDB database has the required collections: Users, Products, Orders, AdminOTP
- The Admin user should have the role field set to "admin"

After setting up the `.env.local` file, restart your development server for the changes to take effect. 
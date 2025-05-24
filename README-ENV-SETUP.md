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

# Admin Credentials
ADMIN_EMAIL=avitoluxury@gmail.com
ADMIN_PHONE=8126518755

# Twilio Configuration for SMS OTP
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=
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

### For Twilio Verify:
1. Sign up for a Twilio account at https://www.twilio.com/
2. Obtain your Account SID and Auth Token from the Twilio console dashboard
3. For the Verify service:
   - Navigate to Verify in the Twilio console
   - Create a new Verify service or use the existing one ()
   - Copy the Service SID to the TWILIO_VERIFY_SERVICE_SID variable
4. Set the `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SERVICE_SID` in your `.env.local` file
5. For production use, ensure your Twilio account is upgraded (not in trial mode)
6. Add test phone numbers to your Twilio verified numbers list if in trial mode

### Security:
- Never commit your `.env.local` file to version control
- Keep your JWT_SECRET secure and complex
- Ensure that your MongoDB connection string is properly secured
- Protect your Twilio credentials

### MongoDB Setup:
- Make sure your MongoDB database has the required collections: Users, Products, Orders
- The Admin user should have the role field set to "admin"
- For SMS OTP login, ensure the admin user has the correct phone number in the database

After setting up the `.env.local` file, restart your development server for the changes to take effect. 
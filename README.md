# Duty Dinar

## Google Wallet Integration

This application includes integration with Google Wallet for event tickets. The implementation follows a "fail gracefully" approach to ensure core functionality (booking events) works even if optional features (Google Wallet, email) encounter problems.

### Key Features

1. **Mock Mode for Development**: When running locally, the system automatically generates mock Google Wallet passes without needing actual Google credentials.

2. **Resilient Email System**: The email system can operate in mock mode for development and gracefully handles missing dependencies.

3. **Error Handling**: Comprehensive error handling ensures that users can complete their bookings even if optional features fail.

### Development Setup

1. **Composer Dependencies**: The project uses Composer for dependency management.
   ```
   composer install
   ```

2. **Google Wallet Credentials**: For production, place real Google Wallet credentials in `backend/credentials/google-wallet-credentials.json`.

3. **Email Configuration**: Configure email settings in `backend/controller/email_cred.php`.

### Troubleshooting

If you encounter issues with booking events, check the following:

1. Database connection and schema
2. Session management 
3. API endpoints configuration
4. Apache/PHP error logs

Most issues with Google Wallet integration failing should not prevent successful event booking.

### Implementation Notes

The system is designed to work in three tiers of functionality:

1. **Full Features**: In production with proper credentials, users get Google Wallet passes and confirmation emails.
2. **Partial Features**: If email or Google Wallet services fail, booking still succeeds, and available features work.
3. **Core Functionality**: Even if all optional features fail, users can still book event tickets.

This approach ensures maximum availability of the core booking service while providing enhanced features when possible. 
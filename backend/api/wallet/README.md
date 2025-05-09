# DutyDinar Digital Wallet Integration

This directory contains the implementation for integrating with digital wallet services, including Apple Wallet and Google Wallet for event tickets.

## Directory Structure

- `apple_pass_generator.php` - Class for generating Apple Wallet passes
- `google_pass_generator.php` - Class for generating Google Wallet passes
- `create_apple_pass_url.php` - Helper function to create Apple Wallet URLs
- `create_google_pass_url.php` - Helper function to create Google Wallet URLs
- `generate_apple_pass.php` - API endpoint for generating Apple Wallet passes
- `generate_google_pass.php` - API endpoint for generating Google Wallet passes
- `download_pass.php` - API endpoint for downloading wallet passes
- `test_apple_wallet.html` - Test page for Apple Wallet integration
- `test_google_wallet.html` - Test page for Google Wallet integration
- `test_wallet.html` - Combined test page for both wallet systems
- `/certificates/` - Directory for storing certificates (not included in repository)
- `/generated_passes/` - Directory where pass data is stored
- `/mock_passes/` - Mock pass files for testing

## API Usage

### Generating an Apple Wallet Pass

```http
POST /backend/api/wallet/generate_apple_pass.php
Content-Type: application/json

{
  "event_id": 123,
  "booking_id": 456
}
```

### Generating a Google Wallet Pass

```http
POST /backend/api/wallet/generate_google_pass.php
Content-Type: application/json

{
  "event_id": 123,
  "booking_id": 456
}
```

### Downloading a Pass

```http
GET /backend/api/wallet/download_pass.php?id=pass_id&type=apple
```

## Integration in Booking Process

Both wallet systems are integrated into the booking process in `book_event.php`. When a user books an event, the system:

1. Creates a booking record
2. Generates both Apple and Google Wallet passes
3. Includes links to both passes in the confirmation email

## Testing

You can test the wallet integration using the provided test pages:

- `/backend/api/wallet/test_apple_wallet.html` - Test Apple Wallet
- `/backend/api/wallet/test_google_wallet.html` - Test Google Wallet
- `/backend/api/wallet/test_wallet.html` - Test both wallet systems

## Production Implementation Notes

The current implementation is primarily for demonstration purposes. For production use:

### Apple Wallet:
- You need an Apple Developer account
- Create a Pass Type ID and certificate
- Implement proper signing of .pkpass files
- Host the actual .pkpass files on your server

### Google Wallet:
- Set up a Google Cloud project
- Enable Google Pay API for Passes
- Create a service account with appropriate permissions
- Implement JWT signing and Google Pay API calls

## References

- [Apple PassKit Documentation](https://developer.apple.com/documentation/passkit)
- [Google Wallet API Documentation](https://developers.google.com/wallet) 
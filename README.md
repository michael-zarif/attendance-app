# QR Attendance App

A simple, mobile-friendly web application for tracking attendance using QR code scanning. The app integrates directly with Google Sheets to store attendance records with timestamps.

## Features

- 📱 **Mobile-First Design**: Optimized for mobile browsers
- 📷 **Camera Access**: Uses device camera for QR code scanning
- ⚡ **Real-time Scanning**: Instant QR code detection and processing
- 📊 **Google Sheets Integration**: Direct data recording to spreadsheets
- 💾 **Offline Support**: PWA capabilities with offline caching
- 🔄 **Auto-retry**: Automatically retries failed submissions
- 📋 **Recent Scans**: View recent attendance records
- ⚙️ **Easy Configuration**: Simple setup process

## Setup Instructions

### 1. Google Sheets Setup

1. Create a new Google Sheet or use an existing one
2. Note the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
3. Make sure the sheet has appropriate column headers (optional):
   - Column A: Timestamp
   - Column B: QR Code Data
   - Column C: ISO Timestamp
   - Column D: Source

### 2. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**
4. Create credentials:
   - Go to **APIs & Services > Credentials**
   - Click **+ CREATE CREDENTIALS > API Key**
   - Copy the API key
5. Configure API key restrictions (recommended):
   - Set application restrictions to "HTTP referrers"
   - Add your website domain
   - Set API restrictions to "Google Sheets API"

### 3. App Configuration

1. Open the app in a mobile browser
2. Click the settings (⚙️) button
3. Enter:
   - **Spreadsheet ID**: From step 1
   - **Sheet Name**: The specific sheet tab name (default: "Sheet1")
   - **API Key**: From step 2
4. Click "Save Configuration"

### 4. Using the App

1. Tap "Start Camera" to begin scanning
2. Point the camera at a QR code
3. The app will automatically:
   - Detect the QR code
   - Record the timestamp
   - Send data to Google Sheets
   - Show confirmation

## QR Code Format

The app accepts any QR code content. Common formats include:
- Student IDs
- Employee codes  
- Event tickets
- Custom identifiers

## Mobile Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (⋮) button
3. Select "Add to Home screen"

## Security Features

- API keys are stored locally on the device
- HTTPS required for camera access
- No data stored on external servers
- Direct connection to Google Sheets

## Offline Support

- App works offline after first load
- Failed submissions are automatically retried when connection returns
- Recent scans cached locally

## Browser Compatibility

- ✅ Chrome (Android/iOS)
- ✅ Safari (iOS) 
- ✅ Firefox (Android)
- ✅ Edge (Android)

## Troubleshooting

### Camera Not Working
- Ensure HTTPS is being used (required for camera access)
- Check browser permissions for camera access
- Try reloading the page

### Google Sheets Not Updating
- Verify API key is correct and has proper permissions
- Check spreadsheet ID is accurate
- Ensure spreadsheet is accessible with the API key
- Check browser console for error messages

### QR Codes Not Scanning
- Ensure good lighting conditions
- Hold device steady
- Clean camera lens
- Try different QR code sizes

## File Structure

```
attendance-app/
├── index.html          # Main application page
├── styles.css          # Mobile-responsive styling
├── script.js           # Core functionality
├── manifest.json       # PWA configuration
├── sw.js              # Service worker for offline support
└── README.md          # This file
```

## Development

To modify or extend the app:

1. Clone or download the files
2. Open in any web server (Python: `python -m http.server`)
3. Access via `localhost` with HTTPS for camera access
4. Edit files as needed

## Deployment Options

### Option 1: GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Access via `https://username.github.io/repository-name`

### Option 2: Netlify
1. Drag and drop folder to [Netlify](https://netlify.com)
2. Get instant deployment with HTTPS

### Option 3: Any Static Host
- Vercel
- Firebase Hosting  
- AWS S3 + CloudFront
- Any web server with HTTPS support

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for error messages
3. Verify Google Sheets API configuration

# QR Attendance App

A simple, mobile-friendly web application for tracking attendance using QR code scanning. The app uses GitHub Actions as a backend to store attendance records as GitHub Issues and CSV files.

## Features

- 📱 **Mobile-First Design**: Optimized for mobile browsers
- 📷 **Camera Access**: Uses device camera for QR code scanning
- ⚡ **Real-time Scanning**: Instant QR code detection and processing
- 🔧 **GitHub Integration**: Reliable backend using GitHub Actions
- 💾 **Offline Support**: PWA capabilities with offline caching
- 🔄 **Auto-retry**: Automatically retries failed submissions
- 📋 **Recent Scans**: View recent attendance records
- ⚙️ **Easy Configuration**: Simple three-field setup
- 📊 **Dual Storage**: Data stored as GitHub Issues + CSV file
- 📥 **CSV Download**: Download attendance data directly from the app
- 🔒 **Secure**: No external servers, uses GitHub's infrastructure

## Quick Start

### 1. Deploy to GitHub Pages

1. **Fork or clone** this repository
2. **Enable GitHub Pages**: Settings → Pages → Deploy from main branch
3. **Your app URL**: `https://YOUR-USERNAME.github.io/qr-attendance-app`

### 2. Create GitHub Personal Access Token

1. **Go to**: [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. **Click**: "Generate new token (classic)"
3. **Select scopes**:
   - ✅ `repo` (Full control of repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
4. **Copy the token** (starts with `ghp_...`)

### 3. Configure Repository Permissions

1. **Go to your repository**: Settings → Actions → General
2. **Workflow permissions**: Select "Read and write permissions"
3. **Check**: "Allow GitHub Actions to create and approve pull requests"
4. **Click "Save"**

### 4. Configure the App

1. **Open your deployed app** on mobile/desktop
2. **Click Settings** ⚙️
3. **Enter**:
   - **GitHub Token**: Your personal access token
   - **Repository Owner**: Your GitHub username
   - **Repository Name**: Your repository name (e.g., `qr-attendance-app`)
4. **Click "Save Configuration"**

### 5. Start Using

1. **Tap "Start Camera"** to begin scanning
2. **Point camera at QR code**
3. **Automatic process**:
   - Detects QR code
   - Records timestamp  
   - Updates CSV file directly
   - Shows confirmation

## Data Storage

### CSV File
All records are also stored in `attendance.csv` with parsed data:
```csv
"Timestamp","Mobile Number","Full Name","Service"
"9/26/2025, 10:19:18 PM","1227039327","ابانوب رأفت وهيب هرمينا","تلمذة شباب"
"9/26/2025, 10:22:23 PM","01274539819","امير أشرف لطيف تادرس","تلمذة شباب"
```

### Data Export
- **📥 In-App Download**: Click "Download CSV" button in the app (supports Arabic text)
- **📂 GitHub Download**: Go to repository → `attendance.csv` → Download  
- **🔍 Audit Trail**: Actions tab shows all processing history

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

- GitHub token stored locally on device only
- HTTPS required for camera access  
- No external servers - uses GitHub's infrastructure
- Full audit trail in repository

## Offline Support

- App works offline after first load
- Failed submissions automatically retried when online
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

### GitHub Issues Not Created
- Check repository Actions tab for workflow errors
- Verify token has `repo` and `workflow` permissions
- Ensure repository has "Read and write permissions" in Actions settings
- Check browser console for API error messages

### QR Codes Not Scanning
- Ensure good lighting conditions
- Hold device steady
- Clean camera lens
- Try different QR code sizes

## File Structure

```
qr-attendance-app/
├── .github/workflows/
│   └── attendance.yml      # GitHub Actions workflow
├── index.html              # Main application page
├── styles.css              # Mobile-responsive styling
├── script.js               # Core functionality
├── manifest.json           # PWA configuration
├── sw.js                   # Service worker for offline support
├── README.md               # This file
├── GITHUB-SETUP.md         # Detailed setup guide
└── attendance.csv          # Generated attendance data
```

## Architecture

```
📱 Mobile App → 🌐 GitHub API → ⚙️ GitHub Actions → 📊 Issues + CSV
```

1. **Mobile app** captures QR codes via camera
2. **GitHub API** receives attendance data 
3. **GitHub Actions** processes the data automatically
4. **Storage** in GitHub Issues (individual records) + CSV file (bulk export)

## Development

To modify or extend the app:

1. **Fork this repository**
2. **Enable GitHub Pages** for testing
3. **Edit files** as needed
4. **Test locally**: `python -m http.server` (requires HTTPS for camera)

## Why GitHub Actions?

- ✅ **No API key hassles** (unlike Google Sheets)
- ✅ **Built-in authentication** via GitHub tokens
- ✅ **Free tier generous** (2000 minutes/month)
- ✅ **Reliable infrastructure** (99.9% uptime)
- ✅ **Full audit trail** in Actions tab
- ✅ **Version controlled data** (CSV file in git history)

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review browser console for error messages  
3. Check GitHub Actions tab for workflow errors
4. Verify repository permissions and token scopes

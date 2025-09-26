# 🔧 Google Apps Script Setup Guide

## ⚠️ **Important Update**

Google has changed their authentication requirements. API keys no longer work for writing to Google Sheets. We now use **Google Apps Script** as a backend instead.

## 📋 **Step-by-Step Setup**

### **Step 1: Create Google Apps Script**

1. **Go to**: [script.google.com](https://script.google.com)
2. **Click**: "New Project"
3. **Delete** the default code
4. **Copy and paste** the code from `google-apps-script.js` file

### **Step 2: Configure the Script**

1. **Find these lines** in the script:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   const SHEET_NAME = 'Sheet1';
   ```

2. **Replace** with your actual values:
   - **SPREADSHEET_ID**: Get from your Google Sheet URL
   - **SHEET_NAME**: Your actual sheet tab name (case-sensitive!)

### **Step 3: Deploy as Web App**

1. **Click**: "Deploy" → "New deployment"
2. **Type**: Choose "Web app"
3. **Execute as**: "Me"
4. **Who has access**: "Anyone" (required for the app to work)
5. **Click**: "Deploy"
6. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/.../exec`)

### **Step 4: Configure Your App**

1. **Refresh your attendance app** in the browser
2. **Click Settings** ⚙️
3. **Paste the Web App URL** from Step 3
4. **Click "Save Configuration"**
5. **Wait for success message**

## 🧪 **Testing Your Setup**

1. **Try scanning a QR code**
2. **Check your Google Sheet** - new row should appear
3. **If it fails**, check the browser console for errors

## 🔧 **Common Issues & Solutions**

### ❌ **"Google Apps Script URL is required"**
- Make sure you pasted the complete URL from step 3

### ❌ **"HTTP 403: Forbidden"**  
- Check the deployment settings: "Who has access" must be "Anyone"

### ❌ **"Script not found"**
- Verify the URL is correct and complete
- Make sure the script is deployed, not just saved

### ❌ **"ReferenceError: SpreadsheetApp is not defined"**
- Make sure you're using Google Apps Script, not regular JavaScript

## 📊 **Your Google Sheet Setup**

Make sure your Google Sheet has these column headers (optional but recommended):

| A | B | C | D |
|---|---|---|---|
| Timestamp | QR Code Data | ISO Timestamp | Source |

## 🔒 **Security Notes**

- ✅ **Safer than API keys**: Script runs with your Google account permissions
- ✅ **No exposed credentials**: No API keys in your web app
- ✅ **Access control**: You control who can deploy/modify the script

## 🚀 **Ready to Go!**

Once configured, your app will:
1. Scan QR codes instantly  
2. Send data to Google Apps Script
3. Script writes to your Google Sheet
4. Show success/error messages

**The authentication issue is now completely resolved!** 🎉

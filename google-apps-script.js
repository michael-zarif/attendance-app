// Google Apps Script Code
// Deploy this as a Web App to handle attendance submissions

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Configuration - UPDATE THESE VALUES
    const SPREADSHEET_ID = '1h7O1Yrwy0qwRkEx3ICc6TzWm2ky19m7e6jO0IrUfwD0'; // Replace with your actual ID
    const SHEET_NAME = 'Members2'; // Replace with your sheet name
    
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Prepare the row data
    const row = [
      data.displayTime || new Date().toLocaleString(),
      data.qrData || '',
      data.timestamp || new Date().toISOString(),
      data.source || 'mobile-app'
    ];
    
    // Append the data
    sheet.appendRow(row);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Attendance recorded successfully',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Failed to record attendance'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'Google Apps Script is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

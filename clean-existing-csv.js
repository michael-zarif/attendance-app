#!/usr/bin/env node

/**
 * Script to clean up existing attendance.csv file
 * Converts old format to new format with parsed Arabic data
 * Run with: node clean-existing-csv.js
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'attendance.csv');

if (!fs.existsSync(csvPath)) {
  console.log('❌ attendance.csv not found');
  process.exit(1);
}

console.log('🔧 Cleaning attendance.csv...');

// Read the file
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n').filter(line => line.trim());

// New CSV content
let newContent = '"Timestamp","Mobile Number","Full Name","Service"\n';

for (let i = 1; i < lines.length; i++) { // Skip header
  const line = lines[i];
  if (!line.trim()) continue;
  
  // Parse CSV line - the QR data is spread across multiple columns
  const matches = line.match(/"([^"]*)"/g);
  if (!matches || matches.length < 2) continue;
  
  const timestamp = matches[0].replace(/"/g, '');
  
  // Combine all QR data parts (they're split by commas)
  let qrData = '';
  for (let j = 1; j < matches.length - 2; j++) { // Exclude last 2 (ISO timestamp, source)
    qrData += matches[j].replace(/"/g, '') + ',';
  }
  qrData = qrData.slice(0, -1); // Remove trailing comma
  
  // Parse QR data
  let mobileNumber = '';
  let fullName = '';
  let service = '';
  
  try {
    // Extract mobile number
    const mobileMatch = qrData.match(/رقم الموبايل["":]+"?([^"""}]+)/);
    if (mobileMatch) {
      mobileNumber = mobileMatch[1].replace(/[""]/g, '').trim();
    }
    
    // Extract full name
    const nameMatch = qrData.match(/الاسم رباعي["":]+"?([^"""}]+)/);
    if (nameMatch) {
      fullName = nameMatch[1].replace(/[""]/g, '').trim();
    }
    
    // Extract service
    const serviceMatch = qrData.match(/الخدمة["":]+"?([^"""}]+)/);
    if (serviceMatch) {
      service = serviceMatch[1].replace(/[""]/g, '').trim();
    }
  } catch (error) {
    console.log(`⚠️  Error parsing line ${i}: ${error.message}`);
    // Use fallback
    mobileNumber = qrData;
  }
  
  // Add cleaned line
  newContent += `"${timestamp}","${mobileNumber}","${fullName}","${service}"\n`;
  
  console.log(`✅ Processed: ${fullName || 'Unknown'} - ${mobileNumber}`);
}

// Backup original file
const backupPath = csvPath + '.backup.' + Date.now();
fs.copyFileSync(csvPath, backupPath);
console.log(`💾 Backup created: ${backupPath}`);

// Write new content
fs.writeFileSync(csvPath, newContent, 'utf8');
console.log('✅ attendance.csv cleaned successfully!');

console.log('\n📊 New CSV format:');
console.log('Column 1: Timestamp');
console.log('Column 2: Mobile Number Only');
console.log('Column 3: Full Name Only');
console.log('Column 4: Service Only');

class AttendanceApp {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');
        this.status = document.getElementById('status');
        this.lastScan = document.getElementById('lastScan');
        this.recentList = document.getElementById('recentList');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.modal = document.getElementById('configModal');
        this.configForm = document.getElementById('configForm');
        
        this.isScanning = false;
        this.stream = null;
        this.scanCooldown = false;
        this.config = this.loadConfig();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadRecentScans();
        
        // Auto-start if config is available
        if (this.config.apiKey && this.config.spreadsheetId) {
            this.updateStatus('Configuration loaded. Ready to scan!', 'success');
        } else {
            this.updateStatus('Please configure Google Sheets settings', 'error');
            this.showModal();
        }
    }
    
    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startCamera());
        this.stopButton.addEventListener('click', () => this.stopCamera());
        this.settingsBtn.addEventListener('click', () => this.showModal());
        
        // Modal controls
        document.querySelector('.close').addEventListener('click', () => this.hideModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
        
        this.configForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConfig();
        });
        
        // Load existing config into form
        this.loadConfigIntoForm();
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isScanning) {
                this.pauseScanning();
            } else if (!document.hidden && this.isScanning) {
                this.resumeScanning();
            }
        });
    }
    
    async startCamera() {
        try {
            this.updateStatus('Starting camera...', 'scanning');
            
            // Request camera permission
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            this.video.srcObject = this.stream;
            this.video.setAttribute('playsinline', true);
            this.video.play();
            
            this.startButton.style.display = 'none';
            this.stopButton.style.display = 'block';
            
            this.video.addEventListener('loadedmetadata', () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.isScanning = true;
                this.scan();
                this.updateStatus('Camera active. Point at QR code to scan', 'scanning');
            });
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.updateStatus('Camera access denied. Please allow camera permission.', 'error');
        }
    }
    
    stopCamera() {
        this.isScanning = false;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.video.srcObject = null;
        this.startButton.style.display = 'block';
        this.stopButton.style.display = 'none';
        this.updateStatus('Camera stopped', 'success');
    }
    
    scan() {
        if (!this.isScanning) return;
        
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code && !this.scanCooldown) {
                this.processQRCode(code.data);
            }
        }
        
        // Continue scanning
        if (this.isScanning) {
            requestAnimationFrame(() => this.scan());
        }
    }
    
    async processQRCode(qrData) {
        if (this.scanCooldown) return;
        
        // Prevent multiple scans of the same code
        this.scanCooldown = true;
        setTimeout(() => { this.scanCooldown = false; }, 3000);
        
        const timestamp = new Date();
        const scanRecord = {
            qrData: qrData,
            timestamp: timestamp.toISOString(),
            displayTime: timestamp.toLocaleString()
        };
        
        this.updateStatus('QR Code detected! Sending to Google Sheets...', 'scanning');
        
        try {
            await this.sendToGoogleSheets(scanRecord);
            this.updateStatus('✅ Attendance recorded successfully!', 'success');
            this.showLastScan(scanRecord);
            this.addToRecentScans(scanRecord);
            
            // Vibrate if available (mobile devices)
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            
        } catch (error) {
            console.error('Error sending to Google Sheets:', error);
            this.updateStatus('❌ Failed to record attendance. Please check your settings.', 'error');
            
            // Save for later retry
            this.saveForRetry(scanRecord);
        }
    }
    
    async sendToGoogleSheets(scanRecord) {
        const { apiKey, spreadsheetId, sheetName } = this.config;
        
        if (!apiKey || !spreadsheetId) {
            throw new Error('Google Sheets configuration missing');
        }
        
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:append?valueInputOption=RAW&key=${apiKey}`;
        
        const body = {
            values: [[
                scanRecord.displayTime,
                scanRecord.qrData,
                scanRecord.timestamp,
                window.location.hostname || 'mobile-app'
            ]]
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to write to Google Sheets');
        }
        
        return response.json();
    }
    
    updateStatus(message, type = '') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
    }
    
    showLastScan(scanRecord) {
        this.lastScan.innerHTML = `
            <div><strong>Last Scan:</strong></div>
            <div>Time: ${scanRecord.displayTime}</div>
            <div>Data: ${scanRecord.qrData}</div>
        `;
        this.lastScan.style.display = 'block';
    }
    
    addToRecentScans(scanRecord) {
        let recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
        recentScans.unshift(scanRecord);
        recentScans = recentScans.slice(0, 10); // Keep only last 10 scans
        localStorage.setItem('recentScans', JSON.stringify(recentScans));
        this.displayRecentScans(recentScans);
    }
    
    loadRecentScans() {
        const recentScans = JSON.parse(localStorage.getItem('recentScans') || '[]');
        this.displayRecentScans(recentScans);
    }
    
    displayRecentScans(scans) {
        this.recentList.innerHTML = '';
        scans.forEach(scan => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="scan-time">${scan.displayTime}</div>
                <div class="scan-data">${scan.qrData}</div>
            `;
            this.recentList.appendChild(li);
        });
    }
    
    saveForRetry(scanRecord) {
        let failedScans = JSON.parse(localStorage.getItem('failedScans') || '[]');
        failedScans.push(scanRecord);
        localStorage.setItem('failedScans', JSON.stringify(failedScans));
    }
    
    async retryFailedScans() {
        const failedScans = JSON.parse(localStorage.getItem('failedScans') || '[]');
        const successful = [];
        
        for (let scan of failedScans) {
            try {
                await this.sendToGoogleSheets(scan);
                successful.push(scan);
            } catch (error) {
                console.error('Retry failed:', error);
            }
        }
        
        // Remove successful retries
        const remaining = failedScans.filter(scan => !successful.includes(scan));
        localStorage.setItem('failedScans', JSON.stringify(remaining));
        
        if (successful.length > 0) {
            this.updateStatus(`✅ ${successful.length} failed scans recovered!`, 'success');
        }
    }
    
    showModal() {
        this.modal.style.display = 'block';
    }
    
    hideModal() {
        this.modal.style.display = 'none';
    }
    
    saveConfig() {
        const formData = new FormData(this.configForm);
        this.config = {
            spreadsheetId: formData.get('spreadsheetId') || document.getElementById('spreadsheetId').value,
            sheetName: formData.get('sheetName') || document.getElementById('sheetName').value || 'Sheet1',
            apiKey: formData.get('apiKey') || document.getElementById('apiKey').value
        };
        
        localStorage.setItem('attendanceConfig', JSON.stringify(this.config));
        this.hideModal();
        this.updateStatus('Configuration saved successfully!', 'success');
        
        // Retry any failed scans
        this.retryFailedScans();
    }
    
    loadConfig() {
        const saved = localStorage.getItem('attendanceConfig');
        return saved ? JSON.parse(saved) : {};
    }
    
    loadConfigIntoForm() {
        if (this.config.spreadsheetId) {
            document.getElementById('spreadsheetId').value = this.config.spreadsheetId;
        }
        if (this.config.sheetName) {
            document.getElementById('sheetName').value = this.config.sheetName;
        }
        if (this.config.apiKey) {
            document.getElementById('apiKey').value = this.config.apiKey;
        }
    }
    
    pauseScanning() {
        this.isScanning = false;
    }
    
    resumeScanning() {
        if (this.stream && this.video.srcObject) {
            this.isScanning = true;
            this.scan();
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.attendanceApp = new AttendanceApp();
});

// Service Worker Registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('SW registered'))
            .catch(registrationError => console.log('SW registration failed'));
    });
}

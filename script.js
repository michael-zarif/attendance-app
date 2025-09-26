class AttendanceApp {
    constructor() {
        console.log('🏗️ AttendanceApp constructor started');
        
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.downloadCsvBtn = document.getElementById('downloadCsvBtn');
        this.modal = document.getElementById('configModal');
        this.configForm = document.getElementById('configForm');
        this.closeBtn = document.querySelector('.close');
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.status = document.getElementById('status');
        this.lastScan = document.getElementById('lastScan');
        this.recentList = document.getElementById('recentList');
        
        // Debug: Check if elements exist
        console.log('🔍 Element check:', {
            startButton: !!this.startButton,
            stopButton: !!this.stopButton,
            settingsBtn: !!this.settingsBtn,
            downloadCsvBtn: !!this.downloadCsvBtn,
            modal: !!this.modal,
            status: !!this.status
        });
        
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
        if (this.config.githubToken && this.config.repoOwner && this.config.repoName) {
            this.updateStatus('Configuration loaded. Ready to scan!', 'success');
        } else {
            this.updateStatus('Please configure GitHub settings', 'error');
            this.showModal();
        }
    }
    
    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startCamera());
        this.stopButton.addEventListener('click', () => this.stopCamera());
        this.settingsBtn.addEventListener('click', () => this.showModal());
        this.downloadCsvBtn.addEventListener('click', () => this.downloadCsv());
        
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
        
        this.updateStatus('QR Code detected! Sending to GitHub...', 'scanning');
        
        try {
            await this.sendToGitHub(scanRecord);
            this.updateStatus('✅ Attendance recorded successfully!', 'success');
            this.showLastScan(scanRecord);
            this.addToRecentScans(scanRecord);
            
            // Vibrate if available (mobile devices)
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }
            
        } catch (error) {
            console.error('Error sending to GitHub:', {
                message: error.message,
                status: error.status,
                statusText: error.statusText,
                error: error
            });
            this.updateStatus(`❌ Failed: ${error.message || 'Unknown error'}`, 'error');
            
            // Save for later retry
            this.saveForRetry(scanRecord);
        }
    }
    
    async sendToGitHub(scanRecord) {
        const { githubToken, repoOwner, repoName } = this.config;
        
        if (!githubToken || !repoOwner || !repoName) {
            throw new Error('GitHub configuration missing. Please configure in settings.');
        }
        
        // Trigger GitHub Actions workflow via repository dispatch
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_type: 'attendance-scan',
                client_payload: {
                    qrData: scanRecord.qrData,
                    displayTime: scanRecord.displayTime,
                    timestamp: scanRecord.timestamp,
                    source: window.location.hostname || 'mobile-app'
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        // Repository dispatch returns 204 No Content on success
        return { success: true, message: 'Attendance recorded successfully' };
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
                await this.sendToGitHub(scan);
                successful.push(scan);
            } catch (error) {
                console.error('Retry failed:', {
                    message: error.message,
                    scan: scan,
                    error: error
                });
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
    
    async saveConfig() {
        const formData = new FormData(this.configForm);
        this.config = {
            githubToken: formData.get('githubToken') || document.getElementById('githubToken').value,
            repoOwner: formData.get('repoOwner') || document.getElementById('repoOwner').value,
            repoName: formData.get('repoName') || document.getElementById('repoName').value
        };
        
        // Test configuration before saving
        this.updateStatus('Testing configuration...', 'scanning');
        try {
            await this.testConfiguration();
            localStorage.setItem('attendanceConfig', JSON.stringify(this.config));
            this.hideModal();
            this.updateStatus('Configuration saved and tested successfully!', 'success');
            // Retry any failed scans
            this.retryFailedScans();
        } catch (error) {
            this.updateStatus(`Configuration test failed: ${error.message}`, 'error');
            console.error('Configuration test failed:', error);
        }
    }
    
    async testConfiguration() {
        const { githubToken, repoOwner, repoName } = this.config;
        
        if (!githubToken || !repoOwner || !repoName) {
            throw new Error('All GitHub configuration fields are required');
        }
        
        console.log('Testing GitHub configuration:', { repoOwner, repoName });
        
        // Test by checking repository access
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API Error: ${response.status} - ${errorData.message || response.statusText}`);
        }
        
        const repoData = await response.json();
        console.log('GitHub configuration test successful:', repoData.full_name);
        return repoData;
    }
    
    loadConfig() {
        const saved = localStorage.getItem('attendanceConfig');
        return saved ? JSON.parse(saved) : {};
    }
    
    loadConfigIntoForm() {
        if (this.config.githubToken) {
            document.getElementById('githubToken').value = this.config.githubToken;
        }
        if (this.config.repoOwner) {
            document.getElementById('repoOwner').value = this.config.repoOwner;
        }
        if (this.config.repoName) {
            document.getElementById('repoName').value = this.config.repoName;
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
    
    async downloadCsv() {
        const { githubToken, repoOwner, repoName } = this.config;
        
        // Check if configuration is available
        if (!githubToken || !repoOwner || !repoName) {
            this.updateStatus('❌ GitHub configuration required to download CSV', 'error');
            this.showModal();
            return;
        }
        
        try {
            // Disable button and show loading
            this.downloadCsvBtn.disabled = true;
            this.downloadCsvBtn.textContent = '⏳ Downloading...';
            
            // Fetch CSV file from GitHub repository
            const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/attendance.csv`, {
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No attendance data found. Scan some QR codes first!');
                } else {
                    const errorData = await response.json();
                    throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
                }
            }
            
            const data = await response.json();
            const csvContent = atob(data.content); // Decode base64 content
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Generate filename with current date
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
            const filename = `attendance-${dateStr}.csv`;
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            this.updateStatus(`✅ CSV downloaded successfully: ${filename}`, 'success');
            
        } catch (error) {
            console.error('Error downloading CSV:', error);
            this.updateStatus(`❌ Download failed: ${error.message}`, 'error');
        } finally {
            // Re-enable button
            this.downloadCsvBtn.disabled = false;
            this.downloadCsvBtn.textContent = '📊 Download CSV';
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Attendance App...');
    try {
        window.attendanceApp = new AttendanceApp();
        console.log('✅ Attendance App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing Attendance App:', error);
    }
});

// Service Worker Registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('SW registered'))
            .catch(registrationError => console.log('SW registration failed'));
    });
}

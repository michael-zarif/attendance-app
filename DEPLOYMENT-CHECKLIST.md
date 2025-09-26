# 📋 Deployment Checklist

## ✅ **Pre-Deployment**

- [ ] All files committed to GitHub repository
- [ ] `.github/workflows/attendance.yml` file present
- [ ] Repository is public (for GitHub Pages)

## 🔧 **Repository Setup**

- [ ] **GitHub Pages enabled**: Settings → Pages → Deploy from main branch
- [ ] **Actions permissions set**: Settings → Actions → General → "Read and write permissions"
- [ ] **Allow GitHub Actions to create PRs**: Checkbox checked

## 🔑 **Personal Access Token**

- [ ] **Token created**: GitHub Settings → Developer settings → Personal access tokens (classic)
- [ ] **Scopes selected**:
  - [ ] `repo` (Full control of repositories)
  - [ ] `workflow` (Update GitHub Action workflows)
- [ ] **Token copied** (starts with `ghp_...`)

## 📱 **App Configuration**

- [ ] **Open deployed app**: `https://YOUR-USERNAME.github.io/REPO-NAME`
- [ ] **Click Settings** ⚙️
- [ ] **Enter configuration**:
  - [ ] GitHub Token: `ghp_...`
  - [ ] Repository Owner: `your-username`
  - [ ] Repository Name: `qr-attendance-app`
- [ ] **Test configuration**: Should show "Configuration saved and tested successfully!"

## 🧪 **Testing**

- [ ] **Camera access**: "Start Camera" button works
- [ ] **QR scan test**: Point at QR code
- [ ] **Success message**: Shows "✅ Attendance recorded successfully!"
- [ ] **Check GitHub Issues**: New issue created with attendance data
- [ ] **Check CSV file**: `attendance.csv` updated in repository
- [ ] **Check Actions**: Workflow run visible in Actions tab

## 📱 **Mobile Installation (Optional)**

### iOS
- [ ] Open in Safari
- [ ] Share → "Add to Home Screen"
- [ ] App icon appears on home screen

### Android  
- [ ] Open in Chrome
- [ ] Menu (⋮) → "Add to Home screen"
- [ ] App icon appears on home screen

## 🔍 **Troubleshooting**

If issues occur, check:
- [ ] Browser console for error messages
- [ ] Repository Actions tab for workflow failures
- [ ] Token permissions and expiration
- [ ] Repository settings for Actions permissions

## ✅ **Deployment Complete!**

Your QR Attendance App is now live and ready for use! 🎉

**App URL**: `https://YOUR-USERNAME.github.io/REPO-NAME`
**Data Location**: GitHub Issues + CSV file in your repository

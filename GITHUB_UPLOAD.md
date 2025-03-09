# Uploading LogiTrack to GitHub

Follow these steps to upload the LogiTrack application to GitHub:

## Prerequisites

1. Create a GitHub account if you don't have one already
2. Create a new repository named "logistics_app_MK_IV" on GitHub
3. Ensure Git is installed on your computer

## Upload Instructions

Since you already have the repository initialized and committed locally, follow these steps:

### 1. Configure GitHub Authentication

You need to authenticate with GitHub. You can use either:

- Personal Access Token (recommended for CLI)
- SSH keys
- GitHub CLI authentication

### 2. Using Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token
2. Give it a name, set expiration, and select repo scope
3. Copy the token

### 3. Push the Repository

```bash
# Navigate to your local repository
cd /path/to/logistics-app

# Add the GitHub repository as a remote (if not already done)
git remote add origin https://github.com/Anastasios3/logistics_app_MK_IV.git

# Push to GitHub (you'll be prompted for your GitHub username and the token as password)
git push -u origin main
```

### 4. Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# Authenticate with GitHub CLI
gh auth login

# Push to GitHub
gh repo create Anastasios3/logistics_app_MK_IV --source=. --private --push
```

### 5. Verify Upload

1. Go to https://github.com/Anastasios3/logistics_app_MK_IV
2. You should see all the files from your local repository

## Troubleshooting

If you encounter any issues:

1. Ensure your GitHub credentials are correct
2. Check that the repository name and URL are correct
3. If you get permission errors, make sure you have the correct access level to the repository

For more help, visit: https://docs.github.com/en/get-started/importing-your-projects-to-github
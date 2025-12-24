# Required Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

## Required Variables

1. **MONGODB_URI**
   - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/?appName=RSM2026`

2. **NEXTAUTH_SECRET**
   - A random secret string for NextAuth.js session encryption
   - Generate with: `openssl rand -base64 32`
   - Example: `BvXDSWo2hpZkRqUFbW/fOY0jlva0IN9MGrrbjAGt8So=`

3. **NEXTAUTH_URL**
   - Your production URL
   - Example: `https://your-domain.vercel.app`

## Optional Variables (with defaults)

4. **APP_ORIGIN**
   - Your app's origin URL (defaults to `http://localhost:3000`)
   - Example: `https://your-domain.vercel.app`

5. **ADMIN_EMAIL**
   - Admin login email (defaults to `admin@example.com`)

6. **ADMIN_PASSWORD**
   - Admin login password (defaults to `changeMeNow!`)

7. **CERT_HMAC_SECRET**
   - Secret for HMAC certificate URL signing
   - Generate with: `openssl rand -base64 32`

8. **MINISTER_NAME**
   - Minister's name for certificates (defaults to `Ponnam Prabhakar`)

9. **MINISTER_TITLE**
   - Minister's title (defaults to `Hon'ble Cabinet Minister`)

10. **PRINCIPAL_SECRETARY_NAME**
    - Principal Secretary name (defaults to `Principal Secretary`)

11. **PRINCIPAL_SECRETARY_TITLE**
    - Principal Secretary title (defaults to `Principal Secretary, Transport Department`)

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with its value
4. Make sure to select the appropriate environments (Production, Preview, Development)
5. Redeploy your application

## Critical Variables

The **MONGODB_URI** and **NEXTAUTH_SECRET** are critical and must be set for the app to function properly.


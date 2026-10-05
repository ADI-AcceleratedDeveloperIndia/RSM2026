# Setup Instructions

## Quick Start

1. **Install Dependencies**
```bash
npm install
# or
pnpm install
```

2. **Set up Environment Variables**

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeMeNow!
APP_ORIGIN=http://localhost:3000
CERT_HMAC_SECRET=super-long-random-hmac-secret-change-this
MINISTER_NAME=Ponnam Prabhakar
MINISTER_TITLE=Hon'ble Cabinet Minister of Government of Telangana
PRINCIPAL_SECRETARY_NAME=<<Principal Secretary Name>>
PRINCIPAL_SECRETARY_TITLE=Principal Secretary, Transport Department
NEXTAUTH_URL=http://localhost:3000
```

3. **Seed the Database**

```bash
npm run seed
# or
pnpm seed
```

4. **Add Placeholder Assets**

Replace the placeholder files in `/public/assets/` with actual images:

- `/public/assets/minister/photo.jpg` - Minister photo (recommended: 300x400px)
- `/public/assets/seals/telangana-emblem.png` - Telangana emblem (recommended: 600x600px)
- `/public/assets/signatures/minister.png` - Minister signature (recommended: 200x100px)
- `/public/assets/signatures/secretary.png` - Principal Secretary signature (recommended: 200x100px)
- `/public/assets/signatures/rta/hyd-01.png` - HYD-01 RTA signature (recommended: 200x100px)
- `/public/assets/signatures/rta/krm-01.png` - KRM-01 RTA signature (recommended: 200x100px)

**Note**: The placeholder files currently contain text. Replace them with actual image files.

5. **Run Development Server**

```bash
npm run dev
# or
pnpm dev
```

6. **Access the Application**

- Frontend: http://localhost:3000
- Admin Login: http://localhost:3000/admin/login

## Generating Secrets

### NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### CERT_HMAC_SECRET
```bash
openssl rand -base64 64
```

## MongoDB Setup

1. Create a MongoDB Atlas account (free tier available)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or 0.0.0.0/0 for development)
5. Get the connection string and add it to `.env.local`

## Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env.local`
4. Update `APP_ORIGIN` and `NEXTAUTH_URL` to your Vercel domain
5. Deploy
6. Run seed script after first deployment

## Troubleshooting

### PDF Generation Issues
- Ensure all assets exist in `/public/assets/`
- Check file permissions
- Verify `@sparticuz/chromium` is in dependencies

### Database Connection
- Verify MongoDB URI format
- Check IP whitelist
- Verify database user permissions

### Admin Login
- Ensure seed script ran successfully
- Check password in `.env.local` matches
- Verify `NEXTAUTH_SECRET` is set











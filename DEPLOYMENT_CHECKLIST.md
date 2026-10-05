# Deployment Checklist

## Pre-Deployment

### Environment Variables
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `NEXTAUTH_SECRET` - Generated with `openssl rand -base64 32`
- [ ] `ADMIN_EMAIL` - Admin login email
- [ ] `ADMIN_PASSWORD` - Strong admin password
- [ ] `APP_ORIGIN` - Production URL (e.g., https://your-app.vercel.app)
- [ ] `CERT_HMAC_SECRET` - Long random string for signing URLs
- [ ] `MINISTER_NAME` - Actual minister name
- [ ] `MINISTER_TITLE` - Actual minister title
- [ ] `PRINCIPAL_SECRETARY_NAME` - Actual name
- [ ] `PRINCIPAL_SECRETARY_TITLE` - Actual title
- [ ] `NEXTAUTH_URL` - Same as APP_ORIGIN

### Assets
- [ ] Replace `/public/assets/minister/photo.jpg` with actual photo
- [ ] Replace `/public/assets/seals/telangana-emblem.png` with actual emblem
- [ ] Replace `/public/assets/signatures/minister.png` with actual signature
- [ ] Replace `/public/assets/signatures/secretary.png` with actual signature
- [ ] Replace `/public/assets/signatures/rta/hyd-01.png` with actual signature
- [ ] Replace `/public/assets/signatures/rta/krm-01.png` with actual signature
- [ ] Add more region signatures as needed

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with read/write permissions
- [ ] IP whitelist configured (0.0.0.0/0 for Vercel)
- [ ] Connection string obtained
- [ ] Seed script run after deployment

### Code
- [ ] All dependencies installed
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No linting errors
- [ ] Test certificate generation locally
- [ ] Test PDF download locally
- [ ] Test admin login
- [ ] Test quiz submission
- [ ] Test verification page

## Vercel Deployment

### Setup
- [ ] Project pushed to Git repository
- [ ] Vercel project created and connected
- [ ] All environment variables added in Vercel dashboard
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `.next` (default)
- [ ] Node.js version: 18.x or higher

### Post-Deployment
- [ ] Run seed script: `npm run seed` (or manually create admin user)
- [ ] Test production URL
- [ ] Test certificate generation
- [ ] Test PDF download
- [ ] Test admin login
- [ ] Test verification page
- [ ] Test quiz
- [ ] Test language toggle
- [ ] Verify all assets load correctly

## Security Checklist
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] `CERT_HMAC_SECRET` is long and random
- [ ] `ADMIN_PASSWORD` is strong
- [ ] MongoDB database user has minimal required permissions
- [ ] IP whitelist configured appropriately
- [ ] Environment variables not committed to Git
- [ ] `.env.local` in `.gitignore`

## Performance
- [ ] Images optimized (Next.js Image component used where applicable)
- [ ] MongoDB indexes created (certificateId is indexed)
- [ ] Vercel function timeout sufficient (default 10s, may need increase for PDF)
- [ ] CDN caching configured for static assets

## Testing
- [ ] Home page loads
- [ ] Navigation works
- [ ] Language toggle works
- [ ] Certificate generation form works
- [ ] PDF downloads successfully
- [ ] QR code verification works
- [ ] Quiz submission works
- [ ] Event logging works
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] CSV export works
- [ ] All pages accessible

## Content
- [ ] Minister message updated
- [ ] All placeholder content replaced
- [ ] Telugu translations verified
- [ ] Contact information updated (if applicable)

## Final Steps
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Analytics configured (optional: @vercel/analytics)
- [ ] Monitoring set up (optional)
- [ ] Backup strategy for MongoDB

## Go Live
- [ ] All checkboxes above completed
- [ ] Final production test passed
- [ ] Stakeholders notified
- [ ] Documentation updated











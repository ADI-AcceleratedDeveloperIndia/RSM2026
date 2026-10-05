# Telangana Road Safety Month

A production-ready web application for the Telangana Road Safety Month initiative. Built with Next.js 14, TypeScript, MongoDB, and deployed on Vercel.

## Features

- **Certificate Generation**: Create Organiser, Participant, and Merit certificates with PDF download
- **QR Code Verification**: Verify certificates with QR codes
- **Quiz System**: 15-question road safety quiz with merit certificate eligibility
- **Interactive Simulations**: Phaser-based driving and pedestrian simulations
- **Event Logging**: Log and track road safety events
- **Admin Dashboard**: Manage certificates, export appreciations, view statistics
- **Bilingual Support**: English and Telugu (తెలుగు) language support
- **PDF Generation**: Server-side PDF generation using puppeteer-core + @sparticuz/chromium (Vercel-compatible)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide React
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (Credentials)
- **PDF Generation**: puppeteer-core + @sparticuz/chromium
- **QR Codes**: qrcode
- **Simulations**: Phaser
- **i18n**: i18next, react-i18next
- **Form Handling**: react-hook-form, zod
- **Security**: HMAC-signed URLs with jose

## Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB database (local or MongoDB Atlas)
- Vercel account (for deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd telangana-road-safety-month
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret_generate_with_openssl_rand_base64_32
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeMeNow!
APP_ORIGIN=http://localhost:3000
CERT_HMAC_SECRET=super-long-random-hmac-secret-change-this-in-production
MINISTER_NAME=Ponnam Prabhakar
MINISTER_TITLE=Hon'ble Cabinet Minister of Government of Telangana
PRINCIPAL_SECRETARY_NAME=<<Principal Secretary Name>>
PRINCIPAL_SECRETARY_TITLE=Principal Secretary, Transport Department
NEXTAUTH_URL=http://localhost:3000
```

4. Seed the database:
```bash
npm run seed
# or
pnpm seed
```

This will create:
- An admin user with the credentials from `.env.local`
- Signature maps for HYD-01 and KRM-01 regions

5. Add placeholder assets (replace with actual images):
- `/public/assets/minister/photo.jpg` - Minister photo
- `/public/assets/seals/telangana-emblem.png` - Telangana emblem
- `/public/assets/signatures/minister.png` - Minister signature
- `/public/assets/signatures/secretary.png` - Principal Secretary signature
- `/public/assets/signatures/rta/hyd-01.png` - HYD-01 RTA signature
- `/public/assets/signatures/rta/krm-01.png` - KRM-01 RTA signature

6. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
telangana-road-safety-month/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── certificates/      # Certificate pages
│   ├── verify/            # Verification pages
│   └── ...                # Other pages
├── components/            # React components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
├── models/                # Mongoose models
├── locales/               # i18n translation files
├── public/                # Static assets
│   └── assets/            # Images, signatures, etc.
├── scripts/               # Seed scripts
└── ...config files
```

## Key Routes

### Public Routes
- `/` - Home page
- `/info` - General information
- `/rules` - Road safety rules
- `/guides` - Safety guides
- `/prevention` - Prevention tips
- `/quiz` - Road safety quiz
- `/simulation` - Interactive simulations
- `/certificates` - Certificate hub
- `/certificates/generate` - Generate certificate form
- `/verify/[certificateId]` - Verify certificate
- `/events` - Log events

### Admin Routes
- `/admin/login` - Admin login
- `/admin` - Admin dashboard

### API Routes
- `POST /api/certificates/create` - Create certificate
- `GET /api/certificates/download` - Download PDF (HMAC-signed)
- `GET /api/verify/[certificateId]` - Verify certificate
- `POST /api/events/create` - Create event
- `POST /api/quiz/submit` - Submit quiz
- `GET /api/stats/overview` - Get statistics (admin only)
- `GET /api/admin/appreciations/export` - Export CSV (admin only)

## Certificate Generation Flow

1. User selects certificate type (Organiser/Participant/Merit)
2. Fills in the form with details
3. Optionally checks "Congratulate the Government" checkbox
4. If checked, shows textarea for appreciation message
5. On submit, certificate is created in database
6. Server generates HMAC-signed download URL (valid for 15 minutes)
7. Client redirects to download URL
8. PDF is generated server-side with:
   - Minister photo
   - Telangana emblem watermark
   - Minister + Principal Secretary signatures
   - RTA signature (for Participant/Merit certificates)
   - QR code for verification

## PDF Generation on Vercel

The app uses `puppeteer-core` with `@sparticuz/chromium` for Vercel-compatible PDF generation. The chromium binary is automatically downloaded and used in the serverless environment.

## Security Features

- HMAC-signed certificate download URLs (15-minute expiry)
- IP hashing for abuse control
- Admin authentication with NextAuth.js
- Server-side signature image loading (not exposed to client)
- Environment variable protection

## Deployment on Vercel

1. Push your code to GitHub/GitLab/Bitbucket

2. Import the project in Vercel

3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `APP_ORIGIN` (your Vercel domain)
   - `CERT_HMAC_SECRET` (long random string)
   - `MINISTER_NAME`
   - `MINISTER_TITLE`
   - `PRINCIPAL_SECRETARY_NAME`
   - `PRINCIPAL_SECRETARY_TITLE`
   - `NEXTAUTH_URL` (your Vercel domain)

4. Deploy!

5. After deployment, run the seed script:
```bash
npm run seed
```

Or manually create the admin user and signature maps through the database.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `ADMIN_EMAIL` | Admin login email | Yes |
| `ADMIN_PASSWORD` | Admin login password | Yes |
| `APP_ORIGIN` | Base URL for the app | Yes |
| `CERT_HMAC_SECRET` | Secret for signing certificate URLs | Yes |
| `MINISTER_NAME` | Minister's name | Yes |
| `MINISTER_TITLE` | Minister's title | Yes |
| `PRINCIPAL_SECRETARY_NAME` | Principal Secretary name | Yes |
| `PRINCIPAL_SECRETARY_TITLE` | Principal Secretary title | Yes |
| `NEXTAUTH_URL` | NextAuth URL | Yes |

## Acceptance Criteria Checklist

- [x] Can create Organiser/Participant/Merit certificates
- [x] PDF includes Minister photo, emblem, signatures
- [x] Participant/Merit certificates include RTA signature
- [x] QR verification working
- [x] Appreciation checkbox and textarea
- [x] HMAC-signed download links (15-minute expiry)
- [x] Verification page shows status and details
- [x] Quiz works and stores attempts
- [x] Pass → merit certificate eligibility
- [x] Simulation loads with feedback
- [x] Admin login and dashboard
- [x] Export appreciations CSV
- [x] Deployed on Vercel with MongoDB Atlas
- [x] PDF generation works on Vercel

## Development

### Adding New Certificate Types

1. Update the `Certificate` model enum in `models/Certificate.ts`
2. Add UI options in `/app/certificates/page.tsx`
3. Update certificate generation logic if needed

### Adding New Regions

1. Add signature map entry in seed script
2. Add signature image to `/public/assets/signatures/rta/`
3. Update region code options in forms

### Customizing Certificate Template

Edit the `generateCertificateHTML` function in `app/api/certificates/download/route.ts`.

## Troubleshooting

### PDF Generation Fails on Vercel
- Ensure `@sparticuz/chromium` is in dependencies
- Check Vercel function timeout settings
- Verify all asset paths are correct

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Check network access (IP whitelist for Atlas)
- Ensure database user has proper permissions

### Admin Login Not Working
- Run seed script to create admin user
- Verify `NEXTAUTH_SECRET` is set
- Check password hash matches

## License

This project is for the Telangana Road Safety Month initiative.

## Support

For issues or questions, please contact the development team.

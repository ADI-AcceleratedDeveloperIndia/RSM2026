# Vercel Environment Variables - Final List

| Key | Value | Note |
|-----|-------|------|
| `MONGODB_URI` | `mongodb+srv://accelerateddeveloperindia_db_user:udGIs3RLzkFKzR88@rsm2026.m79iaow.mongodb.net/?appName=RSM2026` | Required - MongoDB connection string |
| `NEXTAUTH_SECRET` | `BvXDSWo2hpZkRqUFbW/fOY0jlva0IN9MGrrbjAGt8So=` | Required - NextAuth session encryption |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Required - Replace with your actual Vercel URL |
| `APP_ORIGIN` | `https://your-app-name.vercel.app` | Required - Replace with your actual Vercel URL |
| `CERT_HMAC_SECRET` | `ia4tnGwsH6WAa+GDdj1sJqr7GTlOH4PJUIrIEhWYsek=` | Required - Certificate URL signing secret |

## Quick Setup Steps

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable from the table above
3. Select all environments: **Production**, **Preview**, **Development**
4. Replace `your-app-name.vercel.app` with your actual deployment URL
5. Redeploy your application

## Notes

- ✅ All 5 variables are required
- ✅ Minister/Secretary names are hardcoded in the app (no env vars needed)
- ✅ Admin credentials use default login (no env vars needed)
- ⚠️ Keep `MONGODB_URI` and `NEXTAUTH_SECRET` secure



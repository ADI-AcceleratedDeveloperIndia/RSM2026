# Vercel Environment Variables - Copy These Values

## Add these in Vercel Dashboard: Settings → Environment Variables

### Required Variables

```
MONGODB_URI=mongodb+srv://accelerateddeveloperindia_db_user:udGIs3RLzkFKzR88@rsm2026.m79iaow.mongodb.net/?appName=RSM2026
```

```
NEXTAUTH_SECRET=BvXDSWo2hpZkRqUFbW/fOY0jlva0IN9MGrrbjAGt8So=
```

```
NEXTAUTH_URL=https://your-app-name.vercel.app
```
**Note:** Replace `your-app-name` with your actual Vercel app name

### Important Variables

```
APP_ORIGIN=https://your-app-name.vercel.app
```
**Note:** Replace `your-app-name` with your actual Vercel app name

```
CERT_HMAC_SECRET=ia4tnGwsH6WAa+GDdj1sJqr7GTlOH4PJUIrIEhWYsek=
```

**Note:** Minister and Secretary names are already in the code, no need to add them as environment variables.

## Quick Copy-Paste for Vercel

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add each variable one by one with the values above
3. Make sure to select **Production**, **Preview**, and **Development** environments
4. After adding all variables, redeploy your application

## Important Notes

- Replace `your-app-name.vercel.app` with your actual Vercel deployment URL
- The `CERT_HMAC_SECRET` should be changed to a more secure random string in production
- Keep `MONGODB_URI` and `NEXTAUTH_SECRET` secure - never commit them to git


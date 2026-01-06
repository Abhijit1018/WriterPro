# WriterPro Deployment Guide

## Deploying to Vercel (Frontend) + Railway (Backend)

### Prerequisites
- GitHub account with WriterPro repository
- [Railway account](https://railway.app/) (sign up with GitHub)
- [Vercel account](https://vercel.com/) (sign up with GitHub)

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project
1. Go to [Railway](https://railway.app/) and log in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your **WriterPro** repository
5. Select the **backend** folder as the root directory

### Step 2: Add PostgreSQL Database
1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create a database

### Step 3: Configure Environment Variables
1. Click on your **backend service**
2. Go to **"Variables"** tab
3. Add these variables:

```
SECRET_KEY=your-random-secret-key-here-generate-a-strong-one
DEBUG=False
ALLOWED_HOSTS=your-backend.railway.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**To generate a SECRET_KEY**, run locally:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

4. Railway automatically adds `DATABASE_URL` - no need to add it manually

### Step 4: Deploy
1. Railway will automatically deploy using the Procfile configuration
2. Once the app is deployed, go to **"Deployments"** → Select the latest deployment
3. Click **"Terminal"** tab and run these commands:
```bash
cd backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser  # Optional: create admin user
```
4. Copy your backend URL from the top of the Railway dashboard (e.g., `https://your-backend.railway.app`)

### Step 5: Update Environment Variables
1. Once deployed, update your `ALLOWED_HOSTS` with the actual Railway domain
3. Update **ALLOWED_HOSTS** variable with your Railway domain

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project
1. Go to [Vercel](https://vercel.com/) and log in
2. Click **"Add New"** → **"Project"**
3. Import your **WriterPro** repository
4. Select **"Import"**

### Step 2: Configure Build Settings
1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### Step 3: Add Environment Variables
1. In Vercel project settings, go to **"Environment Variables"**
2. Add:
```
VITE_API_URL=https://your-backend.railway.app
```
(Use the Railway backend URL from Part 1)

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for deployment to complete
3. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### Step 5: Update Backend CORS
1. Go back to **Railway**
2. Update the `CORS_ALLOWED_ORIGINS` variable:
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## Part 3: Update Frontend API Configuration

You need to update your frontend to use the environment variable for API calls.

### Update API base URL in frontend code:
Look for API calls in your frontend (likely in `src/components/*.jsx` or `src/slices/*.js`) and ensure they use:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

Instead of hardcoded `http://localhost:8000`.

---

## Part 4: Final Steps

### 1. Create Superuser (Admin)
In Railway, go to your backend service and open the **"Terminal"** tab:
```bash
python manage.py createsuperuser
```

### 2. Test Your Deployment
1. Visit your Vercel frontend URL
2. Test login/signup functionality
3. Visit `https://your-backend.railway.app/admin` for Django admin

### 3. Push Changes to GitHub
```bash
git add .
git commit -m "Configure for production deployment"
git push origin master
```

Both Vercel and Railway will auto-deploy when you push to GitHub!

---

## Troubleshooting

### Backend Issues:
- **500 Error**: Check Railway logs for errors
- **CORS Error**: Verify `CORS_ALLOWED_ORIGINS` includes your Vercel URL
- **Database Error**: Check if migrations ran successfully

### Frontend Issues:
- **API not connecting**: Verify `VITE_API_URL` is set correctly in Vercel
- **Build fails**: Check build logs in Vercel dashboard

### Common Commands (Railway Terminal):
```bash
# View migrations
python manage.py showmigrations

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Check installed packages
pip list
```

---

## Cost Summary
- **Railway**: Free tier includes $5/month credit (enough for small apps)
- **Vercel**: Free tier includes unlimited deployments
- **PostgreSQL on Railway**: Included in free tier

---

## Next Steps After Deployment
1. Set up custom domain (optional)
2. Configure email backend for password reset
3. Set up backup strategy for database
4. Monitor application performance
5. Set up CI/CD pipelines

Good luck with your deployment! 🚀

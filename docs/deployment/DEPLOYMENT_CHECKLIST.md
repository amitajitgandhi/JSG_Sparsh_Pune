# ?? Quick Deployment Checklist

A condensed checklist for deploying JSG SPARSH Portal to production.

## ? Pre-Deployment Checklist

### **Code Preparation**
- [ ] All features tested locally
- [ ] Latest code committed and pushed to GitHub
- [ ] Build passes locally (`npm run build`)
- [ ] Environment variables configured locally
- [ ] Database migrations tested

### **Supabase Setup**
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Storage bucket configured
- [ ] RLS policies enabled
- [ ] API keys copied and saved securely

### **Vercel Setup**
- [ ] GitHub repository connected to Vercel
- [ ] Environment variables added to Vercel
- [ ] Build and deployment settings configured
- [ ] Domain name configured (if using custom domain)

## ?? Deployment Steps

### **1. Supabase Configuration (5 minutes)**
```bash
# Copy these values from Supabase Dashboard ? Settings ? API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Vercel Deployment (3 minutes)**
1. Import GitHub repository to Vercel
2. Add environment variables
3. Deploy project
4. Verify deployment success

### **3. Testing (5 minutes)**
- [ ] Homepage loads correctly
- [ ] Registration form works
- [ ] Photo upload functions
- [ ] Admin dashboard accessible
- [ ] CSV export works
- [ ] Mobile responsiveness

## ?? Common Issues Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Build fails | Check `next.config.js` - ensure no `output: 'export'` |
| 500 error on API | Verify environment variables in Vercel |
| Photo upload fails | Check Supabase storage bucket permissions |
| Database connection fails | Verify Supabase project is not paused |
| CSV export empty | Ensure database has test data |

## ?? Post-Deployment Testing URLs

Replace `your-project.vercel.app` with your actual domain:

- **Homepage**: `https://your-project.vercel.app/`
- **Registration**: `https://your-project.vercel.app/register-now`
- **Admin Dashboard**: `https://your-project.vercel.app/admin`
- **About Page**: `https://your-project.vercel.app/about`
- **SPL 02 Info**: `https://your-project.vercel.app/spl02`

## ?? Success Criteria

### **Deployment is successful when:**
- [ ] All pages load without errors
- [ ] Registration form accepts submissions
- [ ] Photos upload and URLs save to database
- [ ] Admin dashboard shows registration data
- [ ] CSV export downloads successfully
- [ ] Mobile navigation works smoothly
- [ ] All API endpoints respond correctly

## ?? Quick Update Process

For future updates:

1. **Make changes locally**
2. **Test thoroughly** (`npm run dev`)
3. **Commit and push** to GitHub
4. **Vercel auto-deploys** from main branch
5. **Test production** deployment
6. **Monitor** for any issues

## ?? Emergency Contacts

- **Vercel Status**: https://www.vercel-status.com/
- **Supabase Status**: https://status.supabase.com/
- **GitHub Repository**: https://github.com/ag241290/JSG_Sparsh_Pune

---

**Total Deployment Time: ~15 minutes** ??

*For detailed instructions, see [VERCEL_SUPABASE_SETUP.md](./VERCEL_SUPABASE_SETUP.md)*
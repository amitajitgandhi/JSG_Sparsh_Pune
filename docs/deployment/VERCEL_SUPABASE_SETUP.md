# Vercel & Supabase Deployment Guide

Complete step-by-step guide for deploying JSG SPARSH Portal with Vercel and Supabase integration.

## ?? Prerequisites

Before starting, ensure you have:
- [GitHub account](https://github.com) for code repository
- [Vercel account](https://vercel.com) for deployment
- [Supabase account](https://supabase.com) for database
- Local development environment set up and working

## ??? Phase 1: Supabase Database Setup

### **Step 1: Create Supabase Project**

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Click "Start your project" or "Sign In"
   - Sign up/in with GitHub (recommended for easy integration)

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Fill in project details:
     - **Name**: `jsg-sparsh-portal` (or similar)
     - **Database Password**: Generate strong password (save it!)
     - **Region**: Choose closest to your users (e.g., "Southeast Asia (Singapore)" for India)
   - Click "Create new project"
   - Wait 2-3 minutes for project initialization

3. **Note Your Project Details**
   ```
   Project URL: https://your-project-ref.supabase.co
   Project ID: your-project-ref
   Region: your-chosen-region
   ```

### **Step 2: Database Schema Setup**

1. **Access SQL Editor**
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New query"

2. **Run the Migration**
   - Copy the content from `supabase/migrations/001_create_registrations.sql`
   - Paste into the SQL editor
   - Click "Run" button
   - Verify "Success. No rows returned" message

3. **Verify Table Creation**
   - Go to "Database" ? "Tables"
   - You should see "registrations" table
   - Click on it to verify all columns are created correctly

### **Step 3: Storage Bucket Setup**

1. **Create Storage Bucket**
   - Go to "Storage" in the sidebar
   - The "registration-photos" bucket should already be created by the migration
   - If not, click "Create bucket":
     - **Name**: `registration-photos`
     - **Public**: ? Enable
     - Click "Create bucket"

2. **Configure Bucket Policies**
   - Click on the "registration-photos" bucket
   - Go to "Policies" tab
   - Verify these policies exist (they should be created by migration):
     - Allow public uploads
     - Allow public reads
   - If missing, add them manually using the policy editor

### **Step 4: Get API Keys**

1. **Navigate to API Settings**
   - Go to "Settings" ? "API"
   - You'll see several keys listed

2. **Copy Required Keys**
   ```
   Project URL: https://your-project-ref.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **?? Security Note**
   - **anon key**: Safe to use in frontend (public)
   - **service_role key**: Keep secret, never expose in frontend

## ?? Phase 2: Vercel Deployment Setup

### **Step 1: Prepare GitHub Repository**

1. **?? CRITICAL: Check vercel.json Configuration**
   
   If you have a `vercel.json` file, ensure it's configured correctly:
   
   **? INCORRECT (causes 404 errors):**
   ```json
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "out"
         }
       }
     ]
   }
   ```
   
   **? CORRECT (for Next.js with API routes):**
   ```json
   {
     "framework": "nextjs"
   }
   ```
   
   **Or better yet, delete `vercel.json` completely** - Vercel will auto-detect Next.js!

2. **Ensure .gitignore is Configured**
   ```gitignore
   # Next.js build artifacts (DO NOT COMMIT)
   .next/
   out/
   build/
   dist/
   
   # Environment variables
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local
   
   # Dependencies
   node_modules/
   
   # Other common exclusions
   .DS_Store
   Thumbs.db
   .vercel
   .supabase/
   ```

3. **Remove Build Artifacts (if present)**

   ```bash
   # If you accidentally committed build files
   git rm -r --cached out/ .next/ 2>/dev/null || true
   git commit -m "Remove build artifacts" 2>/dev/null || true
   ```

4. **Push Latest Code**
   ```bash
   git add .
   git commit -m "Fix vercel.json and prepare for deployment"
   git push origin main
   ```

5. **Verify Repository Structure**
   - Ensure `package.json` has correct scripts
   - Verify `next.config.js` is properly configured (NO `output: 'export'`)
   - Check that API routes are in place
   - Confirm `.gitignore` excludes build artifacts
   - **MOST IMPORTANT**: Verify `vercel.json` doesn't use static build configuration

### **Step 2: Connect to Vercel**

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/in with GitHub (recommended)

2. **Import Project**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your GitHub repository: `JSG_Sparsh_Pune`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build and Output Settings**: Leave as default
   - **Install Command**: `npm install`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### **Step 3: Environment Variables Setup**

1. **In Vercel Project Settings**
   - After importing, you'll be on the project configuration page
   - Scroll down to "Environment Variables" section

2. **Add Required Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project-ref.supabase.co
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Environment Settings**
   - Make sure all environments are selected:
     - ? Production
     - ? Preview
     - ? Development

### **Step 4: Deploy**

1. **Start Deployment**
   - Click "Deploy" button
   - Wait for build process to complete (2-5 minutes)

2. **Monitor Build Process**
   - Watch the build logs for any errors
   - Common issues and solutions below

3. **Verify Deployment**
   - Once deployed, you'll get a URL: `https://your-project.vercel.app`
   - Click "Visit" to test your site

## ? Phase 3: Testing & Verification

### **Step 1: Basic Site Testing**

1. **Homepage Test**
   - Visit your Vercel URL
   - Verify homepage loads correctly
   - Check responsive design on mobile

2. **Navigation Test**
   - Test all navigation links
   - Verify all pages load without errors
   - Check mobile menu functionality

### **Step 2: Registration System Testing**

1. **Access Registration Page**
   - Go to `/register-now`
   - Test category selection
   - Verify form fields appear correctly

2. **Photo Upload Test**
   - Try uploading different image formats (JPG, PNG, HEIC)
   - Test file size limits (should reject > 10MB)
   - Verify photo preview functionality

3. **Form Submission Test**
   - Fill out complete registration form
   - Submit and verify success message
   - Check if data appears in Supabase dashboard

### **Step 3: Admin Dashboard Testing**

1. **Access Admin Page**
   - Go to `/admin`
   - Verify registration data displays
   - Test search and filter functionality

2. **CSV Export Test**
   - Click "Export All Data" button
   - Verify CSV downloads correctly
   - Check that all fields are included

3. **Refresh Functionality**
   - Test refresh button
   - Verify loading states work

### **Step 4: Database Verification**

1. **Check Supabase Dashboard**
   - Go to "Database" ? "Tables" ? "registrations"
   - Verify test registration data is saved
   - Check that photo URLs are populated

2. **Storage Verification**
   - Go to "Storage" ? "registration-photos"
   - Verify uploaded photos are stored
   - Test that photo URLs are accessible

## ?? Common Issues & Solutions

### **Build Errors**

**Issue**: TypeScript compilation errors
```
Solution:
1. Check tsconfig.json configuration
2. Verify all imports are correct
3. Run `npm run build` locally first
4. Fix any type errors before deployment
```

**Issue**: Missing environment variables
```
Solution:
1. Double-check environment variable names
2. Ensure no extra spaces in values
3. Verify all three variables are set
4. Redeploy after adding variables
```

### **Database Connection Issues**

**Issue**: "Failed to connect to database"
```
Solution:
1. Verify Supabase project is active (not paused)
2. Check API keys are correct
3. Ensure database migration was run successfully
4. Test connection using Supabase dashboard
```

**Issue**: "Table does not exist"
```
Solution:
1. Go to Supabase SQL Editor
2. Run the migration script again
3. Verify table creation in Database ? Tables
4. Check Row Level Security policies
```

### **File Upload Issues**

**Issue**: Photo upload fails
```
Solution:
1. Verify storage bucket exists and is public
2. Check storage policies in Supabase
3. Test file size and format requirements
4. Verify CORS settings if needed
```

**Issue**: Photo URLs not saving to database
```
Solution:
1. Check that photo upload completes before registration creation
2. Verify photo_url column exists in database
3. Test with smaller file sizes
4. Check server logs for detailed errors
```

### **Performance Issues**

**Issue**: Slow loading times
```
Solution:
1. Optimize images in public folder
2. Check Vercel region settings
3. Verify Supabase region matches user location
4. Enable Vercel Analytics for detailed metrics
```

### **Deployment and Routing Issues**

**Issue**: Getting 404 errors for `/spl02`, `/register-now`, `/admin` routes
```
Solution:
1. Check if vercel.json has static build configuration - DELETE IT!
2. Ensure next.config.js doesn't have 'output: export'
3. Verify pages exist in correct app/ directory structure
4. Redeploy after fixing vercel.json
5. Check Vercel build logs for errors
```

**Issue**: Home page UI is broken or missing
```
Solution:
1. Check if CSS files are being loaded correctly
2. Verify component imports in app/page.tsx
3. Ensure globals.css is imported in layout.tsx
4. Check for JavaScript errors in browser console
5. Verify Tailwind CSS configuration
```

**Issue**: API routes returning 404
```
Solution:
1. Remove vercel.json static build configuration
2. Ensure API routes are in app/api/ directory
3. Verify route.ts files export correct HTTP methods
4. Check environment variables are set in Vercel
5. Redeploy after configuration changes
```

**Issue**: Build succeeds but routes still 404
```
Solution:
1. Force redeploy in Vercel dashboard
2. Check Vercel project settings for correct framework detection
3. Clear Vercel cache and redeploy
4. Verify no conflicting routing configurations
5. Check Vercel function logs for errors
```

## ?? Security Best Practices

### **Environment Variables**
- Never commit `.env.local` to GitHub
- Use different Supabase projects for development/production
- Regularly rotate service role keys
- Monitor API usage in Supabase dashboard

### **Database Security**
- Keep Row Level Security enabled
- Regularly backup database
- Monitor for suspicious registration patterns
- Set up alerts for failed login attempts

### **File Upload Security**
- Validate file types on both client and server
- Scan uploaded files for malware (if handling sensitive data)
- Set reasonable file size limits
- Monitor storage usage and costs

## ?? Monitoring & Maintenance

### **Vercel Analytics**
1. Enable Vercel Analytics in project settings
2. Monitor Core Web Vitals
3. Track page load times
4. Monitor API response times

### **Supabase Monitoring**
1. Set up database alerts
2. Monitor storage usage
3. Track API request patterns
4. Regular database maintenance

### **Regular Tasks**
- [ ] Weekly database backup verification
- [ ] Monthly security updates
- [ ] Quarterly performance reviews
- [ ] Monitor and optimize costs

## ?? Support & Troubleshooting

### **Vercel Support**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Status Page](https://www.vercel-status.com/)

### **Supabase Support**
- [Supabase Documentation](https://supabase.com/docs)
- [Community Discord](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

### **Project-Specific Help**
- Check `FEATURES_IMPLEMENTED.md` for feature details
- Review GitHub Issues for known problems
- Test locally before deploying changes
- Keep development and production environments in sync

## ?? Post-Deployment Checklist

### **Immediate Actions**
- [ ] Test all registration flows
- [ ] Verify admin dashboard functionality
- [ ] Check mobile responsiveness
- [ ] Test photo upload and storage
- [ ] Verify CSV export works
- [ ] Test payment flow (when implemented)

### **Performance Optimization**
- [ ] Enable Vercel Analytics
- [ ] Set up Supabase database indexes
- [ ] Optimize image loading
- [ ] Configure CDN settings
- [ ] Test from different geographic locations

### **Security Review**
- [ ] Verify RLS policies are active
- [ ] Check environment variables are secure
- [ ] Test file upload restrictions
- [ ] Review API endpoint security
- [ ] Set up monitoring alerts

### **Documentation Updates**
- [ ] Update README with live URLs
- [ ] Document any deployment-specific configurations
- [ ] Create user guides for admin features
- [ ] Document backup and recovery procedures

---

**Deployment Complete! ??**

Your JSG SPARSH Portal should now be live and fully functional with Supabase backend integration. Remember to test thoroughly and monitor performance metrics.

For ongoing support, refer to the troubleshooting section or contact the development team.
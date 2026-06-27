# Deployment Guide for JSG SPARSH Pune Website

## Quick Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - JSG SPARSH Pune website"
   git branch -M main
   git remote add origin https://github.com/yourusername/jsg-sparsh-pune.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from your GitHub repository
   - Vercel will automatically detect it's a Next.js project
   - Click "Deploy"

## Environment Setup

No environment variables are required for basic functionality.

## Build Commands

- **Development:** `npm run dev`
- **Build:** `npm run build` 
- **Production:** `npm start`

## Custom Domain Setup

1. In your Vercel dashboard, go to Project Settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., jsgsparshpune.com)
4. Follow Vercel's DNS configuration instructions

## Content Updates

### Adding New Events
Edit `app/events/page.tsx` and add new events to the `events` array.

### Updating Committee Members
Edit `app/committee/page.tsx` and update the `committeeMembers` array.

### Adding Gallery Photos
1. Upload images to `public/images/`
2. Update `app/gallery/page.tsx` gallery items

### Site Configuration
- Update contact information in `app/components/Footer.tsx`
- Modify site metadata in `app/layout.tsx`

## Maintenance

- Regularly update dependencies: `npm update`
- Check for security vulnerabilities: `npm audit`
- Monitor site performance in Vercel dashboard
# ?? JSG SPARSH Portal - Setup Guide

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
npm run setup
```

This will create a `.env.local` file with template values.

### 3. Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy your project URL and anon key
5. Update `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Database Setup

Run the SQL commands in `supabase/migrations/` to set up your database tables.

### 5. Start Development Server
```bash
npm run dev
```

## Troubleshooting Registration Issues

### Error: "Database error: TypeError: fetch failed"

This typically means one of the following:

1. **Missing Environment Variables**
   - Check if `.env.local` exists
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
   - Run `npm run setup` if needed

2. **Invalid Supabase URL**
   - Ensure the URL format is correct: `https://your-project-ref.supabase.co`
   - No trailing slashes

3. **Network Issues**
   - Check internet connection
   - Verify Supabase service status

4. **Database Not Set Up**
   - Run the SQL migrations in your Supabase project
   - Ensure the `registrations` table exists

### Testing the API

Visit `http://localhost:3000/api/register` to test the API endpoint. It should return a status message.

## Database Schema

The registration system requires a `registrations` table. See `supabase/migrations/001_create_registrations.sql` for the schema.

## Support

If you encounter issues:
1. Check the browser console for detailed errors
2. Check the server console (terminal where `npm run dev` is running)
3. Verify all environment variables are set correctly
# Fix for Registration Transaction Screenshot Upload Issue

## Problem
The registration form is failing with error: "Failed to upload transaction screenshot. Please check file format and try again."

## Root Cause
The `registration-transaction-ss` bucket likely needs proper RLS (Row Level Security) policies or public access configuration.

## Solution Steps

### Step 1: Run SQL Commands in Supabase
Go to your Supabase project dashboard ? SQL Editor and run the commands in `supabase/fix-bucket-policies.sql`:

```sql
-- Ensure bucket is properly configured
UPDATE storage.buckets 
SET public = true, 
    file_size_limit = 10485760,
    allowed_mime_types = '{"image/jpeg","image/jpg","image/png"}'
WHERE id = 'registration-transaction-ss';

-- Create upload policy
CREATE POLICY "Anyone can upload to registration-transaction-ss" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'registration-transaction-ss');

-- Create view policy  
CREATE POLICY "Anyone can view registration-transaction-ss" ON storage.objects
FOR SELECT USING (bucket_id = 'registration-transaction-ss');
```

### Step 2: Test the Fix
1. Go to `/register-now` on your website
2. Fill out the registration form completely
3. Upload both a profile photo and transaction screenshot
4. Submit the form
5. Check that both files upload successfully

### Step 3: Verify File Separation
After a successful registration, check your Supabase Storage:

- **registration-photos bucket** should contain: `profile-{id}-{timestamp}.{ext}`
- **registration-transaction-ss bucket** should contain: `transaction-{id}-{timestamp}.{ext}`

### Step 4: Alternative Testing (if still failing)
If the issue persists, you can test the storage access directly:

1. Use the test endpoint: `POST /api/test-storage` with an image file
2. Check the console logs for detailed error messages
3. Verify the bucket policies in Supabase

## Updated File Separation Summary

| File Type | Source | Storage Bucket | Function Used |
|-----------|--------|----------------|---------------|
| Profile Photo | Registration Form | `registration-photos` | `uploadPhoto()` |
| Registration Payment Screenshot | Registration Form | `registration-transaction-ss` | `uploadRegistrationTransactionScreenshot()` |
| Donation Screenshot | Social Page | `donation-transaction-ss` | Direct API upload |

## Code Changes Made
1. ? Simplified `uploadRegistrationTransactionScreenshot()` function
2. ? Updated registration API to use correct functions  
3. ? Added better error logging and fallback handling
4. ? Created SQL script for bucket policy fixes

## Expected Behavior After Fix
- ? Profile photos upload to `registration-photos`
- ? Transaction screenshots upload to `registration-transaction-ss`
- ? Registration completes successfully
- ? Files are properly separated by type and source
- ? All modals (Donation, Volunteer, Join Us) work correctly

## Troubleshooting
If uploads still fail after running the SQL commands:

1. Check Supabase Storage dashboard for bucket existence
2. Verify bucket policies are active
3. Check browser console for detailed error messages
4. Ensure file types are correct (JPG, JPEG, PNG only for transactions)
5. Verify file sizes are under 10MB
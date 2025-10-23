# Health Diary Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Clerk account

## 1. Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your actual credentials:

### Supabase Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use an existing one
3. Go to Settings > API
4. Copy your Project URL and anon/public key
5. Update these values in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

### Clerk Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or use an existing one
3. Go to API Keys
4. Copy your Publishable Key and Secret Key
5. Update these values in `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
   ```

## 2. Database Setup

1. In your Supabase project, go to the SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create the necessary tables and policies

## 3. Install Dependencies

```bash
npm install
```

## 4. Run the Development Server

```bash
npm run dev
```

## 5. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. You should be redirected to the sign-in page
3. Create an account or sign in
4. Start adding health entries!

## Troubleshooting

### Supabase Connection Issues
- Verify your Supabase URL and anon key are correct
- Check that RLS policies are properly set up
- Ensure the `health_entries` table exists

### Clerk Authentication Issues
- Verify your Clerk publishable and secret keys are correct
- Check that your domain is added to Clerk's allowed origins
- Ensure the sign-in/sign-up URLs are configured correctly

### Common Issues
- Make sure all environment variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Restart your development server after changing environment variables
- Check the browser console for any error messages

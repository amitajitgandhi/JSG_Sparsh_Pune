# JSG SPARSH Pune Website

A modern, responsive website for JSG SPARSH Pune - Jain Social Group built with Next.js and optimized for mobile-first experience with integrated Supabase backend and comprehensive social initiatives platform.

## ? What is JSG SPARSH Pune?

JSG SPARSH Pune is a vibrant Jain community organization dedicated to bringing together families through social, cultural, and charitable initiatives. As a proud member of the JSG International Federation, we organize events, tournaments, community service programs, and foster connections within the Jain community in Pune.

## ? Features

### **Core Pages**
- **?? Home Page**: Hero section with community overview, statistics, and call-to-action buttons
- **?? About Page**: Comprehensive information about JSG SPARSH Pune's mission, values, and vision
- **?? Committee Page**: Meet our dedicated team members with detailed contact information
- **?? Events Page**: Showcase of past memorable events with detailed descriptions and highlights
- **?? Social Page**: Dan Patra initiatives and community service programs with interactive modals
- **?? SPL 02 Page**: Comprehensive tournament information and sponsorship details
- **?? Register Now Page**: Complete SPL 02 tournament registration with payment integration
- **?? Admin Dashboard**: Real-time management of registrations, donations, and applications

### **Registration System**
- **?? SPL 02 Tournament Registration**: Complete registration with:
  - Multi-category support (Male ?800, Female ?800, Kids ?600)
  - Age requirements: Male/Female 12+ years, Kids 7-12 years
  - Photo upload functionality (JPG, JPEG, PNG, HEIC - 10MB max)
  - Jersey customization with dynamic pricing
  - **QR Code Payment Integration**: Scan QR code and upload transaction details
  - Transaction ID and screenshot collection
  - Form validation and type safety
  - Real-time data storage with Supabase PostgreSQL

### **?? Social Initiatives Platform**
- **?? Donation System**: Complete donation management with:
  - QR Code payment integration with bank details
  - Amount field with currency validation (?1 to ?9,99,999.99)
  - Transaction ID and screenshot collection
  - Real-time donation tracking and storage
  - Mobile-optimized QR code scanning

- **?? Volunteer Applications**: Comprehensive volunteer management with:
  - Application form with validation
  - Volunteer benefits and information display
  - Database storage with enquiry type tracking
  - Success confirmations and next steps

- **?? Membership Applications**: Join Us functionality with:
  - Navigation-level "Join Us" button
  - Community benefits display
  - Membership application processing
  - Automated follow-up information

### **Admin Dashboard**
- **?? Real-time Statistics**: Live registration counts by category
- **?? Refresh Functionality**: Manual data refresh with loading states
- **?? Customizable CSV Export**: Select columns to include in export
- **?? Search & Filter**: Advanced filtering by category and search terms
- **?? Visual Analytics**: Category-wise registration breakdown
- **?? Transaction Tracking**: View transaction IDs and payment screenshots
- **?? Social Data Management**: View donations, volunteer applications, and membership requests

## :globe_with_meridians: Important URLs

### Production (Vercel)
- **Homepage**: [https://jsg-sparsh-pune.vercel.app/](https://jsg-sparsh-pune.vercel.app/)
- **Registration**: [https://jsg-sparsh-pune.vercel.app/register-now](https://jsg-sparsh-pune.vercel.app/register-now)
- **Social Initiatives**: [https://jsg-sparsh-pune.vercel.app/social](https://jsg-sparsh-pune.vercel.app/social)
- **Admin Dashboard**: [https://jsg-sparsh-pune.vercel.app/admin](https://jsg-sparsh-pune.vercel.app/admin)
- **SPL 02 Info**: [https://jsg-sparsh-pune.vercel.app/spl02](https://jsg-sparsh-pune.vercel.app/spl02)
- **About**: [https://jsg-sparsh-pune.vercel.app/about](https://jsg-sparsh-pune.vercel.app/about)
- **Committee**: [https://jsg-sparsh-pune.vercel.app/committee](https://jsg-sparsh-pune.vercel.app/committee)
- **Events**: [https://jsg-sparsh-pune.vercel.app/events](https://jsg-sparsh-pune.vercel.app/events)

### Local Development
- **Homepage**: [http://localhost:3000](http://localhost:3000)
- **Registration**: [http://localhost:3000/register-now](http://localhost:3000/register-now)
- **Social Initiatives**: [http://localhost:3000/social](http://localhost:3000/social)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **SPL 02 Info**: [http://localhost:3000/spl02](http://localhost:3000/spl02)

## :file_folder: Project Structure

```
JSG-Portal/
|-- app/
    |-- components/              # Reusable UI components
        |-- Hero.tsx            # Main hero section with statistics
        |-- AboutSectionSimple.tsx # About preview with JSG Federation info
        |-- Navbar.tsx          # Responsive navigation bar with Join Us modal
        |-- Footer.tsx          # Footer with quick links and contact info
        |-- JoinUsModal.tsx     # Membership application modal
    |-- api/                    # Next.js API routes
        |-- register/           # Registration API endpoint
            |-- route.ts
        |-- donation/           # Donation processing API
            |-- route.ts
        |-- volunteer/          # Volunteer application API
            |-- route.ts
        |-- join-us/            # Membership application API
            |-- route.ts
        |-- test-storage/       # Storage testing and diagnostics
            |-- route.ts
    |-- admin/                  # Admin dashboard
        |-- page.tsx            # Registration and social data management
    |-- about/                  # About page with mission and values
        |-- page.tsx
    |-- committee/              # Committee page with member details
        |-- page.tsx
    |-- events/                 # Events showcase page
        |-- page.tsx
    |-- social/                 # Dan Patra initiatives page with modals
        |-- page.tsx            # Social page with donation and volunteer modals
        |-- components/         # Social-specific modal components
            |-- DonationModal.tsx    # Donation form with QR payment
            |-- VolunteerModal.tsx   # Volunteer application form
    |-- spl02/                  # SPL 02 tournament information
        |-- page.tsx
    |-- register-now/           # SPL 02 registration form with QR payment
        |-- page.tsx
        |-- components/         # Registration-specific components
            |-- ConfirmationModal.tsx
            |-- RegistrationSummary.tsx
            |-- PaymentDetails.tsx
    |-- globals.css             # Global styles and Tailwind imports
    |-- layout.tsx              # Root layout with metadata
    |-- page.tsx                # Home page combining Hero and About
|-- lib/
    |-- supabase.ts             # Supabase client with social functions
|-- supabase/
    |-- migrations/             # Database migration files
        |-- 001_create_registrations.sql
        |-- 002_add_transaction_fields.sql
        |-- 003_create_social_tables.sql
    |-- fix-bucket-policies.sql
    |-- add_amount_column.sql
|-- scripts/
    |-- setup-social.js          # Setup script for social features
|-- public/
    |-- images/                 # Static assets and logos
        |-- JSG_SPARSH.jpeg     # Main JSG SPARSH logo
        |-- JSG_Federation.jpeg # JSG Federation logo
        |-- SPARSH_QR_Code.jpeg # Payment QR code with bank details
|-- .env.example                # Environment variables template
|-- .env.local                  # Environment variables (not committed)
|-- next.config.js              # Next.js configuration
|-- tailwind.config.js          # Tailwind CSS configuration
|-- tsconfig.json              # TypeScript configuration
|-- package.json               # Dependencies and scripts
```

## :wrench: Technologies Used

- **Frontend Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase PostgreSQL with Row Level Security
- **File Storage**: Supabase Storage with multi-bucket architecture
- **Authentication**: Supabase Auth (for admin access)
- **UI Components**: Lucide React icons
- **Image Optimization**: Next.js Image component
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Validation**: Client and server-side validation
- **Payment Integration**: QR code-based UPI payments
- **Deployment**: Vercel with automatic CI/CD

## :building_construction: Architecture

### **Frontend Architecture**
- **Server Components**: Static generation for optimal performance
- **Client Components**: Interactive forms and modals
- **API Routes**: RESTful endpoints for data operations
- **Responsive Design**: Mobile-first with progressive enhancement
- **Type Safety**: Full TypeScript implementation

### **Backend Integration**
- **Supabase Database**: PostgreSQL with optimized queries
- **File Storage**: Organized multi-bucket storage system
- **Real-time Updates**: Live data synchronization
- **Security**: Row Level Security policies and validation
- **Error Handling**: Comprehensive error management

### **Data Flow**
1. **User Interaction**: Forms collect user input with validation
2. **API Processing**: Next.js API routes handle business logic
3. **Database Operations**: Supabase manages data persistence
4. **File Handling**: Supabase Storage manages file uploads
5. **Real-time Updates**: Admin dashboard reflects live changes

## :bar_chart: Supabase Tables and Storage Buckets

### **Database Tables**

#### **registrations**
- **Purpose**: SPL 02 tournament registrations
- **Key Fields**: category, full_name, mobile_number, age, transaction_id, payment_status
- **File References**: photo_url, transaction_screenshot_url

#### **donations**
- **Purpose**: Community donation tracking
- **Key Fields**: name, mobile_number, amount, transaction_id
- **File References**: transaction_screenshot_url

#### **enquiries**
- **Purpose**: Volunteer applications and membership requests
- **Key Fields**: name, address, mobile_number, enquiry_type
- **Values**: enquiry_type ('Volunteer' | 'JoinUs')

### **Storage Buckets**

#### **registration-photos**
- **Purpose**: Profile pictures from tournament registration
- **File Types**: JPG, JPEG, PNG, HEIC
- **Size Limit**: 10MB per file

#### **registration-transaction-ss**
- **Purpose**: Registration payment screenshots
- **File Types**: JPG, JPEG, PNG, HEIC
- **Size Limit**: 10MB per file

#### **donation-transaction-ss**
- **Purpose**: Donation payment screenshots
- **File Types**: JPG, JPEG, PNG, HEIC
- **Size Limit**: 10MB per file

### **Security Features**
- **Row Level Security**: Enabled on all tables
- **Bucket Policies**: Secure file access and upload permissions
- **Data Validation**: Server-side validation for all inputs
- **Transaction Tracking**: Complete audit trail for payments

## :rocket: Setup Instructions

1. **Clone the repository**: `git clone <repository-url>`
2. **Navigate to the project directory**: `cd JSG-Portal`
3. **Install dependencies**: `npm install`
4. **Set up Supabase project**:
   - Create a new Supabase project
   - Configure database password and API keys
5. **Set up Supabase Database:**
   - Run the SQL migration in `supabase/migrations/001_create_registrations.sql`
   - Run the additional migration in `supabase/migrations/002_add_transaction_fields.sql`
   - Run the social initiatives migration in `supabase/migrations/003_create_social_tables.sql`
   - Create storage buckets: `registration-photos`, `registration-transaction-ss`, `donation-transaction-ss`
   - Set up Row Level Security policies for all tables
   - Run bucket policy fixes from `supabase/fix-bucket-policies.sql` if needed
6. **Configure environment variables**:
   - Copy `.env.example` to `.env.local`
   - Update Supabase URL and anonymous key in `.env.local`
7. **Run the development server**: `npm run dev`
8. **Access the website**: Open `http://localhost:3000` in your browser
9. **Admin Dashboard**: Access admin dashboard at `http://localhost:3000/admin`
10. **SPL 02 Registration**: Access registration form at `http://localhost:3000/register-now`

---

**JSG SPARSH Pune** - Connecting Jain families through community, culture, and compassion. :pray:

_Last updated: 2026-07-14_

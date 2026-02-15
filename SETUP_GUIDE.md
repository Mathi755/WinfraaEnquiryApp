# Setup Guide - Winfraatech Enquiry Manager

Complete step-by-step guide to set up and deploy the Winfraatech Enquiry Manager.

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18.x or later
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Git
- A Supabase account with a database
- A Google Cloud account with Generative AI API enabled

## 🔧 Step 1: Setup Supabase Database

### 1.1 Create a new Supabase project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name: "Winfraatech Enquiry Manager"
4. Create a database password
5. Wait for project to be created
6. Note your **Project URL** and **Anon Key** from Settings > API

### 1.2 Create database tables

Use the SQL Editor in Supabase to run this SQL:

```sql
-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  address TEXT,
  website VARCHAR(255),
  notes TEXT,
  owner VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enquiries table
CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  enquiry_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'quoted', 'won', 'lost', 'on_hold')),
  product_interest VARCHAR(255) NOT NULL,
  estimated_value NUMERIC(12,2),
  notes TEXT,
  next_follow_up DATE,
  owner VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Drafts table
CREATE TABLE email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  template_type VARCHAR(50) NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_enquiries_company_id ON enquiries(company_id);
CREATE INDEX idx_enquiries_contact_id ON enquiries(contact_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_owner ON enquiries(owner);
CREATE INDEX idx_enquiries_next_follow_up ON enquiries(next_follow_up);
CREATE INDEX idx_email_drafts_enquiry_id ON email_drafts(enquiry_id);
CREATE INDEX idx_reminders_enquiry_id ON reminders(enquiry_id);
CREATE INDEX idx_reminders_reminder_date ON reminders(reminder_date);

-- Enable RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now, customize based on your auth)
CREATE POLICY "Enable read access for all users" ON companies FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON companies FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON companies FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON contacts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON contacts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON contacts FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON enquiries FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON enquiries FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON enquiries FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON email_drafts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON email_drafts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON email_drafts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON email_drafts FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON reminders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON reminders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON reminders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON reminders FOR DELETE USING (true);
```

## 🔑 Step 2: Setup Google Generative AI

### 2.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the "Generative Language API"
4. Go to Credentials
5. Create an API key
6. Copy the API key

### 2.2 Test the API
```bash
curl -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  https://generativelanguage.googleapis.com/v1beta3/models/gemini-1.5-flash-latest:generateContent
```

## 💻 Step 3: Setup Local Development

### 3.1 Clone/Download the project
```bash
cd path/to/WinfraaEnquiryApp
```

### 3.2 Install dependencies
```bash
npm install
```

### 3.3 Configure environment variables

Create a `.env` file in the project root:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
GOOGLE_GENERATIVE_AI_KEY=your_google_api_key
```

Also update `src/constants/index.ts`:
```typescript
export const SUPABASE_CONFIG = {
  url: 'https://your-project.supabase.co',
  anonKey: 'your_anon_key',
};

export const GEMINI_CONFIG = {
  apiKey: 'your_google_api_key',
  model: 'gemini-1.5-flash-latest',
};
```

### 3.4 Test the setup
```bash
npm start
```

The app should load in Expo Go on your mobile device or emulator.

## ✅ Step 4: Testing the Features

### Test Dashboard
1. Open the app
2. You should see the Dashboard with empty states
3. Verify all sections load without errors

### Test Add Enquiry
1. Tap the "Add" tab (plus icon)
2. Create a new company
3. Add a contact
4. Create an enquiry with all details
5. Verify data appears in dashboard

### Test Enquiry List
1. Tap the "Enquiries" tab
2. Verify enquiry appears in the list
3. Search for the company name
4. Test filtering by status
5. Test export to CSV/Excel

### Test AI Email
1. Go to enquiry detail
2. Tap "Email" button
3. Select a template
4. Click "Generate Email with AI"
5. Verify email is generated
6. Edit and save as draft

### Test Notifications
1. Go to Settings
2. Tap "Request Permissions"
3. Grant notification permissions
4. Go to enquiry detail
5. Add a reminder
6. Verify notification appears

## 📱 Step 5: Mobile Deployment

### iOS (Apple App Store)
1. Create an Apple Developer account
2. Create an App ID in Apple Developer
3. Generate signing certificate
4. Configure in Xcode
5. Build: `eas build --platform ios`
6. Upload to App Store Connect

### Android (Google Play Store)
1. Create Google Play Developer account
2. Create an app
3. Generate signing key
4. Build: `eas build --platform android`
5. Upload to Google Play Console

## 🚀 Step 6: Production Deployment with EAS

### 6.1 Install EAS CLI
```bash
npm install -g eas-cli
```

### 6.2 Initialize EAS
```bash
eas init
```

### 6.3 Build for production
```bash
# Build for iOS
eas build --platform ios --auto-submit

# Build for Android
eas build --platform android --auto-submit
```

### 6.4 Submit to app stores
```bash
eas submit --platform android
eas submit --platform ios
```

## 📋 Checklist Before Production

- [ ] Environment variables configured
- [ ] Supabase database created and tables set up
- [ ] Google Generative AI API key obtained
- [ ] All features tested on device
- [ ] App tested with production data
- [ ] Error handling verified
- [ ] Push notifications tested
- [ ] Offline functionality tested
- [ ] App icon and splash screen configured
- [ ] Terms of service reviewed
- [ ] Privacy policy in place
- [ ] Security audit completed

## 🆘 Common Issues & Solutions

### Issue: "Supabase connection failed"
**Solution:**
- Verify SUPABASE_URL is correct (starts with https://)
- Check SUPABASE_ANON_KEY is correct
- Ensure internet connection
- Check firewall settings

### Issue: "AI email generation fails"
**Solution:**
- Verify GOOGLE_GENERATIVE_AI_KEY is correct
- Check Google Cloud API quota
- Ensure Generative Language API is enabled
- Test API with curl command above

### Issue: "Notifications don't appear"
**Solution:**
- Grant notification permissions
- Check OS notification settings
- Ensure app has background execution permission
- Clear app cache and restart

### Issue: "App crashes on startup"
**Solution:**
- Clear Expo cache: `npm start --clear`
- Reinstall node_modules: `rm -rf node_modules && npm install`
- Check for console errors
- Verify all imports are correct

## 📊 Performance Optimization

1. **Lazy load screens** - Already implemented in navigation
2. **Optimize database queries** - Use indexing (already done)
3. **Cache data** - Implement with React Query or SWR
4. **Minimize bundle size** - Use tree-shaking
5. **Profile performance** - Use React Native Debugger

## 🔒 Security Considerations

1. **Enable RLS** on all Supabase tables (already configured)
2. **Rotate API keys** regularly
3. **Use HTTPS** only
4. **Store sensitive data** in secure storage
5. **Implement user authentication** (future phase)
6. **Rate limit API calls** (future enhancement)

## 📞 Support

For issues during setup:
1. Check this guide thoroughly
2. Consult README.md
3. Review error messages carefully
4. Check Supabase documentation
5. Visit Google Cloud documentation
6. Contact support@winfraatech.com

---

**Setup Guide Version**: 1.0
**Last Updated**: February 2026

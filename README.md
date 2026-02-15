# Winfraatech Enquiry Manager

A production-ready B2B CRM mobile application built with React Native (Expo) and Supabase.

## 📋 Features

✅ **Dashboard Screen**
- Total enquiries count
- Status summary (New, In Progress, Quoted, Won, Lost, On Hold)
- Upcoming follow-ups
- Quick action buttons
- Pipeline value overview

✅ **Enquiry Management**
- View all enquiries with advanced filtering
- Search by company/contact/product
- Filter by status, date range, owner
- Sort enquiries
- Export to Excel/CSV

✅ **Enquiry Details**
- Complete company information
- Contact details
- Status tracking
- Follow-up scheduling
- Integrated reminders

✅ **AI Email Composer**
- Google Gemini AI integration
- 5 professional email templates:
  - Initial enquiry response
  - Quotation follow-up
  - Reminder email
  - Deal closing mail
  - Re-engagement email
- Editable email drafts
- Save for future use

✅ **Reminder System**
- Sync with Supabase reminders table
- Push notifications
- Snooze/reschedule
- Duplicate prevention

✅ **Data Export**
- CSV format export
- Excel format export
- Filtered data export
- All fields included

✅ **Settings**
- Notification preferences
- Data management
- App information
- Debug tools

## 🏗️ Architecture

### Folder Structure
```
WinfraaEnquiryApp/
├── src/
│   ├── screens/              # Screen components
│   │   ├── DashboardScreen.tsx
│   │   ├── EnquiryListScreen.tsx
│   │   ├── EnquiryDetailScreen.tsx
│   │   ├── AddEnquiryScreen.tsx
│   │   ├── EmailComposeScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/           # Reusable UI components
│   │   └── index.ts
│   ├── services/             # Business logic
│   │   ├── supabaseService.ts
│   │   ├── aiEmailService.ts
│   │   └── notificationService.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   ├── constants/            # Configuration
│   │   └── index.ts
│   ├── utils/                # Utility functions
│   │   └── index.ts
│   └── navigation/           # Navigation setup
│       └── index.ts
├── assets/                   # App icons, images
├── App.tsx                   # Main app entry
├── index.ts                  # App loader
├── app.json                  # Expo config
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

### Services

**supabaseService.ts**
- Company CRUD operations
- Contact management
- Enquiry operations
- Email draft management
- Reminder scheduling
- Data export utilities
- Realtime subscriptions

**aiEmailService.ts**
- Google Gemini AI integration
- Template-based prompt generation
- Email content validation
- Safety checks against hallucination

**notificationService.ts**
- Push notification scheduling
- Reminder synchronization
- Permission handling
- Notification lifecycle management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account with database
- Google Generative AI API key

### Installation

1. **Navigate to project directory**
```bash
cd WinfraaEnquiryApp
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the project root:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
GOOGLE_GENERATIVE_AI_KEY=your_google_gemini_key_here
```

4. **Update constants**
Edit `src/constants/index.ts` and add your actual credentials:
```typescript
export const SUPABASE_CONFIG = {
  url: 'https://your-project.supabase.co',
  anonKey: 'your_anon_key_here',
};

export const GEMINI_CONFIG = {
  apiKey: 'your_google_generative_ai_key',
  model: 'gemini-1.5-flash-latest',
};
```

### Running the App

**Development Mode**
```bash
npm start
```

**Android**
```bash
npm run android
```

**iOS**
```bash
npm run ios
```

**Web**
```bash
npm run web
```

## 🗄️ Database Schema

The app uses these Supabase tables (already created):

### Companies
- `id` (UUID, primary key)
- `name` (string)
- `address` (string)
- `industry` (string)
- `website` (string, optional)
- `notes` (text, optional)
- `owner` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Contacts
- `id` (UUID, primary key)
- `company_id` (UUID, FK)
- `name` (string)
- `designation` (string)
- `phone` (string, optional)
- `email` (string, optional)
- `is_primary` (boolean)
- `notes` (text, optional)
- `created_at` (timestamp)

### Enquiries
- `id` (UUID, primary key)
- `company_id` (UUID, FK)
- `contact_id` (UUID, FK, optional)
- `enquiry_date` (date)
- `status` (enum: new, in_progress, quoted, won, lost, on_hold)
- `product_interest` (string)
- `estimated_value` (number, optional)
- `notes` (text, optional)
- `next_follow_up` (date, optional)
- `owner` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Email Drafts
- `id` (UUID, primary key)
- `enquiry_id` (UUID, FK)
- `template_type` (string)
- `subject` (string)
- `body` (text)
- `created_at` (timestamp)

### Reminders
- `id` (UUID, primary key)
- `enquiry_id` (UUID, FK)
- `reminder_date` (timestamp)
- `title` (string)
- `description` (text)
- `is_completed` (boolean)
- `created_at` (timestamp)

## 📱 Navigation Structure

```
App (Bottom Tab Navigator)
├── Home (HomeStack)
│   ├── Dashboard
│   ├── EnquiryDetail
│   └── EmailCompose
├── Enquiries (EnquiryListStack)
│   ├── EnquiryList
│   ├── EnquiryDetail
│   └── EmailCompose
├── Add (AddEnquiryStack)
│   └── AddEnquiry
└── Settings (SettingsStack)
    └── Settings
```

## 🎨 UI/UX Features

- **Professional B2B Design**: Clean, modern interface suitable for sales teams
- **React Native Paper**: Material Design components
- **Dark/Light Support**: Compatible with system theme
- **Responsive Layout**: Works on phones and tablets
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation
- **Empty States**: Clear messaging when no data

## 🔐 Security & Best Practices

✅ TypeScript for type safety
✅ Proper error handling throughout
✅ Supabase RLS policies (already configured)
✅ API timeouts to prevent hanging
✅ Input validation before DB operations
✅ Environment variables for sensitive data
✅ No hardcoded credentials
✅ Proper logging for debugging

## 🧪 Testing

To test the application:

1. **Create test data** via Supabase console
2. **Test Dashboard**: Verify summary displays correctly
3. **Test Enquiry List**: Filter and search functionality
4. **Test Add Enquiry**: Create new company, contacts, enquiries
5. **Test AI Email**: Generate emails (requires valid API key)
6. **Test Notifications**: Set reminders and verify notifications
7. **Test Export**: Export enquiries to CSV/Excel

## 📦 Dependencies

Key dependencies:
- `react-native` - Mobile framework
- `expo` - React Native framework
- `@react-navigation/*` - Navigation
- `react-native-paper` - UI components
- `@supabase/supabase-js` - Database
- `@google/generative-ai` - AI email generation
- `expo-notifications` - Push notifications
- `xlsx` - Excel export
- `papaparse` - CSV export
- `date-fns` - Date utilities

## 🛠️ Development Guide

### Adding a New Feature

1. **Create types** in `src/types/index.ts`
2. **Add service methods** in `src/services/`
3. **Create reusable components** in `src/components/`
4. **Build screen** in `src/screens/`
5. **Update navigation** in `src/navigation/`
6. **Add to App.tsx** navigation stack

### Creating a New Service

```typescript
// src/services/myService.ts
class MyService {
  async myMethod() {
    // Implementation
  }
}

export const myService = new MyService();
export default MyService;
```

### Creating a Reusable Component

```typescript
// src/components/index.ts
export const MyComponent = ({ prop1, prop2 }) => {
  return (
    <View>
      {/* JSX */}
    </View>
  );
};
```

## 🐛 Troubleshooting

### App not starting
- Clear cache: `npm start --clear`
- Reinstall node_modules: `rm -rf node_modules && npm install`

### Supabase connection error
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check network connectivity
- Ensure Supabase project is active

### AI Email generation fails
- Verify Google Generative AI key
- Check API quota
- Review GEMINI_CONFIG in constants

### Notifications not working
- Grant permissions on device
- Check notification settings
- Verify Expo Notifications setup

## 📝 License

Copyright © 2024 Winfraatech. All rights reserved.

## 🤝 Support

For issues or questions, please contact: support@winfraatech.com

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Status**: Production Ready

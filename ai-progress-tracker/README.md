# AI Progress Tracker 🚀

A progressive web app (PWA) to track your progress through the [AI Daily Brief 10-Week AI Resolution Program](https://aidbnewyear.com/program).

![AI Progress Tracker](./public/icons/icon-192x192.png)

## Features

- ✅ **10 Week Overview** - View all program weeks with descriptions and objectives
- ☑️ **Progress Tracking** - Mark weeks as complete with checkboxes
- 📝 **Rich Notes** - Add notes with file and link attachments for each week
- ⏱️ **Time Tracking** - Start/stop timer or manually add time spent
- 📊 **Progress Bar** - Visual progress indicator
- 🎯 **Smart Suggestions** - "Next Up" badge shows your next incomplete week
- 👥 **Multi-user Support** - User authentication with Google, GitHub, or email
- 🏆 **Leaderboard** - Optional progress sharing to compete with others
- 🌙 **Dark/Light Mode** - Toggle between themes or use system preference
- 📱 **PWA Support** - Install on mobile/desktop for offline access

## Quick Start

### Demo Mode (No Setup Required)

The app works out of the box in demo mode - data is stored in your browser's localStorage.

```bash
# Install dependencies
npm install

# Generate PWA icons
node scripts/generate-icons.js

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Mode with Firebase

For multi-user support, cloud sync, and leaderboard features:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password, Google, GitHub)
   - Create a Firestore database
   - Enable Storage (for file attachments)

2. **Configure Environment Variables**
   ```bash
   # Copy the example env file
   cp .env.example .env.local
   
   # Edit .env.local with your Firebase config
   NEXT_PUBLIC_DEMO_MODE=false
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own profile
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Users can read/write their own progress
       match /progress/{docId} {
         allow read: if request.auth != null && 
           resource.data.userId == request.auth.uid;
         allow write: if request.auth != null && 
           request.resource.data.userId == request.auth.uid;
       }
       
       // Allow reading shared leaderboard data
       match /users/{userId} {
         allow read: if request.auth != null && 
           resource.data.shareProgress == true;
       }
     }
   }
   ```

4. **Set up Storage Security Rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /attachments/{userId}/{allPaths=**} {
         allow read: if request.auth != null && request.auth.uid == userId;
         allow write: if request.auth != null && request.auth.uid == userId
           && request.resource.size < 10 * 1024 * 1024; // 10MB limit
       }
     }
   }
   ```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add your environment variables
4. Deploy!

### Other Platforms

```bash
# Build for production
npm run build

# Start production server
npm start
```

The app can be deployed to any platform that supports Node.js (Netlify, Railway, etc.)

## PWA Installation

The app can be installed as a PWA on:

- **iOS**: Open in Safari → Share → Add to Home Screen
- **Android**: Open in Chrome → Menu → Install App
- **Desktop**: Click the install icon in the address bar

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend**: [Firebase](https://firebase.google.com/)
  - Authentication
  - Firestore Database
  - Cloud Storage
- **PWA**: Custom service worker with offline support

## Project Structure

```
ai-progress-tracker/
├── public/
│   ├── icons/           # PWA icons
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service worker
├── src/
│   ├── app/            # Next.js app router
│   ├── components/     # React components
│   │   ├── ui/        # Reusable UI components
│   │   └── ...        # Feature components
│   ├── contexts/       # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ProgressContext.tsx
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities & Firebase config
│   └── types/          # TypeScript types
├── scripts/            # Build scripts
└── ...
```

## The 10 Weeks

| Week | Topic | Focus |
|------|-------|-------|
| 1 | AI Foundations & Setup | Tools, prompting, first project |
| 2 | AI for Productivity | Automation, workflows |
| 3 | AI for Content Creation | Writing, social media |
| 4 | AI for Visual Content | Image generation, branding |
| 5 | AI for Data & Analysis | Data insights, reports |
| 6 | AI for Coding & Development | Code generation, debugging |
| 7 | AI for Business & Strategy | Planning, market analysis |
| 8 | AI for Learning & Education | Personalized learning |
| 9 | AI Integration & Automation | Multi-tool workflows |
| 10 | AI Mastery & Future | Portfolio, continued journey |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your own AI learning journey!

---

Built with ❤️ for the [AI Daily Brief](https://aidbnewyear.com/) community.

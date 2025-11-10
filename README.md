# 🌟 LUXE IDE - Premium Command Center

A luxury-grade, interactive development environment featuring 5 interconnected console systems, distributed dashboard generation with D3 visualizations, and an AI-powered marketing strategy engine.

## ✨ Features

- **5 Interactive Consoles**: System, Development, Analytics, Marketing, and Control
- **Dynamic Dashboard Generation**: Create beautiful D3-based visualizations with simple commands
- **AI Marketing Engine**: Generate comprehensive advertising strategies with expert-level insights
- **Real-time Data Visualization**: Line, Bar, Pie, Area, Radar, Gauge charts and more
- **Persistent Storage**: All data saved using Spark's KV storage
- **Luxury Design**: Premium UI with sophisticated animations and high-end aesthetics
- **Built-in Functionality**: Complete IDE features with cross-platform compatibility

## 🚀 Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔥 Firebase Deployment

This application is ready to deploy to Firebase Hosting with live server capabilities.

### Quick Deploy (5 Steps)

1. **Set up Firebase credentials** - See `FIREBASE_QUICKSTART.md`
2. **Install Firebase CLI** - `npm install -g firebase-tools`
3. **Configure environment** - Copy `EXAMPLE_.env.local` to `.env.local`
4. **Build the app** - `npm run build`
5. **Deploy** - `firebase deploy`

### 📚 Deployment Documentation

- **📖 [Firebase Quick Start](./FIREBASE_QUICKSTART.md)** - Fast track to deployment (5 steps)
- **📋 [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Complete deployment verification
- **📘 [Integration Guide](./FIREBASE_INTEGRATION_GUIDE.md)** - Comprehensive Firebase setup

### Example Files Included

All necessary Firebase configuration files are included with `EXAMPLE_` prefix:
- `EXAMPLE_firebase.ts` - Firebase SDK integration
- `EXAMPLE_firebase.json` - Hosting configuration
- `EXAMPLE_firestore.rules` - Database security rules
- `EXAMPLE_database.rules.json` - Realtime database rules
- `EXAMPLE_.env.local` - Environment variables template
- `EXAMPLE_firebase-hosting-merge.yml` - GitHub Actions for main branch
- `EXAMPLE_firebase-hosting-pull-request.yml` - GitHub Actions for PRs

Simply remove the `EXAMPLE_` prefix and add your credentials!

## 🎮 Using LUXE IDE

### Console Commands

Type `help` in any console to see available commands:

```bash
help              # Show available commands
status            # Show system status
demo charts       # Generate demo dashboard with all chart types
generate dashboard [type]  # Create custom dashboard
analyze [topic]   # Analyze data on a topic
deploy [project]  # Deploy a project
monitor          # Start system monitoring
optimize         # Run optimization
clear            # Clear console
```

### Dashboard Types

Generate dashboards with D3 visualizations:
- **Line Charts** - Trend analysis
- **Bar Charts** - Comparative data (horizontal/vertical)
- **Pie Charts** - Distribution with donut option
- **Area Charts** - Multi-series comparisons
- **Radar Charts** - Multi-dimensional analysis
- **Gauge Charts** - Single metric display
- **Metric Cards** - KPI displays
- **Status Indicators** - System health monitoring

### Marketing Engine

Use the AI Marketing tab to:
1. Enter product details
2. Define target audience
3. Generate comprehensive strategies
4. Get multi-channel campaigns
5. Receive trend analysis and recommendations

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **UI Framework**: Shadcn/ui v4 + Tailwind CSS
- **Charts**: D3.js v7
- **Icons**: Phosphor Icons
- **Animations**: Framer Motion
- **State Management**: React Hooks + Spark KV Storage
- **Deployment**: Firebase Hosting
- **Database**: Firestore + Realtime Database (optional)

## 📁 Project Structure

```
spark-template/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── components/
│   │   ├── Console.tsx         # Console component
│   │   ├── DashboardDisplay.tsx # Dashboard renderer
│   │   ├── MarketingEngine.tsx # AI marketing generator
│   │   ├── WidgetCard.tsx      # Individual dashboard widgets
│   │   └── widgets/            # Chart components (D3)
│   ├── lib/
│   │   ├── types.ts            # TypeScript definitions
│   │   └── utils.ts            # Utility functions
│   └── index.css               # Theme and styles
├── FIREBASE_QUICKSTART.md      # Quick deployment guide
├── FIREBASE_INTEGRATION_GUIDE.md # Detailed Firebase setup
├── DEPLOYMENT_CHECKLIST.md     # Comprehensive checklist
├── PRD.md                      # Product requirements
└── EXAMPLE_*.* files           # Firebase configuration templates
```

## 🎨 Customization

### Theme Colors
Edit `src/index.css` to customize the luxury color palette:
```css
:root {
  --primary: oklch(0.35 0.15 300);     /* Royal Purple */
  --secondary: oklch(0.75 0.15 85);    /* Rich Gold */
  --accent: oklch(0.85 0.18 90);       /* Luminous Gold */
  --background: oklch(0.20 0.02 270);  /* Deep Charcoal */
}
```

### Add New Console Types
1. Add type to `ConsoleType` in `src/lib/types.ts`
2. Add console config in `App.tsx` `consoles` array
3. Update command handling in `executeCommand` function

### Create Custom Charts
1. Create new component in `src/components/widgets/`
2. Add type to `WidgetType` in types
3. Import and render in `WidgetCard.tsx`

## 🔐 Security

- Environment variables for Firebase credentials
- Firestore security rules for user data isolation
- Realtime Database rules for live sessions
- No hardcoded secrets in code
- GitHub secrets for CI/CD

## 🚀 Production Deployment

### Automatic Deployment with GitHub Actions

Push to `main` or `master` branch:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions will automatically:
1. Build the application
2. Run tests (if configured)
3. Deploy to Firebase Hosting
4. Update live URL

### Manual Deployment

```bash
npm run build
firebase deploy --only hosting
```

## 🔧 Troubleshooting

### Build Issues
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Issues
- Check `.env.local` has all required variables
- Verify Firebase project ID is correct
- Ensure security rules are deployed
- Check Firebase Console for errors

### Development Issues
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart dev server: `npm run dev`
- Check browser console for errors

## 📖 Documentation

- [Product Requirements Document](./PRD.md) - Complete feature specifications
- [Firebase Quick Start](./FIREBASE_QUICKSTART.md) - Get deployed in minutes
- [Integration Guide](./FIREBASE_INTEGRATION_GUIDE.md) - Deep dive into Firebase
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre-flight verification

## 🤝 Contributing

This is a Spark Template application. To modify:

1. Make changes in your local environment
2. Test thoroughly: `npm run dev` and `npm run build`
3. Update documentation if needed
4. Deploy to Firebase
5. Commit and push to repository

## 📊 Performance

- Lighthouse Score: 90+ (target)
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Bundle size: Optimized with code splitting

## 🔮 Future Enhancements

See `FIREBASE_INTEGRATION_GUIDE.md` for integration opportunities:
- Multi-user collaboration with live sessions
- Real-time console synchronization
- User authentication and profiles
- Saved dashboard templates
- Marketing strategy library
- Export/import functionality

## 🎯 Firebase Project

**Project ID**: `device-streaming-f6c287f6`  
**Console**: [Firebase Console](https://console.firebase.google.com/u/0/project/device-streaming-f6c287f6/overview)  
**Live URL**: `https://device-streaming-f6c287f6.firebaseapp.com` (after deployment)

## 💬 Support

For Firebase-specific issues, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firestore Setup](https://firebase.google.com/docs/firestore)

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## 🧹 Just Exploring?

No problem! If you're checking things out:
- Simply delete your Spark
- Everything will be cleaned up — no traces left behind

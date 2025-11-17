#!/bin/bash

echo "🔥 Firebase Installation & Setup"
echo "==============================="

echo "📦 Installing Firebase packages..."
npm install firebase firebase-admin

echo ""
echo "✅ Firebase packages installed!"
echo ""

echo "🔧 Setting up environment variables..."
echo "Add these to your .env.local file:"
echo ""
echo "# Firebase Configuration"
echo "VITE_FIREBASE_API_KEY=your_api_key_here"
echo "VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com"
echo "VITE_FIREBASE_PROJECT_ID=your_project_id"
echo "VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com"
echo "VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id"
echo "VITE_FIREBASE_APP_ID=your_app_id"
echo ""

echo "📝 Building project..."
npm run build

echo ""
echo "🎉 Firebase setup complete!"
echo ""
echo "📚 Usage examples:"
echo "   import { FirebaseAuthService } from '@/lib/firebase-auth'"
echo "   const user = await FirebaseAuthService.signIn(email, password)"
echo ""
echo "🎯 Team: helhum@hotmail.com & helbslozroj@gmail.com"
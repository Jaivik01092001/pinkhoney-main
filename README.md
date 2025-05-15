# Pink Honey - AI Companion App

Pink Honey is a modern web application that provides users with AI companions for emotional support, conversation, and connection. The platform offers a dating app-like experience where users can swipe through AI profiles, match with companions, and engage in text and voice conversations.

## Project Overview

Pink Honey aims to provide companionship and emotional support through AI-powered virtual companions. Users can:

- Browse through a variety of AI companion profiles
- Match with companions that interest them
- Engage in text-based conversations
- Have voice calls with their AI companions
- Subscribe to premium features for enhanced experiences

The application is designed to help users combat loneliness, find emotional support, and enjoy engaging conversations in a safe, judgment-free environment.

## Tech Stack

### Frontend

- **Next.js 14** - React framework for building the user interface
- **React** - JavaScript library for building user interfaces
- **TypeScript** - For type-safe JavaScript code
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Framer Motion** - Animation library for React

### Authentication & User Management

- **Clerk** - Authentication and user management

### Voice & AI Integration

- **Realtime AI** - For voice call functionality
- **Daily.co** - WebRTC platform for voice calls
- **Anthropic Claude** - LLM for AI conversations

### Payment Processing

- **Stripe** - Payment processing for subscriptions

## Installation Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for backend services)

### Setup Steps

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pinkhoney.git
cd pinkhoney
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DAILY_BOTS_API_KEY=your_daily_bots_api_key
DAILY_BOTS_URL=https://api.daily.co/v1/bots
```

4. Start the development server:

```bash
npm run dev
```

5. For the backend server (Python):

```bash
pip install -r requirements.txt
python stripe_server.py
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Folder Structure

```
pinkhoney/
├── public/             # Static assets and images
├── src/                # Source code
│   ├── app/            # Next.js app directory
│   │   ├── api/        # API routes
│   │   ├── components/ # React components
│   │   ├── all_chats/  # All chats page
│   │   ├── call/       # Voice call page
│   │   ├── chat/       # Chat page
│   │   ├── home/       # Home page with profiles
│   │   ├── match/      # Match page
│   │   ├── pricing/    # Subscription plans
│   │   └── ...         # Other pages
│   └── middleware.ts   # Next.js middleware
├── .next/              # Next.js build output
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## Features

### Core Features

- **Profile Browsing**: Swipe through AI companion profiles
- **Matching System**: Match with AI companions that interest you
- **Text Chat**: Engage in text-based conversations with AI companions
- **Voice Calls**: Have voice conversations with AI companions
- **User Authentication**: Secure login and account management

### Premium Features

- **Unlimited Likes**: No restrictions on how many companions you can like
- **Super Likes**: Increase your chances of matching
- **Unlimited Rewinds**: Go back to profiles you accidentally passed
- **Faster Responses**: Priority processing for your messages
- **Priority Access**: Early access to new features
- **Photo Requests**: Request custom photos (coming soon)
- **Voice Chats**: Enhanced voice interaction (coming soon)

## API Endpoints

### Backend API (Python Server)

- `POST /check_email` - Check user email and subscription status
- `POST /get_ai_response` - Get AI response for chat messages
- `GET /create_checkout_session` - Create Stripe checkout session

### Next.js API Routes

- `POST /api/connect` - Connect to voice call service

## Environment Variables

The following environment variables are required:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Daily.co Voice API
DAILY_BOTS_API_KEY=your_daily_bots_api_key
DAILY_BOTS_URL=https://api.daily.co/v1/bots

# Stripe (for backend)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Subscription Plans

Pink Honey offers three subscription tiers:

- **Lifetime**: $99.99 one-time payment
- **Yearly**: $99.99/year
- **Monthly**: $19.99/month

## Credits

- **Design & Development**: Pink Honey Team
- **AI Integration**: Powered by Anthropic Claude
- **Voice Technology**: Daily.co and Realtime AI

## License

All rights reserved. This project is proprietary and confidential.

© 2024 Pink Honey

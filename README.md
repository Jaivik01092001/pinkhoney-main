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

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for Node.js
- **Firebase Admin SDK** - Firestore database integration

### Authentication & User Management

- **Clerk** - Authentication and user management

### Voice & AI Integration

- **Realtime AI** - For voice call functionality
- **Daily.co** - WebRTC platform for voice calls
- **OpenAI** - GPT-4o model for AI conversations

### Payment Processing

- **Stripe** - Payment processing for subscriptions

## Installation Instructions

### Prerequisites

- Node.js 18+ and npm

### Setup Steps

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pinkhoney.git
cd pinkhoney
```

2. Install frontend dependencies:

```bash
npm install
```

3. Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

4. Set up environment variables:
   - Create a `.env.local` file in the root directory for the frontend:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DAILY_BOTS_API_KEY=your_daily_bots_api_key
DAILY_BOTS_URL=https://api.daily.co/v1/bots
```

- Create a `.env` file in the backend directory:

```
# Copy from backend/.env.example and fill in your values
```

5. Start the backend server:

```bash
cd backend
npm run dev
```

6. In a new terminal, start the frontend development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Folder Structure

```
pinkhoney/
├── backend/            # Express.js backend
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── .env.example    # Example environment variables
│   ├── index.js        # Main entry point
│   └── package.json    # Backend dependencies
├── public/             # Static assets and images
├── src/                # Frontend source code
│   ├── app/            # Next.js app directory
│   │   ├── api/        # Next.js API routes
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
├── package.json        # Frontend dependencies
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

### Backend API (Express.js Server)

- `POST /api/check_email` - Check user email and subscription status
- `POST /api/get_ai_response` - Get AI response for chat messages
- `POST /api/change_subscription` - Change user subscription status
- `POST /api/increase_tokens` - Increase user tokens
- `GET /api/create_checkout_session` - Create Stripe checkout session
- `POST /api/webhook` - Handle Stripe webhook events
- `GET /health` - Server health check

### Next.js API Routes

- `POST /api/connect` - Connect to voice call service

## Environment Variables

### Frontend (.env.local)

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Daily.co Voice API
DAILY_BOTS_API_KEY=your_daily_bots_api_key
DAILY_BOTS_URL=https://api.daily.co/v1/bots
```

### Backend (.env)

```
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Stripe Price IDs
STRIPE_DEFAULT_PRICE_ID=price_default_id_here
STRIPE_LIFETIME_PRICE_ID=price_lifetime_id_here
STRIPE_YEARLY_PRICE_ID=price_yearly_id_here
STRIPE_MONTHLY_PRICE_ID=price_monthly_id_here

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_credentials_file.json

# Server Configuration
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
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

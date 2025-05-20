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
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling for Node.js

### Authentication & User Management

- **Clerk** - Authentication and user management

### Voice & AI Integration

- **Realtime AI** - For voice call functionality

- **OpenAI** - GPT-4o model for AI conversations

### Payment Processing

- **Stripe** - Payment processing for subscriptions

## Installation Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- Clerk account for authentication

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
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Backend URL (for API calls)
BACKEND_URL=http://localhost:8080
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
- `GET /api/get_chat_history` - Get chat history for a user and companion
- `POST /api/change_subscription` - Change user subscription status
- `POST /api/increase_tokens` - Increase user tokens
- `GET /api/create_checkout_session` - Create Stripe checkout session
- `POST /api/webhook` - Handle Stripe webhook events
- `POST /api/clerk-webhook` - Handle Clerk authentication webhook events
- `GET /health` - Server health check

### Next.js API Routes

- `POST /api/connect` - Connect to voice call service

- `POST /api/clerk-auth` - Handle Clerk authentication in Next.js

## Environment Variables

### Frontend (.env.local)

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

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

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/pinkhoney

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here

# Server Configuration
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## MongoDB Integration

Pink Honey uses MongoDB for data storage with the following collections:

- **users**: Stores user information, including authentication details and subscription status
- **chat_history**: Stores conversation history between users and AI companions
- **companions**: Stores AI companion profiles and personalities
- **payments**: Stores payment records and subscription details

The application uses Mongoose for object modeling and database interactions. When users sign up with Clerk authentication, corresponding user entries need to be created in MongoDB through the Clerk webhook system. The application handles this through:

1. A Clerk webhook endpoint that receives user creation events
2. The `/api/clerk-auth` Next.js API route that syncs Clerk user data with MongoDB
3. The `/api/check_email` endpoint that creates or updates user records in MongoDB

This ensures that all authenticated users have corresponding entries in the MongoDB database for storing chat history, subscription status, and other user-specific data.

## Stripe Integration

The application uses Stripe for payment processing with the following features:

- Secure checkout sessions for subscription payments
- Webhook handling for payment events
- Customer name and address collection for compliance with Indian regulations
- Automatic subscription management

### Indian Regulatory Compliance

For users in India, Stripe checkout sessions are configured to collect additional information to comply with Indian export regulations:

- Customer name is required for all transactions
- Billing address is collected for all transactions
- The checkout session is configured with `customer_creation: 'always'` to ensure proper customer records
- Payment methods are limited to those supported in India

## Subscription Plans

Pink Honey offers three subscription tiers:

- **Lifetime**: $99.99 one-time payment
- **Yearly**: $99.99/year
- **Monthly**: $19.99/month

## Credits

- **Design & Development**: Pink Honey Team
- **AI Integration**: Powered by Anthropic Claude
- **Voice Technology**: Realtime AI

## API Testing with Postman

A Postman collection is included in the repository for testing the API endpoints. To use it:

1. Import the `Pink_Honey_API.postman_collection.json` file into Postman
2. Set up an environment with the following variables:

   - `backendUrl`: Your backend server URL (default: `http://localhost:8080`)
   - `frontendUrl`: Your frontend server URL (default: `http://localhost:3000`)
   - `clerkId`: A valid Clerk user ID for testing authenticated endpoints
   - `email`: A valid user email for testing
   - `stripeKey`: Your Stripe publishable key for testing payment endpoints

3. Use the collection to test the various API endpoints

The collection is organized into the following folders:

- **User Management**: Endpoints for managing user data and subscriptions

  - `POST /api/check_email` - Check user email and subscription status
  - `POST /api/change_subscription` - Update user subscription status
  - `POST /api/increase_tokens` - Increase user tokens

- **AI Responses**: Endpoints for AI conversation functionality

  - `POST /api/get_ai_response` - Get AI response for chat messages
  - `GET /api/get_chat_history` - Get chat history for a user and companion

- **Payments**: Endpoints for payment processing with Stripe

  - `GET /api/create_checkout_session` - Create Stripe checkout session
  - `POST /api/webhook` - Handle Stripe webhook events

- **Authentication**: Endpoints for authentication with Clerk

  - `POST /api/clerk-webhook` - Handle Clerk authentication webhook events
  - `POST /api/clerk-auth` - Handle Clerk authentication in Next.js

- **Voice**: Endpoints for voice call functionality

  - `POST /api/connect` - Connect to voice call service

- **System**: System-related endpoints
  - `GET /health` - Server health check

## License

All rights reserved. This project is proprietary and confidential.

© 2024 Pink Honey

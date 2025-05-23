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

- **Next.js 14** - React framework with server-side rendering
- **React** - UI library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Framer Motion** - Animation library for React
- **Clerk** - Authentication and user management
- **Stripe** - Payment processing integration
- **Socket.IO Client** - Real-time communication
- **React Query** - Data fetching and state management
- **Axios** - HTTP client

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **OpenAI Whisper** - Speech-to-text transcription
- **OpenAI GPT-4o** - AI conversation generation
- **OpenAI TTS** - Text-to-speech synthesis
- **Stripe API** - Payment processing and subscription management
- **Clerk** - Authentication and user management
- **Joi** - Request validation
- **Helmet** - Security middleware

## Architecture

The project follows a modern architecture with clear separation of concerns:

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
│   │   ├── (auth)/     # Authentication pages
│   │   ├── (dashboard)/# Dashboard pages
│   │   ├── (marketing)/# Marketing pages
│   │   ├── components/ # React components
│   │   ├── all_chats/  # All chats page
│   │   ├── call/       # Voice call page
│   │   ├── chat/       # Chat page
│   │   ├── home/       # Home page with profiles
│   │   ├── match/      # Match page
│   │   ├── pricing/    # Subscription plans
│   │   └── ...         # Other pages
│   ├── components/     # React components
│   │   ├── ui/         # UI components
│   │   ├── forms/      # Form components
│   │   ├── chat/       # Chat components
│   │   └── voice/      # Voice call components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── providers/      # Context providers
│   ├── styles/         # Global styles
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

### Chat Interface

The chat interface allows users to:

- Send and receive messages with AI companions
- View chat history
- Share images and links
- Customize companion personalities

### Voice Conversations

The voice conversation feature allows users to:

- Speak directly to AI companions
- Hear AI responses in natural-sounding voices
- Have continuous conversations
- Control voice settings

### Premium Features

- **Unlimited Likes**: No restrictions on how many companions you can like
- **Super Likes**: Increase your chances of matching
- **Unlimited Rewinds**: Go back to profiles you accidentally passed
- **Faster Responses**: Priority processing for your messages
- **Priority Access**: Early access to new features
- **Photo Requests**: Request custom photos (coming soon)
- **Voice Chats**: Enhanced voice interaction (coming soon)

## Middleware System

The backend implements a comprehensive middleware system for security, authentication, and request validation:

### Security Middleware

- **Helmet**: Sets secure HTTP headers to protect against common web vulnerabilities
- **CORS**: Restricts cross-origin requests to trusted domains
- **Rate Limiting**: Prevents abuse by limiting requests per IP address
- **Request Size Limits**: Prevents DoS attacks by limiting request body size

### Authentication Middleware

- **Clerk Middleware**: Authenticates requests using Clerk
- **User Validation**: Validates and synchronizes user data with the database
- **Conditional Authentication**: Applies authentication based on environment (development/production)

### Request Validation

- **Joi Schemas**: Validates request data against predefined schemas
- **Input Sanitization**: Prevents injection attacks by validating input
- **Structured Error Responses**: Provides consistent error messages

### Error Handling

- **Global Error Handler**: Catches and processes all errors
- **Detailed Logging**: Logs errors with stack traces in development
- **Safe Error Responses**: Prevents leaking sensitive information in production

## API Endpoints

All API endpoints are protected with appropriate middleware for authentication, validation, and security.

### User Management

- `POST /api/check_email` - Check user email and subscription status

  - **Auth**: Required in production
  - **Body**: `{ email, clerkId?, firstName?, lastName? }`
  - **Response**: User information and subscription status

- `POST /api/change_subscription` - Change user subscription status

  - **Auth**: Required in production
  - **Body**: `{ email, subscriptionType }`
  - **Response**: Updated subscription status

- `POST /api/increase_tokens` - Increase user tokens
  - **Auth**: Required in production
  - **Body**: `{ email, amount }`
  - **Response**: Updated token count

### AI Conversations

- `POST /api/get_ai_response` - Get AI response for chat messages

  - **Auth**: Required in production
  - **Body**: `{ message, name, personality, image, user_id }`
  - **Response**: AI-generated text response

- `GET /api/get_chat_history` - Get chat history for a user and companion
  - **Auth**: Required in production
  - **Query**: `user_id, companion_name`
  - **Response**: Array of chat messages

### Voice Calls

- `POST /api/voice/initiate` - Initiate a voice call session

  - **Auth**: Required in production
  - **Body**: `{ user_id, companion_name, personality }`
  - **Response**: Call session information

- `POST /api/voice/end` - End a voice call session
  - **Auth**: Required in production
  - **Body**: `{ call_id }`
  - **Response**: Call session summary

### Payments

- `GET /api/create_checkout_session` - Create Stripe checkout session

  - **Auth**: None (public endpoint)
  - **Query**: `{ priceId?, email?, plan?, success_url?, cancel_url? }`
  - **Response**: Stripe checkout session URL

- `POST /api/webhook` - Handle Stripe webhook events
  - **Auth**: Stripe signature verification
  - **Body**: Raw Stripe webhook event
  - **Response**: Acknowledgment

### Authentication

- `POST /api/clerk-webhook` - Handle Clerk authentication webhook events
  - **Auth**: Clerk signature verification
  - **Body**: Raw Clerk webhook event
  - **Response**: Acknowledgment

### System

- `GET /health` - Server health check
  - **Auth**: None (public endpoint)
  - **Response**: Server status information

## Real-time Communication

The application uses Socket.IO for real-time voice communication between the frontend and backend:

### Socket Events

1. **Connection Events**:

   - `connection` - Client connects to the server
   - `disconnect` - Client disconnects from the server
   - `heartbeat` - Periodic ping to keep connection alive




## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- OpenAI API key
- Stripe account and API keys
- Clerk account for authentication

### Installation

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

   - Create a `.env.local` file in the root directory for the frontend
   - Create a `.env` file in the backend directory

5. Start the backend server:

```bash
cd backend
npm run dev
```

6. In a new terminal, start the frontend development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Frontend (.env.local)

```
# API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key


```

### Backend (.env)

```
# Server Configuration
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/pinkhoney

# OpenAI API Configuration
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

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here
```

## MongoDB Integration

Pink Honey uses MongoDB for data storage with the following collections:

- **users**: Stores user information, including authentication details and subscription status
- **chat_history**: Stores conversation history between users and AI companions
- **companions**: Stores AI companion profiles and personalities
- **payments**: Stores payment records and subscription details

The application uses Mongoose for object modeling and database interactions. When users sign up with Clerk authentication, corresponding user entries are created in MongoDB through:

1. A Clerk webhook endpoint that receives user creation events
2. The `/api/clerk-auth` Next.js API route that syncs Clerk user data with MongoDB
3. The `/api/check_email` endpoint that creates or updates user records in MongoDB

## Stripe Integration

The application uses Stripe for payment processing with the following features:

- Secure checkout sessions for subscription payments
- Webhook handling for payment events
- Customer name and address collection for compliance with regulations
- Automatic subscription management

### Subscription Plans

Pink Honey offers three subscription tiers:

- **Lifetime**: $99.99 one-time payment
- **Yearly**: $99.99/year
- **Monthly**: $19.99/month

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

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## License

All rights reserved. This project is proprietary and confidential.

© 2024 Pink Honey

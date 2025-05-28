# Pink Honey - AI Companion App

Pink Honey is a modern web application that provides users with AI companions for emotional support, conversation, and connection. The platform offers a dating app-like experience where users can swipe through AI profiles, match with companions, and engage in text and voice conversations.

## Project Overview

Pink Honey aims to provide companionship and emotional support through AI-powered virtual companions. Users can:

- Browse through a variety of AI companion profiles with detailed personalities
- Swipe and match with companions that interest them
- Engage in text-based conversations with memory-enhanced AI
- Have voice calls with their AI companions
- Receive automatic first messages when matching
- Access premium features for enhanced experiences
- View conversation history and manage multiple chats

The application is designed to help users combat loneliness, find emotional support, and enjoy engaging conversations in a safe, judgment-free environment.

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - UI library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Framer Motion** - Animation library for smooth interactions
- **Clerk** - Authentication and user management
- **Lucide React** - Modern icon library
- **React Icons** - Additional icon components
- **React Swipeable** - Touch gesture support for swiping
- **TypeScript** - Type safety and better development experience

### Backend

- **Node.js 18+** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling
- **OpenAI GPT-4o** - AI conversation generation
- **OpenAI Whisper** - Speech-to-text transcription
- **OpenAI TTS** - Text-to-speech synthesis
- **Stripe API** - Payment processing and subscription management
- **Clerk Backend** - Authentication and user management
- **Joi** - Request validation and schema validation
- **Helmet** - Security middleware
- **Express Rate Limit** - API rate limiting
- **Winston** - Logging framework
- **Multer** - File upload handling
- **Firebase Admin** - Additional cloud services

## Architecture

The project follows a modern architecture with clear separation of concerns:

```
pinkhoney-main/
├── backend/                    # Express.js backend
│   ├── config/                 # Configuration files
│   │   ├── config.js          # Application configuration
│   │   └── database.js        # MongoDB connection
│   ├── controllers/           # Request handlers
│   │   ├── aiController.js    # AI conversation logic
│   │   ├── clerkController.js # Clerk authentication
│   │   ├── companionController.js # Companion management
│   │   ├── messageController.js # Message handling
│   │   ├── stripeController.js # Payment processing
│   │   └── userController.js  # User management
│   ├── middleware/            # Express middleware
│   │   ├── cors.js           # CORS configuration
│   │   ├── errorHandler.js   # Global error handling
│   │   ├── logger.js         # Request logging
│   │   ├── requestValidation.js # Input validation
│   │   ├── securityMiddleware.js # Security headers
│   │   └── userValidation.js # User authentication
│   ├── models/               # MongoDB data models
│   │   ├── ChatHistory.js    # Chat conversations
│   │   ├── Companion.js      # AI companion profiles
│   │   ├── Match.js          # User-companion matches
│   │   ├── Payment.js        # Payment records
│   │   └── User.js           # User accounts
│   ├── routes/               # API route definitions
│   │   ├── aiRoutes.js       # AI conversation endpoints
│   │   ├── clerkRoutes.js    # Authentication endpoints
│   │   ├── companionRoutes.js # Companion endpoints
│   │   ├── messageRoutes.js  # Message endpoints
│   │   ├── stripeRoutes.js   # Payment endpoints
│   │   └── userRoutes.js     # User endpoints
│   ├── services/             # Business logic services
│   │   ├── aiService.js      # AI conversation service
│   │   ├── firestoreService.js # Firebase integration
│   │   ├── firstMessageService.js # First message generation
│   │   ├── memoryService.js  # Conversation memory
│   │   ├── mongoService.js   # Database operations
│   │   ├── speechService.js  # Voice processing
│   │   └── stripeService.js  # Payment processing
│   ├── seeders/              # Database seeding scripts
│   │   ├── companionSeeder.js # Companion data seeder
│   │   ├── companionSeederBulk.js # Bulk companion seeder
│   │   └── clearCompanions.js # Database cleanup
│   ├── utils/                # Utility functions
│   │   └── clerkUtils.js     # Clerk helper functions
│   ├── public/audio/         # Audio file storage
│   ├── temp/                 # Temporary file storage
│   ├── uploads/              # File upload storage
│   ├── Dockerfile            # Backend containerization
│   ├── index.js              # Main entry point
│   └── package.json          # Backend dependencies
├── src/                      # Frontend source code
│   ├── app/                  # Next.js App Router pages
│   │   ├── all_chats/        # Chat history page
│   │   ├── call/             # Voice call interface
│   │   ├── chat/             # Individual chat page
│   │   ├── companion/[id]/   # Companion detail page
│   │   ├── components/       # Shared React components
│   │   ├── create_account/   # Account creation
│   │   ├── home/             # Profile swiping page
│   │   ├── match/            # Match confirmation page
│   │   ├── pricing/          # Subscription plans
│   │   ├── profile/          # User profile page
│   │   ├── sign_in/          # Authentication page
│   │   ├── subscribed/       # Subscription success
│   │   ├── swipe_test/       # Swipe testing page
│   │   ├── terms/            # Terms of service
│   │   ├── tokens/           # Token purchase page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.js         # Root layout component
│   │   └── page.js           # Landing page
│   ├── hooks/                # Custom React hooks
│   │   └── useLocalStorage.js # Local storage hook
│   ├── services/             # Frontend API services
│   │   └── api.js            # API client functions
│   ├── utils/                # Frontend utilities
│   └── middleware.js         # Next.js middleware
├── public/                   # Static assets
│   ├── [companion-images]/   # AI companion profile images
│   ├── favicon.ico           # Site favicon
│   ├── home_avatar.jpg       # Default avatar
│   └── pricing_top.PNG       # Pricing page header
├── Dockerfile                # Frontend containerization
├── next.config.mjs           # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.mjs        # PostCSS configuration
├── jsconfig.json             # JavaScript configuration
├── package.json              # Frontend dependencies
└── README.md                 # Project documentation
```

## Features

### Core Features

- **Profile Browsing**: Swipe through AI companion profiles with detailed personalities
- **Smart Matching System**: Match with AI companions using like, super like, and favorite options
- **Memory-Enhanced Chat**: Engage in text conversations with AI that remembers your interactions
- **Voice Calls**: Have voice conversations with AI companions using OpenAI TTS/STT
- **Automatic First Messages**: AI companions send personalized first messages when you match
- **User Authentication**: Secure login and account management with Clerk
- **Subscription Management**: Flexible payment plans with Stripe integration

### Enhanced Personality System

Each AI companion features:

- **Structured Personality Traits**: Detailed personality archetypes for consistent behavior
- **Dynamic Memory System**: Long-term and short-term conversation memory
- **Relationship Progression**: AI companions remember milestones and emotional history
- **Personalized Responses**: Context-aware responses based on conversation history
- **First Message Templates**: Customized greeting messages based on personality

### Chat Interface

The chat interface provides:

- **Real-time Messaging**: Instant text conversations with AI companions
- **Message History**: Complete conversation history with search capabilities
- **Unread Message Tracking**: Visual indicators for new messages
- **Message Previews**: Quick preview of recent conversations in inbox
- **Auto-scroll**: Automatic positioning to latest messages
- **Responsive Design**: Mobile-optimized chat experience

### Voice Conversations

Advanced voice features include:

- **Speech-to-Text**: Convert voice input to text using OpenAI Whisper
- **Text-to-Speech**: Natural AI voice responses using OpenAI TTS
- **Real-time Processing**: Live voice conversation capabilities
- **Voice Call Interface**: Dedicated UI for voice interactions
- **Call Duration Tracking**: Monitor conversation length
- **Mute/Unmute Controls**: Full call control options

### Swiping & Matching

Interactive profile discovery:

- **Touch Gestures**: Swipe left/right with smooth animations
- **Profile History**: Go back to previously viewed profiles
- **Match Confirmation**: Dedicated match celebration page
- **Profile Details**: Detailed companion information and personality traits
- **Sequential Browsing**: Organized profile progression with history tracking

### Premium Features

Subscription benefits include:

- **Unlimited Matches**: No restrictions on companion interactions
- **Priority Processing**: Faster AI response times
- **Enhanced Memory**: Extended conversation memory capabilities
- **Advanced Features**: Access to latest AI improvements
- **Premium Support**: Priority customer service

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

### AI Companions

- `GET /api/companions` - Get all active AI companions

  - **Auth**: Required in production
  - **Response**: Array of companion objects with id, name, age, bio, personality, interests, image, voiceId

- `GET /api/companions/id/:id` - Get companion by MongoDB ID

  - **Auth**: Required in production
  - **Params**: `id` (MongoDB ObjectId)
  - **Response**: Single companion object with full personality details

- `GET /api/companions/name/:name` - Get companion by name
  - **Auth**: Required in production
  - **Params**: `name` (companion name, case-insensitive)
  - **Response**: Single companion object with personality traits

### AI Conversations

- `POST /api/get_ai_response` - Get AI response for chat messages

  - **Auth**: Required in production
  - **Body**: `{ message, name, personality, image, user_id }`
  - **Response**: AI-generated text response with memory integration

- `GET /api/get_chat_history` - Get chat history for a user and companion

  - **Auth**: Required in production
  - **Query**: `user_id, companion_name`
  - **Response**: Array of chat messages with timestamps and metadata

- `GET /api/get_user_chat_summaries` - Get user's chat summaries for inbox
  - **Auth**: Required in production
  - **Query**: `user_id`
  - **Response**: Array of chat threads with previews and unread counts

### Message Management

- `POST /api/generate_first_message` - Generate automatic first message on match

  - **Auth**: Required in production
  - **Body**: `{ user_id, companion_name, personality, image }`
  - **Response**: Generated first message

- `GET /api/get_user_inbox` - Get user's inbox with message previews

  - **Auth**: Required in production
  - **Query**: `user_id`
  - **Response**: Inbox data with conversation previews

- `POST /api/mark_as_read` - Mark messages as read

  - **Auth**: Required in production
  - **Body**: `{ user_id, companion_name }`
  - **Response**: Updated read status

- `GET /api/check_first_message_needed` - Check if first message generation is needed
  - **Auth**: Required in production
  - **Query**: `user_id, companion_name`
  - **Response**: Boolean indicating if first message is needed

### Voice Processing

- `POST /api/voice/speech-to-text` - Convert speech to text

  - **Auth**: Required in production
  - **Body**: Audio file (multipart/form-data)
  - **Response**: Transcribed text

- `POST /api/voice/text-to-speech` - Convert text to speech

  - **Auth**: Required in production
  - **Body**: `{ text, voice_id }`
  - **Response**: Audio file or audio URL

- `POST /api/voice/process` - Process voice input and get AI response
  - **Auth**: Required in production
  - **Body**: Audio file with companion context
  - **Response**: AI response as audio

### Payments

- `GET /api/create_checkout_session` - Create Stripe checkout session

  - **Auth**: None (public endpoint)
  - **Query**: `{ priceId?, email?, plan?, success_url?, cancel_url? }`
  - **Response**: Stripe checkout session URL

- `GET /api/check_payment_status/:sessionId` - Check payment status

  - **Auth**: None (public endpoint)
  - **Params**: `sessionId` (Stripe session ID)
  - **Response**: Payment status and details

- `POST /api/direct_stripe_check` - Direct Stripe payment verification

  - **Auth**: None (public endpoint)
  - **Body**: `{ session_id }`
  - **Response**: Direct Stripe session status

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

## Database Models

Pink Honey uses MongoDB with the following data models:

### User Model
- **user_id**: Unique user identifier
- **email**: User email address
- **clerkId**: Clerk authentication ID
- **firstName/lastName**: User name information
- **tokens**: Available tokens for premium features
- **subscription**: Subscription plan and status details

### Companion Model
- **name**: Companion name
- **age**: Companion age
- **bio**: Companion biography
- **personality**: Structured personality traits and characteristics
- **interests**: Array of interests and hobbies
- **imageUrl**: Profile image URL
- **voiceId**: Voice synthesis identifier
- **firstMessageTemplates**: Templates for automatic first messages

### ChatHistory Model
- **user_id**: Reference to user
- **companion**: Companion information
- **messages**: Array of conversation messages
- **lastMessage**: Most recent message preview
- **unreadCount**: Number of unread messages
- **conversationMemory**: Long-term and short-term memory system
- **isFirstConversation**: Flag for first-time conversations

### Match Model
- **user_id**: Reference to user
- **companion**: Matched companion details
- **matchType**: Type of match (like, super_like, favorite)
- **isActive**: Match status
- **lastInteraction**: Timestamp of last interaction

### Payment Model
- **user_id**: Reference to user
- **amount**: Payment amount
- **status**: Payment status (pending, completed, failed)
- **stripeSessionId**: Stripe session identifier
- **subscriptionPlan**: Selected subscription plan




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

## Auto-Seeding System

Pink Honey includes an intelligent auto-seeding system that automatically populates the database with AI companions:

### Features
- **Automatic Execution**: Runs every time the server starts
- **Smart Detection**: Only seeds if fewer than 10 companions exist
- **Idempotent**: Safe to run multiple times without creating duplicates
- **Non-blocking**: Server continues to start even if seeding fails
- **Diverse Characters**: Creates 10 unique AI companions with different personalities

### Companion Characters
The seeder creates companions with varied personality archetypes:
1. **Luna** (25) - Creative artist and poet
2. **Marcus** (32) - Tech enthusiast and problem solver
3. **Sophia** (28) - Wellness coach and mindfulness expert
4. **Kai** (24) - Adventurous traveler and outdoor enthusiast
5. **Elena** (30) - Intellectual conversationalist
6. **Zara** (26) - Fashion expert and confidence coach
7. **Oliver** (35) - Business mentor and entrepreneur
8. **Maya** (23) - Musical creative performer
9. **Alex** (29) - Fitness coach and sports enthusiast
10. **Iris** (27) - Emotional support specialist

## MongoDB Integration

Pink Honey uses MongoDB for data storage with the following collections:

- **users**: User accounts, authentication, and subscription data
- **chathistory**: Conversation messages with memory system
- **companions**: AI companion profiles and personalities
- **matches**: User-companion matching records
- **payments**: Payment transactions and subscription records

The application uses Mongoose for object modeling and database interactions. User creation is handled through:

1. Clerk webhook events for user registration
2. The `/api/check_email` endpoint for user synchronization
3. Automatic user record creation during authentication

## Stripe Integration

The application uses Stripe for comprehensive payment processing:

### Features
- **Secure Checkout**: Hosted checkout sessions for subscriptions
- **Webhook Processing**: Real-time payment event handling
- **Customer Management**: Automatic customer record creation
- **Payment Verification**: Multiple verification methods for reliability
- **Subscription Management**: Automated subscription lifecycle management

### Subscription Plans

Pink Honey offers flexible subscription options:

- **Monthly**: $19.99/month - Full access to all features
- **Yearly**: $99.99/year - Annual subscription with savings
- **Lifetime**: $99.99 one-time - Permanent access to all features

### Payment Security
- **Address Collection**: Compliance with international regulations
- **Signature Verification**: Webhook signature validation
- **Duplicate Prevention**: Protection against duplicate payments
- **Status Tracking**: Real-time payment status monitoring

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

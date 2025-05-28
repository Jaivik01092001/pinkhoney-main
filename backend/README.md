# Pink Honey Backend

Express.js backend for the Pink Honey AI Companion App, providing a robust API for AI-powered voice and text conversations with advanced memory and personality systems.

## Overview

This backend provides comprehensive API endpoints for the Pink Honey frontend, handling:

- **AI Conversation Responses** - OpenAI GPT-4o integration with memory-enhanced conversations
- **User Management** - Clerk authentication with MongoDB user synchronization
- **Payment Processing** - Stripe integration with subscription management
- **Voice Processing** - Speech-to-text and text-to-speech using OpenAI Whisper and TTS
- **Memory System** - Long-term and short-term conversation memory for personalized interactions
- **First Message Generation** - Automatic personalized first messages when users match
- **Companion Management** - AI companion profiles with structured personality traits
- **Message Management** - Inbox system with unread tracking and message previews

## Tech Stack

- **Node.js 18+** - JavaScript runtime environment
- **Express.js** - Web application framework with comprehensive middleware
- **MongoDB** - NoSQL database for data storage with Mongoose ODM
- **OpenAI API** - GPT-4o for conversations, Whisper for STT, TTS for voice synthesis
- **Stripe API** - Payment processing and subscription management
- **Clerk Backend** - Authentication and user management
- **Joi** - Request validation and schema validation
- **Helmet** - Security middleware for HTTP headers
- **Express Rate Limit** - API rate limiting and abuse prevention
- **Winston** - Structured logging framework
- **Multer** - File upload handling for voice processing
- **Firebase Admin** - Additional cloud services integration

## Architecture

The backend follows a modular architecture with clear separation of concerns:

```
backend/
├── config/                 # Configuration files
│   ├── config.js          # Application configuration
│   └── database.js        # MongoDB connection setup
├── controllers/           # Request handlers
│   ├── aiController.js    # AI conversation logic
│   ├── clerkController.js # Clerk authentication handling
│   ├── companionController.js # Companion management
│   ├── messageController.js # Message and inbox handling
│   ├── stripeController.js # Payment processing
│   └── userController.js  # User management
├── middleware/            # Express middleware
│   ├── cors.js           # CORS configuration
│   ├── errorHandler.js   # Global error handling
│   ├── logger.js         # Request logging
│   ├── requestValidation.js # Input validation with Joi
│   ├── securityMiddleware.js # Security headers and rate limiting
│   └── userValidation.js # User authentication middleware
├── models/               # MongoDB data models
│   ├── ChatHistory.js    # Chat conversations with memory system
│   ├── Companion.js      # AI companion profiles and personalities
│   ├── Match.js          # User-companion matching records
│   ├── Payment.js        # Payment transactions
│   └── User.js           # User accounts and subscriptions
├── routes/               # API route definitions
│   ├── aiRoutes.js       # AI conversation endpoints
│   ├── clerkRoutes.js    # Authentication endpoints
│   ├── companionRoutes.js # Companion management endpoints
│   ├── messageRoutes.js  # Message and inbox endpoints
│   ├── stripeRoutes.js   # Payment processing endpoints
│   └── userRoutes.js     # User management endpoints
├── services/             # Business logic services
│   ├── aiService.js      # AI conversation processing
│   ├── firestoreService.js # Firebase integration
│   ├── firstMessageService.js # First message generation
│   ├── memoryService.js  # Conversation memory management
│   ├── mongoService.js   # Database operations
│   ├── speechService.js  # Voice processing (STT/TTS)
│   └── stripeService.js  # Payment processing logic
├── seeders/              # Database seeding scripts
│   ├── companionSeeder.js # Individual companion seeder
│   ├── companionSeederBulk.js # Bulk companion seeder
│   └── clearCompanions.js # Database cleanup utility
├── utils/                # Utility functions
│   └── clerkUtils.js     # Clerk helper functions
├── public/audio/         # Audio file storage
├── temp/                 # Temporary file storage
├── uploads/              # File upload storage
├── Dockerfile            # Container configuration
├── index.js              # Main application entry point
└── package.json          # Dependencies and scripts
```

### Key Components

- **Controllers**: Handle HTTP requests, validate input, and coordinate responses
- **Middleware**: Process requests for security, authentication, validation, and logging
- **Models**: Define MongoDB schemas with validation and indexing
- **Routes**: Define API endpoints with middleware chains
- **Services**: Implement core business logic and external API integrations
- **Seeders**: Populate database with initial data and manage data lifecycle
- **Utils**: Provide reusable helper functions and utilities

## Middleware System

The application uses a comprehensive middleware system:

1. **Security Middleware**:

   - Helmet for HTTP headers security
   - CORS protection with configurable origins
   - Rate limiting to prevent abuse
   - Request size limits to prevent DoS attacks

2. **Authentication Middleware**:

   - Clerk integration for user authentication
   - Environment-based conditional authentication
   - User validation and synchronization with database

3. **Request Validation**:

   - Joi schema validation for all endpoints
   - Input sanitization and validation
   - Structured error responses

4. **Error Handling**:
   - Global error handler
   - Detailed error logging
   - Production-safe error responses

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
cd pinkhoney/backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the variables from `.env.example`.

4. Start the development server:

```bash
npm run dev
```

## API Endpoints

All API endpoints are protected with appropriate middleware for authentication, validation, and security.

### AI Conversation Endpoints

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

### Companion Management

- `GET /api/companions` - Get all active AI companions

  - **Auth**: Required in production
  - **Response**: Array of companion objects with full personality details

- `GET /api/companions/id/:id` - Get companion by MongoDB ID

  - **Auth**: Required in production
  - **Params**: `id` (MongoDB ObjectId)
  - **Response**: Single companion object with personality traits

- `GET /api/companions/name/:name` - Get companion by name
  - **Auth**: Required in production
  - **Params**: `name` (companion name, case-insensitive)
  - **Response**: Single companion object with structured personality

### Message Management

- `POST /api/generate_first_message` - Generate automatic first message on match

  - **Auth**: Required in production
  - **Body**: `{ user_id, companion_name, personality, image }`
  - **Response**: Generated personalized first message

- `GET /api/get_user_inbox` - Get user's inbox with message previews

  - **Auth**: Required in production
  - **Query**: `user_id`
  - **Response**: Inbox data with conversation previews and unread counts

- `POST /api/mark_as_read` - Mark messages as read

  - **Auth**: Required in production
  - **Body**: `{ user_id, companion_name }`
  - **Response**: Updated read status

- `GET /api/check_first_message_needed` - Check if first message generation is needed
  - **Auth**: Required in production
  - **Query**: `user_id, companion_name`
  - **Response**: Boolean indicating if first message is needed

### User Management

- `POST /api/check_email` - Check user email and subscription status

  - **Auth**: Required in production
  - **Body**: `{ email, clerkId?, firstName?, lastName? }`
  - **Response**: User information and subscription status

- `POST /api/change_subscription` - Update user subscription status

  - **Auth**: Required in production
  - **Body**: `{ email, subscriptionType }`
  - **Response**: Updated subscription status

- `POST /api/increase_tokens` - Increase user tokens
  - **Auth**: Required in production
  - **Body**: `{ email, amount }`
  - **Response**: Updated token count

### Voice Processing

- `POST /api/voice/speech-to-text` - Convert speech to text

  - **Auth**: Required in production
  - **Body**: Audio file (multipart/form-data)
  - **Response**: Transcribed text using OpenAI Whisper

- `POST /api/voice/text-to-speech` - Convert text to speech

  - **Auth**: Required in production
  - **Body**: `{ text, voice_id }`
  - **Response**: Audio file or audio URL using OpenAI TTS

- `POST /api/voice/process` - Process voice input and get AI response
  - **Auth**: Required in production
  - **Body**: Audio file with companion context
  - **Response**: AI response as audio

### Payment Processing

- `POST /api/create_checkout_session` - Create Stripe checkout session

  - **Auth**: None (public endpoint)
  - **Body**: `{ user_id, email?, selected_plan?, tokens?, price?, product_name? }`
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



## Environment Variables

The backend requires the following environment variables, which should be defined in a `.env` file:

```
# Server Configuration
PORT=8080                           # Port the server will run on
NODE_ENV=development                # Environment (development or production)
FRONTEND_URL=http://localhost:3000  # URL of the frontend application

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/pinkhoney  # MongoDB connection string

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here  # API key for OpenAI services

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here        # Stripe secret key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here  # Stripe publishable key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here    # Stripe webhook signing secret

# Stripe Price IDs
STRIPE_DEFAULT_PRICE_ID=price_default_id_here    # Default subscription price ID
STRIPE_LIFETIME_PRICE_ID=price_lifetime_id_here  # Lifetime subscription price ID
STRIPE_YEARLY_PRICE_ID=price_yearly_id_here      # Yearly subscription price ID
STRIPE_MONTHLY_PRICE_ID=price_monthly_id_here    # Monthly subscription price ID

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here          # Clerk secret key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here  # Clerk webhook signing secret
```

### Environment Configuration

The application uses different configurations based on the `NODE_ENV` environment variable:

- **Development**: Authentication is optional, webhook verification is skipped
- **Production**: Authentication is required, webhook verification is enforced

## Security Features

The backend implements several security features to protect user data and prevent attacks:

### HTTP Security Headers

Helmet middleware is used to set secure HTTP headers:

- Content Security Policy (CSP)
- XSS Protection
- MIME Sniffing Prevention
- HTTP Strict Transport Security (HSTS)
- Frame Protection (clickjacking prevention)
- Referrer Policy

### API Security

- **Rate Limiting**: Prevents abuse by limiting requests per IP
- **Request Size Limits**: Prevents DoS attacks by limiting request body size
- **CORS Protection**: Restricts cross-origin requests to trusted domains
- **Input Validation**: Validates all request data using Joi schemas
- **Authentication**: Secures routes with Clerk authentication
- **Webhook Verification**: Verifies signatures for Stripe and Clerk webhooks

### Data Security

- **Password-less Authentication**: Uses Clerk for secure authentication
- **MongoDB Validation**: Validates data before storage
- **Error Handling**: Prevents leaking sensitive information in errors
- **Environment-based Security**: Stricter security in production

## Core Services

The backend implements several specialized services for different aspects of the application:

### AI Service (`aiService.js`)
- **Conversation Processing**: Handles AI response generation using OpenAI GPT-4o
- **Memory Integration**: Incorporates conversation history and personality traits
- **Context Management**: Maintains conversation context across interactions
- **Response Optimization**: Ensures consistent and personality-appropriate responses

### Memory Service (`memoryService.js`)
- **Long-term Memory**: Stores relationship milestones and user preferences
- **Short-term Memory**: Maintains recent conversation context
- **Memory Processing**: Updates and retrieves conversation memory
- **Relationship Tracking**: Monitors emotional history and interaction patterns

### First Message Service (`firstMessageService.js`)
- **Automatic Generation**: Creates personalized first messages when users match
- **Personality-based**: Uses companion personality traits for message customization
- **Template System**: Utilizes predefined templates with dynamic content
- **Context Awareness**: Considers user profile and companion characteristics

### Speech Service (`speechService.js`)
- **Speech-to-Text**: Converts audio input to text using OpenAI Whisper
- **Text-to-Speech**: Generates natural voice responses using OpenAI TTS
- **Audio Processing**: Handles file upload, conversion, and temporary storage
- **Voice Customization**: Supports different voice profiles for companions

### Stripe Service (`stripeService.js`)
- **Payment Processing**: Handles subscription payments and one-time purchases
- **Webhook Management**: Processes Stripe webhook events for payment updates
- **Customer Management**: Creates and manages Stripe customer records
- **Subscription Lifecycle**: Manages subscription creation, updates, and cancellations

### MongoDB Service (`mongoService.js`)
- **Database Operations**: Centralized database interaction layer
- **User Management**: User creation, updates, and retrieval
- **Chat Management**: Message storage, retrieval, and conversation tracking
- **Match Management**: User-companion matching and relationship tracking

## MongoDB Integration

Pink Honey uses MongoDB for comprehensive data storage with the following collections:

### Collections Overview
- **users**: User accounts, authentication, and subscription data
- **chathistory**: Conversation messages with advanced memory system
- **companions**: AI companion profiles with structured personalities
- **matches**: User-companion matching records and interaction history
- **payments**: Payment transactions and subscription management

### Advanced Features
- **Memory System**: Long-term and short-term conversation memory
- **Personality Traits**: Structured personality data for consistent AI behavior
- **Relationship Tracking**: Emotional history and milestone tracking
- **Unread Management**: Message read status and notification system
- **Auto-indexing**: Optimized database queries with compound indexes

### Database Seeding

The application includes an intelligent auto-seeding system:

#### Auto-Seeding Features
- **Automatic Execution**: Runs every time the server starts
- **Smart Detection**: Only seeds if fewer than 10 companions exist
- **Idempotent**: Safe to run multiple times without creating duplicates
- **Non-blocking**: Server continues to start even if seeding fails
- **Diverse Characters**: Creates 10 unique AI companions with different personalities

#### Companion Characters
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

#### Manual Seeding Options

```bash
# Auto-seeding (runs on server start)
npm run dev

# Manual companion seeding
node seeders/companionSeeder.js

# Bulk companion seeding
node seeders/companionSeederBulk.js

# Legacy seeder (users and companions)
npm run seed
```

## Stripe Integration

The application uses Stripe for comprehensive payment processing:

### Features
- **Secure Checkout**: Hosted checkout sessions for subscriptions and one-time payments
- **Webhook Processing**: Real-time payment event handling with signature verification
- **Customer Management**: Automatic customer record creation and management
- **Payment Verification**: Multiple verification methods for payment reliability
- **Subscription Management**: Automated subscription lifecycle management
- **Address Collection**: Compliance with international billing regulations

### Subscription Plans
- **Monthly**: $19.99/month - Full access to all features
- **Yearly**: $99.99/year - Annual subscription with savings
- **Lifetime**: $99.99 one-time - Permanent access to all features

### Payment Security
- **Webhook Verification**: Stripe signature validation for all webhook events
- **Duplicate Prevention**: Protection against duplicate payment processing
- **Status Tracking**: Real-time payment status monitoring and updates
- **Error Handling**: Comprehensive error handling for payment failures

## Development Features

### Auto-Restart and Hot Reload
- **Nodemon**: Automatic server restart on file changes during development
- **Environment Detection**: Different configurations for development and production
- **Error Recovery**: Graceful error handling that doesn't crash the server

### Logging and Monitoring
- **Winston Logging**: Structured logging with different levels (error, warn, info, debug)
- **Request Logging**: Morgan middleware for HTTP request logging
- **Error Tracking**: Comprehensive error logging with stack traces in development

### Testing and Debugging
- **Postman Collection**: Pre-configured API testing collection
- **Health Check**: Server status endpoint for monitoring
- **Environment Variables**: Flexible configuration for different environments

## API Testing with Postman

A comprehensive Postman collection is included for testing all API endpoints:

### Setup Instructions
1. Import the `Pink_Honey_API.postman_collection.json` file into Postman
2. Set up an environment with the following variables:
   - `baseUrl`: Your backend server URL (default: `http://localhost:8080`)
   - `clerkId`: A valid Clerk user ID for testing authenticated endpoints
   - `email`: A valid user email for testing
3. Use the collection to test all API endpoints with proper authentication

### Available Test Collections
- **User Management**: User creation, authentication, and subscription management
- **Companion Management**: Companion retrieval and profile management
- **AI Conversations**: Chat history, AI responses, and memory system
- **Message Management**: First messages, inbox, and read status
- **Voice Processing**: Speech-to-text and text-to-speech endpoints
- **Payment Processing**: Stripe integration and webhook testing

## Docker Support

The backend includes Docker support for containerized deployment:

### Building and Running
```bash
# Build the Docker image
docker build -t pinkhoney-backend .

# Run the container with environment file
docker run -p 8080:8080 --env-file .env pinkhoney-backend

# Run with individual environment variables
docker run -p 8080:8080 \
  -e MONGODB_URI=your_mongodb_uri \
  -e OPENAI_API_KEY=your_openai_key \
  -e STRIPE_SECRET_KEY=your_stripe_key \
  pinkhoney-backend
```

### Docker Features
- **Multi-stage Build**: Optimized image size with production dependencies only
- **Health Checks**: Built-in health check endpoint for container monitoring
- **Environment Configuration**: Flexible environment variable configuration
- **Port Exposure**: Configurable port mapping (default: 8080)

## Performance and Scalability

### Optimization Features
- **Database Indexing**: Optimized MongoDB queries with compound indexes
- **Memory Management**: Efficient conversation memory storage and retrieval
- **Rate Limiting**: API rate limiting to prevent abuse and ensure fair usage
- **Caching**: Strategic caching of frequently accessed data
- **Connection Pooling**: MongoDB connection pooling for better performance

### Monitoring and Metrics
- **Health Endpoints**: Server health and status monitoring
- **Error Tracking**: Comprehensive error logging and tracking
- **Performance Logging**: Request timing and performance metrics
- **Resource Monitoring**: Memory and CPU usage tracking

## License

All rights reserved. This project is proprietary and confidential.

© 2024 Pink Honey

# Pink Honey Backend

Express.js backend for the Pink Honey AI Companion App, providing a robust API for AI-powered voice and text conversations.

## Overview

This backend provides API endpoints for the Pink Honey frontend, handling:

- AI conversation responses with OpenAI integration
- User management and authentication with Clerk
- Stripe payment processing and subscription management
- Real-time voice call integration with Socket.IO
- Speech-to-text and text-to-speech processing

## Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **Socket.IO** - Real-time bidirectional communication
- **OpenAI API** - AI conversation generation and speech processing
- **Stripe API** - Payment processing and subscription management
- **Clerk** - Authentication and user management
- **Joi** - Request validation
- **Helmet** - Security middleware

## Architecture

The backend follows a modular architecture with clear separation of concerns:

```
backend/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/         # Data models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── .env.example    # Example environment variables
├── index.js        # Main entry point
└── package.json    # Backend dependencies
```

### Key Components

- **Controllers**: Handle HTTP requests and responses
- **Middleware**: Process requests before they reach route handlers
- **Models**: Define data schemas for MongoDB
- **Routes**: Define API endpoints
- **Services**: Implement business logic and external API interactions
- **Utils**: Provide helper functions

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

### AI Responses

- `POST /api/get_ai_response` - Get AI response for chat messages

  - **Auth**: Required in production
  - **Body**: `{ message, name, personality, image, user_id }`
  - **Response**: AI-generated text response

- `GET /api/get_chat_history` - Get chat history for a user and companion
  - **Auth**: Required in production
  - **Query**: `user_id, companion_name`
  - **Response**: Array of chat messages

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

## MongoDB Integration

Pink Honey uses MongoDB for data storage with the following collections:

- **users**: Stores user information, including authentication details and subscription status
- **chat_history**: Stores conversation history between users and AI companions
- **companions**: Stores AI companion profiles and personalities
- **payments**: Stores payment records and subscription details

The application uses Mongoose for object modeling and database interactions. When users sign up with Clerk authentication, corresponding user entries are automatically created in MongoDB.

## Stripe Integration

The application uses Stripe for payment processing with the following features:

- Secure checkout sessions for subscription payments
- Webhook handling for payment events
- Billing address collection for compliance with Indian regulations
- Automatic subscription management

## API Testing with Postman

A Postman collection is included in the repository for testing the API endpoints. To use it:

1. Import the `Pink_Honey_API.postman_collection.json` file into Postman
2. Set up an environment with the `baseUrl` variable pointing to your backend server (default: `http://localhost:8080`)
3. Use the collection to test the various API endpoints

## Docker

To build and run the Docker container:

```bash
# Build the Docker image
docker build -t pinkhoney-backend .

# Run the container
docker run -p 8080:8080 --env-file .env pinkhoney-backend
```

## License

[MIT](LICENSE)

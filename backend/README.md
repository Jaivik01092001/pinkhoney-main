# Pink Honey Backend

Express.js backend for the Pink Honey AI Companion App.

## Overview

This backend provides API endpoints for the Pink Honey frontend, handling:

- AI conversation responses
- User management
- Stripe payment processing
- Voice call integration

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **OpenAI API** - AI conversation generation
- **Stripe API** - Payment processing
- **Cartesia API** - Voice call functionality
- **Clerk** - Authentication and user management

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- OpenAI API key
- Stripe account and API keys
- Cartesia account and API key
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

### AI Responses

- `POST /api/get_ai_response` - Get AI response for chat messages
- `GET /api/get_chat_history` - Get chat history for a user and companion

### User Management

- `POST /api/check_email` - Check user email and subscription status
- `POST /api/change_subscription` - Update user subscription status
- `POST /api/increase_tokens` - Increase user tokens

### Payments

- `GET /api/create_checkout_session` - Create Stripe checkout session
- `POST /api/webhook` - Handle Stripe webhook events

### Authentication

- `POST /api/clerk-webhook` - Handle Clerk authentication webhook events

### System

- `GET /health` - Server health check

## Environment Variables

The following environment variables are required:

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

# Cartesia Voice API
CARTESIA_API_KEY=your_cartesia_api_key_here
CARTESIA_URL=https://api.cartesia.ai

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

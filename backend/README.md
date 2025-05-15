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
- **Firebase Admin SDK** - Firestore database integration
- **OpenAI API** - AI conversation generation
- **Stripe API** - Payment processing
- **Daily.co API** - Voice call functionality

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore database
- OpenAI API key
- Stripe account and API keys
- Daily.co account and API key

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

### User Management

- `POST /api/check_email` - Check user email and subscription status
- `POST /api/change_subscription` - Update user subscription status
- `POST /api/increase_tokens` - Increase user tokens

### Payments

- `GET /api/create_checkout_session` - Create Stripe checkout session
- `POST /api/webhook` - Handle Stripe webhook events

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

# Daily.co Voice API
DAILY_BOTS_API_KEY=your_daily_bots_api_key_here
DAILY_BOTS_URL=https://api.daily.co/v1/bots

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_credentials_file.json

# Server Configuration
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

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

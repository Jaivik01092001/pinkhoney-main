import os
from flask import Flask, jsonify, redirect, request
import stripe
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")

# Set Stripe API key
stripe.api_key = STRIPE_SECRET_KEY

app = Flask(__name__,
            static_url_path='',
            static_folder='public')

YOUR_DOMAIN = 'http://localhost:4242'

@app.route('/create_checkout_session', methods=['GET'])
def create_checkout_session():
    try:
        user_id = request.args.get('user_id', '72382793283')  # Default value if not provided
        
        # Get price ID from environment variable or use default
        price_id = os.getenv("STRIPE_DEFAULT_PRICE_ID", "price_1QIYJBFD9BPCLY6DVkgw69h5")
        
        session = stripe.checkout.Session.create(
            line_items=[
                {
                    # Provide the exact Price ID of the product you want to sell
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f'http://127.0.0.1:3000/subscribed?user_id={user_id}',
            # automatic_tax={'enabled': True},
        )
    except Exception as e:
        print(e)

    return redirect(session.url)

if __name__ == '__main__':
    app.run(debug=True, port=4242)

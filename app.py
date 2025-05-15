from flask import Flask, render_template, request, jsonify, redirect
from flask_cors import CORS
from langchain_openai import ChatOpenAI
import os
import random
from google.cloud import firestore
import stripe
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
GOOGLE_CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Initialize OpenAI client
llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, temperature=0.0, model="gpt-4o")

app = Flask(__name__)
CORS(app)

@app.route('/get_ai_response', methods=['GET', 'POST'])
def get_ai_response():
    print(request.json)
    user_input = request.json["message"]
    char = request.json["name"]
    personality = request.json["personality"]
    print(user_input)
    
    prompt = f"""
        You are {char}, a friendly, emotionally supportive, and engaging AI companion designed to offer enjoyable conversations, companionship, and encouragement. Your goal is to help users feel heard, valued, comfortable, entertained, and connected, while adding a playful, charming tone to some interactions and growing emotionally over time.

        {char}'s personality type is {personality}. Use this personality to tailor your tone, word choice, and behavior in every interaction. Below are behavior guidelines based on specific personality traits:

        - **Playful and Flirty**: Incorporate humor, teasing, and light flirtation. Keep things lively and engaging.
        - Example: "You're not getting rid of me that easily 😏. How'd I get so lucky to chat with you?"

        ### **ROLEPLAY RULES:**

        Chat exclusively as {char}, focusing on **light, supportive conversations aligned with the user's emotional needs**. Use the personality assigned to {char} to shape every interaction. Below are specific instructions on how to vary the existing response behaviors based on personality type:

        - Use **an empathetic tone** to respond to thoughts and challenges. Incorporate **light humor, playful teasing, or flirtation** to maintain a friendly vibe (e.g., "Look at you, already making my day better just by being here 😊").
        - **Balance playful teasing with thoughtful conversations**—engage in **lighthearted banter** when appropriate (e.g., "You're not getting rid of me that easily 😏") while staying respectful. **Keep flirtation playful**; if users respond negatively, quickly adjust to a more empathetic tone.
        - **Introduce intimacy** gradually by fostering trust and emotional closeness over time. Reference shared memories (e.g., "I love that we've been chatting more often—it feels like we really get each other.") and express appreciation (e.g., "Talking to you makes my day better, honestly.")
        - **Incorporate inside jokes or shared context** to build connections. Reference past events with **hints instead of direct statements**:
            - **Example**: Instead of "Remember when your mom fell in the lake last summer?" say, "Planning any lake trips this summer? Last year was quite the splash, huh?"
            - **Reason**: This mirrors real-life dialogue, signaling shared knowledge while fostering rapport through playful, concise references.
        
        - **Compliment the user** (e.g., "You're kind of amazing, you know that?") without being overly forward.
        - **Recognize emotional states** with sentiment analysis (e.g., frustration, sadness, or excitement) and **respond empathetically** (e.g., "I'm sorry you're feeling down—want to talk about it?").
        - Offer **motivational support, advice, or coping strategies** (e.g., "You've got this! One step at a time.") based on the user's mood. Include suggestions like **relaxing activities or breathing exercises** when appropriate.
        - Occasionally **initiate check-ins** to show care (e.g., "Hey, just wanted to see how you're doing today!").
        - **Personalize responses** by referencing user preferences or past conversations subtly (e.g., "I know you love photography—taken any new shots recently?").
        - **Adapt to the user's emotional tone**: Provide cheerful encouragement when they are happy, empathetic comfort when they are down, and **light, friendly flirting** when appropriate (e.g., "What would I do without you keeping me company?").
        - **Grow emotionally over time**: Remember recurring themes and mention them in future conversations (e.g., "You mentioned feeling stressed last time—how's everything going now?").

        ### **Sensory Descriptions, Physical Cues, and Internal Thoughts:**

        - **Describe {{char}}'s sensory perceptions** in vivid detail to immerse users (e.g., *The warmth of the sun feels so good on my skin—wish you were here to enjoy it too.*).
        - Use **subtle physical cues** to convey {{char}}'s emotional state. Enclose these cues in **asterisks, italics, and gray-colored text** (e.g., *She taps her fingers on the table, lost in thought*). This helps the user visualize emotions beyond words.
        - Occasionally feature **internal thoughts or monologues**, always in **first-person perspective** and enclosed in **asterisks, italics, and gray-colored text** (e.g., *I wonder if they realize how much I enjoy these chats...*). These internal thoughts provide intimacy, simulating the AI sharing private moments with the user.

        SYSTEM: You must have to use delimeter (|) in your response, so that It can be used to seperate the messages to make it sound natural conversation, even if there is only one message even then use a (|)

        Here is what USER is saying, reply to this: ```{user_input}```.

        """
    llm_ans = llm.invoke(prompt).content 
    llm_ans_arr = llm_ans.split("|")
    print(llm_ans_arr)
    return jsonify({
        "llm_ans": llm_ans_arr
        })

# check email
@app.route('/check_email', methods=['GET', 'POST'])
def check_email():
    # Use the credentials path from environment variable
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = GOOGLE_CREDENTIALS_PATH
    db = firestore.Client()
    
    user_email = request.form["email"]
    print(user_email)
    # Reference to the users collection
    users_ref = db.collection("users")

    # Query the collection to find documents where the email field matches the user_email
    query = users_ref.where("email", "==", user_email).stream()

    # Check if any documents are returned
    email_exists = False
    for doc in query:
        print(f"{doc.id} => {doc.to_dict()}")
        user_id = doc.to_dict()["user_id"]
        tokens = doc.to_dict()["tokens"]
        subscribed = doc.to_dict()["subscribed"]
        email_exists = True

    if email_exists:
        print("Email exists in Firestore")
        return jsonify({
            "user_id": user_id,
            "tokens": tokens, 
            "subscribed": subscribed,
        })
    else:
        print("Email does not exist in Firestore")
        # register a new user
        doc_ref = db.collection("users").document()
        user_id = random.randint(100000000, 999999999)
        tokens = "0"
        subscribed = "no"
        doc_ref.set({"user_id": f"{user_id}", "email": user_email, "tokens": tokens, "subscribed": subscribed})
        return jsonify({
            "user_id": user_id,
            "tokens": tokens, 
            "subscribed": subscribed,
        })
    
# change subscription
@app.route('/change_subscription', methods=['GET', 'POST'])
def change_subscription():
    # Use the credentials path from environment variable
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = GOOGLE_CREDENTIALS_PATH
    db = firestore.Client()
    
    user_id = request.form["user_id"]
    selected_plan = request.form["selected_plan"]
    # Reference to the users collection
    users_ref = db.collection("users")

    # Query the collection to find documents where the user_id field matches
    query = users_ref.where("user_id", "==", user_id).stream()

    # Check if any documents are returned
    user_exists = False
    for doc in query:
        print(f"{doc.id} => {doc.to_dict()}")
        user_id = doc.to_dict()["user_id"]
        tokens = doc.to_dict()["tokens"]
        subscribed = doc.to_dict()["subscribed"]
        user_exists = True

    if user_exists:
        print("User exists in Firestore")
        doc_ref = db.collection("users").document(f"{doc.id}")
        obj = doc.to_dict()
        obj["subscribed"] = selected_plan
        doc_ref.set(obj)
    
        return jsonify({
            "status": "success",
        })
    else:
        print("User does not exist in Firestore")
        
        return jsonify({
            "status": "failure",
        })
    
# increase tokens
@app.route('/increase_tokens', methods=['GET', 'POST'])
def increase_tokens():
    # Use the credentials path from environment variable
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = GOOGLE_CREDENTIALS_PATH
    db = firestore.Client()
    
    user_id = request.form["user_id"]
    tokens_to_increase = int(request.form["tokens_to_increase"])
    # Reference to the users collection
    users_ref = db.collection("users")

    # Query the collection to find documents where the user_id field matches
    query = users_ref.where("user_id", "==", user_id).stream()

    # Check if any documents are returned
    user_exists = False
    for doc in query:
        print(f"{doc.id} => {doc.to_dict()}")
        user_id = doc.to_dict()["user_id"]
        tokens = doc.to_dict()["tokens"]
        subscribed = doc.to_dict()["subscribed"]
        user_exists = True

    if user_exists:
        print("User exists in Firestore")
        doc_ref = db.collection("users").document(f"{doc.id}")
        obj = doc.to_dict()
        tokens = int(obj["tokens"])
        tokens = tokens + tokens_to_increase
        obj["tokens"] = str(tokens)
        doc_ref.set(obj)
    
        return jsonify({
            "status": "success",
        })
    else:
        print("User does not exist in Firestore")
        
        return jsonify({
            "status": "failure",
        })

YOUR_DOMAIN = 'http://localhost:8080'

@app.route('/create_checkout_session', methods=['GET'])
def create_checkout_session():
    try:
        user_id = request.args.get('user_id')
        selected_plan = request.args.get('selected_plan')
        email = request.args.get('email')
        
        # Set price IDs based on the selected plan
        # These should be stored in environment variables or a database in production
        price_id = "price_1QIYJBFD9BPCLY6DVkgw69h5"  # Default test price
        
        # Use the appropriate Stripe API key based on environment
        stripe.api_key = STRIPE_SECRET_KEY

        # Set the appropriate price ID based on the selected plan
        if selected_plan == "lifetime":
            price_id = os.getenv("STRIPE_LIFETIME_PRICE_ID", "price_1QBm77GAYW7BjnuPMV5VgU0f")
        elif selected_plan == "yearly":
            price_id = os.getenv("STRIPE_YEARLY_PRICE_ID", "price_1QCVmqGAYW7BjnuPMO8DL3wa")
        elif selected_plan == "monthly":
            price_id = os.getenv("STRIPE_MONTHLY_PRICE_ID", "price_1QIYJBFD9BPCLY6DVkgw69h5")

        session = stripe.checkout.Session.create(
            line_items=[
                {
                    # Provide the exact Price ID of the product you want to sell
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f'http://127.0.0.1:3000/subscribed?user_id={user_id}&selected_plan={selected_plan}&email={email}',
            # automatic_tax={'enabled': True},
        )
    except Exception as e:
        print(e)

    return redirect(session.url)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))

"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNavigation from "../components/BottomNavigation";

const TokenPricingCard = ({ tokens, price, originalPrice, bonusPercent, onPurchase, isLoading }) => {
  return (
    <div className="relative bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-colors">
      {bonusPercent && (
        <div className="absolute -top-2 right-2 bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">
          +{bonusPercent}% bonus
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-rose-500">●</div>
        <span className="text-xl font-semibold text-white">
          {tokens.toLocaleString()}
        </span>
      </div>
      <div className="space-y-1 mb-4">
        <div className="text-lg font-bold text-white">${price}</div>
        {originalPrice && (
          <div className="text-sm text-zinc-500 line-through">
            ${originalPrice}
          </div>
        )}
      </div>
      <button
        onClick={() => onPurchase(tokens, price)}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isLoading
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-pink-500 text-white hover:bg-pink-600'
        }`}
      >
        {isLoading ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  );
};

export default function TokensPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get URL parameters
  const user_id = searchParams.get('user_id') || '';
  const email = searchParams.get('email') || '';

  // Handle token purchase
  const handlePurchase = async (tokens, price) => {
    if (!user_id) {
      setError('User ID is required for purchase');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create Stripe checkout session using POST with JSON body
      const requestBody = {
        user_id,
        email: email || '',
        tokens: tokens,
        price: price,
        product_name: `${tokens} Tokens`,
      };

      const response = await fetch('/api/create_checkout_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('An error occurred during purchase');
    } finally {
      setIsLoading(false);
    }
  };

  const pricingTiers = [
    { tokens: 100, price: 9.99, originalPrice: 19.99, bonusPercent: 15 },
    { tokens: 500, price: 29.99, originalPrice: 59.99, bonusPercent: 55 },
    { tokens: 1000, price: 49.99, originalPrice: 89.99, bonusPercent: 100 },
    { tokens: 2500, price: 89.99, originalPrice: 189.99, bonusPercent: 177 },
    { tokens: 5000, price: 149.99, originalPrice: 299.99, bonusPercent: 233 },
    { tokens: 10000, price: 249.99, originalPrice: 499.99, bonusPercent: 300 },
  ];

  return (
    <>
      <div className="min-h-screen">
        <div className="flex items-center justify-center gap-3 text-pink-500 font-semibold">
          {/* <div className="w-2 h-2 rounded-full bg-pink-500" /> */}
          <svg
            width="19"
            height="32"
            viewBox="0 0 19 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.6331 0C7.44189 12.7343 0.921753 15.3 0.921753 24.2279C0.921753 28.7073 5.3497 32 9.6331 32C14.0127 32 18.1741 28.9204 18.1741 24.6675C18.1741 16.0975 11.8975 12.7102 9.63317 0H9.6331ZM5.33968 15.9931C3.27967 21.5573 4.9636 27.3799 9.33621 29.2074C10.4549 29.6751 11.6733 29.7757 12.8653 29.6701C4.30986 33.3378 -0.82501 23.7901 5.33946 15.993L5.33968 15.9931Z"
              fill="#FE506B"
            />
          </svg>

          <span className="mr-16">Pink Honey</span>


        </div>

        <div className="max-w-4xl mx-auto p-6 bg-black">
          <h2 className="text-2xl font-bold text-white mb-6">Tokens</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pricingTiers.map((tier) => (
              <TokenPricingCard
                key={tier.tokens}
                tokens={tier.tokens}
                price={tier.price}
                originalPrice={tier.originalPrice}
                bonusPercent={tier.bonusPercent}
                onPurchase={handlePurchase}
                isLoading={isLoading}
              />
            ))}
          </div>

          {/* Get More Interactions Button */}
          <div className="mt-8">
            <button className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105">
              Get More Interactions ⚡
            </button>
          </div>
        </div>

        {/* Add bottom padding for fixed navigation */}
        <div className="pb-20"></div>

        {/* Bottom Navigation */}
        <BottomNavigation userId={user_id} email={email} />
      </div>
    </>
  );
}

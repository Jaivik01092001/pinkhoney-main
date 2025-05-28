"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNavigation from "../components/BottomNavigation";

export default function TokenSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [error, setError] = useState('');

  // Get URL parameters
  const user_id = searchParams.get('user_id') || '';
  const tokens = searchParams.get('tokens') || '';
  const session_id = searchParams.get('session_id') || '';

  useEffect(() => {
    const verifyPurchase = async () => {
      if (!session_id) {
        setError('No session ID found');
        setVerificationStatus('error');
        setIsLoading(false);
        return;
      }

      try {
        // Check payment status with Stripe
        const response = await fetch(`/api/check_payment_status/${session_id}`);
        const data = await response.json();

        if (data.success && data.status === 'paid') {
          setVerificationStatus('success');
        } else {
          setError('Payment verification failed');
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError('Failed to verify payment');
        setVerificationStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPurchase();
  }, [session_id]);

  const handleContinue = () => {
    // Redirect back to tokens page or dashboard
    if (user_id) {
      router.push(`/tokens?user_id=${user_id}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto"></div>
              <h2 className="text-2xl font-bold">Verifying your purchase...</h2>
              <p className="text-zinc-400">Please wait while we confirm your token purchase.</p>
            </div>
          ) : verificationStatus === 'success' ? (
            <div className="space-y-6">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h1 className="text-3xl font-bold text-green-500">Purchase Successful!</h1>
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <h3 className="text-xl font-semibold mb-2">Purchase Details</h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Tokens Purchased:</span>
                    <span className="font-semibold text-pink-500">{tokens?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Status:</span>
                    <span className="text-green-500 font-semibold">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Session ID:</span>
                    <span className="text-xs text-zinc-500 font-mono">{session_id}</span>
                  </div>
                </div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400">
                  Your tokens have been added to your account and are ready to use!
                </p>
              </div>
              <button
                onClick={handleContinue}
                className="w-full bg-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-600 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-red-500 text-6xl mb-4">✗</div>
              <h1 className="text-3xl font-bold text-red-500">Purchase Failed</h1>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400">
                  {error || 'There was an issue processing your payment. Please try again or contact support.'}
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/tokens?user_id=${user_id}`)}
                  className="w-full bg-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-600 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-zinc-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-zinc-600 transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

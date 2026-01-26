"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DepositPage() {
  // 1. URL PARAMETERS
  // We grab the 'goalId' from the URL 
  // This ensures the payment is linked to the correct savings goal in the DB.
  const { goalId } = useParams();
  const router = useRouter();

  // 2. STATE MANAGEMENT
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false); // UX: Prevents double-submission
  const [error, setError] = useState(null);      // UX: Feedback for validation/API errors

  const handleDeposit = async () => {
    setError(null);

    // 3. CLIENT-SIDE VALIDATION
    // To provide instant feedback and reduce unnecessary server load.
    if (!amount || Number(amount) <= 0) {
      return setError("Enter a valid amount");
    }

    setLoading(true);
    try {
      // 4. API CALL (INITIATE CHECKOUT)
      // create a secure "Stripe Checkout Session".
      const res = await fetch(`/api/goals/${goalId}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const data = await res.json();
      
      // Error Handling: Catches backend rejections (e.g., Goal already completed)
      if (!res.ok) throw new Error(data.error || "Stripe checkout failed");

      // 5. EXTERNAL REDIRECT
      // router.push is for internal App navigation. Since we are going 
      // to 'checkout.stripe.com', we need a full browser redirect.
      window.location.href = data.checkoutUrl;
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Deposit to Savings Goal</h1>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        {/* ERROR MESSAGE DISPLAY */}
        {error && (
          <p className="text-red-600 text-sm mb-2">{error}</p>
        )}

        {/* MAIN ACTION BUTTON */}
        <button
          onClick={handleDeposit}
          disabled={loading} 
          className={`w-full py-2 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Redirecting to Stripe…" : "Deposit via Stripe"}
        </button>

        {/* CANCEL BUTTON */}
        <button
          onClick={() => router.back()} // Next.js: Goes back to previous history entry
          className="w-full mt-2 border py-2 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
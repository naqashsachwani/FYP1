"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DepositPage() {
  const { goalId } = useParams();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeposit = async () => {
    setError(null);

    if (!amount || Number(amount) <= 0) {
      return setError("Enter a valid amount");
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/goals/${goalId}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Stripe checkout failed");

      // ✅ Redirect to Stripe
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

        {error && (
          <p className="text-red-600 text-sm mb-2">{error}</p>
        )}

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

        <button
          onClick={() => router.back()}
          className="w-full mt-2 border py-2 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

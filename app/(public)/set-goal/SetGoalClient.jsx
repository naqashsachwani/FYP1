'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import ProgressChart from "./ProgressChart";
import { useUser } from "@clerk/nextjs";

/* ================= TERMS MODAL ================= */
function TermsModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-3">Terms & Conditions</h2>
        <ul className="text-sm list-disc pl-5 space-y-1">
          <li>Deposits are tracked against your savings goal</li>
          <li>Products are reserved until goal completion</li>
          <li>Refunds require admin approval</li>
          <li>No hidden charges</li>
        </ul>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN PAGE ================= */
export default function SetGoalClient() {
  const { user } = useUser();
  const userId = user?.id;

  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");

  const [product, setProduct] = useState(null);
  const [period, setPeriod] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [goals, setGoals] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const calcDate = (m) => {
    const d = new Date();
    d.setMonth(d.getMonth() + Number(m));
    return d.toISOString().split("T")[0];
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!productId) return;

    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(d => setProduct(d.product));

    fetch("/api/set-goal")
      .then(r => r.json())
      .then(d => setGoals(d.goals || []));
  }, [productId]);

  /* ================= SAVE ONLY ================= */
  const saveGoal = async () => {
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/set-goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        targetAmount: product.price,
        targetDate,
        status: "SAVED",
      }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error);

    setSuccess("Goal saved successfully!");

    // refresh goals (avoid duplicate key issue)
    const refreshed = await fetch("/api/set-goal").then(r => r.json());
    setGoals(refreshed.goals || []);

    setTimeout(() => router.push("/cart"), 1200);
  };

  /* ================= START GOAL ================= */
  const startGoal = async () => {
    setError(null);
    if (!termsAccepted) return setError("Accept terms first");

    setLoading(true);

    const res = await fetch("/api/set-goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        targetAmount: product.price,
        targetDate,
        status: "STARTED",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return setError(data.error);
    }

    // 10% advance payment
    const stripe = await fetch("/api/stripe?mode=checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalIds: [data.goal.id],
        userId,
        amount: product.price * 0.1,
      }),
    });

    const stripeData = await stripe.json();
    if (!stripe.ok) {
      setLoading(false);
      return setError(stripeData.error);
    }

    window.location.href = stripeData.checkoutUrl;
  };

  /* ================= DELETE SAVED GOAL ================= */
  const deleteGoal = async (goalId) => {
    await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
    setGoals(goals.filter(g => g.id !== goalId));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">

      <h1 className="text-2xl font-semibold mb-4">Set Savings Goal</h1>

      {product && (
        <div className="flex gap-4 mb-4 p-4 bg-gray-50 rounded">
          {product.images?.[0] && (
            <Image src={product.images[0]} width={80} height={80} alt="" />
          )}
          <div>
            <p className="font-semibold">{product.name}</p>
            <p>Price: {product.price}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <select
          onChange={e => {
            setPeriod(e.target.value);
            setTargetDate(calcDate(e.target.value));
          }}
          className="w-full border p-2 rounded"
        >
          <option value="">Select period</option>
          <option value="3">3 Months</option>
          <option value="6">6 Months</option>
          <option value="12">12 Months</option>
        </select>

        <label className="flex gap-2 text-sm">
          <input type="checkbox" onChange={e => setTermsAccepted(e.target.checked)} />
          Accept{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => setShowTerms(true)}
          >
            Terms
          </span>
        </label>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <div className="flex gap-3">
          <button
            onClick={saveGoal}
            className="w-1/2 border py-2 rounded hover:bg-gray-50"
          >
            Save Goal
          </button>

          <button
            onClick={startGoal}
            disabled={loading}
            className="w-1/2 bg-black text-white py-2 rounded"
          >
            {loading ? "Processing..." : "Start Goal"}
          </button>
        </div>
      </div>

      {/* ================= SAVED GOALS ================= */}
      {goals.filter(g => g.status === "SAVED").length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold mb-2">Saved Goals</h2>
          {goals
            .filter(g => g.status === "SAVED")
            .map((g, i) => (
              <div key={`${g.id}-${i}`} className="p-3 border rounded mb-2 flex justify-between">
                <span>{g.product?.name}</span>
                <button
                  onClick={() => deleteGoal(g.id)}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      )}

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}

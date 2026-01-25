'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
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
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");

  const [product, setProduct] = useState(null);
  const [period, setPeriod] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper to calculate date based on months
  const calcDate = (m) => {
    if (!m) return "";
    const d = new Date();
    d.setMonth(d.getMonth() + Number(m));
    return d.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(d => setProduct(d.product));
  }, [productId]);

  /* ================= START GOAL (Active) ================= */
  const startGoal = async () => {
    setError(null);
    
    // Validation
    if (!period) return setError("Please select a time period.");
    if (!targetDate) return setError("Target date is invalid. Please re-select period.");
    if (!termsAccepted) return setError("Accept terms first");

    setLoading(true);

    try {
      // 1. Create the Goal in Database (Status: ACTIVE)
      const res = await fetch("/api/set-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store", 
        body: JSON.stringify({
          productId,
          targetAmount: product.price,
          targetDate, // ✅ Ensuring this is sent
          status: "ACTIVE", 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create goal");
      }

      // 2. Redirect
      setSuccess("Goal started! Redirecting...");
      router.refresh(); 
      router.push(`/goals/${data.goal.id}`); 

    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
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
            const val = e.target.value;
            setPeriod(val);
            setTargetDate(calcDate(val)); // ✅ Updates date state
            if (error) setError(null);
          }}
          className="w-full border p-2 rounded"
          value={period} 
        >
          <option value="">Select period</option>
          <option value="3">3 Months</option>
          <option value="6">6 Months</option>
          <option value="12">12 Months</option>
        </select>

        {/* Debugging Visual: Show user the calculated date */}
        {targetDate && (
            <p className="text-sm text-gray-500">
                Goal End Date: <span className="font-semibold">{targetDate}</span>
            </p>
        )}

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
            onClick={startGoal}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Processing..." : "Start Goal"}
          </button>
        </div>
      </div>

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TermsModal from "@/components/TermsModal";

export default function CreateGoal() {
  const router = useRouter();
  const [showTerms, setShowTerms] = useState(true);
  const [form, setForm] = useState({ productId: "", targetAmount: "", targetDate: "" });

  const handleSubmit = async () => {
    if (!form.productId || !form.targetAmount) return alert("Fill all required fields");

    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Something went wrong");

    alert("Goal created successfully!");
    router.push("/goals");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-3">Start a New Goal</h1>

      {showTerms ? (
        <TermsModal onAccept={(accepted) => accepted && setShowTerms(false)} />
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Product ID"
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            className="border p-2 w-full rounded"
          />

          <input
            type="number"
            placeholder="Target Amount"
            value={form.targetAmount}
            onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
            className="border p-2 w-full rounded"
          />

          <input
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            className="border p-2 w-full rounded"
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Create Goal
          </button>
        </div>
      )}
    </div>
  );
}

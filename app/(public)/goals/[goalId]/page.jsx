"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import GoalCard from "@/components/GoalCard";

export default function GoalDetails() {
  const { goalId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingDeposit, setSavingDeposit] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handledRef = useRef(false);

  /* ================= FETCH GOAL ================= */
  const fetchGoal = async () => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      normalizeAndSetGoal(data.goal);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= NORMALIZE GOAL ================= */
  const normalizeAndSetGoal = (goalData) => {
    const normalizedGoal = {
      ...goalData,
      saved: Number(goalData.saved),
      targetAmount: Number(goalData.targetAmount),
      deposits: (goalData.deposits || []).map(d => ({
        ...d,
        amount: Number(d.amount),
      })),
    };

    normalizedGoal.progressPercent =
      normalizedGoal.targetAmount > 0
        ? (normalizedGoal.saved / normalizedGoal.targetAmount) * 100
        : 0;

    setGoal(normalizedGoal);
  };

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  /* ================= HANDLE STRIPE SUCCESS ================= */
  useEffect(() => {
    const payment = searchParams.get("payment");
    const amount = searchParams.get("amount");

    if (payment === "success" && amount && !handledRef.current) {
      handledRef.current = true;
      setSavingDeposit(true);

      fetch(`/api/goals/${goalId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      })
        .then(async res => {
          const data = await res.json();
          if (data.success && data.goal) {
            normalizeAndSetGoal(data.goal);
            setSuccessMessage(
              data.goalCompleted
                ? "🎉 Deposit added and goal completed!"
                : "✅ Deposit added successfully!"
            );
          } else {
            setSuccessMessage(data.error || "Something went wrong.");
          }
        })
        .finally(() => setSavingDeposit(false));
    }
  }, [searchParams, goalId]);

  if (loading) return <p className="p-4">Loading goal…</p>;
  if (!goal) return <p className="p-4 text-red-500">Goal not found</p>;

  /* ================= CHART DATA ================= */
  const chartData = {
    labels: goal.deposits.map(d =>
      new Date(d.createdAt).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Deposits Over Time",
        data: goal.deposits.map(d => d.amount),
        fill: true,
        backgroundColor: "rgba(16,185,129,0.2)",
        borderColor: "rgba(5,150,105,1)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-700 p-3 rounded">
          {successMessage}
        </div>
      )}

      {/* GOAL COMPLETED MESSAGE */}
      {goal.status === "COMPLETED" && (
        <div className="mb-4 bg-green-100 text-green-800 p-3 rounded font-semibold">
          🎉 Congratulations! Your goal has been completed.
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">
        {goal.product?.name || "Savings Goal"}
      </h1>

      <GoalCard goal={goal} />

      {/* PROGRESS BAR */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Progress</h2>
        <div className="w-full bg-slate-200 rounded-full h-6">
          <div
            className="bg-emerald-600 h-6 rounded-full text-white text-center font-semibold transition-all"
            style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
          >
            {Math.round(goal.progressPercent)}%
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Saved: {goal.saved} / Target: {goal.targetAmount}
        </p>
      </div>

      {/* CHART */}
      {goal.deposits.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Deposit History</h2>
          <Line data={chartData} />
        </div>
      )}

      {/* ADD DEPOSIT BUTTON */}
      <div className="mt-6">
        <button
          disabled={savingDeposit || goal.status === "COMPLETED"}
          onClick={() => router.push(`/goals/${goalId}/deposit`)}
          className={`px-4 py-2 rounded text-white ${
            savingDeposit || goal.status === "COMPLETED"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {goal.status === "COMPLETED"
            ? "Goal Completed"
            : "Add Deposit via Stripe"}
        </button>
      </div>

      {/* DEPOSIT LIST */}
      {goal.deposits.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Deposits</h2>
          <ul className="space-y-2">
            {goal.deposits.map(d => (
              <li
                key={d.id}
                className="p-3 border rounded flex justify-between bg-slate-50"
              >
                <span>{new Date(d.createdAt).toLocaleString()}</span>
                <span className="font-semibold text-emerald-700">
                  {d.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

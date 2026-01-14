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
    // 1. Convert deposits to proper numbers/dates
    const deposits = (goalData.deposits || []).map((d) => ({
      ...d,
      amount: Number(d.amount),
      createdAt: new Date(d.createdAt),
    }));

    // 2. MANUALLY CALCULATE TOTAL SAVED
    const calculatedSaved = deposits.reduce((sum, dep) => sum + dep.amount, 0);

    const normalizedGoal = {
      ...goalData,
      targetAmount: Number(goalData.targetAmount),
      deposits: deposits,
      saved: calculatedSaved,
      // We keep raw strings for dates here to be safe, 
      // and convert them using new Date() when displaying.
    };

    // 3. Calculate percentage
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
        .then(async (res) => {
          const data = await res.json();
          if (data.success && data.goal) {
            normalizeAndSetGoal(data.goal);
            setSuccessMessage(
              data.goalCompleted
                ? "🎉 Deposit added and goal completed!"
                : "✅ Deposit added successfully!"
            );
            router.replace(`/goals/${goalId}`);
          } else {
            setSuccessMessage(data.error || "Something went wrong.");
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setSavingDeposit(false));
    }
  }, [searchParams, goalId, router]);

  if (loading) return <p className="p-4">Loading goal…</p>;
  if (!goal) return <p className="p-4 text-red-500">Goal not found</p>;

  /* ================= CHART DATA (FIXED) ================= */
  // 1. Sort deposits by date
  const sortedDeposits = [...goal.deposits].sort(
    (a, b) => a.createdAt - b.createdAt
  );

  // 2. Create Chart Points
  // Added 'new Date()' around goal.createdAt to prevent the crash
  const chartPoints = [
    { date: new Date(goal.createdAt).toLocaleDateString(), amount: 0 },
    ...sortedDeposits.map((d) => ({
      date: d.createdAt.toLocaleDateString(),
      amount: d.amount,
    })),
  ];

  // 3. Calculate Cumulative Totals
  let runningTotal = 0;
  const cumulativeData = chartPoints.map((p) => {
    runningTotal += p.amount;
    return runningTotal;
  });

  const chartData = {
    labels: chartPoints.map((p) => p.date),
    datasets: [
      {
        label: "Total Saved Progress",
        data: cumulativeData,
        fill: true,
        backgroundColor: "rgba(16,185,129,0.1)",
        borderColor: "rgba(5,150,105,1)",
        pointBackgroundColor: "#fff",
        pointBorderColor: "rgba(5,150,105,1)",
        pointBorderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-700 p-3 rounded border border-green-200">
          {successMessage}
        </div>
      )}

      {/* GOAL COMPLETED MESSAGE */}
      {goal.status === "COMPLETED" && (
        <div className="mb-4 bg-green-100 text-green-800 p-3 rounded font-semibold border border-green-200">
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
        <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden relative">
          <div
            className={`h-6 flex items-center justify-center text-white text-xs font-bold transition-all duration-700 ease-out ${
              goal.progressPercent >= 100 ? "bg-green-600" : "bg-emerald-600"
            }`}
            // 1. Cap width at 100%
            style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
          >
            {/* 2. ✅ FIX: Cap text at 100% so it doesn't show 1333% */}
            {goal.progressPercent > 10 &&
              `${Math.min(Math.round(goal.progressPercent), 100)}%`}
          </div>

          {goal.progressPercent <= 10 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs font-bold pointer-events-none">
              {Math.min(Math.round(goal.progressPercent), 100)}%
            </div>
          )}
        </div>
        <div className="flex justify-between mt-2 text-sm text-slate-600 font-medium">
          <span>
            Saved: {goal.currency || "Rs"} {goal.saved.toLocaleString()}
          </span>
          <span>
            Target: {goal.currency || "Rs"}{" "}
            {goal.targetAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* CHART */}
      <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold mb-4">Savings Growth</h2>
        <Line data={chartData} />
      </div>

      {/* ADD DEPOSIT BUTTON */}
      <div className="mt-6">
        <button
          disabled={savingDeposit || goal.status === "COMPLETED"}
          onClick={() => router.push(`/goals/${goalId}/deposit`)}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all ${
            savingDeposit || goal.status === "COMPLETED"
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          {savingDeposit
            ? "Processing..."
            : goal.status === "COMPLETED"
            ? "Goal Completed"
            : "Add Deposit via Stripe"}
        </button>
      </div>

      {/* DEPOSIT LIST */}
      {goal.deposits.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
          <ul className="space-y-2">
            {[...goal.deposits]
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((d) => (
                <li
                  key={d.id}
                  className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-white shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="text-slate-800 font-medium">Deposit</span>
                    <span className="text-slate-500 text-xs">
                      {d.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-700 text-lg">
                    + {d.amount}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
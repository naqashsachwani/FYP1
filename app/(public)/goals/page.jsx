"use client";

import { useEffect, useState } from "react";
import GoalCard from "@/components/GoalCard";
import ProgressChart from "@/components/ProgressChart";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then((data) => {
        const rawGoals = data.goals || [];

        // ✅ FIX: Manually calculate progress for each goal in the list
        const calculatedGoals = rawGoals.map((goal) => {
          // 1. Sum up all deposits for this goal
          const totalSaved = (goal.deposits || []).reduce(
            (sum, dep) => sum + Number(dep.amount),
            0
          );

          // 2. Calculate percentage
          const target = Number(goal.targetAmount);
          const percent = target > 0 ? (totalSaved / target) * 100 : 0;

          // 3. Return the goal with the corrected 'saved' value
          return {
            ...goal,
            saved: totalSaved, // Overwrite the database value
            targetAmount: target,
            progressPercent: percent,
          };
        });

        setGoals(calculatedGoals);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Savings Goals</h1>

      {loading && <p>Loading goals...</p>}

      {!loading && goals.length === 0 && (
        <p>No goals found. Start a new goal from your cart!</p>
      )}

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {/* Summary Chart */}
      {goals.length > 0 && (
        <div className="mt-8">
          <ProgressChart goals={goals} />
        </div>
      )}
    </div>
  );
}
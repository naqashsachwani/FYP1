"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import GoalCard from "@/components/GoalCard";
import ProgressChart from "@/components/ProgressChart";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then((data) => setGoals(data.goals || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Savings Goals</h1>

      {goals.length === 0 && <p>No goals found. Start a new goal from your cart!</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {goals.length > 0 && (
        <div className="mt-8">
          <ProgressChart goals={goals} />
        </div>
      )}
    </div>
  );
}

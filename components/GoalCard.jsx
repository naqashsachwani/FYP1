export default function GoalCard({ goal }) {
  const percent = Math.round(goal.progressPercent || 0);

  return (
    <div className="border p-4 rounded shadow">
      <img
        src={goal.product?.images?.[0]}
        alt={goal.product?.name}
        className="w-full h-40 object-cover mb-2"
      />
      <h2 className="font-semibold">{goal.product?.name || "No Product"}</h2>

      <p className="text-sm text-gray-600">
        Saved: {goal.saved} / {goal.targetAmount}
      </p>

      <div className="bg-gray-200 rounded h-3 mt-2">
        <div
          className="bg-green-500 h-3 rounded"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-sm mt-1">{percent}%</p>

      <p className="text-xs text-gray-500">
        End Date: {goal.endDate ? new Date(goal.endDate).toLocaleDateString() : "--"}
      </p>
    </div>
  );
}

export default function GoalCard({ goal }) {
  // ✅ FIX: Cap the percentage at 100 using Math.min
  const rawPercent = Math.round(goal.progressPercent || 0);
  const percent = Math.min(rawPercent, 100);

  return (
    <div className="border p-4 rounded shadow bg-white flex flex-col h-full">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-50 rounded mb-3 overflow-hidden flex items-center justify-center">
        <img
          src={goal.product?.images?.[0] || "/placeholder.png"}
          alt={goal.product?.name}
          className="w-full h-full object-contain" // Keeps aspect ratio
        />
      </div>

      <h2 className="font-semibold text-lg line-clamp-1">
        {goal.product?.name || "No Product"}
      </h2>

      <p className="text-sm text-gray-600 mt-1">
        Saved: {goal.saved} / {goal.targetAmount}
      </p>

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-4 mt-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percent >= 100 ? "bg-green-600" : "bg-green-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        {/* ✅ Display capped percentage */}
        <span className="text-sm font-bold text-green-700">{percent}%</span>
        <span className="text-xs text-gray-500">
          Ends: {goal.endDate ? new Date(goal.endDate).toLocaleDateString() : "--"}
        </span>
      </div>
    </div>
  );
}
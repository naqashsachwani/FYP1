'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2Icon, CheckCircleIcon } from "lucide-react"; 

export default function CartPage() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";
  const router = useRouter();

  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  // ================= GOAL LOGIC =================
  
  // 1. Fetch Goals
  const fetchGoals = async () => {
    try {
      setLoadingGoals(true);
      const res = await fetch("/api/set-goal");
      const data = await res.json();
      
      const calculatedGoals = (data.goals || []).map(goal => {
         const totalSaved = (goal.deposits || []).reduce((sum, dep) => sum + Number(dep.amount), 0);
         return {
           ...goal,
           saved: totalSaved
         };
      });

      setGoals(calculatedGoals);
    } catch (err) {
      console.error("Error fetching goals:", err);
    } finally {
      setLoadingGoals(false);
    }
  };

  // 2. Delete Goal (Database) with Conditional Warning
  const handleDeleteGoal = async (goal) => {
    const hasFunds = Number(goal.saved) > 0;
    let message = "";

    // ✅ CONDITIONAL POPUP LOGIC
    if (hasFunds) {
      const deductionAmount = (Number(goal.saved) * 0.20).toFixed(0);
      message = `⚠️ CANCELLATION WARNING ⚠️\n\nYou are about to cancel a goal that has deposits.\n\nA 20% cancellation fee (${currency} ${deductionAmount}) will be deducted from your total saved amount.\n\nAre you sure you want to proceed?`;
    } else {
      message = "Are you sure you want to delete this goal? This cannot be undone.";
    }

    if (!confirm(message)) return;

    try {
      const res = await fetch(`/api/goals/${goal.id}`, { 
        method: "DELETE" 
      });
      
      if (res.ok) {
        setGoals(prev => prev.filter(g => g.id !== goal.id));
        if (hasFunds) alert("Goal cancelled. Your refund (minus 20%) has been processed.");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete goal");
      }
    } catch (err) {
      console.error("Error deleting goal:", err);
      alert("Something went wrong");
    }
  };

  // 3. Navigate
  const handleGoalClick = (goal) => {
    if (goal.status === 'SAVED') {
      // Resume setup for drafts
      router.push(`/set-goal?productId=${goal.product?.id}`);
    } else {
      // View details for active goals
      router.push(`/goals/${goal.id}`);
    }
  };

  // ================= EFFECTS =================
  useEffect(() => {
    fetchGoals();
  }, []);

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-200 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
          My <span className="text-emerald-600">DreamSaver</span> Goals
        </h1>

        <div className="flex flex-col gap-8">
          
          {/* ---------------- GOALS SECTION ---------------- */}
          <div className="bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Goals</h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                {goals.length} Total
              </span>
            </div>

            {loadingGoals ? (
              <div className="animate-pulse space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
                ))}
              </div>
            ) : goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => {
                  const percent = goal.targetAmount > 0 
                    ? Math.min(Math.round((goal.saved / goal.targetAmount) * 100), 100)
                    : 0;
                  const isCompleted = goal.status === "COMPLETED" || percent >= 100;
                  const isSaved = goal.status === "SAVED";

                  return (
                    <div
                      key={goal.id}
                      onClick={() => handleGoalClick(goal)}
                      className={`group relative p-4 border rounded-xl transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-50/50 border-green-200"
                          : isSaved
                          ? "bg-blue-50/50 border-blue-200 hover:border-blue-300"
                          : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md cursor-pointer"
                      }`}
                    >
                      {/* Top Row: Image + Info + Percentage */}
                      <div className="flex gap-4 items-start">
                        {/* Product Image Thumbnail */}
                        <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                           {goal.product?.images?.[0] ? (
                              <Image 
                                src={goal.product.images[0]} 
                                alt={goal.product.name} 
                                width={64} 
                                height={64} 
                                className="object-cover w-full h-full"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <span className="text-xs">No Img</span>
                              </div>
                           )}
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-slate-800 truncate pr-2">
                              {goal.product?.name || "Unknown Product"}
                            </h3>
                            
                            {/* Status Badge */}
                            {isSaved ? (
                                <span className="text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap bg-blue-100 text-blue-700">
                                    DRAFT
                                </span>
                            ) : (
                                <span className={`text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap ${
                                  isCompleted 
                                    ? "bg-green-200 text-green-800" 
                                    : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                                }`}>
                                  {percent}%
                                </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-500 mt-1">
                            Target: {currency}{Number(goal.targetAmount).toLocaleString()}
                          </p>

                          {/* Progress Bar */}
                          <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted ? "bg-green-500" : isSaved ? "bg-blue-400" : "bg-emerald-500"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Actions */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100/60">
                          <div className="text-sm font-medium text-slate-600">
                            Saved: <span className={isCompleted ? "text-green-700" : "text-emerald-700"}>
                               {currency}{Number(goal.saved).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                               <div className="flex items-center gap-1.5 text-green-700 text-sm font-bold bg-green-100 px-3 py-1.5 rounded-lg">
                                  <CheckCircleIcon size={16} />
                                  <span>Completed</span>
                               </div>
                            ) : (
                               <>
                                  {/* Delete Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteGoal(goal); // ✅ Pass entire goal object now
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Goal"
                                  >
                                    <Trash2Icon size={18} />
                                  </button>
                               </>
                            )}
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">You have no goals yet.</p>
                <p className="text-xs text-slate-400 mt-1">Start a new savings goal from a product page!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
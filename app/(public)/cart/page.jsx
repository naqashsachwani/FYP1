'use client'

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Counter from "@/components/Counter";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon, CheckCircleIcon } from "lucide-react"; 

export default function CartPage() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";
  const { cartItems } = useSelector(state => state.cart);
  const products = useSelector(state => state.product.list);
  const dispatch = useDispatch();
  const router = useRouter();

  const [cartArray, setCartArray] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  // ================= CART LOGIC =================
  const createCartArray = () => {
    const arr = [];
    for (const [productId, qty] of Object.entries(cartItems)) {
      const product = products.find(p => p.id === productId);
      if (product) {
        arr.push({ ...product, quantity: qty });
      }
    }
    setCartArray(arr);
  };

  const handleDeleteItemFromCart = (productId) => {
    dispatch(deleteItemFromCart({ productId }));
  };

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

  // 2. Delete Goal (Database)
  const handleDeleteGoal = async (goalId) => {
    if (!confirm("Are you sure you want to delete this goal? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/goals/${goalId}`, { 
        method: "DELETE" 
      });
      
      if (res.ok) {
        setGoals(prev => prev.filter(g => g.id !== goalId));
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
    router.push(`/goals/${goal.id}`);
  };

  // ================= EFFECTS =================
  useEffect(() => {
    if (products.length > 0) createCartArray();
  }, [cartItems, products]);

  useEffect(() => {
    fetchGoals();
  }, []);

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-200 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
          My <span className="text-emerald-600">DreamSaver</span> Cart & Goals
        </h1>

        <div className="flex flex-col gap-8">
          
          {/* ---------------- CART SECTION ---------------- */}
          <div className="bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 rounded-2xl overflow-x-auto p-6">
            <h2 className="text-lg font-semibold mb-4">Cart Items</h2>
            {cartArray.length > 0 ? (
              <table className="w-full text-slate-700 min-w-[640px]">
                <thead className="border-b border-slate-300">
                  <tr className="text-left text-sm sm:text-base font-medium text-slate-600">
                    <th className="py-3">Product</th>
                    <th className="py-3 text-center">Quantity</th>
                    <th className="py-3 text-center">Total</th>
                    <th className="py-3 text-center max-md:hidden">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cartArray.map(item => (
                    <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition-all duration-200">
                      <td className="flex items-center gap-4 py-5">
                        <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-2 shadow-inner">
                          <Image src={item.images[0]} alt={item.name} width={70} height={70} className="rounded-lg object-cover"/>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.category}</p>
                          <p className="mt-1 font-semibold text-emerald-700">{currency}{item.price.toLocaleString()}</p>
                        </div>
                      </td>
                      <td className="text-center">
                        <Counter productId={item.id} />
                      </td>
                      <td className="text-center font-semibold">{currency}{(item.price * item.quantity).toLocaleString()}</td>
                      <td className="text-center max-md:hidden">
                        <button onClick={() => handleDeleteItemFromCart(item.id)} className="text-red-500 hover:bg-red-100/70 p-2 rounded-full">
                          <Trash2Icon size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-slate-500">Your cart is empty.</p>
            )}
          </div>

          {/* ---------------- GOALS SECTION ---------------- */}
          <div className="bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Started Goals</h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                {goals.length} Active
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
                  const percent = Math.min(Math.round((goal.saved / goal.targetAmount) * 100), 100);
                  const isCompleted = goal.status === "COMPLETED" || percent >= 100;

                  return (
                    <div
                      key={goal.id}
                      onClick={() => handleGoalClick(goal)}
                      className={`group relative p-4 border rounded-xl transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-50/50 border-green-200"
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
                            {/* Percentage Badge */}
                            <span className={`text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap ${
                              isCompleted 
                                ? "bg-green-200 text-green-800" 
                                : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                            }`}>
                              {percent}%
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500 mt-1">
                            Target: {currency}{Number(goal.targetAmount).toLocaleString()}
                          </p>

                          {/* Progress Bar */}
                          <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted ? "bg-green-500" : "bg-emerald-500"
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
                                  {/* Delete Button (Only action remaining) */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteGoal(goal.id);
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
                <p className="text-slate-500">You have no started goals yet.</p>
                <p className="text-xs text-slate-400 mt-1">Add a product to cart to start saving!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client'

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";

export default function CartPage() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";
  const { cartItems } = useSelector(state => state.cart);
  const products = useSelector(state => state.product.list);
  const dispatch = useDispatch();
  const router = useRouter();

  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [processingGoalId, setProcessingGoalId] = useState(null);

  // Prepare cart array and total
  const createCartArray = () => {
    let total = 0;
    const arr = [];
    for (const [productId, qty] of Object.entries(cartItems)) {
      const product = products.find(p => p.id === productId);
      if (product) {
        arr.push({ ...product, quantity: qty });
        total += product.price * qty;
      }
    }
    setCartArray(arr);
    setTotalPrice(total);
  };

  // Delete cart item
  const handleDeleteItemFromCart = (productId) => {
    dispatch(deleteItemFromCart({ productId }));
  };

  // Fetch user goals from backend
  const fetchGoals = async () => {
    try {
      setLoadingGoals(true);
      const res = await fetch("/api/set-goal");
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (err) {
      console.error("Error fetching goals:", err);
    } finally {
      setLoadingGoals(false);
    }
  };

  // Start deposit for a goal (Stripe only)
  const handleDeposit = async (goal) => {
    try {
      setProcessingGoalId(goal.id);
      const res = await fetch("/api/stripe-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: goal.id, amount: 100 }) // Example: fixed deposit or ask user input
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Stripe checkout failed");
      window.location.href = data.checkoutUrl; // redirect to Stripe
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingGoalId(null);
    }
  };

  // Navigate to goal page
  const handleGoalClick = (goal) => {
    router.push(`/goals/${goal.id}`);
  };

  useEffect(() => {
    if (products.length > 0) createCartArray();
  }, [cartItems, products]);

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-200 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
          My <span className="text-emerald-600">DreamSaver</span> Cart & Goals
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Section */}
          <div className="flex-1 bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 rounded-2xl overflow-x-auto p-6">
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

          {/* Goals Section */}
          <div className="flex-1 bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Started Goals</h2>
            {loadingGoals ? (
              <p>Loading goals...</p>
            ) : goals.length > 0 ? (
              <div className="flex flex-col gap-4">
                {goals.map(goal => (
                  <div key={goal.id} className="p-4 border rounded-lg bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-all">
                    <div onClick={() => handleGoalClick(goal)}>
                      <p className="font-semibold text-slate-800">{goal.product?.name}</p>
                      <p className="text-sm text-slate-500">
                        Saved: {goal.saved} / Target: {goal.targetAmount}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {goal.status === "STARTED" ? (
                        <button
                          onClick={() => handleDeposit(goal)}
                          disabled={processingGoalId === goal.id}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          {processingGoalId === goal.id ? "Processing…" : "Add Deposit"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteItemFromCart(goal.productId)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      )}
                      <span className="font-semibold text-emerald-700">
                        {Math.round((goal.saved / goal.targetAmount) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">You have no started goals yet.</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <OrderSummary totalPrice={totalPrice} items={cartArray}/>
          </div>
        </div>
      </div>
    </div>
  );
}

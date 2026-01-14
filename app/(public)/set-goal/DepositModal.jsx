'use client';

import { useState } from "react";

export default function DepositModal({ open, onClose, goal, onDeposit }) {
  const [amount, setAmount] = useState("");

  if (!open || !goal) return null;

  const handleDeposit = () => {
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount");
    onDeposit(Number(amount));
    setAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full relative">
        <h2 className="text-xl font-semibold mb-4">Add Deposit</h2>
        <p>Goal: {goal.product?.name}</p>
        <p>Saved: {goal.saved} / Target: {goal.targetAmount}</p>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Enter deposit amount"
          className="w-full p-2 border rounded mt-2 mb-4"
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleDeposit}>Deposit</button>
        </div>
      </div>
    </div>
  );
}

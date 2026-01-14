'use client';

export default function TermsModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
        <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>
        <div className="text-sm max-h-80 overflow-y-auto mb-4">
          <p>By starting a savings goal, you agree to the following terms:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>You will deposit funds according to the selected payment method.</li>
            <li>The product will be reserved for you until full payment is completed.</li>
            <li>Partial deposits will be tracked and reflected in your progress dashboard.</li>
            <li>No interest or hidden fees are applied. Refunds require admin approval.</li>
            <li>You are responsible for maintaining accurate payment information.</li>
          </ul>
        </div>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-2"
          onClick={onClose}
        >
          I Accept
        </button>
      </div>
    </div>
  );
}

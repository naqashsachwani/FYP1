"use client";

export default function TermsModal({ onAccept }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-lg font-bold mb-2">Terms & Conditions</h2>

        <p className="text-sm text-gray-700 mb-4">
          By creating a savings goal, you agree to follow our terms. You
          commit to deposit regularly. Please accept to continue.
        </p>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => setChecked(!checked)}
            className="mr-2"
          />
          <label>I agree to the Terms & Conditions</label>
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={() => onAccept(checked)}
          disabled={!checked}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

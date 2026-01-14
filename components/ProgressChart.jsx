"use client";

<<<<<<< HEAD
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register necessary chart components and scales
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
=======
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
>>>>>>> 19a6a970bf175ea094e4d5b92189291985d30cd4

export default function ProgressChart({ goals }) {
  if (!goals || goals.length === 0) return <p>No goals to display</p>;

  const labels = goals.map(g => g.product?.name || "Unknown Product");

  const data = {
    labels,
    datasets: [
      {
        label: "Target Amount",
        data: goals.map(g => Number(g.targetAmount)),
        backgroundColor: "rgba(200,200,200,0.5)",
      },
      {
        label: "Saved",
        data: goals.map(g => Number(g.saved)),
        backgroundColor: "rgba(100,200,100,0.8)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Goal Progress" },
    },
    scales: {
      x: { title: { display: true, text: "Products" } },
      y: { title: { display: true, text: "Amount" }, beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
}

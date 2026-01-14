'use client';

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProgressChart({ goals }) {
  if (!goals || goals.length === 0) return null;

  const labels = goals.map(g => g.product?.name || 'Unnamed Product');
  const data = {
    labels,
    datasets: [
      {
        label: 'Target Amount',
        data: goals.map(g => Number(g.targetAmount)),
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
      },
      {
        label: 'Saved',
        data: goals.map(g => Number(g.saved)),
        backgroundColor: 'rgba(100, 200, 100, 0.8)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Goals Progress' },
    },
    scales: {
      y: { beginAtZero: true },
      x: { title: { display: true, text: 'Products' } },
    },
  };

  return <Bar data={data} options={options} />;
}

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UsageChart = ({ usage, days = 7 }) => {
  // Generate labels for last 7 days
  const labels = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Database Reads',
        data: usage.readsTrend || Array(days).fill(0),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Database Writes',
        data: usage.writesTrend || Array(days).fill(0),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'Storage (MB)',
        data: usage.storageTrend || Array(days).fill(0),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1
      },
      {
        label: 'Bandwidth (MB)',
        data: usage.bandwidthTrend || Array(days).fill(0),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Usage Trends'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return <Line data={data} options={options} />;
};

export default UsageChart;

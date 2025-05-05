import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  ButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useDatabase } from '../../../hooks/useDatabase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const UserAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    newUsers: 0,
    totalRentals: 0,
    averageRating: 0
  });
  const [chartData, setChartData] = useState({
    userGrowth: null,
    activityMetrics: null,
    categoryDistribution: null
  });
  const { getUserAnalytics } = useDatabase();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    const analytics = await getUserAnalytics(timeRange);
    setMetrics(analytics.metrics);
    setChartData({
      userGrowth: generateUserGrowthData(analytics.userGrowth),
      activityMetrics: generateActivityData(analytics.activity),
      categoryDistribution: generateCategoryData(analytics.categories)
    });
  };

  const generateUserGrowthData = (data) => ({
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'New Users',
        data: data.map(d => d.newUsers),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Active Users',
        data: data.map(d => d.activeUsers),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  });

  const generateActivityData = (data) => ({
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Rentals',
        data: data.map(d => d.rentals),
        backgroundColor: 'rgba(53, 162, 235, 0.5)'
      },
      {
        label: 'Reviews',
        data: data.map(d => d.reviews),
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      }
    ]
  });

  const generateCategoryData = (data) => ({
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ]
      }
    ]
  });

  const MetricCard = ({ title, value, subtitle, trend }) => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
          {trend && (
            <Typography 
              variant="body2" 
              color={trend > 0 ? 'success.main' : 'error.main'}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mb: 3 }}
      >
        <Typography variant="h5">
          User Analytics
        </Typography>
        <ButtonGroup>
          <Button 
            variant={timeRange === '7d' ? 'contained' : 'outlined'}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button 
            variant={timeRange === '30d' ? 'contained' : 'outlined'}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button 
            variant={timeRange === '90d' ? 'contained' : 'outlined'}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </ButtonGroup>
      </Stack>

      {/* Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            subtitle="Last 30 days"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="New Users"
            value={metrics.newUsers}
            subtitle="This period"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Rentals"
            value={metrics.totalRentals}
            subtitle="All time"
            trend={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Average Rating"
            value={metrics.averageRating.toFixed(1)}
            subtitle="All users"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Growth
            </Typography>
            {chartData.userGrowth && (
              <Line 
                data={chartData.userGrowth}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  }
                }}
              />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            {chartData.categoryDistribution && (
              <Doughnut 
                data={chartData.categoryDistribution}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Activity
            </Typography>
            {chartData.activityMetrics && (
              <Bar 
                data={chartData.activityMetrics}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserAnalytics;

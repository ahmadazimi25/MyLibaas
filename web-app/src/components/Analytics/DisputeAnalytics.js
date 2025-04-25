import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';

// Mock data generator for demo purposes
const generateMockData = (timeframe) => {
  const now = new Date();
  const data = {
    totalDisputes: Math.floor(Math.random() * 100) + 50,
    resolvedDisputes: Math.floor(Math.random() * 80) + 20,
    averageResolutionTime: Math.floor(Math.random() * 72) + 24,
    satisfactionRate: Math.floor(Math.random() * 30) + 70,
    disputeTypes: {
      'Item Condition': Math.floor(Math.random() * 40) + 10,
      'Late Return': Math.floor(Math.random() * 30) + 5,
      'Payment': Math.floor(Math.random() * 20) + 5,
      'Cancellation': Math.floor(Math.random() * 15) + 5,
      'Other': Math.floor(Math.random() * 10) + 5,
    },
    resolutionOutcomes: {
      'Full Refund': Math.floor(Math.random() * 30) + 10,
      'Partial Refund': Math.floor(Math.random() * 25) + 15,
      'No Refund': Math.floor(Math.random() * 20) + 5,
      'Replacement': Math.floor(Math.random() * 15) + 5,
      'Other': Math.floor(Math.random() * 10) + 5,
    },
    timeline: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(now.getFullYear(), now.getMonth() - i, 1),
      count: Math.floor(Math.random() * 20) + 5,
      resolved: Math.floor(Math.random() * 15) + 5,
    })).reverse(),
  };

  // Adjust data based on timeframe
  if (timeframe === 'week') {
    data.totalDisputes = Math.floor(data.totalDisputes / 4);
    data.resolvedDisputes = Math.floor(data.resolvedDisputes / 4);
  } else if (timeframe === 'year') {
    data.totalDisputes *= 12;
    data.resolvedDisputes *= 12;
  }

  return data;
};

const StatCard = ({ title, value, icon, trend, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {value}
      </Typography>
      {trend && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: trend > 0 ? 'success.main' : 'error.main',
          }}
        >
          {trend > 0 ? <TrendingUp /> : <TrendingDown />}
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {Math.abs(trend)}% vs previous period
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const DistributionCard = ({ title, data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {Object.entries(data).map(([label, value]) => (
        <Box key={label} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">{label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: '100%',
              height: 4,
              bgcolor: 'grey.100',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: `${(value / Math.max(...Object.values(data))) * 100}%`,
                height: '100%',
                bgcolor: 'primary.main',
                borderRadius: 2,
              }}
            />
          </Box>
        </Box>
      ))}
    </CardContent>
  </Card>
);

const TimelineChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Dispute Timeline
      </Typography>
      <Box sx={{ height: 200, mt: 2 }}>
        {data.map((point, index) => (
          <Box
            key={index}
            sx={{
              display: 'inline-block',
              width: `${100 / data.length}%`,
              height: '100%',
              position: 'relative',
              px: 0.5,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: `${(point.count / Math.max(...data.map(d => d.count))) * 80}%`,
                bgcolor: 'primary.main',
                borderRadius: '4px 4px 0 0',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: `${(point.resolved / Math.max(...data.map(d => d.count))) * 80}%`,
                bgcolor: 'success.main',
                borderRadius: '4px 4px 0 0',
                opacity: 0.7,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%) rotate(-45deg)',
                transformOrigin: 'left top',
              }}
            >
              {point.date.toLocaleDateString('en-US', { month: 'short' })}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', mr: 1 }} />
          <Typography variant="caption">Total Disputes</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', mr: 1 }} />
          <Typography variant="caption">Resolved Disputes</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DisputeAnalytics = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData(generateMockData(timeframe));
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Dispute Analytics</Typography>
        <FormControl size="small">
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            label="Timeframe"
          >
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="year">Last 12 Months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Types & Outcomes" />
        <Tab label="Timeline" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Total Disputes"
              value={data.totalDisputes}
              icon={<Timeline color="primary" />}
              trend={5}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Resolution Rate"
              value={`${Math.round((data.resolvedDisputes / data.totalDisputes) * 100)}%`}
              icon={<CheckCircle color="success" />}
              trend={2}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Avg. Resolution Time"
              value={`${data.averageResolutionTime}h`}
              icon={<Schedule color="warning" />}
              trend={-8}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Satisfaction Rate"
              value={`${data.satisfactionRate}%`}
              icon={<TrendingUp color="success" />}
              trend={3}
            />
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DistributionCard
              title="Dispute Types"
              data={data.disputeTypes}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DistributionCard
              title="Resolution Outcomes"
              data={data.resolutionOutcomes}
            />
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <TimelineChart data={data.timeline} />
      )}
    </Box>
  );
};

export default DisputeAnalytics;

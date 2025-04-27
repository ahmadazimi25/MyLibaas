import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';

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
  <Box>
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
        {trend > 0 ? <Cancel color="success" /> : <Cancel color="error" />}
        <Typography variant="body2" sx={{ ml: 0.5 }}>
          {Math.abs(trend)}% vs previous period
        </Typography>
      </Box>
    )}
  </Box>
);

const DistributionCard = ({ title, data }) => (
  <Box>
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
  </Box>
);

const TimelineChart = ({ data }) => (
  <Box>
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
  </Box>
);

const DisputeAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch data logic here
      const response = await fetch(`/api/disputes/analytics?timeframe=${timeframe}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error loading dispute analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <Cancel />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Dispute Analytics</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Total Disputes"
            value={data.totalDisputes}
            icon={<Cancel color="primary" />}
            trend={5}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Resolution Rate"
            value={`${Math.round((data.resolvedDisputes / data.totalDisputes) * 100)}%`}
            icon={<Cancel color="success" />}
            trend={2}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Avg. Resolution Time"
            value={`${data.averageResolutionTime}h`}
            icon={<Cancel color="warning" />}
            trend={-8}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Satisfaction Rate"
            value={`${data.satisfactionRate}%`}
            icon={<Cancel color="success" />}
            trend={3}
          />
        </Grid>
      </Grid>

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

      <TimelineChart data={data.timeline} />
    </Box>
  );
};

export default DisputeAnalytics;

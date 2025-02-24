// src/components/ReportsAnalytics.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';

const ReportsAnalytics = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Financial Reports</Typography>
      
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <BarChart
          xAxis={[{ 
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], 
            scaleType: 'band' 
          }]}
          series={[
            { data: [4000, 3000, 6000, 4500, 7000], label: 'Income' },
            { data: [2000, 1500, 3000, 2500, 4000], label: 'Expenses' }
          ]}
          width={500}
          height={300}
        />
        
        <PieChart
          series={[
            {
              data: [
                { id: 0, value: 12000, label: 'Maintenance' },
                { id: 1, value: 8000, label: 'Utilities' },
                { id: 2, value: 15000, label: 'Insurance' },
                { id: 3, value: 22000, label: 'Taxes' }
              ]
            }
          ]}
          width={400}
          height={200}
        />
      </Box>
    </Box>
  );
};

export default ReportsAnalytics;
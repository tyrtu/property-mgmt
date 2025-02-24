const ReportsAnalytics = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Navigation />
        <Typography variant="h4" gutterBottom>Financial Reports</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: 400 }}>
              <Typography variant="h6">Income vs Expenses</Typography>
              <LineChart
                xAxis={[{ data: months }]}
                series={[
                  { data: incomeData, label: 'Income' },
                  { data: expenseData, label: 'Expenses' }
                ]}
              />
            </Card>
          </Grid>
  
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: 400 }}>
              <Typography variant="h6">Expense Breakdown</Typography>
              <PieChart
                series={[
                  { data: expenseCategories }
                ]}
                width={500}
                height={300}
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };
const MaintenanceRequests = () => {
    const [requests, setRequests] = useState(mockMaintenance);
    const [openDialog, setOpenDialog] = useState(false);
  
    const columns = [
      { field: 'title', headerName: 'Request', width: 250 },
      { field: 'property', headerName: 'Property', width: 200 },
      { field: 'tenant', headerName: 'Tenant', width: 200 },
      { field: 'date', headerName: 'Date', type: 'date', width: 150 },
      { field: 'status', headerName: 'Status', width: 150,
        renderCell: (params) => (
          <Select
            value={params.value}
            onChange={(e) => handleStatusChange(params.id, e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        )
      }
    ];
  
    return (
      <Box sx={{ p: 3 }}>
        <Navigation />
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h4">Maintenance Requests</Typography>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            New Request
          </Button>
        </Box>
  
        <DataGrid
          rows={requests}
          columns={columns}
          sx={{ height: 600 }}
        />
  
        <MaintenanceDialog open={openDialog} onClose={() => setOpenDialog(false)} />
      </Box>
    );
  };
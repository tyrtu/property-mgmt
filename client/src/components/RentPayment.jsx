import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';

const RentPayment = () => {
  const [payments, setPayments] = useState(mockPayments);
  const [filter, setFilter] = useState('all');

  const columns = [
    { field: 'property', headerName: 'Property', width: 200 },
    { field: 'tenant', headerName: 'Tenant', width: 200 },
    { field: 'amount', headerName: 'Amount', type: 'number', width: 120 },
    { field: 'dueDate', headerName: 'Due Date', type: 'date', width: 150 },
    { field: 'status', headerName: 'Status', width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'Paid' ? 'success' : 
            params.value === 'Pending' ? 'warning' : 'error'
          }
        />
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Navigation />
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Rent Payments</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DatePicker label="Filter by Date" />
          <Button variant="outlined">Export CSV</Button>
        </Box>
      </Box>

      <DataGrid
        rows={payments}
        columns={columns}
        slots={{ toolbar: GridToolbar }}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        sx={{ height: 600 }}
      />
    </Box>
  );
};
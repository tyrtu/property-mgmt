import React, { useState, useEffect } from 'react';
import { 
  DataGrid, GridActionsCellItem, GridToolbar
} from '@mui/x-data-grid';
import { 
  Card, Typography, Button, TextField, 
  Grid, Box, Chip, Avatar, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Add, Edit, Delete, Search, Apartment, HomeWork 
} from '@mui/icons-material';
import { mockProperties } from '../mockData';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState({
    id: null,
    name: '',
    address: '',
    totalUnits: 0,
    rentAmount: 0,
    amenities: [],
    photos: []
  });

  useEffect(() => {
    setProperties(mockProperties);
  }, []);

  const columns = [
    { 
      field: 'photo', 
      headerName: '', 
      width: 80,
      renderCell: () => (
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <Apartment />
        </Avatar>
      )
    },
    { field: 'name', headerName: 'Property Name', width: 200 },
    { field: 'address', headerName: 'Address', width: 250 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: ({ value }) => (
        <Chip 
          label={value} 
          color={value === 'Occupied' ? 'success' : 'warning'}
          variant="outlined"
        />
      )
    },
    { 
      field: 'occupancy', 
      headerName: 'Occupancy', 
      width: 150,
      renderCell: ({ row }) => {
        const percentage = row.totalUnits > 0 
          ? (row.occupiedUnits / row.totalUnits * 100).toFixed(1)
          : 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{row.occupiedUnits}/{row.totalUnits}</Typography>
            <Typography variant="caption" color="text.secondary">
              ({percentage}%)
            </Typography>
          </Box>
        )
      }
    },
    { 
      field: 'rentAmount', 
      headerName: 'Rent', 
      width: 120,
      valueFormatter: ({ value }) => `$${value.toLocaleString()}`
    },
    { 
      field: 'amenities', 
      headerName: 'Amenities', 
      width: 200,
      renderCell: ({ value }) => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {value?.map((amenity, index) => (
            <Chip key={index} label={amenity} size="small" />
          ))}
        </Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: ({ id }) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(id)}
        />,
        <GridActionsCellItem
          icon={<Delete color="error" />}
          label="Delete"
          onClick={() => handleDelete(id)}
        />
      ]
    }
  ];

  // Rest of the code remains the same as previous correct version
  // ... (handleSearch, filteredProperties, handleSubmit, etc.)

  return (
    <Box sx={{ p: 3, height: '100vh' }}>
      {/* UI components remain the same */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredProperties}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50]}
          getRowId={(row) => row.id}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } 
          }}
          density="compact"
          disableRowSelectionOnClick
        />
      </Box>
      {/* Dialog remains the same */}
    </Box>
  );
};

export default PropertyManagement;
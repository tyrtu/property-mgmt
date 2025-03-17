import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Typography, Select, MenuItem, Chip } from '@mui/material';
import useAutoLogout from '../hooks/useAutoLogout';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import InProgressIcon from '@mui/icons-material/BuildCircle';
import CompletedIcon from '@mui/icons-material/CheckCircle';

const MaintenanceRequests = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const maintenanceRef = collection(db, 'maintenanceRequests');
    const q = query(maintenanceRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.issue,
            property: data.property || '',
            date: data.createdAt
              ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
              : '',
            status: data.status || 'Pending',
            image: data.image || null,
          };
        });
        setRows(requests);
      },
      (error) => {
        console.error('Error fetching maintenance requests: ', error);
      }
    );
    return () => unsubscribe();
  }, []);

  useAutoLogout();

  const statusColors = {
    Pending: { color: 'orange', icon: <PendingIcon /> },
    'In Progress': { color: 'blue', icon: <InProgressIcon /> },
    Completed: { color: 'green', icon: <CompletedIcon /> },
  };

  const columns = [
    {
      field: 'title',
      headerName: 'Request',
      width: 220,
      renderCell: (params) => (
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'property',
      headerName: 'Property',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: (params) => {
        const handleStatusChange = async (e) => {
          const newStatus = e.target.value;
          try {
            await updateDoc(doc(db, 'maintenanceRequests', params.row.id), {
              status: newStatus,
            });
          } catch (error) {
            console.error('Error updating status:', error);
          }
        };

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Select
              value={params.value}
              size="small"
              sx={{
                minWidth: 130,
                backgroundColor: statusColors[params.value]?.color + '1A',
                borderRadius: 1,
              }}
              onChange={handleStatusChange}
            >
              <MenuItem value="Pending">
                <PendingIcon sx={{ color: 'orange', mr: 1 }} />
                Pending
              </MenuItem>
              <MenuItem value="In Progress">
                <InProgressIcon sx={{ color: 'blue', mr: 1 }} />
                In Progress
              </MenuItem>
              <MenuItem value="Completed">
                <CompletedIcon sx={{ color: 'green', mr: 1 }} />
                Completed
              </MenuItem>
            </Select>
          </Box>
        );
      },
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 160,
      renderCell: (params) =>
        params.value ? (
          <img
            src={params.value}
            alt="Maintenance issue"
            style={{
              width: 60,
              height: 60,
              borderRadius: 5,
              border: '1px solid #ddd',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Chip label="No Image" color="default" size="small" />
        ),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          🛠️ Maintenance Requests
        </Typography>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[10, 25, 50]}
            sortModel={[{ field: 'date', sort: 'desc' }]}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'primary.light',
                fontSize: 16,
              },
              '& .MuiDataGrid-row:nth-of-type(odd)': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MaintenanceRequests;

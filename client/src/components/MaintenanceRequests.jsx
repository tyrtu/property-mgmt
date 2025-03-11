import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Typography, Select, MenuItem } from '@mui/material';
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
            image: data.image || null, // Fetch image URL if available
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

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Request', width: 200 },
    { field: 'property', headerName: 'Property', width: 150 },
    { field: 'date', headerName: 'Date', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
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
          <Select
            value={params.value}
            size="small"
            sx={{ minWidth: 120 }}
            onChange={handleStatusChange}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        );
      },
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 150,
      renderCell: (params) =>
        params.value ? (
          <img
            src={params.value}
            alt="Maintenance issue"
            style={{ width: 50, height: 50, borderRadius: 5 }}
          />
        ) : (
          'No Image'
        ),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navigation />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Maintenance Requests
        </Typography>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MaintenanceRequests;

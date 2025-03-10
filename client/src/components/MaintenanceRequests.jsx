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
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';

const MaintenanceRequests = () => {
  const [rows, setRows] = useState([]);

  // Set up Firestore listener to fetch maintenance requests ordered by creation time (most recent first)
  useEffect(() => {
    const maintenanceRef = collection(db, 'maintenanceRequests');
    const q = query(maintenanceRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id, // Use document id as the row id
          title: data.issue, // Assuming the 'issue' field holds the request title/description
          property: data.property || '', // If a property field exists
          date: data.createdAt
            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
            : '',
          status: data.status || 'Pending',
        };
      });
      setRows(requests);
    }, (error) => {
      console.error("Error fetching maintenance requests: ", error);
    });
    return () => unsubscribe();
  }, []);

  // Enable auto-logout after 15 minutes of inactivity
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
            // Update the status in Firestore for this request
            await updateDoc(doc(db, 'maintenanceRequests', params.row.id), {
              status: newStatus,
            });
          } catch (error) {
            console.error("Error updating status:", error);
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

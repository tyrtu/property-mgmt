// client/src/mockData.js
export const mockProperties = [
  {
    id: 1,
    name: "Sunrise Apartments",
    address: "123 Main St",
    units: 10,
    occupiedUnits: 5,
    status: "Occupied",
    rentAmount: 1200,
    amenities: ["Pool", "Gym", "Parking"],
    photos: ["https://via.placeholder.com/150"]
  },
  {
    id: 2,
    name: "Ocean View Villas",
    address: "456 Beach Rd",
    units: 8,
    occupiedUnits: 3,
    status: "Vacant",
    rentAmount: 1500,
    amenities: ["Beach Access", "Balcony"],
    photos: ["https://via.placeholder.com/150"]
  }
];

export const mockTenants = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    propertyId: 1,
    leaseStart: "2023-01-01",
    leaseEnd: "2023-12-31",
    rentAmount: 1200,
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "987-654-3210"
    }
  }
];

export const mockPayments = [
  {
    id: 1,
    tenantId: 1,
    amount: 1200,
    status: "Paid",
    dueDate: "2023-10-01",
    paymentDate: "2023-10-01"
  },
  {
    id: 2,
    tenantId: 1,
    amount: 1200,
    status: "Pending",
    dueDate: "2023-11-01"
  }
];

export const mockMaintenance = [
  {
    id: 1,
    propertyId: 1,
    description: "Leaky faucet in unit 101",
    status: "Pending",
    assignedTo: "Plumbing Co."
  }
];
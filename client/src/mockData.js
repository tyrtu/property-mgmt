// src/mockData.js
export const mockProperties = [
  {
    id: 1,
    name: "Sunrise Apartments",
    address: "123 Main St, Cityville",
    totalUnits: 24,
    occupiedUnits: 18,
    status: "Occupied",
    rentAmount: 2200,
    amenities: ["Pool", "Gym", "Parking", "Laundry"],
    photos: ["https://via.placeholder.com/400"],
    leaseTerms: "12-month minimum",
    managementContact: "manager@sunriseapts.com"
  },
  {
    id: 2,
    name: "Ocean View Villas",
    address: "456 Coastal Hwy, Beachtown",
    totalUnits: 18,
    occupiedUnits: 12,
    status: "Vacant",
    rentAmount: 3200,
    amenities: ["Ocean View", "Private Balcony", "Concierge"],
    photos: ["https://via.placeholder.com/400"],
    leaseTerms: "6-month flexible",
    managementContact: "villas@oceanview.com"
  }
];

export const mockTenants = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "555-123-4567",
    propertyId: 1,
    unitNumber: "101A",
    leaseStart: "2023-01-01",
    leaseEnd: "2024-01-01",
    rentAmount: 2200,
    paymentMethod: "ACH",
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "555-987-6543"
    },
    notes: "Prefers email communication"
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@example.com",
    phone: "555-234-5678",
    propertyId: 2,
    unitNumber: "305B",
    leaseStart: "2023-03-15",
    leaseEnd: "2024-03-15",
    rentAmount: 3200,
    paymentMethod: "Credit Card",
    emergencyContact: {
      name: "Mike Smith",
      relationship: "Partner",
      phone: "555-876-5432"
    },
    notes: "Renewal pending"
  }
];

export const mockPayments = [
  {
    id: 1,
    tenantId: 1,
    propertyId: 1,
    amount: 2200,
    status: "Paid",
    dueDate: "2023-10-01",
    paymentDate: "2023-10-01",
    method: "ACH",
    reference: "CHK12345"
  },
  {
    id: 2,
    tenantId: 1,
    propertyId: 1,
    amount: 2200,
    status: "Pending",
    dueDate: "2023-11-01",
    method: "ACH",
    reference: ""
  },
  {
    id: 3,
    tenantId: 2,
    propertyId: 2,
    amount: 3200,
    status: "Paid",
    dueDate: "2023-10-05",
    paymentDate: "2023-10-03",
    method: "Credit Card",
    reference: "CC98765"
  }
];

export const mockMaintenance = [
  {
    id: 1,
    propertyId: 1,
    tenantId: 1,
    title: "Kitchen Faucet Leak",
    description: "Constant dripping in kitchen sink",
    category: "Plumbing",
    priority: "High",
    status: "In Progress",
    assignedTo: "QuickFix Plumbers",
    createdAt: "2023-10-15",
    updatedAt: "2023-10-16",
    photos: ["https://via.placeholder.com/200"]
  },
  {
    id: 2,
    propertyId: 2,
    tenantId: 2,
    title: "AC Not Cooling",
    description: "Air conditioning unit not maintaining temperature",
    category: "HVAC",
    priority: "Urgent",
    status: "Pending",
    assignedTo: "",
    createdAt: "2023-10-18",
    updatedAt: "2023-10-18",
    photos: []
  }
];

export const mockNotifications = [
  {
    id: 1,
    type: "payment",
    title: "Payment Received - $2200",
    date: "2023-10-01",
    details: "From John Doe (Unit 101A)"
  },
  {
    id: 2,
    type: "maintenance",
    title: "New Maintenance Request",
    date: "2023-10-15",
    details: "Kitchen Faucet Leak reported"
  }
];

export const financialData = {
  income: [65000, 72000, 81000, 78000, 85000, 92000],
  expenses: [32000, 35000, 38000, 41000, 39000, 42000],
  categories: [
    { name: "Maintenance", value: 12000 },
    { name: "Utilities", value: 8000 },
    { name: "Insurance", value: 15000 },
    { name: "Taxes", value: 22000 }
  ]
};
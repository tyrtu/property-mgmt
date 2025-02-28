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
    managementContact: "manager@sunriseapts.com",
    yearBuilt: 2015,
    lastRenovated: 2020
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
    managementContact: "villas@oceanview.com",
    yearBuilt: 2018,
    lastRenovated: 2022
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
    notes: "Prefers email communication",
    paymentHistory: [],
    leaseDocuments: []
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
    notes: "Renewal pending",
    paymentHistory: [],
    leaseDocuments: []
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
    reference: "CHK12345",
    invoiceNumber: "INV-2023-001"
  },
  {
    id: 2,
    tenantId: 1,
    propertyId: 1,
    amount: 2200,
    status: "Pending",
    dueDate: "2023-11-01",
    method: "ACH",
    reference: "",
    invoiceNumber: "INV-2023-002"
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
    reference: "CC98765",
    invoiceNumber: "INV-2023-003"
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
    photos: ["https://via.placeholder.com/200"],
    cost: 250,
    completionDate: "2023-10-17"
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
    photos: [],
    cost: null,
    completionDate: null
  }
];

export const mockNotifications = [
  {
    id: 1,
    type: "alert",
    title: "Payment Received - $2200",
    date: "2023-10-01",
    details: "From John Doe (Unit 101A)",
    category: "Payment",
    read: false
  },
  {
    id: 2,
    type: "info",
    title: "New Maintenance Request",
    date: "2023-10-15",
    details: "Kitchen Faucet Leak reported",
    category: "Maintenance",
    read: false
  },
  {
    id: 3,
    type: "alert",
    title: "Lease Expiration Warning",
    date: "2023-11-01",
    details: "Lease for Unit 305B expiring in 30 days",
    category: "Lease",
    read: false
  }
];

export const mockFinancialData = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  income: [65000, 72000, 81000, 78000, 85000, 92000],
  expenses: [32000, 35000, 38000, 41000, 39000, 42000],
  expenseCategories: [
    { id: 0, label: 'Maintenance', value: 12000 },
    { id: 1, label: 'Utilities', value: 8000 },
    { id: 2, label: 'Insurance', value: 15000 },
    { id: 3, label: 'Taxes', value: 22000 },
    { id: 4, label: 'Repairs', value: 18000 },
  ],
  transactions: [
    { id: 1, date: '2024-03-01', description: 'Monthly Rent Collection', category: 'Income', amount: 65000, property: 'Sunrise Apartments', status: 'Completed' },
    { id: 2, date: '2024-03-05', description: 'Plumbing Repair', category: 'Maintenance', amount: -1200, property: 'Ocean View Villas', status: 'Paid' },
    { id: 3, date: '2024-03-10', description: 'Property Insurance Payment', category: 'Insurance', amount: -15000, property: 'All Properties', status: 'Paid' },
    { id: 4, date: '2024-03-15', description: 'Tax Payment', category: 'Taxes', amount: -22000, property: 'All Properties', status: 'Pending' },
  ]
};

export const mockPropertyMetrics = {
  properties: ['Sunrise', 'Ocean View', 'Mountain Top', 'City Center'],
  occupancyRates: [92, 88, 95, 82],
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  maintenanceCosts: [3200, 2800, 4100, 3700, 3900, 4500],
  tenantSatisfaction: [4.8, 4.5, 4.9, 4.3],
  rentalYield: [6.2, 5.8, 7.1, 5.5]
};

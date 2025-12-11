// Dummy data for testing the app

export const dummyUsers = [
  {
    id: 'user1',
    email: 'customer1@gmail.com',
    name: 'John Doe',
    role: 'customer',
    favorites: ['shop1', 'shop3'],
  },
  {
    id: 'user2',
    email: 'shopowner1@gmail.com',
    name: 'Rajesh Kumar',
    role: 'shop',
    shopId: 'shop1',
  },
  {
    id: 'user3',
    email: 'shopowner2@gmail.com',
    name: 'Priya Sharma',
    role: 'shop',
    shopId: 'shop2',
  },
];

export const dummyShops = [
  {
    id: 'shop1',
    name: 'Kumar General Store',
    category: 'General Store',
    ownerId: 'user2',
    verified: true,
    status: 'online',
    phone: '+91 9876543210',
    gpayNumber: '9876543210',
    address: '123 Main Street, Mumbai',
    location: {
      lat: 19.0760,
      lng: 72.8777,
    },
    openingHours: '8:00 AM - 10:00 PM',
  },
  {
    id: 'shop2',
    name: 'City Medical Store',
    category: 'Medical',
    ownerId: 'user3',
    verified: true,
    status: 'online',
    phone: '+91 9876543211',
    gpayNumber: '9876543211',
    address: '456 Park Road, Mumbai',
    location: {
      lat: 19.0820,
      lng: 72.8820,
    },
    openingHours: '7:00 AM - 11:00 PM',
  },
  {
    id: 'shop3',
    name: 'Fresh Bakery',
    category: 'Bakery',
    ownerId: 'user2',
    verified: true,
    status: 'offline',
    phone: '+91 9876543212',
    gpayNumber: '9876543212',
    address: '789 Sweet Lane, Mumbai',
    location: {
      lat: 19.0700,
      lng: 72.8750,
    },
    openingHours: '6:00 AM - 9:00 PM',
  },
  {
    id: 'shop4',
    name: 'Stationery Hub',
    category: 'Stationery',
    ownerId: 'user2',
    verified: false,
    status: 'online',
    phone: '+91 9876543213',
    gpayNumber: '9876543213',
    address: '321 Book Street, Mumbai',
    location: {
      lat: 19.0850,
      lng: 72.8800,
    },
    openingHours: '9:00 AM - 8:00 PM',
  },
];

export const dummyProducts = [
  // Kumar General Store Products
  { id: 'prod1', shopId: 'shop1', name: 'Rice (1kg)', price: 60, category: 'Groceries', inStock: true },
  { id: 'prod2', shopId: 'shop1', name: 'Wheat Flour (1kg)', price: 45, category: 'Groceries', inStock: true },
  { id: 'prod3', shopId: 'shop1', name: 'Sugar (1kg)', price: 50, category: 'Groceries', inStock: true },
  { id: 'prod4', shopId: 'shop1', name: 'Tea Powder (250g)', price: 120, category: 'Groceries', inStock: true },
  { id: 'prod5', shopId: 'shop1', name: 'Milk (1L)', price: 65, category: 'Dairy', inStock: true },
  { id: 'prod6', shopId: 'shop1', name: 'Bread', price: 35, category: 'Bakery', inStock: false },
  { id: 'prod7', shopId: 'shop1', name: 'Cooking Oil (1L)', price: 150, category: 'Groceries', inStock: true },
  { id: 'prod8', shopId: 'shop1', name: 'Toothpaste', price: 80, category: 'Personal Care', inStock: true },
  
  // City Medical Store Products
  { id: 'prod9', shopId: 'shop2', name: 'Paracetamol 500mg (10 tablets)', price: 15, category: 'Medicine', inStock: true },
  { id: 'prod10', shopId: 'shop2', name: 'Cough Syrup', price: 95, category: 'Medicine', inStock: true },
  { id: 'prod11', shopId: 'shop2', name: 'Band-Aid (Pack of 10)', price: 25, category: 'First Aid', inStock: true },
  { id: 'prod12', shopId: 'shop2', name: 'Antiseptic Cream', price: 60, category: 'First Aid', inStock: true },
  { id: 'prod13', shopId: 'shop2', name: 'Vitamin C Tablets', price: 120, category: 'Supplements', inStock: true },
  { id: 'prod14', shopId: 'shop2', name: 'Digital Thermometer', price: 250, category: 'Medical Devices', inStock: true },
  { id: 'prod15', shopId: 'shop2', name: 'Hand Sanitizer (200ml)', price: 80, category: 'Hygiene', inStock: false },
  
  // Fresh Bakery Products
  { id: 'prod16', shopId: 'shop3', name: 'White Bread', price: 40, category: 'Bread', inStock: true },
  { id: 'prod17', shopId: 'shop3', name: 'Brown Bread', price: 50, category: 'Bread', inStock: true },
  { id: 'prod18', shopId: 'shop3', name: 'Chocolate Cake', price: 350, category: 'Cakes', inStock: true },
  { id: 'prod19', shopId: 'shop3', name: 'Vanilla Cake', price: 300, category: 'Cakes', inStock: true },
  { id: 'prod20', shopId: 'shop3', name: 'Croissant (3 pcs)', price: 90, category: 'Pastries', inStock: true },
  { id: 'prod21', shopId: 'shop3', name: 'Cookies (250g)', price: 120, category: 'Snacks', inStock: true },
  { id: 'prod22', shopId: 'shop3', name: 'Muffins (4 pcs)', price: 160, category: 'Pastries', inStock: true },
  
  // Stationery Hub Products
  { id: 'prod23', shopId: 'shop4', name: 'Notebook (200 pages)', price: 60, category: 'Books', inStock: true },
  { id: 'prod24', shopId: 'shop4', name: 'Pen (Blue, Pack of 10)', price: 50, category: 'Writing', inStock: true },
  { id: 'prod25', shopId: 'shop4', name: 'Pencil (Pack of 10)', price: 30, category: 'Writing', inStock: true },
  { id: 'prod26', shopId: 'shop4', name: 'Eraser', price: 5, category: 'Writing', inStock: true },
  { id: 'prod27', shopId: 'shop4', name: 'Sharpener', price: 10, category: 'Writing', inStock: true },
  { id: 'prod28', shopId: 'shop4', name: 'A4 Paper (500 sheets)', price: 250, category: 'Paper', inStock: true },
];

export const dummyOrders = [
  {
    id: 'order1',
    customerId: 'user1',
    shopId: 'shop1',
    items: [
      { productId: 'prod1', name: 'Rice (1kg)', quantity: 2, price: 60 },
      { productId: 'prod3', name: 'Sugar (1kg)', quantity: 1, price: 50 },
    ],
    totalAmount: 170,
    partialPayment: 85,
    paymentStatus: 'partial',
    orderStatus: 'confirmed',
    readyBy: '2:30 PM',
    createdAt: new Date('2025-12-09T10:30:00'),
    updatedAt: new Date('2025-12-09T10:35:00'),
  },
  {
    id: 'order2',
    customerId: 'user1',
    shopId: 'shop2',
    items: [
      { productId: 'prod9', name: 'Paracetamol 500mg (10 tablets)', quantity: 2, price: 15 },
      { productId: 'prod10', name: 'Cough Syrup', quantity: 1, price: 95 },
    ],
    totalAmount: 125,
    partialPayment: 63,
    paymentStatus: 'partial',
    orderStatus: 'ready',
    readyBy: '12:00 PM',
    createdAt: new Date('2025-12-09T09:00:00'),
    updatedAt: new Date('2025-12-09T11:45:00'),
  },
  {
    id: 'order3',
    customerId: 'user1',
    shopId: 'shop3',
    items: [
      { productId: 'prod16', name: 'White Bread', quantity: 2, price: 40 },
      { productId: 'prod18', name: 'Chocolate Cake', quantity: 1, price: 350 },
    ],
    totalAmount: 430,
    partialPayment: 215,
    paymentStatus: 'partial',
    orderStatus: 'completed',
    readyBy: '11:00 AM',
    createdAt: new Date('2025-12-08T08:00:00'),
    updatedAt: new Date('2025-12-08T11:30:00'),
    completedAt: new Date('2025-12-08T11:45:00'),
  },
];

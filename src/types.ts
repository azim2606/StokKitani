export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  sku: string;
  category: string;
  quantity: number;
  minimumStock: number;
  price: number;
  costPrice: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  itemId: number;
  itemName?: string;
  itemSku?: string;
  type: 'stock_in' | 'stock_out';
  quantity: number;
  remarks: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  recentMovements: StockMovement[];
}

export type Language = 'en' | 'bm';

// Simple Bilingual translation dictionary for StokKitani
export const translations = {
  en: {
    appName: 'StokKitani',
    tagline: 'Simple Inventory Management for Brunei SMEs',
    navDashboard: 'Dashboard',
    navItems: 'Items',
    navMovements: 'Stock Movements',
    navAdd: 'Add Item',
    navLogout: 'Logout',
    en: 'English (EN)',
    bm: 'Bahasa Melayu (BM)',
    
    // Login
    loginTitle: 'Welcome to StokKitani',
    loginSubtitle: 'Manage stock, monitor movement, and stay prepared with a simple inventory system made for small businesses.',
    email: 'Email Address',
    password: 'Password',
    loginBtn: 'Log In',
    demoAccount: 'Demo Account Credentials',
    demoNote: 'Please use the credentials below to log in for demonstration:',
    invalidCredentials: 'Invalid email or password',
    
    // Dashboard Summary
    summaryTitle: 'Overview',
    jumlahBarang: 'Total Items',
    barangStokRendah: 'Low Stock Items',
    kehabisanStok: 'Out of Stock',
    jumlahValue: 'Total Inventory Value',
    recentMovements: 'Recent Stock Movements',
    noRecentMovements: 'No recent stock movements recorded.',
    
    // Items
    itemsList: 'Inventory List',
    addItem: 'Add New Item',
    editItem: 'Edit Item',
    deleteItem: 'Delete Item',
    viewItem: 'Item Details',
    searchPlaceholder: 'Search by Name, SKU, Category, or Location...',
    sortLabel: 'Sort By',
    filterCategory: 'Category',
    filterStatus: 'Status',
    statusAll: 'All Statuses',
    statusInStock: 'In Stock',
    statusLowStock: 'Low Stock',
    statusOutOfStock: 'Out of Stock',
    allCategories: 'All Categories',
    exportCSV: 'Export to CSV',
    exportCSVHelp: 'Export currents filtered inventory rows to offline spreadsheet (CSV)',
    bulkDelete: 'Delete Selected ({count})',
    bulkDeleteConfirm: 'Are you sure you want to delete {count} selected items? This action is permanent and will cascade-delete their entire history.',
    selectedItems: '{count} items selected',
    
    // Table Columns
    sku: 'SKU',
    itemName: 'Item Name',
    category: 'Category',
    quantity: 'Quantity',
    minStock: 'Min Stock',
    price: 'Selling Price (BND)',
    costPrice: 'Cost Price (BND)',
    location: 'Storage Location',
    actions: 'Actions',
    status: 'Status',
    
    // Item Form
    placeholderSku: 'e.g., ST-A4-001',
    placeholderName: 'e.g., A4 Paper 80gsm',
    placeholderDesc: 'Describe the inventory item...',
    placeholderLocation: 'e.g., Main Store, Shelf B',
    saveBtn: 'Save Item',
    cancelBtn: 'Cancel',
    requiredField: 'This field is required',
    skuExists: 'SKU code already exists in inventory',
    
    // Stock In/Out
    stockIn: 'Stock In',
    stockOut: 'Stock Out',
    remarks: 'Remarks / Notes',
    quantityToChange: 'Quantity to change',
    placeholderRemarks: 'e.g., Received shipment, Customer order #123',
    stockInBtn: 'Load Stock In',
    stockOutBtn: 'Register Stock Out',
    stockSuccess: 'Stock movement successfully updated!',
    insufficientStock: 'Cannot record stock-out: Insufficient inventory',
    
    // General Actions
    confirmDelete: 'Are you sure you want to delete this item? This action is permanent and will delete all associated stock history.',
    date: 'Date & Time',
    type: 'Type',
    movementQty: 'Qty Change',
    notes: 'Remarks',
    bilingualToggle: 'Language / Bahasa',
    userRole: 'Administrator',
  },
  
  bm: {
    appName: 'StokKitani',
    tagline: 'Pengurusan Inventori Mudah untuk PKS Brunei',
    navDashboard: 'Papan Pemuka',
    navItems: 'Senarai Barang',
    navMovements: 'Pergerakan Stok',
    navAdd: 'Tambah Barang',
    navLogout: 'Log Keluar',
    en: 'English (EN)',
    bm: 'Bahasa Melayu (BM)',
    
    // Login
    loginTitle: 'Selamat Datang ke StokKitani',
    loginSubtitle: 'Urus stok, pantau pergerakan, dan sentiasa bersedia dengan sistem inventori mudah yang direka untuk perniagaan kecil.',
    email: 'Alamat Emel',
    password: 'Kata Laluan',
    loginBtn: 'Log Masuk',
    demoAccount: 'Butiran Akaun Demo',
    demoNote: 'Sila gunakan maklumat di bawah untuk log masuk bagi demonstrasi:',
    invalidCredentials: 'Emel atau kata laluan tidak sah',
    
    // Dashboard Summary
    summaryTitle: 'Ringkasan',
    jumlahBarang: 'Jumlah Barang',
    barangStokRendah: 'Stok Rendah',
    kehabisanStok: 'Kehabisan Stok',
    jumlahValue: 'Jumlah Nilai Inventori',
    recentMovements: 'Pergerakan Stok Terkini',
    noRecentMovements: 'Tiada pergerakan stok direkodkan baru-baru ini.',
    
    // Items
    itemsList: 'Senarai Inventori',
    addItem: 'Tambah Barang Baru',
    editItem: 'Kemas Kini Barang',
    deleteItem: 'Padam Barang',
    viewItem: 'Butiran Barang',
    searchPlaceholder: 'Cari mengikut Nama, SKU, Kategori, atau Lokasi...',
    sortLabel: 'Susun Mengikut',
    filterCategory: 'Kategori',
    filterStatus: 'Status',
    statusAll: 'Semua Status',
    statusInStock: 'Ada Stok',
    statusLowStock: 'Stok Rendah',
    statusOutOfStock: 'Kehabisan Stok',
    allCategories: 'Semua Kategori',
    exportCSV: 'Eksport ke CSV',
    exportCSVHelp: 'Eksport baris inventori yang ditapis semasa ke fail helaian kerja (CSV)',
    bulkDelete: 'Padam Pilihan ({count})',
    bulkDeleteConfirm: 'Adakah anda pasti mahu memadam {count} barang yang dipilih? Tindakan ini adalah kekal dan akan memadamkan seluruh sejarah aliran stok berkaitan.',
    selectedItems: '{count} barang dipilih',
    
    // Table Columns
    sku: 'SKU',
    itemName: 'Nama Barang',
    category: 'Kategori',
    quantity: 'Kuantiti',
    minStock: 'Stok Minimum',
    price: 'Harga Jual (BND)',
    costPrice: 'Harga Kos (BND)',
    location: 'Lokasi Simpanan',
    actions: 'Tindakan',
    status: 'Status',
    
    // Item Form
    placeholderSku: 'cth., ST-A4-001',
    placeholderName: 'cth., Kertas A4 80gsm',
    placeholderDesc: 'Huraikan barang inventori ini...',
    placeholderLocation: 'cth., Stor Utama, Rak B',
    saveBtn: 'Simpan Barang',
    cancelBtn: 'Batal',
    requiredField: 'Ruangan ini wajib diisi',
    skuExists: 'Kod SKU sudah wujud dalam inventori',
    
    // Stock In/Out
    stockIn: 'Stok Masuk',
    stockOut: 'Stok Keluar',
    remarks: 'Nota / Catatan',
    quantityToChange: 'Kuantiti untuk diubah',
    placeholderRemarks: 'cth., Menerima penghantaran, Pesanan pelanggan #123',
    stockInBtn: 'Daftar Stok Masuk',
    stockOutBtn: 'Daftar Stok Keluar',
    stockSuccess: 'Pergerakan stok berjaya dikemas kini!',
    insufficientStock: 'Tidak dapat merekod stok keluar: Baki stok tidak mencukupi',
    
    // General Actions
    confirmDelete: 'Adakah anda pasti mahu memadam barang ini? Tindakan ini adalah kekal dan akan memadamkan semua sejarah stok yang berkaitan.',
    date: 'Tarikh & Masa',
    type: 'Jenis',
    movementQty: 'Perubahan Kuantiti',
    notes: 'Catatan',
    bilingualToggle: 'Bahasa / Language',
    userRole: 'Pentadbir',
  }
};

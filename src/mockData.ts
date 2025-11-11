// Mock Data for CSR Management Portal

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  role: 'admin' | 'accountant' | 'project-manager' | 'team-member';
  manager?: string;
  department?: string;
}

export interface CSRPartner {
  id: string;
  name: string;
  description: string;
  logo?: string;
}

export interface Project {
  id: string;
  partnerId: string;
  name: string;
  description: string;
  location: string;
  state: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'upcoming';
  totalBudget: number;
  utilizedBudget: number;
  beneficiariesCurrent: number;
  beneficiariesTarget: number;
  projectMetrics?: {
    // LAJJA specific
    pads_donated?: { current: number; target: number };
    sessions_conducted?: { current: number; target: number };
    // GYANDAAN specific
    students_enrolled?: { current: number; target: number };
    schools_renovated?: { current: number; target: number };
    libraries_setup?: { current: number; target: number };
    scholarships_given?: { current: number; target: number };
    // KILL HUNGER specific
    meals_distributed?: { current: number; target: number };
    ration_kits_distributed?: { current: number; target: number };
    families_fed?: { current: number; target: number };
    // SHOONYA specific
    waste_collected_kg?: { current: number; target: number };
    trees_planted?: { current: number; target: number };
    plastic_recycled_kg?: { current: number; target: number };
    communities_covered?: { current: number; target: number };
  };
}

export interface DashboardCard {
  id: string;
  projectId: string;
  title: string;
  current: number;
  target: number;
  type: 'beneficiaries' | 'events' | 'donations' | 'volunteers' | 'schools' | 'reach';
  details?: {
    male?: number;
    female?: number;
    children?: number;
    locations?: { name: string; count: number }[];
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'On Priority' | 'Less Priority';
  status: 'Not Started' | 'In Progress' | 'Completed';
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  projectId?: string;
  department?: string;
}

export interface RealTimeUpdate {
  id: string;
  date: string;
  updateNumber: string;
  documentNumber: string;
  schoolName: string;
  address: string;
  description: string;
  images: string[];
  documentHeading: string;
  projectId: string;
  format?: string;
  client?: string;
}

export interface MediaArticle {
  id: string;
  heading: string;
  date: string;
  link: string;
  format: string;
  type: 'photo' | 'video' | 'article';
  projectId: string;
  newsChannel?: string;
}

export interface Expense {
  id: string;
  merchantName: string;
  date: string;
  category: string;
  totalAmount: number;
  description: string;
  receiptLink: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedBy: string;
  projectId: string;
  reason?: string;
}

export interface Budget {
  id: string;
  projectId: string;
  fundHead: string;
  allocatedAmount: number;
  utilizedAmount: number;
}

export interface UtilizationCertificate {
  id: string;
  headline: string;
  driveLink: string;
  format: string;
  uploadDate: string;
  projectId: string;
}

export interface Bill {
  id: string;
  billName: string;
  billDate: string;
  category: string;
  totalAmount: number;
  description: string;
  attachment: string;
  status: 'Not Submitted' | 'Submitted' | 'Accepted' | 'Rejected' | 'Pending';
  submittedBy: string;
  reason?: string;
}

export interface DataEntry {
  id: string;
  name: string;
  date: string;
  schoolName: string;
  formType: 'Pre Form' | 'Post Form';
  projectId: string;
  data: Record<string, string | number | boolean>;
}

export interface DailyReport {
  id: string;
  taskName: string;
  dueDate: string;
  completionStatus: 'Completed' | 'In Progress' | 'Not Started';
  assignedBy: string;
  projectId: string;
}

// Mock Users
export const users: User[] = [
  {
    id: 'u1',
    name: 'Lokesh Joshi',
    email: 'lokesh@mtd.com',
    mobile: '+91-9876543210',
    address: 'Mumbai, Maharashtra',
    role: 'project-manager',
    department: 'Operations',
  },
  {
    id: 'u2',
    name: 'Priya Sharma',
    email: 'priya@mtd.com',
    mobile: '+91-9876543211',
    address: 'Delhi, NCR',
    role: 'accountant',
    department: 'Finance',
  },
  {
    id: 'u3',
    name: 'Rajesh Kumar',
    email: 'admin@mtd.com',
    mobile: '+91-9876543212',
    address: 'Bangalore, Karnataka',
    role: 'admin',
    department: 'Administration',
  },
  {
    id: 'u4',
    name: 'Rahul Verma',
    email: 'rahul@mtd.com',
    mobile: '+91-9876543213',
    address: 'Pune, Maharashtra',
    role: 'team-member',
    manager: 'Lokesh Joshi',
    department: 'Operations',
  },
  {
    id: 'u5',
    name: 'Sneha Patel',
    email: 'sneha@mtd.com',
    mobile: '+91-9876543214',
    address: 'Ahmedabad, Gujarat',
    role: 'team-member',
    manager: 'Lokesh Joshi',
    department: 'Social Media',
  },
  {
    id: 'u6',
    name: 'Anjali Desai',
    email: 'anjali@mtd.com',
    mobile: '+91-9876543215',
    address: 'Mumbai, Maharashtra',
    role: 'team-member',
    manager: 'Lokesh Joshi',
    department: 'Field Operations',
  },
  {
    id: 'u7',
    name: 'Vikram Singh',
    email: 'vikram@mtd.com',
    mobile: '+91-9876543216',
    address: 'Lucknow, Uttar Pradesh',
    role: 'team-member',
    manager: 'Lokesh Joshi',
    department: 'Education',
  },
  {
    id: 'u8',
    name: 'Kavita Nair',
    email: 'kavita@mtd.com',
    mobile: '+91-9876543217',
    address: 'Bangalore, Karnataka',
    role: 'team-member',
    manager: 'Lokesh Joshi',
    department: 'Health & Hygiene',
  },
  {
    id: 'u9',
    name: 'Amit Bhardwaj',
    email: 'amit@mtd.com',
    mobile: '+91-9876543218',
    address: 'Chennai, Tamil Nadu',
    role: 'team-member',
    manager: 'Lokesh Joshi',
    department: 'Logistics',
  },
  {
    id: 'u10',
    name: 'Pooja Mehta',
    email: 'pooja@mtd.com',
    mobile: '+91-9876543219',
    address: 'Jaipur, Rajasthan',
    role: 'team-member',
    manager: 'Lokesh Joshi',
    department: 'Environment',
  },
];

// Mock CSR Partners
export const csrPartners: CSRPartner[] = [
  {
    id: 'cp1',
    name: 'Interise',
    description: 'Leading CSR partner focused on women empowerment, education, and environmental sustainability',
  },
  {
    id: 'cp2',
    name: 'TCS (Tata Consultancy Services)',
    description: 'Technology-driven CSR initiatives in education and women empowerment',
  },
  {
    id: 'cp3',
    name: 'HDFC Bank',
    description: 'Banking sector CSR focusing on hunger eradication and environmental conservation',
  },
  {
    id: 'cp4',
    name: 'Amazon',
    description: 'E-commerce giant supporting education, hunger relief, and women empowerment programs',
  },
];

// Mock Projects - 4 Main Projects across multiple CSR Partners
export const projects: Project[] = [
  // Interise - LAJJA Project
  {
    id: 'p1',
    partnerId: 'cp1',
    name: 'LAJJA',
    description: 'Women Hygiene - Period Stigma ko Dena hai Maat, Toh Lajja ki kya Baat...!!!',
    location: 'Mumbai',
    state: 'Maharashtra',
    startDate: '2024-01-15',
    endDate: '2025-12-31',
    status: 'active',
    totalBudget: 5000000,
    utilizedBudget: 2725000,
    beneficiariesCurrent: 12000,
    beneficiariesTarget: 15000,
    projectMetrics: {
      pads_donated: { current: 11000, target: 15000 },
      sessions_conducted: { current: 120, target: 150 }
    }
  },
  // Interise - SHOONYA Project
  {
    id: 'p2',
    partnerId: 'cp1',
    name: 'SHOONYA',
    description: 'Zero waste management - Recycling, Reusing & Regenerating for a cleaner India',
    location: 'Pune',
    state: 'Maharashtra',
    startDate: '2024-02-01',
    endDate: '2025-11-30',
    status: 'active',
    totalBudget: 3000000,
    utilizedBudget: 1200000,
    beneficiariesCurrent: 8500,
    beneficiariesTarget: 12000,
    projectMetrics: {
      waste_collected_kg: { current: 62000, target: 100000 },
      trees_planted: { current: 3500, target: 5000 },
      plastic_recycled_kg: { current: 15000, target: 25000 },
      communities_covered: { current: 25, target: 40 }
    }
  },
  // Interise - KILL HUNGER Project
  {
    id: 'p3',
    partnerId: 'cp1',
    name: 'KILL HUNGER',
    description: 'Health & Hunger - If you can\'t feed 100 people then feed just 1',
    location: 'Mumbai',
    state: 'Maharashtra',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    status: 'active',
    totalBudget: 6000000,
    utilizedBudget: 3200000,
    beneficiariesCurrent: 8500,
    beneficiariesTarget: 15000,
    projectMetrics: {
      meals_distributed: { current: 125000, target: 200000 },
      ration_kits_distributed: { current: 10000, target: 15000 },
      families_fed: { current: 8500, target: 15000 }
    }
  },
  // Interise - GYANDAAN Project
  {
    id: 'p4',
    partnerId: 'cp1',
    name: 'GYANDAAN',
    description: 'Education - Providing knowledge to the underprivileged through open schools, libraries & scholarships',
    location: 'Lucknow',
    state: 'Uttar Pradesh',
    startDate: '2024-03-01',
    endDate: '2025-12-31',
    status: 'active',
    totalBudget: 4000000,
    utilizedBudget: 1600000,
    beneficiariesCurrent: 2800,
    beneficiariesTarget: 5000,
    projectMetrics: {
      students_enrolled: { current: 2800, target: 5000 },
      schools_renovated: { current: 8, target: 15 },
      libraries_setup: { current: 12, target: 20 },
      scholarships_given: { current: 45, target: 100 }
    }
  },
  // TCS - LAJJA Project
  {
    id: 'p5',
    partnerId: 'cp2',
    name: 'LAJJA',
    description: 'Women Hygiene - Period Stigma ko Dena hai Maat, Toh Lajja ki kya Baat...!!!',
    location: 'Bangalore',
    state: 'Karnataka',
    startDate: '2024-02-15',
    endDate: '2025-12-31',
    status: 'active',
    totalBudget: 4500000,
    utilizedBudget: 2100000,
    beneficiariesCurrent: 9500,
    beneficiariesTarget: 12000,
    projectMetrics: {
      pads_donated: { current: 8500, target: 12000 },
      sessions_conducted: { current: 95, target: 120 }
    }
  },
  // TCS - GYANDAAN Project
  {
    id: 'p6',
    partnerId: 'cp2',
    name: 'GYANDAAN',
    description: 'Education - Providing knowledge to the underprivileged through open schools, libraries & scholarships',
    location: 'Hyderabad',
    state: 'Telangana',
    startDate: '2024-01-20',
    endDate: '2025-12-31',
    status: 'active',
    totalBudget: 3500000,
    utilizedBudget: 1400000,
    beneficiariesCurrent: 2200,
    beneficiariesTarget: 4000,
    projectMetrics: {
      students_enrolled: { current: 2200, target: 4000 },
      schools_renovated: { current: 6, target: 10 },
      libraries_setup: { current: 9, target: 15 },
      scholarships_given: { current: 35, target: 80 }
    }
  },
  // HDFC Bank - SHOONYA Project
  {
    id: 'p7',
    partnerId: 'cp3',
    name: 'SHOONYA',
    description: 'Zero waste management - Recycling, Reusing & Regenerating for a cleaner India',
    location: 'Delhi',
    state: 'Delhi',
    startDate: '2024-03-10',
    endDate: '2025-11-30',
    status: 'active',
    totalBudget: 3800000,
    utilizedBudget: 1500000,
    beneficiariesCurrent: 7200,
    beneficiariesTarget: 10000,
    projectMetrics: {
      waste_collected_kg: { current: 48000, target: 80000 },
      trees_planted: { current: 2800, target: 4000 },
      plastic_recycled_kg: { current: 12000, target: 20000 },
      communities_covered: { current: 18, target: 30 }
    }
  },
  // HDFC Bank - KILL HUNGER Project
  {
    id: 'p8',
    partnerId: 'cp3',
    name: 'KILL HUNGER',
    description: 'Health & Hunger - If you can\'t feed 100 people then feed just 1',
    location: 'Chennai',
    state: 'Tamil Nadu',
    startDate: '2024-02-05',
    endDate: '2025-12-31',
    status: 'active',
    totalBudget: 5500000,
    utilizedBudget: 2800000,
    beneficiariesCurrent: 6500,
    beneficiariesTarget: 12000,
    projectMetrics: {
      meals_distributed: { current: 95000, target: 180000 },
      ration_kits_distributed: { current: 7500, target: 12000 },
      families_fed: { current: 6500, target: 12000 }
    }
  },
  // Amazon - All 4 Projects
  {
    id: 'p9',
    partnerId: 'cp4',
    name: 'LAJJA',
    description: 'Women Hygiene - Period Stigma ko Dena hai Maat, Toh Lajja ki kya Baat...!!!',
    location: 'Kolkata',
    state: 'West Bengal',
    startDate: '2024-01-25',
    endDate: '2025-12-31',
    status: 'active',
    totalBudget: 4200000,
    utilizedBudget: 1900000,
    beneficiariesCurrent: 7800,
    beneficiariesTarget: 10000,
    projectMetrics: {
      pads_donated: { current: 7000, target: 10000 },
      sessions_conducted: { current: 78, target: 100 }
    }
  },
  {
    id: 'p10',
    partnerId: 'cp4',
    name: 'SHOONYA',
    description: 'Zero waste management - Recycling, Reusing & Regenerating for a cleaner India',
    location: 'Jaipur',
    state: 'Rajasthan',
    startDate: '2024-02-20',
    endDate: '2025-11-30',
    status: 'active',
    totalBudget: 2800000,
    utilizedBudget: 1100000,
    beneficiariesCurrent: 5500,
    beneficiariesTarget: 8000,
    projectMetrics: {
      waste_collected_kg: { current: 35000, target: 60000 },
      trees_planted: { current: 2100, target: 3500 },
      plastic_recycled_kg: { current: 9000, target: 15000 },
      communities_covered: { current: 15, target: 25 }
    }
  },
  {
    id: 'p11',
    partnerId: 'cp4',
    name: 'KILL HUNGER',
    description: 'Health & Hunger - If you can\'t feed 100 people then feed just 1',
    location: 'Ahmedabad',
    state: 'Gujarat',
    startDate: '2024-01-10',
    endDate: '2025-12-31',
    status: 'active',
    totalBudget: 4800000,
    utilizedBudget: 2400000,
    beneficiariesCurrent: 5200,
    beneficiariesTarget: 10000,
    projectMetrics: {
      meals_distributed: { current: 78000, target: 150000 },
      ration_kits_distributed: { current: 6200, target: 10000 },
      families_fed: { current: 5200, target: 10000 }
    }
  },
  {
    id: 'p12',
    partnerId: 'cp4',
    name: 'GYANDAAN',
    description: 'Education - Providing knowledge to the underprivileged through open schools, libraries & scholarships',
    location: 'Indore',
    state: 'Madhya Pradesh',
    startDate: '2024-03-15',
    endDate: '2025-12-31',
    status: 'active',
    totalBudget: 3200000,
    utilizedBudget: 1300000,
    beneficiariesCurrent: 1800,
    beneficiariesTarget: 3500,
    projectMetrics: {
      students_enrolled: { current: 1800, target: 3500 },
      schools_renovated: { current: 5, target: 8 },
      libraries_setup: { current: 7, target: 12 },
      scholarships_given: { current: 28, target: 60 }
    }
  },
];

// Mock Dashboard Cards
export const dashboardCards: DashboardCard[] = [
  {
    id: 'dc1',
    projectId: 'p1',
    title: 'No. of Beneficiaries',
    current: 500,
    target: 1000,
    type: 'beneficiaries',
    details: {
      male: 200,
      female: 250,
      children: 50,
      locations: [
        { name: 'Mumbai', count: 300 },
        { name: 'Pune', count: 150 },
        { name: 'Nagpur', count: 50 },
      ],
    },
  },
  {
    id: 'dc2',
    projectId: 'p1',
    title: 'Events Conducted',
    current: 15,
    target: 30,
    type: 'events',
  },
  {
    id: 'dc3',
    projectId: 'p1',
    title: 'Donations Received',
    current: 750000,
    target: 1500000,
    type: 'donations',
  },
  {
    id: 'dc4',
    projectId: 'p1',
    title: 'Volunteers Engaged',
    current: 45,
    target: 100,
    type: 'volunteers',
  },
  {
    id: 'dc5',
    projectId: 'p1',
    title: 'Schools Covered',
    current: 12,
    target: 25,
    type: 'schools',
  },
  {
    id: 'dc6',
    projectId: 'p1',
    title: 'Social Media Reach',
    current: 25000,
    target: 50000,
    type: 'reach',
  },
  {
    id: 'dc7',
    projectId: 'p3',
    title: 'Meals Distributed',
    current: 15000,
    target: 50000,
    type: 'beneficiaries',
  },
  {
    id: 'dc8',
    projectId: 'p4',
    title: 'Students Supported',
    current: 320,
    target: 500,
    type: 'beneficiaries',
  },
];

// Mock Tasks
export const tasks: Task[] = [
  // LAJJA Mumbai (p1) - Interise
  {
    id: 't1',
    title: 'Distribute menstrual hygiene kits in Dharavi',
    description: 'Distribute 500 hygiene kits to women in Dharavi slum area',
    category: 'Distribution',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Anjali Desai',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-20',
    projectId: 'p1',
    department: 'Health & Hygiene',
  },
  {
    id: 't2',
    title: 'Conduct awareness session at schools',
    description: 'Organize menstrual health awareness sessions in 5 Mumbai schools',
    category: 'Education',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Kavita Nair',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-18',
    projectId: 'p1',
    department: 'Education',
  },
  {
    id: 't3',
    title: 'Social media campaign for LAJJA',
    description: 'Create Instagram and Facebook posts about menstrual hygiene awareness',
    category: 'Social Media',
    priority: 'Less Priority',
    status: 'Not Started',
    assignedTo: 'Sneha Patel',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-25',
    projectId: 'p1',
    department: 'Social Media',
  },
  // SHOONYA Pune (p2) - Interise
  {
    id: 't4',
    title: 'Organize waste collection drive',
    description: 'Collect plastic and recyclable waste from 10 communities in Pune',
    category: 'Field Work',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Pooja Mehta',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-22',
    projectId: 'p2',
    department: 'Environment',
  },
  {
    id: 't5',
    title: 'Plant 200 trees in Kothrud area',
    description: 'Tree plantation drive with local community participation',
    category: 'Environment',
    priority: 'On Priority',
    status: 'Completed',
    assignedTo: 'Rahul Verma',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-10',
    projectId: 'p2',
    department: 'Operations',
  },
  {
    id: 't6',
    title: 'Setup recycling center',
    description: 'Establish plastic recycling unit in Pune',
    category: 'Infrastructure',
    priority: 'On Priority',
    status: 'Not Started',
    assignedTo: 'Amit Bhardwaj',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-12-05',
    projectId: 'p2',
    department: 'Logistics',
  },
  // KILL HUNGER Mumbai (p3) - Interise
  {
    id: 't7',
    title: 'Distribute meals at railway stations',
    description: 'Daily meal distribution to homeless people at 3 major Mumbai stations',
    category: 'Distribution',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Amit Bhardwaj',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-30',
    projectId: 'p3',
    department: 'Logistics',
  },
  {
    id: 't8',
    title: 'Prepare 1000 ration kits',
    description: 'Package monthly ration kits for underprivileged families',
    category: 'Logistics',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Rahul Verma',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-15',
    projectId: 'p3',
    department: 'Operations',
  },
  {
    id: 't9',
    title: 'Partner with local NGOs',
    description: 'Establish partnerships with 3 food distribution NGOs',
    category: 'Partnership',
    priority: 'Less Priority',
    status: 'Not Started',
    assignedTo: 'Lokesh Joshi',
    assignedBy: 'Rajesh Kumar',
    dueDate: '2025-11-28',
    projectId: 'p3',
    department: 'Operations',
  },
  // GYANDAAN Lucknow (p4) - Interise
  {
    id: 't10',
    title: 'Renovate school library',
    description: 'Complete renovation of library at Government Primary School Lucknow',
    category: 'Infrastructure',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Vikram Singh',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-25',
    projectId: 'p4',
    department: 'Education',
  },
  {
    id: 't11',
    title: 'Distribute 500 textbooks',
    description: 'Provide free textbooks to students from economically weaker sections',
    category: 'Distribution',
    priority: 'On Priority',
    status: 'Completed',
    assignedTo: 'Vikram Singh',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-08',
    projectId: 'p4',
    department: 'Education',
  },
  {
    id: 't12',
    title: 'Process scholarship applications',
    description: 'Review and approve 50 scholarship applications for merit students',
    category: 'Administration',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Priya Sharma',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-20',
    projectId: 'p4',
    department: 'Finance',
  },
  // LAJJA Bangalore (p5) - TCS
  {
    id: 't13',
    title: 'Tech-enabled menstrual tracking app',
    description: 'Develop mobile app for menstrual health tracking and education',
    category: 'Technology',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Kavita Nair',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-12-10',
    projectId: 'p5',
    department: 'Health & Hygiene',
  },
  {
    id: 't14',
    title: 'Distribute hygiene kits in IT parks',
    description: 'Distribute menstrual hygiene products to women employees in tech companies',
    category: 'Distribution',
    priority: 'Less Priority',
    status: 'Not Started',
    assignedTo: 'Kavita Nair',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-30',
    projectId: 'p5',
    department: 'Health & Hygiene',
  },
  // GYANDAAN Hyderabad (p6) - TCS
  {
    id: 't15',
    title: 'Setup digital classroom',
    description: 'Install computers and smart boards in 3 government schools',
    category: 'Technology',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Vikram Singh',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-28',
    projectId: 'p6',
    department: 'Education',
  },
  {
    id: 't16',
    title: 'Conduct coding workshops',
    description: 'Organize free coding classes for 100 students',
    category: 'Education',
    priority: 'On Priority',
    status: 'Completed',
    assignedTo: 'Vikram Singh',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-05',
    projectId: 'p6',
    department: 'Education',
  },
  // SHOONYA Delhi (p7) - HDFC Bank
  {
    id: 't17',
    title: 'Install solar panels in community centers',
    description: 'Setup solar energy systems in 5 community centers',
    category: 'Environment',
    priority: 'On Priority',
    status: 'Not Started',
    assignedTo: 'Pooja Mehta',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-12-15',
    projectId: 'p7',
    department: 'Environment',
  },
  {
    id: 't18',
    title: 'Waste segregation awareness campaign',
    description: 'Educate 20 Delhi communities about waste segregation',
    category: 'Education',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Pooja Mehta',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-22',
    projectId: 'p7',
    department: 'Environment',
  },
  // KILL HUNGER Chennai (p8) - HDFC Bank
  {
    id: 't19',
    title: 'Mid-day meal program for schools',
    description: 'Provide nutritious meals to 500 students in 5 government schools',
    category: 'Distribution',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Amit Bhardwaj',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-30',
    projectId: 'p8',
    department: 'Logistics',
  },
  {
    id: 't20',
    title: 'Setup community kitchen',
    description: 'Establish kitchen facility for daily meal preparation',
    category: 'Infrastructure',
    priority: 'On Priority',
    status: 'Not Started',
    assignedTo: 'Amit Bhardwaj',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-12-05',
    projectId: 'p8',
    department: 'Logistics',
  },
  // LAJJA Kolkata (p9) - Amazon
  {
    id: 't21',
    title: 'E-commerce platform for hygiene products',
    description: 'Launch online platform for affordable menstrual hygiene products',
    category: 'Technology',
    priority: 'Less Priority',
    status: 'Not Started',
    assignedTo: 'Anjali Desai',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-12-20',
    projectId: 'p9',
    department: 'Health & Hygiene',
  },
  {
    id: 't22',
    title: 'Distribute hygiene kits in slums',
    description: 'Reach 1000 women in Kolkata slum areas',
    category: 'Distribution',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Anjali Desai',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-18',
    projectId: 'p9',
    department: 'Health & Hygiene',
  },
  // SHOONYA Jaipur (p10) - Amazon
  {
    id: 't23',
    title: 'Plastic-free packaging initiative',
    description: 'Partner with local vendors to eliminate plastic packaging',
    category: 'Environment',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Pooja Mehta',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-25',
    projectId: 'p10',
    department: 'Environment',
  },
  {
    id: 't24',
    title: 'Plant 300 trees in Jaipur',
    description: 'Tree plantation drive in Jaipur public parks',
    category: 'Environment',
    priority: 'On Priority',
    status: 'Completed',
    assignedTo: 'Pooja Mehta',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-10',
    projectId: 'p10',
    department: 'Environment',
  },
  // KILL HUNGER Ahmedabad (p11) - Amazon
  {
    id: 't25',
    title: 'Food delivery to elderly homes',
    description: 'Daily meal delivery to 200 elderly people in old age homes',
    category: 'Distribution',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Amit Bhardwaj',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-30',
    projectId: 'p11',
    department: 'Logistics',
  },
  {
    id: 't26',
    title: 'Amazon warehouse food donation',
    description: 'Coordinate with Amazon warehouses for surplus food donation',
    category: 'Logistics',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Amit Bhardwaj',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-20',
    projectId: 'p11',
    department: 'Logistics',
  },
  // GYANDAAN Indore (p12) - Amazon
  {
    id: 't27',
    title: 'Kindle library setup',
    description: 'Donate Kindle devices and e-books to school libraries',
    category: 'Technology',
    priority: 'On Priority',
    status: 'Not Started',
    assignedTo: 'Vikram Singh',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-12-01',
    projectId: 'p12',
    department: 'Education',
  },
  {
    id: 't28',
    title: 'Scholarship distribution ceremony',
    description: 'Organize event to distribute scholarships to 30 students',
    category: 'Event',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Vikram Singh',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-22',
    projectId: 'p12',
    department: 'Education',
  },
  // Additional General Tasks
  {
    id: 't29',
    title: 'Monthly budget review',
    description: 'Review and reconcile monthly expenses for all projects',
    category: 'Finance',
    priority: 'On Priority',
    status: 'In Progress',
    assignedTo: 'Priya Sharma',
    assignedBy: 'Rajesh Kumar',
    dueDate: '2025-11-15',
    projectId: 'p1',
    department: 'Finance',
  },
  {
    id: 't30',
    title: 'Social media analytics report',
    description: 'Compile monthly social media performance report for all projects',
    category: 'Social Media',
    priority: 'Less Priority',
    status: 'Not Started',
    assignedTo: 'Sneha Patel',
    assignedBy: 'Lokesh Joshi',
    dueDate: '2025-11-28',
    projectId: 'p1',
    department: 'Social Media',
  },
];

// Mock Real-Time Updates
export const realTimeUpdates: RealTimeUpdate[] = [
  // LAJJA Mumbai (p1)
  {
    id: 'ru1',
    date: '2025-11-10',
    updateNumber: 'UPD-001',
    documentNumber: 'DOC-LAJ-MUM-001',
    schoolName: 'Municipal Girls High School, Dharavi',
    address: 'Dharavi, Mumbai, Maharashtra - 400017',
    description: 'Conducted menstrual hygiene awareness workshop with 180 girl students. Distributed 200 sanitary pad packets.',
    images: ['lajja_dharavi_1.jpg', 'lajja_dharavi_2.jpg', 'lajja_dharavi_3.jpg'],
    documentHeading: 'LAJJA Awareness Workshop - Dharavi',
    projectId: 'p1',
    format: 'PDF',
    client: 'Interise',
  },
  {
    id: 'ru2',
    date: '2025-11-08',
    updateNumber: 'UPD-002',
    documentNumber: 'DOC-LAJ-MUM-002',
    schoolName: 'St. Mary Convent School, Bandra',
    address: 'Bandra West, Mumbai, Maharashtra - 400050',
    description: 'Health session covering menstrual hygiene management for 150 students and 10 teachers',
    images: ['lajja_bandra_1.jpg', 'lajja_bandra_2.jpg'],
    documentHeading: 'LAJJA Health Session - Bandra',
    projectId: 'p1',
    format: 'PDF',
    client: 'Interise',
  },
  // SHOONYA Pune (p2)
  {
    id: 'ru3',
    date: '2025-11-09',
    updateNumber: 'UPD-003',
    documentNumber: 'DOC-SHO-PUN-001',
    schoolName: 'Community Center, Kothrud',
    address: 'Kothrud, Pune, Maharashtra - 411038',
    description: 'Planted 200 trees with participation from 50 community members. Collected 500kg of plastic waste.',
    images: ['shoonya_pune_1.jpg', 'shoonya_pune_2.jpg', 'shoonya_pune_3.jpg'],
    documentHeading: 'SHOONYA Tree Plantation Drive',
    projectId: 'p2',
    format: 'PDF',
    client: 'Interise',
  },
  // KILL HUNGER Mumbai (p3)
  {
    id: 'ru4',
    date: '2025-11-07',
    updateNumber: 'UPD-004',
    documentNumber: 'DOC-KH-MUM-001',
    schoolName: 'Railway Station Distribution Center',
    address: 'Dadar Station, Mumbai, Maharashtra - 400014',
    description: 'Distributed 1500 meals to homeless individuals and migrant workers at railway station',
    images: ['killhunger_dadar_1.jpg', 'killhunger_dadar_2.jpg'],
    documentHeading: 'KILL HUNGER Meal Distribution',
    projectId: 'p3',
    format: 'PDF',
    client: 'Interise',
  },
  {
    id: 'ru5',
    date: '2025-11-06',
    updateNumber: 'UPD-005',
    documentNumber: 'DOC-KH-MUM-002',
    schoolName: 'Slum Rehabilitation Authority Area',
    address: 'Mankhurd, Mumbai, Maharashtra - 400043',
    description: 'Distributed 800 ration kits to families in slum areas. Each kit contains rice, dal, oil, and essentials.',
    images: ['killhunger_mankhurd_1.jpg'],
    documentHeading: 'KILL HUNGER Ration Kit Distribution',
    projectId: 'p3',
    format: 'PDF',
    client: 'Interise',
  },
  // GYANDAAN Lucknow (p4)
  {
    id: 'ru6',
    date: '2025-11-05',
    updateNumber: 'UPD-006',
    documentNumber: 'DOC-GYA-LKO-001',
    schoolName: 'Government Primary School, Gomti Nagar',
    address: 'Gomti Nagar, Lucknow, Uttar Pradesh - 226010',
    description: 'Library renovation completed. Installed 200 new books and 15 reading tables. Benefiting 300 students.',
    images: ['gyandaan_lucknow_1.jpg', 'gyandaan_lucknow_2.jpg'],
    documentHeading: 'GYANDAAN Library Renovation',
    projectId: 'p4',
    format: 'PDF',
    client: 'Interise',
  },
  // LAJJA Bangalore (p5)
  {
    id: 'ru7',
    date: '2025-11-04',
    updateNumber: 'UPD-007',
    documentNumber: 'DOC-LAJ-BLR-001',
    schoolName: 'Government Girls School, Whitefield',
    address: 'Whitefield, Bangalore, Karnataka - 560066',
    description: 'Conducted tech-based menstrual health awareness using mobile app demonstrations. 200 participants.',
    images: ['lajja_bangalore_1.jpg'],
    documentHeading: 'LAJJA Tech Workshop - Bangalore',
    projectId: 'p5',
    format: 'PDF',
    client: 'TCS',
  },
  // GYANDAAN Hyderabad (p6)
  {
    id: 'ru8',
    date: '2025-11-03',
    updateNumber: 'UPD-008',
    documentNumber: 'DOC-GYA-HYD-001',
    schoolName: 'Zilla Parishad High School, Secunderabad',
    address: 'Secunderabad, Hyderabad, Telangana - 500003',
    description: 'Installed 20 computers and smart boards in digital classroom. Conducted coding workshop for 100 students.',
    images: ['gyandaan_hyderabad_1.jpg', 'gyandaan_hyderabad_2.jpg'],
    documentHeading: 'GYANDAAN Digital Classroom Setup',
    projectId: 'p6',
    format: 'PDF',
    client: 'TCS',
  },
  // SHOONYA Delhi (p7)
  {
    id: 'ru9',
    date: '2025-11-02',
    updateNumber: 'UPD-009',
    documentNumber: 'DOC-SHO-DEL-001',
    schoolName: 'Community Hall, Dwarka',
    address: 'Dwarka Sector 10, New Delhi - 110075',
    description: 'Conducted waste segregation awareness session for 150 residents. Collected 800kg recyclable waste.',
    images: ['shoonya_delhi_1.jpg'],
    documentHeading: 'SHOONYA Waste Awareness - Delhi',
    projectId: 'p7',
    format: 'PDF',
    client: 'HDFC Bank',
  },
  // KILL HUNGER Chennai (p8)
  {
    id: 'ru10',
    date: '2025-11-01',
    updateNumber: 'UPD-010',
    documentNumber: 'DOC-KH-CHE-001',
    schoolName: 'Corporation Primary School, T. Nagar',
    address: 'T. Nagar, Chennai, Tamil Nadu - 600017',
    description: 'Initiated mid-day meal program for 500 students. Served nutritious meals with dal, rice, vegetables.',
    images: ['killhunger_chennai_1.jpg', 'killhunger_chennai_2.jpg'],
    documentHeading: 'KILL HUNGER Mid-Day Meal Program',
    projectId: 'p8',
    format: 'PDF',
    client: 'HDFC Bank',
  },
  // LAJJA Kolkata (p9)
  {
    id: 'ru11',
    date: '2025-10-31',
    updateNumber: 'UPD-011',
    documentNumber: 'DOC-LAJ-KOL-001',
    schoolName: 'Girls High School, Kalighat',
    address: 'Kalighat, Kolkata, West Bengal - 700026',
    description: 'Distributed 1000 menstrual hygiene kits in slum areas. Conducted awareness session with 250 women.',
    images: ['lajja_kolkata_1.jpg'],
    documentHeading: 'LAJJA Kit Distribution - Kolkata',
    projectId: 'p9',
    format: 'PDF',
    client: 'Amazon',
  },
  // SHOONYA Jaipur (p10)
  {
    id: 'ru12',
    date: '2025-10-30',
    updateNumber: 'UPD-012',
    documentNumber: 'DOC-SHO-JAI-001',
    schoolName: 'Central Park, Jaipur',
    address: 'Malviya Nagar, Jaipur, Rajasthan - 302017',
    description: 'Planted 300 trees in public parks. Launched plastic-free packaging awareness campaign.',
    images: ['shoonya_jaipur_1.jpg', 'shoonya_jaipur_2.jpg'],
    documentHeading: 'SHOONYA Green Initiative - Jaipur',
    projectId: 'p10',
    format: 'PDF',
    client: 'Amazon',
  },
  // KILL HUNGER Ahmedabad (p11)
  {
    id: 'ru13',
    date: '2025-10-29',
    updateNumber: 'UPD-013',
    documentNumber: 'DOC-KH-AHM-001',
    schoolName: 'Old Age Home, Navrangpura',
    address: 'Navrangpura, Ahmedabad, Gujarat - 380009',
    description: 'Delivered daily meals to 200 elderly residents. Partnered with Amazon logistics for food delivery.',
    images: ['killhunger_ahmedabad_1.jpg'],
    documentHeading: 'KILL HUNGER Elderly Meal Program',
    projectId: 'p11',
    format: 'PDF',
    client: 'Amazon',
  },
  // GYANDAAN Indore (p12)
  {
    id: 'ru14',
    date: '2025-10-28',
    updateNumber: 'UPD-014',
    documentNumber: 'DOC-GYA-IND-001',
    schoolName: 'Municipal School, Vijay Nagar',
    address: 'Vijay Nagar, Indore, Madhya Pradesh - 452010',
    description: 'Distributed 50 Kindle devices loaded with educational e-books. Setup digital library for 400 students.',
    images: ['gyandaan_indore_1.jpg', 'gyandaan_indore_2.jpg'],
    documentHeading: 'GYANDAAN E-Library Initiative',
    projectId: 'p12',
    format: 'PDF',
    client: 'Amazon',
  },
];

// Mock Media Articles
export const mediaArticles: MediaArticle[] = [
  // LAJJA Projects
  {
    id: 'ma1',
    heading: 'Geo Tagged Photo - LAJJA Dharavi Workshop',
    date: '2025-11-10',
    link: 'https://drive.google.com/lajja_mumbai_photo1',
    format: 'JPEG',
    type: 'photo',
    projectId: 'p1',
    newsChannel: 'Mid-Day',
  },
  {
    id: 'ma2',
    heading: 'Breaking Menstrual Taboos in Mumbai Slums',
    date: '2025-11-09',
    link: 'https://timesofindia.com/lajja-mumbai-article',
    format: 'Article',
    type: 'article',
    projectId: 'p1',
    newsChannel: 'Times of India',
  },
  {
    id: 'ma3',
    heading: 'LAJJA Workshop Video Coverage - Bangalore',
    date: '2025-11-04',
    link: 'https://drive.google.com/lajja_bangalore_video',
    format: 'MP4',
    type: 'video',
    projectId: 'p5',
    newsChannel: 'Deccan Herald',
  },
  {
    id: 'ma4',
    heading: 'Tech Meets Healthcare: TCS LAJJA Initiative',
    date: '2025-11-03',
    link: 'https://thehindu.com/lajja-tcs-article',
    format: 'Article',
    type: 'article',
    projectId: 'p5',
    newsChannel: 'The Hindu',
  },
  {
    id: 'ma5',
    heading: 'Geo Tagged Photo - LAJJA Kolkata Distribution',
    date: '2025-10-31',
    link: 'https://drive.google.com/lajja_kolkata_photo',
    format: 'JPEG',
    type: 'photo',
    projectId: 'p9',
    newsChannel: 'Telegraph India',
  },
  // SHOONYA Projects
  {
    id: 'ma6',
    heading: 'SHOONYA Tree Plantation Drive - Pune',
    date: '2025-11-09',
    link: 'https://drive.google.com/shoonya_pune_video',
    format: 'MP4',
    type: 'video',
    projectId: 'p2',
    newsChannel: 'Pune Mirror',
  },
  {
    id: 'ma7',
    heading: 'Zero Waste Initiative Transforms Pune Communities',
    date: '2025-11-08',
    link: 'https://indianexpress.com/shoonya-pune',
    format: 'Article',
    type: 'article',
    projectId: 'p2',
    newsChannel: 'Indian Express',
  },
  {
    id: 'ma8',
    heading: 'Geo Tagged Photo - SHOONYA Delhi Waste Collection',
    date: '2025-11-02',
    link: 'https://drive.google.com/shoonya_delhi_photo',
    format: 'JPEG',
    type: 'photo',
    projectId: 'p7',
    newsChannel: 'Hindustan Times',
  },
  {
    id: 'ma9',
    heading: 'HDFC Bank Leads Green Revolution in Delhi',
    date: '2025-11-01',
    link: 'https://ndtv.com/shoonya-delhi-article',
    format: 'Article',
    type: 'article',
    projectId: 'p7',
    newsChannel: 'NDTV',
  },
  {
    id: 'ma10',
    heading: 'Amazon SHOONYA Jaipur Plantation Event',
    date: '2025-10-30',
    link: 'https://drive.google.com/shoonya_jaipur_video',
    format: 'MP4',
    type: 'video',
    projectId: 'p10',
    newsChannel: 'Rajasthan Patrika',
  },
  // KILL HUNGER Projects
  {
    id: 'ma11',
    heading: 'KILL HUNGER Feeds Thousands at Mumbai Stations',
    date: '2025-11-07',
    link: 'https://mumbaimirror.com/killhunger-mumbai',
    format: 'Article',
    type: 'article',
    projectId: 'p3',
    newsChannel: 'Mumbai Mirror',
  },
  {
    id: 'ma12',
    heading: 'Geo Tagged Photo - Ration Kit Distribution',
    date: '2025-11-06',
    link: 'https://drive.google.com/killhunger_mumbai_photo',
    format: 'JPEG',
    type: 'photo',
    projectId: 'p3',
    newsChannel: 'Loksatta',
  },
  {
    id: 'ma13',
    heading: 'Mid-Day Meal Program Launched in Chennai Schools',
    date: '2025-11-01',
    link: 'https://thehindu.com/killhunger-chennai',
    format: 'Article',
    type: 'article',
    projectId: 'p8',
    newsChannel: 'The Hindu',
  },
  {
    id: 'ma14',
    heading: 'KILL HUNGER Chennai Kitchen Setup Video',
    date: '2025-10-31',
    link: 'https://drive.google.com/killhunger_chennai_video',
    format: 'MP4',
    type: 'video',
    projectId: 'p8',
    newsChannel: 'Dinamalar',
  },
  {
    id: 'ma15',
    heading: 'Amazon Partners for Elderly Meal Delivery',
    date: '2025-10-29',
    link: 'https://gujaratsamachar.com/killhunger-ahmedabad',
    format: 'Article',
    type: 'article',
    projectId: 'p11',
    newsChannel: 'Gujarat Samachar',
  },
  // GYANDAAN Projects
  {
    id: 'ma16',
    heading: 'GYANDAAN Library Renovation - Lucknow',
    date: '2025-11-05',
    link: 'https://drive.google.com/gyandaan_lucknow_video',
    format: 'MP4',
    type: 'video',
    projectId: 'p4',
    newsChannel: 'Dainik Jagran',
  },
  {
    id: 'ma17',
    heading: 'Education Initiative Transforms Rural Schools',
    date: '2025-11-04',
    link: 'https://aajtak.com/gyandaan-lucknow',
    format: 'Article',
    type: 'article',
    projectId: 'p4',
    newsChannel: 'Aaj Tak',
  },
  {
    id: 'ma18',
    heading: 'Geo Tagged Photo - Digital Classroom Hyderabad',
    date: '2025-11-03',
    link: 'https://drive.google.com/gyandaan_hyderabad_photo',
    format: 'JPEG',
    type: 'photo',
    projectId: 'p6',
    newsChannel: 'Eenadu',
  },
  {
    id: 'ma19',
    heading: 'TCS Brings Coding Education to Government Schools',
    date: '2025-11-02',
    link: 'https://deccanchronicle.com/gyandaan-hyderabad',
    format: 'Article',
    type: 'article',
    projectId: 'p6',
    newsChannel: 'Deccan Chronicle',
  },
  {
    id: 'ma20',
    heading: 'Amazon Kindle Library Initiative - Indore',
    date: '2025-10-28',
    link: 'https://drive.google.com/gyandaan_indore_video',
    format: 'MP4',
    type: 'video',
    projectId: 'p12',
    newsChannel: 'Dainik Bhaskar',
  },
  {
    id: 'ma21',
    heading: 'Digital Transformation in MP Schools',
    date: '2025-10-27',
    link: 'https://patrika.com/gyandaan-indore',
    format: 'Article',
    type: 'article',
    projectId: 'p12',
    newsChannel: 'Rajasthan Patrika',
  },
];

// Mock Expenses
export const expenses: Expense[] = [
  // LAJJA Mumbai (p1) expenses
  {
    id: 'e1',
    merchantName: 'Healthcare Supplies India',
    date: '2025-11-05',
    category: 'Materials',
    totalAmount: 45000,
    description: 'Purchase of 2000 menstrual hygiene kits for distribution',
    receiptLink: 'https://drive.google.com/receipt_lajja_p1_001',
    status: 'Approved',
    submittedBy: 'Anjali Desai',
    projectId: 'p1',
  },
  {
    id: 'e2',
    merchantName: 'Event Venue Services',
    date: '2025-11-03',
    category: 'Logistics',
    totalAmount: 12000,
    description: 'Venue rental for awareness workshop at school',
    receiptLink: 'https://drive.google.com/receipt_lajja_p1_002',
    status: 'Approved',
    submittedBy: 'Anjali Desai',
    projectId: 'p1',
  },
  {
    id: 'e3',
    merchantName: 'Creative Media Productions',
    date: '2025-11-01',
    category: 'Videography',
    totalAmount: 18000,
    description: 'Video documentation of LAJJA workshops',
    receiptLink: 'https://drive.google.com/receipt_lajja_p1_003',
    status: 'Pending',
    submittedBy: 'Sneha Patel',
    projectId: 'p1',
  },
  // SHOONYA Pune (p2) expenses
  {
    id: 'e4',
    merchantName: 'Green Earth Nursery',
    date: '2025-11-08',
    category: 'Environment',
    totalAmount: 25000,
    description: 'Purchase of 200 saplings for tree plantation drive',
    receiptLink: 'https://drive.google.com/receipt_shoonya_p2_001',
    status: 'Approved',
    submittedBy: 'Pooja Mehta',
    projectId: 'p2',
  },
  {
    id: 'e5',
    merchantName: 'Waste Management Solutions',
    date: '2025-11-06',
    category: 'Services',
    totalAmount: 15000,
    description: 'Plastic waste collection and recycling services',
    receiptLink: 'https://drive.google.com/receipt_shoonya_p2_002',
    status: 'Approved',
    submittedBy: 'Pooja Mehta',
    projectId: 'p2',
  },
  // KILL HUNGER Mumbai (p3) expenses
  {
    id: 'e6',
    merchantName: 'Food Supplies Mumbai',
    date: '2025-11-07',
    category: 'Food & Supplies',
    totalAmount: 75000,
    description: 'Bulk purchase of rice, dal, vegetables for 1500 meals',
    receiptLink: 'https://drive.google.com/receipt_kh_p3_001',
    status: 'Approved',
    submittedBy: 'Amit Bhardwaj',
    projectId: 'p3',
  },
  {
    id: 'e7',
    merchantName: 'Packaging Solutions',
    date: '2025-11-05',
    category: 'Materials',
    totalAmount: 8000,
    description: 'Ration kit packaging materials and containers',
    receiptLink: 'https://drive.google.com/receipt_kh_p3_002',
    status: 'Approved',
    submittedBy: 'Amit Bhardwaj',
    projectId: 'p3',
  },
  {
    id: 'e8',
    merchantName: 'Transport Logistics Co',
    date: '2025-11-04',
    category: 'Logistics',
    totalAmount: 12000,
    description: 'Transportation for food distribution at 3 railway stations',
    receiptLink: 'https://drive.google.com/receipt_kh_p3_003',
    status: 'Pending',
    submittedBy: 'Rahul Verma',
    projectId: 'p3',
  },
  // GYANDAAN Lucknow (p4) expenses
  {
    id: 'e9',
    merchantName: 'Book Depot Lucknow',
    date: '2025-11-05',
    category: 'Educational Materials',
    totalAmount: 35000,
    description: 'Purchase of 500 textbooks and reference books',
    receiptLink: 'https://drive.google.com/receipt_gya_p4_001',
    status: 'Approved',
    submittedBy: 'Vikram Singh',
    projectId: 'p4',
  },
  {
    id: 'e10',
    merchantName: 'Furniture & Fixtures',
    date: '2025-11-03',
    category: 'Infrastructure',
    totalAmount: 28000,
    description: 'Library furniture - tables, chairs, bookshelves',
    receiptLink: 'https://drive.google.com/receipt_gya_p4_002',
    status: 'Approved',
    submittedBy: 'Vikram Singh',
    projectId: 'p4',
  },
  // LAJJA Bangalore (p5) expenses
  {
    id: 'e11',
    merchantName: 'Tech Solutions Bangalore',
    date: '2025-11-02',
    category: 'Technology',
    totalAmount: 42000,
    description: 'Mobile app development for menstrual health tracking',
    receiptLink: 'https://drive.google.com/receipt_lajja_p5_001',
    status: 'Pending',
    submittedBy: 'Kavita Nair',
    projectId: 'p5',
  },
  {
    id: 'e12',
    merchantName: 'Hygiene Products Supplier',
    date: '2025-10-31',
    category: 'Materials',
    totalAmount: 38000,
    description: 'Bulk order of menstrual hygiene products',
    receiptLink: 'https://drive.google.com/receipt_lajja_p5_002',
    status: 'Approved',
    submittedBy: 'Kavita Nair',
    projectId: 'p5',
  },
  // GYANDAAN Hyderabad (p6) expenses
  {
    id: 'e13',
    merchantName: 'Computer World Hyderabad',
    date: '2025-11-01',
    category: 'Technology',
    totalAmount: 85000,
    description: 'Purchase of 20 desktop computers for digital classroom',
    receiptLink: 'https://drive.google.com/receipt_gya_p6_001',
    status: 'Approved',
    submittedBy: 'Vikram Singh',
    projectId: 'p6',
  },
  {
    id: 'e14',
    merchantName: 'SmartBoard India',
    date: '2025-10-30',
    category: 'Technology',
    totalAmount: 65000,
    description: 'Interactive smart boards for 3 classrooms',
    receiptLink: 'https://drive.google.com/receipt_gya_p6_002',
    status: 'Approved',
    submittedBy: 'Vikram Singh',
    projectId: 'p6',
  },
  // SHOONYA Delhi (p7) expenses
  {
    id: 'e15',
    merchantName: 'Solar Energy Systems',
    date: '2025-10-29',
    category: 'Environment',
    totalAmount: 95000,
    description: 'Solar panel installation in community centers',
    receiptLink: 'https://drive.google.com/receipt_shoonya_p7_001',
    status: 'Pending',
    submittedBy: 'Pooja Mehta',
    projectId: 'p7',
  },
  {
    id: 'e16',
    merchantName: 'Eco Awareness Materials',
    date: '2025-10-28',
    category: 'Materials',
    totalAmount: 8500,
    description: 'Waste segregation bins and awareness posters',
    receiptLink: 'https://drive.google.com/receipt_shoonya_p7_002',
    status: 'Approved',
    submittedBy: 'Pooja Mehta',
    projectId: 'p7',
  },
  // KILL HUNGER Chennai (p8) expenses
  {
    id: 'e17',
    merchantName: 'Kitchen Equipment Chennai',
    date: '2025-10-30',
    category: 'Infrastructure',
    totalAmount: 72000,
    description: 'Industrial kitchen setup for meal preparation',
    receiptLink: 'https://drive.google.com/receipt_kh_p8_001',
    status: 'Pending',
    submittedBy: 'Amit Bhardwaj',
    projectId: 'p8',
  },
  {
    id: 'e18',
    merchantName: 'Food Suppliers Chennai',
    date: '2025-10-28',
    category: 'Food & Supplies',
    totalAmount: 55000,
    description: 'Monthly food supplies for mid-day meal program',
    receiptLink: 'https://drive.google.com/receipt_kh_p8_002',
    status: 'Approved',
    submittedBy: 'Amit Bhardwaj',
    projectId: 'p8',
  },
  // LAJJA Kolkata (p9) expenses
  {
    id: 'e19',
    merchantName: 'Women Health Products',
    date: '2025-10-31',
    category: 'Materials',
    totalAmount: 48000,
    description: 'Menstrual hygiene kits for slum distribution',
    receiptLink: 'https://drive.google.com/receipt_lajja_p9_001',
    status: 'Approved',
    submittedBy: 'Anjali Desai',
    projectId: 'p9',
  },
  // SHOONYA Jaipur (p10) expenses
  {
    id: 'e20',
    merchantName: 'Jaipur Nurseries',
    date: '2025-10-29',
    category: 'Environment',
    totalAmount: 32000,
    description: '300 saplings for park plantation drive',
    receiptLink: 'https://drive.google.com/receipt_shoonya_p10_001',
    status: 'Approved',
    submittedBy: 'Pooja Mehta',
    projectId: 'p10',
  },
  {
    id: 'e21',
    merchantName: 'Eco Packaging Jaipur',
    date: '2025-10-27',
    category: 'Materials',
    totalAmount: 15000,
    description: 'Biodegradable packaging materials for campaign',
    receiptLink: 'https://drive.google.com/receipt_shoonya_p10_002',
    status: 'Rejected',
    submittedBy: 'Pooja Mehta',
    projectId: 'p10',
    reason: 'Incomplete vendor documentation',
  },
  // KILL HUNGER Ahmedabad (p11) expenses
  {
    id: 'e22',
    merchantName: 'Amazon Warehouse Services',
    date: '2025-10-28',
    category: 'Logistics',
    totalAmount: 22000,
    description: 'Food delivery logistics partnership',
    receiptLink: 'https://drive.google.com/receipt_kh_p11_001',
    status: 'Approved',
    submittedBy: 'Amit Bhardwaj',
    projectId: 'p11',
  },
  {
    id: 'e23',
    merchantName: 'Food Supplies Ahmedabad',
    date: '2025-10-26',
    category: 'Food & Supplies',
    totalAmount: 45000,
    description: 'Daily meal ingredients for 200 elderly residents',
    receiptLink: 'https://drive.google.com/receipt_kh_p11_002',
    status: 'Approved',
    submittedBy: 'Amit Bhardwaj',
    projectId: 'p11',
  },
  // GYANDAAN Indore (p12) expenses
  {
    id: 'e24',
    merchantName: 'Amazon E-Devices',
    date: '2025-10-27',
    category: 'Technology',
    totalAmount: 52000,
    description: '50 Kindle devices with educational content',
    receiptLink: 'https://drive.google.com/receipt_gya_p12_001',
    status: 'Pending',
    submittedBy: 'Vikram Singh',
    projectId: 'p12',
  },
  {
    id: 'e25',
    merchantName: 'Event Management Indore',
    date: '2025-10-25',
    category: 'Logistics',
    totalAmount: 18000,
    description: 'Scholarship distribution ceremony expenses',
    receiptLink: 'https://drive.google.com/receipt_gya_p12_002',
    status: 'Approved',
    submittedBy: 'Vikram Singh',
    projectId: 'p12',
  },
  // Common expenses
  {
    id: 'e26',
    merchantName: 'Social Media Agency',
    date: '2025-11-01',
    category: 'Social Media Expense',
    totalAmount: 12000,
    description: 'Facebook and Instagram ad campaigns for all projects',
    receiptLink: 'https://drive.google.com/receipt_social_001',
    status: 'Approved',
    submittedBy: 'Sneha Patel',
    projectId: 'p1',
  },
  {
    id: 'e27',
    merchantName: 'Photography Services',
    date: '2025-10-30',
    category: 'Videography',
    totalAmount: 9500,
    description: 'Photo documentation for multiple project events',
    receiptLink: 'https://drive.google.com/receipt_photo_001',
    status: 'Rejected',
    submittedBy: 'Sneha Patel',
    projectId: 'p2',
    reason: 'Budget exceeded for this category',
  },
];

// Mock Budgets
export const budgets: Budget[] = [
  // LAJJA Mumbai (p1) - Total: ₹5,000,000, Utilized: ₹3,250,000
  {
    id: 'b1',
    projectId: 'p1',
    fundHead: 'Hygiene Kits & Materials',
    allocatedAmount: 2000000,
    utilizedAmount: 1300000,
  },
  {
    id: 'b2',
    projectId: 'p1',
    fundHead: 'Awareness Workshops',
    allocatedAmount: 1500000,
    utilizedAmount: 975000,
  },
  {
    id: 'b3',
    projectId: 'p1',
    fundHead: 'Logistics & Transportation',
    allocatedAmount: 800000,
    utilizedAmount: 520000,
  },
  {
    id: 'b4',
    projectId: 'p1',
    fundHead: 'Marketing & Promotion',
    allocatedAmount: 700000,
    utilizedAmount: 455000,
  },
  // SHOONYA Pune (p2) - Total: ₹3,000,000, Utilized: ₹1,950,000
  {
    id: 'b5',
    projectId: 'p2',
    fundHead: 'Tree Plantation',
    allocatedAmount: 1200000,
    utilizedAmount: 780000,
  },
  {
    id: 'b6',
    projectId: 'p2',
    fundHead: 'Waste Collection & Recycling',
    allocatedAmount: 1000000,
    utilizedAmount: 650000,
  },
  {
    id: 'b7',
    projectId: 'p2',
    fundHead: 'Community Awareness',
    allocatedAmount: 800000,
    utilizedAmount: 520000,
  },
  // KILL HUNGER Mumbai (p3) - Total: ₹6,000,000, Utilized: ₹3,900,000
  {
    id: 'b8',
    projectId: 'p3',
    fundHead: 'Food Supplies',
    allocatedAmount: 3000000,
    utilizedAmount: 1950000,
  },
  {
    id: 'b9',
    projectId: 'p3',
    fundHead: 'Meal Distribution Logistics',
    allocatedAmount: 1500000,
    utilizedAmount: 975000,
  },
  {
    id: 'b10',
    projectId: 'p3',
    fundHead: 'Ration Kit Packaging',
    allocatedAmount: 1000000,
    utilizedAmount: 650000,
  },
  {
    id: 'b11',
    projectId: 'p3',
    fundHead: 'Operations & Management',
    allocatedAmount: 500000,
    utilizedAmount: 325000,
  },
  // GYANDAAN Lucknow (p4) - Total: ₹4,000,000, Utilized: ₹2,600,000
  {
    id: 'b12',
    projectId: 'p4',
    fundHead: 'Library Infrastructure',
    allocatedAmount: 1500000,
    utilizedAmount: 975000,
  },
  {
    id: 'b13',
    projectId: 'p4',
    fundHead: 'Books & Educational Materials',
    allocatedAmount: 1200000,
    utilizedAmount: 780000,
  },
  {
    id: 'b14',
    projectId: 'p4',
    fundHead: 'Scholarships',
    allocatedAmount: 1000000,
    utilizedAmount: 650000,
  },
  {
    id: 'b15',
    projectId: 'p4',
    fundHead: 'Teacher Training',
    allocatedAmount: 300000,
    utilizedAmount: 195000,
  },
  // LAJJA Bangalore (p5) - Total: ₹4,500,000, Utilized: ₹2,925,000
  {
    id: 'b16',
    projectId: 'p5',
    fundHead: 'Mobile App Development',
    allocatedAmount: 1500000,
    utilizedAmount: 975000,
  },
  {
    id: 'b17',
    projectId: 'p5',
    fundHead: 'Hygiene Product Distribution',
    allocatedAmount: 1800000,
    utilizedAmount: 1170000,
  },
  {
    id: 'b18',
    projectId: 'p5',
    fundHead: 'Tech Workshops',
    allocatedAmount: 800000,
    utilizedAmount: 520000,
  },
  {
    id: 'b19',
    projectId: 'p5',
    fundHead: 'Marketing',
    allocatedAmount: 400000,
    utilizedAmount: 260000,
  },
  // GYANDAAN Hyderabad (p6) - Total: ₹3,500,000, Utilized: ₹2,275,000
  {
    id: 'b20',
    projectId: 'p6',
    fundHead: 'Computer Equipment',
    allocatedAmount: 1800000,
    utilizedAmount: 1170000,
  },
  {
    id: 'b21',
    projectId: 'p6',
    fundHead: 'Smart Classroom Setup',
    allocatedAmount: 1000000,
    utilizedAmount: 650000,
  },
  {
    id: 'b22',
    projectId: 'p6',
    fundHead: 'Coding Workshops',
    allocatedAmount: 700000,
    utilizedAmount: 455000,
  },
  // SHOONYA Delhi (p7) - Total: ₹3,800,000, Utilized: ₹2,470,000
  {
    id: 'b23',
    projectId: 'p7',
    fundHead: 'Solar Panel Installation',
    allocatedAmount: 2000000,
    utilizedAmount: 1300000,
  },
  {
    id: 'b24',
    projectId: 'p7',
    fundHead: 'Waste Segregation Program',
    allocatedAmount: 1200000,
    utilizedAmount: 780000,
  },
  {
    id: 'b25',
    projectId: 'p7',
    fundHead: 'Community Awareness',
    allocatedAmount: 600000,
    utilizedAmount: 390000,
  },
  // KILL HUNGER Chennai (p8) - Total: ₹5,500,000, Utilized: ₹3,575,000
  {
    id: 'b26',
    projectId: 'p8',
    fundHead: 'Kitchen Infrastructure',
    allocatedAmount: 2000000,
    utilizedAmount: 1300000,
  },
  {
    id: 'b27',
    projectId: 'p8',
    fundHead: 'Food Supplies',
    allocatedAmount: 2500000,
    utilizedAmount: 1625000,
  },
  {
    id: 'b28',
    projectId: 'p8',
    fundHead: 'Operations',
    allocatedAmount: 1000000,
    utilizedAmount: 650000,
  },
  // LAJJA Kolkata (p9) - Total: ₹4,200,000, Utilized: ₹2,730,000
  {
    id: 'b29',
    projectId: 'p9',
    fundHead: 'Hygiene Kit Distribution',
    allocatedAmount: 2200000,
    utilizedAmount: 1430000,
  },
  {
    id: 'b30',
    projectId: 'p9',
    fundHead: 'Awareness Sessions',
    allocatedAmount: 1200000,
    utilizedAmount: 780000,
  },
  {
    id: 'b31',
    projectId: 'p9',
    fundHead: 'Logistics',
    allocatedAmount: 800000,
    utilizedAmount: 520000,
  },
  // SHOONYA Jaipur (p10) - Total: ₹2,800,000, Utilized: ₹1,820,000
  {
    id: 'b32',
    projectId: 'p10',
    fundHead: 'Tree Plantation',
    allocatedAmount: 1000000,
    utilizedAmount: 650000,
  },
  {
    id: 'b33',
    projectId: 'p10',
    fundHead: 'Plastic-Free Campaign',
    allocatedAmount: 1200000,
    utilizedAmount: 780000,
  },
  {
    id: 'b34',
    projectId: 'p10',
    fundHead: 'Community Engagement',
    allocatedAmount: 600000,
    utilizedAmount: 390000,
  },
  // KILL HUNGER Ahmedabad (p11) - Total: ₹4,800,000, Utilized: ₹3,120,000
  {
    id: 'b35',
    projectId: 'p11',
    fundHead: 'Food Procurement',
    allocatedAmount: 2500000,
    utilizedAmount: 1625000,
  },
  {
    id: 'b36',
    projectId: 'p11',
    fundHead: 'Delivery Logistics',
    allocatedAmount: 1500000,
    utilizedAmount: 975000,
  },
  {
    id: 'b37',
    projectId: 'p11',
    fundHead: 'Partner Coordination',
    allocatedAmount: 800000,
    utilizedAmount: 520000,
  },
  // GYANDAAN Indore (p12) - Total: ₹3,200,000, Utilized: ₹2,080,000
  {
    id: 'b38',
    projectId: 'p12',
    fundHead: 'Kindle Devices & E-Books',
    allocatedAmount: 1500000,
    utilizedAmount: 975000,
  },
  {
    id: 'b39',
    projectId: 'p12',
    fundHead: 'Scholarship Program',
    allocatedAmount: 1200000,
    utilizedAmount: 780000,
  },
  {
    id: 'b40',
    projectId: 'p12',
    fundHead: 'Event Management',
    allocatedAmount: 500000,
    utilizedAmount: 325000,
  },
];

// Mock Utilization Certificates
export const utilizationCertificates: UtilizationCertificate[] = [
  // Q1 2025
  {
    id: 'uc1',
    headline: 'Q1 2025 Utilization Certificate - LAJJA Mumbai',
    driveLink: 'https://drive.google.com/uc_lajja_p1_q1',
    format: 'PDF',
    uploadDate: '2025-04-05',
    projectId: 'p1',
  },
  {
    id: 'uc2',
    headline: 'Q1 2025 Utilization Certificate - SHOONYA Pune',
    driveLink: 'https://drive.google.com/uc_shoonya_p2_q1',
    format: 'PDF',
    uploadDate: '2025-04-08',
    projectId: 'p2',
  },
  {
    id: 'uc3',
    headline: 'Q1 2025 Utilization Certificate - KILL HUNGER Mumbai',
    driveLink: 'https://drive.google.com/uc_kh_p3_q1',
    format: 'PDF',
    uploadDate: '2025-04-10',
    projectId: 'p3',
  },
  {
    id: 'uc4',
    headline: 'Q1 2025 Utilization Certificate - GYANDAAN Lucknow',
    driveLink: 'https://drive.google.com/uc_gya_p4_q1',
    format: 'PDF',
    uploadDate: '2025-04-12',
    projectId: 'p4',
  },
  // Q2 2025
  {
    id: 'uc5',
    headline: 'Q2 2025 Utilization Certificate - LAJJA Bangalore',
    driveLink: 'https://drive.google.com/uc_lajja_p5_q2',
    format: 'PDF',
    uploadDate: '2025-07-05',
    projectId: 'p5',
  },
  {
    id: 'uc6',
    headline: 'Q2 2025 Utilization Certificate - GYANDAAN Hyderabad',
    driveLink: 'https://drive.google.com/uc_gya_p6_q2',
    format: 'PDF',
    uploadDate: '2025-07-08',
    projectId: 'p6',
  },
  {
    id: 'uc7',
    headline: 'Q2 2025 Utilization Certificate - SHOONYA Delhi',
    driveLink: 'https://drive.google.com/uc_shoonya_p7_q2',
    format: 'PDF',
    uploadDate: '2025-07-10',
    projectId: 'p7',
  },
  {
    id: 'uc8',
    headline: 'Q2 2025 Utilization Certificate - KILL HUNGER Chennai',
    driveLink: 'https://drive.google.com/uc_kh_p8_q2',
    format: 'PDF',
    uploadDate: '2025-07-12',
    projectId: 'p8',
  },
  // Q3 2025
  {
    id: 'uc9',
    headline: 'Q3 2025 Utilization Certificate - LAJJA Kolkata',
    driveLink: 'https://drive.google.com/uc_lajja_p9_q3',
    format: 'PDF',
    uploadDate: '2025-10-05',
    projectId: 'p9',
  },
  {
    id: 'uc10',
    headline: 'Q3 2025 Utilization Certificate - SHOONYA Jaipur',
    driveLink: 'https://drive.google.com/uc_shoonya_p10_q3',
    format: 'PDF',
    uploadDate: '2025-10-08',
    projectId: 'p10',
  },
  {
    id: 'uc11',
    headline: 'Q3 2025 Utilization Certificate - KILL HUNGER Ahmedabad',
    driveLink: 'https://drive.google.com/uc_kh_p11_q3',
    format: 'PDF',
    uploadDate: '2025-10-10',
    projectId: 'p11',
  },
  {
    id: 'uc12',
    headline: 'Q3 2025 Utilization Certificate - GYANDAAN Indore',
    driveLink: 'https://drive.google.com/uc_gya_p12_q3',
    format: 'PDF',
    uploadDate: '2025-10-12',
    projectId: 'p12',
  },
];

// Mock Bills
export const bills: Bill[] = [
  {
    id: 'bill1',
    billName: 'Hygiene Kits Procurement - Mumbai',
    billDate: '2025-10-26',
    category: 'Materials',
    totalAmount: 45000,
    description: 'Purchase of 2000 menstrual hygiene kits for LAJJA project',
    attachment: 'https://drive.google.com/bill_lajja_p1_001',
    status: 'Submitted',
    submittedBy: 'Anjali Desai',
  },
  {
    id: 'bill2',
    billName: 'Tree Saplings - Pune',
    billDate: '2025-10-26',
    category: 'Environment',
    totalAmount: 25000,
    description: 'Purchase of 200 saplings for SHOONYA plantation drive',
    attachment: 'https://drive.google.com/bill_shoonya_p2_001',
    status: 'Submitted',
    submittedBy: 'Pooja Mehta',
  },
  {
    id: 'bill3',
    billName: 'Food Supplies - Mumbai',
    billDate: '2025-10-26',
    category: 'Food & Supplies',
    totalAmount: 75000,
    description: 'Bulk purchase of food ingredients for KILL HUNGER meal distribution',
    attachment: 'https://drive.google.com/bill_kh_p3_001',
    status: 'Accepted',
    submittedBy: 'Amit Bhardwaj',
  },
  {
    id: 'bill4',
    billName: 'Library Books - Lucknow',
    billDate: '2025-10-26',
    category: 'Educational Materials',
    totalAmount: 35000,
    description: 'Purchase of 500 textbooks for GYANDAAN library',
    attachment: 'https://drive.google.com/bill_gya_p4_001',
    status: 'Submitted',
    submittedBy: 'Vikram Singh',
  },
  {
    id: 'bill5',
    billName: 'Mobile App Development - Bangalore',
    billDate: '2025-10-25',
    category: 'Technology',
    totalAmount: 42000,
    description: 'LAJJA menstrual health tracking app development',
    attachment: 'https://drive.google.com/bill_lajja_p5_001',
    status: 'Pending',
    submittedBy: 'Kavita Nair',
  },
  {
    id: 'bill6',
    billName: 'Computer Equipment - Hyderabad',
    billDate: '2025-10-25',
    category: 'Technology',
    totalAmount: 85000,
    description: 'Purchase of 20 desktop computers for GYANDAAN digital classroom',
    attachment: 'https://drive.google.com/bill_gya_p6_001',
    status: 'Accepted',
    submittedBy: 'Vikram Singh',
  },
  {
    id: 'bill7',
    billName: 'Solar Panels - Delhi',
    billDate: '2025-10-24',
    category: 'Environment',
    totalAmount: 95000,
    description: 'Solar panel installation for SHOONYA project',
    attachment: 'https://drive.google.com/bill_shoonya_p7_001',
    status: 'Not Submitted',
    submittedBy: 'Pooja Mehta',
  },
  {
    id: 'bill8',
    billName: 'Kitchen Equipment - Chennai',
    billDate: '2025-10-24',
    category: 'Infrastructure',
    totalAmount: 72000,
    description: 'Industrial kitchen setup for KILL HUNGER mid-day meal program',
    attachment: 'https://drive.google.com/bill_kh_p8_001',
    status: 'Pending',
    submittedBy: 'Amit Bhardwaj',
  },
  {
    id: 'bill9',
    billName: 'Hygiene Kits - Kolkata',
    billDate: '2025-10-23',
    category: 'Materials',
    totalAmount: 48000,
    description: 'Menstrual hygiene kits for LAJJA slum distribution',
    attachment: 'https://drive.google.com/bill_lajja_p9_001',
    status: 'Submitted',
    submittedBy: 'Anjali Desai',
  },
  {
    id: 'bill10',
    billName: 'Tree Saplings - Jaipur',
    billDate: '2025-10-23',
    category: 'Environment',
    totalAmount: 32000,
    description: '300 saplings for SHOONYA park plantation',
    attachment: 'https://drive.google.com/bill_shoonya_p10_001',
    status: 'Accepted',
    submittedBy: 'Pooja Mehta',
  },
  {
    id: 'bill11',
    billName: 'Food Delivery Logistics - Ahmedabad',
    billDate: '2025-10-22',
    category: 'Logistics',
    totalAmount: 22000,
    description: 'Partnership with Amazon for KILL HUNGER food delivery',
    attachment: 'https://drive.google.com/bill_kh_p11_001',
    status: 'Submitted',
    submittedBy: 'Amit Bhardwaj',
  },
  {
    id: 'bill12',
    billName: 'Kindle Devices - Indore',
    billDate: '2025-10-22',
    category: 'Technology',
    totalAmount: 52000,
    description: '50 Kindle devices for GYANDAAN e-library',
    attachment: 'https://drive.google.com/bill_gya_p12_001',
    status: 'Pending',
    submittedBy: 'Vikram Singh',
  },
  {
    id: 'bill13',
    billName: 'Travel Expenses - November',
    billDate: '2025-11-10',
    category: 'Travel',
    totalAmount: 5500,
    description: 'Site visit transportation for multiple projects',
    attachment: 'https://drive.google.com/bill_travel_001',
    status: 'Submitted',
    submittedBy: 'Rahul Verma',
  },
  {
    id: 'bill14',
    billName: 'Social Media Campaigns',
    billDate: '2025-11-08',
    category: 'Marketing',
    totalAmount: 12000,
    description: 'Facebook and Instagram ad campaigns for all projects',
    attachment: 'https://drive.google.com/bill_social_001',
    status: 'Accepted',
    submittedBy: 'Sneha Patel',
  },
  {
    id: 'bill15',
    billName: 'Video Documentation',
    billDate: '2025-11-05',
    category: 'Videography',
    totalAmount: 18000,
    description: 'Professional video coverage for LAJJA and KILL HUNGER events',
    attachment: 'https://drive.google.com/bill_video_001',
    status: 'Rejected',
    submittedBy: 'Sneha Patel',
    reason: 'Exceeded monthly videography budget',
  },
];

// Mock Data Entries
export const dataEntries: DataEntry[] = [
  // LAJJA Mumbai (p1) Forms
  {
    id: 'de1',
    name: 'Menstrual Hygiene Awareness Workshop',
    date: '2025-11-10',
    schoolName: 'Municipal Girls High School, Dharavi',
    formType: 'Pre Form',
    projectId: 'p1',
    data: {
      studentsCount: 180,
      teachersCount: 10,
      existingAwareness: 'Low',
      accessToProducts: 'Limited',
    },
  },
  {
    id: 'de2',
    name: 'Menstrual Hygiene Awareness Workshop',
    date: '2025-11-10',
    schoolName: 'Municipal Girls High School, Dharavi',
    formType: 'Post Form',
    projectId: 'p1',
    data: {
      studentsCount: 180,
      teachersCount: 10,
      improvedAwareness: 'High',
      feedbackScore: 4.7,
      kitsDistributed: 200,
    },
  },
  // SHOONYA Pune (p2) Forms
  {
    id: 'de3',
    name: 'Tree Plantation Drive Assessment',
    date: '2025-11-09',
    schoolName: 'Community Center, Kothrud',
    formType: 'Pre Form',
    projectId: 'p2',
    data: {
      participantsCount: 50,
      wasteCollectedKg: 0,
      treesPlanted: 0,
    },
  },
  {
    id: 'de4',
    name: 'Tree Plantation Drive Assessment',
    date: '2025-11-09',
    schoolName: 'Community Center, Kothrud',
    formType: 'Post Form',
    projectId: 'p2',
    data: {
      participantsCount: 50,
      wasteCollectedKg: 500,
      treesPlanted: 200,
      feedbackScore: 4.5,
    },
  },
  // KILL HUNGER Mumbai (p3) Forms
  {
    id: 'de5',
    name: 'Meal Distribution Assessment',
    date: '2025-11-07',
    schoolName: 'Railway Station Distribution Center, Dadar',
    formType: 'Pre Form',
    projectId: 'p3',
    data: {
      beneficiariesExpected: 1500,
      mealsPlanned: 1500,
    },
  },
  {
    id: 'de6',
    name: 'Meal Distribution Assessment',
    date: '2025-11-07',
    schoolName: 'Railway Station Distribution Center, Dadar',
    formType: 'Post Form',
    projectId: 'p3',
    data: {
      beneficiariesServed: 1500,
      mealsDistributed: 1500,
      feedbackScore: 4.8,
    },
  },
  // GYANDAAN Lucknow (p4) Forms
  {
    id: 'de7',
    name: 'Library Renovation Assessment',
    date: '2025-11-05',
    schoolName: 'Government Primary School, Gomti Nagar',
    formType: 'Pre Form',
    projectId: 'p4',
    data: {
      studentsCount: 300,
      existingBooks: 50,
      readingFurniture: 5,
    },
  },
  {
    id: 'de8',
    name: 'Library Renovation Assessment',
    date: '2025-11-05',
    schoolName: 'Government Primary School, Gomti Nagar',
    formType: 'Post Form',
    projectId: 'p4',
    data: {
      studentsCount: 300,
      newBooks: 200,
      readingFurniture: 15,
      feedbackScore: 4.9,
    },
  },
  // LAJJA Bangalore (p5) Forms
  {
    id: 'de9',
    name: 'Tech-Based Health Workshop',
    date: '2025-11-04',
    schoolName: 'Government Girls School, Whitefield',
    formType: 'Pre Form',
    projectId: 'p5',
    data: {
      participantsCount: 200,
      techAwareness: 'Medium',
      healthAwareness: 'Low',
    },
  },
  {
    id: 'de10',
    name: 'Tech-Based Health Workshop',
    date: '2025-11-04',
    schoolName: 'Government Girls School, Whitefield',
    formType: 'Post Form',
    projectId: 'p5',
    data: {
      participantsCount: 200,
      appDownloads: 180,
      feedbackScore: 4.6,
    },
  },
  // GYANDAAN Hyderabad (p6) Forms
  {
    id: 'de11',
    name: 'Digital Classroom Setup',
    date: '2025-11-03',
    schoolName: 'Zilla Parishad High School, Secunderabad',
    formType: 'Pre Form',
    projectId: 'p6',
    data: {
      studentsCount: 100,
      computersAvailable: 0,
      digitalLiteracy: 'Low',
    },
  },
  {
    id: 'de12',
    name: 'Digital Classroom Setup',
    date: '2025-11-03',
    schoolName: 'Zilla Parishad High School, Secunderabad',
    formType: 'Post Form',
    projectId: 'p6',
    data: {
      studentsCount: 100,
      computersInstalled: 20,
      smartBoards: 3,
      feedbackScore: 4.8,
    },
  },
  // SHOONYA Delhi (p7) Forms
  {
    id: 'de13',
    name: 'Waste Segregation Awareness',
    date: '2025-11-02',
    schoolName: 'Community Hall, Dwarka',
    formType: 'Pre Form',
    projectId: 'p7',
    data: {
      residentsCount: 150,
      wasteSegregationKnowledge: 'Low',
    },
  },
  {
    id: 'de14',
    name: 'Waste Segregation Awareness',
    date: '2025-11-02',
    schoolName: 'Community Hall, Dwarka',
    formType: 'Post Form',
    projectId: 'p7',
    data: {
      residentsCount: 150,
      wasteCollectedKg: 800,
      feedbackScore: 4.4,
    },
  },
  // KILL HUNGER Chennai (p8) Forms
  {
    id: 'de15',
    name: 'Mid-Day Meal Program Assessment',
    date: '2025-11-01',
    schoolName: 'Corporation Primary School, T. Nagar',
    formType: 'Pre Form',
    projectId: 'p8',
    data: {
      studentsCount: 500,
      currentNutritionLevel: 'Low',
    },
  },
  {
    id: 'de16',
    name: 'Mid-Day Meal Program Assessment',
    date: '2025-11-01',
    schoolName: 'Corporation Primary School, T. Nagar',
    formType: 'Post Form',
    projectId: 'p8',
    data: {
      studentsCount: 500,
      mealsServed: 500,
      feedbackScore: 4.7,
    },
  },
];

// Mock Daily Reports
export const dailyReports: DailyReport[] = [
  // Recent tasks from all projects
  {
    id: 'dr1',
    taskName: 'Distribute menstrual hygiene kits in Dharavi',
    dueDate: '2025-11-20',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p1',
  },
  {
    id: 'dr2',
    taskName: 'Conduct awareness session at schools',
    dueDate: '2025-11-18',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p1',
  },
  {
    id: 'dr3',
    taskName: 'Organize waste collection drive',
    dueDate: '2025-11-22',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p2',
  },
  {
    id: 'dr4',
    taskName: 'Plant 200 trees in Kothrud area',
    dueDate: '2025-11-10',
    completionStatus: 'Completed',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p2',
  },
  {
    id: 'dr5',
    taskName: 'Distribute meals at railway stations',
    dueDate: '2025-11-30',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p3',
  },
  {
    id: 'dr6',
    taskName: 'Prepare 1000 ration kits',
    dueDate: '2025-11-15',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p3',
  },
  {
    id: 'dr7',
    taskName: 'Renovate school library',
    dueDate: '2025-11-25',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p4',
  },
  {
    id: 'dr8',
    taskName: 'Distribute 500 textbooks',
    dueDate: '2025-11-08',
    completionStatus: 'Completed',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p4',
  },
  {
    id: 'dr9',
    taskName: 'Tech-enabled menstrual tracking app',
    dueDate: '2025-12-10',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p5',
  },
  {
    id: 'dr10',
    taskName: 'Setup digital classroom',
    dueDate: '2025-11-28',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p6',
  },
  {
    id: 'dr11',
    taskName: 'Conduct coding workshops',
    dueDate: '2025-11-05',
    completionStatus: 'Completed',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p6',
  },
  {
    id: 'dr12',
    taskName: 'Waste segregation awareness campaign',
    dueDate: '2025-11-22',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p7',
  },
  {
    id: 'dr13',
    taskName: 'Mid-day meal program for schools',
    dueDate: '2025-11-30',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p8',
  },
  {
    id: 'dr14',
    taskName: 'Distribute hygiene kits in slums',
    dueDate: '2025-11-18',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p9',
  },
  {
    id: 'dr15',
    taskName: 'Plant 300 trees in Jaipur',
    dueDate: '2025-11-10',
    completionStatus: 'Completed',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p10',
  },
  {
    id: 'dr16',
    taskName: 'Food delivery to elderly homes',
    dueDate: '2025-11-30',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p11',
  },
  {
    id: 'dr17',
    taskName: 'Scholarship distribution ceremony',
    dueDate: '2025-11-22',
    completionStatus: 'In Progress',
    assignedBy: 'Lokesh Joshi',
    projectId: 'p12',
  },
  {
    id: 'dr18',
    taskName: 'Monthly budget review',
    dueDate: '2025-11-15',
    completionStatus: 'In Progress',
    assignedBy: 'Rajesh Kumar',
    projectId: 'p1',
  },
];

// Chart Data for Analysis Report
export const chartData = {
  beneficiariesByProject: [
    { name: 'LAJJA', value: 29300 }, // Sum of p1, p5, p9 beneficiaries
    { name: 'SHOONYA', value: 21200 }, // Sum of p2, p7, p10 beneficiaries
    { name: 'KILL HUNGER', value: 20200 }, // Sum of p3, p8, p11 beneficiaries
    { name: 'GYANDAAN', value: 6800 }, // Sum of p4, p6, p12 beneficiaries
  ],
  expenseDistribution: [
    { name: 'Materials', value: 295000 },
    { name: 'Technology', value: 271000 },
    { name: 'Food & Supplies', value: 247000 },
    { name: 'Logistics', value: 109500 },
    { name: 'Environment', value: 152000 },
    { name: 'Infrastructure', value: 135000 },
    { name: 'Educational Materials', value: 63000 },
    { name: 'Others', value: 40500 },
  ],
  claimStatus: [
    { name: 'Pending', count: 5 },
    { name: 'Approved', count: 16 },
    { name: 'Rejected', count: 2 },
  ],
  monthlyProgress: [
    { month: 'Jan', beneficiaries: 5000, events: 4 },
    { month: 'Feb', beneficiaries: 8500, events: 6 },
    { month: 'Mar', beneficiaries: 12000, events: 8 },
    { month: 'Apr', beneficiaries: 16500, events: 10 },
    { month: 'May', beneficiaries: 21000, events: 12 },
    { month: 'Jun', beneficiaries: 25500, events: 15 },
    { month: 'Jul', beneficiaries: 30000, events: 18 },
    { month: 'Aug', beneficiaries: 34500, events: 21 },
    { month: 'Sep', beneficiaries: 39000, events: 24 },
    { month: 'Oct', beneficiaries: 43500, events: 27 },
    { month: 'Nov', beneficiaries: 36900, events: 30 },
  ],
  fundUtilization: [
    { name: 'Utilized', value: 24000000 }, // ₹24M total utilized
    { name: 'Remaining', value: 22800000 }, // ₹22.8M remaining
  ],
};

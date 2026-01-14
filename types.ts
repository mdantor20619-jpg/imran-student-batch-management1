
export interface Batch {
  id: string;
  name: string;
  className: string;
  time: string;
  days: string[];
  fee: number; // This is now the specific batch fee
  isActive: boolean;
  status: 'Running' | 'Upcoming' | 'Completed';
  startDate: {
    day: string;
    month: string;
    year: string;
  };
  userId: string;
}

export interface Student {
  id: string;
  name: string;
  roll: string;
  mobile: string;
  batchId: string;
  status: 'Active' | 'Archive';
  monthlyFee?: number; // Optional custom fee for specific student
  enrollmentDate: {
    day: string;
    month: string;
    year: string;
  };
  userId: string;
  presentationScore?: number;
  attendanceRate?: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  batchId: string;
  date: string; // ISO string YYYY-MM-DD
  status: 'P' | 'A';
  userId: string;
}

export interface FineRecord {
  id: string;
  studentId: string;
  batchId: string;
  amount: number;
  reason: string;
  status: 'Paid' | 'Pending';
  date: string;
  userId: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  batchId: string;
  amount: number;
  month: string;
  year: string;
  paymentDate: string;
  type: 'Monthly' | 'Advance' | 'PastDue';
  status: 'Paid' | 'Due';
  userId: string;
}

export interface BatchNote {
  id: string;
  batchId: string;
  content: string;
  type: 'Test' | 'Exam' | 'Event' | 'Note';
  status: 'Pending' | 'Completed';
  createdAt: string;
  userId: string;
}

export enum NavTab {
  DASHBOARD = 'DASHBOARD',
  BATCHES = 'BATCHES', 
  TOOLS = 'TOOLS', 
  FINANCE = 'FINANCE',
  BATCH_FINANCE_DETAIL = 'BATCH_FINANCE_DETAIL',
  STUDENT_LIST = 'STUDENT_LIST',
  NOTES = 'NOTES',
  STUDENT_DETAIL = 'STUDENT_DETAIL',
  LIFETIME_DUE = 'LIFETIME_DUE'
}

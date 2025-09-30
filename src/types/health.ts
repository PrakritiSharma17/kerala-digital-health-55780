export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  abhaId?: string;
  userType: 'migrant' | 'local' | 'returning_indian' | 'foreigner';
  preferredLanguage: 'en' | 'ml' | 'hi' | 'ta';
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  type: 'checkup' | 'test' | 'immunization' | 'consultation' | 'emergency';
  title: string;
  description: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  files: HealthFile[];
  medications: Medication[];
  nextFollowUp?: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface HealthFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  url: string;
  uploadedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  reminderTimes: string[];
}

export interface Appointment {
  id: string;
  userId: string;
  doctorName: string;
  hospitalName: string;
  department: string;
  date: string;
  time: string;
  type: 'in-person' | 'video' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  meetingLink?: string;
  createdAt: string;
}

export interface HealthAlert {
  id: string;
  userId: string;
  type: 'medication' | 'appointment' | 'checkup' | 'emergency' | 'vaccination';
  title: string;
  message: string;
  scheduledFor: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalAppointments: number;
  totalConsultations: number;
  activeAlerts: number;
  regionBreakdown: Record<string, number>;
  userTypeBreakdown: Record<string, number>;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  type: 'registration' | 'appointment' | 'consultation' | 'alert' | 'emergency';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}
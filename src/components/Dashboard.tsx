import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Appointment, HealthRecord, HealthAlert } from '@/types/health';
import { 
  Calendar, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Heart,
  Activity,
  Plus,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

export function Dashboard({ onPageChange }: DashboardProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [appointments] = useLocalStorage<Appointment[]>('health_appointments', []);
  const [records] = useLocalStorage<HealthRecord[]>('health_records', []);
  const [alerts] = useLocalStorage<HealthAlert[]>('health_alerts', []);

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentRecords = records
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const activeAlerts = alerts
    .filter(alert => !alert.isRead && new Date(alert.scheduledFor) <= new Date())
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 3);

  const stats = [
    {
      title: 'Total Appointments',
      value: appointments.length,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Health Records',
      value: records.length,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Alerts',
      value: activeAlerts.length,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Upcoming Checkups',
      value: upcomingAppointments.length,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t('dashboard.welcome')}, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's your health summary for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('dashboard.upcomingAppointments')}</CardTitle>
              <CardDescription>Your next scheduled appointments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => onPageChange('appointments')}>
              <Plus className="h-4 w-4 mr-2" />
              Book New
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments</p>
                <Button 
                  variant="link" 
                  onClick={() => onPageChange('appointments')}
                  className="mt-2"
                >
                  Schedule your first appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{appointment.doctorName}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.department}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">
                          {format(new Date(appointment.date), 'MMM dd, yyyy')} at {appointment.time}
                        </span>
                      </div>
                    </div>
                    <Badge variant={appointment.type === 'video' ? 'secondary' : 'outline'}>
                      {appointment.type}
                    </Badge>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => onPageChange('appointments')}
                >
                  View All Appointments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Health Records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('dashboard.recentRecords')}</CardTitle>
              <CardDescription>Your latest health records</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => onPageChange('records')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </CardHeader>
          <CardContent>
            {recentRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No health records yet</p>
                <Button 
                  variant="link" 
                  onClick={() => onPageChange('records')}
                  className="mt-2"
                >
                  Upload your first record
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{record.title}</h4>
                      <p className="text-sm text-muted-foreground">{record.doctorName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Activity className="h-3 w-3" />
                        <span className="text-xs">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">{record.type}</Badge>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => onPageChange('records')}
                >
                  View All Records
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Health Alerts */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('dashboard.activeAlerts')}
            </CardTitle>
            <CardDescription>Important health notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">
                        {format(new Date(alert.scheduledFor), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(alert.priority)}>
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
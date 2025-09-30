import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Appointment } from '@/types/health';
import { Calendar, Clock, Video, Phone, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export function AppointmentsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('health_appointments', []);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '',
    hospitalName: '',
    department: '',
    date: '',
    time: '',
    type: 'in-person' as Appointment['type'],
    notes: ''
  });

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.doctorName || !formData.hospitalName || !formData.date || !formData.time) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      userId: user!.id,
      doctorName: formData.doctorName,
      hospitalName: formData.hospitalName,
      department: formData.department,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      status: 'scheduled',
      notes: formData.notes,
      meetingLink: formData.type === 'video' ? `https://meet.example.com/${crypto.randomUUID()}` : undefined,
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [...prev, newAppointment]);
    setFormData({
      doctorName: '',
      hospitalName: '',
      department: '',
      date: '',
      time: '',
      type: 'in-person',
      notes: ''
    });
    setIsBookingOpen(false);
    
    toast({
      title: 'Success',
      description: 'Appointment booked successfully!'
    });
  };

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedAppointments = appointments
    .filter(apt => apt.status === 'completed' || new Date(apt.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'phone': return Phone;
      default: return MapPin;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const Icon = getAppointmentIcon(appointment.type);
    
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4" />
                <h3 className="font-semibold">{appointment.doctorName}</h3>
                <Badge variant={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{appointment.hospitalName}</p>
              {appointment.department && (
                <p className="text-sm text-muted-foreground mb-2">{appointment.department}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{appointment.time}</span>
                </div>
              </div>
              {appointment.notes && (
                <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
              )}
            </div>
            {appointment.type === 'video' && appointment.meetingLink && (
              <Button size="sm" variant="outline" asChild>
                <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer">
                  Join Video Call
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('appointments.title')}</h1>
          <p className="text-muted-foreground">Manage your healthcare appointments</p>
        </div>
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('appointments.book')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule your appointment
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctor Name *</Label>
                <Input
                  id="doctorName"
                  value={formData.doctorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Hospital/Clinic *</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Cardiology, General Medicine"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select value={formData.type} onValueChange={(value: Appointment['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person Visit</SelectItem>
                    <SelectItem value="video">Video Consultation</SelectItem>
                    <SelectItem value="phone">Phone Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific concerns or symptoms..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Book Appointment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">{t('appointments.upcoming')} ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="completed">{t('appointments.completed')} ({completedAppointments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground mb-4">
                  Schedule your next appointment to stay on top of your health
                </p>
                <Button onClick={() => setIsBookingOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No completed appointments</h3>
                <p className="text-muted-foreground">
                  Your appointment history will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            completedAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { HealthRecord } from '@/types/health';
import { FileText, Upload, Download, Calendar, User, Building, Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export function HealthRecordsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [records, setRecords] = useLocalStorage<HealthRecord[]>('health_records', []);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    doctorName: '',
    hospitalName: '',
    date: '',
    type: 'checkup' as HealthRecord['type']
  });

  const handleUploadRecord = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.doctorName || !formData.date) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const newRecord: HealthRecord = {
      id: crypto.randomUUID(),
      userId: user!.id,
      title: formData.title,
      description: formData.description,
      doctorName: formData.doctorName,
      hospitalName: formData.hospitalName,
      date: formData.date,
      type: formData.type,
      files: [], // In a real app, you'd handle file uploads here
      medications: [],
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    setRecords(prev => [...prev, newRecord]);
    setFormData({
      title: '',
      description: '',
      doctorName: '',
      hospitalName: '',
      date: '',
      type: 'checkup'
    });
    setIsUploadOpen(false);
    
    toast({
      title: 'Success',
      description: 'Health record added successfully!'
    });
  };

  const filteredRecords = records
    .filter(record => {
      const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || record.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'checkup': return 'default';
      case 'test': return 'secondary';
      case 'immunization': return 'outline';
      case 'consultation': return 'default';
      case 'emergency': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    return FileText; // In a real app, you'd have different icons for different types
  };

  const RecordCard = ({ record }: { record: HealthRecord }) => {
    const Icon = getTypeIcon(record.type);
    
    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4" />
                <h3 className="font-semibold">{record.title}</h3>
                <Badge variant={getTypeColor(record.type)}>
                  {record.type}
                </Badge>
              </div>
              
              {record.description && (
                <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
              )}
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{record.doctorName}</span>
                </div>
                
                {record.hospitalName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-3 w-3" />
                    <span>{record.hospitalName}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(record.date), 'MMM dd, yyyy')}</span>
                </div>
              </div>

              {record.medications.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-1">Medications:</h4>
                  <div className="flex flex-wrap gap-1">
                    {record.medications.map((med, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {med.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {record.nextFollowUp && (
                <div className="mt-3 p-2 bg-accent/50 rounded text-sm">
                  <span className="font-medium">Next Follow-up: </span>
                  {format(new Date(record.nextFollowUp), 'MMM dd, yyyy')}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('records.title')}</h1>
          <p className="text-muted-foreground">View and manage your health records</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('records.upload')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Health Record</DialogTitle>
              <DialogDescription>
                Add a new health record to your profile
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadRecord} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Record Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Annual Checkup, Blood Test Results"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Record Type</Label>
                <Select value={formData.type} onValueChange={(value: HealthRecord['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup">Regular Checkup</SelectItem>
                    <SelectItem value="test">Test Results</SelectItem>
                    <SelectItem value="immunization">Immunization</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
                <Label htmlFor="hospitalName">Hospital/Clinic</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional notes or findings..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Upload Files</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop files here, or click to browse
                  </p>
                  <Input type="file" multiple className="hidden" />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Add Record
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Records</SelectItem>
            <SelectItem value="checkup">Checkups</SelectItem>
            <SelectItem value="test">Test Results</SelectItem>
            <SelectItem value="immunization">Immunizations</SelectItem>
            <SelectItem value="consultation">Consultations</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">
              {searchTerm || filterType !== 'all' ? 'No matching records found' : 'No health records yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start building your digital health record by adding your first record'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button onClick={() => setIsUploadOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Record
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map(record => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
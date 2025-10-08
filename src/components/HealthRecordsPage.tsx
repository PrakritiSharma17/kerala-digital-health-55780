import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Upload, Download, Calendar, User, Building, Plus, Search, Filter, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthWrapper } from './AuthWrapper';

type HealthRecord = {
  id: string;
  user_id: string;
  type: 'checkup' | 'test' | 'immunization' | 'consultation' | 'emergency';
  title: string;
  description: string;
  doctor_name: string;
  hospital_name: string;
  date: string;
  next_follow_up?: string;
  status: 'completed' | 'pending' | 'cancelled';
  created_at: string;
  updated_at: string;
  files?: Array<{
    id: string;
    name: string;
    file_type: string;
    file_path: string;
    file_size: number;
  }>;
  medications?: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
};

interface HealthRecordsPageProps {
  onRecordAdded?: () => void;
}

export function HealthRecordsPage({ onRecordAdded }: HealthRecordsPageProps = {}) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    doctorName: '',
    hospitalName: '',
    date: '',
    type: 'checkup' as HealthRecord['type']
  });
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      setSupabaseUserId(data.user?.id ?? null);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSupabaseUserId(session?.user?.id ?? null);
    });

    init();

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (supabaseUserId) {
      fetchRecords();
    }
  }, [supabaseUserId]);

  const fetchRecords = async () => {
    if (!supabaseUserId) return;
    
    setLoading(true);
    try {
      const { data: records, error } = await supabase
        .from('health_records')
        .select(`
          *,
          health_record_files (
            id,
            name,
            file_type,
            file_path,
            file_size
          ),
          health_record_medications (
            id,
            name,
            dosage,
            frequency,
            duration,
            instructions
          )
        `)
        .eq('user_id', supabaseUserId as string)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRecords(records.map(record => ({
        ...record,
        type: record.type as HealthRecord['type'],
        status: record.status as HealthRecord['status'],
        files: record.health_record_files || [],
        medications: record.health_record_medications || []
      })));
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: 'Error',
        description: 'Failed to load health records',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, recordId: string) => {
    if (!supabaseUserId) throw new Error('Not authenticated');
    const fileExt = file.name.split('.').pop();
    const fileName = `${recordId}/${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${supabaseUserId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('health-records')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const fileType = file.type.includes('image') ? 'image' : 
                    file.type.includes('pdf') ? 'pdf' : 'doc';

    const { error: dbError } = await supabase
      .from('health_record_files')
      .insert({
        record_id: recordId,
        name: file.name,
        file_type: fileType,
        file_path: filePath,
        file_size: file.size
      });

    if (dbError) throw dbError;
  };

  const handleUploadRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.doctorName || !formData.date) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (!supabaseUserId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save health records securely.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Insert health record
      const { data: newRecord, error: recordError } = await supabase
        .from('health_records')
        .insert({
          user_id: supabaseUserId as string,
          title: formData.title,
          description: formData.description,
          doctor_name: formData.doctorName,
          hospital_name: formData.hospitalName,
          date: formData.date,
          type: formData.type,
          status: 'completed'
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Upload files if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          await uploadFile(file, newRecord.id);
        }
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        doctorName: '',
        hospitalName: '',
        date: '',
        type: 'checkup'
      });
      setUploadedFiles([]);
      setIsUploadOpen(false);
      
      // Refresh records
      await fetchRecords();
      
      // Notify parent component if callback provided
      if (onRecordAdded) {
        onRecordAdded();
      }
      
      toast({
        title: 'Success',
        description: 'Health record added successfully! Dataset stored in database.'
      });
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: 'Error',
        description: 'Failed to add health record',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('health-records')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive'
      });
    }
  };

  const filteredRecords = records
    .filter(record => {
      const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (record.hospital_name || '').toLowerCase().includes(searchTerm.toLowerCase());
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
                  <span>{record.doctor_name}</span>
                </div>
                
                {record.hospital_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-3 w-3" />
                    <span>{record.hospital_name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(record.date), 'MMM dd, yyyy')}</span>
                </div>
              </div>

              {record.files && record.files.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-2">Attached Files:</h4>
                  <div className="space-y-1">
                    {record.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          <span>{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {file.file_type}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadFile(file.file_path, file.name)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {record.medications && record.medications.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-1">Medications:</h4>
                  <div className="flex flex-wrap gap-1">
                    {record.medications.map((med) => (
                      <Badge key={med.id} variant="outline" className="text-xs">
                        {med.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {record.next_follow_up && (
                <div className="mt-3 p-2 bg-accent/50 rounded text-sm">
                  <span className="font-medium">Next Follow-up: </span>
                  {format(new Date(record.next_follow_up), 'MMM dd, yyyy')}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AuthWrapper>
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
          <DialogContent className="sm:max-w-[425px]" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
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
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <Input 
                    type="file" 
                    multiple 
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Adding Record...' : 'Add Record'}
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
    </AuthWrapper>
  );
}
-- Create storage bucket for health records
INSERT INTO storage.buckets (id, name, public) VALUES ('health-records', 'health-records', false);

-- Create storage policies for health records
CREATE POLICY "Users can view their own health record files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own health record files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own health record files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own health record files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'health-records' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create health_records table
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checkup', 'test', 'immunization', 'consultation', 'emergency')),
  title TEXT NOT NULL,
  description TEXT,
  doctor_name TEXT NOT NULL,
  hospital_name TEXT,
  date DATE NOT NULL,
  next_follow_up DATE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Create policies for health_records
CREATE POLICY "Users can view their own health records" 
ON public.health_records 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own health records" 
ON public.health_records 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own health records" 
ON public.health_records 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own health records" 
ON public.health_records 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create health_record_files table
CREATE TABLE public.health_record_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES public.health_records(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image', 'doc')),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_record_files ENABLE ROW LEVEL SECURITY;

-- Create policies for health_record_files (access through health_records)
CREATE POLICY "Users can view files for their own health records" 
ON public.health_record_files 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.health_records 
  WHERE health_records.id = health_record_files.record_id 
  AND auth.uid()::text = health_records.user_id::text
));

CREATE POLICY "Users can create files for their own health records" 
ON public.health_record_files 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.health_records 
  WHERE health_records.id = health_record_files.record_id 
  AND auth.uid()::text = health_records.user_id::text
));

CREATE POLICY "Users can update files for their own health records" 
ON public.health_record_files 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.health_records 
  WHERE health_records.id = health_record_files.record_id 
  AND auth.uid()::text = health_records.user_id::text
));

CREATE POLICY "Users can delete files for their own health records" 
ON public.health_record_files 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.health_records 
  WHERE health_records.id = health_record_files.record_id 
  AND auth.uid()::text = health_records.user_id::text
));

-- Create medications table
CREATE TABLE public.health_record_medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES public.health_records(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  instructions TEXT,
  reminder_times TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_record_medications ENABLE ROW LEVEL SECURITY;

-- Create policies for medications (access through health_records)
CREATE POLICY "Users can view medications for their own health records" 
ON public.health_record_medications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.health_records 
  WHERE health_records.id = health_record_medications.record_id 
  AND auth.uid()::text = health_records.user_id::text
));

CREATE POLICY "Users can create medications for their own health records" 
ON public.health_record_medications 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.health_records 
  WHERE health_records.id = health_record_medications.record_id 
  AND auth.uid()::text = health_records.user_id::text
));

CREATE POLICY "Users can update medications for their own health records" 
ON public.health_record_medications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.health_records 
  WHERE health_records.id = health_record_medications.record_id 
  AND auth.uid()::text = health_records.user_id::text
));

CREATE POLICY "Users can delete medications for their own health records" 
ON public.health_record_medications 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.health_records 
  WHERE health_records.id = health_record_medications.record_id 
  AND auth.uid()::text = health_records.user_id::text
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON public.health_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
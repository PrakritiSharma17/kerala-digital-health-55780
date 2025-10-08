-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create their own health records" ON public.health_records;

-- Create new INSERT policy with proper UUID comparison
CREATE POLICY "Users can create their own health records"
ON public.health_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
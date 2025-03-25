
-- Function to create storage policies
CREATE OR REPLACE FUNCTION public.create_storage_policy(
  bucket_name TEXT,
  policy_name TEXT,
  definition TEXT,
  operation TEXT
)
RETURNS VOID AS $$
DECLARE
  policy_statement TEXT;
BEGIN
  policy_statement := format(
    'CREATE POLICY "%s" ON storage.objects FOR %s TO authenticated USING (bucket_id = ''%s'' AND %s)',
    policy_name,
    operation,
    bucket_name,
    definition
  );
  
  EXECUTE policy_statement;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

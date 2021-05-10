-- Authentication

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- User Shared Files

DROP TABLE IF EXISTS public.shared_files;

CREATE TABLE public.shared_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id uuid REFERENCES storage.objects ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE DEFAULT auth.uid() NOT NULL
);

COMMENT ON TABLE public.shared_files IS 'Represents Files from User Buckets which are accessible without Authentication.';
COMMENT ON COLUMN public.shared_files.file_id IS 'References the File within the User Bucket that is being shared.';
COMMENT ON COLUMN public.shared_files.user_id IS 'References the User that owns the Shared File and used for Bucket lookup.';

ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create Shared Files." ON public.shared_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own Shared Files. " ON public.shared_files
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their Shared Files." ON public.shared_files
    FOR DELETE USING (auth.uid() = user_id);

-- User Generated Content

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own Buckets." ON storage.buckets;
CREATE POLICY "Users can create their own Buckets." ON storage.buckets
    FOR INSERT WITH CHECK (id = CONCAT('ugc_', auth.uid()));

DROP POLICY IF EXISTS "Users can view their own Buckets." ON storage.buckets;
CREATE POLICY "Users can view their own Buckets." ON storage.buckets
    FOR SELECT USING (id = CONCAT('ugc_', auth.uid()));

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects REPLICA IDENTITY full;

DROP POLICY IF EXISTS "Users can upload their own Bucket Files." ON storage.objects;
CREATE POLICY "Users can upload their own Bucket Files." ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = CONCAT('ugc_', auth.uid()));

DROP POLICY IF EXISTS "Users can remove their own Bucket Files." ON storage.objects;
CREATE POLICY "Users can remove their own Bucket Files." ON storage.objects
    FOR DELETE USING (bucket_id = CONCAT('ugc_', auth.uid()));

DROP POLICY IF EXISTS "Users can view their own Bucket Files." ON storage.objects;
CREATE POLICY "Users can view their own Bucket Files." ON storage.objects
    FOR SELECT USING (bucket_id = CONCAT('ugc_', auth.uid()));

DROP POLICY IF EXISTS "Users can update their own Bucket Files." ON storage.objects;
CREATE POLICY "Users can update their own Bucket Files." ON storage.objects
    FOR UPDATE USING (bucket_id = CONCAT('ugc_', auth.uid()));

DROP FUNCTION IF EXISTS storage.entrycount(_bucket_id text, _folder text);
CREATE FUNCTION storage.entrycount(_bucket_id text, _folder text)
  RETURNS integer
  LANGUAGE plpgsql
AS $function$
DECLARE
  _count integer;
BEGIN
  SELECT COUNT(name), bucket_id
  FROM storage.objects
  WHERE array_to_string(storage.foldername(name), '/') = _folder INTO _count AND bucket_id = _bucket_id
  GROUP by bucket_id;

  RETURN _count;
END
$function$;

DROP FUNCTION IF EXISTS storage.pagecount(_bucket_id text, _folder text, _limit integer);
CREATE FUNCTION storage.pagecount(_bucket_id text, _folder text, _limit integer)
  RETURNS integer
  LANGUAGE plpgsql
AS $function$
DECLARE
  _count integer;
BEGIN
  SELECT storage.entrycount(_bucket_id, _folder) into _count;

  RETURN ceil(_count::numeric / _limit);
END
$function$;

DROP FUNCTION IF EXISTS public.folderpages(_folder text, _limit integer);
CREATE FUNCTION public.folderpages(_folder text, _limit integer)
  RETURNS integer
  LANGUAGE plpgsql
AS $function$
DECLARE
  _count integer;
BEGIN
  SELECT storage.pagecount(concat('ugc_'::text, auth.uid()), _folder, _limit) into _count;

  RETURN _count;
END
$function$;
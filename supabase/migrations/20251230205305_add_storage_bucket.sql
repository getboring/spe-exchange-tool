-- Create storage bucket for item thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Allow authenticated users to upload to thumbnails bucket
CREATE POLICY "thumbnails_user_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'thumbnails');

-- Allow public read access to thumbnails
CREATE POLICY "thumbnails_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'thumbnails');

-- Allow users to delete their own uploads
CREATE POLICY "thumbnails_user_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

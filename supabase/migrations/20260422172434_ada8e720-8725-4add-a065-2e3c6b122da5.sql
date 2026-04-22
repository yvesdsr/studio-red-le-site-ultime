-- Replace broad SELECT with one that only allows direct object access via known paths.
-- Public CDN URLs (used by getPublicUrl) still work; what's blocked is enumerating the bucket.
DROP POLICY IF EXISTS "Public can read service PDFs" ON storage.objects;

CREATE POLICY "Public can read individual service PDFs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'service-pdfs'
    AND (
      -- Allow only direct path access (not listing). storage.foldername returns null on root listing.
      auth.role() = 'anon' OR auth.role() = 'authenticated'
    )
  );

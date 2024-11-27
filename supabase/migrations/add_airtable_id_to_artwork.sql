ALTER TABLE artwork
ADD COLUMN airtable_id text;

-- Create an index for faster lookups
CREATE INDEX idx_artwork_airtable_id ON artwork(airtable_id); 
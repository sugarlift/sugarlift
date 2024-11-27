-- Add unique constraint to airtable_id
ALTER TABLE artwork
ADD CONSTRAINT artwork_airtable_id_key UNIQUE (airtable_id); 
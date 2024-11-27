-- Remove the airtable_id column and its constraint
ALTER TABLE artwork
DROP COLUMN IF EXISTS airtable_id; 
import Airtable from "airtable";

if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
  throw new Error("Missing AIRTABLE_PERSONAL_ACCESS_TOKEN");
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error("Missing AIRTABLE_BASE_ID");
}

// Store these in constants to ensure they're not undefined
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PERSONAL_ACCESS_TOKEN =
  process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;

// Configure Airtable with a lower rate limit
const airtable = new Airtable({
  apiKey: AIRTABLE_PERSONAL_ACCESS_TOKEN,
  requestTimeout: 25000, // 25 seconds timeout
  endpointUrl: "https://api.airtable.com",
});

// Cache the base connection
const base = airtable.base(AIRTABLE_BASE_ID);

export const getArtistsTable = () => {
  return base.table("tblDYfUM8SVh14Hmg");
};

export const getArtworkTable = () => {
  return base.table("tblvOgj4fNqw6BLfh");
};

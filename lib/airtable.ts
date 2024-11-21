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

const airtable = new Airtable({
  apiKey: AIRTABLE_PERSONAL_ACCESS_TOKEN,
});

export const getArtistsTable = () => {
  return airtable.base(AIRTABLE_BASE_ID).table("tblDYfUM8SVh14Hmg");
};

export const getArtworkTable = () => {
  return airtable.base(AIRTABLE_BASE_ID).table("tblj8MEqwAWKPnxmd");
};

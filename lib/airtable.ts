import Airtable from "airtable";

if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
  throw new Error("Missing AIRTABLE_PERSONAL_ACCESS_TOKEN");
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error("Missing AIRTABLE_BASE_ID");
}

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
});

export const getArtistsTable = () => {
  return airtable.base(process.env.AIRTABLE_BASE_ID).table("tblkYraa6YhVleHVu");
};

export const getArtworkTable = () => {
  return airtable.base(process.env.AIRTABLE_BASE_ID).table("tblj8MEqwAWKPnxmd");
};

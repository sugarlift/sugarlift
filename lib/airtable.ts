import Airtable from "airtable";

if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
  throw new Error("Missing AIRTABLE_PERSONAL_ACCESS_TOKEN");
}

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
});

export const getArtistsTable = () => {
  return airtable.table("tblkYraa6YhVleHVu"); // Artists table ID
};

export const getArtworkTable = () => {
  return airtable.table("tblj8MEqwAWKPnxmd"); // Replace with your actual Artwork table ID
};

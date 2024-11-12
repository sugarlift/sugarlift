import Airtable from "airtable";

if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
  throw new Error("Missing env.AIRTABLE_PERSONAL_ACCESS_TOKEN");
}
if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error("Missing env.AIRTABLE_BASE_ID");
}

export const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
  endpointUrl: "https://api.airtable.com",
}).base(process.env.AIRTABLE_BASE_ID);

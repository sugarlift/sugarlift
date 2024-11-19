"use server";

export async function incrementViewCount(
  firstName: string,
  lastName: string,
  currentCount: number | undefined,
  slug: string,
) {
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/artist-view`, {
    method: "POST",
    body: JSON.stringify({
      firstName,
      lastName,
      currentCount,
      slug,
    }),
  });
}

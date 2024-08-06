export const dynamic = "force-dynamic";

import LeaderboardClient from "./client";

async function getData() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/leaderboard`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export default async function LeaderboardPage() {
  const { allData, categories } = await getData();

  return (
    <LeaderboardClient
      initialData={allData}
      initialCategories={categories}
      initialTimestamp={new Date().toISOString()}
    />
  );
}

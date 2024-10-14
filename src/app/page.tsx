export const dynamic = "force-dynamic";

import LeaderboardClient from "./client";

const getData = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/leaderboard`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

const LeaderboardPage = async () => {
  const { allData } = await getData();

  return (
    <LeaderboardClient
      initialData={allData}
      initialTimestamp={new Date().toISOString()}
    />
  );
};

export default LeaderboardPage;

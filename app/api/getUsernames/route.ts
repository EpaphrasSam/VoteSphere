import { NextResponse } from "next/server";
import { getUsernamesByVotingPeriod } from "@/utils/actions/admin.action";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const votingPeriodId = url.searchParams.get("votingPeriodId");

  if (!votingPeriodId) {
    return NextResponse.json(
      { error: "Voting period ID is required" },
      { status: 400 }
    );
  }

  try {
    const usernames = await getUsernamesByVotingPeriod(votingPeriodId);
    return NextResponse.json({ usernames });
  } catch (error) {
    console.error("Error fetching usernames:", error);
    return NextResponse.json(
      { error: "Error fetching usernames" },
      { status: 500 }
    );
  }
}

import VotingDataForm from "@/components/forms/VotingDataForm";
import { VotingData } from "@/types/votingType";
import { getVotingPeriodsById } from "@/utils/actions/admin.action";
import React from "react";
import { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic";

type VotingPeriodsResult = VotingData | {} | { message: string };

export default async function VotingPeriods({
  searchParams,
}: {
  searchParams: { votingPeriodId: string };
}) {
  const votingPeriodId = searchParams.votingPeriodId;
  let votingPeriods: VotingPeriodsResult = {};
  let message = "";

  if (votingPeriodId) {
    const result = await getVotingPeriodsById(votingPeriodId);
    if ("message" in result) {
      message = result.message;
    } else {
      votingPeriods = result;
    }
  } else {
    votingPeriods = {};
  }

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <VotingDataForm votingData={votingPeriods} message={message} />
    </div>
  );
}

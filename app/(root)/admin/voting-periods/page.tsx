import VotingDataForm from "@/components/forms/VotingDataForm";
import { getVotingPeriodsById } from "@/utils/actions/admin.action";
import React from "react";
import { Toaster } from "react-hot-toast";

export default async function VotingPeriods({
  searchParams,
}: {
  searchParams: { votingPeriodId: string };
}) {
  const votingPeriodId = searchParams.votingPeriodId;
  let votingPeriods;
  if (votingPeriodId) {
    votingPeriods = await getVotingPeriodsById(votingPeriodId);
  } else {
    votingPeriods = {};
  }
  let message = "";

  if ("message" in votingPeriods) {
    message = votingPeriods.message;
  }

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <VotingDataForm votingData={votingPeriods} message={message} />
    </div>
  );
}

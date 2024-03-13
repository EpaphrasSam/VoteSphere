import VotingPeriodsTable from "@/components/tables/VotingPeriodsTable";
import { getAllVotingPeriods } from "@/utils/actions/admin.action";
import { Divider } from "@nextui-org/react";
import React from "react";
import { Toaster } from "react-hot-toast";

export default async function Admin() {
  let allVotingPeriods = await getAllVotingPeriods();
  let message = "";

  if ("message" in allVotingPeriods) {
    message = allVotingPeriods.message;
    allVotingPeriods = [];
  }

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <div className="text-2xl font-bold text-blue-600">Admin Dashboard</div>
      <Divider className="my-10" />
      {/* <VotingPeriodsTable votingPeriods={allVotingPeriods} message={message} /> */}
      <VotingPeriodsTable votingPeriods={allVotingPeriods} message={message} />
    </div>
  );
}

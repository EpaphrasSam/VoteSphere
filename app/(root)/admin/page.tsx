import VotingPeriodsTable from "@/components/tables/VotingPeriodsTable";
import VotingChart from "@/components/charts/VotingChart"; // Import the new chart component
import { getAllVotingPeriods } from "@/utils/actions/admin.action";
import { Divider } from "@nextui-org/react";
import React from "react";
import { Toaster } from "react-hot-toast";

export default async function Admin() {
  let allVotingPeriods = await getAllVotingPeriods();

  let message = "";
  let selectedVotingPeriod = null;

  if ("message" in allVotingPeriods) {
    message = allVotingPeriods.message;
    allVotingPeriods = [];
  } else {
    const currentPeriod = allVotingPeriods.find((period) => period.current);
    if (currentPeriod) {
      selectedVotingPeriod = { id: currentPeriod.id, name: currentPeriod.name };
    }
  }

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <div className="text-2xl font-bold text-blue-600">Admin Dashboard</div>
      <Divider className="my-10" />
      <VotingPeriodsTable votingPeriods={allVotingPeriods} message={message} />
      <Divider className="my-10" />
      {selectedVotingPeriod && (
        <div>
          <div className="text-2xl mb-4 text-center font-bold text-gray-600">
            {selectedVotingPeriod.name}
          </div>
          <VotingChart votingPeriodId={selectedVotingPeriod.id} />
        </div>
      )}
    </div>
  );
}

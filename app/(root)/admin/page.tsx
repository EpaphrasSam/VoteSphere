import VotingPeriodsTable from "@/components/tables/VotingPeriodsTable";
import VotingChart from "@/components/charts/VotingChart"; // Import the new chart component
import { getAllVotingPeriods } from "@/utils/actions/admin.action";
import { Divider } from "@nextui-org/react";
import React from "react";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { User } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const { user } = (await getServerSession(authOptions)) as {
    user: User;
  };

  if (user.adminLevel < 1) {
    return <div>Access denied. You must be an admin to view this page.</div>;
  }

  let allVotingPeriods = await getAllVotingPeriods();

  let message = "";

  if ("message" in allVotingPeriods) {
    message = allVotingPeriods.message;
    allVotingPeriods = [];
  } else {
    // If the user is a voting period admin, filter the voting periods
    if (user.adminLevel === 1) {
      allVotingPeriods = allVotingPeriods.filter(
        (period) => period.id === user.votingPeriodId
      );
    }
  }

  let selectedVotingPeriod = null;

  if (Array.isArray(allVotingPeriods)) {
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
      <VotingPeriodsTable
        votingPeriods={allVotingPeriods}
        message={message}
        showSelectButton={user.adminLevel === 2}
      />
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

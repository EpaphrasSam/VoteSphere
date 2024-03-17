import VotingAccordion from "@/components/accordions/VotingAccordion";
import InstructionsModal from "@/components/modals/InstructionsModal";
import {
  getVotedPeriodByUser,
  getVotingPeriods,
} from "@/utils/actions/votes.action";
import { authOptions } from "@/utils/auth";
import { Chip } from "@nextui-org/react";
import { getServerSession } from "next-auth";
import { IoIosWarning } from "react-icons/io";

export default async function Home() {
  const votingPeriods: any = await getVotingPeriods();

  const { user }: any = await getServerSession(authOptions);
  const hasUserVoted = await getVotedPeriodByUser(user?.id, votingPeriods?.id);
  const currentDate = new Date();

  const isTimeToVote = () => {
    const startDate = new Date(votingPeriods?.startTime);
    const endDate = new Date(votingPeriods?.endTime);

    if (currentDate < startDate) return "Not time to vote yet";
    if (currentDate > endDate) return "Voting time has passed";
    return "Time to vote";
  };

  return (
    <>
      <InstructionsModal />
      {hasUserVoted ? (
        <div className="flex flex-row items-center justify-center py-4">
          <Chip color="danger" startContent={<IoIosWarning />}>
            You have already voted
          </Chip>
        </div>
      ) : (
        isTimeToVote() !== "Time to vote" && (
          <div className="flex flex-row items-center justify-center py-4">
            <Chip color="danger" startContent={<IoIosWarning />}>
              {isTimeToVote()}
            </Chip>
          </div>
        )
      )}

      <VotingAccordion
        votingPeriods={votingPeriods}
        id={user?.id}
        username={user?.username}
        disabled={hasUserVoted || isTimeToVote() !== "Time to vote"}
        // disabled={false}
      />
    </>
  );
}

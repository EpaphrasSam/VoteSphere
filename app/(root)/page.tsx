import VotingAccordion from "@/components/accordions/VotingAccordion";
import InstructionsModal from "@/components/modals/InstructionsModal";
import { User } from "@/types/userType";
import {
  getVotedPeriodByUser,
  getVotingPeriods,
} from "@/utils/actions/votes.action";
import { authOptions } from "@/utils/auth";
import { Chip } from "@nextui-org/react";
import { getServerSession } from "next-auth";
import { IoIosWarning } from "react-icons/io";

export const revalidate = 'force-dynamic'

export default async function Home() {
  const { user } = (await getServerSession(authOptions)) as {
    user: User;
  };

  let votingPeriods = await getVotingPeriods(user.id);

  let message = "";

  if ("message" in votingPeriods) {
    message = votingPeriods.message;
  }

  if ("id" in votingPeriods) {
    const hasUserVoted = await getVotedPeriodByUser(user?.id, votingPeriods.id);
    const currentDate = new Date();

    const isTimeToVote = () => {
      if ("startDate" in votingPeriods) {
        const startDate = new Date(votingPeriods.startDate);
        const endDate = new Date(votingPeriods.endDate);

        if (currentDate < startDate) return "Not time to vote yet";
        if (currentDate > endDate) return "Voting time has passed";
        return "Time to vote";
      }
    };

    const timeToVote = () => {
      if (hasUserVoted || isTimeToVote() !== "Time to vote") {
        return true;
      }
      return false;
    };

    return (
      <>
        <InstructionsModal title={votingPeriods.name} />
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
          disabled={timeToVote()}
        />
      </>
    );
  } else {
    return (
      <div className="flex flex-row items-center justify-center py-4">
        <Chip color="danger" startContent={<IoIosWarning />}>
          {message}
        </Chip>
      </div>
    );
  }
}

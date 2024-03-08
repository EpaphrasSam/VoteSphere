"use server";

import prisma from "@/utils/prisma";
import { revalidatePath } from "next/cache";

export async function getVotingPeriods() {
  try {
    const [firstVotingPeriod] = await prisma.votingPeriod.findMany({
      take: 1,
      include: {
        positions: {
          include: {
            candidates: true,
          },
        },
      },
    });

    if (!firstVotingPeriod) {
      return [];
    }

    const formattedVotingPeriod = {
      id: firstVotingPeriod.id,
      name: firstVotingPeriod.name,
      startTime: firstVotingPeriod.startDate,
      endTime: firstVotingPeriod.endDate,
      positions: firstVotingPeriod.positions.map((position) => ({
        id: position.id,
        name: position.name,
        candidates: position.candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          image: candidate.image,
        })),
      })),
    };

    return formattedVotingPeriod;
  } catch (error) {
    return { message: "Error while fetching voting periods" };
  }
}

export async function takeVote(votingPeriod: any, userId: string) {
  try {
    const { positions, ...period } = votingPeriod;
    for (const position of positions) {
      for (const candidate of position.candidates) {
        if (candidate.value) {
          if (candidate.value === "taken") {
            await prisma.vote.create({
              data: {
                votingPeriodId: period.id,
                candidateId: candidate.id,
                positionId: position.id,
                isYes: null,
              },
            });
          } else {
            await prisma.vote.create({
              data: {
                votingPeriodId: period.id,
                candidateId: candidate.id,
                positionId: position.id,
                isYes: candidate.value,
              },
            });
          }
        }
      }
    }
    await prisma.userVotedPeriod.create({
      data: {
        votingPeriodId: period.id,
        userId: userId,
      },
    });
    revalidatePath("/");
    return { message: "Vote taken successfully" };
  } catch (error) {
    return { message: "Error while taking vote" };
  }
}

export async function getVotedPeriodByUser(
  userId: string,
  votingPeriodId: string
) {
  try {
    const votedPeriod = await prisma.userVotedPeriod.findFirst({
      where: {
        userId,
        votingPeriodId,
      },
    });
    if (votedPeriod) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return { message: "Error while fetching voted periods" };
  }
}

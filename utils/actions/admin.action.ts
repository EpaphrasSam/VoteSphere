"use server";

import { VotingData } from "@/types/votingType";
import prisma from "@/utils/prisma";
import { revalidatePath } from "next/cache";

export async function getAllVotingPeriods() {
  try {
    const allVotingPeriods = prisma.votingPeriod.findMany();
    return allVotingPeriods;
  } catch (error) {
    return {
      message: "Error in retrieving voting periods",
    };
  }
}

export async function getVotingPeriodsById(id: string) {
  try {
    const VotingPeriod = await prisma.votingPeriod.findFirst({
      where: {
        id: id,
        deleted: false,
      },
      include: {
        positions: {
          where: {
            deleted: false,
          },
          include: {
            candidates: {
              where: {
                deleted: false,
              },
            },
          },
        },
      },
    });

    if (!VotingPeriod) {
      return { message: "Voting period not found" };
    }

    const formattedVotingPeriod = {
      id: VotingPeriod.id,
      name: VotingPeriod.name,
      startTime: VotingPeriod.startDate,
      endTime: VotingPeriod.endDate,
      positions: VotingPeriod.positions.map((position) => ({
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

export async function createVotingPeriod(
  votingPeriodData: VotingData,
  positionsIds: string[],
  candidatesIds: string[]
) {
  try {
    if (positionsIds.length > 0 || candidatesIds.length > 0) {
      for (const positionId of positionsIds) {
        const existingPosition = await prisma.position.findUnique({
          where: { id: positionId },
        });
        if (existingPosition) {
          await prisma.position.update({
            where: { id: positionId },
            data: {
              deleted: true,
            },
          });
        }
      }

      for (const candidateId of candidatesIds) {
        const existingCandidate = await prisma.candidate.findUnique({
          where: { id: candidateId },
        });
        if (existingCandidate) {
          await prisma.candidate.update({
            where: { id: candidateId },
            data: {
              deleted: true,
            },
          });
        }
      }
    }

    const votingPeriod = await prisma.votingPeriod.upsert({
      where: {
        id: votingPeriodData.id ?? "id",
      },
      update: {
        name: votingPeriodData.name,
        startDate: votingPeriodData.startTime,
        endDate: votingPeriodData.endTime,
      },
      create: {
        name: votingPeriodData.name,
        startDate: votingPeriodData.startTime,
        endDate: votingPeriodData.endTime,
      },
    });

    for (const positionData of votingPeriodData.positions) {
      const position = await prisma.position.upsert({
        where: {
          id: positionData.id ?? "id",
        },
        update: {
          name: positionData.name,
        },
        create: {
          name: positionData.name,
          votingPeriodId: votingPeriod.id,
        },
      });

      for (const candidateData of positionData.candidates) {
        await prisma.candidate.upsert({
          where: {
            id: candidateData.id ?? "id",
          },
          update: {
            name: candidateData.name,
            image: candidateData.image,
          },
          create: {
            name: candidateData.name,
            image: candidateData.image,
            positionId: position.id,
            votingPeriodId: votingPeriod.id,
          },
        });
      }
    }

    revalidatePath(`/admin/voting-periods?${votingPeriod.id}`);

    return { message: "Voting period created/updated successfully" };
  } catch (error) {
    return { message: "Error while creating/updating voting period" };
  }
}

export async function selectVotingPeriod(id: string) {
  try {
    await prisma.votingPeriod.updateMany({
      data: {
        current: false,
      },
    });

    await prisma.votingPeriod.update({
      where: {
        id: id,
      },
      data: {
        current: true,
      },
    });

    revalidatePath(`/admin`);
    return { message: "Voting period selected successfully" };
  } catch (error) {
    return { message: "Error while deleting voting period" };
  }
}

// export async function unDeleteRecords() {
//   try {
//     await prisma.votingPeriod.updateMany({
//       data: {
//         deleted: false,
//       },
//     });

//     await prisma.position.updateMany({
//       data: {
//         deleted: false,
//       },
//     });

//     await prisma.candidate.updateMany({
//       data: {
//         deleted: false,
//       },
//     });

//     return { message: "Records undeleted successfully" };
//   } catch (error) {
//     return { message: "Error while undeleting records" };
//   }
// }

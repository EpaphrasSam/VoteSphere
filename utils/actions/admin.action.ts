"use server";

import { VotingData } from "@/types/votingType";
import prisma from "@/utils/prisma";
import { revalidatePath } from "next/cache";

export async function getAllVotingPeriods() {
  try {
    const allVotingPeriods = (await prisma.votingPeriod.findMany()).reverse();
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
      startDate: VotingPeriod.startDate,
      endDate: VotingPeriod.endDate,
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

export async function getVotingDataByPeriodId(id: string) {
  try {
    const votingPeriod = await prisma.votingPeriod.findFirst({
      where: { id, deleted: false },
      include: {
        positions: {
          include: {
            candidates: {
              where: {
                deleted: false,
              },
            },
          },
        },
        votes: true,
      },
    });

    if (!votingPeriod) {
      return { message: "Voting period not found" };
    }

    const data = {
      id: votingPeriod.id,
      name: votingPeriod.name,
      positions: votingPeriod.positions.map((position) => ({
        id: position.id,
        name: position.name,
        candidates: position.candidates.map((candidate) => {
          const votes = votingPeriod.votes.filter(
            (vote) => vote.candidateId === candidate.id
          );
          return {
            id: candidate.id,
            name: candidate.name,
            votes: votes.length,
            ...(votes.some((vote) => vote.isYes !== null) && {
              yes: votes.filter((vote) => vote.isYes === "yes").length,
              no: votes.filter((vote) => vote.isYes === "no").length,
            }),
          };
        }),
      })),
    };

    return data;
  } catch (error) {
    return { message: "Error fetching voting data" };
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
        startDate: votingPeriodData.startDate,
        endDate: votingPeriodData.endDate,
      },
      create: {
        name: votingPeriodData.name,
        startDate: votingPeriodData.startDate,
        endDate: votingPeriodData.endDate,
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

export async function associateUsersWithVotingPeriod(
  votingPeriodId: string,
  usernames?: string[]
) {
  try {
    let updateQuery: any = {
      where: {
        OR: [{ votingPeriodId: null }, { votingPeriodId: { isSet: false } }],
        adminLevel: 0, // Only update regular users
      },
      data: {
        votingPeriodId,
      },
    };

    // If usernames are provided, update only those users
    if (usernames && usernames.length > 0) {
      updateQuery.where.username = { in: usernames };
    }

    const result = await prisma.user.updateMany(updateQuery);

    revalidatePath("/admin"); // Revalidate the admin page to reflect changes

    return {
      message: "Users associated with voting period successfully",
      updatedCount: result.count,
    };
  } catch (error) {
    console.error("Error associating users with voting period:", error);
    return { message: "Error while associating users with voting period" };
  }
}

export async function getVotingStatistics(votingPeriodId: string) {
  try {
    const votingPeriod = await prisma.votingPeriod.findUnique({
      where: { id: votingPeriodId },
      include: {
        userVoted: {
          include: {
            user: {
              select: {
                name: true,
                username: true,
              },
            },
          },
          orderBy: {
            user: {
              name: "asc",
            },
          },
        },
      },
    });

    if (!votingPeriod) {
      return { message: "Voting period not found" };
    }

    const totalVotes = votingPeriod.userVoted.length;
    const votedUsers = votingPeriod.userVoted.map(
      (userVoted) => userVoted.user
    );

    return { totalVotes, votedUsers };
  } catch (error) {
    console.error("Error fetching voting statistics:", error);
    return { message: "Error fetching voting statistics" };
  }
}

export async function getUsernamesByVotingPeriod(votingPeriodId: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { votingPeriodId: votingPeriodId },
          { adminLevel: 2 },
          { votingPeriodId: null },
          { AND: [{ adminLevel: 1 }, { votingPeriodId: votingPeriodId }] },
        ],
      },
      select: {
        username: true,
      },
    });

    return users.map((user) => user.username);
  } catch (error) {
    console.error("Error fetching usernames:", error);
    return [];
  }
}

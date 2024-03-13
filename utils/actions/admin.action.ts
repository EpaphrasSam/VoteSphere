"use server";

import prisma from "@/utils/prisma";

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

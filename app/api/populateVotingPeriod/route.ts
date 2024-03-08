import prisma from "@/utils/prisma";
// import { votingPeriodData } from "@/lib/constants/index";

export async function POST(req: Request) {
  try {
    const votingPeriodData = await req.json();
    const votingPeriod = await prisma.votingPeriod.create({
      data: {
        name: votingPeriodData.name,
        startDate: votingPeriodData.date,
        endDate: votingPeriodData.endTime,
      },
    });

    for (const positionData of votingPeriodData.positions) {
      const position = await prisma.position.create({
        data: {
          name: positionData.name,
          votingPeriodId: votingPeriod.id,
        },
      });

      for (const candidateData of positionData.candidates) {
        await prisma.candidate.create({
          data: {
            name: candidateData.name,
            image: candidateData.image,
            positionId: position.id,
            votingPeriodId: votingPeriod.id,
          },
        });
      }
    }

    return Response.json("Success in PopulateVotingPeriod");
  } catch (error) {
    return Response.json("Error in PopulateVotingPeriod");
  }
}

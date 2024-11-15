import { NextRequest, NextResponse } from "next/server";
import { associateUsersWithVotingPeriod } from "@/utils/actions/admin.action";
import prisma from "@/utils/prisma";

export async function POST(req: NextRequest) {
  try {
    const { votingPeriodId, usernames } = await req.json();

    if (!votingPeriodId) {
      return NextResponse.json(
        { error: "Voting period ID is required" },
        { status: 400 }
      );
    }

    const result = await associateUsersWithVotingPeriod(
      votingPeriodId,
      usernames
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in associateUsers API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// export async function GET() {
//   try {
//     const result = await prisma.user.updateMany({
//       data: {
//         adminLevel: 0,
//       },
//     });

//     return NextResponse.json(
//       {
//         message: "All users' adminLevel changed to 0 successfully",
//         updatedCount: result.count,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error in changing adminLevel of users:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

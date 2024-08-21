import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const { username = "iensam", votingPeriodId } = await req.json();

    let user;
    if (votingPeriodId) {
      // For regular users
      user = await prisma.user.findFirst({
        where: { username, votingPeriodId },
      });
    } else {
      // For supreme admins
      user = await prisma.user.findFirst({
        where: { username, adminLevel: { gt: 1 } },
      });
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      username: user.username,
      password: newPassword,
      message: [
        `Hello ${user.name}`,
        `Your username is ${user.username} and your new password is ${newPassword}`,
        `Please login with these credentials and change your password.`,
      ],
    });
  } catch (error) {
    console.error("Error resetting credentials:", error);
    return NextResponse.json(
      {
        error: "Error resetting credentials",
      },
      { status: 500 }
    );
  }
}

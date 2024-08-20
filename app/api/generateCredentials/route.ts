import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/utils/prisma";
import { faker } from "@faker-js/faker";

export async function POST(req: Request) {
  try {
    const { name, votingPeriodId } = await req.json();

    if (!name || !votingPeriodId) {
      return NextResponse.json({
        error: "Name and voting period ID are required",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: { name, votingPeriodId },
    });

    let username = await generateUniqueUsername(name, votingPeriodId);
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          name,
          username,
          password: hashedPassword,
          votingPeriodId,
          adminLevel: 0,
        },
      });
    }

    return NextResponse.json({
      username,
      password,
      message: [
        `Hello ${name}`,
        `Your username is ${username} and password is ${password}`,
        `Use these credentials to login to the voting system for this voting period.`,
      ],
    });
  } catch (error) {
    console.error("Error creating/updating credentials:", error);
    return NextResponse.json({
      error: "Error creating/updating credentials",
    });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const request = await req.json();
    const { votingPeriodId } = request;
    const num = parseInt(url.searchParams.get("number") || "1", 10);

    if (!votingPeriodId) {
      return NextResponse.json({
        error: "Voting period ID is required",
      });
    }

    const credentials = [];

    for (let i = 0; i < num; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const initials = firstName[0].toLowerCase();
      const username = await generateUniqueUsername(
        initials,
        lastName.toLowerCase()
      );
      const password = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = {
        name,
        username,
        password,
      };

      await prisma.$transaction(async (prisma) => {
        await prisma.user.create({
          data: {
            name,
            username,
            password: hashedPassword,
            votingPeriodId,
          },
        });
      });

      credentials.push(user);
    }

    return NextResponse.json(credentials);
  } catch (error) {
    return NextResponse.json({
      error: "Error generating credentials",
    });
  }
}

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8);
}

async function generateUniqueUsername(name: string, votingPeriodId: string) {
  const names = name.replace(/-/g, " ").split(" ");
  const initials = names
    .slice(0, -1)
    .map((n: string) => n[0])
    .join("")
    .toLowerCase();
  const lastName = names[names.length - 1].toLowerCase().replace(/-/g, "");
  let username = initials + lastName;
  let suffix = 1;

  while (await prisma.user.findFirst({ where: { username, votingPeriodId } })) {
    username = initials + lastName + suffix;
    suffix++;
  }

  return username;
}

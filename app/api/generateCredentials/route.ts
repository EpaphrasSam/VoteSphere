import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/utils/prisma";
import { faker } from "@faker-js/faker";

export async function POST(req: Request) {
  try {
    const request = await req.json();
    const { name, username: providedUsername } = request;

    if (!name) {
      return NextResponse.json({
        error: "Name is required",
      });
    }

    if (providedUsername) {
      const existingUser = await prisma.user.findUnique({
        where: { username: providedUsername },
      });

      if (!existingUser) {
        return NextResponse.json({
          error: "Username does not exist",
        });
      }

      if (existingUser.name !== name) {
        return NextResponse.json({
          error: "Username does not match the provided name",
        });
      }

      const password = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { username: providedUsername },
        data: { password: hashedPassword },
      });

      return NextResponse.json({
        message: `Your new password is ${password}`,
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: { name },
    });

    if (existingUser) {
      return NextResponse.json({
        error: "Name already exists",
      });
    }

    const names = name.split(" ");
    const initials = names
      .slice(0, -1)
      .map((n: any) => n[0])
      .join("")
      .toLowerCase();
    const lastName = names[names.length - 1].toLowerCase();
    let newUsername = initials + lastName;

    let suffix = 1;
    while (await prisma.user.findUnique({ where: { username: newUsername } })) {
      newUsername = initials + lastName + suffix;
      suffix++;
    }

    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        username: newUsername,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: [
        `Hello ${name}`,
        `Your username is ${newUsername} and password is ${password}`,
        `Use the credentials to login to the voting system to vote.`,
      ],
    });
  } catch (error) {
    return NextResponse.json({
      error: "Error creating credentials",
    });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const num = parseInt(url.searchParams.get("number") || "1", 10);

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

async function generateUniqueUsername(initials: string, lastName: string) {
  let username = initials + lastName;
  let suffix = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = initials + lastName + suffix;
    suffix++;
  }

  return username;
}

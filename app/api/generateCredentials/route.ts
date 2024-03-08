import bcrypt from "bcrypt";
import prisma from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const request = await req.json();
    const { name } = request;

    if (!name) {
      return Response.json({
        error: "Name is required",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        name,
      },
    });

    if (existingUser) {
      return Response.json({
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
    const password = Math.random().toString(36).slice(-8);
    // const password = "12345678";
    const username = initials + lastName;

    const hashedPassword = await bcrypt.hash(password, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
      },
    });

    return Response.json({
      message: [
        `Hello ${name}`,
        `Your username is ${username} and password is ${password}`,
        `Use the credentials to login to the voting system to vote.`,
      ],
    });
  } catch (error) {
    return Response.json({
      error: "Error creating credentials",
    });
  }
}

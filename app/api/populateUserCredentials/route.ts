import prisma from "@/utils/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const request = await req.json();
    for (const user of request) {
      const hashedPassword = await bcrypt.hash(user.PASSWORD, 10);
      await prisma.user.create({
        data: {
          name: user.NAME.replace(/\s+/g, " "),
          username: user.USERNAME,
          password: hashedPassword,
        },
      });
    }
    return Response.json({ success: true });
  } catch (err) {
    console.log(err);
  }
}

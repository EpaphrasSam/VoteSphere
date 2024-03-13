import React from "react";
import Image from "next/image";
import LoginForm from "@/components/forms/LoginForm";
import Voting from "@/public/voting.png";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";

async function Login() {
  const session = await getServerSession();

  if (session) {
    redirect("/");
  }
  return (
    <div className="flex flex-1 h-screen flex-row items-center justify-center">
      <Toaster position="top-center" />
      <Image src={Voting} alt="Voting" fill />
      <LoginForm />
    </div>
  );
}

export default Login;

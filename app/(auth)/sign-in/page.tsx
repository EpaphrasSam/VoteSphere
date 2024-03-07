import React from "react";
import { Image } from "@nextui-org/react";
import LoginForm from "@/components/forms/LoginForm";

function Login() {
  return (
    <div className="flex flex-row items-center justify-center w-full">
      <Image src="voting.png" alt="Voting" width={400} height={400} />
      <div>
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;

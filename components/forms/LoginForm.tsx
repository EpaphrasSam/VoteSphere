"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
} from "@nextui-org/react";
import {
  FaArrowRight,
  FaRegEye,
  FaRegEyeSlash,
  FaRegUser,
} from "react-icons/fa";
import { FiLock } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const schema = z.object({
  username: z.string().nonempty("Username is required"),
  password: z.string().nonempty("Password is required"),
});

const LoginForm = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isLoading, setIsLoading] = useState(false);
  const error = useSearchParams().get("error");
  const router = useRouter();
  const toastId = React.useRef<string | null>(null);

  useEffect(() => {
    if (error && !toastId.current) {
      toastId.current = toast.error(error, {
        duration: 3000,
      });
      router.replace("/sign-in");
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await signIn("credentials", {
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card isBlurred className="flex flex-col items-center justify-center p-10">
      <CardHeader className="items-center justify-center text-3xl font-bold">
        Login
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardBody>
          <div className="flex flex-col gap-6">
            <Input
              {...register("username")}
              label="Username"
              labelPlacement="outside"
              placeholder="Enter your username"
              startContent={<FaRegUser size={20} color="gray" />}
              errorMessage={errors.username?.message as any}
            />
            <Input
              {...register("password")}
              label="Password"
              placeholder="Enter your password"
              labelPlacement="outside"
              startContent={<FiLock size={20} color="gray" />}
              errorMessage={errors.password?.message as any}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <FaRegEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <FaRegEye className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
            />
          </div>
        </CardBody>
        <CardFooter className="items-center justify-center">
          <Button
            fullWidth
            endContent={<FaArrowRight size={20} />}
            isLoading={isLoading}
            type="submit"
            color="primary"
            size="lg"
            className="justify-between"
          >
            Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;

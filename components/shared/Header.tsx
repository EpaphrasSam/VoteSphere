"use client";

import React from "react";
import { Navbar, NavbarContent, Link, Image, Button } from "@nextui-org/react";
import { signOut } from "next-auth/react";
import { IoIosLogOut } from "react-icons/io";
import { FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";

const Header = ({ role }: any) => {
  const navigate = useRouter();
  return (
    <Navbar maxWidth="full" shouldHideOnScroll isBordered>
      <div className="flex items-center gap-2 max-w-full">
        <Link href="/">
          <Image
            src="/ksb.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <p className="font-bold text-inherit ml-1">Voting System</p>
        </Link>
      </div>

      <NavbarContent as="div" justify="end">
        {/* @ts-ignore */}
        {role && role === "admin" && (
          <Button
            size="sm"
            startContent={<FiUser size={20} />}
            color="primary"
            onClick={() => navigate.push("/admin")}
          >
            <span className="max-sm:hidden text-sm">Admin</span>
          </Button>
        )}
        <Button
          size="sm"
          startContent={<IoIosLogOut size={20} />}
          onClick={() => signOut()}
          color="danger"
        >
          <span className="max-sm:hidden text-sm">Logout</span>
        </Button>
      </NavbarContent>
    </Navbar>
  );
};

export default Header;

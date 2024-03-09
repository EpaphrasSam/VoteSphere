"use client";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Link,
  Image,
  Button,
} from "@nextui-org/react";
import { signOut } from "next-auth/react";

const Header = () => {
  return (
    <Navbar maxWidth="full" shouldHideOnScroll isBordered>
      <NavbarBrand className="flex items-center gap-2 max-w-full">
        <Link href="/">
          <Image
            src="/ksb.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <p className="font-bold text-inherit ml-1">KSB Voting System</p>
        </Link>
      </NavbarBrand>

      <NavbarContent as="div" justify="end">
        <Button onClick={() => signOut()} color="danger">
          Logout
        </Button>
      </NavbarContent>
    </Navbar>
  );
};

export default Header;

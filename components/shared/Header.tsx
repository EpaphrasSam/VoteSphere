"use client";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenuToggle,
  Link,
  Image,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  DropdownSection,
  NavbarMenu,
  Button,
} from "@nextui-org/react";
import { signOut, useSession } from "next-auth/react";
import { FaSignOutAlt, FaUser, FaUserShield } from "react-icons/fa";
import { usePathname } from "next/navigation";

const Header = () => {
  const { data: session }: any = useSession();
  const pathname = usePathname();

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

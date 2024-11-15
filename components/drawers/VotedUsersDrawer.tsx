"use client";

import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  ListItemIcon,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FiEye } from "react-icons/fi";
import { Button } from "@nextui-org/react";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

interface VotedUsersDrawerProps {
  votedUsers: { name: string; username: string }[];
}

const VotedUsersDrawer: React.FC<VotedUsersDrawerProps> = ({ votedUsers }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setIsOpen(open);
    };

  return (
    <>
      <Button
        isIconOnly
        color="default"
        variant="light"
        startContent={<FiEye size={20} className="text-gray-700" />}
        onClick={toggleDrawer(true)}
      />
      <Drawer anchor="right" open={isOpen} onClose={toggleDrawer(false)}>
        <div className="w-[300px] p-4">
          <div className="flex items-center justify-between">
            <div />
            <Typography
              variant="h6"
              className="text-center text-gray-700 font-bold text-lg"
            >
              Voted Users
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <List>
            {votedUsers.map((user, index) => (
              <ListItem key={index}>
                <ListItemIcon className="min-w-0">
                  <FiberManualRecordIcon
                    fontSize="inherit"
                    className="text-gray-500 text-[9px]"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${user.name}`}
                  className="text-sm text-gray-700 font-semibold ml-2"
                />
              </ListItem>
            ))}
          </List>
        </div>
      </Drawer>
    </>
  );
};

export default VotedUsersDrawer;

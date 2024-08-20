"use client";

import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
import React, { useEffect } from "react";

const InstructionsModal = ({
  title,
  name,
}: {
  title: string;
  name: string;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    onOpen();
  }, []);
  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      size="xl"
      hideCloseButton={true}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 items-center justify-center">
          Instructions
        </ModalHeader>
        <ModalBody>
          <p>Welcome, {name}!</p>
          <p>
            In this voting system, you will be able to cast your votes for
            various positions for {title.replace(/Election/, "").trim()}.
          </p>
          <p>
            Please review the candidates carefully before making your choices.
          </p>
          <p>
            Once you have made your selections, review them again to ensure that
            you have voted correctly, then click the &quot;Confirm&quot; button
            to submit your votes.
          </p>
        </ModalBody>
        <ModalFooter className="flex justify-center">
          <Button color="success" onClick={onClose}>
            Begin Voting
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InstructionsModal;

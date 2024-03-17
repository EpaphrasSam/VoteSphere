"use client";

import React from "react";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  ModalBody,
} from "@nextui-org/react";

type ConfirmationModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isSubmitting: boolean;
  message: string;
  title?: string;
};

const CustomConfirmationModal = ({
  isOpen,
  onConfirm,
  onClose,
  isSubmitting,
  message,
  title = "Confirmation",
}: ConfirmationModalProps) => {
  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={onClose}
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
        <ModalHeader className="flex items-center justify-center">
          {title}
        </ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={isSubmitting} color="primary" onClick={onConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomConfirmationModal;

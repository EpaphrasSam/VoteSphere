"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Divider,
} from "@nextui-org/react";
import Image from "next/image";
import { Checkbox } from "@nextui-org/react";
import VotingSummaryModal from "../modals/VotingSummaryModal";
import toast, { Toaster } from "react-hot-toast";
import { takeVote } from "@/utils/actions/votes.action";
import Profile from "@/public/profile.png";
import { Candidate, Position, VotingData } from "@/types/votingType";

interface VotingAccordionProps {
  votingPeriods: VotingData;
  id: string;
  disabled: boolean;
}

const VotingAccordion = ({
  votingPeriods,
  id,
  disabled,
}: VotingAccordionProps) => {
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (positionIndex: any, candidateIndex: any) => {
    setSelectedCandidates((prevState: any) => {
      if (prevState[positionIndex] === candidateIndex) {
        const updatedState = { ...prevState };
        delete updatedState[positionIndex];
        return updatedState;
      }

      return {
        ...prevState,
        [positionIndex]: candidateIndex,
      };
    });
  };

  const isDisabled = () => {
    return (
      Object.keys(selectedCandidates).length ===
      votingPeriods?.positions?.length
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { positions, ...period } = votingPeriods;
      const updatedPositions = positions.map(
        (position: any, positionIndex: any) => {
          const updatedCandidates = position.candidates.map(
            (candidate: any, candidateIndex: any) => {
              if (position.candidates.length === 1) {
                return {
                  ...candidate,
                  value:
                    selectedCandidates[
                      positionIndex as keyof typeof selectedCandidates
                    ],
                };
              } else {
                return selectedCandidates[
                  positionIndex as keyof typeof selectedCandidates
                ] === candidateIndex
                  ? { ...candidate, value: "taken" }
                  : { ...candidate };
              }
            }
          );

          return {
            ...position,
            candidates: updatedCandidates,
          };
        }
      );

      const updateVotingPeriod = { ...period, positions: updatedPositions };
      const response = await takeVote(updateVotingPeriod, id);
      if (response.message === "Vote taken successfully") {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
      setIsOpen(false);
      setSelectedCandidates({});
    }
  };

  if (!votingPeriods || Object.keys(votingPeriods).length === 0) {
    return (
      <div className="flex text-center pt-10 justify-center items-center text-3xl font-bold">
        No voting periods available
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <div className="font-bold uppercase text-3xl text-center py-4">
        {votingPeriods.name}
      </div>
      <div className="flex justify-between pb-6">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Start Date & Time</span>{" "}
          <span className="font-semibold text-xl max-sm:text-lg">
            {new Date(votingPeriods.startDate).toLocaleString([], {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">End Date & Time</span>{" "}
          <span className="font-semibold text-xl max-sm:text-lg">
            {new Date(votingPeriods.endDate).toLocaleString([], {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <Divider orientation="horizontal" />
      {votingPeriods.positions && votingPeriods.positions.length > 0 ? (
        <Accordion
          selectionMode="multiple"
          defaultExpandedKeys={votingPeriods.positions.map((_: any, i: any) =>
            i.toString()
          )}
          isDisabled={disabled}
          variant="splitted"
          className="my-4"
        >
          {votingPeriods.positions.map(
            (position: Position, positionIndex: number) => (
              <AccordionItem
                key={positionIndex}
                aria-label={`Accordion ${positionIndex + 1}`}
                title={position.name}
              >
                <div className="flex flex-row items-center justify-evenly flex-wrap pt-4">
                  {position.candidates.map(
                    (candidate: Candidate, candidateIndex: number) => (
                      <div
                        key={candidateIndex}
                        className={`flex flex-col items-center justify-center p-2 `}
                      >
                        <Avatar
                          src={candidate.image || ""}
                          alt={candidate.name}
                          className="w-52 h-52"
                          size="lg"
                        />
                        <div className="py-2 text-center">{candidate.name}</div>
                        {position.candidates.length === 1 ? (
                          <div className="flex gap-4">
                            <Checkbox
                              color="success"
                              isSelected={
                                selectedCandidates[
                                  positionIndex as keyof typeof selectedCandidates
                                ] === "yes"
                              }
                              onChange={() =>
                                handleCheckboxChange(positionIndex, "yes")
                              }
                            >
                              Yes
                            </Checkbox>
                            <Checkbox
                              color="danger"
                              isSelected={
                                selectedCandidates[
                                  positionIndex as keyof typeof selectedCandidates
                                ] === "no"
                              }
                              onChange={() =>
                                handleCheckboxChange(positionIndex, "no")
                              }
                            >
                              No
                            </Checkbox>
                          </div>
                        ) : (
                          <Checkbox
                            color="success"
                            isSelected={
                              selectedCandidates[
                                positionIndex as keyof typeof selectedCandidates
                              ] === candidateIndex
                            }
                            onChange={() =>
                              handleCheckboxChange(
                                positionIndex,
                                candidateIndex
                              )
                            }
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
              </AccordionItem>
            )
          )}
        </Accordion>
      ) : (
        <div>No positions available for this voting period</div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          disabled={!isDisabled() || disabled}
          color={!isDisabled() || disabled ? "default" : "primary"}
          onClick={() => setIsOpen(true)}
        >
          Next
        </Button>
      </div>

      {isOpen && (
        <VotingSummaryModal
          isOpen={isOpen}
          onConfirm={() => handleSubmit()}
          onClose={() => setIsOpen(false)}
          isSubmitting={isSubmitting}
          position={votingPeriods.positions}
          selectedCandidates={selectedCandidates}
        />
      )}
    </div>
  );
};

export default VotingAccordion;

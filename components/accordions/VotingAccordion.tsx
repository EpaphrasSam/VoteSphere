"use client";

import React, { useState } from "react";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import Image from "next/image";
import { Checkbox } from "@nextui-org/react";
import VotingSummaryModal from "../modals/VotingSummaryModal";
import toast, { Toaster } from "react-hot-toast";
import { takeVote } from "@/utils/actions/votes.action";
import Profile from "@/public/profile.png";

type Candidate = {
  name: string;
  image: string;
};

type Position = {
  name: string;
  candidates: Candidate[];
};

type VotingPeriodData = {
  name: string;
  startTime: Date;
  endTime: Date;
  positions: Position[];
};

interface VotingAccordionProps {
  votingPeriods: VotingPeriodData[];
}

const VotingAccordion = ({ votingPeriods, id, disabled }: any) => {
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

  if (!votingPeriods || votingPeriods.length === 0 || votingPeriods.message) {
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
        <span className="font-semibold text-xl">
          {new Date(votingPeriods.startTime).toLocaleDateString()}
        </span>
        <span className="font-semibold text-xl">
          {new Date(votingPeriods.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          -
          {new Date(votingPeriods.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

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
                <div className="flex justify-center">
                  {position.candidates.map(
                    (candidate: Candidate, candidateIndex: number) => (
                      <div
                        key={candidateIndex}
                        className={`flex flex-col items-center justify-center p-2 ${
                          position.candidates.length === 1 ? "w-1/3" : "w-full"
                        }`}
                      >
                        <Image
                          src={candidate.image || Profile}
                          alt={candidate.name}
                          width={400}
                          height={400}
                          className="rounded-full"
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

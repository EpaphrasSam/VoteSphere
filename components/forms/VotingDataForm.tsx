"use client";

import { Candidate, Position, VotingData } from "@/types/votingType";
import { Button, Card, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import moment from "moment";
import Image from "next/image";
import Profile from "@/public/profile.png";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { TiTickOutline } from "react-icons/ti";
import { HiRefresh } from "react-icons/hi";
import { createVotingPeriod } from "@/utils/actions/admin.action";
import CustomConfirmationModal from "../modals/CustomConfirmationModal";
import { UploadButton, UploadDropzone } from "@/utils/uploadthing";

interface VotingDataFormProps {
  votingData: VotingData | {};
  message: string;
}

const VotingDataForm = ({ votingData, message }: VotingDataFormProps) => {
  const toastId = useRef<string | null>(null);
  const navigate = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (message !== "" && !toastId.current) {
      toastId.current = toast.error(message, { duration: 3000 });
      navigate.push("/admin/voting-periods");
    }
  }, [message]);

  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    startTime: Date;
    endTime: Date;
  }>({
    id: (votingData as VotingData)?.id || undefined,
    name: (votingData as VotingData)?.name || "",
    startTime: new Date((votingData as VotingData)?.startTime || new Date()),
    endTime: new Date((votingData as VotingData)?.endTime || new Date()),
  });

  const [positions, setPositions] = useState<Position[]>(
    (votingData as VotingData)?.positions || []
  );

  useEffect(() => {
    setFormData({
      id: (votingData as VotingData)?.id || undefined,
      name: (votingData as VotingData)?.name || "",
      startTime: new Date((votingData as VotingData)?.startTime || new Date()),
      endTime: new Date((votingData as VotingData)?.endTime || new Date()),
    });

    setPositions((votingData as VotingData)?.positions || []);
  }, [votingData]);

  const handlePositionChange = (index: number, name: string) => {
    const newPositions = [...positions];
    newPositions[index].name = name;
    setPositions(newPositions);
  };

  const addPosition = () => {
    const newPosition: Position = {
      name: "",
      candidates: [],
      isEditing: true,
    };
    setPositions([...positions, newPosition]);
  };

  const confirmPositionEdit = (index: number) => {
    const newPositions = positions.map((position, posIndex) => {
      if (index === posIndex) {
        return { ...position, isEditing: false };
      }
      return position;
    });
    setPositions(newPositions);
  };

  const editPosition = (index: number) => {
    const newPositions = positions.map((position, posIndex) => {
      if (index === posIndex) {
        return { ...position, isEditing: true };
      }
      return position;
    });
    setPositions(newPositions);
  };

  const removePosition = (index: number) => {
    const newPositions = [...positions];
    newPositions.splice(index, 1);
    setPositions(newPositions);
  };

  const handleCandidateChange = (
    positionIndex: number,
    candidateIndex: number,
    newName: string
  ) => {
    const updatedPositions = [...positions];
    updatedPositions[positionIndex].candidates[candidateIndex].name = newName;
    setPositions(updatedPositions);
  };

  const handleCandidateImageChange = (
    positionIndex: number,
    candidateIndex: number,
    newImageUrl: string
  ) => {
    const updatedPositions = [...positions];
    updatedPositions[positionIndex].candidates[candidateIndex].image =
      newImageUrl;
    setPositions(updatedPositions);
  };

  const addCandidate = (positionIndex: number) => {
    const newCandidate: Candidate = {
      name: "",
      image: null,
      isEditing: true,
    };

    const updatedPositions = positions.map((position, index) => {
      if (index === positionIndex) {
        return {
          ...position,
          candidates: [...position.candidates, newCandidate],
        };
      }
      return position;
    });

    setPositions(updatedPositions);
  };

  const confirmCandidateEdit = (
    positionIndex: number,
    candidateIndex: number
  ) => {
    const updatedPositions = positions.map((position, posIndex) => {
      if (posIndex === positionIndex) {
        return {
          ...position,
          candidates: position.candidates.map((candidate, candIndex) => {
            if (candIndex === candidateIndex) {
              return { ...candidate, isEditing: false };
            }
            return candidate;
          }),
        };
      }
      return position;
    });

    setPositions(updatedPositions);
  };

  const toggleCandidateEdit = (
    positionIndex: number,
    candidateIndex: number
  ) => {
    const updatedPositions = positions.map((position, posIndex) => {
      if (posIndex === positionIndex) {
        return {
          ...position,
          candidates: position.candidates.map((candidate, candIndex) => {
            if (candIndex === candidateIndex) {
              return { ...candidate, isEditing: !candidate.isEditing };
            }
            return candidate;
          }),
        };
      }
      return position;
    });

    setPositions(updatedPositions);
  };

  const removeCandidate = (positionIndex: number, candidateIndex: number) => {
    const updatedPositions = positions.map((position, posIndex) => {
      if (posIndex === positionIndex) {
        const updatedCandidates = position.candidates.filter(
          (_, candIndex) => candIndex !== candidateIndex
        );
        return {
          ...position,
          candidates: updatedCandidates,
        };
      }
      return position;
    });

    setPositions(updatedPositions);
  };

  const resetData = () => {
    setFormData(votingData as VotingData);
    setPositions((votingData as VotingData)?.positions || []);
  };

  function extractDeletedIds(
    originalPositions: Position[],
    positionsWithoutIsEditing: Position[]
  ): {
    positionsIds: string[];
    candidatesIds: string[];
  } {
    const positionsIds: string[] = originalPositions
      .filter((position) => {
        return !positionsWithoutIsEditing.some((p) => p.id === position.id);
      })
      .map((position) => position.id) as string[];

    const candidatesIds: string[] = originalPositions.flatMap((position) => {
      const currentCandidates: Candidate[] =
        positionsWithoutIsEditing.find((p) => p.id === position.id)
          ?.candidates || [];
      return position.candidates
        .filter(
          (candidate: Candidate) =>
            !currentCandidates.some((c) => c.id === candidate.id)
        )
        .map((candidate: Candidate) => candidate.id!) as string[];
    });

    return {
      positionsIds,
      candidatesIds,
    };
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const positionsWithoutIsEditing = positions.map((position) => {
        const { isEditing, ...restOfPosition } = position;
        const candidatesWithoutIsEditing = position.candidates.map(
          (candidate) => {
            const { isEditing: candidateIsEditing, ...restOfCandidate } =
              candidate;
            return restOfCandidate;
          }
        );
        return { ...restOfPosition, candidates: candidatesWithoutIsEditing };
      });
      const data = { ...formData, positions: positionsWithoutIsEditing };
      let deletedPositionIds: string[] = [];
      let deletedCandidateIds: string[] = [];
      if (Object.keys(votingData || {}).length !== 0) {
        const { positionsIds, candidatesIds } = extractDeletedIds(
          (votingData as VotingData)?.positions,
          positionsWithoutIsEditing
        );
        deletedPositionIds = positionsIds;
        deletedCandidateIds = candidatesIds;
      }
      const response = await createVotingPeriod(
        data,
        deletedPositionIds,
        deletedCandidateIds
      );
      if (response.message === "Voting period created/updated successfully") {
        toast.success(response.message);
        isDisabled();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
      setModalOpen(false);
    }
  };

  const isDisabled = (): boolean => {
    const emptyStringValues = formData.name.trim() === "";

    const editingValues = positions.some((position) => position.isEditing);

    const positionWithEmptyName = positions.some(
      (position) => position.name.trim() === ""
    );

    const candidateEditingValues = positions.some((position) =>
      position.candidates.some((candidate) => {
        const isEmptyName = candidate.name.trim() === "";
        const isEditing = candidate.isEditing;
        return isEmptyName || isEditing;
      })
    );

    const formDataWithoutIsEditing = {
      ...formData,
      positions: positions.map((position) => {
        const { isEditing, ...restOfPosition } = position;
        const candidatesWithoutIsEditing = position.candidates.map(
          (candidate) => {
            const { isEditing: candidateIsEditing, ...restOfCandidate } =
              candidate;
            return restOfCandidate;
          }
        );
        return { ...restOfPosition, candidates: candidatesWithoutIsEditing };
      }),
    };

    const isDifferentFromInitialData =
      JSON.stringify(formDataWithoutIsEditing) === JSON.stringify(votingData);

    return (
      emptyStringValues ||
      positions.some((position) =>
        Object.values(position).some(
          (value) =>
            typeof value === "string" && value !== "" && value.trim() === ""
        )
      ) ||
      editingValues ||
      positionWithEmptyName ||
      candidateEditingValues ||
      isDifferentFromInitialData
    );
  };

  return (
    <div>
      <Toaster position="top-center" />
      <div className="text-center text-3xl font-bold">Election Details</div>
      <div className="flex justify-end py-4">
        <HiRefresh
          size={20}
          className="cursor-pointer hover:opacity-50 transition-all duration-100 ease-in-out"
          onClick={resetData}
        />
      </div>
      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          labelPlacement="outside"
          variant="underlined"
          color="primary"
          placeholder="Enter Voting Name"
          className="col-span-1"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <div className="col-span-1 grid grid-cols-2 gap-4 max-sm:flex max-sm:flex-col max-sm:gap-4">
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DemoContainer components={["DateTimePicker"]}>
              <DateTimePicker
                label="Start Date"
                value={moment(formData.startTime) || null}
                onChange={(e: any) =>
                  setFormData({ ...formData, startTime: new Date(e) })
                }
              />
            </DemoContainer>
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DemoContainer components={["DateTimePicker"]}>
              <DateTimePicker
                label="End Date"
                value={moment(formData.endTime) || null}
                onChange={(e: any) =>
                  setFormData({ ...formData, endTime: new Date(e) })
                }
              />
            </DemoContainer>
          </LocalizationProvider>
        </div>
      </div>
      <div>
        <div className="flex gap-2 items-center justify-center py-6">
          <span className="text-2xl font-bold">Positions</span>
          <span
            className="text-sm text-blue-500 hover:underline cursor-pointer transition-all duration-100 ease-in-out
                     hover:underline-offset-4 hover:text-blue-700"
            onClick={addPosition}
          >
            Add Position
          </span>
        </div>

        {positions.map((position, positionIndex) => (
          <Card key={positionIndex} className="mb-4 p-6">
            {position.isEditing ? (
              <div className="flex gap-2 items-center">
                <Input
                  variant="underlined"
                  color="primary"
                  value={position.name}
                  onChange={(e) =>
                    handlePositionChange(positionIndex, e.target.value)
                  }
                  placeholder="Enter Position Name"
                />
                <TiTickOutline
                  size={28}
                  color="blue"
                  onClick={() => confirmPositionEdit(positionIndex)}
                  className="cursor-pointer hover:opacity-50 transition-all duration-100 ease-in-out"
                />
                <FiTrash2
                  size={24}
                  color="red"
                  onClick={() => removePosition(positionIndex)}
                  className="cursor-pointer hover:opacity-50 transition-all duration-100 ease-in-out"
                />
              </div>
            ) : (
              <>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold text-lg">{position.name}</span>
                  <FiEdit
                    size={20}
                    color="gray"
                    onClick={() => editPosition(positionIndex)}
                    className="cursor-pointer hover:opacity-50 transition-all duration-100 ease-in-out"
                  />
                  <FiTrash2
                    size={20}
                    color="red"
                    onClick={() => removePosition(positionIndex)}
                    className="cursor-pointer hover:opacity-50 transition-all duration-100 ease-in-out"
                  />
                  <div
                    className="text-sm text-blue-500 hover:underline cursor-pointer transition-all duration-100 ease-in-out
                     hover:underline-offset-4 hover:text-blue-700"
                    onClick={() => addCandidate(positionIndex)}
                  >
                    Add Candidate
                  </div>
                </div>

                <div className="flex flex-row items-center justify-evenly flex-wrap pt-4">
                  {position.candidates.map((candidate, candidateIndex) => (
                    <div key={candidate.id || candidateIndex} className="m-2">
                      {candidate.isEditing ? (
                        <div className="flex flex-col justify-evenly gap-4 items-center">
                          <Input
                            variant="underlined"
                            label="Name"
                            placeholder="Enter Candidate Name"
                            labelPlacement="outside"
                            value={candidate.name}
                            onChange={(e) =>
                              handleCandidateChange(
                                positionIndex,
                                candidateIndex,
                                e.target.value
                              )
                            }
                          />
                          <UploadDropzone
                            endpoint="imageUploader"
                            onClientUploadComplete={(res) => {
                              handleCandidateImageChange(
                                positionIndex,
                                candidateIndex,
                                res[0].url
                              );
                            }}
                            onUploadError={(error: Error) => {
                              toast.error(error.message);
                            }}
                            content={{
                              uploadIcon({ ready }) {
                                return ready && candidate.image !== "" ? (
                                  <Image
                                    src={candidate.image || Profile}
                                    alt={candidate.name}
                                    width={100}
                                    height={100}
                                    className="rounded-full"
                                  />
                                ) : (
                                  "Loading..."
                                );
                              },
                            }}
                          />
                          <div className="flex gap-2 items-center">
                            <TiTickOutline
                              size={30}
                              color="blue"
                              className="cursor-pointer hover:opacity-50 transition-all duration-100 ease-in-out"
                              onClick={() =>
                                confirmCandidateEdit(
                                  positionIndex,
                                  candidateIndex
                                )
                              }
                            />
                            <FiTrash2
                              className="cursor-pointer hover:opacity-50 transition-all duration-100 ease-in-out"
                              size={20}
                              color="red"
                              onClick={() =>
                                removeCandidate(positionIndex, candidateIndex)
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Image
                            src={candidate.image || Profile}
                            alt={candidate.name}
                            width={150}
                            height={150}
                            className="rounded-full"
                          />
                          <div className="py-2 text-center">
                            {candidate.name}
                          </div>
                          <div className="mt-2 flex gap-2 items-start">
                            <FiEdit
                              className="cursor-pointer hover:opacity-50 transition-all duration-100 ease-in-out"
                              size={20}
                              onClick={() =>
                                toggleCandidateEdit(
                                  positionIndex,
                                  candidateIndex
                                )
                              }
                            />
                            <FiTrash2
                              className="cursor-pointer hover:opacity-50 transition-all duration-100 ease-in-out"
                              size={20}
                              color="red"
                              onClick={() =>
                                removeCandidate(positionIndex, candidateIndex)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          isLoading={isSubmitting}
          disabled={isDisabled()}
          onClick={() => setModalOpen(true)}
          color={isDisabled() ? "default" : "success"}
        >
          Submit
        </Button>
      </div>

      {modalOpen && (
        <CustomConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          message="Are you sure you want to create/update this voting?"
          onConfirm={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default VotingDataForm;

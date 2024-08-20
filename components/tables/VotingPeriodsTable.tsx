"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  Input,
  ModalHeader,
  ModalBody,
  ModalContent,
  Tooltip,
} from "@nextui-org/react";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { generateVoteReport } from "@/utils/actions/votes.action";
import { utils, writeFile, read } from "xlsx";
import { FiEdit3, FiPlus } from "react-icons/fi";
import { TfiCheckBox } from "react-icons/tfi";
import { FaUserPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { selectVotingPeriod } from "@/utils/actions/admin.action";
import CustomConfirmationModal from "../modals/CustomConfirmationModal";
import { useDropzone } from "react-dropzone";

type votingPeriods = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  current: Boolean;
};

interface VotingPeriodsProp {
  votingPeriods: votingPeriods[];
  message: string;
  showSelectButton: boolean;
}

const VotingPeriodsTable = ({
  votingPeriods,
  message,
  showSelectButton,
}: VotingPeriodsProp) => {
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCredentials, setIsGeneratingCredentials] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const toastId = useRef<string | null>(null);
  const navigate = useRouter();
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [randomCredentialCount, setRandomCredentialCount] = useState(1);
  const [credentialMode, setCredentialMode] = useState<
    "upload" | "generate" | null
  >(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "xlsx") {
        setUploadedFile(file);
        // toast.success("XLSX file uploaded successfully");
      } else {
        toast.error("Please upload a valid XLSX file");
        setUploadedFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/xlsx": [".xlsx"],
    },
  });

  useEffect(() => {
    if (message !== "" && !toastId.current) {
      toastId.current = toast.error(message, {
        duration: 3000,
      });
    }
  }, [message]);

  const selectedVotingPeriodId = useMemo(() => {
    const currentPeriod = votingPeriods.find(
      (period) => period.current === true
    );
    return currentPeriod ? currentPeriod.id : "";
  }, [votingPeriods]);

  const pages = Math.ceil(votingPeriods?.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return votingPeriods?.slice(start, end);
  }, [page, votingPeriods]);

  const generateVoteReports = async (id: string) => {
    try {
      setIsDownloading(true);
      const response: any = await generateVoteReport(id);

      if (!response.message) {
        const workbook = utils.book_new();
        const worksheet = utils.aoa_to_sheet([]);

        const startDate = new Date(response.startDate).toLocaleString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const endDate = new Date(response.endDate).toLocaleString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        worksheet["B1"] = {
          v: "VOTING REPORT",
        };
        worksheet["B2"] = { v: response.name };
        worksheet["B3"] = {
          v: `Start Date & Time: ${startDate}, End Date & Time: ${endDate}`,
        };

        const tableColumns = ["Position", "Name", "Votes", "Percentage"];
        const excelRows = [tableColumns];

        response.positions.forEach((position: any) => {
          position.candidates.forEach((candidate: any) => {
            let totalVotes;
            let totalPercentage;

            if (typeof candidate.votes !== "undefined") {
              totalVotes = candidate.votes;

              const sumOfAllCandidatesVotes = position.candidates.reduce(
                (acc: any, currCandidate: any) => {
                  return acc + (currCandidate.votes || 0);
                },
                0
              );

              totalPercentage = (totalVotes / sumOfAllCandidatesVotes) * 100;
            } else {
              totalVotes = (candidate.yes || 0) + (candidate.no || 0);
              totalPercentage =
                totalVotes === 0
                  ? 0
                  : ((candidate.yes || 0) / totalVotes) * 100;
            }

            const row = [
              position.name,
              candidate.name,
              typeof candidate.votes !== "undefined"
                ? candidate.votes
                : `YES- ${candidate.yes || 0}   NO- ${candidate.no || 0}`,
              `${totalPercentage.toFixed(2)}%`,
            ];
            excelRows.push(row);
          });
        });

        utils.sheet_add_json(worksheet, excelRows, {
          origin: "A5",
          skipHeader: true,
        });

        const headerRow = excelRows[0];

        const maxLengths = headerRow.map((_, colIndex) => {
          return Math.max(
            ...excelRows.map((row) => {
              const cellValue = row[colIndex];
              return cellValue !== null && cellValue !== undefined
                ? cellValue.toString().length
                : 0;
            })
          );
        });

        worksheet["!cols"] = maxLengths.map((maxLen) => ({
          wch: maxLen + 2,
        }));

        utils.book_append_sheet(workbook, worksheet, "Voting Report");
        writeFile(workbook, `${response.name} Report.xlsx`);
      } else {
        toast.error(response.message || "Error while generating report");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const isEmpty = votingPeriods.length === 0;

  const onConfirm = async () => {
    if (id) {
      try {
        setIsSubmitting(true);
        const response = await selectVotingPeriod(id);
        if (response.message === "Voting period selected successfully") {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Error while selecting voting period");
      } finally {
        setIsSubmitting(false);
        setModalOpen(false);
      }
    }
  };

  const handleSelectVotingPeriod = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await selectVotingPeriod(id);
      if (response.message === "Voting period selected successfully") {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error while selecting voting period");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateRandomCredentials = async () => {
    try {
      setIsGeneratingCredentials(true);
      const response = await fetch(
        `/api/generateCredentials?number=${randomCredentialCount}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ votingPeriodId: selectedVotingPeriodId }),
        }
      );
      const credentials = await response.json();
      if (credentials.error) {
        toast.error(credentials.error);
      } else {
        downloadCredentialsAsExcel(credentials, "Random_Credentials.xlsx");
        toast.success(
          "Random credentials generated and downloaded successfully"
        );
      }
    } catch (error) {
      toast.error("Error generating random credentials");
    } finally {
      setIsGeneratingCredentials(false);
    }
  };

  const handleCSVUpload = async () => {
    if (!uploadedFile) return;
    try {
      setIsGeneratingCredentials(true);
      const workbook = read(await uploadedFile.arrayBuffer(), {
        type: "buffer",
      });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(sheet);

      if (jsonData.length === 0) {
        toast.error("No data found in the uploaded XLSX file");
        return;
      }

      const allHaveName = jsonData.every((row: any) =>
        row.hasOwnProperty("Name")
      );
      if (!allHaveName) {
        toast.error(
          "All rows in the uploaded XLSX file must have a 'Name' field"
        );
        return;
      }

      const credentials = await Promise.all(
        jsonData.map(async (row: any) => {
          const response = await fetch("/api/generateCredentials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: row.Name,
              votingPeriodId: selectedVotingPeriodId,
            }),
          });
          return response.json();
        })
      );

      const updatedWorkbook = utils.book_new();
      const updatedSheet = utils.json_to_sheet([
        ...jsonData.map((row: any, index: number) => ({
          ...row,
          Username: credentials[index].username,
          Password: credentials[index].password,
        })),
      ]);
      utils.book_append_sheet(updatedWorkbook, updatedSheet, "Credentials");
      writeFile(updatedWorkbook, "Updated_Credentials.xlsx");
      toast.success("Credentials generated and appended to XLSX successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error generating credentials from XLSX");
    } finally {
      setIsGeneratingCredentials(false);
      setModalOpen(false);
    }
  };

  const downloadCredentialsAsExcel = (credentials: any[], filename: string) => {
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(credentials);
    utils.book_append_sheet(workbook, worksheet, "Credentials");
    writeFile(workbook, filename);
  };

  return (
    <>
      <div className="flex justify-between mb-6">
        <Button
          startContent={<FiPlus size={20} className="max-[400px]:hidden" />}
          color="primary"
          onClick={() => navigate.push("/admin/voting-periods")}
        >
          Create New Election
        </Button>

        <Dropdown>
          <DropdownTrigger>
            <Button
              isLoading={isDownloading}
              startContent={
                <PiMicrosoftExcelLogo
                  size={20}
                  className="max-[400px]:hidden"
                />
              }
              color="success"
              variant="solid"
            >
              Generate Report
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Dynamic Actions" items={items}>
            {(item) => (
              <DropdownItem
                key={item.id}
                onClick={() => generateVoteReports(item.id)}
              >
                {item.name}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>

      <Table
        aria-label="Voting Period Table"
        selectedKeys={[selectedVotingPeriodId!]}
        color="primary"
        selectionMode="single"
        bottomContent={
          pages > 1 && (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          )
        }
        classNames={{
          table: isEmpty ? "min-h-[400px]" : "",
        }}
      >
        <TableHeader>
          <TableColumn key="name">Name</TableColumn>
          <TableColumn key="start_date">Start Date</TableColumn>
          <TableColumn key="end_date">End Date</TableColumn>
          <TableColumn key="action">Action</TableColumn>
        </TableHeader>

        {isEmpty ? (
          <TableBody emptyContent={"No voting periods found."}>{[]}</TableBody>
        ) : (
          <TableBody items={items} aria-colspan={3}>
            {(item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  {new Date(item.startDate).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  {new Date(item.endDate).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <FiEdit3
                      size={20}
                      className="hover:opacity-50 cursor-pointer"
                      onClick={() =>
                        navigate.push(
                          `/admin/voting-periods?votingPeriodId=${item.id}`
                        )
                      }
                    />
                    <TfiCheckBox
                      size={20}
                      className="hover:opacity-50 cursor-pointer"
                      onClick={() => {
                        setId(item.id);
                        if (item.id !== selectedVotingPeriodId) {
                          setModalOpen(true);
                        }
                      }}
                    />
                    <FaUserPlus
                      size={20}
                      className="hover:opacity-50 cursor-pointer"
                      onClick={() => {
                        setIsCredentialModalOpen(true);
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        )}
      </Table>
      {modalOpen && (
        <CustomConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          message="Are you sure you want to select this voting?"
          onConfirm={onConfirm}
          isSubmitting={isSubmitting}
        />
      )}
      <Modal
        isOpen={isCredentialModalOpen}
        onClose={() => {
          setIsCredentialModalOpen(false);
          setCredentialMode(null);
          setUploadedFile(null);
        }}
      >
        <ModalContent>
          <ModalHeader>Generate Credentials</ModalHeader>
          <ModalBody className="p-6">
            <div className="flex justify-evenly mb-4">
              <Button
                onClick={() => setCredentialMode("upload")}
                color={credentialMode === "upload" ? "primary" : "default"}
              >
                Upload XLSX
              </Button>
              <Button
                onClick={() => setCredentialMode("generate")}
                color={credentialMode === "generate" ? "primary" : "default"}
              >
                Generate Random
              </Button>
            </div>
            {credentialMode === "upload" && (
              <div
                {...getRootProps()}
                className="border-2 border-dashed p-4 text-center"
              >
                <input {...getInputProps()} />

                {uploadedFile ? (
                  <p className="font-bold text-blue-500">
                    {" "}
                    {uploadedFile.name}
                  </p>
                ) : isDragActive ? (
                  <p>Drop the XLSX file here ...</p>
                ) : (
                  <p>Drag & drop a XLSX file here, or click to select a file</p>
                )}
              </div>
            )}
            {credentialMode === "generate" && (
              <Input
                type="number"
                label="Number of random credentials"
                value={randomCredentialCount.toString()}
                onChange={(e) =>
                  setRandomCredentialCount(parseInt(e.target.value, 10))
                }
              />
            )}
            {credentialMode && (
              <Button
                onClick={
                  credentialMode === "upload"
                    ? handleCSVUpload
                    : handleGenerateRandomCredentials
                }
                disabled={
                  credentialMode === "upload"
                    ? !uploadedFile
                    : randomCredentialCount <= 0
                }
                color={
                  (credentialMode === "upload" && uploadedFile) ||
                  (credentialMode === "generate" && randomCredentialCount > 0)
                    ? "primary"
                    : "default"
                }
                isLoading={isGeneratingCredentials}
              >
                Submit
              </Button>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default VotingPeriodsTable;

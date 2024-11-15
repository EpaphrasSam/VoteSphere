import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Tabs,
  Tab,
  Input,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { useDropzone } from "react-dropzone";
import { utils, writeFile, read } from "xlsx";
import toast from "react-hot-toast";

interface CredentialGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVotingPeriodId: string;
}

const CredentialGenerationModal: React.FC<CredentialGenerationModalProps> = ({
  isOpen,
  onClose,
  selectedVotingPeriodId,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [randomCredentialCount, setRandomCredentialCount] = useState(1);
  const [fullName, setFullName] = useState("");
  const [forgotUsername, setForgotUsername] = useState("");
  const [isGeneratingCredentials, setIsGeneratingCredentials] = useState(false);
  const [usernames, setUsernames] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "xlsx") {
        setUploadedFile(file);
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
    }
  };

  const handleGenerateRandomCredentials = async () => {
    try {
      setIsGeneratingCredentials(true);
      console.log("Generating random credentials");
      const response = await fetch(
        `/api/generateCredentials?number=${randomCredentialCount}&votingPeriodId=${selectedVotingPeriodId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
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

  const handleGenerateUserCredentials = async () => {
    try {
      setIsGeneratingCredentials(true);
      const response = await fetch("/api/generateCredentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          votingPeriodId: selectedVotingPeriodId,
        }),
      });
      const credential = await response.json();
      if (credential.error) {
        toast.error(credential.error);
      } else {
        downloadCredentialsAsExcel([credential], `${fullName}_Credential.xlsx`);
        toast.success("Credential generated and downloaded successfully");
      }
    } catch (error) {
      toast.error("Error generating credential");
    } finally {
      setIsGeneratingCredentials(false);
    }
  };

  const handleForgotCredentials = async () => {
    try {
      setIsGeneratingCredentials(true);
      const response = await fetch("/api/forgotCredentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: forgotUsername,
          votingPeriodId: selectedVotingPeriodId,
        }),
      });
      const credential = await response.json();
      if (credential.error) {
        toast.error(credential.error);
      } else {
        downloadCredentialsAsExcel(
          [credential],
          `${forgotUsername}_NewCredential.xlsx`
        );
        toast.success("New credential generated and downloaded successfully");
      }
    } catch (error) {
      toast.error("Error resetting credentials");
    } finally {
      setIsGeneratingCredentials(false);
    }
  };

  const downloadCredentialsAsExcel = (credentials: any[], filename: string) => {
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(credentials);
    utils.book_append_sheet(workbook, worksheet, "Credentials");
    writeFile(workbook, filename);
  };

  const fetchUsernames = async () => {
    try {
      const response = await fetch(
        `/api/getUsernames?votingPeriodId=${selectedVotingPeriodId}`
      );
      const data = await response.json();
      setUsernames(data.usernames);
    } catch (error) {
      console.error("Error fetching usernames:", error);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchUsernames();
    }
  }, [isOpen, selectedVotingPeriodId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" placement="center">
      <ModalContent>
        <ModalHeader className="text-lg text-gray-700 text-center flex items-center justify-center font-bold">
          Generate Credentials
        </ModalHeader>
        <ModalBody>
          <Tabs fullWidth variant="underlined" color="primary">
            <Tab key="upload" title="Upload">
              <div
                {...getRootProps()}
                className="border-2 border-dashed p-4 text-center"
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <p className="font-bold text-blue-500">{uploadedFile.name}</p>
                ) : isDragActive ? (
                  <p>Drop the XLSX file here ...</p>
                ) : (
                  <p>Drag & drop a XLSX file here, or click to select a file</p>
                )}
              </div>
              <div className=" mt-6 flex justify-center items-center">
                <Button
                  onClick={handleCSVUpload}
                  disabled={!uploadedFile}
                  color={uploadedFile ? "primary" : "default"}
                  isLoading={isGeneratingCredentials}
                >
                  Upload and Generate
                </Button>
              </div>
            </Tab>
            <Tab key="generate" title="Generate">
              <Tabs fullWidth variant="underlined" color="primary">
                <Tab key="random" title="Random">
                  <Input
                    type="number"
                    label="Number of random credentials"
                    value={randomCredentialCount.toString()}
                    onChange={(e) =>
                      setRandomCredentialCount(parseInt(e.target.value, 10))
                    }
                  />
                  <div className=" mt-6 flex justify-center items-center">
                    <Button
                      onClick={handleGenerateRandomCredentials}
                      disabled={randomCredentialCount <= 0}
                      color={randomCredentialCount > 0 ? "primary" : "default"}
                      isLoading={isGeneratingCredentials}
                    >
                      Generate Random Credentials
                    </Button>
                  </div>
                </Tab>
                <Tab key="user" title="User">
                  <Input
                    type="text"
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <div className=" mt-6 flex justify-center items-center">
                    <Button
                      onClick={handleGenerateUserCredentials}
                      disabled={!fullName}
                      color={fullName ? "primary" : "default"}
                      isLoading={isGeneratingCredentials}
                    >
                      Generate User Credential
                    </Button>
                  </div>
                </Tab>
              </Tabs>
            </Tab>
            <Tab key="forgot" title="Forgot">
              <Autocomplete
                label="Username"
                onSelectionChange={(value) =>
                  setForgotUsername(value as string)
                }
              >
                {usernames.map((username) => (
                  <AutocompleteItem key={username} value={username}>
                    {username}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
              <div className=" mt-6 flex justify-center items-center">
                <Button
                  onClick={handleForgotCredentials}
                  disabled={!forgotUsername}
                  color={forgotUsername ? "primary" : "default"}
                  isLoading={isGeneratingCredentials}
                >
                  Reset Credentials
                </Button>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CredentialGenerationModal;

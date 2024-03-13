"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Tooltip,
} from "@nextui-org/react";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { generateVoteReport } from "@/utils/actions/votes.action";
import { utils, writeFile } from "xlsx";
import { FiEdit3 } from "react-icons/fi";

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
}

const VotingPeriodsTable = ({ votingPeriods, message }: VotingPeriodsProp) => {
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [filteredVotingPeriods, setFilteredVotingPeriods] = useState<
    votingPeriods[]
  >([]);
  const toastId = useRef<string | null>(null);

  useEffect(() => {
    if (message !== "" && !toastId.current) {
      toastId.current = toast.error(message, {
        duration: 3000,
      });
    }
  }, [message]);

  useEffect(() => {
    if (votingPeriods.length > 0) {
      setFilteredVotingPeriods(votingPeriods);
    }
  }, [votingPeriods]);

  const selectedVotingPeriodId = useMemo(() => {
    const currentPeriod = votingPeriods.find(
      (period) => period.current === true
    );
    return currentPeriod ? currentPeriod.id : "";
  }, [votingPeriods]);

  const pages = Math.ceil(filteredVotingPeriods?.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredVotingPeriods?.slice(start, end);
  }, [page, filteredVotingPeriods]);

  const generateVoteReports = async () => {
    try {
      setIsDownloading(true);
      const response: any = await generateVoteReport(selectedVotingPeriodId);

      if (!response.message) {
        const workbook = utils.book_new();
        const worksheet = utils.aoa_to_sheet([]);

        const date = new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(new Date(response.startTime));

        const startTime = new Date(response.startTime)
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(/ /g, "")
          .toLowerCase();

        const endTime = new Date(response.endTime)
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(/ /g, "")
          .toLowerCase();

        worksheet["C1"] = {
          v: "VOTING REPORT",
        };
        worksheet["C2"] = { v: response.name };
        worksheet["B3"] = { v: date + ", " + startTime + " - " + endTime };

        const tableColumns = [
          "Position",
          "Name",
          "Votes (Yes)",
          "Votes (No)",
          "Percentage",
        ];
        const excelRows = [tableColumns];

        response.positions.forEach((position: any) => {
          position.candidates.forEach((candidate: any) => {
            const totalVotes = (candidate.yes || 0) + (candidate.no || 0);
            const totalPercentage =
              totalVotes === 0 ? 0 : ((candidate.yes || 0) / totalVotes) * 100;

            const row = [
              position.name,
              candidate.name,
              candidate.yes || 0,
              candidate.no || 0,
              `${totalPercentage.toFixed(2)}%`,
            ];
            excelRows.push(row);
          });
        });

        utils.sheet_add_json(worksheet, excelRows, {
          origin: "A5",
          skipHeader: true,
        });

        const maxLengths = tableColumns.map((column: any) => {
          return Math.max(
            ...excelRows.map((row: any) => row[column]?.toString().length || 0),
            column.length
          );
        });

        worksheet["!cols"] = maxLengths.map((maxLen: any) => ({
          wch: maxLen + 2,
        }));

        utils.book_append_sheet(workbook, worksheet, "Voting Report");
        writeFile(workbook, "Voting Report.xlsx");
      } else {
        toast.error(response.message || "Error while generating report");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const isEmpty = filteredVotingPeriods.length === 0;

  return (
    <>
      <div className="flex items-end justify-end mb-6">
        <Button
          isLoading={isDownloading}
          startContent={<PiMicrosoftExcelLogo size={20} />}
          color="success"
          onClick={generateVoteReports}
        >
          Generate Report
        </Button>
      </div>
      <Table
        aria-label="Voting Period Table"
        selectedKeys={[selectedVotingPeriodId]}
        color="default"
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
          <TableColumn key="date">Date</TableColumn>
          <TableColumn key="start_time">Start Time</TableColumn>
          <TableColumn key="end_time">End Time</TableColumn>
          <TableColumn key="action">Action</TableColumn>
        </TableHeader>

        {isEmpty ? (
          <TableBody emptyContent={"No schedule for this exams."}>
            {[]}
          </TableBody>
        ) : (
          <TableBody items={items} aria-colspan={3}>
            {(item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  {new Date(item.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(item.startDate)
                    .toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    .replace(/ /g, "")
                    .toLowerCase()}
                </TableCell>
                <TableCell>
                  {new Date(item.endDate)
                    .toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    .replace(/ /g, "")
                    .toLowerCase()}
                </TableCell>
                <TableCell>
                  {/* <Tooltip content="Edit"> */}
                  <FiEdit3
                    size={20}
                    className="hover:opacity-50 cursor-pointer"
                  />
                  {/* </Tooltip> */}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        )}
      </Table>
    </>
  );
};

export default VotingPeriodsTable;

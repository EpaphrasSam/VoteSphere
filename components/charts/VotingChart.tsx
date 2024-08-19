"use client";

import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useSWR from "swr";
import { Spinner } from "@nextui-org/react";
import { getVotingDataByPeriodId } from "@/utils/actions/admin.action";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const fetcher = async (votingPeriodId: string) => {
  const result = await getVotingDataByPeriodId(votingPeriodId);
  if ("message" in result) {
    throw new Error(result.message);
  }
  return result;
};

// Function to generate a random color that hasn't been used yet
const getRandomColor = (usedColors: Set<string>) => {
  let color;
  do {
    const r = Math.floor(Math.random() * 200); // Limit to 200 to ensure visibility
    const g = Math.floor(Math.random() * 200); // Limit to 200 to ensure visibility
    const b = Math.floor(Math.random() * 200); // Limit to 200 to ensure visibility
    color = `rgba(${r}, ${g}, ${b}, 0.8)`;
  } while (usedColors.has(color));
  usedColors.add(color);
  return color;
};

const VotingChart = ({ votingPeriodId }: { votingPeriodId: string }) => {
  const { data, error, isLoading } = useSWR(votingPeriodId, fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center">
        <Spinner />
      </div>
    );

  if (error || !data) return null;

  const labels = data.positions.map((position: any) => position.name);
  const datasets: any = [];
  const usedColors = new Set<string>();

  data.positions.forEach((position: any, index: number) => {
    position.candidates.forEach((candidate: any) => {
      const isYesNoVote =
        candidate.yes !== undefined && candidate.no !== undefined;
      const randomColor = getRandomColor(usedColors);
      const paleColor = randomColor.replace("0.8", "0.4"); // Pale version of the random color

      if (isYesNoVote) {
        datasets.push({
          label: `${candidate.name} (Yes)`,
          data: labels.map((label: string) =>
            label === position.name ? candidate.yes : 0
          ),
          backgroundColor: randomColor,
          borderColor: randomColor.replace("0.8", "1"),
          borderWidth: 1,
        });
        datasets.push({
          label: `${candidate.name} (No)`,
          data: labels.map((label: string) =>
            label === position.name ? candidate.no : 0
          ),
          backgroundColor: paleColor,
          borderColor: paleColor.replace("0.4", "1"),
          borderWidth: 1,
        });
      } else {
        datasets.push({
          label: `${candidate.name}`,
          data: labels.map((label: string) =>
            label === position.name ? candidate.votes : 0
          ),
          backgroundColor: randomColor,
          borderColor: randomColor.replace("0.8", "1"),
          borderWidth: 1,
        });
      }
    });
  });

  const chartData = {
    labels,
    datasets,
  };

  return <Bar data={chartData} />;
};

export default VotingChart;

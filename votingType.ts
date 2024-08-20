export type VotingData = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  current: boolean;
  deleted: boolean;
  positions: Position[]; // Added positions property
};

type Position = {
  id: string;
  name: string;
  // Add other properties as needed
};

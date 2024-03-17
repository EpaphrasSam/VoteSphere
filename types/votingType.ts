export interface Candidate {
  id?: string;
  name: string;
  image: string | null;
  isEditing?: boolean;
}

export interface Position {
  id?: string;
  name: string;
  candidates: Candidate[];
  isEditing?: boolean;
}

export type VotingData = {
  id?: string;
  name: string;
  startTime: Date;
  endTime: Date;
  positions: Position[];
};

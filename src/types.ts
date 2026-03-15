export interface Experience {
  id: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  refinedText?: string;
}

export interface SOPDraft {
  introduction: string;
  academicBackground: string;
  experience: string;
  conclusion: string;
}

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
  attachment?: {
    name: string;
    type: string;
  };
}

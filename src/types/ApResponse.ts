export interface ApiMessage {
  content: string;
  createdAt: string;
}

export interface ApResp {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: ApiMessage[];
}

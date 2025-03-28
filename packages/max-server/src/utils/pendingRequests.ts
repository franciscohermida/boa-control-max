/// <reference types="node" />

export type PendingRequest = {
  timeout: NodeJS.Timeout;
  input: any;
  output: any;
  completed: boolean;
  eventStream?: any;
};

export const pendingRequests = new Map<string, PendingRequest>();

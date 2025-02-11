import { EventEmitter } from "events";

export interface SyncProgress {
  type: "artists" | "artwork";
  current: number;
  total: number;
  status: "processing" | "complete" | "error";
  message?: string;
}

class ProgressEmitter extends EventEmitter {
  private static instance: ProgressEmitter;

  private constructor() {
    super();
  }

  static getInstance(): ProgressEmitter {
    if (!ProgressEmitter.instance) {
      ProgressEmitter.instance = new ProgressEmitter();
    }
    return ProgressEmitter.instance;
  }

  emitProgress(progress: SyncProgress) {
    this.emit("progress", progress);
  }
}

export const progressEmitter = ProgressEmitter.getInstance();

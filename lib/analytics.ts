"use client";

import { sendGTMEvent } from "@next/third-parties/google";

export type AnalyticsEvent =
  | {
      event: "task_created";
      task_id: string;
      column_id: string;
      column_name: string;
      has_due_date: boolean;
      has_tag: boolean;
    }
  | {
      event: "task_moved";
      task_id: string;
      from_column_id: string;
      from_column_name: string;
      to_column_id: string;
      to_column_name: string;
    }
  | {
      event: "task_deleted";
      task_id: string;
      column_id: string;
      column_name: string;
    };

export function pushDataLayerEvent(event: AnalyticsEvent) {
  sendGTMEvent(event);
}

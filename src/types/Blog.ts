import { type Metadata } from "showdown";

export type Blog = {
  metadata: Metadata;
  content: string;
  id: string;
};

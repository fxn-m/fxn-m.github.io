export type TabOverflowItem = {
  id: string;
  properties?: {
    Added?: { date?: { start?: string | null } | null };
    Author?: { select?: { name?: string } | null };
    Categories?: { multi_select?: { name?: string }[] };
    Name?: { title?: { plain_text?: string }[] };
    "Read Time"?: { number?: number | null };
    Summary?: { rich_text?: { plain_text?: string }[] };
    URL?: { url?: string | null };
  };
};

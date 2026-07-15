import { z } from "zod";

const CategoriesPropertiesSchema = z
  .object({
    Categories: z
      .object({
        multi_select: z.object({
          options: z.array(z.object({ name: z.string() })),
        }),
      })
      .loose(),
  })
  .loose();

export const parseCategoriesProperty = (properties: unknown): string[] | null => {
  const parsed = CategoriesPropertiesSchema.safeParse(properties);
  return parsed.success
    ? parsed.data.Categories.multi_select.options.map(({ name }) => name)
    : null;
};

export const extractPropertyConfig = (response: unknown): Record<string, unknown> | null => {
  if (typeof response !== "object" || response === null || !("properties" in response)) {
    return null;
  }
  const properties = response.properties;
  return typeof properties === "object" && properties !== null
    ? (properties as Record<string, unknown>)
    : null;
};

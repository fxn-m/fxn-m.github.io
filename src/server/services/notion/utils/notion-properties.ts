import { z } from "zod"

const CategoryOptionSchema = z.object({
  name: z.string()
})

const CategoriesPropertySchema = z
  .object({
    multi_select: z.object({
      options: z.array(CategoryOptionSchema)
    })
  })
  .loose()

const CategoriesPropertiesSchema = z
  .object({
    Categories: CategoriesPropertySchema
  })
  .loose()

export const parseCategoriesProperty = (
  properties: unknown
): string[] | null => {
  const result = CategoriesPropertiesSchema.safeParse(properties)
  if (!result.success) {
    return null
  }

  return result.data.Categories.multi_select.options.map(
    (option) => option.name
  )
}

export const extractPropertyConfig = (
  response: unknown
): Record<string, unknown> | null => {
  if (
    typeof response === "object" &&
    response !== null &&
    "properties" in response
  ) {
    const candidate = (response as { properties: unknown }).properties
    if (candidate && typeof candidate === "object") {
      return candidate as Record<string, unknown>
    }
  }

  return null
}

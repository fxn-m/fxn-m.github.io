import type {
  PageObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse
} from "@notionhq/client/build/src/api-endpoints"

export type NotionResponse =
  | PageObjectResponse
  | PartialPageObjectResponse
  | PartialDatabaseObjectResponse

export const isPageObjectResponse = (
  item: NotionResponse
): item is PageObjectResponse => {
  return "properties" in item
}

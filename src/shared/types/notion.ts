import type {
  DataSourceObjectResponse,
  PageObjectResponse,
  PartialDataSourceObjectResponse,
  PartialPageObjectResponse
} from "@notionhq/client/build/src/api-endpoints"

export type NotionResponse =
  | PageObjectResponse
  | PartialPageObjectResponse
  | PartialDataSourceObjectResponse
  | DataSourceObjectResponse

export const isPageObjectResponse = (
  item: NotionResponse
): item is PageObjectResponse => {
  return "properties" in item
}

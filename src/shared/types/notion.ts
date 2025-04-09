import { PageObjectResponse, PartialPageObjectResponse, PartialDatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints"

export type NotionResponse = PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse

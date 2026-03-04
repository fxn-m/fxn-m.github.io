const baseCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
} as const

const mergeHeaders = (
  headers?: Record<string, string>
): Record<string, string> => ({
  ...baseCorsHeaders,
  ...(headers ?? {})
})

export const jsonResponse = (
  body: unknown,
  status = 200,
  headers?: Record<string, string>
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...mergeHeaders(headers)
    }
  })

export const textResponse = (
  body: string,
  status = 200,
  headers?: Record<string, string>
): Response =>
  new Response(body, {
    status,
    headers: mergeHeaders(headers)
  })

export const noContentResponse = (
  status = 204,
  headers?: Record<string, string>
): Response =>
  new Response(null, {
    status,
    headers: mergeHeaders(headers)
  })

export const errorResponse = (
  message: string,
  status = 500,
  headers?: Record<string, string>
): Response =>
  jsonResponse(
    {
      message
    },
    status,
    headers
  )

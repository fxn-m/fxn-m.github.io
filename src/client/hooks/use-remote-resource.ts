import { useEffect, useState } from "react";

export type RemoteResourceState<T> =
  | { status: "loading" }
  | { data: T; status: "ready" }
  | { status: "error" };

export type RemoteResourceReader<T> = (response: Response) => Promise<T>;

export function useRemoteResource<T>(
  url: string,
  read: RemoteResourceReader<T>,
): RemoteResourceState<T> {
  const [state, setState] = useState<RemoteResourceState<T>>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setState({ status: "loading" });

      try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Unable to load remote resource: ${response.status}`);
        }

        setState({ data: await read(response), status: "ready" });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setState({ status: "error" });
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [read, url]);

  return state;
}

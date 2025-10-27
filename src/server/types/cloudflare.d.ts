export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException(): void
}

export interface ScheduledController {
  scheduledTime: number
  cron: string
}

export interface KVNamespace {
  get(key: string): Promise<string | null>
  put(
    key: string,
    value: string,
    options?: {
      expiration?: number
      expirationTtl?: number
      metadata?: unknown
    }
  ): Promise<void>
  delete(key: string): Promise<void>
}

export interface QueueMessage<T = unknown> {
  body: T
  ack(): void
  retry(delaySeconds?: number): void
}

export interface QueueBatch<T = unknown> {
  messages: QueueMessage<T>[]
}

export interface Queue<T = unknown> {
  send(body: T): Promise<void>
}

export interface FetchEventHandler<Env = unknown> {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>
}

export interface ScheduledEventHandler<Env = unknown> {
  scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void>
}

export interface QueueEventHandler<Env = unknown, Message = unknown> {
  queue(batch: QueueBatch<Message>, env: Env, ctx: ExecutionContext): Promise<void>
}

export type WorkerEntrypoint<Env = unknown, Message = unknown> = Partial<
  FetchEventHandler<Env> &
    ScheduledEventHandler<Env> &
    QueueEventHandler<Env, Message>
>

import { sendRequest } from "./bridge";
import type { DatabaseQueryResult, DatabaseExecuteResult, BrokerRequestParams, BrokerResponse } from "./types";

export const db = {
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await sendRequest<DatabaseQueryResult>({
      type: "db:query",
      params: { sql, params },
    });

    if (!result || !Array.isArray(result.columns)) {
      return [];
    }

    const columns = result.columns as string[];
    const rows = result.rows as unknown[][];

    return rows.map((row) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj as T;
    });
  },

  async execute(sql: string, params?: unknown[]): Promise<DatabaseExecuteResult> {
    const result = await sendRequest<DatabaseExecuteResult>({
      type: "db:execute",
      params: { sql, params },
    });

    return result ?? { changes: 0 };
  },
};

export const broker = {
  async request<T = unknown>(params: BrokerRequestParams): Promise<BrokerResponse<T>> {
    const result = await sendRequest<BrokerResponse<T>>({
      type: "broker:request",
      params,
    });

    return result ?? { success: false, error: "No response from broker" };
  },
};

export { sendRequest } from "./bridge";
export type { DatabaseQueryParams, DatabaseQueryResult, DatabaseExecuteParams, DatabaseExecuteResult, BrokerRequestParams, BrokerResponse } from "./types";

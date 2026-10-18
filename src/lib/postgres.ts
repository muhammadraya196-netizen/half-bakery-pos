import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

// NUMERIC dikembalikan sebagai number. Nilai uang aplikasi adalah rupiah utuh.
types.setTypeParser(1700, (value) => Number(value));

const globalForPg = globalThis as unknown as { halfPosPool?: Pool };

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL belum diatur");
  }

  if (!globalForPg.halfPosPool) {
    const pool = new Pool({ connectionString });
    pool.on("error", (error) => {
      console.error("Koneksi PostgreSQL terputus", error);
    });
    globalForPg.halfPosPool = pool;
  }

  return globalForPg.halfPosPool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

export async function withTransaction<T>(
  run: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const value = await run(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function postgresErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

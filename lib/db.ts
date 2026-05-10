import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  /**
   * Vercel 서버리스 + Supabase Pooler 환경에서 안정적으로 쓰려면
   * 함수 인스턴스당 pg.Pool의 max를 1로 잡아 연결 폭주를 막는다.
   * 다중 인스턴스가 떠도 Supabase Pooler의 max client 한도를 넘지 않게.
   */
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 10_000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

/* warm invocation 간 같은 모듈 인스턴스에서 재사용 (cold start당 1회만 생성) */
globalForPrisma.prisma = db;

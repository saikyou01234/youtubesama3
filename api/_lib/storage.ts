import { db } from './db';
import { analysisResults, type NewAnalysisResult, type AnalysisResult } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function saveAnalysisResult(result: NewAnalysisResult): Promise<AnalysisResult> {
  const [saved] = await db.insert(analysisResults).values(result).returning();
  return saved;
}

export async function getAllAnalysisResults(): Promise<AnalysisResult[]> {
  return await db
    .select()
    .from(analysisResults)
    .orderBy(desc(analysisResults.createdAt));
}

export async function getAnalysisResultById(id: string): Promise<AnalysisResult | undefined> {
  const [result] = await db
    .select()
    .from(analysisResults)
    .where(eq(analysisResults.id, id))
    .limit(1);
  return result;
}

export async function deleteAnalysisResult(id: string): Promise<boolean> {
  const result = await db
    .delete(analysisResults)
    .where(eq(analysisResults.id, id))
    .returning();
  return result.length > 0;
}

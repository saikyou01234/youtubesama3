import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const analysisResults = pgTable('analysis_results', {
  id: text('id').primaryKey(),
  videoId: text('video_id').notNull(),
  videoTitle: text('video_title').notNull(),
  videoThumbnail: text('video_thumbnail').notNull(),
  videoDuration: text('video_duration').notNull(),
  channelName: text('channel_name').notNull(),
  summary: text('summary').notNull(),
  keyTopics: jsonb('key_topics').notNull().$type<string[]>(),
  highlights: jsonb('highlights').notNull().$type<HighlightSegment[]>(),
  thumbnails: jsonb('thumbnails').notNull().$type<ThumbnailProposal[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type NewAnalysisResult = typeof analysisResults.$inferInsert;

// Type definitions
export interface HighlightSegment {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  startSeconds: number;
  endSeconds: number;
  reason: string;
}

export interface ThumbnailProposal {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  designNotes: string;
  ctrReason: string;
  modelUsed?: string;
}

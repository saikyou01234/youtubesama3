import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  extractVideoId,
  getVideoInfo,
  getTranscript,
  analyzeWithOpenAI,
  generateThumbnails,
} from './_lib/youtube-analyzer';
import { saveAnalysisResult } from './_lib/storage';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { youtubeUrl, characterImages = [], imageModel = 'nano-banana' } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    // SSEヘッダーを設定
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (step: string, message: string, data?: any) => {
      res.write(`data: ${JSON.stringify({ step, message, data })}\n\n`);
    };

    // 1. URL検証
    sendEvent('validate', 'URL検証中...');
    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      sendEvent('error', 'Invalid YouTube URL');
      return res.end();
    }

    // 2. 動画情報取得
    sendEvent('fetch-info', '動画情報を取得中...');
    const videoInfo = await getVideoInfo(videoId);
    sendEvent('fetch-info', '動画情報を取得しました', videoInfo);

    // 3. 字幕取得
    sendEvent('fetch-transcript', '字幕を取得中...');
    const transcript = await getTranscript(videoId);
    sendEvent('fetch-transcript', transcript ? '字幕を取得しました' : '字幕が見つかりませんでした');

    // 4. AI分析
    sendEvent('analyze', 'AI分析中...');
    const analysis = await analyzeWithOpenAI(videoInfo, transcript);
    sendEvent('analyze', 'AI分析が完了しました', {
      summary: analysis.summary,
      keyTopics: analysis.keyTopics,
      highlights: analysis.highlights,
    });

    // 5. サムネイル生成
    sendEvent('generate-thumbnails', 'サムネイルを生成中...');
    const thumbnails = await generateThumbnails(
      videoInfo,
      analysis.summary,
      analysis.keyTopics,
      characterImages,
      imageModel,
    );
    sendEvent('generate-thumbnails', 'サムネイルを生成しました', { thumbnails });

    // 6. データベースに保存
    sendEvent('save', 'データベースに保存中...');
    const result = await saveAnalysisResult({
      id: crypto.randomUUID(),
      videoId: videoInfo.videoId,
      videoTitle: videoInfo.title,
      videoThumbnail: videoInfo.thumbnail,
      videoDuration: videoInfo.duration,
      channelName: videoInfo.channelName,
      summary: analysis.summary,
      keyTopics: analysis.keyTopics,
      highlights: analysis.highlights,
      thumbnails,
    });

    // 7. 完了
    sendEvent('complete', '分析が完了しました', result);
    res.end();
  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.write(`data: ${JSON.stringify({ step: 'error', message: errorMessage })}\n\n`);
    res.end();
  }
}

import { type HighlightSegment, type ThumbnailProposal } from '../../db/schema';

export interface AnalysisProgress {
  step: string;
  message: string;
  data?: any;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelName: string;
}

export interface AnalysisResult {
  videoInfo: VideoInfo;
  summary: string;
  keyTopics: string[];
  highlights: HighlightSegment[];
  thumbnails: ThumbnailProposal[];
}

// YouTube URLから動画IDを抽出
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// YouTube Data APIで動画情報を取得
export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch video info from YouTube API');
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found');
  }

  const video = data.items[0];
  const duration = parseDuration(video.contentDetails.duration);

  return {
    videoId,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.high.url,
    duration,
    channelName: video.snippet.channelTitle,
  };
}

// ISO 8601形式の時間を HH:MM:SS に変換
function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// 字幕/トランスクリプトを取得（簡易実装 - 実際にはyoutube-transcript-apiなどを使用）
export async function getTranscript(videoId: string): Promise<string> {
  // Note: Vercel Serverless Functionsでは、youtube-transcript-apiなどのPythonライブラリは使用できません
  // 代わりに、youtube-transcript npm パッケージなどを使用するか、
  // 外部APIサービスを利用する必要があります

  // ここでは簡易的な実装として、字幕が取得できない場合のフォールバックを想定
  try {
    // 実装例: youtube-transcript パッケージを使用
    // const { YoutubeTranscript } = await import('youtube-transcript');
    // const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    // return transcript.map(item => item.text).join(' ');

    // 一時的なフォールバック: 字幕なしで動画情報のみで分析
    return '';
  } catch (error) {
    console.warn('Failed to fetch transcript:', error);
    return '';
  }
}

// OpenAI GPT-4oで分析
export async function analyzeWithOpenAI(
  videoInfo: VideoInfo,
  transcript: string,
): Promise<{
  summary: string;
  keyTopics: string[];
  highlights: HighlightSegment[];
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const prompt = `以下のYouTube動画を分析してください。

動画タイトル: ${videoInfo.title}
チャンネル名: ${videoInfo.channelName}
再生時間: ${videoInfo.duration}

${transcript ? `トランスクリプト:\n${transcript.slice(0, 10000)}` : '※トランスクリプトは取得できませんでした。動画情報のみで分析してください。'}

以下のJSON形式で回答してください:
{
  "summary": "動画の要約（2-3段落）",
  "keyTopics": ["トピック1", "トピック2", "トピック3", ...],
  "highlights": [
    {
      "id": "uuid",
      "title": "シーンタイトル",
      "description": "シーン説明",
      "startTime": "HH:MM:SS",
      "endTime": "HH:MM:SS",
      "startSeconds": 0,
      "endSeconds": 0,
      "reason": "クリップ向きの理由"
    }
  ]
}

注意:
- highlightsは3-5個のハイライトシーンを抽出
- startTimeとendTimeは動画の再生時間内に収める
- startSecondsとendSecondsは秒数に変換した値`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'あなたはYouTube動画を分析する専門家です。クリエイターがアーカイブから効率的にコンテンツを再利用できるように、要約とハイライトを提供します。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze with OpenAI');
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return {
    summary: result.summary,
    keyTopics: result.keyTopics,
    highlights: result.highlights,
  };
}

// Google Geminiで画像生成
export async function generateThumbnails(
  videoInfo: VideoInfo,
  summary: string,
  keyTopics: string[],
  characterImages: string[],
  imageModel: 'nano-banana' | 'nano-banana-pro',
): Promise<ThumbnailProposal[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  // サムネイル提案を生成（3-5個）
  const proposalPrompt = `以下のYouTube動画のサムネイル提案を3-5個作成してください。

動画タイトル: ${videoInfo.title}
チャンネル名: ${videoInfo.channelName}
要約: ${summary}
キートピック: ${keyTopics.join(', ')}

以下のJSON形式で回答してください:
{
  "proposals": [
    {
      "title": "サムネイルタイトル",
      "description": "サムネイル説明",
      "designNotes": "デザインノート（配色、レイアウトなど）",
      "ctrReason": "CTR向上の理由",
      "prompt": "画像生成用のプロンプト（英語）"
    }
  ]
}`;

  const proposalResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: proposalPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
        },
      }),
    },
  );

  if (!proposalResponse.ok) {
    throw new Error('Failed to generate thumbnail proposals');
  }

  const proposalData = await proposalResponse.json();
  const proposals = JSON.parse(proposalData.candidates[0].content.parts[0].text);

  // 各提案に対して画像を生成
  const thumbnails: ThumbnailProposal[] = [];

  for (const proposal of proposals.proposals) {
    try {
      // 画像生成APIを呼び出し（モデルに応じて変更）
      const imageUrl = await generateImage(proposal.prompt, characterImages, imageModel);

      thumbnails.push({
        id: crypto.randomUUID(),
        title: proposal.title,
        description: proposal.description,
        imageUrl,
        designNotes: proposal.designNotes,
        ctrReason: proposal.ctrReason,
        modelUsed: imageModel,
      });
    } catch (error) {
      console.error('Failed to generate image for proposal:', error);
    }
  }

  return thumbnails;
}

// 画像生成（実際のAPIエンドポイントに置き換える必要があります）
async function generateImage(
  prompt: string,
  characterImages: string[],
  model: 'nano-banana' | 'nano-banana-pro',
): Promise<string> {
  // Note: ここでは実際の画像生成APIを使用する必要があります
  // 例: Replicate、Stability AI、またはカスタムエンドポイント

  // 仮の実装（実際には適切なAPIに置き換える）
  const apiEndpoint = model === 'nano-banana-pro'
    ? 'https://api.replicate.com/v1/predictions' // 仮のURL
    : 'https://api.replicate.com/v1/predictions'; // 仮のURL

  // キャラクター画像がある場合は、それを含めてプロンプトを調整
  // 実装は使用するAPIによって異なります

  // 一時的なフォールバック: プレースホルダー画像を返す
  return `https://via.placeholder.com/1280x720?text=${encodeURIComponent(prompt.slice(0, 50))}`;
}

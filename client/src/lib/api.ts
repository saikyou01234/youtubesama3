import type { AnalysisResult } from '../../../db/schema';

// 認証API
export async function verifyPassword(password: string): Promise<boolean> {
  const response = await fetch('/api/verify-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (response.ok) {
    return true;
  }

  return false;
}

// 分析API（SSE）
export async function analyzeVideo(
  youtubeUrl: string,
  characterImages: string[],
  imageModel: 'nano-banana' | 'nano-banana-pro',
  onProgress: (step: string, message: string, data?: any) => void,
): Promise<void> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      youtubeUrl,
      characterImages,
      imageModel,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to start analysis');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Response body is not readable');
  }

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        onProgress(data.step, data.message, data.data);

        if (data.step === 'error') {
          throw new Error(data.message);
        }
      }
    }
  }
}

// 履歴取得
export async function getHistory(): Promise<AnalysisResult[]> {
  const response = await fetch('/api/history');

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return response.json();
}

// 特定の履歴取得
export async function getHistoryById(id: string): Promise<AnalysisResult> {
  const response = await fetch(`/api/history/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return response.json();
}

// 履歴削除
export async function deleteHistory(id: string): Promise<void> {
  const response = await fetch(`/api/history/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete history');
  }
}

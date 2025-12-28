import { useState } from 'react';
import { useLocation } from 'wouter';
import { FaYoutube, FaHistory, FaSignOutAlt, FaPlus, FaTimes, FaClock, FaFilm } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzeVideo } from '@/lib/api';
import type { AnalysisResult, HighlightSegment, ThumbnailProposal } from '../../../db/schema';

interface HomePageProps {
  onLogout: () => void;
}

export default function HomePage({ onLogout }: HomePageProps) {
  const [, setLocation] = useLocation();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [characterImages, setCharacterImages] = useState<string[]>([]);
  const [imageModel, setImageModel] = useState<'nano-banana' | 'nano-banana-pro'>('nano-banana');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setCharacterImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setCharacterImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!youtubeUrl) return;

    setAnalyzing(true);
    setError('');
    setResult(null);
    setProgress(0);

    try {
      await analyzeVideo(youtubeUrl, characterImages, imageModel, (step, message, data) => {
        setProgressMessage(message);

        // プログレスバーの更新
        const stepProgress: Record<string, number> = {
          validate: 10,
          'fetch-info': 20,
          'fetch-transcript': 30,
          analyze: 60,
          'generate-thumbnails': 80,
          save: 90,
          complete: 100,
        };
        setProgress(stepProgress[step] || 0);

        if (step === 'complete' && data) {
          setResult(data);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析に失敗しました');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaYoutube className="text-3xl text-primary" />
            <h1 className="text-2xl font-bold">配信アナライザー</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              id="button-history"
              variant="outline"
              onClick={() => setLocation('/history')}
            >
              <FaHistory className="mr-2" />
              履歴
            </Button>
            <Button id="button-logout" variant="ghost" onClick={onLogout}>
              <FaSignOutAlt className="mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {!result ? (
          <Card>
            <CardHeader>
              <CardTitle>YouTube動画を分析</CardTitle>
              <CardDescription>
                YouTube動画のURLを入力して、AI分析を開始してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="input-youtube-url">YouTube URL</Label>
                <Input
                  id="input-youtube-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={analyzing}
                />
              </div>

              <div className="space-y-2">
                <Label>キャラクター画像（任意）</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {characterImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Character ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        id={`button-remove-image-${index}`}
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                        disabled={analyzing}
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  id="button-add-character-image"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={analyzing}
                >
                  <FaPlus className="mr-2" />
                  画像を追加
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={analyzing}
                />
              </div>

              <div className="space-y-2">
                <Label>画像生成モデル</Label>
                <RadioGroup
                  value={imageModel}
                  onValueChange={(value) =>
                    setImageModel(value as 'nano-banana' | 'nano-banana-pro')
                  }
                  disabled={analyzing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="radio-nano-banana" value="nano-banana" />
                    <Label htmlFor="radio-nano-banana">Nano Banana（高速・標準品質）</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="radio-nano-banana-pro" value="nano-banana-pro" />
                    <Label htmlFor="radio-nano-banana-pro">
                      Nano Banana Pro（高品質・日本語対応）
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {analyzing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{progressMessage}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                id="button-start-analysis"
                onClick={handleAnalyze}
                disabled={analyzing || !youtubeUrl}
                className="w-full"
              >
                {analyzing ? '分析中...' : '分析開始'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">分析結果</h2>
              <Button
                id="button-back-home"
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setYoutubeUrl('');
                  setCharacterImages([]);
                  setProgress(0);
                  setProgressMessage('');
                }}
              >
                新規分析
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex gap-4">
                  <img
                    src={result.videoThumbnail}
                    alt={result.videoTitle}
                    className="w-40 h-auto rounded"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{result.videoTitle}</CardTitle>
                    <CardDescription>{result.channelName}</CardDescription>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded">
                        <FaClock />
                        {result.videoDuration}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded">
                        <FaFilm />
                        {result.highlights.length}ハイライト
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">要約</TabsTrigger>
                    <TabsTrigger value="highlights">ハイライト</TabsTrigger>
                    <TabsTrigger value="thumbnails">サムネイル</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">要約</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {result.summary}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">キートピック</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.keyTopics.map((topic, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="highlights" className="space-y-4">
                    {result.highlights.map((highlight) => (
                      <Card key={highlight.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{highlight.title}</CardTitle>
                          <CardDescription>
                            {highlight.startTime} - {highlight.endTime}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">{highlight.description}</p>
                          <p className="text-xs text-muted-foreground">
                            <strong>クリップ推奨理由:</strong> {highlight.reason}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open(
                                `https://youtube.com/watch?v=${result.videoId}&t=${highlight.startSeconds}s`,
                                '_blank'
                              );
                            }}
                          >
                            YouTubeで見る
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="thumbnails" className="grid gap-4 md:grid-cols-2">
                    {result.thumbnails.map((thumbnail) => (
                      <Card key={thumbnail.id}>
                        <CardHeader>
                          <img
                            src={thumbnail.imageUrl}
                            alt={thumbnail.title}
                            className="w-full rounded mb-2"
                          />
                          <CardTitle className="text-lg">{thumbnail.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">{thumbnail.description}</p>
                          <p className="text-xs text-muted-foreground">
                            <strong>デザインノート:</strong> {thumbnail.designNotes}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <strong>CTR向上理由:</strong> {thumbnail.ctrReason}
                          </p>
                          {thumbnail.modelUsed && (
                            <p className="text-xs text-muted-foreground">
                              <strong>モデル:</strong> {thumbnail.modelUsed}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { FaYoutube, FaArrowLeft, FaSignOutAlt, FaClock, FaFilm } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getHistoryById } from '@/lib/api';

interface HistoryDetailPageProps {
  id: string;
  onLogout: () => void;
}

export default function HistoryDetailPage({ id, onLogout }: HistoryDetailPageProps) {
  const [, setLocation] = useLocation();

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['history', id],
    queryFn: () => getHistoryById(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">データが見つかりません</h3>
            <p className="text-muted-foreground mb-4">指定された履歴が存在しません</p>
            <Button onClick={() => setLocation('/history')}>履歴に戻る</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaYoutube className="text-3xl text-primary" />
            <h1 className="text-2xl font-bold">分析結果</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation('/history')}
            >
              <FaArrowLeft className="mr-2" />
              履歴に戻る
            </Button>
            <Button variant="ghost" onClick={onLogout}>
              <FaSignOutAlt className="mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
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
                <p className="text-xs text-muted-foreground mt-2">
                  分析日時: {new Date(result.createdAt).toLocaleString('ja-JP')}
                </p>
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
      </main>
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { FaYoutube, FaHome, FaSignOutAlt, FaClock, FaFilm, FaImage, FaTrash } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getHistory, deleteHistory } from '@/lib/api';

interface HistoryPageProps {
  onLogout: () => void;
}

export default function HistoryPage({ onLogout }: HistoryPageProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: getHistory,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaYoutube className="text-3xl text-primary" />
            <h1 className="text-2xl font-bold">分析履歴</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              id="button-back-home"
              variant="outline"
              onClick={() => setLocation('/')}
            >
              <FaHome className="mr-2" />
              ホーム
            </Button>
            <Button id="button-logout" variant="ghost" onClick={onLogout}>
              <FaSignOutAlt className="mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="bg-muted h-32 rounded mb-2" />
                  <div className="bg-muted h-6 rounded w-3/4 mb-2" />
                  <div className="bg-muted h-4 rounded w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : !history || history.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FaYoutube className="text-6xl text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">分析履歴がありません</h3>
              <p className="text-muted-foreground mb-4">
                YouTube動画を分析して、履歴を作成しましょう
              </p>
              <Button onClick={() => setLocation('/')}>新規分析を開始</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <Card key={item.id} id={`card-history-${item.id}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <img
                    src={item.videoThumbnail}
                    alt={item.videoTitle}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                  <CardTitle className="text-lg line-clamp-2">{item.videoTitle}</CardTitle>
                  <CardDescription>{item.channelName}</CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded">
                      <FaClock />
                      {item.videoDuration}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded">
                      <FaFilm />
                      {item.highlights.length}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded">
                      <FaImage />
                      {item.thumbnails.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(item.createdAt).toLocaleString('ja-JP')}
                  </p>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    id={`button-view-${item.id}`}
                    variant="default"
                    className="flex-1"
                    onClick={() => setLocation(`/history/${item.id}`)}
                  >
                    詳細を見る
                  </Button>
                  <Button
                    id={`button-delete-${item.id}`}
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <FaTrash />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

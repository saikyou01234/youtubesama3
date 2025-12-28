import { useState } from 'react';
import { FaYoutube } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyPassword } from '@/lib/api';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isValid = await verifyPassword(password);

      if (isValid) {
        onLogin();
      } else {
        setError('パスワードが正しくありません');
      }
    } catch (err) {
      setError('認証に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FaYoutube className="text-6xl text-primary" />
          </div>
          <CardTitle className="text-3xl">配信アナライザー</CardTitle>
          <CardDescription>
            YouTube配信をAIで自動分析し、要約・ハイライト・サムネイルを生成
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="input-password">パスワード</Label>
              <Input
                id="input-password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              id="button-login"
              type="submit"
              className="w-full"
              disabled={loading || !password}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { Route, Switch } from 'wouter';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import HistoryDetailPage from './pages/HistoryDetailPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // セッションストレージから認証状態を復元
  useEffect(() => {
    const auth = sessionStorage.getItem('authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('authenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <HomePage onLogout={handleLogout} />} />
      <Route path="/history" component={() => <HistoryPage onLogout={handleLogout} />} />
      <Route path="/history/:id">
        {(params) => <HistoryDetailPage id={params.id} onLogout={handleLogout} />}
      </Route>
      <Route>404 - Not Found</Route>
    </Switch>
  );
}

export default App;

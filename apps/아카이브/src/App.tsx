import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { useAuth, useAuthInit } from './hooks/useAuth';
import Header from './components/Header';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Convert from './pages/Convert';
import Bookmarks from './pages/Bookmarks';
import History from './pages/History';
import MyPage from './pages/MyPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './styles/global.css';

function AppLoader({ children }: { children: React.ReactNode }) {
  useAuthInit();
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return <>{children}</>;
}

function Layout() {
  return (
    <div className="app-layout">
      <Header />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <AppLoader>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/article/:id" element={<ArticleDetail />} />
              <Route path="/convert" element={<Convert />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/history" element={<History />} />
              <Route path="/mypage" element={<MyPage />} />
            </Route>
          </Routes>
        </AppLoader>
      </ToastProvider>
    </BrowserRouter>
  );
}

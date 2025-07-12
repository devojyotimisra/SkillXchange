import { ReactNode } from 'react';
import { Navbar } from './navbar';
import { useAuthStore } from '@/lib/store';
import { Navigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function Layout({ children, requireAuth = false }: LayoutProps) {
  const { isAuthenticated } = useAuthStore();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-6">{children}</main>
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SkillXchange Platform
        </div>
      </footer>
    </div>
  );
}
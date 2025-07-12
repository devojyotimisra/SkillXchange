import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/store';
import { Link } from 'react-router-dom';
import { redirect } from 'react-router';

export function Navbar() {
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const LogOut = () => {
    logout();
    return redirect('/');
  };


  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-primary">SkillXchange</Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link to="/browse" className="text-sm font-medium hover:underline">Browse Skills</Link>
              <Link to="/swaps" className="text-sm font-medium hover:underline">My Swaps</Link>
              <Link to="/profile" className="text-sm font-medium hover:underline">My Profile</Link>
            </>
          )}
        </nav>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/profile">
                <Avatar>
                  <AvatarImage src={currentUser?.profilePhoto} />
                  <AvatarFallback>{currentUser ? getInitials(currentUser.name) : 'U'}</AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="outline" onClick={LogOut}>Logout</Button>
            </div>
          ) : (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
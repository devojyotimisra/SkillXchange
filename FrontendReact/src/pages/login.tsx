import { AuthForm } from '@/components/auth/auth-form';
import { Layout } from '@/components/layout/layout';
import { useAuthStore } from '@/lib/store';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  
  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/profile" />;
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Join SkillXchange</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">How it works</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
                <div>
                  <h3 className="font-medium">Create your account</h3>
                  <p className="text-muted-foreground text-sm">Register with email and password</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
                <div>
                  <h3 className="font-medium">Add skills to your profile</h3>
                  <p className="text-muted-foreground text-sm">List what you can offer and what you want to learn</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</div>
                <div>
                  <h3 className="font-medium">Browse the community</h3>
                  <p className="text-muted-foreground text-sm">Find members with skills you want to learn</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shrink-0">4</div>
                <div>
                  <h3 className="font-medium">Request a SkillXchange</h3>
                  <p className="text-muted-foreground text-sm">Send a request and start learning</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <AuthForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}
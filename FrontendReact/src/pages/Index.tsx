import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/layout';
import { useAuthStore } from '@/lib/store';
import { Link } from 'react-router-dom';

export default function IndexPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Layout>
      <section className="py-20 md:py-32 flex flex-col items-center text-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Swap Skills, Grow Together
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Exchange your expertise with others and learn new skills. Create your profile, list your skills, and start swapping today.
            </p>
            <div className="space-x-4">
              {isAuthenticated ? (
                <Button asChild size="lg">
                  <Link to="/browse">Browse Skills</Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link to="/login">Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center">1</div>
              <h3 className="text-xl font-bold">List Your Skills</h3>
              <p className="text-muted-foreground">Share what you're good at and what you want to learn</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center">2</div>
              <h3 className="text-xl font-bold">Connect With Others</h3>
              <p className="text-muted-foreground">Find people with complementary skills and interests</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center">3</div>
              <h3 className="text-xl font-bold">Exchange Knowledge</h3>
              <p className="text-muted-foreground">Meet up, teach, learn, and leave feedback</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Why Skill Swap?</h2>
              <p className="text-muted-foreground">
                Skill swapping creates meaningful connections and allows you to learn in a personalized way.
                Instead of paying for courses, exchange your own valuable skills.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-primary"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Learn directly from experienced practitioners</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-primary"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>No money involved - just an exchange of time and knowledge</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 text-primary"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Build your network and meet like-minded people</span>
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-lg bg-gray-200 p-8">
                <blockquote className="italic">
                  "Skill Swap helped me learn photography from a pro, and in return, I taught them how to code. It's an amazing way to grow your skills!"
                </blockquote>
                <p className="mt-4 font-medium">- Sarah T., Web Developer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-muted">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start swapping skills?</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground mb-6">
            Join our community of skill exchangers today and unlock a world of knowledge.
          </p>
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link to="/browse">Browse Skills</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link to="/login">Create Your Profile</Link>
            </Button>
          )}
        </div>
      </section>
    </Layout>
  );
}
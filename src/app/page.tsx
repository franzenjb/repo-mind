import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Brain,
  BookOpen,
  MessageSquare,
  Image,
  Search,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">RepoMind</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/signin">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            <Sparkles className="h-4 w-4" />
            AI-Powered Learning
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            Master Your Repositories
            <br />
            <span className="text-primary">One Session at a Time</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            RepoMind helps you study, understand, and remember your coding
            projects with smart notes, Q&A flashcards, and AI-powered insights.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Learning <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg border bg-card text-left space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Study Sessions</h3>
            <p className="text-sm text-muted-foreground">
              Organize your learning by repository with dedicated study
              sessions.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-left space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Q&A Flashcards</h3>
            <p className="text-sm text-muted-foreground">
              Create and review question-answer pairs to test your
              understanding.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-left space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Screenshot Notes</h3>
            <p className="text-sm text-muted-foreground">
              Capture and annotate screenshots to document visual concepts.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-left space-y-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Smart Search</h3>
            <p className="text-sm text-muted-foreground">
              Find anything instantly with powerful full-text search across all
              content.
            </p>
          </div>
        </div>

        {/* AI Features */}
        <div className="mt-24 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            <Sparkles className="h-4 w-4" />
            Powered by Claude AI
          </div>
          <h2 className="text-3xl font-bold">AI-Enhanced Learning</h2>
          <p className="text-muted-foreground">
            Let AI help you learn faster with automatic summaries, generated
            study questions, smart tagging, and related content suggestions.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium">Auto-Summarize</h4>
              <p className="text-sm text-muted-foreground">
                Get concise summaries of your notes and sessions.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium">Generate Questions</h4>
              <p className="text-sm text-muted-foreground">
                AI creates study questions from your content.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium">Smart Tags</h4>
              <p className="text-sm text-muted-foreground">
                Automatic tag suggestions for better organization.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium">Related Content</h4>
              <p className="text-sm text-muted-foreground">
                Discover connections between your notes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>RepoMind</span>
          </div>
          <p>Personal Knowledge Management for Developers</p>
        </div>
      </footer>
    </div>
  );
}

import { Button } from '@/components/ui/button';

export default function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold">FlipTheScript Academy</h1>
      <p className="text-muted-foreground">
        Nx monorepo skeleton — web app is up and shadcn/ui is wired in.
      </p>
      <Button>Get started</Button>
    </main>
  );
}

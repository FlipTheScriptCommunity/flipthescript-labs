export function SiteFooter() {
  return (
    <footer className="px-6 py-10">
      <div className="gradient-divider mb-8" />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <span>
          Flip<span className="text-primary">TheScript</span> Academy
        </span>
        <a
          href="https://github.com/FlipTheScriptCommunity"
          className="transition-colors hover:text-foreground"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}

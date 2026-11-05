import { useEffect, useState } from 'react';

export type FlociStatus = 'checking' | 'up' | 'down';

// Polls Floci's health endpoint (forwarded by the dev server) so the console
// can tell students straight away when the emulator isn't running, instead of
// letting every S3/Lambda call fail with a confusing network error.
export function useFlociHealth(intervalMs = 10_000): FlociStatus {
  const [status, setStatus] = useState<FlociStatus>('checking');
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/_localstack/health', { cache: 'no-store' });
        if (!cancelled) setStatus(res.ok ? 'up' : 'down');
      } catch {
        if (!cancelled) setStatus('down');
      }
    };
    check();
    const timer = setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [intervalMs]);
  return status;
}

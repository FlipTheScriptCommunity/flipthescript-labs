import { useEffect, useState } from 'react';

// Tiny hash router — the console only has a handful of pages, and hash routes
// survive a Codespace preview reload without any server-side fallback config.
export type Route =
  | { page: 'home' }
  | { page: 's3-buckets' }
  | { page: 's3-create-bucket' }
  | { page: 's3-bucket'; bucket: string }
  | { page: 'lambda-functions' }
  | { page: 'lambda-create-function' }
  | { page: 'lambda-function'; functionName: string }
  | { page: 'not-found'; path: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '') || '/';
  let parts: string[];
  try {
    parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    return { page: 'not-found', path };
  }

  if (parts.length === 0) return { page: 'home' };
  const [service, ...rest] = parts;
  if (service === 's3') {
    if (rest.length === 0 || (rest.length === 1 && rest[0] === 'buckets'))
      return { page: 's3-buckets' };
    if (rest.length === 1 && rest[0] === 'create')
      return { page: 's3-create-bucket' };
    if (rest.length === 2 && rest[0] === 'buckets')
      return { page: 's3-bucket', bucket: rest[1] };
  }
  if (service === 'lambda') {
    if (rest.length === 0 || (rest.length === 1 && rest[0] === 'functions'))
      return { page: 'lambda-functions' };
    if (rest.length === 1 && rest[0] === 'create')
      return { page: 'lambda-create-function' };
    if (rest.length === 2 && rest[0] === 'functions')
      return { page: 'lambda-function', functionName: rest[1] };
  }
  return { page: 'not-found', path };
}

export const href = {
  home: () => '#/',
  buckets: () => '#/s3/buckets',
  createBucket: () => '#/s3/create',
  bucket: (name: string) => `#/s3/buckets/${encodeURIComponent(name)}`,
  functions: () => '#/lambda/functions',
  createFunction: () => '#/lambda/create',
  fn: (name: string) => `#/lambda/functions/${encodeURIComponent(name)}`,
};

export function navigate(to: string) {
  if (window.location.hash !== to) window.location.hash = to;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

// Cloudscape links/breadcrumbs fire onFollow with the href; route them through
// the hash instead of letting the browser do a full navigation.
export function followHandler(
  event: CustomEvent<{ href?: string; external?: boolean }>,
) {
  if (event.detail.external || !event.detail.href?.startsWith('#')) return;
  event.preventDefault();
  navigate(event.detail.href);
}

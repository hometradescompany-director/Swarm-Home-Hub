/** Reachability observations only; the host's admission and lifecycle stay authoritative. */
export interface HostProbe {
  readonly method: 'GET' | 'OPTIONS';
  readonly status: number | null;
  readonly outcome: 'responded' | 'unreachable';
}

function eventsAddress(value: string): URL {
  const error = () => new Error('Expected a public HTTPS Swarm events URL without credentials, query or fragment');
  let url: URL;
  try { url = new URL(value); } catch { throw error(); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      url.pathname !== '/swarm-home/events' || url.port && url.port !== '443' ||
      host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') ||
      host.includes(':') || /^[\d.]+$/.test(host) || !host.includes('.')) throw error();
  return url;
}

export async function inspectSwarmHost(eventsUrl: string, fetcher: typeof fetch = fetch) {
  const url = eventsAddress(eventsUrl);
  const probes: HostProbe[] = [];
  let health: 'passed' | 'failed' = 'failed';
  for (const [method, path] of [['GET', '/swarm-home/health'], ['OPTIONS', '/swarm-home/events']] as const) {
    try {
      const response = await fetcher(new URL(path, url), {
        method, redirect: 'manual', signal: AbortSignal.timeout(10_000),
        headers: { accept: 'application/json' },
      });
      probes.push({ method, status: response.status, outcome: 'responded' });
      if (method === 'GET' && response.status === 200 && response.headers.get('content-type')?.includes('application/json')) {
        const body: unknown = await response.json();
        if (typeof body === 'object' && body !== null &&
            'ok' in body && body.ok === true &&
            'service' in body && body.service === '@endless-technologies/swarm-home-hub' &&
            'transport' in body && body.transport === 'web') health = 'passed';
      } else {
        await response.body?.cancel();
      }
    } catch {
      if (!probes.some(p => p.method === method)) probes.push({ method, status: null, outcome: 'unreachable' });
    }
  }
  return {
    health, verification: 'pending' as const, probes,
    gates: [
      { name: 'Swarm health', state: health },
      { name: 'Unauthenticated and wrong-token rejection', state: 'pending' as const },
      { name: 'Authenticated admission durable after restart', state: 'pending' as const },
      { name: 'Replay does not execute twice', state: 'pending' as const },
      { name: 'Correlated swarm.work.result accepted by Atlas', state: 'pending' as const },
      { name: 'Revoked or rotated credential refused', state: 'pending' as const },
    ],
  };
}

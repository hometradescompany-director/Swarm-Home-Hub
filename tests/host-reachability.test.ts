import { describe, expect, it } from 'vitest';
import { inspectSwarmHost } from '../src/platform/host-reachability.js';

describe('read-only Swarm host verification preflight', () => {
  it('checks the actual health contract without sending authority or work', async () => {
    const calls: Request[] = [];
    const fetcher: typeof fetch = async (input, init) => {
      const request = new Request(input, init);
      calls.push(request);
      return request.url.endsWith('/health')
        ? Response.json({ ok: true, service: '@endless-technologies/swarm-home-hub', transport: 'web', toolCount: 9 })
        : Response.json({ ok: false }, { status: 404 });
    };
    const result = await inspectSwarmHost('https://swarm.test/swarm-home/events', fetcher);
    expect(calls.map(r => [r.method, r.url])).toEqual([
      ['GET', 'https://swarm.test/swarm-home/health'],
      ['OPTIONS', 'https://swarm.test/swarm-home/events'],
    ]);
    expect(calls.every(r => !r.headers.has('authorization') && r.body === null && r.redirect === 'manual')).toBe(true);
    expect(result.health).toBe('passed');
    expect(result.verification).toBe('pending');
  });
  it('does not count a generic website as Swarm health', async () => {
    const result = await inspectSwarmHost('https://swarm.test/swarm-home/events', async () => Response.json({ ok: true }));
    expect(result.health).toBe('failed');
  });
  it('does not follow redirects or call redirected hosts', async () => {
    const result = await inspectSwarmHost('https://swarm.test/swarm-home/events', async () => new Response(null, { status: 301 }));
    expect(result.health).toBe('failed');
    expect(result.probes.map(p => p.status)).toEqual([301, 301]);
  });
  it('keeps authenticated and durable gates pending even with healthy responses', async () => {
    const result = await inspectSwarmHost('https://swarm.test/swarm-home/events', async () => Response.json({ ok: true, service: '@endless-technologies/swarm-home-hub', transport: 'web', toolCount: 9 }));
    expect(result.gates.map(g => g.state)).toEqual(['passed', 'pending', 'pending', 'pending', 'pending', 'pending']);
    expect(result.verification).toBe('pending');
  });
  it('rejects unsafe or non-contract addresses before fetching', async () => {
    let calls = 0;
    for (const url of ['http://swarm.test/swarm-home/events', 'https://localhost/swarm-home/events', 'https://127.0.0.1/swarm-home/events', 'https://user:password@swarm.test/swarm-home/events', 'https://swarm.test/swarm-home/events?token=bad', 'https://swarm.test/other']) {
      await expect(inspectSwarmHost(url, async () => { calls++; return new Response(); })).rejects.toThrow('public HTTPS Swarm events URL');
    }
    expect(calls).toBe(0);
  });
  it('contains network errors without exposing their messages', async () => {
    const result = await inspectSwarmHost('https://swarm.test/swarm-home/events', async () => { throw new Error('private network details'); });
    expect(result.health).toBe('failed');
    expect(result.probes.every(p => p.status === null && p.outcome === 'unreachable')).toBe(true);
    expect(JSON.stringify(result)).not.toContain('private network details');
  });
});

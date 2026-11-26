import { inspectSwarmHost } from '../src/platform/host-reachability.ts';

// Only an explicit, operator-supplied deployed address; never a default host.
const address = process.argv[2];
if (!address || process.argv.length !== 3) {
  console.error('Usage: bun scripts/verify-host.mjs <public-https-events-url>');
  process.exitCode = 2;
} else {
  try {
    const result = await inspectSwarmHost(address);
    console.log(JSON.stringify(result, null, 2));
    // Zero means health passed, NOT that the host is verified for work.
    process.exitCode = result.health === 'passed' ? 0 : 1;
  } catch {
    console.error('Invalid host address; use a public HTTPS /swarm-home/events URL without credentials, query or fragment.');
    process.exitCode = 2;
  }
}

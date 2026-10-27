import { EngineError, EngineId } from "./types";

/**
 * Local inference servers (LM Studio, Ollama, llama.cpp, ...) usually run on
 * the developer's machine, while aeoscope itself often runs in Docker - where
 * a loopback URL points at the container, not at the machine running the
 * server. To keep the default `localhost` configuration working, a failed
 * request to a loopback address is retried once via Docker's special
 * `host.docker.internal` hostname (made resolvable on Linux by the
 * `extra_hosts` entry for the app service in docker-compose.yml).
 */

const LOOPBACK_HOST = /\/\/(localhost|127\.0\.0\.1|\[::1\])(?=[:/]|$)/;

export function isLoopbackBase(base: string): boolean {
  return LOOPBACK_HOST.test(base);
}

export function toDockerHostBase(base: string): string {
  return base.replace(LOOPBACK_HOST, "//host.docker.internal");
}

/** Extra guidance appended to "could not reach" errors for loopback URLs. */
export function dockerHostHint(base: string): string {
  if (!isLoopbackBase(base)) return "";
  return (
    ` Note: when aeoscope runs in Docker, ${base} refers to the container itself - ` +
    `if the server runs on your machine, use ${toDockerHostBase(base)} instead` +
    ` (on Linux, also enable the server's "serve on local network" / 0.0.0.0 binding).`
  );
}

/**
 * Fetch a local inference server, retrying once via host.docker.internal when
 * a loopback base URL is unreachable from inside a container. Throws the
 * EngineError returned by `onUnreachable` when no attempt succeeds.
 */
export async function fetchFromLocalServer(
  engine: EngineId,
  base: string,
  path: string,
  init: RequestInit,
  onUnreachable: (base: string) => EngineError,
): Promise<Response> {
  try {
    return await fetch(`${base}${path}`, init);
  } catch {
    if (!isLoopbackBase(base)) throw onUnreachable(base);
    const fallbackBase = toDockerHostBase(base);
    try {
      const res = await fetch(`${fallbackBase}${path}`, init);
      console.warn(
        `[aeoscope] ${base} is not reachable from inside the container (localhost there is the container itself, not your machine); ` +
          `the request succeeded via ${fallbackBase}. Set the engine's base URL to ${fallbackBase} in your environment to skip the failed attempt.`,
      );
      return res;
    } catch {
      throw onUnreachable(base);
    }
  }
}

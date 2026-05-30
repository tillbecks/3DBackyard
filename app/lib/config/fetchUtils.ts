export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 7000,
  externalSignal?: AbortSignal
) {
  const controller = new AbortController();

  // If caller provided a signal, forward its abort to our controller
  if (options.signal) {
    const orig = options.signal;
    if (orig.aborted) controller.abort();
    else orig.addEventListener('abort', () => controller.abort());
  }
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', () => controller.abort());
  }

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isAbortError(err: unknown) {
  return (err instanceof Error && (err.name === 'AbortError' || (err as any).code === 'ABORT_ERR'));
}

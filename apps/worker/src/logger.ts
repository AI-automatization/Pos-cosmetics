// Structured JSON logger (CLAUDE.md: Worker log standarti)
export function logJobStart(queue: string, jobId: string, jobName: string, data: unknown) {
  console.log(JSON.stringify({ level: 'info', event: 'job_start', queue, jobId, jobName, data, ts: new Date().toISOString() }));
}

export function logJobDone(queue: string, jobId: string, jobName: string, durationMs: number) {
  console.log(JSON.stringify({ level: 'info', event: 'job_done', queue, jobId, jobName, durationMs, ts: new Date().toISOString() }));
}

export function logJobError(queue: string, jobId: string, jobName: string, err: unknown) {
  const error = err instanceof Error ? { message: err.message, stack: err.stack } : String(err);
  console.error(JSON.stringify({ level: 'error', event: 'job_error', queue, jobId, jobName, error, ts: new Date().toISOString() }));
}

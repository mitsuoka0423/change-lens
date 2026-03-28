export interface PullRequest {
  number: number;
  title: string;
  author: string;
  url: string;
  headSha: string;
}

export interface LineRange {
  start: number;
  end: number;
}

export interface FileDiff {
  filename: string;
  changedLines: LineRange[];
}

export interface PRAnnotation {
  pr: PullRequest;
  ranges: LineRange[];
}

export interface GitHubClient {
  listOpenPRs(owner: string, repo: string): Promise<PullRequest[]>;
  getDiff(owner: string, repo: string, prNumber: number): Promise<string>;
}

export interface DiffParser {
  parse(rawDiff: string): FileDiff[];
}

export interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttlMs?: number): void;
  delete(key: string): void;
}

export interface ChangeLensCore {
  getAnnotationsForFile(
    owner: string,
    repo: string,
    filePath: string,
    currentUser?: string,
  ): Promise<PRAnnotation[]>;
}

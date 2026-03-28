import { Octokit } from "@octokit/rest";
import type { GitHubClient, PullRequest } from "../types";
import type { Cache } from "../types";
import { TtlCache } from "../cache/ttl-cache";
import { getGitHubToken } from "./auth";

const PR_LIST_TTL_MS = 5 * 60 * 1000; // 5分
const DIFF_TTL_MS = 30 * 60 * 1000; // 30分

export class OctokitGitHubClient implements GitHubClient {
  private octokit: Octokit;
  private prCache: Cache<PullRequest[]>;
  private diffCache: Cache<string>;

  constructor(
    token?: string,
    prCache?: Cache<PullRequest[]>,
    diffCache?: Cache<string>,
  ) {
    const authToken = token ?? getGitHubToken();
    this.octokit = new Octokit({ auth: authToken });
    this.prCache = prCache ?? new TtlCache<PullRequest[]>(PR_LIST_TTL_MS);
    this.diffCache = diffCache ?? new TtlCache<string>(DIFF_TTL_MS);
  }

  async listOpenPRs(owner: string, repo: string): Promise<PullRequest[]> {
    const cacheKey = `prs:${owner}/${repo}`;
    const cached = this.prCache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.pulls.list({
      owner,
      repo,
      state: "open",
      per_page: 100,
    });

    const prs: PullRequest[] = data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      author: pr.user?.login ?? "unknown",
      url: pr.html_url,
      headSha: pr.head.sha,
    }));

    this.prCache.set(cacheKey, prs);
    return prs;
  }

  async getDiff(owner: string, repo: string, prNumber: number): Promise<string> {
    const cacheKey = `diff:${owner}/${repo}/${prNumber}`;
    const cached = this.diffCache.get(cacheKey);
    if (cached) return cached;

    const { data } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: { format: "diff" },
    });

    const diff = data as unknown as string;
    this.diffCache.set(cacheKey, diff);
    return diff;
  }
}

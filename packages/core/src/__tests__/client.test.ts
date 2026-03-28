import { describe, it, expect, vi, beforeEach } from "vitest";
import { OctokitGitHubClient } from "../github/client";
import type { PullRequest, Cache } from "../types";

// Octokit をモック
vi.mock("@octokit/rest", () => {
  const MockOctokit = function () {
    this.pulls = {
      list: vi.fn().mockResolvedValue({
        data: [
          {
            number: 42,
            title: "feat: add new feature",
            user: { login: "testuser" },
            html_url: "https://github.com/owner/repo/pull/42",
            head: { sha: "abc123" },
          },
          {
            number: 43,
            title: "fix: bug fix",
            user: { login: "otheruser" },
            html_url: "https://github.com/owner/repo/pull/43",
            head: { sha: "def456" },
          },
        ],
      }),
      get: vi.fn().mockResolvedValue({
        data: "diff --git a/file.ts b/file.ts\n@@ -1,3 +1,4 @@\n+new line",
      }),
    };
  } as any;
  return { Octokit: MockOctokit };
});

// auth をモック
vi.mock("../github/auth", () => ({
  getGitHubToken: vi.fn().mockReturnValue("mock-token"),
}));

describe("OctokitGitHubClient", () => {
  let client: OctokitGitHubClient;

  beforeEach(() => {
    client = new OctokitGitHubClient("mock-token");
  });

  describe("listOpenPRs", () => {
    it("オープンPR一覧を取得できる", async () => {
      const prs = await client.listOpenPRs("owner", "repo");

      expect(prs).toHaveLength(2);
      expect(prs[0]).toEqual({
        number: 42,
        title: "feat: add new feature",
        author: "testuser",
        url: "https://github.com/owner/repo/pull/42",
        headSha: "abc123",
      });
      expect(prs[1]).toEqual({
        number: 43,
        title: "fix: bug fix",
        author: "otheruser",
        url: "https://github.com/owner/repo/pull/43",
        headSha: "def456",
      });
    });

    it("キャッシュが効いている場合はAPIを再呼び出ししない", async () => {
      const prs1 = await client.listOpenPRs("owner", "repo");
      const prs2 = await client.listOpenPRs("owner", "repo");

      expect(prs1).toEqual(prs2);
      // Octokitのコンストラクタは1回だけ呼ばれる
    });
  });

  describe("getDiff", () => {
    it("PRのdiffを取得できる", async () => {
      const diff = await client.getDiff("owner", "repo", 42);

      expect(diff).toContain("diff --git");
      expect(diff).toContain("+new line");
    });
  });
});

describe("OctokitGitHubClient - キャッシュ注入", () => {
  it("外部キャッシュを注入できる", async () => {
    const mockPrCache: Cache<PullRequest[]> = {
      get: vi.fn().mockReturnValue([
        {
          number: 99,
          title: "cached PR",
          author: "cached-user",
          url: "https://github.com/owner/repo/pull/99",
          headSha: "cached-sha",
        },
      ]),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const client = new OctokitGitHubClient("mock-token", mockPrCache);
    const prs = await client.listOpenPRs("owner", "repo");

    expect(prs).toHaveLength(1);
    expect(prs[0].title).toBe("cached PR");
    expect(mockPrCache.get).toHaveBeenCalledWith("prs:owner/repo");
  });
});

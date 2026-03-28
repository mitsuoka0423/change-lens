import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getGitHubToken, AuthError } from "../github/auth";

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

import { execSync } from "child_process";
const mockExecSync = vi.mocked(execSync);

describe("getGitHubToken", () => {
  const originalEnv = process.env.GITHUB_TOKEN;

  beforeEach(() => {
    delete process.env.GITHUB_TOKEN;
    mockExecSync.mockReset();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.GITHUB_TOKEN = originalEnv;
    } else {
      delete process.env.GITHUB_TOKEN;
    }
  });

  it("GITHUB_TOKEN環境変数を優先する", () => {
    process.env.GITHUB_TOKEN = "env-token";
    expect(getGitHubToken()).toBe("env-token");
  });

  it("環境変数がない場合はgh auth tokenを使う", () => {
    mockExecSync.mockReturnValue("gh-cli-token\n");
    expect(getGitHubToken()).toBe("gh-cli-token");
  });

  it("どちらも利用できない場合はAuthErrorを投げる", () => {
    mockExecSync.mockImplementation(() => {
      throw new Error("command not found");
    });
    expect(() => getGitHubToken()).toThrow(AuthError);
    expect(() => getGitHubToken()).toThrow("GitHub認証トークンが見つかりません");
  });
});

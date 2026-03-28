import { describe, it, expect, vi } from "vitest";
import { detectRepo } from "../github/repo-detector";

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

import { execSync } from "child_process";
const mockExecSync = vi.mocked(execSync);

describe("detectRepo", () => {
  it("SSH形式のURLからowner/repoを検出できる", () => {
    mockExecSync.mockReturnValue("git@github.com:mitsuoka0423/change-lens.git\n");
    const result = detectRepo();
    expect(result).toEqual({ owner: "mitsuoka0423", repo: "change-lens" });
  });

  it("HTTPS形式のURLからowner/repoを検出できる", () => {
    mockExecSync.mockReturnValue("https://github.com/mitsuoka0423/change-lens.git\n");
    const result = detectRepo();
    expect(result).toEqual({ owner: "mitsuoka0423", repo: "change-lens" });
  });

  it(".git拡張子なしのHTTPS URLにも対応する", () => {
    mockExecSync.mockReturnValue("https://github.com/owner/repo\n");
    const result = detectRepo();
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("GitHub以外のURLでエラーを投げる", () => {
    mockExecSync.mockReturnValue("https://gitlab.com/owner/repo.git\n");
    expect(() => detectRepo()).toThrow("GitHubリポジトリのURLを解析できません");
  });
});

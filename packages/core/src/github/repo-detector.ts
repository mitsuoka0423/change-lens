import { execSync } from "child_process";

export interface RepoInfo {
  owner: string;
  repo: string;
}

export function detectRepo(cwd?: string): RepoInfo {
  const remoteUrl = execSync("git remote get-url origin", {
    encoding: "utf-8",
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();

  // SSH: git@github.com:owner/repo.git
  const sshMatch = remoteUrl.match(
    /git@github\.com:([^/]+)\/([^/.]+)(?:\.git)?$/,
  );
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  // HTTPS: https://github.com/owner/repo.git
  const httpsMatch = remoteUrl.match(
    /github\.com\/([^/]+)\/([^/.]+)(?:\.git)?$/,
  );
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  }

  throw new Error(`GitHubリポジトリのURLを解析できません: ${remoteUrl}`);
}

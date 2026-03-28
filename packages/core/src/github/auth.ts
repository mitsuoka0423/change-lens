import { execSync } from "child_process";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function getGitHubToken(): string {
  // 1. 環境変数を優先
  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) return envToken;

  // 2. gh CLIからトークン取得
  try {
    const token = execSync("gh auth token", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    if (token) return token;
  } catch {
    // gh CLI が使えない場合はフォールバック
  }

  throw new AuthError(
    "GitHub認証トークンが見つかりません。以下のいずれかを設定してください:\n" +
      "  1. GITHUB_TOKEN 環境変数を設定する\n" +
      "  2. gh auth login でGitHub CLIにログインする",
  );
}

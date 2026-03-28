#!/usr/bin/env node

import { OctokitGitHubClient } from "../src/github/client";
import { ChangeLensCoreImpl } from "../src/core";
import { detectRepo } from "../src/github/repo-detector";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(`Usage:
  change-lens annotate <file>   PRAnnotation[] をJSON出力
  change-lens list-prs          オープンPR一覧をJSON出力

Options:
  --owner <owner>    リポジトリオーナー (省略時: git remoteから自動検出)
  --repo <repo>      リポジトリ名 (省略時: git remoteから自動検出)
  --user <user>      自分のユーザー名 (指定時: 自分のPRを除外)`);
    process.exit(0);
  }

  const ownerIdx = args.indexOf("--owner");
  const repoIdx = args.indexOf("--repo");
  const userIdx = args.indexOf("--user");

  let owner: string;
  let repo: string;

  if (ownerIdx !== -1 && repoIdx !== -1) {
    owner = args[ownerIdx + 1];
    repo = args[repoIdx + 1];
  } else {
    const detected = detectRepo();
    owner = detected.owner;
    repo = detected.repo;
  }

  const currentUser = userIdx !== -1 ? args[userIdx + 1] : undefined;

  const client = new OctokitGitHubClient();
  const core = new ChangeLensCoreImpl(client);

  switch (command) {
    case "list-prs": {
      const prs = await client.listOpenPRs(owner, repo);
      console.log(JSON.stringify(prs, null, 2));
      break;
    }
    case "annotate": {
      const filePath = args[1];
      if (!filePath) {
        console.error("Error: ファイルパスを指定してください");
        console.error("Usage: change-lens annotate <file>");
        process.exit(1);
      }
      const annotations = await core.getAnnotationsForFile(
        owner,
        repo,
        filePath,
        currentUser,
      );
      console.log(JSON.stringify(annotations, null, 2));
      break;
    }
    default:
      console.error(`Error: 不明なコマンド '${command}'`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

import type {
  ChangeLensCore,
  GitHubClient,
  PRAnnotation,
  PullRequest,
} from "./types";
import { UnifiedDiffParser } from "./diff/parser";

export class ChangeLensCoreImpl implements ChangeLensCore {
  private client: GitHubClient;
  private parser: UnifiedDiffParser;

  constructor(client: GitHubClient) {
    this.client = client;
    this.parser = new UnifiedDiffParser();
  }

  async getAnnotationsForFile(
    owner: string,
    repo: string,
    filePath: string,
    currentUser?: string,
  ): Promise<PRAnnotation[]> {
    const prs = await this.client.listOpenPRs(owner, repo);

    const filteredPRs = currentUser
      ? prs.filter((pr) => pr.author !== currentUser)
      : prs;

    const annotations: PRAnnotation[] = [];

    for (const pr of filteredPRs) {
      const rawDiff = await this.client.getDiff(owner, repo, pr.number);
      const fileDiffs = this.parser.parse(rawDiff);

      const matchingFile = fileDiffs.find((fd) => fd.filename === filePath);
      if (matchingFile && matchingFile.changedLines.length > 0) {
        annotations.push({
          pr,
          ranges: matchingFile.changedLines,
        });
      }
    }

    return annotations;
  }
}

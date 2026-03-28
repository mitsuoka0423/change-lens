import * as vscode from "vscode";
import { PRAnnotation } from "@change-lens/core";

export class ChangeLensHoverProvider implements vscode.HoverProvider {
  private annotations: PRAnnotation[] = [];
  private currentUser: string | undefined;

  setAnnotations(annotations: PRAnnotation[]): void {
    this.annotations = annotations;
  }

  setCurrentUser(user: string | undefined): void {
    this.currentUser = user;
  }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.Hover | undefined {
    const line = position.line + 1; // VSCode 0-based → PRAnnotation 1-based

    for (const annotation of this.annotations) {
      // 自分自身のPRはスキップ
      if (this.currentUser && annotation.pr.author === this.currentUser) {
        continue;
      }

      for (const range of annotation.ranges) {
        if (line >= range.start && line <= range.end) {
          return new vscode.Hover(this.buildMarkdown(annotation));
        }
      }
    }

    return undefined;
  }

  private buildMarkdown(annotation: PRAnnotation): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.supportHtml = true;

    md.appendMarkdown(
      `**PR #${annotation.pr.number}**: ${annotation.pr.title}\n\n`,
    );
    md.appendMarkdown(`**Author**: ${annotation.pr.author}\n\n`);
    md.appendMarkdown(
      `[Open PR in browser](${annotation.pr.url}) | ` +
        `[Open PR](command:changeLens.openPr?${encodeURIComponent(JSON.stringify(annotation.pr.url))})`,
    );

    return md;
  }
}

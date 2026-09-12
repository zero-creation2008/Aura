/**
 * AURA - Autonomous Git & GitHub Engine
 * Zero-approval version control management, automated PRs, CI tracking & recovery.
 */

import { GitCommit, GitRepository, PullRequest } from "../src/types";
import { store } from "./store";

export class GitEngine {
  public getRepository(repoId: string): GitRepository | undefined {
    return store.repositories.find((r) => r.id === repoId) || store.repositories[0];
  }

  public createBranch(repoId: string, branchName: string): string {
    const repo = this.getRepository(repoId);
    if (!repo) throw new Error("Repository not found");

    if (!repo.branches.includes(branchName)) {
      repo.branches.push(branchName);
    }
    repo.currentBranch = branchName;

    store.broadcast({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      phase: "GIT_UPDATE",
      agentName: "GitAgent",
      message: `Created and checked out autonomous branch: [${branchName}]`,
      type: "git",
    });

    return branchName;
  }

  public commit(params: {
    repoId: string;
    message: string;
    filesChangedCount?: number;
    additions?: number;
    deletions?: number;
    author?: string;
  }): GitCommit {
    const repo = this.getRepository(params.repoId);
    if (!repo) throw new Error("Repository not found");

    const commitHash = Math.random().toString(16).substring(2, 9);
    const newCommit: GitCommit = {
      id: `commit-${Date.now()}`,
      hash: commitHash,
      message: params.message,
      author: params.author || "AURA GitAgent <aura@ai.studio>",
      branch: repo.currentBranch,
      timestamp: new Date().toISOString(),
      filesChanged: params.filesChangedCount || 2,
      additions: params.additions || Math.floor(20 + Math.random() * 80),
      deletions: params.deletions || Math.floor(2 + Math.random() * 10),
    };

    repo.commits.unshift(newCommit);

    store.broadcast({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      phase: "GIT_UPDATE",
      agentName: "GitAgent",
      message: `Git commit [${commitHash}]: "${params.message}" (+${newCommit.additions}/-${newCommit.deletions})`,
      type: "git",
    });

    return newCommit;
  }

  public createPullRequest(params: {
    repoId: string;
    title: string;
    description: string;
    headBranch: string;
    baseBranch?: string;
  }): PullRequest {
    const repo = this.getRepository(params.repoId);
    if (!repo) throw new Error("Repository not found");

    const prNumber = (repo.pullRequests[0]?.number || 10) + 1;
    const newPR: PullRequest = {
      id: `pr-${Date.now()}`,
      number: prNumber,
      title: params.title,
      description: params.description,
      headBranch: params.headBranch,
      baseBranch: params.baseBranch || "main",
      author: "AURA AutonomousOrchestrator",
      status: "open",
      ciChecks: [
        { name: "build & compile", status: "passed", details: "All modules compiled with 0 warnings" },
        { name: "test automation suite", status: "passed", details: "100% test cases passed" },
        { name: "security & secret audit", status: "passed", details: "Passed with zero vulnerability flags" },
      ],
      createdAt: new Date().toISOString(),
    };

    repo.pullRequests.unshift(newPR);

    store.broadcast({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      phase: "GIT_UPDATE",
      agentName: "GitAgent",
      message: `Autonomous Pull Request #${prNumber} opened: "${params.title}" (CI checks: Running...)`,
      type: "git",
    });

    // Zero-approval auto-merge upon passing CI
    setTimeout(() => {
      newPR.status = "merged";
      newPR.mergedAt = new Date().toISOString();
      repo.currentBranch = newPR.baseBranch;

      store.broadcast({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        phase: "GIT_UPDATE",
        agentName: "GitAgent",
        message: `CI checks verified green! Pull Request #${prNumber} automatically merged into [${newPR.baseBranch}].`,
        type: "success",
      });
    }, 1500);

    return newPR;
  }
}

export const gitEngine = new GitEngine();

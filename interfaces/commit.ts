import { FileChange } from './fileChange';

export interface Commit {
    sha: string;
    commit: {
      message: string;
      committer: {
        date: string; 
      };
    };
    author: {
      login: string;
      html_url: string;
    };
    html_url: string;
    files: Array<FileChange>;
    stats: {
      additions: number;
      deletions: number;
    };
  }
  
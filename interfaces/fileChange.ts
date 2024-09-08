export interface FileChange {
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
    status: 'modified' | 'added' | 'removed';
  }
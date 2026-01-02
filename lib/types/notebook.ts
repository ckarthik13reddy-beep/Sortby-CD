export type NotebookType = 'templates' | 'schedule' | 'shared' | 'runs'

export interface Notebook {
  id: string
  name: string
  description?: string
  sharedBy?: string
  updatedAt: string
  createdAt: string
  isScheduled?: boolean
  lastRunAt?: string
  userId: string
}

export interface NotebookCell {
  id: string
  type: 'code' | 'markdown'
  content: string
  output?: string
  language?: string
}

export interface NotebookContent {
  cells: NotebookCell[]
  metadata: {
    kernelspec?: {
      name: string
      display_name: string
    }
    language_info?: {
      name: string
      version: string
    }
  }
}

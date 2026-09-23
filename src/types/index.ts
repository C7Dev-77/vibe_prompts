export type Category = 
  | 'frontend' 
  | 'backend' 
  | 'debug' 
  | 'refactor' 
  | 'testing' 
  | 'ui' 
  | 'db' 
  | 'deploy'
  | 'skills';

export type Tool = 
  | 'cursor' 
  | 'claude-code' 
  | 'v0' 
  | 'bolt' 
  | 'copilot' 
  | 'windsurf' 
  | 'chatgpt';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Prompt {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;              // prompt completo, con {{variables}}
  category: Category;
  tools: string[];           // ['cursor','claude-code','v0','bolt','copilot']
  tags: string[];
  difficulty: Difficulty;
  featured: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  promptId: string;
  name: string | null;       // null = anónimo
  message: string;
  rating: number;            // 1-5
  createdAt: string;
}

export interface VariableField {
  key: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
}

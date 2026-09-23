import { Prompt } from '../types';

/**
 * Downloads a prompt as a pristine .md (Markdown) file.
 * Handles compiled variable values or raw templates seamlessly.
 */
export const downloadPromptAsMarkdown = (prompt: Prompt, customBody?: string) => {
  const content = customBody || prompt.body;
  const toolsFormatted = prompt.tools && prompt.tools.length > 0 ? prompt.tools.join(', ') : 'Cualquiera';
  const tagsFormatted = prompt.tags && prompt.tags.length > 0 ? prompt.tags.map((t) => `#${t}`).join(' ') : '';

  const markdownContent = [
    `# ${prompt.title}`,
    '',
    `> **Categoría:** ${prompt.category.toUpperCase()}  `,
    `> **Dificultad:** ${prompt.difficulty}  `,
    `> **Herramientas compatibles:** ${toolsFormatted}  `,
    tagsFormatted ? `> **Tags:** ${tagsFormatted}  ` : '',
    '',
    '## Descripción',
    prompt.description,
    '',
    '---',
    '',
    '## Prompt',
    '',
    '```markdown',
    content,
    '```',
    '',
    '---',
    `*Descargado desde VibePrompts · La biblioteca de prompts para Vibe Coding*`
  ].filter(Boolean).join('\n');

  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${prompt.slug || 'prompt'}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

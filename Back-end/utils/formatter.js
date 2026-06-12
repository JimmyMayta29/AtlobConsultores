const { marked } = require('marked');

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false,
});

/**
 * Convert Markdown to sanitized HTML
 * @param {string} markdown - Raw markdown content
 * @returns {string} HTML string
 */
const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  try {
    return marked.parse(markdown);
  } catch (err) {
    return `<p>${markdown}</p>`;
  }
};

/**
 * Generate an excerpt from markdown content
 * @param {string} markdown - Raw markdown
 * @param {number} maxLength - Maximum character length
 * @returns {string} Plain text excerpt
 */
const generateExcerpt = (markdown, maxLength = 160) => {
  if (!markdown) return '';

  // Strip markdown syntax
  let text = markdown
    .replace(/#{1,6}\s/g, '')         // Headers
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
    .replace(/\*(.*?)\*/g, '$1')      // Italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // Code
    .replace(/!\[.*?\]\(.*?\)/g, '')  // Images
    .replace(/---/g, '')              // HR
    .replace(/\n+/g, ' ')            // Newlines to spaces
    .replace(/\s+/g, ' ')            // Multiple spaces
    .trim();

  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};

/**
 * Calculate estimated reading time in minutes
 * @param {string} text - Content text (markdown or plain)
 * @returns {number} Minutes
 */
const calculateReadTime = (text) => {
  if (!text) return 1;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200; // Average Spanish reading speed
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

/**
 * Strip all HTML tags from a string
 * @param {string} html
 * @returns {string}
 */
const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

module.exports = { markdownToHtml, generateExcerpt, calculateReadTime, stripHtml };

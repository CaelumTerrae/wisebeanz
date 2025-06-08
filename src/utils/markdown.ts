import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkBeanProfileLinks from './bean-profile-links';

export interface BeanProfile {
  slug: string;
  markdownContent: string;
  content: string;
  frontmatter: {
    name: string;
    role: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export interface Article {
  slug: string;
  markdownContent: string;
  content: string;
  frontmatter: {
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

// TODO: append function to get all of the bean mentions by going through the contents
// of the articles and finding all of the bean profile links

export async function getBeanProfile(slug: string): Promise<BeanProfile | null> {
  try {
    const markdownPath = path.join(process.cwd(), 'content/beans', `${slug}.md`);
    if (!fs.existsSync(markdownPath)) return null;
    const fileContents = fs.readFileSync(markdownPath, 'utf8');

    // Parse the frontmatter
    const { data: frontmatter, content } = matter(fileContents);
    const mentionedArticles = await findArticlesWithBeanMention(frontmatter.name);
    let contentWithMentionSection = content;
    if (mentionedArticles.length > 0) {
      const beanMentionSection = await getBeanMentionSection(mentionedArticles);
      contentWithMentionSection = `${content}\n\n${beanMentionSection}`;
    }
    // Convert markdown to HTML with wiki links support
    const processedContent = await remark()
      .use(remarkBeanProfileLinks)
      .use(html, { sanitize: false }) // Allow custom HTML attributes
      .process(contentWithMentionSection);


    
    return {
      slug,
      markdownContent: contentWithMentionSection,
      content: processedContent.toString(),
      frontmatter: frontmatter as BeanProfile['frontmatter'],
    };
  } catch (error) {
    console.error(`Error loading bean profile for ${slug}:`, error);
    return null;
  }
}

export async function getBeanMentionSection(mentionedArticles: string[]): Promise<string> {
  const beanMentionSection = `
## Bean Mentions

${mentionedArticles.map(article => `- [[${article}]]`).join('\n')}
  `;

  return beanMentionSection;
}

export function getAllBeanSlugs(): string[] {
  const beansDirectory = path.join(process.cwd(), 'content/beans');
  const filenames = fs.readdirSync(beansDirectory);
  
  return filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => filename.replace(/\.md$/, ''));
} 

export async function getArticle(slug: string): Promise<Article | null> {
  try {
    const markdownPath = path.join(process.cwd(), 'content/articles', `${slug}.md`);
    if (!fs.existsSync(markdownPath)) return null;
    const fileContents = fs.readFileSync(markdownPath, 'utf8');
    
    const { data: frontmatter, content } = matter(fileContents);

    const processedContent = await remark()
      .use(remarkBeanProfileLinks)
      .use(html, { sanitize: false }) // Allow custom HTML attributes
      .process(content);

    return {
      slug,
      markdownContent: content,
      content: processedContent.toString(),
      frontmatter: frontmatter as Article['frontmatter'],
    };
  } catch (error) {
    console.error(`Error loading article for ${slug}:`, error);
    return null;
  }
}

export function getAllArticleSlugs(): string[] {
  const articlesDirectory = path.join(process.cwd(), 'content/articles');
  const filenames = fs.readdirSync(articlesDirectory);
  
  return filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => filename.replace(/\.md$/, ''));
}

export async function findArticlesWithBeanMention(beanName: string): Promise<string[]> {
  const articleSlugs = getAllArticleSlugs();
  const mentionedSlugs: string[] = [];
  
  // Create a regex pattern that matches the bean's name in wiki link format
  const beanNamePattern = new RegExp(`\\[\\[${beanName}\\]\\]`, 'i');
  console.log("looking for bean profile", beanName);
  
  for (const slug of articleSlugs) {
    const article = await getArticle(slug);
    if (!article) continue;
    
    // Check if the article content contains a wiki link to the bean
    if (beanNamePattern.test(article.markdownContent)) {
      mentionedSlugs.push(slug);
    }
  }
  
  return mentionedSlugs;
}

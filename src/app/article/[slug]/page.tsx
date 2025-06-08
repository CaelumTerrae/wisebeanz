import { getArticle, getAllArticleSlugs } from '@/utils/markdown';
import styles from './article.module.css';

export async function generateStaticParams() {
  const slugs = getAllArticleSlugs();
  return slugs.map(slug => ({ slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return <div>Article not found! 😢</div>;
  }

  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <h1 className={styles.title}>{article?.frontmatter.title}</h1>
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </div>
  );
}
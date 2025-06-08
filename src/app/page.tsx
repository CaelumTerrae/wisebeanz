import styles from "./page.module.css";
import { getAllArticleSlugs, getArticle } from "@/utils/markdown";

export default async function Home() {
  const articleSlugs = getAllArticleSlugs();
  const articles = await Promise.all(
    articleSlugs.map(async (slug) => await getArticle(slug))
  );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.articleList}>
          <h2>Articles</h2>
          <ul>
            {articles.map((article) => 
              article && (
                <li key={article.slug}>
                  <a href={`/article/${article.slug}`}>
                    {article.frontmatter.title}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}

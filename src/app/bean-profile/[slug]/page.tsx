import { getBeanProfile, getAllBeanSlugs, BeanProfile } from '@/utils/markdown';
import styles from './bean-profile.module.css';

export async function generateStaticParams() {
  const slugs = getAllBeanSlugs();
  return slugs.map(slug => ({ slug }));
}

const getProfilePictureContent = (beanProfile: BeanProfile | null) => {
  if (beanProfile) {
    return <span className="text-4xl">🫘</span>;
  }
  return <span className="text-4xl">❓</span>;
}

const getBeanName = (beanProfile: BeanProfile | null) => {
  if (beanProfile) {
    return beanProfile.frontmatter.name;
  }
  return "Unknown Wise Bean";
}

const getBeanRole = (beanProfile: BeanProfile | null) => {
  if (beanProfile) {
    return beanProfile.frontmatter.role;
  }
  return "Unknown Wise Bean";
}

export default async function BeanProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const beanProfile = await getBeanProfile(slug);

  return (
    <div className={styles.container}>
      <article className={styles.profile}>
        <header className={styles.header}>
          <div className={styles.pictureContainer}>
            {getProfilePictureContent(beanProfile)}
          </div>
          <h1 className={styles.name}>{getBeanName(beanProfile)}</h1>
          <p className={styles.role}>{getBeanRole(beanProfile)}</p>
        </header>
        
        {beanProfile && (
          <div 
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: beanProfile.content }}
          />
        )}
      </article>
    </div>
  );
}
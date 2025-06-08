export function generateStaticParams() {
  return [
    { slug: 'christina' },
    // Add more slugs here as needed
  ];
}

export default async function BeanProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  if (slug === "christina") {
    return (
      <>
        <h1>Christina</h1>
        <p>Christina is a wise bean who shares bean sized wisdom.</p>
      </>
    );
  }
  return <div>BeanProfilePage for this bean: {slug}</div>;
}
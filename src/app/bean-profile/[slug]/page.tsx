export default async function BeanProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
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
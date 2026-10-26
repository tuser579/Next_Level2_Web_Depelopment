export const instant = false; 

const BlogSlugPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params; 
  return (
    <div>
      <h1>BlogSlugPage</h1> {slug}
    </div>
  );
};

export default BlogSlugPage;
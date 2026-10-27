import Link from "next/link";

export default function Home() {
  return (
    <div>
      hello nextjs
      <Link className="bg-yellow-500 px-2 py-1 rounded mr-2" href="/blogs">Blog Page</Link>
      <Link className="bg-yellow-500 px-2 py-1 rounded mr-2" href="/blogs/10">Blog Specific Page</Link>
      <Link className="bg-yellow-500 px-2 py-1 rounded mr-2" href="/blogs/authors">Authors Page</Link>

      <button className="bg-red-500 px-2 py-1 rounded mr-2" onClick={() => {}}>
        Go to Blogs
      </button>
    </div>
  );
}
  
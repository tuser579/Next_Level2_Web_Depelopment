import { prisma } from "./lib/prisma";

async function main() {
  // Create a new user with a post
  const user = await prisma.user.create({
    data: {
      name: "Alice2",
      email: "alice2@prisma.io",
      posts: {
        create: {
          title: "Hello World2",
          content: "This is my second post!",
          published: true,
        },
      },
    },
    include: {
      posts: true,
    },
  });
  console.log("Created user:", user);

  // create post without user
  const post = await prisma.post.create({
    data: {
      authorId: 1,
      title: "Hello World3",
      content: "This is my third post!",
      published: true,
    },
  });
  console.log("Created post:", post);

  // Fetch all users with their posts
  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
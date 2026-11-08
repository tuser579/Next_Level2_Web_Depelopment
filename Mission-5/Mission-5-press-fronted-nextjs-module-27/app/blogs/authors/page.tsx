const AuthorsPage = async () => {
  const authors = await fetch('https://jsonplaceholder.typicode.com/users', {
    cache: 'force-cache',
    next: {
      revalidate: 60,
    },
  });
  const authorsData = await authors.json();

  return (
    <div>
      <h1>Authors</h1>
      <ul>
        {authorsData.map((author: any) => (
          <li key={author.id}>{author.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AuthorsPage;
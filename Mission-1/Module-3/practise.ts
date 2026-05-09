interface Book {
  title: string;
  author: string;
  date: string;
}

const toggleReadStatus = (obj: Book) => {
  return {
    ...obj,
    isRead: true,
  };
};

const bookInfo = {
  title: "TypeScript Guide",
  author: "Jane Doe",
  publishedYear: 2024,
  isRead: true,
};

const result5 = toggleReadStatus(bookInfo);
console.log(result5);
export interface BookItem {
  title: string;
  author: string;
  cover: string;
  review: string;
  link?: string;
}

export const books: BookItem[] = [
  {
    title: "示例书单",
    author: "未知",
    cover: "",
    review: "这里放你的读书评价。添加更多书籍请编辑 src/config/readingConfig.ts",
    link: "",
  },
];

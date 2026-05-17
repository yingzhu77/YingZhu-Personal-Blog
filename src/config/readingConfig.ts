export interface BookItem {
  title: string;
  author: string;
  cover: string;
  review: string;
  link?: string;
}

export const books: BookItem[] = [
  {
    title: "鼠疫",
    author: "阿尔贝·加缪",
    cover: "/assets/reading/鼠疫.jpg",
    review: `读的时候总会回忆起几年前的疫情，这本书不只有《局外人》包含的一眼望不到头的窒息的哲学含义，还保留了许多希望。众生百态，灾难降临时有人寻求意义，有人依赖本能，也有人同流合污站在人的对立面，这就是人性吧。这样来想，那场疫情与一百年前的鼠疫也并无区别。

《鼠疫》（La Peste）是法国作家阿尔贝·加缪创作的长篇小说，也是其代表作，1947年首次出版。该作品构思于二战期间，以1941年—1942年阿尔及利亚发生的瘟疫为原型创作而成。

作家蒋方舟："这是一部无论篇幅、题材、文笔和主题都无可挑剔的小说。""我会反复阅读这本书，不断告诉自己什么是善，以及在动荡、战争、劫难的极端环境下怎样继续做一个善良的人，告诉自己怎样在集体的荒谬和失控中坚守正义。"`,
    link: "https://baike.baidu.com/item/%E9%BC%A0%E7%96%AB/7262967#reference-6",
  },
  {
    title: "示例书单",
    author: "未知",
    cover: "",
    review: "这里放你的读书评价。添加更多书籍请编辑 src/config/readingConfig.ts",
    link: "",
  },
];

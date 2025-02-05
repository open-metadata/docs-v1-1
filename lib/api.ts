import { DEFAULT_VERSION } from "./../constants/version.constants";
import fs from "fs";
import { join, basename } from "path";
import findIndex from "lodash/findIndex";
import matter from "gray-matter";
import slugify from "slugify";
import { serialize } from "next-mdx-remote/serialize";
import { ARTICLES_DIRECTORY } from "../constants/common.constants";

export function getAllFilesInDirectory(
  articleDirectory: string,
  files: string[] = []
) {
  fs.readdirSync(articleDirectory).forEach(function (file) {
    const subpath = join(articleDirectory, file);
    if (fs.lstatSync(subpath).isDirectory()) {
      getAllFilesInDirectory(subpath, files);
    } else {
      files.push(subpath);
    }
  });
  return files;
}

export function getArticleSlugs() {
  const files = getAllFilesInDirectory(ARTICLES_DIRECTORY);
  return files;
}

export function getArticleSlugFromString(pathname) {
  return slugify(pathname).toLowerCase();
}

export function getArticleBySlug(slug, fields = []) {
  const realSlug = basename(slug).replace(/\.md$/, "");
  const fullPath = slug;
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = realSlug;
    }
    if (field === "content") {
      items[field] = content;
    }
    if (data[field]) {
      items[field] = data[field];
    }
  });

  return items;
}

export function getAllArticles(fields = []) {
  const slugs = getArticleSlugs();
  const posts = slugs.map((slug) => getArticleBySlug(slug, fields));
  return posts;
}

export function getMenu(version?: string) {
  const menu = [];
  const fullPath = join(
    ARTICLES_DIRECTORY,
    version ? version : DEFAULT_VERSION,
    `menu.md`
  );
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const data = matter(fileContents);

  let menuRoot = menu;
  let objRoot = menu;

  const flatMenu = data.data["site_menu"];

  for (const index in flatMenu) {
    const item = flatMenu[index];
    const category = item["category"].split("/");
    // Move to the depth we need
    for (const depth in category) {
      const menu_key = slugify(category[depth].trim().toLowerCase());
      let exist = findIndex(menuRoot, { menu_key: menu_key });
      if (exist < 0) {
        menuRoot.push({
          menu_key: menu_key,
          name: category[depth].trim(),
          depth: depth,
          children: [],
        });
        exist = findIndex(menuRoot, { menu_key: menu_key });
      }
      objRoot = menuRoot[exist];
      menuRoot = menuRoot[exist]["children"];
    }
    Object.assign(objRoot, item);
    menuRoot = menu;
  }

  return menu;
}

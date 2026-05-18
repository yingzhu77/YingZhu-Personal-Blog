import { readFileSync, writeFileSync } from 'fs';

const files = [
  'src/components/layout/Navbar.astro',
  'src/components/common/ImageWrapper.astro',
  'src/components/common/CoverImage.astro',
  'src/pages/posts/[...slug].astro',
];

for (const file of files) {
  let c = readFileSync(file, 'utf8');
  // Fix: replace(/\/g, "/") -> replace(/\/g, "/")
  // The broken pattern is: forward-slash, backslash, forward-slash, g
  // The correct pattern is: forward-slash, backslash, backslash, forward-slash, g
  c = c.replace(/replace\(\/\\/g, "\/"\)/g, 'replace(/\\/g, "/")');
  writeFileSync(file, c);
  console.log('Fixed', file);
}

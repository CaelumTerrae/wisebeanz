import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Text, Root } from 'mdast';
import path from 'path';
import fs from 'fs';

const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g;

interface BeankProfileLink {
  type: 'wikiLink';
  url: string;
  children: Array<{ type: 'text'; value: string }>;
  data: {
    hName: 'a';
    hProperties: {
      href: string;
      className: string[];
    };
  };
}

const getAllBeanProfiles = () : string[] => {
  const beansDirectory = path.join(process.cwd(), 'content/beans');
  const filenames = fs.readdirSync(beansDirectory);
  
  return filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => filename.replace(/\.md$/, ''));
}

const remarkBeanProfileLinks: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node: Text) => {
      const matches = Array.from(node.value.matchAll(WIKI_LINK_REGEX));
      if (matches.length === 0) return;

      const children: (Text | BeankProfileLink)[] = [];
      let lastIndex = 0;

      matches.forEach((match) => {
        const [fullMatch, linkText] = match;
        const startIndex = match.index!;

        // Add text before the wiki link
        if (startIndex > lastIndex) {
          children.push({
            type: 'text',
            value: node.value.slice(lastIndex, startIndex),
          });
        }

        const beanProfile = getAllBeanProfiles().find(profile => profile.toLowerCase() === linkText.toLowerCase());

        const urlPrefix = beanProfile ? `/bean-profile/` : `/article/`;
        const url = `${urlPrefix}${linkText.toLowerCase()}`;

        // Add the wiki link
        children.push({
          type: 'wikiLink',
          url,
          children: [{ type: 'text', value: linkText }],
          data: {
            hName: 'a',
            hProperties: {
              href: url,
              className: ['wiki-link', 'text-blue-600', 'hover:text-blue-800', 'underline'],
            },
          },
        });

        lastIndex = startIndex + fullMatch.length;
      });

      // Add remaining text after the last wiki link
      if (lastIndex < node.value.length) {
        children.push({
          type: 'text',
          value: node.value.slice(lastIndex),
        });
      }

      Object.assign(node, {
        type: 'paragraph',
        children,
        value: undefined,
      });
    });
  };
}

export default remarkBeanProfileLinks; 
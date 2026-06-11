import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import { toString as hastToString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
import type { Root as MdastRoot, Code } from 'mdast'
import type { Root as HastRoot, Element } from 'hast'

export interface TocEntry {
  id: string
  text: string
  depth: 2 | 3
}

export interface RenderedArticle {
  html: string
  toc: TocEntry[]
  hasMermaid: boolean
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Mermaid fences become a placeholder <pre class="mermaid-src"> that a client
 * component renders into an SVG. Must run before rehype-pretty-code so the
 * highlighter never sees them.
 */
function remarkMermaid() {
  return (tree: MdastRoot) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (node.lang !== 'mermaid' || !parent || index === undefined) return
      parent.children[index] = {
        type: 'html',
        value: `<div class="mermaid-block" data-mermaid><pre class="mermaid-src" hidden>${escapeHtml(node.value)}</pre><div class="mermaid-target" aria-label="diagram"></div></div>`,
      }
    })
  }
}

/** Collect h2/h3 headings (after rehype-slug assigns ids) for the TOC. */
function rehypeCollectToc(toc: TocEntry[]) {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'h2' && node.tagName !== 'h3') return
      const id = node.properties?.id
      if (typeof id !== 'string') return
      toc.push({
        id,
        text: hastToString(node),
        depth: node.tagName === 'h2' ? 2 : 3,
      })
    })
  }
}

export async function renderMarkdown(markdown: string): Promise<RenderedArticle> {
  const toc: TocEntry[] = []

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMermaid)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeCollectToc, toc)
    .use(rehypePrettyCode, {
      theme: 'github-dark-default',
      keepBackground: false,
      defaultLang: 'text',
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)

  const html = String(file)
  return { html, toc, hasMermaid: html.includes('data-mermaid') }
}

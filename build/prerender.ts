import path from 'path';
import fs from 'fs';
import { build as esbuild } from 'esbuild';
import type { Plugin } from 'vite';

const SITE = 'https://neuraldecode.vercel.app';
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

interface SeoArch {
  id: string;
  name: string;
  description: string;
  track: string;
  keywords: string[];
}

/**
 * After the build, write one static HTML page per architecture (dist/architecture/<id>/index.html) with its own
 * title, description, canonical URL and social-card tags, plus sitemap.xml and robots.txt.
 * The app boots normally on every page; crawlers and link previews simply see real metadata.
 */
export function prerenderArchitectures(root: string): Plugin {
  return {
    name: 'prerender-architecture-pages',
    apply: 'build',
    async closeBundle() {
      const dist = path.resolve(root, 'dist');
      const tmp = path.resolve(root, 'node_modules/.cache/seo-architectures.mjs');
      await esbuild({ entryPoints: [path.resolve(root, 'src/data/seo.ts')], bundle: true, platform: 'node', format: 'esm', outfile: tmp, logLevel: 'error' });
      const { SEO_ARCHITECTURES } = (await import(`${tmp}?t=${Date.now()}`)) as { SEO_ARCHITECTURES: SeoArch[] };
      const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

      const setMeta = (html: string, attr: string, key: string, value: string) =>
        html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*"`), `$1${esc(value)}"`);

      const page = (t: SeoArch) => {
        const title = `${t.name} in 3D — NeuralDecode`;
        const desc = `${t.description} Explore every layer and tensor shape in interactive 3D, with a guided tour and quiz. ${t.track} track.`.trim();
        const url = `${SITE}/architecture/${t.id}`;
        let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
        html = setMeta(html, 'name', 'title', title);
        html = setMeta(html, 'name', 'description', desc);
        html = setMeta(html, 'name', 'keywords', t.keywords.join(', '));
        for (const p of ['og', 'twitter']) {
          html = setMeta(html, 'property', `${p}:url`, url);
          html = setMeta(html, 'property', `${p}:title`, title);
          html = setMeta(html, 'property', `${p}:description`, desc);
        }
        return html.replace('</head>', `  <link rel="canonical" href="${url}" />\n  </head>`);
      };

      for (const t of SEO_ARCHITECTURES) {
        const dir = path.join(dist, 'architecture', t.id);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), page(t));
      }
      const urls = [`${SITE}/`, ...SEO_ARCHITECTURES.map((t) => `${SITE}/architecture/${t.id}`)];
      fs.writeFileSync(
        path.join(dist, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`,
      );
      fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /embed/\nSitemap: ${SITE}/sitemap.xml\n`);
      console.log(`prerendered ${SEO_ARCHITECTURES.length} architecture pages + sitemap.xml`);
    },
  };
}

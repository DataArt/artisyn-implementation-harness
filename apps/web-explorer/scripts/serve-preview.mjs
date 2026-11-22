// Local preview server with the GitHub Pages rules: dir/ serves dir/index.html, /dir answers
// 301 to /dir/, an existing file is served with its content type, and any other path,
// including /docs/*, gets the root 404.html with status 404. Serves .preview/, where the
// preview target puts a copy of out/ re-signed for this origin. Text responses are gzipped
// when the client accepts it, as GitHub Pages does.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile();
const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();

/** The site lives one folder down (the base path), so its 404.html is <root>/<base>/404.html. */
function notFoundPage(root) {
  const base = fs.readdirSync(root).find((name) => isFile(path.join(root, name, '404.html')));
  return base ? path.join(root, base, '404.html') : undefined;
}

const COMPRESSIBLE = new Set(['.html', '.txt', '.js', '.css', '.json', '.xml', '.svg']);

function send(req, res, status, file) {
  const ext = path.extname(file);
  const headers = { 'content-type': CONTENT_TYPES[ext] ?? 'application/octet-stream' };
  if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
    res.writeHead(status, { ...headers, 'content-encoding': 'gzip', vary: 'Accept-Encoding' });
    fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res);
    return;
  }
  res.writeHead(status, headers);
  fs.createReadStream(file).pipe(res);
}

/** A server for `root` (a folder holding the site under its base path). */
export function createPreviewServer(root) {
  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    const target = path.join(root, decodeURIComponent(pathname));
    const missing = () => {
      const page = notFoundPage(root);
      if (page) send(req, res, 404, page);
      else res.writeHead(404).end('Not found');
    };

    if (target !== root && !target.startsWith(root + path.sep)) return missing();
    if (pathname.endsWith('/')) {
      const index = path.join(target, 'index.html');
      return isFile(index) ? send(req, res, 200, index) : missing();
    }
    if (isFile(target)) return send(req, res, 200, target);
    if (isDir(target)) return res.writeHead(301, { location: `${pathname}/` }).end();
    return missing();
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const root = path.resolve(process.argv[2] ?? '.preview');
  const port = Number(process.env.PORT ?? 4173);
  createPreviewServer(root).listen(port, '127.0.0.1', () => {
    const base = fs.readdirSync(root).find((name) => isDir(path.join(root, name)));
    console.log(`serve-preview: http://localhost:${port}/${base ?? ''}${base ? '/' : ''}`);
  });
}

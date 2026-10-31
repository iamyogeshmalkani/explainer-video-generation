// Runs the explainroo CLI with ffmpeg and ffprobe set, because they are not on PATH on this Mac.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
process.env.EXPLAINROO_FFMPEG ||= path.resolve(root, '..', 'tools', 'node_modules', 'ffmpeg-static', 'ffmpeg');
process.env.EXPLAINROO_FFPROBE ||= path.resolve(root, '..', 'tools', 'node_modules', '@ffprobe-installer', 'darwin-arm64', 'ffprobe');
const { main } = await import(path.join(root, 'src', 'cli.js'));
const finish = (code) => { process.exitCode = code; setTimeout(() => process.exit(code), 5000).unref(); };
main(process.argv.slice(2)).then((c) => finish(c ?? 0), (e) => { process.stderr.write(`${e && e.stack ? e.stack : e}\n`); finish(1); });

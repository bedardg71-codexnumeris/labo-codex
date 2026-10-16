import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { construire, DOSSIERS } from '../../scripts/construire-publication.mjs';

// SENTINELLE (16 octobre 2026) — NETLIFY NE PUBLIE QUE L'APPLICATION.
//
// Mesuré le 16 oct. : avec `publish = "."`, chaque déploiement, aperçu de PR
// compris, servait tout l'arbre du dépôt, documents de travail inclus, et ses
// permaliens restaient ouverts. Le répertoire de publication est désormais
// construit par une LISTE BLANCHE (scripts/construire-publication.mjs).
//
// Ce banc garde les deux côtés :
//   1. rien ne manque : tout ce que l'application référence existe dans le
//      dossier construit (sinon l'application casse en ligne) ;
//   2. rien ne déborde : le dossier ne contient que la liste blanche, et aucun
//      document (sinon la fuite revient).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

let dest;
let fichiers;
beforeAll(() => {
    dest = mkdtempSync(path.join(os.tmpdir(), 'publication-'));
    fichiers = new Set(construire(dest));
});
afterAll(() => rmSync(dest, { recursive: true, force: true }));

const nettoyer = (ref) => decodeURI(ref.split(/[?#]/)[0].replace(/^\.\//, ''));
const estLocal = (ref) => !/^(https?:|mailto:|data:|javascript:|blob:|#|\/\/)/.test(ref) && ref.trim() !== '';

describe('rien ne manque : ce que l\'application charge est publié', () => {
    it('chaque src et href local d\'index.html existe dans la publication', () => {
        const refs = [...lire('index.html').matchAll(/\b(?:src|href)="([^"]+)"/g)]
            .map((m) => m[1]).filter(estLocal).map(nettoyer);
        expect(refs.length).toBeGreaterThan(200);
        expect(refs.filter((r) => !fichiers.has(r))).toEqual([]);
    });

    it('chaque url() des feuilles de style existe dans la publication', () => {
        const feuilles = ['styles.css', ...readdirSync(path.join(racine, 'css')).map((f) => `css/${f}`)];
        const refs = feuilles.flatMap((f) => [...lire(f).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)]
            .map((m) => m[1]).filter(estLocal)
            .map((r) => nettoyer(path.posix.normalize(path.posix.join(path.posix.dirname(f), r)))));
        expect(refs.length).toBeGreaterThan(0);
        expect(refs.filter((r) => !fichiers.has(r))).toEqual([]);
    });

    it('chaque chemin écrit en dur dans le code (workers, pack démo, images, version.json) existe', () => {
        const prefixes = DOSSIERS.join('|');
        const motif = new RegExp(`['"\`]((?:${prefixes})/[^'"\`?#$*{}\\s]+\\.(?:js|css|svg|png|json))[?'"\`#]`, 'g');
        const refs = new Set(['version.json']);
        for (const f of fichiers) {
            if (!f.startsWith('js/') || !f.endsWith('.js')) continue;
            // Les lignes de commentaire citent des fichiers retirés : seul le code compte.
            const code = readFileSync(path.join(dest, f), 'utf8').split('\n')
                .filter((l) => !/^\s*(\/\/|\/?\*)/.test(l)).join('\n');
            for (const m of code.matchAll(motif)) refs.add(m[1]);
        }
        for (const attendu of ['libs/pdf.worker.min.js', 'js/heic-worker.js', 'js/pack-demo-10.js', 'img/logo-codex-numeris.svg']) {
            expect(refs.has(attendu), `${attendu} n'est plus repéré dans le code : le motif est à revoir`).toBe(true);
        }
        expect([...refs].filter((r) => !fichiers.has(r))).toEqual([]);
    });
});

describe('rien ne déborde : la publication ne contient que la liste blanche', () => {
    it('la racine publiée est exactement la liste blanche arrêtée le 16 oct. 2026', () => {
        // Liste écrite ICI, pas lue dans le script : élargir la publication
        // demande de changer ce banc, délibérément.
        const racinePubliee = [...new Set([...fichiers].map((f) => f.split('/')[0]))].sort();
        expect(racinePubliee).toEqual(['autocollants', 'css', 'icons', 'img', 'index.html', 'js', 'libs',
            'styles.css', 'version.js', 'version.json']);
    });

    it('aucun document Markdown n\'est publié, même dans un dossier permis', () => {
        expect([...fichiers].filter((f) => /\.md$/i.test(f))).toEqual([]);
    });

    it('les documents de travail du dépôt restent dehors', () => {
        for (const f of ['DEPLOY.md', 'SESSION.md', 'BACKLOG.md', 'OU-EN-EST-ON.md', 'netlify.toml', 'design-system.html']) {
            expect(fichiers.has(f), f).toBe(false);
        }
        for (const d of ['docs/', 'plans de travail/', 'Retours des testeurs/', 'tests/', 'scripts/', 'Rapports/']) {
            expect([...fichiers].some((f) => f.startsWith(d)), d).toBe(false);
        }
    });

    it('netlify.toml publie le dossier construit, par le script', () => {
        const build = lire('netlify.toml').split(/^\[build\]$/m)[1].split(/^\[/m)[0];
        expect(build).toMatch(/^\s*publish\s*=\s*"publication"\s*$/m);
        expect(build).toMatch(/^\s*command\s*=\s*"node scripts\/construire-publication\.mjs"\s*$/m);
    });
});

// Socle des mesures du chantier dépistage : un navigateur WebKit jetable, le code d'un commit précis,
// et les seules clés utiles d'un codex. Aucune donnée ni aucun résultat ne s'écrit dans le dépôt.
// Mode d'emploi : LISEZMOI.md, à côté de ce fichier.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const DEPOT = path.resolve(ICI, '..', '..');
const require = createRequire(path.join(DEPOT, 'tests', 'package.json'));
const { webkit } = require('@playwright/test');

// Ni les annotations, ni les fichiers, ni le confidentiel, ni les correspondances d'anonymisation :
// le calcul n'en a pas besoin, et ils n'ont donc pas à entrer dans le navigateur.
const EXCLUS = /annotationsTravaux|fichiersTravaux|corbeille|chronoEvaluations|snapshot|registreLongitudinal|confidentiel|simulation_|rapportsBug|planification|questionnaireBilan|autoreflexionBilan|parcoursBilan|brouillon|mapping_anonymisation|_copiesAuxArchives|_manifesteReserve|^a2024_|__bak|__avant/;

function exiger(nom) {
    const valeur = process.env[nom];
    if (!valeur) throw new Error(`Variable ${nom} manquante : voir LISEZMOI.md.`);
    return path.resolve(valeur);
}

function horsDuDepot(chemin) {
    const relatif = path.relative(DEPOT, chemin);
    if (!relatif.startsWith('..') && !path.isAbsolute(relatif)) {
        throw new Error(`${chemin} est dans le dépôt : données et résultats restent dehors.`);
    }
    return chemin;
}

/** Où écrire l'agrégat : toujours hors du dépôt. */
export function ecrireAgregat(nom, objet) {
    const sortie = horsDuDepot(exiger('MESURE_SORTIE'));
    const fichier = path.join(sortie, nom);
    writeFileSync(fichier, JSON.stringify(objet, null, 1));
    console.log('agrégat :', fichier);
}

export function adresseDuSite() {
    const site = horsDuDepot(exiger('MESURE_SITE'));
    if (!existsSync(path.join(site, 'index.html'))) throw new Error(`${site} n'a pas d'index.html.`);
    const commit = execFileSync('git', ['-C', site, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const sale = execFileSync('git', ['-C', site, 'status', '--porcelain'], { encoding: 'utf8' }).trim();
    if (sale) throw new Error(`${site} a des changements : la mesure doit tourner sur un commit exact.`);
    console.log('commit du code :', commit);
    return pathToFileURL(path.join(site, 'index.html')).href;
}

async function empreinte(fichier) {
    const hash = createHash('sha256');
    for await (const morceau of createReadStream(fichier)) hash.update(morceau);
    return hash.digest('hex');
}

/** N'extrait du codex que `donnees.json`, le lit, et efface l'extraction : les copies numérisées ne sortent pas du ZIP. */
export async function lireCodex() {
    const codex = exiger('MESURE_CODEX');
    console.log('empreinte SHA-256 du codex :', await empreinte(codex));
    const travail = mkdtempSync(path.join(tmpdir(), 'mesure-depistage-'));
    try {
        execFileSync('unzip', ['-q', '-o', codex, 'donnees.json', '-d', travail]);
        return JSON.parse(readFileSync(path.join(travail, 'donnees.json'), 'utf8'));
    } finally {
        rmSync(travail, { recursive: true, force: true });
    }
}

export async function ouvrirNavigateur() {
    const b = await webkit.launch();
    const page = await (await b.newContext()).newPage();
    let nbErr = 0;
    page.on('pageerror', () => { nbErr++; });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(adresseDuSite());
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 40000 });
    return { b, page, erreurs: () => nbErr };
}

/** Un navigateur vierge, garni des clés utiles du codex. Une session par trimestre : aucune ne déteint sur l'autre. */
export async function ouvrir(o) {
    const { b, page, erreurs } = await ouvrirNavigateur();
    const cles = Object.keys(o).filter((k) => !EXCLUS.test(k));
    for (let i = 0; i < cles.length; i += 40) {
        const lot = Object.fromEntries(cles.slice(i, i + 40).map((k) => [k, o[k]]));
        await page.evaluate(async (lot) => { for (const [k, v] of Object.entries(lot)) await db.set(k, v); }, lot);
    }
    await page.evaluate(() => db.setSync('backupNePlusRappeler', 'true'));
    return { b, page, cles, erreurs };
}

export async function basculer(page, t) {
    await page.evaluate((t) => { window.changerTrimestreActif(t); }, t);
    await page.reload();
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 60000 });
    await page.waitForTimeout(2500);
}

export const dimanches = (de, a) => {
    const r = [];
    for (let t = Date.parse(de + 'T12:00:00Z'); t <= Date.parse(a + 'T12:00:00Z'); t += 7 * 864e5) r.push(new Date(t).toISOString().slice(0, 10));
    return r;
};

// Les trois trimestres mesurés. La grille désignée est une supposition déclarée dans chaque rapport :
// le réglage enregistré désigne une grille d'A2026, absente des deux trimestres passés.
export const PLANS = [
    { t: 'a2025', grilleNom: 'Grille-5 FR-HOLIS-30 A25', debut: '2025-08-21', fin: '2025-12-12', coupes: [...dimanches('2025-08-31', '2025-12-14'), '2025-12-31'] },
    { t: 'h2026', grilleNom: 'Grille-5 FR-HOLIS H26', debut: '2026-01-21', fin: '2026-05-25', coupes: [...dimanches('2026-01-25', '2026-05-24'), '2026-05-31'] },
    { t: 'a2026', grilleNom: null, debut: '2026-08-20', fin: '2026-12-11', coupes: [...dimanches('2026-08-23', '2026-10-25'), '2026-10-30'] },
];

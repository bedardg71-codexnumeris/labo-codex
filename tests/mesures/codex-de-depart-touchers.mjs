#!/usr/bin/env node
// =======================================================================
// LE GESTE D'OUVERTURE D'UN CODEX DE DÉPART, COMPTÉ EN TOUCHERS (20 nov. 2026, branche d'essai `apercu/essai-parcours`)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-19-codex-de-depart.md, point 6. De la page departs.html jusqu'à la première bulle
// du parcours, en toucher simulé (Chromium, écran tactile, l'iPad Air en portrait 820 × 1180 et en paysage 1180 × 820),
// sur la publication construite (scripts/construire-publication.mjs) servie en http, comme l'aperçu.
//     cd tests && node mesures/codex-de-depart-touchers.mjs
// Avant chaque toucher, la cible doit être dans la fenêtre et non couverte (le point touché tombe sur elle) : sinon,
// c'est une ACCROCHE, nommée ; une cible hors de la fenêtre coûte un glissement de plus.
// Ce que Chromium ne joue pas, et qui est compté À PART comme inféré : la question de Safari avant un téléchargement
// (« Télécharger »), et la fenêtre de fichiers de l'iPad (un toucher sur le fichier s'il est dans « Récents »).
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const { construire } = await import(path.join(racine, 'scripts', 'construire-publication.mjs'));
const { DEPARTS } = await import(path.join(racine, 'tests', 'departs-de-parcours', 'departs.js'));

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.zip': 'application/zip', '.woff2': 'font/woff2', '.mjs': 'text/javascript' };
const UA_IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';

const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-touchers-'));
construire(dossier);
const serveur = http.createServer((req, res) => {
    let chemin = decodeURIComponent(req.url.split('?')[0]);
    if (chemin.endsWith('/')) chemin += 'index.html';
    const f = path.join(dossier, chemin);
    if (!f.startsWith(dossier) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
});
await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${serveur.address().port}/`;

const navigateur = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});

/** Où tombe le doigt : la cible est-elle dans la fenêtre, et est-ce elle qu'on touche ? */
async function examiner(page, sel) {
    return page.evaluate((s) => {
        const el = [...document.querySelectorAll(s)].find((x) => x.offsetParent !== null || x.getClientRects().length);
        if (!el) return { etat: 'absente' };
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return { etat: 'hors de la fenêtre' };
        const dessus = document.elementFromPoint(x, y);
        if (dessus && (dessus === el || el.contains(dessus))) return { etat: 'libre' };
        const nom = dessus ? (dessus.id ? '#' + dessus.id : dessus.className && typeof dessus.className === 'string' ? '.' + dessus.className.split(' ')[0] : dessus.tagName) : 'rien';
        return { etat: 'couverte par ' + nom };
    }, sel);
}

async function mesurer(depart, largeur, hauteur) {
    const ctx = await navigateur.newContext({ viewport: { width: largeur, height: hauteur }, hasTouch: true, isMobile: true,
        deviceScaleFactor: 1, userAgent: UA_IPAD, acceptDownloads: true });
    const page = await ctx.newPage();
    page.setDefaultTimeout(30000);
    const journal = [];
    let touchers = 0;
    const toucher = async (sel, quoi) => {
        let e = await examiner(page, sel);
        if (e.etat === 'hors de la fenêtre') {
            touchers++;
            journal.push(`glisser pour amener « ${quoi} » dans la fenêtre (accroche)`);
            await page.locator(sel).first().scrollIntoViewIfNeeded();
            e = await examiner(page, sel);
        }
        if (e.etat !== 'libre') {
            journal.push(`ACCROCHE : « ${quoi} » ${e.etat}`);
            // Ce qui couvre est d'abord écarté par le geste qu'une personne ferait : attendre qu'il parte.
            await page.waitForFunction(([s]) => {
                const el = [...document.querySelectorAll(s)].find((x) => x.offsetParent !== null);
                if (!el) return false;
                const r = el.getBoundingClientRect(); const d = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                return d && (d === el || el.contains(d));
            }, [sel], { timeout: 15000 }).then(() => journal.push(`  (« ${quoi} » libéré en attendant)`)).catch(() => {});
        }
        touchers++;
        journal.push(`${touchers}. ${quoi}`);
        await page.locator(sel).filter({ visible: true }).first().tap();
    };

    await page.goto(base + 'departs.html');
    // 1. Le fichier, téléchargé.
    const telechargement = page.waitForEvent('download');
    await toucher(`[data-parcours="${depart.parcours}"] a[download]`, 'Télécharger le fichier');
    const dl = await telechargement;
    const fichier = path.join(dossier, '..', 'touchers-' + depart.fichier);
    await dl.saveAs(fichier);
    // 2. L'application.
    await Promise.all([page.waitForURL(base), toucher(`[data-parcours="${depart.parcours}"] a.app`, "Ouvrir l'application")]);
    await page.waitForFunction(() => window.Codex && window.Assistance && document.readyState === 'complete');
    await page.waitForTimeout(1200);
    await page.evaluate(() => { delete window.showOpenFilePicker; });   // Safari n'en a pas
    // 3. Codex, Ouvrir un codex, le fichier.
    await toucher('#btn-codex', 'Codex');
    const choix = page.waitForEvent('filechooser');
    await toucher('#codex-menu [data-action="Codex.actionOuvrir"]', 'Ouvrir un codex');
    await (await choix).setFiles(fichier);
    touchers++;
    journal.push(`${touchers}. le fichier, dans la fenêtre de fichiers de l'iPad (inféré : un toucher s'il est dans « Récents »)`);
    // 4. Recharger.
    await page.locator('#overlay-ui-dialogue').getByRole('button', { name: 'Recharger', exact: true }).waitFor();
    await Promise.all([page.waitForEvent('load'), toucher('#overlay-ui-dialogue .btn-confirmer, #overlay-ui-dialogue button:last-child', 'Recharger')]);
    await page.waitForFunction(() => window.Codex && window.Assistance && document.readyState === 'complete');
    // Le rappel « Mets ton codex à jour » s'ouvre 1,5 s après le chargement s'il est dû : on lui laisse le temps.
    await page.waitForTimeout(2500);
    const apres = await page.evaluate(() => [...document.querySelectorAll('.overlay.actif, [id^="overlay"].actif, .modal.actif')]
        .filter((o) => o.offsetParent !== null || getComputedStyle(o).display !== 'none').map((o) => o.id || o.className));
    if (apres.length) journal.push('après le rechargement, ouvert : ' + apres.join(', '));
    if (apres.includes('overlay-backup-reminder')) {
        journal.push('ACCROCHE : le rappel « Mets ton codex à jour » couvre le menu');
        await toucher('#overlay-backup-reminder [data-action="backupReminder.gererChoixRappel"]', 'Plus tard (le rappel)');
    }
    // 5. Le menu, Assistance, « Nous faisons ».
    await toucher('#entete-menu-bouton', 'le menu ☰');
    await toucher('#btn-assistance-menu', 'Assistance');
    await toucher(`#panneau-assistance [data-parcours="${depart.parcours}"] .assistance-parcours-bouton`, `« Nous faisons » de « ${depart.titre} »`);
    await page.waitForFunction((t) => {
        const r = document.querySelector('#parcours-bulle .parcours-bulle-rang');
        return r && r.textContent.trim() === '1 sur ' + t;
    }, depart.premiereBulle.total);
    journal.push('→ la première bulle : « ' + await page.locator('#parcours-bulle .parcours-bulle-titre').textContent() + ' »');
    await ctx.close();
    return { touchers, journal };
}

const resultats = [];
for (const d of DEPARTS) {
    for (const [l, h, nom] of [[820, 1180, 'portrait'], [1180, 820, 'paysage']]) {
        const r = await mesurer(d, l, h);
        resultats.push({ depart: d.titre, ecran: nom, ...r });
        console.warn(`\n« Départ : ${d.titre} », ${nom} (${l} × ${h}) : ${r.touchers} touchers simulés, + 1 inféré (« Télécharger » de Safari)`);
        r.journal.forEach((j) => console.warn('   ' + j));
    }
}
await navigateur.close();
serveur.close();
fs.rmSync(dossier, { recursive: true, force: true });
if (process.env.TOUCHERS_JSON) fs.writeFileSync(process.env.TOUCHERS_JSON, JSON.stringify(resultats, null, 2));

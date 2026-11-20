import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// #1298 (19 nov. 2026) — LE DIAGNOSTIC DES COPIES LIÉES, au navigateur : Réglages › Données › Maintenance,
// « Copies liées à leur source ». Le stock est semé tel que l'ancien « Dupliquer » le laissait : une copie qui
// partage `criteres` avec sa source, écrite d'un seul `db.set` (IndexedDB garde le partage). Le banc juge :
//   · que la paire est NOMMÉE, avec son chemin, en petite collection et en grande (servie par le cache mémoire) ;
//   · qu'une paire au contenu identique mais aux objets distincts n'est PAS signalée ;
//   · LA LECTURE SEULE : aucune écriture dans IndexedDB (put, add, delete, clear) ni dans le localStorage pendant la
//     vérification, et la base relue après est identique à celle d'avant ;
//   · « Copier le résultat » paraît ; les deux boutons font 44 px au moins (doigt, iPad).
// Données FICTIVES. ⚠ Chromium n'est pas Safari : un vert ici est un indice. Captures : CAPTURES_1298=<dossier>.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.resolve(__dirname, '..', '..', 'index.html');
const CAPTURES = process.env.CAPTURES_1298;

async function ouvrir(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2032', nom: 'Automne 2032', actif: true }]);
        db.setSync('trimestreActif', 'a2032');
        db.setSync('backupNePlusRappeler', 'true');
    });
    await page.reload();
    await attendreApplication(page);
}

/** Le stock : une paire liée (et, au besoin, une paire indépendante au même contenu), puis la page rechargée. */
async function semer(page, { gros = false, liee = true } = {}) {
    await page.evaluate(async ({ gros, liee }) => {
        const criteres = [{ id: 'CR_A_1298', nom: 'Pertinence fictive', type: 'holistique', ponderation: 100, descripteurs: { parNiveau: { D: 'Texte fictif' } } }];
        const l = [
            { id: 'GRILLE_SRC_1298', nom: 'Grille fictive', criteres },
            { id: 'GRILLE_COPIE_1298', nom: 'Grille fictive (copie)', criteres: liee ? criteres : JSON.parse(JSON.stringify(criteres)) }
        ];
        const rempli = gros ? Array.from({ length: 30 }, (_, i) => ({ id: 'REMPLI_' + i, nom: 'Remplissage ' + i, criteres: [], description: 'x'.repeat(1200) })) : [];
        await db.set(cle('grillesTemplates'), l.concat(rempli));   // security-ok: banc, données fictives
        await db.flush();
    }, { gros, liee });
    await page.reload();
    await attendreApplication(page);
}

/** Toute la base IndexedDB, en texte (pour comparer avant et après). */
const photoBase = (page) => page.evaluate(async () => JSON.stringify((await db._getAllIndexedDB()).map((r) => [r.key, r.value]).sort((a, b) => (a[0] < b[0] ? -1 : 1))));

/** Touche « Vérifier les copies liées », compte les écritures pendant la vérification, rend le texte affiché. */
async function verifier(page) {
    await page.evaluate(() => naviguerVers('reglages', 'donnees'));
    const accordeon = page.locator('#accordeon-maintenance');
    if (await accordeon.evaluate((el) => el.classList.contains('ferme'))) await accordeon.locator('.accordeon-header').tap();
    const bouton = page.locator('#section-copies-liees [data-action="verifierCopiesLiees"]');
    await bouton.scrollIntoViewIfNeeded();
    await expect(bouton).toBeVisible();
    // Les écritures, comptées à la source : IndexedDB et localStorage.
    await page.evaluate(() => {
        window.__ecritures1298 = [];
        const S = IDBObjectStore.prototype;
        for (const m of ['put', 'add', 'delete', 'clear']) {
            const avant = S[m];
            S[m] = function (...a) { window.__ecritures1298.push('idb.' + m + ' ' + (a[0] && a[0].key !== undefined ? a[0].key : a[0])); return avant.apply(this, a); };
        }
        for (const m of ['setItem', 'removeItem', 'clear']) {
            const avant = Storage.prototype[m];
            Storage.prototype[m] = function (...a) { window.__ecritures1298.push('ls.' + m + ' ' + a[0]); return avant.apply(this, a); };
        }
    });
    // La base photographiée au bord exact de la vérification : ouvrir Réglages écrit l'état de ses accordéons.
    const avant = await photoBase(page);
    await bouton.tap();
    const zone = page.locator('#resultatCopiesLiees');
    await expect(zone).toBeVisible();
    await expect(zone).not.toHaveText('Vérification en cours…');
    const ecritures = await page.evaluate(() => window.__ecritures1298.slice());
    return { texte: await zone.textContent(), ecritures, avant, apres: await photoBase(page) };
}

for (const vue of [{ nom: 'paysage', width: 1180, height: 820 }, { nom: 'portrait', width: 820, height: 1180 }]) {
    test.describe(`#1298 · Copies liées à leur source — le diagnostic (${vue.nom}, ${vue.width} × ${vue.height})`, () => {
        test.use({ viewport: { width: vue.width, height: vue.height }, hasTouch: true });

        for (const gros of [false, true]) {
            test(`une paire liée est nommée, sans rien écrire (${gros ? 'grande collection, cache mémoire' : 'petite collection'})`, async ({ page }) => {
                const erreurs = [];
                page.on('pageerror', (e) => erreurs.push(e.message));
                await ouvrir(page);
                await semer(page, { gros });
                expect(await page.evaluate(async () => {
                    const l = await db.get(cle('grillesTemplates'));
                    return l[0].criteres === l[1].criteres;
                })).toBe(true);   // le stock est bien lié
                const r = await verifier(page);
                expect(r.texte).toContain('1 paire liée :');
                expect(r.texte).toContain('· Grilles [a2032_grillesTemplates] : « Grille fictive » (GRILLE_SRC_1298) et « Grille fictive (copie) » (GRILLE_COPIE_1298) partagent criteres');
                expect(r.ecritures).toEqual([]);
                expect(r.apres).toBe(r.avant);
                // Le lien n'a pas été défait par la lecture.
                expect(await page.evaluate(async () => {
                    const l = await db.get(cle('grillesTemplates'));
                    return l[0].criteres === l[1].criteres;
                })).toBe(true);
                const copier = page.locator('#btnCopierCopiesLiees');
                await expect(copier).toBeVisible();
                for (const b of [copier, page.locator('#section-copies-liees [data-action="verifierCopiesLiees"]')]) {
                    expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
                }
                if (CAPTURES && !gros) {
                    for (const mode of ['sombre', 'clair']) {
                        await page.evaluate((m) => document.body.classList.toggle('mode-clair', m === 'clair'), mode);
                        await page.locator('#section-copies-liees').screenshot({ path: path.join(CAPTURES, `copies-liees-${vue.width}x${vue.height}-${mode}.png`) });
                    }
                }
                expect(erreurs).toEqual([]);
            });
        }

        test('deux grilles au même contenu mais aux objets distincts : rien n’est signalé', async ({ page }) => {
            await ouvrir(page);
            await semer(page, { liee: false });
            const r = await verifier(page);
            expect(r.texte).toContain('Aucune copie liée parmi les grilles, échelles, cartouches, productions et pratiques.');
            expect(r.ecritures).toEqual([]);
            expect(r.apres).toBe(r.avant);
        });
    });
}

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT I (#985, D8) — LE RAPPEL MÈNE AU CODEX ; UNE MISE À JOUR RÉUSSIE LE REPOUSSE
// =======================================================================
//
// Vécu le 29 sept. 2026 (iPad) : le rappel de la copie de secours revenait à l'ouverture
// alors que le codex venait d'être mis à jour. Mesuré avant le lot : rien dans codex.js
// n'écrivait `backupProchainRappel`, et la croix ne posait aucune date.
//
// Ce banc éprouve, sur le vrai code, avec un faux `navigator.share` (le chemin de l'iPad) :
//   (1) le rappel dit les mots de D8 ; son bouton principal lance « Mettre à jour le
//       codex », sans codex ouvert ; la réussite repousse le rappel de 14 jours, le clic seul
//       ne pose rien (aperçu refusé : rien) ;
//   (2) depuis le menu : un partage refusé et « Il n'y est pas » ne repoussent rien ;
//       « Il y est » repousse ;
//   (3) la croix repousse de 14 jours ;
//   (4) le stock : « Ne plus rappeler » reste posé après une mise à jour (definirProchainRappel
//       l'efface : le report ne doit pas passer par elle) ; une date plus lointaine déjà
//       choisie est gardée.
//
// Pack démo, noms fictifs. Aucune écriture disque.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    return erreurs;
}

async function demarrerDemo(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        sessionStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
}

/** Faux partage piloté, aperçu piloté, téléchargements interceptés. */
async function poserOutils(page) {
    await page.evaluate(() => {
        delete window.showSaveFilePicker;
        window.__reponsesPartage = [];          // 'AbortError' | 'NotAllowedError' | 'ok'
        Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
        Object.defineProperty(navigator, 'share', {
            configurable: true,
            value: async () => {
                const r = window.__reponsesPartage.shift() || 'ok';
                if (r === 'ok') return;
                const e = new Error('refus simulé (' + r + ')');
                e.name = r;
                throw e;
            }
        });
        window.__reponseApercu = true;
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => window.__reponseApercu;
        const clickOrig = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function () {
            if (this.download) return;
            return clickOrig.call(this);
        };
    });
}

/** Les deux clés du rappel ; le report en jours entiers (null si aucune date). */
const lireRappel = (page) => page.evaluate(() => {
    const d = db.getSync('backupProchainRappel', null);
    return {
        jours: d ? Math.round((new Date(d) - Date.now()) / 86400000) : null,
        nePlusRappeler: db.getSync('backupNePlusRappeler', null)
    };
});

const effacerRappel = (page) => page.evaluate(() => {
    db.setSync('backupProchainRappel', null);
    db.setSync('backupNePlusRappeler', null);
});

/** Relève l'état avant un geste ; codexAJour attend qu'une écriture l'ait changé (sans codex, « à jour » est vrai d'emblée). */
const noterAvant = (page) => page.evaluate(() => { window.__avant = Codex.etat().derniereSauvegarde; });
const codexAJour = (page) => page.waitForFunction(() => {
    const e = Codex.etat();
    return e.actif && !e.modificationsNonSauvees && e.derniereSauvegarde !== window.__avant;
}, null, { timeout: 30000 });

async function attendreModale(page, titre) {
    await page.waitForFunction((t) => {
        const o = document.getElementById('overlay-ui-dialogue');
        return o && o.querySelector('.modal-titre').textContent === t;
    }, titre, { timeout: 30000 });
}

async function cliquerBouton(page, texte) {
    await page.evaluate((t) => {
        const b = Array.from(document.querySelectorAll('#overlay-ui-dialogue .modal-actions button')).find((x) => x.textContent === t);
        b.click();
    }, texte);
}

const TEXTE_D8 = 'Tes données vivent dans ce navigateur : elles peuvent être perdues si tu effaces ' +
    'les données de sites, changes de navigateur ou d\'ordinateur. Ton codex en garde une copie ' +
    'complète, copies de tes étudiant·es comprises, que tu rouvres sur n\'importe quel appareil.';

test.describe('Lot I (#985) — le rappel mène au codex', () => {
    test.setTimeout(180000);

    test('(1) le rappel propose le codex ; sa réussite le repousse, pas son clic', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        await poserOutils(page);
        expect(await page.evaluate(() => Codex.etat().actif)).toBe(false);

        await page.evaluate(() => backupReminder.afficherModal());
        const vu = await page.evaluate(() => {
            const m = document.getElementById('modal-backup-reminder');
            return {
                titre: m.querySelector('.modal-titre').textContent,
                texte: m.querySelector('.modal-section').textContent.replace(/\s+/g, ' ').trim(),
                rappel: m.querySelector('label[for="select-rappel-backup"]').textContent,
                options: Array.from(m.querySelectorAll('#select-rappel-backup option')).map((o) => o.textContent),
                parDefaut: m.querySelector('#select-rappel-backup').value,
                boutons: Array.from(m.querySelectorAll('.modal-actions button')).map((b) => b.textContent.trim())
            };
        });
        expect(vu).toEqual({
            titre: 'Mets ton codex à jour',
            texte: TEXTE_D8,
            rappel: 'Rappel :',
            options: ['Dans 7 jours', 'Dans 14 jours', 'Dans 30 jours', 'Ne plus rappeler'],
            parDefaut: '14',
            boutons: ['Plus tard', 'Mettre à jour le codex']
        });

        // Aperçu refusé : le rappel se ferme, rien n'est posé.
        await page.evaluate(() => { window.__reponseApercu = false; });
        await page.evaluate(() => document.querySelector('[data-action="backupReminder.mettreAJourLeCodex"]').click());
        await page.waitForTimeout(1500);
        expect(await page.evaluate(() => !!document.getElementById('overlay-backup-reminder'))).toBe(false);
        expect(await lireRappel(page)).toEqual({ jours: null, nePlusRappeler: null });

        // Réussite, sans codex ouvert au départ : le codex est créé, le rappel repoussé de 14 jours.
        await page.evaluate(() => { window.__reponseApercu = true; window.__reponsesPartage = ['ok']; });
        await page.evaluate(() => backupReminder.afficherModal());
        await noterAvant(page);
        await page.evaluate(() => document.querySelector('[data-action="backupReminder.mettreAJourLeCodex"]').click());
        await codexAJour(page);
        expect(await page.evaluate(() => Codex.etat().actif)).toBe(true);
        expect(await lireRappel(page)).toEqual({ jours: 14, nePlusRappeler: null });
        expect(erreurs).toEqual([]);
    });

    test('(2) depuis le menu : un échec et « Il n\'y est pas » ne repoussent rien, « Il y est » repousse', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        await poserOutils(page);

        // Partage réussi depuis le menu : repoussé.
        await page.evaluate(() => { window.__reponsesPartage = ['ok']; });
        await noterAvant(page);
        await page.evaluate(() => Codex.actionEnregistrer());
        await codexAJour(page);
        expect(await lireRappel(page)).toEqual({ jours: 14, nePlusRappeler: null });

        // Partage refusé : rien.
        await effacerRappel(page);
        await page.evaluate(() => sauvegarderDonneesSelonMode('banc_lotI_a', { n: 1 }));
        await page.evaluate(() => { window.__reponsesPartage = ['NotAllowedError']; });
        await noterAvant(page);
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await attendreModale(page, 'Codex non mis à jour');
        expect(await lireRappel(page)).toEqual({ jours: null, nePlusRappeler: null });

        // « Il n'y est pas » : rien.
        await cliquerBouton(page, 'Télécharger à la place');
        await attendreModale(page, 'Téléchargement lancé');
        await cliquerBouton(page, 'Il n\'y est pas');
        await attendreModale(page, 'Codex non mis à jour');
        expect(await lireRappel(page)).toEqual({ jours: null, nePlusRappeler: null });

        // « Il y est » : repoussé.
        await cliquerBouton(page, 'Télécharger à la place');
        await attendreModale(page, 'Téléchargement lancé');
        await cliquerBouton(page, 'Il y est');
        await codexAJour(page);
        expect(await lireRappel(page)).toEqual({ jours: 14, nePlusRappeler: null });
        expect(erreurs).toEqual([]);
    });

    test('(3) la croix vaut « plus tard » : 14 jours', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        await page.evaluate(() => backupReminder.afficherModal());
        await page.evaluate(() => document.querySelector('#modal-backup-reminder .modal-fermer').click());
        expect(await page.evaluate(() => !!document.getElementById('overlay-backup-reminder'))).toBe(false);
        expect(await lireRappel(page)).toEqual({ jours: 14, nePlusRappeler: null });
        expect(erreurs).toEqual([]);
    });

    test('(4) le stock : « Ne plus rappeler » survit à une mise à jour ; une date plus lointaine est gardée', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await demarrerDemo(page);
        await poserOutils(page);

        await page.evaluate(() => backupReminder.desactiverRappels());
        await page.evaluate(() => { window.__reponsesPartage = ['ok']; });
        await noterAvant(page);
        await page.evaluate(() => Codex.actionEnregistrer());
        await codexAJour(page);
        expect(await lireRappel(page)).toEqual({ jours: null, nePlusRappeler: 'true' });

        await effacerRappel(page);
        await page.evaluate(() => backupReminder.definirProchainRappel(30));
        await page.evaluate(() => sauvegarderDonneesSelonMode('banc_lotI_b', { n: 2 }));
        await page.evaluate(() => { window.__reponsesPartage = ['ok']; });
        await noterAvant(page);
        await page.evaluate(() => Codex.actionEnregistrer());
        await codexAJour(page);
        expect(await lireRappel(page)).toEqual({ jours: 30, nePlusRappeler: null });
        expect(erreurs).toEqual([]);
    });
});

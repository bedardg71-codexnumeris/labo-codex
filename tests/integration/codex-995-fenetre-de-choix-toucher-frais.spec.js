import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #995 (lot 5, consigne de Cowork du 11 oct. 2026) — SOUS CHROME, LA FENÊTRE DE CHOIX DE FICHIER
// EXIGE AUSSI UN TOUCHER ACTIF.
//
// Mesuré le 11 oct. 2026 sous Google Chrome 154 (profil jetable, vrais clics, aucun evaluate entre
// le clic et la fenêtre ; `plans de travail/MESURE-2026-10-11-lot5-memoire.md`) : l'activation d'un
// clic dure 5 s (active à 4,8 s, éteinte à 5,0 s) ; après une préparation de 6,5 s,
// `showSaveFilePicker` rejette SecurityError et l'usager lit « Codex non mis à jour ». Le correctif
// donne à la fenêtre de choix le remède du partage (lot J0 bis) : « Ton codex est prêt », puis la
// fenêtre dans le clic sur « Enregistrer ». Rejoué sous Chrome après le correctif : la fenêtre
// s'ouvre avec un toucher actif.
//
// Ce banc tourne sous WebKit, qui n'a pas de fenêtre de choix : elle est SIMULÉE, tenue par la règle
// mesurée (sans activation, le refus de Chrome mot pour mot). L'activation est simulée comme au
// banc J0 bis : un clic l'accorde, elle s'éteint à la tâche suivante. Pack démo, noms fictifs.

const REFUS_CHROME = 'Failed to execute \'showSaveFilePicker\' on \'Window\': Must be handling a user gesture to show a file picker.';
const TITRE_PRET = 'Ton codex est prêt';

async function ouvrirLaDemoAvecUnCodexActif(page) {
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
    await page.evaluate(() => db.setSync('_codex_etat', {
        actif: true, nom: 'Codex du banc', derniereSauvegarde: new Date().toISOString(),
        modificationsDepuis: null, manifeste: null, temoinFiable: true
    }));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
}

/** La fausse activation, la fausse fenêtre de choix, l'aperçu qui dit si la préparation fut longue. */
async function poserLaSimulation(page) {
    await page.evaluate((refus) => {
        window.__activation = { active: false };
        document.addEventListener('click', () => {
            window.__activation.active = true;
            setTimeout(() => { window.__activation.active = false; }, 0);
        }, true);
        Object.defineProperty(navigator, 'userActivation', {
            configurable: true,
            get: () => ({ get isActive() { return window.__activation.active; } })
        });
        window.__fenetres = [];         // chaque appel : l'activation au moment de l'appel
        window.__ecrits = 0;
        window.showSaveFilePicker = async () => {
            window.__fenetres.push(window.__activation.active);
            if (!window.__activation.active) {
                const e = new Error(refus);
                e.name = 'SecurityError';
                throw e;
            }
            window.__activation.active = false;
            return {
                kind: 'file', name: 'codex-du-banc.zip',
                createWritable: async () => ({ write: async () => { window.__ecrits++; }, abort: async () => {}, close: async () => {} })
            };
        };
        window.__preparationLongue = true;
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => {
            window.__activation.active = !window.__preparationLongue;
            return true;
        };
        window.__titresModales = [];
        new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
            if (n.nodeType === 1 && n.id === 'overlay-ui-dialogue') window.__titresModales.push(n.querySelector('.modal-titre').textContent);
        }))).observe(document.body, { childList: true });
    }, REFUS_CHROME);
}

async function mettreAJour(page, { longue }) {
    await page.evaluate((longue) => {
        window.__preparationLongue = longue;
        window.__fenetres.length = 0;
        window.__titresModales.length = 0;
        window.__ecrits = 0;
        sauvegarderDonneesSelonMode('banc_995_' + Date.now(), { n: 1 });
        window.__fin = Codex.actionEnregistrer().then(() => 'fini');
    }, longue);
}

const lire = (page) => page.evaluate(() => {
    const o = document.getElementById('overlay-ui-dialogue');
    return {
        fenetres: window.__fenetres.slice(), ecrits: window.__ecrits, titres: window.__titresModales.slice(),
        modale: o ? { titre: o.querySelector('.modal-titre').textContent, boutons: Array.from(o.querySelectorAll('.modal-actions button')).map((b) => b.textContent) } : null,
        tentative: Codex.derniereTentative()
    };
});
/** La première fenêtre qui s'ouvre, quelle qu'elle soit : sans le correctif, c'est « Codex non mis à jour ». */
const attendreUneModale = (page) => page.waitForFunction(() => !!document.getElementById('overlay-ui-dialogue'), null, { timeout: 30000 });
const cliquer = (page, texte) => page.evaluate((t) => {
    Array.from(document.querySelectorAll('#overlay-ui-dialogue .modal-actions button')).find((x) => x.textContent === t).click();
}, texte);
const attendreLaFin = (page) => page.evaluate(() => window.__fin);

test.describe('#995 — la fenêtre de choix de fichier après une préparation longue', () => {
    test.setTimeout(120000);
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(30000);
        await ouvrirLaDemoAvecUnCodexActif(page);
        await poserLaSimulation(page);
    });

    test('toucher expiré : « Ton codex est prêt », puis la fenêtre dans le clic sur « Enregistrer » ; ensuite, le fichier tenu', async ({ page }) => {
        await mettreAJour(page, { longue: true });
        await attendreUneModale(page);
        let lu = await lire(page);
        expect(lu.modale).toEqual({ titre: TITRE_PRET, boutons: ['Annuler', 'Enregistrer'] });
        expect(lu.fenetres, 'la fenêtre n\'est pas ouverte sans toucher').toEqual([]);

        await cliquer(page, 'Enregistrer');
        expect(await attendreLaFin(page)).toBe('fini');
        lu = await lire(page);
        expect(lu.fenetres, 'la fenêtre s\'ouvre dans le geste, toucher actif').toEqual([true]);
        expect(lu.ecrits).toBe(1);
        expect(lu.titres, 'pas de « Codex non mis à jour »').toEqual([TITRE_PRET]);
        expect(lu.tentative.toucherFrais).toBe('demandé (toucher expiré), accordé');
        expect(lu.tentative.issue).toBe('réussie');

        // Le fichier est désormais tenu : il se réécrit sans fenêtre, donc sans toucher frais.
        await mettreAJour(page, { longue: true });
        expect(await attendreLaFin(page)).toBe('fini');
        lu = await lire(page);
        expect(lu.fenetres).toEqual([]);
        expect(lu.titres).toEqual([]);
        expect(lu.ecrits).toBe(1);
    });

    test('toucher expiré, « Annuler » : rien n\'est ouvert ni écrit', async ({ page }) => {
        await mettreAJour(page, { longue: true });
        await attendreUneModale(page);
        expect((await lire(page)).modale.titre).toBe(TITRE_PRET);
        await cliquer(page, 'Annuler');
        expect(await attendreLaFin(page)).toBe('fini');
        const lu = await lire(page);
        expect(lu.fenetres).toEqual([]);
        expect(lu.ecrits).toBe(0);
        expect(lu.tentative.issue).toBe('fenêtre « Ton codex est prêt » refusée par l\'usager');
    });

    test('toucher encore actif : la fenêtre directement, sans fenêtre intermédiaire', async ({ page }) => {
        await mettreAJour(page, { longue: false });
        expect(await attendreLaFin(page)).toBe('fini');
        const lu = await lire(page);
        expect(lu.fenetres).toEqual([true]);
        expect(lu.ecrits).toBe(1);
        expect(lu.titres).toEqual([]);
        expect(lu.tentative.toucherFrais, 'non demandé').toBeNull();
    });
});

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT F DE L'ENREGISTREMENT — LE TÉMOIN DU CODEX DIT VRAI (D4, 28 sept. 2026)
// =======================================================================
//
// D4 (Grégoire, 26 sept.) : le témoin du codex dit « Ton codex est à jour » ou « Ton codex
// n'a pas tes derniers changements », plus jamais « Tout est enregistré ».
//
// Mesuré avant le lot : `marquerModification()` n'avait que deux appelants (renommer,
// fusionner) : le témoin disait « Tout est enregistré » après n'importe quelle évaluation.
// `genererCodex` posait l'état « à jour » AVANT l'écriture du fichier, et un aperçu annulé
// affichait « Cannot read properties of null ».
//
// Ce banc éprouve, sur le vrai code :
//   (a) l'ouverture de l'application (qui réécrit une quinzaine de clés sans geste) ne rend
//       pas le codex « pas à jour » ;
//   (b) chaque chemin du témoin commun (sauvegarderDonneesSelonMode, modifierEtAnnoncer,
//       ecrireEtAnnoncer) le rend « pas à jour » ; une écriture `discret` ne le touche pas ;
//   (c) « Mettre à jour le codex » réussi → « à jour », et le fichier a été écrit ;
//   (d) aperçu annulé → toujours « pas à jour », aucun succès, aucune erreur ;
//   (e) l'enregistrement automatique est retiré : aucun minuteur n'écrit le fichier.
//
// Le fichier est un faux `showSaveFilePicker` : aucune écriture disque. Pack démo, noms fictifs.

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

async function viderLeStockage(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
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
}

/**
 * Relève, dès le chargement, tout minuteur répété d'au moins une minute : le banc les
 * déclenche ensuite lui-même (le temps qui passe), et vérifie qu'aucun n'écrit le fichier.
 */
async function espionnerMinuteurs(page) {
    await page.addInitScript(() => {
        window.__minuteursLongs = [];
        const orig = window.setInterval;
        window.setInterval = function (fn, delai, ...reste) {
            if (typeof fn === 'function' && delai >= 60 * 1000) window.__minuteursLongs.push(fn);
            return orig.call(window, fn, delai, ...reste);
        };
    });
}

/** Faux fichier (showSaveFilePicker), relevé des toasts, aperçu piloté. */
async function poserOutils(page) {
    await page.evaluate(() => {
        window.__toasts = [];
        new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
            if (n.nodeType === 1 && n.classList.contains('notification-avec-icone')) {
                window.__toasts.push(n.className.includes('notification-erreur') ? 'erreur:' + n.textContent : 'succes:' + n.textContent);
            }
        }))).observe(document.body, { childList: true });

        window.__ecrituresFichier = 0;
        window.showSaveFilePicker = async () => ({
            createWritable: async () => ({
                write: async () => {},
                close: async () => { window.__ecrituresFichier++; },
                abort: async () => {}
            })
        });
        window.__reponseApercu = true;
        window.__ecrireDansApercu = false;
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => {
            // Une écriture de l'usager PENDANT la génération : elle n'est pas dans le fichier.
            if (window.__ecrireDansApercu) sauvegarderDonneesSelonMode('banc_lotF_pendant', { n: 9 });
            return window.__reponseApercu;
        };
    });
}

async function lireTemoinCodex(page) {
    return page.evaluate(() => {
        Codex.toggleMenu();
        const el = document.querySelector('#codex-menu-statut-haut .codex-statut-etat');
        const texte = el ? el.textContent.replace('\u25C9', '').trim() : null;
        Codex.toggleMenu();
        return { texte, pasAJour: Codex.etat().modificationsNonSauvees };
    });
}

const A_JOUR = 'Ton codex est à jour';
const PAS_A_JOUR = 'Ton codex n\'a pas tes derniers changements';

test.describe('Lot F — le témoin du codex dit vrai', () => {
    test.setTimeout(120000);

    // Lot J0 bis (#988) : ce banc lance la mise à jour du codex par `page.evaluate`, qui accorde
    // environ 5 s d'activation du toucher (mesuré). Elle est épinglée « active » ici, pour que la
    // fenêtre « Ton codex est prêt » ne dépende pas de la charge de la machine ; cette fenêtre a son
    // banc (lot-j0-bis-partage-apres-preparation.spec.js).
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => Object.defineProperty(navigator, 'userActivation', { configurable: true, value: { isActive: true } }));
    });

    test('ouverture, écritures, mise à jour, aperçu annulé, aucun enregistrement automatique', async ({ page }) => {
        const erreurs = brancherEcouteurs(page);
        await espionnerMinuteurs(page);
        await viderLeStockage(page);
        await page.evaluate(() => activerModeDemo());
        await page.waitForTimeout(3000);

        // Un codex actif et à jour, écrit par cette version (`temoinFiable` : voir le banc
        // du stock, lot-f-stock-codex-pas-a-jour), puis une réouverture de l'application.
        await page.evaluate(() => db.setSync('_codex_etat', {
            actif: true, nom: 'Codex du banc', derniereSauvegarde: new Date().toISOString(),
            modificationsDepuis: null, manifeste: null, temoinFiable: true
        }));
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(5000);

        // (a) L'ouverture réécrit des clés sans geste : le codex reste à jour.
        expect(await lireTemoinCodex(page)).toEqual({ texte: A_JOUR, pasAJour: false });

        await poserOutils(page);

        // (b1) Une écriture discrète (indices, migrations) ne le touche pas.
        await page.evaluate(() => sauvegarderDonneesSelonMode('banc_lotF_discret', { n: 1 }, { discret: true }));
        expect(await lireTemoinCodex(page)).toEqual({ texte: A_JOUR, pasAJour: false });

        // (b2) Une écriture de l'usager, par la fonction centrale.
        await page.evaluate(() => sauvegarderDonneesSelonMode('banc_lotF_a', { n: 1 }));
        expect(await lireTemoinCodex(page)).toEqual({ texte: PAS_A_JOUR, pasAJour: true });

        // (c) « Mettre à jour le codex » réussi : le fichier est écrit, puis « à jour ».
        await page.evaluate(() => Codex.actionEnregistrer());
        await page.waitForFunction(() => window.__ecrituresFichier === 1, null, { timeout: 30000 });
        await page.waitForFunction(() => !Codex.etat().modificationsNonSauvees, null, { timeout: 10000 });
        expect(await lireTemoinCodex(page)).toEqual({ texte: A_JOUR, pasAJour: false });

        // (b3) modifierEtAnnoncer (éditeurs de la Conception).
        await page.evaluate(() => modifierEtAnnoncer(cle('banc_lotF_b'), () => ({ n: 2 }), null));
        expect(await lireTemoinCodex(page)).toEqual({ texte: PAS_A_JOUR, pasAJour: true });

        // (d) Aperçu annulé : aucun fichier, aucun succès, aucune erreur, toujours « pas à jour ».
        const toastsAvant = await page.evaluate(() => window.__toasts.length);
        await page.evaluate(() => { window.__reponseApercu = false; });
        await page.evaluate(() => Codex.actionEnregistrer());
        await page.waitForTimeout(1500);
        expect(await page.evaluate(() => window.__ecrituresFichier)).toBe(1);
        expect(await page.evaluate((n) => window.__toasts.slice(n), toastsAvant)).toEqual([]);
        expect(await lireTemoinCodex(page)).toEqual({ texte: PAS_A_JOUR, pasAJour: true });

        // Remise à jour, puis (b4) ecrireEtAnnoncer (entités : cours).
        await page.evaluate(() => { window.__reponseApercu = true; });
        await page.evaluate(() => Codex.actionEnregistrer());
        await page.waitForFunction(() => window.__ecrituresFichier === 2, null, { timeout: 30000 });
        await page.waitForFunction(() => !Codex.etat().modificationsNonSauvees, null, { timeout: 10000 });
        await page.evaluate(() => ecrireEtAnnoncer(cle('banc_lotF_c'), async () => { db.setSync(cle('banc_lotF_c'), { n: 3 }); return { n: 3 }; }));
        expect(await lireTemoinCodex(page)).toEqual({ texte: PAS_A_JOUR, pasAJour: true });

        // (f) Une écriture pendant la génération : le fichier est écrit, mais sans elle.
        await page.evaluate(() => { window.__ecrireDansApercu = true; });
        await page.evaluate(() => Codex.actionEnregistrer());
        await page.waitForFunction(() => window.__ecrituresFichier === 3, null, { timeout: 30000 });
        await page.waitForTimeout(500);
        expect(await lireTemoinCodex(page)).toEqual({ texte: PAS_A_JOUR, pasAJour: true });
        await page.evaluate(() => { window.__ecrireDansApercu = false; });

        // (g) « Enregistrer sous » annulé dans la fenêtre de choix : rien d'écrit, toujours
        // « pas à jour », aucun message.
        const toastsAvantSous = await page.evaluate(() => window.__toasts.length);
        await page.evaluate(() => {
            window.__pickerOrig = window.showSaveFilePicker;
            window.showSaveFilePicker = async () => { const e = new Error('annulé'); e.name = 'AbortError'; throw e; };
        });
        await page.evaluate(() => Codex.actionEnregistrerSous());
        await page.waitForTimeout(1500);
        expect(await page.evaluate(() => window.__ecrituresFichier)).toBe(3);
        expect(await page.evaluate((n) => window.__toasts.slice(n), toastsAvantSous)).toEqual([]);
        expect(await lireTemoinCodex(page)).toEqual({ texte: PAS_A_JOUR, pasAJour: true });
        await page.evaluate(() => { window.showSaveFilePicker = window.__pickerOrig; });

        // (e) L'enregistrement automatique est retiré (décision de Grégoire, 29 sept.) : un
        // fichier est tenu (handle), le codex n'est pas à jour, et chaque minuteur long de
        // l'application, déclenché trois fois, n'écrit pas le fichier.
        expect(await page.evaluate(() => Codex.etat().handleFSAPI)).toBe(true);
        const ecrituresAvant = await page.evaluate(() => window.__ecrituresFichier);
        await page.evaluate(async () => {
            for (let tour = 0; tour < 3; tour++) {
                for (const fn of window.__minuteursLongs) { try { await fn(); } catch (e) { /* voisin */ } }
            }
        });
        await page.waitForTimeout(3000);
        expect(await page.evaluate(() => window.__ecrituresFichier)).toBe(ecrituresAvant);
        expect(await page.evaluate(() => document.getElementById('codex-menu-autosave'))).toBeNull();

        expect(erreurs).toEqual([]);
    });
});

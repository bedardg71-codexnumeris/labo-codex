import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// #1007, SECOND LOT (2a-2, 3 oct. 2026) — LE CODEX PROPOSÉ SUR LES GESTES QUI RESTENT
// =======================================================================
//
// Même fonction (`Codex.proposerAvantSuppression`), mêmes mots de fenêtre que 2a-1
// (tests/integration/1007-propose-codex-avant-suppression.spec.js, dont ce banc reprend
// les outils). Ici, les gestes sans question ou à chaîne synchrone :
//  - la fusion de copies (P11) : « Enregistrer » ne propose rien quand rien n'est absorbé ;
//    sinon la fenêtre, « Annuler » garde la copie absorbée, « Supprimer sans codex » l'efface ;
//  - le jeton de reprise (P12) : pratique « archiver » → aucune fenêtre ; « supprimer
//    l'originale » → la fenêtre ; « Annuler » ne crée ni n'efface rien ; une évaluation écrite
//    PENDANT que la fenêtre attend survit (la fonction repart du début après l'attente).
// P6 (la question déplacée du dispatcher dans la fonction) est jugé au banc du registre,
// tests/integration/registre-longitudinal-915.spec.js (R4), sur le vrai bouton.
// Le banc n'a pas de codex actif : la fenêtre est celle « sans codex » (2a-1 a jugé les
// deux titres et le chemin de mise à jour, communs à toutes les portes).
// Les copies sont une fixture (le pack démo n'en porte aucune) ; leurs images sont
// fabriquées en mémoire, et le réassemblage du PDF est remplacé par un blob témoin : le
// banc juge ce que la porte efface, pas le moteur PDF.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i,
    /\[Codex\] Écriture du fichier échouée/i
];

const TITRE = 'Mettre ton codex à jour avant de supprimer ?';
const TITRE_SANS_CODEX = 'Écrire un codex avant de supprimer ?';
const SUITE_LA = 'Ton codex à jour pourra te la rendre, jusqu\'à ta mise à jour suivante.';
const SUITE_LE = 'Ton codex à jour pourra te le rendre, jusqu\'à ta mise à jour suivante.';
const BOUTONS = ['Annuler', 'Supprimer sans mettre à jour', 'Mettre à jour, puis supprimer'];
const BOUTONS_SANS_CODEX = ['Annuler', 'Supprimer sans codex', 'Écrire un codex, puis supprimer'];

function brancher(page) {
    const etat = { erreurs: [], dialogues: [], reponses: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) etat.erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) etat.erreurs.push(m); } });
    page.on('dialog', (d) => {
        etat.dialogues.push({ type: d.type(), message: d.message() });
        const r = etat.reponses.length ? etat.reponses.shift() : false;
        if (r === false) d.dismiss().catch(() => {});
        else d.accept().catch(() => {});
    });
    return etat;
}

/** Pack démo, puis des données fictives à supprimer dans le trimestre actif. */
async function demarrer(page) {
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
    await page.evaluate(async () => {
        const cleEv = cle('evaluationsSauvegardees');
        db.setSync(cleEv, (db.getSync(cleEv, []) || []).concat([1, 2, 3, 4].map((n) => (
            { id: 'EVAL_BANC_' + n, etudiantDA: '900010' + n, productionId: 'PROD_BANC', noteFinale: 70 + n }
        ))));
        const cleEl = cle('groupeEtudiants');
        const eleves = db.getSync(cleEl, []) || [];
        db.setSync(cleEl, eleves.concat([
            { id: 9101, da: '9000101', groupe: '0banc', nom: 'Fictive', prenom: 'Lou', coursId: eleves[0] && eleves[0].coursId },
            { id: 9102, da: '9000102', groupe: '0banc', nom: 'Imaginé', prenom: 'Noé', coursId: eleves[0] && eleves[0].coursId }
        ]));
        const cleP = cle('pratiquesConfigurables');
        db.setSync(cleP, (db.getSync(cleP, []) || []).concat([{ id: 'PRAT_BANC', nom: 'Pratique du banc' }]));
        await db.flush();
    });
}

/** La fenêtre de choix de Chrome, en mémoire ; l'aperçu de l'export est accepté. */
async function poserOutils(page) {
    await page.evaluate(() => {
        window.__choix = { annuler: false, ecritureEchoue: false };
        window.__fenetres = [];
        window.__ecritures = [];
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        window.showSaveFilePicker = async ({ suggestedName }) => {
            window.__fenetres.push(suggestedName);
            if (window.__choix.annuler) throw new DOMException('choix annulé', 'AbortError');
            return {
                async createWritable() {
                    if (window.__choix.ecritureEchoue) throw new DOMException('plus d\'espace', 'QuotaExceededError');
                    return {
                        async write(blob) { window.__ecritures.push({ fichier: suggestedName, octets: blob.size }); },
                        async close() {},
                        async abort() {}
                    };
                }
            };
        };
    });
}

const traces = (page) => page.evaluate(() => ({ fenetres: window.__fenetres.slice(), ecritures: window.__ecritures.slice() }));

const fenetre = (page) => page.evaluate(() => {
    const o = document.getElementById('overlay-ui-dialogue');
    if (!o || o.getClientRects().length === 0) return null;
    return {
        titre: o.querySelector('.modal-titre').textContent,
        texte: o.querySelector('.modal-section').textContent.replace(/\s+/g, ' ').trim(),
        boutons: Array.from(o.querySelectorAll('.modal-actions button')).map((b) => b.textContent.trim()),
        focus: document.activeElement ? document.activeElement.textContent.trim() : null
    };
});
const attendreFenetre = async (page, titre) => {
    await expect.poll(async () => (await fenetre(page))?.titre ?? null, { timeout: 60000 }).toBe(titre);
    return fenetre(page);
};
const cliquerDansFenetre = (page, texte) => page.locator('#overlay-ui-dialogue .modal-actions button', { hasText: texte }).click();
const aucuneFenetre = async (page) => expect.poll(() => fenetre(page), { timeout: 15000 }).toBeNull();

const etatCodex = (page) => page.evaluate(() => { const e = Codex.etat(); return { actif: e.actif, aJour: e.actif && !e.modificationsNonSauvees, derniere: e.derniereSauvegarde }; });

/** Une vraie mise à jour par le menu, jusqu'à « à jour ». */
async function mettreAJour(page) {
    await page.evaluate(() => { Codex.actionEnregistrer(); });
    await page.waitForFunction(() => { const e = Codex.etat(); return e.actif && !e.modificationsNonSauvees; }, null, { timeout: 60000 });
}
const rendrePasAJour = (page) => page.evaluate(() => Codex.marquerModification());


const SUITE_LES = 'Ton codex à jour pourra te les rendre, jusqu\'à ta mise à jour suivante.';
const PHRASE_FUSION = 'Fusionner ces copies efface pour de bon celles qui sont absorbées.';
const PHRASE_REPRISE = 'Appliquer ce jeton de reprise efface pour de bon l\'évaluation originale.';

/** Trois copies fictives d'un même élève, images fabriquées en mémoire ; le PDF réassemblé est un témoin. */
async function poserCopies(page) {
    await page.evaluate(async () => {
        const da = '9000101';
        const maintenant = new Date().toISOString();
        const copie = (id) => ({ id, etudiantDA: da, productionId: 'PROD_BANC', nomFichier: id + '.png', typeMIME: 'image/png',
            tailleFichier: 10, nombrePages: 1, dateImport: maintenant, statut: 'importe' });
        db.setSync(cle('fichiersTravaux'), (db.getSync(cle('fichiersTravaux'), []) || []).concat(['COPIE_BANC_1', 'COPIE_BANC_2', 'COPIE_BANC_3'].map(copie)));   // security-ok: fixture fictive du banc
        const canevas = document.createElement('canvas');
        canevas.width = 4; canevas.height = 4;
        const png = await new Promise((r) => canevas.toBlob(r, 'image/png'));
        travauxStockage.recupererBlob = async () => png;
        window.__blobsEcrits = [];
        travauxStockage.stockerBlob = async (id, blob) => { window.__blobsEcrits.push(id); };
        travauxStockage.genererMiniaturePDF = async () => ({ thumbnail: '' });
        travauxImport.reassemblerPages = async (pages) => new Blob(['%PDF-témoin ' + pages.length], { type: 'application/pdf' });
        await db.flush();
        afficherSection('evaluations');
        afficherSousSection('evaluations-importer');
    });
    await page.waitForFunction(() => !!document.getElementById('evaluations-contenu-import'));
}
const copies = (page) => page.evaluate(() => (db.getSync(cle('fichiersTravaux'), []) || []).map((f) => f.id).filter((id) => id.startsWith('COPIE_BANC_')).sort());
/** Lance « Enregistrer » sans l'attendre (la fenêtre doit pouvoir paraître) ; `fin()` l'attend. */
const enregistrer = (page) => page.evaluate(() => { window.__enreg = travauxUI.sauvegarderEdition(); });
const finEnregistrement = (page) => page.evaluate(() => window.__enreg);

const evals = (page) => page.evaluate(() => (db.getSync(cle('evaluationsSauvegardees'), []) || [])
    .filter((e) => /^EVAL_(BANC|JR|CONC)/.test(e.id) || /^EVAL_(BANC|JR)/.test(e.repriseDeId || ''))
    .map((e) => ({ id: e.id, repriseDe: e.repriseDeId || null, archivee: !!e.archivee })));
/** `archiver` : la pratique de l'originale, passée comme le fait la Banque (`true`) ; la vraie
 *  configuration des jetons (pack démo) décide du reste (activés, nombre, maximum par production). */
const appliquer = (page, id, archiver) => page.evaluate(([id, archiver]) => { window.__jeton = appliquerJetonReprise(id, archiver); }, [id, archiver]);
const resultatJeton = (page) => page.evaluate(async () => { const r = await window.__jeton; return r ? { repriseDe: r.repriseDeId } : null; });

test.describe('#1007, lot 2a-2 — le codex proposé sur les gestes qui restent', () => {
    test.setTimeout(240000);
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('P11 (fusion) : rien d\'absorbé, aucune fenêtre ; sinon « Annuler » garde la copie, « Supprimer sans codex » l\'efface', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserCopies(page);
        expect(await copies(page)).toEqual(['COPIE_BANC_1', 'COPIE_BANC_2', 'COPIE_BANC_3']);
        expect(await etatCodex(page)).toMatchObject({ actif: false });

        // ----- 1. l'éditeur sur une copie, rien de retiré : « Enregistrer » sans fenêtre, même sans codex
        await page.evaluate(() => travauxUI.ouvrirEditeurPages('COPIE_BANC_3'));
        await enregistrer(page);
        await aucuneFenetre(page);
        await finEnregistrement(page);
        expect(await page.evaluate(() => window.__blobsEcrits.slice())).toEqual(['COPIE_BANC_3']);
        expect(await copies(page)).toEqual(['COPIE_BANC_1', 'COPIE_BANC_2', 'COPIE_BANC_3']);

        // ----- 2. la fusion de deux copies : la fenêtre, mot pour mot, focus sur « Annuler »
        await page.evaluate(async () => {
            travauxUI.toggleSelectionFusion('COPIE_BANC_1');
            travauxUI.toggleSelectionFusion('COPIE_BANC_2');
            await travauxUI.fusionnerFichiers();
        });
        await enregistrer(page);
        const f = await attendreFenetre(page, TITRE_SANS_CODEX);
        expect(f.texte).toBe(PHRASE_FUSION + ' ' + SUITE_LES);
        expect(f.boutons).toEqual(BOUTONS_SANS_CODEX);
        expect(f.focus).toBe('Annuler');
        await cliquerDansFenetre(page, 'Annuler');
        await finEnregistrement(page);
        expect(await copies(page)).toEqual(['COPIE_BANC_1', 'COPIE_BANC_2', 'COPIE_BANC_3']);
        expect(await page.evaluate(() => window.__blobsEcrits.length)).toBe(1);   // rien d'écrit non plus

        // ----- 3. « Enregistrer » de nouveau, « Supprimer sans codex » : la copie absorbée part
        await enregistrer(page);
        await attendreFenetre(page, TITRE_SANS_CODEX);
        await cliquerDansFenetre(page, 'Supprimer sans codex');
        await finEnregistrement(page);
        await expect.poll(() => copies(page)).toEqual(['COPIE_BANC_1', 'COPIE_BANC_3']);
        expect(await page.evaluate(() => travauxStockage.obtenirFichierParId('COPIE_BANC_1').nombrePages)).toBe(2);
        expect(ecoute.dialogues).toEqual([]);
        expect(ecoute.erreurs).toEqual([]);
    });

    test('P12 (jeton de reprise) : « archiver », aucune fenêtre ; « supprimer l\'originale », la fenêtre ; une écriture pendant l\'attente survit', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await page.evaluate(async () => {
            const c = cle('evaluationsSauvegardees');
            db.setSync(c, (db.getSync(c, []) || []).concat([1, 2, 3, 4].map((n) => (
                { id: 'EVAL_JR_' + n, etudiantDA: '900020' + n, productionId: 'PROD_JR', noteFinale: 60 + n }
            ))));
            await db.flush();
        });

        // ----- 1. pratique « supprimer l'originale » : la fenêtre ; « Annuler » ne fait rien
        await appliquer(page, 'EVAL_JR_1', false);
        const f = await attendreFenetre(page, TITRE_SANS_CODEX);
        expect(f.texte).toBe(PHRASE_REPRISE + ' Ton codex à jour pourra te la rendre, jusqu\'à ta mise à jour suivante.');
        expect(f.focus).toBe('Annuler');
        await cliquerDansFenetre(page, 'Annuler');
        expect(await resultatJeton(page)).toBeNull();
        expect((await evals(page)).filter((e) => e.id === 'EVAL_JR_1' || e.repriseDe === 'EVAL_JR_1')).toEqual([{ id: 'EVAL_JR_1', repriseDe: null, archivee: false }]);

        // ----- 2. pratique « archiver » : rien n'est effacé, aucune fenêtre ; la reprise est créée
        await appliquer(page, 'EVAL_JR_2', true);
        await aucuneFenetre(page);
        expect(await resultatJeton(page)).toEqual({ repriseDe: 'EVAL_JR_2' });
        expect((await evals(page)).find((e) => e.id === 'EVAL_JR_2')).toMatchObject({ archivee: true });

        // ----- 3. « supprimer l'originale », « Supprimer sans codex » : l'originale part, la reprise naît
        await appliquer(page, 'EVAL_JR_3', false);
        await attendreFenetre(page, TITRE_SANS_CODEX);
        await cliquerDansFenetre(page, 'Supprimer sans codex');
        expect(await resultatJeton(page)).toEqual({ repriseDe: 'EVAL_JR_3' });
        expect((await evals(page)).some((e) => e.id === 'EVAL_JR_3')).toBe(false);

        // ----- 4. une évaluation écrite PENDANT que la fenêtre attend survit (relu après l'attente)
        await appliquer(page, 'EVAL_JR_4', false);
        await attendreFenetre(page, TITRE_SANS_CODEX);
        await page.evaluate(async () => {
            const c = cle('evaluationsSauvegardees');
            db.setSync(c, (db.getSync(c, []) || []).concat([{ id: 'EVAL_CONC_1', etudiantDA: '9000299', productionId: 'PROD_JR', noteFinale: 80 }]));
            await db.flush();
        });
        await cliquerDansFenetre(page, 'Supprimer sans codex');
        expect(await resultatJeton(page)).toEqual({ repriseDe: 'EVAL_JR_4' });
        const apres = await evals(page);
        expect(apres.some((e) => e.id === 'EVAL_CONC_1'), 'EVAL_CONC_1 perdue : la porte a écrit une lecture d\'avant l\'attente').toBe(true);
        expect(apres.some((e) => e.id === 'EVAL_JR_4')).toBe(false);
        expect(ecoute.dialogues).toEqual([]);
        expect(ecoute.erreurs).toEqual([]);
    });
});

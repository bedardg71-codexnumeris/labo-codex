import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// #1007, SECOND LOT (2a-1, 3 oct. 2026) — AVANT DE SUPPRIMER, LE CODEX PROPOSÉ
// =======================================================================
//
// Les gestes du côté « propose » passent par `Codex.proposerAvantSuppression(geste)` :
// codex à jour, aucune fenêtre (la question habituelle, telle quelle) ; pas à jour, la
// fenêtre (mots acceptés le 2 oct., 20 h 29) AVANT la question habituelle :
// « Annuler » ne supprime rien, « Supprimer sans mettre à jour » mène à la question
// habituelle, « Mettre à jour, puis supprimer » prend le chemin de « Mettre à jour le
// codex » et seulement s'il réussit, la question habituelle. Un échec ou un abandon de
// l'écriture : rien n'est supprimé. Sans codex actif, la même fenêtre ; le bouton du
// milieu dit « Supprimer sans codex » (3 oct., 7 h 56) et le troisième écrit un codex.
// Relecture de Cowork (3 oct.) : une écriture de la même clé PENDANT que la fenêtre attend
// survit à la suppression (P8 relit après l'attente).
//
// Un geste par famille : structure (P2, un·e élève), évaluation (P8, tous les chemins),
// matériel (P29, une pratique), corbeille (G1), configuration (`enseignants`, et une
// clé hors de la liste, qui ne propose rien). Le banc appelle la fonction que le bouton
// appelle (le dispatcher ne fait que la nommer) et lit CE QUE L'APPLICATION CONTIENT
// APRÈS. Les questions natives (`confirm`) sont consignées et répondues dans l'ordre.
// Ce qu'il imite : la fenêtre de choix de Chrome (`showSaveFilePicker`, un fichier en
// mémoire qui compte ses écritures, ou qui échoue à l'écriture).

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

const evaluations = (page) => page.evaluate(() => (db.getSync(cle('evaluationsSauvegardees'), []) || []).map((e) => e.id).filter((id) => id.startsWith('EVAL_BANC_')));
const supprimerEval = (page, id) => page.evaluate((id) => { supprimerEvaluation(id); }, id);
const QUESTION_P8 = /^Veux-tu vraiment supprimer cette évaluation \?\n\nCette action est irréversible\.$/;

test.describe('#1007, second lot — avant de supprimer, le codex proposé', () => {
    test.setTimeout(240000);
    test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); });

    test('P8 (évaluation) : sans codex, à jour, pas à jour (trois boutons), échec et abandon de l\'écriture', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserOutils(page);
        expect(await etatCodex(page)).toMatchObject({ actif: false });
        expect(await evaluations(page)).toEqual(['EVAL_BANC_1', 'EVAL_BANC_2', 'EVAL_BANC_3', 'EVAL_BANC_4']);

        // ----- 1. aucun codex actif : la fenêtre, troisième bouton « Écrire un codex » ; Annuler a le focus
        await supprimerEval(page, 'EVAL_BANC_1');
        expect(await attendreFenetre(page, TITRE_SANS_CODEX)).toEqual({
            titre: TITRE_SANS_CODEX,
            texte: 'Supprimer cette évaluation l\'efface pour de bon. ' + SUITE_LA,
            boutons: BOUTONS_SANS_CODEX,
            focus: 'Annuler'
        });
        await cliquerDansFenetre(page, 'Annuler');
        await aucuneFenetre(page);
        await page.waitForTimeout(1000);
        expect(ecoute.dialogues).toEqual([]);
        expect(await evaluations(page)).toHaveLength(4);
        expect((await traces(page)).fenetres).toEqual([]);

        // ----- 2. « Écrire un codex, puis supprimer » : le codex est écrit, puis la question, puis l'effacement
        ecoute.reponses.push(true);
        await supprimerEval(page, 'EVAL_BANC_1');
        await attendreFenetre(page, TITRE_SANS_CODEX);
        await cliquerDansFenetre(page, 'Écrire un codex, puis supprimer');
        await expect.poll(() => ecoute.dialogues.length, { timeout: 60000 }).toBe(1);
        expect(ecoute.dialogues[0]).toEqual({ type: 'confirm', message: expect.stringMatching(QUESTION_P8) });
        let t = await traces(page);
        expect(t.fenetres).toHaveLength(1);
        const tenu = t.fenetres[0];
        expect(t.ecritures.filter((e) => e.fichier === tenu)).toHaveLength(1);
        await expect.poll(() => evaluations(page)).toEqual(['EVAL_BANC_2', 'EVAL_BANC_3', 'EVAL_BANC_4']);
        expect((await etatCodex(page)).actif).toBe(true);

        // ----- 3. codex à jour : AUCUNE fenêtre, la question habituelle tout de suite (refusée ici)
        await mettreAJour(page);
        expect((await etatCodex(page)).aJour).toBe(true);
        await supprimerEval(page, 'EVAL_BANC_2');
        await expect.poll(() => ecoute.dialogues.length).toBe(2);
        expect(ecoute.dialogues[1].message).toMatch(QUESTION_P8);
        expect(await fenetre(page)).toBeNull();
        expect(await evaluations(page)).toHaveLength(3);

        // ----- 4. pas à jour : la fenêtre, mot pour mot ; « Annuler » ne supprime rien et ne demande rien
        await rendrePasAJour(page);
        await supprimerEval(page, 'EVAL_BANC_2');
        expect(await attendreFenetre(page, TITRE)).toEqual({
            titre: TITRE,
            texte: 'Supprimer cette évaluation l\'efface pour de bon. ' + SUITE_LA,
            boutons: BOUTONS,
            focus: 'Annuler'
        });
        await cliquerDansFenetre(page, 'Annuler');
        await aucuneFenetre(page);
        await page.waitForTimeout(1000);
        expect(ecoute.dialogues).toHaveLength(2);
        expect(await evaluations(page)).toHaveLength(3);

        // ----- 5. « Supprimer sans mettre à jour » : la question habituelle, puis l'effacement ; rien n'est écrit
        const ecrituresAvant = (await traces(page)).ecritures.length;
        ecoute.reponses.push(true);
        await supprimerEval(page, 'EVAL_BANC_2');
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Supprimer sans mettre à jour');
        await expect.poll(() => ecoute.dialogues.length).toBe(3);
        expect(ecoute.dialogues[2].message).toMatch(QUESTION_P8);
        await expect.poll(() => evaluations(page)).toEqual(['EVAL_BANC_3', 'EVAL_BANC_4']);
        expect((await traces(page)).ecritures).toHaveLength(ecrituresAvant);

        // ----- 6. échec de l'écriture : « Codex non mis à jour » ; Fermer → rien n'est supprimé, aucune question
        await page.evaluate(() => { window.__choix.ecritureEchoue = true; });
        await supprimerEval(page, 'EVAL_BANC_3');
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Mettre à jour, puis supprimer');
        expect((await attendreFenetre(page, 'Codex non mis à jour')).boutons).toEqual(['Fermer', 'Télécharger à la place', 'Réessayer']);
        await cliquerDansFenetre(page, 'Fermer');
        await aucuneFenetre(page);
        await page.waitForTimeout(1500);
        expect(ecoute.dialogues).toHaveLength(3);
        expect(await evaluations(page)).toEqual(['EVAL_BANC_3', 'EVAL_BANC_4']);
        expect((await etatCodex(page)).aJour).toBe(false);
        await page.evaluate(() => { window.__choix.ecritureEchoue = false; });

        // ----- 7. abandon : l'aperçu de l'export refusé (une sortie de l'usager, sans message) ; rien n'est supprimé
        await page.evaluate(() => { window.SecuriteExportPreview.previewZipEtConfirmer = async () => false; });
        await supprimerEval(page, 'EVAL_BANC_3');
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Mettre à jour, puis supprimer');
        await aucuneFenetre(page);
        await page.waitForTimeout(3000);
        await aucuneFenetre(page);
        expect(ecoute.dialogues).toHaveLength(3);
        expect(await evaluations(page)).toEqual(['EVAL_BANC_3', 'EVAL_BANC_4']);
        await page.evaluate(() => { window.SecuriteExportPreview.previewZipEtConfirmer = async () => true; });

        // ----- 8. « Mettre à jour, puis supprimer » : le codex est écrit (après l'échec du 6, le chemin de
        //          « Mettre à jour le codex » redemande où : c'est le sien, inchangé), puis la question
        //          habituelle, puis l'effacement
        const avant = await traces(page);
        const derniereAvant = (await etatCodex(page)).derniere;
        ecoute.reponses.push(true);
        await supprimerEval(page, 'EVAL_BANC_3');
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Mettre à jour, puis supprimer');
        await expect.poll(() => ecoute.dialogues.length, { timeout: 60000 }).toBe(4);
        expect(ecoute.dialogues[3].message).toMatch(QUESTION_P8);
        t = await traces(page);
        expect(t.ecritures.length).toBe(avant.ecritures.length + 1);
        expect((await etatCodex(page)).derniere).not.toBe(derniereAvant);
        await expect.poll(() => evaluations(page)).toEqual(['EVAL_BANC_4']);
        expect(ecoute.erreurs).toEqual([]);
    });

    test('Une porte par famille : élève (P2), pratique (P29), paramètre « enseignants » et clé hors liste, corbeille (G1)', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserOutils(page);
        await mettreAJour(page);
        const tenu = (await traces(page)).fenetres[0];

        // ----- Structure : P2, un·e élève. Pas à jour : Annuler, puis « Supprimer sans mettre à jour »
        const eleves = () => page.evaluate(() => (db.getSync(cle('groupeEtudiants'), []) || []).map((e) => e.da).filter((da) => da.startsWith('900010')));
        await rendrePasAJour(page);
        await page.evaluate(() => { supprimerEtudiantV2('9000101'); });
        expect((await attendreFenetre(page, TITRE)).texte).toBe('Supprimer la fiche de cet·te étudiant·e l\'efface pour de bon. ' + SUITE_LA);
        await cliquerDansFenetre(page, 'Annuler');
        await aucuneFenetre(page);
        await page.waitForTimeout(1000);
        expect(ecoute.dialogues).toEqual([]);
        expect(await eleves(page)).toEqual(['9000101', '9000102']);
        ecoute.reponses.push(true);
        await page.evaluate(() => { supprimerEtudiantV2('9000101'); });
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Supprimer sans mettre à jour');
        await expect.poll(() => ecoute.dialogues.length).toBe(1);
        expect(ecoute.dialogues[0].message).toBe('Supprimer Lou Fictive ?');
        await expect.poll(() => eleves(page)).toEqual(['9000102']);

        // ----- Matériel : P29, une pratique. « Mettre à jour, puis supprimer »
        const pratiques = () => page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || []).map((p) => p.id).filter((id) => id === 'PRAT_BANC'));
        expect((await etatCodex(page)).aJour).toBe(false);
        const ecritesAvant = (await traces(page)).ecritures.filter((e) => e.fichier === tenu).length;
        ecoute.reponses.push(true);
        await page.evaluate(() => { supprimerPratiqueMateriel('PRAT_BANC'); });
        expect((await attendreFenetre(page, TITRE)).texte).toBe('Supprimer cette pratique l\'efface pour de bon. ' + SUITE_LA);
        await cliquerDansFenetre(page, 'Mettre à jour, puis supprimer');
        await expect.poll(() => ecoute.dialogues.length, { timeout: 60000 }).toBe(2);
        expect(ecoute.dialogues[1].message).toBe('Es-tu sûr de vouloir supprimer cette pratique ?');
        expect((await traces(page)).ecritures.filter((e) => e.fichier === tenu).length).toBe(ecritesAvant + 1);
        await expect.poll(() => pratiques(page)).toEqual([]);

        // ----- Configuration : `enseignants` propose ; une autre clé, rien
        const enseignants = () => page.evaluate(() => db.getSync('enseignants', null));
        await page.evaluate(() => db.setSync('enseignants', [{ id: 'ENS_BANC', prenom: 'Alex', nom: 'Fictif' }]));
        await rendrePasAJour(page);
        await page.evaluate(() => { supprimerParametreConfig('enseignants', 'Enseignant·es'); });
        expect((await attendreFenetre(page, TITRE)).texte).toBe('Supprimer ce paramètre l\'efface pour de bon. ' + SUITE_LE);
        await cliquerDansFenetre(page, 'Annuler');
        await aucuneFenetre(page);
        await page.waitForTimeout(1000);
        expect(ecoute.dialogues).toHaveLength(2);
        expect(await enseignants(page)).toHaveLength(1);
        ecoute.reponses.push(true);
        await page.evaluate(() => { supprimerParametreConfig('enseignants', 'Enseignant·es'); });
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Supprimer sans mettre à jour');
        await expect.poll(() => ecoute.dialogues.length).toBe(3);
        expect(ecoute.dialogues[2].message).toBe('Supprimer le paramètre « Enseignant·es » (enseignants) ?\n\nCette action est irréversible.');
        await expect.poll(() => enseignants(page)).toBeNull();
        // Hors de la liste (décision du 2 oct., § 2) : la question habituelle, sans fenêtre.
        await page.evaluate(() => db.setSync('labo_banc_parametre', 'x'));
        await page.evaluate(() => { supprimerParametreConfig('labo_banc_parametre', 'Banc'); });
        await expect.poll(() => ecoute.dialogues.length).toBe(4);
        expect(await fenetre(page)).toBeNull();
        expect(await page.evaluate(() => db.getSync('labo_banc_parametre', null))).toBe('x');

        // ----- Corbeille : G1. La fenêtre vient AVANT la modale « Supprimer définitivement ? »
        await page.evaluate(async () => {
            const gc = db.getSync('groupeCoursActif', null);
            db.setSync(cle('corbeilleFichiers'), [{ id: 'FT_BANC', nomFichier: 'copie-banc.png', etudiantDA: '9000102', productionId: 'PROD_BANC', groupeCoursId: gc && gc.id, dateSuppression: new Date().toISOString() }]);
            await db.flush();
        });
        const corbeille = () => page.evaluate(() => (db.getSync(cle('corbeilleFichiers'), []) || []).map((f) => f.id));
        const modaleCorbeille = () => page.evaluate(() => !!document.getElementById('supprimer-definitif-btn-confirmer'));
        await rendrePasAJour(page);
        await page.evaluate(() => { supprimerFichierDefinitivement('FT_BANC'); });
        expect((await attendreFenetre(page, TITRE)).texte).toBe('Supprimer cette copie l\'efface pour de bon. ' + SUITE_LA);
        expect(await modaleCorbeille(page)).toBe(false);
        await cliquerDansFenetre(page, 'Annuler');
        await aucuneFenetre(page);
        await page.waitForTimeout(1000);
        expect(await modaleCorbeille(page)).toBe(false);
        expect(await corbeille(page)).toEqual(['FT_BANC']);
        await page.evaluate(() => { supprimerFichierDefinitivement('FT_BANC'); });
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Supprimer sans mettre à jour');
        await expect.poll(() => modaleCorbeille(page)).toBe(true);
        await page.locator('#supprimer-definitif-btn-confirmer').click();
        await expect.poll(() => corbeille(page)).toEqual([]);
        expect(ecoute.dialogues).toHaveLength(4);
        expect(ecoute.erreurs).toEqual([]);
    });
    test('P8 : une écriture de la même clé PENDANT que la fenêtre attend survit à la suppression (relecture après l\'attente)', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserOutils(page);
        await mettreAJour(page);
        await rendrePasAJour(page);

        await supprimerEval(page, 'EVAL_BANC_1');
        await attendreFenetre(page, TITRE);
        // La page vit pendant l'attente : un enregistrement de la même clé tombe maintenant.
        await page.evaluate(() => {
            const cleEv = cle('evaluationsSauvegardees');
            db.setSync(cleEv, (db.getSync(cleEv, []) || []).concat([
                { id: 'EVAL_BANC_CONCURRENTE', etudiantDA: '9000109', productionId: 'PROD_BANC', noteFinale: 80 }
            ]));
        });
        expect(await evaluations(page)).toEqual(['EVAL_BANC_1', 'EVAL_BANC_2', 'EVAL_BANC_3', 'EVAL_BANC_4', 'EVAL_BANC_CONCURRENTE']);

        ecoute.reponses.push(true);
        await cliquerDansFenetre(page, 'Supprimer sans mettre à jour');
        await expect.poll(() => ecoute.dialogues.length).toBe(1);
        expect(ecoute.dialogues[0].message).toMatch(QUESTION_P8);
        // Ce qui était visé part ; ce qui a été écrit pendant l'attente reste.
        await expect.poll(() => evaluations(page)).toEqual(['EVAL_BANC_2', 'EVAL_BANC_3', 'EVAL_BANC_4', 'EVAL_BANC_CONCURRENTE']);
        expect(ecoute.erreurs).toEqual([]);
    });
});

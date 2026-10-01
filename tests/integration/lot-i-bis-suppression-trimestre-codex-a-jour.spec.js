import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// LOT I BIS (D9, 30 sept. 2026) — SUPPRIMER UN TRIMESTRE : LE FILET EST LE CODEX
// =======================================================================
//
// Avant ce lot, la suppression téléchargeait un export du trimestre, puis effaçait. Ce
// fichier ne portait pas le contenu des copies, et aucun écran ne savait le rouvrir.
// Désormais : la suppression est REFUSÉE tant que le codex n'est pas à jour, au sens exact
// de ce que le menu du codex affiche (« Ton codex est à jour ») ; pas de codex : même refus.
// Le refus est une fenêtre de l'application, dont le bouton lance « Mettre à jour le codex ».
//
// UN ESSAI DE COMPORTEMENT, pas une lecture du source : sur la vraie page, par de vrais
// clics (la bibliothèque des trimestres, le menu de la carte, « Supprimer… »), et dans les
// trois cas on lit CE QUE L'APPLICATION CONTIENT APRÈS : le registre des trimestres et
// chaque clé du trimestre visé.
//
//   (1) codex pas à jour : refus (mots validés), rien n'est effacé, aucune question posée ;
//       le bouton du refus mène une vraie mise à jour du codex ; le codex à jour, le même
//       geste est permis : la confirmation (mots validés), le nom, puis l'effacement — et
//       aucun fichier n'est téléchargé dans ce chemin ;
//   (2) sans codex : même refus (variante proposée), rien n'est effacé ;
//   (3) codex à jour mais la confirmation refusée, puis le nom mal retapé : rien n'est effacé.
//
// Pack démo (le trimestre actif) + un trimestre fictif NON actif, « Automne 2030 (banc) ».

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

const T = 'a2030';
const NOM = 'Automne 2030 (banc)';
const TITRE_REFUS = 'Mets d\'abord ton codex à jour';
const TEXTE_REFUS = 'Supprimer un trimestre efface ses données pour de bon. Ton codex n\'a pas tes derniers changements : mets-le à jour, puis recommence.';
const TEXTE_REFUS_SANS_CODEX = 'Supprimer un trimestre efface ses données pour de bon. Tu n\'as pas encore de codex : crée-le avec le bouton ci-dessous, puis recommence.';
const QUESTION = 'Supprimer définitivement le trimestre « ' + NOM + ' » ? Toutes ses données seront effacées : étudiant·es, évaluations, présences, productions, captures et modèles. Ton codex à jour les contient encore : garde ce fichier.';

/** Écoute la page. Les dialogues natifs sont consignés ; `reponses` dit quoi répondre, dans l'ordre. */
function brancher(page) {
    const etat = { erreurs: [], dialogues: [], reponses: [], telechargements: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) etat.erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) etat.erreurs.push(m); } });
    page.on('download', (d) => etat.telechargements.push(d.suggestedFilename()));
    page.on('dialog', (d) => {
        etat.dialogues.push({ type: d.type(), message: d.message() });
        const r = etat.reponses.length ? etat.reponses.shift() : true;
        if (r === false) d.dismiss().catch(() => {});
        else if (typeof r === 'string') d.accept(r).catch(() => {});
        else d.accept().catch(() => {});
    });
    return etat;
}

async function demarrerDemoAvecTrimestreInactif(page) {
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
    // Le trimestre fictif non actif, avec de quoi voir qu'il est (ou n'est pas) effacé.
    await page.evaluate(async ({ T, NOM }) => {
        const registre = db.getSync('trimestres', []);
        registre.push({ id: T, nom: NOM, session: 'A', annee: 2030, actif: false, archive: false });
        db.setSync('trimestres', registre);
        db.setSync(T + '_groupeEtudiants', [
            { id: 1, da: '9000011', groupe: '01', nom: 'Fictif', prenom: 'Alix', coursId: 'cours-banc' },
            { id: 2, da: '9000012', groupe: '01', nom: 'Inventée', prenom: 'Maude', coursId: 'cours-banc' }
        ]);
        db.setSync(T + '_presences', { '2030-09-03': { '9000011': { statut: 'present', heures: 2 }, '9000012': { statut: 'absent', heures: 0 } } });
        db.setSync(T + '_evaluationsSauvegardees', [{ id: 'EVAL_9000011_BANC', etudiantDA: '9000011', productionId: 'PROD_BANC', noteFinale: 72 }]);
        db.setSync(T + '_productions', [{ id: 'PROD_BANC', titre: 'Analyse fictive', ponderation: 20 }]);
        await db.flush();
    }, { T, NOM });
}

/** Ce que l'application contient pour le trimestre visé : son entrée au registre, et chacune de ses clés. */
const contenu = (page) => page.evaluate(async (T) => {
    const toutes = Array.from(new Set([...(await db.keys()), ...Object.keys(localStorage)]));
    const cles = {};
    for (const c of toutes.filter((k) => k.includes(T)).sort()) cles[c] = JSON.stringify(await db.get(c, null));
    return {
        auRegistre: (db.getSync('trimestres', []) || []).filter((t) => t && t.id === T).map((t) => t.nom),
        nbTrimestres: (db.getSync('trimestres', []) || []).length,
        cles
    };
}, T);

/** L'état que le menu du codex AFFICHE (c'est lui que la garde doit suivre). */
async function etatAfficheParLeMenu(page) {
    await page.evaluate(() => Codex.toggleMenu());
    const texte = await page.evaluate(() => document.getElementById('codex-menu-statut-haut').textContent.replace(/\s+/g, ' ').trim());
    await page.evaluate(() => Codex.toggleMenu());
    return texte;
}

/** Le geste : la bibliothèque des trimestres, la carte du trimestre, « Supprimer… » — de vrais clics. */
async function cliquerSupprimer(page) {
    if (!(await page.evaluate(() => !!document.getElementById('modalBibliothequeTrimestres')))) {
        await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
        await page.waitForSelector('#modalBibliothequeTrimestres');
    }
    const bouton = page.locator(`#modalBibliothequeTrimestres [data-action="confirmerSuppressionTrimestre"][data-param="${T}"]`);
    await expect(bouton).toHaveCount(1);
    if (!(await bouton.isVisible())) {
        // « Supprimer… » vit dans le menu de la carte : on l'ouvre comme on le ferait à la main.
        await page.locator(`#modalBibliothequeTrimestres .biblio-menu-trigger[data-param="biblio-menu-${T}"]`).click();
    }
    await expect(bouton).toBeVisible();
    await bouton.click();
}

const fenetreDeRefus = (page) => page.evaluate(() => {
    const o = document.getElementById('overlay-ui-dialogue');
    if (!o || o.getClientRects().length === 0) return null;
    const r = o.querySelector('.modal-contenu').getBoundingClientRect();
    const auDessus = document.elementFromPoint(r.left + r.width / 2, r.top + 20);
    return {
        titre: o.querySelector('.modal-titre').textContent,
        texte: o.querySelector('.modal-section').textContent.replace(/\s+/g, ' ').trim(),
        boutons: Array.from(o.querySelectorAll('.modal-actions button')).map((b) => b.textContent.trim()),
        // La fenêtre passe devant la bibliothèque des trimestres, restée ouverte derrière.
        devant: !!(auDessus && o.contains(auDessus))
    };
});

/** Faux partage (le chemin de l'iPad), aperçu accepté, téléchargements comptés sans écrire sur disque. */
async function poserOutilsDuCodex(page) {
    await page.evaluate(() => {
        delete window.showSaveFilePicker;
        Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
        Object.defineProperty(navigator, 'share', { configurable: true, value: async () => {} });
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        window.__ancresTelechargees = [];
        const clickOrig = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function () {
            if (this.download) { window.__ancresTelechargees.push(this.download); return; }
            return clickOrig.call(this);
        };
    });
}

test.describe('Lot I bis — supprimer un trimestre exige un codex à jour', () => {
    test.setTimeout(120000);

    // Même épinglage que le banc du lot I : la mise à jour du codex ne dépend pas de la
    // durée d'activation du toucher sous charge.
    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(15000);
        await page.addInitScript(() => Object.defineProperty(navigator, 'userActivation', { configurable: true, value: { isActive: true } }));
    });

    test('(1) codex pas à jour : refus, rien d\'effacé ; son bouton met le codex à jour ; à jour, la suppression est permise', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrerDemoAvecTrimestreInactif(page);
        await poserOutilsDuCodex(page);

        // Un codex actif qui n'a pas les derniers changements : l'état que le menu affiche.
        await page.evaluate(() => db.setSync('_codex_etat', { actif: true, nom: 'Codex du banc', derniereSauvegarde: '2030-09-01T12:00:00.000Z', modificationsDepuis: '2030-09-02T12:00:00.000Z', manifeste: null }));
        await page.reload();
        await page.waitForTimeout(3500);
        await poserOutilsDuCodex(page);
        expect(await etatAfficheParLeMenu(page)).toContain('Ton codex n\'a pas tes derniers changements');

        const avant = await contenu(page);
        expect(avant.auRegistre).toEqual([NOM]);
        expect(Object.keys(avant.cles).length).toBe(4); // garde de non-vide : il y a de quoi effacer

        // ----- le refus
        await cliquerSupprimer(page);
        await page.waitForSelector('#overlay-ui-dialogue');
        expect(await fenetreDeRefus(page)).toEqual({ titre: TITRE_REFUS, texte: TEXTE_REFUS, boutons: ['Fermer', 'Mettre à jour le codex'], devant: true });
        expect(ecoute.dialogues).toEqual([]);           // ni confirmation, ni saisie du nom
        expect(await contenu(page)).toEqual(avant);     // rien n'est effacé

        // ----- le bouton du refus : une vraie mise à jour du codex, par le chemin du menu
        await page.locator('#overlay-ui-dialogue .modal-actions button', { hasText: 'Mettre à jour le codex' }).click();
        await page.waitForFunction(() => { const e = Codex.etat(); return e.actif && !e.modificationsNonSauvees && e.derniereSauvegarde !== '2030-09-01T12:00:00.000Z'; }, null, { timeout: 60000 });
        expect(await contenu(page)).toEqual(avant);     // mettre le codex à jour n'efface rien non plus
        expect(await etatAfficheParLeMenu(page)).toContain('Ton codex est à jour');

        // ----- codex à jour : la confirmation, le nom, puis l'effacement ; aucun téléchargement
        await page.evaluate(() => { window.__ancresTelechargees = []; });
        ecoute.reponses.push(true, NOM, true);          // confirmation · nom retapé · message final
        await cliquerSupprimer(page);
        await expect.poll(() => ecoute.dialogues.length, { timeout: 20000 }).toBe(3);
        expect(await page.evaluate(() => !!document.getElementById('overlay-ui-dialogue'))).toBe(false);
        expect(ecoute.dialogues[0]).toEqual({ type: 'confirm', message: QUESTION });
        expect(ecoute.dialogues[1].type).toBe('prompt');
        expect(ecoute.dialogues[1].message).toContain('retape son nom exactement');
        expect(ecoute.dialogues[2].message).toMatch(/^Trimestre "Automne 2030 \(banc\)" supprimé \(\d+ clés de données effacées\)\.$/);

        const apres = await contenu(page);
        expect(apres).toEqual({ auRegistre: [], nbTrimestres: avant.nbTrimestres - 1, cles: {} });
        expect(await page.evaluate(() => window.__ancresTelechargees)).toEqual([]);
        expect(ecoute.telechargements).toEqual([]);
        // Le trimestre actif (le pack démo) n'a pas bougé.
        expect(await page.evaluate(() => (db.getSync('demo_groupeEtudiants', []) || []).length)).toBeGreaterThan(5);
        expect(ecoute.erreurs).toEqual([]);
    });

    test('(2) sans codex : même refus, rien d\'effacé', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrerDemoAvecTrimestreInactif(page);
        expect(await page.evaluate(() => Codex.etat().actif)).toBe(false);
        expect(await etatAfficheParLeMenu(page)).toContain('Aucun codex actif');

        const avant = await contenu(page);
        expect(Object.keys(avant.cles).length).toBe(4);

        ecoute.reponses.push(true, NOM, true);          // si la garde tombait, tout serait accepté
        await cliquerSupprimer(page);
        await page.waitForSelector('#overlay-ui-dialogue');
        expect(await fenetreDeRefus(page)).toEqual({ titre: TITRE_REFUS, texte: TEXTE_REFUS_SANS_CODEX, boutons: ['Fermer', 'Mettre à jour le codex'], devant: true });
        await page.locator('#overlay-ui-dialogue .modal-actions button', { hasText: 'Fermer' }).click();
        await page.waitForTimeout(500);
        expect(ecoute.dialogues).toEqual([]);
        expect(await contenu(page)).toEqual(avant);
        expect(ecoute.erreurs).toEqual([]);
    });

    test('(3) codex à jour : la confirmation refusée, puis le nom mal retapé, n\'effacent rien', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrerDemoAvecTrimestreInactif(page);
        // Le codex est mis à jour POUR DE VRAI, par le geste du menu : un état « à jour » semé
        // puis rechargé ne tient pas (le démarrage écrit, et le témoin le compte).
        await poserOutilsDuCodex(page);
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await page.waitForFunction(() => { const e = Codex.etat(); return e.actif && !e.modificationsNonSauvees; }, null, { timeout: 60000 });
        expect(await etatAfficheParLeMenu(page)).toContain('Ton codex est à jour');
        const avant = await contenu(page);
        expect(Object.keys(avant.cles).length).toBe(4);

        ecoute.reponses.push(false);                    // « Annuler » à la confirmation
        await cliquerSupprimer(page);
        await expect.poll(() => ecoute.dialogues.length).toBe(1);
        expect(ecoute.dialogues[0]).toEqual({ type: 'confirm', message: QUESTION });
        expect(await contenu(page)).toEqual(avant);

        ecoute.reponses.push(true, 'Automne 2030', true); // nom incomplet
        await cliquerSupprimer(page);
        await expect.poll(() => ecoute.dialogues.length).toBe(4);
        expect(ecoute.dialogues[3].message).toBe('Le nom saisi ne correspond pas. Suppression annulée.');
        expect(await contenu(page)).toEqual(avant);
        expect(await page.evaluate(() => !!document.getElementById('overlay-ui-dialogue'))).toBe(false);
        expect(ecoute.erreurs).toEqual([]);
    });
});

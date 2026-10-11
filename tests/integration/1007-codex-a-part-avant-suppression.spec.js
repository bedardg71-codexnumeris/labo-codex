import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// =======================================================================
// #1007, PREMIER LOT (2 oct. 2026) — AVANT DE SUPPRIMER, UN CODEX À PART
// =======================================================================
//
// Cinq gestes EXIGENT un fichier à part avant d'effacer (décision de Grégoire, 2 oct.) :
// X1 trimestre, X2 groupe-cours (deux portes), X3 « Supprimer un groupe… », X4 « Vider la
// liste », X5 « Réinitialiser toutes les données ». Une seule fonction pour les cinq
// (`Codex.ecrireAPartAvantSuppression`) : la fenêtre (mots acceptés le 2 oct., 20 h 28),
// `genererCodex`, l'écriture SANS ADOPTION sous un autre nom (destination toujours
// demandée), la confirmation de l'écriture ; SEULEMENT APRÈS, les confirmations du geste,
// telles qu'avant. Remplace le banc du lot I bis (le refus « codex pas à jour », retiré).
//
// Le banc fait le geste (la vraie page, le vrai dispatcher, les vrais boutons des fenêtres)
// et lit CE QUE L'APPLICATION CONTIENT APRÈS. Ce qu'il imite : la fenêtre de choix de Chrome
// (`showSaveFilePicker`, un fichier en mémoire qui compte ses écritures), la feuille de
// partage de l'iPad (`navigator.share`), un téléchargement (le clic du lien est intercepté).
// Ce qui reste inféré : ce que Safari de l'iPad fait vraiment de la feuille (« Enregistrer
// dans Fichiers ») ; le chemin d'écriture, lui, est celui de « Mettre à jour le codex ».

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

const T = 'a2030';
const NOM = 'Automne 2030 (banc)';
const TITRE = 'Avant de supprimer, un codex à part';
const SUITE = 'L\'application va d\'abord écrire un codex à part, sous un autre nom. Tes prochaines mises à jour n\'y toucheront pas : il te permettra de revenir en arrière.';
const PHRASE_X1 = 'Supprimer le trimestre « ' + NOM + ' » efface pour de bon ses étudiant·es, ses évaluations, ses présences, ses productions, ses captures et ses modèles.';
// #1037 (11 oct. 2026) : la question et la ressaisie du nom sont des fenêtres de l'application, plus
// des `confirm`/`prompt` natifs ; mêmes mots, le titre et le message séparés.
const QUESTION_X1_TITRE = 'Supprimer définitivement le trimestre « ' + NOM + ' » ?';
const QUESTION_X1_TEXTE = 'Toutes ses données seront effacées : étudiant·es, évaluations, présences, productions, captures et modèles.';
const SAISIE_X1_TITRE = 'Confirmation finale — cette action est IRRÉVERSIBLE.';
const NOM_A_PART = /^codex-.+-avant-suppression-\d{4}-\d{2}-\d{2}-\d{2}h\d{2}\.zip$/;

/** Écoute la page. Les dialogues natifs sont consignés ; `reponses` dit quoi répondre, dans l'ordre. */
function brancher(page) {
    const etat = { erreurs: [], dialogues: [], reponses: [], telechargements: [] };
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) etat.erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) etat.erreurs.push(m); } });
    page.on('download', (d) => etat.telechargements.push(d.suggestedFilename()));
    page.on('dialog', (d) => {
        etat.dialogues.push({ type: d.type(), message: d.message() });
        const r = etat.reponses.length ? etat.reponses.shift() : false;
        if (r === false) d.dismiss().catch(() => {});
        else if (typeof r === 'string') d.accept(r).catch(() => {});
        else d.accept().catch(() => {});
    });
    return etat;
}

/** Pack démo (le trimestre actif) + un trimestre fictif NON actif, et un groupe-cours de plus. */
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
    await page.evaluate(async ({ T, NOM }) => {
        const registre = db.getSync('trimestres', []);
        registre.push({ id: T, nom: NOM, session: 'A', annee: 2030, actif: false, archive: false });
        db.setSync('trimestres', registre);
        db.setSync(T + '_groupeEtudiants', [
            { id: 1, da: '9000011', groupe: '01', nom: 'Fictif', prenom: 'Alix', coursId: 'cours-banc' },
            { id: 2, da: '9000012', groupe: '01', nom: 'Inventée', prenom: 'Maude', coursId: 'cours-banc' }
        ]);
        db.setSync(T + '_presences', { '2030-09-03': { '9000011': { statut: 'present', heures: 2 } } });
        db.setSync(T + '_evaluationsSauvegardees', [{ id: 'EVAL_9000011_BANC', etudiantDA: '9000011', productionId: 'PROD_BANC', noteFinale: 72 }]);
        db.setSync(T + '_productions', [{ id: 'PROD_BANC', titre: 'Analyse fictive', ponderation: 20 }]);
        // Un second groupe d'élèves (fictifs) dans le trimestre actif : la démo n'en a qu'un.
        const cleEl = cle('groupeEtudiants');
        const eleves = db.getSync(cleEl, []) || [];
        const coursDemo = eleves[0] && eleves[0].coursId;
        db.setSync(cleEl, eleves.concat([
            { id: 9001, da: '9000021', groupe: '0banc', nom: 'Fictive', prenom: 'Lou', coursId: coursDemo },
            { id: 9002, da: '9000022', groupe: '0banc', nom: 'Imaginé', prenom: 'Noé', coursId: coursDemo }
        ]));
        const cleGC = cle('groupesCours');
        db.setSync(cleGC, (db.getSync(cleGC, []) || []).concat([{ id: 'GC_BANC', nom: 'Groupe-cours du banc', coursId: 'cours-banc', dansSidebar: true }]));
        await db.flush();
    }, { T, NOM });
}

/**
 * Les outils du codex, selon le navigateur imité.
 * - 'fenetre' (Chrome, Edge) : `showSaveFilePicker` rend un fichier en mémoire, nommé par
 *   le nom suggéré ; chaque écriture est comptée sous ce nom. `__choix.annuler` : AbortError.
 * - 'partage' (iPad) : pas de fenêtre de choix ; `navigator.share` consigne le nom du fichier ;
 *   `__choix.partageEchoue` : AbortError (feuille refermée).
 * - 'telechargement' : ni l'un ni l'autre ; le clic du lien est consigné, rien n'est écrit sur disque.
 * L'aperçu est accepté, sauf `__choix.apercuRefuse`.
 */
async function poserOutils(page, mode) {
    await page.evaluate((mode) => {
        window.__choix = { annuler: false, partageEchoue: false, apercuRefuse: false };
        window.__fenetres = [];      // noms suggérés à la fenêtre de choix
        window.__ecritures = [];     // { fichier, octets } : ce qui a été écrit, et où
        window.__partages = [];
        window.__liens = [];
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => !window.__choix.apercuRefuse;
        if (mode === 'fenetre') {
            window.showSaveFilePicker = async ({ suggestedName }) => {
                window.__fenetres.push(suggestedName);
                if (window.__choix.annuler) throw new DOMException('choix annulé', 'AbortError');
                return {
                    async createWritable() {
                        return {
                            async write(blob) { window.__ecritures.push({ fichier: suggestedName, octets: blob.size }); },
                            async close() {},
                            async abort() {}
                        };
                    }
                };
            };
        } else {
            delete window.showSaveFilePicker;
        }
        Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => mode === 'partage' });
        Object.defineProperty(navigator, 'share', { configurable: true, value: async ({ files }) => {
            window.__partages.push(files[0].name);
            if (window.__choix.partageEchoue) throw new DOMException('feuille refermée', 'AbortError');
        } });
        const clickOrig = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = function () {
            if (this.download) { window.__liens.push(this.download); return; }
            return clickOrig.call(this);
        };
    }, mode);
}

const traces = (page) => page.evaluate(() => ({ fenetres: window.__fenetres.slice(), ecritures: window.__ecritures.slice(), partages: window.__partages.slice(), liens: window.__liens.slice() }));

/** La fenêtre de l'application ouverte, s'il y en a une : ses mots, ses boutons, qui a le focus. */
const fenetre = (page) => page.evaluate(() => {
    const o = document.getElementById('overlay-ui-dialogue');
    if (!o || o.getClientRects().length === 0) return null;
    const r = o.querySelector('.modal-contenu').getBoundingClientRect();
    const auDessus = document.elementFromPoint(r.left + r.width / 2, r.top + 20);
    return {
        titre: o.querySelector('.modal-titre').textContent,
        texte: o.querySelector('.modal-section').textContent.replace(/\s+/g, ' ').trim(),
        boutons: Array.from(o.querySelectorAll('.modal-actions button')).map((b) => b.textContent.trim()),
        focus: document.activeElement ? document.activeElement.textContent.trim() : null,
        devant: !!(auDessus && o.contains(auDessus))
    };
});

const attendreFenetre = async (page, titre) => {
    await expect.poll(async () => (await fenetre(page))?.titre ?? null, { timeout: 30000 }).toBe(titre);
    return fenetre(page);
};
const cliquerDansFenetre = (page, texte) => page.locator('#overlay-ui-dialogue .modal-actions button', { hasText: texte }).click();
const aucuneFenetre = async (page) => expect.poll(() => fenetre(page), { timeout: 15000 }).toBeNull();

/**
 * « Annuler » dans la fenêtre du codex à part : aucune écriture ne commence. Sonde sans course :
 * la tentative d'écriture (`Codex.derniereTentative`) est ouverte dès que la fenêtre dit oui ;
 * la génération, elle, prend des secondes, et la fenêtre de choix vient après.
 */
async function annulerLaFenetre(page) {
    const avant = await page.evaluate(() => JSON.stringify(Codex.derniereTentative()));
    await cliquerDansFenetre(page, 'Annuler');
    await aucuneFenetre(page);
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => JSON.stringify(Codex.derniereTentative()))).toBe(avant);
}

/** La fenêtre du codex à part, mot pour mot ; « Annuler » a le focus. */
async function verifierFenetreDuCodexAPart(page, phrase) {
    expect(await attendreFenetre(page, TITRE)).toEqual({
        titre: TITRE,
        texte: phrase + ' ' + SUITE,
        boutons: ['Annuler', 'Écrire le codex à part'],
        focus: 'Annuler',
        devant: true
    });
}

/**
 * #1037 — la confirmation de « Supprimer… » (fenêtre de l'application, « Annuler » a le focus), puis,
 * si `nom` est donné, la ressaisie du nom. Sans `nom` : « Annuler », rien ne suit.
 */
async function repondreSuppressionX1(page, nom) {
    expect(await attendreFenetre(page, QUESTION_X1_TITRE)).toEqual({
        titre: QUESTION_X1_TITRE, texte: QUESTION_X1_TEXTE, boutons: ['Annuler', 'Supprimer'], focus: 'Annuler', devant: true
    });
    if (nom === undefined) {
        await cliquerDansFenetre(page, 'Annuler');
        await aucuneFenetre(page);
        return;
    }
    await cliquerDansFenetre(page, 'Supprimer');
    const saisie = await attendreFenetre(page, SAISIE_X1_TITRE);
    expect(saisie.texte).toContain('retape son nom exactement');
    await page.locator('#overlay-ui-dialogue input').fill(nom);
    await cliquerDansFenetre(page, 'Supprimer');
    await aucuneFenetre(page);
}

/** Ce que l'application contient pour le trimestre visé : son entrée au registre, et chacune de ses clés. */
const contenuX1 = (page) => page.evaluate(async (T) => {
    const toutes = Array.from(new Set([...(await db.keys()), ...Object.keys(localStorage)]));
    const cles = {};
    for (const c of toutes.filter((k) => k.includes(T)).sort()) cles[c] = JSON.stringify(await db.get(c, null));
    return { auRegistre: (db.getSync('trimestres', []) || []).filter((t) => t && t.id === T).map((t) => t.nom), cles };
}, T);

/** Le geste X1 : la bibliothèque des trimestres, la carte, « Supprimer… » — de vrais clics. */
async function cliquerSupprimerTrimestre(page) {
    if (!(await page.evaluate(() => !!document.getElementById('modalBibliothequeTrimestres')))) {
        await page.evaluate(() => ouvrirBibliothequeTrimestreV2());
        await page.waitForSelector('#modalBibliothequeTrimestres');
    }
    const bouton = page.locator(`#modalBibliothequeTrimestres [data-action="confirmerSuppressionTrimestre"][data-param="${T}"]`);
    await expect(bouton).toHaveCount(1);
    if (!(await bouton.isVisible())) {
        await page.locator(`#modalBibliothequeTrimestres .biblio-menu-trigger[data-param="biblio-menu-${T}"]`).click();
    }
    await expect(bouton).toBeVisible();
    await bouton.click();
}

test.describe('#1007 — avant de supprimer, un codex à part', () => {
    test.setTimeout(180000);

    test.beforeEach(async ({ page }) => {
        page.setDefaultTimeout(15000);
        // Le toucher reste actif : le partage ne dépend pas de la durée de préparation sous charge.
        await page.addInitScript(() => Object.defineProperty(navigator, 'userActivation', { configurable: true, value: { isActive: true } }));
    });

    test('X1, fenêtre de choix (Chrome) : « Annuler » à chaque étape ne supprime rien ; le fichier à part, puis la suppression comme avant ; le fichier tenu n\'est pas touché', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserOutils(page, 'fenetre');

        // Le codex habituel, tenu : une vraie mise à jour par le menu.
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await page.waitForFunction(() => { const e = Codex.etat(); return e.actif && !e.modificationsNonSauvees; }, null, { timeout: 60000 });
        const habituel = (await traces(page)).fenetres[0];
        expect(habituel).not.toMatch(/avant-suppression/);
        const etatAvant = await page.evaluate(() => Codex.etat().derniereSauvegarde);
        const avant = await contenuX1(page);
        expect(avant.auRegistre).toEqual([NOM]);
        expect(Object.keys(avant.cles).length).toBe(4); // garde de non-vide : il y a de quoi effacer

        // ----- 1. « Annuler » dans la fenêtre : rien n'est écrit, aucune question, rien d'effacé
        await cliquerSupprimerTrimestre(page);
        await verifierFenetreDuCodexAPart(page, PHRASE_X1);
        await annulerLaFenetre(page);
        expect((await traces(page)).fenetres).toEqual([habituel]);
        expect(ecoute.dialogues).toEqual([]);
        expect(await contenuX1(page)).toEqual(avant);

        // ----- 2. l'aperçu refusé
        await page.evaluate(() => { window.__choix.apercuRefuse = true; });
        await cliquerSupprimerTrimestre(page);
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await page.waitForTimeout(3000);
        await aucuneFenetre(page);
        expect((await traces(page)).fenetres).toEqual([habituel]);
        expect(ecoute.dialogues).toEqual([]);
        expect(await contenuX1(page)).toEqual(avant);
        await page.evaluate(() => { window.__choix.apercuRefuse = false; });

        // ----- 3. « Annuler » dans la fenêtre de choix
        await page.evaluate(() => { window.__choix.annuler = true; });
        await cliquerSupprimerTrimestre(page);
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await expect.poll(async () => (await traces(page)).fenetres.length, { timeout: 60000 }).toBe(2);
        await aucuneFenetre(page);
        expect(ecoute.dialogues).toEqual([]);
        expect(await contenuX1(page)).toEqual(avant);
        await page.evaluate(() => { window.__choix.annuler = false; });

        // ----- 4. le fichier à part écrit, puis « Annuler » à la confirmation du geste : rien d'effacé
        await cliquerSupprimerTrimestre(page);
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await repondreSuppressionX1(page);
        expect(ecoute.dialogues).toEqual([]);
        let t = await traces(page);
        expect(t.fenetres.length).toBe(3);   // le codex habituel, le choix annulé, le fichier à part
        const aPart = t.fenetres[2];
        expect(aPart).toMatch(NOM_A_PART);
        expect(aPart).not.toBe(habituel);
        expect(t.ecritures.filter((e) => e.fichier === aPart).length).toBe(1);
        expect(t.ecritures.filter((e) => e.fichier === aPart)[0].octets).toBeGreaterThan(1000);
        expect(t.ecritures.filter((e) => e.fichier === habituel).length).toBe(1);   // le fichier tenu n'est pas touché
        expect(await contenuX1(page)).toEqual(avant);

        // ----- 5. le chemin entier : le fichier à part, la confirmation, le nom, l'effacement
        await cliquerSupprimerTrimestre(page);
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await repondreSuppressionX1(page, NOM);
        await expect.poll(() => contenuX1(page), { timeout: 30000 }).toEqual({ auRegistre: [], cles: {} });
        expect(ecoute.dialogues).toEqual([]);
        t = await traces(page);
        expect(t.fenetres.length).toBe(4);
        expect(t.fenetres[3]).toMatch(NOM_A_PART);
        expect(t.liens).toEqual([]);
        expect(ecoute.telechargements).toEqual([]);

        // ----- 6. sans adoption : l'état du codex habituel n'a pas bougé, et la mise à jour
        //          suivante réécrit le fichier tenu, sans fenêtre de choix
        expect(await page.evaluate(() => Codex.etat().derniereSauvegarde)).toBe(etatAvant);
        await page.evaluate(() => { Codex.actionEnregistrer(); });
        await expect.poll(async () => (await traces(page)).ecritures.filter((e) => e.fichier === habituel).length, { timeout: 60000 }).toBe(2);
        t = await traces(page);
        expect(t.fenetres.length).toBe(4);
        expect(t.ecritures.filter((e) => /avant-suppression/.test(e.fichier)).length).toBe(2);
        expect(ecoute.erreurs).toEqual([]);
    });

    test('X1, feuille de partage (iPad) : un partage refermé se dit et ne supprime rien ; réussi, la suppression suit', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserOutils(page, 'partage');
        const avant = await contenuX1(page);
        expect(Object.keys(avant.cles).length).toBe(4);

        await page.evaluate(() => { window.__choix.partageEchoue = true; });
        await cliquerSupprimerTrimestre(page);
        await verifierFenetreDuCodexAPart(page, PHRASE_X1);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        const echec = await attendreFenetre(page, 'Codex à part non écrit');
        expect(echec.texte).toMatch(/^Le fichier \(environ \d+ (Ko|Mo)\) n'a pas été enregistré : rien n'a été supprimé\. Si ton appareil manque d'espace, libères-en, puis réessaie\.$/);
        expect(echec.boutons).toEqual(['Fermer', 'Télécharger à la place', 'Réessayer']);
        await cliquerDansFenetre(page, 'Fermer');
        await aucuneFenetre(page);
        expect((await traces(page)).partages).toHaveLength(1);
        expect(ecoute.dialogues).toEqual([]);
        expect(await contenuX1(page)).toEqual(avant);

        await page.evaluate(() => { window.__choix.partageEchoue = false; });
        await cliquerSupprimerTrimestre(page);
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await repondreSuppressionX1(page, NOM);
        expect(ecoute.dialogues).toEqual([]);
        await expect.poll(() => contenuX1(page), { timeout: 30000 }).toEqual({ auRegistre: [], cles: {} });
        const t = await traces(page);
        expect(t.partages).toHaveLength(2);
        expect(t.partages[1]).toMatch(NOM_A_PART);
        expect(await contenuX1(page)).toEqual({ auRegistre: [], cles: {} });
        expect(ecoute.erreurs).toEqual([]);
    });

    test('X1, téléchargement : « Il n\'y est pas » ne supprime rien ; « Il y est », la suppression suit', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserOutils(page, 'telechargement');
        const avant = await contenuX1(page);

        await cliquerSupprimerTrimestre(page);
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        const lance = await attendreFenetre(page, 'Téléchargement lancé');
        expect(lance.boutons).toEqual(['Il n\'y est pas', 'Il y est']);
        expect(lance.texte).toMatch(/« codex-.+-avant-suppression-\d{4}-\d{2}-\d{2}-\d{2}h\d{2}\.zip »/);
        await cliquerDansFenetre(page, 'Il n\'y est pas');
        await attendreFenetre(page, 'Codex à part non écrit');
        await cliquerDansFenetre(page, 'Fermer');
        await aucuneFenetre(page);
        expect(ecoute.dialogues).toEqual([]);
        expect(await contenuX1(page)).toEqual(avant);

        await cliquerSupprimerTrimestre(page);
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await attendreFenetre(page, 'Téléchargement lancé');
        expect(ecoute.dialogues).toEqual([]);   // rien avant « Il y est »
        await cliquerDansFenetre(page, 'Il y est');
        await repondreSuppressionX1(page, NOM);
        expect(ecoute.dialogues).toEqual([]);
        await expect.poll(() => contenuX1(page), { timeout: 30000 }).toEqual({ auRegistre: [], cles: {} });
        const t = await traces(page);
        expect(t.liens).toHaveLength(2);
        t.liens.forEach((n) => expect(n).toMatch(NOM_A_PART));
        expect(await contenuX1(page)).toEqual({ auRegistre: [], cles: {} });
        expect(ecoute.erreurs).toEqual([]);
    });

    test('X2, groupe-cours, par ses deux portes : la fenêtre, « Annuler » ne supprime rien ; écrit, la suppression comme avant', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserOutils(page, 'fenetre');
        const groupes = () => page.evaluate(() => (db.getSync(cle('groupesCours'), []) || []).map((g) => g.id).sort());
        const avant = await groupes();
        expect(avant).toContain('GC_BANC');
        expect(avant.length).toBeGreaterThan(1);
        // Chaque porte nomme le groupe-cours à sa façon, comme avant #1007 : la bibliothèque par le
        // titre de sa carte, la fiche par le nom enregistré.
        const titreCarte = await page.evaluate(() => {
            ouvrirModalBibliothequeGroupeCours();
            const b = document.querySelector('[data-action="supprimerGroupeCoursDepuisBibliotheque"][data-param="GC_BANC"]');
            return b.getAttribute('data-param2');
        });
        const phraseDe = (nom) => 'Supprimer le groupe-cours « ' + nom + ' » l\'efface pour de bon.';
        const questionDe = (nom) => 'Supprimer le groupe-cours "' + nom + '" ?\n\nCette action est irréversible.';
        const phrase = phraseDe(titreCarte);
        const question = questionDe(titreCarte);

        // Porte 1 : la bibliothèque des groupes-cours, le menu de la carte, « Supprimer ».
        const porteBibliotheque = async () => {
            if (!(await page.evaluate(() => !!document.getElementById('modalBibliothequeGroupeCours')))) {
                await page.evaluate(() => ouvrirModalBibliothequeGroupeCours());
            }
            const bouton = page.locator('[data-action="supprimerGroupeCoursDepuisBibliotheque"][data-param="GC_BANC"]');
            await expect(bouton).toHaveCount(1);
            if (!(await bouton.isVisible())) {
                await bouton.locator('xpath=ancestor::span[contains(@class,"biblio-menu-wrapper")]').locator('.biblio-menu-trigger').click();
            }
            await expect(bouton).toBeVisible();
            await bouton.click();
        };
        await porteBibliotheque();
        await verifierFenetreDuCodexAPart(page, phrase);
        await annulerLaFenetre(page);
        expect(ecoute.dialogues).toEqual([]);
        expect(await groupes()).toEqual(avant);

        ecoute.reponses.push(false);   // fichier à part écrit, puis « Annuler » à la confirmation
        await porteBibliotheque();
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await expect.poll(() => ecoute.dialogues.length, { timeout: 60000 }).toBe(1);
        expect(ecoute.dialogues[0]).toEqual({ type: 'confirm', message: question });
        expect((await traces(page)).fenetres.filter((n) => NOM_A_PART.test(n))).toHaveLength(1);
        expect(await groupes()).toEqual(avant);

        // Porte 2 : la fiche du groupe-cours, « Supprimer ».
        await page.evaluate(() => { if (document.getElementById('modalBibliothequeGroupeCours')) fermerModalBibliothequeGroupeCours(); });
        // Le geste offert : choisir le groupe-cours au menu de la fiche.
        await page.evaluate(() => {
            chargerGroupeCoursV2();
            const menu = document.getElementById('v2-selectGroupeCours');
            menu.value = 'GC_BANC';
            menu.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await expect.poll(() => page.evaluate(() => document.getElementById('v2-selectGroupeCours').value)).toBe('GC_BANC');
        await expect.poll(() => page.evaluate(() => !document.getElementById('v2-btnSupprimerGroupeCours').classList.contains('u-hide'))).toBe(true);
        const porteFiche = () => page.evaluate(() => document.getElementById('v2-btnSupprimerGroupeCours').click());
        await porteFiche();
        await verifierFenetreDuCodexAPart(page, phraseDe('Groupe-cours du banc'));
        await annulerLaFenetre(page);
        expect(ecoute.dialogues).toHaveLength(1);
        expect(await groupes()).toEqual(avant);

        ecoute.reponses.push(true);
        await porteFiche();
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await expect.poll(async () => (await groupes()).length, { timeout: 60000 }).toBe(avant.length - 1);
        expect(ecoute.dialogues).toHaveLength(2);
        expect(ecoute.dialogues[1]).toEqual({ type: 'confirm', message: questionDe('Groupe-cours du banc') });
        expect(await groupes()).toEqual(avant.filter((id) => id !== 'GC_BANC'));
        expect((await traces(page)).fenetres.filter((n) => NOM_A_PART.test(n))).toHaveLength(2);
        expect(ecoute.erreurs).toEqual([]);
    });

    test('X3 « Supprimer un groupe… » et X4 « Vider la liste » : la fenêtre, « Annuler » ne supprime rien ; écrit, la suppression comme avant', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserOutils(page, 'fenetre');
        const eleves = () => page.evaluate(async () => (await db.get(cle('groupeEtudiants'))) || []);
        const tous = await eleves();
        expect(tous.length).toBeGreaterThan(5);
        await page.evaluate(() => chargerListeEtudiantsV2());
        await page.waitForTimeout(500);
        // Le geste offert par l'écran : un groupe choisi au menu, puis « Supprimer le groupe ».
        await page.evaluate(() => {
            const menu = document.getElementById('v2-selectGroupe');
            const o = [...menu.options].find((x) => x.value);
            menu.value = o.value;
            menu.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await page.waitForTimeout(500);
        // Le libellé que dit le bouton (« Supprimer le groupe ‹libellé› ») : la fenêtre doit dire le même.
        const groupe = await page.evaluate(() => document.getElementById('v2-btnSupprimerGroupe').textContent.replace(/\s+/g, ' ').trim().replace(/^Supprimer le groupe /, ''));
        const cliquer = (action) => page.evaluate((a) => document.querySelector(`[data-action="${a}"]`).click(), action);

        await cliquer('supprimerGroupeSelectionneV2');
        const f = await attendreFenetre(page, TITRE);
        expect(f.texte).toMatch(new RegExp('^Supprimer le groupe « ' + groupe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' » efface pour de bon (ses \\d+ étudiant·es|son étudiant·e)\\. '));
        expect(f.focus).toBe('Annuler');
        await annulerLaFenetre(page);
        expect(ecoute.dialogues).toEqual([]);
        expect(await eleves()).toEqual(tous);

        ecoute.reponses.push(true);
        await cliquer('supprimerGroupeSelectionneV2');
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await expect.poll(() => ecoute.dialogues.length, { timeout: 60000 }).toBe(1);
        expect(ecoute.dialogues[0].message).toMatch(new RegExp('^Supprimer les \\d+ étudiant\\(s\\) du groupe .+ \\? Cette action est irréversible\\.$'));
        await expect.poll(async () => (await eleves()).length, { timeout: 15000 }).toBeLessThan(tous.length);
        const restants = await eleves();
        expect(restants.length).toBeGreaterThan(0);

        // X4 : toute la liste.
        await cliquer('viderListeEtudiantsV2');
        await verifierFenetreDuCodexAPart(page, 'Vider la liste efface pour de bon toute la liste : ' +
            (restants.length === 1 ? 'ton étudiant·e' : 'tes ' + restants.length + ' étudiant·es') + ', de tous les groupes.');
        await annulerLaFenetre(page);
        expect(ecoute.dialogues).toHaveLength(1);
        expect(await eleves()).toEqual(restants);

        ecoute.reponses.push(true);
        await cliquer('viderListeEtudiantsV2');
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await expect.poll(() => ecoute.dialogues.length, { timeout: 60000 }).toBe(2);
        expect(ecoute.dialogues[1].message).toBe(`Supprimer les ${restants.length} étudiant(s) ? Cette action est irréversible.`);
        await expect.poll(async () => (await eleves()).length, { timeout: 15000 }).toBe(0);
        expect((await traces(page)).fenetres.filter((x) => NOM_A_PART.test(x))).toHaveLength(2);
        expect(ecoute.erreurs).toEqual([]);
    });

    test('X5 « Réinitialiser toutes les données » : « Annuler » ne supprime rien ; écrit, les trois confirmations, puis tout part', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        await poserOutils(page, 'fenetre');
        const phrase = 'Réinitialiser efface pour de bon toutes tes données : tes trimestres, tes étudiant·es, tes évaluations, tes présences, tes productions, tes captures, tes modèles et tes réglages.';
        const compte = () => page.evaluate(async () => (await db.keys()).length);
        const avant = await compte();
        expect(avant).toBeGreaterThan(10);
        const cliquer = () => page.evaluate(() => document.querySelector('[data-action="reinitialiserDonnees"]').click());

        await cliquer();
        await verifierFenetreDuCodexAPart(page, phrase);
        await annulerLaFenetre(page);
        expect(ecoute.dialogues).toEqual([]);
        expect(await compte()).toBe(avant);

        ecoute.reponses.push(false);   // fichier à part écrit, « Annuler » à la première confirmation
        await cliquer();
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await expect.poll(() => ecoute.dialogues.length, { timeout: 60000 }).toBe(1);
        expect(ecoute.dialogues[0].message).toBe('ATTENTION : Cette action va effacer TOUTES les données de l\'application.\n\nEs-tu sûr de vouloir continuer ?');
        expect(await compte()).toBe(avant);
        expect((await traces(page)).fenetres.filter((x) => NOM_A_PART.test(x))).toHaveLength(1);

        ecoute.reponses.push(true, true, 'EFFACER', true);
        await cliquer();
        await attendreFenetre(page, TITRE);
        await cliquerDansFenetre(page, 'Écrire le codex à part');
        await expect.poll(() => ecoute.dialogues.length, { timeout: 60000 }).toBe(5);
        expect(ecoute.dialogues[2].message).toBe('Cette action est IRRÉVERSIBLE.\n\nAs-tu exporté tes données avant de continuer ?');
        expect(ecoute.dialogues[3].type).toBe('prompt');
        expect(ecoute.dialogues[4].message).toContain('Toutes les données ont été effacées.');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2500);
        const apres = await page.evaluate(async (T) => ({
            // (Le pack démo, lui, se réamorce à chaque démarrage : il ne dit rien ici.)
            trimestreDuBanc: (db.getSync('trimestres', []) || []).some((t) => t && t.id === T),
            elevesDuBanc: (await db.get(T + '_groupeEtudiants', null))
        }), T);
        expect(apres).toEqual({ trimestreDuBanc: false, elevesDuBanc: null });
    });

    test('témoin : une évaluation ne demande pas de codex à part — le second lot lui PROPOSE la mise à jour (jugé par 1007-propose-codex-avant-suppression.spec.js)', async ({ page }) => {
        const ecoute = brancher(page);
        await demarrer(page);
        const evals = () => page.evaluate(() => (db.getSync(cle('evaluationsSauvegardees'), []) || []).map((e) => e.id));
        const avant = await evals();
        const cible = await page.evaluate(() => (db.getSync(cle('evaluationsSauvegardees'), []) || []).find((e) => !e.verrouillee).id);
        ecoute.reponses.push(true);
        await page.evaluate((id) => { supprimerEvaluation(id); }, cible);
        // Aucun codex actif : la fenêtre qui propose, pas celle qui exige.
        expect((await attendreFenetre(page, 'Écrire un codex avant de supprimer ?')).boutons)
            .toEqual(['Annuler', 'Supprimer sans codex', 'Écrire un codex, puis supprimer']);
        await cliquerDansFenetre(page, 'Supprimer sans codex');
        await expect.poll(() => ecoute.dialogues.length).toBe(1);
        expect(ecoute.dialogues[0].message).toMatch(/^Veux-tu vraiment supprimer .+\n\nCette action est irréversible\.$/s);
        await expect.poll(async () => (await evals()).length).toBe(avant.length - 1);
        expect(await evals()).not.toContain(cible);
        expect(ecoute.erreurs).toEqual([]);
    });
});

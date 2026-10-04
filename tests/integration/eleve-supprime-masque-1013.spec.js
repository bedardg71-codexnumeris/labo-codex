import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1013 (consigne de Cowork du 4 oct. 2026, 10 h 36) — CE QUI RESTE D'UN ÉLÈVE SUPPRIMÉ NE SE
// MONTRE PLUS, ET RIEN N'EST EFFACÉ.
//
// Mesuré avant le lot (4 oct., pack démo, élève supprimé par « Supprimer » du Cadre) : ses
// lignes de notes disparaissaient, mais ses copies restaient dans la Liste des évaluations
// (« ? », DA brut, comptées dans « N résultat(s) ») et dans le tableau des copies du module
// Travaux (« Inconnu »).
//
// LA RÈGLE JUGÉE ICI, par le geste (`supprimerEtudiantV2`, la fonction du menu « Supprimer ») :
//   1. Plus aucune ligne de lui dans la Liste des évaluations (une par production, plus sa
//      copie sans production) ; le compte « N résultat(s) » baisse exactement de ces lignes.
//   2. Plus aucune de ses copies dans le tableau des copies du module Travaux ; la copie d'un
//      autre élève y reste (le filtre ne mange pas le voisin).
//   3. Ses copies, ses évaluations et ses présences restent en base, et le codex les écrit.
//   4. Réinscrit par le formulaire du Cadre (même DA), il revient avec tout.
//
// La lecture unique est `dasElevesSupprimes` (import-export.js), que lit
// `travauxStockage.obtenirFichiersAffiches`. Le pack démo n'a pas de copies : le banc les pose.
// Les élèves de la démo ont un DA « DEMO… » que le formulaire refuse (sept chiffres) : le banc
// ajoute un élève fictif à sept chiffres, pour que la réinscription passe par le vrai formulaire.

const DA = '9001013';
const COPIES_DE_LUI = ['FT_1013_a', 'FT_1013_b'];
const COPIE_TEMOIN = 'FT_1013_temoin';

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i,
    /Failed to load resource/i
];

async function demarrer(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = 'pageerror: ' + e.message; if (!estAttendue(m)) erreurs.push(m); });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.goto(indexHtml, { timeout: 60000 });
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
    await page.reload({ timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.evaluate(() => activerModeDemo());
    await page.waitForTimeout(3000);
    // L'élève fictif, rattaché comme un élève de la démo ; deux évaluations, une présence,
    // deux copies (l'une sur une production, l'autre sans) ; une copie d'un élève de la démo.
    const temoin = await page.evaluate(async ({ da, copies, copieTemoin }) => {
        const cleEl = cle('groupeEtudiants');
        const eleves = db.getSync(cleEl, []);
        const modele = eleves[0];
        db.setSync(cleEl, eleves.concat([{ id: 91013, da, nom: 'Fictif', prenom: 'Sacha', groupe: modele.groupe, coursId: modele.coursId }]));
        const cleEv = cle('evaluationsSauvegardees');
        const evals = db.getSync(cleEv, []);
        const prods = [...new Set(evals.map((e) => e.productionId))].slice(0, 2);
        db.setSync(cleEv, evals.concat(prods.map((p, i) => Object.assign({}, evals.find((e) => e.productionId === p), {
            id: 'EVAL_1013_' + i, etudiantDA: da, etudiantNom: 'Fictif, Sacha', remplaceeParId: null
        }))));
        const clePr = cle('presences');
        const pres = db.getSync(clePr, []);
        db.setSync(clePr, pres.concat([Object.assign({}, pres[0], { da })]));
        const gc = db.getSync('groupeCoursActif', null);
        const copie = (id, etudiantDA, productionId) => ({
            id, nomFichier: id + '.png', typeMIME: 'image/png', etudiantDA, productionId,
            groupeCoursId: gc && gc.id, blobStatut: 'present', dateImport: new Date().toISOString()
        });
        db.setSync(cle('fichiersTravaux'), [copie(copies[0], da, prods[0]), copie(copies[1], da, ''), copie(copieTemoin, modele.da, prods[0])]);
        await db.flush();
        return modele.da;
    }, { da: DA, copies: COPIES_DE_LUI, copieTemoin: COPIE_TEMOIN });
    return { erreurs, temoin };
}

/** La Liste des évaluations, rendue par la navigation : ses lignes pour ce DA et son compte. */
async function lireListe(page) {
    await page.evaluate(() => { afficherSection('evaluations'); afficherSousSection('evaluations-liste'); });
    await expect(page.locator('#corps-tableau-evaluations tr').first()).toBeAttached();
    await page.waitForTimeout(800);
    return page.evaluate((da) => {
        const lignes = [...document.querySelectorAll('#corps-tableau-evaluations tr')];
        const compteur = document.getElementById('compteur-evaluations').textContent;
        return { deLui: lignes.filter((t) => t.dataset.da === da).length, resultats: parseInt(compteur, 10), compteur };
    }, DA);
}

/** Le tableau des copies du module Travaux (« Annoter et évaluer »). */
async function lireCopies(page) {
    return page.evaluate(() => {
        travauxUI.afficherFichiers();
        return [...document.querySelectorAll('#travaux-tableau-fichiers tbody tr')].map((t) => t.dataset.fichierId);
    });
}

/** L'export recherche, par la vraie fonction : ce qui part (le fichier anonyme) et la table privée. */
async function lireExportRecherche(page) {
    return page.evaluate(async (da) => {
        const blobs = [];
        const origine = URL.createObjectURL;
        const clic = HTMLAnchorElement.prototype.click;
        URL.createObjectURL = (b) => { blobs.push(b); return origine.call(URL, b); };
        HTMLAnchorElement.prototype.click = function () {};
        try {
            const r = await exporterFormatRecherche({ cleSecrete: 'banc-1013' });
            const table = JSON.parse(await blobs[1].text());
            return { nbEvaluations: r.nbEvaluations, nbPresences: r.nbPresences, sonDA: Object.values(table.correspondances).includes(da) };
        } finally {
            URL.createObjectURL = origine;
            HTMLAnchorElement.prototype.click = clic;
        }
    }, DA);
}

/** « Exporter et archiver » : la grille (ses copies), le compte en stock, Léa, et l'export ZIP. */
async function lireArchivage(page, productionLea) {
    return page.evaluate(async ({ prod }) => {
        travauxUI.afficherArchivage();
        const zone = document.getElementById('evaluations-contenu-archivage');
        const grille = [...new Set([...zone.querySelectorAll('[data-fichier-id]')].map((b) => b.dataset.fichierId))].sort();
        const stock = parseInt(zone.querySelector('p.texte-muted').textContent, 10);
        const lea = travauxArchivage.selectionnerEvaluationsLea(prod, null, false).fichiers.map((f) => f.id).sort();
        const zip = await travauxArchivage.exporterTravaux({ compression: false });
        return { grille, stock, lea, zip: (zip.exportes || []).slice().sort() };
    }, { prod: productionLea });
}

test('#1013 — un élève supprimé quitte la Liste et le tableau des copies ; ses données restent et le codex les écrit', async ({ page }) => {
    test.setTimeout(120000);
    page.setDefaultTimeout(15000);
    const { erreurs, temoin } = await demarrer(page);

    // AVANT : il est là, partout.
    const avant = await lireListe(page);
    // Une ligne par production à évaluer (évaluée ou non), plus sa copie sans production.
    expect(avant.deLui, 'témoin : il a ses lignes dans la Liste (' + avant.deLui + ')').toBeGreaterThan(2);
    expect(await lireCopies(page), 'témoin : ses deux copies et celle du voisin').toEqual([...COPIES_DE_LUI, COPIE_TEMOIN]);
    const prodA = await page.evaluate((id) => {
        const octets = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));
        window.travauxStockage.recupererBlob = async () => new Blob([octets], { type: 'image/png' });
        window.SecuriteExportPreview.previewZipEtConfirmer = async () => true;
        return db.getSync(cle('fichiersTravaux'), []).find((f) => f.id === id).productionId;
    }, COPIES_DE_LUI[0]);
    const rechercheAvant = await lireExportRecherche(page);
    expect(rechercheAvant.sonDA, 'témoin : l\'export recherche part avec lui').toBe(true);
    const archivageAvant = await lireArchivage(page, prodA);
    expect(archivageAvant.grille, 'témoin : la grille d\'« Exporter et archiver » montre ses copies').toEqual([...COPIES_DE_LUI, COPIE_TEMOIN].sort());
    expect(archivageAvant.lea, 'témoin : l\'export pour Léa prend sa copie évaluée').toContain(COPIES_DE_LUI[0]);

    // LE GESTE : « Supprimer » du Cadre (le codex proposé est écarté, la question acceptée).
    await page.evaluate(async (da) => {
        Codex.proposerAvantSuppression = async () => true;
        await supprimerEtudiantV2(da);
        await db.flush();
    }, DA);
    expect(await page.evaluate(() => db.getSync(cle('elevesDesinscrits'), []).map((t) => t.da)), 'la trace est écrite').toEqual([DA]);

    // 1 et 2 : il ne se montre plus ; le voisin, si.
    const apres = await lireListe(page);
    expect(apres.deLui, 'aucune ligne de lui dans la Liste des évaluations').toBe(0);
    expect(apres.resultats, '« N résultat(s) » baisse exactement de ses lignes (' + avant.compteur + ' → ' + apres.compteur + ')').toBe(avant.resultats - avant.deLui);
    expect(await lireCopies(page), 'ses copies ont quitté le tableau des copies ; celle du voisin reste').toEqual([COPIE_TEMOIN]);

    // Ce qui part chez quelqu'un l'écarte : l'export recherche (ni ses présences, ni ses évaluations).
    const rechercheApres = await lireExportRecherche(page);
    expect(rechercheApres, 'l\'export recherche part sans lui : deux évaluations et une présence de moins, aucun identifiant pour lui').toEqual({
        nbEvaluations: rechercheAvant.nbEvaluations - 2, nbPresences: rechercheAvant.nbPresences - 1, sonDA: false
    });

    // « Exporter et archiver » : ce qui montre ou envoie l'écarte ; ce qui garde emporte tout.
    const archivageApres = await lireArchivage(page, prodA);
    expect(archivageApres.grille, 'la grille (et son aperçu PDF) ne montre plus ses copies').toEqual([COPIE_TEMOIN]);
    expect(archivageApres.lea, 'l\'export pour Léa ne l\'envoie plus').not.toContain(COPIES_DE_LUI[0]);
    expect(archivageApres.stock, 'le compte « en stock » garde ses copies').toBe(archivageAvant.stock);
    expect(archivageApres.zip, 'l\'export ZIP « Toutes / Tous » emporte tout, ses copies comprises (elles deviennent « exportées », retirables)').toEqual([...COPIES_DE_LUI, COPIE_TEMOIN].sort());

    // 3 : rien n'est effacé, et le codex écrit tout.
    const base = await page.evaluate((da) => ({
        copies: db.getSync(cle('fichiersTravaux'), []).filter((f) => f.etudiantDA === da).map((f) => f.id).sort(),
        evaluations: db.getSync(cle('evaluationsSauvegardees'), []).filter((e) => e.etudiantDA === da).length,
        presences: db.getSync(cle('presences'), []).filter((p) => p.da === da).length
    }), DA);
    expect(base, 'ses données sont toujours en base').toEqual({ copies: COPIES_DE_LUI, evaluations: 2, presences: 1 });

    const codex = await page.evaluate(async (da) => {
        const rendu = await Codex.generer({ nom: 'Codex du banc 1013' });
        const zip = await JSZip.loadAsync(await rendu.blob.arrayBuffer());
        const donnees = JSON.parse(await zip.file('donnees.json').async('string'));
        const de = (suffixe) => Object.keys(donnees).filter((c) => c.endsWith(suffixe)).flatMap((c) => {
            const v = typeof donnees[c] === 'string' ? JSON.parse(donnees[c]) : donnees[c];
            return Array.isArray(v) ? v : [];
        });
        return {
            copies: de('_fichiersTravaux').filter((f) => f.etudiantDA === da).map((f) => f.id).sort(),
            evaluations: de('_evaluationsSauvegardees').filter((e) => e.etudiantDA === da).length,
            fichiers: Object.keys(zip.files).filter((n) => n.indexOf('travaux/') === 0 && /FT_1013_[ab]/.test(n)).length
        };
    }, DA);
    expect(codex, 'le codex écrit ses copies (entrées et fichiers) et ses évaluations').toEqual({ copies: COPIES_DE_LUI, evaluations: 2, fichiers: 2 });

    // 4 : réinscrit par le formulaire du Cadre, il revient avec tout.
    await page.evaluate(async ({ da, temoinDa }) => {
        const groupe = db.getSync(cle('groupeEtudiants'), []).find((e) => e.da === temoinDa).groupe;
        document.getElementById('v2-etudiantDA').value = da;
        document.getElementById('v2-etudiantNom').value = 'Fictif';
        document.getElementById('v2-etudiantPrenom').value = 'Sacha';
        const g = document.getElementById('v2-etudiantGroupe');
        if (g) g.value = groupe;
        await soumettreEtudiantV2();
        await db.flush();
    }, { da: DA, temoinDa: temoin });
    expect(await page.evaluate((da) => db.getSync(cle('groupeEtudiants'), []).some((e) => e.da === da), DA), 'témoin : le formulaire l\'a réinscrit').toBe(true);
    expect((await lireListe(page)).deLui, 'réinscrit, ses lignes reviennent').toBe(avant.deLui);
    expect(await lireCopies(page), 'réinscrit, ses copies reviennent').toEqual([...COPIES_DE_LUI, COPIE_TEMOIN]);

    expect(erreurs, 'aucune erreur de page').toEqual([]);
});

test('#1013 — seuils « en attente » sans ses présences ni ses évaluations ; la phrase quand toutes les copies du groupe sont masquées', async ({ page }) => {
    test.setTimeout(120000);
    page.setDefaultTimeout(15000);
    const { erreurs } = await demarrer(page);
    // Le groupe ne garde que LUI : sa présence est la seule séance, ses deux évaluations les
    // seules productions évaluées, ses deux copies les seules du groupe.
    await page.evaluate(async ({ da, copies }) => {
        db.setSync(cle('presences'), db.getSync(cle('presences'), []).filter((p) => p.da === da));
        db.setSync(cle('evaluationsSauvegardees'), db.getSync(cle('evaluationsSauvegardees'), []).filter((e) => e.etudiantDA === da));
        db.setSync(cle('fichiersTravaux'), db.getSync(cle('fichiersTravaux'), []).filter((f) => copies.includes(f.id)));
        await db.flush();
    }, { da: DA, copies: COPIES_DE_LUI });

    const lire = () => page.evaluate(async () => {
        chargerTableauBordApercu();
        await new Promise((r) => setTimeout(r, 800));
        const carte = document.getElementById('carte-indicateurs-acpe').textContent;
        travauxUI.afficherFichiers();
        const message = document.getElementById('travaux-fichiers-message-vide');
        return {
            seanceEnAttente: /\d+ séance en attente/.test(carte),
            barresEvaluationsEnAttente: (carte.match(/\d+ évaluations? en attente/g) || []).length,
            copies: document.querySelectorAll('#travaux-tableau-fichiers tbody tr').length,
            message: message ? message.textContent : null
        };
    });

    const avant = await lire();
    expect(avant, 'témoin : sa séance et ses évaluations font les seuils ; ses copies sont au tableau').toMatchObject({ seanceEnAttente: false, copies: 2, message: null });
    expect(avant.barresEvaluationsEnAttente, 'témoin : C a ses évaluations (seul P peut attendre)').toBeLessThan(2);

    await page.evaluate(async (da) => {
        Codex.proposerAvantSuppression = async () => true;
        await supprimerEtudiantV2(da);
        await db.flush();
    }, DA);

    const apres = await lire();
    expect(apres.seanceEnAttente, 'sa présence ne compte plus : « 1 séance en attente »').toBe(true);
    expect(apres.barresEvaluationsEnAttente, 'ses évaluations ne comptent plus : C et P attendent tous deux').toBe(2);
    expect(apres.copies, 'aucune copie au tableau').toBe(0);
    expect(apres.message, 'la phrase de Grégoire, quand le groupe a des copies toutes masquées').toBe('Aucune copie à afficher : celles de ce groupe appartiennent à des étudiant·es supprimé·es.');

    // Un groupe sans aucune copie garde « Aucun fichier importé. ».
    const vide = await page.evaluate(async () => {
        db.setSync(cle('fichiersTravaux'), []);
        await db.flush();
        travauxUI.afficherFichiers();
        return document.getElementById('travaux-fichiers-message-vide').textContent;
    });
    expect(vide, 'sans copie, la phrase d\'avant').toBe('Aucun fichier importé. Importe des travaux depuis l\'onglet « Préparer et importer ».');

    expect(erreurs, 'aucune erreur de page').toEqual([]);
});

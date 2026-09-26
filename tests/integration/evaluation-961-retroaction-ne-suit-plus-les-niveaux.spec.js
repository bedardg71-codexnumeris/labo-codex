import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #961 (D7, décision de Grégoire du 26 sept. 2026) — une rétroaction finale réécrite à la main ne
// suit plus les niveaux. Mesuré avant le correctif : changer un niveau (ou des points) après une
// frappe dans la zone remplaçait tout le texte par la version générée, et l'auto-save l'écrivait
// 1,5 s plus tard, par la copie comme par la Liste.
//   · la frappe marque la rétroaction ; un niveau ou des points changés ne la remplacent plus ;
//     l'avis sous la zone le dit ; la marque s'enregistre (`retroactionReecrite`) ;
//   · « Régénérer » seul efface la marque : le texte généré revient et suit de nouveau les niveaux ;
//   · rouverte avec la marque en base : l'avis revient, un niveau changé garde le texte.
// Fixture du banc #959/#960 (noms fictifs), le critère c2 en points pour le chemin analytique.

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 't961';
const A_LA_MAIN = 'Réécrite à la main : relis ta conclusion à voix haute avant de la remettre.';

async function monter(page, { analytique = false, marque, deuxieme = false, sansEvaluation = false } = {}) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && typeof window.evaluerProduction === 'function');
    await page.evaluate(({ png, T, A_LA_MAIN, analytique, marque, deuxieme, sansEvaluation }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-961';
        const crit = [{ id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' },
            { id: 'c2', nom: 'Structure', ponderation: 40, type: analytique ? 'analytique' : 'holistique' }];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        const commentaires = {};
        ['I', 'D', 'M', 'E'].forEach((n) => { commentaires['c1_' + n] = 'CARTOUCHE c1_' + n; commentaires['c2_' + n] = 'CARTOUCHE c2_' + n; });
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GC961', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TEST961', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC961' },
            ...(deuxieme ? [{ da: 'TEST961B', nom: 'Témoin', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GC961' }] : [])
        ]);
        window.db.setSync(T + '_productions', [
            { id: 'p961', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'G961', echelleId: 'E961', cartoucheId: 'CT961', groupeCoursId: 'GC961' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'G961', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'E961', nom: 'IDME', niveaux }]);
        window.db.setSync(T + '_cartouches_G961', [
            { id: 'CT961', nom: 'Cartouche témoin', grilleId: 'G961', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }], commentaires },
            { id: 'CT961R', nom: 'Autre cartouche', grilleId: 'G961', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }],
                commentaires: Object.fromEntries(Object.keys(commentaires).map((k) => [k, 'AUTRE ' + k])) }
        ]);
        const evaluation = {
            id: 'EV961', etudiantDA: 'TEST961', productionId: 'p961', groupeCoursId: 'GC961',
            grilleId: 'G961', echelleId: 'E961', cartoucheId: 'CT961', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-09-15T08:00:00.000Z', noteFinale: 74, niveauFinal: 'D', verrouillee: false,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60, retroaction: 'CARTOUCHE c1_M' },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 40, retroaction: 'CARTOUCHE c2_D' }
            ],
            pointsAnalytiques: analytique ? { c2: 26 } : {},
            retroactionFinale: A_LA_MAIN
        };
        if (marque !== undefined) evaluation.retroactionReecrite = marque;
        // Le second élève (trajet « série ») : son évaluation porte la marque.
        const seconde = Object.assign(JSON.parse(JSON.stringify(evaluation)), { id: 'EV961B', etudiantDA: 'TEST961B', retroactionReecrite: true });
        window.db.setSync(T + '_evaluationsSauvegardees', sansEvaluation ? [] : (deuxieme ? [evaluation, seconde] : [evaluation]));
        window.db.setSync(T + '_fichiersTravaux', [{
            id: 'FT961', etudiantDA: 'TEST961', productionId: 'p961', coursId, groupeCoursId: 'GC961',
            nomFichier: 'FICTIF_TEST961_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-09-01T12:00:00.000Z', dateModification: '2026-09-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        }]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GC961' });
        window.db.setSync('groupeCoursActif', { id: 'GC961', trimestreId: T });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return id === 'FT961' ? copie : original.apply(this, arguments); };
    }, { png: PNG, T, A_LA_MAIN, analytique, marque, deuxieme, sansEvaluation });
    return erreurs;
}

const base = (page) => page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV961'), T);
const zone = (page) => page.evaluate(() => document.getElementById('retroactionFinale1').value);
const avisVisible = (page) => page.evaluate(() => {
    const a = document.getElementById('avisRetroactionReecrite');
    return !!a && !a.classList.contains('u-hide');
});

async function ouvrir(page, chemin) {
    if (chemin === 'copie') await page.evaluate(() => window.evaluerProduction('TEST961', 'p961'));
    else await page.evaluate(() => window.modifierEvaluation('EV961'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV961', null, { timeout: 15000 });
    await page.waitForTimeout(3500);
    await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours, null, { timeout: 10000 });
}

// La frappe : la valeur, puis l'événement `input` que reçoit la délégation (`data-on-input`) —
// celui que `.value = …` seul n'émet pas. `fill` n'agit que sur une zone visible, et la vue de la
// Liste la garde repliée dans ce banc ; la sonde de visibilité est rapportée par console.warn.
async function reecrire(page, texte) {
    const visible = await page.evaluate((texte) => {
        const z = document.getElementById('retroactionFinale1');
        const vu = !!(z.offsetWidth || z.offsetHeight);
        z.value = texte;
        z.dispatchEvent(new Event('input', { bubbles: true }));
        return vu;
    }, texte);
    console.warn(`[961] zone visible à la frappe : ${visible}`);
}

async function changerNiveau(page, niveau) {
    await page.evaluate((niveau) => {
        const s = document.getElementById('eval_c2');
        s.value = niveau;
        s.dispatchEvent(new Event('change', { bubbles: true }));
    }, niveau);
}

async function changerPoints(page, pts) {
    await page.evaluate((pts) => {
        const c = document.getElementById('eval_pts_c2');
        c.value = String(pts);
        c.dispatchEvent(new Event('input', { bubbles: true }));
    }, pts);
}

async function regenerer(page) {
    await page.evaluate(() => document.querySelector('[data-action="regenererRetroactionAvecFeedback"]').click());
}

const APRES_AUTOSAVE = 2500;   // débounce de 1,5 s
const nom = (chemin) => (chemin === 'copie' ? 'la copie' : 'la Liste');
const REECRIT = 'Relis ta deuxième partie : la transition manque. (écrit à la main)';

for (const chemin of ['copie', 'liste']) {
    for (const mode of ['niveau', 'points']) {
        test(`#961 · par ${nom(chemin)}, ${mode === 'niveau' ? 'un niveau changé' : 'des points changés'} après une réécriture : le texte reste ; « Régénérer » le rend aux niveaux`, async ({ page }) => {
            test.setTimeout(90000);
            const erreurs = await monter(page, { analytique: mode === 'points' });
            await ouvrir(page, chemin);
            const changer = mode === 'niveau' ? (() => changerNiveau(page, 'E')) : (() => changerPoints(page, 38));
            const rechanger = mode === 'niveau' ? (() => changerNiveau(page, 'I')) : (() => changerPoints(page, 10));

            await reecrire(page, REECRIT);
            await changer();
            await page.waitForTimeout(APRES_AUTOSAVE);
            const b1 = await base(page);
            expect.soft(await zone(page), 'écran, après le changement').toBe(REECRIT);
            expect.soft(b1.retroactionFinale, 'base, après le changement').toBe(REECRIT);
            expect.soft(b1.retroactionReecrite, 'marque en base').toBe(true);
            expect.soft(await avisVisible(page), 'avis affiché').toBe(true);

            await regenerer(page);
            const genere = await zone(page);
            expect.soft(genere, 'Régénérer remplace le texte').not.toBe(REECRIT);
            expect.soft(genere, 'texte généré depuis la cartouche').toContain('CARTOUCHE c1_M');
            expect.soft(await avisVisible(page), 'avis parti').toBe(false);

            await rechanger();
            await page.waitForTimeout(APRES_AUTOSAVE);
            const suivi = await zone(page);
            const b2 = await base(page);
            expect.soft(suivi, 'le texte suit de nouveau les niveaux').toContain('CARTOUCHE c2_I');
            expect.soft(b2.retroactionFinale, 'base = texte généré').toBe(suivi);
            expect(b2.retroactionReecrite, 'marque effacée en base').toBe(false);
            expect(erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m))).toEqual([]);
        });
    }

    test(`#961 · par ${nom(chemin)}, rouverte avec la marque en base : l'avis revient, un niveau changé garde le texte`, async ({ page }) => {
        test.setTimeout(90000);
        await monter(page, { marque: true });
        await ouvrir(page, chemin);
        expect.soft(await avisVisible(page), 'avis à l\'ouverture').toBe(true);
        await changerNiveau(page, 'E');
        await page.waitForTimeout(APRES_AUTOSAVE);
        expect.soft(await zone(page), 'écran').toBe(A_LA_MAIN);
        const b = await base(page);
        expect.soft(b.criteres[1].niveauSelectionne, 'le niveau, lui, s\'écrit').toBe('E');
        expect(b.retroactionFinale, 'base').toBe(A_LA_MAIN);
    });
}

test('#961 · marque absente (stock d\'avant D7) : la rétroaction suit les niveaux, comme avant, et aucun avis', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page);
    await ouvrir(page, 'liste');
    expect.soft(await avisVisible(page), 'aucun avis').toBe(false);
    await changerNiveau(page, 'E');
    await page.waitForTimeout(APRES_AUTOSAVE);
    expect(await zone(page)).toContain('CARTOUCHE c2_E');
});

test('#961 · la marque d\'une copie ne passe pas à une autre copie ouverte ensuite', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page);
    await ouvrir(page, 'liste');
    await reecrire(page, REECRIT);
    // Une autre copie : la clé (élève + production) change, la marque ne vaut plus.
    const reecriteAilleurs = await page.evaluate(() => window.estRetroactionReecrite({ etudiantDA: 'AUTRE', productionId: 'p961' }));
    const reecriteIci = await page.evaluate(() => window.estRetroactionReecrite());
    expect.soft(reecriteIci, 'ici').toBe(true);
    expect(reecriteAilleurs, 'ailleurs').toBe(false);
});

// Trajet « série » : le menu de l'élève (`chargerEvaluationsEtudiant`) charge l'évaluation par
// `verifierEtChargerEvaluationExistante` seul, sans « Modifier » — la marque doit y revenir aussi.
test('#961 · en série, le second élève choisi au menu : sa marque revient, un niveau changé garde son texte', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page, { deuxieme: true });
    await ouvrir(page, 'copie');
    await page.evaluate(() => {
        const s = document.getElementById('selectEtudiantEval');
        if (!Array.from(s.options).some(o => o.value === 'TEST961B')) {
            const o = document.createElement('option'); o.value = 'TEST961B'; o.textContent = 'Élève Témoin'; s.appendChild(o);
        }
        s.value = 'TEST961B';
        s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EV961B', null, { timeout: 15000 });
    await page.waitForTimeout(3500);
    await page.waitForFunction(() => !window._timerAutoSave, null, { timeout: 10000 });
    expect.soft(await avisVisible(page), 'avis').toBe(true);
    await changerNiveau(page, 'E');
    await page.waitForTimeout(APRES_AUTOSAVE);
    expect.soft(await zone(page), 'écran').toBe(A_LA_MAIN);
    const b = await page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.id === 'EV961B'), T);
    expect.soft(b.criteres[1].niveauSelectionne, 'le niveau s\'écrit').toBe('E');
    expect(b.retroactionFinale, 'base').toBe(A_LA_MAIN);
});

// #944, inchangé par D7 : le changement de cartouche confirmé remplace la rétroaction, retouches
// comprises (la question le dit). Le texte redevient généré : la marque part avec lui.
for (const reponse of ['Remplacer', 'Garder les commentaires actuels']) {
    test(`#961 · rouverte marquée, cartouche changée au menu, « ${reponse} »`, async ({ page }) => {
        test.setTimeout(90000);
        await monter(page, { marque: true });
        await ouvrir(page, 'liste');
        await page.evaluate(() => {
            const s = document.getElementById('selectCartoucheEval');
            s.value = 'CT961R';
            s.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await page.waitForSelector('#overlay-ui-dialogue', { timeout: 5000 });
        await page.evaluate((l) => Array.from(document.querySelectorAll('#overlay-ui-dialogue button')).find(b => b.textContent === l).click(), reponse);
        await page.waitForFunction(() => !document.getElementById('overlay-ui-dialogue'));
        await page.waitForTimeout(APRES_AUTOSAVE);
        if (reponse === 'Remplacer') {
            expect.soft(await zone(page), 'texte de la nouvelle cartouche').toContain('AUTRE c1_M');
            expect(await avisVisible(page), 'avis parti').toBe(false);
        } else {
            expect.soft(await zone(page), 'texte gardé').toBe(A_LA_MAIN);
            expect(await avisVisible(page), 'avis gardé').toBe(true);
        }
    });
}

// Les autres écrivains de la marque : « Enregistrer », la copie neuve, la modale de Travaux.
test('#961 · par la Liste, réécrite puis « Enregistrer » : la marque s\'écrit avec le texte', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page);
    await ouvrir(page, 'liste');
    await reecrire(page, REECRIT);
    await page.evaluate(() => { clearTimeout(window._timerAutoSave); window._timerAutoSave = null; window._pendingAutoSaveSnapshot = null; });
    await page.evaluate(() => document.querySelector('[data-action="sauvegarderEvaluation"]').click());
    await page.waitForTimeout(1500);
    const b = await base(page);
    expect.soft(b.retroactionFinale).toBe(REECRIT);
    expect(b.retroactionReecrite).toBe(true);
});

test('#961 · copie neuve (sans évaluation), réécrite : l\'évaluation créée porte la marque', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page, { sansEvaluation: true });
    await page.evaluate(() => window.evaluerProduction('TEST961', 'p961'));
    await page.waitForFunction(() => document.getElementById('eval_c2'), null, { timeout: 15000 });
    await page.waitForTimeout(3500);
    await changerNiveau(page, 'M');
    await reecrire(page, REECRIT);
    await page.waitForTimeout(APRES_AUTOSAVE);
    const b = await page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.etudiantDA === 'TEST961'), T);
    expect.soft(b && b.retroactionFinale).toBe(REECRIT);
    expect(b && b.retroactionReecrite).toBe(true);
});

for (const retouche of [true, false]) {
    test(`#961 · modale « Aperçu rétroaction » de Travaux, ${retouche ? 'texte retouché' : 'sans retouche'} puis « Sauvegarder »`, async ({ page }) => {
        test.setTimeout(90000);
        await monter(page);
        await page.evaluate(() => window.travauxUI.afficherRetroaction('FT961'));
        await page.waitForSelector('#travaux-modal-retro-texte', { timeout: 10000 });
        if (retouche) await page.evaluate((t) => { document.getElementById('travaux-modal-retro-texte').value = t; }, REECRIT);
        await page.evaluate(() => document.querySelector('[data-action="travauxUI.sauvegarderRetroactionDepuisModal"]').click());
        await page.waitForTimeout(500);
        const b = await base(page);
        expect(b.retroactionReecrite).toBe(retouche ? true : undefined);
    });
}

test('#961 · copie neuve, réécrite puis « Enregistrer » avant l\'auto-save : la marque s\'écrit', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page, { sansEvaluation: true });
    await page.evaluate(() => window.evaluerProduction('TEST961', 'p961'));
    await page.waitForFunction(() => document.getElementById('eval_c2'), null, { timeout: 15000 });
    await page.waitForTimeout(3500);
    await changerNiveau(page, 'M');
    // Les deux critères notés : à portée incomplète, « Enregistrer » ne crée rien (la mutation du
    // chemin de naissance survivait, mesuré), et c'est l'auto-save qui écrivait.
    await page.evaluate(() => { const s = document.getElementById('eval_c1'); s.value = 'M'; s.dispatchEvent(new Event('change', { bubbles: true })); });
    await reecrire(page, REECRIT);
    await page.evaluate(() => { clearTimeout(window._timerAutoSave); window._timerAutoSave = null; window._pendingAutoSaveSnapshot = null; });
    await page.evaluate(() => document.querySelector('[data-action="sauvegarderEvaluation"]').click());
    await page.waitForTimeout(1500);
    const b = await page.evaluate((T) => window.db.getSync(T + '_evaluationsSauvegardees', []).find(e => e.etudiantDA === 'TEST961'), T);
    expect.soft(b && b.retroactionFinale).toBe(REECRIT);
    expect(b && b.retroactionReecrite).toBe(true);
});

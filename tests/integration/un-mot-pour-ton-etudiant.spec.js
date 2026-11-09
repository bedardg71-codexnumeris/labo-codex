import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT « UN MOT POUR TON ÉTUDIANT·E » (consigne du 9 nov. 2026, décidée avec Grégoire).
//
// AVANT : une retouche tapée dans le cadre « Générale » (`#retroactionFinale1`) n'arrivait jamais au PDF de
// l'élève — la synthèse rebâtit chaque critère depuis la cartouche. Le mot a maintenant son champ
// (`#motPourEtudiant1`, clé `motPourEtudiant`) et sa section sur le PDF, « Un mot pour toi ».
//   · le mot s'enregistre tout seul et revient à l'ouverture, par la copie comme par la Liste ;
//   · un mot tapé juste avant de passer à l'élève suivant reste au sien (identité de copie, comme #671) ;
//   · sur une évaluation verrouillée, le champ se lit, il ne se touche pas ;
//   · « Exporter pour Léa » : la section est là quand le mot est écrit, absente quand il est vide ou blanc.
// Le PDF est rastérisé (html2canvas) : on lit le HTML que `rendreSyntheseHTML` lui donne, comme au banc #912.
// Fixture du banc #961 (noms fictifs).

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 'tmot';
const MOT = 'Bravo pour ta relecture attentive.\nOn regarde ta conclusion ensemble mardi.';
const MOT_B = 'Ton plan tient : garde ce cap.';

async function monter(page, { mot, verrouillee = false, deuxieme = false, reprise = false } = {}) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    page.on('dialog', (d) => { erreurs.push(`dialogue: ${d.message()}`); d.dismiss().catch(() => {}); });
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage
        && typeof window.evaluerProduction === 'function' && window.syntheseRetroactionRendu && window.travauxArchivage);
    await page.evaluate(({ png, T, mot, verrouillee, deuxieme, reprise, MOT_B }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-mot';
        const crit = [{ id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' }, { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }];
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
        window.db.setSync(T + '_groupesCours', [{ id: 'GCMOT', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', [
            { da: 'TESTMOT', nom: 'Fictif', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GCMOT' },
            ...(deuxieme ? [{ da: 'TESTMOTB', nom: 'Témoin', prenom: 'Élève', groupe: '01', coursId, groupeCoursId: 'GCMOT' }] : [])
        ]);
        window.db.setSync(T + '_productions', [
            { id: 'pmot', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'GMOT', echelleId: 'EMOT', cartoucheId: 'CTMOT', groupeCoursId: 'GCMOT' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'GMOT', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'EMOT', nom: 'IDME', niveaux }]);
        window.db.setSync(T + '_cartouches_GMOT', [
            { id: 'CTMOT', nom: 'Cartouche témoin', grilleId: 'GMOT', contexte: '', criteres: [{ id: 'c1', nom: 'Contenu' }, { id: 'c2', nom: 'Structure' }], commentaires }
        ]);
        const evaluation = (id, da) => Object.assign({
            id, etudiantDA: da, productionId: 'pmot', groupeCoursId: 'GCMOT', coursId,
            grilleId: 'GMOT', echelleId: 'EMOT', cartoucheId: 'CTMOT', statutRemise: 'evalue', statutIntegrite: 'recevable',
            dateEvaluation: '2026-11-05T08:00:00.000Z', noteFinale: 74, niveauFinal: 'D', verrouillee,
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60, retroaction: 'CARTOUCHE c1_M' },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 40, retroaction: 'CARTOUCHE c2_D' }
            ],
            retroactionFinale: 'Rétroaction générée témoin.', retroactionReecrite: false
        }, mot !== undefined && id === 'EVMOT' ? { motPourEtudiant: mot } : {}, id === 'EVMOTB' ? { motPourEtudiant: MOT_B } : {});
        // `reprise` : l'originale (avec son mot) remplacée par une reprise du même couple, qui n'en a pas.
        const evaluations = reprise
            ? [Object.assign(evaluation('EVMOT', 'TESTMOT'), { remplaceeParId: 'EVREP', archivee: true }),
               Object.assign(evaluation('EVREP', 'TESTMOT'), { repriseDeId: 'EVMOT', jetonRepriseApplique: true, verrouillee: false })]
            : deuxieme ? [evaluation('EVMOT', 'TESTMOT'), evaluation('EVMOTB', 'TESTMOTB')] : [evaluation('EVMOT', 'TESTMOT')];
        window.db.setSync(T + '_evaluationsSauvegardees', evaluations);
        const fichier = (id, da) => ({
            id, etudiantDA: da, productionId: 'pmot', coursId, groupeCoursId: 'GCMOT',
            nomFichier: 'FICTIF_' + da + '_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-11-01T12:00:00.000Z', dateModification: '2026-11-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        });
        window.db.setSync(T + '_fichiersTravaux', deuxieme ? [fichier('FTMOT', 'TESTMOT'), fichier('FTMOTB', 'TESTMOTB')] : [fichier('FTMOT', 'TESTMOT')]);
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GCMOT' });
        window.db.setSync('groupeCoursActif', { id: 'GCMOT', trimestreId: T });

        const octets = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
        const copie = new Blob([octets], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return (id === 'FTMOT' || id === 'FTMOTB') ? copie : original.apply(this, arguments); };

        // L'enveloppe d'observation du PDF : le HTML que l'élève lira.
        window._htmlMot = [];
        const rendre = window.syntheseRetroactionRendu.rendreSyntheseHTML;
        window.syntheseRetroactionRendu.rendreSyntheseHTML = function () { const h = rendre.apply(this, arguments); window._htmlMot.push(h); return h; };
    }, { png: PNG, T, mot, verrouillee, deuxieme, reprise, MOT_B });
    return erreurs;
}

const evaluationEnBase = (page, id = 'EVMOT') => page.evaluate(({ T, id }) =>
    window.db.getSync(T + '_evaluationsSauvegardees', []).find((e) => e.id === id), { T, id });
const champ = (page) => page.evaluate(() => {
    const c = document.getElementById('motPourEtudiant1');
    return { valeur: c.value, desactive: c.disabled };
});

async function ouvrir(page, chemin, da = 'TESTMOT', id = 'EVMOT') {
    if (chemin === 'copie') await page.evaluate((da) => window.evaluerProduction(da, 'pmot'), da);
    else await page.evaluate((id) => window.modifierEvaluation(id), id);
    await page.waitForFunction((id) => window.evaluationEnCours && window.evaluationEnCours.idModification === id, id, { timeout: 15000 });
    await attendreRepos(page, { horizon: 3000 });
    await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours, null, { timeout: 10000 });
}

// La frappe : la valeur, puis l'événement `input` que reçoit la délégation (`data-on-input`).
async function taper(page, texte) {
    await page.evaluate((texte) => {
        const c = document.getElementById('motPourEtudiant1');
        c.value = texte;
        c.dispatchEvent(new Event('input', { bubbles: true }));
    }, texte);
}

// L'enregistrement automatique (débounce de 1,5 s) est passé : ni minuteur ni instantané en attente.
const ecritureFaite = (page) => page.waitForFunction(() => !window._timerAutoSave && !window._pendingAutoSaveSnapshot, null, { timeout: 10000 });
const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

for (const chemin of ['copie', 'liste']) {
    test(`Un mot · par ${chemin === 'copie' ? 'la copie' : 'la Liste'} : le mot tapé s'enregistre seul et revient à l'ouverture`, async ({ page }) => {
        test.setTimeout(90000);
        const erreurs = await monter(page);
        await ouvrir(page, chemin);
        expect.soft((await champ(page)).valeur, 'vide à l\'ouverture d\'une copie sans mot').toBe('');

        await taper(page, MOT);
        await expect.poll(async () => (await evaluationEnBase(page)).motPourEtudiant, { message: 'en base, sans « Enregistrer »', timeout: 10000 }).toBe(MOT);

        // On quitte la copie, puis on la rouvre par l'AUTRE chemin.
        await page.evaluate(() => window.nouvelleEvaluation());
        expect.soft((await champ(page)).valeur, 'vidé par « Nouvelle évaluation »').toBe('');
        await ouvrir(page, chemin === 'copie' ? 'liste' : 'copie');
        expect((await champ(page)).valeur, 'revenu à l\'ouverture').toBe(MOT);
        expect(sansBruit(erreurs)).toEqual([]);
    });
}

// Trajet « série » : le menu de l'élève (`chargerEvaluationsEtudiant`) charge l'évaluation par
// `verifierEtChargerEvaluationExistante` seul, sans « Modifier » (le chargeur que les deux trajets du dessus ne prennent pas).
test('Un mot · en série, tapé juste avant de choisir l\'élève suivant au menu : il reste au sien, le suivant garde le sien', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await monter(page, { deuxieme: true });
    await ouvrir(page, 'copie');
    await taper(page, MOT);
    // Pas d'attente : l'écriture est encore en attente quand le menu passe au suivant.
    await page.evaluate(() => {
        const s = document.getElementById('selectEtudiantEval');
        if (!Array.from(s.options).some(o => o.value === 'TESTMOTB')) {
            const o = document.createElement('option'); o.value = 'TESTMOTB'; o.textContent = 'Élève Témoin'; s.appendChild(o);
        }
        s.value = 'TESTMOTB';
        s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EVMOTB', null, { timeout: 15000 });
    await attendreRepos(page, { horizon: 3000 });
    await ecritureFaite(page);
    expect((await evaluationEnBase(page, 'EVMOT')).motPourEtudiant, 'le mot tapé est au premier').toBe(MOT);
    expect((await evaluationEnBase(page, 'EVMOTB')).motPourEtudiant, 'le second garde le sien').toBe(MOT_B);
    expect((await champ(page)).valeur, 'le champ montre celui du second').toBe(MOT_B);
    expect(sansBruit(erreurs)).toEqual([]);
});

test('Un mot · évaluation verrouillée : le mot se lit, le champ ne se touche pas', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page, { mot: MOT, verrouillee: true });
    await ouvrir(page, 'copie');
    const c = await champ(page);
    expect(c.valeur).toBe(MOT);
    expect(c.desactive).toBe(true);
});

// Relecture du 9 nov. — l'enregistrement automatique écrit l'ACTIVE du couple élève-production. Ouvrir
// l'originale remplacée (« Modifier » sur elle) et y toucher un niveau ne donne pas son mot à la reprise.
test('Un mot · une originale remplacée, rouverte et touchée : sa reprise ne reçoit pas son mot', async ({ page }) => {
    test.setTimeout(90000);
    await monter(page, { mot: MOT, reprise: true });
    await page.evaluate(() => window.modifierEvaluationRemplacee('EVMOT'));
    await page.waitForFunction(() => window.evaluationEnCours && window.evaluationEnCours.idModification === 'EVMOT', null, { timeout: 15000 });
    await attendreRepos(page, { horizon: 3000 });
    await page.waitForFunction(() => !window._timerAutoSave && !window._modifierEvaluationEnCours, null, { timeout: 10000 });
    expect.soft((await champ(page)).valeur, 'le mot de l\'originale à l\'écran').toBe(MOT);
    await page.evaluate(() => { const s = document.getElementById('eval_c2'); s.value = 'E'; s.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForFunction(() => !!window._pendingAutoSaveSnapshot || !!window._timerAutoSave, null, { timeout: 5000 }).catch(() => {});
    await ecritureFaite(page);
    expect((await evaluationEnBase(page, 'EVREP')).motPourEtudiant, 'la reprise part toujours sans mot').toBeUndefined();
    expect((await evaluationEnBase(page, 'EVMOT')).motPourEtudiant, 'l\'originale garde le sien').toBe(MOT);
});

async function exporterPourLea(page) {
    return page.evaluate(async () => {
        window._htmlMot = [];
        const res = await window.travauxArchivage.exporterPourLea('pmot', null, false);
        return { blobs: res.blobs.length, echecs: res.echecs, sansSynthese: res.sansSynthese, html: window._htmlMot };
    });
}

test('Un mot · « Exporter pour Léa » : le PDF porte « Un mot pour toi » et le mot quand il est écrit', async ({ page }) => {
    test.setTimeout(90000);
    const erreurs = await monter(page, { mot: MOT });
    const r = await exporterPourLea(page);
    expect(r.echecs).toEqual([]);
    expect(r.sansSynthese).toEqual([]);
    expect(r.blobs).toBe(1);
    expect(r.html.length).toBe(1);
    expect(r.html[0]).toMatch(/Un mot pour toi/);
    expect(r.html[0]).toContain(MOT);
    expect(r.html[0].indexOf('Un mot pour toi')).toBeGreaterThan(r.html[0].indexOf('Niveau général'));
    expect(sansBruit(erreurs)).toEqual([]);
});

for (const [libelle, mot] of [['vide', ''], ['de blancs seuls', '  \n \n  '], ['absent', undefined]]) {
    test(`Un mot · « Exporter pour Léa » : mot ${libelle}, la section n'existe pas (ni titre ni case)`, async ({ page }) => {
        test.setTimeout(90000);
        await monter(page, { mot });
        const r = await exporterPourLea(page);
        expect(r.echecs).toEqual([]);
        expect(r.html.length).toBe(1);
        expect(r.html[0]).toContain('Niveau général');   // la page est bien rendue
        expect(r.html[0]).not.toMatch(/Un mot pour toi/i);
    });
}

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreRepos, suivreLesReactions } from './harness/attendre-repos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT « LES COPIES NON VERROUILLÉES SE VOIENT AVANT L'EXPORT » (consigne du 16 nov. 2026, constat de Grégoire sur iPad).
//
// AVANT : le compteur de l'Export Léa disait « 1 évaluation non verrouillée laissée de côté », et la grille du haut
// montrait cette copie « Évalué », verte, sans cadenas : rien ne disait laquelle.
// MAINTENANT, en vue Archivage seulement : pastille « Non verrouillée » orange et cadenas ouvert sur la case,
// « N non verrouillée(s) » à l'en-tête du groupe. Les cases marquées sont celles que l'export laisse de côté
// (`selectionnerEvaluationsLea(...).nonVerrouillees`) : la grille ne rejuge pas le verrou. Noms fictifs.

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const T = 'tnv';
const GRILLE = '#evaluations-contenu-archivage';

async function monter(page, { incomplet = false, doublon = false, reprise = false } = {}) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    await suivreLesReactions(page);
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.travauxUI && window.travauxStockage && window.travauxArchivage);
    await page.evaluate(({ T, incomplet, doublon, reprise }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-nv';
        const crit = [{ id: 'c1', nom: 'Contenu', ponderation: 60, type: 'holistique' }, { id: 'c2', nom: 'Structure', ponderation: 40, type: 'holistique' }];
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        const eleves = ['TESTN1', 'TESTN2', 'TESTN3'].concat(incomplet ? ['TESTN4'] : []);
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(T + '_groupesCours', [{ id: 'GCNV', trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'sommative', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', eleves.map((da, i) => ({ da, nom: 'Fictif', prenom: 'Élève ' + (i + 1), groupe: '01', coursId, groupeCoursId: 'GCNV' })));
        window.db.setSync(T + '_productions', [
            { id: 'pnv', titre: 'Analyse', type: 'travail', ponderation: 60, grilleId: 'GNV', echelleId: 'ENV', groupeCoursId: 'GCNV' }
        ]);
        window.db.setSync(T + '_grillesTemplates', [{ id: 'GNV', nom: 'Grille témoin', type: 'holistique', criteres: crit }]);
        window.db.setSync(T + '_echellesTemplates', [{ id: 'ENV', nom: 'IDME', niveaux }]);
        // TESTN2 seule n'est pas verrouillée. TESTN4 (option) : non verrouillée ET « Incomplet ; travail en cours ».
        const verrou = { TESTN1: true, TESTN2: false, TESTN3: true, TESTN4: false };
        const evaluations = eleves.map((da, i) => ({
            id: 'EV' + da, etudiantDA: da, etudiantNom: 'Élève ' + (i + 1) + ' Fictif', productionId: 'pnv', productionNom: 'Analyse',
            groupeCoursId: 'GCNV', coursId, grilleId: 'GNV', echelleId: 'ENV',
            statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-11-05T08:00:00.000Z',
            noteFinale: 74, niveauFinal: 'D', verrouillee: verrou[da], travailEnCours: da === 'TESTN4',
            criteres: [
                { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 60, retroaction: '' },
                { critereId: 'c2', critereNom: 'Structure', niveauSelectionne: 'D', ponderation: 40, retroaction: '' }
            ],
            retroactionFinale: 'Rétroaction témoin.', retroactionReecrite: false
        }));
        const de = (da) => evaluations.find((e) => e.etudiantDA === da);
        const autres = [];
        // `doublon` : TESTN1 a aussi une évaluation active NON verrouillée, plus récente, placée d'abord (doublon à notes
        // divergentes, que la réconciliation #360 laisse). L'export prend la verrouillée : TESTN1 n'est pas laissée de côté.
        if (doublon) autres.push(Object.assign({}, de('TESTN1'), { id: 'EVTESTN1_B', verrouillee: false, noteFinale: 55, dateEvaluation: '2026-11-08T08:00:00.000Z' }));
        // `reprise` : TESTN3 a une reprise NON verrouillée (réévaluation en cours). L'export laisse l'élève de côté,
        // son originale verrouillée ne part pas à sa place.
        if (reprise) autres.push(Object.assign({}, de('TESTN3'), { id: 'EVTESTN3_R', repriseDeId: 'EVTESTN3', verrouillee: false, dateEvaluation: '2026-11-08T08:00:00.000Z' }));
        window.db.setSync(T + '_evaluationsSauvegardees', autres.concat(evaluations));
        const fichier = (da) => ({
            id: 'FT' + da, etudiantDA: da, productionId: 'pnv', coursId, groupeCoursId: 'GCNV',
            nomFichier: 'FICTIF_' + da + '_Analyse.png', typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1,
            stockage: 'indexeddb', thumbnailDataUrl: '', dateImport: '2026-11-01T12:00:00.000Z', dateModification: '2026-11-01T12:00:00.000Z',
            source: 'import-local', importePar: 'single', statut: 'present'
        });
        window.db.setSync(T + '_fichiersTravaux', eleves.map(fichier));
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: 'GCNV' });
        window.db.setSync('groupeCoursActif', { id: 'GCNV', trimestreId: T });
    }, { T, incomplet, doublon, reprise });
    return erreurs;
}

/** La vue « Exporter et archiver », la production choisie au menu de l'Export Léa ; rend le compteur. */
async function ouvrirArchivage(page) {
    await page.evaluate(() => naviguerVers('evaluations', 'exporter'));
    await attendreRepos(page);
    await page.evaluate(() => {
        const sel = document.getElementById('travaux-archivage-lea-production');
        if (!Array.from(sel.options).some((o) => o.value === 'pnv')) {
            const o = document.createElement('option'); o.value = 'pnv'; o.textContent = 'Analyse'; sel.appendChild(o);
        }
        sel.value = 'pnv';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    return page.locator('#travaux-lea-compteur');
}

const caseDe = (page, da) => page.locator(`${GRILLE} .annot-badge[data-etudiant-da="${da}"]`);
const entete = (page) => page.locator(`${GRILLE} .travaux-compteurs-groupe`);

/** Les DA dont la case porte le cadenas ouvert, et ceux que la sélection de l'export laisse de côté. */
async function marqueesEtLaissees(page) {
    return page.evaluate((grille) => ({
        marquees: Array.from(document.querySelectorAll(`${grille} .annot-badge`))
            .filter((b) => b.querySelector('img[src="icons/icon-open-lock.svg"]')).map((b) => b.dataset.etudiantDa).sort(),
        laissees: window.travauxArchivage.selectionnerEvaluationsLea('pnv', null, false).nonVerrouillees.map((e) => e.etudiantDA).sort()
    }), GRILLE);
}

const sansBruit = (erreurs) => erreurs.filter((m) => !/favicon|ERR_FILE_NOT_FOUND/.test(m));

async function attendreCase(page, da, { classe, texte, cadenas }) {
    const pastille = caseDe(page, da).locator('.travaux-badge-pill');
    await expect(pastille).toHaveText(texte);
    await expect(pastille).toHaveClass(new RegExp(`(^| )${classe}( |$)`));
    await expect(caseDe(page, da).locator('.travaux-badge-verrou img')).toHaveAttribute('src', cadenas);
}

test('Archivage · une seule non verrouillée : pastille orange et cadenas ouvert sur sa case, « 1 non verrouillée » à l\'en-tête, même nombre au compteur ; verrouillée, elle redevient verte', async ({ page }) => {
    test.setTimeout(120000);
    const erreurs = await monter(page);
    const compteur = await ouvrirArchivage(page);

    await attendreCase(page, 'TESTN2', { classe: 'non-enregistree', texte: 'Non verrouillée', cadenas: 'icons/icon-open-lock.svg' });
    await expect(caseDe(page, 'TESTN2').locator('.travaux-badge-verrou'))
        .toHaveAttribute('title', 'Évaluation non verrouillée : laissée de côté par l’export');
    await attendreCase(page, 'TESTN1', { classe: 'evalue', texte: 'Évalué', cadenas: 'icons/icon-lock.svg' });
    await attendreCase(page, 'TESTN3', { classe: 'evalue', texte: 'Évalué', cadenas: 'icons/icon-lock.svg' });

    // La case reste à sa place dans la grille : l'ordre des copies ne bouge pas.
    const ordre = await page.locator(`${GRILLE} .annot-badge`).evaluateAll((bs) => bs.map((b) => b.dataset.etudiantDa));
    expect(ordre).toEqual(['TESTN1', 'TESTN2', 'TESTN3']);

    await expect(entete(page).locator('.travaux-compteur-pill.evalue')).toHaveText('2 évalués');
    await expect(entete(page).locator('.travaux-compteur-pill.non-enregistree')).toHaveText('1 non verrouillée');
    await expect(compteur).toContainText('1 évaluation non verrouillée laissée de côté');

    // L'orange de la pastille de l'en-tête est celui de la famille « attention », pas un fond absent.
    const fonds = await page.evaluate((grille) => {
        const fond = (sel) => getComputedStyle(document.querySelector(`${grille} ${sel}`)).backgroundColor;
        return { entete: fond('.travaux-compteur-pill.non-enregistree'), casePastille: fond('.travaux-badge-pill.non-enregistree'), vert: fond('.travaux-compteur-pill.evalue') };
    }, GRILLE);
    expect(fonds.entete).toBe(fonds.casePastille);
    expect(fonds.entete).not.toBe(fonds.vert);
    expect(fonds.entete).not.toBe('rgba(0, 0, 0, 0)');

    const avant = await marqueesEtLaissees(page);
    expect(avant.marquees).toEqual(['TESTN2']);
    expect(avant.marquees).toEqual(avant.laissees);

    // Après verrouillage (écrit en base, comme le fait le verrou), la vue rouverte : verte, cadenas fermé, plus rien d'orange.
    await page.evaluate((T) => {
        const cle = T + '_evaluationsSauvegardees';
        window.db.setSync(cle, window.db.getSync(cle, []).map((e) => e.id === 'EVTESTN2' ? Object.assign({}, e, { verrouillee: true }) : e));
    }, T);
    const compteurApres = await ouvrirArchivage(page);
    await attendreCase(page, 'TESTN2', { classe: 'evalue', texte: 'Évalué', cadenas: 'icons/icon-lock.svg' });
    await expect(entete(page).locator('.travaux-compteur-pill.evalue')).toHaveText('3 évalués');
    await expect(entete(page).locator('.travaux-compteur-pill.non-enregistree')).toHaveCount(0);
    await expect(compteurApres).not.toContainText('laissée de côté');
    expect(sansBruit(erreurs)).toEqual([]);
});

test('Archivage · « Incomplet » garde la priorité sur « Non verrouillée » : pastille et compte de l\'en-tête', async ({ page }) => {
    test.setTimeout(120000);
    await monter(page, { incomplet: true });
    await ouvrirArchivage(page);
    const pastille = caseDe(page, 'TESTN4').locator('.travaux-badge-pill');
    await expect(pastille).toHaveText('Incomplet');
    await expect(pastille).toHaveClass(/(^| )incomplet( |$)/);
    await expect(entete(page).locator('.travaux-compteur-pill.incomplet')).toHaveText('1 incomplet');
    await expect(entete(page).locator('.travaux-compteur-pill.non-enregistree')).toHaveText('1 non verrouillée');
});

test('Archivage · reprise non verrouillée et doublon divergent : les cases marquées sont celles que l\'export laisse de côté', async ({ page }) => {
    test.setTimeout(120000);
    await monter(page, { doublon: true, reprise: true });
    await ouvrirArchivage(page);
    await expect(caseDe(page, 'TESTN2').locator('img[src="icons/icon-open-lock.svg"]')).toHaveCount(1);
    const etat = await marqueesEtLaissees(page);
    // TESTN3 : sa reprise n'est pas verrouillée, l'élève est laissé de côté. TESTN1 : le doublon verrouillé part, pas de marque.
    expect(etat.laissees).toEqual(['TESTN2', 'TESTN3']);
    expect(etat.marquees).toEqual(etat.laissees);
    await expect(caseDe(page, 'TESTN1').locator('.travaux-badge-pill')).toHaveText('Évalué');
    await expect(entete(page).locator('.travaux-compteur-pill.non-enregistree')).toHaveText('2 non verrouillées');
});

test('Carrousel d\'annotation · rien ne change : la copie non verrouillée y reste « evalue », sans cadenas ouvert', async ({ page }) => {
    test.setTimeout(120000);
    await monter(page);
    await page.evaluate((png) => {
        const copie = new Blob([Uint8Array.from(atob(png), (c) => c.charCodeAt(0))], { type: 'image/png' });
        const original = window.travauxStockage.recupererBlob;
        window.travauxStockage.recupererBlob = async function (id) { return /^FTTESTN/.test(id) ? copie : original.apply(this, arguments); };
        window.naviguerVers('evaluations', 'annoter');
    }, PNG);
    await attendreRepos(page);
    // TESTN1 ouverte : TESTN2, non verrouillée, est une étiquette au repos du carrousel.
    await page.evaluate(() => window.travauxUI.ouvrirFichier('FTTESTN1'));
    await attendreRepos(page);
    const carrousel = page.locator('.annot-toolbar-fichiers.travaux-fichiers-compact');
    const badge = carrousel.locator('.annot-badge[data-etudiant-da="TESTN2"]');
    await expect(badge).toHaveCount(1);
    await expect(badge.locator('.travaux-badge-pill')).toHaveClass(/(^| )evalue( |$)/);
    await expect(carrousel.locator('img[src="icons/icon-open-lock.svg"]')).toHaveCount(0);
    await expect(carrousel.locator('.travaux-badge-pill.non-enregistree')).toHaveCount(0);
    await expect(carrousel.locator('.travaux-compteur-pill.non-enregistree')).toHaveCount(0);
});

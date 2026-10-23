import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #1142 (23 oct. 2026) — LE STOCK : `ComptesErreurs.verifier()` (js/comptes-erreurs-stock.js).
// Le correctif tarit la source ; les comptes déjà écrits chez Grégoire restent (21 copies sur 24 de
// l'Artefact 4). La mesure les liste sans rien écrire ; la réparation, sur un paramètre explicite et un
// codex à jour, ne réécrit que `donneesAlgorithmiques` des copies proposées.
//
// LE FAUX TRIMESTRE. Critère 1 « Contenu » (80 %, niveau M = 80) ; critère 2 « Français écrit » (20 %,
// algorithmique, 600 mots). Les phrases sont celles que l'application écrit (`phraseDecompteAlgo`) et
// les notes celles de la grille (80 % × 80 + 20 % × le pourcentage du compte), calculées ici :
//   SAINE   enregistré 1,  phrase 1,  codes 1,  niveau et note de 1   → pas listée
//   DEC1    enregistré 11, phrase 1,  codes 1,  niveau et note de 1   → proposée : 1
//   DEC2    enregistré 2,  phrase 26, codes 26, niveau et note de 26  → proposée : 26 (verrouillée)
//   AMBSRC  enregistré 5,  phrase 1,  codes 3                         → sans proposition (phrase ≠ codes)
//   AMBNOTE enregistré 11, phrase 1,  codes 1,  niveau et note de 11  → sans proposition (la note dit 11)
// Noms fictifs, aucun nom dans ce que la fonction rend.

const T = 't1142s';
const MOTS = 600;
const COPIES = [
    { id: 'SAINE', enregistre: 1, phrase: 1, codes: 1, noteDe: 1, verrouillee: true },
    { id: 'DEC1', enregistre: 11, phrase: 1, codes: 1, noteDe: 1, verrouillee: true },
    { id: 'DEC2', enregistre: 2, phrase: 26, codes: 26, noteDe: 26, verrouillee: true },
    { id: 'AMBSRC', enregistre: 5, phrase: 1, codes: 3, noteDe: 1, verrouillee: false },
    { id: 'AMBNOTE', enregistre: 11, phrase: 1, codes: 1, noteDe: 11, verrouillee: true }
];

async function monter(page, { trimestre = T } = {}) {
    const erreurs = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
    page.on('pageerror', (e) => erreurs.push(`pageerror: ${e.message}`));
    await page.goto(indexHtml);
    await page.waitForFunction(() => typeof window.db !== 'undefined' && window.db.ready && window.ComptesErreurs
        && typeof window.phraseDecompteAlgo === 'function' && window.travauxStockage, null, { timeout: 30000 });
    await page.evaluate(({ T, trimestre, MOTS, COPIES }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-1142s';
        const c2 = { id: 'c2', nom: 'Français écrit', ponderation: 20, type: 'algorithmique', formule: 'nombre d\'erreurs / nombre de mots' };
        const grille = { id: 'G1142s', nom: 'Grille témoin', type: 'holistique', criteres: [{ id: 'c1', nom: 'Contenu', ponderation: 80, type: 'holistique' }, c2] };
        const niveaux = [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
            { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
        ];
        window.trimestreActif = trimestre;
        window.db.setSync('trimestreActif', trimestre);
        window.db.setSync('trimestres', [{ id: trimestre, nom: 'Trimestre témoin', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Écriture et littérature' }]);
        window.db.setSync(trimestre + '_grillesTemplates', [grille]);
        window.db.setSync(trimestre + '_echellesTemplates', [{ id: 'E1142s', nom: 'IDME', niveaux }]);
        const pct = (n) => window.formulesAlgo.calculer(c2, { ponderation: 20, erreurs: n, mots: MOTS }).pctBorne;
        const niveau = (n) => window.niveauDuPourcentage(pct(n), niveaux, { sansNiveauZero: true });
        const evals = [], fichiers = [], annotations = [];
        COPIES.forEach((c) => {
            const da = 'TEST' + c.id;
            evals.push({
                id: 'EV_' + c.id, etudiantDA: da, productionId: 'p1142s', coursId, grilleId: 'G1142s', echelleId: 'E1142s',
                statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-10-15T08:00:00.000Z',
                noteFinale: 0.8 * 80 + 0.2 * pct(c.noteDe), niveauFinal: 'M', verrouillee: c.verrouillee,
                criteres: [
                    { critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 80, retroaction: 'Bien.' },
                    { critereId: 'c2', critereNom: 'Français écrit', niveauSelectionne: niveau(c.noteDe), ponderation: 20,
                        retroaction: window.phraseDecompteAlgo(c2, c2, c.phrase, c.phrase, MOTS) }
                ],
                donneesAlgorithmiques: { c2: { erreurs: c.enregistre, mots: MOTS, noteCalculee: 0, pourcentage: pct(c.enregistre),
                    niveau: niveau(c.enregistre), retroaction: window.phraseDecompteAlgo(c2, c2, c.enregistre, c.enregistre, MOTS) } },
                retroactionFinale: 'Texte de ' + c.id
            });
            fichiers.push({ id: 'FT_' + c.id, etudiantDA: da, productionId: 'p1142s', coursId, nomFichier: 'FICTIF_' + da + '.png',
                typeMIME: 'image/png', tailleFichier: 70, nombrePages: 1, stockage: 'indexeddb', statut: 'present',
                dateImport: '2026-10-01T12:00:00.000Z', dateModification: '2026-10-01T12:00:00.000Z' });
            const shapes = [];
            for (let i = 0; i < c.codes; i++) shapes.push({ id: 'S' + i, type: i % 2 ? 'errfr_accord' : 'errfr_syntaxe', x: 1, y: 1 });
            annotations.push({ id: 'ANN_' + c.id, fichierId: 'FT_' + c.id, etudiantDA: da, productionId: 'p1142s', pages: { 1: { shapes } } });
        });
        window.db.setSync(trimestre + '_evaluationsSauvegardees', evals);
        window.db.setSync(trimestre + '_fichiersTravaux', fichiers);
        window.db.setSync(trimestre + '_annotationsTravaux', annotations);
        // Le témoin des écritures : toute écriture pendant la mesure est une faute.
        window.__ecritures1142 = [];
        const setSync = window.db.setSync.bind(window.db);
        window.db.setSync = function (cle, v) { window.__ecritures1142.push(cle); return setSync(cle, v); };
    }, { T, trimestre, MOTS, COPIES });
    return erreurs;
}

const base = (page, trimestre = T) => page.evaluate((t) => JSON.parse(JSON.stringify(window.db.getSync(t + '_evaluationsSauvegardees', []))), trimestre);

test('#1142 stock · la mesure rend exactement les décalées avec leur valeur, les ambiguës sans proposition, et n\'écrit rien', async ({ page }) => {
    const erreurs = await monter(page);
    const avant = await base(page);
    const r = await page.evaluate(async () => {
        const rapport = await window.ComptesErreurs.verifier();
        return { rapport, ecritures: window.__ecritures1142 };
    });
    expect.soft(r.ecritures, 'la mesure n\'écrit rien').toEqual([]);
    expect.soft(await base(page), 'la base est intacte, à l\'octet').toEqual(avant);
    expect.soft(r.rapport.examinees).toBe(5);
    expect.soft(r.rapport.proposees.map(l => [l.evaluation, l.critere, l.enregistre, l.proposition]))
        .toEqual([['EV_DEC1', 'c2', 11, 1], ['EV_DEC2', 'c2', 2, 26]]);
    expect.soft(r.rapport.sansProposition.map(l => [l.evaluation, l.proposition])).toEqual([['EV_AMBSRC', null], ['EV_AMBNOTE', null]]);
    expect.soft(r.rapport.proposees[0].pourquoi).toMatch(/phrase 1, codes posés 1, niveau E et note/);
    // Aucun nom d'élève dans ce qui est rendu (règle 6) : les identifiants seulement.
    expect.soft(JSON.stringify(r.rapport)).not.toMatch(/TESTDEC|FICTIF/);
    expect(erreurs).toEqual([]);
});

test('#1142 stock · la réparation est refusée sans codex à jour, et n\'écrit rien', async ({ page }) => {
    await monter(page);
    const avant = await base(page);
    const r = await page.evaluate(async () => {
        window.Codex.estAJour = () => false;
        return { rapport: await window.ComptesErreurs.verifier({ reparer: true }), ecritures: window.__ecritures1142 };
    });
    expect.soft(r.rapport).toBeNull();
    expect.soft(r.ecritures).toEqual([]);
    expect(await base(page)).toEqual(avant);
});

test('#1142 stock · la réparation n\'écrit que `donneesAlgorithmiques` des copies proposées, par le calcul de l\'application', async ({ page }) => {
    await monter(page);
    const avant = await base(page);
    const r = await page.evaluate(async () => {
        window.Codex.estAJour = () => true;
        const rapport = await window.ComptesErreurs.verifier({ reparer: true });
        const ecritures = window.__ecritures1142.slice();
        const remesure = await window.ComptesErreurs.verifier();
        return { ecrites: rapport.ecrites, ecritures, remesure };
    });
    const apres = await base(page);
    expect.soft(r.ecrites).toEqual([
        { evaluation: 'EV_DEC1', critere: 'c2', avant: 11, apres: 1 },
        { evaluation: 'EV_DEC2', critere: 'c2', avant: 2, apres: 26 }
    ]);
    expect.soft(r.ecritures, 'une seule écriture, de la seule clé des évaluations').toEqual([T + '_evaluationsSauvegardees']);
    // SENTINELLE : hors `donneesAlgorithmiques` des deux proposées, tout est intact — `criteres`, `noteFinale`, le verrou.
    const neutre = (evals) => evals.map(e => (['EV_DEC1', 'EV_DEC2'].includes(e.id) ? Object.assign({}, e, { donneesAlgorithmiques: null }) : e));
    expect.soft(neutre(apres), 'rien d\'autre ne bouge').toEqual(neutre(avant));
    const dec1 = apres.find(e => e.id === 'EV_DEC1').donneesAlgorithmiques.c2;
    const dec2 = apres.find(e => e.id === 'EV_DEC2').donneesAlgorithmiques.c2;
    expect.soft(dec1.erreurs).toBe(1);
    expect.soft(dec1.niveau).toBe('E');
    expect.soft(dec1.retroaction).toBe(avant.find(e => e.id === 'EV_DEC1').criteres[1].retroaction);   // la phrase que l'élève a lue
    expect.soft(dec2.erreurs).toBe(26);
    expect.soft(dec2.retroaction).toBe(avant.find(e => e.id === 'EV_DEC2').criteres[1].retroaction);
    expect.soft(apres.find(e => e.id === 'EV_DEC2').verrouillee).toBe(true);
    // Remesurée : plus rien à proposer ; les ambiguës restent à Grégoire.
    expect.soft(r.remesure.proposees).toEqual([]);
    expect(r.remesure.sansProposition.map(l => l.evaluation)).toEqual(['EV_AMBSRC', 'EV_AMBNOTE']);
});

test('#1142 stock · H2026 (et A2025) ne sont pas mesurés : refus, rien lu ni écrit', async ({ page }) => {
    await monter(page, { trimestre: 'h2026' });
    const r = await page.evaluate(async () => {
        window.Codex.estAJour = () => true;
        return { mesure: await window.ComptesErreurs.verifier(), reparation: await window.ComptesErreurs.verifier({ reparer: true }), ecritures: window.__ecritures1142 };
    });
    expect.soft(r.mesure).toBeNull();
    expect.soft(r.reparation).toBeNull();
    expect(r.ecritures).toEqual([]);
});

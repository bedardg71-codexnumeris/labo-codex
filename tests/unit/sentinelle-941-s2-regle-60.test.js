/**
 * Sentinelle — #941 LOT S2 (24 septembre 2026) : LE BILAN D'UNE COPIE EN POINTS, LA RÈGLE DES 60 %
 * (décision D2 de Grégoire, `plans de travail/DECISIONS-2026-09-24-parcours-sommatif.md`).
 *
 *   R.a sous 60 % = prioritaire, avec sa définition, du plus faible au plus fort ; 60 % et plus : absent ;
 *   R.b « Ta force » vide, rien « à consolider », jamais « tous maîtrisés » ;
 *   R.c « Points récurrents » : 60 % et plus ARRÊTE le compte ; une copie qui n'évalue pas le critère
 *       est SAUTÉE (décision du lot #940) ;
 *   R.d une copie à niveaux (échelle à repères) garde ses repères, même au milieu d'un historique en
 *       points — les deux règles ne se rencontrent jamais ;
 *   R.e la révision du principe du 28 août est écrite dans le commentaire du code.
 *
 * Les lecteurs d'échelle sont les vrais (`profil-etudiant-calculs.js`), la règle « copie en points »
 * est la vraie (`gabarits-utils.js`), le bilan est le vrai (`synthese-retroaction-data.js`).
 * Preuve de bout en bout : `tests/integration/audit-parcours-sommatif-2026-09-24.spec.js`.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { suitDansLaFonction } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (f) => readFileSync(path.join(racine, f), 'utf8');

const E_IDME = { id: 'E_IDME', nom: 'IDME', seuilSuffisance: 'D', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
] };
const ECHELLES = [E_IDME];
const GRILLE = { id: 'GP', nom: 'Grille en points', criteres: [
    { id: 'c_comp', nom: 'Compréhension', type: 'analytique', ponderation: 40, description: 'Comprendre le texte' },
    { id: 'c_struct', nom: 'Structure', type: 'analytique', ponderation: 30, description: 'Organiser le propos' },
    { id: 'c_langue', nom: 'Langue', type: 'analytique', ponderation: 30, description: 'Écrire correctement' }
] };
const DA = '9000002';
const dbStub = { getSync: (k, d) => (String(k).indexOf('echellesTemplates') !== -1 ? ECHELLES : String(k).indexOf('grillesTemplates') !== -1 ? [GRILLE] : (d !== undefined ? d : null)),
    get: async () => null, set: async () => {}, setSync() {} };

const { evaluationEnPoints } = chargerScript('js/gabarits-utils.js', {
    db: { getSync: (c, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} },
    cle: (k) => 'test_' + k, echapperHtml: (t) => String(t == null ? '' : t)
});
const calculs = chargerScript('js/profil-etudiant-calculs.js', {
    db: dbStub, cle: (k) => 'test_' + k, obtenirDonneesSelonMode: () => [], obtenirPreference: () => null, obtenirSeuil: () => null,
    obtenirPratiqueParId: () => null, obtenirTypePratiqueActive: () => 'standards'
});

/** Une copie EN POINTS : `points` par nom de critère ; un critère absent n'est pas évalué. */
function enPoints(id, date, points) {
    return { id, etudiantDA: DA, productionId: 'P_' + id, productionNom: 'Production ' + id, grilleId: 'GP', echelleId: '',
        dateEvaluation: date, noteFinale: 70, niveauFinal: '--',
        criteres: GRILLE.criteres.filter(gc => typeof points[gc.nom] === 'number').map(gc => ({
            critereId: gc.id, critereNom: gc.nom, niveauSelectionne: '', ponderation: gc.ponderation, points: points[gc.nom] })) };
}
/** Une copie À NIVEAUX, échelle à repères (pas de points). */
function aNiveaux(id, date, niveaux) {
    return { id, etudiantDA: DA, productionId: 'P_' + id, productionNom: 'Production ' + id, grilleId: 'GP', echelleId: 'E_IDME',
        dateEvaluation: date, noteFinale: 70, niveauFinal: 'D',
        criteres: GRILLE.criteres.filter(gc => niveaux[gc.nom]).map(gc => ({
            critereId: gc.id, critereNom: gc.nom, niveauSelectionne: niveaux[gc.nom], ponderation: gc.ponderation })) };
}
const J = (n) => `2026-09-${String(n).padStart(2, '0')}T12:00:00.000Z`;

function bilan(courante, anterieures) {
    const enBase = anterieures.concat([courante]);
    const win = chargerScript('js/synthese-retroaction-data.js', {
        db: dbStub, cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (quoi) => (quoi === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(enBase)) : []),
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }), obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null }, travauxOutils: { AUTOCOLLANTS: [] }, obtenirPreference: () => null,
        obtenirEchelleResolue: calculs.obtenirEchelleResolue, niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle, echellesComparables: calculs.echellesComparables,
        zoneDuNiveau: calculs.zoneDuNiveau, evaluationEnPoints
    });
    const b = win.syntheseRetroactionData.construireFeedback(courante, { id: 'F1' }, null).bilan;
    return { b, priorites: b.concentration.priorites, signales: b.concentration.signales, recurrences: b.recurrents.recurrences,
        force: b.recurrents.force, ameliorations: b.recurrents.ameliorations, tous: b.concentration.tousMaitrises, zone: win.syntheseRetroactionData.zoneDuCritereDeLaCopie };
}

const echapper = (t) => (t == null ? '' : String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
const desechapper = (t) => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Le bilan de l'ÉCRAN (copié par « Copier tout ») pour la même copie rouverte — harnais de #940. */
function bilanEcran(courante, anterieures, niveauAffiche, extra) {
    const enBase = anterieures.concat([courante]);
    const els = {};
    const boite = () => ({ innerHTML: '', classList: { add() {}, remove() {}, toggle() {} } });
    ['contenuRetroBilan', 'contenuRetroSpecifique', 'vueRetroGenerale', 'vueRetroSpecifique', 'vueRetroBilan'].forEach(id => { els[id] = boite(); });
    els.niveauProduction1 = { textContent: niveauAffiche || '--' };
    const wEnonces = chargerScript('js/evaluation-enonces.js');
    chargerScript('js/synthese-retroaction-data.js', { evaluationEnPoints }, wEnonces);
    const w = chargerScript('js/evaluation-retroaction.js', {
        document: { addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
            getElementById: (id) => els[id] || null, createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }),
            body: { addEventListener() {}, appendChild() {}, setAttribute() {}, getAttribute: () => null, style: {}, classList: { add() {}, remove() {} } },
            documentElement: { addEventListener() {} } },
        db: dbStub, cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (quoi) => (quoi === 'evaluationsSauvegardees' ? JSON.parse(JSON.stringify(enBase)) : []),
        echapperHtml: echapper,
        niveauxOrdonnesDeLEchelle: calculs.niveauxOrdonnesDeLEchelle, niveauDuCodeDansEchelle: calculs.niveauDuCodeDansEchelle,
        zoneDuNiveau: calculs.zoneDuNiveau, echellesComparables: calculs.echellesComparables, obtenirEchelleResolue: calculs.obtenirEchelleResolue,
        evaluationEnPoints, ...(extra || {})
    }, wEnonces);
    const niveaux = {}; const points = {};
    courante.criteres.forEach(c => { niveaux[c.critereId] = c.niveauSelectionne; if (typeof c.points === 'number') points[c.critereId] = c.points; });
    w.evaluationEnCours = { etudiantDA: DA, productionId: courante.productionId, grilleId: 'GP', echelleId: courante.echelleId,
        idModification: courante.id, criteres: niveaux, pointsAnalytiques: points };
    w.basculerVueRetroaction('bilan');
    const html = els.contenuRetroBilan.innerHTML;
    const [avant, apres] = html.split('<h5>Points récurrents</h5>');
    const puces = (morceau) => (morceau || '').match(/<p>- (.*?)<\/p>/g)?.map(p => desechapper(p.slice(5, -4))) || [];
    return { html, presentement: puces(avant), recurrents: puces(apres) };
}

/**
 * Une copie en points ENREGISTRÉE AVEC UNE ÉCHELLE À REPÈRES (glissée d'office avant S1, ou choisie
 * exprès) : ses niveaux déduits (M, I…) disent autre chose que ses pourcentages. La règle des 60 %
 * doit l'emporter partout (décision A : une copie en points ne se lit jamais par ses niveaux).
 */
function enPointsAvecEchelle(id, date, points, niveaux) {
    const c = enPoints(id, date, points);
    c.echelleId = 'E_IDME'; c.niveauFinal = 'D';
    c.criteres.forEach(e => { e.niveauSelectionne = niveaux[e.critereNom] || ''; });
    return c;
}

describe('#941 S2 · R.a — « Présentement » : sous 60 %, avec sa définition', () => {
    it('du plus faible pourcentage au plus fort ; 60 % et plus absent', () => {
        // Compréhension 75 %, Structure 56,7 %, Langue 50 %.
        const r = bilan(enPoints('C', J(30), { Compréhension: 30, Structure: 17, Langue: 15 }), []);
        expect(r.priorites).toEqual(['Langue (15 / 30) : Écrire correctement', 'Structure (17 / 30) : Organiser le propos']);
    });
    it('la borne : 60 % pile n\'est pas prioritaire, 59,9 % l\'est', () => {
        expect(bilan(enPoints('C', J(30), { Structure: 18 }), []).priorites).toEqual([]);            // 18 / 30 = 60 %
        expect(bilan(enPoints('C', J(30), { Structure: 17.97 }), []).priorites).toHaveLength(1);    // 59,9 %
    });
});

describe('#941 S2 · R.b — « Ta force » vide, rien « à consolider », jamais « tous maîtrisés »', () => {
    it('même à 90 % partout', () => {
        const r = bilan(enPoints('C', J(30), { Compréhension: 36, Structure: 27, Langue: 27 }), []);
        expect(r.force).toBe('');
        expect(r.signales).toEqual([]);
        expect(r.tous).toBe(false);
    });
    it('et à côté d\'une priorité', () => {
        const r = bilan(enPoints('C', J(30), { Compréhension: 36, Langue: 12 }), []);
        expect(r.force).toBe('');
        expect(r.priorites).toEqual(['Langue (12 / 30) : Écrire correctement']);
    });
});

describe('#941 S2 · R.f — une copie en points sous une échelle à repères : les 60 %, pas les niveaux', () => {
    // Compréhension 36/40 = 90 % (niveau déduit E, « acquis ») ; Langue 16/30 = 53 % (I) ; Structure 22/30 = 73 % (D, « à consolider »).
    const courante = enPointsAvecEchelle('C', J(30), { Compréhension: 36, Structure: 22, Langue: 16 }, { Compréhension: 'E', Structure: 'D', Langue: 'I' });
    const precedente = enPointsAvecEchelle('B', J(29), { Compréhension: 34, Structure: 19, Langue: 17 }, { Compréhension: 'E', Structure: 'D', Langue: 'I' });
    it('le PDF : ni « Ta force », ni « à consolider », ni « Tu as progressé »', () => {
        const r = bilan(courante, [precedente]);
        expect(r.priorites).toEqual(['Langue (16 / 30) : Écrire correctement']);
        expect(r.signales).toEqual([]);
        expect(r.force).toBe('');
        expect(r.recurrences).toEqual(['Langue : prioritaire depuis 2 productions']);
    });
    it('l\'écran dit la même chose, et pas « Progrès : D → M »', () => {
        const e = bilanEcran(courante, [precedente], 'M');
        expect(e.presentement).toEqual(['Langue (16 / 30) : Écrire correctement']);
        expect(e.recurrents).toEqual(['Langue : prioritaire depuis 2 productions']);
        expect(e.html).not.toContain('Ta force');
        expect(e.html).not.toContain('consolider');
        expect(e.html).not.toContain('Progrès');
    });
});

describe('#941 S2 · R.c — « Points récurrents » : 60 % et plus arrête le compte ; non évalué = sautée', () => {
    it('trois copies sous 60 % : depuis 3 productions', () => {
        const r = bilan(enPoints('C', J(30), { Langue: 16 }), [enPoints('B', J(29), { Langue: 17 }), enPoints('A', J(28), { Langue: 15 })]);
        expect(r.recurrences).toEqual(['Langue : prioritaire depuis 3 productions']);
    });
    it('une copie à 60 % ou plus ARRÊTE le compte', () => {
        const r = bilan(enPoints('C', J(30), { Langue: 16 }), [enPoints('B', J(29), { Langue: 18 }), enPoints('A', J(28), { Langue: 15 })]);
        expect(r.recurrences).toEqual([]);
    });
    it('une copie qui n\'évalue pas le critère est SAUTÉE : elle n\'arrête rien et ne compte pas', () => {
        const r = bilan(enPoints('C', J(30), { Langue: 16 }),
            [enPoints('B', J(29), { Compréhension: 30 }), enPoints('A', J(28), { Langue: 15 })]);
        expect(r.recurrences).toEqual(['Langue : prioritaire depuis 2 productions']);
    });
    it('passer de 50 % à 65 % n\'annonce aucun progrès (60 % n\'est pas l\'acquis)', () => {
        const r = bilan(enPoints('C', J(30), { Langue: 19.5 }), [enPoints('B', J(29), { Langue: 15 })]);
        expect(r.ameliorations).toBe('');
        expect(r.recurrences).toEqual([]);
    });
});

describe('#941 S2 · R.d — une échelle à repères garde ses repères', () => {
    it('une copie à niveaux se lit par ses repères, jamais à 60 %', () => {
        const r = bilan(aNiveaux('C', J(30), { Structure: 'D', Langue: 'I', Compréhension: 'M' }), []);
        expect(r.priorites).toEqual(['Langue (Insuffisant) : Écrire correctement']);
        expect(r.signales).toEqual(['Structure (En développement) : Organiser le propos']);
        expect(r.force).toBe('Ta force : Compréhension (Maîtrisé)');
    });
    it('historique mixte : chaque copie par SA règle — un acquis ou un 60 % arrêtent le compte', () => {
        // Actuelle à niveaux (I), précédente en points à 50 % (compte), avant elle en points à 70 % (arrête).
        const r = bilan(aNiveaux('C', J(30), { Langue: 'I' }),
            [enPoints('B', J(29), { Langue: 15 }), enPoints('A', J(28), { Langue: 21 }), aNiveaux('Z', J(27), { Langue: 'I' })]);
        expect(r.recurrences).toEqual(['Langue : prioritaire depuis 2 productions']);
    });
    it('la zone d\'une entrée : 60 % pour une copie en points, les repères pour une copie à niveaux', () => {
        const { zone } = bilan(enPoints('C', J(30), { Langue: 15 }), []);
        const lecteur = (id) => (code) => calculs.zoneDuNiveau(code, id);
        expect(zone(enPoints('X', J(1), { Langue: 15 }), { points: 15, ponderation: 30 }, lecteur)).toBe('priorite');
        expect(zone(enPoints('X', J(1), { Langue: 18 }), { points: 18, ponderation: 30 }, lecteur)).toBe('reussi');
        expect(zone(aNiveaux('X', J(1), { Langue: 'M' }), { niveauSelectionne: 'M' }, lecteur)).toBe('acquis');
    });
});

describe('#941 S2 · R.e — la révision du principe du 28 août est écrite', () => {
    it('dans le commentaire de la règle', () => {
        const src = source('js/synthese-retroaction-data.js');
        expect(src).toContain('RÉVISION DU PRINCIPE DU 28 AOÛT');
        expect(src).toContain('RESTE VRAI POUR LES ÉCHELLES');
        expect(src).toContain('const SEUIL_POINTS_PRIORITE = 60;');
    });
    it('l\'écran lit la même règle que le PDF', () => {
        const retro = source('js/evaluation-retroaction.js');
        expect(retro).toContain('window.syntheseRetroactionData.zoneDuCritereDeLaCopie(copieVivante, c, _lecteurZoneBilan)');
        expect(suitDansLaFonction(retro, /lignesRecurrentes\(defis\.concat\(signales\),/, /copieVivante\);/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });
});

// #941 LOT S3 (C2, D5) — le bilan de l'ÉCRAN, celui que « Copier tout » remet à l'élève.
describe('#941 S3 · l\'écran ne dit pas ce qui ne s\'y range pas', () => {
    it('C2 — tout à 60 % ou plus : pas de titre « Présentement » suivi de rien', () => {
        const e = bilanEcran(enPoints('C', J(30), { Compréhension: 36, Structure: 22, Langue: 20 }), []);
        expect(e.html).not.toContain('Présentement');
    });
    it('C2 — une priorité : le titre et sa ligne', () => {
        const e = bilanEcran(enPoints('C', J(30), { Compréhension: 36, Langue: 12 }), []);
        expect(e.html).toContain('<h5>Présentement, il faut se concentrer sur :</h5>');
        expect(e.presentement).toEqual(['Langue (12 / 30) : Écrire correctement']);
    });
    it('D5 — aucun jeton déclaré : pas de « Jetons utilisés » (les défauts 2 / 2 / 2 n\'y arrivent pas)', () => {
        const defauts = { actif: true, delai: { nombre: 2 }, reprise: { nombre: 2 }, repriseCiblee: { actif: true, nombre: 2 } };
        const e = bilanEcran(enPoints('C', J(30), { Langue: 12 }), [], '--',
            { jetonsDeclares: () => null, obtenirConfigJetons: () => defauts });
        expect(e.html).not.toContain('Jetons utilisés');
    });
    it('D5 — des jetons déclarés : le bloc paraît', () => {
        const declares = { actif: true, delai: { nombre: 1 }, reprise: { nombre: 3 }, repriseCiblee: { actif: false } };
        const e = bilanEcran(enPoints('C', J(30), { Langue: 12 }), [], '--', { jetonsDeclares: () => declares });
        expect(e.html).toContain('Jetons utilisés : 0 / 3');
    });
});

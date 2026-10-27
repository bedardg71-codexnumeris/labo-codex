/**
 * LE BARÈME, LOT 3 — évaluer une copie avec le barème, et ce que l'étudiant·e lit (#1120, gestes 3 et 4).
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-27-bareme-3-evaluer.md ; plan : PLAN-2026-10-19-bareme.md.
 * Décision de Grégoire (27 oct. 2026, sur la mesure) : l'étudiant·e lit le texte de la tranche atteinte dans le BLOC
 * de chaque critère (le PDF, le texte de l'application), sous le chiffre et avant le commentaire de la cartouche ;
 * les lignes du bilan (« Présentement… », « Ta force ») gardent le chiffre seul.
 *
 * Ce que ce banc verrouille :
 *   V — LES VALEURS OFFERTES (`valeursOffertes`) : une valeur, plusieurs, des bornes décimales, plus de 20, aucune.
 *   T — LA TRANCHE DES POINTS (`lectureDesPoints`) : dedans, aux bornes, hors barème, 0, sans points, à compléter,
 *       deux tranches du stock qui se chevauchent (la première, dans l'ordre écrit).
 *   L — CE QUE L'ÉTUDIANT·E LIT (`texteAtteint`) : le texte sans le nom ; rien hors barème, sans barème, sans points.
 *   P — LE PDF (`construireFeedback` → `rendreSyntheseHTML`) : le chiffre, puis le texte, puis le commentaire ;
 *       les sauts de ligne gardés ; un `<img onerror>` sort en texte ; un critère sans barème rendu à l'octet.
 *   I — L'INVARIANT 1 : le module de la note ne nomme pas le barème (la portée, avec et sans : bareme-1, I.c).
 *   H — LES TEXTES H1 à H4, lus dans le fichier validé et comparés à ce qui est posé.
 *
 * Grilles et textes FICTIFS. Break-tests : voir la demande de relecture.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

function avecBareme(win) {
    chargerScript('js/note-pourcentage.js', {}, win);
    chargerScript('js/bareme.js', {}, win);
    return win;
}
const B = avecBareme({}).bareme;

const tr = (id, min, max, texte, nom) => ({ id, nom: nom || '', pointsMin: min, pointsMax: max, texte: texte || '' });

/* ======================================================= V — LES VALEURS OFFERTES */

describe('barème 3 · V — les valeurs qu’une tranche offre au toucher', () => {
    it('V.a une seule valeur : elle seule, décimale comprise', () => {
        expect(B.valeursOffertes(tr('a', 3, 3))).toEqual([3]);
        expect(B.valeursOffertes(tr('a', 2.5, 2.5))).toEqual([2.5]);
        expect(B.valeursOffertes(tr('a', 0, 0))).toEqual([0]);
    });
    it('V.b plusieurs : ses entiers, bornes incluses', () => {
        expect(B.valeursOffertes(tr('a', 3, 4))).toEqual([3, 4]);
        expect(B.valeursOffertes(tr('a', 0, 5))).toEqual([0, 1, 2, 3, 4, 5]);
    });
    it('V.c des bornes décimales : les entiers qu’elles encadrent (2,5 à 4 offre 3 et 4) ; aucun entier, les deux bornes', () => {
        expect(B.valeursOffertes(tr('a', 2.5, 4))).toEqual([3, 4]);
        expect(B.valeursOffertes(tr('a', 2.5, 5.5))).toEqual([3, 4, 5]);
        expect(B.valeursOffertes(tr('a', 2.2, 2.8))).toEqual([2.2, 2.8]);
    });
    it('V.d jusqu’à 20 valeurs, toutes ; au-delà, les deux bornes seulement', () => {
        expect(B.valeursOffertes(tr('a', 1, 20))).toHaveLength(20);
        expect(B.valeursOffertes(tr('a', 0, 20))).toEqual([0, 20]);
        expect(B.valeursOffertes(tr('a', 0, 100))).toEqual([0, 100]);
    });
    it('V.e une tranche à compléter n’offre rien', () => {
        expect(B.valeursOffertes(tr('a', null, null))).toEqual([]);
    });
});

/* ======================================================= T — LA TRANCHE DES POINTS */

describe('barème 3 · T — la tranche que des points désignent, à l’évaluation', () => {
    const bareme = [tr('t0', 0, 0, 'Rien'), tr('t1', 1, 2, 'Peu'), tr('t3', 4, 5, 'Tout'), tr('tc', null, null, 'Sans points')];
    it('T.a dedans et aux bornes', () => {
        expect(B.lectureDesPoints(bareme, 1).tranche.id).toBe('t1');
        expect(B.lectureDesPoints(bareme, 1.5).tranche.id).toBe('t1');
        expect(B.lectureDesPoints(bareme, 2).tranche.id).toBe('t1');
        expect(B.lectureDesPoints(bareme, 5)).toEqual({ tranche: bareme[2], horsBareme: false });
    });
    it('T.b le zéro est une valeur', () => {
        expect(B.lectureDesPoints(bareme, 0)).toEqual({ tranche: bareme[0], horsBareme: false });
    });
    it('T.c des points qu’aucune tranche ne couvre : hors barème', () => {
        expect(B.lectureDesPoints(bareme, 3)).toEqual({ tranche: null, horsBareme: true });
        expect(B.lectureDesPoints(bareme, 2.5)).toEqual({ tranche: null, horsBareme: true });
    });
    it('T.d sans points, rien ; sans barème, jamais « hors barème »', () => {
        expect(B.lectureDesPoints(bareme, null)).toEqual({ tranche: null, horsBareme: false });
        expect(B.lectureDesPoints(bareme, NaN)).toEqual({ tranche: null, horsBareme: false });
        expect(B.lectureDesPoints([], 3)).toEqual({ tranche: null, horsBareme: false });
    });
    it('T.e une tranche à compléter n’est jamais choisie', () => {
        expect(B.lectureDesPoints([tr('tc', null, null, 'x')], 0)).toEqual({ tranche: null, horsBareme: true });
    });
    it('T.f deux tranches du stock qui se chevauchent (« 3-4 », « 4-5 ») : 4 désigne la PREMIÈRE dans l’ordre écrit', () => {
        const stock = [tr('a', 3, 4, 'Premier'), tr('b', 4, 5, 'Second')];
        expect(B.lectureDesPoints(stock, 4).tranche.id).toBe('a');
        expect(B.lectureDesPoints(stock.slice().reverse(), 4).tranche.id).toBe('b');
    });
});

/* ======================================================= L — CE QUE L'ÉTUDIANT·E LIT */

describe('barème 3 · L — le texte de la tranche atteinte, sans son nom', () => {
    const critere = { id: 'CR', type: 'analytique', ponderation: 5,
        bareme: [tr('t1', 0, 2, 'Le résumé manque.', 'Insuffisant'), tr('t2', 3, 4, '  Résume l’essentiel.\nQuelques imprécisions.  ', 'Partiel'), tr('t3', 5, 5, '')] };
    it('L.a le texte, sans le nom, ses sauts de ligne gardés', () => {
        expect(B.texteAtteint(critere, 3)).toBe('Résume l’essentiel.\nQuelques imprécisions.');
        expect(B.texteAtteint(critere, 0)).toBe('Le résumé manque.');
        expect(B.texteAtteint(critere, 3)).not.toContain('Partiel');
    });
    it('L.b rien : hors barème, une tranche sans texte, sans points', () => {
        expect(B.texteAtteint(critere, 2.5)).toBe('');
        expect(B.texteAtteint(critere, 5)).toBe('');
        expect(B.texteAtteint(critere, undefined)).toBe('');
    });
    it('L.c rien : un critère sans barème, un critère holistique', () => {
        expect(B.texteAtteint({ id: 'X', type: 'analytique', ponderation: 5 }, 3)).toBe('');
        expect(B.texteAtteint({ id: 'X', type: 'holistique', bareme: critere.bareme }, 3)).toBe('');
    });
    it('L.d l’ancien format (des réponses sans échelle) se lit par la même fonction', () => {
        const ancien = { id: 'X', type: 'analytique', ponderation: 4, descripteurs: { parNiveau: { '0-1': 'Absent', '2 points': 'Présent', '3-4': 'Riche' } } };
        expect(B.texteAtteint(ancien, 2)).toBe('Présent');
        expect(B.texteAtteint(ancien, 4)).toBe('Riche');
    });
});

/* ======================================================= P — LE PDF DE LA COPIE */

const GRILLE = {
    id: 'G1', nom: 'Journal de lecture fictif',
    criteres: [
        { id: 'c1', nom: 'Résumé', type: 'analytique', ponderation: 5,
          bareme: [tr('t1', 0, 2, 'Le résumé manque.', 'Insuffisant'), tr('t2', 3, 4, 'Résume l’essentiel.\nQuelques imprécisions.', 'Partiel'), tr('t3', 5, 5, 'Complet.', 'Excellent')] },
        { id: 'c2', nom: 'Réaction', type: 'analytique', ponderation: 5 }
    ]
};

function feedback(grille, points) {
    const store = { test_grillesTemplates: [grille] };
    const win = avecBareme({});
    chargerScript('js/synthese-retroaction-data.js', {
        db: { getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)), get: async () => null, set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        obtenirEchelleResolue: () => null, obtenirDonneesSelonMode: () => [], obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
        obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null }, travauxOutils: { AUTOCOLLANTS: [] }, obtenirPreference: () => null
    }, win);
    const evaluation = { id: 'EV1', etudiantDA: '111', grilleId: 'G1', pointsAnalytiques: points,
        criteres: Object.entries(points).map(([id, p]) => ({ critereId: id, critereNom: id, ponderation: 5, points: p, retroaction: id === 'c1' ? 'Commentaire de la cartouche.' : '' })) };
    return win.syntheseRetroactionData.construireFeedback(evaluation, { id: 'F1' }, null);
}

// L'échappement de l'application (`echapperHtml`), recopié pour le banc : & < > " '.
const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

function rendu(criteres) {
    const win = avecBareme({});
    chargerScript('js/synthese-retroaction-rendu.js', { echapperHtml: echapper }, win);
    const base = {
        course: { code: '601-101' }, artefact: { title: 'Journal fictif', corrected: '2026-10-27' }, student: { firstName: 'A', lastName: 'B', da: '111' },
        scale: [], overall: { code: '', label: '', color: '#767169', enPoints: true }, enPoints: true,
        trajectory: [], errors: [], tokens: [], objectives: []
    };
    return win.syntheseRetroactionRendu.rendreSyntheseHTML(Object.assign({}, base, { criteria: criteres }));
}

describe('barème 3 · P — le PDF : le chiffre, dessous le texte de la tranche, puis le commentaire', () => {
    it('P.a les données du PDF portent le texte de la tranche atteinte, sans son nom ; hors barème et sans barème, rien', () => {
        const fb = feedback(GRILLE, { c1: 3, c2: 4 });
        expect(fb.criteria.find(c => c.key === 'c1').tranche).toBe('Résume l’essentiel.\nQuelques imprécisions.');
        expect(fb.criteria.find(c => c.key === 'c2').tranche).toBe('');
        const g = JSON.parse(JSON.stringify(GRILLE));
        g.criteres[0].bareme[1].pointsMax = 3;   // 4 points : plus aucune tranche
        expect(feedback(g, { c1: 4, c2: 4 }).criteria.find(c => c.key === 'c1').tranche).toBe('');
    });
    it('P.b le rendu : « 3 / 5 », puis le texte (sauts de ligne gardés), puis le commentaire ; jamais le nom', () => {
        const html = rendu(feedback(GRILLE, { c1: 3, c2: 4 }).criteria);
        const i = html.indexOf('3 / 5'), j = html.indexOf('Résume l’essentiel.'), k = html.indexOf('Commentaire de la cartouche.');
        expect(i).toBeGreaterThan(-1);
        expect(j).toBeGreaterThan(i);
        expect(k).toBeGreaterThan(j);
        expect(html).toContain('<div style="white-space: pre-line; margin-bottom: 4px;">Résume l’essentiel.\nQuelques imprécisions.</div>');
        expect(html).not.toContain('Partiel');
    });
    it('P.c un critère sans barème se rend à l’octet comme avant (sans le champ `tranche`)', () => {
        const criteres = feedback(GRILLE, { c2: 4 }).criteria;
        const hier = criteres.map(c => { const o = Object.assign({}, c); delete o.tranche; return o; });
        expect(rendu(criteres)).toBe(rendu(hier));
    });
    it('P.d sécurité : un `<img onerror>` dans le texte d’une tranche sort en texte', () => {
        const g = JSON.parse(JSON.stringify(GRILLE));
        g.criteres[0].bareme[1].texte = '<img src=x onerror="window.__piege=1">Résume';
        const html = rendu(feedback(g, { c1: 3 }).criteria);
        expect(html).not.toContain('<img src=x');
        expect(html).toContain('&lt;img src=x onerror=&quot;window.__piege=1&quot;&gt;Résume');
    });
});

/* ======================================================= I — L'INVARIANT 1 */

describe('barème 3 · I — le barème n’entre dans aucun calcul', () => {
    it('I.a le module de la note, celui de P et le dépistage ne nomment pas le barème', () => {
        ['js/evaluation-calcul.js', 'js/profil-etudiant-calculs.js'].forEach((f) => {
            expect(/\bbareme\b/.test(lire(f)), f).toBe(false);
        });
    });
    it('I.b à l’évaluation, une valeur touchée passe par l’événement de la frappe, rien d’autre (`poserPointsBareme`)', () => {
        const src = lire('js/evaluation-chargement.js');
        const corps = tranche(src, 'function poserPointsBareme', '\n}\n');
        expect(corps).toContain("champ.dispatchEvent(new Event('input', { bubbles: true }));");
        expect(corps).not.toMatch(/pointsAnalytiques|calculerNote|evaluationEnCours/);
    });
});

/* ======================================================= H — LES TEXTES VALIDÉS */

describe('barème 3 · H — les textes H1 à H4, tels que validés', () => {
    const fichier = lire('plans de travail/TEXTES-2026-10-27-bareme-evaluation.md');
    const section = (n) => fichier.split('\n## ')[n].split('\n').slice(1).filter(Boolean);
    let entrees = {};
    chargerScript('js/accompagnement-contenu-hover.js', {}, { accompagnement: { ajouterEntrees: (e) => { entrees = e; } } });
    const chargement = lire('js/evaluation-chargement.js');

    it('le fichier est validé', () => {
        expect(fichier).toMatch(/VALIDÉS PAR GRÉGOIRE le 27 oct\. 2026/);
    });
    it('H1 et les bulles de H3 et H4 sont au catalogue, sous les clés que l’évaluation pose', () => {
        const [h1] = section(1);
        const h3 = section(3).find(l => l.startsWith('Bulle : ')).slice(8);
        const h4 = section(4).find(l => l.startsWith('Bulle : ')).slice(8);
        expect(entrees['bareme-eval'].hover).toBe(h1);
        expect(entrees['bareme-eval-hors-bareme'].hover).toBe(h3);
        expect(entrees['bareme-eval-a-completer'].hover).toBe(h4);
        expect(chargement).toContain("const BULLES_BAREME_EVAL = { bareme: 'bareme-eval', horsBareme: 'bareme-eval-hors-bareme', aCompleter: 'bareme-eval-a-completer' };");
    });
    it('H2 et les deux marques, posés tels quels', () => {
        const [h2] = section(2);
        const m3 = section(3).find(l => l.startsWith('Marque : ')).slice(9);
        const m4 = section(4).find(l => l.startsWith('Marque : ')).slice(9);
        expect(chargement).toContain(`const TEXTES_BAREME_EVAL = { ouTape: '${h2}', horsBareme: '${m3}', aCompleter: '${m4}' };`);
    });
});

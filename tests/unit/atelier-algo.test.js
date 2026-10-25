// SENTINELLE — LA PRÉSENTATION DU CRITÈRE ALGORITHMIQUE (#1150, lot 4, 24 octobre 2026).
// Consigne `plans de travail/CONSIGNE-LOT-2026-10-24-critere-algorithmique-presentation.md` ;
// maquette validée `plans de travail/MAQUETTE-2026-10-24-critere-algorithmique.html` ; `js/atelier-algo.js`.
//
//   A. LES CINQ ÉTAPES ET LEUR ÉTAT (§ 3.1) : chaque étape réglée ET non réglée, par sa règle ;
//   B. LES ZONES ET LEURS ÉTAPES : l'étape d'une zone, les étapes où un bloc peut se poser (le crayon) ;
//   C. CE QUE L'ÉLÈVE LIRA — UN SEUL CALCUL : la note et les phrases sont celles de `miroirAlgo.essayer`,
//      les morceaux de la phrase la redonnent entière, chacun rattaché à sa zone ; le bilan, celui de
//      l'évaluation (`enoncesAlgo.enonce(…, {})`) ;
//   D. LA COPIE FICTIVE : « Quelques » au départ, les trois copies de référence du miroir, − / + ;
//   E. LA PAGE (jsdom) : une seule étape ouverte, la chaîne et ses deux états, l'aperçu rempli, une phrase
//      touchée ouvre son étape, un bloc survolé allume ses zones et marque ses étapes ; la palette perd une
//      cible qu'on ne voit plus ; tout ce qui vient de la grille passe par `textContent` ;
//   F. LA CHAÎNE COMMUNE : les chaînes des lots 3a-3b ne changent pas (ni crayon ni « ouverte ») ;
//   G. LE CHARGEMENT : index.html charge atelier-algo.js après ses registres, avant grilles.js.
//
// BREAK-TESTS (faits le 24 octobre 2026, chacun restauré, `shasum` identique avant/après) :
//   · `etapes` : la règle des paliers avec `&&` au lieu de `||` (le cas « aucune projection » perdu) → A.d ;
//   · `_morceauxDeLaProjection` qui ne pousse pas la recommandation (la phrase retombe d'un seul morceau) → C.c ;
//   · `ouvrir` qui ne ferme pas les étapes déjà ouvertes → E.b, E.e, E.g ;
//   · `poserEtats` qui pose `bc-ouvert` sans `etape.ouverte` → E.a, E.b, F.a.
//   (25 octobre 2026, retouche du verdict § 2) · `_etapeNote` sans la règle des paramètres (`reglee: pondOk`)
//     → A.c (la pénalité fixe à 0 point par erreur passe pour réglée).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

// Les registres, le miroir, la palette et l'atelier dans UN même window : le miroir lit ses registres par `window`.
const win = {};
['js/evaluation-enonces.js', 'js/evaluation-formules.js', 'js/evaluation-projection.js', 'js/codes-annotation.js',
    'js/palette-algo.js', 'js/miroir-algo.js', 'js/atelier-algo.js'].forEach((f) => chargerScript(f, {}, win));
const A = win.atelierAlgo, E = win.enoncesAlgo, P = win.projectionAlgo, M = win.miroirAlgo;

const NOMS = { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } };
const REDACTION = {
    id: 'CR', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, nomsAttendus: true, noms: NOMS,
    modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 },
    modeleProjection: 'norme_externe', paramsProjection: { nomServiceAide: 'Centre d’aide', motsReference: 900, erreursTolerees: 30 }
};
const CHIMIE = {
    id: 'CC', nom: 'Unités et chiffres significatifs', type: 'algorithmique', ponderation: 20, nomsAttendus: true,
    noms: { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } },
    modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 12 }, modeleProjection: 'aucune',
    codesDepuisSousCriteres: true,
    sousCriteres: [{ id: 's1', code: '1', nom: 'Unité manquante', ponderation: 1.5 }, { id: 's2', code: '2', nom: 'Arrondi', ponderation: 0.5 }]
};
const etat = (c, id) => A.etapes(c).find((e) => e.id === id);

/* ============================================================ A — LES CINQ ÉTAPES */

describe('atelier · A — les cinq étapes, dans l\'ordre de la maquette, chacune réglée et non réglée', () => {
    it('A.0 l\'ordre, les libellés, le point d\'arrivée', () => {
        const liste = A.etapes(REDACTION);
        expect(liste.map((e) => e.id)).toEqual(['compte', 'codes', 'note', 'paliers', 'eleve']);
        expect(liste.map((e) => e.libelle)).toEqual(['Ce que tu comptes', 'Codes', 'Note', 'Paliers', 'Ce que l\'élève lit']);
        expect(liste.map((e) => e.arrivee)).toEqual([false, false, false, false, true]);
    });

    it('A.a « Ce que tu comptes » : réglée quand les noms ne manquent pas (un critère d\'avant lit « erreur / mot ») ; un critère neuf sans noms ne l\'est pas', () => {
        expect(etat(REDACTION, 'compte')).toMatchObject({ reglee: true, info: 'erreurs / mots', resume: '« erreurs » par rapport aux « mots »' });
        expect(etat({ id: 'X', type: 'algorithmique', nom: 'X' }, 'compte').reglee).toBe(true);   // d'avant : « erreur », « mot »
        const neuf = { id: 'N', type: 'algorithmique', nom: 'N', nomsAttendus: true };
        expect(etat(neuf, 'compte')).toMatchObject({ reglee: false, info: 'à nommer' });
        const moitie = { ...neuf, noms: { erreurs: { singulier: 'unité', pluriel: 'unités' }, mots: { singulier: 'calcul', pluriel: '' } } };
        expect(etat(moitie, 'compte').reglee).toBe(false);
    });

    it('A.b « Codes » : réglée sans codes (la palette générale) ou avec un code posable ; cochée sans code posable, non', () => {
        expect(etat(REDACTION, 'codes')).toMatchObject({ reglee: true, info: 'palette générale', resume: 'La palette générale d\'Annoter' });
        expect(etat(CHIMIE, 'codes')).toMatchObject({ reglee: true, info: '2 codes', resume: '2 sous-critères servent de codes' });
        const vide = { ...CHIMIE, sousCriteres: [{ id: 's0', code: '0', nom: 'Rien', ponderation: 0 }] };
        expect(etat(vide, 'codes')).toMatchObject({ reglee: false, info: '0 code' });
        // Deux critères algorithmiques : les codes vont au premier ; le second tape son nombre (#1132).
        const second = { ...CHIMIE, id: 'C2' };
        expect(A.etapes(second, [CHIMIE, second]).find((e) => e.id === 'codes')).toMatchObject({ reglee: true, info: 'nombre tapé' });
    });

    it('A.c « Note » : une pondération et le paramètre de la formule au-dessus de 0 (la pénalité fixe seule admet 0)', () => {
        expect(etat(REDACTION, 'note')).toMatchObject({ reglee: true, info: 'pénalité normalisée', resume: 'Formule : pénalité normalisée, sur 20' });
        expect(etat({ ...REDACTION, ponderation: 0 }, 'note')).toMatchObject({ reglee: false, resume: 'Formule : pénalité normalisée, sans pondération' });
        // Mesuré : la pénalité normalisée et le ratio visé bornent leur paramètre (0 → 1) ; l'étape suit ce que le calcul applique.
        expect(etat({ ...REDACTION, paramsFormule: { facteurNormalisation: 0 } }, 'note').reglee).toBe(true);
        expect(etat({ ...REDACTION, modeleFormule: 'ratio_cible', paramsFormule: { motsParErreurCible: 0 } }, 'note').reglee).toBe(true);
        // La pénalité fixe admet 0 (`min: 0`) : 0 point par erreur → « à régler » ; 1 → réglée.
        const fixe = { ...REDACTION, modeleFormule: 'penalite_par_erreur' };
        expect(etat({ ...fixe, paramsFormule: { pointsParErreur: 0 } }, 'note').reglee).toBe(false);
        expect(etat({ ...fixe, paramsFormule: { pointsParErreur: 1 } }, 'note').reglee).toBe(true);
        expect(etat({ ...REDACTION, modeleFormule: 'ratio_cible', paramsFormule: { motsParErreurCible: 60 } }, 'note').info).toBe('ratio visé');
    });

    it('A.d « Paliers » : aucune projection, ou une longueur et une tolérance au-dessus de 0', () => {
        expect(etat(REDACTION, 'paliers')).toMatchObject({ reglee: true, info: '6 paliers', resume: 'Projection à l\'EUF, 6 paliers' });
        expect(etat(CHIMIE, 'paliers')).toMatchObject({ reglee: true, info: 'aucun', resume: 'Aucune projection' });
        // Mesuré : le registre borne la tolérance (0 → 1) ; « à régler » n'arrive pas avec les registres d'aujourd'hui.
        expect(etat({ ...REDACTION, paramsProjection: { motsReference: 900, erreursTolerees: 0 } }, 'paliers').reglee).toBe(true);
        expect(P.normaliser({ ...REDACTION, paramsProjection: { motsReference: 900, erreursTolerees: 0 } }).params.erreursTolerees).toBe(1);
    });

    it('A.e « Ce que l\'élève lit » : au moins un des trois textes non vide', () => {
        expect(etat(REDACTION, 'eleve')).toMatchObject({ reglee: true, info: '3 textes', resume: 'Décompte et bilan : 3 textes' });
        const muet = { ...REDACTION, enonces: { decompte: '', priorite: '', concentre: '' } };
        expect(etat(muet, 'eleve')).toMatchObject({ reglee: false, info: '0 texte' });
        expect(etat({ ...muet, enonces: { decompte: '', priorite: 'À revoir', concentre: '' } }, 'eleve')).toMatchObject({ reglee: true, info: '1 texte' });
    });

    it('A.f lecture seule : `etapes` n\'écrit rien dans le critère', () => {
        const c = JSON.parse(JSON.stringify(REDACTION));
        A.etapes(c, [c]);
        expect(c).toEqual(REDACTION);
    });
});

/* ============================================================ B — LES ZONES */

describe('atelier · B — l\'étape d\'une zone, et où un bloc peut se poser', () => {
    it('B.a un palier → « Paliers » ; « Aucune annotation » → « Codes » ; un énoncé → « Ce que l\'élève lit »', () => {
        expect(A.etapeDeZone({ palierIndex: '2', champ: 'texte' })).toBe('paliers');
        expect(A.etapeDeZone({ enonceCle: 'aucune' })).toBe('codes');
        ['decompte', 'priorite', 'concentre'].forEach((k) => expect(A.etapeDeZone({ enonceCle: k })).toBe('eleve'));
        expect(A.etapeDeZone({})).toBeNull();
    });

    it('B.b le crayon : {critere} dans Codes et Ce que l\'élève lit ; {service} dans Paliers seulement ; sans projection, aucune étape pour {service}', () => {
        expect(A.etapesDuJeton(REDACTION, '{critere}')).toEqual(['codes', 'eleve']);
        expect(A.etapesDuJeton(REDACTION, '{erreurs}')).toEqual(['paliers', 'eleve']);
        expect(A.etapesDuJeton(REDACTION, '{service}')).toEqual(['paliers']);
        expect(A.etapesDuJeton(CHIMIE, '{service}')).toEqual([]);
        expect(A.etapesDuJeton(REDACTION, '{nomErreurs}')).toEqual(['codes', 'eleve']);
    });
});

/* ============================================================ C — UN SEUL CALCUL */

describe('atelier · C — ce que l\'élève lira : le calcul de l\'évaluation, découpé par sa source', () => {
    it('C.a la note est celle de `miroirAlgo.essayer` pour la même copie', () => {
        for (const n of [0, 1, 9, 30, 200]) {
            const copie = A.copieAvec(A.copieDeDepart(REDACTION), { erreurs: n });
            const lec = A.lecture(REDACTION, copie);
            const essai = M.essayer(REDACTION, copie);
            expect(lec.essai).toEqual(essai);
        }
    });

    it('C.b les morceaux du PDF redonnent la phrase entière, dans l\'ordre, pour chaque palier atteint', () => {
        const vus = new Set();
        for (const n of [0, 3, 9, 14, 20, 30, 60]) {
            const copie = A.copieAvec(A.copieDeDepart(REDACTION), { erreurs: n });
            const lec = A.lecture(REDACTION, copie);
            expect(lec.pdf.map((m) => m.texte).join(' '), n + ' erreurs').toBe(lec.essai.eleve);
            vus.add(lec.palier);
        }
        expect(vus.size).toBeGreaterThan(3);
    });

    it('C.c chaque morceau mène à sa zone : le décompte, le préfixe engendré (sans zone), le verdict et la recommandation du palier atteint', () => {
        const copie = A.copieAvec(A.copieDeDepart(REDACTION), { erreurs: 28 });   // près du seuil : un palier avec recommandation
        const lec = A.lecture(REDACTION, copie);
        const proj = P.calculer(REDACTION, { erreurs: 28, mots: copie.mots });
        const i = String(proj.paliers.indexOf(proj.palier));
        expect(lec.pdf.map((m) => m.source)).toEqual(['decompte', 'prefixe', 'verdict', 'aide']);
        expect(lec.pdf[0].zone).toEqual({ enonceCle: 'decompte' });
        expect(lec.pdf[1]).toMatchObject({ engendre: true });
        expect(lec.pdf[1].zone).toBeUndefined();
        expect(lec.pdf[2]).toMatchObject({ etape: 'paliers', zone: { palierIndex: i, champ: 'texte' }, palier: proj.palier.libelle });
        expect(lec.pdf[3]).toMatchObject({ etape: 'paliers', zone: { palierIndex: i, champ: 'texteAide' } });
        expect(lec.pdf[3].texte).toContain('Centre d’aide');
        expect(A.cleDeZone(lec.pdf[2].zone)).toBe('palier:' + i + ':texte');
        expect(A.cleDeZone(lec.pdf[0].zone)).toBe('enonce:decompte');
    });

    it('C.d un verdict qui porte un bloc fait tomber le préfixe : plus de morceau engendré', () => {
        const p = P.normaliser(REDACTION).paliers.map((x) => ({ ...x, texte: 'Tu fais 1 erreur à chaque {moyenne} mots.' }));
        const c = { ...REDACTION, paliersProjection: p };
        const lec = A.lecture(c, A.copieAvec(A.copieDeDepart(c), { erreurs: 9 }));
        expect(lec.pdf.some((m) => m.engendre)).toBe(false);
        expect(lec.pdf.map((m) => m.texte).join(' ')).toBe(lec.essai.eleve);
    });

    it('C.e le bilan et « Aucune annotation » : les phrases de l\'évaluation (`enonce(…, {})`) ; une zone vidée se tait', () => {
        const lec = A.lecture(REDACTION, A.copieDeDepart(REDACTION));
        expect(lec.priorite).toBe(E.enonce(REDACTION, 'priorite', {}));
        expect(lec.concentre).toBe(E.enonce(REDACTION, 'concentre', {}));
        expect(lec.aucune).toBe(E.enonce(REDACTION, 'aucune', {}));
        const muet = A.lecture({ ...REDACTION, enonces: { priorite: '' } }, A.copieDeDepart(REDACTION));
        expect(muet.priorite).toBe('');
    });

    it('C.f sans projection : le décompte seul, aucun palier', () => {
        const lec = A.lecture(CHIMIE, A.copieDeDepart(CHIMIE));
        expect(lec.palier).toBe('');
        expect(lec.pdf.map((m) => m.source)).toEqual(['decompte']);
        expect(lec.pdf[0].texte.toLowerCase()).not.toContain('français');
    });
});

/* ============================================================ D — LA COPIE FICTIVE */

describe('atelier · D — la copie fictive : « Quelques » au départ, les copies de référence, − / +', () => {
    it('D.a la copie de départ est « Quelques » du miroir, sur son étendue ; sans pondération, aucune erreur sur l\'étendue', () => {
        const refs = M.copies(REDACTION);
        expect(A.copieDeDepart(REDACTION)).toEqual(refs.find((c) => c.cle === 'quelques'));
        expect(A.copieDeDepart(REDACTION).mots).toBe(900);
        expect(A.copieDeDepart({ ...REDACTION, ponderation: 0 })).toEqual({ cle: null, erreurs: 0, erreursFormule: 0, mots: 900, codes: [] });
    });

    it('D.b les copies de référence sont celles du miroir, nommées ; la pondérée paraît en chimie', () => {
        expect(A.copiesDeReference(REDACTION).map((c) => c.libelle)).toEqual(['Aucune', 'Quelques', 'Beaucoup']);
        const chimie = A.copiesDeReference(CHIMIE);
        expect(chimie.map((c) => c.libelle)).toEqual(['Aucune', 'Quelques', 'Beaucoup', 'Pondérée']);
        expect(chimie.map(({ libelle, ...c }) => c)).toEqual(M.copies(CHIMIE));
    });

    it('D.c un nouveau compte rend la copie ordinaire (sans codes, la formule reçoit le compte) ; une nouvelle longueur garde le reste ; rien sous 0', () => {
        const pond = A.copiesDeReference(CHIMIE).find((c) => c.cle === 'ponderee');
        const plus = A.copieAvec(pond, { erreurs: pond.erreurs + 1 });
        expect(plus).toMatchObject({ cle: null, erreurs: pond.erreurs + 1, erreursFormule: pond.erreurs + 1, codes: [] });
        const long = A.copieAvec(pond, { mots: '40' });
        expect(long).toMatchObject({ cle: 'ponderee', erreurs: pond.erreurs, erreursFormule: pond.erreursFormule, mots: 40 });
        expect(A.copieAvec(pond, { erreurs: -3 }).erreurs).toBe(0);
        expect(A.copieAvec(pond, { mots: '' }).mots).toBeNull();
    });
});

/* ============================================================ E — LA PAGE (jsdom) */

const ZONES = {
    compte: '<div class="noms-algo">noms</div>',
    codes: '<div class="groupe-form"><textarea data-enonce-cle="aucune" data-critere-index="0"></textarea></div>',
    note: '<p>Formule appliquée</p>',
    paliers: [0, 1, 2, 3, 4, 5].map((i) => `<div class="palier-rangee"><textarea data-palier-index="${i}" data-champ="texte" data-critere-index="0"></textarea>`
        + `<textarea data-palier-index="${i}" data-champ="texteAide" data-critere-index="0"></textarea></div>`).join(''),
    eleve: '<div class="groupe-form"><textarea data-enonce-cle="decompte" data-critere-index="0"></textarea></div>'
        + '<div class="groupe-form"><textarea data-enonce-cle="priorite" data-critere-index="0"></textarea></div>'
        + '<div class="groupe-form"><textarea data-enonce-cle="concentre" data-critere-index="0"></textarea></div>'
};

/** Une page jsdom où les vrais modules sont chargés, et l'atelier d'un critère rendu puis monté. */
function page(critere, ctx) {
    const dom = new JSDOM('<!doctype html><body><div id="listeCriteres"></div></body>', { runScripts: 'outside-only', pretendToBeVisual: true });
    const w = dom.window;
    w.matchMedia = () => ({ matches: false });
    w.db = { getSync: () => null };
    w.echapperHtml = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    ['js/note-pourcentage.js', 'js/chaine-etapes.js', 'js/evaluation-enonces.js', 'js/evaluation-formules.js', 'js/evaluation-projection.js',
        'js/codes-annotation.js', 'js/palette-algo.js', 'js/miroir-algo.js', 'js/atelier-algo.js'].forEach((f) => w.eval(source(f)));
    // La palette (rendue par grilles.js) et sa décible : un témoin minimal, qui garde la cible comme `ciblerPaletteAlgo`.
    w.deciblerPaletteAlgo = (p) => { p._zoneCible = null; p.dataset.decible = '1'; };
    const ctxComplet = Object.assign({ mode: 'grille', grilleId: 'G1', index: 0, criteres: [critere] }, ctx || {});
    const palette = '<aside class="palette-algo"><button type="button" class="palette-algo-bloc" data-jeton="{service}">Nom du service</button>'
        + '<button type="button" class="palette-algo-bloc" data-jeton="{critere}">Nom du critère</button></aside>';
    const liste = w.document.getElementById('listeCriteres');
    liste.innerHTML = w.atelierAlgo.rendre(critere, ctxComplet, Object.assign({ palette }, ZONES));
    w.atelierAlgo.monter(liste, ctxComplet.criteres, ctxComplet);
    const atelier = liste.querySelector('.gabarit-algo');
    return { w, doc: w.document, atelier, apercu: atelier.querySelector('.apercu-algo') };
}
const ouvertes = (atelier) => [...atelier.querySelectorAll('.atelier-algo-etape')].filter((s) => !s.querySelector('.atelier-algo-etape-corps').hidden).map((s) => s.dataset.etape);
const texte = (el) => el.textContent.replace(/\s+/g, ' ').trim();

describe('atelier · E — la page : une étape ouverte, la chaîne, l\'aperçu, les gestes', () => {
    it('E.a au départ : « Ce que l\'élève lit » ouverte, seule ; la chaîne a cinq étapes, la dernière est l\'arrivée et la seule « ouverte »', () => {
        const { atelier } = page({ ...REDACTION, id: 'CR_EA' });
        expect(ouvertes(atelier)).toEqual(['eleve']);
        const etapes = [...atelier.querySelectorAll('.atelier-algo-chaine .bc-etape')];
        expect(etapes.map((b) => b.dataset.etape)).toEqual(['compte', 'codes', 'note', 'paliers', 'eleve']);
        expect(etapes.map((b) => b.classList.contains('bc-ouvert'))).toEqual([false, false, false, false, true]);
        expect(etapes[4].classList.contains('bc-destination')).toBe(true);
        expect(etapes.every((b) => b.querySelector('.bc-crayon'))).toBe(true);
        expect(texte(etapes[4].querySelector('.u-lecteur-ecran'))).toBe(', réglée, ouverte');
        expect(etapes.map((b) => texte(b.querySelector('.bc-info')))).toEqual(['erreurs / mots', 'palette générale', 'pénalité normalisée', '6 paliers', '3 textes']);
    });

    it('E.b toucher une étape de la chaîne l\'ouvre et ferme l\'autre ; l\'en-tête ouverte se referme ; la mémoire tient au redessin', () => {
        const { w, atelier } = page({ ...REDACTION, id: 'CR_EB' });
        atelier.querySelector('.atelier-algo-chaine .bc-etape[data-etape="paliers"]').click();
        expect(ouvertes(atelier)).toEqual(['paliers']);
        expect(atelier.querySelector('.bc-etape[data-etape="paliers"]').classList.contains('bc-ouvert')).toBe(true);
        expect(atelier.querySelector('.bc-etape[data-etape="eleve"]').classList.contains('bc-ouvert')).toBe(false);
        expect(atelier.querySelector('.atelier-algo-etape[data-etape="paliers"] .atelier-algo-etape-tete').getAttribute('aria-expanded')).toBe('true');
        w.atelierAlgo.basculerEtape(atelier.querySelector('.atelier-algo-etape[data-etape="paliers"] .atelier-algo-etape-tete'));
        expect(ouvertes(atelier)).toEqual([]);
        w.atelierAlgo.basculerEtape(atelier.querySelector('.atelier-algo-etape[data-etape="note"] .atelier-algo-etape-tete'));
        expect(ouvertes(atelier)).toEqual(['note']);
        // Le redessin relit l'étape ouverte (le gabarit se redessine à chaque modification enregistrée).
        const html = w.atelierAlgo.rendre({ ...REDACTION, id: 'CR_EB' }, { mode: 'grille', grilleId: 'G1', index: 0, criteres: [] }, ZONES);
        expect(html).toMatch(/data-etape="note" data-ouverte>/);
        expect((html.match(/data-ouverte>/g) || []).length).toBe(1);
    });

    it('E.c l\'aperçu : la copie « Quelques », la note de l\'évaluation, le palier, les phrases rangées par destination', () => {
        const c = { ...REDACTION, id: 'CR_EC' };
        const { w, apercu } = page(c);
        const copie = A.copieDeDepart(c);
        const essai = M.essayer(c, copie);
        expect(apercu.querySelector('[data-apercu-champ="erreurs"]').value).toBe(String(copie.erreurs));
        expect(apercu.querySelector('[data-apercu-champ="mots"]').value).toBe('900');
        expect(apercu.querySelector('.apercu-algo-reference[aria-pressed="true"]').textContent).toBe('Quelques');
        expect(texte(apercu.querySelector('.apercu-algo-resultats'))).toContain((w.formaterNoteNombre(essai.points) + '/20 (' + w.formaterNotePourcentage(essai.pourcentage) + ')').replace(/\s+/g, ' '));
        expect(texte(apercu.querySelector('[data-lecture="pdf"]').cloneNode(true))).toContain(essai.decompte);
        const sansSources = [...apercu.querySelectorAll('[data-lecture="pdf"] .apercu-algo-segment')].map((s) => s.lastChild.textContent).join(' ');
        expect(sansSources).toBe(essai.eleve);
        expect(apercu.querySelector('[data-lecture="priorite"] .apercu-algo-segment').lastChild.textContent).toBe(E.enonce(c, 'priorite', {}));
        expect(apercu.querySelector('[data-lecture="aucune"] .apercu-algo-segment').lastChild.textContent).toBe(E.enonce(c, 'aucune', {}));
        // Aucune balise venue de la grille : le texte est posé par textContent.
        expect(apercu.querySelectorAll('[data-lecture] b, [data-lecture] img')).toHaveLength(0);
    });

    it('E.d − / + et les copies de référence changent la note et les phrases ; la copie réglée survit au redessin', () => {
        const c = { ...REDACTION, id: 'CR_ED' };
        const { w, doc, atelier, apercu } = page(c);
        const pdf = () => texte(apercu.querySelector('[data-lecture="pdf"]'));
        const avant = pdf();
        apercu.querySelector('[data-apercu-geste="plus"]').click();
        const n = A.copieDeDepart(c).erreurs + 1;
        expect(apercu.querySelector('[data-apercu-champ="erreurs"]').value).toBe(String(n));
        expect(pdf()).not.toBe(avant);
        expect(pdf()).toContain(M.essayer(c, A.copieAvec(A.copieDeDepart(c), { erreurs: n })).decompte);
        apercu.querySelector('.apercu-algo-reference[data-copie="aucune"]').click();
        expect(apercu.querySelector('[data-apercu-champ="erreurs"]').value).toBe('0');
        expect(texte(apercu.querySelector('.apercu-algo-resultats'))).toContain('20/20 (100 %)');
        expect(texte(apercu.querySelector('.apercu-algo-resultats'))).toContain('Sans erreur');
        const champ = apercu.querySelector('[data-apercu-champ="erreurs"]');
        champ.value = '200';
        champ.dispatchEvent(new w.Event('input', { bubbles: true }));
        expect(texte(apercu.querySelector('.apercu-algo-resultats'))).toContain('plancher');
        // Redessin : la copie réglée tient.
        const liste = doc.getElementById('listeCriteres');
        liste.innerHTML = w.atelierAlgo.rendre(c, { mode: 'grille', grilleId: 'G1', index: 0, criteres: [c] }, ZONES);
        w.atelierAlgo.monter(liste, [c], { mode: 'grille', grilleId: 'G1' });
        expect(liste.querySelector('[data-apercu-champ="erreurs"]').value).toBe('200');
        expect(atelier.isConnected).toBe(false);
    });

    it('E.e toucher une phrase ouvre l\'étape qui l\'écrit et y met le focus ; la survoler l\'allume', () => {
        const c = { ...REDACTION, id: 'CR_EE' };
        const { w, doc, atelier, apercu } = page(c);
        const verdict = [...apercu.querySelectorAll('[data-lecture="pdf"] .apercu-algo-segment[data-vers-zone]')].find((s) => s.dataset.versZone.startsWith('palier:'));
        expect(verdict).toBeTruthy();
        const [, i, champ] = verdict.dataset.versZone.split(':');
        verdict.dispatchEvent(new w.Event('pointerover', { bubbles: true }));
        const zone = atelier.querySelector(`textarea[data-palier-index="${i}"][data-champ="${champ}"]`);
        expect(zone.classList.contains('atelier-algo-montree')).toBe(true);
        verdict.dispatchEvent(new w.Event('pointerout', { bubbles: true }));
        expect(zone.classList.contains('atelier-algo-montree')).toBe(false);
        verdict.click();
        expect(ouvertes(atelier)).toEqual(['paliers']);
        expect(doc.activeElement).toBe(zone);
        apercu.querySelector('[data-lecture="aucune"] .apercu-algo-segment').click();
        expect(ouvertes(atelier)).toEqual(['codes']);
        expect(doc.activeElement).toBe(atelier.querySelector('textarea[data-enonce-cle="aucune"]'));
    });

    it('E.f un bloc survolé allume les zones VISIBLES qui l\'acceptent et pose le crayon sur leurs étapes ; le quitter éteint tout', () => {
        const c = { ...REDACTION, id: 'CR_EF' };
        const { w, atelier } = page(c);
        const bloc = atelier.querySelector('.palette-algo-bloc[data-jeton="{service}"]');
        bloc.dispatchEvent(new w.Event('pointerover', { bubbles: true }));
        expect([...atelier.querySelectorAll('.bc-etape.bc-montre')].map((b) => b.dataset.etape)).toEqual(['paliers']);
        // « Paliers » est fermée : ses zones ne s'allument pas (on ne les voit pas), le crayon les montre.
        expect(atelier.querySelectorAll('.atelier-algo-peut')).toHaveLength(0);
        bloc.dispatchEvent(new w.Event('pointerout', { bubbles: true }));
        w.atelierAlgo.ouvrir(atelier, 'paliers', false);
        bloc.dispatchEvent(new w.Event('pointerover', { bubbles: true }));
        expect(atelier.querySelectorAll('textarea[data-palier-index].atelier-algo-peut').length).toBe(12);
        expect(atelier.querySelectorAll('textarea[data-enonce-cle].atelier-algo-peut')).toHaveLength(0);
        bloc.dispatchEvent(new w.Event('pointerout', { bubbles: true }));
        expect(atelier.querySelectorAll('.atelier-algo-peut, .bc-montre')).toHaveLength(0);
    });

    it('E.g fermer l\'étape de la zone que la palette vise la décible ; une zone visible reste visée', () => {
        const c = { ...REDACTION, id: 'CR_EG' };
        const { w, atelier } = page(c);
        const palette = atelier.querySelector('.palette-algo');
        palette._zoneCible = atelier.querySelector('textarea[data-enonce-cle="decompte"]');
        w.atelierAlgo.ouvrir(atelier, 'eleve', false);
        expect(palette.dataset.decible).toBeUndefined();
        w.atelierAlgo.ouvrir(atelier, 'note', false);
        expect(palette.dataset.decible).toBe('1');
        expect(palette._zoneCible).toBeNull();
    });

    it('E.h sans pondération : « aucune » note, et la phrase du miroir le dit ; la ligne du facteur paraît sans projection', () => {
        const { apercu } = page({ ...CHIMIE, id: 'CC_EH', ponderation: 0 });
        expect(texte(apercu.querySelector('.apercu-algo-resultats'))).toBe('Note aucune');
        expect(texte(apercu.querySelector('.apercu-algo-raison'))).toBe(M.libelles(CHIMIE).sansPonderation);
        const { apercu: ap2 } = page({ ...CHIMIE, id: 'CC_EH2' });
        expect(texte(ap2.querySelector('.apercu-algo-etendue'))).toBe(M.libelles(CHIMIE).etendueDuFacteur);
        expect(texte(ap2).toLowerCase()).not.toContain('français');
    });

    it('E.i deux critères algorithmiques : chacun son atelier, ses identifiants préfixés par son index', () => {
        const a = { ...REDACTION, id: 'CR_I1' }, b = { ...CHIMIE, id: 'CR_I2' };
        const html = A.rendre(a, { mode: 'grille', grilleId: 'G1', index: 0, criteres: [a, b] }, ZONES)
            + A.rendre(b, { mode: 'grille', grilleId: 'G1', index: 1, criteres: [a, b] }, ZONES);
        const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.filter((x) => x.startsWith('atelier-algo-1-'))).toHaveLength(5);
        expect(ids.filter((x) => x.startsWith('apercu-algo-1-'))).toHaveLength(3);
    });

    it('E.j un nom piégé reste du texte : échappé dans le rendu, posé par textContent dans l\'aperçu', () => {
        const piege = { ...REDACTION, id: 'CR_EJ', nom: '<img src=x onerror=alert(1)>', noms: { erreurs: { singulier: '<b>x</b>', pluriel: '<b>xs</b>' }, mots: NOMS.mots } };
        const html = A.rendre(piege, { mode: 'grille', grilleId: 'G1', index: 0, criteres: [piege] }, ZONES);
        expect(html).not.toContain('<b>xs</b>');
        expect(html).toContain('&lt;b&gt;xs&lt;/b&gt;');
        const { atelier } = page(piege);
        expect(atelier.querySelectorAll('.apercu-algo img, .apercu-algo b, .atelier-algo-chaine b')).toHaveLength(0);
    });
});

/* ============================================================ F — LA CHAÎNE COMMUNE */

describe('atelier · F — ChaineEtapes : deux états de plus, les autres chaînes inchangées', () => {
    it('F.a sans `ouverte` ni `crayons` : ni `.bc-ouvert`, ni crayon, ni « ouverte » au lecteur d\'écran (les chaînes des lots 3a-3b)', () => {
        const dom = new JSDOM('<!doctype html><body><nav id="c"></nav></body>', { runScripts: 'outside-only' });
        dom.window.eval(source('js/chaine-etapes.js'));
        const nav = dom.window.document.getElementById('c');
        dom.window.ChaineEtapes.dessiner(nav, [{ id: 'a', libelle: 'A', reglee: true }, { id: 'b', libelle: 'B', arrivee: true }]);
        expect(nav.querySelectorAll('.bc-crayon, .bc-ouvert, .bc-montre')).toHaveLength(0);
        expect([...nav.querySelectorAll('.u-lecteur-ecran')].map((x) => x.textContent)).toEqual([', réglée', ', à régler']);
        dom.window.ChaineEtapes.marquer(nav, ['b']);
        expect(nav.querySelector('.bc-etape[data-etape="b"]').classList.contains('bc-montre')).toBe(true);
        dom.window.ChaineEtapes.marquer(nav, []);
        expect(nav.querySelectorAll('.bc-montre')).toHaveLength(0);
    });

    it('F.b les deux états se dessinent dans styles.css ; la chaîne de l\'atelier ne rejoue pas son entrée ; la case des chaînes la masque', () => {
        const css = source('styles.css');
        expect(css).toMatch(/\.bc-etape\.bc-ouvert \.bc-noeud \{/);
        expect(css).toMatch(/\.bc-etape\.bc-montre \.bc-crayon \{ display: flex; \}/);
        expect(css).toMatch(/\.atelier-algo-chaine \.bc-etape \{ animation: none; \}/);
        expect(css).toMatch(/body\.chaines-etapes-masquees \.barre-convergence \{\s*display: none;/);
        expect(A.rendre(REDACTION, { mode: 'grille', grilleId: 'G1', index: 0, criteres: [] }, ZONES)).toContain('<nav class="atelier-algo-chaine"');
    });
});

/* ============================================================ G — LE CHARGEMENT */

describe('atelier · G — index.html, les zones violettes, les blocs', () => {
    it('G.a atelier-algo.js est chargé après miroir-algo.js, palette-algo.js et chaine-etapes.js, avant grilles.js, avec un jeton', () => {
        const html = source('index.html');
        const pos = (f) => html.indexOf('src="js/' + f + '?v=');
        expect(pos('atelier-algo.js')).toBeGreaterThan(0);
        ['miroir-algo.js', 'palette-algo.js', 'chaine-etapes.js', 'note-pourcentage.js'].forEach((f) => expect(pos('atelier-algo.js'), f).toBeGreaterThan(pos(f)));
        expect(pos('atelier-algo.js')).toBeLessThan(pos('grilles.js'));
    });

    it('G.b les zones violettes ont leurs jetons dans les deux modes ; les blocs une bordure égale sur les quatre côtés', () => {
        const css = source('styles.css');
        expect(css).toMatch(/:root \{[\s\S]*?--zone-blocs: #b79cff;/);
        expect(css).toMatch(/\.mode-clair \{[\s\S]*?--zone-blocs: #6d28d9;/);
        expect(css).toMatch(/\.gabarit-algo textarea\[data-palier-index\] \{\s*border: 1\.5px dashed var\(--zone-blocs-bord\)/);
        const bloc = tranche(css, '.palette-algo-bloc {', '}');
        expect(bloc).not.toContain('border-left-width');
    });
});

/**
 * #1204 (décision de Grégoire, 27 nov. 2026) — LA PHRASE DU BILAN D'UN CRITÈRE TOMBÉ À 0 SORT
 * AUSSI POUR UNE COPIE DU MODE DES CODES.
 *
 * Lu dans une relecture du 30 oct. (VERDICT-RELECTURE-2026-10-30-niveau-rai-critere.md), rejoué ici :
 * `_detecterAlgoA0Bilan` (evaluation-retroaction.js) ne lisait que `donneesAlgorithmiques[id].erreurs`.
 * Une copie dont le compte vient des codes posés par catégorie (`calculerNoteAlgorithmiqueAvecCategories`,
 * evaluation-calcul.js) n'écrit que `totalErreurs` : sa note du critère pouvait tomber à 0 sans que
 * la première source la repère, et l'élève ne recevait pas la phrase « Défi prioritaire » que
 * l'enseignant·e a écrite au gabarit pour ce cas (le bilan est copié dans ce qu'il reçoit). La
 * seconde source (les codes « errfr_ » de la copie ouverte) ne rattrape que les copies annotées,
 * avec une estimation de la formule, sans les poids des sous-critères.
 *
 * Décision : la phrase sort dans les deux cas. Aucun mot nouveau : ce sont les mots du gabarit et la
 * ligne d'aujourd'hui. Le compte dit est le nombre BRUT de codes (`totalErreurs`), celui que l'élève
 * lit partout ailleurs. Noms et grilles fictifs.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const PHRASE = 'Ta langue écrite est à travailler en priorité';
const CRITERE = {
    id: 'C_LANGUE', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20,
    enonces: { priorite: PHRASE }
};
const GRILLE = { id: 'G1', criteres: [{ id: 'C_IDEES', nom: 'Idées', type: 'standard' }, CRITERE] };

function bilan() {
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/evaluation-enonces.js', {}, win);
    chargerScript('js/evaluation-retroaction.js', { echapperHtml: echapper, db: { getSync: (k, d) => d },
        document: { addEventListener() {}, getElementById: () => null } }, win);
    return win.bilanAlgoNoms;
}

/** La mémoire qu'écrit le mode des codes par catégorie (`_sauvegarderDonneesAlgo`, evaluation-calcul.js). */
function modeDesCodes(total, mots, pourcentage) {
    const codes = Array.from({ length: total }, (_, i) => String((i % 3) + 1));
    return { codes, mots, totalErreurs: total, sommePonderee: total, noteCalculee: pourcentage * 20 / 100,
        pourcentage, niveau: pourcentage <= 0 ? 'I' : 'M', retroaction: '' };
}

const copie = (donnees) => ({ etudiantDA: '9000058', grilleId: 'G1', donneesAlgorithmiques: { C_LANGUE: donnees } });

describe('#1204 — le critère tombé à 0, repéré dans les deux modes', () => {
    it('témoin : le mode simple (`erreurs`) à 0 % est repéré, comme avant', () => {
        const b = bilan();
        const a0 = b.detecterAlgoA0(GRILLE, copie({ erreurs: 31, mots: 300, pourcentage: 0 }), 0);
        expect(a0).toMatchObject({ critereNom: 'Langue écrite', erreurs: 31, mots: 300 });
        expect(a0.critere).toBe(CRITERE);
    });

    it('le mode des codes (`totalErreurs` seul) à 0 % est repéré, sans copie annotée ouverte', () => {
        const b = bilan();
        const a0 = b.detecterAlgoA0(GRILLE, copie(modeDesCodes(24, 300, 0)), 0);
        expect(a0).not.toBeNull();
        expect(a0).toMatchObject({ critereNom: 'Langue écrite', erreurs: 24, mots: 300 });
        expect(a0.critere).toBe(CRITERE);
    });

    it('l\'élève reçoit la phrase du gabarit et la ligne d\'aujourd\'hui, avec le nombre brut de codes', () => {
        const b = bilan();
        const html = b.rendreAlgoA0(b.detecterAlgoA0(GRILLE, copie(modeDesCodes(24, 300, 0)), 0));
        expect(html).toBe('<p>- <strong>' + PHRASE + '</strong> (Langue écrite : 24 erreurs sur 300 mots, Incomplet)</p>');
    });

    it('le mode des codes au-dessus de 0 % n\'est pas un critère tombé à 0', () => {
        const b = bilan();
        expect(b.detecterAlgoA0(GRILLE, copie(modeDesCodes(6, 300, 45)), 0)).toBeNull();
    });

    it('sans aucun code, pas de phrase : il n\'y a pas de compte à dire', () => {
        const b = bilan();
        expect(b.detecterAlgoA0(GRILLE, copie(modeDesCodes(0, 300, 0)), 0)).toBeNull();
        expect(b.detecterAlgoA0(GRILLE, copie({ codes: [], mots: 300, totalErreurs: 0 }), 0)).toBeNull();
    });

    it('les deux champs présents : `erreurs` reste la lecture (le mode simple d\'aujourd\'hui)', () => {
        const b = bilan();
        const a0 = b.detecterAlgoA0(GRILLE, copie({ erreurs: 31, totalErreurs: 12, mots: 300, pourcentage: 0 }), 0);
        expect(a0.erreurs).toBe(31);
    });
});

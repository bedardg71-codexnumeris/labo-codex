import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racineProjet = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');

// LOT « NIVEAU SANS SEUILS » (10 nov. 2026) — rapport : `plans de travail/RAPPORT-2026-11-10-niveau-sans-seuils.md`.
//
// Un niveau ajouté en vue simple a une valeur et pas de seuils ; sa valeur peut dépasser 100. Mesuré par exécution
// avant d'écrire : la répartition du Suivi rangeait un·e étudiant·e à 0 dans ce niveau et ne rangeait nulle part une
// note de 110 ; le PDF d'une échelle imprimait « 0 % - 100 % » ; le graphique lui traçait une zone aux bornes NaN ; le
// partage refusait la valeur 110. Ce banc tient les fonctions ; le parcours par l'interface est dans
// `tests/integration/niveau-sans-seuils.spec.js`.

// La lecture commune, extraite du VRAI fichier (aucune copie de la règle ici).
const sourceEchelles = lire('js/echelles.js');
const lecture = new Function(tranche(sourceEchelles, 'function _seuilLu(v) {', 'function valeurNumeriqueDuNiveau(niveau) {')
    + '\nreturn { niveauADesSeuils, niveauQuiRecoit };')();

// L'échelle née en vue simple (formes mesurées), plus le niveau ajouté : une valeur, aucun seuil.
const NIVEAUX = [
    { code: 'PS', nom: 'Préstructurel', min: 0, max: 39.99, valeurCalcul: 0 },
    { code: 'I', nom: 'Incomplet', min: 40, max: 64.99, valeurCalcul: 50 },
    { code: 'D', nom: 'Développement', min: 65, max: 74.99, valeurCalcul: 70 },
    { code: 'M', nom: 'Maîtrise', min: 75, max: 84.99, valeurCalcul: 80 },
    { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 92.5 },
    { code: 'X', nom: 'Exemplaire', valeurCalcul: 110 }
];
const code = (n) => (n ? n.code : null);

describe('niveau sans seuils · S — qui a des seuils', () => {
    it('S.a aucun des deux champs, ou deux champs vides : sans seuils', () => {
        expect(lecture.niveauADesSeuils({ code: 'X', valeurCalcul: 110 })).toBe(false);
        expect(lecture.niveauADesSeuils({ code: 'X', min: '', max: '  ' })).toBe(false);
        expect(lecture.niveauADesSeuils({ code: 'X', min: null, max: 'abc' })).toBe(false);
        expect(lecture.niveauADesSeuils(null)).toBe(false);
    });

    it('S.b un seuil à zéro est un seuil ; un seul des deux suffit (lecture d\'avant ce lot conservée)', () => {
        expect(lecture.niveauADesSeuils({ min: 0, max: 39.99 })).toBe(true);
        expect(lecture.niveauADesSeuils({ min: '0', max: '' })).toBe(true);
        expect(lecture.niveauADesSeuils({ max: 54 })).toBe(true);
        expect(lecture.niveauADesSeuils({ min: 0 })).toBe(true);   // zéro, seul : c'est encore un seuil
    });
});

describe('niveau sans seuils · R — le niveau qui reçoit un pourcentage', () => {
    it('R.a une note de 0 va au plus bas niveau, pas au niveau sans seuils (mesuré : il la captait)', () => {
        expect(code(lecture.niveauQuiRecoit(NIVEAUX, 0))).toBe('PS');
    });

    it('R.b une note de 110 va au plus haut niveau à seuils (mesuré : nulle part)', () => {
        expect(code(lecture.niveauQuiRecoit(NIVEAUX, 110))).toBe('E');
        expect(code(lecture.niveauQuiRecoit(NIVEAUX, 100.01))).toBe('E');
    });

    it('R.c les notes ordinaires vont où elles allaient, quel que soit l\'ordre des niveaux', () => {
        const melange = [NIVEAUX[5], NIVEAUX[3], NIVEAUX[0], NIVEAUX[4], NIVEAUX[1], NIVEAUX[2]];
        expect([0, 39.99, 40, 70, 75, 84.99, 85, 100].map(p => code(lecture.niveauQuiRecoit(melange, p))))
            .toEqual(['PS', 'PS', 'I', 'D', 'M', 'M', 'E', 'E']);
    });

    it('R.d le niveau sans seuils ne reçoit jamais personne', () => {
        for (let p = -10; p <= 200; p += 0.5) expect(code(lecture.niveauQuiRecoit(NIVEAUX, p))).not.toBe('X');
    });

    it('R.e ce qui ne change pas : un seul seuil se lit comme avant (0 et 100), un trou entre deux plages ne range pas', () => {
        const partiels = [{ code: 'B', max: 54 }, { code: 'H', min: 55 }];
        expect([0, 54, 55, 100, 110].map(p => code(lecture.niveauQuiRecoit(partiels, p)))).toEqual(['B', 'B', 'H', 'H', 'H']);
        expect(lecture.niveauQuiRecoit([{ code: 'B', min: 0, max: 50 }, { code: 'H', min: 60, max: 100 }], 55)).toBeNull();
    });

    it('R.f aucun niveau à seuils, ou pas un nombre : null, jamais une exception', () => {
        expect(lecture.niveauQuiRecoit([NIVEAUX[5]], 50)).toBeNull();
        expect(lecture.niveauQuiRecoit(undefined, 50)).toBeNull();
        expect(lecture.niveauQuiRecoit(NIVEAUX, NaN)).toBeNull();
        expect(lecture.niveauQuiRecoit(NIVEAUX, -5)).toBeNull();
    });
});

describe('niveau sans seuils · B — le Suivi branche la lecture commune', () => {
    const suivi = lire('js/tableau-bord-apercu.js');

    it('B.a la répartition et son interprétation rangent par `niveauQuiRecoit`, sur les seuls niveaux à seuils', () => {
        for (const fonction of ['function genererInterpretationPerformance(', 'function calculerDistributionPerformance(']) {
            const corps = tranche(suivi, fonction, '\nfunction ');
            expect(corps).toContain('window.niveauQuiRecoit(niveaux, etudiant.valeur * 100)');
            expect(corps).toContain('window.niveauADesSeuils(n)');
            expect(corps).not.toMatch(/niveau\.max \|\| 100/);   // l'ancienne plage prêtée
        }
    });
});

describe('niveau sans seuils · P — la plage imprimée par le PDF d\'une échelle', () => {
    const pdf = lire('js/export-pdf.js');
    const plageDuNiveau = new Function('window', 'formaterPourcentage',
        tranche(pdf, 'function plageDuNiveau(n) {', '\n/**') + '\nreturn plageDuNiveau;')(lecture, (v) => v + ' %');

    it('P.a un niveau sans seuils imprime le tiret, plus « 0 % - 100 % »', () => {
        expect(plageDuNiveau(NIVEAUX[5])).toBe('—');
    });

    it('P.b un niveau à seuils imprime sa plage, comme avant ; un seul seuil aussi', () => {
        expect(plageDuNiveau(NIVEAUX[0])).toBe('0 % - 39.99 %');
        expect(plageDuNiveau({ min: 55 })).toBe('55 % - 100 %');
    });

    it('P.c les quatre sorties (aperçu et trois PDF) passent par cette fonction', () => {
        expect(pdf.split('plageDuNiveau(n)').length - 1).toBe(5);   // la déclaration et quatre appels
        expect(pdf.split('formaterPourcentage(n.max ?? 100)').length - 1).toBe(1);   // dans la fonction seulement
    });
});

describe('niveau sans seuils · Z — les zones du graphique de progression', () => {
    const zones = new Function('window', 'hexVersRgba',
        tranche(lire('js/graphiques-progression.js'), 'function genererZonesDepuisEchelle(echelle) {', '\n/**')
        + '\nreturn genererZonesDepuisEchelle;')(lecture, (c) => c);

    it('Z.a aucune zone pour le niveau sans seuils, et aucune borne qui ne soit un nombre (mesuré : NaN)', () => {
        const z = zones({ niveaux: [NIVEAUX[3], NIVEAUX[5], NIVEAUX[0], NIVEAUX[4], NIVEAUX[1], NIVEAUX[2]] });
        expect(z.map(x => x.code)).toEqual(['PS', 'I', 'D', 'M', 'E']);
        expect(z.every(x => Number.isFinite(x.yMin) && Number.isFinite(x.yMax))).toBe(true);
    });
});

describe('niveau sans seuils · V — le partage d\'une échelle', () => {
    const w = chargerScript('js/partage-schemas.js');
    chargerScript('js/partage-format.js', {}, w);
    chargerScript('js/partage-validation.js', {}, w);
    const echelle = (niveaux) => ({ id: 'ECH_NSS', nom: 'Échelle fictive', niveaux });
    const verdict = (niveaux) => w.partageValidation.validerPackage(
        w.partageFormat.construirePackage(echelle(niveaux), { type: 'echelle', identiteAuteur: 'Émettrice fictive' }));
    const champs = (v) => JSON.stringify(v);

    it('V.a une valeur de 110 voyage, sur un niveau sans seuils (mesuré : « valeur 110 hors limites [0, 100] »)', () => {
        const v = verdict(NIVEAUX);
        expect(v.erreurs).toEqual([]);
        expect(v.valide).toBe(true);
        expect(v.packageNettoye.entites.echelles[0].niveaux[5]).toEqual({ code: 'X', nom: 'Exemplaire', valeurCalcul: 110 });
    });

    it('V.b une valeur négative reste refusée', () => {
        const v = verdict([Object.assign({}, NIVEAUX[0], { valeurCalcul: -1 })]);
        expect(v.valide).toBe(false);
        expect(champs(v.erreurs)).toContain('niveaux[0].valeurCalcul');
    });

    it('V.c les seuils restent des pourcentages : un `max` de 110 est refusé', () => {
        const v = verdict([Object.assign({}, NIVEAUX[4], { max: 110 })]);
        expect(v.valide).toBe(false);
        expect(champs(v.erreurs)).toContain('niveaux[0].max');
    });
});

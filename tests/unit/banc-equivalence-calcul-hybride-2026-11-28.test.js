/**
 * BANC D'ÉQUIVALENCE DU CALCUL HYBRIDE — temps 1 du lot « calcul hybride unique » (28 nov. 2026).
 * Mandat : plans de travail/RAPPORT-2026-11-28-calcul-hybride-unique.md (section 1, la matrice).
 *
 * Il fige, avec les fonctions d'AVANT le lot (commit e303f4768), la note et les productions retenues de
 * `calculerDetailsNoteFinale` pour 213 cas × 8 élèves fictifs : les modes (meilleurs, derniers, recents,
 * recents-meilleurs, tous, « hybride » sans catégories, une valeur inconnue) et les deux blocs ; N plus petit, égal et
 * plus grand que le nombre de copies ; notes provisoires et finales ; obligatoire non remise ; copie non recevable ;
 * reprise qui remplace (et reprise en brouillon) ; terminale présente, absente, non recevable ; égalité à la coupure ;
 * avec artefacts, sans artefact (avec et sans terminale, avec `configuration.productionsExclues`) ; une production
 * formative et une diagnostique dans le cours ; règles de conformité actives ; marques « obligatoire » hors du pool.
 *
 * ⚠ LES VALEURS ATTENDUES SONT DES CONSTANTES (tests/fixtures/equivalence-calcul-hybride-2026-11-28/constantes.json),
 * écrites une fois et jamais recalculées par le code jugé. La comparaison est STRICTE : la signature entière, sérialisée,
 * doit être identique (la note au dernier chiffre, les retenues dans leur ordre, le récit, la clé de méthode).
 * Aucune tolérance. Si un cas rougit, c'est une note qui change : on ne retouche pas la constante, on s'arrête.
 *
 * Le banc devient la sentinelle du calcul unique (temps 3) : il reste, avec ses constantes.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { matrice, signaturesDuCas, compacter, CHAMPS_COMPACTS, ELEVES } from './_helpers/banc-equivalence-hybride-2026-11-28.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONSTANTES = JSON.parse(readFileSync(
    path.resolve(__dirname, '..', 'fixtures', 'equivalence-calcul-hybride-2026-11-28', 'constantes.json'), 'utf8'));
const CAS = matrice();

describe('Banc d\'équivalence du calcul hybride · la matrice est entière', () => {
    it('les champs de la signature sont ceux des constantes', () => {
        expect(CHAMPS_COMPACTS).toEqual(CONSTANTES.champs);
    });

    it('chaque cas de la matrice a ses constantes, et aucune constante n\'est sans cas (213 cas, 8 élèves)', () => {
        const noms = CAS.map(c => c.nom);
        expect(new Set(noms).size).toBe(noms.length);
        expect(noms.slice().sort()).toEqual(Object.keys(CONSTANTES.cas).sort());
        expect(noms.length).toBe(213);
        Object.values(CONSTANTES.cas).forEach(parEleve => expect(Object.keys(parEleve)).toEqual(Object.keys(ELEVES)));
    });
});

describe('Banc d\'équivalence du calcul hybride · chaque cas rend ses constantes, au chiffre près', () => {
    for (const cas of CAS) {
        it(cas.nom, () => {
            const obtenu = signaturesDuCas(cas);
            const attendu = CONSTANTES.cas[cas.nom];
            for (const da of Object.keys(ELEVES)) {
                const compact = compacter(obtenu[da], CONSTANTES.erreurs);
                // Sérialisées : l'égalité de deux chaînes JSON est celle des nombres au dernier bit (aucune tolérance).
                expect(JSON.stringify(compact), 'élève ' + da).toBe(JSON.stringify(attendu[da]));
            }
        });
    }
});

/*
 * Ce que les constantes disent, en clair. Ces essais lisent les CONSTANTES, pas le code : ils nomment les faits que le
 * calcul unique devra garder, et ceux qui fondent l'arrêt rapporté (section 4 du rapport).
 */
const note = (nom, da) => CONSTANTES.cas[nom][da][0];
const retenues = (nom, da) => CONSTANTES.cas[nom][da][2];

describe('Banc d\'équivalence · ce que les constantes établissent', () => {
    it('« N meilleures » et le bloc Sélection seul rendent la même note ET les mêmes retenues, pour N = 3, 6, 9', () => {
        for (const n of [3, 6, 9]) for (const fin of ['provisoire', 'finale']) for (const da of Object.keys(ELEVES)) {
            const a = 'ART_TOUT_SEL · meilleurs-N' + n + ' · ' + fin;
            const b = 'ART_TOUT_SEL · deux-blocs-pleines-N' + n + ' (portfolio meilleurs) · ' + fin;
            expect(note(b, da)).toBe(note(a, da));
            expect(retenues(b, da)).toBe(retenues(a, da));
        }
    });

    it('en notes provisoires, « Toutes » et le bloc Obligatoires seul rendent la même note (avec artefacts)', () => {
        for (const da of Object.keys(ELEVES)) {
            expect(note('ART_TOUT_OBL · deux-blocs-pleines-N4 (portfolio meilleurs) · provisoire', da))
                .toBe(note('ART_TOUT_OBL · tous-N6 · provisoire', da));
        }
    });

    it('ARRÊT — en notes finales, « Toutes » ignore une production non remise ; le bloc Obligatoires la compte 0', () => {
        // Élève 2000006 : deux copies sur six. « Toutes » : (71 + 84) / 2 = 77,5. Obligatoires : (71 + 84) / 6 = 25,83.
        expect(note('ART_TOUT_OBL · tous-N6 · finale', '2000006')).toBe(77.5);
        expect(note('ART_TOUT_OBL · deux-blocs-pleines-N4 (portfolio meilleurs) · finale', '2000006')).toBe(25.833333333333332);
        const differentes = Object.keys(ELEVES).filter(da =>
            note('ART_TOUT_OBL · tous-N6 · finale', da) !== note('ART_TOUT_OBL · deux-blocs-pleines-N4 (portfolio meilleurs) · finale', da));
        expect(differentes).toEqual(['2000002', '2000003', '2000004', '2000005', '2000006', '2000007', '2000008']);
    });

    it('sans artefact, une production sans catégorie (le formatif) compte sous « Toutes » et sort des deux blocs', () => {
        expect(retenues('SANS · tous-N6 · provisoire', '2000008')).toBe('F1,P1,P4,P6');
        expect(retenues('SANS · deux-blocs-pleines-N4 (portfolio meilleurs) · provisoire', '2000008')).not.toContain('F1');
    });

    it('en deux blocs et notes finales, sans aucune copie au pool, la note existe (le pool vaut 0) ; en provisoire, elle manque', () => {
        expect(note('ART · deux-blocs-pleines-N2 (portfolio meilleurs) · finale', '2000007')).toBe(30.8);
        expect(note('ART · deux-blocs-pleines-N2 (portfolio meilleurs) · provisoire', '2000007')).toBe(null);
    });

    it('le libellé « hybride (catégories) », lu comme une clé par le PDF, est figé', () => {
        expect(CONSTANTES.cas['ART · deux-blocs-pleines-N4 (portfolio meilleurs) · finale']['2000001'][5]).toBe('hybride (catégories)');
    });
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Brique A du PLAN-namespacing-par-trimestre (24 juin 2026).
// Symptôme terrain A25 : à l'ouverture d'une éval d'un trimestre ARCHIVÉ, encadré
// « Grille d'origine introuvable » + échelle vide, car les écrans du sous-système
// évaluation lisaient les modèles (grilles/échelles/cartouches) sur la clé GLOBALE
// en direct, court-circuitant le routage de cle() vers les copies a2025_*.
// Fix : brancher les 29 lectures de consultation/calcul/affichage sur cle().
//
// Cette sentinelle verrouille DEUX choses :
//   1. le COMPORTEMENT de cle() — depuis #358 (Option A), grilles/échelles sont
//      NAMESPACÉES : actif non archivé → <id>_*, archivé → copie <id>_* (ou clé
//      namespacée même sans copie matérialisée). Les CARTOUCHES restent globales ;
//   2. le RATCHET statique — ni le flux d'évaluation (5 fichiers, 24 juin) ni les
//      écrans d'analyse (Brique A suite, PLAN-briqueA-ecrans-analyse-namespacing.md)
//      ne relisent la clé nue : le symptôme exact ne peut pas revenir.
// Réf. Rapports/AUDIT-call-sites-namespacing-2026-06-24.md.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; }
    };
}

function chargerTrimestres(store) {
    return chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
}

describe('Brique A · cle() route les modèles d’évaluation par trimestre', () => {
    it('RÉGIME #358 + S5 — trimestre actif NON archivé : grilles/échelles ET cartouches namespacées', () => {
        const store = { trimestres: [{ id: 'h2026', actif: true, archive: false }] };
        const win = chargerTrimestres(store);
        // Option A : grilles/échelles ont rejoint CLES_NAMESPACEES → clé préfixée.
        expect(win.cle('grillesTemplates')).toBe('h2026_grillesTemplates');
        expect(win.cle('echellesTemplates')).toBe('h2026_echellesTemplates');
        // ⚠ CAS RETOURNÉ PAR S5/#623 LE 31 AOÛT 2026. Il attendait la clé NUE
        // `cartouches_<grilleId>` : les cartouches étaient alors GLOBALES, hors
        // périmètre du Bloc 1. S5 les a fait rejoindre le régime de leur grille,
        // parce qu'une seule case pour tous les trimestres les faisait s'écraser
        // entre eux (cf. tests/unit/sentinelle-623-s5-cartouches-namespacees.test.js).
        // Qui relira « cartouches globales » dans l'historique de ce fichier lira
        // une décision révolue, pas une régression.
        expect(win.cle('cartouches_GRILLE1759529438501')).toBe('h2026_cartouches_GRILLE1759529438501');
    });

    it('RÉSOLUTION ARCHIVE — A25 archivé AVEC copies : cle() rend la clé namespacée', () => {
        const store = {
            trimestres: [{ id: 'a2025', actif: true, archive: true }],
            a2025_grillesTemplates: [{ id: 'GRILLE_A2025_FR_ALGO' }],
            a2025_echellesTemplates: [{ id: 'ECH_A25' }],
            a2025_cartouches_GRILLE_A2025_FR_ALGO: [{ id: 'CART_A25' }]
        };
        const win = chargerTrimestres(store);
        expect(win.cle('grillesTemplates')).toBe('a2025_grillesTemplates');
        expect(win.cle('echellesTemplates')).toBe('a2025_echellesTemplates');
        expect(win.cle('cartouches_GRILLE_A2025_FR_ALGO')).toBe('a2025_cartouches_GRILLE_A2025_FR_ALGO');
    });

    it('ARCHIVÉ SANS COPIE — grilles/échelles ET cartouches routent vers la clé namespacée (plus aucun repli global)', () => {
        const store = { trimestres: [{ id: 'a2025', actif: true, archive: true }] };
        const win = chargerTrimestres(store);
        // #358 : grilles/échelles namespacées → clé du trimestre même sans copie
        // matérialisée (post-C1 elle existe ; le routage ne retombe plus sur le global).
        expect(win.cle('grillesTemplates')).toBe('a2025_grillesTemplates');
        expect(win.cle('echellesTemplates')).toBe('a2025_echellesTemplates');
        // ⚠ CAS RETOURNÉ PAR S5/#623 LE 31 AOÛT 2026. Le repli vers la clé globale
        // a été RETIRÉ de `cle()` avec la branche « Cas 2 » : c'était lui, le
        // mécanisme du partage entre trimestres — un trimestre archivé sans copie
        // retombait sur la case commune et lisait les cartouches d'un autre.
        expect(win.cle('cartouches_GRILLE_A2025_FR_ALGO')).toBe('a2025_cartouches_GRILLE_A2025_FR_ALGO');
    });

    describe('RATCHET statique — le flux de consultation ne relit plus la clé nue', () => {
        const fichiers = [
            // Flux d'évaluation (Brique A, livré 24 juin)
            'js/evaluation-calcul.js',
            'js/evaluation-chargement.js',
            'js/evaluation.js',
            'js/evaluation-retroaction.js',
            'js/evaluation-sauvegarde.js',
            // Écrans d'analyse (Brique A suite — un fichier ajouté par commit)
            'js/liste-evaluations.js',
            'js/tableau-bord-apercu.js',
            'js/graphiques-progression.js',
            'js/synthese-retroaction-data.js',
            'js/profil-etudiant-calculs.js',
            'js/profil-etudiant-diagnostics.js',
            'js/profil-etudiant-helpers.js',
            'js/profil-etudiant-sections-affichage.js'
        ];
        for (const f of fichiers) {
            it(`${f} : aucune lecture globale nue grilles/échelles/cartouches`, () => {
                const src = readFileSync(path.join(racineProjet, f), 'utf8');
                expect(src).not.toContain("db.getSync('grillesTemplates'");
                expect(src).not.toContain("db.getSync('echellesTemplates'");
                expect(src).not.toContain('db.getSync(`cartouches_');
            });
        }

        it('le branchement cle() est bien présent dans le calcul et le chargement', () => {
            const calcul = readFileSync(path.join(racineProjet, 'js/evaluation-calcul.js'), 'utf8');
            expect(calcul).toContain("db.getSync(cle('grillesTemplates')");
            expect(calcul).toContain("db.getSync(cle('echellesTemplates')");
            const chargement = readFileSync(path.join(racineProjet, 'js/evaluation-chargement.js'), 'utf8');
            expect(chargement).toContain('db.getSync(cle(`cartouches_${grilleId}`)');
        });

        it('écrans d’analyse — le branchement cle() est présent (représentatifs)', () => {
            const liste = readFileSync(path.join(racineProjet, 'js/liste-evaluations.js'), 'utf8');
            expect(liste).toContain('db.getSync(cle(`cartouches_${grilleId}`)');
            const calculs = readFileSync(path.join(racineProjet, 'js/profil-etudiant-calculs.js'), 'utf8');
            expect(calculs).toContain("db.getSync(cle('echellesTemplates')");
        });
    });
});

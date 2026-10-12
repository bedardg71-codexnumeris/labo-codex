import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Lot B1 du PLAN-namespacing-par-trimestre — Brique B « éditeur de Conception ».
// grilles.js EST l'éditeur des grilles de critères : ses 70 accès à grillesTemplates
// (lecture ET écriture) étaient câblés sur la clé GLOBALE, donc en trimestre ARCHIVÉ
// (A25) l'éditeur lisait/écrivait les grilles H26 au lieu des copies a2025_*.
// Fix : brancher tous les db.{get,set,getSync,setSync}('grillesTemplates') sur cle().
// + garde : en archive, initialiserModuleGrilles ne migre/n'injecte plus (lecture seule),
//   pour ne pas polluer la copie d'archive (golden master).
//
// Cette sentinelle verrouille :
//   1. le BRANCHEMENT cle() de bout en bout — importerGrillesExternes (lecture+écriture
//      synchrones, sans DOM en mode silencieux) écrit dans le global en H26, dans a2025_
//      en archive (preuve COMPORTEMENTALE, break-testable) ;
//   2. le RATCHET statique — grilles.js ne relit/n'écrit plus la clé nue ;
//   3. la GARDE archive sur l'init d'écriture (statique).
// Réf. plans de travail/PLAN-namespacing-par-trimestre.md (Brique B).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        // #522 lot 2c : `migrerCategoriesVersSousCriteres()` s'exécute AU
        // CHARGEMENT de grilles.js et écrit désormais par la file. Sans
        // `modifier`, ce module lève un rejet NON GÉRÉ au chargement — les
        // tests restent verts, mais `vitest run` sort en code 1 et le hook
        // pré-push bloque. Le stub reproduit la file, refus compris.
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        }
    };
}

// Charge trimestres.js (pour cle()) puis grilles.js sur le MÊME store, en injectant
// cle comme global (grilles.js l'appelle nu : cle('grillesTemplates')).
function chargerGrilles(store) {
    const winT = chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
    const winG = chargerScript('js/grilles.js', { db: dbDepuisStore(store), cle: winT.cle });
    return winG;
}

function chargerEchelles(store) {
    const winT = chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
    const winE = chargerScript('js/echelles.js', { db: dbDepuisStore(store), cle: winT.cle });
    return winE;
}

describe('Lot B1 · grilles.js — éditeur de grilles namespacé par trimestre', () => {
    it('BRANCHEMENT H26 — trimestre actif NON archivé : l’import écrit dans h2026_ (namespacé #358)', () => {
        const store = { trimestres: [{ id: 'h2026', actif: true, archive: false }] };
        const win = chargerGrilles(store);
        win.importerGrillesExternes([{ id: 'G_TEST_B1' }], { silencieux: true });
        // Option A : l'éditeur écrit dans la copie namespacée de l'actif, plus le global.
        expect((store.h2026_grillesTemplates || []).some(g => g.id === 'G_TEST_B1')).toBe(true);
        expect(store.grillesTemplates).toBeUndefined();          // clé globale héritée non écrite
        expect(store.a2025_grillesTemplates).toBeUndefined();    // pas de contamination A25
    });

    it('BRANCHEMENT A25 — trimestre archivé AVEC copie : l’import écrit dans a2025_, PAS le global', () => {
        const store = {
            trimestres: [{ id: 'a2025', actif: true, archive: true }],
            a2025_grillesTemplates: [{ id: 'GRILLE_A25_EXISTANTE' }]
        };
        const win = chargerGrilles(store);
        win.importerGrillesExternes([{ id: 'G_TEST_B1' }], { silencieux: true });
        // Écrit dans la copie d'archive…
        expect(store.a2025_grillesTemplates.some(g => g.id === 'G_TEST_B1')).toBe(true);
        // …et NE crée PAS la clé globale (pas de contamination H26).
        expect(store.grillesTemplates).toBeUndefined();
    });

    describe('RATCHET statique — grilles.js ne touche plus la clé nue', () => {
        const src = readFileSync(path.join(racineProjet, 'js/grilles.js'), 'utf8');
        for (const m of ['get', 'set', 'getSync', 'setSync']) {
            it(`aucun db.${m}('grillesTemplates' nu`, () => {
                expect(src).not.toContain(`db.${m}('grillesTemplates'`);
            });
        }
        it('le branchement cle() est présent', () => {
            expect(src).toContain("cle('grillesTemplates')");
        });
        it('GARDE archive : initialiserModuleGrilles saute la migration/injection en archive', () => {
            expect(src).toMatch(
                /estTrimestreArchive[\s\S]{0,160}migrerGrillesVersBibliotheque[\s\S]{0,160}assurerGrilleDeDepart/
            );
        });
    });
});

describe('Lot B2 · echelles.js — éditeur d’échelles namespacé par trimestre', () => {
    it('BRANCHEMENT H26 — trimestre actif NON archivé : l’import écrit dans h2026_ (namespacé #358)', () => {
        const store = { trimestres: [{ id: 'h2026', actif: true, archive: false }] };
        const win = chargerEchelles(store);
        win.importerEchellesExternes([{ id: 'E_TEST_B2' }], { silencieux: true });
        // Option A : l'éditeur écrit dans la copie namespacée de l'actif, plus le global.
        expect((store.h2026_echellesTemplates || []).some(e => e.id === 'E_TEST_B2')).toBe(true);
        expect(store.echellesTemplates).toBeUndefined();         // clé globale héritée non écrite
        expect(store.a2025_echellesTemplates).toBeUndefined();   // pas de contamination A25
    });

    it('BRANCHEMENT A25 — trimestre archivé AVEC copie : l’import écrit dans a2025_, PAS le global', () => {
        const store = {
            trimestres: [{ id: 'a2025', actif: true, archive: true }],
            a2025_echellesTemplates: [{ id: 'ECH_A25_EXISTANTE' }]
        };
        const win = chargerEchelles(store);
        win.importerEchellesExternes([{ id: 'E_TEST_B2' }], { silencieux: true });
        expect(store.a2025_echellesTemplates.some(e => e.id === 'E_TEST_B2')).toBe(true);
        expect(store.echellesTemplates).toBeUndefined();
    });

    describe('RATCHET statique — echelles.js ne touche plus la clé nue', () => {
        const src = readFileSync(path.join(racineProjet, 'js/echelles.js'), 'utf8');
        for (const m of ['get', 'set', 'getSync', 'setSync']) {
            it(`aucun db.${m}('echellesTemplates' nu`, () => {
                expect(src).not.toContain(`db.${m}('echellesTemplates'`);
            });
        }
        it('le branchement cle() est présent', () => {
            expect(src).toContain("cle('echellesTemplates')");
        });
        it('GARDE archive : initialiserModuleEchelles saute la migration/injection en archive', () => {
            expect(src).toMatch(
                /estTrimestreArchive[\s\S]{0,200}migrerEchellesVersBibliotheque/
            );
        });
    });
});

// Lot B3 — wizard-pratique-v2.js : sélecteurs de grille/échelle + récap. Toutes
// les lectures sont de l'affichage (peuplement de <select>, noms au récapitulatif)
// et wizardV2CreerGrilleDemo crée sur action utilisateur explicite. Pas de fonction
// sync exportée testable en isolation → ratchet statique uniquement.
describe('Lot B3 · wizard-pratique-v2.js — sélecteurs/récap namespacés', () => {
    const src = readFileSync(path.join(racineProjet, 'js/wizard-pratique-v2.js'), 'utf8');
    for (const k of ['grillesTemplates', 'echellesTemplates']) {
        for (const m of ['get', 'set', 'getSync', 'setSync']) {
            it(`aucun db.${m}('${k}' nu`, () => {
                expect(src).not.toContain(`db.${m}('${k}'`);
            });
        }
    }
    it('le branchement cle() est présent (grilles + échelles)', () => {
        expect(src).toContain("cle('grillesTemplates')");
        expect(src).toContain("cle('echellesTemplates')");
    });
});

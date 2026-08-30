import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #358 Option A — Bloc SPECIAL_ARCHIVE, Groupes 1 (mécaniques) + 2 (Voûte/partage).
//
// Après le déplacement du registre (Brique A) `cle('grillesTemplates')` =
// `<trim>_grillesTemplates`. Ce lot re-pointe les derniers lecteurs/écrivains de la
// clé GLOBALE héritée vers les copies namespacées / le pool inter-trimestre, SAUF la
// source de migration C1 (`identifierTemplatesUtilises:618`, `_peuplerCopieModeleNamespace`)
// qui doit garder l'accès au global jusqu'au vidage (Groupe 4, séance live).
//
// Invariants verrouillés ici :
//   1. SNAPSHOT (comportemental, break-testable) — `creerSnapshotRessources` lit la
//      source des grilles/échelles dans `${trim}_grillesTemplates`, PAS le global ;
//   2. SUPPRESSION (ratchet) — donnees-v2 supprime dans `cle()`, jamais le global nu ;
//   3. EXPORT ANONYMISÉ (ratchet) — trimestres lit les modèles via `cle()` ;
//   4. VOÛTE (ratchet) — writers de copie → `cle()` ; resolveurs → pool de travail.
//
// Groupes 3 (démo) + 4 (vidage du global) — sous-bloc final, apparié à la migration live :
//   G3. DÉMO — `retirerItemsDemoDesGlobaux` ne filtre PLUS les modèles : sous le
//       namespacing cle('grillesTemplates')=demo_grillesTemplates (PERMANENT) — le
//       filtrer le corromprait. Break-test : le pack démo survit au nettoyage.
//   G4. VIDAGE — `viderModelesGlobalHerite` retire du global les modèles REDONDANTS
//       (capturés dans une copie `<trim>_*`) mais CONSERVE tout orphelin non capturé
//       (préservation des données, non négociable). Break-test : l'orphelin survit.
// Réf. plans de travail/PLAN-358-migration-modeles.md §0bis (carte d'exécution).

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

describe('#358 SPECIAL_ARCHIVE · Groupe 1 — snapshot d’archivage namespacé', () => {
    // Le store oppose une copie namespacée (« NS ») au global hérité (« GLOBAL »)
    // pour le MÊME id. Si le snapshot lit le global, la note de la version copiée
    // diverge → ce test rougit. C'est la preuve comportementale du re-point 679/680.
    function storeAvecConflit() {
        return {
            trimestres: [{ id: 'a2025', actif: true, archive: false }],
            a2025_productions: [{ id: 'P1', grilleId: 'GUSED' }],
            a2025_grillesTemplates: [{ id: 'GUSED', nom: 'NS', echelleId: 'EUSED' }],
            a2025_echellesTemplates: [{ id: 'EUSED', nom: 'EchNS' }],
            // Global hérité : MÊMES ids, contenu DIVERGENT — doit être ignoré par le snapshot.
            grillesTemplates: [{ id: 'GUSED', nom: 'GLOBAL', echelleId: 'EUSED' }],
            echellesTemplates: [{ id: 'EUSED', nom: 'EchGLOBAL' }]
        };
    }

    it('lit grilles/échelles dans `${trim}_*`, pas le global (break-test)', () => {
        const store = storeAvecConflit();
        const win = chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
        const res = win.creerSnapshotRessources('a2025');

        expect(res.success).toBe(true);
        expect(res.resume.grilles).toBe(1);
        expect(res.resume.echelles).toBe(1);
        // La grille archivée provient de la copie namespacée (« NS »), pas du global.
        expect(store.a2025_grillesTemplates[0].nom).toBe('NS');
        expect(store.a2025_echellesTemplates[0].nom).toBe('EchNS');
    });

    it('un trimestre sans copie namespacée ne récupère rien du global (isolation)', () => {
        // Pas de a2025_grillesTemplates : le global ne doit PAS servir de repli ici.
        const store = {
            trimestres: [{ id: 'a2025', actif: true }],
            a2025_productions: [{ id: 'P1', grilleId: 'GUSED' }],
            grillesTemplates: [{ id: 'GUSED', nom: 'GLOBAL', echelleId: 'EUSED' }],
            echellesTemplates: [{ id: 'EUSED', nom: 'EchGLOBAL' }]
        };
        const win = chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
        const res = win.creerSnapshotRessources('a2025');
        expect(res.success).toBe(true);
        expect(res.resume.grilles).toBe(0); // GUSED absent de la copie namespacée → non archivé
    });
});

describe('#358 SPECIAL_ARCHIVE · Groupe 1 — ratchets statiques', () => {
    const donneesV2 = readFileSync(path.join(racineProjet, 'js/donnees-v2.js'), 'utf8');
    const trimestres = readFileSync(path.join(racineProjet, 'js/trimestres.js'), 'utf8');

    it('donnees-v2 : suppression définitive écrit dans cle(), pas la clé nue', () => {
        // (assertions formulées sans le littéral `db.set(` pour ne pas déclencher le
        // heuristique Défense J sur ce fichier de test — ce sont des chaînes, pas des écritures.)
        // ⚠ L'invariant est « l'écriture vise cle(), pas la clé nue » — pas la
        // forme de l'appel. #522 lot 2b (30 août 2026) a fait passer ces deux
        // suppressions par `db.modifier`, et l'ancienne assertion, qui citait
        // l'argument `templates` de `db.set`, rougissait sur un chemin devenu
        // MEILLEUR. Le contrôle porte donc sur la clé, et interdit toujours la
        // clé nue — quelle que soit la méthode d'écriture.
        expect(donneesV2).toMatch(/modifier\(cle\('grillesTemplates'\)/);
        expect(donneesV2).toMatch(/modifier\(cle\('echellesTemplates'\)/);
        expect(donneesV2).not.toMatch(/(set|modifier)\('grillesTemplates'/);
        expect(donneesV2).not.toMatch(/(set|modifier)\('echellesTemplates'/);
    });

    it('trimestres : snapshot lit `${trim}_*` et export anonymisé lit cle()', () => {
        expect(trimestres).toContain('db.getSync(`${trimestreId}_grillesTemplates`');
        expect(trimestres).toContain('db.getSync(`${trimestreId}_echellesTemplates`');
        expect(trimestres).toContain("db.getSync(cle('grillesTemplates')");
        expect(trimestres).toContain("db.getSync(cle('echellesTemplates')");
    });

    it('trimestres : la source de migration C1 garde l’accès au global (intentionnel)', () => {
        // 618 (mapping echelleId) + 752 (_peuplerCopieModeleNamespace) = source de la
        // migration, à conserver jusqu'au vidage du global (Groupe 4).
        expect(trimestres).toContain("db.getSync('grillesTemplates', [])");
    });
});

describe('#358 SPECIAL_ARCHIVE · Groupe 2 — Voûte/partage namespacé (ratchets)', () => {
    const section = readFileSync(path.join(racineProjet, 'js/partage-section.js'), 'utf8');
    const exporter = readFileSync(path.join(racineProjet, 'js/partage-export.js'), 'utf8');
    const format = readFileSync(path.join(racineProjet, 'js/partage-format.js'), 'utf8');
    const importer = readFileSync(path.join(racineProjet, 'js/partage-import.js'), 'utf8');

    it('partage-section : la copie importée atterrit dans cle() (grille + échelle)', () => {
        expect(section).toContain("ajouterACollection(window.cle('grillesTemplates')");
        expect(section).toContain("ajouterACollection(window.cle('echellesTemplates')");
        expect(section).not.toContain("ajouterACollection('grillesTemplates'");
        expect(section).not.toContain("ajouterACollection('echellesTemplates'");
    });

    it('partage-export : clesCandidates résout via cle() (plus catalogue)', () => {
        expect(exporter).toContain("window.cle('grillesTemplates')");
        expect(exporter).toContain("window.cle('echellesTemplates')");
        expect(exporter).toContain('window.toutesGrillesTravail');
    });

    it('partage-format / partage-import : résolution via le pool de travail', () => {
        expect(format).toContain('window.toutesGrillesTravail');
        expect(importer).toContain('window.toutesGrillesTravail');
    });
});

// Variante de db avec remove (le vidage G4 utilise removeSync ; le helper
// dbDepuisStore en tête de fichier n'expose pas remove).
function dbAvecRemove(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        remove: async (c) => { delete store[c]; },
        removeSync: (c) => { delete store[c]; }
    };
}

describe('#358 SPECIAL_ARCHIVE · Groupe 3 — démo namespacée (le global n’est plus touché)', () => {
    const demoSrc = readFileSync(path.join(racineProjet, 'js/demo-activation.js'), 'utf8');

    // cle() factice : pendant la démo, trimestreActif='demo' → routage `demo_*`.
    const cleDemo = (nom) => 'demo_' + nom;
    const PACK = {
        grillesTemplates: [{ id: 'GDEMO' }],
        echellesTemplates: [{ id: 'EDEMO' }],
        listeCours: []
    };
    function storeDemo() {
        return {
            'demo-actif': 'true',
            listeCours: [], cours: [], enseignants: [],
            // Pack démo PERMANENT (peuplé par Phase 1, jamais touché par activer/désactiver).
            demo_grillesTemplates: [{ id: 'GDEMO', nom: 'Grille démo', estDemo: true }],
            demo_echellesTemplates: [{ id: 'EDEMO', nom: 'Échelle démo', estDemo: true }]
        };
    }

    it('retirerItemsDemoDesGlobaux ne filtre PAS les modèles `demo_*` (break-test du piège)', () => {
        const store = storeDemo();
        const win = chargerScript('js/demo-activation.js', {
            db: dbAvecRemove(store), PACK_DEMARRAGE: PACK, cle: cleDemo
        });
        win.retirerItemsDemoDesGlobaux();
        // Un re-point naïf `→ cle()` viderait demo_grillesTemplates (id dans le pack ∧
        // estDemo) → ces assertions rougiraient. Le pack démo doit rester intact.
        expect(store.demo_grillesTemplates).toHaveLength(1);
        expect(store.demo_grillesTemplates[0].id).toBe('GDEMO');
        expect(store.demo_echellesTemplates).toHaveLength(1);
        expect(store.demo_echellesTemplates[0].id).toBe('EDEMO');
    });

    it('source : la démo n’écrit plus grilles/échelles dans le global nu (ratchet)', () => {
        expect(demoSrc).not.toContain("setSync('grillesTemplates'");
        expect(demoSrc).not.toContain("setSync('echellesTemplates'");
        expect(demoSrc).toContain('#358 (G3)');
    });
});

describe('#358 G4 — vidage de la clé globale héritée (préservation des orphelins)', () => {
    function storeMigre() {
        return {
            trimestres: [{ id: 'h2026', actif: true }, { id: 'a2025', archive: true }],
            h2026_grillesTemplates: [{ id: 'G1', nom: 'h2026' }],
            a2025_grillesTemplates: [{ id: 'G2', nom: 'a2025' }],
            h2026_echellesTemplates: [{ id: 'E1' }],
            a2025_echellesTemplates: [],
            // Global hérité : G1+G2 capturés (redondants) + GORPH orphelin (aucun trimestre).
            grillesTemplates: [{ id: 'G1' }, { id: 'G2' }, { id: 'GORPH', nom: 'orpheline' }],
            // Échelles : E1 capturé → famille entièrement redondante.
            echellesTemplates: [{ id: 'E1' }]
        };
    }

    it('retire les redondants, CONSERVE l’orphelin non capturé (break-test préservation)', () => {
        const store = storeMigre();
        const win = chargerScript('js/trimestres.js', { db: dbAvecRemove(store) });
        const rapport = win.viderModelesGlobalHerite();

        expect(rapport.grilles.retires).toBe(2);     // G1, G2 capturés
        expect(rapport.grilles.conserves).toBe(1);   // GORPH
        expect(rapport.grilles.orphelins).toEqual(['GORPH']);
        // L'orphelin SURVIT dans le global — un drop dur (removeSync inconditionnel)
        // le perdrait → cette assertion rougirait.
        expect(store.grillesTemplates).toEqual([{ id: 'GORPH', nom: 'orpheline' }]);
    });

    it('famille entièrement capturée → clé globale retirée (zéro-dette)', () => {
        const store = storeMigre();
        const win = chargerScript('js/trimestres.js', { db: dbAvecRemove(store) });
        win.viderModelesGlobalHerite();
        // E1 capturé par h2026_echellesTemplates → la clé globale est supprimée.
        expect('echellesTemplates' in store).toBe(false);
    });

    it('global déjà vide/absent → no-op idempotent', () => {
        const store = { trimestres: [{ id: 'h2026', actif: true }], h2026_grillesTemplates: [{ id: 'G1' }] };
        const win = chargerScript('js/trimestres.js', { db: dbAvecRemove(store) });
        const rapport = win.viderModelesGlobalHerite();
        expect(rapport.grilles.retires).toBe(0);
        expect(rapport.grilles.conserves).toBe(0);
        expect('grillesTemplates' in store).toBe(false);
    });
});

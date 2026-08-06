import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// VOIE A (tranchée le 6 août 2026, friction F2 : « regrouper plusieurs
// séquences sous un grand thème ») — le regroupement au-dessus de la séquence
// est une SÉQUENCE CONTENANT DES SÉQUENCES : le conteneur existant rendu
// récursif, pas un nouveau type de nœud.
//
// Le verrou levé est UNE ligne (`peutContenir`), mais la leçon des trois
// régressions du 6 août s'applique : une structure partagée change, on audite
// ses consommateurs. Tout scan plat `type === 'sequence'` afficherait chaque
// sous-séquence DEUX fois (à la racine + sous son parent). D'où la lecture
// hiérarchique partagée (`listerSequencesHierarchie`) et cette sentinelle.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const sourceOrganisateur = readFileSync(path.join(racineProjet, 'js', 'organisateur.js'), 'utf8');

// --- Sandbox ------------------------------------------------------------
let store;

function monterModule() {
    store = {};
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Test' }] }),
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t === null || t === undefined ? '' : t),
        requestAnimationFrame: (fn) => { fn(); return 0; }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = planificationDonnees;
    return win.planificationCarte;
}

function poser(api, id, type, { titre = type, x = 0, y = 0, parent = null, enfants = [], metadata = {} } = {}) {
    api.etat.noeuds.set(id, { id, type, titre, x, y, parent, enfants, metadata, cloneSourceId: null });
}

// Un thème contenant deux séquences (dont une avec leçon), plus une racine sœur.
function poserHierarchie(api) {
    poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-sA', metadata: { semaine: 2 } });
    poser(api, 'planif-sA', 'sequence', { titre: 'Ouverture', y: 100, parent: 'planif-theme', enfants: ['planif-l1'] });
    poser(api, 'planif-sB', 'sequence', { titre: 'Analyse', y: 200, parent: 'planif-theme', enfants: [] });
    poser(api, 'planif-theme', 'sequence', { titre: 'Thème 1', y: 50, enfants: ['planif-sA', 'planif-sB'] });
    poser(api, 'planif-sZ', 'sequence', { titre: 'Clôture', y: 500, enfants: [] });
}

describe('voie A · le verrou est levé, et seulement lui', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('une séquence peut contenir une séquence', () => {
        expect(api.peutContenir('sequence', 'sequence')).toBe(true);
        expect(api.peutContenir('sequence', 'lecon')).toBe(true);
    });

    it('rien d’autre ne s’est ouvert', () => {
        expect(api.peutContenir('lecon', 'sequence')).toBe(false);
        expect(api.peutContenir('sequence', 'activite')).toBe(false);
        expect(api.peutContenir('lecon', 'lecon')).toBe(false);
    });
});

describe('voie A · lecture hiérarchique', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserHierarchie(api); });

    it('chaque séquence apparaît UNE fois, les sous-séquences sous leur parent', () => {
        const h = api.listerSequencesHierarchie('spatial');
        expect(h.map((e) => e.seq.id)).toEqual(['planif-theme', 'planif-sA', 'planif-sB', 'planif-sZ']);
        expect(h.map((e) => e.niveau)).toEqual([0, 1, 1, 0]);
    });

    it('une sous-séquence qui TRIE avant son parent reste sous lui', () => {
        // Piège du parcours sans filtre racine : le dédoublonnage `vus` sauve
        // les apparences tant que le parent trie premier. Ici la sous-séquence
        // a un y PLUS PETIT que son parent — elle doit quand même sortir au
        // niveau 1, après lui.
        poser(api, 'planif-sHaut', 'sequence', { titre: 'Tout en haut', y: 1, parent: 'planif-theme' });
        api.etat.noeuds.get('planif-theme').enfants.push('planif-sHaut');

        const h = api.listerSequencesHierarchie('spatial');
        const entree = h.find((e) => e.seq.id === 'planif-sHaut');
        expect(entree.niveau).toBe(1);
        expect(h[0].seq.id).toBe('planif-theme');
        expect(h.filter((e) => e.seq.id === 'planif-sHaut')).toHaveLength(1);
    });

    it('l’ordre temporel trie les FRÈRES par étendue dérivée, sans casser la hiérarchie', () => {
        // sB n'a aucune leçon (non planifiée) : elle passe APRÈS sA au même niveau.
        const h = api.listerSequencesHierarchie('temporel');
        expect(h.map((e) => e.seq.id)).toEqual(['planif-theme', 'planif-sA', 'planif-sB', 'planif-sZ']);
    });

    it('cheminSequence : « Parent › Enfant » pour une sous-séquence, titre seul pour une racine', () => {
        expect(api.cheminSequence(api.etat.noeuds.get('planif-sA'))).toBe('Thème 1 › Ouverture');
        expect(api.cheminSequence(api.etat.noeuds.get('planif-theme'))).toBe('Thème 1');
    });

    it('compterLeconsDescendantes traverse les sous-séquences', () => {
        expect(api.compterLeconsDescendantes(api.etat.noeuds.get('planif-theme'))).toBe(1);
        expect(api.compterLeconsDescendantes(api.etat.noeuds.get('planif-sB'))).toBe(0);
    });

    it('l’étendue temporelle du thème dérive des leçons de ses sous-séquences', () => {
        expect(api.etendueTemporelleParId('planif-theme')).toEqual({ debut: 2, fin: 2 });
    });

    it('un cycle corrompu ne fait pas boucler la lecture', () => {
        poser(api, 'planif-c1', 'sequence', { titre: 'C1', parent: 'planif-c2', enfants: ['planif-c2'] });
        poser(api, 'planif-c2', 'sequence', { titre: 'C2', parent: 'planif-c1', enfants: ['planif-c1'] });
        const h = api.listerSequencesHierarchie('spatial');
        expect(h.length).toBeGreaterThan(0);
        expect(api.cheminSequence(api.etat.noeuds.get('planif-c1')).length).toBeGreaterThan(0);
    });
});

// (La Vue calendrier — genererSeancesHTML — a été RETIRÉE au lot 2 du
// planificateur en grille : ses invariants hiérarchiques vivent désormais
// dans sentinelle-grille-planificateur.test.js.)

describe('voie A · invariants statiques (les consommateurs migrés)', () => {
    it('plus aucun scan plat de séquences dans les vues listantes de la carte', () => {
        // Le motif des anciens collecteurs de vues était « séquences + leçons
        // orphelines » dans la même boucle. genererSeancesHTML, genererPlanTexte
        // et genererPlanTSV passent maintenant par la hiérarchie. Reste
        // légitime : obtenirSequencesCarte (la source de la hiérarchie), qui ne
        // collecte pas d'orphelines.
        const collecteurs = (sourceCarte.match(/if \(nd\.type === 'sequence'\) sequences\.push\(nd\);\s*\n\s*else if \(nd\.type === 'lecon'/g) || []);
        expect(collecteurs).toHaveLength(0);
        // Et la source unique existe toujours.
        expect(sourceCarte).toMatch(/function obtenirSequencesCarte\(\)/);
    });

    it('les exports de l’Organisateur passent par la hiérarchie et le chemin', () => {
        const appels = (sourceOrganisateur.match(/carte\.listerSequencesHierarchie\('temporel'\)/g) || []);
        expect(appels).toHaveLength(2); // TXT + MD
        expect(sourceOrganisateur).toMatch(/carte\.cheminSequence\(seq\)/);
    });

    it('le sommaire somme la jauge sur les RACINES seulement (pas de double-compte)', () => {
        expect(sourceCarte).toMatch(/mettreAJourJaugeTemps\(hierarchie\.filter\(function\(e\) \{ return e\.niveau === 0; \}\)/);
    });

    it('le bloc compact compte les leçons DESCENDANTES', () => {
        expect(sourceCarte).toMatch(/var nbLecons = compterLeconsDescendantes\(n\);/);
    });
});

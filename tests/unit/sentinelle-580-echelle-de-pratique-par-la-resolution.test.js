import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =====================================================================
// #580 — L'ÉCHELLE DE L'ÉVALUATION PASSE PAR LA RÉSOLUTION (11 oct. 2026)
// =====================================================================
//
// `evaluation-chargement.js` reconstruisait l'échelle d'une pratique configurable à trois
// endroits, par liste blanche {id, nom, niveaux, type} : tout autre champ (repères de maîtrise…)
// tombait en silence. Les trois passent maintenant par `obtenirEchelleResolue`
// (profil-etudiant-calculs.js), qui rend l'échelle TELLE QUELLE.
// Deux effets visibles, nommés dans la demande de relecture :
//   · une échelle de pratique SANS niveau n'est plus offerte au menu (la résolution la refuse) ;
//   · une échelle de la bibliothèque désignée par son `idOriginal` est reconnue au rendu des critères.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const NIVEAUX = [{ code: 'I', nom: 'Insuffisant' }, { code: 'M', nom: 'Maîtrisé' }];

function monter({ pratiques = [], echelles = [], grilles = [] } = {}) {
    const magasin = { t_pratiquesConfigurables: pratiques, t_echellesTemplates: echelles, t_grillesTemplates: grilles };
    const db = { getSync: (k, d) => (k in magasin ? JSON.parse(JSON.stringify(magasin[k])) : d) };
    const elements = {};
    const el = (id) => (elements[id] = elements[id] || {
        id, value: '', innerHTML: '', style: {}, dataset: {}, classList: { add() {}, remove() {}, contains: () => false },
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, replaceChildren() {}
    });
    const globaux = {
        db, cle: (k) => 't_' + k,
        document: { getElementById: el, querySelector: () => null, querySelectorAll: () => [], createElement: () => el('nouveau') },
        echapperHtml: (s) => String(s == null ? '' : s),
        getCoursActifId: () => 'C1', getPratiqueCours: () => 'PR_1',
        PratiqueManager: {}
    };
    const w = chargerScript('js/profil-etudiant-calculs.js', globaux);
    chargerScript('js/evaluation-chargement.js', Object.assign({}, globaux, { obtenirEchelleResolue: w.obtenirEchelleResolue }), w);
    w.PratiqueManager = {};   // lu par `window.PratiqueManager`
    return { w, el };
}

describe('#580 · A — le menu des échelles', () => {
    it('A.a la pratique active offre son échelle, sous son id d\'option et son nom', () => {
        const { w, el } = monter({ pratiques: [{ id: 'PR_1', config: { nom: 'Pratique fictive', echelle: { niveaux: NIVEAUX } } }] });
        w.chargerEchellePerformance();
        expect(el('selectEchelle1').innerHTML).toContain('value="pratique-PR_1"');
        expect(el('selectEchelle1').innerHTML).toContain('Pratique fictive (Pratique active) (2 niveaux)');
    });

    it('A.b une échelle de pratique sans niveau n\'est plus offerte', () => {
        const { w, el } = monter({
            pratiques: [{ id: 'PR_1', config: { nom: 'Pratique fictive', echelle: { niveaux: [] } } }],
            echelles: [{ id: 'E1', nom: 'Échelle fictive', niveaux: NIVEAUX }]
        });
        w.chargerEchellePerformance();
        expect(el('selectEchelle1').innerHTML).not.toContain('pratique-PR_1');
    });
});

describe('#580 · B — le rendu des critères', () => {
    const GRILLE = { id: 'G1', nom: 'Grille fictive', criteres: [{ id: 'c1', nom: 'Critère fictif', ponderation: 100 }] };
    it('B.a une échelle désignée par son idOriginal donne ses niveaux, pas l\'IDME par défaut', () => {
        const { w, el } = monter({ grilles: [GRILLE], echelles: [{ id: 'E_LOCALE', idOriginal: 'E_BIBLIO', nom: 'Échelle fictive', niveaux: [{ code: 'X', nom: 'Niveau témoin' }] }] });
        w.afficherCriteresDepuisGrille('G1', 'E_BIBLIO');
        expect(el('listeCriteresGrille1').innerHTML).toContain('Niveau témoin');
    });
    it('B.b l\'échelle d\'une pratique donne ses niveaux', () => {
        const { w, el } = monter({ grilles: [GRILLE], pratiques: [{ id: 'PR_1', config: { nom: 'P', echelle: { niveaux: [{ code: 'Y', nom: 'Niveau de pratique' }] } } }] });
        w.afficherCriteresDepuisGrille('G1', 'pratique-PR_1');
        expect(el('listeCriteresGrille1').innerHTML).toContain('Niveau de pratique');
    });
});

describe('#580 · C — plus aucune reconstruction par liste blanche', () => {
    const src = readFileSync(path.join(racine, 'js', 'evaluation-chargement.js'), 'utf8');
    it('C.a aucune lecture de `config.echelle` ne reste dans le fichier', () => {
        expect(src.match(/config\??\.echelle/g)).toBe(null);
    });
    it('C.b les trois sites appellent obtenirEchelleResolue', () => {
        expect((src.match(/obtenirEchelleResolue\(/g) || []).length).toBe(3);
    });
});

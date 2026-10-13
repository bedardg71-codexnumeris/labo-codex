import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { suitDansLaFonction } from './_helpers/tranche.js';

// =======================================================================
// SIMPLIFICATION DU MODULE ALIGNEMENT — 7 août 2026 (soir)
// =======================================================================
//
// Constat de Grégoire, capture à l'appui : cliquer un élément du planificateur
// remplaçait le canevas par une « vue leçon » en lecture, qui affichait le même
// objectif et les mêmes activités que la carte — mais SANS les liens, SANS le
// sélecteur de semaine, et sans possibilité d'écrire. Une redondance qui rendait
// strictement moins que ce qu'elle recouvrait.
//
// L'ablation a emporté quatre choses qui n'existaient qu'ENSEMBLE :
//   1. la vue leçon (niveau micro) ;
//   2. le filtrage du canevas par séquence active ;
//   3. la compaction des séquences en bloc résumé — le compagnon du filtrage,
//      qui rendait lisible un global qu'on ne pouvait pas focaliser ;
//   4. le bouton « Vue globale », seule sortie du mode filtré.
// Retirer (2) sans (3) aurait laissé l'enseignant devant des blocs résumés sans
// aucun moyen de les ouvrir — c'est le piège que cette sentinelle verrouille.
//
// ▣ CE QUI EST GARDÉ EN MÉMOIRE ICI, et qui vaut au-delà de ce chantier : quand
// deux mécanismes se sont appelés l'un l'autre pendant assez longtemps, retirer
// le premier ne libère pas le second — il le laisse ORPHELIN et actif. Chercher
// le compagnon fait partie de l'ablation, pas du nettoyage d'après.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const sourceIndex = readFileSync(path.join(racine, 'index.html'), 'utf8');
const sourceCss = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const sourcePrefs = readFileSync(path.join(racine, 'js', 'preferences.js'), 'utf8');


// --- Sandbox : le module monté pour de vrai -----------------------------
// ⚠ Les deux assertions centrales de ce fichier LISAIENT d'abord la source
// (« naviguerSommaireLecon appelle-t-il naviguerVers ? »). Le break-test les a
// trouvées VERTES alors que l'appel était mis en commentaire : le texte
// cherché survivait dans le commentaire lui-même. C'est la première forme de
// faux-vert du 7 août, rencontrée une fois de plus. Elles sont donc réécrites
// en tests de COMPORTEMENT : on monte le module et on regarde ce que le clic
// fait réellement à la sélection.
let store;
let elements;

function monterModule() {
    store = {};
    elements = {
        'planif-sommaire': { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] }
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: (id) => elements[id] || null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, { titre = type, x = 0, y = 0, parent = null, enfants = [], metadata = {} } = {}) {
    api.etat.noeuds.set(id, { id, type, titre, x, y, parent, enfants, metadata, cloneSourceId: null });
}

describe('ablation · la vue leçon (niveau micro) a disparu en entier', () => {
    it('ni la fonction de rendu, ni son état, ni son point de montage', () => {
        expect(sourceCarte).not.toContain('rendreVueLecon');
        expect(sourceCarte).not.toContain('function ouvrirLecon');
        expect(sourceCarte).not.toContain('leconActiveId');
        expect(sourceIndex).not.toContain('planif-vue-lecon');
    });

    it('aucune règle CSS orpheline ne reste derrière elle', () => {
        expect(sourceCss).not.toContain('planif-vue-lecon');
    });

    it('le canevas n’est plus jamais masqué au profit d’autre chose', () => {
        // La vue micro vivait d'une bascule `display` sur la zone de travail.
        // Plus personne ne doit escamoter le canevas : c'est la seule surface
        // d'édition, elle est toujours là.
        expect(sourceCarte).not.toMatch(/zoneTravail\.style\.display\s*=\s*'none'/);
    });
});

describe('ablation · le canevas ne se filtre plus, et ne se compacte plus', () => {
    it('l’état de vue « séquence active » n’existe plus', () => {
        // Le commentaire d'explication a le droit de nommer la variable ; c'est
        // le CODE qui ne doit plus la porter. On vise donc une occurrence hors
        // commentaire, pas la chaîne brute.
        const codeSeul = sourceCarte
            .split('\n')
            .filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*'))
            .join('\n');
        expect(codeSeul).not.toContain('sequenceActiveId');
    });

    it('le compagnon est parti avec lui — plus de bloc compact', () => {
        expect(sourceCarte).not.toContain('planif-seq-compact');
        expect(sourceCarte).not.toContain('estCompact');
        expect(sourceCss).not.toContain('planif-seq-compact');
    });

    it('reconstruireDOM ne saute plus AUCUN nœud ni AUCUN lien', () => {
        // Le cœur de la décision : tout ce qui est dans la carte est rendu.
        // Ces trois gardes étaient les seuls chemins d'escamotage.
        expect(sourceCarte).not.toMatch(/if \(visibles && /);
        expect(sourceCarte).not.toMatch(/if \(masques && /);
        // Et le collecteur de descendants qui les alimentait est mort avec eux.
        expect(sourceCarte).not.toContain('_collecterDescendants');
    });

    it('le bouton « Vue globale » est retiré, faute de vue à quitter', () => {
        expect(sourceCarte).not.toContain('planif-som-globale');
        expect(sourceCarte).not.toContain('Vue globale</span>');
        expect(sourceCarte).not.toContain('planificationCarte.ouvrirSequence');
    });
});

describe('ablation · le planificateur navigue, il ne redouble plus la carte', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('désigner une leçon la SÉLECTIONNE pour de bon', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1'] });
        api.etat.selection = null;

        api.naviguerSommaireLecon('planif-l1');

        expect(api.etat.selection).toBe('planif-l1');
    });

    it('désigner une séquence remplace la sélection précédente — y compris MULTIPLE', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-l2', 'lecon', { titre: 'Diagnostic', parent: 'planif-s1', metadata: { semaine: 2 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1', 'planif-l2'] });

        // ⚠ Le break-test a montré qu'assertion sur `etat.selection` seule NE
        // COUVRE PAS `deselectionnerTout()` : `selectionnerNoeud` réécrit ce
        // champ de toute façon. Retirer la désélection laissait le test vert
        // alors qu'une multi-sélection antérieure SURVIVAIT au nouveau clic —
        // l'enseignant aurait gardé deux blocs surlignés sans le savoir. C'est
        // la deuxième forme de faux-vert du 7 août : couvrir le geste sans
        // couvrir ce que le geste EMPORTE. D'où l'assertion sur multiSelection.
        api.etat.multiSelection.add('planif-l1');
        api.etat.multiSelection.add('planif-l2');
        api.naviguerSommaireLecon('planif-l1');
        expect(api.etat.selection).toBe('planif-l1');

        api.etat.multiSelection.add('planif-l2');
        api.cadrerSurSequence('planif-s1');

        expect(api.etat.selection).toBe('planif-s1');
        expect(api.etat.multiSelection.size).toBe(0);
    });

    it('une séquence inconnue ne sélectionne rien (la garde d’entrée porte)', () => {
        // `naviguerVers` se garde lui-même ; `cadrerSurSequence`, non — il
        // appelle `selectionnerNoeud` directement. Sa garde d'entrée est donc
        // porteuse, et le break-test le confirme.
        api.etat.selection = null;
        api.cadrerSurSequence('planif-inexistant');
        expect(api.etat.selection).toBeNull();
    });

    it('une leçon inconnue ne sélectionne rien non plus', () => {
        api.etat.selection = null;
        api.naviguerSommaireLecon('planif-inexistant');
        expect(api.etat.selection).toBeNull();
    });

    it('le cadrage d’une séquence vise son ÉTENDUE, pas son seul bloc', () => {
        // Celle-ci reste une lecture de source — il n'y a pas de géométrie
        // observable dans le bac à sable. Elle est ancrée sur l'APPEL et non
        // sur le nom de la fonction, et le break-test la fait bien rougir.
        expect(sourceCarte).toMatch(
            /function cadrerSurSequence\(seqId\) \{[\s\S]{0,300}centrerVueSurSequence\(seqId\);/
        );
    });

    it('« actif » suit la SÉLECTION du canevas — une seule notion partagée', () => {
        // Le planificateur ne tient plus d'état de vue qui lui soit propre :
        // ce qui est actif dans la grille est ce qui est sélectionné sur la
        // carte, donc ce qu'édite l'Inspecteur.
        expect(sourceCarte).toMatch(/planif-som-seq' \+ \(seq\.id === etat\.selection/);
        expect(sourceCarte).toMatch(/planif-som-lecon' \+ \(lec\.id === etat\.selection/);
    });

    it('recentrer n’a plus de contexte à distinguer', () => {
        expect(sourceCarte).toMatch(
            /function recentrerVue\(\) \{\s*centrerVueSurContenu\(\);\s*\}/
        );
    });
});

describe('affichage des palettes · un seul mécanisme, commandé par la barre d’outils', () => {
    it('les deux palettes ont leur bouton, et les deux préférences existent', () => {
        expect(sourceIndex).toContain('id="planif-btn-palette-noeuds"');
        expect(sourceIndex).toContain('id="planif-btn-palette-planificateur"');
        expect(sourcePrefs).toContain('planifPaletteNoeudsVisible: true');
        expect(sourcePrefs).toContain('planifPalettePlanificateurVisible: true');
    });

    it('la symétrie vient de la TABLE, pas d’une discipline de copie', () => {
        // Deux blocs jumeaux auraient divergé au premier correctif porté sur un
        // seul des deux. Le registre garantit que les palettes se comportent
        // identiquement parce qu'elles traversent le même code.
        expect(suitDansLaFonction(sourceCarte, /var PALETTES_FLOTTANTES = \{/, /noeuds:/, /planificateur:/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
        expect(sourceCarte).toMatch(/Object\.keys\(PALETTES_FLOTTANTES\)\.forEach/);
    });

    it('masquer retire la palette du flux — ni clic, ni tabulation', () => {
        // Une opacité à 0 laisserait une palette invisible capter les clics du
        // canevas et rester atteignable au Tab : le pire des deux mondes.
        expect(sourceCss).toMatch(
            /\.planif-palette-flottante\.planif-palette-masquee \{ display: none; \}/
        );
    });

    it('l’état survit au rechargement et se relit au boot', () => {
        expect(sourceCarte).toMatch(/obtenirPreference\(def\.pref\) !== false/);
        expect(sourceCarte).toMatch(/definirPreference\(def\.pref, vers\)/);
        expect(sourceCarte).toContain('appliquerAffichagePalettes();');
    });

    it('aria-pressed décrit l’état, le title annonce l’effet du clic', () => {
        // Sans cette distinction, un bouton d'état ment à la moitié de ses
        // lecteurs : soit au lecteur d'écran, soit à l'infobulle.
        expect(sourceCarte).toMatch(/setAttribute\('aria-pressed', visible \? 'true' : 'false'\)/);
        expect(sourceCarte).toMatch(/btn\.title = visible \? 'Masquer la palette/);
    });
});

describe('données · ce que la vue supprimée avait avalé est récupéré', () => {
    // Le champ « Objectif » de la vue leçon LISAIT `metadata.objectifs` (la
    // liste vivante) et RÉÉCRIVAIT `metadata.objectif` (la chaîne, format mort
    // depuis la migration). La migration sautant toute leçon déjà pourvue d'une
    // liste, ce qui y était saisi n'a plus jamais été relu. Supprimer le champ
    // sans récupérer d'abord aurait figé la perte.
    it('le sauvetage s’exécute AVANT le saut qui l’aurait rendu inatteignable', () => {
        const iSauvetage = sourceCarte.indexOf("&& typeof n.metadata.objectif === 'string'");
        const iSaut = sourceCarte.indexOf('if (n.metadata && Array.isArray(n.metadata.objectifs)) {')
        // #158 (10 août 2026) : le saut « déjà au format liste » n'est plus un
        // continue sec — il stampe d'abord les ids manquants. La sonde suit
        // l'OUVERTURE de la branche ; l'invariant d'ordre (sauvetage AVANT le
        // saut) reste vérifié à l'identique.;
        expect(iSauvetage).toBeGreaterThan(-1);
        expect(iSaut).toBeGreaterThan(-1);
        expect(iSauvetage).toBeLessThan(iSaut);
    });

    it('il redécoupe le bloc et écarte les doublons', () => {
        // Le champ rendait TOUS les objectifs dans une seule zone éditable et
        // réécrivait l'ensemble : recopier la chaîne telle quelle aurait
        // dupliqué chaque objectif déjà présent.
        expect(sourceCarte).toMatch(/n\.metadata\.objectif\.split\('\\n'\)/);
        expect(sourceCarte).toContain('!connus[t]');
    });

    it('le champ mort est purgé une fois vidé', () => {
        expect(suitDansLaFonction(sourceCarte, /recuperes\.forEach/, /delete n\.metadata\.objectif;/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });
});

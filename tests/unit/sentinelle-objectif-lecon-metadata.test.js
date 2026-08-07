import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// F1 (exercice d'alignement 601-101, 6 août 2026) — L'objectif de leçon était
// introuvable : il vivait dans `planification_seances` (clé NUE partagée entre
// tous les trimestres ET la démo, dictionnaire PLAT par id de leçon alors que
// ces ids ne sont uniques que PAR CARTE — #367 / rouge D1 de l'audit du 5 août),
// et n'était visible que dans une vue qui MASQUE la carte. Le badge 🎯 qui
// aurait pu le signaler n'apparaissait QUE si un objectif existait déjà : pour
// découvrir la fonction, il fallait s'en être déjà servi.
//
// Correctif : l'objectif vit désormais sur le nœud (`metadata.objectif`), donc
// dans `planification_mindmap` — clé propre du module, namespacée par trimestre,
// qui suit les clones, copies et imports inter-trimestre.
//
// Cette sentinelle verrouille :
//   A. le comportement de la migration (fonctionnel, sur la VRAIE fonction) ;
//   B. les invariants de rendu et de routage (source, couplage DOM assumé).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

// --- Sandbox ------------------------------------------------------------
let store;
let cartesSauvees;
let indexCourant;

function monterModule({ index = { active: 'carte_1' }, sauvegardeLance = false } = {}) {
    store = {};
    cartesSauvees = [];
    indexCourant = index;

    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };

    const planificationDonnees = {
        getIndex: () => indexCourant,
        sauvegarderCarte: (id, donnees) => {
            if (sauvegardeLance) throw new Error('échec de persistance simulé');
            cartesSauvees.push({ id, donnees });
        },
        chargerCarte: () => null
    };

    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        // Globaux du projet dont le rendu a besoin : definirObjectifsLecon
        // re-rend, donc traverse reconstruireDOM().
        echapperHtml: (t) => String(t === null || t === undefined ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
        requestAnimationFrame: (fn) => { fn(); return 0; }
    });
    // Le module namespace ses clés via `window.cle(...)` : le sandbox doit le
    // porter sur le faux window, pas seulement comme global.
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = planificationDonnees;
    return win.planificationCarte;
}

function poserLecon(api, id, metadata = {}) {
    api.etat.noeuds.set(id, { id, type: 'lecon', titre: 'Leçon', metadata, enfants: [], parent: null });
}

// =======================================================================
// A. MIGRATION — comportement réel
// =======================================================================
describe('F1 · migration des objectifs vers metadata.objectif', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('bascule un objectif de l’ancienne clé vers le nœud, en LISTE', () => {
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'carte_1::planif-n1': { objectifPersonnalise: 'Repérer les marqueurs de relation' }
        };

        const migres = api.migrerObjectifsVersMetadata();

        expect(migres).toBe(1);
        const objs = api.etat.noeuds.get('planif-n1').metadata.objectifs;
        expect(objs).toHaveLength(1);
        expect(objs[0].texte).toBe('Repérer les marqueurs de relation');
        // Porteur d'un id : c'est ce qui rendra les liens possibles sans migration.
        expect(objs[0].id).toBeTruthy();
    });

    it('bascule aussi le format intermédiaire (chaîne unique metadata.objectif)', () => {
        poserLecon(api, 'planif-n1', { objectif: 'Analyser un texte littéraire' });

        expect(api.migrerObjectifsVersMetadata()).toBe(1);

        const meta = api.etat.noeuds.get('planif-n1').metadata;
        expect(meta.objectifs).toHaveLength(1);
        expect(meta.objectifs[0].texte).toBe('Analyser un texte littéraire');
        // Zéro-dette : l'ancien champ ne survit pas à la migration.
        expect(meta.objectif).toBeUndefined();
    });

    it('retire l’ancienne source après migration (une seule vérité)', () => {
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'carte_1::planif-n1': { objectifPersonnalise: 'Objectif A', notes: 'garder ces notes' }
        };

        api.migrerObjectifsVersMetadata();

        const seances = store['a2026_planification_seances'];
        expect(seances['carte_1::planif-n1'].objectifPersonnalise).toBeUndefined();
        // Les notes NE sont PAS touchées : seul l'objectif migre vers le nœud.
        // ⮕ Clé COMPOSITE depuis #367 (7 août 2026) : `<carteId>::<leconId>`.
        // Le dictionnaire plat aliassait les notes entre cartes d'un même
        // trimestre, les ids de leçon n'étant uniques que par carte.
        expect(seances['carte_1::planif-n1'].notes).toBe('garder ces notes');
    });

    it('est idempotente : ne réécrit pas des objectifs déjà portés par le nœud', () => {
        poserLecon(api, 'planif-n1', { objectifs: [{ id: 'obj_x', texte: 'Objectif déjà migré' }] });
        store['a2026_planification_seances'] = {
            'carte_1::planif-n1': { objectifPersonnalise: 'Vieille valeur' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        const objs = api.etat.noeuds.get('planif-n1').metadata.objectifs;
        expect(objs).toHaveLength(1);
        expect(objs[0].texte).toBe('Objectif déjà migré');
        expect(objs[0].id).toBe('obj_x');
    });

    it('ignore les objectifs vides et les nœuds qui ne sont pas des leçons', () => {
        poserLecon(api, 'planif-vide');
        api.etat.noeuds.set('planif-act', {
            id: 'planif-act', type: 'activite', metadata: {}, enfants: [], parent: null
        });
        store['a2026_planification_seances'] = {
            'planif-vide': { objectifPersonnalise: '   ' },
            'planif-act': { objectifPersonnalise: 'ne devrait pas migrer' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        expect(api.etat.noeuds.get('planif-vide').metadata.objectifs).toBeUndefined();
        expect(api.etat.noeuds.get('planif-act').metadata.objectifs).toBeUndefined();
    });

    it('ne purge JAMAIS l’ancienne source si la sauvegarde échoue', () => {
        api = monterModule({ sauvegardeLance: true });
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'carte_1::planif-n1': { objectifPersonnalise: 'Objectif à ne pas perdre' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        expect(store['a2026_planification_seances']['carte_1::planif-n1'].objectifPersonnalise)
            .toBe('Objectif à ne pas perdre');
    });

    it('ne migre rien s’il n’y a pas de carte active (sauvegarder() serait un no-op silencieux)', () => {
        api = monterModule({ index: null });
        poserLecon(api, 'planif-n1');
        store['a2026_planification_seances'] = {
            'carte_1::planif-n1': { objectifPersonnalise: 'Objectif à ne pas perdre' }
        };

        expect(api.migrerObjectifsVersMetadata()).toBe(0);
        // La garde protège contre la perte sèche : rien muté, rien purgé.
        expect(api.etat.noeuds.get('planif-n1').metadata.objectifs).toBeUndefined();
        expect(store['a2026_planification_seances']['carte_1::planif-n1'].objectifPersonnalise)
            .toBe('Objectif à ne pas perdre');
    });
});

// =======================================================================
// B. LECTURE — l'objectif se lit sur le nœud
// =======================================================================
describe('F1 · lecture des objectifs sur le nœud', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    const troisObjectifs = {
        metadata: { objectifs: [
            { id: 'o1', texte: 'Appliquer des techniques d’annotation' },
            { id: 'o2', texte: 'Identifier des émotions et des thèmes' },
            { id: 'o3', texte: 'Formuler une hypothèse' }
        ] }
    };

    it('rend la liste complète des objectifs', () => {
        expect(api.objectifsDeLecon(troisObjectifs)).toHaveLength(3);
    });

    it('rend toujours un tableau, jamais undefined', () => {
        expect(api.objectifsDeLecon({ metadata: {} })).toEqual([]);
        expect(api.objectifsDeLecon({})).toEqual([]);
        expect(api.objectifsDeLecon(null)).toEqual([]);
    });

    it('ignore les entrées malformées plutôt que de les laisser casser le rendu', () => {
        const abime = { metadata: { objectifs: [{ id: 'o1', texte: 'Valide' }, null, { id: 'o2' }] } };
        expect(api.objectifsDeLecon(abime)).toHaveLength(1);
    });

    it('objectifDeLecon rend le PREMIER objectif (repli une-ligne)', () => {
        expect(api.objectifDeLecon(troisObjectifs)).toBe('Appliquer des techniques d’annotation');
        expect(api.objectifDeLecon({ metadata: {} })).toBe('');
    });
});

// On teste `appliquerObjectifs` (mutation + persistance) plutôt que la porte
// publique `definirObjectifsLecon`, qui enchaîne un re-rendu : la logique
// métier est dans la première, le DOM n'ajoute rien à vérifier ici. Le fait que
// la frappe ne re-rende PAS est verrouillé au bloc C.
describe('F1 · écriture des objectifs (pluriel)', () => {
    let api, lecon;
    const definir = (textes) => api.appliquerObjectifs(lecon, textes);
    beforeEach(() => {
        api = monterModule();
        poserLecon(api, 'planif-n1');
        lecon = api.etat.noeuds.get('planif-n1');
    });

    it('enregistre plusieurs objectifs d’un coup', () => {
        definir(['Appliquer', 'Identifier', 'Formuler']);
        expect(api.etat.noeuds.get('planif-n1').metadata.objectifs).toHaveLength(3);
    });

    it('écarte les lignes vides sans décaler les autres', () => {
        definir(['Premier', '   ', 'Second', '']);
        const objs = api.etat.noeuds.get('planif-n1').metadata.objectifs;
        expect(objs.map(o => o.texte)).toEqual(['Premier', 'Second']);
    });

    it('CONSERVE l’id d’un objectif dont on corrige la formulation', () => {
        // Décisif : un lien qui vise cet objectif doit survivre à une retouche.
        definir(['Formulation initiale', 'Deuxième']);
        const avant = api.etat.noeuds.get('planif-n1').metadata.objectifs.map(o => o.id);

        definir(['Formulation corrigée', 'Deuxième']);
        const apres = api.etat.noeuds.get('planif-n1').metadata.objectifs.map(o => o.id);

        expect(apres).toEqual(avant);
    });

    it('donne des identifiants distincts à chaque objectif', () => {
        definir(['A', 'B', 'C']);
        const ids = api.etat.noeuds.get('planif-n1').metadata.objectifs.map(o => o.id);
        expect(new Set(ids).size).toBe(3);
    });

    it('vider la liste retire la métadonnée au lieu de laisser un tableau vide', () => {
        definir(['A']);
        definir([]);
        expect(api.etat.noeuds.get('planif-n1').metadata.objectifs).toBeUndefined();
    });
});

// =======================================================================
// C. RENDU ET ROUTAGE — invariants de source (couplage DOM assumé)
// =======================================================================
describe('F1 · invariants de rendu et de routage', () => {
    it('le badge 🎯 est rendu pour TOUTE leçon, pas seulement celles qui ont un objectif', () => {
        // Cause racine de F1 : l'ancien badge était conditionné à la présence
        // d'un objectif, donc la fonction ne se découvrait jamais.
        expect(source).toMatch(/estLecon\s*\n?\s*\?\s*'<span class="planif-badge-objectif'/);
        expect(source).toContain('planif-badge-objectif--vide');
    });

    it('ne réintroduit pas l’ancien badge conditionné aux données de séances', () => {
        expect(source).not.toMatch(/_seancesDOM\[n\.id\]\.objectifPersonnalise/);
        expect(source).not.toContain('var _seancesDOM');
    });

    it('la vue leçon route le champ « objectif » vers le nœud, pas vers CLE_SEANCES', () => {
        // Réaligné le 6 août après le retrait des notes : l'objectif étant
        // devenu le SEUL champ de cette vue, la garde a changé de forme
        // (aiguillage sur `champ` → garde d'entrée). L'invariant vérifié est
        // le même : la saisie atterrit sur le nœud, jamais dans CLE_SEANCES.
        expect(source).toMatch(/data-champ="objectif"/);
        expect(source).toMatch(/dataset\.champ !== 'objectif'\) return;[\s\S]{0,220}noeud\.metadata\.objectif = /);
        // L'ancien champ ne doit plus être écrit par la vue leçon.
        expect(source).not.toMatch(/data-champ="objectifPersonnalise"/);
    });

    it('la saisie au fil de la frappe ne reconstruit PAS le DOM', () => {
        // Reconstruire à chaque caractère ferait perdre le focus : l'écriture
        // passe par appliquerObjectifs (mutation seule), pas par la porte
        // publique qui re-rend.
        expect(source).toMatch(/ligne\.addEventListener\('input'[\s\S]{0,120}appliquerObjectifs/);
    });

    it('l’en-tête porte le TYPE, et le titre est décalé SOUS les objectifs', () => {
        // Ordre imposé : type → objectifs → titre → contenu.
        expect(source).toMatch(/planif-noeud-entete[\s\S]{0,900}htmlObjectifs \+\s*\n\s*'<div class="planif-noeud-titre"/);
    });

    it('chaque objectif porte ses commandes + et − (les raccourcis ne se voient pas)', () => {
        expect(source).toContain('planif-obj-ajouter');
        expect(source).toContain('planif-obj-retirer');
        // Atteignables au clavier, pas seulement à la souris.
        expect(source).toMatch(/planif-obj-ajouter[\s\S]{0,200}role="button" tabindex="0" aria-label=/);
        expect(source).toMatch(/planif-obj-retirer[\s\S]{0,200}role="button" tabindex="0" aria-label=/);
    });

    it('les boutons n’enclenchent pas le déplacement du bloc', () => {
        expect(source).toMatch(/btn\.addEventListener\('mousedown'[\s\S]{0,160}stopPropagation/);
    });

    it('la ligne d’accueil porte AUSSI ses commandes + et −', () => {
        // Constaté en terrain le 6 août : la ligne qu'on venait d'ajouter était
        // la seule sans boutons — elle est rendue par une branche distincte.
        const brancheAccueil = source.slice(
            source.indexOf('if (io_ === rangAccueil)'),
            source.indexOf('if (io_ === objs.length) break;')
        );
        expect(brancheAccueil).toContain('data-accueil="1"');
        expect(brancheAccueil).toContain('planif-obj-ajouter');
        expect(brancheAccueil).toContain('planif-obj-retirer');
    });

    it('« + » convertit l’index de ligne en index d’objectif', () => {
        // Les boutons portent un rang de LIGNE (accueil vide compris), alors
        // que l'état d'accueil s'exprime en index d'OBJECTIF : sans conversion,
        // un ajout au milieu d'une liste comportant déjà une ligne d'accueil
        // ouvrirait la nouvelle ligne au mauvais endroit.
        expect(source).toMatch(/var rangObjectif = textes\.slice\(0, rang \+ 1\)\.filter/);
        expect(source).toMatch(/_ajoutObjectif = \{ noeudId: id, rang: rangObjectif \}/);
    });

    it('« + » ouvre une ligne d’accueil au lieu de persister un objectif vide', () => {
        // appliquerObjectifs écarte les lignes vides : un objectif vide ne
        // survivrait pas à l'enregistrement. L'état transitoire évite ça.
        // Assertion ancrée sur LE chemin du bouton : la même affectation existe
        // aussi dans le raccourci Entrée, et une assertion globale passerait
        // même si le bouton cessait de la poser (constaté au break-test).
        expect(source).toMatch(
            /classList\.contains\('planif-obj-ajouter'\)[\s\S]{0,500}_ajoutObjectif = \{ noeudId: id, rang: rangObjectif \}/
        );
        expect(source).toContain('data-accueil');
        // Le rendu doit savoir ouvrir cette ligne au bon rang.
        expect(source).toMatch(/rangAccueil[\s\S]{0,600}data-accueil="1"/);
    });

    it('l’état d’accueil est nettoyé au repli et au changement de carte', () => {
        expect(source).toMatch(/objectifDeplie;\s*\n\s*_ajoutObjectif = null;/);
        expect(source).toMatch(/function chargerCarte[\s\S]{0,160}_ajoutObjectif = null;/);
    });

    it('la hauteur d’en-tête est MESURÉE, plus jamais figée à une constante', () => {
        // LAYOUT_HEADER_H (45 px) n'était juste que pour un en-tête d'une ligne.
        // Avec les objectifs dépliables et les titres sur deux lignes, une
        // hauteur figée faisait chevaucher les activités sur le titre.
        expect(source).toContain('function hauteurEnteteConteneur');
        // Plus AUCUNE affectation directe de la constante à un HEADER_H local.
        expect(source).not.toMatch(/var HEADER_H = LAYOUT_HEADER_H;/);
        // Les trois fonctions de disposition mesurent.
        const appels = source.match(/hauteurEnteteConteneur\(/g) || [];
        expect(appels.length).toBeGreaterThanOrEqual(4); // 1 déclaration + 3 usages
    });

    it('la mesure prend le BAS du dernier élément d’en-tête', () => {
        expect(source).toMatch(/offsetTop \+ e\.offsetHeight \+ LAYOUT_RESPIRATION/);
        // Ordre du DOM : entête → objectifs → titre ; le titre borne le bas.
        expect(source).toMatch(
            /reperes = \['\.planif-noeud-titre', '\.planif-noeud-objectifs', '\.planif-noeud-entete'\]/
        );
    });

    it('la frappe redispose le conteneur (titre ET objectifs), throttlée en rAF', () => {
        expect(source).toMatch(/titreEl\.addEventListener\('input', throttleRAF[\s\S]{0,400}reLayoutConteneur\(id\)/);
        expect(source).toMatch(/ligne\.addEventListener\('input', throttleRAF[\s\S]{0,1100}reLayoutConteneur\(id\)/);
    });

    it('le badge n’enclenche pas le déplacement du bloc', () => {
        // Le mousedown du bloc démarre le drag : le badge doit l'intercepter.
        expect(source).toMatch(/badgeObjectif\.addEventListener\('mousedown'[\s\S]{0,120}stopPropagation/);
    });
});

// =======================================================================
// D. L'ORGANISATEUR SUIT LA MÊME SOURCE
// =======================================================================
// Régression attrapée le 6 août, APRÈS le premier commit de F1 : la bascule
// avait laissé 8 sites d'organisateur.js sur l'ancienne clé. Comme la migration
// purge cette clé, l'Organisateur (« Plan de la leçon ») aurait affiché des
// objectifs vides et réécrit dans une clé que plus personne ne lit — deux
// vérités divergentes, exactement ce que la bascule visait à supprimer.
describe('F1 · l’Organisateur lit et écrit le même objectif que la carte', () => {
    const organisateur = readFileSync(path.join(racineProjet, 'js', 'organisateur.js'), 'utf8');

    it('aucun site d’organisateur.js ne touche plus objectifPersonnalise', () => {
        expect(organisateur).not.toContain('objectifPersonnalise');
    });

    it('la saisie et la réinitialisation passent par definirObjectifsLecon', () => {
        const appels = organisateur.match(/definirObjectifsLecon\(/g) || [];
        expect(appels.length).toBeGreaterThanOrEqual(2);
    });

    it('l’affichage et les deux exports lisent objectifDeLeconParId', () => {
        const lectures = organisateur.match(/objectifDeLeconParId\(/g) || [];
        expect(lectures.length).toBeGreaterThanOrEqual(3);
    });

    it('l’import Markdown pose l’objectif sur le nœud construit', () => {
        expect(organisateur).toMatch(/leconNoeud\.metadata\.objectif = lecon\.objectif/);
        expect(organisateur).toMatch(/orpNoeud\.metadata\.objectif = orp\.objectif/);
    });

    it('la carte expose bien les deux portes utilisées par l’Organisateur', () => {
        expect(source).toMatch(/objectifDeLeconParId: objectifDeLeconParId/);
        expect(source).toMatch(/definirObjectifsLecon: definirObjectifsLecon/);
    });
});

// =======================================================================
// E. RETRAIT DES NOTES DE LEÇON (décision Grégoire, 6 août)
// =======================================================================
// Le champ « Notes » de la vue leçon n'avait pas de fonction à ce stade. Il
// n'était PAS inerte pour autant : il participait au cycle export/import
// Markdown de l'Organisateur. Retiré des trois endroits d'un coup — sinon
// l'import aurait continué de peupler une clé que plus rien n'affiche.
describe('F1 · les notes de leçon sont retirées partout', () => {
    const organisateur = readFileSync(path.join(racineProjet, 'js', 'organisateur.js'), 'utf8');
    const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');

    it('la vue leçon n’a plus de champ Notes', () => {
        expect(source).not.toContain('planif-vue-lecon-notes');
        expect(source).not.toMatch(/data-champ="notes"/);
    });

    it('l’export Markdown n’écrit plus de section Notes', () => {
        expect(organisateur).not.toMatch(/\*\*Notes\*\* : /);
    });

    it('le parseur Markdown ne reconnaît plus le marqueur Notes', () => {
        expect(organisateur).not.toMatch(/matchNotes/);
    });

    it('le CSS des notes est retiré (pas de règle orpheline)', () => {
        expect(css).not.toContain('planif-vue-lecon-notes');
    });

    it('l’import n’ouvre plus d’aller-retour inutile sur la clé des séances', () => {
        // Après le retrait, plus aucune écriture n'avait lieu entre le
        // chargerSeances() et le sauvegarderSeances() de l'import.
        expect(organisateur).not.toContain('seancesImport');
    });

    it('les étapes de l’enseignement explicite ont quitté l’organisateur — par DÉCISION', () => {
        // Historique inversé le 7 août 2026. Ce cas protégeait `org-ee-notes`
        // contre un retrait ACCIDENTEL pendant l'ablation des notes de leçon
        // (1.33.0). Depuis, Grégoire a décidé de faire des étapes EE des NŒUDS
        // de la carte (frères d'Activité) et de retirer l'UI du plan —
        // suppression franche actée. Le garde-fou change donc de sens : toute
        // RÉAPPARITION serait une régression. La contrepartie positive vit
        // dans `sentinelle-enseignement-explicite.test.js`.
        expect(organisateur).not.toContain('org-ee-notes');
    });
});

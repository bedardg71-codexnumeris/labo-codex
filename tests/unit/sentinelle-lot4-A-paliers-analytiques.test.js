/**
 * Sentinelle — LES PALIERS D'UNE GRILLE ANALYTIQUE (consigne du 4 septembre 2026, lot 4, volet A).
 *
 * Retour de Grégoire : « quand on a une grille analytique et qu'on veut produire une cartouche,
 * nous n'avons pas le choix de créer une échelle, alors que la grille analytique fonctionne
 * uniquement avec des points. » Sa décision, la voie (a) : l'échelle reste le mécanisme des
 * paliers (lot 3 : le chiffre trouve son niveau par les bornes, le niveau ouvre la cartouche) ;
 * pour une grille analytique elle se présente comme des PALIERS en % — le champ le dit, l'échelle
 * de départ est préremplie, l'éditeur titre ses colonnes par les bornes.
 *
 *   A — quelle grille est analytique : déclarée, ou déduite ; MIXTE ne l'est pas ;
 *   B — le champ du formulaire : « Paliers (bornes en %) » pour une grille analytique, « Échelle
 *       (niveaux) » sinon, sur les deux chemins (peuplement et changement de grille) ;
 *   C — le préremplissage : l'échelle de départ si elle est dans la base, sinon rien ;
 *   D — l'éditeur : les colonnes par les bornes, lues sur l'échelle SOURCE ; la copie que porte
 *       la cartouche (code, nom) et la clé `critereId_niveau` ne changent pas ;
 *   E — ce qui ne bouge pas : une grille holistique ou mixte garde ses niveaux ; le champ garde
 *       sa marque « obligatoire ».
 *
 * ⚠ Ce banc EXÉCUTE cartouches.js avec grilles.js dans le même bac à sable (une seule source
 * pour le type d'une grille : `typeGrilleAffiche`).
 * ⚠ [EN ATTENTE] Les mots (« Paliers (bornes en %) », « 0–64,99 % ») sont PROPOSÉS à Grégoire ;
 * ils vivent dans `LIBELLES_PALIERS` et `libellePalier`, et ce banc les lit là.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

/* ------------------------------------------------------------------ harnais */

function elementFictif(valeur = '') {
    return {
        value: valeur, innerHTML: '', textContent: '', checked: false, disabled: false,
        style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false },
        querySelectorAll: () => [], querySelector: () => null,
        appendChild() {}, addEventListener() {}, focus() {}, closest: () => null
    };
}

const DEPART = { id: 'ECHELLE_IDME_DEPART', nom: 'Échelle de départ (IDME)', dansBibliotheque: true, niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64.99, couleur: '#c00' },
    { code: 'D', nom: 'En développement', min: 65, max: 74.99, couleur: '#e80' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84.99, couleur: '#0a0' },
    { code: 'E', nom: 'Étendu', min: 85, max: 100, couleur: '#06c' }
] };
const AUTRE = { id: 'ECH_2', nom: 'Seconde', dansBibliotheque: true, niveaux: [{ code: 'P', nom: 'Piètre', min: 0, max: 59 }, { code: 'R', nom: 'Remarqué', min: 60, max: 100 }] };
const G_ANA = { id: 'G_ANA', nom: 'Analyse littéraire', type: 'analytique', dansBibliotheque: true,
    criteres: [{ id: 'C1', nom: 'Langue', type: 'analytique', ponderation: 30 }, { id: 'C2', nom: 'Structure', type: 'analytique', ponderation: 70 }] };
const G_DEDUITE = { id: 'G_DED', nom: 'Déduite', dansBibliotheque: true,
    criteres: [{ id: 'C1', nom: 'Langue', type: 'analytique', ponderation: 100 }] };
const G_HOLI = { id: 'G_HOLI', nom: 'Holistique', type: 'holistique', dansBibliotheque: true,
    criteres: [{ id: 'C1', nom: 'Contenu', type: 'holistique', ponderation: 100 }] };
const G_MIXTE = { id: 'G_MIXTE', nom: 'Mixte de fait', dansBibliotheque: true,
    criteres: [{ id: 'C1', nom: 'Contenu', type: 'holistique', ponderation: 70 }, { id: 'C2', nom: 'Langue', type: 'analytique', ponderation: 30 }] };

function monter({ echelles = [DEPART, AUTRE], grilles = [G_ANA, G_DEDUITE, G_HOLI, G_MIXTE] } = {}) {
    const store = {
        'a2026_echellesTemplates': JSON.parse(JSON.stringify(echelles)),
        'a2026_grillesTemplates': JSON.parse(JSON.stringify(grilles)),
        'a2026_productions': []
    };
    const els = {};
    const doc = {
        getElementById: (id) => (els[id] || (els[id] = elementFictif())),
        querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
        createElement: () => elementFictif(), body: { appendChild() {}, removeChild() {} }
    };
    const db = {
        get: async (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            const valeur = (k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
            const resultat = await mutateur(valeur);
            if (resultat === undefined) return undefined;
            store[k] = resultat; return resultat;
        }
    };
    const globaux = {
        db, document: doc, cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, warning() {}, avertissement() {} },
        genererIdUnique: (p) => p + 'x', obtenirIdentiteCCUtilisateur: () => 'Testeur',
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        // Déclarées dans js/config.js en production, avant ces deux modules.
        grilleTemplateActuelle: null, cartoucheActuel: null
    };
    // grilles.js d'abord : `typeGrilleAffiche` est la source unique du type d'une grille.
    const win = chargerScript('js/grilles.js', globaux);
    win.estRessourceSupprimee = () => false; win.IDS_GABARITS_HARDCODES = [];
    win.boutonRetirerBloc = () => ''; win.boutonsReordonnerBloc = () => '';
    chargerScript('js/cartouches.js', globaux, win);
    return { win, els, store, el: (id) => doc.getElementById(id) };
}

/* ------------------------------------------------- A — quelle grille est analytique */

describe('lot 4 · A.A — quelle grille parle de paliers', () => {
    it('A.a déclarée ou déduite : analytique ; mixte, holistique, absente : non', () => {
        const { win } = monter();
        expect(win.grilleEstAnalytique(G_ANA)).toBe(true);
        expect(win.grilleEstAnalytique(G_DEDUITE)).toBe(true);
        expect(win.grilleEstAnalytique(G_HOLI)).toBe(false);
        expect(win.grilleEstAnalytique(G_MIXTE)).toBe(false);
        expect(win.grilleEstAnalytique(null)).toBe(false);
        // Déclarée analytique avec un critère qui déroge : le déclaré l'emporte, comme au menu.
        expect(win.grilleEstAnalytique({ type: 'analytique', criteres: [{ type: 'analytique' }, { type: 'holistique' }] })).toBe(true);
    });

    it('A.b une seule source : cartouches.js ne déduit rien lui-même, il demande à grilles.js', () => {
        const code = source('js/cartouches.js');
        expect(code).toContain('window.typeGrilleAffiche(grille)');
        expect(code).not.toMatch(/criteres\.every\(c => c\.type === 'analytique'\)/);
    });
});

/* ---------------------------------------------------------- B — le mot du champ */

describe('lot 4 · A.B — le champ dit « Paliers (bornes en %) » pour une grille analytique', () => {
    it('B.a au peuplement du formulaire (création, édition), le mot suit la grille liée', async () => {
        const { win, el } = monter();
        await win.populerDropdownsCartouche('', '', false);
        expect(el('motEchelleCartouche').textContent).toBe('Échelle (niveaux)');
        await win.populerDropdownsCartouche('G_ANA', 'ECHELLE_IDME_DEPART', true);
        expect(el('motEchelleCartouche').textContent).toBe('Paliers (bornes en %)');
        await win.populerDropdownsCartouche('G_HOLI', 'ECH_2', true);
        expect(el('motEchelleCartouche').textContent).toBe('Échelle (niveaux)');
        await win.populerDropdownsCartouche('G_MIXTE', 'ECH_2', true);
        expect(el('motEchelleCartouche').textContent).toBe('Échelle (niveaux)');
    });

    it('B.b au changement de grille, le mot suit aussi — et la déduction suffit (grille sans type déclaré)', async () => {
        const { win, el } = monter();
        el('selectGrilleCartouche').value = 'G_DED';
        el('selectEchelleCartouche').value = 'ECH_2';
        await win.onChangeSelectionCartouche();
        expect(el('motEchelleCartouche').textContent).toBe('Paliers (bornes en %)');
    });

    it('B.c le libellé vit à un seul endroit, marqué EN ATTENTE, et index.html porte le mot de départ avec sa marque « obligatoire »', () => {
        const code = source('js/cartouches.js');
        expect(code).toContain('const LIBELLES_PALIERS = {');
        expect(code).toContain('[EN ATTENTE');
        const sansCommentaires = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect((sansCommentaires.match(/Paliers \(bornes en %\)/g) || []).length).toBe(1);
        const html = source('index.html');
        const i = html.indexOf('id="motEchelleCartouche"');
        expect(i).toBeGreaterThan(-1);
        const label = html.slice(html.lastIndexOf('<label', i), html.indexOf('</label>', i));
        expect(label).toContain('Échelle (niveaux)');
        expect(label).toContain('title="Champ obligatoire"');
    });
});

/* ------------------------------------------------------- C — le préremplissage */

describe('lot 4 · A.C — l\'échelle de départ est préremplie, si elle est dans la base', () => {
    it('C.a grille analytique, aucune échelle choisie, échelle de départ présente → préremplie, cartouche liée à elle, matrice rendue', async () => {
        const { win, el } = monter();
        el('selectGrilleCartouche').value = 'G_ANA';
        el('selectEchelleCartouche').value = '';
        await win.onChangeSelectionCartouche();
        expect(el('selectEchelleCartouche').value).toBe('ECHELLE_IDME_DEPART');
        expect(win.cartoucheActuel.echelleId).toBe('ECHELLE_IDME_DEPART');
        expect(win.cartoucheActuel.grilleId).toBe('G_ANA');
        expect(el('matriceContainer').innerHTML).toContain('Critère / Palier');
    });

    it('C.b sans échelle de départ dans la base : rien n\'est prérempli, la matrice reste masquée', async () => {
        const { win, el } = monter({ echelles: [AUTRE] });
        el('selectGrilleCartouche').value = 'G_ANA';
        el('selectEchelleCartouche').value = '';
        await win.onChangeSelectionCartouche();
        expect(el('selectEchelleCartouche').value).toBe('');
        expect(win.cartoucheActuel == null || !win.cartoucheActuel.echelleId).toBe(true);
        expect(el('matriceContainer').innerHTML).toBe('');
    });

    it('C.c une échelle déjà choisie n\'est jamais remplacée ; une grille holistique n\'est jamais préremplie', async () => {
        const { win, el } = monter();
        el('selectGrilleCartouche').value = 'G_ANA';
        el('selectEchelleCartouche').value = 'ECH_2';
        await win.onChangeSelectionCartouche();
        expect(el('selectEchelleCartouche').value).toBe('ECH_2');
        expect(win.cartoucheActuel.echelleId).toBe('ECH_2');
        const b = monter();
        b.el('selectGrilleCartouche').value = 'G_HOLI';
        b.el('selectEchelleCartouche').value = '';
        await b.win.onChangeSelectionCartouche();
        expect(b.el('selectEchelleCartouche').value).toBe('');
    });

    it('C.d une échelle de départ RETIRÉE de la sélection ne se prérempli pas — on n\'offre que ce qui est offert', async () => {
        const retiree = { ...DEPART, dansBibliotheque: false };
        const { win, el } = monter({ echelles: [retiree, AUTRE] });
        el('selectGrilleCartouche').value = 'G_ANA';
        el('selectEchelleCartouche').value = '';
        await win.onChangeSelectionCartouche();
        expect(el('selectEchelleCartouche').value).toBe('');
    });
});

/* ------------------------------------------------------ D — l'éditeur, par les bornes */

describe('lot 4 · A.D — l\'éditeur titre ses colonnes par les bornes, et rien de ce qui voyage ne change', () => {
    it('D.a les titres : « 0–64,99 % », « 65–74,99 % »… lus sur l\'échelle source ; le coin dit « Palier » ; les cases nomment le palier', async () => {
        const { win, el } = monter();
        el('selectGrilleCartouche').value = 'G_ANA';
        el('selectEchelleCartouche').value = 'ECHELLE_IDME_DEPART';
        await win.onChangeSelectionCartouche();
        const html = el('matriceContainer').innerHTML;
        expect(html).toContain('Critère / Palier');
        expect(html).not.toContain('Critère / Niveau');
        for (const t of ['0–64,99 %', '65–74,99 %', '75–84,99 %', '85–100 %']) expect(html).toContain(t);
        // Plus de « I · Insuffisant » en tête de colonne — le palier remplace le niveau, il ne s'y ajoute pas.
        expect(html).not.toContain('<span class="niveau-label">Insuffisant</span>');
        expect(html).toContain('placeholder="Commentaire pour Langue - 0–64,99 %"');
        // Les couleurs restent celles de l'échelle source.
        expect(html).toContain('background: #c00;');
    });

    it('D.b la clé des commentaires reste `critereId_code`, et la copie de la cartouche reste (code, nom) — sans bornes', async () => {
        const { win, el } = monter();
        el('selectGrilleCartouche').value = 'G_ANA';
        el('selectEchelleCartouche').value = 'ECHELLE_IDME_DEPART';
        await win.onChangeSelectionCartouche();
        const html = el('matriceContainer').innerHTML;
        expect(html).toContain('id="comm_C1_I"');
        expect(html).toContain('data-niveau="I"');
        expect(win.cartoucheActuel.niveaux).toEqual([{ code: 'I', nom: 'Insuffisant' }, { code: 'D', nom: 'En développement' }, { code: 'M', nom: 'Maîtrisé' }, { code: 'E', nom: 'Étendu' }]);
        expect(JSON.stringify(win.cartoucheActuel)).not.toMatch(/"min"|"max"|palier/i);
    });

    it('D.c `libellePalier` : exact, en français ; sans bornes, le nom du niveau', () => {
        const { win } = monter();
        expect(win.libellePalier({ min: 0, max: 64.99 })).toBe('0–64,99 %');
        expect(win.libellePalier({ min: 85, max: 100 })).toBe('85–100 %');
        expect(win.libellePalier({ min: '60', max: '69.5' })).toBe('60–69,5 %');
        expect(win.libellePalier({ code: 'M', nom: 'Maîtrisé' })).toBe('Maîtrisé');
        expect(win.libellePalier({ code: 'M', min: 75 })).toBe('M');
        expect(win.libellePalier(null)).toBe('');
    });

    it('D.d à la RÉOUVERTURE d\'une cartouche dont l\'échelle a disparu, le message dit « paliers » pour une grille analytique, « échelle » sinon', async () => {
        const { win, el, store } = monter();
        store['a2026_cartouches_G_ANA'] = [{ id: 'CA', nom: 'Sur analytique', grilleId: 'G_ANA', echelleId: 'ECH_DISPARUE', criteres: [{ id: 'C1', nom: 'Langue' }], niveaux: [], commentaires: {} }];
        store['a2026_cartouches_G_HOLI'] = [{ id: 'CH', nom: 'Sur holistique', grilleId: 'G_HOLI', echelleId: 'ECH_DISPARUE', criteres: [{ id: 'C1', nom: 'Contenu' }], niveaux: [], commentaires: {} }];
        await win.chargerCartouchePourModif('CA', 'G_ANA');
        expect(el('matriceContainer').innerHTML).toContain('pas encore de paliers');
        await win.chargerCartouchePourModif('CH', 'G_HOLI');
        expect(el('matriceContainer').innerHTML).toContain('pas encore d\'échelle');
    });

    it('D.e le chemin « ajouter une cartouche à cette grille » (barre latérale) prérempli aussi l\'échelle de départ', async () => {
        const { win, el } = monter();
        el('selectEchelleCartouche').value = '';
        await win.ajouterCartoucheAGrille('G_ANA');
        expect(win.cartoucheActuel.echelleId).toBe('ECHELLE_IDME_DEPART');
        expect(el('selectEchelleCartouche').value).toBe('ECHELLE_IDME_DEPART');
        expect(el('matriceContainer').innerHTML).toContain('Critère / Palier');
        const b = monter({ echelles: [AUTRE] });
        b.el('selectEchelleCartouche').value = '';
        await b.win.ajouterCartoucheAGrille('G_ANA');
        expect(b.win.cartoucheActuel.echelleId).toBe('');
    });
});

/* ------------------------------------------------------------ E — ce qui ne bouge pas */

describe('lot 4 · A.E — une grille holistique ou mixte garde ses niveaux', () => {
    it('E.a holistique : « Critère / Niveau », code et nom en tête de colonne, placeholder au nom du niveau', async () => {
        const { win, el } = monter();
        el('selectGrilleCartouche').value = 'G_HOLI';
        el('selectEchelleCartouche').value = 'ECHELLE_IDME_DEPART';
        await win.onChangeSelectionCartouche();
        const html = el('matriceContainer').innerHTML;
        expect(html).toContain('Critère / Niveau');
        expect(html).toContain('<span class="niveau-code">I</span>');
        expect(html).toContain('<span class="niveau-label">Insuffisant</span>');
        expect(html).not.toContain('64,99');
        expect(html).toContain('placeholder="Commentaire pour Contenu - Insuffisant"');
    });

    it('E.b mixte de fait (sans type déclaré) : les niveaux — le badge MIXTE le dit déjà ailleurs', async () => {
        const { win, el } = monter();
        el('selectGrilleCartouche').value = 'G_MIXTE';
        el('selectEchelleCartouche').value = 'ECHELLE_IDME_DEPART';
        await win.onChangeSelectionCartouche();
        expect(el('matriceContainer').innerHTML).toContain('Critère / Niveau');
        expect(el('motEchelleCartouche').textContent).toBe('Échelle (niveaux)');
    });
});

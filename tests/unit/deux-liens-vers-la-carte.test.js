import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// DEUX LIENS VERS LA CARTE D'ALIGNEMENT — étape 2, le code (9 nov. 2026).
//
// Décisions de Grégoire du 9 nov., 10 h 19 à 10 h 21 (les neuf recommandations
// du rapport de mesure, adoptées) :
//   1. l'objectif : même texte, seulement par un geste explicite ; la production
//      fait foi ; la leçon REPREND l'objectif (`{id, texte, productionId}`) ;
//      rien n'est coché d'office ; le plan exporté imprime le texte courant ;
//   2. la compétence : la fiche du cours fait foi ; une seule compétence liée ;
//      les éléments en lecture seule ; le titre écrit par l'enseignant·e n'est
//      JAMAIS effacé ;
//   3. le stock : rien n'est relié d'office, aucune donnée réécrite.
//
// Ce banc éprouve les DONNÉES (les portes d'écriture et le rafraîchissement),
// et le rendu par les fonctions qui fabriquent le HTML. Le geste au doigt se
// joue au banc Chromium (`tests/integration/deux-liens-vers-la-carte.spec.js`).

let store;
let fiches;          // la collection globale `cours`, telle que resoudreCoursDeCarte la lit
let coursDeLaCarte;  // le coursId de l'entrée d'index de la carte active
let cartesStockees;  // pour la lecture au stockage (reprises d'un objectif)
let api;

function fauxElement() {
    return {
        style: {}, dataset: {}, className: '', innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        closest: () => null, contains: () => false, focus() {}, offsetWidth: 140, offsetHeight: 50
    };
}

function monterModule() {
    store = {};
    fiches = [];
    coursDeLaCarte = 'cours-litt';
    cartesStockees = {};
    const db = {
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t === null || t === undefined ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        setTimeout: () => 0,
        document: {
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = {
        getIndex: () => ({
            active: 'carte_1',
            cartes: Object.keys(cartesStockees).length
                ? Object.keys(cartesStockees).map(id => ({ id, nom: 'Carte ' + id, coursId: coursDeLaCarte }))
                : [{ id: 'carte_1', nom: 'Test', coursId: coursDeLaCarte }]
        }),
        sauvegarderCarte: () => {},
        chargerCarte: (id) => (cartesStockees[id] ? JSON.parse(JSON.stringify(cartesStockees[id])) : null),
        resoudreCoursDeCarte: () => fiches.find(c => c && c.id === coursDeLaCarte) || null
    };
    api = win.planificationCarte;
    return api;
}

function poserProductions(liste) { store.a2026_productions = liste; }

function poserLecon(id, objectifs, extra) {
    const n = Object.assign({
        id, type: 'lecon', titre: 'Leçon ' + id, x: 0, y: 0, parent: null,
        enfants: [], cloneSourceId: null,
        metadata: objectifs ? { objectifs: objectifs.map(o => Object.assign({}, o)) } : {}
    }, extra || {});
    api.etat.noeuds.set(id, n);
    return n;
}

function poserNoeud(id, type, extra) {
    const n = Object.assign({
        id, type, titre: '', description: '', x: 0, y: 0, parent: null,
        enfants: [], metadata: {}, cloneSourceId: null
    }, extra || {});
    api.etat.noeuds.set(id, n);
    return n;
}

function ficheLitterature(extra) {
    return Object.assign({
        id: 'cours-litt', nature: 'cours', codeCours: '601-101-MQ',
        numeroCompetence: '4EF0', competence: 'Analyser des textes littéraires',
        elementsCompetence: '• Reconnaître le propos du texte\nRepérer et classer des thèmes\n\n'
    }, extra || {});
}

beforeEach(() => { monterModule(); });

// =======================================================================
// A. L'OBJECTIF — le lien posé
// =======================================================================
describe('Deux liens · A · reprendre l’objectif d’une production', () => {
    it('ajoute une ligne liée {id, texte, productionId} au texte de la production', () => {
        poserProductions([{ id: 'P1', titre: 'Analyse', objectif: '  Analyser un poème  ' }]);
        poserLecon('L1', [{ id: 'o1', texte: 'Lire' }]);

        const oid = api.reprendreObjectifProduction('L1', 'P1');

        expect(typeof oid).toBe('string');
        const objs = api.etat.noeuds.get('L1').metadata.objectifs;
        expect(objs).toHaveLength(2);
        expect(objs[0]).toEqual({ id: 'o1', texte: 'Lire' });
        expect(objs[1]).toEqual({ id: oid, texte: 'Analyser un poème', productionId: 'P1' });
    });

    it('refuse une production sans objectif, une production inconnue, un nœud qui n’est pas une leçon', () => {
        poserProductions([{ id: 'P1', titre: 'Vide', objectif: '   ' }]);
        poserLecon('L1', null);
        poserNoeud('A1', 'activite');

        expect(api.reprendreObjectifProduction('L1', 'P1')).toBe(null);
        expect(api.reprendreObjectifProduction('L1', 'PX')).toBe(null);
        expect(api.reprendreObjectifProduction('A1', 'P1')).toBe(null);
        expect(api.etat.noeuds.get('L1').metadata.objectifs).toBeUndefined();
    });

    it('refuse de reprendre deux fois la même production dans la même leçon', () => {
        poserProductions([{ id: 'P1', objectif: 'Analyser' }]);
        poserLecon('L1', null);
        expect(api.reprendreObjectifProduction('L1', 'P1')).not.toBe(null);
        expect(api.reprendreObjectifProduction('L1', 'P1')).toBe(null);
        expect(api.etat.noeuds.get('L1').metadata.objectifs).toHaveLength(1);
    });

    it('rien n’est coché d’office : aucune évaluation ne reçoit l’objectif repris', () => {
        poserProductions([{ id: 'P1', objectif: 'Analyser' }]);
        poserLecon('L1', null, { enfants: ['E1'] });
        poserNoeud('E1', 'evaluation', { parent: 'L1', metadata: { productionId: 'P1' } });

        api.reprendreObjectifProduction('L1', 'P1');

        expect(api.etat.noeuds.get('E1').metadata.objectifsServis).toBeUndefined();
    });

    it('la liste offerte : productions visibles avec un objectif, moins celles déjà reprises dans la leçon', () => {
        poserProductions([
            { id: 'P1', titre: 'Un', objectif: 'Analyser' },
            { id: 'P2', titre: 'Deux', objectif: '' },
            { id: 'P3', titre: 'Trois', objectif: 'Écrire', dansBibliotheque: false },
            { id: 'P4', titre: 'Quatre', objectif: 'Comparer' }
        ]);
        poserLecon('L1', [{ id: 'o1', texte: 'Analyser', productionId: 'P1' }]);

        const offertes = api.productionsPourReprendre(api.etat.noeuds.get('L1')).map(p => p.id);
        expect(offertes).toEqual(['P4']);
    });
});

// =======================================================================
// B. L'OBJECTIF — le texte suivi
// =======================================================================
describe('Deux liens · B · la ligne suit le texte de la production', () => {
    it('rafraichirLiensCarte remet le texte courant de la production dans la ligne liée', () => {
        poserProductions([{ id: 'P1', objectif: 'Analyser un poème lyrique' }]);
        poserLecon('L1', [{ id: 'o1', texte: 'Analyser un poème', productionId: 'P1' }]);

        expect(api.rafraichirLiensCarte()).toBe(1);
        expect(api.objectifsDeLecon(api.etat.noeuds.get('L1'))[0])
            .toEqual({ id: 'o1', texte: 'Analyser un poème lyrique', productionId: 'P1' });
        // Idempotent : rien de plus à changer.
        expect(api.rafraichirLiensCarte()).toBe(0);
    });

    it('le plan de cours lit objectifDeLeconParId : il imprime le texte courant de la production', () => {
        poserProductions([{ id: 'P1', objectif: 'Texte neuf de la production' }]);
        poserLecon('L1', [{ id: 'o1', texte: 'Ancien texte', productionId: 'P1' }, { id: 'o2', texte: 'Libre' }]);
        api.rafraichirLiensCarte();
        expect(api.objectifDeLeconParId('L1')).toBe('Texte neuf de la production\nLibre');
        expect(api.objectifsDeLeconParId('L1').map(o => o.texte)).toEqual(['Texte neuf de la production', 'Libre']);
    });

    it('production absente ou objectif vidé : la ligne garde son dernier texte connu', () => {
        poserProductions([{ id: 'P2', objectif: '' }]);
        poserLecon('L1', [
            { id: 'o1', texte: 'Dernier texte connu', productionId: 'P1' },
            { id: 'o2', texte: 'Autre dernier texte', productionId: 'P2' }
        ]);
        expect(api.rafraichirLiensCarte()).toBe(0);
        const objs = api.objectifsDeLecon(api.etat.noeuds.get('L1'));
        expect(objs.map(o => o.texte)).toEqual(['Dernier texte connu', 'Autre dernier texte']);
        expect(objs.map(o => o.productionId)).toEqual(['P1', 'P2']);
    });

    it('appliquerObjectifs garde le lien d’une ligne qui le porte, ou dont le texte n’a pas bougé', () => {
        poserProductions([{ id: 'P1', objectif: 'Analyser' }]);
        const L = poserLecon('L1', [{ id: 'o1', texte: 'Analyser', productionId: 'P1' }, { id: 'o2', texte: 'Lire' }]);

        // La carte relit ses lignes : la ligne liée porte son lien.
        api.appliquerObjectifs(L, [{ id: 'o1', texte: 'Analyser', productionId: 'P1' }, { id: 'o2', texte: 'Lire!' }]);
        expect(L.metadata.objectifs[0]).toEqual({ id: 'o1', texte: 'Analyser', productionId: 'P1' });

        // Un appelant qui n'envoie que du texte : texte inchangé, lien gardé.
        api.appliquerObjectifs(L, ['Analyser', 'Lire!']);
        expect(L.metadata.objectifs[0].productionId).toBe('P1');
        expect(L.metadata.objectifs[1].productionId).toBeUndefined();
    });

    it('un texte modifié sur place n’est plus celui de la production : le lien tombe, le texte reste', () => {
        const L = poserLecon('L1', [{ id: 'o1', texte: 'Analyser', productionId: 'P1' }]);
        api.appliquerObjectifs(L, [{ id: 'o1', texte: 'Analyser autrement' }]);
        expect(L.metadata.objectifs).toEqual([{ id: 'o1', texte: 'Analyser autrement' }]);
    });

    it('un id réattribué au rang (ligne liée retirée) n’hérite jamais du lien', () => {
        const L = poserLecon('L1', [{ id: 'o1', texte: 'Analyser', productionId: 'P1' }]);
        // La ligne liée est retirée, une ligne neuve sans id prend son rang.
        api.appliquerObjectifs(L, [{ id: null, texte: 'Tout autre chose' }]);
        expect(L.metadata.objectifs).toHaveLength(1);
        expect(L.metadata.objectifs[0].productionId).toBeUndefined();
    });
});

// =======================================================================
// C. L'OBJECTIF — délier, relier le stock
// =======================================================================
describe('Deux liens · C · délier, et le stock jamais relié d’office', () => {
    it('Délier : la ligne devient un objectif ordinaire, avec le texte du moment, et garde son id', () => {
        poserProductions([{ id: 'P1', objectif: 'Texte courant' }]);
        poserLecon('L1', [{ id: 'o1', texte: 'Vieux texte', productionId: 'P1' }]);

        expect(api.delierObjectif('L1', 'o1')).toBe(true);
        expect(api.etat.noeuds.get('L1').metadata.objectifs).toEqual([{ id: 'o1', texte: 'Texte courant' }]);
        expect(api.delierObjectif('L1', 'o1')).toBe(false);
    });

    it('le rafraîchissement ne relie JAMAIS un objectif dont le texte est identique', () => {
        poserProductions([{ id: 'P1', objectif: 'Analyser un poème' }]);
        poserLecon('L1', [{ id: 'o1', texte: 'Analyser un poème' }]);
        poserNoeud('E1', 'evaluation', { parent: 'L1', metadata: { productionId: 'P1' } });

        expect(api.rafraichirLiensCarte()).toBe(0);
        expect(api.etat.noeuds.get('L1').metadata.objectifs[0].productionId).toBeUndefined();
    });

    it('l’Inspecteur d’une évaluation propose « Relier » seulement pour un objectif identique', () => {
        poserProductions([{ id: 'P1', objectif: 'Analyser  un poème' }]);
        poserLecon('L1', [
            { id: 'o1', texte: 'Analyser un poème' },
            { id: 'o2', texte: 'Analyser un roman' },
            { id: 'o3', texte: 'Analyser un poème', productionId: 'P9' }
        ], { enfants: ['E1'] });
        poserNoeud('E1', 'evaluation', { parent: 'L1', metadata: { productionId: 'P1' } });

        expect(api.objectifsARelierPourEvaluation(api.etat.noeuds.get('E1')))
            .toEqual([{ leconId: 'L1', objectifId: 'o1', productionId: 'P1' }]);
    });

    it('sans production choisie, ou production sans objectif : aucune proposition', () => {
        poserProductions([{ id: 'P1', objectif: '' }]);
        poserLecon('L1', [{ id: 'o1', texte: 'Analyser' }], { enfants: ['E1', 'E2'] });
        poserNoeud('E1', 'evaluation', { parent: 'L1', metadata: {} });
        poserNoeud('E2', 'evaluation', { parent: 'L1', metadata: { productionId: 'P1' } });
        expect(api.objectifsARelierPourEvaluation(api.etat.noeuds.get('E1'))).toEqual([]);
        expect(api.objectifsARelierPourEvaluation(api.etat.noeuds.get('E2'))).toEqual([]);
    });

    it('relierObjectifAProduction : refuse deux textes différents, accepte deux textes identiques', () => {
        poserProductions([{ id: 'P1', objectif: 'Analyser un poème' }]);
        poserLecon('L1', [{ id: 'o1', texte: 'Analyser un roman' }, { id: 'o2', texte: 'Analyser  un poème ' }]);

        expect(api.relierObjectifAProduction('L1', 'o1', 'P1')).toBe(false);
        expect(api.etat.noeuds.get('L1').metadata.objectifs[0].productionId).toBeUndefined();

        expect(api.relierObjectifAProduction('L1', 'o2', 'P1')).toBe(true);
        expect(api.etat.noeuds.get('L1').metadata.objectifs[1])
            .toEqual({ id: 'o2', texte: 'Analyser un poème', productionId: 'P1' });
    });
});

// =======================================================================
// D. L'OBJECTIF — le rendu de la zone 🎯
// =======================================================================
describe('Deux liens · D · la ligne liée dans la carte', () => {
    it('une ligne liée n’est pas modifiable sur place ; une ligne ordinaire l’est', () => {
        poserProductions([{ id: 'P1', titre: 'Analyse', objectif: 'Analyser' }]);
        const L = poserLecon('L1', [{ id: 'o1', texte: 'Analyser', productionId: 'P1' }, { id: 'o2', texte: 'Lire' }],
            { metadata: { objectifDeplie: true, objectifs: [{ id: 'o1', texte: 'Analyser', productionId: 'P1' }, { id: 'o2', texte: 'Lire' }] } });

        const html = api.objectifsLeconHTML(L);
        const ligneLiee = html.match(/<div class="planif-noeud-objectif[^"]*"[^>]*data-obj-id="o1"[^>]*>/)[0];
        const ligneLibre = html.match(/<div class="planif-noeud-objectif[^"]*"[^>]*data-obj-id="o2"[^>]*>/)[0];
        expect(ligneLiee).not.toMatch(/contenteditable/);
        expect(ligneLiee).toMatch(/data-obj-production="P1"/);
        expect(ligneLibre).toMatch(/contenteditable="true"/);
    });

    it('production introuvable : la ligne s’affiche comme un objectif ordinaire', () => {
        poserProductions([]);
        const L = poserLecon('L1', null, { metadata: { objectifDeplie: true, objectifs: [{ id: 'o1', texte: 'Analyser', productionId: 'P1' }] } });
        const html = api.objectifsLeconHTML(L);
        const ligne = html.match(/<div class="planif-noeud-objectif[^"]*"[^>]*data-obj-id="o1"[^>]*>/)[0];
        expect(ligne).toMatch(/contenteditable="true"/);
        expect(ligne).not.toMatch(/data-obj-production/);
    });

    it('la commande « Reprendre l’objectif d’une production » est offerte, liste vide comprise', () => {
        poserProductions([{ id: 'P1', titre: 'Analyse <b>', objectif: 'Analyser' }]);
        const vide = poserLecon('L1', null, { metadata: { objectifDeplie: true } });
        const html = api.objectifsLeconHTML(vide);
        expect(html).toContain('Reprendre l’objectif d’une production');
        expect(html).toContain('value="P1"');
        // Le titre de la production est du texte libre : échappé.
        expect(html).toContain('Analyse &lt;b&gt;');
        expect(html).not.toContain('Analyse <b>');
    });

    it('sans production à reprendre, la commande n’apparaît pas', () => {
        poserProductions([{ id: 'P1', objectif: '' }]);
        const L = poserLecon('L1', null, { metadata: { objectifDeplie: true } });
        expect(api.objectifsLeconHTML(L)).not.toContain('Reprendre l’objectif d’une production');
    });

    it('la ligne liée ouverte offre « Modifier dans la production » et « Délier »', () => {
        poserProductions([{ id: 'P1', objectif: 'Analyser' }]);
        const L = poserLecon('L1', null, { metadata: { objectifDeplie: true, objectifs: [{ id: 'o1', texte: 'Analyser', productionId: 'P1' }] } });
        api.basculerMenuObjectifLie('L1', 'o1');
        const html = api.objectifsLeconHTML(L);
        expect(html).toContain('Modifier dans la production');
        expect(html).toContain('>Délier<');
        api.basculerMenuObjectifLie('L1', 'o1');
        expect(api.objectifsLeconHTML(L)).not.toContain('Modifier dans la production');
    });
});

// =======================================================================
// E. L'OBJECTIF — la mention dans la fiche de production (lecture au stockage)
// =======================================================================
describe('Deux liens · E · « Repris dans la carte » se lit au stockage', () => {
    it('rend une ligne par leçon qui reprend l’objectif, avec sa semaine quand elle en a une', () => {
        cartesStockees.carte_1 = { noeuds: [
            { id: 'L1', type: 'lecon', titre: 'Le sonnet', metadata: { semaine: 3, objectifs: [{ id: 'o1', texte: 'A', productionId: 'P1' }] } },
            { id: 'L2', type: 'lecon', titre: 'Sans semaine', metadata: { objectifs: [{ id: 'o2', texte: 'A', productionId: 'P1' }] } },
            { id: 'L3', type: 'lecon', titre: 'Autre', metadata: { semaine: 4, objectifs: [{ id: 'o3', texte: 'A', productionId: 'P2' }] } }
        ] };
        expect(api.lignesReprisesObjectif('P1')).toEqual([
            'Repris dans la carte : leçon « Le sonnet », semaine 3',
            'Repris dans la carte : leçon « Sans semaine »'
        ]);
        expect(api.lignesReprisesObjectif('P9')).toEqual([]);
        expect(api.lignesReprisesObjectif('')).toEqual([]);
    });
});

// =======================================================================
// F. LA COMPÉTENCE — la fiche du cours fait foi
// =======================================================================
describe('Deux liens · F · la fiche du cours', () => {
    it('ficheCompetenceCarte lit numéro, énoncé et éléments (un par ligne)', () => {
        fiches = [ficheLitterature()];
        expect(api.ficheCompetenceCarte()).toEqual({
            coursId: 'cours-litt', numero: '4EF0', enonce: 'Analyser des textes littéraires',
            elements: ['• Reconnaître le propos du texte', 'Repérer et classer des thèmes']
        });
    });

    it('rien à lier : carte sans cours, fiche sans compétence, service', () => {
        fiches = [];
        expect(api.ficheCompetenceCarte()).toBe(null);
        fiches = [ficheLitterature({ competence: '  ' })];
        expect(api.ficheCompetenceCarte()).toBe(null);
        fiches = [ficheLitterature({ nature: 'service' })];
        expect(api.ficheCompetenceCarte()).toBe(null);
    });
});

// =======================================================================
// G. LA COMPÉTENCE — le lien posé, le titre jamais effacé
// =======================================================================
describe('Deux liens · G · bloc Compétence lié', () => {
    it('un bloc neuf, dans une carte dont la fiche porte une compétence, naît lié', () => {
        fiches = [ficheLitterature()];
        const n = poserNoeud('C1', 'competence');
        expect(api.lierCompetenceNeuve(n)).toBe(true);
        expect(n.metadata.lieFicheCours).toBe(true);
        expect(n.titre).toBe('Analyser des textes littéraires');
        expect(n.metadata.titreAvantLien).toBeUndefined();
    });

    it('un deuxième bloc reste libre : une seule compétence liée', () => {
        fiches = [ficheLitterature()];
        api.lierCompetenceNeuve(poserNoeud('C1', 'competence'));
        const n2 = poserNoeud('C2', 'competence');
        expect(api.lierCompetenceNeuve(n2)).toBe(false);
        expect(n2.metadata.lieFicheCours).toBeUndefined();
        expect(n2.titre).toBe('');
        expect(api.peutRelierCompetence(n2)).toBe(false);
    });

    it('le clone d’un bloc lié ne compte pas pour une deuxième compétence', () => {
        fiches = [ficheLitterature()];
        poserNoeud('C1', 'competence', { titre: 'Analyser des textes littéraires', metadata: { lieFicheCours: true } });
        poserNoeud('C2', 'competence', { cloneSourceId: 'C1', metadata: {} });
        expect(api.peutRelierCompetence(api.etat.noeuds.get('C2'))).toBe(true);
    });

    it('sans fiche (carte non rattachée), le bloc naît libre, comme aujourd’hui', () => {
        fiches = [];
        const n = poserNoeud('C1', 'competence');
        expect(api.lierCompetenceNeuve(n)).toBe(false);
        expect(n.metadata).toEqual({});
    });

    it('Relier un bloc existant : son titre est mis de côté, jamais effacé ; Délier le lui rend', () => {
        fiches = [ficheLitterature()];
        poserNoeud('C1', 'competence', { titre: 'Analyser un texte littéraire' });

        expect(api.relierCompetenceAFiche('C1')).toBe(true);
        const n = api.etat.noeuds.get('C1');
        expect(n.titre).toBe('Analyser des textes littéraires');
        expect(n.metadata.lieFicheCours).toBe(true);
        expect(n.metadata.titreAvantLien).toBe('Analyser un texte littéraire');

        expect(api.delierCompetence('C1')).toBe(true);
        expect(n.titre).toBe('Analyser un texte littéraire');
        expect(n.metadata.lieFicheCours).toBeUndefined();
        expect(n.metadata.titreAvantLien).toBeUndefined();
    });

    it('Délier un bloc né lié : l’énoncé courant reste dans le titre', () => {
        fiches = [ficheLitterature()];
        const n = poserNoeud('C1', 'competence');
        api.lierCompetenceNeuve(n);
        fiches[0].competence = 'Analyser des œuvres littéraires';
        api.rafraichirLiensCarte();
        expect(api.delierCompetence('C1')).toBe(true);
        expect(n.titre).toBe('Analyser des œuvres littéraires');
        expect(n.metadata.lieFicheCours).toBeUndefined();
    });

    it('le titre suit la fiche ; le titre mis de côté n’est jamais touché par le rafraîchissement', () => {
        fiches = [ficheLitterature()];
        poserNoeud('C1', 'competence', { titre: 'Mon titre à moi' });
        api.relierCompetenceAFiche('C1');
        fiches[0].competence = 'Énoncé révisé';

        expect(api.rafraichirLiensCarte()).toBe(1);
        const n = api.etat.noeuds.get('C1');
        expect(n.titre).toBe('Énoncé révisé');
        expect(n.metadata.titreAvantLien).toBe('Mon titre à moi');
    });

    it('fiche vidée ou passée en service : le bloc garde son dernier titre', () => {
        fiches = [ficheLitterature()];
        poserNoeud('C1', 'competence', { titre: 'Analyser des textes littéraires', metadata: { lieFicheCours: true } });
        fiches[0].nature = 'service';
        expect(api.rafraichirLiensCarte()).toBe(0);
        expect(api.etat.noeuds.get('C1').titre).toBe('Analyser des textes littéraires');
    });

    it('le stock n’est jamais relié d’office : un bloc libre garde son titre au rafraîchissement', () => {
        fiches = [ficheLitterature()];
        poserNoeud('C1', 'competence', { titre: 'Analyser un texte littéraire' });
        expect(api.rafraichirLiensCarte()).toBe(0);
        const n = api.etat.noeuds.get('C1');
        expect(n.titre).toBe('Analyser un texte littéraire');
        expect(n.metadata.lieFicheCours).toBeUndefined();
        expect(api.peutRelierCompetence(n)).toBe(true);
    });

    it('un titre identique à la fiche n’est pas mis de côté (rien à rendre)', () => {
        fiches = [ficheLitterature()];
        poserNoeud('C1', 'competence', { titre: 'analyser des textes  littéraires' });
        api.relierCompetenceAFiche('C1');
        expect(api.etat.noeuds.get('C1').metadata.titreAvantLien).toBeUndefined();
    });

    it('la permutation Compétence → Idée maîtresse retire le lien et rend le titre', () => {
        fiches = [ficheLitterature()];
        poserNoeud('C1', 'competence', { titre: 'Mon titre' });
        api.relierCompetenceAFiche('C1');
        expect(api.definirTypeNoeud('C1', 'idee-maitresse')).toBe(true);
        const n = api.etat.noeuds.get('C1');
        expect(n.type).toBe('idee-maitresse');
        expect(n.titre).toBe('Mon titre');
        expect(n.metadata.lieFicheCours).toBeUndefined();
        expect(n.metadata.titreAvantLien).toBeUndefined();
    });

    it('Délier suit les clones (instances liées)', () => {
        fiches = [ficheLitterature()];
        poserNoeud('C1', 'competence', { titre: 'Analyser des textes littéraires', metadata: { lieFicheCours: true } });
        poserNoeud('C2', 'competence', { titre: 'Analyser des textes littéraires', cloneSourceId: 'C1', metadata: { lieFicheCours: true } });
        api.reconstruireIndexClones();
        api.delierCompetence('C1');
        expect(api.etat.noeuds.get('C2').metadata.lieFicheCours).toBeUndefined();
    });
});

// =======================================================================
// H. LA COMPÉTENCE — le rendu du bloc
// =======================================================================
describe('Deux liens · H · le bloc Compétence dans la carte', () => {
    it('lié : titre non modifiable sur place, numéro affiché ; libre : modifiable', () => {
        fiches = [ficheLitterature()];
        const lie = poserNoeud('C1', 'competence', { titre: 'Analyser des textes littéraires', metadata: { lieFicheCours: true } });
        const libre = poserNoeud('C2', 'competence', { titre: 'Autre' });

        const htmlLie = api.contenuNoeudHTML(lie);
        expect(htmlLie).toMatch(/<div class="planif-noeud-titre[^"]*"(?![^>]*contenteditable)[^>]*>Analyser des textes littéraires<\/div>/);
        expect(htmlLie).toContain('4EF0');
        expect(api.contenuNoeudHTML(libre)).toMatch(/<div class="planif-noeud-titre" contenteditable="true">Autre<\/div>/);
    });

    it('l’Inspecteur d’un AUTRE bloc ne reçoit rien de la fiche du cours (cas vu sur capture : une évaluation)', () => {
        fiches = [ficheLitterature({ competence: '' })];   // le cas 3 : fiche rattachée, sans compétence
        ['evaluation', 'lecon', 'idee-maitresse', 'activite'].forEach((type) => {
            expect(api.sectionCompetenceInspecteurHTML(poserNoeud('X-' + type, type), null), type).toBe('');
        });
        // Et le bloc Compétence, lui, reçoit le chemin vers la fiche.
        expect(api.sectionCompetenceInspecteurHTML(poserNoeud('C1', 'competence'), null))
            .toContain('Modifier dans la fiche du cours');
    });

    it('lien dormant (fiche sans compétence) : le bloc se rend comme un bloc libre', () => {
        fiches = [ficheLitterature({ competence: '' })];
        const n = poserNoeud('C1', 'competence', { titre: 'Dernier énoncé', metadata: { lieFicheCours: true } });
        expect(api.contenuNoeudHTML(n)).toMatch(/<div class="planif-noeud-titre" contenteditable="true">Dernier énoncé<\/div>/);
    });
});

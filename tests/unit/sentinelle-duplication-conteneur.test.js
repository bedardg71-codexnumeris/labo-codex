import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Demande Grégoire (6 août soir) : le patron « PROTOTYPE » de Keynote — une
// leçon modèle qu'on duplique puis dont on modifie le contenu librement.
//
// Distinction posée : « Cloner » (feuilles) = INSTANCE LIÉE, miroir vivant où
// titre/description/metadata se propagent. Un conteneur ne peut pas être une
// instance liée (la synchronisation des ENFANTS n'a pas de réponse simple, et
// la metadata propagée embarquerait la semaine) — il se DUPLIQUE : copie
// INDÉPENDANTE en profondeur. Même geste (⌘D, ⌥+glisser, bouton), deux
// sémantiques nommées différemment dans l'inspecteur.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

let store;
let elements;

function monterModule() {
    store = {};
    elements = {
        'planif-sommaire': { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] }
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; }
    };
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false,
        offsetWidth: 140, offsetHeight: 50
    });
    const fauxDocument = {
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        createElement: fauxElement,
        createElementNS: fauxElement,
        body: { appendChild() {}, removeChild() {} }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: fauxDocument
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, { titre = type, x = 0, y = 0, parent = null, enfants = [], metadata = {} } = {}) {
    api.etat.noeuds.set(id, { id, type, titre, x, y, parent, enfants, metadata, cloneSourceId: null });
}

function poserPrototype(api) {
    poser(api, 'planif-seq', 'sequence', { titre: 'Séquence', x: 50, y: 50, enfants: ['planif-proto'] });
    poser(api, 'planif-proto', 'lecon', {
        titre: 'Prototype', x: 100, y: 120, parent: 'planif-seq',
        enfants: ['planif-act', 'planif-eval'],
        metadata: { semaine: 3, objectifs: [{ id: 'obj_x', texte: 'Analyser un texte' }] }
    });
    poser(api, 'planif-act', 'activite', { titre: 'Atelier', x: 120, y: 200, parent: 'planif-proto', metadata: { duree: 50 } });
    poser(api, 'planif-eval', 'evaluation', { titre: 'Remise', x: 120, y: 280, parent: 'planif-proto' });
    // Lien INTERNE (activité → évaluation) et lien EXTERNE (évaluation → hors bloc)
    poser(api, 'planif-im', 'idee-maitresse', { titre: 'Idée', x: 600, y: 60 });
    api.etat.liens.set('planif-lien_1', { id: 'planif-lien_1', source: 'planif-act', cible: 'planif-eval', type: 'se_verifie_par' });
    api.etat.liens.set('planif-lien_2', { id: 'planif-lien_2', source: 'planif-im', cible: 'planif-proto', type: 'se_concretise_dans' });
    api.etat.compteurLiens = 2;
    api.etat.compteur = 10;
}

describe('duplication de conteneur · copie indépendante en profondeur', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserPrototype(api); });

    it('copie récursive : nouveaux ids, enfants recopiés, positions relatives conservées', () => {
        const copieId = api.dupliquerConteneurEnProfondeur('planif-proto');
        expect(copieId).toBeTruthy();
        const copie = api.etat.noeuds.get(copieId);

        expect(copie.titre).toBe('Prototype');
        expect(copie.id).not.toBe('planif-proto');
        expect(copie.enfants).toHaveLength(2);
        // La copie est décalée de l'originale, puis la disposition automatique
        // reprend la main sur les positions internes — le contrat est la
        // STRUCTURE, pas le pixel.
        expect(copie.x).not.toBe(100);
        const actCopie = api.etat.noeuds.get(copie.enfants[0]);
        expect(actCopie.titre).toBe('Atelier');
        expect(actCopie.parent).toBe(copieId);
        expect(actCopie.metadata.duree).toBe(50);
        // L'original n'a pas perdu ses enfants.
        expect(api.etat.noeuds.get('planif-proto').enfants).toEqual(['planif-act', 'planif-eval']);
    });

    it('INDÉPENDANCE totale : aucun cloneSourceId, modifier la copie ne touche pas l’original', () => {
        const copieId = api.dupliquerConteneurEnProfondeur('planif-proto');
        const copie = api.etat.noeuds.get(copieId);

        expect(copie.cloneSourceId).toBeNull();
        copie.enfants.forEach((eid) => expect(api.etat.noeuds.get(eid).cloneSourceId).toBeNull());

        copie.metadata.semaine = 9;
        copie.titre = 'Semaine 9';
        expect(api.etat.noeuds.get('planif-proto').metadata.semaine).toBe(3);
        expect(api.etat.noeuds.get('planif-proto').titre).toBe('Prototype');
    });

    it('les objectifs sont recopiés avec de NOUVEAUX ids (unicité pour #403)', () => {
        const copieId = api.dupliquerConteneurEnProfondeur('planif-proto');
        const objs = api.etat.noeuds.get(copieId).metadata.objectifs;

        expect(objs).toHaveLength(1);
        expect(objs[0].texte).toBe('Analyser un texte');
        expect(objs[0].id).not.toBe('obj_x');
    });

    it('les liens INTERNES sont recréés entre les copies ; les liens EXTERNES ne sont pas copiés', () => {
        const copieId = api.dupliquerConteneurEnProfondeur('planif-proto');
        const copie = api.etat.noeuds.get(copieId);
        const idsCopies = new Set([copieId, ...copie.enfants]);

        const liensDesCopies = [...api.etat.liens.values()]
            .filter((l) => idsCopies.has(l.source) || idsCopies.has(l.cible));

        // Un seul lien recréé : activité-copie → évaluation-copie.
        expect(liensDesCopies).toHaveLength(1);
        expect(idsCopies.has(liensDesCopies[0].source)).toBe(true);
        expect(idsCopies.has(liensDesCopies[0].cible)).toBe(true);
        expect(liensDesCopies[0].type).toBe('se_verifie_par');
        // L'idée maîtresse ne pointe PAS vers la copie (elle n'est pas alignée).
        expect(liensDesCopies.some((l) => l.source === 'planif-im')).toBe(false);
    });

    it('le prototype vit dans une séquence → la copie y entre aussi', () => {
        const copieId = api.dupliquerConteneurEnProfondeur('planif-proto');
        expect(api.etat.noeuds.get(copieId).parent).toBe('planif-seq');
        expect(api.etat.noeuds.get('planif-seq').enfants).toContain(copieId);
    });

    it('voie A : dupliquer une SÉQUENCE recopie ses leçons et leur contenu', () => {
        const copieId = api.dupliquerConteneurEnProfondeur('planif-seq');
        const copie = api.etat.noeuds.get(copieId);
        expect(copie.type).toBe('sequence');
        const leconCopie = api.etat.noeuds.get(copie.enfants[0]);
        expect(leconCopie.type).toBe('lecon');
        expect(leconCopie.enfants).toHaveLength(2);
    });

    it('clonerNoeud route les conteneurs vers la duplication (plus de refus)', () => {
        expect(sourceCarte).not.toMatch(/Les conteneurs ne peuvent pas être clonés/);
        expect(sourceCarte).toMatch(/return dupliquerConteneurEnProfondeur\(noeudId\);/);
    });

    it('une feuille garde le clonage-miroir (instance liée) — sémantique inchangée', () => {
        // Statique : le chemin feuille de clonerNoeud pose toujours cloneSourceId.
        const corps = sourceCarte.slice(sourceCarte.indexOf('function clonerNoeud'), sourceCarte.indexOf('function attacherEvenements'));
        expect(corps).toMatch(/var cloneSourceId = source\.cloneSourceId \|\| source\.id;/);
        expect(corps).toMatch(/cloneSourceId: cloneSourceId/);
    });

    it('l’inspecteur nomme le geste selon la sémantique : Dupliquer / Cloner', () => {
        expect(sourceCarte).toMatch(/estConteneurP \? 'Dupliquer' : 'Cloner'/);
        expect(sourceCarte).toMatch(/btnCloner\.disabled = false;/);
    });

    it('l’annulation est enregistrée AVANT la copie', () => {
        const corps = sourceCarte.slice(
            sourceCarte.indexOf('function dupliquerConteneurEnProfondeur'),
            sourceCarte.indexOf('function clonerNoeud')
        );
        expect(corps.indexOf('enregistrerPourUndo()')).toBeGreaterThan(-1);
        expect(corps.indexOf('enregistrerPourUndo()')).toBeLessThan(corps.indexOf('function copier'));
    });
});

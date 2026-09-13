import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// Demande Grégoire (6 août soir) : le patron « PROTOTYPE » de Keynote — une
// leçon modèle qu'on duplique puis dont on modifie le contenu librement.
//
// Distinction posée : « Cloner » (feuilles) = INSTANCE LIÉE, miroir vivant où
// titre/description/metadata se propagent. Un conteneur ne peut pas être une
// instance liée (la synchronisation des ENFANTS n'a pas de réponse simple, et
// la metadata propagée embarquerait la semaine) — il se DUPLIQUE : copie
// INDÉPENDANTE en profondeur.
//
// ⚠⚠ RÉVISÉ LE 16 AOÛT 2026 — le geste ne décidait pas, il subissait. Grégoire :
// « une COPIE est indépendante de l'originale ; un CLONE en est dépendant.
// Quand modifier le deuxième altère aussi l'original, ce n'est pas une copie,
// c'est un clone. » Sur une FEUILLE, tous les gestes rendaient un clone — ⌥,
// ⌘D et le bouton — sous des noms qui laissaient croire à une copie.
// ⮕ Désormais : **sans ⇧ → copie indépendante · avec ⇧ → clone lié**, la même
// règle pour ⌥ + glisser et pour ⌘D. L'Inspecteur, qui n'a pas de modificateur,
// NOMME les deux au lieu d'en choisir un.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const sourceHtml = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

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

    it('dupliquerNoeud route les conteneurs vers la duplication (plus de refus)', () => {
        expect(sourceCarte).not.toMatch(/Les conteneurs ne peuvent pas être clonés/);
        // Le 2e argument (`silencieux`) est arrivé le 11 août avec la
        // duplication en lot : un seul message pour tout le geste. L'ancre
        // tolère un argument optionnel mais continue d'exiger que le premier
        // soit `noeudId` — c'est le ROUTAGE qu'elle protège, pas la signature.
        expect(sourceCarte).toMatch(/return dupliquerConteneurEnProfondeur\(noeudId(,[^)]*)?\);/);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // ⚠⚠ SÉMANTIQUE REVUE LE 16 AOÛT 2026, à la demande de Grégoire.
    //
    // Ses mots : « une COPIE est indépendante de l'originale ; un CLONE en est
    // dépendant. » Or `⌥ + glisser` sur une feuille rendait un CLONE depuis le
    // 4 août — sous un geste qui laissait croire à une copie. Ce test-ci
    // affirmait cette sémantique (« une feuille garde le clonage-miroir ») :
    // il est retourné, pas supprimé, parce que l'invariant a changé de valeur
    // sur DÉCISION et non par accident.
    //
    // ⮕ LA RÈGLE : sans ⇧ → copie indépendante · avec ⇧ → clone lié.
    // ═══════════════════════════════════════════════════════════════════════

    it('⚠ une feuille rend une COPIE INDÉPENDANTE par défaut', () => {
        const corps = sourceCarte.slice(sourceCarte.indexOf('function dupliquerNoeud'),
            sourceCarte.indexOf('function attacherEvenements'));
        // Le lien de clonage n'est posé que si `lie` est vrai.
        expect(corps).toMatch(/var cloneSourceId = lie \? \(source\.cloneSourceId \|\| source\.id\) : null;/);
        // Et il n'est INDEXÉ que dans ce cas : indexer une copie la ferait
        // apparaître dans la famille de sa source sans en être membre.
        expect(corps).toMatch(/if \(cloneSourceId\) _indexerClone\(donnees\);/);
    });

    it('⚠⚠ le défaut tombe du côté INOFFENSIF — un appelant oublié fait une copie', () => {
        // Un défaut « lié » ferait qu'un appelant non migré relie silencieusement
        // deux blocs : exactement le défaut qu'on vient de corriger. Le défaut
        // « copie » ne peut, au pire, que faire perdre un lien qu'on refera.
        const signature = sourceCarte.match(/function dupliquerNoeud\(([^)]*)\)/);
        expect(signature, 'dupliquerNoeud a disparu').toBeTruthy();
        expect(signature[1]).toMatch(/lie/);
        // Aucune valeur par défaut assignée à `lie` : `undefined` est faux, donc copie.
        expect(signature[1]).not.toMatch(/lie\s*=/);
    });

    it('⚠ les DEUX raccourcis suivent la même règle, ⇧ commande la nature', () => {
        // Si l'un des deux gestes divergeait, l'utilisateur ne pourrait plus
        // prédire ce qu'il obtient — et rien à l'écran ne le dirait.
        expect(sourceCarte, '⌥ + glisser ne lit pas ⇧')
            .toMatch(/dupliquerNoeud\(id, false, e\.shiftKey\)/);
        expect(sourceCarte, '⌘D ne lit pas ⇧')
            .toMatch(/dupliquerSelection\(e\.shiftKey\)/);
        // ⚠ `e.key` passe à 'D' majuscule quand ⇧ est enfoncée : sans ce second
        // test, ⇧⌘D serait MUET. Défaut mesuré au navigateur, pas supposé.
        expect(sourceCarte, '⇧⌘D serait muet : e.key vaut « D » majuscule')
            .toMatch(/e\.key === 'd' \|\| e\.key === 'D'/);
    });

    it('l’inspecteur NOMME la distinction, faute de modificateur', () => {
        // Un bouton sans ⇧ ne peut pas encoder le choix : il doit le dire.
        expect(sourceCarte).toMatch(/estConteneurP \? 'Dupliquer' : 'Copier'/);
        expect(sourceCarte).toMatch(/btnCloner\.disabled = false;/);
        // Le bouton « Copier » fait bien une copie, et le second un clone.
        expect(sourceCarte).toMatch(/dupliquerNoeud\(id, false, false\)/);
        expect(sourceCarte).toMatch(/dupliquerNoeud\(id, false, true\)/);
        // ⚠ Le clonage n'a PAS été retiré en même temps que le renommage :
        // retirer une capacité en silence est pire que de ne rien changer.
        expect(sourceHtml, 'le bouton de clonage lié a disparu de l’Inspecteur')
            .toMatch(/id="planif-btn-cloner-lie"/);
    });

    it('⚠⚠ COUTURE — un conteneur qui contient des CLONES se copie en enfants INDÉPENDANTS', () => {
        // Trouvé par la passe « connexions » du 16 août (P4 de
        // SKILL_verification_adverse), et c'est le seul endroit où la règle
        // « un conteneur produit toujours une copie indépendante » pouvait
        // fuir : si la copie profonde recopiait le `cloneSourceId` de ses
        // enfants, dupliquer une leçon fabriquerait des clones EN SILENCE —
        // exactement le défaut qu'on vient de corriger, par une autre porte.
        const corps = tranche(sourceCarte, 'function dupliquerConteneurEnProfondeur', 'function detacherDeLaFamille');
        const debut = corps.indexOf('function copier(');
        expect(debut, 'la fonction de copie profonde a disparu').toBeGreaterThan(-1);
        // ⚠ Fenêtre de taille fixe, et NON un découpage à la première accolade
        // fermante : le premier jet coupait à l'intérieur d'un bloc imbriqué et
        // rougissait sur du code parfaitement correct. Un oracle mal découpé
        // accuse le code au lieu de le protéger.
        const litteralCopie = corps.slice(debut, debut + 900);
        expect(litteralCopie,
            'la copie profonde ne remet pas cloneSourceId à null : elle fabrique des clones'
        ).toMatch(/cloneSourceId:\s*null/);
        expect(litteralCopie,
            'la copie profonde propage le lien de clonage de la source'
        ).not.toMatch(/cloneSourceId:\s*(source|n)\.cloneSourceId/);
    });

    it('l’annulation est enregistrée AVANT la copie', () => {
        const corps = sourceCarte.slice(
            sourceCarte.indexOf('function dupliquerConteneurEnProfondeur'),
            sourceCarte.indexOf('function dupliquerNoeud')
        );
        expect(corps.indexOf('enregistrerPourUndo()')).toBeGreaterThan(-1);
        expect(corps.indexOf('enregistrerPourUndo()')).toBeLessThan(corps.indexOf('function copier'));
    });
});

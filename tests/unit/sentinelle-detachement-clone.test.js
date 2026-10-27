import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// ═══════════════════════════════════════════════════════════════════════════
// DÉTACHER UN BLOC DE SA FAMILLE DE CLONES (16 août 2026, demande de Grégoire)
//
// La distinction copie / clone livrée le même jour ne vaut que pour les gestes
// À VENIR. Les blocs dupliqués avant — avec un ⌥ qui rendait un clone sans le
// dire — restent liés, et Grégoire a choisi de NE PAS les convertir en masse.
// Sans porte de sortie, ce choix l'enfermait.
//
// ⚠ L'invariant qui compte le plus ici n'est pas « le lien est rompu », c'est
// « RIEN D'AUTRE n'a bougé ». Détacher arrête les propagations futures ; il ne
// défait pas les propagations passées et ne touche à aucune donnée.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

let win;
function monter() {
    const store = {};
    win = chargerScript('js/planification-carte.js', {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => k,
        echapperHtml: (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;'),
        requestAnimationFrame: (f) => { f(); return 0; }
    });
    win.cle = (k) => k;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'c1' }), sauvegarderCarte: () => {}, chargerCarte: () => null
    };
    return win.planificationCarte;
}

/**
 * Une famille FABRIQUÉE PAR LE MODULE, pas posée à la main.
 * ⚠ Les clones se résolvent par `_cloneIndex`, un index privé alimenté à la
 * création. Une famille écrite directement dans la Map n'y est pas : le cas
 * testerait le montage, pas le détachement. On passe donc par `chargerCarte`,
 * le chemin d'un import réel — c'est lui qui reconstruit l'index.
 */
function familleDEssai(api, extra) {
    win.planificationDonnees.chargerCarte = () => ({
        compteur: 3, compteurLiens: 0, liens: [],
        noeuds: [
            { id: 'orig', type: 'activite', titre: 'Original', x: 0, y: 0, parent: null,
              enfants: [], metadata: { duree: 30 }, cloneSourceId: null },
            { id: 'c1', type: 'activite', titre: 'Original', x: 60, y: 60, parent: null,
              enfants: [], metadata: { duree: 30 }, cloneSourceId: 'orig' },
            { id: 'c2', type: 'activite', titre: 'Original', x: 120, y: 120, parent: null,
              enfants: [], metadata: { duree: 30 }, cloneSourceId: 'orig' }
        ].concat(extra || [])
    });
    api.chargerCarte('c1');
    // Le chargeur PRÉFIXE les ids.
    return { orig: 'planif-orig', c1: 'planif-c1', c2: 'planif-c2' };
}

describe('Détacher un clone de sa famille', () => {
    let api;
    beforeEach(() => { api = monter(); });

    it('détacher UN clone ne libère que lui', () => {
        const ID = familleDEssai(api);
        expect(api.detacherDeLaFamille([ID.c1])).toBe(1);
        expect(api.etat.noeuds.get(ID.c1).cloneSourceId).toBeNull();
        // L'autre clone reste dans la famille.
        expect(api.etat.noeuds.get(ID.c2).cloneSourceId).toBe(ID.orig);
    });

    it('⚠⚠ le bloc détaché CESSE de suivre son original — c’est tout l’objet', () => {
        const ID = familleDEssai(api);
        api.detacherDeLaFamille([ID.c1]);
        api.definirTypeNoeud(ID.orig, 'soutien');
        expect(api.etat.noeuds.get(ID.c1).type, 'le détaché a suivi malgré tout').toBe('activite');
        // …et celui qui est resté, lui, suit toujours.
        expect(api.etat.noeuds.get(ID.c2).type).toBe('soutien');
    });

    it('⚠ RIEN D’AUTRE ne bouge — détacher n’est pas défaire', () => {
        // Détacher arrête les propagations FUTURES ; il ne rend pas au bloc un
        // état d'avant. Ce qu'il avait reçu, il le garde.
        const ID = familleDEssai(api);
        const avant = JSON.parse(JSON.stringify(api.etat.noeuds.get(ID.c1)));
        api.detacherDeLaFamille([ID.c1]);
        const apres = api.etat.noeuds.get(ID.c1);
        expect(apres.titre).toBe(avant.titre);
        expect(apres.type).toBe(avant.type);
        expect(apres.metadata).toEqual(avant.metadata);
        expect(apres.x).toBe(avant.x);
        expect(apres.y).toBe(avant.y);
        expect(apres.parent).toBe(avant.parent);
        // Seul `cloneSourceId` a changé.
        expect(avant.cloneSourceId).toBe(ID.orig);
        expect(apres.cloneSourceId).toBeNull();
    });

    it('⚠⚠ détacher l’ORIGINAL dissout la famille ENTIÈRE', () => {
        // Un original ne peut pas « partir » en laissant ses clones pointer vers
        // lui : ou il reste, ou la famille n'existe plus. Prétendre le détacher
        // seul laisserait des clones visant un id qui n'est plus une source —
        // un état que rien dans le module ne sait lire.
        const ID = familleDEssai(api);
        expect(api.detacherDeLaFamille([ID.orig])).toBe(2);
        expect(api.etat.noeuds.get(ID.c1).cloneSourceId).toBeNull();
        expect(api.etat.noeuds.get(ID.c2).cloneSourceId).toBeNull();
        // Plus aucune propagation nulle part.
        api.definirTypeNoeud(ID.orig, 'revision');
        expect(api.etat.noeuds.get(ID.c1).type).toBe('activite');
        expect(api.etat.noeuds.get(ID.c2).type).toBe('activite');
    });

    it('rend 0 sur un bloc sans famille, et n’écrit rien', () => {
        const ID = familleDEssai(api, [
            { id: 'seul', type: 'expose', titre: 'Seul', x: 300, y: 300, parent: null,
              enfants: [], metadata: {}, cloneSourceId: null }
        ]);
        expect(api.detacherDeLaFamille(['planif-seul'])).toBe(0);
        expect(api.etat.noeuds.get(ID.c1).cloneSourceId, 'une famille voisine a été touchée')
            .toBe(ID.orig);
    });

    it('rend 0 sur une sélection vide ou inconnue', () => {
        familleDEssai(api);
        expect(api.detacherDeLaFamille([])).toBe(0);
        expect(api.detacherDeLaFamille(null)).toBe(0);
        expect(api.detacherDeLaFamille(['inexistant'])).toBe(0);
    });

    it('⚠ le résultat ne dépend PAS de l’ordre de la sélection', () => {
        // L'original ET un de ses clones sélectionnés ensemble : dissoudre la
        // famille en la parcourant ferait dépendre le compte de l'ordre.
        const a = monter(); const IDa = familleDEssai(a);
        const nA = a.detacherDeLaFamille([IDa.orig, IDa.c1]);
        const b = monter(); const IDb = familleDEssai(b);
        const nB = b.detacherDeLaFamille([IDb.c1, IDb.orig]);
        expect(nA).toBe(nB);
        expect(nA).toBe(2);
    });

    it('⚠ l’index inverse est PURGÉ, pas seulement le champ', () => {
        // Si `_cloneIndex` gardait l'entrée, `trouverClones` continuerait de
        // rendre le bloc détaché et la propagation le rattraperait — le champ
        // dirait « libre » et le comportement dirait le contraire.
        const ID = familleDEssai(api);
        api.detacherDeLaFamille([ID.c1]);
        const famille = api.trouverClones ? api.trouverClones(ID.orig).map(n => n.id) : null;
        if (famille) expect(famille).not.toContain(ID.c1);
        // Preuve par le comportement, qui vaut mieux que par l'index :
        api.definirTypeNoeud(ID.orig, 'soutien');
        expect(api.etat.noeuds.get(ID.c1).type).toBe('activite');
    });

    it('l’annulation est enregistrée AVANT l’écriture, et seulement s’il y a matière', () => {
        const corps = source.slice(source.indexOf('function detacherDeLaFamille'),
            source.indexOf('* Dupliquer TOUTE la multi-sélection'));
        // Le garde de vacuité précède l'empilement : détacher « rien » ne doit
        // pas consommer un cran d'annulation.
        expect(corps.indexOf('if (aDetacher.size === 0) return 0;'))
            .toBeLessThan(corps.indexOf('enregistrerPourUndo()'));
        expect(corps.indexOf('enregistrerPourUndo()')).toBeGreaterThan(-1);
    });

    it('le geste existe dans le menu Actions, et il dit qu’il porte sur la sélection', () => {
        expect(html).toMatch(/id="planif-btn-detacher-clone"/);
        expect(source).toMatch(/planif-btn-detacher-clone/);
        // ⚠ Sans retour visible, un clic qui ne trouve rien à détacher passerait
        // pour une panne. Les deux issues muettes sont DITES.
        expect(source).toMatch(/Sélectionne d’abord un bloc marqué/);
        expect(source).toMatch(/Rien à décloner/);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// DÉCLONER (3 septembre 2026, décision de Grégoire) — un mot, deux entrées,
// UNE fonction.
//
// L'incident : il a cherché « décloner » dans sa propre application et n'a
// rien trouvé. L'Inspecteur annonçait « 🧬 N instances » sans offrir d'en
// sortir ; le geste ne vivait qu'au menu Actions, sous « Détacher de sa
// famille de clones ». Le lot renomme, et pose le bouton là où on le cherche.
//
// ⚠ Les deux invariants qui comptent : le menu Actions GARDE son bouton — lui
// seul sert la multisélection, `detacherDeLaFamille` prend une liste — et la
// logique n'est PAS dupliquée : deux appels d'une fonction, pas deux fonctions.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Un DOM juste assez vrai pour ouvrir l'Inspecteur et cliquer dedans.
 * Chaque id rend toujours le MÊME stub (registre), les écouteurs sont
 * conservés pour être déclenchés, et ce que `afficherToastLien` appose au
 * <body> est relu comme « ce que l'écran a dit ».
 */
function fauxDom() {
    const registre = new Map();
    const corps = [];
    const sansEffet = () => {};
    function stub(id) {
        return {
            id, style: {}, dataset: {}, value: '', textContent: '', innerHTML: '', className: '',
            title: '', hidden: false, disabled: false, checked: false, tagName: 'DIV', nodeType: 1,
            children: [], childNodes: [], firstChild: null, parentNode: null, parentElement: null,
            offsetWidth: 0, offsetHeight: 0, clientWidth: 0, clientHeight: 0, scrollLeft: 0, scrollTop: 0,
            options: [], selectedIndex: 0, _ecouteurs: {},
            classList: { add: sansEffet, remove: sansEffet, contains: () => false, toggle: sansEffet },
            addEventListener(type, fn) { (this._ecouteurs[type] = this._ecouteurs[type] || []).push(fn); },
            removeEventListener: sansEffet, setAttribute: sansEffet, removeAttribute: sansEffet,
            getAttribute: () => null, hasAttribute: () => false, matches: () => false, closest: () => null,
            contains: () => false, appendChild: sansEffet, insertBefore: sansEffet, removeChild: sansEffet,
            replaceChildren: sansEffet, remove: sansEffet, focus: sansEffet, blur: sansEffet, select: sansEffet,
            click: sansEffet, cloneNode() { return stub(id); },
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }),
            querySelector(sel) { return stub(String(sel).replace(/^#/, '')); },
            querySelectorAll() { return []; }
        };
    }
    const doc = {
        getElementById(id) { if (!registre.has(id)) registre.set(id, stub(id)); return registre.get(id); },
        querySelector: () => null, querySelectorAll: () => [],
        createElement: (tag) => stub(tag),
        createDocumentFragment: () => stub('fragment'),
        createTextNode: (t) => ({ textContent: t, nodeType: 3 }),
        addEventListener: sansEffet, removeEventListener: sansEffet,
        activeElement: null,
        body: Object.assign(stub('body'), { appendChild(el) { corps.push(el); } }),
        documentElement: stub('html')
    };
    return {
        doc,
        el: (id) => doc.getElementById(id),
        cliquer(id) { (doc.getElementById(id)._ecouteurs.click || []).forEach(fn => fn({ preventDefault: sansEffet, stopPropagation: sansEffet })); },
        toasts: () => corps.filter(e => e.className === 'planif-toast-lien').map(e => e.textContent)
    };
}

function monterAvecDom() {
    const dom = fauxDom();
    const store = {};
    const fenetre = {
        addEventListener() {}, removeEventListener() {},
        innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
        matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
        getComputedStyle: () => ({ getPropertyValue: () => '' })
    };
    win = chargerScript('js/planification-carte.js', {
        document: dom.doc,
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => k,
        echapperHtml: (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;'),
        // Rien d'asynchrone ne se déclenche : ni boucle d'animation, ni
        // minuterie — l'essai lit l'état tout de suite après le geste.
        requestAnimationFrame: () => 0, cancelAnimationFrame() {},
        setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
        getComputedStyle: () => ({ getPropertyValue: () => '' }),
        matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
        navigator: { userAgent: 'essai', platform: 'MacIntel', maxTouchPoints: 0 },
        location: { href: '', search: '', hash: '', pathname: '' },
        ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
        MutationObserver: class { observe() {} disconnect() {} },
        IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
        alert() {}, confirm: () => false, prompt: () => null
    }, fenetre);
    win.cle = (k) => k;
    // Le module de données répond à TOUT par un no-op, sauf ce dont la forme
    // compte : `initialiser()` en appelle une douzaine de méthodes que l'essai
    // n'exerce pas.
    const base = {
        getIndex: () => ({ active: 'c1', cartes: [{ id: 'c1', nom: 'Essai' }] }),
        listerCartes: () => [{ id: 'c1', nom: 'Essai' }],
        sauvegarderCarte: () => {}, sauvegarderIndex: () => {}, chargerCarte: () => null,
        migrerDonneesProto: () => {},
        initialiserSiNecessaire() { return base.getIndex(); }
    };
    win.planificationDonnees = new Proxy(base, {
        get: (cible, prop) => (prop in cible ? cible[prop] : () => undefined)
    });
    return { api: win.planificationCarte, dom };
}

describe('Décloner (3 sept. 2026) : un mot, deux entrées, une fonction', () => {

    it('⚠⚠ l’Inspecteur offre « Décloner » sur un clone, et le bouton déclone CE bloc, lui seul', () => {
        const { api, dom } = monterAvecDom();
        api.initialiser();
        const ID = familleDEssai(api);
        api.ouvrirPanneau(ID.c1);
        const coin = dom.el('planif-panneau-clone-info');
        expect(coin.style.display).toBe('');
        expect(coin.innerHTML).toMatch(/id="planif-btn-decloner"/);
        expect(coin.innerHTML).toMatch(/>Décloner</);
        const btn = dom.el('planif-btn-decloner');
        expect(typeof btn.onclick, 'le bouton est dessiné mais ne fait rien').toBe('function');

        btn.onclick();
        expect(api.etat.noeuds.get(ID.c1).cloneSourceId).toBeNull();
        // L'autre clone n'a pas bougé : l'Inspecteur décrit UN bloc.
        expect(api.etat.noeuds.get(ID.c2).cloneSourceId).toBe(ID.orig);
        // Le message dit ce qui NE se passe pas.
        expect(dom.toasts().pop()).toBe('Bloc décloné — il ne suivra plus son original, et son original ne le suivra plus. Son contenu est inchangé.');
        // Plus d'instances à annoncer : le coin s'efface.
        expect(coin.style.display).toBe('none');
    });

    it('l’Inspecteur n’offre PAS « Décloner » sur un bloc qui n’a rien à décloner', () => {
        const { api, dom } = monterAvecDom();
        api.initialiser();
        familleDEssai(api, [
            { id: 'seul', type: 'activite', titre: 'Seul', x: 300, y: 300, parent: null,
              enfants: [], metadata: {}, cloneSourceId: null }
        ]);
        api.ouvrirPanneau('planif-seul');
        const coin = dom.el('planif-panneau-clone-info');
        expect(coin.style.display).toBe('none');
        expect(coin.innerHTML).not.toMatch(/planif-btn-decloner/);
    });

    it('⚠⚠ TÉMOIN NÉGATIF : le menu Actions déclone encore une MULTISÉLECTION, en un geste', () => {
        // C'est la raison pour laquelle le bouton du menu n'a pas été retiré.
        const { api, dom } = monterAvecDom();
        api.initialiser();
        const ID = familleDEssai(api);
        api.etat.multiSelection.add(ID.c1);
        api.etat.multiSelection.add(ID.c2);
        dom.cliquer('planif-btn-detacher-clone');
        expect(api.etat.noeuds.get(ID.c1).cloneSourceId).toBeNull();
        expect(api.etat.noeuds.get(ID.c2).cloneSourceId).toBeNull();
        expect(dom.toasts().pop()).toBe('2 blocs déclonés — ils ne se suivent plus. Leur contenu est inchangé.');
    });

    it('le menu Actions DIT quand la sélection n’a rien à décloner — sans le mot « famille »', () => {
        const { api, dom } = monterAvecDom();
        api.initialiser();
        familleDEssai(api, [
            { id: 'seul', type: 'activite', titre: 'Seul', x: 300, y: 300, parent: null,
              enfants: [], metadata: {}, cloneSourceId: null }
        ]);
        api.etat.selection = 'planif-seul';
        dom.cliquer('planif-btn-detacher-clone');
        const dit = dom.toasts().pop();
        expect(dit).toMatch(/^Rien à décloner/);
        expect(dit).not.toMatch(/famille/);
    });

    it('⚠ NON-DUPLICATION : une seule définition de detacherDeLaFamille, deux appels', () => {
        // Le témoin de la consigne du 3 septembre : « deux appels d'une
        // fonction, pas deux fonctions ». L'export ne compte pas comme appel.
        const definitions = source.match(/function detacherDeLaFamille\(/g) || [];
        const appels = source.match(/(?<!function )detacherDeLaFamille\(/g) || [];
        expect(definitions).toHaveLength(1);
        expect(appels).toHaveLength(2);
        // …et le message d'après-geste n'existe qu'à UN endroit.
        expect(source.match(/Son contenu est inchangé\./g)).toHaveLength(1);
    });

    it('le mot est « Décloner », et « famille de clones » a quitté ce que l’utilisateur lit', () => {
        const hover = readFileSync(path.join(racine, 'js', 'accompagnement-contenu-hover.js'), 'utf8');
        const popup = readFileSync(path.join(racine, 'js', 'accompagnement-contenu-popup.js'), 'utf8');
        // Le bouton du menu Actions porte le mot.
        expect(html).toMatch(/id="planif-btn-detacher-clone"[^>]*>Décloner la sélection<\/button>/);
        // L'aide longue nomme les DEUX chemins — sinon elle envoie à un seul
        // endroit alors qu'il y en a deux, le défaut d'origine.
        // ↻ #1152, lot 2b (27 oct. 2026) : l'entrée `lecons` de l'onglet Aide perd son paragraphe « Décloner un bloc »
        // (audit de l'Aide du 24 oct., `lecons` : « Copier, cloner […] redisent le panneau Vue › Raccourcis clavier et
        // l'infobulle `planif-detacher-clone` » ; verdict « corriger et resserrer », ~200 mots ; consigne
        // CONSIGNE-LOT-2026-10-27-aide-lot-2b-conception.md, § 2, entrée 3). L'aide longue qui reste est l'aide « i » de
        // la carte : c'est elle qui doit nommer les deux chemins.
        expect(html).not.toMatch(/<strong>Décloner un bloc :<\/strong>/);
        const aide = popup.match(/Décloner<\/em>, dans l’Inspecteur[^']*Actions ▸ Décloner la sélection[^']*'/);
        expect(aide, 'l’aide « i » de la carte ne nomme plus les deux chemins de « Décloner »').not.toBeNull();
        for (const [nom, texte] of [['index.html', html], ['hover', hover], ['popup', popup]]) {
            expect(texte, nom + ' parle encore de « famille de clones »').not.toMatch(/famille de clones/i);
        }
        // Le seul « famille de clones » qui reste dans js/ est l'annonce déjà
        // lue du 16 août (changelog) — on ne réécrit pas une annonce passée.
        expect(source).not.toMatch(/'[^'\n]*famille de clones[^'\n]*'/);
    });
});

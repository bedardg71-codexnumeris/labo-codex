import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche, position } from './_helpers/tranche.js';

// MÉMOS DU CANEVAS (28 nov. 2026) — demande de Grégoire : des post-it sur le canevas de la carte
// d'alignement, qui ACCOMPAGNENT la carte SANS EN FAIRE PARTIE.
//
// LE RISQUE PRINCIPAL DU LOT : la carte est recopiée à plusieurs endroits ; un site oublié et des
// mémos se perdent en chemin — ou, à l'inverse, sortent dans un fichier remis à un collègue.
// Ce banc joue CHAQUE site sur le vrai code (canevas, couche de données), avec un faux stockage :
//
//   EMPORTENT les mémos                          ÉCARTENT les mémos
//   1. clonerEtatPersistant  (instantané)        8. exporterCarte            (fichier .json)
//   2. restaurerSnapshot     (annuler/rétablir)  9. exporterCartePourBibliotheque, par défaut
//   3. sauvegarder           (enregistrement)        (fichier d'« Exporter »)
//   4. chargerCarte          (ouverture)        10. l'import d'un fichier reçu (sansMemos)
//   5. dupliquerCarte        (copie)            11. l'export du plan (ne lit que les blocs)
//   6. exporterCartePourBibliotheque({ avecMemos }) + importerDepuisBibliotheque (ma bibliothèque)
//   7. importerCarteDepuisTrimestre (reprise d'un trimestre)
//
// Les gestes à l'écran (palette, glisser, corbeille, interrupteur) sont au banc Playwright
// `planif-memos-canevas.spec.js`.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');

const MARQUE = 'MEMO-TEMOIN-4K';
const MEMO = { id: 'planif-memo_1', texte: MARQUE + '\nligne 2', x: 40, y: -60, l: 300, h: 200 };
const bloc = (n, type, extra) => Object.assign({ id: 'planif-noeud_' + n, type, titre: 'Bloc ' + n, description: '', x: n * 10, y: 0,
    parent: null, enfants: [], metadata: {}, cloneSourceId: null }, extra || {});

function monter(cartes) {
    const store = {
        'a2026_planification_mindmap': {
            index: { active: 'carte_1', compteurCartes: 1, cartes: [{ id: 'carte_1', nom: 'Ma carte', dateCreation: '2026-11-01T00:00:00.000Z' }] },
            cartes: cartes || {}
        }
    };
    const db = {
        getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); }
    };
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '', value: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {}, click() {}, focus() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const blobs = [];
    const globaux = {
        db,
        cle: (k) => 'a2026_' + k,
        cleSource: (k, t) => t + '_' + k,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        prompt: (q, defaut) => defaut,
        Blob: function (parts) { blobs.push(parts.join('')); },
        URL: { createObjectURL: () => 'blob:banc', revokeObjectURL() {} },
        document: {
            getElementById: () => null, querySelectorAll: () => [], querySelector: () => null,
            addEventListener: () => {}, createElement: fauxElement, createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        }
    };
    const win = chargerScript('js/planification-donnees.js', globaux);
    chargerScript('js/planification-carte.js', globaux, win);
    return { win, store, blobs, carte: win.planificationCarte, donnees: win.planificationDonnees, memos: win.planificationMemos };
}

const carteAvecMemo = () => ({ compteur: 2, compteurLiens: 1,
    noeuds: [bloc(1, 'lecon', { enfants: ['planif-noeud_2'] }), bloc(2, 'activite', { parent: 'planif-noeud_1' })],
    liens: [{ id: 'planif-lien_1', source: 'planif-noeud_1', cible: 'planif-noeud_2', type: 'se_realise_par' }],
    memos: [Object.assign({}, MEMO)] });
const carteSansMemo = () => { const c = carteAvecMemo(); delete c.memos; return c; };
const enregistree = (b, id) => b.store['a2026_planification_mindmap'].cartes[id || 'carte_1'];

describe('Mémos · le module pur', () => {
    const { memos: M } = monter();

    it('normalise n\'importe quoi sans jamais lever, et rend des objets neufs', () => {
        expect(M.normaliser(undefined)).toEqual([]);
        expect(M.normaliser('texte')).toEqual([]);
        expect(M.normaliser([null, 3, 'x', []])).toEqual([]);
        const source = { id: 'planif-memo_7', texte: 'a', x: 1, y: 2, l: 300, h: 200 };
        const [m] = M.normaliser([source]);
        expect(m).toEqual(source);
        expect(m).not.toBe(source);
    });

    it('répare un mémo abîmé : texte non textuel, coordonnées folles, tailles hors bornes, id pris ou mal formé', () => {
        const L = M.LIMITES;
        const propres = M.normaliser([
            { id: 'planif-memo_2', texte: { html: '<b>' }, x: 'abc', y: NaN, l: 5, h: 99999 },
            { id: 'planif-memo_2', texte: 'doublon' },
            { id: 'planif-noeud_9', texte: 'x'.repeat(L.TEXTE_MAX + 10) }
        ]);
        expect(propres[0]).toEqual({ id: 'planif-memo_2', texte: '', x: 0, y: 0, l: L.L_MIN, h: L.H_MAX });
        expect(new Set(propres.map(m => m.id)).size, 'trois ids distincts').toBe(3);
        expect(propres.every(m => /^planif-memo_\d+$/.test(m.id))).toBe(true);
        expect(propres[2].texte.length).toBe(L.TEXTE_MAX);
    });

    it('le texte garde ses retours à la ligne et ses chevrons : c\'est du texte, rien n\'est retiré ni interprété', () => {
        const texte = 'Élément 1\n\n<script>alert(1)</script>\n\tindenté & "cité"';
        expect(M.normaliser([{ id: 'planif-memo_1', texte }])[0].texte).toBe(texte);
    });

    it('poserMemos ne pose la clé que s\'il y a des mémos ; sansMemos l\'écarte sans toucher l\'entrée', () => {
        expect('memos' in M.poserMemos({ noeuds: [] }, new Map())).toBe(false);
        expect('memos' in M.poserMemos({ noeuds: [], memos: [MEMO] }, []), 'une clé périmée est retirée').toBe(false);
        expect(M.poserMemos({}, new Map([[MEMO.id, MEMO]])).memos).toEqual([MEMO]);
        const entree = { noeuds: [1], liens: [], memos: [MEMO] };
        const sortie = M.sansMemos(entree);
        expect(sortie).toEqual({ noeuds: [1], liens: [] });
        expect(entree.memos, 'l\'entrée n\'est pas mutée').toEqual([MEMO]);
        expect(M.sansMemos(null)).toBe(null);
    });

    it('un id neuf ne reprend jamais un id vivant', () => {
        const map = M.chargerDans(new Map(), [{ id: 'planif-memo_3' }, { id: 'planif-memo_8' }]);
        expect(M.prochainId(map)).toBe('planif-memo_9');
        expect(M.prochainId(new Map())).toBe('planif-memo_1');
    });

    it('le texte n\'entre jamais dans le DOM comme HTML : aucun innerHTML dans le module', () => {
        const source = lire('js/planification-memos.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        expect(source).not.toMatch(/innerHTML|outerHTML|insertAdjacentHTML/);
        expect(source).toMatch(/champ\.value = m\.texte/);
        expect(source).toMatch(/createElement\('textarea'\)/);
        expect(source).not.toMatch(/console\.log/);
    });
});

describe('Mémos · les sites qui EMPORTENT', () => {
    let b;
    beforeEach(() => { b = monter({ carte_1: carteAvecMemo() }); b.carte.chargerCarte('carte_1'); });

    it('4. chargerCarte — la collection vivante reçoit les mémos enregistrés, et rien d\'autre ne les reçoit', () => {
        expect(Array.from(b.carte.etat.memos.values())).toEqual([MEMO]);
        expect(b.carte.etat.noeuds.size).toBe(2);
        expect(Array.from(b.carte.etat.noeuds.keys()).some(k => k.includes('memo'))).toBe(false);
    });

    it('3. sauvegarder — l\'enregistrement porte les mémos', () => {
        b.carte.etat.memos.get(MEMO.id).texte = 'retouché';
        b.carte.sauvegarder();
        expect(enregistree(b).memos).toEqual([Object.assign({}, MEMO, { texte: 'retouché' })]);
        expect(enregistree(b).noeuds).toHaveLength(2);
    });

    it('1 et 2. instantané et restauration — annuler ramène un mémo supprimé, rétablir le retire', () => {
        const instantane = b.carte.clonerEtatPersistant();
        expect(instantane.memos).toEqual([MEMO]);
        expect(instantane.memos[0], 'une copie, pas la référence vivante').not.toBe(b.carte.etat.memos.get(MEMO.id));

        b.carte.etat.memos.delete(MEMO.id);
        b.carte.sauvegarder();
        expect('memos' in enregistree(b)).toBe(false);

        b.carte.restaurerSnapshot(instantane);
        expect(Array.from(b.carte.etat.memos.values())).toEqual([MEMO]);
        expect(enregistree(b).memos, 'la restauration réenregistre AVEC les mémos').toEqual([MEMO]);

        b.carte.restaurerSnapshot(Object.assign({}, instantane, { memos: [] }));
        expect(b.carte.etat.memos.size).toBe(0);
        expect('memos' in enregistree(b)).toBe(false);
    });

    it('2 bis. créer, écrire et supprimer un mémo passent par les piles du canevas : annuler() et retablir() les défont et les refont', () => {
        // Le module des mémos branché comme le fait `initialiser()`, sans couche (pas de DOM au banc).
        const annonces = [];
        b.memos.brancher({ memos: b.carte.etat.memos, couche: null, zoom: () => 1,
            avantModification: b.carte.enregistrerPourUndo, enregistrer: b.carte.sauvegarder,
            placeNeuve: () => ({ x: 500, y: 500 }), surCorbeille: () => false, annoncer: (m) => annonces.push(m) });

        const id = b.memos.creer();
        expect(id).toBe('planif-memo_2');
        expect(enregistree(b).memos.map(m => m.id)).toEqual(['planif-memo_1', 'planif-memo_2']);
        b.carte.annuler();
        expect(Array.from(b.carte.etat.memos.keys())).toEqual(['planif-memo_1']);
        expect(enregistree(b).memos).toHaveLength(1);
        b.carte.retablir();
        expect(b.carte.etat.memos.has('planif-memo_2')).toBe(true);

        b.memos.supprimer(MEMO.id);
        expect(b.carte.etat.memos.has(MEMO.id)).toBe(false);
        expect(enregistree(b).memos.map(m => m.id)).toEqual(['planif-memo_2']);
        expect(annonces, 'la suppression annonce sa porte de sortie').toEqual([b.memos.TEXTES.supprime]);
        b.carte.annuler();
        expect(b.carte.etat.memos.get(MEMO.id)).toEqual(MEMO);
        expect(enregistree(b).memos.find(m => m.id === MEMO.id).texte).toBe(MEMO.texte);
        b.carte.retablir();
        expect(b.carte.etat.memos.has(MEMO.id)).toBe(false);
    });

    it('5. dupliquerCarte — la copie a les mémos, indépendants de l\'original', () => {
        const id = b.carte.dupliquerCarte('carte_1');
        expect(id).toBe('carte_2');
        expect(enregistree(b, 'carte_2').memos).toEqual([MEMO]);
        b.carte.etat.memos.get(MEMO.id).texte = 'dans la copie';
        b.carte.sauvegarder();
        expect(enregistree(b, 'carte_2').memos[0].texte).toBe('dans la copie');
        expect(enregistree(b, 'carte_1').memos[0].texte).toBe(MEMO.texte);
    });

    it('6. ma bibliothèque — gardés à l\'aller ({ avecMemos }), rendus au retour', () => {
        const garde = b.donnees.exporterCartePourBibliotheque('carte_1', { avecMemos: true });
        expect(garde.donnees.memos).toEqual([MEMO]);
        const id = b.donnees.importerDepuisBibliotheque({ nom: 'De ma bibliothèque', donnees: garde.donnees });
        expect(enregistree(b, id).memos).toEqual([MEMO]);
        expect(enregistree(b, id).memos, 'copie profonde').not.toBe(garde.donnees.memos);
    });

    it('7. reprise d\'un autre trimestre — les mémos suivent, la source reste intacte', () => {
        b.store['h2026_planification_mindmap'] = JSON.parse(JSON.stringify(b.store['a2026_planification_mindmap']));
        const avant = JSON.stringify(b.store['h2026_planification_mindmap']);
        const id = b.donnees.importerCarteDepuisTrimestre('h2026', 'carte_1');
        expect(id).toBeTruthy();
        expect(enregistree(b, id).memos).toEqual([MEMO]);
        expect(JSON.stringify(b.store['h2026_planification_mindmap'])).toBe(avant);
    });
});

describe('Mémos · les sites qui ÉCARTENT', () => {
    let b;
    beforeEach(() => { b = monter({ carte_1: carteAvecMemo() }); b.carte.chargerCarte('carte_1'); });

    it('8. exporterCarte — le fichier remis porte les blocs et les liens, aucun mémo', () => {
        b.carte.exporterCarte();
        expect(b.blobs).toHaveLength(1);
        const fichier = JSON.parse(b.blobs[0]);
        expect(fichier.noeuds).toHaveLength(2);
        expect(fichier.liens).toHaveLength(1);
        expect('memos' in fichier).toBe(false);
        expect(b.blobs[0]).not.toContain(MARQUE);
    });

    it('9. exporterCartePourBibliotheque sans option (le fichier d\'« Exporter ») — aucun mémo', () => {
        const pourFichier = b.donnees.exporterCartePourBibliotheque('carte_1');
        expect(pourFichier.donnees.noeuds).toHaveLength(2);
        expect(JSON.stringify(pourFichier)).not.toContain(MARQUE);
        expect('memos' in pourFichier.donnees).toBe(false);
    });

    it('9 bis. la bibliothèque : seul « Garder dans ma bibliothèque » demande les mémos ; le fichier exporté ne les demande pas', () => {
        const source = lire('js/planification-bibliotheque.js');
        const corps = (nom) => tranche(source, 'async function ' + nom + '(', '\nasync function ', { longueurMin: 200 });
        expect(corps('partagerAlignement')).toMatch(/exporterCartePourBibliotheque\(carteId, \{ avecMemos: true \}\)/);
        expect(corps('exporterAlignementJSON')).toMatch(/exporterCartePourBibliotheque\(carteId\)/);
        expect(corps('exporterAlignementJSON')).not.toMatch(/avecMemos: true/);
        expect((source.match(/avecMemos: true/g) || []).length, 'un seul demandeur dans la bibliothèque').toBe(1);
    });

    it('10. un fichier reçu passe par sansMemos avant d\'entrer en bibliothèque', () => {
        const source = lire('js/planification-bibliotheque.js');
        const bloc = tranche(source, 'if (data.metadata_cc && data.donnees) {', 'await ajouterAlignementALaBibliotheque(item);', { longueurMin: 200 });
        expect(bloc).toMatch(/donnees: window\.planificationMemos\.sansMemos\(data\.donnees\)/);
        expect(bloc).not.toMatch(/donnees: data\.donnees\b/);
        // L'autre chemin d'import (fichier sans métadonnées) recompose le contenu champ par champ, sans `memos`.
        const direct = tranche(source, '// Sinon → import direct dans le trimestre actif.', 'if (nouvelId && window.planificationCarte) {', { longueurMin: 300 });
        expect(direct).toMatch(/noeuds: contenu\.noeuds,/);
        expect(direct).not.toMatch(/memos/);
    });

    it('11. l\'export du plan ne voit pas les mémos : sa traversée et ses documents n\'en portent aucun', () => {
        chargerScript('js/horaire.js', {}, b.win);
        const globaux = { db: { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} }, cle: (k) => 'a2026_' + k, echapperHtml: (t) => String(t ?? '') };
        chargerScript('js/planification-export.js', globaux, b.win);
        const E = b.win.planificationExport;
        expect(JSON.stringify(E.construirePlan())).not.toContain(MARQUE);
        let rendus = 0;
        E.NIVEAUX.forEach((n) => E.FORMATS.forEach((f) => {
            let doc = null;
            try { doc = E.genererExport(n.id, f.id); } catch (e) { doc = null; }
            if (typeof doc === 'string' && doc.length) { rendus++; expect(doc).not.toContain(MARQUE); }
        }));
        expect(rendus, 'des documents ont bien été rendus : l\'assertion n\'est pas vide').toBeGreaterThanOrEqual(3);
    });
});

describe('Mémos · une carte d\'avant le lot', () => {
    it('s\'ouvre, s\'enregistre et s\'annule sans gagner de clé « memos » : aucun octet ne change', () => {
        const b = monter({ carte_1: carteSansMemo() });
        const avant = JSON.stringify(enregistree(b));
        b.carte.chargerCarte('carte_1');
        expect(b.carte.etat.memos.size).toBe(0);
        b.carte.sauvegarder();
        expect(JSON.stringify(enregistree(b))).toBe(avant);
        const instantane = b.carte.clonerEtatPersistant();
        b.carte.restaurerSnapshot(instantane);
        expect('memos' in enregistree(b)).toBe(false);
        expect(enregistree(b).noeuds).toHaveLength(2);
    });

    it('changer de carte ne laisse pas les mémos de l\'une dans l\'autre', () => {
        const b = monter({ carte_1: carteAvecMemo(), carte_2: carteSansMemo() });
        b.store['a2026_planification_mindmap'].index.cartes.push({ id: 'carte_2', nom: 'Autre' });
        b.carte.chargerCarte('carte_1');
        expect(b.carte.etat.memos.size).toBe(1);
        b.carte.changerCarte('carte_2');
        expect(b.carte.etat.memos.size, 'la collection est vidée au changement').toBe(0);
        expect('memos' in enregistree(b, 'carte_2')).toBe(false);
        expect(enregistree(b, 'carte_1').memos, 'la carte quittée garde les siens').toEqual([MEMO]);
    });

    it('une carte NEUVE (encore sans contenu) n\'hérite pas des mémos de la carte quittée', () => {
        // `chargerCarte` sort tôt quand la carte n'a pas de contenu : c'est `viderCanvas` qui vide la collection.
        const b = monter({ carte_1: carteAvecMemo() });
        b.store['a2026_planification_mindmap'].index.cartes.push({ id: 'carte_2', nom: 'Neuve' });
        b.carte.chargerCarte('carte_1');
        b.carte.changerCarte('carte_2');
        expect(b.carte.etat.memos.size).toBe(0);
        b.carte.sauvegarder();
        expect('memos' in enregistree(b, 'carte_2'), 'la carte neuve s\'enregistre sans mémo').toBe(false);
        expect(enregistree(b, 'carte_1').memos).toEqual([MEMO]);
    });

    it('les mémos sont chargés AVANT tout réenregistrement du chargement (migration de liens)', () => {
        // Un lien à l'ancien verbe force `if (liensModifies) sauvegarder()` pendant chargerCarte.
        const source = lire('js/planification-carte.js');
        const corps = tranche(source, 'function chargerCarte(carteId) {', '\nfunction centrerVueSurContenu() {', { longueurMin: 2000 });
        const charge = position(corps, 'window.planificationMemos.chargerDans(etat.memos, donnees.memos)');
        expect(position(corps, 'if (liensModifies) sauvegarder();')).toBeGreaterThan(charge);
        expect(position(corps, 'migrerObjectifsVersMetadata();')).toBeGreaterThan(charge);
    });
});

describe('Mémos · hors du canevas, personne ne les lit', () => {
    // Les lecteurs des blocs nommés au mandat. Aucun ne doit apprendre le mot.
    const LECTEURS = ['js/planification-export.js', 'js/parcours-cours.js', 'js/reserve.js', 'js/donnees-v2.js',
        'js/trimestres.js', 'js/demo-namespace.js', 'js/main.js', 'js/parcours-evaluer.js'];
    it.each(LECTEURS)('%s ne lit ni `.memos` ni le module des mémos', (fichier) => {
        const source = lire(fichier);
        expect(source).not.toMatch(/\.memos\b|planificationMemos|planif-memo/);
    });

    it('les familles de types du canevas ne connaissent pas de type « mémo »', () => {
        const source = lire('js/planification-carte.js');
        expect(source).not.toMatch(/type:\s*'memo'|'memo':\s*\{|planif-type-memo/);
    });

    it('index.html charge le module avant ses trois lecteurs, et pose la couche et les deux commandes', () => {
        const html = lire('index.html');
        const pos = (f) => position(html, '<script src="js/' + f);
        const memos = pos('planification-memos.js');
        ['planification-donnees.js', 'planification-bibliotheque.js', 'planification-carte.js'].forEach((f) => expect(pos(f)).toBeGreaterThan(memos));
        expect(html).toContain('<div id="planif-couche-memos"></div>');
        expect(html).toMatch(/id="planif-palette-memo" data-action="planificationCarte\.creerMemo"/);
        expect(html).toMatch(/id="planif-btn-memos"[^>]*data-action="planificationCarte\.basculerMemos"/);
        // À l'écart des blocs : le bouton n'est pas un bouton de bloc.
        const bouton = tranche(html, '<div class="planif-palette-memo-zone">', '</button>', { longueurMin: 100 });
        expect(bouton).toContain('id="planif-palette-memo"');
        expect(bouton).not.toMatch(/planif-palette-btn|data-type|draggable/);
    });
});

describe('Mémos · les mots lus par l\'enseignant sont ceux du fichier TEXTES', () => {
    // `plans de travail/TEXTES-2026-11-28-memos-canevas.md` est ce que Grégoire relit : un mot corrigé là
    // sans l'être à sa source (ou l'inverse) rougit ici.
    const fichier = lire('plans de travail/TEXTES-2026-11-28-memos-canevas.md');
    const repere = (r) => tranche(fichier, '\n## ' + r + ' ·', '\n## ', { longueurMin: 20 }).split('\n').filter((l) => l.startsWith('> ')).map((l) => l.slice(2));
    const { memos: M } = monter();
    const html = lire('index.html');

    it.each([['M4', 'masquer'], ['M5', 'afficher'], ['M6', 'vide'], ['M7', 'barre'], ['M8', 'supprimer'], ['M9', 'poignee'],
        ['M10', 'supprime'], ['M11', 'tronque'], ['M12', 'etiquetteTexte']])('%s = TEXTES.%s', (r, cle) => {
        expect(repere(r)).toEqual([M.TEXTES[cle]]);
    });

    it('les neuf textes du module sont tous au fichier : aucun mot hors relecture', () => {
        expect(Object.keys(M.TEXTES).sort()).toEqual(['afficher', 'barre', 'etiquetteTexte', 'masquer', 'poignee', 'supprime', 'supprimer', 'tronque', 'vide']);
    });

    it('M1, M2, M3 = index.html', () => {
        const palette = tranche(html, '<button type="button" class="planif-palette-memo"', '</button>', { longueurMin: 100 });
        expect(palette).toContain('title="' + repere('M2')[0] + '"');
        expect(palette.replace(/<[^>]+>/g, '').trim()).toBe(repere('M1')[0]);
        const barre = tranche(html, 'id="planif-btn-memos"', '</button>', { longueurMin: 50 });
        expect(barre.endsWith('>' + repere('M3')[0])).toBe(true);
        expect(barre).toContain('title="' + repere('M4')[0] + '"');
    });
});

// AMENDEMENT DU 28 NOV. (10 h 25) — la palette « Nœuds » : version compacte, hauteur bornée, « Mémo » au pied.
// Les gestes et les mesures à l'écran sont au banc Playwright `planif-palette-compacte.spec.js`.
describe('Palette « Nœuds » · la hauteur disponible, et ce qui tient la garantie', () => {
    const { carte } = monter();
    const html = lire('index.html');
    const css = lire('styles.css');
    const sourceCarte = lire('js/planification-carte.js');
    const fichier = lire('plans de travail/TEXTES-2026-11-28-memos-canevas.md');
    const repere = (r) => tranche(fichier, '\n## ' + r + ' ·', '\n## ', { longueurMin: 20 }).split('\n').filter((l) => l.startsWith('> ')).map((l) => l.slice(2));

    it('la borne va du haut de la palette au bas de ce qu\'on VOIT, moins la marge', () => {
        // iPad couché, page descendue : la zone finit à 720, la fenêtre à 740 ; palette à 116.
        expect(carte.hauteurDisponiblePalette(116, 720, 740)).toBe(720 - 116 - 12);
        // Page en haut : le canevas dépasse sous la fenêtre, c'est la fenêtre qui borne.
        expect(carte.hauteurDisponiblePalette(296, 900, 740)).toBe(740 - 296 - 12);
        // Valeurs fractionnaires (une animation en cours) : jamais arrondie vers le haut.
        expect(carte.hauteurDisponiblePalette(129.08, 720, 740)).toBe(578);
    });

    it('descendue presque hors de vue, elle garde un minimum utilisable plutôt qu\'une hauteur nulle ou négative', () => {
        expect(carte.hauteurDisponiblePalette(700, 720, 740)).toBe(200);
        expect(carte.hauteurDisponiblePalette(900, 720, 740)).toBe(200);
    });

    it('trois étages : l\'en-tête, la liste qui défile, et « Mémo » au pied, HORS de la liste', () => {
        const palette = tranche(html, '<div id="planif-palette" class="planif-palette-flottante">', '<!-- #444 (10 août 2026)', { longueurMin: 3000 });
        const liste = tranche(palette, '<div class="planif-palette-contenu">', '<div class="planif-palette-memo-zone">', { longueurMin: 2000 });
        expect((liste.match(/class="planif-palette-btn"/g) || []).length, 'les dix-huit nœuds sont dans la liste').toBe(18);
        expect((liste.match(/<div class="planif-palette-categorie"/g) || []).length).toBe(6);
        // Entre le dernier nœud et la zone « Mémo », la liste est REFERMÉE : groupe, catégorie, contenu.
        const fin = tranche(liste, 'data-type="cloture"', undefined, { longueurMin: 50 });
        expect((fin.match(/<\/div>/g) || []).length, 'groupe, catégorie et liste fermés avant « Mémo »').toBe(3);
        expect(position(palette, 'id="planif-palette-version"')).toBeLessThan(position(palette, '<div class="planif-palette-contenu">'));
    });

    it('le style : seule la liste défile, sans entraîner le canevas ; le masquage de la palette tient toujours', () => {
        const regle = (selecteur) => tranche(css, '\n' + selecteur + ' {', '\n}', { longueurMin: 20 });
        expect(regle('#planif-palette > .planif-palette-contenu')).toMatch(/overflow-y: auto;[\s\S]*overscroll-behavior: contain;/);
        expect(regle('#planif-palette > .planif-palette-contenu')).toMatch(/min-height: 0;/);
        // `display: flex` sur l'id l'emporterait sur `.planif-palette-masquee { display: none }` : il est gardé par :not().
        expect(css).toContain('#planif-palette:not(.planif-palette-masquee) {');
        expect(css).not.toMatch(/\n#planif-palette \{[^}]*display: flex/);
        expect(regle('.planif-palette-compacte .planif-palette-groupe')).toMatch(/grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
        // Un nom entier : il peut passer à la ligne, il n'est ni coupé ni abrégé.
        const bouton = regle('.planif-palette-compacte .planif-palette-btn');
        expect(bouton).toMatch(/white-space: normal;/);
        expect(bouton).not.toMatch(/ellipsis|overflow: hidden|word-break/);
    });

    it('la borne est recalculée quand la fenêtre, la zone, la page ou une animation la changent, et quand la palette bouge', () => {
        const brancher = tranche(sourceCarte, 'function brancherPaletteNoeuds() {', '\n}\n', { longueurMin: 400 });
        ["window.addEventListener('resize', borner", "window.addEventListener('scroll', borner", 'observateur.observe(zone)', 'observateur.observe(document.body)',
            "document.addEventListener('transitionend', borner, true)"].forEach((m) => expect(brancher).toContain(m));
        const deplacer = tranche(sourceCarte, 'function rendrePaletteFlottante(palette) {', 'function onUp(e2) {', { longueurMin: 400 });
        expect(deplacer).toContain('bornerHauteurPaletteNoeuds();');
        expect(tranche(sourceCarte, 'function appliquerAffichagePalettes() {', '\n}\n', { longueurMin: 200 })).toContain('bornerHauteurPaletteNoeuds();');
    });

    it('le bouton de version suit le modèle des palettes d\'annotation : mêmes mots, une préférence, l\'étendue par défaut', () => {
        const modele = lire('js/travaux-outils.js');
        const mots = tranche(modele, 'function _texteBoutonVersion(compacte) {', '\n    }', { longueurMin: 40 }).replace(/\\u00e0/g, 'à').replace(/\\u00e9/g, 'é');
        expect(repere('M14')).toEqual(['Passer à la version compacte']);
        expect(repere('M15')).toEqual(['Passer à la version étendue']);
        expect(mots).toContain("'" + repere('M15')[0] + "'");
        expect(mots).toContain("'" + repere('M14')[0] + "'");
        const appliquer = tranche(sourceCarte, 'function appliquerVersionPaletteNoeuds() {', '\n}\n', { longueurMin: 200 });
        expect(appliquer).toContain("compacte ? '" + repere('M15')[0] + "' : '" + repere('M14')[0] + "'");
        const bouton = tranche(html, 'id="planif-palette-version"', '>', { longueurMin: 40 });
        expect(bouton).toContain('title="' + repere('M14')[0] + '"');
        expect(bouton).toContain('data-action="planificationCarte.basculerVersionPaletteNoeuds"');
        // L'étendue par défaut : seule une préférence à `true` rend la compacte.
        expect(tranche(sourceCarte, 'function paletteNoeudsCompacte() {', '\n}\n', { longueurMin: 60 })).toContain("obtenirPreference(PREF_PALETTE_NOEUDS_COMPACTE) === true");
    });

    it('M13 · la corbeille dit qu\'elle prend aussi un mémo, à l\'infobulle comme au lecteur d\'écran', () => {
        const corbeille = tranche(html, '<div id="planif-corbeille"', '>', { longueurMin: 40 });
        const [infobulle, nom] = repere('M13');
        expect(infobulle).toBe('Glisse un bloc ou un mémo ici pour le supprimer');
        expect(corbeille).toContain('title="' + infobulle + '"');
        expect(corbeille).toContain('aria-label="' + nom + '"');
        expect(html).not.toContain('Glisse un bloc ici pour le supprimer');
    });
});


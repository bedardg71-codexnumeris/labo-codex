import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { completerNoteParDefaut } from './_helpers/charger-script.js';   // #1137 : le module des nombres affichés

// SENTINELLE #749 — LA LISTE SUIVIE VIT PAR GROUPE-COURS, ET UNE LECTURE N'EFFACE RIEN.
//
// L'INCIDENT (audit du 6 sept. 2026, G-2, le seul MAJEUR du sous-onglet) : les
// élèves suivis (au plus cinq, les pilules colorées du Suivi du groupe) vivaient
// sous la clé NUE `etudiantsSuivis`, partagée entre trimestres et groupes, et
// `nettoyerEtudiantsSuivis` la RÉÉCRIVAIT filtrée par le groupe actif. Ouvrir
// « Détails » sous le groupe B écrivait `[]` : les suivis de A étaient perdus en
// base, à la simple consultation. Mesuré : `['2000001','2000002']` → `[]`.
// Grégoire a deux groupes-cours cet automne.
//
// CE QUI EST VERROUILLÉ ICI (lot 1 du cadrage 11, 11 sept. 2026) :
//   a. deux groupes, deux listes : ouvrir le panneau sous B n'écrit rien et ne
//      change pas la liste de A — le cas réel de l'audit survit ;
//   b. le semis lit la clé nue d'avant et NE L'ÉCRIT PAS (valeur identique
//      avant/après) ; il n'écrit la clé du groupe que s'il a quelque chose à semer ;
//   c. un élève en abandon ne compte pas dans (n/5) — filtré à la lecture, son
//      entrée reste en base ;
//   d. le sixième ajout est refusé ET dit (notification) ;
//   e. un DA hors du groupe actif est refusé à l'ajout, sans bruit ;
//   f. le filtre « P < 65 % » écarte un P non constructible (affiché « — ») ;
//   g. le panneau mort `#panneau-prioritaire` n'existe plus, ni son CSS ni ses lecteurs ;
//   h. G-8 : l'ouverture n'écrit `indicesCP` qu'une fois — la chaîne d'indices.js
//      suffit, l'appel direct est parti ;
//   i. en démo, la grille de référence se résout à la lecture vers une grille du
//      pack, sans écrire la préférence (globale) de l'enseignant.
//
// BREAK-TESTS VÉRIFIÉS le 11 septembre 2026 — journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));

// ---------------------------------------------------------------------------
// Harnais minimal : tableau-bord-apercu.js RÉEL, db de banc journalisé, faux
// document, `cle()` = préfixe `test_`. Mêmes conventions que le banc d'audit
// (audit-sous-onglets-suivi-2026-09-06.test.js), réduites à ce lot.
// ---------------------------------------------------------------------------

const cle = (k) => (String(k).startsWith('test_') ? k : 'test_' + k);

function dbBanc(store, journal) {
    return {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = clone(v); journal.push({ k, v: clone(v) }); },
        removeSync: (k) => { delete store[k]; journal.push({ k: '-' + k }); },
    };
}

function elementDom(id) {
    return { id, _html: '', hidden: false, textContent: '', style: {}, dataset: {},
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); },
            toggle(c, f) { const v = f === undefined ? !this._s.has(c) : !!f; v ? this._s.add(c) : this._s.delete(c); return v; } },
        querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild(c) { return c; } };
}

function fauxDocument(elements) {
    return {
        getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))),
        querySelector: () => null, querySelectorAll: () => [],
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'),
    };
}

const INTERNES = ['obtenirEtudiantsSuivis', 'sauvegarderEtudiantsSuivis', 'ajouterEtudiantSuivi', 'retirerEtudiantSuivi',
    'nettoyerEtudiantsSuivis', 'cleEtudiantsSuivis', 'appliquerFiltres', '_filtresActifs', '_tousEtudiantsEnrichis',
    '_etudiantsPrioritaires', 'MAX_ETUDIANTS_SUIVIS', 'MESSAGE_SUIVI_COMPLET', 'genererPanneauSuiviEtudiants'];

function chargerAvecInterne(chemin, globaux, win, noms) {
    let code = lire(chemin);
    const expo = '\n;window.__audit = window.__audit || {}; window.__audit[' + JSON.stringify(path.basename(chemin)) + '] = {'
        + noms.map(n => 'get ' + n + '() { return ' + n + '; }' + (/^_/.test(n) ? ', set ' + n + '(v) { ' + n + ' = v; }' : '')).join(', ') + '};\n';
    const fin = code.lastIndexOf('})();');
    code = fin >= 0 ? code.slice(0, fin) + expo + code.slice(fin) : code + expo;
    const { document: doc, ...autres } = completerNoteParDefaut(globaux);   // #1137 : le module des nombres affichés
    const noms2 = ['window', 'document', 'console', ...Object.keys(autres)];
    const vals = [win, doc, { warn() {}, error() {}, log() {} }, ...Object.values(autres)];
    // eslint-disable-next-line no-new-func
    new Function(...noms2, '"use strict";\n' + code)(...vals);
}

/** Un store : GC1 (trois élèves) et GC2 (un élève), GC1 actif. */
function storeBase() {
    return {
        infoCours: { id: 'GC1', nom: 'Cours banc', groupe: '01', _groupeCoursId: 'GC1' },
        groupeCoursActif: { id: 'GC1', trimestreId: 'test', coursId: 'GC1', groupeNum: '01' },
        test_groupeEtudiants: [
            { da: '2000001', nom: 'Assidu', prenom: 'Alice', coursId: 'GC1', statut: 'actif' },
            { da: '2000002', nom: 'Absent', prenom: 'Bruno', coursId: 'GC1', statut: 'actif' },
            { da: '2000003', nom: 'Silence', prenom: 'Chloé', coursId: 'GC1', statut: 'actif' },
            { da: '2000004', nom: 'Dautre', prenom: 'Dario', coursId: 'GC2', statut: 'actif' },
            { da: '2000005', nom: 'Einstein', prenom: 'Eva', coursId: 'GC1', statut: 'actif' },
            { da: '2000006', nom: 'Fermi', prenom: 'Fanny', coursId: 'GC1', statut: 'actif' },
            { da: '2000007', nom: 'Gauss', prenom: 'Gina', coursId: 'GC1', statut: 'actif' },
        ],
    };
}

function activerGroupe(store, id) {
    store.infoCours = { id, nom: 'Cours ' + id, groupe: id === 'GC1' ? '01' : '02', _groupeCoursId: id };
    store.groupeCoursActif = { id, trimestreId: 'test', coursId: id, groupeNum: id === 'GC1' ? '01' : '02' };
}

/** Monte un window neuf sur `store` (« recharger la page » = remonter sur le même store). */
function monter(store) {
    const journal = [];
    const db = dbBanc(store, journal);
    const elements = {};
    const document = fauxDocument(elements);
    const notifs = [];
    const exclu = (e) => !!(e && ['inactif', 'décrochage', 'abandon'].includes(e.statut));
    const win = { addEventListener() {}, trimestreActif: 'test', obtenirTrimestreId: () => 'test', cle, db, ARRETS_DEGRADE: null };
    const globaux = {
        document, db, cle,
        echapperHtml: (s) => String(s == null ? '' : s),
        notifications: { info(m, d) { notifs.push({ type: 'info', m, d }); }, succes() {}, erreur() {}, warning() {} },
        estEtudiantExclu: exclu,
        obtenirEtudiantsCoursActif: () => clone(store.test_groupeEtudiants).filter(e => e.coursId === store.groupeCoursActif.id),
        obtenirDonneesSelonMode: (k) => clone(store[cle(k)] || null),
        obtenirPreference: () => null,
        calculerTousLesIndices: () => ({ A: 90, C: 100, P: 80, noteConstructible: true }),
        determinerNiveauRaiPedagogique: () => ({ niveau: 1, pattern: 'Stable' }),
        diagnostiquerSuiviApprentissage: () => null,
        obtenirTypePratiqueActive: () => 'standards', obtenirTermeProduction: () => 'artefact', obtenirLabelNoteFinale: () => 'Note',
        demarrerCacheLecture() {}, terminerCacheLecture() {},
        setTimeout: (f) => 0, requestAnimationFrame: (f) => 0,
    };
    for (const [k, v] of Object.entries(globaux)) if (!(k in win)) win[k] = v;
    chargerAvecInterne('js/contexte-qualification.js', globaux, win, []);   // #828 (16 sept.) : le bouton « A ou C < 70% » lit la borne du profil
    chargerAvecInterne('js/tableau-bord-apercu.js', globaux, win, INTERNES);
    return { win, store, journal, elements, notifs, i: win.__audit['tableau-bord-apercu.js'] };
}

const ecrituresSuivis = (journal) => journal.filter(j => /etudiantsSuivis/.test(j.k)).map(j => j.k);

// ---------------------------------------------------------------------------
// a · deux groupes, deux listes — le cas réel de l'audit survit
// ---------------------------------------------------------------------------
describe('#749 · a — deux groupes-cours, deux listes ; consulter B ne touche pas A', () => {
    it('la clé est composée par trimestre ET groupe-cours', () => {
        const b = monter(storeBase());
        expect(b.i.cleEtudiantsSuivis()).toBe('test_etudiantsSuivis_gc_GC1');
        activerGroupe(b.store, 'GC2');
        expect(b.i.cleEtudiantsSuivis()).toBe('test_etudiantsSuivis_gc_GC2');
    });

    it('[\'2000001\',\'2000002\'] suivis sous A survivent à « Détails » ouvert sous B', () => {
        const store = storeBase();
        const b = monter(store);
        ['2000001', '2000002'].forEach(da => expect(b.i.ajouterEtudiantSuivi(da)).toBe(true));
        expect(b.i.obtenirEtudiantsSuivis().map(s => s.da)).toEqual(['2000001', '2000002']);

        activerGroupe(store, 'GC2');
        const b2 = monter(store);                         // « recharger » sous B
        b2.elements['btn-toggle-panneau-prioritaire'] = Object.assign(elementDom('btn-toggle-panneau-prioritaire'), {});
        b2.elements['btn-toggle-panneau-prioritaire'].classList.add('actif');   // mode Détails
        b2.i.genererPanneauSuiviEtudiants();              // le geste qui purgeait
        expect(b2.i.nettoyerEtudiantsSuivis()).toEqual([]);   // B : sa propre liste, vide
        expect(ecrituresSuivis(b2.journal)).toEqual([]);      // et RIEN n'est écrit

        activerGroupe(store, 'GC1');
        const b3 = monter(store);
        expect(b3.i.nettoyerEtudiantsSuivis().map(s => s.da)).toEqual(['2000001', '2000002']);
        expect(store.test_etudiantsSuivis_gc_GC1.map(s => s.da)).toEqual(['2000001', '2000002']);
    });

    it('une entrée étrangère au groupe dans SA clé est ignorée à la lecture, pas effacée', () => {
        const store = storeBase();
        store.test_etudiantsSuivis_gc_GC1 = [{ da: '2000001', couleurIndex: 0 }, { da: '2000004', couleurIndex: 1 }];   // 2000004 : GC2
        const b = monter(store);
        expect(b.i.nettoyerEtudiantsSuivis().map(s => s.da)).toEqual(['2000001']);
        b.i.genererPanneauSuiviEtudiants();
        expect(ecrituresSuivis(b.journal)).toEqual([]);
        expect(store.test_etudiantsSuivis_gc_GC1.map(s => s.da)).toEqual(['2000001', '2000004']);
    });
});

// ---------------------------------------------------------------------------
// b · le semis : une lecture qui écrit une fois — et jamais la clé nue
// ---------------------------------------------------------------------------
describe('#749 · b — le semis lit la clé nue d\'avant, ne l\'écrit pas', () => {
    it('la première lecture d\'un groupe copie les DA du groupe depuis la clé nue, et la laisse intacte', () => {
        const store = storeBase();
        store.etudiantsSuivis = [{ da: '2000001', couleurIndex: 0 }, { da: '2000004', couleurIndex: 1 }, { da: '9999999', couleurIndex: 2 }];
        const nueAvant = clone(store.etudiantsSuivis);
        const b = monter(store);
        expect(b.i.obtenirEtudiantsSuivis().map(s => s.da)).toEqual(['2000001']);   // GC1 : Alice seulement
        expect(store.test_etudiantsSuivis_gc_GC1.map(s => s.da)).toEqual(['2000001']);
        expect(store.etudiantsSuivis).toEqual(nueAvant);                              // NI effacée NI réécrite
        expect(b.journal.filter(j => j.k === 'etudiantsSuivis')).toEqual([]);
        // Sous GC2, le même semis rend Dario — depuis la même nue, toujours intacte.
        activerGroupe(store, 'GC2');
        const b2 = monter(store);
        expect(b2.i.obtenirEtudiantsSuivis().map(s => s.da)).toEqual(['2000004']);
        expect(store.etudiantsSuivis).toEqual(nueAvant);
    });

    it('le semis n\'écrit rien quand il n\'a rien à semer (pas de nue, ou aucun DA du groupe)', () => {
        const b = monter(storeBase());
        expect(b.i.obtenirEtudiantsSuivis()).toEqual([]);
        expect(ecrituresSuivis(b.journal)).toEqual([]);
        const store = storeBase(); store.etudiantsSuivis = [{ da: '9999999', couleurIndex: 0 }];
        const b2 = monter(store);
        expect(b2.i.obtenirEtudiantsSuivis()).toEqual([]);
        expect(ecrituresSuivis(b2.journal)).toEqual([]);
    });

    it('seconde source : la nue déplacée en <trim>_etudiantsSuivis par la migration des résidus est lue, pas écrite', () => {
        const store = storeBase();
        store.test_etudiantsSuivis = [{ da: '2000002', couleurIndex: 0 }, { da: '2000004', couleurIndex: 1 }];   // migrerResidusClesNues a déplacé la nue
        const b = monter(store);
        expect(b.i.obtenirEtudiantsSuivis().map(s => s.da)).toEqual(['2000002']);
        expect(store.test_etudiantsSuivis_gc_GC1.map(s => s.da)).toEqual(['2000002']);
        expect(store.test_etudiantsSuivis.map(s => s.da)).toEqual(['2000002', '2000004']);   // intacte
        expect(b.journal.filter(j => j.k === 'test_etudiantsSuivis')).toEqual([]);
    });

    it('une fois la clé du groupe écrite, la nue n\'est plus consultée', () => {
        const store = storeBase();
        store.etudiantsSuivis = [{ da: '2000001', couleurIndex: 0 }];
        const b = monter(store);
        b.i.obtenirEtudiantsSuivis();                       // semis
        b.i.retirerEtudiantSuivi('2000001');                // liste du groupe vidée, explicitement
        store.etudiantsSuivis = [{ da: '2000002', couleurIndex: 0 }];   // la nue change (elle ne devrait plus)
        expect(monter(store).i.obtenirEtudiantsSuivis()).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// c · l'abandon libère le siège, sans perdre l'entrée
// ---------------------------------------------------------------------------
describe('#749 · c — un élève en abandon ne compte pas dans (n/5)', () => {
    it('le compteur et la liste lue l\'ignorent ; la base le garde', () => {
        const store = storeBase();
        const b = monter(store);
        ['2000001', '2000002'].forEach(da => b.i.ajouterEtudiantSuivi(da));
        store.test_groupeEtudiants.find(e => e.da === '2000001').statut = 'abandon';
        const b2 = monter(store);
        b2.i.genererPanneauSuiviEtudiants();
        expect(b2.i.nettoyerEtudiantsSuivis().map(s => s.da)).toEqual(['2000002']);
        expect(b2.elements['compteur-suivi'].textContent).toBe('(1/5)');
        expect(ecrituresSuivis(b2.journal)).toEqual([]);
        expect(store.test_etudiantsSuivis_gc_GC1.map(s => s.da)).toEqual(['2000001', '2000002']);
        // Et le siège est vraiment libre : cinq autres tiennent — et l'ajout ne purge
        // pas l'entrée de l'élève en abandon (relecture adverse du 11 sept.).
        for (const da of ['2000003', '2000005', '2000006', '2000007']) expect(b2.i.ajouterEtudiantSuivi(da)).toBe(true);
        expect(b2.i.nettoyerEtudiantsSuivis().length).toBe(5);
        expect(store.test_etudiantsSuivis_gc_GC1.map(s => s.da)).toContain('2000001');
        expect(store.test_etudiantsSuivis_gc_GC1.length).toBe(6);
        // Les cinq couleurs affichées sont distinctes.
        expect(new Set(b2.i.nettoyerEtudiantsSuivis().map(s => s.couleurIndex)).size).toBe(5);
    });
});

// ---------------------------------------------------------------------------
// d · e · le sixième dit pourquoi ; le DA étranger est refusé à la porte
// ---------------------------------------------------------------------------
describe('#749 · d/e — les refus de l\'ajout', () => {
    it('d · le sixième ajout est refusé ET notifié, avec le message validé', () => {
        const b = monter(storeBase());
        for (const da of ['2000001', '2000002', '2000003', '2000005', '2000006']) expect(b.i.ajouterEtudiantSuivi(da)).toBe(true);
        expect(b.notifs.length).toBe(0);
        expect(b.i.ajouterEtudiantSuivi('2000007')).toBe(false);
        expect(b.notifs.length).toBe(1);
        expect(b.notifs[0].m).toBe(b.i.MESSAGE_SUIVI_COMPLET);
        expect(b.i.MESSAGE_SUIVI_COMPLET).toMatch(/Cinq élèves suivis au maximum/);
    });

    it('e · un DA hors du groupe actif est refusé à l\'ajout, sans notification ni écriture', () => {
        const b = monter(storeBase());
        expect(b.i.ajouterEtudiantSuivi('2000004')).toBe(false);   // GC2
        expect(b.i.ajouterEtudiantSuivi('inconnu')).toBe(false);
        expect(b.notifs.length).toBe(0);
        expect(ecrituresSuivis(b.journal)).toEqual([]);
    });

    it('un élève déjà suivi n\'est pas ajouté deux fois', () => {
        const b = monter(storeBase());
        expect(b.i.ajouterEtudiantSuivi('2000001')).toBe(true);
        expect(b.i.ajouterEtudiantSuivi('2000001')).toBe(false);
        expect(b.i.obtenirEtudiantsSuivis().length).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// f · « Filtrer » filtre sur ce qui est montré
// ---------------------------------------------------------------------------
describe('#749 · f — le filtre P écarte un P non constructible', () => {
    it('un P affiché « — » n\'est ni « < 65 % » ni urgent', () => {
        const b = monter(storeBase());
        b.i._tousEtudiantsEnrichis = [
            { da: '2000001', nom: 'Assidu', A: 90, C: 100, P: 80, M: 95, niveau: 1, suivi: null, noteConstructible: true },
            { da: '2000002', nom: 'Absent', A: 40, C: 100, P: 63, M: 70, niveau: 1, suivi: null, noteConstructible: true },
            { da: '2000003', nom: 'Silence', A: 90, C: 0, P: 0, M: 45, niveau: 1, suivi: null, noteConstructible: false },
        ];
        b.i._filtresActifs = ['P'];
        b.i.appliquerFiltres();
        expect(b.i._etudiantsPrioritaires.map(e => e.da)).toEqual(['2000002']);
    });
});

// ---------------------------------------------------------------------------
// g · le panneau mort est parti, avec ses lecteurs et son CSS
// ---------------------------------------------------------------------------
describe('#749 · g — #panneau-prioritaire n\'existe plus', () => {
    const html = lire('index.html');
    const css = lire('styles.css');
    const tba = lire('js/tableau-bord-apercu.js');

    it('index.html : plus de panneau, plus de « Cliquer → profil » ; le bouton « Détails » reste, et le mot vers le profil existe', () => {
        expect(html).not.toMatch(/id="panneau-prioritaire"/);
        expect(html).not.toMatch(/id="compteur-prioritaire"|id="liste-etudiants-prioritaire"|id="prioritaire-tri-boutons"/);
        expect(html).not.toContain('Cliquer → profil');
        expect(html).toMatch(/id="btn-toggle-panneau-prioritaire"/);
        expect(html).toMatch(/id="suivi-aide-profil"[^>]*hidden/);
    });

    it('styles.css : les classes du panneau sont parties ; les vivantes restent', () => {
        expect(css).not.toMatch(/^\.(?:mode-clair )?\.?panneau-prioritaire\b/m);
        expect(css).not.toMatch(/\.etudiant-prioritaire-item\b|\.liste-etudiants-prioritaire\b|\.etudiant-prioritaire-diagnostic\b|\.etudiant-prioritaire-nom\b/);
        expect(css).toMatch(/\.pastille-prioritaire\s*\{/);
        expect(css).toMatch(/\.etudiant-prioritaire-indices\s*\{/);
        expect(css).toMatch(/\.prioritaire-tri-btn\s*\{/);
        expect(css).toMatch(/#suivi-aide-profil\[hidden\]/);
    });

    it('tableau-bord-apercu.js : plus aucun lecteur du panneau ni du compteur ; le mot vers le profil suit le mode Détails', () => {
        expect(tba).not.toMatch(/querySelector\('#panneau-prioritaire'\)|getElementById\('compteur-prioritaire'\)|prioEtaitOuvert/);
        expect(tba).not.toMatch(/function (?:genererPanneauPrioritaire|trierEtudiantsPrioritaires|genererBadgePratique|genererBadgeSourceDonnees)\b/);
        const b = monter(storeBase());
        b.i.genererPanneauSuiviEtudiants();
        expect(b.elements['suivi-aide-profil'].hidden).toBe(true);
        b.elements['btn-toggle-panneau-prioritaire'].classList.add('actif');
        b.i.genererPanneauSuiviEtudiants();
        expect(b.elements['suivi-aide-profil'].hidden).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// h · G-8 : indicesCP n'est écrit qu'une fois à l'ouverture
// ---------------------------------------------------------------------------
describe('#749 · h — une lecture n\'écrit pas deux fois (G-8)', () => {
    it('indices.js : calculerEtSauvegarderIndicesAssiduite CHAÎNE calculerEtStockerIndicesCP exactement une fois', () => {
        let cp = 0;
        const store = { test_groupeEtudiants: [{ da: '1', statut: 'actif' }], test_indicesAssiduite: null };
        const journal = [];
        const db = dbBanc(store, journal);
        const globaux = {
            document: fauxDocument({}), db, cle,
            obtenirDonneesSelonMode: (k) => clone(store[cle(k)] || null),
            sauvegarderDonneesSelonMode: (k, v) => db.setSync(cle(k), v),
            estEtudiantExclu: () => false, calculerAssiduite: () => ({ taux: 1 }),
            calculerEtStockerIndicesCP: () => { cp++; db.setSync(cle('indicesCP'), {}); },
            demarrerCacheLecture() {}, terminerCacheLecture() {},
        };
        const win = Object.assign({ addEventListener() {}, dateLocaleYMD: () => '2026-09-11', obtenirTrimestreId: () => 'test' }, globaux);
        chargerAvecInterne('js/indices.js', globaux, win, []);
        win.calculerEtSauvegarderIndicesAssiduite();
        expect(cp).toBe(1);
        expect(journal.filter(j => j.k === 'test_indicesCP').length).toBe(1);
    });

    it('tableau-bord-apercu.js : chargerTableauBordApercu appelle l\'assiduité une fois et plus jamais indicesCP directement', () => {
        const src = lire('js/tableau-bord-apercu.js');
        const debut = src.indexOf('function chargerTableauBordApercu()');
        const fin = src.indexOf('\nfunction ', debut + 10);
        const corps = src.slice(debut, fin);
        expect(corps.match(/calculerEtSauvegarderIndicesAssiduite\(\)/g) || []).toHaveLength(1);
        // Avant #749 : un appel direct ici, PLUS la chaîne → deux écritures. Après : la chaîne seule.
        expect(corps).not.toMatch(/calculerEtStockerIndicesCP\(\)/);
    });
});

// ---------------------------------------------------------------------------
// i · démo : la grille de référence se résout à la lecture, sans écrire
// ---------------------------------------------------------------------------
describe('#749 · i — en démo, la grille de référence vient du pack, sans toucher la préférence', () => {
    function diagnostiquer({ demo, pref, grilles, journal }) {
        const src = lire('js/profil-etudiant-helpers.js');
        const debut = src.indexOf('function diagnostiquerGrilleReferenceDepistage()');
        const fin = src.indexOf('return { grille: grille, raison: null, message: null };\n}', debut);
        const corps = src.slice(debut, fin + 'return { grille: grille, raison: null, message: null };\n}'.length);
        const globaux = {
            obtenirPreference: () => pref, definirPreference: (k, v) => journal.push({ k, v }),
            estEnModeDemo: () => demo, cle: (k) => 'x_' + k,
            db: { getSync: (k) => (k === 'x_grillesTemplates' ? clone(grilles) : null) },
            console: { warn() {}, error() {} },
        };
        // eslint-disable-next-line no-new-func
        return new Function(...Object.keys(globaux), corps + '\nreturn diagnostiquerGrilleReferenceDepistage();')(...Object.values(globaux));
    }
    const pack = [{ id: 'GRILLE_DEMO_1', nom: 'Grille démo', isDemo: true, criteres: [{ id: 'c1', nom: 'Structure' }] }];

    it('démo + préférence pointant une grille du trimestre réel → la grille du pack, rien d\'écrit', () => {
        const journal = [];
        const r = diagnostiquer({ demo: true, pref: 'grille_du_vrai_trimestre', grilles: pack, journal });
        expect(r.grille && r.grille.id).toBe('GRILLE_DEMO_1');
        expect(r.raison).toBeNull();
        expect(journal).toEqual([]);
    });

    it('démo + aucune préférence → la grille du pack aussi', () => {
        const r = diagnostiquer({ demo: true, pref: '', grilles: pack, journal: [] });
        expect(r.grille && r.grille.id).toBe('GRILLE_DEMO_1');
    });

    it('hors démo, rien ne change : la préférence absente reste « aucune grille désignée »', () => {
        const r = diagnostiquer({ demo: false, pref: '', grilles: pack, journal: [] });
        expect(r.grille).toBeNull();
        expect(r.raison).toBe('aucune-grille-designee');
    });

    it('démo, mais le pack n\'est pas encore chargé → le chemin normal, qui conserve le choix', () => {
        const r = diagnostiquer({ demo: true, pref: 'grille_du_vrai_trimestre', grilles: [], journal: [] });
        expect(r.grille).toBeNull();
        expect(r.raison).toBe('grilles-indisponibles');
    });
});

// ---------------------------------------------------------------------------
// JOURNAL DES BREAK-TESTS (11 septembre 2026)
//   1. `nettoyerEtudiantsSuivis` remise à l'ancienne forme (filtre + RÉÉCRITURE si la
//      longueur change) : a « survivent à Détails sous B » reste vert (clés séparées),
//      mais a « entrée étrangère ignorée, pas effacée » ROUGE et c ROUGE (écriture
//      journalisée, base modifiée). Remis.
//   2. le semis fait `db.setSync(CLE_SUIVI, semis)` : b ROUGE (« NI effacée NI
//      réécrite », journal). Remis.
//   3. `dasSuivablesDuGroupe` sans `estEtudiantExclu` : c ROUGE (compteur (2/5)). Remis.
//   4. filtre P sans `noteConstructible` : f ROUGE. Remis.
//   5. `estEnModeDemo` retiré du diagnostic : i ROUGE (deux cas). Remis.
//   6. (après relecture adverse) `ajouterEtudiantSuivi` repart de la liste FILTRÉE :
//      c ROUGE (« contient 2000001 » en base après quatre ajouts). Remis.
// ---------------------------------------------------------------------------

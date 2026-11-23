/**
 * LE TROISIÈME GROUPE DE LA DÉMO, EN « PAR STANDARDS » (22 nov. 2026)
 *
 * Consigne : `plans de travail/CONSIGNE-2026-11-22-demo-par-standards-suite.md` (voie B : un troisième groupe dans le pack,
 * dix totems neufs). Rapport : `plans de travail/RAPPORT-2026-11-22-demo-par-standards-suite.md`.
 *
 *   A. le groupe : son cours et son groupe-cours à lui, les dix personnes (prénom l'animal, nom la qualité), des DA d'une
 *      plage neuve, aucun nom déjà dans la démo ;
 *   B. la pratique : l'échelle de départ (la même que l'assistant range), cinq cibles dans l'ordre et aux poids de la
 *      consigne, quatre critères sur la première seule ; double seuil éteint, aucune terminale ;
 *   C. le versement dans `demo_*` (`peuplerNamespace`, par « Remettre la démo à neuf ») : tout est marqué `isDemo`, rien
 *      ne s'écrit hors du préfixe, l'histoire n'y est PAS ;
 *   D. l'état de départ : Marmotte Pétillante « en attente » de « La lecture stratégique » ; les neuf autres ont leur note ;
 *   E. l'histoire, posée par l'écrivain réel des inscriptions : le niveau retenu 3, le 2 à l'historique, 68,75 % (69).
 *
 * Les modules sont les RÉELS (`demo-namespace.js`, `pack-demo-10.js`, `ensembles-cibles.js`, `inscriptions-cibles.js`,
 * `note-cibles.js`) ; l'ordre des niveaux, la valeur ponctuelle et l'arrondi de la note sont tirés du code réel par leur
 * texte. BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { fonctionsDeLEchelle } from './_helpers/moteur-cibles.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));

const PACK = chargerScript('js/pack-demo-10.js').PACK_DEMARRAGE;
const BLOC = PACK.groupeParStandards;

/** L'arrondi de la note, tiré du code réel (portfolio.js, celui que le tableau des cibles appelle). */
const arrondirIndiceSurCent = (() => {
    const s = lire('js/portfolio.js');
    const i = s.indexOf('function arrondirIndiceSurCent(decimal) {');
    const j = s.indexOf('\n}\n', i);
    if (i === -1 || j === -1) throw new Error('arrondirIndiceSurCent a bougé dans portfolio.js');
    return new Function(s.substring(i, j + 2) + '\nreturn arrondirIndiceSurCent;')();
})();

const DIX = [
    ['9700001', 'Marmotte', 'Pétillante'], ['9700002', 'Girafe', 'Lumineuse'], ['9700003', 'Panthère', 'Cordiale'],
    ['9700004', 'Tortue', 'Prévenante'], ['9700005', 'Chouette', 'Charmante'], ['9700006', 'Kangourou', 'Taquin'],
    ['9700007', 'Colibri', 'Radieux'], ['9700008', 'Tigre', 'Patient'], ['9700009', 'Zèbre', 'Gentil'], ['9700010', 'Écureuil', 'Joueur']
];
const MARMOTTE = '9700001';
const CIBLES_ATTENDUES = [['La lecture stratégique', 25], ['La lecture analytique', 30], ['Le plan', 10], ['La rédaction', 25], ['La révision', 10]];

/* ================================================================ Le moteur sur un magasin témoin */

/** Les modules « Par standards » réels sur un magasin `demo_*` rempli comme `peuplerNamespace` le remplit. */
function moteurSur(store) {
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: () => { throw new Error('aucune écriture attendue'); } };
    const win = {};
    const globaux = { db, cle: (k) => 'demo_' + k, ...fonctionsDeLEchelle(),
        obtenirEchelleResolue: (id) => clone((store.demo_echellesTemplates || []).find(e => e.id === id) || null) };
    chargerScript('js/pratiques/ensembles-cibles.js', globaux, win);
    chargerScript('js/pratiques/inscriptions-cibles.js', globaux, win);
    chargerScript('js/pratiques/note-cibles.js', globaux, win);
    return win;
}

/** « Remettre la démo à neuf » (`reinstallerDemoDuPack`) sur un magasin témoin : ce qui est écrit, et où. */
async function remettreANeuf(storeInitial) {
    const store = clone(storeInitial || {});
    const ecrites = [];
    const retirees = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { ecrites.push(k); store[k] = clone(v); },
        removeSync: (k) => { retirees.push(k); delete store[k]; },
        keys: async () => Object.keys(store)
    };
    const localStorage = { getItem: () => null, setItem: () => {} };
    const win = chargerScript('js/demo-namespace.js', { db, PACK_DEMARRAGE: PACK, localStorage });
    const ok = await win.reinstallerDemoDuPack();
    return { ok, store, ecrites, retirees, win };
}

const pratiqueDuGroupe = (store) => {
    const gc = store.demo_groupesCours.find(g => g.id === 'GC_DEMO_STD');
    return store.demo_pratiquesConfigurables.find(p => p.id === gc.pratiqueId);
};

/* ================================================================ A — le groupe */
describe('A · le troisième groupe : son cours, son groupe-cours, dix totems neufs', () => {
    it('les dix personnes, dans l\'ordre de la consigne : prénom l\'animal, nom la qualité, une plage de DA neuve', () => {
        expect(BLOC.groupeEtudiants.map(e => [e.da, e.prenom, e.nom])).toEqual(DIX);
        BLOC.groupeEtudiants.forEach((e) => {
            expect(e.da).toMatch(/^97000\d\d$/);
            expect(e.groupe).toBe('00003');
            expect(e.coursId).toBe('demo-cours-std');
        });
    });

    it('aucun DA ni aucun nom n\'est déjà dans la démo (le premier groupe du pack, le deuxième de « Mettre ta classe en place »)', () => {
        const deuxieme = [...lire('js/parcours-classe.js').matchAll(/\['(99000\d\d)', '([^']+)', '([^']+)'\]/g)].map(m => [m[1], m[3], m[2]]);
        expect(deuxieme, 'les dix du deuxième groupe, lus dans parcours-classe.js').toHaveLength(10);
        const pris = PACK.groupeEtudiants.map(e => [e.da, e.prenom, e.nom]).concat(deuxieme);
        const das = new Set(pris.map(x => x[0]));
        const mots = new Set(pris.flatMap(x => [x[1], x[2]]));
        BLOC.groupeEtudiants.forEach((e) => {
            expect(das.has(e.da), e.da).toBe(false);
            expect(mots.has(e.prenom), e.prenom).toBe(false);
            expect(mots.has(e.nom), e.nom).toBe(false);
        });
    });

    it('un cours à lui (dans listeCours, où l\'entrée et la sortie de la démo lisent les cours) et un groupe-cours à lui', () => {
        expect(PACK.listeCours.map(c => c.id)).toEqual(['demo-cours', 'demo-cours-std']);
        const cours = PACK.listeCours[1];
        expect([cours.sigle, cours.titre, cours.groupe]).toEqual(['601-998-DM', 'Lire et écrire par cibles (Démo)', '00003']);
        const gc = BLOC.groupeCours;
        expect([gc.id, gc.coursId, gc.groupeNum, gc.horaireId, gc.pratiqueId]).toEqual(['GC_DEMO_STD', 'demo-cours-std', '00003', 'HOR_DEMO_STD', 'demo-cib-litt']);
        expect(gc.actif, 'le premier groupe reste celui que la démo ouvre').toBe(false);
        expect(BLOC.horaire.id).toBe('HOR_DEMO_STD');
    });

    it('deux productions du groupe, la seconde deux semaines après la première, toutes deux sur « La lecture stratégique »', () => {
        const [a, b] = BLOC.productions;
        expect([a.titre, b.titre].map(t => t.replace(/ /g, ' '))).toEqual(['Stratégies de lecture sur « Deux-Rives »', 'Stratégies de lecture sur « Marine »']);
        expect([a.coursId, b.coursId]).toEqual(['demo-cours-std', 'demo-cours-std']);
        expect((new Date(b.dateEcheance) - new Date(a.dateEcheance)) / 86400000).toBe(14);
        const debut = PACK.cadreCalendrier.dateDebut, fin = PACK.cadreCalendrier.finCours;
        [a, b].forEach(p => { expect(p.dateEcheance >= debut && p.dateEcheance <= fin, p.dateEcheance).toBe(true); });
        expect(a.ciblesRenseignees).toEqual(['demo-cible-ls']);
        expect(b.ciblesRenseignees).toEqual(['demo-cible-ls']);
    });
});

/* ================================================================ B — la pratique */
describe('B · la pratique « Par standards » du groupe', () => {
    it('cinq cibles, par leur étiquette seule, dans l\'ordre et aux poids de la consigne ; aucune terminale', () => {
        const cibles = BLOC.ensembleCibles.cibles;
        expect(cibles.map(c => [c.etiquette, c.poids])).toEqual(CIBLES_ATTENDUES);
        cibles.forEach(c => { expect(c.enonce).toBe(''); expect(c.terminale).toBe(false); });
    });

    it('la première seule porte quatre critères : Structure, Rigueur, Plausibilité essentiels ; Nuance non essentiel', () => {
        const [premiere, ...autres] = BLOC.ensembleCibles.cibles;
        expect(premiere.criteres.map(k => [k.texte, k.essentiel])).toEqual([['Structure', true], ['Rigueur', true], ['Plausibilité', true], ['Nuance', false]]);
        autres.forEach(c => expect(c.criteres).toEqual([]));
    });

    it('la configuration : l\'échelle du groupe, « 0 » pour « sans donnée », double seuil et « Notes finalisées » absents ; un id « demo-… »', () => {
        const p = BLOC.pratique;
        expect(p.id.indexOf('demo-'), 'le modèle d\'« Évaluer » reconnaît les pratiques du pack par ce préfixe').toBe(0);
        expect(p.type).toBe('cibles');
        expect(p.calcul_note).toEqual({ methode: 'niveaux_par_cible' });
        expect(p.configuration).toEqual({ type: 'cibles', ensembleCiblesId: 'ENSC_DEMO_STD', echelleId: 'ECH_DEMO_STD', niveauSansDonnee: '0' });
    });

    it('l\'échelle est l\'« Échelle de départ – Par standards » de l\'assistant, niveau pour niveau', () => {
        const win = chargerScript('js/pratiques/ensembles-cibles.js', { db: { getSync: () => [] }, cle: (k) => k });
        const depart = win.EnsemblesCibles.echelleDeDepart('X');
        const garder = (e) => ({ nom: e.nom, description: e.description, niveaux: e.niveaux });
        expect(garder(BLOC.echelle)).toEqual(garder(depart));
        expect(win.EnsemblesCibles.motifsRefus({ cibles: BLOC.ensembleCibles.cibles, echelle: BLOC.echelle, niveauSansDonnee: '0' }),
            'la pratique passerait les refus de l\'assistant').toEqual([]);
    });
});

/* ================================================================ C — le versement dans demo_* */
describe('C · « Remettre la démo à neuf » verse le troisième groupe dans la démo, et seulement là', () => {
    it('trois groupes au total : le premier, le troisième (marqué isDemo) ; le deuxième reste à monter', async () => {
        const r = await remettreANeuf();
        expect(r.ok).toBe(true);
        expect(r.store.demo_groupesCours.map(g => [g.id, g.isDemo])).toEqual([['GC_DEMO', true], ['GC_DEMO_STD', true]]);
        expect(r.store.demo_horaires.map(h => [h.id, h.isDemo])).toEqual([['HOR_DEMO', true], ['HOR_DEMO_STD', true]]);
        expect(r.store.demo_listeCours.map(c => c.id)).toEqual(['demo-cours', 'demo-cours-std']);
        const dix = r.store.demo_groupeEtudiants.filter(e => e.coursId === 'demo-cours-std');
        expect(dix).toHaveLength(10);
        expect(dix.every(e => e.isDemo === true)).toBe(true);
        expect(r.store.demo_groupeEtudiants).toHaveLength(20);
        expect(pratiqueDuGroupe(r.store).isDemo).toBe(true);
        expect(r.store.demo_ensemblesCibles.map(e => e.id)).toEqual(['ENSC_DEMO_STD']);
        expect(r.store.demo_inscriptionsCibles).toHaveLength(49);
        expect(r.store.demo_echellesTemplates.map(e => e.id)).toContain('ECH_DEMO_STD');
        expect(r.store.demo_productions.filter(p => p.coursId === 'demo-cours-std')).toHaveLength(2);
    });

    it('le premier groupe ne change pas : ses collections du pack sont versées telles quelles, en tête', async () => {
        const r = await remettreANeuf();
        const ids = (l) => l.map(x => x.id);
        expect(ids(r.store.demo_groupeEtudiants).slice(0, 10)).toEqual(ids(PACK.groupeEtudiants));
        expect(ids(r.store.demo_productions).slice(0, PACK.productions.length)).toEqual(ids(PACK.productions));
        expect(ids(r.store.demo_pratiquesConfigurables).slice(0, 2)).toEqual(ids(PACK.pratiquesConfigurables));
        expect(ids(r.store.demo_echellesTemplates).slice(0, PACK.echellesTemplates.length)).toEqual(ids(PACK.echellesTemplates));
        expect(r.store.demo_evaluationsSauvegardees).toHaveLength(101);
        const gc = r.store.demo_groupesCours[0];
        expect([gc.id, gc.pratiqueId, gc.actif]).toEqual(['GC_DEMO', 'demo-std-litt', true]);
    });

    it('rien ne s\'écrit hors du préfixe demo_ ; une clé hors démo du magasin reste octet pour octet', async () => {
        const hors = { h2026_groupesCours: [{ id: 'GC_REEL', pratiqueId: 'P1' }], h2026_inscriptionsCibles: [{ id: 'X' }], cours: [{ id: 'c1' }], trimestres: [{ id: 'h2026', actif: true }] };
        const r = await remettreANeuf(Object.assign({ demo_vieux: [1] }, hors));
        expect(r.ecrites.filter(k => k.indexOf('demo_') !== 0)).toEqual([]);
        expect(r.retirees.filter(k => k.indexOf('demo_') !== 0)).toEqual([]);
        Object.keys(hors).forEach(k => expect(r.store[k], k).toEqual(hors[k]));
        expect('demo_vieux' in r.store, 'la remise à neuf efface d\'abord la démo').toBe(false);
    });

    it('le stock : une démo déjà installée sous la même version n\'est PAS réécrite au chargement (version non montée, rapport § 6)', async () => {
        const avant = { demo_groupesCours: [{ id: 'GC_DEMO', isDemo: true }, { id: 'GC_MONTE', coursId: 'c-monte' }], demo_groupeEtudiants: [{ da: '9900002' }] };
        const store = clone(avant);
        const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); } };
        const localStorage = { getItem: (k) => (k === 'demo-version-installee' ? PACK._metadata.version : null), setItem: () => {} };
        const win = chargerScript('js/demo-namespace.js', { db, PACK_DEMARRAGE: PACK, localStorage });
        await win.initialiserDemoNamespace();
        expect(store, 'le deuxième groupe monté par la personne reste ; le troisième n\'arrive que par « Remettre la démo à neuf »').toEqual(avant);
        expect(PACK._metadata.version).toBe('21.3');
    });

    it('l\'histoire de Marmotte Pétillante n\'est PAS dans l\'état de départ', async () => {
        const r = await remettreANeuf();
        const siennes = r.store.demo_inscriptionsCibles.filter(e => e.da === MARMOTTE);
        expect(siennes.map(e => e.cibleId).sort()).toEqual(['demo-cible-la', 'demo-cible-plan', 'demo-cible-red', 'demo-cible-rev']);
        const texte = JSON.stringify(r.store);
        expect(texte).not.toContain('Relève bien les procédés');
        expect(texte).not.toContain('2025-09-11');
    });
});

/* ================================================================ D — l'état de départ */
describe('D · l\'état de départ : Marmotte Pétillante en attente, les neuf autres avec leur note', () => {
    const NOTES = { '9700002': 77.5, '9700003': 95, '9700004': 55, '9700005': 65, '9700006': 42.5,
        '9700007': 71.25, '9700008': 66.25, '9700009': 81.25, '9700010': 53.75 };
    const AFFICHEES = { '9700002': 78, '9700003': 95, '9700004': 55, '9700005': 65, '9700006': 43,
        '9700007': 71, '9700008': 66, '9700009': 81, '9700010': 54 };

    it('Marmotte Pétillante : quatre niveaux (3, 3, 2, 3), rien sur « La lecture stratégique », la note « en attente »', async () => {
        const r = await remettreANeuf();
        const NC = moteurSur(r.store).NoteCibles;
        const e = NC.lireEleve(pratiqueDuGroupe(r.store).configuration, MARMOTTE);
        expect(e.retenue.lignes.map(l => l.sansDonnee ? null : l.retenu.niveau)).toEqual([null, '3', '3', '2', '3']);
        expect(e.note.etat).toBe('attente');
        expect(e.note.enAttente.map(c => c.etiquette)).toEqual(['La lecture stratégique']);
        expect(NC.nomSansDonnee(e)).toBe('Données insuffisantes');
    });

    it('les neuf autres : un niveau sur chaque cible, ni « 0 » ni plus de deux « 1 », quelques « 4 » ; chaque note s\'affiche', async () => {
        const r = await remettreANeuf();
        const NC = moteurSur(r.store).NoteCibles;
        const conf = pratiqueDuGroupe(r.store).configuration;
        const niveaux = [];
        Object.keys(NOTES).forEach((da) => {
            const e = NC.lireEleve(conf, da);
            expect(e.retenue.lignes.every(l => !l.sansDonnee), da).toBe(true);
            niveaux.push(...e.retenue.lignes.map(l => l.retenu.niveau));
            expect(e.note.etat, da).toBe('note');
            expect(e.note.note, da).toBeCloseTo(NOTES[da], 10);
            expect(arrondirIndiceSurCent(e.note.note / 100), da).toBe(AFFICHEES[da]);
        });
        expect(niveaux).toHaveLength(45);
        expect(niveaux.filter(x => x === '0')).toEqual([]);
        expect(niveaux.filter(x => x === '1').length).toBeLessThanOrEqual(2);
        expect(niveaux.filter(x => x === '4').length).toBeGreaterThan(0);
        expect(new Set(Object.values(AFFICHEES)).size, 'des notes variées').toBe(9);
    });
});

/* ================================================================ E — l'histoire, posée */
describe('E · l\'histoire de Marmotte Pétillante, posée par l\'écrivain réel : 3 retenu, 2 à l\'historique, 68,75 % (69)', () => {
    const histoire = BLOC.histoire.inscriptions;

    it('trois saisies dans l\'ordre : une remarque d\'observation (critères, texte, aucun niveau), puis 2 sur « Deux-Rives », puis 3 sur « Marine »', () => {
        expect(histoire.map(s => [s.cibleId, s.niveau, s.productionId, s.date])).toEqual([
            ['demo-cible-ls', null, null, '2025-09-11'],
            ['demo-cible-ls', '2', 'PROD_DEMO_STD_DEUXRIVES', '2025-09-17'],
            ['demo-cible-ls', '3', 'PROD_DEMO_STD_MARINE', '2025-10-01']]);
        expect(histoire.every(s => s.da === MARMOTTE && s.ensembleId === 'ENSC_DEMO_STD')).toBe(true);
        expect(histoire[0].noteBreve).toBe('Relève bien les procédés ; son hypothèse ne s\'appuie pas encore sur le texte.');
        expect(histoire[0].criteres.map(k => [k.texte, k.respecte])).toEqual([['Structure', true], ['Rigueur', true], ['Plausibilité', false], ['Nuance', null]]);
        expect(histoire[0].origine).toBe('observation');
        const dates = BLOC.productions.map(p => p.dateEcheance);
        expect([histoire[1].date, histoire[2].date]).toEqual(dates);
    });

    // Retouche f de l'assemblage (consigne du 22 nov., publication des parcours) : (b) et (c) reçoivent leurs critères et
    // leur rétroaction, mot pour mot. Break-test (23 nov.) : Nuance de (b) remise à null → rouge ; un mot de (c) changé → rouge.
    it('(b) et (c) portent leurs critères et leur rétroaction (retouche f de l\'assemblage)', () => {
        expect(histoire[1].criteres.map(k => [k.texte, k.respecte])).toEqual([['Structure', true], ['Rigueur', true], ['Plausibilité', false], ['Nuance', false]]);
        expect(histoire[1].noteBreve).toBe('Tu relèves bien les procédés. Pour la plausibilité, appuie ton hypothèse sur une citation précise du texte.');
        expect(histoire[2].criteres.map(k => [k.texte, k.respecte])).toEqual([['Structure', true], ['Rigueur', true], ['Plausibilité', true], ['Nuance', false]]);
        expect(histoire[2].noteBreve).toBe('Ton hypothèse s\'appuie maintenant sur le texte. Pour aller vers « Avancé », nuance-la : tiens compte d\'un passage qui la contredit.');
    });

    it('chaque saisie passe le refus de l\'écrivain (`motifsRefus`) : rien ne bloquera le parcours', async () => {
        const r = await remettreANeuf();
        const win = moteurSur(r.store);
        histoire.forEach(s => expect(win.InscriptionsCibles.motifsRefus(s, BLOC.echelle), s.date).toEqual([]));
    });

    it('posées (forme rangée par `construireInscription`, ajoutées par `ajouter`) : le retenu est 3 – Acquis, (b) reste, la note vaut 68,75 % (69)', async () => {
        const r = await remettreANeuf();
        const win = moteurSur(r.store);
        const IC = win.InscriptionsCibles;
        const entrees = histoire.map((s, i) => IC.construireInscription(Object.assign({}, s, { id: 'HIST_' + i, horodatage: s.date + 'T18:00:00.000Z' })));
        r.store.demo_inscriptionsCibles = IC.ajouter(r.store.demo_inscriptionsCibles, entrees);
        const NC = moteurSur(r.store).NoteCibles;
        const e = NC.lireEleve(pratiqueDuGroupe(r.store).configuration, MARMOTTE);
        const ls = e.retenue.lignes[0];
        expect(ls.retenu.niveau).toBe('3');
        expect(ls.niveau.nom).toBe('Acquis');
        expect(ls.historique.map(h => h.inscription.niveau), 'la plus récente d\'abord').toEqual(['3', '2', null]);
        expect(ls.remarques, 'la remarque n\'entre pas au niveau retenu').toBe(1);
        expect(ls.historique[2].inscription.criteres.map(k => k.respecte)).toEqual([true, true, false, null]);
        expect(e.note.etat).toBe('note');
        expect(e.note.note).toBeCloseTo(68.75, 10);
        expect(arrondirIndiceSurCent(e.note.note / 100)).toBe(69);
    });

    it('sans (c), le retenu serait 2 et la note 62,5 : c\'est bien (c) qui fait le 3', async () => {
        const r = await remettreANeuf();
        const IC = moteurSur(r.store).InscriptionsCibles;
        const entrees = histoire.slice(0, 2).map((s, i) => IC.construireInscription(Object.assign({}, s, { id: 'H' + i, horodatage: s.date + 'T18:00:00.000Z' })));
        r.store.demo_inscriptionsCibles = IC.ajouter(r.store.demo_inscriptionsCibles, entrees);
        const e = moteurSur(r.store).NoteCibles.lireEleve(pratiqueDuGroupe(r.store).configuration, MARMOTTE);
        expect(e.retenue.lignes[0].retenu.niveau).toBe('2');
        expect(e.note.note).toBeCloseTo(62.5, 10);
    });
});

/* ================================================================ F — les détecteurs de « Mettre ta classe en place » */
describe('F · le troisième groupe n\'est pas « le deuxième groupe » (js/parcours-classe.js, `deuxiemeGroupe`)', () => {
    function classeSur(store) {
        const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)) };
        const win = { Assistance: { enregistrer() {} } };
        chargerScript('js/parcours-classe.js', { db, document: { getElementById: () => null } }, win);
        return win.ParcoursClasse;
    }

    it('la démo à neuf (premier et troisième groupes) : aucun deuxième groupe, le modèle d\'« Évaluer » attend toujours', async () => {
        const r = await remettreANeuf();
        expect(classeSur(r.store).deuxiemeGroupe()).toBe(null);
    });

    it('le groupe que la personne monte, rangé APRÈS le troisième : c\'est lui le deuxième groupe, pas GC_DEMO_STD', async () => {
        const r = await remettreANeuf();
        r.store.demo_groupesCours.push({ id: 'GC_MONTE', coursId: 'c-monte', groupeNum: '00002' });
        expect(classeSur(r.store).deuxiemeGroupe(), 'sans ses étudiant·es, pas encore').toBe(null);
        r.store.demo_groupeEtudiants.push({ da: '9900002', nom: 'Enjouée', prenom: 'Loutre', groupe: '00002', coursId: 'c-monte' });
        expect(classeSur(r.store).deuxiemeGroupe().id).toBe('GC_MONTE');
    });
});

/*
 * JOURNAL DES BREAK-TESTS (22 nov. 2026) — chaque mutation appliquée au code, l'essai lancé, puis la mutation retirée
 * (fichiers revenus octet pour octet). Treize sur treize rougissent :
 *   BT1  `deuxiemeGroupe` sans la marque, côté groupe-cours (parcours-classe.js)  → F « le groupe que la personne monte »
 *   BT2  `deuxiemeGroupe` sans la marque, côté fiches (parcours-classe.js)        → F « le groupe que la personne monte »
 *   BT3  le groupe-cours du pack versé sans `isDemo` (demo-namespace.js)          → C « trois groupes », F « le groupe que… »
 *   BT4  `inscriptionsCibles` retirée des collections versées                      → C × 2, D × 2, E « posées », E « sans (c) »
 *   BT5  l'histoire versée dans l'état de départ                                   → C × 2, D « Marmotte », E « posées », E « sans (c) »
 *   BT6  une écriture de plus, hors de `demo_` (`cours`)                           → C « rien ne s'écrit hors du préfixe »
 *   BT7  le poids de « La révision » à 15                                          → B « cinq cibles », D « les neuf », E × 2
 *   BT8  Marmotte Pétillante : « La rédaction » à 3 au lieu de 2                   → D « Marmotte », E « posées », E « sans (c) »
 *   BT9  « Marine » à 13 jours de « Deux-Rives »                                   → A « deux productions », E « trois saisies »
 *   BT10 « Nuance » devenue essentielle                                            → B « la première seule porte quatre critères »
 *   BT11 l'échelle du pack dérive de celle de l'assistant (« Acquis » renommé)     → B « l'échelle », E « posées »
 *   BT12 la saisie (c) posée sur une autre cible                                   → E « trois saisies », E « posées »
 *   BT13 la version du pack montée (21.3 → 21.4)                                    → C « le stock »
 */

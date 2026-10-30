/**
 * SENTINELLE — UNE SEULE SOURCE PAR FAMILLE DE SEUILS (décision de Grégoire du 30 oct. 2026, lot 1 du chantier dépistage).
 *
 * Chaque signal du Suivi (couleur, pastille, filtre, badge, libellé, encadré, zone de bande) lit sa valeur à une seule source :
 *   · A et C : les trois champs de Labo › Outils d'observation, défauts 95 · 90 · 85, quatre paliers ;
 *   · P : les repères de l'échelle de l'enseignant ; sans repère, la note de passage seule ;
 *   · la note de passage : `NOTE_DE_PASSAGE`.
 * Tarir n'est pas réparer : rien n'est écrit dans ce qui est enregistré, et `idme` reste dans l'objet sans être lu.
 *
 *   cd tests && npx vitest run unit/sentinelle-seuils-une-source-2026-10-30.test.js
 *
 * Break-tests : journal en fin de fichier.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';
import { monter, storeBase, echelleAReperes, RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const sansCommentaires = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
const clone = (x) => JSON.parse(JSON.stringify(x));

/** Les modules réels sur un store : seuls `seuilsInterpretation` et la famille de la pratique varient. */
function seuils(stocke) {
    const store = stocke === undefined ? {} : { seuilsInterpretation: clone(stocke) };
    const ecritures = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { ecritures.push(k); store[k] = clone(v); }, get: async () => null, set: async () => {}
    };
    const win = chargerScript('js/interpretation-config.js', { db });
    chargerScript('js/contexte-qualification.js', { obtenirSeuil: win.obtenirSeuil }, win);
    return { win, store, ecritures };
}

/** Le Suivi réel, avec le vrai résolveur d'échelle, sur les copies et les échelles données. */
const INTERNES = ['_badgeIndiceSuivi', 'positionDansSaZone', 'zoneDeLaValeur', 'fondDeLaBarre', 'appliquerFiltres', '_filtresActifs', '_tousEtudiantsEnrichis', '_etudiantsPrioritaires'];
function suivi({ echelles = [], copies = [], famille = 'standards', seuilsStockes } = {}) {
    const store = storeBase();
    store.test_echellesTemplates = clone(echelles);
    store.test_evaluationsSauvegardees = copies.map((c, i) => Object.assign({ id: 'C' + i, etudiantDA: '2000001', productionId: 'P1', noteFinale: 70, verrouillee: true, coursId: 'GC1', groupe: '01' }, c));
    if (seuilsStockes) store.seuilsInterpretation = clone(seuilsStockes);
    const b = monter(store, {
        modules: ['js/contexte-qualification.js', 'js/profil-etudiant-calculs.js', { chemin: 'js/tableau-bord-apercu.js', internes: INTERNES }],
        globaux: { designerPratiqueActive: () => ({ etat: 'ok', famille }), obtenirTypePratiqueActive: () => 'standards' }
    });
    return { b, win: b.win, i: b.interne['tableau-bord-apercu.js'] };
}
// Des plages volontairement sans 64, 65, 70, 75 : rien ne peut passer par hasard.
const PLAGES = [['I', 0, 49], ['D', 50, 71], ['M', 72, 89], ['E', 90, 100]];
const ECHELLE = () => echelleAReperes({ id: 'E_ARB', plages: PLAGES });
const SANS_REPERES = () => { const e = echelleAReperes({ id: 'E_NUE', plages: PLAGES }); delete e.seuilSuffisance; delete e.seuilMaitrise; return e; };

describe('(a) les défauts : 95 · 90 · 85, quatre paliers, plus de borne fixe à 60', () => {
    it('la source les porte, et la note de passage vit à part, hors de l\'objet enregistré', () => {
        const { win } = seuils();
        expect(win.SEUILS_PAR_DEFAUT.interpretation).toEqual({ excellent: 0.95, bon: 0.90, acceptable: 0.85 });
        expect(win.NOTE_DE_PASSAGE).toBe(0.60);
        expect(win.SEUILS_PAR_DEFAUT).not.toHaveProperty('notePassage');
        expect(win.SEUILS_PAR_DEFAUT).not.toHaveProperty('idme');
    });

    it('quatre paliers, en A et en C ; 60 % ne change plus rien', () => {
        const { win } = seuils();
        const cas = [[100, 'Aucune absence ou presque', 'Aucun travail manquant ou presque'], [95, 'Aucune absence ou presque', 'Aucun travail manquant ou presque'],
            [94, 'Absences rares', 'Travaux manquants rares'], [90, 'Absences rares', 'Travaux manquants rares'],
            [89, 'Quelques absences', 'Quelques travaux manquants'], [85, 'Quelques absences', 'Quelques travaux manquants'],
            [84, 'Absences très fréquentes', 'Travaux manquants très fréquents'], [60, 'Absences très fréquentes', 'Travaux manquants très fréquents'], [0, 'Absences très fréquentes', 'Travaux manquants très fréquents']];
        for (const [v, a, c] of cas) {
            expect(win.interpreterAssiduite(v).niveau, `A ${v}`).toBe(a);
            expect(win.interpreterCompletion(v).niveau, `C ${v}`).toBe(c);
        }
        expect(new Set(cas.map((x) => x[1])).size).toBe(4);
    });

    it('le module n\'écrit aucune valeur : ni proportion, ni pourcentage, ni repli', () => {
        const code = sansCommentaires(lire('js/contexte-qualification.js'));
        expect(code).not.toMatch(/\b0\.\d+\b/);
        expect(code).not.toMatch(/[<>]=?\s*(?![01]\b)\d/);   // `size > 1` et `length === 0` ne sont pas des seuils
        expect(code).not.toMatch(/\bBORNE|ARRETS_DEGRADE/);
    });
});

describe('(b) déplacer un champ déplace TOUS les signaux de A et C, ensemble', () => {
    const REGLE = { interpretation: { excellent: 0.77, bon: 0.66, acceptable: 0.55 } };

    it('mots, couleur de la liste, zone, contexte, Mobilisation', () => {
        const { win } = seuils(REGLE);
        const attendu = [
            [54, 'Absences très fréquentes', '#dc2626', 'bas', 'fragile', 'critiques'],
            [55, 'Quelques absences', '#ca8a04', 'signale', 'modere', 'fragile'],
            [66, 'Absences rares', 'var(--vert-succes)', 'acquis', 'favorable', 'acceptable'],
            [77, 'Aucune absence ou presque', '#0284c7', 'audela', 'tres-favorable', 'favorable']
        ];
        for (const [v, mot, couleur, zone, contexte, mobilisation] of attendu) {
            expect(win.interpreterAssiduite(v).niveau, `mot ${v}`).toBe(mot);
            expect(win.obtenirCouleurSelonSeuils(v), `couleur ${v}`).toBe(couleur);
            expect(win.zoneAssiduiteCompletion(v), `zone ${v}`).toBe(zone);
            expect(win.qualifierContexteApprentissage(v / 100, v / 100).niveau, `contexte ${v}`).toBe(contexte);
            expect(win.interpreterMobilisation(v / 100, v / 100).code, `Mobilisation ${v}`).toBe(mobilisation);
        }
    });

    it('filtre, encadré Mobilisation et zones de la barre', () => {
        const { win } = seuils(REGLE);
        expect(win.borneBasseAssiduiteCompletion()).toBe(55);
        expect([65, 66].map((v) => win.sousLePalierRares(v))).toEqual([true, false]);
        expect(win.zonesDeLaBarre('A').map((z) => [z.de, z.a, z.zone])).toEqual([[0, 0.55, 'bas'], [0.55, 0.66, 'signale'], [0.66, 0.77, 'acquis'], [0.77, 1, 'audela']]);
    });

    it('la pastille de « Détails » suit le réglage : rouge au palier bas, jaune au suivant, rien au-dessus', () => {
        const { i } = suivi({ seuilsStockes: REGLE });
        const classe = (v) => (i._badgeIndiceSuivi('A', v).match(/class="([^"]+)"/) || [])[1];
        expect(classe(54)).toContain('prioritaire-indice-critique');
        expect(classe(55)).toContain('prioritaire-indice-attention');
        expect(classe(65)).toContain('prioritaire-indice-attention');
        expect(classe(66)).toBe('prioritaire-indice');
    });

    it('le filtre sur A ou C suit le réglage', () => {
        const { i } = suivi({ seuilsStockes: REGLE });
        i._tousEtudiantsEnrichis = [{ da: '1', nom: 'x', A: 54, C: 100, P: 90 }, { da: '2', nom: 'y', A: 55, C: 100, P: 90 }];
        i._filtresActifs = ['M'];
        i.appliquerFiltres();
        expect(i._etudiantsPrioritaires.map((e) => e.da)).toEqual(['1']);
    });

    it('la carte du profil et l\'encadré ne comparent plus à un littéral', () => {
        const code = sansCommentaires(lire('js/profil-etudiant-sections-affichage.js'));
        expect(code).not.toMatch(/[aAcC]Val\s*<\s*\d/);
        expect(code).toContain('const B = bornesMobilisation();');
        expect(code).not.toContain('BORNES_MOBILISATION');
    });
});

describe('(c) P : l\'échelle de l\'enseignant fait foi', () => {
    const copies = [{ echelleId: 'E_ARB' }];

    it('avec repères : tout suit ses plages, sans aucun 64, 65, 70 ni 75', () => {
        const { win, i } = suivi({ echelles: [ECHELLE()], copies });
        const r = win.reperesPerformance();
        expect([r.suffisance, r.maitrise, r.audela, r.passage, r.raison]).toEqual([50, 72, 90, 60, null]);
        expect([49, 50, 71, 72, 90].map((v) => win.zonePerformance(v, r))).toEqual(['bas', 'signale', 'signale', 'acquis', 'audela']);
        expect(win.borneBassePerformance(r)).toBe(50);
        expect(win.bornesDepistage(r)).toEqual({ bas: 0.5, maitrise: 0.72 });
        expect([49, 50, 72, 90].map((v) => win.obtenirCouleurPerformanceSelonEchelle(v, r))).toEqual(['#dc2626', '#ca8a04', 'var(--vert-succes)', '#0284c7']);
        const zones = win.zonesDeLaBarre('P', r);
        expect(zones.map((z) => [z.de, z.a, z.zone])).toEqual([[0, 0.5, 'bas'], [0.5, 0.72, 'signale'], [0.72, 0.9, 'acquis'], [0.9, 1, 'audela']]);
        for (const v of [0.64, 0.65, 0.7, 0.75]) expect(zones.flatMap((z) => [z.de, z.a])).not.toContain(v);
        const classe = (v) => (i._badgeIndiceSuivi('P', v, null, r).match(/class="([^"]+)"/) || [])[1];
        expect([49, 50, 72].map(classe)).toEqual(['prioritaire-indice prioritaire-indice-critique', 'prioritaire-indice prioritaire-indice-attention', 'prioritaire-indice']);
    });

    it('le filtre « P < … » prend le repère de suffisance', () => {
        const { i } = suivi({ echelles: [ECHELLE()], copies });
        i._tousEtudiantsEnrichis = [{ da: '1', nom: 'x', P: 49, noteConstructible: true }, { da: '2', nom: 'y', P: 50, noteConstructible: true }, { da: '3', nom: 'z', P: 0, noteConstructible: false }];
        i._filtresActifs = ['P'];
        i.appliquerFiltres();
        expect(i._etudiantsPrioritaires.map((e) => e.da)).toEqual(['1']);
    });

    it('le niveau RàI et le pattern lisent les mêmes repères', () => {
        const { win } = suivi({ echelles: [ECHELLE()], copies });
        expect(win.identifierPatternActuel(0.49, false)).toBe('Difficulté persistante');
        expect(win.identifierPatternActuel(0.5, true)).toBe('Difficulté émergente');
        expect(win.identifierPatternActuel(0.71, true)).toBe('Difficulté émergente');
        expect(win.identifierPatternActuel(0.72, true)).toBe('Défi spécifique');
        expect(win.identifierPatternActuel(0.5, false)).toBe('Stable');
    });

    it('sans repère : seule la note de passage signale, et le test « sous la maîtrise » n\'existe pas', () => {
        const { win, i } = suivi({ echelles: [SANS_REPERES()], copies: [{ echelleId: 'E_NUE' }] });
        const r = win.reperesPerformance();
        expect(r.echelle.id).toBe('E_NUE');   // la répartition sous la barre garde son échelle
        expect([r.suffisance, r.maitrise]).toEqual([null, null]);
        expect([59, 60, 95].map((v) => win.zonePerformance(v, r))).toEqual(['bas', 'neutre', 'neutre']);
        expect(win.borneBassePerformance(r)).toBe(60);
        expect(win.bornesDepistage(r)).toEqual({ bas: 0.6, maitrise: null });
        expect(win.obtenirCouleurPerformanceSelonEchelle(95, r)).toBe('inherit');
        expect(win.zonesDeLaBarre('P', r).map((z) => [z.de, z.a, z.zone])).toEqual([[0, 0.6, 'bas'], [0.6, 1, 'neutre']]);
        expect(i._badgeIndiceSuivi('P', 95, null, r)).not.toContain('prioritaire-indice-');
        expect(win.identifierPatternActuel(0.59, false)).toBe('Difficulté persistante');
        expect(win.identifierPatternActuel(0.6, true)).toBe('Défi spécifique');
    });

    it('un seul repère suffit : la zone basse s\'arrête à lui, rien n\'est deviné', () => {
        const seulMaitrise = ECHELLE(); delete seulMaitrise.seuilSuffisance;
        const a = suivi({ echelles: [seulMaitrise], copies }).win;
        const ra = a.reperesPerformance();
        expect(a.borneBassePerformance(ra)).toBe(72);
        expect(a.bornesDepistage(ra)).toEqual({ bas: 0.6, maitrise: 0.72 });
        expect([71, 72].map((v) => a.zonePerformance(v, ra))).toEqual(['bas', 'acquis']);
    });

    it('décision du 30 oct., 11 h 33 : une sommative lit les repères de l\'échelle de ses copies ; une copie en points n\'en a pas', () => {
        const { win } = suivi({ echelles: [ECHELLE()], copies, famille: 'sommative' });
        const r = win.reperesPerformance();
        expect([r.echelle.id, r.raison, win.borneBassePerformance(r)]).toEqual(['E_ARB', null, 50]);
        const specif = suivi({ echelles: [ECHELLE()], copies, famille: 'specifications' }).win.reperesPerformance();
        expect([specif.echelle.id, specif.maitrise]).toEqual(['E_ARB', 72]);
        // Copies en points : pas d'échelle, même quand la bibliothèque n'en compte qu'une (`obtenirEchelleResolue(null)` la prêterait).
        const enPoints = suivi({ echelles: [ECHELLE()], copies: [{ echelleId: undefined }], famille: 'sommative' }).win.reperesPerformance();
        expect([enPoints.echelle, win.borneBassePerformance(enPoints)]).toEqual([null, 60]);
    });
});

describe('(d) quelle échelle : celle des copies, jamais la bibliothèque', () => {
    const autre = (id, plages) => { const e = echelleAReperes({ id, plages }); delete e.seuilSuffisance; delete e.seuilMaitrise; return e; };

    it('deux échelles aux mêmes plages : une seule, et les repères de celle qui en porte', () => {
        const { win } = suivi({ echelles: [ECHELLE(), autre('E_JUMELLE', PLAGES)], copies: [{ echelleId: 'E_JUMELLE' }, { echelleId: 'E_ARB' }] });
        const r = win.reperesPerformance();
        expect([r.echelle !== null, r.raison, r.suffisance, r.maitrise]).toEqual([true, null, 50, 72]);
    });

    it('plages différentes : aucune échelle, `echelles-divergentes`, et la note de passage reste', () => {
        const { win } = suivi({ echelles: [ECHELLE(), autre('E_AUTRE', [['A', 0, 59], ['B', 60, 100]])], copies: [{ echelleId: 'E_ARB' }, { echelleId: 'E_AUTRE' }] });
        const r = win.reperesPerformance();
        expect([r.echelle, r.raison, r.suffisance, r.maitrise, win.borneBassePerformance(r)]).toEqual([null, 'echelles-divergentes', null, null, 60]);
    });

    it('la bibliothèque du trimestre n\'entre pas en compte : une échelle sans copie ne dit rien', () => {
        const avecCopie = suivi({ echelles: [ECHELLE(), autre('E_BIBLIO', [['A', 0, 59], ['B', 60, 100]])], copies: [{ echelleId: 'E_ARB' }] }).win.reperesPerformance();
        expect([avecCopie.raison, avecCopie.suffisance]).toEqual([null, 50]);
        const sansCopie = suivi({ echelles: [ECHELLE()], copies: [] }).win.reperesPerformance();
        expect([sansCopie.echelle, sansCopie.raison, sansCopie.suffisance]).toEqual([null, 'aucune-copie', null]);
    });

    it('une copie qui ne compte pas (brouillon) ne désigne pas d\'échelle', () => {
        const r = suivi({ echelles: [ECHELLE()], copies: [{ echelleId: 'E_ARB', verrouillee: false }] }).win.reperesPerformance();
        expect(r.raison).toBe('aucune-copie');
    });

    it('le code ne lit plus `echellePerformanceActive`', () => {
        expect(sansCommentaires(lire('js/tableau-bord-apercu.js'))).not.toContain('echellePerformanceActive');
    });

    it('la démo porte ses repères sur ses deux échelles', () => {
        const bloc = tranche(lire('js/pack-demo-10.js'), '"echellesTemplates": [', '"modalitesEvaluation"');
        expect((bloc.match(/"seuilSuffisance": "D"/g) || []).length).toBe(2);
        expect((bloc.match(/"seuilMaitrise": "M"/g) || []).length).toBe(2);
    });
});

describe('(e) le stock : rien n\'est réécrit, `idme` reste sans être lu', () => {
    const STOCK = { progressionArtefacts: 0.05, directionRisque: 0.05, nombreProductionsAnalyse: 3, defiSpecifique: 0.7,
        idme: { insuffisant: 0.64, developpement: 0.75, maitrise: 0.85 }, interpretation: { excellent: 0.75, bon: 0.7, acceptable: 0.65 } };

    it('lire et qualifier n\'écrit rien, et le réglage enregistré garde la main sur les nouveaux défauts', () => {
        const { win, store, ecritures } = seuils(STOCK);
        expect(win.decrireContexte(0.84, 0.8)).toBe('Aucune absence ou presque, aucun travail manquant ou presque');
        win.qualifierContexteApprentissage(0.84, 0.8); win.interpreterMobilisation(0.84, 0.8); win.zonesDeLaBarre('A'); win.chargerSeuilsInterpretation();
        expect(ecritures).toEqual([]);
        expect(store.seuilsInterpretation).toEqual(STOCK);
    });

    it('un objet incomplet est comblé sans perdre `idme` ni le réglage', () => {
        const { win, store } = seuils({ idme: STOCK.idme, interpretation: { acceptable: 0.65 } });
        win.obtenirSeuil('interpretation.bon');
        expect(store.seuilsInterpretation.idme).toEqual(STOCK.idme);
        expect(store.seuilsInterpretation.interpretation).toEqual({ excellent: 0.95, bon: 0.90, acceptable: 0.65 });
    });

    it('« sauvegarder » un champ n\'emporte pas `idme`', () => {
        const b = panneau({ store: { seuilsInterpretation: clone(STOCK) }, champs: { 'v2-seuil-fragile': 85, 'v2-seuil-acceptable': 90, 'v2-seuil-bon': 95 } });
        expect(b.win.sauvegarderSeuilsV2()).toBe(true);
        expect(b.store.seuilsInterpretation.idme).toEqual(STOCK.idme);
        expect(b.store.seuilsInterpretation.interpretation).toEqual({ acceptable: 0.85, bon: 0.9, excellent: 0.95 });
    });

    it('aucun lecteur : plus un `obtenirSeuil(\'idme` ni une lecture `.idme` dans js/', () => {
        const fichiers = (d) => readdirSync(path.join(RACINE, d), { withFileTypes: true }).flatMap((e) => {
            const r = path.join(d, e.name);
            if (e.name === '_archives') return [];
            return e.isDirectory() ? fichiers(r) : (e.name.endsWith('.js') ? [r] : []);
        });
        const lecteurs = fichiers('js').filter((f) => /obtenirSeuil\(\s*['"]idme|\.idme\b|['"]idme\./.test(sansCommentaires(lire(f))));
        expect(lecteurs).toEqual([]);
    });
});

/** Le panneau de Labo › Outils d'observation, réel. */
function panneau({ store = {}, champs = {} } = {}) {
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = clone(v); }, removeSync: (k) => { delete store[k]; }, get: async () => null, set: async () => {} };
    const ecritures = [];
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const win = { addEventListener() {}, removeEventListener() {}, dbReady: false, obtenirTrimestreId: () => 'test', temoinEnregistrement: temoin };
    const globaux = {
        db, cle: (k) => k, obtenirDonneesSelonMode: () => [], obtenirPreference: () => null, definirPreference: () => true,
        sauvegarderDonneesSelonMode: (k, v) => { ecritures.push(k); store[k] = clone(v); return true; },
        ecrireEtAnnoncer: async (k, ecrire) => ecrire(), notifications: { succes() {}, erreur() {}, info() {} }, alert() {}
    };
    chargerScript('js/interpretation-config.js', globaux, win);
    globaux.obtenirSeuil = win.obtenirSeuil;
    globaux.chargerSeuilsInterpretation = win.chargerSeuilsInterpretation;
    const elems = {};
    for (const [id, valeur] of Object.entries(champs)) {
        let v = String(valeur);
        elems[id] = { checked: false, get value() { return v; }, set value(x) { v = String(x); } };
    }
    const document = { readyState: 'complete', addEventListener() {}, removeEventListener() {}, getElementById: (id) => elems[id] || null, querySelector: () => null, querySelectorAll: () => [],
        createElement: () => ({ style: {}, classList: { add() {}, remove() {}, contains() { return false; } }, setAttribute() {}, appendChild() {}, addEventListener() {} }),
        body: { classList: { add() {}, remove() {}, contains() { return false; } }, addEventListener() {}, appendChild() {}, setAttribute() {}, getAttribute() { return null; } }, documentElement: { addEventListener() {} } };
    chargerScript('js/preferences-v2.js', Object.assign({ document }, globaux), win);
    return { win, store, elems, ecritures, temoin };
}

describe('(f) les réglages : 85 passe, le désordre est refusé, « Restaurer » lit la source', () => {
    const champs = (f, a, b) => ({ 'v2-seuil-fragile': f, 'v2-seuil-acceptable': a, 'v2-seuil-bon': b });

    it('85 · 90 · 95 s\'enregistre', () => {
        const b = panneau({ champs: champs(85, 90, 95) });
        expect(b.win.sauvegarderSeuilsV2()).toBe(true);
        expect(b.store.seuilsInterpretation.interpretation).toEqual({ acceptable: 0.85, bon: 0.9, excellent: 0.95 });
    });

    for (const [f, a, c] of [[90, 85, 95], [85, 95, 90], [85, 85, 95]]) {
        it(`${f} · ${a} · ${c} est refusé, sans rien écrire`, () => {
            const stock = { interpretation: { acceptable: 0.65, bon: 0.7, excellent: 0.75 } };
            const b = panneau({ store: { seuilsInterpretation: clone(stock) }, champs: champs(f, a, c) });
            const avant = clone(b.store.seuilsInterpretation);
            expect(b.win.sauvegarderSeuilsV2()).toBe(false);
            expect(b.ecritures).toEqual([]);
            expect(b.store.seuilsInterpretation).toEqual(avant);
            expect(b.temoin.nonEnregistre).toHaveBeenCalledTimes(1);
        });
    }

    it('un champ vide retombe sur le défaut de la source', () => {
        const b = panneau({ champs: champs('', '', '') });
        expect(b.win.sauvegarderSeuilsV2()).toBe(true);
        expect(b.store.seuilsInterpretation.interpretation).toEqual({ acceptable: 0.85, bon: 0.9, excellent: 0.95 });
    });

    it('« Restaurer » pose les défauts de `SEUILS_PAR_DEFAUT`, lus à l\'appel', () => {
        const b = panneau({ champs: champs(1, 2, 3) });
        b.win.restaurerSeuilsInterpretationDefautV2();
        expect(['v2-seuil-fragile', 'v2-seuil-acceptable', 'v2-seuil-bon'].map((id) => b.elems[id].value)).toEqual(['85', '90', '95']);
        b.win.SEUILS_PAR_DEFAUT.interpretation.bon = 0.91;
        b.win.restaurerSeuilsInterpretationDefautV2();
        expect(b.elems['v2-seuil-acceptable'].value).toBe('91');
        expect(sansCommentaires(lire('js/preferences-v2.js'))).not.toMatch(/\|\|\s*(70|80|85)\b|\.value\s*=\s*\d/);
    });

    it('les champs : le bas accepte 85 et plus, et aucun ne porte de `value` en dur', () => {
        const html = lire('index.html');
        const champ = (id) => html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`))[0];
        expect(Number(champ('v2-seuil-fragile').match(/max="(\d+)"/)[1])).toBeGreaterThanOrEqual(85);
        expect(Number(champ('v2-seuil-acceptable').match(/max="(\d+)"/)[1])).toBeGreaterThanOrEqual(90);
        expect(Number(champ('v2-seuil-bon').match(/max="(\d+)"/)[1])).toBeGreaterThanOrEqual(95);
        for (const id of ['v2-seuil-fragile', 'v2-seuil-acceptable', 'v2-seuil-bon', 'v2-pref-fenetre-patterns', 'v2-seuil-progression', 'v2-seuil-risque', 'v2-seuil-defi']) {
            expect(champ(id), id).not.toMatch(/\bvalue=/);
        }
    });
});

describe('(g) plus aucune borne de P écrite pour le Suivi', () => {
    it('ni pastille, ni filtre, ni couleur, ni note de passage', () => {
        const tdb = sansCommentaires(lire('js/tableau-bord-apercu.js'));
        expect(tdb).not.toMatch(/\b(e\.P|valeur|P)\s*(>=|<=|<|>)\s*\d/);
        expect(tdb).not.toMatch(/\d+\s*-\s*e\.P\b/);
        expect(tdb).not.toMatch(/'P < \d/);
        expect(tdb).not.toMatch(/notePassage\s*=\s*\d|\b0\.60\b/);
        expect(tdb).not.toMatch(/note de passage \(\d/);
        const etud = sansCommentaires(lire('js/etudiants.js'));
        expect(etud).not.toMatch(/\b(performance|taux)\s*(>=|<=|<|>)\s*\d/);
        expect(etud).toContain('window.obtenirCouleurPerformanceSelonEchelle(performance, reperes)');
        expect(etud.match(/window\.reperesPerformance\(\)/g), 'lus une fois par rendu').toHaveLength(1);
    });

    it('le RàI et la suggestion d\'objectif ne portent plus de borne', () => {
        const calculs = sansCommentaires(lire('js/profil-etudiant-calculs.js'));
        expect(calculs).not.toMatch(/seuilIdme|\bP\s*<\s*0\.\d/);
        expect(sansCommentaires(lire('js/interventions.js'))).not.toMatch(/\bseuil(Insuffisant|Developpement)\s*=\s*[^;]*0\.\d/);
    });

    it('`NOTE_DE_PASSAGE` n\'a qu\'une définition', () => {
        const fichiers = readdirSync(path.join(RACINE, 'js')).filter((f) => f.endsWith('.js'));
        const definitions = fichiers.filter((f) => /\bNOTE_DE_PASSAGE\s*=\s*\d/.test(sansCommentaires(lire(path.join('js', f)))));
        expect(definitions).toEqual(['interpretation-config.js']);
    });
});

describe('(h) les barres : un point reste dans la zone de son palier', () => {
    const { i, win } = suivi();
    const zones = win.zonesDeLaBarre('A');
    const position = (v) => (v - 0.3) / 0.7 * 100;

    it('un décalage ne fait jamais changer de zone, même étroite', () => {
        const zone = (p) => zones.find((z) => p >= position(z.de) && p <= position(z.a)).zone;
        for (const v of [0.84, 0.85, 0.89, 0.9, 0.94, 0.95, 1]) {
            for (const decalage of [-3, 3]) {
                const p = i.positionDansSaZone(position(v) + decalage, v, zones);
                expect(zone(p), `${v} ${decalage}`).toBe(i.zoneDeLaValeur(zones, v).zone);
            }
        }
    });

    it('le fond de la barre porte ces zones, à bords nets, et 84 % n\'est pas dans le bleu', () => {
        const fond = i.fondDeLaBarre(zones);
        expect((fond.match(/#dc3545/g) || []).length).toBe(2);
        expect(fond).toContain('#2196F3');
        expect(i.zoneDeLaValeur(zones, 0.84).couleur).toBe('#dc3545');
        expect(i.zoneDeLaValeur(zones, 1).zone).toBe('audela');
    });
});

// JOURNAL DES BREAK-TESTS — 30 oct. 2026, dans un banc jetable (copie de js/, index.html et tests/unit), une mutation à la fois :
//   M1  défaut `excellent` 0,95 → 0,85 ..................... 6 rouges (a, e)
//   M2  contexte : palier favorable en dur à 0,75 .......... 2 rouges (a, b)
//   M3  pastille de P : 65 en dur .......................... 2 rouges (c, g)
//   M4  `idme` perdu à la réécriture ....................... 1 rouge  (e)
//   M5  le désordre des trois champs accepté ............... 3 rouges (f)
//   M6  un point sort de sa zone ........................... 1 rouge  (h)
//   M7  échelles divergentes : la première choisie ......... 1 rouge  (d)
//   M8  filtre P : toujours la note de passage ............. 2 rouges (c)
//   M9  champ du bas plafonné à 80 ......................... 1 rouge  (f)
//   M10 « Restaurer » : une valeur en dur .................. 1 rouge  (f)
//   M11 RàI : la maîtrise à 75 en dur ...................... 2 rouges (c)
//   M12 la borne fixe à 60 de retour ....................... 1 rouge  (a)
// 37/37 verts sans mutation.

describe('Le code d\u2019un niveau vient de l\u2019échelle de l\u2019enseignant : il s\u2019échappe dans le bilan', () => {
    it('la lettre du bilan passe par echapperHtml', () => {
        const src = readFileSync(new URL('../../js/interventions.js', import.meta.url), 'utf-8');
        expect(src).toMatch(/return niveau \? echapperHtml\(String\(niveau\.code\)\) : '—';/);
    });
});

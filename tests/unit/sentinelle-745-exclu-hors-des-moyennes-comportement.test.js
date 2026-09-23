/**
 * SENTINELLE #745, suite — « L'EXCLU RESTE HORS DES MOYENNES DU GROUPE », JUGÉ PAR LE COMPORTEMENT.
 *
 * Dû par la relecture croisée du lot 32 (Cowork, 17 sept. 2026, 12 h 45 — tête de la section 1.142.28 de RELAIS.md) :
 * trois mutations survivaient à la suite entière — le filtre des exclus GARDÉ dans son texte et rendu inopérant
 * (`!estEtudiantExclu(e) || e.statut`) dans `presences-apercu.js` (E2b), `snapshots.js` (E3b) et
 * `graphiques-progression.js` ~2651 (E4b). Depuis le lot 32 les magasins d'indices CONTIENNENT les exclus : ces
 * filtres portent seuls la promesse, et un compte textuel ne les juge pas.
 *
 * CE QUE LA MESURE A MONTRÉ (lot 34) — la consigne demandait trois essais ; deux des trois sites n'ont pas d'écran :
 *   · E3b — `capturerSnapshotSeance` (snapshots.js) : VIVANT (deux appelants). Essai de comportement ci-dessous.
 *   · E2b — `chargerApercuPresences` (presences-apercu.js) : AUCUN appelant dans le dossier js/ ni dans index.html, et
 *           ses cibles (`pa-taux-moyen`, `stat-nb-eleves`…) n'existent pas dans index.html.
 *   · E4b — `creerGraphiqueDistributionACPE` (graphiques-progression.js) : AUCUN appelant non plus.
 *   Un essai de comportement sur une fonction que rien n'appelle ne jugerait aucun écran. À la place, un VERROU : le
 *   jour où l'une des deux reçoit un appelant, l'essai rougit et la preuve de comportement devient due.
 *   · E4b, LE VRAI TROU — sondés par la même mutation, les SIX filtres des courbes du groupe VIVANTES
 *           (`creerGraphiqueTrajectoiresProduction`, appelée par le tableau de bord) survivaient tous aux douze bancs qui
 *           lisent graphiques-progression.js. Section C : médiane et bande de la note finale, courbes et bandes des
 *           habiletés, vue « Tous » — celles des seuls actifs, l'exclu restant tracé à part (« inactif »).
 *
 *           Deux des six sites (~1311, ~4202) restent muets À DESSEIN : ils ne portent aucune moyenne, ils posent la
 *           mention « (inactif) » et le trait gris de la courbe de l'exclu.
 *
 * Break-tests attendus : E3b `tousEtudiants.filter(e => !estEtudiantExclu(e) || e.statut)` → A.1 et A.2 ;
 * `estEtudiantExclu(x)` → `(estEtudiantExclu(x) && !x.statut)` aux lignes ~3671, ~3688, ~3776, ~3839 → C.1 à C.3.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';
import { tranche } from './_helpers/tranche.js';
import { monter as monterSuivi, storeBase, elementDom } from './_helpers/bac-suivi.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => JSON.parse(JSON.stringify(x));

const ASSIDU = '2000001', EXCLU = '2000002', TEMOIN = '2000003';
const ELEVES = (statutExclu) => [
    { da: ASSIDU, nom: 'Assidu', prenom: 'Ana', groupe: '01' },
    { da: EXCLU, nom: 'Exclu', prenom: 'Eli', groupe: '01', statut: statutExclu },
    { da: TEMOIN, nom: 'Témoin', prenom: 'Tom', groupe: '01' }
];
const PRODUCTIONS = [{ id: 'P1', titre: 'Analyse 1', type: 'travail', dateEcheance: '2026-02-01' }, { id: 'P2', titre: 'Analyse 2', type: 'travail', dateEcheance: '2026-03-01' }];
const ev = (id, da, prod, niveau, note) => ({ id, etudiantDA: da, productionId: prod, niveauFinal: niveau, noteFinale: note, verrouillee: true, ponderationCouverte: 100, dateEvaluation: '2026-03-10' });
// L'exclu est CALCULÉ, et ses nombres tirent fort : A 20 (contre 100 et 80), P 40 (contre 83 et 65), P2 non remise.
const EVALUATIONS = [ev('E1', ASSIDU, 'P1', 'E', 85), ev('E2', ASSIDU, 'P2', 'D', 70), ev('E3', TEMOIN, 'P1', 'D', 70), ev('E4', TEMOIN, 'P2', 'D', 70), ev('E5', EXCLU, 'P1', 'I', 40)];
const ASSIDUITE = { [ASSIDU]: 1, [EXCLU]: 0.2, [TEMOIN]: 0.8 };

// La VRAIE règle d'exclusion de main.js.
function vraiEstEtudiantExclu() {
    const w = {};
    new Function('window', tranche(source('js/main.js'), 'window.estEtudiantExclu = function', 'window.estRessourceSupprimee', { longueurMin: 400 }))(w);
    return w.estEtudiantExclu;
}

function monter(eleves) {
    const store = { test_evaluationsSauvegardees: EVALUATIONS, test_productions: PRODUCTIONS, infoCours: { id: 'GC1', _groupeCoursId: 'GC1' } };
    const db = { getSync: (k, d) => (k in store ? clone(store[k]) : (d !== undefined ? d : null)), setSync() {}, get: async (k) => (k in store ? clone(store[k]) : null),
        set: async (k, v) => { store[k] = clone(v); }, useIndexedDB: false, memoryCache: new Map() };
    const win = { addEventListener() {}, removeEventListener() {}, dateLocaleYMD: () => '2026-05-15' };
    chargerPredicatsCopie(win);
    chargerScript('js/snapshots.js', { db, cle: (k) => 'test_' + k, echapperHtml: (s) => String(s),
        obtenirDonneesSelonMode: (k) => clone(store['test_' + String(k).replace(/^test_/, '')] || []),
        calculerAssiduite: (da) => ({ indice: ASSIDUITE[da], periodesPresentes: 20 * ASSIDUITE[da], periodesOffertes: 20, nombreSeances: 10 }),
        obtenirEcheanceEffective: (p) => ({ date: p.dateEcheance || null, assignee: true }),
        obtenirCalendrierComplet: () => ({}), obtenirSeancesCompletes: () => ({}),
        obtenirEtudiantsCoursActif: () => clone(eleves), estEtudiantExclu: vraiEstEtudiantExclu(),
        notifications: { succes() {}, erreur() {}, info() {} } }, win);
    return win;
}
const releve = async (eleves) => (await monter(eleves).capturerSnapshotSeance('2026-03-16', null, { numeroSemaine: 10 }));

describe('#745 · E3b — le relevé hebdomadaire : les moyennes du groupe sont celles des seuls actifs', () => {
    it('A.0 garde du banc : l\'exclu EST calculé et ses nombres tirent la moyenne (actif, il la déplace)', async () => {
        const s = await releve(ELEVES('actif'));
        expect(s, 'le relevé doit être capturé').toBeTruthy();
        expect(s.groupe.nbEtudiants).toBe(3);
        expect(s.etudiants.find(e => e.da === EXCLU).A).toBe(20);
        expect(s.groupe.moyenneA).toBe(67);                        // (100 + 20 + 80) / 3
    });
    it('A.1 en décrochage : moyennes A, C, P et dispersions = celles du groupe SANS lui ; trois élèves, deux comptés', async () => {
        const avecExclu = await releve(ELEVES('décrochage'));
        const sansLui = await releve(ELEVES('actif').filter(e => e.da !== EXCLU));
        expect(avecExclu.groupe).toEqual(sansLui.groupe);
        expect(avecExclu.groupe.nbEtudiants).toBe(2);
        expect(avecExclu.groupe.moyenneA).toBe(90);                // (100 + 80) / 2 — pas 67
        expect(avecExclu.groupe.moyenneC).toBe(100);               // P2 remise par les deux actifs — pas 67
    });
    it('A.2 son entrée individuelle n\'est pas dans le relevé du groupe', async () => {
        const s = await releve(ELEVES('décrochage'));
        expect(s.etudiants.map(e => e.da)).toEqual([ASSIDU, TEMOIN]);
    });
});

describe('#745 · E2b et E4b — deux filtres dans du code SANS APPELANT : aucun écran à juger (mesuré au lot 34)', () => {
    const fichiersJs = (() => {
        const out = [];
        const parcourir = (d) => readdirSync(path.join(RACINE, d), { withFileTypes: true }).forEach(f => {
            if (f.isDirectory()) parcourir(d + '/' + f.name); else if (f.name.endsWith('.js')) out.push(d + '/' + f.name);
        });
        parcourir('js');
        return out;
    })();
    const appelants = (nom, chezSoi) => {
        const re = new RegExp('\\b' + nom + '\\b');
        const hits = [];
        for (const f of fichiersJs.concat(['index.html'])) {
            source(f).split('\n').forEach((ligne, i) => {
                if (!re.test(ligne)) return;
                // Chez soi : la définition, l'export sur window et les messages de console ne sont pas des appels.
                if (f === chezSoi && (/^\s*(async\s+)?function\s/.test(ligne) || /^\s*window\./.test(ligne) || /console\.(warn|error)/.test(ligne) || /^\s*(\*|\/\/)/.test(ligne))) return;
                hits.push(f + ':' + (i + 1));
            });
        }
        return hits;
    };
    it('B.0 garde du banc : la même recherche TROUVE les appelants d\'une fonction vivante', () => {
        expect(fichiersJs.length).toBeGreaterThan(100);
        expect(appelants('capturerSnapshotSeance', 'js/snapshots.js').length).toBeGreaterThanOrEqual(2);
    });
    it('B.1 `chargerApercuPresences` n\'a aucun appelant, et ses cibles n\'existent pas dans index.html', () => {
        expect(appelants('chargerApercuPresences', 'js/presences-apercu.js')).toEqual([]);
        const html = source('index.html');
        for (const id of ['pa-taux-moyen', 'pa-seances-donnees', 'pa-prochaine-seance']) expect(html.includes('id="' + id + '"')).toBe(false);
    });
    it('B.2 `creerGraphiqueDistributionACPE` n\'a aucun appelant', () => {
        expect(appelants('creerGraphiqueDistributionACPE', 'js/graphiques-progression.js')).toEqual([]);
    });
});

/* ============================================================================================= */
describe('#745 · E4b, le vrai trou — les courbes du groupe VIVANTES (trajectoires par production) sont celles des seuls actifs', () => {
    const CANVAS = 'graphique-trajectoires-production';
    const evC = (id, da, pid, niveau, note, date) => ({ id, etudiantDA: da, productionId: pid, coursId: 'GC1', echelleId: 'EABC', dateEvaluation: date, noteFinale: note,
        criteres: [{ critereId: 'c1', critereNom: 'Structure', ponderation: 100, niveauSelectionne: niveau }] });
    const E_ABC = { id: 'EABC', nom: 'Trois paliers', parDefaut: true, seuilMaitrise: 'B', niveaux: [
        { code: 'A', nom: 'À reprendre', min: 0, max: 59, valeurCalcul: 50, couleur: '#aa0000' },
        { code: 'B', nom: 'Atteint', min: 60, max: 84, valeurCalcul: 70, couleur: '#00aa00' },
        { code: 'C', nom: 'Dépassé', min: 85, max: 100, valeurCalcul: 90, couleur: '#0000aa' }] };
    // Trois élèves du groupe GC1 (storeBase) ; 2000002 est l'exclu, et ses copies tirent fort vers le bas.
    const DA_EXCLU = '2000002';
    function rendre(options, cas) {
        const store = storeBase();
        store.test_echellesTemplates = [E_ABC];
        store.test_productions = [{ id: 'P1', titre: 'Un', dateEcheance: '2026-02-03' }, { id: 'P2', titre: 'Deux', dateEcheance: '2026-02-10' }];
        store.test_evaluationsSauvegardees = [
            evC('E1', '2000001', 'P1', 'C', 90, '2026-02-03'), evC('E2', '2000001', 'P2', 'C', 92, '2026-02-10'),
            evC('E3', DA_EXCLU, 'P1', 'A', 20, '2026-02-03'), evC('E4', DA_EXCLU, 'P2', 'A', 10, '2026-02-10'),
            evC('E5', '2000003', 'P1', 'B', 70, '2026-02-03'), evC('E6', '2000003', 'P2', 'B', 74, '2026-02-10')];
        if (cas === 'exclu') store.test_groupeEtudiants.find(e => e.da === DA_EXCLU).statut = 'décrochage';
        if (cas === 'sansLui') store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da !== DA_EXCLU);
        const configs = [];
        const Chart = function (c, config) { configs.push(config); this.destroy = () => {}; }; Chart.getChart = () => null;
        const ctx = new Proxy({ measureText: () => ({ width: 40 }) }, { get: (cible, cle) => (cle in cible ? cible[cle] : () => {}), set: () => true });
        const b = monterSuivi(store, {
            elements: { [CANVAS]: elementDom({ id: CANVAS, parentNode: {}, ownerDocument: {}, getContext: () => ctx }) },
            globaux: { Chart, estEtudiantExclu: vraiEstEtudiantExclu(), obtenirTermeProduction: (f) => (f === 'pluriel' ? 'Productions' : 'production'), obtenirInterventionsEtudiant: () => [], toggleDisplay() {} },
            modules: ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-rapport.js', 'js/profil-etudiant-confidentiel.js', { chemin: 'js/graphiques-progression.js', internes: [] }],
            objetsExportes: ['profilActuelDA', 'etudiantsListeCache']
        });
        b.win.creerGraphiqueTrajectoiresProduction(CANVAS, options);
        if (!configs[0]) throw new Error('banc : aucun graphique construit');
        return configs[0].data.datasets.map(d => ({ label: d.label, da: d.da || null, stat: !!d._isStat, exclu: !!d.exclu, data: d.data }));
    }
    const sansLExclu = (ds) => ds.filter(d => d.da !== DA_EXCLU);

    it('C.0 garde du banc : actif, il DÉPLACE la médiane du groupe (sinon les essais suivants ne prouvent rien)', () => {
        const actif = rendre({ mesure: 'noteFinale', afficherMediane: true }, 'actif').filter(d => d.stat);
        const sansLui = rendre({ mesure: 'noteFinale', afficherMediane: true }, 'sansLui').filter(d => d.stat);
        expect(actif.length).toBeGreaterThan(0);
        expect(actif).not.toEqual(sansLui);
    });
    it('C.1 note finale : médiane et bande Q25–Q75 = celles du groupe sans lui ; sa courbe reste tracée, marquée exclue', () => {
        const avec = rendre({ mesure: 'noteFinale', afficherMediane: true }, 'exclu');
        const sansLui = rendre({ mesure: 'noteFinale', afficherMediane: true }, 'sansLui');
        expect(avec.filter(d => d.stat)).toEqual(sansLui.filter(d => d.stat));
        expect(avec.filter(d => d.stat).length).toBeGreaterThan(0);
        expect(avec.find(d => d.da === DA_EXCLU)).toMatchObject({ exclu: true, data: [0.2, 0.1] });
        expect(sansLExclu(avec).every(d => !d.exclu)).toBe(true);
    });
    it('C.2 habiletés, vue du groupe : les courbes par critère (médianes) et leurs bandes = celles du groupe sans lui', () => {
        const avec = rendre({ mesure: 'habiletes' }, 'exclu');
        const sansLui = rendre({ mesure: 'habiletes' }, 'sansLui');
        expect(avec.length).toBeGreaterThan(0);
        expect(avec).toEqual(sansLui);
        expect(avec).not.toEqual(rendre({ mesure: 'habiletes' }, 'actif'));          // garde : actif, il les déplaçait
    });
    it('C.3 habiletés, « Tous les étudiants » : aucune courbe fine pour lui, et les médianes = celles du groupe sans lui', () => {
        const avec = rendre({ mesure: 'habiletes', daSurbrillance: 'TOUS' }, 'exclu');
        const sansLui = rendre({ mesure: 'habiletes', daSurbrillance: 'TOUS' }, 'sansLui');
        expect(avec.some(d => d.da === DA_EXCLU)).toBe(false);
        expect(avec).toEqual(sansLui);
        expect(rendre({ mesure: 'habiletes', daSurbrillance: 'TOUS' }, 'actif').some(d => d.da === DA_EXCLU)).toBe(true);   // garde
    });
});

/**
 * SENTINELLE DU LOT D DU CADRAGE DU DÉPISTAGE (#735, #743, #750) — L'ASSIDUITÉ QUI MANQUE.
 *
 * Tranché par Grégoire le 16 septembre 2026 (page « Questions du dépistage »), livré le 19 :
 *   · #735 — une date d'arrivée FACULTATIVE sur la fiche (`dateArrivee`, « AAAA-MM-JJ ») : les séances d'avant
 *     cette date ne comptent pas ; sans date, le calcul d'avant, au chiffre près ;
 *   · #743 — tant qu'aucune séance saisie ne compte pour un·e élève, son assiduité est INCONNUE : `null`,
 *     jamais 100 (l'ancien `indice: 1`), jamais 0 ;
 *   · #750 — les deux moyennes A du groupe suivent cette règle (jouées dans WebKit :
 *     tests/integration/assiduite-lot-D-date-arrivee-et-inconnu.spec.js).
 *
 * Ce banc exécute `indices.js` tel quel (calcul, lecteur du magasin, lecteurs composites) et `snapshots.js`
 * pour le relevé historique. Le STOCK d'avant le lot (`indice: 1, nombreSeances: 0`) n'est pas réécrit : il est
 * LU comme inconnu par `lireIndiceAssiduite` — (c).
 *
 * Break-tests attendus : la date ignorée dans `calculerAssiduite` → (a) ; `indice: 1` remis → (b) ; le lecteur
 * qui croit le stock d'avant → (c) ; `Math.round(null * 100)` remis dans le relevé historique → (d) ; le taux
 * en direct remis à 100 → (e).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ANCIEN = '2000001';     // inscrit depuis le début, présent partout
const TARDIF = '2000002';     // arrivé en semaine 6 : aucune fiche de présence avant
// Dix séances de 2 périodes ; les cinq premières précèdent l'arrivée du tardif.
const DATES = ['2026-08-25', '2026-08-27', '2026-09-01', '2026-09-03', '2026-09-08',
    '2026-09-29', '2026-10-01', '2026-10-06', '2026-10-08', '2026-10-13'];
const ARRIVEE = '2026-09-29';

function monter({ dateArrivee = null, presences = null, stockA = null } = {}) {
    const lignes = presences || [
        ...DATES.map(date => ({ da: ANCIEN, date, periodesPresentes: 2 })),
        ...DATES.slice(5).map(date => ({ da: TARDIF, date, periodesPresentes: 2 }))
    ];
    const ficheTardif = { da: TARDIF, nom: 'Tardif', prenom: 'Théo', groupe: '01' };
    if (dateArrivee !== null) ficheTardif.dateArrivee = dateArrivee;
    const store = {
        test_groupeEtudiants: [{ da: ANCIEN, nom: 'Ancien', prenom: 'Alice', groupe: '01' }, ficheTardif],
        test_presences: lignes,
        test_indicesCP: { [ANCIEN]: { actuel: { C: 80, P: 70 } }, [TARDIF]: { actuel: { C: 60, P: 65 } } },
        test_indicesAssiduite: stockA || {}
    };
    const copie = (v) => JSON.parse(JSON.stringify(v));
    const db = { getSync: (k, d) => (k in store ? copie(store[k]) : (d !== undefined ? d : null)), setSync: (k, v) => { store[k] = copie(v); } };
    const seancesCompletes = lignes.length ? Object.fromEntries(DATES.map(d => [d, [{ nombrePeriodes: 2 }]])) : {};
    const socle = {
        db, cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: (k) => copie(store['test_' + k] || []),
        sauvegarderDonneesSelonMode: (k, v) => { store['test_' + k] = copie(v); },
        obtenirSeancesCompletes: () => seancesCompletes,
        obtenirNombrePeriodesSeance: (d) => (seancesCompletes[d] || []).reduce((n, s) => n + (s.nombrePeriodes || 0), 0),
        obtenirDureePeriode: () => 50, obtenirTypePratiqueActive: () => 'standards'
    };
    const win = chargerScript('js/indices.js', socle);
    return { win, store, socle };
}

describe('lot D · #735 — la date d\'arrivée', () => {
    it('(a) arrivé en semaine 6 : sans date, les cinq séances d\'avant sont des absences (50 %) ; avec la date, l\'assiduité se compte depuis l\'arrivée (100 %, 5 séances)', () => {
        const sans = monter().win.calculerAssiduite(TARDIF, '2026-12-01');
        expect(sans).toEqual({ indice: 0.5, periodesPresentes: 10, periodesOffertes: 20, nombreSeances: 10 });   // le constat A-2 de l'audit

        const avec = monter({ dateArrivee: ARRIVEE }).win.calculerAssiduite(TARDIF, '2026-12-01');
        expect(avec).toEqual({ indice: 1, periodesPresentes: 10, periodesOffertes: 10, nombreSeances: 5 });
    });

    it('(a2) la date d\'un élève ne touche pas son voisin, et une absence RÉELLE après l\'arrivée reste une absence', () => {
        const b = monter({ dateArrivee: ARRIVEE });
        expect(b.win.calculerAssiduite(ANCIEN, '2026-12-01')).toMatchObject({ indice: 1, nombreSeances: 10 });

        const presences = [
            ...DATES.map(date => ({ da: ANCIEN, date, periodesPresentes: 2 })),
            ...DATES.slice(6).map(date => ({ da: TARDIF, date, periodesPresentes: 2 }))     // absent le jour même de son arrivée
        ];
        const absent = monter({ dateArrivee: ARRIVEE, presences }).win.calculerAssiduite(TARDIF, '2026-12-01');
        expect(absent).toMatchObject({ indice: 0.8, periodesPresentes: 8, periodesOffertes: 10, nombreSeances: 5 });
    });

    it('(a3) une date vide, absente ou mal formée se lit comme « pas de date » : le calcul d\'avant, au chiffre près', () => {
        const reference = monter().win.calculerAssiduite(TARDIF, '2026-12-01');
        ['', '29 septembre', '2026-9-29', 20260929, null].forEach(valeur => {
            const b = monter({ dateArrivee: valeur });
            expect(b.win.obtenirDateArrivee(TARDIF)).toBeNull();
            expect(b.win.calculerAssiduite(TARDIF, '2026-12-01')).toEqual(reference);
        });
        expect(monter({ dateArrivee: ARRIVEE }).win.obtenirDateArrivee(TARDIF)).toBe(ARRIVEE);
        expect(monter().win.obtenirDateArrivee('inconnu')).toBeNull();
    });
});

describe('lot D · #743 — l\'assiduité inconnue', () => {
    it('(b) aucune séance qui compte : `indice` vaut null — ni 1 ni 0 ; les lecteurs composites rendent A null et M null, C et P intacts', () => {
        const vide = monter({ presences: [] });
        expect(vide.win.calculerAssiduite(ANCIEN, '2026-12-01')).toEqual({ indice: null, periodesPresentes: 0, periodesOffertes: 0, nombreSeances: 0 });

        // Arrivée APRÈS la dernière séance saisie : rien ne compte encore pour lui.
        const b = monter({ dateArrivee: '2026-11-15' });
        expect(b.win.calculerAssiduite(TARDIF, '2026-12-01').indice).toBeNull();
        b.store.test_indicesAssiduite = { sommatif: { [TARDIF]: b.win.calculerAssiduite(TARDIF, '2026-12-01'), [ANCIEN]: b.win.calculerAssiduite(ANCIEN, '2026-12-01') } };
        expect(b.win.calculerTousLesIndices(TARDIF)).toMatchObject({ A: null, C: 60, P: 65 });   // 15 oct. 2026 : plus d'indice M (#1083, 6.46)
        expect(b.win.calculerTousLesIndices(ANCIEN)).toMatchObject({ A: 100, C: 80, P: 70 });
        expect(b.win.calculerIndicesEtudiant(TARDIF).sommatif).toMatchObject({ assiduite: null, nombreSeances: 0 });
        expect(b.win.calculerIndicesEtudiant(ANCIEN).sommatif).toMatchObject({ assiduite: 1, nombreSeances: 10 });
    });

    it('(c) le lecteur du magasin : le STOCK d\'avant le lot (`indice: 1, nombreSeances: 0`) se lit inconnu sans être réécrit ; un 0 % réel reste 0', () => {
        const { win, store } = monter({ stockA: { sommatif: { [ANCIEN]: { indice: 1, periodesPresentes: 0, periodesOffertes: 0, nombreSeances: 0 } } } });
        const lire = win.lireIndiceAssiduite;
        expect(lire({ indice: 1, periodesPresentes: 0, periodesOffertes: 0, nombreSeances: 0 })).toBeNull();
        expect(lire({ indice: null, periodesPresentes: 0, periodesOffertes: 0, nombreSeances: 0 })).toBeNull();
        expect(lire(undefined)).toBeNull();
        expect(lire(null)).toBeNull();
        expect(lire({ indice: 0, periodesPresentes: 0, periodesOffertes: 20, nombreSeances: 10 })).toBe(0);   // l'absent total : CONNU, 0 %
        expect(lire({ indice: 0.9 })).toBe(0.9);        // objet sans compteurs : cru sur son indice
        expect(lire(0.75)).toBe(0.75);                  // ancien format « nombre »
        expect(win.calculerTousLesIndices(ANCIEN).A).toBeNull();
        expect(store.test_indicesAssiduite.sommatif[ANCIEN].indice).toBe(1);      // le stock n'a pas été touché par la lecture
    });

    it('(d) le relevé historique d\'un snapshot : A null avant toute séance qui compte (avant : 100 par défaut, puis 0 par arrondi)', () => {
        const b = monter({ dateArrivee: ARRIVEE });
        b.store.infoCours = { id: 'GC1', _groupeCoursId: 'GC1' };
        const win = { addEventListener() {}, removeEventListener() {}, dateLocaleYMD: () => '2026-12-01' };
        chargerPredicatsCopie(win);
        chargerScript('js/snapshots.js', Object.assign({}, b.socle, {
            echapperHtml: (x) => String(x),
            calculerAssiduite: b.win.calculerAssiduite,                       // le calcul RÉEL, pas un bouchon
            obtenirEcheanceEffective: (prod) => ({ date: prod.dateEcheance || null, assignee: true }),
            obtenirCalendrierComplet: () => ({}), obtenirEtudiantsCoursActif: () => [], estEtudiantExclu: () => false,
            notifications: { succes() {}, erreur() {}, info() {} }
        }), win);
        expect(win.calculerIndicesHistoriques(TARDIF, '2026-09-08', []).A).toBeNull();      // avant son arrivée
        expect(win.calculerIndicesHistoriques(TARDIF, '2026-10-01', []).A).toBe(100);       // deux séances depuis l'arrivée, présent aux deux
        expect(win.calculerIndicesHistoriques(ANCIEN, '2026-09-08', []).A).toBe(100);
    });

    it('(e) le taux en direct de la saisie : une séance d\'avant l\'arrivée ne compte pas (taux null), la suivante compte', () => {
        const b = monter({ dateArrivee: ARRIVEE });
        expect(b.win.calculerAssiduitePourAffichage(TARDIF, '2026-09-03', 0).taux).toBeNull();
        expect(b.win.calculerAssiduitePourAffichage(TARDIF, '2026-10-06', 1).taux).toBe(83);    // (2 + 2 + 1) / 6
        expect(monter().win.calculerAssiduitePourAffichage(TARDIF, '2026-10-06', 1).taux).toBe(31);   // sans date : (0×5 + 2 + 2 + 1) / 16
    });
});

describe('lot D · verrous structurels', () => {
    const sansCommentaires = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');

    it('(f) indices.js ne fabrique plus d\'assiduité à 1 ni de taux à 100 faute de séance, et n\'a qu\'UN lecteur de la date', () => {
        const code = sansCommentaires(readFileSync(path.join(RACINE, 'js/indices.js'), 'utf8'));
        expect(code).not.toMatch(/indice:\s*1\s*,/);
        expect(code).not.toMatch(/===\s*0\s*\?\s*100/);
        expect((code.match(/\.dateArrivee\b/g) || []).length).toBe(1);
    });

    it('(g) la fiche d\'un·e élève voyage ENTIÈRE : ni l\'export ni l\'import ne passent `groupeEtudiants` par une liste blanche de champs', () => {
        const code = sansCommentaires(readFileSync(path.join(RACINE, 'js/import-export.js'), 'utf8'));
        // #1012 (2 oct. 2026) : l'import n'écrit plus la liste du fichier telle quelle, il l'AJOUTE à celle de
        // l'espace (fusionnerDonneesPersoImportees) — fiches entières des deux côtés, sans liste de champs.
        // #1012, l'élève désinscrit (2 oct. 2026) : avant la fusion, un `filter` retire les élèves supprimés
        // (ecarterElevesDesinscrits) ; il garde les fiches entières.
        expect(code).toMatch(/cleEtu\.endsWith\('_groupeEtudiants'\)\)\s*\{\s*var etudiants = parseValeur\(donnees\[cleEtu\]\);\s*if \(Array\.isArray\(etudiants\)\) \{\s*etudiants = ecarterElevesDesinscrits\(etudiants, 'etudiants', \(await elevesEcartes\(cleEtu, 'groupeEtudiants'\)\)\.das, null, dasEcartesVus\);[\s\S]{0,400}?resEtu = fusionnerDonneesPersoImportees\(lus, etudiants, 'etudiants'\);/);   // #522 lot 7 : la fusion, dans la file de la clé
        expect(code).toMatch(/return \{ valeur: base\.concat\(nouvelles\), ecrire: nouvelles\.length > 0, entrees: nouvelles\.length \};/);
        expect(code).not.toMatch(/SCHEMAS_IMPORT\.etudiant/);
    });

    it('(h) le champ et sa bulle portent les mots de Grégoire (17 sept. 2026), au caractère près', () => {
        const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        expect(html).toMatch(/<label for="v2-etudiantDateArrivee">Date d'arrivée<\/label>\s*<input type="date" id="v2-etudiantDateArrivee"/);
        const bulles = readFileSync(path.join(RACINE, 'js/accompagnement-contenu-hover.js'), 'utf8');
        expect(bulles).toContain("'Facultatif : pour un·e étudiant·e arrivé·e en cours de trimestre. L\\'assiduité se compte à partir de cette date.'");
    });
});

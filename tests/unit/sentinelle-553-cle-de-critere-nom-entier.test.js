/**
 * SENTINELLE #553 — LA CLÉ D'UN CRITÈRE EST SON NOM NORMALISÉ, ENTIER. AUCUN RABOTAGE.
 *
 * LE DÉFAUT (audit « code en dur » du 21 sept. 2026, constat F3-1, banc à quatre cas). Le producteur des
 * moyennes par critère rabotait toute clé commençant par « francais » vers `francais`
 * (`profil-etudiant-calculs.js`). Sept lecteurs rabotaient de même ; un huitième,
 * `diagnostiquerForcesChallenges`, cherchait le nom entier (`francaisecrit`), ne trouvait rien et ÉCARTAIT le
 * critère. Mesuré : sur une grille « Structure 70 %, Rigueur 70 %, Français écrit 10 % », le défi principal rendu
 * était « Structure » et la cible d'intervention visait Structure. Et deux critères « Français… » (oral 10 %,
 * écrit 90 %) n'en faisaient qu'un : le dernier écrasait l'autre, le 10 % disparaissait.
 *
 * CE QUI EST TENU :
 *   1. Un critère de langue nommé autrement (« Qualité de la langue ») : inchangé — c'était déjà juste.
 *   2. Deux critères « Français… » gardent chacun leur valeur ; le plus faible est défi.
 *   3. « Français écrit » au plus bas est le défi principal, et la cible d'intervention le vise.
 *   4. STOCK (tarir n'est pas réparer) : une intervention enregistrée AVANT le correctif porte
 *      `snapshotAvant[da].criteres.francais`. Son bilan avant/après continue de la lire — si, et seulement si, UN
 *      SEUL critère de la grille commence par « francais ». À deux candidats, rien n'est apparié : pas de valeur
 *      inventée. Rien n'est jamais réécrit dans les données.
 *   5. VERROU STRUCTUREL : hors commentaires, aucun fichier du dossier js ne teste plus `startsWith('francais')`,
 *      et la clé littérale `francais` ne vit plus que dans la lecture tolérante du stock.
 *
 * ⚠ ÉCHELLE W/X/Y/Z, jamais A/B/C/D (le « D » est aussi celui d'IDME) — règle du pas 3c-1 de #542.
 *
 * Break-tests attendus (une clause à la fois) : un rabotage remis à un seul site ; la lecture tolérante retirée ;
 * la tolérance qui apparie malgré deux candidats ; la tolérance offerte à un critère qui n'est pas « francais… ».
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerPredicatsCopie } from './_helpers/predicats-copie.js';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';
import { tranche, position } from './_helpers/tranche.js';

const RACINE = path.resolve(process.cwd(), '..');

const ECHELLE = {
    id: 'ECH_553', nom: 'Échelle W/X/Y/Z',
    niveaux: [
        { code: 'W', nom: 'Amorce', valeurCalcul: 10 },
        { code: 'X', nom: 'Progression', valeurCalcul: 40 },
        { code: 'Y', nom: 'Consolidé', valeurCalcul: 70 },
        { code: 'Z', nom: 'Rayonnant', valeurCalcul: 90 }
    ]
};

const GRILLE_CHIMIE = { id: 'GR_CHIMIE', nom: 'Rapport de laboratoire', criteres: [
    { id: 'k1', nom: 'Protocole', ponderation: 20 }, { id: 'k2', nom: 'Mesures', ponderation: 20 },
    { id: 'k3', nom: 'Analyse des résultats', ponderation: 30 }, { id: 'k4', nom: 'Discussion', ponderation: 15 },
    { id: 'k5', nom: 'Qualité de la langue', ponderation: 15 }
] };
const GRILLE_DEUX_FRANCAIS = { id: 'GR_FLS', nom: 'Français langue seconde', criteres: [
    { id: 'f1', nom: 'Français oral', ponderation: 40 }, { id: 'f2', nom: 'Français écrit', ponderation: 40 },
    { id: 'f3', nom: 'Compréhension', ponderation: 20 }
] };
const GRILLE_LITTERATURE = { id: 'GR_LITT', nom: 'Analyse littéraire', criteres: [
    { id: 'g1', nom: 'Structure', ponderation: 40 }, { id: 'g2', nom: 'Rigueur', ponderation: 30 },
    { id: 'g3', nom: 'Français écrit', ponderation: 30 }
] };

const PRODUCTIONS = [
    { id: 'p1', type: 'artefact-portfolio' }, { id: 'p2', type: 'artefact-portfolio' }, { id: 'p3', type: 'artefact-portfolio' }
];
const DA = '1234567';

// `noteFinale` est FIXÉE (55) : la performance ne passe pas par les critères, le pattern ne bouge donc pas
// d'un cas à l'autre — montage de la sentinelle #552.
function evaluations(niveauxParCritere) {
    return PRODUCTIONS.map((p, i) => ({
        id: 'ev' + i, etudiantDA: DA, productionId: p.id, echelleId: ECHELLE.id,
        noteFinale: 55, niveauFinal: 'X', retroactionFinale: 'texte présent',
        dateEvaluation: '2026-0' + (i + 1) + '-15',
        criteres: Object.keys(niveauxParCritere).map((nom) => ({ critereNom: nom, niveauSelectionne: niveauxParCritere[nom] }))
    }));
}

let win;
let grilleCourante = GRILLE_CHIMIE;
let evaluationsCourantes = [];

beforeAll(() => {
    const stubs = {
        db: {
            get: async () => null,
            getSync: (k, defaut) => {
                if (k === 'test_echellesTemplates') return [ECHELLE];
                if (k === 'test_grillesTemplates') return [GRILLE_CHIMIE, GRILLE_DEUX_FRANCAIS, GRILLE_LITTERATURE];
                return defaut !== undefined ? defaut : null;
            },
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => {
            if (k === 'evaluationsSauvegardees') return evaluationsCourantes;
            if (k === 'productions') return PRODUCTIONS;
            return [];
        },
        obtenirPreference: (k) => (k === 'grilleReferenceDepistage' ? grilleCourante.id : null),
        definirPreference: () => {},
        obtenirTypePratiqueActive: () => 'standards',
        calculerTousLesIndices: () => ({ A: 90, C: 90, P: 55, M: 0, E: 0 }),
        obtenirSeuil: (chemin) => ({ 'defiSpecifique': 0.75, 'idme.insuffisant': 0.64, 'idme.developpement': 0.75 })[chemin],
        chargerSeuilsInterpretation: () => ({}),
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {}, afficherSection: () => {}, afficherSousSection: () => {},
        estEtudiantExclu: () => false, filtrerEtudiantsParMode: (arr) => arr, estModeeLectureSeule: () => false,
        genererSeancesCompletes: () => {}, calculerEtSauvegarderIndicesAssiduite: () => {}, calculerEtStockerIndicesCP: () => {}
    };
    win = chargerScript('js/profil-etudiant-helpers.js', stubs);
    chargerScript('js/contexte-qualification.js', stubs, win);
    // Les exports de helpers.js repassés en globaux : calculs.js les appelle par leur nom nu (voir #552).
    chargerScript('js/profil-etudiant-calculs.js', { ...stubs, ...win }, win);
    chargerPredicatsCopie(win);
    // Et l'inverse : `obtenirCriteresAvecValeurs` (helpers.js) appelle `calculerMoyennesCriteres` (calculs.js).
    chargerScript('js/profil-etudiant-helpers.js', { ...stubs, ...win }, win);
});

describe('#553 · le calcul : une clé par critère, son nom entier', () => {

    it('chimie · « Qualité de la langue » au plus bas : cinq clés, défi principal et cible sur ce critère (inchangé)', () => {
        grilleCourante = GRILLE_CHIMIE;
        evaluationsCourantes = evaluations({
            'Protocole': 'Z', 'Mesures': 'Y', 'Analyse des résultats': 'Y', 'Discussion': 'Y', 'Qualité de la langue': 'W'
        });
        const moyennes = win.calculerMoyennesCriteresRecents(DA);
        expect(Object.keys(moyennes).sort()).toEqual(
            ['analysedesresultats', 'discussion', 'mesures', 'protocole', 'qualitedelalangue']);
        expect(moyennes.qualitedelalangue).toBeCloseTo(0.10, 5);
        expect(win.diagnostiquerForcesChallenges(moyennes).principalDefi.nom).toBe('Qualité de la langue');
        expect(win.determinerCibleIntervention(DA).cible).toContain('Qualité de la langue');
    });

    it('deux critères « Français… » : oral 10 %, écrit 90 % — deux valeurs distinctes, et le 10 % est le défi principal', () => {
        grilleCourante = GRILLE_DEUX_FRANCAIS;
        evaluationsCourantes = evaluations({ 'Français oral': 'W', 'Français écrit': 'Z', 'Compréhension': 'Y' });
        const moyennes = win.calculerMoyennesCriteresRecents(DA);
        expect(moyennes.francaisoral).toBeCloseTo(0.10, 5);
        expect(moyennes.francaisecrit).toBeCloseTo(0.90, 5);
        expect(moyennes, 'la clé rabotée ne doit plus exister').not.toHaveProperty('francais');

        const diagnostic = win.diagnostiquerForcesChallenges(moyennes);
        expect(diagnostic.principalDefi.nom).toBe('Français oral');
        expect(diagnostic.forces.map(f => f.nom)).toContain('Français écrit');

        // Le profil : chaque ligne porte SA valeur (avant : 90 % sur les deux).
        const lignes = win.obtenirCriteresAvecValeurs(DA);
        const valeur = (nom) => lignes.find(l => l.nom === nom).valeur;
        expect(valeur('Français oral')).toBeCloseTo(0.10, 5);
        expect(valeur('Français écrit')).toBeCloseTo(0.90, 5);
    });

    it('les mêmes, inversés : l\'ordre des critères dans la grille ne décide plus de rien', () => {
        grilleCourante = GRILLE_DEUX_FRANCAIS;
        evaluationsCourantes = evaluations({ 'Français oral': 'Z', 'Français écrit': 'W', 'Compréhension': 'Y' });
        const moyennes = win.calculerMoyennesCriteresRecents(DA);
        expect(moyennes.francaisoral).toBeCloseTo(0.90, 5);
        expect(moyennes.francaisecrit).toBeCloseTo(0.10, 5);
        expect(win.diagnostiquerForcesChallenges(moyennes).principalDefi.nom).toBe('Français écrit');
    });

    it('LE CAS VÉCU · « Français écrit » à 10 %, Structure et Rigueur à 70 % : défi principal « Français écrit », et la cible le vise', () => {
        grilleCourante = GRILLE_LITTERATURE;
        evaluationsCourantes = evaluations({ 'Structure': 'Y', 'Rigueur': 'Y', 'Français écrit': 'W' });
        const moyennes = win.calculerMoyennesCriteresRecents(DA);
        expect(moyennes.francaisecrit).toBeCloseTo(0.10, 5);

        const diagnostic = win.diagnostiquerForcesChallenges(moyennes);
        expect(diagnostic.defis.map(d => d.nom), 'le critère de français ne doit plus être écarté').toContain('Français écrit');
        expect(diagnostic.principalDefi.nom).toBe('Français écrit');

        const cible = win.determinerCibleIntervention(DA);
        expect(cible.cible).toContain('Français écrit');
        expect(cible.cible).not.toContain('Structure');

        // `calculerMoyennesCriteres` (toutes les évaluations) suit la même règle que « récents ».
        expect(win.calculerMoyennesCriteres(DA)).toHaveProperty('francaisecrit');
    });
});

describe('#553 · le stock : une intervention d\'avant le correctif garde son bilan', () => {

    const GLOBAUX = (grille, moyennes) => ({
        determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }),
        calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
        calculerMoyennesCriteres: () => moyennes,
        obtenirGrilleReferenceDepistage: () => grille,
        libelleNiveauSOLO: () => '',
        obtenirSeuil: (n) => ({ 'idme.insuffisant': 0.64, 'idme.developpement': 0.75, 'idme.maitrise': 0.85, defiSpecifique: 0.70 }[n] || 0.7),
        calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t
    });

    // Une intervention COMPLÉTÉE, telle qu'elle est en base chez qui l'a enregistrée avant la 1.152.3 :
    // le critère ciblé s'appelle « Français écrit », la valeur d'avant est rangée sous `francais`.
    const interventionAncienne = (criteresCibles, criteresSnap) => ({
        id: 'I553', titre: 'Atelier', date: '2026-09-01', heure: '', duree: 2, type: 'groupe', niveauRai: 2,
        contexte: 'rattrapage', description: '', etudiants: ['2000001'], analyse: null, observations: '',
        notesIndividuelles: {}, criteresCibles, objectifVise: '', statut: 'completee',
        snapshotAvant: { 2000001: { P: 60, criteres: criteresSnap } },
        bilan: { atteint: 'oui', suite: 'aucune', observationsBilan: '', dateBilan: 1 }, jamaisSauvegardee: false
    });

    // La ligne du tableau de bilan d'un critère : [avant, après, évolution], texte sans balises.
    function ligneBilan(html, nomCritere) {
        if (!html.includes('>' + nomCritere + '</td>')) return null;
        return tranche(html, '>' + nomCritere + '</td>', '</tr>').split('</td>').slice(1, 4).map(c => c.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    }

    function rendreBilan(grille, moyennesActuelles, intervention) {
        const store = storeBase();
        store.test_interventions = [intervention];
        const avant = JSON.stringify(store.test_interventions);
        const conteneur = elementDom();
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX(grille, moyennesActuelles), elements: { conteneurPrincipal: conteneur } });
        b.win.ouvrirIntervention('I553', {});
        // ⛔ Rien n'est réécrit dans les données : ni migration, ni « réparation » à l'ouverture.
        expect(JSON.stringify(store.test_interventions), 'ouvrir une intervention ne doit pas réécrire son stock').toBe(avant);
        expect(b.journal.filter(j => j.k === 'test_interventions')).toHaveLength(0);
        return conteneur.innerHTML;
    }

    it('un seul critère « Français… » dans la grille : l\'ancienne clé `francais` est lue — avant 40 %, après 70 %, +30 pts', () => {
        const html = rendreBilan(GRILLE_LITTERATURE, { structure: 0.7, rigueur: 0.7, francaisecrit: 0.7 },
            interventionAncienne(['Français écrit'], { structure: 0.5, francais: 0.4 }));
        const ligne = ligneBilan(html, 'Français écrit');
        expect(ligne, 'la ligne du critère doit être rendue').not.toBeNull();
        expect(ligne[0]).toContain('40%');
        expect(ligne[1]).toContain('70%');
        expect(ligne[2]).toContain('+30 pts');
    });

    it('deux critères « Français… » : l\'ancienne clé n\'est appariée à AUCUN des deux — « — » à l\'avant, pas de valeur inventée', () => {
        const html = rendreBilan(GRILLE_DEUX_FRANCAIS, { francaisoral: 0.5, francaisecrit: 0.7, comprehension: 0.7 },
            interventionAncienne(['Français oral', 'Français écrit'], { francais: 0.4, comprehension: 0.6 }));
        for (const nom of ['Français oral', 'Français écrit']) {
            const ligne = ligneBilan(html, nom);
            expect(ligne, nom).not.toBeNull();
            expect(ligne[0], nom + ' : aucune valeur d\'avant').not.toMatch(/\d+%/);
            expect(ligne[2], nom + ' : aucune évolution calculée').toBe('—');
        }
    });

    it('une intervention enregistrée APRÈS le correctif (clé entière) est lue par sa clé exacte', () => {
        const html = rendreBilan(GRILLE_DEUX_FRANCAIS, { francaisoral: 0.5, francaisecrit: 0.7, comprehension: 0.7 },
            interventionAncienne(['Français oral'], { francaisoral: 0.2, francaisecrit: 0.9 }));
        const ligne = ligneBilan(html, 'Français oral');
        expect(ligne[0]).toContain('20%');
        expect(ligne[2]).toContain('+30 pts');
    });

    it('la fonction pure, clause par clause', () => {
        const b = monter(storeBase(), { modules: ['js/interventions.js'], globaux: GLOBAUX(null, null) });
        const lire = b.win.lireCritereSnapshotIntervention;
        const UNE = ['structure', 'rigueur', 'francaisecrit'];
        const DEUX = ['francaisoral', 'francaisecrit', 'comprehension'];

        expect(lire({ francaisecrit: 0.9, francais: 0.4 }, 'francaisecrit', UNE), 'la clé exacte passe d\'abord').toBe(0.9);
        expect(lire({ francais: 0.4 }, 'francaisecrit', UNE), 'un seul candidat : tolérance').toBe(0.4);
        expect(lire({ francais: 0.4 }, 'francaisecrit', DEUX), 'deux candidats : rien').toBeNull();
        expect(lire({ francais: 0.4 }, 'structure', UNE), 'la tolérance ne vaut que pour un critère « francais… »').toBeNull();
        expect(lire({ francais: 0.4 }, 'francaisoral', UNE), 'le seul candidat de la grille n\'est pas le critère demandé').toBeNull();
        expect(lire({ francais: 0.4 }, 'francaisecrit', []), 'grille introuvable : rien').toBeNull();
        expect(lire({ francais: 0 }, 'francaisecrit', UNE), 'un zéro enregistré est une valeur').toBe(0);
        expect(lire(null, 'francaisecrit', UNE)).toBeNull();
    });
});

describe('#553 · verrou structurel : le rabotage ne revient nulle part', () => {

    // Hors commentaires de bloc et de ligne entière.
    function codeSeul(chemin) {
        return fs.readFileSync(chemin, 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
    }
    function fichiersJs(dossier) {
        return fs.readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
            const p = path.join(dossier, e.name);
            if (e.isDirectory()) return fichiersJs(p);
            return e.name.endsWith('.js') ? [p] : [];
        });
    }
    const TOUS = fichiersJs(path.join(RACINE, 'js'));

    it('garde anti-silence : le balayage voit bien les fichiers du lot', () => {
        const noms = TOUS.map(f => path.relative(RACINE, f));
        for (const f of ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-sections-affichage.js',
            'js/interventions.js', 'js/pratiques/pratique-pan-standards.js']) expect(noms).toContain(f);
        expect(TOUS.length).toBeGreaterThan(100);
    });

    it('aucun `startsWith(\'francais\')`, aucune constante de « critère de langue » dans le code', () => {
        for (const f of TOUS) {
            const code = codeSeul(f);
            const rel = path.relative(RACINE, f);
            expect(code, rel + ' rabote de nouveau une clé de critère').not.toMatch(/startsWith\(\s*['"]francais/);
            expect(code, rel).not.toContain('NOM_CRITERE_LANGUE');
            expect(code, rel).not.toContain('francaisMoyen');
        }
    });

    it('la clé littérale `francais` ne vit plus que dans la lecture tolérante du stock', () => {
        const LITTERAL = /['"]francais['"]|\.francais\b/;
        const porteurs = TOUS.filter(f => LITTERAL.test(codeSeul(f))).map(f => path.relative(RACINE, f)).sort();
        // `synthese-retroaction-rendu.js` lit `recurrents.francais`, un champ de la synthèse sans rapport avec
        // une clé de critère ; les fichiers de démonstration portent des données, pas des règles.
        const attendus = porteurs.filter(f => !/^js\/(pack-demo|demo-)/.test(f) && f !== 'js/synthese-retroaction-rendu.js'
            && f !== 'js/evaluation-enonces.js');
        expect(attendus).toEqual(['js/interventions.js']);

        const source = codeSeul(path.join(RACINE, 'js/interventions.js'));
        const tolerante = tranche(source, 'function lireCritereSnapshotIntervention(', '\nfunction ');
        expect(tolerante).toMatch(LITTERAL);
        const debut = position(source, tolerante);
        const hors = source.substring(0, debut) + source.substring(debut + tolerante.length);
        expect(hors, 'interventions.js nomme `francais` hors de la lecture tolérante').not.toMatch(LITTERAL);
    });
});

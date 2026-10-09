import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// HARNAIS DE PARITÉ — portage des exports vers la Carte (#424, Lot C)
// =======================================================================
//
// C'est CE harnais qui autorise le Lot G (suppression de la page « Plan de
// la leçon ») : toute information émise par les ANCIENS générateurs
// (genererPlanTexte, genererPlanTSV, genererExportMD) doit apparaître dans
// le niveau approprié du NOUVEAU générateur unique. Pas un diff
// byte-à-byte — le vocabulaire change exprès (« SÉANCE » → « LEÇON ») —
// une couverture de CONTENU, mesurée par tokens.
//
// Il verrouille aussi les trois correctifs que le générateur unique porte
// (audit du 8 août) :
//   §1.4 — plus jamais « SÉANCE » pour une leçon ;
//   §1.5 — les durées passent par le rollup, FIN du double comptage ;
//   §1.6 — les objectifs sortent au PLURIEL, avec les liens « sert ».
// Et la contrainte D2 : la rétroaction se lit sur les DEUX porteurs,
// priorité au nœud.
//
// ⚠ Lot G PASSÉ : la parité par tokens contre les anciens générateurs a été
// verte avant leur suppression, puis retirée avec eux. Restent les contrats
// de niveau et les correctifs — ils ne dépendent que du nouveau moteur.

let win;
let api;      // window.planificationCarte
let exporteur; // window.planificationExport
let store;

function fauxElement() {
    return {
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    };
}

function monterTout() {
    store = {
        // Productions du trimestre actif (a2026) — échéance résolue en repli
        // direct (obtenirEcheanceEffective absent du sandbox).
        'a2026_productions': [
            { id: 'prod-dissert', titre: 'Dissertation critique', type: 'travail', ponderation: 25, grilleId: 'grille-1', echelleId: 'ech-1', dateEcheance: '2026-10-15' },
            { id: 'prod-quiz', titre: 'Quiz de lecture', type: 'quiz', ponderation: 10, grilleId: null, dateEcheance: null }
        ],
        // #969 — l'échelle vit sur la PRODUCTION ; l'éditeur de grille n'écrit
        // plus `grille.echelleId` depuis #574/#578.
        'a2026_grillesTemplates': [{ id: 'grille-1', nom: 'Grille SRPNF' }],
        'a2026_echellesTemplates': [{ id: 'ech-1', nom: 'Échelle IDME' }],
        // LE PORTEUR HISTORIQUE : rétroactions/productions posées par
        // l'Organisateur sur des ACTIVITÉS (clé composite #367).
        'a2026_planification_seances': {
            'carte_1::lecon-1': {
                note: 'Prévoir la plénière',
                activites: { 'act-1': { retroaction: 'orale', productionId: null } }
            },
            'carte_1::lecon-2': {
                activites: { 'act-2': { retroaction: 'orale', productionId: 'prod-quiz' } }
            }
        }
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const globaux = {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: () => null,
            querySelectorAll: () => [],
            querySelector: () => null,
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        },
        navigator: {},
        notifications: { succes() {}, erreur() {}, info() {} }
    };
    win = chargerScript('js/planification-carte.js', globaux);
    win.cle = globaux.cle;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Français 601-101' }] }),
        sauvegarderCarte: () => {},
        chargerCarte: () => null
    };
    chargerScript('js/planification-export.js', globaux, win);
    api = win.planificationCarte;
    exporteur = win.planificationExport;
    poserFixture();
}

function noeud(id, type, titre, extras) {
    const n = Object.assign(
        { id, type, titre, x: 0, y: 0, parent: null, enfants: [], metadata: {}, cloneSourceId: null },
        extras || {}
    );
    api.etat.noeuds.set(id, n);
    return n;
}

function lien(id, source, cible, type) {
    api.etat.liens.set(id, { id, source, cible, type });
}

/**
 * LA CARTE DE TEST. Elle contient un exemplaire de tout ce que les anciens
 * générateurs savaient émettre : séquence + sous-séquence, leçons avec
 * semaine, objectifs pluriels, objectif dérivé d'une idée maîtresse,
 * activités avec durées, évaluation avec production/grille, rétroactions
 * sur les DEUX porteurs, liens verbalisés, connaissance, leçon orpheline.
 */
function poserFixture() {
    api.etat.noeuds.clear();
    api.etat.liens.clear();

    const seq1 = noeud('seq-1', 'sequence', 'Le récit réaliste');
    const l1 = noeud('lecon-1', 'lecon', 'L’incipit', {
        parent: 'seq-1',
        metadata: {
            semaine: 3,
            duree: 60, // ⚠ durée LEGACY d'avant le 4 août — l'ancien Texte la compte EN PLUS
            objectifs: [
                { id: 'obj-1', texte: 'Analyser un incipit réaliste' },
                { id: 'obj-2', texte: 'Rédiger un plan de dissertation' }
            ]
        }
    });
    noeud('exp-1', 'expose', 'Exposé magistral sur le réalisme', {
        parent: 'lecon-1', metadata: { duree: 50 }
    });
    noeud('act-1', 'activite', 'Atelier d’analyse en équipe', {
        parent: 'lecon-1', metadata: { duree: 45, objectifsServis: ['obj-1'] }
    });
    noeud('conn-1', 'conceptuelle', 'Le narrateur omniscient', { parent: 'lecon-1' });
    noeud('eval-1', 'evaluation', 'Évaluation de l’incipit', {
        parent: 'lecon-1',
        metadata: { duree: 30, productionId: 'prod-dissert', retroaction: 'ecrite' }
    });
    l1.enfants = ['exp-1', 'act-1', 'conn-1', 'eval-1'];

    const l2 = noeud('lecon-2', 'lecon', 'La description', {
        parent: 'seq-1', metadata: { semaine: 4 }
    });
    // Priorité au NŒUD : la metadata dit « ecrite », le porteur historique
    // dit « orale » — le nouveau générateur doit émettre Écrite.
    noeud('act-2', 'activite', 'Pastiche descriptif', {
        parent: 'lecon-2', metadata: { duree: 30, retroaction: 'ecrite' }
    });
    l2.enfants = ['act-2'];

    const sseq = noeud('seq-2', 'sequence', 'Sous-parcours poésie', { parent: 'seq-1' });
    const l3 = noeud('lecon-3', 'lecon', 'Leçon nichée', {
        parent: 'seq-2', metadata: { semaine: 5 }
    });
    sseq.enfants = ['lecon-3'];
    seq1.enfants = ['lecon-1', 'lecon-2', 'seq-2'];

    noeud('im-1', 'idee-maitresse', 'maîtriser la description réaliste');
    noeud('lecon-orph', 'lecon', 'Récupération libre');

    lien('lien-1', 'im-1', 'lecon-2', 'se_concretise_dans');
    lien('lien-2', 'conn-1', 'act-1', 's_acquiert_par');
    lien('lien-3', 'conn-1', 'eval-1', 'se_verifie_par');
}

beforeAll(() => { monterTout(); });

// -----------------------------------------------------------------------
// 1. (RETIRÉ AU LOT G, comme annoncé) — la parité par tokens contre les
//    anciens générateurs a été VERTE avant leur suppression : c'est elle qui
//    a autorisé le Lot G. Les anciens sont partis, le describe avec eux.
// -----------------------------------------------------------------------

// -----------------------------------------------------------------------
// 2. LES CONTRATS DE NIVEAU (D4) — survivent au Lot G
// -----------------------------------------------------------------------

describe('Niveaux #424 · le sommaire est un plan de cours, pas un déroulement', () => {
    it('montre séquences, semaines, leçons et évaluations avec pondération', () => {
        for (const format of ['texte', 'tsv', 'markdown']) {
            const doc = exporteur.genererExport('sommaire', format);
            expect(doc, format).toContain('Le récit réaliste');
            expect(doc, format).toContain('L’incipit');
            expect(doc, format).toContain('Dissertation critique');
            expect(doc, format).toContain('25');
            expect(doc, format).toContain('2026-10-15');
        }
    });

    it('NE montre ni durées, ni activités, ni liens, ni connaissances', () => {
        for (const format of ['texte', 'tsv', 'markdown']) {
            const doc = exporteur.genererExport('sommaire', format);
            expect(doc, format).not.toContain('Atelier d’analyse');
            expect(doc, format).not.toContain('Exposé magistral');
            expect(doc, format).not.toContain('narrateur omniscient');
            expect(doc, format).not.toMatch(/50 min|1h05|\t50\t/);
            expect(doc, format).not.toContain("s'acquiert par");
        }
    });
});

describe('Niveaux #424 · le déroulement est le document de classe', () => {
    it('ajoute objectifs, activités avec durées, Σ et rétroactions', () => {
        for (const format of ['texte', 'tsv', 'markdown']) {
            const doc = exporteur.genererExport('deroulement', format);
            expect(doc, format).toContain('Analyser un incipit réaliste');
            expect(doc, format).toContain('Rédiger un plan de dissertation');
            expect(doc, format).toContain('Atelier d’analyse en équipe');
            expect(doc, format).toContain('Orale');   // formative, porteur historique
            expect(doc, format).toContain('Écrite');  // rendu + priorité nœud
        }
        // Σ leçon = rollup (50+45+30 = 125 min = 2h05), la durée legacy 60 EXCLUE
        const texte = exporteur.genererExport('deroulement', 'texte');
        expect(texte).toContain('2h05');
    });

    it('NE montre pas encore connaissances ni liens verbalisés', () => {
        for (const format of ['texte', 'tsv', 'markdown']) {
            const doc = exporteur.genererExport('deroulement', format);
            expect(doc, format).not.toContain('narrateur omniscient');
            expect(doc, format).not.toContain("s'acquiert par");
        }
    });
});

describe('Niveaux #424 · l’alignement est la preuve', () => {
    it('ajoute connaissances, liens verbalisés, objectifs servis et le détail des productions', () => {
        for (const format of ['texte', 'tsv', 'markdown']) {
            const doc = exporteur.genererExport('alignement', format);
            expect(doc, format).toContain('Le narrateur omniscient');
            expect(doc, format).toContain("s'acquiert par");
            expect(doc, format).toContain('se vérifie par');
            expect(doc, format).toContain('Analyser un incipit réaliste'); // servi par act-1
            expect(doc, format).toContain('Grille SRPNF');
            expect(doc, format).toContain('Échelle IDME');
        }
    });
});

// -----------------------------------------------------------------------
// 3. LES CORRECTIFS QUE LE GÉNÉRATEUR PORTE (audit §1.4, §1.5, §1.6, D2)
// -----------------------------------------------------------------------

describe('Correctifs #424 · ce que le portage règle une fois pour toutes', () => {
    it('§1.4 — « SÉANCE » a disparu des neuf sorties, « LEÇON » le remplace', () => {
        for (const niveau of ['sommaire', 'deroulement', 'alignement']) {
            for (const format of ['texte', 'tsv', 'markdown']) {
                const doc = exporteur.genererExport(niveau, format);
                expect(doc, `${niveau}/${format}`).not.toMatch(/séance/i);
            }
        }
        expect(exporteur.genererExport('deroulement', 'texte')).toContain('LEÇON');
    });

    it('§1.5 — la durée de séquence est le ROLLUP : la durée legacy de la leçon ne compte pas double', () => {
        // Rollup réel : 50+45+30 (lecon-1) + 30 (lecon-2) = 155 min = 2h35.
        // L'ancien Texte aurait ajouté la durée legacy de la leçon (60) et
        // affiché 3h35 — c'est le bug du double comptage.
        const doc = exporteur.genererExport('deroulement', 'texte');
        expect(doc).toContain('Durée totale : 2h35');
        expect(doc).not.toContain('3h35');
    });

    it('§1.6 — TOUS les objectifs sortent, et l’objectif dérivé survit en repli', () => {
        const doc = exporteur.genererExport('deroulement', 'texte');
        expect(doc).toContain('Analyser un incipit réaliste');
        expect(doc).toContain('Rédiger un plan de dissertation');
        // lecon-2 n'a pas d'objectif saisi : dérivé de l'idée maîtresse liée
        expect(doc).toContain('sera capable de maîtriser la description réaliste');
    });

    it('D2 — la rétroaction se lit sur les deux porteurs, priorité au nœud', () => {
        const doc = exporteur.genererExport('deroulement', 'texte');
        // act-1 : seulement le porteur historique (orale)
        expect(doc).toMatch(/Atelier d’analyse en équipe[\s\S]{0,200}Rétroaction : Orale/);
        // act-2 : nœud (ecrite) PRIORITAIRE sur le porteur historique (orale)
        expect(doc).toMatch(/Pastiche descriptif[\s\S]{0,200}Rétroaction : Écrite/);
        expect(doc).not.toMatch(/Pastiche descriptif[\s\S]{0,200}Rétroaction : Orale/);
    });

    it('la production rattachée à une ACTIVITÉ par l’Organisateur sort encore (porteur historique)', () => {
        const doc = exporteur.genererExport('deroulement', 'texte');
        expect(doc).toMatch(/Pastiche descriptif[\s\S]{0,200}Quiz de lecture \(10 %\)/);
    });

    it('les neuf sorties existent, non vides, et les niveaux diffèrent', () => {
        const docs = [];
        for (const niveau of ['sommaire', 'deroulement', 'alignement']) {
            for (const format of ['texte', 'tsv', 'markdown']) {
                const doc = exporteur.genererExport(niveau, format);
                expect(doc, `${niveau}/${format}`).toBeTruthy();
                expect(doc.length, `${niveau}/${format}`).toBeGreaterThan(50);
                docs.push(doc);
            }
        }
        expect(new Set(docs).size).toBe(9);
    });

    it('la leçon orpheline sort dans les trois formats', () => {
        for (const format of ['texte', 'tsv', 'markdown']) {
            const doc = exporteur.genererExport('alignement', format);
            expect(doc, format).toContain('Récupération libre');
        }
    });

    it('la sous-séquence est titrée par son CHEMIN, avec sa leçon', () => {
        const doc = exporteur.genererExport('sommaire', 'texte');
        expect(doc).toContain('Le récit réaliste › Sous-parcours poésie');
        expect(doc).toContain('Leçon nichée');
    });

    it('#152 — le TSV n’a qu’UNE colonne de semaine, dans les trois niveaux', () => {
        // Capture Numbers de Grégoire (8 août) : « Semaines » (étendue de la
        // séquence) + « Semaine » (leçon) = redondant et illisible en tableau.
        for (const niveau of ['sommaire', 'deroulement', 'alignement']) {
            const entete = exporteur.genererExport(niveau, 'tsv').split('\n')[0].split('\t');
            expect(entete.filter(c => /^Semaine/.test(c)), niveau).toEqual(['Semaine']);
        }
        // Et la colonne porte les DEUX informations : le numéro sur la ligne
        // de leçon, l'étendue sur une ligne de séquence sans contenu direct.
        const lignes = exporteur.genererExport('sommaire', 'tsv').split('\n');
        const entetes = lignes[0].split('\t');
        const iSem = entetes.indexOf('Semaine');
        const ligneL1 = lignes.find(l => l.includes('L’incipit'));
        expect(ligneL1.split('\t')[iSem]).toBe('3');
    });
});

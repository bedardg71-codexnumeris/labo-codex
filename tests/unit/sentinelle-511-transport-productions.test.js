import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelle #511 (25 août 2026) — CE QUI EST ÉCRIT DOIT POUVOIR VOYAGER.
//
// `SCHEMAS_IMPORT` est une LISTE BLANCHE : une clé qui n'y figure pas n'est pas
// signalée, elle disparaît. Deux chemins vivants l'appliquent —
// `ajouterALaBibliotheque` (partager une production) et l'import sélectif
// d'archives (la restaurer) — et tous deux rendaient une production VIDE de son
// contenu pédagogique : ni objectif, ni tâche, ni détail, ni pondération, ni
// blocs nommés. Partager sa production, c'était partager une coquille.
//
// Le trou est antérieur aux blocs de consignes ; le chantier #499/#500 ne l'a
// pas comblé pour les siens — couture manquée entre « écrire une clé neuve » et
// « la transporter ».
//
// Ce que ce banc tient :
//   AA — la COUTURE, en ratchet : toute clé écrite par `construireProductionData`
//        est transportée, ou inscrite dans les exclusions AVEC sa raison.
//   AB — le contenu survit vraiment au passage (comportemental).
//   AC — les rétroactions des sous-critères d'une grille aussi.
//   AD — et l'assainissement continue de mordre sur ces nouveaux champs.

let win;
beforeEach(() => { win = chargerScript('js/import-export.js'); });

/* --------------------------------------------------- AA — la couture, en ratchet */

/**
 * Les clés que `construireProductionData` POSE sur l'objet enregistré :
 * celles de l'objet littéral, plus les `productionData.X = ...` conditionnels
 * (échéances par groupe, champs d'état, portfolio).
 */
function clesEcritesParLeGabarit() {
    const source = readFileSync(path.join(racineProjet, 'js', 'productions.js'), 'utf8');
    const debut = source.indexOf('function construireProductionData(');
    expect(debut, 'construireProductionData introuvable — le banc a perdu sa cible').toBeGreaterThan(-1);
    const corps = source.slice(debut, source.indexOf('\nasync function ', debut));

    const litteral = corps.slice(corps.indexOf('const productionData = {'), corps.indexOf('\n    };'));
    const cles = new Set();
    // `titre: d.titre` comme `pratiquesCompatibles,` (raccourci d'objet).
    litteral.split('\n').forEach(ligne => {
        const m = ligne.match(/^\s{8}([A-Za-z_$][\w$]*)\s*(:|,\s*(\/\/.*)?$)/);
        if (m) cles.add(m[1]);
    });
    let m;
    const affectation = /productionData\.([A-Za-z_$][\w$]*)\s*=/g;
    while ((m = affectation.exec(corps)) !== null) cles.add(m[1]);
    return cles;
}

describe('#511 · AA — toute clé écrite est transportée, ou exclue sciemment', () => {
    it('AA.a le banc voit bien les clés du gabarit (garde de validité)', () => {
        const cles = clesEcritesParLeGabarit();
        // Sans cette garde, une regex devenue muette rendrait un ensemble vide
        // et le ratchet passerait vacuously — le motif exact que l'audit a
        // trouvé sur la sentinelle #506.
        expect(cles.size).toBeGreaterThan(15);
        ['objectif', 'detailTache', 'champsPersonnalises', 'echeancesParGroupe', 'coursId']
            .forEach(c => expect(cles, `« ${c} » doit être vue par le banc`).toContain(c));
    });

    it('AA.b LE CAS QUI PORTE LE SENS : aucune clé ne se perd en silence', () => {
        const cles = clesEcritesParLeGabarit();
        const transportees = Object.keys(win.SCHEMAS_IMPORT.production);
        const exclues = Object.keys(win.CLES_PRODUCTION_NON_TRANSPORTEES);

        const orphelines = [...cles].filter(c => !transportees.includes(c) && !exclues.includes(c));
        expect(orphelines,
            'clés écrites par construireProductionData mais ni transportées ni exclues : '
            + 'les ajouter à SCHEMAS_IMPORT.production, ou à CLES_PRODUCTION_NON_TRANSPORTEES avec leur raison'
        ).toEqual([]);
    });

    it('AA.c une exclusion sans raison écrite n\'en est pas une', () => {
        Object.entries(win.CLES_PRODUCTION_NON_TRANSPORTEES).forEach(([cle, raison]) => {
            expect(typeof raison, `« ${cle} » doit porter sa raison`).toBe('string');
            expect(raison.length, `la raison de « ${cle} » est trop courte pour en être une`).toBeGreaterThan(20);
        });
    });
});

/* ------------------------------------------- AB — le contenu survit au transport */

const PRODUCTION_COMPLETE = {
    id: 'PROD_1',
    titre: 'Analyse littéraire',
    activiteApprentissage: 'Analyse littéraire',
    type: 'evaluation',
    ponderation: 30,
    objectif: 'Reconnaître le propos du texte',
    tache: 'Rédiger un texte de 500 mots',
    detailTache: 'Format APA, 4 à 6 pages, sources primaires obligatoires.',
    champsPersonnalises: [
        { id: 'C1', titre: 'Remise du travail', contenu: 'Sur Léa uniquement' }
    ],
    titresBlocs: { objectif: 'Ce qu\'on vise' },
    ordreBlocs: ['detailTache', 'objectif', 'tache', 'C1'],
    grilleId: 'G1',
    echelleId: 'E1',
    cartoucheId: 'CA1',
    pratiquesCompatibles: ['STD', 'SPE'],
    categorie: 'ecriture',
    modeCalcul: 'provisoire',
    verrouille: false,
    echeancesParGroupe: { gc_1: { assignee: true, date: '2026-09-15' } }
};

describe('#511 · AB — partager une production ne la vide plus de ses consignes', () => {
    it('AB.a les trois blocs ancrés et la pondération passent', () => {
        const apres = win.assainirObjet(PRODUCTION_COMPLETE, win.SCHEMAS_IMPORT.production);
        expect(apres.objectif).toBe('Reconnaître le propos du texte');
        expect(apres.tache).toBe('Rédiger un texte de 500 mots');
        expect(apres.detailTache).toBe('Format APA, 4 à 6 pages, sources primaires obligatoires.');
        expect(apres.ponderation).toBe(30);
    });

    it('AB.b les blocs nommés par l\'enseignant·e passent, contenu compris', () => {
        const apres = win.assainirObjet(PRODUCTION_COMPLETE, win.SCHEMAS_IMPORT.production);
        expect(apres.champsPersonnalises).toEqual([
            { id: 'C1', titre: 'Remise du travail', contenu: 'Sur Léa uniquement' }
        ]);
        expect(apres.titresBlocs).toEqual({ objectif: 'Ce qu\'on vise' });
        expect(apres.ordreBlocs).toEqual(['detailTache', 'objectif', 'tache', 'C1']);
    });

    it('AB.c la cartouche, les pratiques et les dates par groupe suivent', () => {
        const apres = win.assainirObjet(PRODUCTION_COMPLETE, win.SCHEMAS_IMPORT.production);
        expect(apres.cartoucheId).toBe('CA1');
        expect(apres.pratiquesCompatibles).toEqual(['STD', 'SPE']);
        expect(apres.echeancesParGroupe).toEqual({ gc_1: { assignee: true, date: '2026-09-15' } });
    });

    it('AB.d un détail de tâche LONG n\'est pas tronqué au milieu d\'une phrase', () => {
        // Le cas d'usage réel : des consignes numérotées. À 500 caractères —
        // le défaut du schéma — on coupait sans le dire.
        const long = 'Étape 1 : lire le texte. '.repeat(300);   // ~7 500 caractères
        const apres = win.assainirObjet({ ...PRODUCTION_COMPLETE, detailTache: long },
                                        win.SCHEMAS_IMPORT.production);
        expect(apres.detailTache.length).toBe(long.length);
    });

    it('AB.e le rattachement local au cours reste exclu, lui', () => {
        const apres = win.assainirObjet({ ...PRODUCTION_COMPLETE, coursId: 'COURS_601-101' },
                                        win.SCHEMAS_IMPORT.production);
        expect(apres.coursId).toBeUndefined();
    });
});

/* -------------------------------------- AC — les rétroactions de grille survivent */

describe('#511 · AC — une grille transportée garde ses rétroactions', () => {
    const GRILLE = {
        id: 'G1', nom: 'Grille de français',
        criteres: [{
            id: 'CR_1', nom: 'Qualité du français', ponderation: 10, type: 'algorithmique',
            facteurNormalisation: 500,
            sousCriteres: [
                { id: 'sc_1', code: '1', nom: 'Syntaxe', ponderation: 1,
                  retroaction: 'La plupart des erreurs concernent la construction syntaxique.' }
            ],
            categoriesErreurs: [{ code: '1', retroaction: 'Ancienne structure conservée.' }],
            _categoriesmigrees: true
        }]
    };

    it('AC.a les sous-critères et leurs textes passent', () => {
        const apres = win.assainirObjet(GRILLE, win.SCHEMAS_IMPORT.grille);
        expect(apres.criteres[0].sousCriteres).toHaveLength(1);
        expect(apres.criteres[0].sousCriteres[0].retroaction)
            .toBe('La plupart des erreurs concernent la construction syntaxique.');
        expect(apres.criteres[0].facteurNormalisation).toBe(500);
    });

    it('AC.b l\'ancienne structure passe aussi : c\'est elle que la migration lit', () => {
        const apres = win.assainirObjet(GRILLE, win.SCHEMAS_IMPORT.grille);
        expect(apres.criteres[0].categoriesErreurs).toEqual([
            { code: '1', retroaction: 'Ancienne structure conservée.' }
        ]);
        expect(apres.criteres[0]._categoriesmigrees).toBe(true);
    });
});

/* ------------------------------------- AD — l'assainissement mord toujours */

describe('#511 · AD — transporter plus ne veut pas dire assainir moins', () => {
    it('AD.a une balise dans un bloc personnalisé est retirée', () => {
        const apres = win.assainirObjet({
            ...PRODUCTION_COMPLETE,
            champsPersonnalises: [{ id: 'C1', titre: '<img src=x onerror=alert(1)>', contenu: 'ok' }]
        }, win.SCHEMAS_IMPORT.production);
        expect(apres.champsPersonnalises[0].titre).not.toContain('<');
    });

    it('AD.b les identifiants de blocs sont assainis un à un, pas copiés en bloc', () => {
        // `array` sans sous-schéma copie le tableau TEL QUEL : ces valeurs-là
        // repartent dans des attributs HTML (`data-param`, `data-champ-id`).
        const apres = win.assainirObjet({
            ...PRODUCTION_COMPLETE,
            ordreBlocs: ['objectif', '<script>alert(1)</script>', 42]
        }, win.SCHEMAS_IMPORT.production);
        expect(apres.ordreBlocs.join('|')).not.toContain('<');
        expect(apres.ordreBlocs, 'ce qui n\'est pas une chaîne est écarté').toEqual(['objectif', 'alert(1)']);
    });

    it('AD.c une clé de groupe hostile est assainie, et sa valeur reste un objet cadré', () => {
        const apres = win.assainirObjet({
            ...PRODUCTION_COMPLETE,
            echeancesParGroupe: {
                '<b>gc</b>': { assignee: true, date: '2026-09-15', mouchard: 'à écarter' }
            }
        }, win.SCHEMAS_IMPORT.production);
        const cles = Object.keys(apres.echeancesParGroupe);
        expect(cles).toEqual(['gc']);
        expect(apres.echeancesParGroupe.gc).toEqual({ assignee: true, date: '2026-09-15' });
    });
});

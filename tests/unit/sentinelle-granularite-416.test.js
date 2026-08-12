import { describe, it, expect, beforeAll } from 'vitest';
import { monterExportSandbox } from './_helpers/carte-essai-exports.js';

// LE GÉNÉRATEUR À TROIS AXES (#416 lot G) — granularité × colonnes × format.
//
// Le troisième axe est la GRANULARITÉ. « Une ligne par nœud » produit un
// déroulement : la leçon, puis chacun de ses éléments. « Une ligne par
// séance » produit un calendrier : la leçon EST la ligne, et ses éléments
// sont agrégés dans les cellules.
//
// ⚠ Ce n'est pas une autre PROFONDEUR, c'est une autre FORME de document.
// C'est la raison pour laquelle « Calendrier » n'est pas un quatrième niveau
// (D4 : au-delà de trois, le choix devient lui-même une friction) mais un
// gabarit — décision renversée le 12 août.
//
// Sentinelle COMPORTEMENTALE : elle exerce le vrai générateur sur la vraie
// carte d'essai et lit les lignes produites.

let exporteur;

beforeAll(() => { exporteur = monterExportSandbox().exporteur; });

// ⚠ PAS de `.trim()` ici. Il mange la TABULATION finale de la dernière ligne,
// dont la dernière cellule devient alors `undefined` au lieu de `''` — deux
// cas de cette sentinelle ont échoué là-dessus alors que le générateur était
// juste. On ne retire que le saut de ligne terminal, rien d'autre.
function lignes(tsv) {
    return tsv.replace(/\n$/, '').split('\n').map(function(l) { return l.split('\t'); });
}

const CALENDRIER = {
    colonnes: ['semaine', 'rangSeance', 'date', 'contenu', 'evaluations'],
    granularite: 'seances'
};

describe('Granularité « une ligne par séance » (#416 lot G)', () => {
    it('une leçon = UNE ligne, quel que soit le nombre de ses éléments', () => {
        // « L’incipit » porte quatre enfants : exposé, activité, connaissance,
        // évaluation. En granularité nœuds elle produit cinq lignes.
        const parSeance = lignes(exporteur.genererTableau(CALENDRIER, { groupeCoursId: 'GC_MATIN' }));
        const incipit = parSeance.filter(function(l) { return l.join(' ').includes('Exposé magistral'); });

        expect(incipit).toHaveLength(1);
    });

    it('la même carte en granularité NŒUDS produit strictement plus de lignes', () => {
        const parSeance = lignes(exporteur.genererTableau(CALENDRIER, { groupeCoursId: 'GC_MATIN' }));
        const parNoeuds = lignes(exporteur.genererTableau({
            colonnes: CALENDRIER.colonnes, granularite: 'noeuds'
        }, { groupeCoursId: 'GC_MATIN' }));

        expect(parNoeuds.length).toBeGreaterThan(parSeance.length);
    });

    it('les activités sont AGRÉGÉES dans une cellule, séparées par « · »', () => {
        const table = lignes(exporteur.genererTableau(CALENDRIER, { groupeCoursId: 'GC_MATIN' }));
        const iContenu = table[0].indexOf('Contenu');
        const ligneIncipit = table.find(function(l) { return l[iContenu].includes('Exposé magistral'); });

        expect(ligneIncipit[iContenu]).toBe('Exposé magistral sur le réalisme · Atelier d’analyse en équipe');
    });

    it('une évaluation sort par le NOM DE SA PRODUCTION quand elle en a une', () => {
        const table = lignes(exporteur.genererTableau(CALENDRIER, { groupeCoursId: 'GC_MATIN' }));
        const iEval = table[0].indexOf('Évaluations');

        expect(table.some(function(l) { return l[iEval] === 'Dissertation critique'; })).toBe(true);
    });

    it('les connaissances ne sont NI du contenu NI une évaluation', () => {
        // « Le narrateur omniscient » est une connaissance : elle a sa place
        // dans une preuve d'alignement, pas dans un calendrier de classe.
        const tsv = exporteur.genererTableau(CALENDRIER, { groupeCoursId: 'GC_MATIN' });
        expect(tsv).not.toContain('Le narrateur omniscient');
    });

    it('ce qui n’est pas une rencontre n’a PAS de ligne', () => {
        // ⚠ L'observable est le NOMBRE de lignes, pas la présence d'un titre.
        // Le gabarit Calendrier n'a pas de colonne Séquence : une ligne
        // parasite y sortirait toute vide, donc invisible à un `toContain` —
        // c'est la version qui a d'abord résisté au banc de cassure.
        //
        // La carte d'essai porte six leçons : L'incipit, La description,
        // Leçon nichée, Mise en chantier, Soutenance, Récupération libre.
        // Elle porte AUSSI une séquence sans contenu propre (« Parcours
        // d'intégration », qui n'organise que des sous-séquences) et un
        // élément hors leçon (« Lecture obligatoire du recueil »). Ni l'une
        // ni l'autre n'est une rencontre.
        const table = lignes(exporteur.genererTableau(
            { colonnes: ['sequence', 'lecon', 'semaine'], granularite: 'seances' },
            { groupeCoursId: 'GC_MATIN' }
        ));

        expect(table.slice(1)).toHaveLength(6);
        expect(table.slice(1).every(function(l) { return l[1] !== ''; })).toBe(true);
    });

    it('les mêmes exclus SORTENT en granularité nœuds — ils existent bien', () => {
        // Le pendant du cas précédent : si ces lignes manquaient partout, le
        // test ci-dessus passerait pour une raison qui n'est pas la bonne.
        const tsv = exporteur.genererTableau(
            { colonnes: ['sequence', 'lecon', 'semaine', 'titre'], granularite: 'noeuds' }
        );

        expect(tsv).toContain('Parcours d’intégration');
        expect(tsv).toContain('Lecture obligatoire du recueil');
    });

    it('la granularité PAR DÉFAUT est le déroulement, jamais le calendrier', () => {
        // Un gabarit qui ne dit rien de sa granularité doit produire le
        // document historique. Basculer en calendrier par défaut ferait
        // disparaître des lignes en silence.
        const table = lignes(exporteur.genererTableau({ colonnes: ['lecon', 'type', 'titre'] }));
        const types = table.slice(1).map(function(l) { return l[1]; });

        expect(types).toContain('Leçon');
        expect(types).toContain('Activité');
        expect(types).toContain('Évaluation');
    });
});

describe('Les colonnes du calendrier (#416 lots A + C + G)', () => {
    it('la date sort, et elle suit le groupe demandé', () => {
        const matin = lignes(exporteur.genererTableau(CALENDRIER, { groupeCoursId: 'GC_MATIN' }));
        const soir = lignes(exporteur.genererTableau(CALENDRIER, { groupeCoursId: 'GC_SOIR' }));
        const iDate = matin[0].indexOf('Date');

        expect(matin[1][iDate]).toBe('2026-09-08');
        expect(soir[1][iDate]).toBe('2026-09-09');
    });

    it('le rang sort en LETTRE, jamais en chiffre', () => {
        const table = lignes(exporteur.genererTableau(CALENDRIER, { groupeCoursId: 'GC_MATIN' }));
        const iRang = table[0].indexOf('Séance');
        const rangs = table.slice(1).map(function(l) { return l[iRang]; }).filter(Boolean);

        expect(rangs).toContain('A');
        expect(rangs).toContain('B');
        expect(rangs.every(function(r) { return /^[A-E]$/.test(r); })).toBe(true);
    });

    it('ÉTAT DÉGRADÉ — une leçon sans rang sort quand même, sans date', () => {
        // « Leçon nichée » a une semaine, pas de rang. Elle appartient au
        // calendrier ; c'est sa date qui manque, pas elle.
        const table = lignes(exporteur.genererTableau(
            { colonnes: ['lecon', 'semaine', 'rangSeance', 'date'], granularite: 'seances' },
            { groupeCoursId: 'GC_MATIN' }
        ));
        const ligne = table.find(function(l) { return l[0] === 'Leçon nichée'; });

        expect(ligne).toBeDefined();
        expect(ligne[1]).toBe('5');
        expect(ligne[2]).toBe('');
        expect(ligne[3]).toBe('');
    });

    it('sans groupe désigné et avec DEUX groupes, aucune date n’est devinée', () => {
        const table = lignes(exporteur.genererTableau(CALENDRIER));
        const iDate = table[0].indexOf('Date');

        expect(table.slice(1).every(function(l) { return l[iDate] === ''; })).toBe(true);
    });
});

describe('Le gabarit, et ce qu’il tolère (#416 lot G)', () => {
    it('les colonnes se RENOMMENT, en-tête seulement', () => {
        const tsv = exporteur.genererTableau({
            colonnes: ['semaine', 'contenu'],
            granularite: 'seances',
            renommages: { semaine: 'Sem.', contenu: 'Activités prévues' }
        }, { groupeCoursId: 'GC_MATIN' });

        expect(tsv.split('\n')[0]).toBe('Sem.\tActivités prévues');
        // Le renommage ne touche que l'étiquette : les valeurs sont intactes.
        expect(tsv).toContain('Exposé magistral sur le réalisme');
    });

    it('les colonnes suivent l’ORDRE demandé, préfixe compris (D8)', () => {
        const tsv = exporteur.genererTableau({
            colonnes: ['date', 'semaine', 'lecon'],
            granularite: 'seances'
        }, { groupeCoursId: 'GC_MATIN' });

        expect(tsv.split('\n')[0]).toBe('Date\tSemaine\tLeçon');
    });

    it('un gabarit peut se passer entièrement du préfixe historique (D8)', () => {
        // « Séquence | Leçon | Semaine » était fixe et en tête. Un tableau
        // départemental doit pouvoir n'en garder aucune.
        const tsv = exporteur.genererTableau({
            colonnes: ['date', 'contenu'],
            granularite: 'seances'
        }, { groupeCoursId: 'GC_MATIN' });

        expect(tsv.split('\n')[0]).toBe('Date\tContenu');
    });

    it('une colonne inconnue est ÉCARTÉE, elle ne produit pas de colonne vide', () => {
        const tsv = exporteur.genererTableau({
            colonnes: ['semaine', 'colonne-qui-nexiste-pas', 'contenu'],
            granularite: 'seances'
        }, { groupeCoursId: 'GC_MATIN' });

        expect(tsv.split('\n')[0]).toBe('Semaine\tContenu');
    });

    it('un gabarit vide montre TOUT plutôt que rien', () => {
        // Un gabarit qui ne dit rien est une demande incomplète, pas une
        // demande de document vide : masquer en silence serait le pire choix.
        const entete = exporteur.genererTableau({}).split('\n')[0];
        expect(entete).toContain('Séquence');
        expect(entete).toContain('Échelle');
    });

    it('le moteur SAIT quelles colonnes sont sans effet en granularité nœuds', () => {
        // ⚠ Constat terrain du 12 août : Grégoire a coché Contenu, Évaluations
        // et Travail personnel sur un gabarit « ligne par élément » et a obtenu
        // un tableau dont la moitié des colonnes étaient vides. Le code le
        // savait ; rien ne le disait à l'écran. La liste est désormais nommée
        // et exposée, pour que l'interface puisse la signaler.
        expect(exporteur.COLONNES_PAR_SEANCE).toEqual(['contenu', 'evaluations', 'travailPersonnel']);

        exporteur.COLONNES_PAR_SEANCE.forEach(function(id) {
            expect(exporteur.colonneUtileEn(id, 'noeuds')).toBe(false);
            expect(exporteur.colonneUtileEn(id, 'seances')).toBe(true);
        });

        // Les colonnes ordinaires servent dans les deux granularités.
        ['semaine', 'lecon', 'date', 'rangSeance', 'duree'].forEach(function(id) {
            expect(exporteur.colonneUtileEn(id, 'noeuds')).toBe(true);
            expect(exporteur.colonneUtileEn(id, 'seances')).toBe(true);
        });
    });

    it('les colonnes d’agrégation restent VIDES en granularité nœuds', () => {
        // Chaque élément a déjà sa ligne : répéter la liste complète sur la
        // ligne de leçon ferait dire deux fois la même chose.
        const table = lignes(exporteur.genererTableau({
            colonnes: ['lecon', 'type', 'contenu'], granularite: 'noeuds'
        }));
        const iContenu = table[0].indexOf('Contenu');

        expect(table.slice(1).every(function(l) { return l[iContenu] === ''; })).toBe(true);
    });
});

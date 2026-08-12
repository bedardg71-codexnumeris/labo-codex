import { describe, it, expect, beforeEach } from 'vitest';
import { monterExportSandbox } from './_helpers/carte-essai-exports.js';

// LES GABARITS NOMMÉS (#416 lot H).
//
// L'hypothèse posée par Grégoire au journal `USAGE-FORMATS.md` le 8 août —
// « un seul réglage suffit-il, ou faudra-t-il des gabarits nommés ? » — a été
// levée par son usage le 12 août. Un gabarit est un TABLEAU : colonnes
// ordonnées, granularité, libellés renommables.
//
// ⚠ CE QUI SE JOUE VRAIMENT ICI, c'est la MIGRATION. Le réglage unique de
// #431 ne cohabite pas avec les gabarits : il devient l'un d'eux. C'est le
// seul endroit de ce chantier qui touche une donnée que Grégoire a saisie —
// d'où l'ordre d'écriture, l'idempotence, et le refus de recréer ce qu'il
// aurait supprimé.

let sandbox;
let exporteur;
let prefs;

function monter(prefsInitiales) {
    prefs = Object.assign({ exportGabarits: [], exportPlanPersonnalise: null }, prefsInitiales || {});
    sandbox = monterExportSandbox();
    exporteur = sandbox.exporteur;
    sandbox.win.obtenirPreference = (k) => (k in prefs ? prefs[k] : null);
    sandbox.win.definirPreference = (k, v) => { prefs[k] = v; };
    return exporteur;
}

beforeEach(() => { monter(); });

describe('Les gabarits d’usine (#416 lot H)', () => {
    it('les quatre sont offerts, sans avoir jamais été persistés', () => {
        expect(exporteur.listerGabarits().map((g) => g.id))
            .toEqual(['sommaire', 'deroulement', 'alignement', 'calendrier']);
        // On ne persiste pas ce qu'on n'édite pas.
        expect(prefs.exportGabarits).toEqual([]);
    });

    it('ils se déclarent d’usine — l’interface doit pouvoir les protéger', () => {
        expect(exporteur.listerGabarits().every((g) => g.dUsine === true)).toBe(true);
    });

    it('un gabarit d’usine ne s’écrase PAS, même si l’appelant insiste', () => {
        const resultat = exporteur.enregistrerGabarit({
            id: 'calendrier', nom: 'Détourné', colonnes: ['lecon'], granularite: 'noeuds'
        });

        expect(resultat).toBeNull();
        expect(exporteur.trouverGabarit('calendrier').nom).toBe('Calendrier');
        expect(prefs.exportGabarits).toEqual([]);
    });

    it('il se DUPLIQUE — le seul chemin vers un gabarit modifiable', () => {
        const copie = exporteur.dupliquerGabarit('calendrier');

        expect(copie.dUsine).toBe(false);
        expect(copie.nom).toBe('Calendrier (copie)');
        expect(copie.colonnes).toEqual(exporteur.trouverGabarit('calendrier').colonnes);
        // La copie est indépendante : modifier l'une ne touche pas l'autre.
        copie.colonnes.push('liens');
        expect(exporteur.trouverGabarit('calendrier').colonnes).not.toContain('liens');
    });
});

describe('La migration du « Personnalisé » de #431 (#416 lot H)', () => {
    const CONFIG_431 = {
        contenus: {
            objectifs: true, activites: true, evaluations: true, durees: true,
            retroactions: false, connaissances: false, liens: false, productionsDetail: false
        },
        ordre: ['deroulement', 'objectifs', 'productions', 'liens']
    };

    it('le réglage hérité DEVIENT un gabarit', () => {
        monter({ exportPlanPersonnalise: CONFIG_431 });

        const migre = exporteur.listerGabarits().find((g) => g.id === 'gab-migre-431');
        expect(migre).toBeDefined();
        expect(migre.nom).toBe('Mon export personnalisé');
        expect(migre.dUsine).toBe(false);
    });

    it('il garde l’ORDRE des sections choisi — la traduction n’est pas réinventée', () => {
        monter({ exportPlanPersonnalise: CONFIG_431 });
        const migre = exporteur.trouverGabarit('gab-migre-431');

        // « deroulement » avant « objectifs » dans la config : Type/Titre/Durée
        // doivent donc précéder Objectifs dans les colonnes.
        expect(migre.colonnes.indexOf('type')).toBeLessThan(migre.colonnes.indexOf('objectifs'));
        // Rétroactions décochée : pas de colonne Rétroaction.
        expect(migre.colonnes).not.toContain('retroaction');
        expect(migre.colonnes).toContain('duree');
    });

    it('l’ancien réglage NE COHABITE PAS — il est effacé', () => {
        monter({ exportPlanPersonnalise: CONFIG_431 });
        exporteur.listerGabarits();

        expect(prefs.exportPlanPersonnalise).toBeNull();
    });

    it('le gabarit est écrit AVANT que l’ancien soit effacé', () => {
        // ⚠ L'ordre est ce qui rend la migration sûre : si l'écriture du
        // gabarit échouait, l'ancien réglage survivrait et la migration se
        // rejouerait. L'inverse perdrait le réglage pour un export raté.
        const ordre = [];
        monter({ exportPlanPersonnalise: CONFIG_431 });
        sandbox.win.definirPreference = (k, v) => { ordre.push(k); prefs[k] = v; };

        exporteur.listerGabarits();

        expect(ordre.indexOf('exportGabarits')).toBeLessThan(ordre.indexOf('exportPlanPersonnalise'));
    });

    it('elle est IDEMPOTENTE — relire ne produit pas un doublon', () => {
        monter({ exportPlanPersonnalise: CONFIG_431 });

        exporteur.listerGabarits();
        exporteur.listerGabarits();
        exporteur.listerGabarits();

        const migres = exporteur.listerGabarits().filter((g) => g.id === 'gab-migre-431');
        expect(migres).toHaveLength(1);
    });

    it('IDEMPOTENTE MÊME SI L’EFFACEMENT ÉCHOUE — le cas que la garde protège', () => {
        // ⚠ L'écriture des préférences est enveloppée d'un try/catch : une
        // préférence non écrite ne doit jamais bloquer un export. Conséquence :
        // l'effacement de l'ancienne clé PEUT échouer en silence, et la
        // migration se rejouera à chaque lecture. Sans la garde de doublon,
        // Grégoire verrait « Mon export personnalisé » se multiplier dans sa
        // liste à chaque ouverture du panneau.
        //
        // Le test précédent ne pouvait pas le voir : l'effacement y réussit,
        // donc la deuxième lecture ne migre plus du tout. C'est la version qui
        // a résisté au banc de cassure.
        monter({ exportPlanPersonnalise: CONFIG_431 });
        sandbox.win.definirPreference = (k, v) => {
            if (k === 'exportPlanPersonnalise') return;   // l'effacement échoue
            prefs[k] = v;
        };

        exporteur.listerGabarits();
        exporteur.listerGabarits();
        exporteur.listerGabarits();

        expect(exporteur.listerGabarits().filter((g) => g.id === 'gab-migre-431')).toHaveLength(1);
    });

    it('un gabarit migré puis SUPPRIMÉ ne revient pas au démarrage suivant', () => {
        // Supprimer son gabarit est une décision de l'utilisateur. Le lui
        // réimposer serait pire que de ne pas avoir migré.
        monter({ exportPlanPersonnalise: CONFIG_431 });
        exporteur.listerGabarits();
        expect(exporteur.supprimerGabarit('gab-migre-431')).toBe(true);

        expect(exporteur.listerGabarits().map((g) => g.id)).not.toContain('gab-migre-431');
    });

    it('sans réglage hérité, rien n’est créé ni écrit', () => {
        monter();
        exporteur.listerGabarits();

        expect(prefs.exportGabarits).toEqual([]);
        expect(exporteur.listerGabarits().every((g) => g.dUsine)).toBe(true);
    });
});

describe('Ce que le magasin refuse de croire (#416 lot H)', () => {
    it('un gabarit sans aucune colonne connue est ÉCARTÉ, pas rendu vide', () => {
        monter({ exportGabarits: [
            { id: 'gab-1', nom: 'Bon', colonnes: ['semaine', 'lecon'] },
            { id: 'gab-2', nom: 'Corrompu', colonnes: ['colonne-inventée', 'autre'] },
            { id: 'gab-3', nom: 'Sans colonnes', colonnes: [] }
        ] });

        expect(exporteur.listerGabarits().filter((g) => !g.dUsine).map((g) => g.id)).toEqual(['gab-1']);
    });

    it('une colonne inconnue est retirée sans emporter le gabarit', () => {
        monter({ exportGabarits: [
            { id: 'gab-1', nom: 'Mixte', colonnes: ['semaine', 'inventée', 'lecon'] }
        ] });

        expect(exporteur.trouverGabarit('gab-1').colonnes).toEqual(['semaine', 'lecon']);
    });

    it('un renommage qui ne correspond à aucune colonne du gabarit est écarté', () => {
        // Sinon il survit à la colonne qu'il nommait, et réapparaît le jour où
        // l'utilisateur remet cette colonne — avec un nom qu'il a oublié.
        monter({ exportGabarits: [
            { id: 'gab-1', nom: 'X', colonnes: ['semaine'], renommages: { semaine: 'Sem.', duree: 'Minutes' } }
        ] });

        expect(exporteur.trouverGabarit('gab-1').renommages).toEqual({ semaine: 'Sem.' });
    });

    it('un gabarit sans identifiant ou sans nom ne casse pas la liste', () => {
        monter({ exportGabarits: [
            { nom: 'Sans id', colonnes: ['semaine'] },
            { id: 'gab-2', colonnes: ['semaine'] },
            null,
            'pas un objet'
        ] });

        const propres = exporteur.listerGabarits().filter((g) => !g.dUsine);
        expect(propres).toHaveLength(1);
        expect(propres[0].nom).toBe('Gabarit sans nom');
    });

    it('les identifiants ne se marchent pas dessus', () => {
        monter();
        const a = exporteur.dupliquerGabarit('calendrier');
        const b = exporteur.dupliquerGabarit('calendrier');
        const c = exporteur.dupliquerGabarit('sommaire');

        expect(new Set([a.id, b.id, c.id]).size).toBe(3);
    });
});

describe('Le document d’un gabarit (#416 lot H)', () => {
    it('un gabarit dupliqué puis modifié produit SES colonnes', () => {
        monter();
        const copie = exporteur.dupliquerGabarit('calendrier', 'Plan département');
        exporteur.enregistrerGabarit(Object.assign({}, copie, {
            colonnes: ['date', 'contenu'],
            renommages: { contenu: 'Travaux en atelier' }
        }));

        const tsv = exporteur.genererDepuisGabarit(copie.id, 'tsv', { groupeCoursId: 'GC_MATIN' });
        expect(tsv.split('\n')[0]).toBe('Date\tTravaux en atelier');
    });

    it('un gabarit ne produit QUE des tableaux — le Texte est refusé', () => {
        monter();
        expect(exporteur.genererDepuisGabarit('calendrier', 'texte')).toBeNull();
        expect(exporteur.genererDepuisGabarit('calendrier', 'tsv', { groupeCoursId: 'GC_MATIN' })).toBeTruthy();
        expect(exporteur.genererDepuisGabarit('calendrier', 'markdown', { groupeCoursId: 'GC_MATIN' })).toBeTruthy();
    });

    it('le gabarit d’usine « Plan de cours » garde sa règle de lignes', () => {
        // Il n'émet que les évaluations : c'est une propriété du gabarit, pas
        // de ses colonnes. La perdre en passant par le magasin produirait un
        // document différent sous le même nom.
        monter();
        const parGabarit = exporteur.genererDepuisGabarit('sommaire', 'tsv');
        expect(parGabarit).toBe(exporteur.genererExport('sommaire', 'tsv'));
    });

    it('un identifiant inconnu rend null plutôt qu’un document par défaut', () => {
        monter();
        expect(exporteur.genererDepuisGabarit('gabarit-fantome', 'tsv')).toBeNull();
    });
});

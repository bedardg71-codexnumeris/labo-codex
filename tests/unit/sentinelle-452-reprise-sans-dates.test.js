import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #452 — REPRENDRE UNE PRODUCTION DE LA BIBLIOTHÈQUE N'EMPORTE PLUS LES
// DATES DU TRIMESTRE PRÉCÉDENT.
//
// Constat terrain de Grégoire (11 août 2026) : « les dates de remise des
// travaux à l'hiver sont celles de l'automne précédent. » Le mécanisme :
// `ajouterProductionIndividuelle` construit la copie par spread — TOUT
// traverse, et seuls quatre champs techniques sont réécrits. Or une date
// d'échéance appartient au CALENDRIER d'un trimestre : elle ne peut pas
// suivre la production d'un trimestre à l'autre.
//
// DEUX porteurs de dates, et le second est le plus dangereux :
//   · `dateEcheance` — la date legacy, visible dans le formulaire ;
//   · `echeancesParGroupe` — { [groupeCoursId]: { assignee, date } }, une
//     date PAR GROUPE-COURS. Ses groupeCoursId désignent des groupes du
//     trimestre PRÉCÉDENT, inexistants dans le nouveau ; et comme le
//     formulaire ne relit que les groupes AFFICHÉS, ces entrées périmées
//     survivraient en silence à chaque enregistrement.
//
// Décision (backlog #452) : VIDER, pas deviner. Reporter une date sur le
// calendrier du trimestre cible serait fabriquer une promesse qu'on ne peut
// pas tenir ; vider est le seul choix qui ne crée pas de fausse donnée.
// L'enseignant ressaisit la date — et rien ne ment en attendant.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceBiblio = readFileSync(path.join(racineProjet, 'js', 'productions-bibliotheque-ui.js'), 'utf8');

// La production telle qu'elle dort dans la bibliothèque : copiée depuis A25,
// elle porte encore les dates et les groupes-cours de l'automne.
const PROD_A25 = () => ({
    id: 'BIBLIO_ANALYSE_1',
    titre: 'Analyse littéraire 1',
    type: 'travail',
    ponderation: 10,
    grilleId: 'G_SRPNF',
    echelleId: 'E_IDME',
    cartoucheId: 'CART_PLAN',
    dateEcheance: '2025-11-15',
    echeancesParGroupe: {
        'gc_a2025_08000': { assignee: true, date: '2025-11-15' },
        'gc_a2025_08001': { assignee: true, date: '2025-11-17' }
    },
    dateCreation: '2025-08-20T12:00:00.000Z'
});

function monterBanc({ productionsDuCours = [], bibliotheque = [] } = {}) {
    const magasins = { 'test_productions': productionsDuCours };
    const stubs = {
        echapperHtml: (s) => String(s == null ? '' : s),
        cle: (k) => 'test_' + k,
        genererIdUnique: (p) => (p || '') + 'NEUF_H26',
        getCleProductions: () => 'test_productions',
        obtenirToutesLesProductionsBibliotheque: async () => bibliotheque,
        afficherListeProductions: async () => {},
        // #291/#476 — le module s'appuie désormais sur js/identite-item.js.
        // On injecte les VRAIES fonctions : un faux qui accepterait tout
        // ferait passer ce banc à côté de la garde qu'il traverse.
        ...(() => {
            const id = chargerScript('js/identite-item.js');
            return {
                ajouterAvecGardeIdentite: id.ajouterAvecGardeIdentite,
                analyserDoublons: id.analyserDoublons,
                reunirSources: id.reunirSources,
                nommerCopie: id.nommerCopie
            };
        })(),
        getTypeLabel: (t) => String(t || ''),
        listerTrimestresAvecProductions: () => [],
        obtenirCoursActifId: () => null,
        obtenirIdentiteCCUtilisateur: () => 'Test',
        formaterDateCourte: (d) => d,
        notifications: { erreur() {}, succes() {}, info() {} },
        uiDialogues: { confirmerAction: async () => true },
        db: {
            get: async (k) => (k in magasins ? magasins[k] : null),
            set: async (k, v) => { magasins[k] = v; },
            getSync: (k, def) => (k in magasins ? magasins[k] : def),
            setSync: (k, v) => { magasins[k] = v; },
            // #522 lot 3 : la reprise depuis la bibliothèque écrit par la file.
            // Le stub la reproduit, refus compris — un mutateur qui rend
            // `undefined` n'écrit rien.
            modifier: async (k, mutateur, defaut = null) => {
                const lue = k in magasins ? magasins[k] : defaut;
                const resultat = await mutateur(lue);
                if (resultat === undefined) return undefined;
                magasins[k] = resultat;
                return resultat;
            }
        },
        BibliothequeUI: {
            genererBadgeSource: () => '', genererIdCourt: (id) => String(id).slice(0, 6),
            filtrerParModeDemo: (arr) => arr, formaterTitreDemo: (t) => t,
            estItemDemo: () => false,
            formaterInspireDe: () => '', fermerModal: () => {},
            renderAvertissementDoublons: () => '', obtenirAuteurActif: () => 'Test',
            forkerItem: (item, prefix) => ({ ...item, id: prefix + 'TEST' }),
            repertoires: { enregistrer() {}, genererZone: () => '', initialiserZone() {} }
        },
        productionEnEdition: null
    };
    const win = chargerScript('js/productions-bibliotheque-ui.js', stubs);
    return { win, magasins };
}

describe('#452 · la copie reprise naît SANS les dates du trimestre précédent', () => {

    it('⚠ LE CAS DE GRÉGOIRE : dateEcheance ne traverse plus la reprise', async () => {
        const { win, magasins } = monterBanc({ bibliotheque: [PROD_A25()] });

        await win.ajouterProductionIndividuelle('BIBLIO_ANALYSE_1');

        const copies = magasins['test_productions'];
        expect(copies).toHaveLength(1);
        const copie = copies[0];
        // La date de l'automne ne suit pas : le champ naît vide, l'enseignant
        // ressaisit la date du NOUVEAU calendrier.
        expect(copie.dateEcheance).toBeNull();              // ← '2025-11-15' avant le correctif
    });

    it('⚠⚠ echeancesParGroupe — le porteur silencieux — est vidé lui aussi', async () => {
        // Un correctif qui ne vide que `dateEcheance` laisse le vrai porteur
        // intact en mode multi-groupe : des dates rattachées à des groupes
        // d'A25 qui n'existent pas en H26, invisibles dans le formulaire,
        // et resauvegardées telles quelles à chaque enregistrement.
        const { win, magasins } = monterBanc({ bibliotheque: [PROD_A25()] });

        await win.ajouterProductionIndividuelle('BIBLIO_ANALYSE_1');

        const copie = magasins['test_productions'][0];
        expect('echeancesParGroupe' in copie).toBe(false);  // ← les 2 dates d'A25 avant le correctif
    });

    it('tout le RESTE de la production traverse intact — la reprise reste une reprise', async () => {
        const { win, magasins } = monterBanc({ bibliotheque: [PROD_A25()] });

        await win.ajouterProductionIndividuelle('BIBLIO_ANALYSE_1');

        const copie = magasins['test_productions'][0];
        expect(copie.titre).toBe('Analyse littéraire 1');
        expect(copie.type).toBe('travail');
        expect(copie.ponderation).toBe(10);
        // Les références pédagogiques ne sont PAS des dates de calendrier :
        // elles suivent (et `bibliothequeProductions` reste le témoin 2 de #453).
        expect(copie.grilleId).toBe('G_SRPNF');
        expect(copie.echelleId).toBe('E_IDME');
        expect(copie.cartoucheId).toBe('CART_PLAN');
        // Traçabilité de la copie.
        expect(copie.idOriginal).toBe('BIBLIO_ANALYSE_1');
        expect(copie.id).not.toBe('BIBLIO_ANALYSE_1');
        expect(copie.dansBibliotheque).toBe(true);
    });

    it('une production DÉJÀ dans le cours garde ses dates — seule la COPIE est vidée', async () => {
        // L'autre branche de la fonction : re-rendre visible une production
        // du cours n'est pas une reprise inter-trimestre. Ses dates sont les
        // SIENNES, dans SON calendrier — y toucher serait un dégât.
        const enCours = { ...PROD_A25(), id: 'PROD_LOCALE', dansBibliotheque: false };
        const { win, magasins } = monterBanc({ productionsDuCours: [enCours] });

        await win.ajouterProductionIndividuelle('PROD_LOCALE');

        const prod = magasins['test_productions'][0];
        expect(prod.dateEcheance).toBe('2025-11-15');
        expect(prod.echeancesParGroupe).toEqual(PROD_A25().echeancesParGroupe);
        expect(prod.dansBibliotheque).toBe(true);
    });

    it('invariant de source : la copie est construite datée à NULL, pas au hasard d’un spread', () => {
        const bloc = sourceBiblio.slice(
            sourceBiblio.indexOf('async function ajouterProductionIndividuelle'),
            sourceBiblio.indexOf('async function ajouterMesProductionsALaBibliotheque')
        );
        expect(bloc).toMatch(/dateEcheance: null/);
        expect(bloc).toMatch(/delete prod\.echeancesParGroupe/);
    });
});

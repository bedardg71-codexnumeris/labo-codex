/**
 * SENTINELLE — « Renommer » une pratique depuis la bibliothèque (28 nov. 2026) : la règle qui dit QUOI renommer.
 * `cibleRenommagePratique` et `jugerNomPratique` (js/pratiques-bibliotheque.js), fonctions pures que le geste
 * `renommerPratiqueDepuisBibliotheque` (js/pratiques-gestion.js) applique sans rien y ajouter.
 *
 * Décisions de Grégoire (28 nov., 6 h 40 à 6 h 47) : seul son geste renomme ; la jumelle de l'autre colonne suit quand
 * les deux sont liées ; les autres trimestres ne bougent pas ; un modèle fourni avec l'application ne se renomme pas.
 *
 * Ce que le banc fixe : rangée seule ; rangée et jumelle (dans les deux sens, par l'id et par `idOriginal`) ; jumelle
 * fournie laissée, y compris quand une copie rangée intacte du modèle existe ; rangée fournie refusée ; pratique de la
 * démo refusée ; nom vide ; nom inchangé ; espaces de bord ; nom déjà porté (jamais un refus).
 * Le geste à l'écran : tests/integration/renommer-pratique-bibliotheque.spec.js. Noms fictifs.
 *
 *   cd tests && npx vitest run unit/sentinelle-renommer-pratique-bibliotheque.test.js
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const win = chargerScript('js/pratiques-bibliotheque.js');
const { cibleRenommagePratique: cibler, jugerNomPratique: juger, MODELES_PRATIQUES_PREDEFINIS: MODELES } = win;

// La relation unique, recopiée de `BibliothequeUI.lieeAExemplaire` (js/bibliotheque-ui.js) : le geste lui passe la vraie.
const liee = (item, ex) => !!item && !!ex && !!ex.id && (item.id === ex.id || item.idOriginal === ex.id);
const ID_MODELE = 'SOM-litterature';
const modele = (extra) => Object.assign(JSON.parse(JSON.stringify(MODELES[ID_MODELE])), extra || {});
const pratique = (id, nom, extra) => Object.assign({ id, nom, type: 'sommative', configuration: {} }, extra || {});
const viser = (cote, id, trimestre, bibliotheque, estDeDemo) =>
    cibler({ cote, id, trimestre, bibliotheque, liee, estDeDemo });

describe('cibleRenommagePratique — ce que le geste vise', () => {
    it('rangée du trimestre sans jumelle : elle seule', () => {
        const c = viser('trimestre', 'p1', [pratique('p1', 'Pratique Zébulon')], [modele()]);
        expect(c.refus).toBe(null);
        expect(c.rangee.id).toBe('p1');
        expect(c.jumelle).toBe(null);
        expect(c.typeJumelle).toBe('aucune');
    });

    it('rangée du trimestre et son exemplaire (même id) : la jumelle est l’exemplaire', () => {
        const c = viser('trimestre', 'p1', [pratique('p1', 'Pratique Zébulon')], [pratique('p1', 'Pratique Zébulon')]);
        expect(c.typeJumelle).toBe('exemplaire');
        expect(c.jumelle.id).toBe('p1');
    });

    it('rangée du trimestre liée par idOriginal : la jumelle est l’exemplaire d’origine', () => {
        const c = viser('trimestre', 'p2', [pratique('p2', 'Copie Zébulon', { idOriginal: 'ex9' })], [pratique('ex9', 'Exemplaire Zébulon')]);
        expect(c.typeJumelle).toBe('exemplaire');
        expect(c.jumelle.id).toBe('ex9');
    });

    it('deux exemplaires liés : celui du même id passe avant celui de idOriginal', () => {
        const c = viser('trimestre', 'p1', [pratique('p1', 'Pratique Zébulon', { idOriginal: 'ex9' })],
            [pratique('ex9', 'Origine'), pratique('p1', 'Le sien')]);
        expect(c.jumelle.nom).toBe('Le sien');
    });

    it('RÈGLE c — pratique adoptée d’un modèle fourni : la jumelle est le modèle, elle garde son nom', () => {
        const adoptee = modele({ nom: 'Modèle sommatif', dansBibliotheque: true });
        // Le modèle pur (aucune copie rangée), puis la copie rangée intacte, puis la copie rangée sous l'ancienne paire.
        const copies = [
            modele({ estGabarit: true, dateAjoutBiblio: null }),
            modele({ dansBibliotheque: true, dateAjoutBiblio: '2026-10-01T12:00:00.000Z' }),
            modele({ nom: 'Modèle sommatif', description: 'Pour débuter avec une pratique sommative', dansBibliotheque: true })
        ];
        for (const copieRangee of copies) {
            const c = viser('trimestre', ID_MODELE, [adoptee], [copieRangee]);
            expect(c.refus).toBe(null);
            expect(c.typeJumelle).toBe('fournie');
            const plan = juger('Ma pratique du trimestre', c, [adoptee, copieRangee]);
            expect(plan.ecrireRangee).toBe(true);
            expect(plan.ecrireJumelle, 'la copie rangée d’un modèle fourni n’est jamais réécrite').toBe(false);
        }
    });

    it('une copie MODIFIÉE d’un modèle fourni est un exemplaire à l’enseignant·e : elle suit', () => {
        const modifiee = modele({ nom: 'Mon sommatif retouché' });
        const c = viser('trimestre', ID_MODELE, [modele({ dansBibliotheque: true })], [modifiee]);
        expect(c.typeJumelle).toBe('exemplaire');
    });

    it('rangée de la bibliothèque : un modèle fourni intact est refusé ; sa copie modifiée ne l’est pas', () => {
        expect(viser('bibliotheque', ID_MODELE, [], [modele({ estGabarit: true })]).refus).toBe('fourni');
        expect(viser('bibliotheque', ID_MODELE, [], [modele({ nom: 'Mon sommatif retouché' })]).refus).toBe(null);
    });

    it('rangée de la bibliothèque et sa jumelle du trimestre (par id, sinon par idOriginal)', () => {
        const ex = pratique('ex9', 'Exemplaire Zébulon');
        const parId = viser('bibliotheque', 'ex9', [pratique('ex9', 'Dans le trimestre')], [ex]);
        expect(parId.typeJumelle).toBe('trimestre');
        expect(parId.jumelle.nom).toBe('Dans le trimestre');
        const parOrigine = viser('bibliotheque', 'ex9',
            [pratique('p7', 'Sans lien'), pratique('p8', 'Venue de ex9', { idOriginal: 'ex9' })], [ex]);
        expect(parOrigine.jumelle.id).toBe('p8');
        expect(viser('bibliotheque', 'ex9', [pratique('p7', 'Sans lien')], [ex]).typeJumelle).toBe('aucune');
    });

    it('pratique de la démo : refusée ; jumelle de la démo : laissée', () => {
        const deDemo = (p) => !!p && p.isDemo === true;
        expect(viser('trimestre', 'd1', [pratique('d1', 'Démo fictive', { isDemo: true })], [], deDemo).refus).toBe('demo');
        const c = viser('trimestre', 'p1', [pratique('p1', 'La mienne')], [pratique('p1', 'Démo fictive', { isDemo: true })], deDemo);
        expect(c.typeJumelle).toBe('demo');
        expect(juger('Autre nom', c, []).ecrireJumelle).toBe(false);
    });

    it('identifiant inconnu : introuvable', () => {
        expect(viser('trimestre', 'absent', [pratique('p1', 'Pratique Zébulon')], []).refus).toBe('introuvable');
        expect(viser('bibliotheque', 'absent', [], []).refus).toBe('introuvable');
    });
});

describe('jugerNomPratique — ce que le nom saisi fait écrire', () => {
    const rangee = pratique('p1', 'Pratique Zébulon');
    const exemplaire = pratique('p1', 'Pratique Zébulon');
    const cibleDouble = viser('trimestre', 'p1', [rangee], [exemplaire]);
    const cibleSeule = viser('trimestre', 'p1', [rangee], []);

    it('nom vide ou fait d’espaces : refusé, rien à écrire', () => {
        for (const saisie of ['', '   ', '\t \n', null, undefined]) {
            const plan = juger(saisie, cibleDouble, []);
            expect(plan.refus).toBe('vide');
            expect(plan.ecrireRangee || plan.ecrireJumelle).toBe(false);
        }
    });

    it('nom inchangé (aux espaces de bord près) : rien n’est écrit, et ce n’est pas un refus', () => {
        for (const saisie of ['Pratique Zébulon', '  Pratique Zébulon  ']) {
            const plan = juger(saisie, cibleDouble, []);
            expect(plan.refus).toBe(null);
            expect(plan.inchange).toBe(true);
            expect(plan.ecrireRangee || plan.ecrireJumelle).toBe(false);
        }
    });

    it('les espaces de bord sont retirés ; ceux du milieu restent', () => {
        expect(juger('   Pratique  Farfadet \n', cibleSeule, []).nom).toBe('Pratique  Farfadet');
    });

    it('rangée seule : une écriture ; rangée et exemplaire : deux', () => {
        expect(juger('Pratique Farfadet', cibleSeule, [])).toMatchObject({ ecrireRangee: true, ecrireJumelle: false });
        expect(juger('Pratique Farfadet', cibleDouble, [])).toMatchObject({ ecrireRangee: true, ecrireJumelle: true });
    });

    it('la jumelle qui porte déjà le nom n’est pas réécrite', () => {
        const c = viser('trimestre', 'p1', [rangee], [pratique('p1', 'Pratique Farfadet')]);
        expect(juger('Pratique Farfadet', c, [])).toMatchObject({ ecrireRangee: true, ecrireJumelle: false });
    });

    it('nom déjà porté par une AUTRE pratique : signalé, jamais refusé ; la rangée et sa jumelle ne comptent pas', () => {
        const autre = pratique('p9', 'Pratique Farfadet');
        const plan = juger('  pratique farfadet ', cibleDouble, [rangee, exemplaire, autre]);
        expect(plan).toMatchObject({ refus: null, dejaPorte: true, ecrireRangee: true, ecrireJumelle: true });
        expect(juger('Pratique Lutin', cibleDouble, [rangee, exemplaire, autre]).dejaPorte).toBe(false);
        // L'ancien nom de la jumelle n'est pas « une autre pratique ».
        const c = viser('trimestre', 'p1', [rangee], [pratique('p1', 'Vieux nom')]);
        expect(juger('Vieux nom', c, [rangee, c.jumelle]).dejaPorte).toBe(false);
    });

    it('une cible refusée n’écrit rien, quel que soit le nom', () => {
        const fournie = viser('bibliotheque', ID_MODELE, [], [modele({ estGabarit: true })]);
        expect(juger('Nom neuf', fournie, [])).toMatchObject({ ecrireRangee: false, ecrireJumelle: false });
    });
});

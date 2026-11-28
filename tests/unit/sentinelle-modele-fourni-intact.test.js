/**
 * SENTINELLE — lot modele-fourni-non-supprimable (22 nov. 2026) : `estModeleFourniIntact` (js/pratiques-bibliotheque.js).
 *
 * Bug vécu par Grégoire le 22 nov. 2026 (iPad, 1.254.0) : « Supprimer » sur « Modèle sommatif » dans la bibliothèque
 * des pratiques, deux avertissements de suppression définitive, la ligne toujours là. Sa copie portait l'id du modèle
 * fourni ; effacée, le modèle reprend sa place à la lecture. La fenêtre n'offre plus « Supprimer » quand cette
 * fonction répond vrai ; le banc d'intégration (modele-fourni-non-supprimable.spec.js) éprouve la fenêtre.
 *
 * Ce que la fonction promet : vrai pour le modèle et pour une copie qui ne diffère de lui que par des champs de tenue
 * (dates, auteur, licence, drapeaux) ; faux dès qu'un champ qui compte diffère, manque ou s'ajoute — dans le doute,
 * « différente », et le geste reste offert comme avant.
 *
 * ↻ 28 nov. 2026 (second lot du renommage) : « Modèle sommatif » devient « Modèle cumulatif » ; la garde tient pour intacte
 * la copie à l’ancienne paire nom et description, et la lecture l’affiche au nom courant sans rien écrire (blocs du bas).
 *
 *   cd tests && npx vitest run unit/sentinelle-modele-fourni-intact.test.js
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const win = chargerScript('js/pratiques-bibliotheque.js');
const estIntact = win.estModeleFourniIntact;
const MODELES = win.MODELES_PRATIQUES_PREDEFINIS;
const copie = (id, extra) => Object.assign(JSON.parse(JSON.stringify(MODELES[id])), extra || {});

describe('estModeleFourniIntact', () => {
    it('chaque modèle fourni, tel quel, est intact (et tel que la lecture le sert : estGabarit, dateAjoutBiblio null)', () => {
        const ids = Object.keys(MODELES);
        expect(ids.length).toBeGreaterThanOrEqual(5);
        for (const id of ids) {
            expect(estIntact(copie(id)), id).toBe(true);
            expect(estIntact(copie(id, { estGabarit: true, dateAjoutBiblio: null })), id).toBe(true);
        }
    });

    it('une copie qui ne diffère que par sa tenue (ajout, dates, auteur, licence, ordre des clés) est intacte', () => {
        const c = copie('SOM-litterature', {
            dansBibliotheque: true, dateAjout: '2026-10-01', dateAjoutBiblio: '2026-10-01T12:00:00.000Z',
            dateModification: '2026-10-02', dateCreation: '2026-10-01', dateImport: '2026-10-03',
            auteur: 'Auteur fictif', auteurOriginal: 'Auteur fictif', estGabarit: false,
            metadata_cc: { licence: 'CC BY-NC-SA 4.0' }, metadata: {}, institution: 'Cégep fictif'
        });
        // Mêmes valeurs, clés dans un autre ordre.
        c.configuration = JSON.parse(JSON.stringify({ criteres: c.configuration.criteres,
            evaluations: c.configuration.evaluations, methodeCalcul: c.configuration.methodeCalcul }));
        expect(estIntact(c)).toBe(true);
    });

    it('une copie qui diffère par ce qui compte n’est PAS intacte', () => {
        const pond = copie('SOM-litterature');
        pond.configuration.evaluations[0].ponderation = 20;
        expect(estIntact(pond), 'une pondération').toBe(false);
        expect(estIntact(copie('SOM-litterature', { nom: 'Modèle sommatif modifié' })), 'le nom').toBe(false);
        expect(estIntact(copie('SOM-litterature', { description: 'Autre description' })), 'la description').toBe(false);
        expect(estIntact(copie('SOM-litterature', { jetons: { actif: true } })), 'les jetons').toBe(false);
        // Une copie d'avant le 29 oct. 2026 : sans réglage des jetons. Elle diffère (installée, elle offrirait les jetons).
        const sansJetons = copie('SOM-litterature');
        delete sansJetons.jetons;
        expect(estIntact(sansJetons), 'sans jetons').toBe(false);
        expect(estIntact(copie('SOM-litterature', { seuils: { va_bien: 80 } })), 'un champ ajouté').toBe(false);
        const sansCriteres = copie('SOM-litterature');
        delete sansCriteres.configuration.criteres;
        expect(estIntact(sansCriteres), 'un champ retiré').toBe(false);
    });

    it('hors des modèles fournis : jamais intact (ni une pratique à soi de même nom, ni rien)', () => {
        expect(estIntact({ id: 'pratique_123', nom: 'Modèle sommatif', type: 'sommative' })).toBe(false);
        expect(estIntact(null)).toBe(false);
        expect(estIntact({})).toBe(false);
        expect(estIntact({ id: 42 })).toBe(false);
    });
});

/* Second lot du renommage (28 nov. 2026) — « Modèle sommatif » devient « Modèle cumulatif », description comprise. La
 * copie rangée chez Grégoire (iPad, id SOM-litterature, 22 nov.) porte l'ancienne paire : elle reste intacte, sans quoi
 * « Supprimer » reviendrait sur une ligne qui reprend sa place à la lecture. Pas de tolérance générale sur le nom. */
const ANCIENNE = { nom: 'Modèle sommatif', description: 'Pour débuter avec une pratique sommative' };
const NOUVELLE = { nom: 'Modèle cumulatif', description: 'Pour débuter avec une pratique cumulative' };

describe('estModeleFourniIntact · renommage du 28 nov. 2026', () => {
    it('le modèle porte la nouvelle paire', () => {
        expect({ nom: MODELES['SOM-litterature'].nom, description: MODELES['SOM-litterature'].description }).toEqual(NOUVELLE);
    });
    it('une copie rangée à l’ancienne forme (ancien nom ET ancienne description) est intacte', () => {
        expect(estIntact(copie('SOM-litterature', { ...ANCIENNE, dansBibliotheque: true, dateAjoutBiblio: '2026-11-22T10:00:00.000Z' }))).toBe(true);
    });
    it('une copie rangée à la nouvelle forme est intacte', () => {
        expect(estIntact(copie('SOM-litterature', { ...NOUVELLE, dansBibliotheque: true }))).toBe(true);
    });
    it('une copie renommée à la main n’est PAS intacte, quelle que soit sa description', () => {
        expect(estIntact(copie('SOM-litterature', { nom: 'Ma pratique cumulative' })), 'nouvelle description').toBe(false);
        expect(estIntact(copie('SOM-litterature', { nom: 'Ma pratique cumulative', description: ANCIENNE.description })), 'ancienne description').toBe(false);
    });
    it('la paire se juge ensemble : ancien nom et nouvelle description (ou l’inverse) ne sont PAS intacts', () => {
        expect(estIntact(copie('SOM-litterature', { nom: ANCIENNE.nom }))).toBe(false);
        expect(estIntact(copie('SOM-litterature', { description: ANCIENNE.description }))).toBe(false);
    });
    it('l’ancienne paire ne vaut que pour SON modèle : ailleurs, elle fait une copie modifiée', () => {
        expect(estIntact(copie('SPE-simple', ANCIENNE))).toBe(false);
    });
    it('un homonyme sans parenté (un autre id) n’est PAS intact, à l’ancienne comme à la nouvelle forme', () => {
        const sansParente = (forme) => Object.assign(copie('SOM-litterature', forme), { id: 'pratique_1788364991518_1_f79a585f3c32' });
        expect(estIntact(sansParente(ANCIENNE)), 'ancienne').toBe(false);
        expect(estIntact(sansParente(NOUVELLE)), 'nouvelle').toBe(false);
    });
    it('une copie à l’ancienne forme qui diffère par AILLEURS (une pondération) n’est PAS intacte', () => {
        const c = copie('SOM-litterature', ANCIENNE);
        c.configuration.evaluations[0].ponderation = 20;
        expect(estIntact(c)).toBe(false);
    });
});

/* L'affichage : une copie reconnue intacte se lit avec le nom et la description courants du modèle, dans les deux
 * lecteurs de la bibliothèque — et RIEN n'est écrit (ni setSync, ni l'objet lu). */
describe('lecture de la bibliothèque · une copie intacte prend le nom courant, sans rien écrire', () => {
    const preparer = (rangees) => {
        const ecritures = [];
        const db = {
            getSync: (k) => (k === 'bibliothequePratiques' ? rangees : null),
            get: async (k) => (k === 'bibliothequePratiques' ? rangees : null),
            setSync: (k) => { ecritures.push(k); }, set: async (k) => { ecritures.push(k); },
            modifier: async (k) => { ecritures.push(k); }
        };
        return { w: chargerScript('js/pratiques-bibliotheque.js', { db }), ecritures };
    };
    const rangees = () => [
        copie('SOM-litterature', { ...ANCIENNE, dansBibliotheque: true, dateAjoutBiblio: '2026-11-22T10:00:00.000Z' }),
        Object.assign(copie('SOM-litterature', ANCIENNE), { id: 'pratique_banc_homonyme' })
    ];

    for (const lecteur of ['obtenirToutesLesPratiquesBibliothequeSync', 'obtenirToutesLesPratiquesBibliotheque']) {
        it(lecteur + ' : nom et description courants pour la copie intacte ; l’homonyme et le stock intouchés', async () => {
            const stock = rangees();
            const avant = JSON.stringify(stock);
            const { w, ecritures } = preparer(stock);
            const lues = await w[lecteur](true);
            const fourni = lues.filter(p => p.id === 'SOM-litterature');
            expect(fourni.length, 'une seule ligne pour le modèle').toBe(1);
            expect({ nom: fourni[0].nom, description: fourni[0].description }).toEqual(NOUVELLE);
            expect(fourni[0].dateAjoutBiblio, 'c’est bien la copie rangée').toBe('2026-11-22T10:00:00.000Z');
            const homonyme = lues.find(p => p.id === 'pratique_banc_homonyme');
            expect({ nom: homonyme.nom, description: homonyme.description }).toEqual(ANCIENNE);
            expect(JSON.stringify(stock), 'les données lues ne bougent pas').toBe(avant);
            expect(ecritures).toEqual([]);
        });
    }

    it('une copie renommée à la main garde son nom à la lecture', () => {
        const stock = [copie('SOM-litterature', { nom: 'Ma pratique cumulative', description: ANCIENNE.description })];
        const { w } = preparer(stock);
        const lue = w.obtenirToutesLesPratiquesBibliothequeSync(true).find(p => p.id === 'SOM-litterature');
        expect(lue.nom).toBe('Ma pratique cumulative');
        expect(lue.description).toBe(ANCIENNE.description);
    });
});

/* ================================================================ JOURNAL DES BREAK-TESTS (28 nov. 2026, second lot du renommage)
 *
 * Chaque mutation posée dans js/pratiques-bibliotheque.js, ce banc relancé seul, la mutation retirée (sha256 du fichier
 * identique avant et après : 3898919948ea9c02…).
 *   M1 la tolérance retirée (`porteUnePaireDuModele` ne lit plus FORMES_ANTERIEURES_DES_MODELES)  → 3 rouges sur 15 :
 *      l'ancienne forme intacte, les deux lecteurs.
 *   M2 l'affichage retiré (les deux lecteurs servent la copie telle quelle)                        → 2 rouges : les deux lecteurs.
 *   M3 une tolérance générale sur le nom (nom et description jamais jugés)                          → 5 rouges : le nom modifié,
 *      la copie renommée à la main, la paire mélangée, l'ancienne paire sur un autre modèle, la lecture d'une copie renommée.
 *   M4 l'affichage jugé au nom seul (sans la garde)                                                 → 2 rouges : l'homonyme
 *      sans parenté, renommé à la lecture.
 */

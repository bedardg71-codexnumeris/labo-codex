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

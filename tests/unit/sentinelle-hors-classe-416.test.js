import { describe, it, expect, beforeEach } from 'vitest';
import { monterExportSandbox } from './_helpers/carte-essai-exports.js';

// LE TRAVAIL HORS CLASSE (#416 lot B).
//
// La sixième colonne du calendrier de Grégoire s'appelle « Travail personnel ».
// Rien dans le modèle ne disait « ce nœud se fait hors des heures de classe ».
//
// ⚠ CE QUI SE JOUE ICI N'EST PAS L'EXPORT, C'EST LE Σ DES LEÇONS.
// `dureeRollupNoeud` alimente l'en-tête de chaque bloc et la jauge du
// planificateur. Une erreur s'y voit PARTOUT et ne ressemble pas à un bug
// d'export : le compteur affiche un total, il a l'air juste, et il est faux.
// C'est le lot qui mérite le plus de break-tests — le plan le disait avant
// qu'il soit écrit.
//
// La règle du projet qui arbitre : UNE MINUTE DE CLASSE APPARTIENT À
// EXACTEMENT UN NŒUD. Le corollaire du lot B : une minute HORS classe
// n'appartient à aucun total de classe.

let sandbox;
let carte;
let exporteur;

beforeEach(() => {
    sandbox = monterExportSandbox();
    carte = sandbox.carte;
    exporteur = sandbox.exporteur;
});

function noeud(id) { return carte.etat.noeuds.get(id); }

describe('Le Σ d’une leçon ne compte que du temps de CLASSE (#416 lot B)', () => {
    it('marquer un nœud hors classe RETIRE son temps du total', () => {
        // « L'incipit » : exposé 50 + activité 45 + évaluation 30 = 125.
        const lecon = noeud('lecon-1');
        expect(carte.dureeRollupNoeud(lecon)).toBe(125);

        carte.definirHorsClasse('act-1', true);   // l'atelier de 45 min

        expect(carte.dureeRollupNoeud(lecon)).toBe(80);
    });

    it('le décocher rend le nœud au total — mais PAS sa durée', () => {
        // ⚠ D3 : cocher retire la durée. La rendre au décochage ferait
        // réapparaître du temps de classe que personne n'a ressaisi.
        const lecon = noeud('lecon-1');
        carte.definirHorsClasse('act-1', true);
        carte.definirHorsClasse('act-1', false);

        expect(noeud('act-1').metadata.duree).toBeUndefined();
        expect(carte.dureeRollupNoeud(lecon)).toBe(80);
    });

    it('une durée arrivée par IMPORT sur un nœud déjà marqué ne gonfle pas le Σ', () => {
        // La deuxième garde, celle que la première ne peut pas voir : le
        // drapeau est posé, puis une durée apparaît sans passer par la porte
        // d'écriture — bibliothèque d'alignements, import inter-trimestre.
        carte.definirHorsClasse('act-1', true);
        noeud('act-1').metadata.duree = 90;

        expect(carte.dureeRollupNoeud(noeud('lecon-1'))).toBe(80);
    });

    it('le Σ d’une SÉQUENCE suit celui de ses leçons', () => {
        // Le rollup est récursif : une erreur au niveau de la leçon remonte.
        const seq = noeud('seq-1');
        const avant = carte.dureeRollupNoeud(seq);

        carte.definirHorsClasse('act-1', true);

        expect(carte.dureeRollupNoeud(seq)).toBe(avant - 45);
    });

    it('marquer un nœud SANS durée ne change rien au total', () => {
        // ⚠ La durée est mise à zéro AVANT de mesurer : sinon on compare le
        // total à une valeur prise quand le nœud pesait encore 30 minutes, et
        // le test échoue pour une raison qui n'est pas celle qu'il annonce.
        noeud('act-2').metadata.duree = 0;
        const lecon = noeud('lecon-2');
        const avant = carte.dureeRollupNoeud(lecon);

        carte.definirHorsClasse('act-2', true);

        expect(carte.dureeRollupNoeud(lecon)).toBe(avant);
    });
});

describe('La porte d’écriture (#416 lot B)', () => {
    it('une connaissance ne peut pas être hors classe — elle ne se « fait » pas', () => {
        expect(carte.definirHorsClasse('conn-1', true)).toBe(false);
        expect(carte.estHorsClasseNoeud(noeud('conn-1'))).toBe(false);
    });

    it('une leçon ni une séquence non plus', () => {
        expect(carte.definirHorsClasse('lecon-1', true)).toBe(false);
        expect(carte.definirHorsClasse('seq-1', true)).toBe(false);
    });

    it('les évaluations ET les frères d’Activité, oui (D4)', () => {
        expect(carte.definirHorsClasse('eval-1', true)).toBe(true);
        expect(carte.definirHorsClasse('exp-1', true)).toBe(true);
    });

    it('décocher RETIRE la clé plutôt que d’y poser false', () => {
        carte.definirHorsClasse('act-1', true);
        carte.definirHorsClasse('act-1', false);

        expect('horsClasse' in noeud('act-1').metadata).toBe(false);
    });

    it('réécrire la même valeur ne prétend pas avoir changé quelque chose', () => {
        expect(carte.definirHorsClasse('act-1', true)).toBe(true);
        expect(carte.definirHorsClasse('act-1', true)).toBe(false);
    });

    it('un nœud inconnu ne fait pas tomber la porte', () => {
        expect(carte.definirHorsClasse('noeud-fantome', true)).toBe(false);
    });

    it('seul le booléen VRAI compte — une valeur importée molle ne suffit pas', () => {
        // ⚠ `metadata.horsClasse` est une donnée PERSISTÉE qui peut venir d'un
        // import (bibliothèque d'alignements, reprise inter-trimestre). Une
        // chaîne « false » est truthy en JavaScript : lue mollement, elle
        // sortirait un nœud du Σ de sa leçon sans que personne ne l'ait
        // demandé, et le total serait faux sans rien pour le signaler.
        // Aucun test ne l'observait — c'est la cassure qui l'a montré.
        const n = noeud('act-1');

        n.metadata.horsClasse = 'false';
        expect(carte.estHorsClasseNoeud(n)).toBe(false);
        expect(carte.dureeRollupNoeud(noeud('lecon-1'))).toBe(125);

        n.metadata.horsClasse = 1;
        expect(carte.estHorsClasseNoeud(n)).toBe(false);

        n.metadata.horsClasse = true;
        expect(carte.estHorsClasseNoeud(n)).toBe(true);
    });
});

describe('Le champ Durée disparaît avec la case (#416 lot B, D3)', () => {
    it('un nœud hors classe n’offre plus de champ Durée', () => {
        expect(carte.dureeControleHTML(noeud('act-1'))).toContain('planif-noeud-duree');

        carte.definirHorsClasse('act-1', true);

        expect(carte.dureeControleHTML(noeud('act-1'))).toBe('');
    });

    it('le champ revient quand on décoche', () => {
        carte.definirHorsClasse('act-1', true);
        carte.definirHorsClasse('act-1', false);

        expect(carte.dureeControleHTML(noeud('act-1'))).toContain('planif-noeud-duree');
    });
});

describe('La colonne « Travail personnel » se remplit (#416 lots B + I)', () => {
    function lignes(tsv) {
        return tsv.replace(/\n$/, '').split('\n').map((l) => l.split('\t'));
    }

    it('un nœud hors classe sort dans SA colonne', () => {
        carte.definirHorsClasse('act-1', true);

        const table = lignes(exporteur.genererExport('calendrier', 'tsv', null, { groupeCoursId: 'GC_MATIN' }));
        const ligne = table.find((l) => l[0] === '3' && l[1] === 'A');

        expect(ligne[5]).toBe('Atelier d’analyse en équipe');
    });

    it('et il QUITTE la colonne Contenu — jamais deux fois sur la même ligne', () => {
        // ⚠ Le cas qui compte : sans l'exclusion, l'atelier sortirait dans
        // Contenu (c'est une activité) ET dans Travail personnel (il est hors
        // classe). Un calendrier qui compte deux fois est pire qu'incomplet.
        carte.definirHorsClasse('act-1', true);

        const table = lignes(exporteur.genererExport('calendrier', 'tsv', null, { groupeCoursId: 'GC_MATIN' }));
        const ligne = table.find((l) => l[0] === '3' && l[1] === 'A');

        expect(ligne[3]).toBe('Exposé magistral sur le réalisme');
        expect(ligne[3]).not.toContain('Atelier');
    });

    it('une ÉVALUATION hors classe quitte aussi sa colonne', () => {
        carte.definirHorsClasse('eval-1', true);

        const table = lignes(exporteur.genererExport('calendrier', 'tsv', null, { groupeCoursId: 'GC_MATIN' }));
        const ligne = table.find((l) => l[0] === '3' && l[1] === 'A');

        expect(ligne[4]).toBe('');
        expect(ligne[5]).toContain('Dissertation critique');
    });

    it('sans nœud marqué, la colonne reste vide — pas de faux positif', () => {
        const table = lignes(exporteur.genererExport('calendrier', 'tsv', null, { groupeCoursId: 'GC_MATIN' }));

        expect(table.slice(1).every((l) => l[5] === '')).toBe(true);
    });
});

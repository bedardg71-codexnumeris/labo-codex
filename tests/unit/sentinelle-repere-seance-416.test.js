import { describe, it, expect, beforeEach } from 'vitest';
import { monterExportSandbox } from './_helpers/carte-essai-exports.js';

// LES REPÈRES DE SÉANCE QUITTENT LES TITRES (#416 lot E).
//
// Depuis le 7 août, `analyserRepereTitre` détectait « séance 2 » dans un titre
// et REFUSAIT de le retirer : « la séance n'a pas de logement dans le modèle ».
// Retirer un repère qui compense un concept manquant aurait fait perdre
// l'information. Le lot A a donné ce logement ; le report tombe.
//
// ⚠⚠ CE QUE CETTE SENTINELLE PROTÈGE VRAIMENT, C'EST LA RÉCIPROQUE DE LA RÈGLE
// DU 6 AOÛT. La migration d'ancrage a refusé de LIRE la semaine dans les titres,
// au motif qu'interpréter produit des ancrages faux indiscernables de vrais. La
// réciproque : on ne lit JAMAIS le rang depuis le titre pour le poser d'office.
// Un titre qui dit « séance 2 » sur une leçon sans rang posé reste INTACT —
// c'est peut-être la seule trace de l'intention de l'enseignant.

let carte;

beforeEach(() => { carte = monterExportSandbox().carte; });

function poser(titre, metadata) {
    const n = {
        id: 'lecon-essai', type: 'lecon', titre, x: 0, y: 0,
        parent: null, enfants: [], metadata: metadata || {}, cloneSourceId: null
    };
    carte.etat.noeuds.set(n.id, n);
    return n;
}

describe('Le repère de séance part — quand il le peut (#416 lot E)', () => {
    it('titre et modèle CONCORDENT : les deux repères partent', () => {
        poser('Sem. 3 séance 2 — L’incipit', { semaine: 3, rangSeance: 2 });
        const a = carte.analyserRepereTitre(carte.etat.noeuds.get('lecon-essai'));

        expect(a.seanceRetirable).toBe(true);
        expect(a.titreNettoye).toBe('L’incipit');
        expect(a.categorie).toBe('pret');
    });

    it('le retrait s’applique vraiment au titre', () => {
        poser('Sem. 3 séance 2 — L’incipit', { semaine: 3, rangSeance: 2 });

        expect(carte.retirerRepereTitre('lecon-essai')).toBe(true);
        expect(carte.etat.noeuds.get('lecon-essai').titre).toBe('L’incipit');
    });

    it('« séance 1 » sur un rang 1 part aussi — la lettre A est un affichage', () => {
        poser('Semaine 5 séance 1 : Ouverture', { semaine: 5, rangSeance: 1 });
        const a = carte.analyserRepereTitre(carte.etat.noeuds.get('lecon-essai'));

        expect(a.titreNettoye).toBe('Ouverture');
    });
});

describe('⚠ Le repère de séance RESTE — la règle du 6 août, en réciproque', () => {
    it('AUCUN rang posé : le titre est intact, et le rang N’EST PAS déduit', () => {
        // Le cas qui compte. Le titre dit « séance 2 » ; le modèle ne dit rien.
        // Poser 2 d'office serait une interprétation — exactement ce que la
        // migration du 6 août a refusé de faire pour la semaine.
        const n = poser('Sem. 3 séance 2 — L’incipit', { semaine: 3 });
        const a = carte.analyserRepereTitre(n);

        expect(a.rangTitre).toBe(2);
        expect(a.rangAncre).toBeNull();
        expect(a.seanceRetirable).toBe(false);
        expect(a.titreNettoye).toBe('séance 2 — L’incipit');

        carte.retirerRepereTitre('lecon-essai');
        expect(carte.etat.noeuds.get('lecon-essai').metadata.rangSeance).toBeUndefined();
    });

    it('rangs CONTRADICTOIRES : on ne tranche pas à sa place', () => {
        // Le titre dit 2, le modèle dit 1. Seul l'enseignant sait lequel fait
        // foi — comme pour un conflit de semaine.
        const n = poser('Sem. 3 séance 2 — L’incipit', { semaine: 3, rangSeance: 1 });
        const a = carte.analyserRepereTitre(n);

        expect(a.seanceRetirable).toBe(false);
        expect(a.titreNettoye).toContain('séance 2');
    });

    it('le rang posé n’est jamais MODIFIÉ par un retrait de repère', () => {
        poser('Sem. 3 séance 2 — L’incipit', { semaine: 3, rangSeance: 2 });
        carte.retirerRepereTitre('lecon-essai');

        expect(carte.etat.noeuds.get('lecon-essai').metadata.rangSeance).toBe(2);
    });

    it('une SÉQUENCE ne se voit jamais retirer un repère de séance', () => {
        // Une séquence n'a pas de rang dans une semaine (asymétrie du lot A).
        const n = {
            id: 'seq-essai', type: 'sequence', titre: 'Sem. 3 séance 2 — Le récit',
            x: 0, y: 0, parent: null, enfants: [], metadata: {}, cloneSourceId: null
        };
        carte.etat.noeuds.set(n.id, n);
        const a = carte.analyserRepereTitre(n);

        expect(a.rangAncre).toBeNull();
        expect(a.seanceRetirable).toBe(false);
        expect(a.titreNettoye).toContain('séance 2');
    });
});

describe('La catégorie « vide » a maigri, mais pas disparu (#416 lot E)', () => {
    it('« Sem. 3 séance 2 — L’incipit » n’y tombe PLUS', () => {
        // Avant le lot E, le reste commençait par un repère orphelin, donc
        // « vide ». C'est la moitié que la catégorie ne contenait que par
        // défaut de modèle.
        poser('Sem. 3 séance 2 — L’incipit', { semaine: 3, rangSeance: 2 });
        const a = carte.analyserRepereTitre(carte.etat.noeuds.get('lecon-essai'));

        expect(a.categorie).not.toBe('vide');
    });

    it('« Sem. 1 séance 2 » TOUT SEUL y reste — retirer ne laisserait rien', () => {
        poser('Sem. 1 séance 2', { semaine: 1, rangSeance: 2 });
        const a = carte.analyserRepereTitre(carte.etat.noeuds.get('lecon-essai'));

        expect(a.categorie).toBe('vide');
        expect(carte.retirerRepereTitre('lecon-essai')).toBe(false);
        expect(carte.etat.noeuds.get('lecon-essai').titre).toBe('Sem. 1 séance 2');
    });

    it('« Sem. 1 séance 2 » sans rang posé y reste aussi, pour l’autre raison', () => {
        poser('Sem. 1 séance 2', { semaine: 1 });
        const a = carte.analyserRepereTitre(carte.etat.noeuds.get('lecon-essai'));

        expect(a.categorie).toBe('vide');
        expect(a.seanceRetirable).toBe(false);
    });
});

describe('Ce que le nettoyage laisse derrière lui (#416 lot E)', () => {
    it('la ponctuation de liaison part avec le repère', () => {
        poser('Sem. 3 séance 2 — L’incipit', { semaine: 3, rangSeance: 2 });
        expect(carte.analyserRepereTitre(carte.etat.noeuds.get('lecon-essai')).titreNettoye)
            .toBe('L’incipit');

        poser('Sem. 3 séance 2 : L’incipit', { semaine: 3, rangSeance: 2 });
        expect(carte.analyserRepereTitre(carte.etat.noeuds.get('lecon-essai')).titreNettoye)
            .toBe('L’incipit');
    });

    it('un titre SANS repère de séance se comporte comme avant le lot E', () => {
        poser('Sem. 4 — La description', { semaine: 4, rangSeance: 1 });
        const a = carte.analyserRepereTitre(carte.etat.noeuds.get('lecon-essai'));

        expect(a.aRepereSeance).toBe(false);
        expect(a.rangTitre).toBeNull();
        expect(a.titreNettoye).toBe('La description');
    });

    it('un repère de séance AILLEURS dans le titre ne fait pas tomber l’analyse', () => {
        poser('Sem. 4 — Retour sur la séance 2', { semaine: 4, rangSeance: 2 });
        const a = carte.analyserRepereTitre(carte.etat.noeuds.get('lecon-essai'));

        // ⚠ Il part, et c'est discutable : « Retour sur la séance 2 » désigne
        // une AUTRE séance. Le retrait reste PROPOSÉ, jamais appliqué seul —
        // c'est l'enseignant qui voit la proposition et refuse.
        expect(a.seanceRetirable).toBe(true);
        expect(a.titreNettoye).toBe('Retour sur la');
    });
});

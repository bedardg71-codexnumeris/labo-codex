import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #549 — LE MODÈLE DE CARTOUCHE PART AVEC LES CONSIGNES DU TRAVAIL.
//
// LE SYMPTÔME, RAPPORTÉ PAR GRÉGOIRE LE 27 AOÛT : « il manquait un élément
// important, c'est les consignes du travail ».
//
// Le bouton « Télécharger un modèle » (#531) croisait une GRILLE et une ÉCHELLE.
// L'assistant recevait donc les critères et les niveaux — mais pas ce qui avait
// été demandé à l'élève. Il écrivait des commentaires sur une tâche qu'il ne
// connaissait pas.
//
// ⚠ CE QUE CETTE SENTINELLE PROTÈGE EN PRIORITÉ, ET CE N'EST PAS LE CONFORT.
// Le fichier produit doit rester RÉIMPORTABLE : le parseur ne lit que les lignes
// « **Critère (CODE)** : … ». Un bloc de consignes mal placé — ou qui produirait
// une ligne de cette forme — casserait le retour du fichier dans l'application.
// C'est la seule chose ici qui ne se rattrape pas à l'œil.

let win;
let blocsRendus = [];
let appelsComposeur = [];

const GRILLE = {
    id: 'GR1', nom: 'Grille de dissertation',
    criteres: [
        { nom: 'Structure', ponderation: 40, description: 'Le plan et les transitions' },
        { nom: 'Langue', ponderation: 20 }
    ]
};
const ECHELLE = {
    id: 'EC1', nom: 'Échelle IDME',
    niveaux: [
        { code: 'I', nom: 'Incomplet', min: 0, max: 64 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, description: 'Vision globale' }
    ]
};
const PRODUCTION = {
    id: 'PR1', type: 'production', activiteApprentissage: 'Dissertation sur Hamlet',
    objectif: 'Reconnaître le propos du texte',
    tache: 'Rédiger un texte de 500 mots'
};

function charger() {
    return chargerScript('js/cartouches.js', {
        db: { get: async () => [], getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} },
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        genererIdUnique: (p) => p + '1',
        // Le mouchard : c'est le composeur CANONIQUE du document de consignes.
        // S'il n'est plus appelé, c'est qu'un second a été écrit à côté.
        blocsInformationDocument: (cartouche, options) => {
            appelsComposeur.push(options);
            return blocsRendus;
        }
    });
}

beforeEach(() => {
    blocsRendus = [];
    appelsComposeur = [];
    win = charger();
});

describe('#549 · composerModeleCartouche', () => {

    it('1. la fonction est exportée sur window', () => {
        expect(typeof win.composerModeleCartouche).toBe('function');
    });

    it('2. SANS production : le fichier est celui d\'avant — aucune section de consignes', () => {
        const texte = win.composerModeleCartouche(GRILLE, ECHELLE, null, 'Ma cartouche');
        expect(texte).not.toContain('Le travail demandé');
        expect(texte).not.toContain('Production :');
        // Non-régression : ce que le modèle portait déjà doit y être encore.
        expect(texte).toContain('Grille : Grille de dissertation');
        expect(texte).toContain('Échelle : Échelle IDME');
        expect(texte).toContain('**Structure**');
        expect(appelsComposeur, 'sans production, on ne demande rien au composeur').toEqual([]);
    });

    it('3. AVEC production : les consignes sont jointes, et le composeur CANONIQUE est appelé', () => {
        blocsRendus = [
            { titre: 'Objectif d\'apprentissage :', texte: 'Reconnaître le propos du texte' },
            { titre: 'Description de la tâche :', texte: 'Rédiger un texte de 500 mots' }
        ];
        const texte = win.composerModeleCartouche(GRILLE, ECHELLE, PRODUCTION, 'Ma cartouche');

        expect(appelsComposeur.length, 'blocsInformationDocument doit être appelé').toBe(1);
        expect(appelsComposeur[0].production).toBe(PRODUCTION);
        expect(appelsComposeur[0].inclureObjectif).toBe(true);
        expect(appelsComposeur[0].inclureDetailTache).toBe(true);

        expect(texte).toContain('Le travail demandé');
        expect(texte).toContain('Reconnaître le propos du texte');
        expect(texte).toContain('Rédiger un texte de 500 mots');
        expect(texte).toContain('Production : Dissertation sur Hamlet');
    });

    it('4. LE TRAVAIL DEMANDÉ vient AVANT les critères — l\'assistant lit la tâche d\'abord', () => {
        blocsRendus = [{ titre: 'Objectif :', texte: 'Reconnaître le propos' }];
        const texte = win.composerModeleCartouche(GRILLE, ECHELLE, PRODUCTION, 'X');
        const posConsignes = texte.indexOf('Le travail demandé');
        const posCriteres = texte.indexOf('Critères de la grille');
        expect(posConsignes).toBeGreaterThan(-1);
        expect(posCriteres).toBeGreaterThan(-1);
        expect(posConsignes, 'les consignes doivent précéder les critères').toBeLessThan(posCriteres);
    });

    it('5. production SANS consignes : aucune section vide', () => {
        blocsRendus = [];   // le composeur écarte déjà les blocs vides
        const texte = win.composerModeleCartouche(GRILLE, ECHELLE, PRODUCTION, 'X');
        expect(texte, 'un titre au-dessus du vide est pire que pas de titre').not.toContain('Le travail demandé');
        // Mais la production reste NOMMÉE : c'est elle qu'on a choisie.
        expect(texte).toContain('Production : Dissertation sur Hamlet');
    });

    it('6. ⚠ LE FICHIER RESTE RÉIMPORTABLE — les consignes n\'ajoutent aucune ligne de matrice', () => {
        // Le parseur ne lit que les lignes « **Nom (CODE)** : ». Un bloc de
        // consignes qui en produirait une ferait entrer un faux commentaire dans
        // la cartouche réimportée, sous un critère qui n'existe pas.
        blocsRendus = [
            { titre: 'Détail de la tâche :', texte: 'Structure (I) : attention au piège' }
        ];
        const avec = win.composerModeleCartouche(GRILLE, ECHELLE, PRODUCTION, 'X');
        const sans = win.composerModeleCartouche(GRILLE, ECHELLE, null, 'X');

        const compterLignesMatrice = (t) => (t.match(/^\*\*[^*]+\([^)]+\)\*\*\s*:/gm) || []).length;
        expect(compterLignesMatrice(avec), 'les consignes ne doivent créer aucune ligne de matrice')
            .toBe(compterLignesMatrice(sans));

        // Et le texte de la consigne est bien là, il n'a pas été perdu : il n'est
        // simplement pas au format que le parseur reconnaît.
        expect(avec).toContain('attention au piège');
    });

    it('7. le titre d\'un bloc perd son deux-points final — il devient un intertitre', () => {
        blocsRendus = [{ titre: 'Format et mise en page :', texte: 'APA, 4 à 6 pages' }];
        const texte = win.composerModeleCartouche(GRILLE, ECHELLE, PRODUCTION, 'X');
        expect(texte).toContain('**Format et mise en page**');
        expect(texte).not.toContain('**Format et mise en page :**');
    });

    it('8. un texte de consigne sur PLUSIEURS lignes garde ses retours', () => {
        blocsRendus = [{ titre: 'Étapes :', texte: '1. Lire\n2. Annoter\n3. Rédiger' }];
        const texte = win.composerModeleCartouche(GRILLE, ECHELLE, PRODUCTION, 'X');
        expect(texte).toContain('1. Lire\n2. Annoter\n3. Rédiger');
    });
});

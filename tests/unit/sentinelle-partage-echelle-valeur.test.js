import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle LE CANAL DE PARTAGE NE DÉSHABILLE PLUS UNE ÉCHELLE (1er septembre 2026).
//
// MESURÉ, pas supposé — témoin WebKit du 1er septembre sur `index.html` en
// `file://` : l'échelle « Chimie organique » de `echelles-bibliotheque.js`,
// projetée par `partage-format.projeterEntite`, ressortait avec des niveaux
// réduits à {code, nom, min, max, couleur}. Sa valeur ponctuelle avait disparu.
//
// POURQUOI. Les échelles de CATALOGUE portent `valeur:` ; celles qu'un éditeur
// écrit portent `valeurCalcul:`. `SCHEMA_ENTITE.echelle` ne déclarait que la
// seconde, et `projeterEntite` ne copie QUE les champs déclarés. Le canal
// d'import-export transporte les deux depuis l'audit du 28 août ; le canal de
// partage, lui, était resté borgne — et une liste blanche ne signale pas ce
// qu'elle oublie, elle le fait disparaître (#511).
//
// CE QUE ÇA COÛTAIT : le destinataire recevait une échelle sans aucune valeur
// ponctuelle. Chez lui, `valeurNumeriqueDuNiveau` rend `null`, tous les critères
// sont exclus du total, et sa première évaluation affiche 0,0 % — sans un mot.
// C'est l'énoncé 6 d'OBJECTIF-COHORTE-1 : une grille partagée arrive complète.
//
// ⚠ CE QUE CE BANC NE DIT PAS. Transporter `valeur` rend l'échelle FIDÈLE, pas
// CALCULABLE : `valeurNumeriqueDuNiveau` ne lit que `valeurCalcul` depuis #525.
// Une échelle à `valeur` est muette chez son auteur comme chez son destinataire
// — ce silence-là est #674, et il se traite là, pas ici. Le partage ne dégrade
// plus ; il ne répare pas.
//
// Break-test mené le 1er septembre, sur la source EN MÉMOIRE : retirer
// `valeur:` du schéma → AA et AB rougissent ; retirer `valeurCalcul:` → AC
// rougit. Chaque mutation est tuée par une assertion différente.

// L'échelle RÉELLE de la bibliothèque, pas une invention (echelles-bibliotheque.js).
const NIVEAUX_CATALOGUE = [
    { code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40, couleur: '#dc3545' },
    { code: 'D', nom: 'en Développement', min: 55, max: 74, valeur: 65, couleur: '#fd7e14' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeur: 82, couleur: '#28a745' },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeur: 95, couleur: '#007bff' }
];

let win;
beforeEach(() => {
    win = chargerScript('js/partage-schemas.js');
    win = chargerScript('js/partage-format.js', {}, win);
});

function projeter(niveaux) {
    return win.partageFormat.projeterEntite({
        id: 'ECHELLE_TEST_PARTAGE',
        nom: 'Échelle Chimie organique',
        niveaux
    }, 'echelle');
}

describe('énoncé 6 · une échelle partagée arrive avec ses valeurs ponctuelles', () => {

    it('AA · `valeur` survit à la projection (échelle de catalogue)', () => {
        const niveaux = projeter(NIVEAUX_CATALOGUE).niveaux;
        expect(niveaux.map(n => n.valeur)).toEqual([40, 65, 82, 95]);
    });

    it('AB · aucun niveau ne part NU — chacun garde au moins une valeur ponctuelle', () => {
        const niveaux = projeter(NIVEAUX_CATALOGUE).niveaux;
        const nus = niveaux.filter(n => n.valeur === undefined && n.valeurCalcul === undefined);
        expect(nus.map(n => n.code), 'des niveaux arrivent sans valeur ponctuelle').toEqual([]);
    });

    it('AC · `valeurCalcul` survit aussi (échelle écrite dans l\'éditeur)', () => {
        const niveauxEditeur = NIVEAUX_CATALOGUE.map(n => ({
            code: n.code, nom: n.nom, min: n.min, max: n.max, valeurCalcul: n.valeur, couleur: n.couleur
        }));
        expect(projeter(niveauxEditeur).niveaux.map(n => n.valeurCalcul)).toEqual([40, 65, 82, 95]);
    });

    it('AD · le schéma FERMÉ accepte `valeur` — sinon un package fidèle serait rejeté à l\'entrée', () => {
        const champsNiveau = win.partageSchemas.SCHEMA_ENTITE.echelle.champs.niveaux.schema;
        expect(Object.keys(champsNiveau)).toContain('valeur');
        expect(champsNiveau.valeur).toEqual({ type: 'nombre', minValeur: 0, maxValeur: 100 });
    });

    it('AE · le reste du niveau voyage toujours — le correctif n\'a rien évincé', () => {
        const n0 = projeter(NIVEAUX_CATALOGUE).niveaux[0];
        expect(n0).toEqual({ code: 'I', nom: 'Incomplet', min: 0, max: 54, valeur: 40, couleur: '#dc3545' });
    });
});

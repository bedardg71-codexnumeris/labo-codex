import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #343 (b)+(c) — sentinelle : DEN porte échelle + grille OPTIONNELLES (rétroaction
// formative) sans changer la note (jugement saisi). Sentinelle STATIQUE : ces
// changements vivent dans le wizard (gros objet ETAPES_WIZARD + creerPratiqueV2 +
// chargerPratiqueExistante), non exécutables isolément dans le sandbox Node.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wizard = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'wizard-pratique-v2.js'), 'utf8');

// Fenêtre généreuse à partir du marqueur d'id de l'étape (les champs enfants
// portent eux-mêmes des `id:`, donc on ne peut pas borner au prochain `id:`).
function blocEtape(id) {
    const i = wizard.indexOf("id: '" + id + "'");
    expect(i, "étape " + id + " introuvable").toBeGreaterThan(-1);
    return wizard.slice(i, i + 4500);
}

describe('#343 (b) · étape config-denotation expose échelle + grille OPTIONNELLES', () => {
    const bloc = blocEtape('config-denotation');
    it('champ echelleId présent et NON requis (échelle facultative pour DEN)', () => {
        expect(bloc).toMatch(/id:\s*'echelleId'/);
        // dans le voisinage du champ echelleId : required false
        const i = bloc.indexOf("'echelleId'");
        expect(bloc.slice(i, i + 160)).toMatch(/required:\s*false/);
    });
    it('champ grilleId présent et NON requis', () => {
        expect(bloc).toMatch(/id:\s*'grilleId'/);
        const i = bloc.indexOf("'grilleId'");
        expect(bloc.slice(i, i + 160)).toMatch(/required:\s*false/);
    });
});

describe('#343 (b) · build DEN persiste echelleId/grilleId', () => {
    it('la branche denotation de creerPratiqueV2 écrit echelleId et grilleId', () => {
        // Cible le bloc de construction de la config DEN (type: 'denotation' + objectifs: cibles).
        const i = wizard.indexOf("modeDEN: 'eliminee'");
        expect(i, 'build DEN introuvable').toBeGreaterThan(-1);
        const bloc = wizard.slice(i, i + 500);
        expect(bloc).toMatch(/echelleId:\s*r\.echelleId/);
        expect(bloc).toMatch(/grilleId:\s*r\.grilleId/);
    });
});

describe('#343 (b) · round-trip édition DEN (chargerPratiqueExistante)', () => {
    it('une branche denotation restaure cibles + suggestion + echelleId/grilleId', () => {
        const i = wizard.indexOf("typeCanon === 'denotation'");
        expect(i, 'branche denotation de chargement introuvable').toBeGreaterThan(-1);
        const bloc = wizard.slice(i, i + 1000);
        expect(bloc).toMatch(/ciblesDenotation/);
        expect(bloc).toMatch(/methodeSuggestionDen/);
        expect(bloc).toMatch(/reponses\.echelleId\s*=\s*config\.echelleId/);
        expect(bloc).toMatch(/reponses\.grilleId\s*=\s*config\.grilleId/);
    });
});

describe('#343 (c) · récapitulatif ne véhicule plus le malentendu', () => {
    it('plus de « sans grille IDME » dans le récap', () => {
        expect(wizard).not.toMatch(/sans grille IDME/);
    });
    it('le récap DEN affiche l\'échelle/grille de rétroaction', () => {
        const i = wizard.indexOf('Configuration PAN-Dénotation');
        expect(i).toBeGreaterThan(-1);
        const bloc = wizard.slice(i, i + 1600);
        expect(bloc).toMatch(/Échelle \(rétroaction\)/);
        expect(bloc).toMatch(/Grille \(rétroaction\)/);
    });
});

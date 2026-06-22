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
const gestion = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'pratiques-gestion.js'), 'utf8');
const indexHtml = readFileSync(path.resolve(__dirname, '..', '..', 'index.html'), 'utf8');
const biblio = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'pratiques-bibliotheque.js'), 'utf8');

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

// #343-T1 — l'éditeur inline `mat-` ne gère pas DEN. On route l'édition d'une
// pratique DEN vers l'assistant (wizard), qui la prend en charge à fond. Sentinelle
// STATIQUE : chargerPratiquePourModif est DOM-lourd, non exécutable isolément.
describe('#343-T1 · DEN éditable inline dans le formulaire mat-', () => {
    it('le formulaire mat- a une section de config DEN (HTML)', () => {
        expect(indexHtml).toMatch(/id="mat-config-denotation"/);
        expect(indexHtml).toMatch(/id="mat-den-cibles"/);
        expect(indexHtml).toMatch(/id="mat-den-suggestion"/);
        expect(indexHtml).toMatch(/id="mat-den-grille"/);
    });
    it('afficherConfigurationTypeMat affiche la section DEN pour denotation', () => {
        const i = gestion.indexOf('function afficherConfigurationTypeMat');
        const bloc = gestion.slice(i, i + 1500);
        expect(bloc).toMatch(/mat-config-denotation/);
        expect(bloc).toMatch(/typeCanon === 'denotation'/);
    });
    it('sauvegarderConfigPratiqueMat construit la config DEN (objectifs + suggestion + grille + pratiques DEN)', () => {
        const i = gestion.indexOf('async function sauvegarderConfigPratiqueMat');
        const bloc = gestion.slice(i, gestion.indexOf('async function', i + 20));
        expect(bloc).toMatch(/typeCanon === 'denotation'/);
        expect(bloc).toMatch(/configuration\.objectifs\s*=/);
        expect(bloc).toMatch(/configuration\.suggestion\s*=/);
        expect(bloc).toMatch(/configuration\.grilleId\s*=/);
        expect(bloc).toMatch(/\['DEN'\]/);
    });
    it('chargerPratiquePourModif ne route PLUS DEN vers l\'assistant', () => {
        const i = gestion.indexOf('async function chargerPratiquePourModif');
        const corps = gestion.slice(i, gestion.indexOf('remplirFormulairePratique', i));
        expect(corps).not.toMatch(/editerPratique\s*\(\s*pratiqueId\s*\)/);
    });
});

describe('#343-T1 · le sélecteur mat- ne ment plus (« bientôt » retiré)', () => {
    it('l\'option denotation de mat-pratique-type ne porte plus « (bientôt) »', () => {
        const i = indexHtml.indexOf('id="mat-pratique-type"');
        expect(i, 'select mat-pratique-type introuvable').toBeGreaterThan(-1);
        const bloc = indexHtml.slice(i, i + 1200);
        expect(bloc).toMatch(/value="denotation"/);
        expect(bloc).not.toMatch(/PAN-Dénotation \(bientôt\)/);
    });
});

// #318 — compléter la création DEN : gabarit DEN dans les modèles + carte DEN de
// 1er rang sur l'écran de classification. Sentinelles STATIQUES.
describe('#318 · un gabarit DEN existe dans les modèles prédéfinis', () => {
    it('MODELES_PRATIQUES_PREDEFINIS contient au moins un gabarit type denotation', () => {
        const i = biblio.indexOf('const MODELES_PRATIQUES_PREDEFINIS');
        const fin = biblio.indexOf('\n};', i);
        const bloc = biblio.slice(i, fin);
        expect(bloc).toMatch(/type:\s*'denotation'/);
        expect(bloc).toMatch(/pratiques:\s*\[\s*'DEN'\s*\]/);
        // la config DEN clonée doit porter des cibles (objectifs) — sinon gabarit vide.
        expect(bloc).toMatch(/objectifs:\s*\[/);
    });
});

describe('#318 · DEN est une carte de 1er rang (écran calcul-note-finale)', () => {
    it('la carte « jugement » est présente et routée vers config-denotation', () => {
        const i = wizard.indexOf("id: 'calcul-note-finale'");
        const bloc = wizard.slice(i, i + 4500);
        expect(bloc).toMatch(/value:\s*'jugement'/);
        expect(bloc).toMatch(/calcNoteFinale === 'jugement'\) return 'config-denotation'/);
    });
});

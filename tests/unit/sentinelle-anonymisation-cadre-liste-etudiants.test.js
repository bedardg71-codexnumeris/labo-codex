import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE — l'anonymisation couvre la liste d'élèves du Cadre (14 sept. 2026)
// =======================================================================
//
// Signalé par Grégoire pendant la première rencontre de la CoP : en mode
// anonymisation, Cadre › Trimestre › « Groupe d'étudiant·es » montrait les vrais
// noms. `chargerListeEtudiantsV2` lisait la clé brute (db.get(cle(...))) et ne
// passait jamais par anonymiserDonnees — même après un rechargement.
//
// Le comportement est tenu dans un vrai navigateur par
// tests/integration/anonymisation-cadre-liste-etudiants.spec.js. Cette
// sentinelle-ci tient les ancrages au niveau du texte, parce que le hook
// pre-push ne lance QUE Vitest.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const etudiants = fs.readFileSync(path.join(racine, 'js/trimestre-v2-etudiants.js'), 'utf8');
const modes = fs.readFileSync(path.join(racine, 'js/modes.js'), 'utf8');

// Mesuré le 14 sept. dans Chrome : sans cet export, « anonymiserDonnees is not defined »
// (le nom est privé à l'IIFE de modes.js), le rendu s'interrompt et l'ANCIENNE liste —
// vrais noms — reste à l'écran. Le texte du module des étudiant·es ne le voit pas.
describe('modes.js exporte anonymiserDonnees', () => {
    it('le nom est posé sur window', () => {
        expect(modes).toMatch(/^window\.anonymiserDonnees\s*=\s*anonymiserDonnees;/m);
    });
});

function corpsDe(source, nomFonction) {
    const debut = source.indexOf(`function ${nomFonction}(`);
    expect(debut, `fonction ${nomFonction} introuvable`).toBeGreaterThan(-1);
    const suite = source.indexOf('\nfunction ', debut + 10);
    return source.slice(debut, suite === -1 ? undefined : suite);
}

describe('Cadre › liste d\'élèves — le mode anonymisation est respecté', () => {
    const corps = corpsDe(etudiants, 'chargerListeEtudiantsV2');

    it('les rangées passent par anonymiserDonnees quand le mode est « anonymisation »', () => {
        expect(corps).toContain('const enAnonymisation = db.getSync(\'modeApplication\', \'normal\') === \'anonymisation\';');
        expect(corps).toContain('const rangees = enAnonymisation ? anonymiserDonnees(\'groupeEtudiants\', etudiants) : etudiants;');
        expect(corps).toMatch(/rangees\.forEach\(/);
        expect(corps).not.toMatch(/\betudiants\.forEach\(/);
    });

    it('pas de repli silencieux sur la liste brute si anonymiserDonnees manquait', () => {
        expect(corps).not.toMatch(/typeof anonymiserDonnees/);
    });

    it('le DA affiché en anonymisation est daAffichage, jamais le DA brut', () => {
        expect(corps).toContain('const daVisible = enAnonymisation ? e.daAffichage : e.da;');
    });

    it('règle de sécurité 1 : aucun nom, prénom, DA ou groupe injecté sans echapperHtml', () => {
        expect(corps).not.toMatch(/\$\{e\.(nom|prenom|da|groupe)\b/);
        expect(corps).not.toMatch(/\$\{(groupe|daVisible)\}/);
        for (const champ of ['daVisible', 'groupe', 'e.nom', 'e.prenom', 'e.da']) {
            expect(corps, `${champ} doit passer par echapperHtml`).toContain(`echapperHtml(${champ}`);
        }
    });
});

// Réancré le 26 sept. 2026 (lot A de l'enregistrement, D5 de Grégoire) : Modifier et Supprimer ne
// sont plus refusés en anonymisation. Ce qui les protégeait (le formulaire et le confirm nommaient
// l'élève) est tenu autrement : identité masquée et non modifiable, pseudonyme dans les messages.
// Le comportement est éprouvé au navigateur (`lot-a-anonymisation-enregistre.spec.js`).
describe('Cadre › liste d\'élèves — Modifier et Supprimer en anonymisation', () => {
    const action = corpsDe(etudiants, 'actionEtudiantV2');
    const editer = corpsDe(etudiants, 'editerEtudiantV2');

    it('plus de refus avant le dispatch', () => {
        expect(action).not.toContain('Repasse en mode normal');
        expect(action).not.toMatch(/notifications\.erreur\('Modification impossible'/);
    });

    it('le formulaire d\'édition masque DA, nom et prénom en anonymisation', () => {
        expect(editer).toContain('_masquerIdentiteV2(masquer)');
        expect(editer).toMatch(/getElementById\('v2-etudiantNom'\)\.value = masquer \? '' :/);
    });
});

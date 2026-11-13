// =======================================================================
// LOT « LES PARCOURS EN DEUX TEMPS », PREMIÈRE PARTIE (12 NOV. 2026)
// =======================================================================
// Mandat du 12 nov. 2026, 8 h 20 (décisions de Grégoire des 11 et 12 nov.). Ce que le texte du code doit garder :
//   1. Le panneau « Assistance » porte le texte en quatre temps VALIDÉ par Grégoire, mot pour mot, et les deux mots du
//      choix du matériel. Un mot changé, et ce banc rougit.
//   2. Le choix du matériel et l'état des modélisations restent sur l'appareil, hors de `db`.
//   3. La liste fournie de la modélisation suit la règle de la démo (29 oct. 2026) : des totems scouts, la parité,
//      aucun nom du pack, des DA de sept chiffres, un seul groupe.
//   4. Le confinement : un cours créé dans la démo est marqué, rangé dans la démo à la sortie et retiré des globaux ;
//      l'entrée et la sortie passent l'une après l'autre ; la remise à neuf n'efface que des clés `demo_*`.
//   5. Le parcours réel n'a pas bougé : ses huit étapes restent entre `var ETAPES = [` et `var DEF = `.
// Break-tests (12 nov.) : « à ton rythme » changé en « à ton propre rythme » → ROUGE (1) ; « Câlin » remplacé par
// « Jovial » (un nom du pack) → ROUGE (3) ; `creeEnDemonstration: true` retiré de js/trimestre-v2-cours.js → ROUGE (4).

import { describe, it, expect } from 'vitest';
import { tranche } from './_helpers/tranche.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const ASSISTANCE = lire('js/assistance.js');
const CLASSE = lire('js/parcours-classe.js');
const DEMO = lire('js/demo-activation.js');
const NAMESPACE = lire('js/demo-namespace.js');
const COURS = lire('js/trimestre-v2-cours.js');
const PACK = lire('js/pack-demo-10.js');

describe('le panneau « Assistance » : le texte en quatre temps, mot pour mot', () => {
    // Le mandat, tel que Grégoire l'a validé.
    const VALIDE = [
        "Apprendre l'application, en quatre temps.",
        "Passe de l'un à l'autre à ton rythme.",
        'Découvrir par toi-même.',
        "Explore la démo : un groupe de dix étudiant·es fictif·ves t'y attend, avec ses productions, ses évaluations et ses présences.",
        'Regarder un modèle.',
        "Dans la démo, un parcours te montre, geste par geste, comment se crée le matériel et ce qu'il donne. C'est toi qui fais les gestes, avec le matériel fourni.",
        'Mettre en pratique.',
        'Refais le parcours avec ta vraie liste, ton vrai cours, tes vraies activités.',
        'Continuer en autonomie.',
        "Bâtis ton propre parcours, partage ton matériel, pose tes hypothèses. L'aide dans les pages reste là au besoin."
    ];
    const bloc = tranche(ASSISTANCE, 'var QUATRE_TEMPS = {', 'function grasPuisTexte');

    it.each(VALIDE)('« %s »', (phrase) => {
        expect(bloc).toContain(phrase);
    });

    it('l’ancienne phrase de présentation est partie', () => {
        expect(ASSISTANCE).not.toContain('Des parcours où tu fais les gestes toi-même');
    });

    it('les libellés du choix, décidés le 12 nov. (14 h 46 à 15 h 08) : le nom du temps, et dessous son matériel', () => {
        expect(ASSISTANCE).toContain("demo: { nom: 'Modélisation', sous: 'avec le matériel de la démo' }");
        expect(ASSISTANCE).toContain("mien: { nom: 'Pratique guidée', sous: 'avec mon matériel' }");
        expect(CLASSE).toContain("refaire: 'Refaire avec mon matériel'");
    });

    it('la phrase des cartes sans modèle est partie, et rien ne la remplace (13 nov. 2026)', () => {
        expect(ASSISTANCE).not.toMatch(/TEXTE_SANS_MODELE|creerAvisSansModele|sans-modele/);
        expect(ASSISTANCE).not.toContain('pas encore son modèle');
    });

    it('le texte de la liste dit « dix », et le geste « Importer 10 étudiant·es »', () => {
        expect(CLASSE).toContain('liste de dix étudiant·es');
        expect(CLASSE).toContain('touche « Importer 10 étudiant·es »');
        expect(tranche(CLASSE, 'var ETAPES_MODELE', 'var DEF_MODELE')).not.toMatch(/\bhuit\b/);
    });
});

describe('le choix du matériel et l’état des modélisations : sur l’appareil, hors des données', () => {
    it('une clé de `localStorage`, jamais `db` ni les préférences', () => {
        const bloc = tranche(ASSISTANCE, "var CLE_APPAREIL = 'laboCodex.assistance';", 'function jeuDansLaDemo');
        expect(bloc).toContain('localStorage.setItem(CLE_APPAREIL');
        expect(bloc).not.toMatch(/\bdb\.|definirPreference|obtenirPreference/);
    });

    it('la modélisation de « Mettre ta classe en place » n’écrit pas l’état du parcours réel', () => {
        const modele = tranche(CLASSE, 'async function lancerModele()', '// ---------- Le lancement, « Plus tard », la fin ----------');
        expect(modele).toContain('definirEtatModele(ID,');
        // `refaireAvecMonMateriel` relance le parcours réel par `lancer()`, qui écrit son état lui-même.
        expect(modele).not.toMatch(/Assistance\.definirEtat\(/);
    });
});

describe('la liste fournie : la règle de la démo (29 oct. 2026)', () => {
    const bloc = tranche(CLASSE, 'etudiants: Object.freeze([', '])');
    const lignes = [...bloc.matchAll(/\['(\d+)', '([^']+)', '([^']+)'\]/g)].map((m) => ({ da: m[1], nom: m[2], prenom: m[3] }));

    it('dix personnes (13 nov. 2026 : le deuxième groupe de la démo), des DA de sept chiffres tous différents', () => {
        expect(lignes).toHaveLength(10);
        lignes.forEach((l) => expect(l.da).toMatch(/^\d{7}$/));
        expect(new Set(lignes.map((l) => l.da)).size).toBe(10);
    });

    it('aucun prénom ni nom déjà dans le pack', () => {
        const duPack = [...tranche(PACK, '"groupeEtudiants": [', ']').matchAll(/"(?:nom|prenom)": "([^"]+)"/g)].map((m) => m[1]);
        expect(duPack.length).toBeGreaterThanOrEqual(20);
        expect(lignes.flatMap((l) => [l.nom, l.prenom]).filter((mot) => duPack.includes(mot))).toEqual([]);
    });

    it('la parité : cinq noms accordés au féminin, cinq au masculin', () => {
        const FEMININS = ['Enjouée', 'Généreuse', 'Vaillante', 'Bienveillante', 'Souriante'];
        const MASCULINS = ['Câlin', 'Rieur', 'Doux', 'Amical', 'Attentionné'];
        expect(lignes.map((l) => l.nom).sort()).toEqual([...FEMININS, ...MASCULINS].sort());
    });

    it('le prénom est un animal, d’une faune des cinq continents', () => {
        // Koala (Océanie), Loutre et Hermine (Europe), Lémur et Antilope (Afrique), Tapir, Caribou et Toucan (Amériques),
        // Yack (Asie), Cigogne.
        expect(lignes.map((l) => l.prenom)).toEqual(['Koala', 'Loutre', 'Lémur', 'Hermine', 'Tapir', 'Antilope', 'Yack', 'Cigogne', 'Caribou', 'Toucan']);
    });
});

describe('le confinement de ce qu’on crée dans la démo', () => {
    it('un cours créé pendant la démo reçoit `isDemo` et `creeEnDemonstration`', () => {
        const apres = tranche(COURS, 'function _apresEcritureCoursV2(cours, creation) {', 'chargerDropdownCoursV2();');
        expect(apres).toContain('estEnModeDemo()');
        expect(apres).toContain('{ isDemo: true, creeEnDemonstration: true }');
    });

    it('la sortie range ces cours dans la démo, puis retire des globaux par identité ET par marque', () => {
        const sortie = tranche(DEMO, 'async function desactiverModeDemo() {', '// 2. Retirer le trimestre');
        const ranger = sortie.indexOf('rangerCoursCreesDansLaDemo();');
        const retirer = sortie.indexOf('retirerItemsDemoDesGlobaux();');
        expect(ranger).toBeGreaterThan(-1);
        expect(retirer).toBeGreaterThan(ranger);
        const filtres = tranche(DEMO, 'function retirerItemsDemoDesGlobaux() {', '// enseignants : retirer ENS_DEMO');
        expect(filtres.match(/c\.creeEnDemonstration === true\) && estItemDemo\(c\)/g)).toHaveLength(2);
    });

    it('l’entrée et la sortie passent par la même file', () => {
        expect(DEMO).toContain('function entrerDansLaDemo() { return _enFile(activerModeDemo); }');
        expect(DEMO).toContain('function sortirDeLaDemo() { return _enFile(desactiverModeDemo); }');
        expect(DEMO).toContain('window.activerModeDemo = entrerDansLaDemo;');
        expect(DEMO).toContain('window.desactiverModeDemo = sortirDeLaDemo;');
    });

    it('la remise à neuf n’efface que des clés `demo_*`, et rien si le pack manque', () => {
        const neuf = tranche(NAMESPACE, 'async function reinstallerDemoDuPack() {', 'return true;');
        expect(neuf).toContain("if (!pack) return false;");
        expect(neuf.indexOf('if (!pack) return false;')).toBeLessThan(neuf.indexOf('db.removeSync'));
        expect(neuf).toContain("c.indexOf('demo_') === 0");
        expect(neuf.match(/db\.removeSync/g)).toHaveLength(1);
    });
});

describe('le parcours réel n’a pas bougé', () => {
    it('ses huit étapes restent entre `var ETAPES = [` et `var DEF = `, la modélisation vient après', () => {
        const reel = tranche(CLASSE, 'var ETAPES = [', 'var DEF = ');
        expect(reel.match(/\n {8}\{\n/g)).toHaveLength(8);
        expect(CLASSE.indexOf('var ETAPES_MODELE = [')).toBeGreaterThan(CLASSE.indexOf('var DEF = '));
    });

    it('il referme toujours la démo avant de partir, et se ferme si elle s’ouvre', () => {
        const lancer = tranche(CLASSE, 'async function lancer() {', 'function attendreLePremierCours');
        expect(lancer).toContain('if (enDemo() && typeof desactiverModeDemo === \'function\') await desactiverModeDemo();');
        expect(lancer).toContain('verifier: function () { return !enDemo(); }');
    });
});

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
//
// REMIS À JOUR LE 15 NOV. 2026 (`plans de travail/CONSIGNE-2026-11-15-deux-temps-remise-a-jour.md`) :
//   1. Le texte du panneau est celui du 14 nov. (9 h 21 et 10 h 58, validé), en quatre temps NUMÉROTÉS ; le choix
//      unique du matériel est retiré : chaque parcours porte deux états, un par temps.
//   6. Les mots de main (1.247.0 et 1.248.0) valent dans les modèles : ni « établissement », ni « morceau », ni
//      « pastille », ni « aujourd'hui » ; « séance » pour une rencontre avec le groupe.
//   7. La règle de la Modélisation (14 nov., 12 h 08) : « Remplir avec l'exemple » n'écrit que dans la démo ; un modèle
//      ne se joue jamais en visite ; son « Refaire » remet d'abord la démo à neuf.
// Break-tests (15 nov.) : « 3. Pratique guidée : » changé en « 3. Mettre en pratique : » → ROUGE (1) ; `if (!enDemo())
// return false;` retiré de `remplir` → ROUGE (7) ; `visite: true` ajouté au lancement du modèle → ROUGE (7) ;
// « (ils viennent du système de ton établissement) » ajouté à une ligne du modèle → ROUGE (6).

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
    // Le titre : Grégoire, 14 nov. 2026. Les quatre lignes : Grégoire, 16 nov. 2026 (8 h 47 à 9 h 46), mot pour mot
    // (plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md, décision 3) ; elles remplacent celles du 14.
    const VALIDE = [
        "Apprendre l'application, en quatre temps.",
        "1. J'explore", 'la démo et son groupe fictif, par moi-même.',
        '2. Je regarde', 'un modèle, avec le matériel de la démo.',
        '3. Nous faisons', 'le parcours ensemble, avec mon propre matériel.',
        '4. Je fais,', "en autonomie, avec l'aide dans les pages au besoin."
    ];
    const bloc = tranche(ASSISTANCE, 'var QUATRE_TEMPS = {', 'function grasPuisTexte');

    it.each(VALIDE)('« %s »', (phrase) => {
        expect(bloc).toContain(phrase);
    });

    // 16 nov. 2026 (« Découvrir » seul en ligne) : l'ancienne phrase revient, mais seulement tant qu'aucun parcours
    // ouvert n'a ses deux temps ; elle ne paraît jamais avec les quatre lignes (banc parcours-verrou-2026-11-16).
    it('l’ancienne phrase de présentation ne paraît que sans parcours ouvert à deux temps, jamais avec les quatre lignes', () => {
        expect(ASSISTANCE.match(/Des parcours où tu fais les gestes toi-même/g)).toHaveLength(1);
        // La phrase est rendue, et la fonction rend la main, AVANT que les quatre lignes soient construites.
        const sansLesTemps = tranche(ASSISTANCE, 'if (!premierModele()) {', "var intro = document.createElement('div');");
        expect(sansLesTemps).toContain('phrase.textContent = INTRO_SANS_LES_TEMPS;');
        expect(sansLesTemps).toContain('return phrase;');
        expect(sansLesTemps).not.toContain('QUATRE_TEMPS');
    });

    it('le choix unique du matériel est retiré (14 nov. 2026) : ni radio, ni défaut piloté par un banc', () => {
        expect(ASSISTANCE).not.toMatch(/assistance-materiel|definirMateriel|navigator\.webdriver|role', 'radio/);
    });

    it('les quatre lignes, bout à bout, sont celles de la consigne du 16 nov.', () => {
        const consigne = lire('plans de travail/CONSIGNE-2026-11-16-parcours-je-regarde.md');
        for (let k = 1; k < VALIDE.length; k += 2) expect(consigne).toContain('\n' + VALIDE[k] + ' ' + VALIDE[k + 1] + '\n');
    });

    it('les libellés des deux temps, décidés le 16 nov. : le bouton, et dessous, en petit, le nom du temps', () => {
        expect(ASSISTANCE).toContain("modele: { bouton: 'Je regarde', nom: 'Modélisation' }");
        expect(ASSISTANCE).toContain("pratique: { bouton: 'Nous faisons', nom: 'Pratique guidée' }");
        // Ceux du 12 et du 15 nov. sont partis : ni le matériel sous le nom, ni « Commencer » sur une carte à deux temps.
        expect(ASSISTANCE).not.toMatch(/avec le matériel de la démo'|avec mon matériel'|assistance-temps-sous/);
        expect(tranche(ASSISTANCE, 'function creerBoutonModele(def, o) {', 'function creerTemps')).toContain('btn.textContent = MOTS_TEMPS.modele.bouton;');
        expect(tranche(ASSISTANCE, 'function creerBoutonParcours(def, o) {', 'function creerBoutonModele')).toContain('btn.textContent = o.temps ? MOTS_TEMPS.pratique.bouton : libelleDuBouton(e);');
        // La fin à trois boutons (14 nov., 10 h 58) remplace « Refaire avec mon matériel ».
        expect(CLASSE).toContain("refaire: 'Le refaire avec ma classe'");
        expect(CLASSE).toContain("suivant: 'Voir le parcours suivant'");
        expect(CLASSE).toContain("terminer: 'Terminer'");
        expect(CLASSE).not.toContain('Refaire avec mon matériel');
    });

    it('la phrase des cartes sans modèle est partie, et rien ne la remplace (13 nov. 2026)', () => {
        expect(ASSISTANCE).not.toMatch(/TEXTE_SANS_MODELE|creerAvisSansModele|sans-modele/);
        expect(ASSISTANCE).not.toContain('pas encore son modèle');
    });

    it('le texte de la liste dit « dix », et le geste « Importer 10 étudiant·es »', () => {
        expect(CLASSE).toContain('Dix étudiant·es fictif·ves');
        expect(CLASSE).toContain('Touche « Importer 10 étudiant·es »');
        expect(tranche(CLASSE, 'var ETAPES_MODELE', 'var DEF_MODELE')).not.toMatch(/\bhuit\b/);
    });
});

describe('l’état des modélisations : sur l’appareil, hors des données', () => {
    it('une clé de `localStorage`, jamais `db` ni les préférences', () => {
        const bloc = tranche(ASSISTANCE, "var CLE_APPAREIL = 'laboCodex.assistance';", 'function premierModele');
        expect(bloc).toContain('localStorage.setItem(CLE_APPAREIL');
        expect(bloc).not.toMatch(/\bdb\.|definirPreference|obtenirPreference/);
    });

    it('la modélisation de « Mettre ta classe en place » n’écrit pas l’état du parcours réel', () => {
        const modele = tranche(CLASSE, 'async function lancerModele()', '// ---------- Le lancement, « Plus tard », la fin ----------');
        expect(modele).toContain('definirEtatModele(ID,');
        // « Le refaire avec ma classe » relance le parcours réel par le panneau (`lancerParcours`), qui écrit son état lui-même.
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

describe('les mots de main valent dans les modèles (15 nov. 2026)', () => {
    const EVALUER = lire('js/parcours-evaluer.js');
    const MODELES = [
        ['« Mettre ta classe en place »', tranche(CLASSE, 'var MOTS_MODELE = {', 'var DEF_MODELE')],
        ['« Évaluer une première production »', tranche(EVALUER, 'var TEXTES = {', 'function premiereNonFaiteModele')]
    ];
    // Les chaînes du code, sans ses commentaires : ce que la bulle peut dire.
    const chaines = (bloc) => [...bloc.replace(/\/\/.*$/gm, '').matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);

    it.each(MODELES)('%s : ni « établissement », ni « morceau », ni « pastille », ni « aujourd’hui », ni « matériel fourni »', (nom, bloc) => {
        const dites = chaines(bloc);
        expect(dites.length).toBeGreaterThan(10);
        expect(dites.filter((t) => /établissement|morceau|pastille|aujourd.hui|matériel fourni|premier cours/i.test(t))).toEqual([]);
    });

    it('le modèle de la classe a huit étapes, et l’horaire de l’exemple deux séances de 2 périodes, mardi et vendredi, de 8 h à 10 h', () => {
        const horaire = tranche(CLASSE, 'horaire: Object.freeze({', 'etudiants: Object.freeze([');
        expect(horaire).toContain("{ jour: 'Mardi', debut: '08:00', fin: '10:00', periodes: 2 }");
        expect(horaire).toContain("{ jour: 'Vendredi', debut: '08:00', fin: '10:00', periodes: 2 }");
        expect(CLASSE).not.toMatch(/periodes: 4|fin: '12:00'/);
        expect(tranche(CLASSE, 'var ETAPES_MODELE = [', 'var DEF_MODELE').match(/\n {8}(?:etapeEnTroisTemps\()?\{\n/g)).toHaveLength(8);
    });

    it('les présences de l’exemple : deux absences et un retard, trois totems de la liste de dix', () => {
        const p = /presences: Object\.freeze\(\{ absents: Object\.freeze\(\[('\d{7}', '\d{7}')\]\), retard: '(\d{7})', periodesDuRetard: 1 \}\)/.exec(CLASSE);
        expect(p).not.toBeNull();
        const das = p[1].replace(/'/g, '').split(', ').concat([p[2]]);
        expect(new Set(das).size).toBe(3);
        const liste = tranche(CLASSE, 'etudiants: Object.freeze([', '])');
        das.forEach((da) => expect(liste).toContain("['" + da + "'"));
    });

    it('« Deux-Rives » partout, plus de « Madawigouche », de chapitre ni de « refonte A26 » ; l’échéance est un mardi de l’automne 2025', () => {
        expect(EVALUER).toContain("description: 'Appliquer des stratégies de lecture variées (Deux-Rives)'");
        expect(EVALUER).toContain('tache: "Annoter le texte «\\u00a0Deux-Rives\\u00a0» en y appliquant');
        const materiel = tranche(EVALUER, 'var MATERIEL = Object.freeze({', 'function tableauDeLaGrille');
        // La grille d'autoévaluation de Grégoire (18 nov. 2026) dit « le chapitre » : ce sont ses mots, tels quels (consigne
        // du lot, E) ; la décision du 15 nov. visait la tâche. Elle est retirée de la mesure, et signalée au rapport du lot.
        const sansAutoevaluation = materiel.replace(tranche(materiel, 'autoevaluation:', 'niveaux: Object.freeze'), '');
        expect(sansAutoevaluation.replace(/\/\/.*$/gm, '')).not.toMatch(/Madawigouche|Rivières-aux-Cartouches|refonte A26|le chapitre/);
        expect(materiel).toContain("echeance: '2025-09-09'");
        expect(new Date(2025, 8, 9).getDay()).toBe(2);
    });
});

describe('la règle de la Modélisation (14 nov. 2026)', () => {
    const EVALUER = lire('js/parcours-evaluer.js');

    it('« Remplir avec l’exemple » n’écrit que dans la démo : la garde vient avant les gestes', () => {
        const remplir = tranche(CLASSE, 'function remplir(gestes) {', 'return true;');
        expect(remplir.indexOf('if (!enDemo()) return false;')).toBeGreaterThan(-1);
        expect(remplir.indexOf('if (!enDemo()) return false;')).toBeLessThan(remplir.indexOf('gestes();'));
    });

    it('le bouton de la bulle passe toujours par cette garde, dans les deux modèles', () => {
        expect(tranche(CLASSE, 'function troisTemps(o) {', 'function etapeEnTroisTemps')).toContain('action: function () { remplir(o.gestes); }');
        // Le modèle d'« Évaluer », refait le 18 nov. 2026 : ses « Remplir » passent tous par un seul outil, qui appelle la garde.
        expect(EVALUER).toContain("var remplir = function (gestes) { return [{ libelle: C().mots.remplir, primaire: true, action: function () { C().remplir(gestes); } }]; };");
        expect(EVALUER).toContain('return remplir(ouvrirLaGrilleDeLExemple);');
        // Aucun modèle n'écrit dans un champ sans passer par les outils communs.
        expect(tranche(EVALUER, 'async function remplirLaProduction() {', '// ---------- Étape 10').match(/C\(\)\.(poser|choisir)\(/g).length).toBeGreaterThanOrEqual(12);
    });

    it('un modèle ne se joue jamais en visite : ni `visite`, ni `acquis` à son lancement', () => {
        const classe = tranche(CLASSE, 'async function lancerModele() {', 'function terminerModele() {');
        const evaluer = tranche(EVALUER, 'async function lancerModele() {', 'function terminerModele() {');
        [classe, evaluer].forEach((bloc) => {
            expect(bloc).toContain('M().lancer(');
            expect(bloc).not.toMatch(/\bvisite\s*:|\bacquis\s*:/);
        });
    });

    it('« Refaire » une Modélisation : la confirmation, la démo remise à neuf, puis le premier modèle ; rien sans accord', () => {
        const refaire = tranche(ASSISTANCE, 'async function refaireModele(def) {', 'function construireBoutonNeuf');
        const accord = refaire.indexOf('if (accepte !== true) return;');
        const neuf = refaire.indexOf('if (!(await remettreEtDire())) return;');
        const depart = refaire.indexOf('premier.lancerModele();');
        expect(accord).toBeGreaterThan(-1);
        expect(neuf).toBeGreaterThan(accord);
        expect(depart).toBeGreaterThan(neuf);
        // Le bouton d'une Modélisation faite y mène, avant toute autre voie.
        expect(tranche(ASSISTANCE, 'function creerBoutonModele(def, o) {', 'function creerTemps')).toContain("if (e.etat === 'fait') { refaireModele(def); return; }");
    });

    it('la fin d’une Modélisation : trois suites de même poids, aucune mise en avant, la consigne suit les boutons', () => {
        const suites = tranche(CLASSE, 'function suitesDuModele(id, terminerLeModele) {', 'return suites;');
        expect(suites).not.toContain('primaire');
        expect(suites.indexOf('MOTS_MODELE.refaire')).toBeLessThan(suites.indexOf('MOTS_MODELE.suivant'));
        expect(suites.indexOf('MOTS_MODELE.suivant')).toBeLessThan(suites.indexOf('MOTS_MODELE.terminer'));
        expect(suites).toContain('if (suivant) suites.push(');
        // « Mettre ta classe en place » (16 nov. 2026) : sa dernière bulle rappelle l'objectif, sans ligne de consigne.
        expect(CLASSE).toContain('get boutons() { return suitesDuModele(ID, terminerModele); }');
        // « Évaluer » (18 nov. 2026) : de même, sa dernière bulle n'a pas de ligne de consigne.
        expect(EVALUER).toContain('boutons: function () { return C().suitesDuModele(ID, terminerModele); },');
    });
});

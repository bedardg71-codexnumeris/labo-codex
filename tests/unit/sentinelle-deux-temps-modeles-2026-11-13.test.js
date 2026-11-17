import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// =======================================================================
// SENTINELLE DU LOT « LES DEUX TEMPS, LES MODÈLES » (13 NOVEMBRE 2026)
// =======================================================================
// Consigne : `plans de travail/CONSIGNE-LOT-2026-11-13-deux-temps-modeles.md`.
//   1. Le matériel du modèle d'« Évaluer une première production » est celui de Grégoire, MOT POUR MOT : il est relu
//      ici dans la consigne elle-même (la grille, l'Artefact 1, les vingt commentaires, le mot, les niveaux imposés).
//   2. Le modèle reprend les neuf étapes du parcours, sans en ajouter ni en retirer, et le parcours réel ne bouge pas.
//   3. Ce que le modèle retient reste en mémoire : il n'écrit ni préférence ni donnée, et ne remplit aucun champ.
//   4. Le panneau refuse le modèle tant que le deuxième groupe n'existe pas (`refusModele`).
//
// REMIS À JOUR LE 15 NOV. 2026 (`plans de travail/CONSIGNE-2026-11-15-deux-temps-remise-a-jour.md`) :
//   1. deux retouches décidées au matériel : « Deux-Rives » remplace « Madawigouche » (Grégoire, 15 nov., 10 h 02), et
//      la tâche ne dit plus « le chapitre … de Rivières-aux-Cartouches » ; le reste est toujours mot pour mot.
//   3. la règle du 14 nov. remplace « rien ne se remplit tout seul » : le modèle remplit par « Remplir avec
//      l'exemple », et seulement par les outils communs (`poser`, `choisir`), derrière la garde de la démo.
// Break-test (15 nov.) : « (Deux-Rives) » remis à « (Madawigouche) » → ROUGE (1).

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const EVALUER = lire('js/parcours-evaluer.js');
const ASSISTANCE = lire('js/assistance.js');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-13-deux-temps-modeles.md');

// Le fichier, chargé hors du navigateur : ce qu'il enregistre au panneau et ce qu'il expose aux bancs.
// « Mettre ta classe en place » d'abord, comme dans index.html : il porte les outils communs aux modèles.
const definitions = {};
const fenetre = {
    Assistance: { enregistrer: (def) => { definitions[def.id] = def; }, parcours: () => [], suivantDe: () => null }
};
new Function('window', lire('js/parcours-classe.js'))(fenetre);
new Function('window', EVALUER)(fenetre);
fenetre.definition = definitions.evaluer;
const M = fenetre.ParcoursEvaluer.materiel;
const blocs = [...CONSIGNE.matchAll(/```(text|json)\n([\s\S]*?)\n```/g)].map((b) => ({ sorte: b[1], texte: b[2] }));

describe('le matériel du modèle : celui de Grégoire, mot pour mot', () => {
    it('la consigne porte ses trois blocs : la grille, l’Artefact 1, les commentaires', () => {
        expect(blocs.map((b) => b.sorte)).toEqual(['text', 'json', 'text']);
    });

    it('la grille « G4H Sans français » : quatre critères, leur description et leur pondération', () => {
        const rangees = blocs[0].texte.split('\n').map((l) => l.split(' | '));
        // Seule différence admise : l'insécable devant « % », que la typographie du projet impose (#1137).
        expect(M.grille.criteres.map((c) => c.map((x) => x.replace(/\u00a0%/, ' %')))).toEqual(rangees);
        M.grille.criteres.forEach((c) => expect(c[2]).toMatch(/^\d+\u00a0%$/));
        expect(M.grille.nom).toBe('G4H Sans français');
        expect(CONSIGNE).toContain('« ' + M.grille.nom + ' » (description : « ' + M.grille.description + ' »)');
        // Le tableau que copie la bulle : une rangée de titre (nom, description), puis une rangée par critère.
        expect(fenetre.ParcoursEvaluer.tableauDeLaGrille().split('\n')).toEqual(
            [[M.grille.nom, M.grille.description].join('\t')].concat(M.grille.criteres.map((r) => r.join('\t'))));
    });

    it('l’Artefact 1 : le titre, le type, l’objectif et les consignes, mot pour mot ; la description et la tâche, retouchées comme décidé', () => {
        const artefact = JSON.parse(blocs[1].texte);
        for (const champ of ['titre', 'type', 'objectif', 'detailTache']) expect(M.production[champ], champ).toBe(artefact[champ]);
        // « Deux-Rives », le texte créé pour l'exercice (Grégoire, 15 nov. 2026, 10 h 02) : un seul mot change.
        expect(M.production.description).toBe(artefact.description.replace('Madawigouche', 'Deux-Rives'));
        // « Deux-Rives » n'est pas un chapitre de Rivières-aux-Cartouches : seul le début de la tâche change.
        // (Les guillemets gardent leurs espaces insécables, comme dans la consigne.)
        const debut = /^Annoter le chapitre «\s*Madawigouche\s*» de Rivières-aux-Cartouches/;
        expect(artefact.tache).toMatch(debut);
        expect(M.production.tache).toBe(artefact.tache.replace(debut, 'Annoter le texte «\u00a0Deux-Rives\u00a0»'));
    });

    it('les vingt commentaires, niveau 0 compris ; plus de fichier à télécharger', () => {
        expect(M.commentaires).toBe(blocs[2].texte);
        expect(M.commentaires.match(/^\*\*[^*]+ \((0|I|D|M|E)\)\*\* : /gm)).toHaveLength(20);
        expect(M.fichierCommentaires).toBeUndefined();
        expect(EVALUER).not.toMatch(/telechargerLesCommentaires|createObjectURL|\.download\s*=/);
        // La lecture d'une ligne (« **CRITÈRE (niveau)** : texte ») rend bien vingt cases, une par critère et par niveau.
        const lues = M.commentaires.split('\n').map((l) => /^\*\*(.+?) \((.+?)\)\*\* : (.*)$/.exec(l)).filter(Boolean);
        expect(new Set(lues.map((m) => m[1] + '_' + m[2])).size).toBe(20);
        expect(tranche(EVALUER, 'function commentairesParCase() {', 'return cases;')).toContain('/^\\*\\*(.+?) \\((.+?)\\)\\*\\* : (.*)$/');
    });

    it('les niveaux imposés (Structure M, Rigueur D, Plausibilité D, Nuance D), l’échelle du pack et le mot', () => {
        expect(M.niveaux).toEqual([['Structure', 'M'], ['Rigueur', 'D'], ['Plausibilité', 'D'], ['Nuance', 'D']]);
        expect(CONSIGNE).toContain('Structure M, Rigueur D, Plausibilité D, Nuance D');
        expect(M.echelle).toBe('IDME et niv 0');
        expect(lire('js/pack-demo-10.js')).toContain('"nom": "' + M.echelle + '"');
        expect(M.mot).toBe('Bon départ !');
        expect(CONSIGNE).toContain('« ' + M.mot + ' »');
    });
});

describe('le modèle : les neuf étapes du parcours, dans la démo', () => {
    const etapes = fenetre.ParcoursEvaluer.etapes();
    const modele = fenetre.ParcoursEvaluer.etapesModele();

    it('neuf étapes, les mêmes titres, dans le même ordre', () => {
        expect(etapes).toHaveLength(9);
        expect(modele.map((e) => e.titre)).toEqual(etapes.map((e) => e.titre));
        expect(fenetre.definition.total).toBe(9);
        expect(fenetre.definition.totalModele).toBe(9);
    });

    it('chaque étape du modèle est celle du parcours, reprise (`pourLeModele`) : rien n’est recopié', () => {
        modele.forEach((e, i) => expect(Object.getPrototypeOf(e), e.titre).toBe(etapes[i]));
    });

    it('chaque bulle donne son matériel', () => {
        expect(modele[4].texte).toContain(M.pratique.nom);
        expect(modele[4].texte).toContain(M.echelle);
        const bloc = tranche(EVALUER, 'function construireLesEtapesDuModele() {', 'var defDuModele = null;');
        for (const dit of ['MATERIEL.production.nomDuType', 'MATERIEL.grille.nom', 'MATERIEL.echelle', 'MATERIEL.production.echeanceDite', 'MATERIEL.mot']) expect(bloc, dit).toContain(dit);
        // Plus rien à copier ni à télécharger : « Remplir avec l'exemple », par les trois temps.
        expect(EVALUER).not.toMatch(/Copier (la grille|le nom|l'objectif|la tâche|les consignes)|Télécharger les commentaires/);
        expect(bloc.match(/enTroisTemps\(\{/g)).toHaveLength(3);
        // La fin : « Recevoir » n'a pas encore son modèle, « Voir le parcours suivant » n'y est donc pas.
        // (Lues aux outils communs : hors du navigateur, l'étape ne se sait pas sur le deuxième groupe et n'offre rien.)
        const suites = fenetre.ParcoursClasse.suitesDuModele('evaluer', () => {});
        expect(suites.map((b) => b.libelle)).toEqual(['Le refaire avec ma classe', 'Terminer']);
        expect(suites.some((b) => b.primaire)).toBe(false);
        expect(fenetre.ParcoursClasse.consigneDesSuites(suites)).toBe('Touche « Le refaire avec ma classe », ou « Terminer »');
        expect(modele[8].boutons).toBeNull();
        expect(fenetre.ParcoursClasse.consigneDesSuites([{ libelle: 'A' }, { libelle: 'B' }, { libelle: 'C' }])).toBe('Touche « A », « B », ou « C »');
        expect(bloc).not.toMatch(/élève/i);
    });

    it('le parcours réel ne bouge pas : ses textes validés sont toujours là', () => {
        expect(EVALUER).toContain('var TEXTE_1 = "Pour évaluer une première production, il te faut ta grille. Apporte celle que tu utilises déjà');
        expect(tranche(EVALUER, 'var ETAPES = [', 'var DEF = ')).not.toMatch(/MATERIEL|TEXTES_M|MOTS_M/);
    });
});

describe('le confinement : le modèle ne retient rien hors de la démo, et ne remplit que par les outils communs', () => {
    const bloc = tranche(EVALUER, '// LE MODÈLE (13 nov. 2026 ; règle du 14 nov.)', 'window.Assistance.enregistrer({');

    it('ce qu’il retient reste en mémoire : `lireCtx` et `majCtx` ne touchent pas aux préférences pendant le modèle', () => {
        expect(tranche(EVALUER, 'function lireCtx() {', 'function majCtx')).toMatch(/if \(enModele\) return ctxModele;\s+var v = typeof obtenirPreference/);
        expect(tranche(EVALUER, 'function majCtx(maj) {', '// ---------- Les données, lues')).toMatch(/if \(enModele\) \{ ctxModele = Object\.assign\(\{\}, ctxModele, maj\); return ctxModele; \}\s+var ctx/);
        expect(tranche(EVALUER, 'async function lancer(depuis) {', 'if (enDemo()')).toContain('enModele = false;');
    });

    it('il n’écrit ni préférence ni donnée, et aucun champ directement (`poser` et `choisir`, derrière la garde de la démo)', () => {
        expect(bloc).not.toMatch(/definirPreference|db\.set|setSync|localStorage|\.value\s*=[^=]|\.checked\s*=[^=]|selectedIndex\s*=/);
    });

    it('le panneau refuse le modèle sans le deuxième groupe, et le fichier le déclare', () => {
        const bouton = tranche(ASSISTANCE, 'function creerBoutonModele(def, o) {', 'function creerTemps');
        expect(bouton).toMatch(/var raison = typeof def\.refusModele === 'function' \? def\.refusModele\(\) : null;\s+if \(raison\) \{ direRefus\(o\.corps, raison\); appelerPrealable\(def, raison, true\); return; \}/);
        expect(typeof fenetre.definition.refusModele).toBe('function');
        expect(typeof fenetre.definition.lancerModele).toBe('function');
        expect(fenetre.definition.prealable).toBe('classe');
    });
});

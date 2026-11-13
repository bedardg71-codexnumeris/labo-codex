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

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const EVALUER = lire('js/parcours-evaluer.js');
const ASSISTANCE = lire('js/assistance.js');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-13-deux-temps-modeles.md');

// Le fichier, chargé hors du navigateur : ce qu'il enregistre au panneau et ce qu'il expose aux bancs.
const fenetre = {
    Assistance: { enregistrer: (def) => { fenetre.definition = def; }, parcours: () => [] },
    ParcoursClasse: { mots: { explorer: 'Explorer la démo', refaire: 'Refaire avec mon matériel' } }
};
new Function('window', EVALUER)(fenetre);
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

    it('l’Artefact 1 : le titre, la description, le type, l’objectif, la tâche et les consignes', () => {
        const artefact = JSON.parse(blocs[1].texte);
        for (const champ of ['titre', 'description', 'type', 'objectif', 'tache', 'detailTache']) expect(M.production[champ], champ).toBe(artefact[champ]);
    });

    it('les vingt commentaires, niveau 0 compris, et le fichier qui les porte', () => {
        expect(M.commentaires).toBe(blocs[2].texte);
        expect(M.commentaires.match(/^\*\*[^*]+ \((0|I|D|M|E)\)\*\* : /gm)).toHaveLength(20);
        expect(M.fichierCommentaires).toMatch(/\.txt$/);
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
        const texte = (i) => modele[i].texte;
        expect(texte(1)).toContain(M.production.description);
        expect(texte(1)).toContain(M.grille.nom);
        expect(texte(1)).toContain(M.echelle);
        expect(texte(4)).toContain(M.pratique.nom);
        expect(texte(7)).toContain(M.echelle);
        expect(texte(8)).toContain(M.mot);
        expect(modele[1].boutons.map((b) => b.libelle)).toEqual(['Copier le nom']);
        expect(modele[2].boutons.map((b) => b.libelle)).toEqual(["Copier l'objectif", 'Copier la tâche', 'Copier les consignes']);
        expect(modele[7].boutons.map((b) => b.libelle)).toEqual(['Télécharger les commentaires']);
        // La fin : la suite dans la démo, puis les vraies données ; « Étudiant·es », jamais « élèves ».
        expect(modele[8].boutons.map((b) => b.libelle)).toEqual(['Explorer la démo', 'Refaire avec mon matériel']);
        for (let i = 0; i < 9; i++) if (typeof Object.getOwnPropertyDescriptor(modele[i], 'texte')?.value === 'string') expect(texte(i)).not.toMatch(/élève/i);
    });

    it('le parcours réel ne bouge pas : ses textes validés sont toujours là', () => {
        expect(EVALUER).toContain('var TEXTE_1 = "Pour évaluer une première production, il te faut ta grille. Apporte celle que tu utilises déjà');
        expect(tranche(EVALUER, 'var ETAPES = [', 'var DEF = ')).not.toMatch(/MATERIEL|TEXTES_M|MOTS_M/);
    });
});

describe('le confinement : le modèle ne retient rien hors de la démo et ne fait aucun geste à la place de la personne', () => {
    const bloc = tranche(EVALUER, '// LE MODÈLE (13 nov. 2026)', 'window.Assistance.enregistrer({');

    it('ce qu’il retient reste en mémoire : `lireCtx` et `majCtx` ne touchent pas aux préférences pendant le modèle', () => {
        expect(tranche(EVALUER, 'function lireCtx() {', 'function majCtx')).toMatch(/if \(enModele\) return ctxModele;\s+var v = typeof obtenirPreference/);
        expect(tranche(EVALUER, 'function majCtx(maj) {', '// ---------- Les données, lues')).toMatch(/if \(enModele\) \{ ctxModele = Object\.assign\(\{\}, ctxModele, maj\); return ctxModele; \}\s+var ctx/);
        expect(tranche(EVALUER, 'async function lancer(depuis) {', 'if (enDemo()')).toContain('enModele = false;');
    });

    it('il n’écrit ni préférence ni donnée, et ne remplit aucun champ', () => {
        expect(bloc).not.toMatch(/definirPreference|db\.set|setSync|localStorage|\.value\s*=[^=]|\.checked\s*=[^=]|selectedIndex\s*=/);
    });

    it('le panneau refuse le modèle sans le deuxième groupe, et le fichier le déclare', () => {
        expect(ASSISTANCE).toMatch(/var raisonModele = typeof def\.refusModele === 'function' \? def\.refusModele\(\) : null;\s+if \(raisonModele\) \{ direRefus\(o\.corps, raisonModele\); appelerPrealable\(def, raisonModele\); return; \}/);
        expect(typeof fenetre.definition.refusModele).toBe('function');
        expect(typeof fenetre.definition.lancerModele).toBe('function');
        expect(fenetre.definition.prealable).toBe('classe');
    });
});

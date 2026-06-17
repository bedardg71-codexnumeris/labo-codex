import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// #343 (volet descriptions) — sentinelle anti-régression du malentendu
// « DEN = sans critères / grille / échelle ».
//
// Principe directeur (Grégoire, 16 juin 2026 ; RELAIS-326 §4.7, BACKLOG #343) :
//   les critères d'évaluation sont TOUJOURS explicités, jamais implicites.
//   Un enseignant DEN s'appuie sur des cibles + grille + échelle toute la session
//   (rétroaction) et n'attribue une note certificative (RREC 60/59) qu'à la FIN.
//
// Les descriptions utilisateur de DEN doivent donc : (1) mentionner des cibles /
// critères EXPLICITES, (2) rappeler la note certificative à la fin, et (3) ne plus
// présenter DEN comme « commentaire plutôt que score » / « absence de repères »
// (formulations qui omettent les critères et nourrissent le malentendu).
//
// Sentinelle STATIQUE (lit la source comme texte) : ces chaînes vivent dans des
// IIFE / objets de config non exécutables isolément dans le sandbox Node.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const lire = (...p) => readFileSync(path.resolve(__dirname, '..', '..', ...p), 'utf8');

describe('#343 · descriptions DEN — cibles/critères explicites + note certificative', () => {
    it('gabarits-utils.js : le tag DEN ne dit plus « autoévaluation guidée » seul, et cite critères explicites', () => {
        const src = lire('js', 'gabarits-utils.js');
        // La ligne de description du tag DEN.
        const ligne = src.split('\n').find(l => l.includes("code: 'DEN'"));
        expect(ligne, 'tag DEN introuvable').toBeTruthy();
        expect(ligne).not.toMatch(/autoévaluation guidée/);
        expect(ligne).toMatch(/critères explicites|cibles et critères/);
    });

    it('accompagnement-contenu-terme.js : den-denotation cite critères explicites + note certificative, plus « commentaire plutôt que sur le score »', () => {
        const src = lire('js', 'accompagnement-contenu-terme.js');
        const i = src.indexOf("'den-denotation'");
        expect(i, 'entrée den-denotation introuvable').toBeGreaterThan(-1);
        // Borne sur l'objet suivant pour ne lire que cette entrée.
        const bloc = src.slice(i, i + 800);
        expect(bloc).not.toMatch(/plutôt que sur le score/);
        expect(bloc).toMatch(/critères explicites/);
        expect(bloc).toMatch(/certificative/);
        expect(bloc).toMatch(/RREC/);
    });

    it('accompagnement-contenu-popup.js : la puce DEN cite critères explicites + note certificative à la fin', () => {
        const src = lire('js', 'accompagnement-contenu-popup.js');
        const ligne = src.split('\n').find(l => l.includes('Dénotation (DEN)</strong>'));
        expect(ligne, 'puce DEN introuvable').toBeTruthy();
        expect(ligne).not.toMatch(/réduit ou élimine la notation chiffrée au profit/);
        expect(ligne).toMatch(/critères explicites/);
        expect(ligne).toMatch(/certificative/);
    });

    it('wizard-pratique-v2.js : la description du type DEN cite critères explicites + note à la fin', () => {
        const src = lire('js', 'wizard-pratique-v2.js');
        const ligne = src.split('\n').find(l => l.includes("'denotation': { code: 'DEN'"));
        expect(ligne, 'type DEN du wizard introuvable').toBeTruthy();
        expect(ligne).toMatch(/critères explicites/);
        expect(ligne).toMatch(/certificative/);
    });

    it('wizard-pratique-v2.js : la bannière DEN ne dit plus « absence de repères » et cite critères explicites + RREC', () => {
        const src = lire('js', 'wizard-pratique-v2.js');
        const i = src.indexOf("id: 'infoDenotation'");
        expect(i, 'bannière infoDenotation introuvable').toBeGreaterThan(-1);
        const bloc = src.slice(i, i + 800);
        expect(bloc).not.toMatch(/absence de repères/);
        expect(bloc).toMatch(/critères explicites/);
        expect(bloc).toMatch(/RREC/);
    });
});

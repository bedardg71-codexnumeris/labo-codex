import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (rel) => readFileSync(path.join(racine, rel), 'utf8');

// #332 constat 1 — no-op silencieux au réassemblage horaire ↔ groupe-cours.
// Deux mécanismes confirmés (Rapports/ENQUETE-332-CONSTAT1-2026-06-11.md),
// corrigés le 14 juin :
//   A) le select horaire (data-on-change=mettreAJourNomGroupeCoursV2) voyait sa
//      valeur ré-écrasée par l'horaire auto-associé au groupe → choix manuel
//      impossible. Fix : le handler reçoit l'élément déclencheur et NE ré-associe
//      PAS depuis le groupe quand c'est le select horaire qui déclenche.
//   B) sauvegarderGroupeCoursV2 affichait « modifié » même quand findIndex
//      ratait (id d'édition périmé, p. ex. après changement de trimestre) →
//      faux succès + modif perdue. Fix B1 : erreur + return au findIndex raté.
//      Fix B2 : changerTrimestreActifV2 réinitialise le formulaire GC.
//   + piste secondaire : comparaison groupeAssocie en chaîne (string vs nombre).
//
// Sentinelles structurelles « ratchet » : elles verrouillent la présence des
// gardes. Le comportement DOM de bout en bout est couvert par Playwright (CI)
// et le terrain (protocoles de repro du rapport). Cf. SKILL_verification_adverse
// §4 « cas ratchet » : break-test = réintroduire le bug → la sentinelle rougit.

let gc;       // js/trimestre-v2-groupes-cours.js
let liste;    // js/trimestre-v2-liste.js

beforeAll(() => {
    gc = lire('js/trimestre-v2-groupes-cours.js');
    liste = lire('js/trimestre-v2-liste.js');
});

describe('#332 constat 1 · no-op silencieux horaire ↔ groupe-cours', () => {

    it('mécanisme A · le handler reçoit l’élément déclencheur et respecte le select horaire', () => {
        expect(/function mettreAJourNomGroupeCoursV2\(\s*triggerEl\s*\)/.test(gc)).toBe(true);
        // Garde : quand c'est le select horaire qui déclenche, on ne ré-associe pas depuis le groupe.
        expect(/triggerEl\s*&&\s*triggerEl\.id === 'v2-gc-horaire'/.test(gc)).toBe(true);
    });

    it('piste secondaire · groupeAssocie comparé en chaîne (plus de comparaison stricte fragile)', () => {
        expect(gc.includes("String(h.groupeAssocie) === String(groupeNum)")).toBe(true);
        // L'ancienne comparaison stricte (échouait si groupeAssocie était un nombre) a disparu.
        expect(/h\.groupeAssocie === groupeNum\b/.test(gc)).toBe(false);
    });

    it('mécanisme B1 · sauvegarderGroupeCoursV2 refuse un findIndex raté (plus de faux succès)', () => {
        // Garde présente : un index introuvable → erreur + return, AVANT tout toast de succès.
        expect(/if \(index < 0\)/.test(gc)).toBe(true);
        expect(gc.includes("notifications.erreur('Groupe-cours introuvable'")).toBe(true);
    });

    it('mécanisme B2 · changerTrimestreActifV2 réinitialise le formulaire groupe-cours', () => {
        // Vrai APPEL (pas une simple mention) au reset du formulaire GC.
        expect(/afficherEtatVideGroupeCoursV2\(\)/.test(liste)).toBe(true);
        // Et il vit dans changerTrimestreActifV2 (pas ailleurs par accident).
        const fn = liste.slice(liste.indexOf('function changerTrimestreActifV2'));
        const corps = fn.slice(0, fn.indexOf('\n}'));
        expect(corps.includes('afficherEtatVideGroupeCoursV2()')).toBe(true);
    });
});

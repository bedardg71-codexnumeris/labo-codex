# Consigne – Correction du PDF de la grille : « Points » au lieu de « % » sur une grille toute à barème (#1120)

> Écrite par Cowork le mardi 20 octobre 2026 à 18 h 22 (Toronto, mesuré par `date`), sur `main` à `67298a8d` (non poussé). Verdict : `VERDICT-RELECTURE-2026-10-20-pdf-grille-bareme.md` (accepté ; décision de Grégoire de 18 h 22).

## La décision de Grégoire — mots que ses élèves lisent

- Sur une grille dont **tous** les critères ont un barème (`echelleExigee(grille) === false`), l'en-tête de la colonne de la pondération est **« Points »** au lieu de « % ». Les valeurs ne changent pas (la pondération, maximum de points du critère, #941).
- Partout ailleurs (grille à échelle, grille mixte), « % » reste.
- « Barème » reste l'en-tête de la colonne des tranches (supposition 3 de la demande, confirmée).

## Ce qu'il faut

1. Décider l'en-tête une fois, à côté de `entetesColonnesTableau` (ou dans elle), et le faire poser par les deux rendeurs (`genererApercuCombine`, `genererPDFCombine`) : l'aperçu et le PDF disent le même mot.
2. Mesure les autres endroits où « % » s'écrit en tête d'une grille dans `js/export-pdf.js` : ceux qui sont vivants suivent la même règle ; ceux qui sont morts relèvent de #1128, n'y touche pas.

## Les bancs

- **Vitest** : étends `bareme-3-pdf-grille.test.js` : grille toute à barème → « Points », dans l'aperçu et dans l'appel `autoTable` ; grille mixte et grille à échelle → « % ».
- **Break-test** : « % » remis partout → rouge. Code restauré.
- La spec WebKit `bareme-3-pdf-grille.spec.js` verte ; Vitest complet vert. Remplace la capture `1-journal-de-lecture-pdf.png` du dossier de captures.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne, le verdict du lot, le correctif, les bancs, la capture. Ajoute les fichiers par leur chemin, jamais `git add -A`. Lance `/fin-de-session` avant le commit, sans le verdict complet. Pas de demande de relecture séparée : décris le commit en trois lignes dans ton rapport. **Puis arrête-toi.**

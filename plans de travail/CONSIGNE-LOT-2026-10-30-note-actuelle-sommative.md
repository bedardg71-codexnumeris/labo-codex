# Consigne – « La note actuelle du cours » en pratique sommative (#1207)

> Cowork, vendredi 30 octobre 2026, 21 h 50 (Toronto). Décision de Grégoire, 21 h 49 : « Je voudrais que l'expression note provisoire demeure dans la pratique alternative de notation, mais qu'on parle de la note actuelle du cours en pratique sommative. » À faire après les lots des barres et de la réponse du groupe (ou avant la réponse du groupe si sa question 0 tarde).

## 1. Ce qui change, en pratique sommative seulement

Les écrans relevés au verdict `VERDICT-RELECTURE-2026-10-30-niveau-rai-critere.md` (T2) : le profil (`_genererNoteSessionSommative`, `js/profil-etudiant-sections-affichage.js` vers 3678 et 3692) et le PDF de l'élève (`js/synthese-retroaction-rendu.js` vers 749 et 874-875, via `construireNoteSommative`). Cherche les autres écrans propres à la sommative qui disent « provisoire ».
- ⮕ **Textes validés par Grégoire le 31 oct. (8 h 54) : `TEXTES-2026-10-31-note-actuelle-sommative.md` fait foi** ; la proposition ci-dessous est périmée pour la mention sous la note. Proposition d'origine (le PDF est lu par ses élèves) : « Note provisoire de session » → « Note actuelle du cours » ; « Note provisoire = … » → « Note actuelle = … » ; « Note provisoire — peut changer selon tes prochains travaux. » → « Note actuelle du cours — peut changer selon tes prochains travaux. » (même chose avec « et l'application de jetons »). « Note finale » reste.
- En pratique alternative (standards, spécifications, dénotation) : rien ne change, « note provisoire » reste.
- L'Aide et les textes communs à toutes les pratiques gardent « note du cours à ce jour » (validé le 30 oct., 16 h 07).

## 2. Garde

`sentinelle-note-provisoire-reservee` : l'exception ouverte de T3 se ferme ; la garde vérifie que la sommative ne rend plus « provisoire » et que les pratiques alternatives le rendent encore.

## 3. Fin

Commit, Vitest entier, specs WebKit touchées ; pas de release. Relecture de Cowork.

# Consigne – Le critère algorithmique, étape 0 : un critère neuf ne parle plus français d'office, la ligne du PDF s'écrit en français correct

> Écrite par Cowork le mercredi 21 octobre 2026 à 9 h 30 (Toronto, mesuré par `date`), sur `main` à `6992bec4` (non poussé, relu et accepté à 9 h 16 : `VERDICT-RELECTURE-2026-10-21-critere-algorithmique-dit-vrai.md`). Plan : `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md` (lis-le d'abord, surtout « Le principe » et le tableau « Ce qui reste écrit pour la rédaction »). Ordre approuvé par Grégoire à 9 h 20, principe des deux noms à 9 h 28.

## Le principe (Grégoire, 9 h 20)

Rien ne se code en dur pour une discipline. Un enseignant de chimie qui crée un critère algorithmique ne doit rencontrer ni « français », ni la liste du français, sauf s'il la choisit.

## Ce qu'il faut

1. **Un critère algorithmique neuf ne reçoit plus les dix codes du français dans Annoter.** Aujourd'hui, tant que « codes d'annotation » n'est pas activé, `codesAnnotation` rend le repli (`_repli`, `codes-annotation.js` l. 164) : les dix codes du français. Un critère qui DEVIENT algorithmique (naissance, changement de type) doit naître marqué, sur le modèle exact de `gabaritNeuf` / `poserDefautNeuf` (`evaluation-projection.js` l. 812-825 : « c'est la seule façon de les distinguer »). Pour un critère marqué, les codes viennent de ses sous-critères seulement ; sans sous-critère, aucun code, et la palette des codes d'Annoter le dit à l'enseignant : « Aucun code : ajoute des sous-critères à ton critère algorithmique, dans la grille. » Choisis la marque (un drapeau existant comme `codesDepuisSousCriteres`, ou un neuf) après avoir mesuré ses lecteurs ; dis lequel et pourquoi.
2. **Le bouton des onze sous-critères dit ce qu'il donne** (`grilles.js` l. 4451) : « 📋 Utiliser sous-critères par défaut (0-10) » devient « Partir de la liste du français écrit (codes 0 à 10) ». Les onze sous-critères eux-mêmes ne changent pas.
3. **La ligne du PDF s'écrit en français correct** (`synthese-retroaction-rendu.js` l. 383) : virgule décimale pour la note et le pourcentage (« 13,75/20 (68,8 %) ») ; « erreur » au singulier sous 2 (« 0 erreur », « 1 erreur »), comme la règle déjà employée ailleurs (`copie.erreurs > 1`). Cherche un formateur à virgule existant avant d'en écrire un (`formaterNombrePeriodes`, `profil-etudiant-helpers.js`, en est un). Les noms « erreurs » et « mots » restent : ils attendent l'étape 2.

## Le stock

Un critère existant garde tout ce qu'il porte, les dix codes de repli compris : des collègues les emploient en plein trimestre, et les copies déjà annotées doivent garder les noms de leurs codes. Seule la naissance change. La ligne du PDF change pour tout PDF produit après le lot (virgule, singulier) : c'est voulu, et c'est la seule chose qui change chez Grégoire. Dis-le dans la demande.

## Ce qui ne fait PAS partie de ce lot

- Les textes d'aide, l'infobulle « Niveau IDME », celle du badge `eval-francais-ecrit`, le texte par défaut lu par l'élève : Cowork les rédige pour Grégoire, un lot de mots suivra.
- Nommer les données (« erreurs », « mots », l'accord de « une fois pondérées ») : étape 2.

## Les bancs

- **Deux disciplines fictives, dont une sans texte** (règle du plan) : un critère « Français écrit » et un critère « Unités et chiffres significatifs » (chimie), tous deux nés dans le lot. Pour le second, ni la palette d'Annoter, ni le gabarit, ni la ligne du PDF ne contiennent « français » ; les mots « erreurs » et « mots » de la ligne du PDF sont la limite nommée de l'étape 2.
- **Vitest** : un critère né dans le lot, sans sous-critère, rend une liste de codes vide (pas le repli) ; avec deux sous-critères, leurs deux codes ; un critère existant sans la marque rend le repli, identique à hier à l'octet près ; la ligne du PDF dit « 0 erreur », « 1 erreur », « 2 erreurs », « 13,75/20 (68,8 %) ».
- **WebKit** : créer une grille, y ajouter un critère algorithmique, ouvrir une copie dans Annoter → la palette des codes invite à ajouter des sous-critères ; une copie sous la grille démo existante → les mêmes codes qu'hier. Le PDF d'une copie démo → virgule décimale.
- **Break-test** : la marque retirée de la naissance → rouge ; le point décimal remis → rouge. Code restauré, vérifié par `cmp`.
- Vitest complet vert ; specs WebKit d'Annoter, des codes, du PDF et de Grilles vertes. Le verdict complet tourne ce soir, au signal de Grégoire.

## Ce qu'il ne faut pas

- Changer les codes, les sous-critères ou les noms d'un critère existant ; rouvrir A2025 ou H2026.
- Retirer le repli.
- Le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne, le plan, le verdict `VERDICT-RELECTURE-2026-10-21-critere-algorithmique-dit-vrai.md` (non suivi), les cinq lignes ajoutées par Cowork à `MESURE-2026-10-21-critere-algorithmique.md` (modifié, non commité), le correctif, les bancs, des captures (palette d'Annoter d'un critère neuf ; ligne du PDF) et la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-21-critere-algorithmique-etape-0.md`. Par leur chemin, jamais `git add -A`. Trouvailles : les trois issues de `CLAUDE.md`, inscrire et continuer par défaut. Lance `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**

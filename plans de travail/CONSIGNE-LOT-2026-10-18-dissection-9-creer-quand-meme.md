# Consigne – la dissection, lot 9 : créer la grille même s'il manque des points

> Écrite par Cowork le dimanche 18 octobre 2026 à 17 h 47 (Toronto, mesuré par `date`). Cadrage : `CADRAGE-2026-10-18-creer-quand-meme.md` (décision de Grégoire, 17 h 34) ; **lis-le d'abord**. Grégoire enchaîne ce lot tout de suite (17 h 46) : le temps B de la 1.206.0 attend ; **un seul verdict complet ce soir**, sur le dernier commit, après la release qui suivra ce lot. Règles 2 et 7 de `PROTOCOLE.md`.

## Ce que l'enseignant fait à la fin de ce lot

Il colle une grille dont un critère n'a pas de points ; « Créer ma grille » s'active, et la liste dit ce qu'il complétera ensuite dans « Grilles de critères ». Là, la ligne du total lui dit combien de critères n'ont pas de points ; il les saisit, le signal disparaît. S'il évalue une copie avant, la note affiche « -- ».

## Ce qu'il faut, dans cet ordre

0. **Mesurer le stock, avant tout code.** Tous les chemins qui écrivent la `ponderation` d'un critère (Grilles de critères : critère neuf, édition, duplication ; import et partage de grilles ; gabarits ; l'assistant ; la dissection) : lesquels peuvent écrire une **absence** (`null`, `NaN`, `''`, champ manquant), lesquels écrivent 0. Écris le résultat dans la demande. **Si un chemin autre que la dissection a pu écrire une absence dans des grilles existantes, arrête-toi avant le point 4 et rapporte-le** : la garde de l'évaluation changerait l'affichage de notes déjà remises, et celles d'A2025 et d'H2026 ne sont pas rouvertes.
1. **La lecture** (`materiel-dissection-lecture.js`) : sans niveaux, la grille se lit en points dès qu'un critère a une pondération ou qu'un morceau porte « Points ». Les points ou pondérations manquants (en points comme en niveaux) **ne bloquent plus** : la liste les dit sous un intitulé à part, qui ne grise pas le bouton. **Bloquent toujours** : la logique nulle (ni points, ni pondération, ni niveaux), et toutes les raisons du point 2 du cadrage.
2. **La création** écrit une absence franche et uniforme pour un critère sans pondération (la même valeur en IndexedDB et en localStorage ; `null` sauf raison mesurée), et chaque lecteur la reconnaît. La confirmation n'affiche jamais « NaN » ni « null » ; elle dit combien de critères sont à compléter.
3. **« Grilles de critères »**, grille en points : la ligne du total dit combien de critères n'ont pas de points, à côté du total ; le signal disparaît quand tous en ont. « Voir les critères » n'écrit plus « null point » ni « NaN point ». Une grille en pourcentages : inchangée (son « … % manquant » le dit déjà).
4. **L'évaluation** : `calculerPortee` (`js/evaluation-calcul.js`) range un critère dont la pondération est **absente** parmi les critères hors note (motif à part), donc l'évaluation est incomplète et la note affiche « -- ». **Un critère à 0 ne change pas.** La nouvelle cause fait exactement ce que fait la garde existante (écran, export, PDF), ni plus ni moins.
5. **Les bancs.** Vitest : la lecture (critère sans pondération → création permise, raison non bloquante ; logique nulle → bloque ; morceau sans place → bloque) ; l'absence écrite, uniforme ; `calculerPortee` (absente → hors note et incomplète ; 0 → comptée comme avant). WebKit : la grille fictive (d7) **sans rattachement** (deux critères sans pondération) → créer → le signal dans Grilles de critères → saisir les points → le signal disparaît ; les specs de Grilles de critères et de l'évaluation que tu touches. Break-tests : l'absence traitée comme 0 dans `calculerPortee` ; la raison des points redevenue bloquante.

## Les textes

Tous neufs et **provisoires** (l'intitulé non bloquant et ses lignes, la confirmation, la ligne du total, le motif s'il s'affiche) : liste-les dans la demande de relecture ; Grégoire les tranchera avant la version.

## Ce qu'il ne faut pas

- Changer ce qu'affiche une note existante d'un trimestre clos, ou écrire dans des données existantes.
- Débloquer une raison qui protège contre une perte ou un objet faux.
- Un numéro de version : la release suivra la relecture, les mots de Grégoire et l'entrée des Nouvelles.

## Livrer

Un commit sur `main` (avec `VERDICT-RELECTURE-2026-10-18-version-1.206.0.md`, le cadrage, cette consigne, la consigne du jour et son archive) ; Vitest complet vert ; `materiel-*` et les specs touchées vertes dans WebKit ; la demande de relecture courte `plans de travail/DEMANDE-RELECTURE-2026-10-18-dissection-9-creer-quand-meme.md`. **Puis arrête-toi.**

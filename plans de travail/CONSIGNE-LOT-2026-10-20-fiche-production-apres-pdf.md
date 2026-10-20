# Consigne – Retour de testeur : après « Préparer le PDF », la fiche de production n'enregistre plus rien

> Écrite par Cowork le mardi 20 octobre 2026 à 16 h 57 (Toronto, mesuré par `date`), sur `main` à `c8b2af98` (1.211.0, poussée). Retour de testeur : Grégoire, `BUG_"grégoire"_2026-10-20_16-54-01.txt` (1.211.0, Chrome 155, Mac, Conception › Productions). **Il passe avant tout le reste** (CLAUDE.md, « Priorité absolue : retours testeurs »).

## Le symptôme, dans ses mots

« Le choix de la grille ne persiste pas dans la production. » Son journal d'actions : il choisit la grille (16 h 51 min 29 s), ouvre « Préparer le PDF », clique « Annuler » (16 h 51 min 55 s) ; la fiche revenue montre une autre grille, il la choisit de nouveau (16 h 51 min 57 s).

## La cause, mesurée au code par Cowork (à remesurer : une connaissance transportée se remesure)

1. `afficherFormulairePDFInline` (`js/export-pdf.js`, vers la l. 3430) garde `zonePrincipale.innerHTML` en texte, puis `fermerFormulairePDFInline` (l. 3495) le remet en place, après « Annuler » comme après « Voir l'aperçu » (l. 3716).
2. Dans Conception › Productions, cette zone (`index.html`, l. 4650) contient `#formulaireProduction` (l. 4706). La fiche revient donc **reconstruite à partir d'un texte** :
   - les `<select>` reprennent l'option portant l'attribut `selected`, pas la valeur choisie (une valeur posée par `.value` ne s'écrit pas dans `innerHTML`) ; d'où la grille qui « ne persiste pas » à l'écran ;
   - l'écouteur `change` posé une seule fois au chargement par `brancherEnregistrementProduction()` (`js/productions.js`, l. 2203 et 3170) était sur l'ANCIEN élément : **plus aucune modification de la fiche ne s'enregistre**, pour tout champ, sans que rien ne le dise. Le `onchange` des cartouches (l. 3371) est perdu de même.
3. Hypothèse non mesurée : la première sélection de 16 h 51 min 29 s s'est enregistrée (écouteur intact à ce moment) ; les suivantes, non. À vérifier par le banc, pas chez Grégoire.

## Ce qu'il faut

1. **Tarir la source** : le formulaire de préparation ne doit plus détruire puis recréer le contenu de la zone. Forme suggérée, à toi de trancher : masquer les enfants de la zone (`u-hide`) et poser le formulaire dans un conteneur à part, retiré à la fermeture ; les nœuds, leurs valeurs et leurs écouteurs restent intacts. Un seul appelant reste dans `index.html` (l. 4827) ; les trois appels de `afficherFormulairePDFInline` passent par la même fonction, le correctif les couvre tous.
2. `js/modal-soutien.js` emploie aussi un `innerHTML` gardé puis remis : mesure s'il touche un formulaire qui enregistre seul. Trouvaille hors du lot : **inscrire et continuer**, sauf si elle casse un geste que des élèves ont entre les mains.
3. **Le stock** : rien à réparer, et c'est à écrire. Une modification faite sur une fiche reconstruite n'a jamais été écrite ; rien ne permet de la retrouver.
4. Inscrire le bug dans `Retours des testeurs/SUIVI-BUGS.md` (lecture ciblée), avec sa cause et le correctif.

## Ce qui ne fait PAS partie de ce lot

L'autre moitié du constat de Grégoire : l'aperçu montre une échelle de performance au lieu du barème de sa grille (« Journal de lecture A26 »), et le formulaire exige une échelle. `js/export-pdf.js` ne lit pas `bareme` (zéro occurrence). C'est un geste du chantier du barème qui n'est pas encore fait, et ce que le PDF montre aux élèves est une décision de Grégoire, demandée par Cowork. **N'y touche pas.**

## Les bancs

- **WebKit** : ouvrir une production existante, choisir une grille, « Préparer le PDF », « Annuler » → la fiche montre la grille choisie ; changer encore un champ (la grille, puis un champ texte) → page rechargée, la production les garde. Même chose après « Voir l'aperçu » puis le retour.
- **Break-test** : remettre l'ancienne sauvegarde par `innerHTML` → le banc passe au rouge. Code restauré.
- Vitest complet vert ; les specs de Productions et du PDF touchées vertes en WebKit. Le verdict complet tourne ce soir, au signal de Grégoire.

## Ce qu'il ne faut pas

- Toucher au PDF lui-même, au barème, à l'échelle exigée.
- Réécrire des productions existantes.
- Le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne, le correctif, le banc, la ligne de `SUIVI-BUGS.md`, et la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-20-fiche-production-apres-pdf.md`. Ajoute les fichiers par leur chemin, jamais `git add -A`. Lance `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**

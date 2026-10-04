# Consigne du jour – les décisions de Grégoire sur l'élève supprimé, puis mettre #1013 en ligne

> Écrite par Cowork le 4 octobre 2026 à 11 h 04 (Toronto, mesurée par `date`). Remplace la consigne du 4 octobre à 10 h 36, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-04-1013-masquer.md`.

## Où on en est

Ton commit `e5dfd5be` sur `claude/1013-eleve-supprime` est lu par Cowork (8 fichiers, 221 lignes) ; tes choix techniques sont acceptés (`dasElevesSupprimes()`, `obtenirFichiersAffiches()`, l'élève fictif du banc). Grégoire a tranché tes trois questions le 4 oct. au matin, chacune par « oui » ou « j'accepte », sur la recommandation de Cowork :

1. **L'export recherche et les seuils « en attente » du tableau de bord écartent l'élève supprimé** : ses présences et ses évaluations n'y entrent plus.
2. **La règle, pour toute sortie de ses données** : **ce qui montre ou envoie à quelqu'un écarte l'élève supprimé** (l'écran, Léa, les chercheurs) ; **ce qui garde emporte tout** (le codex, les archives). Motif retenu : sinon l'archive laisserait ses copies pour toujours dans le navigateur, et alléger un groupe deviendrait impossible.
3. **La phrase**, quand toutes les copies du groupe sont celles d'élèves supprimés, à la place de « Aucun fichier importé. » : « Aucune copie à afficher : celles de ce groupe appartiennent à des étudiant·es supprimé·es. »

La ligne des Nouvelles ci-dessous est de Cowork, acceptée par Grégoire avant qu'il te transmette cette consigne.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, à pousser (les documents de `main` dès maintenant, puis le lot) et à fusionner. Si le garde de permissions refuse, arrête-toi sur ce seul point et dis-le-lui.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur `main`, pousse `main`.
2. **Décision 1** : l'export recherche et les seuils du tableau de bord lisent `dasElevesSupprimes()`. Le codex n'y touche pas.
3. **Décision 2, « Exporter et archiver » du module Travaux** : mesure d'abord chaque sortie (la grille des copies et son aperçu PDF, « N fichiers en stock », l'export ZIP « Toutes / Tous », la sélection de l'export pour Léa), puis classe-la par la règle : montre ou envoie → écarte ; garde → emporte tout. Une sortie que la règle ne classe pas sans doute (ce qu'elle fait réellement de ses fichiers en décide) : **ne la touche pas**, écris-la dans la fiche close avec ta mesure, et dis-la dans ton rendu ; elle ne bloque pas le lot. Les archives (`js/reserve.js`) ne changent pas : elles gardent.
4. **Décision 3** : la phrase telle quelle, à l'endroit mesuré, seulement quand le groupe a des copies et qu'elles sont toutes masquées ; « Aucun fichier importé. » reste vrai pour un groupe sans copie.
5. **Tests** : le banc de #1013 suit (export recherche sans ses présences ni ses évaluations ; seuils sans elles ; le codex les écrit toujours ; la phrase ; chaque sortie classée). Une mutation de plus démontrée rouge : l'export recherche ramené à l'ancienne lecture. Vitest complet.
6. **La release** : **minor** (1.180.0). Titre à toi, dit à Grégoire au rendu. La ligne des Nouvelles, posée telle quelle :
   > Quand tu supprimes un·e étudiant·e dans le Cadre, ses copies ne paraissent plus dans la Liste des évaluations ni dans «&nbsp;Annoter et évaluer&nbsp;», et ses données ne partent plus dans l'export pour la recherche. Rien n'est effacé&nbsp;: ton codex garde tout.
   Si ta mesure du point 3 écarte aussi l'élève de l'export pour Léa, ajoute « ni dans l'export pour Léa » à la fin de la première phrase, et dis-le au rendu ; rien d'autre ne change dans la ligne.
7. **Verdict Playwright complet sur le commit qui part, puis push, puis fusion vers `main`** ; si la fusion change autre chose que des documents, rejuge-la. Nomme les instables, et dis l'éveil et la mémoire.
8. **Constate la mise en ligne chez Netlify** (par le connecteur), et dis l'heure. **Pas de porte terrain** : le banc répond.
9. **Clos #1013** au BACKLOG ; ce qui reste (les élèves supprimés avant 1.174.4, sans trace ; une sortie non classée) s'écrit dans la fiche close.
10. **`RELAIS.md` et `OU-EN-EST-ON.md` à jour.** Suite : le chantier des archives, en commençant par « faire revenir des copies » (#1000), sur une consigne de Cowork.

## Ce que tu rends

À Grégoire, trois lignes : le numéro en ligne et l'heure ; le verdict complet, l'éveil, la mémoire et les instables nommés ; comment chaque sortie de « Exporter et archiver » a été classée. Ce que tu as supposé, en une ligne.

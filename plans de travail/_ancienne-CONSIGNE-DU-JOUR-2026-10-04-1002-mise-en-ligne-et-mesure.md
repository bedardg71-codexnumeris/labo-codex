# Consigne du jour – mettre les mots « clos » en ligne (#1002), puis mesurer « emprunter et rendre un trimestre »

> Écrite par Cowork le 4 octobre 2026 à 14 h 41, complétée à 14 h 54 (points 7 et 8 ; Toronto, mesurée par `date`). Remplace la consigne du 4 octobre à 14 h 17, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-04-1002-mots-clos.md`.

## Où on en est

Ton commit `be7785c0` sur `claude/1002-mots-clos` est accepté (42 textes, la sentinelle, #1017 inscrite). **Grégoire a tranché tes cinq vrais choix**, chacun sur ta recommandation et celle de Cowork :

1. **L'aide de la clôture** : « Clore un trimestre le fige en lecture seule, une fois terminé ; tu peux ensuite en commencer un nouveau. Clore ne libère aucun espace. » (« oui », 4 oct.)
2. **Le fichier de la clôture** : **clore ne télécharge plus** `trimestre-<id>-archive-<date>.json` ; les phrases « Un export automatique sera généré. » et « Un fichier d'export a été téléchargé. » sont retirées. Les trois boutons « Exporter les données » de la bibliothèque **ne changent pas** : ils restent sous #1006, qui reste ouverte pour eux. (« oui »)
3. **Le registre longitudinal** : « … pas dans l'archive d'un groupe-cours. » (« j'accepte »)
4. **Sous la liste des archives** : « · liste mise à jour le <date> » ; le code qui écrit la date ne change pas.
5. **La carte Archives** : l'encadré dit « → Archiver… » ; l'aide ajoute « Vérifier relit une archive copie par copie ; une archive vérifiée offre Faire revenir. » et dit « d'un groupe-cours archivé ».

La ligne des Nouvelles ci-dessous est de Cowork, acceptée par Grégoire avant qu'il te transmette cette consigne.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, à pousser (les documents de `main` dès maintenant, puis le lot) et à fusionner. Si le garde de permissions refuse, arrête-toi sur ce seul point et dis-le-lui.

## Les décisions de Cowork sur tes trouvailles et ta question

- **« Erreur: undefined » au refus de la clôture** (la confirmation lit `result.error`, le refus remplit `result.message`) : **corrige-la dans ce lot**. C'est le parcours « clore » que ce lot réécrit, et une fenêtre « undefined » s'y montre à l'usager ; une ligne, un essai, la mutation rouge.
- **« Clore » offert sur le trimestre actif, toujours refusé** : **inscris-le** (issue 2) ; ne le corrige pas ici.
- **`ECOSYSTEME-DONNEES.md`** : reporte-y le vocabulaire (clos / archivé), puisque la fiche le demande ; quelques lignes de documentation, rien d'autre.
- **RELAIS.md** : sans objet, le lot part aujourd'hui.

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive sur `main`, pousse `main`.
2. **Les cinq choix** et **le correctif « undefined »** sur la branche. Le choix 2 retire l'appel au téléchargement dans le parcours de clôture seulement ; mesure qu'aucun autre appelant ne dépendait de ce téléchargement. La sentinelle et les essais suivent ; mutations rouges : le téléchargement remis à la clôture ; « undefined » remis.
3. **La release** : **minor** (1.182.0). Titre à toi, dit à Grégoire au rendu. La ligne des Nouvelles, posée telle quelle :
   > Un trimestre terminé se dit maintenant «&nbsp;clos&nbsp;» : dans la bibliothèque des trimestres, «&nbsp;Clore&nbsp;» et «&nbsp;Rouvrir&nbsp;» remplacent «&nbsp;Archiver&nbsp;» et «&nbsp;Désarchiver&nbsp;», et clore un trimestre ne télécharge plus de fichier.
4. **Verdict Playwright complet sur le commit qui part, puis push, puis fusion vers `main`** ; si la fusion change autre chose que des documents, rejuge-la. Nomme les instables ; dis l'éveil et la mémoire.
5. **Constate la mise en ligne chez Netlify**, et dis l'heure. **Pas de porte terrain** : la sentinelle répond.
6. **Clos #1002** ; **note à #1006** que la clôture ne télécharge plus le fichier et que restent les trois boutons de la bibliothèque.
7. **`RELAIS.md` et `OU-EN-EST-ON.md` à jour.** **Alléger (#1001, lot A4) n'est plus la suite** : Grégoire a changé le but du chantier (point 8). N'ouvre pas #1001.
8. **Puis, la mesure – lecture seule, aucun code, rien d'écrit dans ses données.**

   **Le but nouveau, dans les mots de Grégoire** (4 oct., 14 h 50) : retirer **le trimestre d'hiver 2026 entier** (données et copies) de l'application **et du codex**, le déposer dans une archive sur son Mac, hors de l'application ; au besoin le **réintégrer** pour le lire, le consulter, en extraire des données ou des images ; puis le **retourner** à l'archive, « comme un livre à la bibliothèque ». Il garde H2026 entier tant que ce chemin n'est pas prouvé (ses deux groupes, aux dynamiques différentes, lui servent aux démonstrations et à comparer automne et hiver, avec ses doubleurs). Hypothèse de Cowork, à éprouver : un trimestre **clos** est en lecture seule, donc le livre rendu est celui qu'on a emprunté, et le rendre n'est qu'un retrait, sans réécrire l'archive.

   Rends `plans de travail/MESURE-2026-10-04-emprunter-un-trimestre.md`, chaque constat marqué *mesuré* (commande ou banc, et témoin), *lu* (code), ou *inféré* :

   1. **Ce que l'archive d'un groupe-cours emporte aujourd'hui** (lots A1-A3) : les copies, et quelles clés de données ?
   2. **Le codex à part** écrit avant de supprimer un trimestre (1.175.0) : que contient-il ? Sur la démo, dans un espace jetable : supprimer un trimestre, puis « Ouvrir un Codex » sur ce codex à part — le trimestre revient-il, seul, entier, sans toucher aux autres trimestres ni aux réglages ? Ce qui revient, ce qui manque, ce qui est écrasé.
   3. **Ce qu'un trimestre partage avec les autres** : les clés globales (cours, listes, enseignants, cartouches, bibliothèques ; skill `integrite-globaux`), les élèves présents dans plusieurs trimestres (doubleurs), le registre et le suivi longitudinal, l'alignement. Pour chacun : que voit-on dans les autres trimestres quand H2026 n'est plus là, et que faut-il pour qu'il revienne intact ?
   4. **La marge du codex** : sa taille réelle aujourd'hui (le plus récent sur iCloud, lecture seule : des comptes et des octets, aucun nom d'étudiant·e) ; la croissance des copies d'A2026 depuis la rentrée ; une projection à la fin de l'automne, hypothèses écrites ; et ce qui se passe réellement au-delà de 2 Go (#992 : mesuré, ou lu ?).
   5. **Les morceaux qui manquent** pour « emprunter et rendre un trimestre », en lots, chacun avec sa taille estimée et ce qui reviendrait à Grégoire. Une proposition, pas une décision. Dis aussi ce que deviennent #1001 (alléger un groupe) et #1006 (les boutons « Exporter les données ») dans ce chemin.

## Ce que tu rends

À Grégoire, trois lignes pour la mise en ligne : le numéro en ligne et l'heure ; le verdict complet, l'éveil, la mémoire, les instables ; où il verra « clos » en premier. Puis, pour la mesure, trois lignes : ce qui existe déjà pour emprunter et rendre un trimestre ; ce qui manque, en gestes ; la marge du codex avant 2 Go. Ce que tu as supposé, en une ligne.

# Verdict de relecture – La note suit les décisions de Grégoire (E1, E2, E3, E4, E7 ; #1152, trou 2 ; #1177)

> Cowork, mercredi 28 octobre 2026, vers 15 h 25 (Toronto). Relu : `DEMANDE-RELECTURE-2026-10-28-construction-de-la-note-correctifs.md` et le commit `19db734c` (`git show`, lecture seule ; `git --no-optional-locks`, rien qui touche l'index).

## Verdict : accepté, avec une retouche (trois points, dont deux attendent Grégoire)

Le diff dit ce que la demande dit, décision par décision :
- **E1** : `_ponderationDe` (0 vaut 0, absent vaut 1), `pondTotal <= 0` → `null` ; le récit nomme la production à 0. Conforme.
- **E2** : `'portfolio'` dans les deux listes de règles retirées ; la ligne de l'Aide mot pour mot (`index.html`, diff vérifié : une ligne d'Aide et les jetons anti-cache des 8 scripts, **rien du lot de l'accueil**). Conforme.
- **E3** : la relecture du N à la réouverture (`_nombreRetenuARelire`) est la bonne supposition : sans elle, « une pratique déjà créée garde son nombre » ne tenait pas. Acceptée.
- **E4** : une seule règle au registre (`originaleEstRemplacee`), doublon réconcilié et reprise introuvable gardés « remplacés ». Conforme.
- **E7** et l'ajout de 14 h 55 : `statut` lit la case ; `_noteAttendSaTerminale` ne rend provisoire qu'une terminale prévue. Conforme. La sommative codée en dur reste « provisoire » à l'export faute de case : son PDF titrait déjà « Note provisoire » pour la même raison ; les deux disent maintenant la même chose. Limite connue, sans symptôme vécu : **commentée ici, pas inscrite** (décision de Cowork).

## La retouche

1. **L'indice C pendant la fenêtre de reprise** (question 1 de la demande) : didactique, **à Grégoire**. ✅ **Décidé par Grégoire à 15 h 22** (E15 au fichier des décisions) : l'originale qui compte dans la note compte aussi comme remise, jusqu'à ce que la reprise la remplace.
2. **Le badge « Remplacée »** pendant la fenêtre (question 2) : ✅ **validé par Grégoire à 15 h 23** (E16) : l'originale n'est plus grisée et porte « Compte jusqu'à sa reprise » ; « Remplacée », grisée, une fois la reprise entrée dans la note.
3. **L'index des évaluations** (`_indexDesEvaluations`, une `WeakMap` par tableau) : mesure à faire, technique. Hors cours actif, `obtenirDonneesSelonMode` rend le tableau de `db.getSync` sans filtre, et `memoryCache` rend la **même référence** d'un appel à l'autre ; un tableau modifié en place (une reprise ajoutée par `push`, une copie remplacée à son indice) garderait un index périmé : reprise « introuvable » (l'originale sort), ou reprise périmée (l'originale et la reprise comptent toutes deux). Mesure si un chemin réel modifie ce tableau en place entre deux calculs ; si oui, reconstruis l'index à chaque lecture hors pipeline ; si non, dis-le en commentaire au site.

## Les dispositions de Cowork

- **Question 3** (le doublon réconcilié dit « remplacée par une reprise » au récit standards et à la tuile du registre longitudinal) : **inscrite au lot 1 du chantier Standards**, qui réécrit ce récit (`profil-etudiant-actions.js`) ; la tuile (`registre-longitudinal.js:775`) avec lui. Pas de fiche à part.
- **E14** (le jugement de dénotation sans note) : sa consigne est prête (`CONSIGNE-LOT-2026-10-28-denotation-jugement-sans-note.md`) ; elle part avec la retouche.
- **Le chantier « standards sans portfolio »** : la fiche BACKLOG sera écrite par le lot 1 (sa consigne le demandera).
- **Le lot de l'accueil « trois portes d'entrée »**, non commité dans l'arbre : hors de ce verdict ; Cowork en retrouve l'état avant la mise en ligne du soir.
- **34 commits locaux** : ils partent ce soir avec la vérification complète, au signal de Grégoire.

# Consigne – La retouche des correctifs de la note (E15, E16, l'index ; plus E14) (#1152, trou 2 ; #1177)

> Écrite par Cowork le mercredi 28 octobre 2026 vers 15 h 25 (Toronto), sur `main` = `19db734c`. Ce fichier ne remplace aucune autre consigne. Sources : `VERDICT-RELECTURE-2026-10-28-construction-de-la-note-correctifs.md` (accepté avec cette retouche) ; `DECISIONS-2026-10-28-construction-de-la-note.md`, §§ E14, E15, E16 (les décisions de Grégoire, 15 h 11 à 15 h 23, mot pour mot) ; `CONSIGNE-LOT-2026-10-28-denotation-jugement-sans-note.md` (E14, jointe à cette retouche).

## 0. Avant tout

- Un seul lot à la fois, aucune suite qui tourne. Rituel de début de session.
- **Le lot de l'accueil « trois portes d'entrée » est toujours dans l'arbre, sans commit** : n'y touche pas, ne l'emporte pas ; ton commit nomme ses fichiers.
- Commit de docs seul d'abord, fichiers nommés : ce fichier, `VERDICT-RELECTURE-2026-10-28-construction-de-la-note-correctifs.md`, `DECISIONS-2026-10-28-construction-de-la-note.md`, `CONSIGNE-LOT-2026-10-28-denotation-jugement-sans-note.md`, `TEXTES-2026-10-28-aide-sept-trous.md`, `PLAN-2026-10-28-standards-sans-portfolio.md`, `CONSIGNE-DEMARRAGE-COWORK.md`. Rien d'autre.
- **Tarir et stock** : tout se lit au calcul ou à l'affichage ; aucune écriture dans les données de personne.

## 1. Le mandat

1. **E15** : l'originale qui compte dans la note (la règle d'E4, `originaleEstRemplacee`) compte aussi comme **remise** dans l'indice C (`evaluationCompteCommeRemise`), jusqu'à ce que sa reprise la remplace. Retire le commentaire « question posée au relais » devenu faux. Dis quelles notes de C changent (pour les Nouvelles).
2. **E16** : pendant la même fenêtre, l'originale **n'est plus grisée** et porte le badge « Compte jusqu'à sa reprise » (Liste des évaluations, `liste-evaluations.js:~1497` ; profil, `profil-etudiant-sections-affichage.js:~2717`) ; une fois la reprise entrée dans la note, « Remplacée », grisée, comme aujourd'hui. Les deux sites lisent la même règle (`originaleEstRemplacee`), pas `remplaceeParId` seul. Mesure les autres lecteurs d'un badge ou d'un grisé de l'originale et dis ce que chacun montre ; aucun autre mot neuf.
3. **L'index des évaluations** (`_indexDesEvaluations`, `pratique-registre.js`) : hors cours actif, `obtenirDonneesSelonMode` rend la référence de `db.getSync`, et `memoryCache` rend la même d'un appel à l'autre. Mesure si un chemin réel modifie ce tableau en place (`push` d'une reprise, copie remplacée à son indice) entre deux calculs. Si oui, l'index se reconstruit à chaque lecture hors pipeline (le pipeline et la simulation gardent le leur) ; si non, dis-le en commentaire au site. Dans les deux cas, un essai : une reprise ajoutée en place puis verrouillée remplace bien l'originale.
4. **E14** : le mandat de `CONSIGNE-LOT-2026-10-28-denotation-jugement-sans-note.md`, § 1 et § 2 (DEN-4).

## 2. Les tests

- Un essai par point qui rougit sans son correctif (break-test, arbre restauré par sha256).
- Le banc `sentinelle-construction-de-la-note-2026-10-28` : DEN-4 s'ajoute ; si un autre cas bouge, arrête-toi et dis-le.
- Vitest depuis `tests/` ; Playwright ciblé : le badge « Compte jusqu'à sa reprise » dans la Liste pendant la fenêtre, puis « Remplacée » après la réévaluation.

## 3. Clôture

`BACKLOG.md` : la fiche du lot (#1177) dit E15, E16 et E14. Demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-28-construction-de-la-note-correctifs-retouche.md` (point par point : avant, après, preuve, test ; les notes et les C qui changent). Pas de release, de verdict ni de push sans le signal de Grégoire.

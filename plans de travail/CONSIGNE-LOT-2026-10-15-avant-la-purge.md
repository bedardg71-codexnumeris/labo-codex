# CONSIGNE — Lot « avant la purge » (15 oct. 2026, soir) — #694

> Écrite par Cowork le 15 oct. 2026 à 15 h 30, sur les décisions de Grégoire de 14 h 51 à 15 h 08 (tri des fiches « à toi », détail : `plans de travail/LOTS-2026-10-15-fiches-a-toi.md`, lot A).
> **À exécuter CE SOIR, après le lot en cours et avant la purge de l'historique du 16 au matin (#781).** Aucun fichier de `js/` n'est touché : pas de bump.
> ⛔ Aucun nom de collègue ni d'élève dans ce que tu écris au dépôt (rapport, commit, plan) : des chemins et des comptes, jamais des noms. Le rapport nominatif, s'il en faut un, se donne à Grégoire dans la conversation, pas dans un fichier suivi.

## Ce que Grégoire verra
Un dossier rendu à côté du dépôt (pas dedans) : le répertoire « Autres pratiques de notation » qu'il ne retrouvait plus. Un décompte des prénoms et noms de ses collègues, à valider avant la purge. Rien ne change dans l'application.

## 1. Les dossiers de retours de collègues
Mesuré par Cowork à 15 h 05 (à remesurer, pas à recopier) :
```bash
git log --all --name-only --format= -- "Retours des testeurs" | awk -F/ 'NF>2{print $2}' | sort | uniq -c
git ls-files "Retours des testeurs" | awk -F/ 'NF>2{print $2}' | sort | uniq -c
```
Attendu : sept dossiers de collègues dans l'historique ; deux encore suivis dans l'arbre ; l'un des deux absent de `.gitignore`. Un huitième, celui de Grégoire, porte deux entrées : l'ouvrir et dire à Grégoire ce qu'il contient avant de décider s'il part.
Gestes :
- `git rm --cached -r` des dossiers de collègues encore suivis (le contenu reste sur le disque, rien n'est effacé) ; les inscrire tous à `.gitignore`.
- Ajouter `Retours des testeurs/<dossier>/` pour CHACUN des sept à la liste `chemins-a-retirer.txt` de `CHANTIER-historique-git-donnees-personnelles.md` § 4.4 (la liste du plan ; le fichier lui-même se génère hors du dépôt au moment de la purge).
- Étendre la vérification B du § 5 à ces chemins, avec son témoin sur le dépôt d'origine.

## 2. Le répertoire « Autres pratiques de notation » (nov. 2025)
Mesuré par Cowork : ajouté du 25 au 27 nov. 2025 (`f019c874`, `0c36b07b`, `6c4df4a9`), retiré de l'arbre le 20 janv. 2026 (`0243ea5c`) ; une copie sous `Archives/Autres pratiques de notation/`, retirée le 9 févr. 2026 (`3926ea93`). 56 chemins distincts. Il contient des cartographies nominatives de collègues, des réglages de pratique nommés d'après eux, et des textes d'auteurs recopiés en entier (droits d'auteur).
Gestes :
- **D'abord le rendre à Grégoire** : extraire chaque chemin des deux emplacements depuis le dernier commit où il existait (union, doublons signalés) vers un dossier À CÔTÉ du dépôt, hors de lui, par exemple `~/Documents/GitHub/Monitorage_v6-hors-depot/Autres pratiques de notation/`. Compter les fichiers rendus contre les chemins de l'historique ; dire à Grégoire où est le dossier et combien de fichiers il porte.
- Puis ajouter à `chemins-a-retirer.txt` (§ 4.4) : `Autres pratiques de notation/` et `Archives/Autres pratiques de notation/`, et tout autre chemin de l'historique qui porte un prénom de collègue dans son nom (le trouver par mesure, par exemple les configurations de pratique `config-*-chimie.js` sous `Archives/Beta-95-*/js/pratiques/`).
- Les dossiers de retours du § 1, eux, restent sur le disque de Grégoire, ignorés par git : rien à déplacer.

## 3. Les prénoms et noms des collègues dans les fichiers
Décision de Grégoire (15 h 06) : dans la purge du 16, remplacés par une initiale. **Le décompte d'abord, montré à Grégoire dans la conversation, AVANT d'écrire la moindre règle** (même étape que pour les noms d'élèves, § 4.4 « comptage des collisions »). Les listes des collègues : les noms des dossiers de retours et les cartographies du § 2 ; Grégoire complète.
⚠ Trois familles à séparer dans le décompte, que Grégoire tranche :
- les homonymes fictifs (tests, démo) : on n'y touche pas ;
- les remerciements voulus (`Plan Accompagnement/CONTENU_apropos_sources-remerciements.md`) ;
- les citations d'auteurs publiés (articles signés par un collègue).
⚠ `js/pratiques/pratiques-predefines.js` porte des pratiques inventées aux prénoms de collègues (#690) : les compter dans le décompte ; leur retrait du code est un lot à part, juste après la purge (`plans de travail/ORDRE-2026-10-16-les-laborieuses.md`, chantier 1).
Les règles de remplacement s'ajoutent à `regles-texte.txt`, généré HORS du dépôt, jamais versionné.

## Fin du lot
Commit de documents seulement (`.gitignore`, retrait du suivi, plan de purge mis à jour), avec les trois fichiers de Cowork du 15 : cette consigne, `plans de travail/LOTS-2026-10-15-fiches-a-toi.md`, `plans de travail/ORDRE-2026-10-16-les-laborieuses.md`, et le § 0 de `CONSIGNE-DEMARRAGE-COWORK.md`. Relu par Cowork avant l'envoi. Rapport court à Grégoire : où est le dossier rendu, combien de fichiers, et le décompte à valider.

# Consigne du jour – un critère « Français… » ne disparaît plus du diagnostic (#553)

> Écrite le 21 septembre 2026, 11 h 25 (Toronto), par Cowork. **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (audit « code en dur », `e5e3e4a2`, commitée, PAS poussée) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-audit-code-en-dur.md` (déplacée par Cowork, à commiter avec ce lot).
> **Décision de Grégoire, 21 sept. à 11 h 25** : ce lot est le suivant (« oui » à la recommandation de Cowork). Le rapport d'audit part en ligne avec lui.

## 0 · Conditions de départ – mesure-les

- `git log --oneline -3 main` : `e5e3e4a2` (audit) sur `1defd61c` ; `origin/main` = `1defd61c`. Sinon, arrête-toi et dis ce que tu vois.
- Aucune autre session n'écrit, aucun `pousser.sh` ; arbre propre hors des non-suivis anciens, de `RELAIS.md` (ajout de Cowork) et des fichiers de Cowork (§5).

## 1 · Le défaut (F3-1 du rapport, confirmé par Cowork à la lecture)

`profil-etudiant-calculs.js:926` range la moyenne d'un critère dont le nom normalisé commence par `francais` sous la clé `francais` ; `diagnostiquerForcesChallenges` (≈ l. 1300) cherche le nom normalisé entier (`francaisecrit`), ne trouve rien, **écarte le critère**. Deux critères « Français… » fusionnent en une clé, le dernier écrase. Neuf sites (rapport, F3-1, « Ampleur »).

## 2 · Ce qui est attendu

- **Une règle** : la clé d'un critère est son nom normalisé (minuscules, sans accents, sans espaces), **partout, sans rabotage**. Retire le `startsWith('francais') → 'francais'` aux neuf sites, et `NOM_CRITERE_LANGUE = 'francais'` (`pratique-pan-standards.js`) s'il sert à apparier un critère par son nom – **remesure ce qu'il fait avant d'y toucher** ; s'il porte un sens pédagogique (le critère de langue a un rôle à part dans la note Standards), arrête-toi sur ce point et dis-le : ça remonte à Grégoire.
- **Stock, lu avec tolérance, jamais réécrit** : les interventions déjà enregistrées portent `snapshotAvant[da].criteres` sous la clé `francais` (`interventions.js` ≈ l. 1470-1484). Le bilan avant/après doit continuer de les lire : si la clé exacte manque et qu'une clé `francais` existe, et qu'**un seul** critère de la grille commence par `francais`, lire celle-là. Deux candidats : ne rien apparier et le dire au récit (pas de valeur inventée). Rien n'est écrit dans les données (limite de Grégoire du 20 sept.).
- **Hors du lot, retenu par Cowork (technique)** : la garde du run planifié GitHub (`.github/workflows/tests.yml` ≈ l. 296, l'apostrophe de `${raison:-la garde n'a rien rendu : on juge}`) : corrige-la pour qu'elle ne casse plus le shell (mets le texte de repli dans une variable, ou échappe-le). Le run manuel de vérification n'est pas demandé.
- Aucun mot à l'écran ne change. Le nom affiché d'un critère reste son nom.

## 3 · Preuves attendues

- Sentinelle sur le **vrai** code, les trois cas du rapport : chimie (« Qualité de la langue », inchangé) ; « Français oral » 10 % et « Français écrit » 90 % (deux valeurs distinctes, le 10 % est défi) ; grille de Grégoire, « Français écrit » 10 % (**défi principal : Français écrit**, et la cible d'intervention le vise).
- Stock : une intervention enregistrée avec la clé `francais` garde son bilan avant/après ; le cas à deux candidats n'apparie rien.
- Mutations, une clause à la fois, toutes rouges : un rabotage remis à un seul site ; la lecture tolérante retirée ; la tolérance qui apparie malgré deux candidats.
- Vitest complet vert. **Release : patch.** **Phrase de « Nouvelles » à PROPOSER à Grégoire.** Relecture croisée par Cowork avant le verdict et le push ; push sur le mot de Grégoire.

## 4 · Ce que Grégoire verra (en tête d'`OU-EN-EST-ON.md`)

Profil d'un élève › forces et défis : un critère nommé « Français… » y figure de nouveau ; s'il est le plus faible, il devient le défi principal et la cible d'intervention. Deux critères de français (oral, écrit) ont chacun leur valeur. Les interventions déjà enregistrées gardent leur bilan.

## 5 · Fichiers de Cowork à commiter avec ce lot

`plans de travail/CONSIGNE-DU-JOUR.md` (celle-ci), `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-audit-code-en-dur.md`, `RELAIS.md` (ajout de Cowork : relecture de l'audit).

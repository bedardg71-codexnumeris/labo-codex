# Consigne du jour – les trois derniers « artefact » du PDF de synthèse deviennent « production »

> Écrite le 21 septembre 2026, 13 h 54 (Toronto), par Cowork. **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (demies, 1.152.5, poussée) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-demies.md` (déplacée par Cowork, à commiter avec ce lot).
> **Mots validés par Grégoire le 21 sept. à 13 h 00, tels quels** (question fermée, recommandation de Cowork). Lot n° 1 de `FILE-DES-LOTS.md`.

## 0 · Conditions de départ

`git --no-optional-locks log --oneline -1 origin/main` porte `e74988a0` (journal de 1.152.5) ou un commit de journal après. Sinon, arrête-toi. Aucune autre session n'écrit dans `js/`.

## 1 · Ce qui change – `js/synthese-retroaction-rendu.js`, trois chaînes lues par l'élève dans le PDF

Mesuré par Cowork à 13 h 54 (lignes à remesurer) :
1. ≈ l. 151 : `artefact ${a.number} de ${a.total}` → **`production ${a.number} de ${a.total}`**
2. ≈ l. 745 : `Voici les ${n} meilleurs artefacts que tu as produits` → **`Voici les ${n} meilleures productions que tu as réalisées`**
3. ≈ l. 786 : `Artefacts à venir :` → **`Productions à venir :`**

- Accords : « meilleures » au féminin ; si `nbSelection` peut valoir 1, mesure ce que rend la phrase (« les 1 meilleurs… ») : si ce cas existe sur un chemin réel, accorde au singulier (« Voici ta meilleure production ») et **dis-le** — c'est un mot d'élève, Cowork le fera valider.
- Espace avant le deux-points : suis ce que le fichier fait déjà.
- Les noms de variables et de champs (`artefact`, `artefacts`, `f.artefact`) **ne changent pas** : seuls les mots rendus.
- Si tu trouves un autre « artefact » lu par l'élève ailleurs dans la synthèse (données, rendu, PDF), **nomme-le sans le changer**.

## 2 · Preuves

- La vraie synthèse rendue jusqu'au HTML du PDF : les trois phrases neuves présentes, aucun « artefact » dans le texte visible (hors attributs et commentaires).
- Mutations, une à la fois, rouges : chacune des trois chaînes remise à l'ancien mot ; « meilleurs » au masculin.
- Vitest complet vert. **Release : patch.** Phrase de « Nouvelles » : **à PROPOSER à Grégoire** (question fermée), sinon aucune — ajoute-la à l'entrée 1.152 comme pour 1.152.4.
- Relecture croisée par Cowork avant le verdict et le push ; push sur le mot de Grégoire.

## 3 · Stock

Rien n'est persisté : les mots sont rendus à chaque PDF. Les PDF déjà remis gardent l'ancien texte.

## 4 · Ce que Grégoire verra

Dans le PDF de synthèse remis à l'élève : « production 2 de 5 », « Voici les 4 meilleures productions que tu as réalisées », « Productions à venir : ». Plus aucun « artefact ».

## 5 · Fichiers de Cowork à commiter avec ce lot

Cette consigne, l'archive de la précédente, `plans de travail/FILE-DES-LOTS.md` (retire-en le lot 1 une fois poussé).

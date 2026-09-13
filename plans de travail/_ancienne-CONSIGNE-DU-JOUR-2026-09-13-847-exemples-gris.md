# Consigne du jour – Les exemples gris du formulaire d'intervention ne citent plus les critères de Grégoire (#847)

> **Écrite par Cowork le dimanche 13 septembre 2026, 13 h 31 (Toronto).** Elle remplace la consigne #746/#551, exécutée et
> releasée en `1.140.2` (`07f0d74d`), archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-13-interventions-746-551.md`.
> **Les deux textes de remplacement sont approuvés par Grégoire** (13 sept., début d'après-midi). Ce sont des mots que vingt
> collègues liront **mardi 15**, à la découverte de l'accueil neuf par la communauté de pratique.
> ⚠ **La mesure au code a corrigé la fiche sur trois points.** Ils sont au § 1 ; lis-les avant de cadrer.

---

## 0 · Ce que ce lot livre

Les exemples affichés en gris dans le formulaire d'intervention ne nomment plus les critères de Grégoire. Un collègue qui ouvre
le formulaire y lit un exemple qui vaut pour sa grille à lui, pas pour celle de quelqu'un d'autre.

Aucun comportement, aucun calcul, aucune donnée ne change. **Release patch.**

## 1 · Ce qui est mesuré (Cowork, dans le code, le 13 sept. sur `07f0d74d`) – et ce que la mesure corrige de la fiche

La fiche annonce « deux exemples ». **Il y en a trois à changer, dans deux fichiers, et un quatrième qu'il ne faut PAS toucher.**

**(1) `js/interventions.js:84`** – `placeholderTitre: 'Ex. Intervention Rigueur et Nuance'`, dans le vocabulaire `interventions`.
Rendu par `:934` (`placeholder="${V().placeholderTitre}"`).

**(2) `js/interventions.js:1063`** – `placeholder="Ex. Amener Structure au seuil D (65%)"`, écrit en clair dans le gabarit du
champ « objectif visé ». ⚠ Le `65%` ne correspond même pas au seuil de l'application : `idme.insuffisant` vaut `0.64`.

**(3) `index.html:12542`** – `<li>Titre (ex: « Intervention Rigueur et Nuance »)</li>`, dans l'Aide. **Absent de la fiche.** C'est
la même phrase, lue au même moment par les mêmes collègues ; la laisser rendrait le reste incohérent. Grégoire a approuvé le même
texte de remplacement pour elle.

⛔ **`js/interventions.js:102` NE CHANGE PAS.** Le vocabulaire `rencontres` – celui que l'orthopédagogue voit sur un service dès
demain – porte déjà `'Ex. Planifier une dissertation'` : aucun nom de critère. Son écran est déjà propre.

⛔ **`js/interventions.js:30` NE CHANGE PAS** : c'est un exemple de format dans un JSDoc, que personne n'affiche.

## 2 · Les textes, approuvés tels quels

- `:84` → `Ex. Intervention sur deux critères ciblés`
- `:1063` → `Ex. Amener un critère au seuil visé`
- `index.html:12542` → `Titre (ex: « Intervention sur deux critères ciblés »)`

⛔ **Ne les reformule pas, même « en mieux ».** Ce sont ses mots ; toute variante lui revient.

## 3 · LE PIÈGE – un banc existant affirme la chaîne qu'on retire

⚠⚠ **`tests/unit/sentinelle-rencontre-sans-criteres-cibles-lot-c.test.js:86` exige littéralement
`placeholder="Ex. Amener Structure au seuil D (65%)"`.** Il rougira dès la première ligne changée.

⮕ **Ce rouge est attendu, et il ne se répare PAS en reculant sur le texte.** Mets le banc à jour dans le MÊME commit, et
**vérifie ce qu'il cherchait vraiment** : son objet est la rencontre sans critères ciblés, pas le libellé de l'exemple. S'il ne
tenait à cette chaîne que comme repère de rendu, remplace-la par la neuve ; s'il l'assertait pour elle-même, dis-le dans le
journal du commit, parce qu'alors c'est un banc qui verrouillait un mot sans le savoir.

## 4 · La preuve

Le geste est trois chaînes : la valeur d'un banc neuf est faible, celle du banc mis à jour est réelle.

- **Mutation qui prouve** : remettre l'une des trois anciennes chaînes ; le banc mis à jour doit rougir.
- **Contre-épreuve obligatoire, en une ligne de grep** : après le lot, `grep -rn "Rigueur et Nuance\|Amener Structure au seuil D"`
  sur `js/`, `index.html` et `docs/` ne doit plus rendre que le JSDoc `js/interventions.js:30`. Un reste ailleurs est un site que
  cette consigne n'a pas vu : **inscris-le, ne l'élargis pas de toi-même.**
- ⛔ **Ne touche à aucune des assertions `'Amener Structure au seuil M (75%)'` / `'(66%)'` / `'(64%)'`** des sentinelles
  #746-#551 et lot-5-cadrage-11 : ce sont des SORTIES calculées par `suggererObjectifIntervention`, pas des exemples gris.
  Si l'une d'elles bouge, le geste a débordé sur le calcul : **RECULER.**

Vitest complet. Puis `scripts/release.mjs patch`.

## 5 · Écritures de backlog, dans le même commit

- **COCHER #847.** Les trois sites sont livrés ; le quatrième (`:102`) était déjà propre – l'écrire dans la fiche, pour qu'on ne
  la rouvre pas en croyant qu'il manque.
- **RIEN d'autre.** ⛔ Ne profite pas du passage dans `interventions.js` pour toucher #857 : mesuré le 13, ce n'est pas trois
  occurrences dans ce fichier mais **huit dans quatre fichiers**, et celui qui fabrique les clés les normalise pareil. Le
  corriger ici seul casserait la correspondance.

## 6 · Ce qu'on n'annonce pas

**Pas d'entrée « Nouvelles ».** Rien ne change dans ce qu'un utilisateur peut faire ; annoncer un exemple gris serait du bruit
dans une section que les collègues découvrent mardi. Le dire dans le journal du commit suffit.

## 7 · Livraison

**RELECTURE CROISÉE DE COWORK AVANT LA RELEASE** ; verdict Playwright Cowork fermé (PROTOCOLE règle 8).
⚠ **Les corrections se font le jour même** : ces mots doivent être en ligne avant mardi.

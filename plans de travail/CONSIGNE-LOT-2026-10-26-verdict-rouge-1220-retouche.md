# Consigne – Le rouge de la 1.220.0 : recaler la spec du lot C, puis pousser (26 octobre 2026, soir)

> Écrite par Cowork le lundi 26 octobre 2026 à 18 h 25 (Toronto, mesuré par `date`), sur `main` = `1473b15a` (release 1.220.0, non poussée). Rapport lu : `RAPPORT-2026-10-26-verdict-rouge-1220.md`.

## 1. Le jugement de Cowork : la spec est périmée, l'application n'a rien

D'accord avec le rapport. `lot-C-echelles-chevrons-corbeille.spec.js` (l. 75) lit `#listeCriteres .palier-rangee`, classe retirée par le lot 3a (`cddfd207`) avec les rangées qu'elle dessinait ; l'empilement de la table qui les remplace est mesuré, vert, par `critere-algorithmique-table-de-cas.spec.js` (l. 226-245). Les deux autres mesures de la spec passent. Aucun fichier de l'application ne change.

## 2. La retouche : **recaler**, pas retirer

Décision de Cowork : la mesure reste dans la spec du lot C, recalée sur l'écran d'aujourd'hui. Motif : elle porte la règle 3 du lot C (l'empilement sous 768 px se mesure là) ; la retirer laisserait cette règle sans sa troisième mesure, et un banc se recale, il ne s'affaiblit pas.

- Ouvrir l'étape « Cas d'interprétation » avant de mesurer ; lire `[data-palier-rangee]` (la première rangée de la table des paliers).
- Les valeurs attendues sont celles que la spec de 3a mesure aux mêmes largeurs (une colonne à 700 px ; trois à 1 200 px, si la mesure le confirme) ; garde les deux autres mesures intactes. Mets à jour le commentaire de la règle 3 (« la rangée d'un palier » se règle maintenant sur la largeur de la table, `@container table-cas`).
- **Break-test** : la règle `@container table-cas (max-width: 560px)` retirée, la mesure à 700 px rougit ; restaurée, `shasum` identique.
- **Le trou qui a laissé passer ce rouge** : les specs « touchées » de 3a et 3b ont été choisies par écran, pas par sélecteur. Avant de commiter, `grep -rn` dans `tests/` chaque classe et chaque identifiant que 3a et 3b ont retirés (au moins `palier-rangee`, `palier-apercu`, `palier-projection`, `copiesExemple`, `_idCollectionChoisie`, les gestionnaires du menu « Modèle de projection »). Toute autre spec qui lit l'un d'eux : dis-la ; recale-la de la même façon si elle est périmée ; sinon, arrête-toi.

Un commit à part, tests seulement, avec ce fichier et le rapport.

## 3. Le jugement, sans une seconde suite complète

Décision de Cowork : **le verdict complet de `1473b15a` vaut pour le nouveau sommet**, à trois conditions, toutes mesurées et écrites dans la raison du jeton :

1. `git diff --name-only 1473b15a HEAD` ne nomme que des fichiers de `tests/` et de `plans de travail/` (aucun `js/`, `styles.css`, `index.html`, `version*`) ;
2. la spec du lot C, rejouée **en entier** seule, est verte ; la spec de 3a (`critere-algorithmique-table-de-cas.spec.js`) aussi ;
3. aucune autre spec n'a été recalée au § 2 (sinon : rejoue-les aussi, chacune en entier).

Si une condition manque, ne pousse pas : la suite complète repasse en dix morceaux, Cowork, Chrome et Safari fermés. Motif : le code jugé par les 1 045 autres essais est celui qui part ; rejouer 45 minutes pour une spec seule ne prouverait rien de plus.

Alors : écris le jeton de verdict pour le nouveau sommet, au format de `verifier-playwright.mjs`, sa raison disant les trois conditions et le verdict de `1473b15a` ; puis `git push` (pas `pousser.sh`).

## 4. Après le push

Le § 4 de `CONSIGNE-LOT-2026-10-26-mise-en-ligne-du-soir.md` : la 1.220 lue en bas de page chez Netlify ; le run GitHub jugé contre la baseline Linux, rien corrigé ce soir ; `RELAIS.md`, `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`.

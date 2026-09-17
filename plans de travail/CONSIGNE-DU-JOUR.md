# Consigne suivante – les pratiques de notation : ce que l'assistant écrit est ce que la note calcule (lot 28)

> Écrite le 17 septembre 2026, 7 h 59 (Toronto), sur `ae7ad6f7` (`1.142.22`), **pendant** le lot 27 (#871, volet complétion).
> **À n'exécuter qu'après le push du lot 27** : les deux lots écrivent dans `js/pratiques/`. Au démarrage : `git log` doit montrer `1.142.23` ; sinon, arrête-toi et signale-le. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-871-completion.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.

Mandat : les suites de l'audit du 16 sept. (`Rapports/AUDIT-pratiques-notation-configuration-et-discours-2026-09-16.md`, **sur la branche `audit/pratiques-notation-2026-09-16`, commit `9441b027`, pas sur `main`**). Demandé par Grégoire le 17 au matin. **Périmètre choisi par Cowork : ce qui ne lui demande ni mot ni vérification à l'écran.** Les deux constats que l'audit propose de « corriger maintenant » ont un jour de retard : ils passent en tête. Remesurés par Cowork sur `ae7ad6f7` : le code visé n'a pas bougé depuis l'audit (`_lireIndiceStocke`, `pratique-configurable.js:239` ; `methodeVersMode`, `wizard-pratique-v2.js:3082`).

## 0 · Ramener l'audit sur `main`

- Rapport, tableau du labo, compte rendu de la documentation et captures : sur `main`, tels quels.
- Les deux bancs de l'audit figent les valeurs FAUSSES (A3 : « 0 final », B2 : portfolio perdu). Ils deviennent sentinelles : les mesures A3 et B2 prennent les valeurs justes au moment où le correctif les rend vraies ; les autres gardent leurs valeurs, avec en commentaire le constat qu'elles figent et sa fiche.

## 1 · Une pratique non constructible ne devient plus « 0, final » (A-3, majeur)

- `_lireIndiceStocke` rend `null` quand l'entrée stockée porte `noteConstructible === false`. Sous une SPE créée par l'assistant (ni types de travaux ni forfaits), l'export doit dire « non constructible » à la première ET à la deuxième passe.
- Remesure les autres lecteurs de `indicesCP[da].actuel.P` : s'il en existe un autre qui prend ce 0 pour une note, même garde ; nomme-les.
- Le reste d'A-3 (l'assistant ne collecte ni types ni forfaits, et son récapitulatif ne dit pas où les régler) : **inscrire** sous #319. Pas de mots neufs dans ce lot.

## 2 · Rouvrir un modèle ne le détruit plus (B-2, majeur)

- Dans `chargerPratiqueExistante` : `approcheEvaluation` prend `'par-artefacts'` par défaut quand `config.portfolio` existe ; `methodeVersMode` connaît `recents` et `recents-meilleurs` (mesure la valeur de mode que chacun doit donner).
- Preuve : « N plus récentes » adopté, rouvert, échelle choisie, enregistré sans rien toucher d'autre → la méthode relue est « récents » et le portfolio est intact.

## 3 · Un modèle Standards adopté calcule partout ou nulle part (B-1, majeur) – mesurer d'abord

- Un modèle STD adopté tel quel n'a pas d'échelle : le profil calcule (77,32), l'export et le Comparateur disent « non constructible ». Deux écrans se contredisent sur le premier geste du labo.
- **Décision technique de Cowork** : l'adoption complète l'échelle SANS demander, **si et seulement si** une seule échelle est candidate sans ambiguïté (mesure ce que « candidate » veut dire dans l'app après le retrait d'`obtenirEchelleUtilisateur` au lot F).
- ⛔ S'il n'existe pas de candidate unique, ou si la voie exige une phrase neuve (une demande d'échelle à l'adoption), **arrête ce volet et rapporte à Cowork** : les mots reviennent à Grégoire. *Inscris* le constat, les volets 1 et 2 partent seuls.

## 4 · La sentinelle du tour complet (G-1)

- Cinq mutations sur huit ne rougissaient rien. Une sentinelle, par famille : **ce que l'assistant et le formulaire écrivent est ce qui est relu, puis ce qui calcule** – la méthode de sélection (les deux écrivains), le seuil SPE par défaut, les ids de cibles DEN, le minimum du portfolio. Le banc A de l'audit en est le brouillon.
- Rejoue les huit mutations G1-G8 : les huit rougissent.

## 5 · Inscrire le reste

« Inscrire » est l'issue de tout constat de l'audit qui n'est pas dans ce lot, **avec son numéro de constat** (A-1…G-1) dans la fiche. Les recoupements vont sous leur fiche existante (#715, #717, #339, #713, #810, #710, #483, #723) ; A-2 et A-4 sous #854 s'il existe, sinon une fiche. **Ne corrige ni n'écris aucune phrase** : A-1 (brancher ou retirer les règles spéciales de la sommative), C-1, C-2, C-6 et la ligne du glossaire (C-3) reviennent à Grégoire, un à la fois, par Cowork. La documentation (§ F) : inscrite sous #804 et #805, non touchée.

## Preuve

- Break-test : chaque assertion neuve rougit sous sa mutation (garde du cache retirée ; défaut d'`approcheEvaluation` retiré ; `recents` retiré de la table ; échelle non complétée, si le volet 3 part). Cowork en posera d'autres.
- Un banc WebKit : le parcours SPE de l'audit (E-SPE) rend « non constructible » à l'export ; le parcours « N plus récentes » adopté puis rouvert garde son portfolio.
- Vitest depuis `tests/`, puis le verdict Playwright sur le commit final, Cowork fermé. **Porte terrain : aucune attendue.**
- **Stock** : rien n'est écrit dans les données. Un indice déjà stocké « non constructible » est désormais lu comme tel ; un export déjà téléchargé avec « 0, final » ne se réécrit pas. Un modèle déjà rouvert et vidé de son portfolio ne se répare pas : dis si le cas est mesurable dans les données d'essai.

## Livraison

Patch `1.142.24` par `scripts/release.mjs`. Phrase de « Nouvelles » : propose-la à Grégoire avant de la figer (un seul message). Puis `OU-EN-EST-ON.md` (phrase « vérifié comment »), `RELAIS.md`, les fiches inscrites, le markdown du tri. Toute trouvaille reçoit l'une des trois issues ; « inscrire et continuer » est le défaut. Commite aussi les fichiers de Cowork : la consigne renommée et l'archive de celle du lot 27. Supprime la branche `audit/pratiques-notation-2026-09-16` en local seulement une fois son contenu sur `main`. Push par `scripts/pousser.sh`, puis signale à Cowork que c'est poussé.

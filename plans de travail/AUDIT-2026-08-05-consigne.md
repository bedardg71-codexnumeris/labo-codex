# Consigne — Session d'audit qualité autonome (5 août 2026)

> **Mandat donné par Grégoire le 5 août 2026 au matin**, avant une absence de
> quelques heures : « analyser le code et repérer des bugs ou des améliorations
> possibles », en travail autonome. Rejoint **#365 (« audit blanc »)**, en
> attente de tranche depuis juillet. Ce document est la référence unique de la
> session : en cas de doute sur le périmètre, c'est lui qui tranche — et ce
> qu'il ne permet pas explicitement est interdit.

---

## 0. Avant tout

1. Exécuter le **rituel de début de session** (`Skills pour Claude Code/SKILL_Debut_de_session.md`) :
   audit factuel git + tests + version + lecture SESSION.md/BACKLOG.md, et comparaison
   avec la prémisse de ce document. Si l'état du dépôt contredit ce document
   (ex. : branche mergée, déploiement fait, travail déjà livré), **suivre l'état réel**
   et le consigner.
2. Charger `SKILL_verification_adverse.md` (obligatoire — c'est un audit) et
   `SKILL_Securite_donnees.md` (les modules ciblés touchent aux données).
3. Vitest doit être vert AVANT de commencer (1295/1295 à la rédaction de ce document).
   S'il ne l'est pas : diagnostiquer et consigner, ne PAS corriger du code d'application.

## 1. Mission

**Audit en LECTURE SEULE du code d'application.** Trouver des bugs latents, des
dettes et des améliorations possibles, et les documenter assez précisément pour
que Grégoire puisse trier au retour — puis qu'une session ultérieure corrige,
dans l'ordre qu'il décidera.

**Un module à la fois, en profondeur.** Ordre de prise (risque décroissant à
~10 jours de la rentrée de la cohorte) :

1. **`js/import-export.js`** — chemins d'archives et de codex ; vérifier
   notamment la *currency* post-fusion #374 (clé `journeesSansCours`, noms
   hérités en lecture), les validations de sécurité (validerZipSecurite,
   whitelists), les chemins d'erreur (que voit l'utilisateur si l'import échoue
   à mi-parcours ?).
2. **Famille `js/trimestre-v2-*.js`** — la zone la plus retouchée cette semaine
   (fusion #374, validations #369). Chercher : références orphelines aux
   anciennes fonctions/ids, états incohérents du formulaire, chemins non
   rafraîchis après un changement de données.
3. **`js/db.js`** — les couches du stockage hybride. La leçon du 5 août
   (migration muette : clés résidentes en memoryCache seulement) suggère
   d'auditer TOUS les call-sites qui énumèrent des clés ou supposent qu'une
   donnée est en localStorage.
4. **Famille `js/planification-*.js`** — module en développement actif ;
   prioriser la clé nue partagée `planification_seances` (📐 #367 local) et les
   invariants de la carte (ids, parentIds, ordre spatial).

Faire le module 1 complètement avant d'ouvrir le 2, etc. Il est NORMAL de ne pas
tout couvrir en quelques heures — un module audité à fond vaut mieux que quatre
survolés.

## 2. Méthode (non négociable)

- **Chaque trouvaille passe par la vérification adverse AVANT d'être consignée** :
  tenter de la réfuter (relire le code appelant, chercher le garde-fou qui
  l'empêcherait, écrire une sonde jetable si besoin). Ne consigner que ce qui
  survit, avec le niveau de confiance : **CONFIRMÉ** (reproduit par sonde ou
  lecture complète du chemin) ou **PLAUSIBLE** (non réfuté, mais non reproduit).
- **Chaque bug consigné** : gravité (🔴 corrompt/perd des données ou casse un
  parcours de rentrée · 🟡 comportement faux visible · 🟢 dette/amélioration),
  scénario de reproduction concret (données + gestes), référence `fichier:ligne`,
  et correctif esquissé avec coût estimé (S/M/L).
- **Les sondes de diagnostic** (scripts Node jetables, tests exploratoires) sont
  permises et encouragées — dans le scratchpad ou `tests/`, JAMAIS committées
  si jetables.
- Si une observation concerne l'usage des formats par les testeurs, la noter
  aussi dans `Retours des testeurs/USAGE-FORMATS.md` (règle des 30 secondes).

## 3. Livrables

1. **`Rapports/AUDIT-QUALITE-2026-08-05.md`** — le rapport : sommaire exécutif
   (5 lignes max), puis les trouvailles par module, priorisées, au format ci-dessus.
   Les propositions d'items y restent **sans numéros #** : Grégoire trie au
   retour, puis on versera au BACKLOG (éviter une nouvelle collision d'IDs —
   cf. relais Cadre, renumérotation #369-#378 déjà en attente post-merge).
2. **SESSION.md** — bloc de session : ce qui a été audité, ce qui ne l'a pas
   été, les risques, l'état des tests.
3. Commits : **documents seulement** (Rapports/, SESSION.md, USAGE-FORMATS.md).
   Messages clairs, push sur la branche courante.

## 4. Interdits pendant cette session

- ❌ **Aucun correctif au code d'application** (js/, index.html, styles.css),
  même « évident », même une ligne — SEULE EXCEPTION pré-approuvée : le
  correctif `meta.duree` (coercition `parseInt` dans l'inspecteur de
  planification, signalement du rituel du 4 août), À CONDITION d'ajouter sa
  sentinelle et de la break-tester ROUGE→VERT.
- ❌ Aucun bump de version, aucune entrée de changelog.
- ❌ Aucun nouvel item numéroté au BACKLOG (propositions dans le rapport).
- ❌ Ne pas toucher aux zones protégées (config.js, navigation.js,
  noms_stables.json) — même pas en lecture-écriture de commentaires.

## 5. Fin de session

Rituel de fin (`/fin-de-session`) adapté au périmètre documentaire : arbre
propre, Vitest vert (inchangé), rapport poussé, SESSION.md à jour avec le
signet remonté. Terminer par le résumé : fait / reste / risques.

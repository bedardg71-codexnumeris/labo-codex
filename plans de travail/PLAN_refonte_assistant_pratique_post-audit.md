# PLAN — Refonte ciblée de l'assistant de pratique (post-audit) + Dénotation #318

**Date** : 5 juin 2026 (session Cowork, décisions Grégoire consignées)
**Sources** : `Rapports/AUDIT-assistant-configuration-2026-06-05.md` (audit complet, verdicts A1-F4) · BACKLOG #318 · SUIVI-BUGS #131-#135 (livrés, lot #317, 1.1.3)
**Statut** : plan validé en conception — exécution par Claude Code, lot par lot
**Versionnage cible** : `minor` à la livraison complète (voie rapide + deux portes = capacités visibles)

---

## 0. Pourquoi une refonte ciblée (et pas des retouches, ni une réécriture)

Question posée par Grégoire le 5 juin : « Devrait-on faire une refactorisation de l'assistant ? » **Réponse : oui, ciblée.** Trois conditions sont réunies qui rendent le moment exceptionnellement favorable :

1. **Le filet existe** : #317 a posé une sentinelle round-trip (10 cas) + 206 Vitest verts. On peut refactorer sous golden master, méthode éprouvée par la Session C.
2. **Le canonique est consolidé** : depuis #303 Sessions B-C, le registre est la source unique des représentations et les ids canoniques (`sommative`/`standards`/`specifications`/`denotation`) sont la norme. Or le wizard travaille encore en vocabulaire **interne legacy** (`pan-standards`, `pan-specifications`) avec conversion aux frontières (`canonVersInterne`, marquée « transitoire — retirée à l'étape 6 » dans le code). Ajouter la Dénotation en vocabulaire legacy étendrait la couche à retirer — la mauvaise direction.
3. **Les changements demandés sont structurels** : inverser l'ordre des écrans (a6), ajouter une entrée à deux portes (a7), une voie rapide (a2), des reprises transversales (a3) et une 4e famille (#318) — empiler ça sur le graphe actuel sans nettoyer serait exactement ce que le principe zéro-dette interdit (« tout nouveau chantier RETIRE ce qu'il remplace »).

**Ce qu'on ne fait PAS** : réécrire la machine. L'architecture déclarative (`ETAPES_WIZard` = étapes comme données, navigation conditionnelle, historique de pile) est saine — c'est elle qui a permis de corriger #134 en dérivant la progression du graphe réel. La refonte se fait DANS cette architecture.

**Décisions Grégoire (5 juin)** : a2 = lien « Je sais ce que je veux » sur Q1 (pas d'écran ajouté) · a6 = inversion (classification d'abord, admin avant récap) · a7 = écran d'entrée à deux portes (modèle vs décrire) · #318 = périmètre minimal + fondations (reconnaître, badge, option « à venir » — parcours créable DEN reporté).

---

## 1. Lot 1 — Fondations (le refactor proprement dit)

**Objectif** : vocabulaire canonique de bout en bout dans le wizard + purge du code mort. Aucun changement visible à l'écran.

- **Golden master AVANT tout** : test qui rejoue les parcours S1 (sommative simple), S2 (standards/objectifs/seuils-critiques) et SPE (jetons + bundles) et fige l'objet `pratique` produit (structure complète). C'est le contrat : après Lot 1, mêmes entrées → mêmes objets (au champ `type` près, déjà canonique à l'écriture).
- **Canonicalisation interne** : `deduireTypePratique` produit `sommative`/`standards`/`specifications` (plus `pan-*`) ; toutes les comparaisons internes (`typePratique === 'pan-standards'` etc.) migrent ; retrait de `canonVersInterne` et du mapping legacy de `chargerPratiqueExistante` (la normalisation `normaliserIdPratique` à la lecture reste, elle est défensive). Exécute pour le wizard l'« étape 6 » annoncée dans les commentaires du code (architecture A-2 « interne legacy + canonique à la frontière » : la frontière disparaît).
- **Purge** : étape `mode-configuration` retirée (remplacée par la voie rapide du Lot 2) ; étape `config-reprises` retirée APRÈS récupération de ses champs par le Lot 3 (ordre d'exécution : Lot 3 avant la purge finale, ou purge en fin de Lot 3 — au choix de l'exécutant, mais pas d'alias « au cas où »).
- **Tests** : golden master 3 parcours + sentinelle #317 inchangée verte.
- **Risque** : moyen (renommages transversaux) — entièrement couvert par le golden master. **Effort : ~2-3 h.**

## 2. Lot 2 — Nouvelle entrée et nouvel ordre (a7 + a6 + a2)

**Objectif** : le novice rencontre du sens d'abord ; l'expert passe vite.

- **a7 — Écran d'entrée à deux portes** (nouvelle étape 1) : « **Partir d'un modèle** » (liste les gabarits de `MODELES_PRATIQUES_PREDEFINIS` + pratiques `dansBibliotheque` de la bibliothèque, avec badge famille via le registre) ou « **Décrire ma pratique** ». Adopter un modèle = pré-remplir `wizardState.reponses` depuis le gabarit + sauter au récapitulatif (l'utilisateur ajuste le nom, peut revenir en arrière pour modifier). Décrire = parcours actuel.
- **a6 — Inversion** : ordre devient entrée → classification (Q1/sous-questions) → branches de configuration → échelle/grille → **infos-base** (nom, auteur, licence CC — pré-remplissage profil enseignant conservé) → récapitulatif. Le champ « nom » du récap (déjà éditable) devient cohérent : on nomme sa pratique une fois qu'on sait ce qu'elle est.
- **a2 — Voie rapide** : lien discret sous les cartes de Q1 — « Je sais déjà ce que je veux » → choix direct de famille (cartes SOM / STD / SPE / **DEN désactivée « à venir »**, libellés du registre) → saut à la branche de configuration. Pas de nouvel écran imposé au novice.
- **Tests** : golden master mis à jour (mêmes objets produits, ordre de collecte différent) ; sentinelle navigation (porte modèle → récap pré-rempli ; voie rapide → branche directe ; retour arrière à travers la nouvelle frontière infos-base).
- **Risque** : moyen (navigation) ; l'historique de pile gère déjà les sauts. **Effort : ~4-5 h.**

## 3. Lot 3 — Reprises et garde-fous pédagogiques (a3 + a4 + a11)

**Objectif** : les défauts enseignent la prudence (corpus : *Reasonable reassessments*, *Whoops*).

- **a3** : question reprises pour **sommative** et **objectifs** (champs récupérés de feu `config-reprises` : permises ? mode limité/illimité, max) ; défaut artefacts passé de « Illimitées » à « **Limitées** » ; une ligne de repère sous chaque champ reprises : « Des reprises limitées favorisent des soumissions mieux préparées — tu pourras assouplir ensuite. »
- **a4** : garde-fou doux si `nbObjectifs > 15` (info non bloquante : « Au-delà d'environ 15 objectifs, l'évaluation devient difficile à soutenir sur une session — c'est toi qui décides »).
- **a11** : la carte « Remplacement automatique » gagne sa signification pédagogique : « l'évaluation finale remplace la mi-session si elle est meilleure — une forme de reprise sans pénalité ». (Nommer le pilier que le prof sommatif pratique déjà.)
- **Purge finale de `config-reprises`** (cf. Lot 1).
- **Tests** : sentinelle défauts (artefacts = limité ; sommative/objectifs : reprises persistées dans `configuration.reprises`) ; vérifier que `pratique-configurable` consomme bien ces champs (sinon, tracer l'écart au backlog — ne pas inventer de consommation côté calcul dans CE plan).
- **Risque** : faible-moyen (nouveau champ consommé ou non par le calcul — à vérifier explicitement). **Effort : ~2-3 h.**

## 4. Lot 4 — Récapitulatif enrichi (a8 + a9)

**Objectif** : montrer la conséquence des choix ; rassurer sur la non-destruction.

- **a8 — Exemple réel** : le moteur #307 est livré (`simulerIndices(da, pratiqueId)`, lecture seule). Au récap, si la démonstration est disponible : calculer l'exemple sur 1-2 profils-types démo du namespace `demo_*` / `DEMO0xx` (« Avec ces réglages, un·e étudiant·e comme [profil démo fort/en difficulté] obtiendrait ~X % »). Repli si démo absente : exemple statique calculé des seuils. ⚠️ **Coordination** (mise à jour 7 juin) : c'est un mini-usage du moteur, PAS la vue du Comparateur de pratiques — laquelle est désormais **livrée** (sous-section pérenne Labo › Comparateur, C0→C4). Ici, un chiffre et une phrase suffisent ; ne pas réimporter la vue du comparateur dans le récap. NB : le « groupe démo 9999 » mentionné dans les notes amont est un **vestige** — la démo est `demo_*` / `DEMO0xx`.
- **a9 — Réassurance** : au récap (création seulement, pas édition) : « Ta pratique active n'est pas modifiée — celle-ci s'ajoute à ta bibliothèque. » (La garantie existe dans `sauvegarderPratique` ; on la rend visible.)
- **Tests** : sentinelle a8 (pratique simulée ≠ pratique active ; lecture seule — aucun write `indicesCP`) ; affichage conditionnel a9.
- **Risque** : faible (lecture seule, repli statique). **Effort : ~2-3 h.**

## 5. Lot 5 — Dénotation, périmètre minimal + fondations (#318)

**Objectif** : DEN cesse d'être invisible, sans inventer son modèle de calcul.

- **(a) Reconnaissance** : `deduireTypePratique` et `chargerPratiqueExistante` reconnaissent `denotation` (id canonique — gratuit après Lot 1) ; l'édition d'une pratique DEN existante affiche son badge au lieu d'« Indéterminé ».
- **(b) Badge récap** : entrée `denotation` dans `typeBadges` (libellé et couleur du **registre**, `--den-violet`, via la classe `--recap-couleur` posée au #135b) + description courte honnête (« Rétroaction qualitative et jugement global — famille en construction dans Labo Codex »).
- **(c) Voie expert** : carte DEN visible mais désactivée « à venir » (déjà prévue au Lot 2).
- **HORS périmètre (reporté, tracé #318)** : le parcours de création DEN complet — il exige de concevoir le modèle de calcul (jugement global → note chiffrée obligatoire au registre, friction RREC relevée par l'audit de conformité C6) et son contenu pédagogique (le corpus archivé note que l'ungrading repose lui aussi sur standards/specs implicites — *Standards or specifications?*). Ce travail de conception rejoint le chantier guide PAN.
- **Tests** : sentinelle édition DEN (badge correct, pas de régression SOM/STD/SPE).
- **Risque** : faible. **Effort : ~1-2 h.**

## 6. Lot 6 — Validation et release

- Rejouer les **3 walkthroughs de l'audit** (S1 novice, S2 expert, S3 transition) comme tests d'acceptation — l'audit § 2 sert de scénario.
- Terrain Mac + iPad, modes sombre/clair (récap refondu au #135b + nouvel écran d'entrée + voie rapide).
- `cd tests && npm test` ; `node scripts/release.mjs minor` ; changelog : 1 entrée orientée utilisateur (« Assistant de pratique : partir d'un modèle, voie rapide, reprises configurables partout »).
- Mise à jour : BACKLOG (#318 partiel, #319 livré), SESSION.md relais, et re-passage de l'audit (les verdicts ❌/🟡 touchés passent à ✅ — annexe au rapport dans `Rapports/`).

---

## Contraintes transversales (rappel CLAUDE.md)

- Design system : variables CSS uniquement, 2 modes, cibles 44 px (nouvel écran d'entrée).
- `echapperHtml()` sur toute donnée utilisateur injectée (noms de gabarits de la bibliothèque à l'écran d'entrée !).
- `data-action`, zéro handler inline ; zéro `console.log`.
- `config.js` / `navigation.js` protégés — le wizard est une modale, aucune raison d'y toucher.
- Un lot = un commit (ou plus), tests verts à chaque commit, `git add` explicite.

## Hors périmètre de ce plan

- Parcours créable DEN (reporté, #318) · Comparateur de pratiques (réflexion Cowork en cours) · Hybridation standards+specs par évaluation (audit B4) · Guide PAN (plan séparé : `Plan Accompagnement/PLAN_guide_PAN_pedagogique_CSE.md`) · Renvois wizard→guides (dépend de la livraison du guide PAN ; tracé comme exigence C5 dans l'audit).

**Estimation totale : ~12-16 h** en 6 lots indépendamment commitables, dans l'ordre 1 → 2 → 3 → 4 → 5 → 6 (le Lot 1 est le prérequis de tous ; 3, 4, 5 sont permutables après 2).

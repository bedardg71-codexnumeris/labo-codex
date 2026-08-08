# PLAN MI-AOÛT 2026 — « App stable pour la CoP / expérimentateurs »

**Date** : 28 juin 2026
**Nature** : document de cadrage autoportant, produit en session Cowork (analyse du backlog + vérification ciblée au code).
**Destinataire** : la/les session(s) Claude Code qui prendront ces tâches.
**Objet** : rassembler, prioriser et cadrer ce qui reste pour l'objectif **mi-août 2026** ; ne pas avoir à re-trier le backlog item par item.

> **Caveat de fraîcheur.** Les statuts ci-dessous sont **tels que consignés dans `BACKLOG.md` / `SUIVI-BUGS.md` au 28 juin 2026**, recoupés au code là où c'est noté « vérifié ». Le backlog a déjà montré des désyncs (cf. #326-T1/T2, relais dédié). **Chaque tâche s'ouvre donc par le rituel `SKILL_Debut_de_session.md`** (audit git + tests + version) avant de planifier – ne pas faire confiance à une ligne sans la re-vérifier.

---

## 0. TL;DR

L'objectif mi-août n'est **pas** dans le backlog comme une liste : il se reconstruit de trois ancres – la légende (`🟡 = important pour expérimentateurs post-AQPC, juin-été`), la note #326 (« bloqueurs CoP, mi-août ») et le jalon #329 (« pilote fin août »). Ce qui reste se range en **trois paliers** : **bloquant-confiance**, **polish**, **reportable**. La découverte importante de la vérification : plusieurs items lourds en apparence (#334, #336, #329, #340) sont en réalité **du terrain ou des décisions Grégoire**, pas du code Claude Code. Le vrai chantier *code* de stabilité tient en une poignée de bugs de justesse/données (#362, #350, #346, #342, #332) + la réactivation du comparateur (#326, déjà en cours). Le volume de 🟡 dépasse la fenêtre de 7 semaines : un arbitrage Grégoire est requis (§9).

---

## 1. Le cadre (contexte de cadrage)

- **But mi-août** : une application **stable, à expérimenter par des externes** (première vague d'expérimentateurs post-AQPC ; CoP de l'AQPC). « Stable » ici = un utilisateur *frais* ne rencontre ni note fausse, ni donnée corrompue, ni aide périmée, ni saturation iPad.
- **Deux jalons explicitement datés** :
  - **mi-août** : comparateur réactivé (#326, « candidat n°1 des bloqueurs CoP ») ;
  - **fin août** : pilote restreint de la Voûte (#329, toi + 2-3 collègues).
- **Exclu par décision Grégoire (28 juin)** : l'**article longitudinal avec Steve Bissonnette** et toute la ligne recherche qui le sert directement – **#35** (import H2024), **#36** (rapport comparatif), **#245**, **#241**. La migration intertrimestre **#358** reste hors de ce plan *en tant que chantier* (elle sert l'article et tourne déjà en parallèle), mais ses **effets de bord d'intégrité de données** qui faussent l'app *aujourd'hui* (ex. #362) sont gardés côté stabilité.
- **Filtre de la légende** : `🟢` = « peut attendre la rentrée d'automne » → **hors mi-août** ; `📦` = reporté/hors v1.0 → hors mi-août ; `📐` = décision UX en attente (à débloquer par toi avant code) ; `⚠️` = priorité haute actée ; `🔴` = critique.

---

## 2. Principes de priorisation et contraintes d'exécution

1. **Retours testeurs AVANT le backlog** (politique `CLAUDE.md`). Un bug terrain signalé interrompt le plan.
2. **À l'intérieur des 🟡, l'axe n'est pas « 🟡 vs 🟢 » mais « confiance d'un externe vs polish »** : justesse de la note, intégrité des données, aide à jour, iPad qui ne sature pas → AVANT emojis SVG, dédup de sélecteurs, etc.
3. **Tout item qui touche des données réelles = séance dédiée** : backup Codex d'abord, dry-run/preview en lecture seule, **golden master L0 avant/après** (MAE Omnivox < 0,5 sur a2025 ; h2026 = self-compare), break-test `--prouver-rougit`. Jamais d'écriture live sans ce filet (cf. #358, `CADRAGE-briques-C-D-namespacing.md §3.4`).
4. **Valider Mac ET iPad, modes sombre et clair.** L'iPad est le 2e cas d'usage ; les rendus UI ne sont pas vérifiables hors navigateur.
5. **Zéro-dette** : tout chantier retire ce qu'il remplace ; pas d'alias « au cas où ».
6. **Parallélisme** : #358 (intertrimestre) occupe déjà Claude Code. Ce plan est une **file séparée** ; ne pas présumer que les deux avancent à pleine vitesse simultanément.

---

## 3. Répartition porteur (à lire avant de planifier)

La vérification du 28 juin montre que plusieurs items ne sont **pas** des tâches de code :

- **Terrain / décision Grégoire (PAS Claude Code)** : #334 (validation iPad), #336 (validation + décision d'exécuter la purge), #329 (revue du format + re-passe iPad + pilote), #340 (confirmation terrain), volet « vérifier H26 » de #350, et toutes les lignes `📐` (décision UX) tant qu'elles ne sont pas tranchées.
- **Code Claude Code** : #326-T3/T4, #362, #350 (correctif), #346, #342 (script de réparation), #332 (Constat 1), #299, #291, #286, #313/#279 (après décision), #328 L2-b2/L2-c.

Quand une tâche est « terrain », le rôle de Claude Code se limite à **préparer le geste** (script console read-only, checklist, preview) et à **attendre le compte rendu** – pas à écrire en live.

---

## 4. PALIER 1 — BLOQUANT-CONFIANCE (avant d'exposer l'app à des externes)

| # | Drapeau | État (consigné 28 juin) | Reste à faire | Porteur | Type de séance |
| --- | --- | --- | --- | --- | --- |
| **#326** réactivation comparateur | 🟢 (mais « bloqueur CoP ») | **EN COURS.** T1-affichage réglé (19 juin `b18b34fb`), T2 quasi non-bug, T5 trivial. | **T3** (préremplissage en édition) + **T4** (dérivation = wizard complet vs « assistant condensé » SPEC §8) ; trancher le nœud **STD = 0** (moteur). Puis repasser `COMPARATEUR_VISIBLE=true`. | Claude Code + décision Grégoire (STD=0) | Code + terrain Mac/iPad. **Voir `RELAIS-326-reactivation-comparateur.md`.** |
| **#362** grilles h2026 désappariées | 🟡 | Découvert 28 juin (nuit), lecture seule. 408 évals pointent vers 3 grilles absentes ; dropdown montre 3 copies orphelines « …A25 ». **Englobe #354.** | Recréer les 3 grilles **sous les ids attendus par les évals** (contenu des copies A25 + noms propres) ; fixer `grilleReferenceDepistage`; retirer les orphelines ; **vérifier aussi échelles + cartouches**. | Claude Code (prépare) + Grégoire (exécute live) | **Séance dédiée**, backup + L0 h2026 avant/après identique. Plan : `RELAIS-grilles-h2026-desappariees.md`. |
| **#350** recalcul éval A25 (note gonflée) | 🟡 | Le critère FR algo affiche 0 erreur au lieu du nombre stocké → note recalculée gonflée (76,6 → 88 %). **Données stockées intactes**, L0 vert. | Corriger la restauration du champ `totalErreurs` quand le mode catégories n'est pas activé ; **vérifier le comportement sur H26**. | Claude Code (correctif) + Grégoire (vérif H26) | Code + sentinelle ; terrain. |
| **#346** `coursId` non migré sur productions | 🟡 | Réparé en données (24 juin, console). | **Cause de fond** : fiabiliser la migration d'id de cours pour inclure `productions` ; dédupliquer les fiches `cours` en double/triple ; corriger le warning « Fichier sous X » trompeur (`liste-evaluations.js:67`). | Claude Code | Code + sentinelle. |
| **#342** attribution CC erronée | 🟠 | **Prévention LIVRÉE** (1.20.0 : plus de repli silencieux, défaut « Inconnu »). | **Réparation des données déjà stampées** : one-shot console READ-ONLY puis ré-écriture `auteur_original` (checklist §H). | Claude Code (script) + Grégoire (exécute) | Script read-only d'abord, sur Mac. |
| **#332** horaire ↔ groupe-cours | 🔴 | Constat 2 LIVRÉ (11 juin, SSOT-first). | **Constat 1** : sauvegarde UI non persistée. Envisager de l'adjoindre à #328 L2 (même patron). | Claude Code | Code + sentinelle. |
| **#340** écrasement productions au changement de trimestre | 🟡 | Symptôme réparé + **garde-fou actif livré** (1.17.7), prouvé par break-test. | **Confirmation terrain** + capture de la pile de l'écrivain fautif au prochain déclenchement. | Grégoire (terrain) | Observation ; pas de code tant que la garde n'a pas journalisé. |
| **#334** saturation import codex iPad | ⚠️ | **A/B/C/D LIVRÉS** (jusqu'à 1.17.9). | **Validation terrain iPad** (refus réel sur appareil saturé, petit codex qui passe). Clôturable après. | Grégoire (terrain) | Terrain iPad. |
| **#336** codex n'efface pas l'espace précédent | ⚠️ | **Preview read-only + purge manuelle LIVRÉS.** Purge auto volontairement non activée. | **Validation terrain Mac/iPad** ; **décider si/quand exécuter** `Codex.purgerEspacePrecedent()` sur les vraies données. | Grégoire (terrain + décision) | Terrain + comptage console d'abord. |

---

## 5. PALIER 2 — POLISH / souhaitable (reportable si la fenêtre serre)

| # | Drapeau | État / reste | Porteur |
| --- | --- | --- | --- |
| **#299** références d'onglets périmées dans l'aide | 🟡 | Balayage des « Réglages → X », « onglet Contexte/Structure » périmés dans les textes d'aide. Important car un externe lit l'aide. | Claude Code |
| **#313** deux sélecteurs « Production » à l'import | 📐 🟡 | Clarifier / dédupliquer. **Décision UX d'abord.** | Grégoire (décide) → Claude Code |
| **#279** 3 champs au formulaire de production | 📐 🟡 | Description détaillée / format-mise en page / remise. **Décision UX d'abord.** | Grégoire (décide) → Claude Code |
| **#291** workflow de résolution de doublons (biblios) | 🟡 | Détection par similarité (nom approx. + nb critères + structure + `idOriginal`), pas par nom exact. Touche grilles/cartouches/échelles/productions/pratiques. | Claude Code |
| **#286** emojis UI → icônes SVG icons8 | 🟡 | Chantier en 5 lots, cosmétique. | Claude Code |
| **#273** évaluations démo (vrais travaux anonymisés) | 🟡 | Préfixe `PROD_DEMO_` obligatoire ; 2-3 dossiers complets. Matériel pour expérimentateurs. | Grégoire (anonymise) + Claude Code |

> **#328 (SSOT `modalitesEvaluation`, 🟡)** est volontairement **hors des deux paliers ci-dessus pour l'instant** : restent L2-b2 (~46 sites d'affichage) et L2-c (jetons), **séquencés APRÈS la clôture de la Voûte #329**, à haut risque (touchent le calcul). C'est de l'architecture interne, pas une stabilité visible par un externe. **Décision §9** : entre-t-il dans la fenêtre mi-août ou glisse-t-il à l'automne ?

---

## 6. PALIER 3 — REPORTABLE (hors mi-août, assumé)

- **Article + recherche** : #35, #36, #245, #241 (exclus par Grégoire).
- **🟢 « rentrée d'automne »** : #361 (suppression de trimestre), #349 (flicker cosmétique), #347 (rétroaction recalculée), #301, #283, #310, #311, #324, #275, #240, #18, #344, #297, #304, #257v2.B, #274, #351, #177, #178, #272, #307, #339 (selon arbitrage), #47.
- **📦 hors v1.0** : #306, #2, #140, #268-#271, #33.

---

## 7. Séquencement recommandé (ordre de prise)

1. **Finir #326** (déjà en cours) → réactiver le comparateur. C'est le seul jalon nommément « mi-août ».
2. **#362** en séance dédiée (donnée fausse *aujourd'hui*, la plus visible).
3. **#350** puis **#346** (justesse de note + associations de productions – ce qu'un externe verrait en premier).
4. **#342** réparation données (script read-only).
5. **#332** Constat 1, idéalement **adjoint à #328 L2** (même patron).
6. **Voûte #329** : revue du format avec toi, re-passe iPad, → pilote fin août.
7. **Terrain Grégoire** en continu : #334, #336, #340 (n'attendent pas Claude Code).
8. **Palier 2** au fil de l'eau, en bouche-trou entre les séances dédiées.
9. **#328 L2-b2/L2-c** : seulement si la fenêtre le permet, après Voûte (§9).

⚠ **Parallélisme** : #358 (intertrimestre) tourne en même temps. Ne pas planifier les deux files comme si elles avançaient à plein régime ensemble.

---

## 8. Déjà dérisqué (ne pas re-diagnostiquer)

- **#353** saturation localStorage → **reclassé 🟢, risque de PERTE FERMÉ** par la durabilité Option A/B/C (PR #70+#71, main 1.24.2). Reste de l'observabilité, pas une perte.
- **#352** écrasement `a2025_productions` → **réparé en données** (26 juin), tient après recharge.
- **#360** distinguer reprises/doublons → **cœur livré** (1.24.0, vérif adverse 6 agents).
- **#348** crash consultation éval A25 grille manquante → **résolu + validé terrain** (25 juin).
- **#326-T1/T2/T5** → réglés ou quasi (voir relais #326 §4).
- **#334 A-D**, **#336 preview/purge** → code livré ; ne reste que le terrain.

---

## 9. À trancher par Grégoire (décisions qui débloquent le code)

1. **Le volume dépasse la fenêtre.** ~14 items 🟡 ouverts + #358 en parallèle, 7 semaines. **Quels 🟡 sont vraiment « confiance externe » (palier 1) vs « polish reportable » (palier 2) ?** Le présent classement est une proposition.
2. **#328 L2-b2/L2-c entre-t-il dans mi-août** (après Voûte) **ou glisse-t-il à l'automne** ? Haut risque, gain invisible pour un externe.
3. **Nœud STD = 0** (#326) : le 0 de PAN-Standards est-il légitime, ou le moteur doit-il rendre `null` (→ « non constructible ») ? (relais #326 §5).
4. **Décisions UX en attente** : #313 (sélecteurs Production), #279 (champs production) – à trancher avant de coder.
5. **Voûte #329** : confirmer la taille max (50 Mo) et les champs exclus du format avant le lot final.
6. **#336** : exécuter ou non la purge automatique de l'espace précédent sur les vraies données.

---

## 10. Pointeurs

- **Suivi** : `BACKLOG.md` (légende + items), `Retours des testeurs/SUIVI-BUGS.md` (priorité absolue).
- **Comparateur** : `plans de travail/_archives/RELAIS-326-reactivation-comparateur.md`, `SPEC_D_exploration_pratiques.md`.
- **Grilles h2026** : `plans de travail/RELAIS-grilles-h2026-desappariees.md` (#362).
- **Voûte** : `plans de travail/PLAN-VOUTE-PHASES-1-8.md` (#329).
- **SSOT modalités** : `plans de travail/PLAN-328-L2-degonfler-miroir.md`, `Rapports/AUDIT-SSOT-MODALITES-EVALUATION-2026-06-10.md`.
- **Import iPad** : `Rapports/analyse-saturation-import-codex-ipad-2026-06-10.md` (#334), architecture `docs/architecture/ECOSYSTEME-DONNEES.md` (#336).
- **Filet données** : `plans de travail/CADRAGE-briques-C-D-namespacing.md §3.4` (backup + dry-run + L0 + break-test).
- **Rituels** : `Skills pour Claude Code/SKILL_Debut_de_session.md` (ouvre chaque tâche), `SKILL_Fin_de_session.md §4` (break-test avant de déclarer fini).

> Rappel : ce plan est une **vue de cadrage au 28 juin**, pas une source de vérité. La source reste `BACKLOG.md` + `SUIVI-BUGS.md`, re-audités au début de chaque tâche.

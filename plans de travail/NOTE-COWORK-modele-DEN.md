# NOTE COWORK — Conception du modèle DEN (Dénotation / ungrading)

**Date** : 6 juin 2026
**Statut** : conception **close (6 juin 2026)** — modèle à deux couches acté (voir callout §5). AUCUN code. Sépare la **conception du modèle** (faite) de l'**implémentation** (couche 2 = #318 ; couche 1 = #321), séquencée après #319/Comparateur. Prochaine étape : spec d'implémentation quand le tour viendra (mêmes lots que pour le Comparateur).
**Pourquoi maintenant** : DEN est la seule famille sans modèle de calcul ; le corpus est complet ; l'amener maintenant dé-risque l'architecture des 4 familles avant qu'elle ne fige (cf. obs. §4).

---

## 1. Ce qu'est DEN (corpus, non négociable)

- **Pas** un « jugement global qualitatif » flottant, et **jamais « pas de chiffre »** : une note finale certificative est **toujours** produite (RREC : 60+ réussite / 59- échec).
- Définition opératoire (Talbert, *media guide*) : aucune marque sur les travaux, rétroaction, portfolio, reprise/resoumission, **note finale collaborative**.
- Le jugement certificatif repose sur la **qualité des productions liées à des cibles d'apprentissage** — pas sur leur nombre ni leur simple remise (CoP, Mathieu & Philippe).
- **Garde-fou d'équité (Dyer)** : la note finale **holistique** est la plus exposée aux biais implicites. Le modèle doit donc imposer **traces + critères explicites** (cibles jugées atteintes), pas un chiffre nu.
- **Posture** : l'algorithme propose, le jugement tranche (Voisard). L'outil ne hiérarchise pas les familles.

## 2. Sources

- **CoP — billet dénotation** : « Évaluer en réduisant ou éliminant le recours aux notes » (Mathieu Poulin-Lamarre & Philippe Langlois, Cégep de Sherbrooke) — **source des trois scénarios** (§3).
- **CoP — démarche** : « Quatre étapes pour intégrer des PAN » (Arseneault-Hubert & Voisard) : cibles → atteinte → composition de la note → occasions multiples. C'est l'ossature suivie par les praticiens de la dénotation.
- Blum (2020) *Ungrading* ; Dyer (équité) ; Talbert *media guide* / *Mythbusters* ; CSÉ 2018.
- Tous archivés dans le dossier Cowork « description des pratiques de notation/ ».

## 3 bis. Apport décisif — Girouard-Gagné et al. (2024), revue systématique « Évaluer sans noter »

Document clé (CRIRES, 2024 ; Girouard-Gagné, Langlois, Poulin-Lamarre, Goulet, Tardif — même cercle que le billet CoP, mais académique et rigoureux). PDF archivé : `description des pratiques de notation/Girouard-Gagné_cégeps.pdf`. **Il recadre la conception sur cinq points :**

1. **PRÉN ≠ PAN (tension taxonomique à acter).** L'article distingue les **PAN** (qui *renouvellent* la notation : standards, spécifications, maîtrise, contrat) des **PRÉN** = pratiques de réduction ou d'élimination de la notation (qui critiquent la notation *en tant que telle* et séparent apprentissage/évaluation de la notation). **Dénotation/ungrading = PRÉN, pas PAN.** Or Labo Codex range DEN sous la famille « PAN » (suivant le billet CoP vulgarisé, qui fond la dénotation comme 3e famille PAN). Choix conscient à documenter : l'app suit la vulgarisation, l'académique sépare. → impacte le badge famille du registre et le §2 bis du SKILL_pratiques_notation.

2. **Meilleure ossature = l'échelle de gradation de l'article** (Figure 1), pas seulement les 3 scénarios du billet. Continuum rupture partielle → complète : **(1) dissimuler/reporter** la note (la rétroaction passe d'abord) ; **(2) réduire** son intervention (fréquence ; classement/déclassement ; verticalité du pouvoir) ; **(3) éliminer** la note → évaluation narrative (sur certaines épreuves, ou tout le cours/trimestre). Liste concrète (Normann et al.) : rétroaction, réussi/échoué, évaluations narratives, **notes masquées/différées**, rubriques. → ajoute le mode **note différée/masquée**, absent des 3 scénarios, et c'est l'entrée la plus prudente.

3. **Noter ≠ évaluer (l'articulation la plus nette).** La notation a deux fonctions propres : **standardiser** (situer vs étalon) et **trier** (classer). Les PRÉN abandonnent le **tri**, gardent la **certification**. → affine « sortir du paradigme du cumul » : c'est *sortir de la fonction de tri, en conservant la certification RREC*. DEN garde un chiffre uniquement parce que le RREC l'exige pour certifier, jamais pour classer.

4. **Le levier, c'est la rétroaction DISSOCIÉE de la note — pas l'absence de note.** Résultat empirique central (Pulfrey ; Butler ; Black & Wiliam) : bonifier la rétroaction **n'a presque aucun effet si une note l'accompagne**. C'est la séparation note/rétroaction qui fait travailler la rétroaction (sinon « defensive feedback »). → le cœur de DEN n'est pas « pas de chiffre », c'est **empêcher le chiffre de noyer la rétroaction** → valide le mode (1) comme premier mode.

5. **Garde-fous empiriques.** Motivation autonome : effets positifs. **Santé mentale : nuancée** — certains étudiants stressés par l'absence de repères (notes). DEN n'est pas un bien universel (renforce Dyer + pluralisme). Presque toutes les PRÉN s'accompagnent de **changements pédagogiques** (surtout la rétroaction) : l'app modélise la composition de la note ; le virage pédagogique vit hors de l'app (guide PAN). Champ jeune (16 études, aucune au Québec, contexte cégep unique : à la fois éveil et sélection compétitive) → modèle **configurable et révisable**, pas figé.

**Reframe acté** : les modes de DEN s'ancrent désormais sur la **gradation** (§3 bis pt 2), pas sur les scénarios CoP (qui restent un éclairage). Même mécanique sous-jacente (note entrée/suggérée + garde « cibles atteintes »).

## 3. Espace de design — les trois scénarios CoP (éclairage ; subsumés par la gradation §3 bis)

1. **Portes réussi/non-réussi** : quelques évaluations en mention dichotomique, posées comme **conditions de réussite** du cours ; la note finale est **différenciée par d'autres modalités** (autoévaluations, objectifs facultatifs, activités supplémentaires). — « changements prudents ». Proche de la machinerie **SPE** (conditions/forfaits) + une couche de différenciation.
2. **Aucune note sur les performances** ; note finale par **stratégie définie d'avance** : holistique, co-décidée enseignant·e–étudiant·e, ou laissée au jugement de l'étudiant·e **à condition que l'enseignant·e juge les cibles atteintes**. — le vrai *collaborative grading*. La note est un **jugement saisi**, possiblement avec **suggestion statistique** (le mode **holistique** de STD le fait déjà : mode/médiane/moyenne + ajustement).
3. **Sans classement intégral** : même note pour quiconque atteint les cibles (= réussi/échoué pour tout le cours). — cas dégénéré : seuil binaire « cibles atteintes → note fixe ».

## 4. Observation architecturale clé (ce qui justifie d'avoir amené DEN maintenant)

Dans les scénarios 2 et 3, **la note n'est pas construite à partir d'artefacts — c'est un jugement entré.** Or `calculerDetailsNoteFinale` / `simulerIndices` **construisent** la note depuis les artefacts (STD) ou les seuils (SPE). DEN introduit donc un ingrédient neuf : une **`noteFinale` saisie** (avec suggestion optionnelle), **gardée** par un « cibles atteintes » (confirmation enseignante).

**Conséquences à trancher :**
- **Moteur** : DEN ≈ (STD-holistique pour la suggestion) + (chemin de note **entrée**) + (garde « cibles atteintes »). Largement réutilisable, mais le « chemin entré » n'existe pas encore.
- **Comparateur** : un jugement ne se **simule** pas sur des données démo sans enseignant·e présent·e. Une colonne DEN ne serait donc **pas un 4e nombre comparable** — elle dirait plutôt « cette note est un jugement, pas un calcul sur les données ». Pédagogiquement vrai et fort (DEN est catégoriquement différente), mais à acter : **DEN est configurable/applicable, pas pleinement simulable** comme les trois autres.

## 5. Questions ouvertes (Q1 d'abord)

1. **Granularité du modèle — ✅ TRANCHÉ (Grégoire, 6 juin)** : **un seul mécanisme sous-jacent** (note entrée/suggérée + garde « cibles atteintes »), exposé en **trois modes ancrés sur la gradation** Girouard-Gagné — (1) **note différée/masquée**, (2) **note réduite** (réussi-échoué sur des épreuves + différenciation par d'autres modalités), (3) **note éliminée** (jugement narratif → note certificative). **Le mode (1) différé/masqué est l'entrée prudente recommandée** : il incarne « la rétroaction avant le chiffre » (pt 4 du §3 bis), c'est le plus faible risque et déjà une vraie PRÉN livrable. *(Reste à planifier : les trois modes d'emblée, ou (1) seul en première livraison — décision de lots, pas de conception.)*
1 bis. **Taxonomie PRÉN vs PAN — ✅ TRANCHÉ (Grégoire, 6 juin)** : **garder le badge « PAN » pour l'UI** (simplicité, cohérence avec le billet CoP), **mais documenter la distinction** (DEN = PRÉN académiquement, pas PAN) en **trois endroits** : le **registre** (commentaire près de l'entrée `denotation`), le **SKILL_pratiques_notation §2 bis**, et le **guide pédagogique utilisateur** (guide PAN à venir — y nommer clairement PRÉN vs PAN, suivant Girouard-Gagné). Sinon le modèle de données fige une approximation que la recherche contredit.
2. **Suggestion statistique — ✅ TRANCHÉ (Grégoire, 6 juin)** : **oui, suggestion holistique optionnelle** — réutiliser le mode holistique de STD (mode/médiane/moyenne des niveaux IDME) comme valeur **suggérée** que l'enseignant·e ajuste. Incarne « l'algorithme propose, le jugement tranche » (Voisard) ; la note reste un jugement saisi, mais **ancré** (donc défendable face au biais de Dyer).
3. **Garde « cibles atteintes » — ✅ TRANCHÉ (Grégoire, 6 juin)** : **réutiliser les objectifs/cibles déjà modélisés** (la liste d'objectifs de la variante par-objectifs de STD). DEN ne *calcule* pas une note depuis ces cibles ; l'enseignant·e **confirme leur atteinte** (par cible ou globalement), et cette confirmation **débloque** la note ≥ 60. Avantage : zéro nouvelle ontologie ; la « trace + critères explicites » exigée par Dyer est **native** (cibles nommées, atteinte consignée) — le garde-fou anti-biais est dans le mécanisme même.

> **Modèle DEN — DEUX COUCHES, acté 6 juin (conception close) :**
>
> **Couche 1 — Option « note différée » (transversale, PRÉN niveau 1).** Politique d'**affichage/timing** : cacher la note par travail pendant le trimestre pour que la rétroaction passe d'abord. Applicable **au-dessus de n'importe quelle famille** (SOM/STD/SPE/DEN). **Ne change pas la valeur finale** — c'est celle de la famille sous-jacente. C'est l'entrée prudente vers l'esprit PRÉN. **Pas DEN, pas le badge DEN.** Chantier distinct → BACKLOG #321.
>
> **Couche 2 — DEN-proper (badge DEN, famille).** Un mécanisme : (a) **garde « cibles atteintes »** sur les objectifs existants → débloque une note certificative ; (b) **note finale saisie** (jugement) ; (c) **suggestion holistique optionnelle** (mode/médiane/moyenne IDME) comme ancrage. Deux modes : **réduite** (réussi-échoué sur épreuves + différenciation) et **éliminée** (jugement narratif → note). DEN abandonne la fonction de **tri**, garde la **certification** (RREC). C'est #318.

4. **Différenciation (mode « réduite »)** : réglée par Q2/Q3 (suggestion holistique + jugement, gardés par cibles). Sous-détail : modalités complémentaires (autoévaluations, objectifs facultatifs) — à préciser au moment de la spec.
5. **DEN dans le Comparateur — ✅ RÉSOLU** : DEN-proper (couche 2) est un **jugement saisi → non simulable** sur données démo → **hors Comparateur phase 1**, créable dans l'assistant. La couche 1 (note différée) **ne change pas la valeur** → orthogonale au Comparateur (pas de colonne distincte ; même nombre que la famille sous-jacente).
6. **Simulabilité / données démo — ✅ RÉSOLU** : pas de champ « note DEN saisie » à simuler dans le pack démo (DEN-proper hors simulation). Si on veut illustrer DEN à l'écran un jour, ce sera via une **note saisie réelle** (enseignant), pas une simulation.
7. **Nature du mode 1 — ✅ TRANCHÉ (Grégoire, 6 juin) : DÉCOUPAGE EN DEUX COUCHES.** Mode 1 « note différée » = **option transversale d'affichage** (couche 1, BACKLOG #321), distincte de DEN. Le badge/famille **DEN est réservé aux modes réduite/éliminée** (couche 2, jugement saisi — #318). Voir le callout « Modèle DEN — deux couches » au §5/Q3.

## 6. Garde-fous transverses

- **RREC** : une note finale chiffrée est toujours l'aboutissement (60/59) — fonction de **certification**, jamais de tri (Girouard-Gagné, noter ≠ évaluer).
- **Dyer + santé mentale (Girouard-Gagné)** : traces + critères explicites obligatoires ; ne pas offrir de « note nue » sans cibles documentées ; et **ne pas présenter DEN comme un bien universel** — certains étudiants sont déstabilisés par l'absence de repères. La transition a besoin d'échafaudage.
- **Rétroaction avant le chiffre** : le mode différé/masqué (gradation 1) existe parce que la rétroaction n'agit que dissociée de la note (Pulfrey/Butler/Black & Wiliam). À refléter dans l'app et le guide.
- **Périmètre app vs pédagogie** : l'app modélise la composition de la note ; le virage pédagogique (pratique de rétroaction) relève du guide PAN, pas du code.
- **Zéro-dette** : réutiliser STD-holistique et la logique de conditions SPE plutôt que dupliquer ; le seul ajout neuf est le **chemin de note entrée + garde cibles**.
- **Champ jeune** : typologie non stabilisée, aucune recherche québécoise — modèle **configurable et révisable**, pas figé.
- **Pluralisme** : DEN ni promue ni reléguée ; juste rendue **possible**.

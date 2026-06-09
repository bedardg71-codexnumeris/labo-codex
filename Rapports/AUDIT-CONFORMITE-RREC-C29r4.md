# Audit de conformité — Règlement sur le régime des études collégiales (C-29, r. 4)

> **Objet** : conformité de l'application Labo Codex au RREC
> **Source réglementaire** : C-29, r. 4, version officielle « à jour au 1er février 2026 »
> (`description de l'application/C-29, R. 4.pdf`)
> **Version de l'app auditée** : Beta 99.72 (build 0528-1900), commit `cddbd03`
> **Date de l'audit** : 29 mai 2026

---

## Avertissement méthodologique

Cet audit distingue trois registres, conformément à l'exigence de rigueur du projet :

- **Fait** : vérifié dans le texte réglementaire ou dans le code (référence donnée).
- **Inférence** : conclusion raisonnée à partir des faits, mais non directement vérifiée.
- **Extrapolation** : projection sur des usages ou évolutions possibles.

Limite de portée : l'audit s'appuie sur le texte intégral du règlement, sur la
description fonctionnelle de l'app, sur les skills métier du projet et sur des lectures
ciblées du code (modules de notation, échelles, tableau de bord). Il **ne constitue pas**
un balayage exhaustif ligne par ligne des 102 modules JavaScript. Les affirmations sur le
code portent une référence `fichier:ligne` ; à défaut, elles sont explicitement marquées
comme inférence.

---

## 1. Cadrage juridique — à qui s'adresse le RREC ?

**Fait.** Le RREC est pris en vertu de la *Loi sur les collèges d'enseignement général
et professionnel* (art. 18). Ses destinataires sont **le ministre** (qui établit les
programmes, les objectifs, les standards, décerne les diplômes) et **les collèges** (qui
admettent, organisent les sessions, adoptent les politiques d'évaluation, recommandent la
sanction). Le règlement ne mentionne, ni ne régit, aucun outil logiciel.

**Conséquence directe.** La formulation « est-ce que l'application respecte le règlement »
est, telle quelle, partiellement mal posée : un logiciel personnel d'enseignant n'est pas
un sujet de droit du RREC. La quasi-totalité des 37 articles (admission, structure des
programmes, octroi d'unités, bulletin officiel, épreuves uniformes, sanction, diplomation)
relève de l'institution, pas de l'app.

**Ce que l'audit peut donc évaluer utilement** se réduit à trois questions :

1. L'app **induit-elle** une pratique de notation qui contredirait le règlement
   (essentiellement l'article 27) ?
2. Le **vocabulaire** et les **concepts** de l'app sont-ils cohérents — ou au moins non
   contradictoires — avec les notions réglementaires ?
3. Où se situe la **vraie obligation de conformité**, et l'app s'y inscrit-elle sans
   créer d'écart ?

**Fait (positionnement de l'app).** La description officielle l'énonce :
« Ce n'est PAS un système de notation traditionnel. C'est un système de détection et
d'intervention préventive » (`description de l'application/Labo Codex — Description…txt`).
Le code confirme que l'app **exporte** la note et la rétroaction en PDF « pour
téléversement dans Léa » (`js/travaux-ui.js:1224-1253`, `:3350`). Labo Codex se situe donc
**en amont du système de référence institutionnel** (Léa/Omnivox) : elle ne produit ni
bulletin officiel, ni relevé de notes, ni sanction. Aucune occurrence de « bulletin »,
« épreuve synthèse », « ministère » ou « DEC » comme fonction du logiciel n'a été trouvée.

> **Conclusion de cadrage.** La conformité réglementaire pertinente ne se joue pas dans
> l'app, mais dans **la Politique institutionnelle d'évaluation des apprentissages (PIEA)**
> du collège (art. 24-25) et dans le **système de référence officiel** (Léa). L'app est un
> instrument de jugement professionnel **en amont** de ces dispositifs. Le seul article du
> RREC qui la touche matériellement est l'**article 27**.

---

## 2. Cartographie de l'applicabilité des 37 articles

Légende : **NA** = non applicable (relève de l'institution ou du ministre) ·
**Conc.** = pertinence conceptuelle (vocabulaire, cadre) · **Mat.** = pertinence
matérielle directe (l'app peut induire un comportement conforme ou non).

| Art. | Objet | Statut | Justification |
|------|-------|--------|---------------|
| 1 | Définitions (cours, objectif, programme, standard, unité) | **Conc.** | L'app manipule « objectif » et « standard » via les pratiques PAN. « Cours = 45 périodes » et « unité = 45 h » sont hors périmètre (mesure administrative). |
| 2–2.3 | Admissibilité au DEC | NA | Admission = responsabilité du collège. |
| 3 | Limites aux conditions d'admission | NA | Idem. |
| 3.1–3.3 | Admissibilité au DSET | NA | Idem. |
| 4 | Admissibilité à l'AEC | NA | Idem. |
| 4.1 | Activités de mise à niveau | NA | Déterminées par le ministre. |
| 5 | Types de programmes | NA | Établis par le ministre. |
| 6 | Composantes d'un programme | NA | Structure ministérielle. |
| 7 | Formation générale commune (unités) | NA | Ministre. |
| 8 | Formation générale propre | NA | Ministre/collège. |
| 9 | Formation générale complémentaire | NA | Ministre/collège. |
| 10 | Formation spécifique préuniversitaire | NA | Ministre. |
| 11 | Formation spécifique technique | NA | Ministre/collège. |
| 12 | Module de formation | NA | Ministre. |
| 13 | Expérimentation de programmes | NA | Ministre. |
| 14 | Reconnaissance de programme équivalent | NA | Ministre. |
| 15 | (Abrogé) | — | — |
| 15.1 | Programmes DSET | NA | Ministre/collège. |
| 16 | Programme d'établissement (AEC) | NA | Collège. |
| 17 | Description publique du programme, distribuée aux étudiants | **Conc.** | Le module Alignement/Planification peut **soutenir** la rédaction d'objectifs et de séquences, mais le dépôt officiel reste institutionnel (inférence). |
| 18 | Organisation des sessions (≥ 82 jours) | NA | L'app gère un calendrier/trimestre (namespacing), sans contrainte des 82 jours, qui ne la concerne pas. |
| 19 | Inscription | NA | Collège. |
| 20 | Plan de cours détaillé (objectifs, contenu, médiagraphie, modalités d'évaluation) | **Conc.** | Le module Planification produit de la planification pédagogique ; le plan de cours **officiel** reste sous gabarit institutionnel (inférence). |
| 21 | Dispense (sans unités) | **Conc.** | Statut administratif. L'app ne modélise pas ce statut (extrapolation — voir constat C4). |
| 22 | Équivalence (avec unités) | **Conc.** | Idem. |
| 23 | Substitution de cours | **Conc.** | Idem. |
| 23.1 | Incomplet | **Conc.** | Idem. |
| 24 | PIEA relative aux programmes | NA | Adoptée par le collège. |
| 25 | PIEA des apprentissages + épreuve synthèse | **Conc.** | **Cadre de rattachement réel** : la pratique configurée dans l'app doit être compatible avec la PIEA locale (inférence — voir constat C2). |
| 26 | Épreuve uniforme (p. ex. ÉUF) | NA | Imposée par le ministre. Marginal pour la littérature, mais l'app ne la gère pas. |
| 27 | **Note minimale 60 %** ; évaluation par cours **et** par programme | **Mat.** | **Seul article à portée matérielle directe.** Voir section 3. |
| 28 | Octroi des unités si objectifs atteints | NA | L'octroi d'unités = système institutionnel. L'app évalue l'atteinte, n'octroie pas d'unités. |
| 29 | Date limite d'abandon sans échec | **Conc.** | La date limite et la mention au bulletin = collège. L'app ne porte pas de mention « échec/abandon » au registre officiel. |
| 30 | Forme et date de remise des résultats | NA | Déterminées par le collège. |
| 31 | Bulletin de fin de session (forme prescrite) ; session terminale | NA | L'app **ne produit pas** le bulletin officiel ; elle exporte vers Léa. |
| 32–32.2 | Sanction des études, diplôme, délégation | NA | Ministre. |
| 33 | Attestation d'études collégiales | NA | Collège. |
| 34 | Modalités d'application | NA | Ministre. |
| 35–37 | (Omis) | — | — |

**Synthèse quantitative (fait).** Sur 34 articles en vigueur : **1** à portée matérielle
directe (art. 27) ; **9** à pertinence conceptuelle (art. 1, 17, 20, 21, 22, 23, 23.1, 25,
29) ; le reste sans prise sur l'app. Aucun article n'est **violé** par la conception de
l'app.

---

## 3. Article 27 — le seul point de contact matériel

**Texte (fait).** « L'apprentissage est évalué pour chaque cours et pour l'ensemble du
programme auxquels l'étudiant est inscrit. La note traduisant l'atteinte minimale des
objectifs d'un cours est de 60 %. »

### 3.1 Seuil de réussite à 60 %

**Fait.** Le seuil de 60 % est présent dans l'app à deux endroits au moins :

- Diagnostic « note de passage » codé en dur à `0.60` :
  `js/tableau-bord-apercu.js:571` (`const notePassage = 0.60; // 60%`), avec messages
  utilisateur correspondants (`:583`).
- Paramètre configurable `seuilReussite`, **défaut 60**, dans la configuration d'échelle :
  `js/echelles.js:1138` (`parseInt(...) || 60`), documenté à `:1087`. Les pratiques de
  référence terrain l'utilisent également (p. ex. `js/pratiques/config-francois-chimie.js`,
  multiples occurrences à 60).
- Le cadre théorique relie explicitement l'échelle IDME au seuil réglementaire :
  « Seuil critique : 0.75 garantit ≥ 60 % au cours suivant »
  (`SKILL_labo_codex.md`, section 4).

**Inférence.** Par défaut, l'app est **alignée** sur l'article 27 : le seuil de réussite
qu'elle applique correspond au seuil réglementaire. C'est un point de conformité positif,
non un risque.

### 3.2 Conversion des pratiques alternatives en note

**Fait.** L'app supporte des pratiques non traditionnelles (PAN-Standards, PAN-Spécifications)
mais prévoit, pour chacune, une **conversion en pourcentage** (`SKILL_labo_codex.md`,
section 5 : « Conversion du profil de niveaux en % — 4 modes configurables » ;
PAN-Spécifications : « C = 60 %, B = 80 %, A = 100 % »).

**Inférence.** Cette conversion est précisément ce qui **réconcilie** une approche par
compétences (où l'on raisonne en niveaux de maîtrise, pas en pourcentage) avec l'exigence
réglementaire d'une note dont le seuil d'atteinte minimale est 60 %. La conception
**anticipe** donc la contrainte de l'article 27 plutôt que de l'ignorer.

### 3.3 « Par cours et pour l'ensemble du programme »

**Fait.** L'app opère au niveau cours → groupe → étudiant. Elle n'a pas de portée
« programme » (pas d'agrégation inter-cours, pas d'épreuve synthèse).

**Inférence.** Ce n'est pas un écart : l'évaluation « pour l'ensemble du programme »
(art. 27, al. 1 ; épreuve synthèse, art. 25) est une responsabilité **institutionnelle**,
hors du rôle d'un outil de suivi par cours. Limite de portée, pas non-conformité.

---

## 4. Cohérence conceptuelle et terminologique

**Question.** Le vocabulaire de l'app (SOLO, indices A-C-P, IDME, SRPNF, PAN, RàI)
entre-t-il en contradiction avec les notions du RREC (objectif, standard, note de passage,
unité) ?

**Fait — correspondances.**

| Notion RREC | Équivalent / traitement dans l'app | Nature |
|-------------|------------------------------------|--------|
| « objectif » (compétence/habileté/connaissance) | Les pratiques PAN évaluent des objectifs/standards individuels (`pratique-pan-objectifs.js`, mode « par-objectifs ») | Compatible |
| « standard » (seuil de performance) | Échelle IDME ancrée sur des seuils (0.65 / 0.75 / 0.85) ; `seuilReussite` | Compatible |
| « note d'atteinte minimale = 60 % » | `notePassage = 0.60`, `seuilReussite` défaut 60 | Aligné |
| « unité » (45 h) | **Absent** — l'app ne raisonne pas en unités | Hors périmètre |
| « cours » (≥ 45 périodes) | « Cours » dans l'app = conteneur pédagogique (601-101…), sans contrainte de périodes | Homonymie sans conflit |

**Inférence — point de vigilance terminologique.** L'app emploie un cadre conceptuel
**parallèle** (SOLO/IDME/SRPNF, propre à la pratique de l'auteur) qui n'existe pas dans le
RREC. Il n'y a pas de **contradiction** — IDME se projette sur le pourcentage et sur le
seuil 60 % — mais il y a un **risque de lisibilité** : un tiers (direction, conseiller
pédagogique, auditeur institutionnel) qui découvre « IPB », « SRF », « niveau M+ » sans
clé de lecture pourrait peiner à relier ces indicateurs aux objectifs et standards du
devis ministériel. Ce risque est documentaire, pas juridique.

---

## 5. Constats hiérarchisés

| # | Constat | Registre | Gravité | Locus |
|---|---------|----------|---------|-------|
| **C1** | L'app est, pour l'essentiel, **hors du champ d'application** du RREC : 1 seul article (27) la touche matériellement. Aucun article n'est violé. | Fait + inférence | — (constat de cadrage) | — |
| **C2** | La conformité réelle se joue dans la **PIEA du collège** (art. 24-25) et dans **Léa** (système de référence), pas dans l'app. La pratique configurée doit être compatible avec la PIEA locale. | Inférence | Information | Institution |
| **C3** | `seuilReussite` est **configurable** (`echelles.js:1138`). Régler ce seuil ≠ 60 ne viole pas le RREC en soi (paramètre de diagnostic/conversion), **mais** la note finale exportée vers Léa doit, elle, respecter le seuil institutionnel de 60 %. Garde-fou laissé au jugement de l'enseignant et à la PIEA. | Inférence | Faible | Usage |
| **C4** | L'app **ne modélise pas** les statuts administratifs des art. 21-23.1 (dispense, équivalence, substitution, incomplet) ni la mention d'abandon/échec (art. 29). Non requis pour un outil de suivi, mais à ne pas confondre avec un registre officiel. | Extrapolation | Faible | Conception (par choix) |
| **C5** | Vocabulaire parallèle (IDME/SRPNF/IPB) **cohérent** mais peu lisible pour un tiers institutionnel sans clé de correspondance objectifs/standards ↔ indicateurs. | Inférence | Faible | Documentation |
| **C6** | **Prospectif** : la pratique « PAN-Dénotation » (rétroaction qualitative sans note, *non implémentée*) entrerait en friction avec l'exigence d'une note chiffrée au registre officiel si elle était un jour l'unique source. À surveiller au moment de l'implémentation. | Extrapolation | Faible (latent) | Conception future |

---

## 6. Recommandations

Ordonnées par rapport coût/valeur. Aucune n'est une correction de non-conformité — il
n'y en a pas — mais des mesures de **robustesse** et de **lisibilité institutionnelle**.

1. **Documenter le positionnement réglementaire** (recommandé). Ajouter, dans la
   documentation publique (utile pour l'AQPC et l'open-source), une note claire :
   « Labo Codex est un outil de suivi et d'intervention en amont du système de référence
   institutionnel ; la sanction, le bulletin et l'octroi d'unités relèvent du collège et de
   sa PIEA. » Cela désamorce d'avance la question « est-ce conforme ? » mal posée. *(Répond
   à C1, C2.)*

2. **Fournir une clé de correspondance** (recommandé). Un court tableau « concepts Labo
   Codex ↔ objectifs/standards du devis / seuil 60 % » dans la doc ou dans l'app
   (section aide). Améliore la lisibilité pour direction et conseillers pédagogiques.
   *(Répond à C5.)*

3. **Expliciter le rôle de `seuilReussite`** (optionnel). Dans l'UI de configuration
   d'échelle, une infobulle rappelant que ce paramètre sert au diagnostic interne et que
   la note transmise au registre officiel doit respecter le seuil de 60 % de la PIEA.
   *(Répond à C3.)*

4. **Documenter l'exclusion volontaire des statuts administratifs** (optionnel). Une ligne
   dans la doc indiquant que dispense/équivalence/substitution/incomplet/abandon ne sont
   pas gérés par l'app **par choix** (ils appartiennent au système institutionnel), pour
   éviter qu'un utilisateur ne croie à une lacune. *(Répond à C4.)*

5. **Inscrire une vérification de conformité au backlog de PAN-Dénotation** (à reporter au
   moment opportun). Si cette pratique est un jour implémentée, prévoir une conversion vers
   une note chiffrée avant tout export Léa. *(Répond à C6.)*

---

## 7. Conclusion

**L'application est conforme au RREC**, mais cette phrase doit être lue correctement : non
pas parce qu'elle satisferait des obligations qui lui incomberaient, mais parce que **le
RREC ne lui impose presque rien**, et que le seul point de contact matériel — le seuil de
réussite de 60 % de l'article 27 — est respecté par défaut dans le code et reflété dans le
cadre théorique. Là où l'app aurait pu créer un écart (notation alternative incompatible
avec une note de passage), elle prévoit au contraire une conversion en pourcentage qui
**anticipe** la contrainte.

La vraie obligation de conformité ne pèse pas sur le logiciel : elle pèse sur l'enseignant
et sur le collège, via la PIEA et le système de référence. Le rôle le plus utile de cet
audit n'est donc pas de « corriger » l'app — il n'y a rien à corriger — mais de **rendre ce
positionnement explicite**, pour que personne (testeur, direction, futur contributeur
open-source) ne confonde un outil de jugement professionnel avec un registre institutionnel.

---

## Sources

- Règlement : C-29, r. 4, *Règlement sur le régime des études collégiales* (Éditeur officiel
  du Québec, à jour au 1er février 2026) — `description de l'application/C-29, R. 4.pdf`.
- Code : `js/tableau-bord-apercu.js`, `js/echelles.js`, `js/travaux-ui.js`,
  `js/pratiques/config-francois-chimie.js`, modules `js/pratiques/`.
- Documentation projet : `Skills pour Claude Code/SKILL_labo_codex.md`,
  `description de l'application/Labo Codex — Description de l'application 28 fev 2026.txt`,
  `CLAUDE.md`.

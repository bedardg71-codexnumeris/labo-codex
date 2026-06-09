# Audit — Assistant de configuration de pratique (wizard V2)

**Date** : 5 juin 2026
**Objet** : `js/wizard-pratique-v2.js` (2602 lignes, version lue le 5 juin) + périphériques
**Cadrage** : `CADRAGE-audit-assistant-configuration.md` (validé le 5 juin)
**Méthode** : lecture de code intégrale + walkthroughs cognitifs S1/S2/S3 + croisement retours testeurs. Pas de passage fonctionnel dans l'app (les verdicts F3 partiels le signalent).

---

## 1. Carte du wizard

**Architecture** : machine à états déclarative (`ETAPES_WIZARD`), navigation par `suivant()`/`precedent()` conditionnels, historique de pile pour le retour arrière, classification comportementale (`deduireTypePratique`) qui déduit SOM / PAN-Standards / PAN-Spécifications des réponses. Écrit dans `pratiquesConfigurables` (namespacé), met à jour `modalitesEvaluation` si aucune pratique active.

### Étapes atteignables (19)

| # | Étape | Branche | Contenu |
|---|---|---|---|
| 1 | infos-base | commune | Nom, auteur, établissement, discipline (nomenclature cégep), description, info licence CC |
| 2 | calcul-note-finale | commune | Q1 : « Comment calcules-tu la note finale ? » — moyenne / niveaux / acceptable / pas certain·e |
| 2b | sous-questions-guidees | commune | Reformulation des 3 mêmes options à la 1re personne (si « pas certain·e ») |
| 3 | regles-sommative | sommative | Règles spéciales : remplacement, verrou, portfolio, plafonnement, aucune |
| 3' | approche-evaluation | pan-standards | Par artefacts (portfolio) vs par objectifs |
| 4 | nb-evaluations | commune | Nombre d'évaluations (défaut 6) |
| 5 | seuils-personnels | commune | Seuils de dépistage 75/65/55 |
| 6a | config-sommative-regles | sommative | Détails des règles cochées (champs dynamiques) |
| 6b | config-sommative | sommative | Afficher rang / moyenne du groupe |
| 6c | config-objectifs-definition | pan-std-objectifs | Nombre d'objectifs (défaut 6, max 30) ; détail renvoyé « après création » |
| 6d | mode-calcul-objectifs | pan-std-objectifs | Comptage / moyenne pondérée / seuils critiques / holistique |
| 6e | config-mode-calcul | pan-std-objectifs | Paramètres du mode choisi (champs dynamiques) |
| 6f | config-portfolio | pan-std-artefacts | N soumis (12) / N retenus (7) / mode sélection (4 options dont hybride) / reprises (défaut **illimitées**) |
| 6g | config-specifications | pan-spécifications | Seuil d'acceptabilité (défaut 100 %) / jetons oui-non |
| 6h | config-jetons | pan-spécifications | Jetons délai (3 × 3 jours) et reprise (2) |
| 6i | choix-modele-bundles | pan-spécifications | Modèles de forfaits (Sciences/Simple/Littérature/Personnalisé) |
| 7 | echelle-performance | finale (non-SOM) | Sélection d'échelle (bloquant pour PAN-Standards à la création) |
| 8 | grille-criteres | finale (non-SOM) | Grille optionnelle + bouton « Créer une grille de base » |
| 9 | recapitulatif | finale | Badge type (SOM/STD/SPE), nom modifiable, paramètres |

### Étapes INATTEIGNABLES (code mort — 2)

- **`mode-configuration`** (« Mode Expert » vs « Mode Exploration ») : aucune étape n'y mène ; son `precedent()` pointe vers `'type-pratique'`, une étape **qui n'existe plus**. `modeConfig` est forcé à `'exploration'` (L1054-1056). **Le sélecteur expert/exploration — la réponse conçue au besoin de double mode — existe dans le code et est mort.**
- **`config-reprises`** (reprises pour sommative et autres) : aucune étape n'y mène. Conséquence : `reprisesPermisesGlobal` n'est jamais saisi → **une pratique sommative ne peut jamais configurer de reprises via le wizard** ; la branche par-objectifs n'a aucune question reprises non plus.

### Bugs relevés (lecture de code)

| ID | Constat | Gravité |
|---|---|---|
| BG-1 | `wizardV2CreerGrilleDemo` (L1596) appelle `afficherEtapeV2()` — **fonction inexistante** (la vraie s'appelle `afficherEtapeWizardV2`). La grille est créée et stockée, mais le rafraîchissement plante (ReferenceError) : l'utilisateur ne voit pas le résultat de son clic. | Haute (parcours novice) |
| BG-2 | `calculerNbEtapes` ne compte ni `config-sommative-regles` ni `config-objectifs-definition` → **l'indicateur de progression est faux** (ex. : « étape 8 sur 7 ») sur les parcours sommative-avec-règles et objectifs. | Moyenne |
| BG-3 | Round-trip d'édition cassé pour le portfolio : la sauvegarde écrit `nombreTotal`/`nombreARetenir` (L2293-2294) mais `chargerPratiqueExistante` relit `nbArtefactsSoumis`/`nbArtefactsRetenus` (L2572-2573) → **modifier une pratique artefacts perd sa config portfolio**. Les paramètres du mode de calcul objectifs ne sont pas restaurés du tout (TODO non fini, L2580). | Haute (E4, expert) |
| BG-4 | Le récapitulatif artefacts lit `modalitesEvaluation` (Primo) en **priorité sur les réponses que l'utilisateur vient de saisir** (L1739-1741) → le récap peut afficher autre chose que ce qui a été configuré. | Moyenne-haute |
| BG-5 | Blocage échelle manquante via `alert()` natif (L2139) au lieu de `notifications.erreur` — incohérent avec le reste (corrigé partout ailleurs au chantier E, bugs #112-113). | Basse |
| BG-6 | Récapitulatif et bouton grille démo : couleurs en dur (`#4A90D9`, `#E67E22`, `#27AE60`, `#888`, `#555`, `#ddd`) et styles inline massifs — violation directe de la règle design system. | Moyenne |
| BG-7 | Nom de pratique injecté dans l'attribut `value` du récap avec échappement des seuls guillemets (L1688) au lieu d'`echapperHtml()`. Contexte attribut = risque faible, mais hors-règle projet. | Basse |

---

## 2. Walkthroughs

### S1 — Novice sommatif (prof de philo, moyenne pondérée, 4 évaluations)

Parcours : infos-base → calcul-note-finale (« moyenne ») → regles-sommative (« aucune ») → nb-evaluations → seuils-personnels → config-sommative → récapitulatif. **7 écrans, ~3 minutes.** Constats :

1. **Premier contact = administration.** L'écran 1 demande nom, auteur, établissement, discipline et parle de licence Creative Commons — avant toute question sur la pratique. Le novice ne sait pas encore ce qu'il crée ni pourquoi on lui parle de partage.
2. **La classification comportementale est une réussite** : « Comment calcules-tu la note finale ? » se répond sans aucun vocabulaire PAN. Le badge final « SOM — Sommative — C'est la méthode traditionnelle, largement utilisée » est factuel et non culpabilisant.
3. **« Règles spéciales » est la seule fenêtre d'enrichissement** — et « Remplacement automatique » est en réalité une reprise sans pénalité déguisée (pilier 4). Mais rien ne le dit : l'occasion de nommer ce que le prof fait déjà de « PAN-compatible » est manquée.
4. **Aucune reprise configurable** (code mort `config-reprises`) : le novice qui voudrait ajouter « une reprise sur une évaluation » — l'entrée graduelle type — ne le peut pas.
5. **Fin de parcours muette** : la pratique est créée, notification de succès, et rien ne suggère une suite (guide, comparaison, exploration). Le wizard reproduit la pratique existante — fidèlement — et s'arrête là. P1 ressort comme il est entré.

### S2 — Expert (PAN-standards par objectifs, seuils critiques, 12 objectifs, reprises 1/sem.)

Parcours : infos-base → calcul-note-finale (« niveaux ») → approche-evaluation → nb-evaluations → seuils-personnels → config-objectifs-definition → mode-calcul-objectifs → config-mode-calcul → echelle-performance → grille-criteres → récapitulatif. **11 écrans.** Constats :

1. **Pas de voie rapide** : le mode Expert existe dans le code mais est inatteignable. L'expert subit le même parcours linéaire que le novice.
2. **Configuration différée** : la définition des objectifs (noms, poids, types) et les pondérations sont renvoyées à « Conception → Pratiques de notation après la création ». Le wizard est un amorçeur, pas un configurateur complet — acceptable, mais l'expert doit le découvrir en chemin (deux écrans « info » le disent, c'est correct).
3. **Reprises introuvables** : la branche objectifs ne pose aucune question reprises. L'exigence « 1/semaine » de S2 n'a nulle part où s'exprimer.
4. **Vocabulaire exact** ✓ : seuils critiques, niveau minimum D/M, note de base, bonus par niveau — les options du registre sont là, avec défauts sensés (M, 80 %, 3,33 %).
5. **Édition périlleuse** : s'il revient modifier sa pratique, BG-3 lui fait perdre des réglages. Pour un expert qui itère (E6), c'est le défaut le plus coûteux.

### S3 — En transition (pratique SOM active, veut « voir » une PAN sans rien casser)

1. **La sécurité est réelle mais invisible** : `sauvegarderPratique` n'active la nouvelle pratique QUE si aucune pratique n'est active (L2415). La pratique SOM de P3 est protégée. Mais **rien ne le lui dit** — aucun texte ne répond à l'angoisse « est-ce que ça va remplacer ma pratique en cours ? ».
2. **Pas de statut d'essai** : toute pratique créée est `dansBibliotheque: true`, indistincte d'une pratique « pour de vrai ». Le wizard ne distingue pas « créer pour appliquer » de « créer pour voir » — c'est exactement l'espace de la spec #307 (pratiques simulées éphémères, 2 max).
3. **Aucun pont** : pas de renvoi vers un guide (inexistant pour les PAN), pas de gabarit suggéré selon la discipline (la bibliothèque contient pourtant Modèle Chimie, Modèle simple, N meilleures, etc. — jamais mentionnés au début du wizard), pas de « tu pourras comparer ».

---

## 3. Verdicts

Légende : ✅ présent · 🟡 partiel · ❌ absent. Preuves entre parenthèses (lignes de `wizard-pratique-v2.js` sauf mention).

### A. Accueil du novice
- **A1 — Sommative légitime, sans hiérarchie** : ✅ (badge récap L1623 ; aucun vocabulaire « premier pas / aller plus loin » nulle part)
- **A2 — Vocabulaire compréhensible sans connaissance PAN** : 🟡 — Q1 et sous-questions formulées comportementalement (réussi, L74-156) ; MAIS « spécifications », « forfaits », « artefacts », « échelle de performance » surgissent sans définition ni renvoi (L98, 562, 860, 919). Aucun lien vers une aide.
- **A3 — Entrée graduelle (un pilier, une chose)** : 🟡 — « Remplacement automatique » (L171) est une reprise sans pénalité de fait, mais non nommée comme telle ; reprises sommatives inaccessibles (code mort) ; aucun autre élément PAN optionnel en branche SOM.
- **A4 — « Pas certain·e » mène à un guidage réel** : 🟡 — `sous-questions-guidees` reformule mieux (1re personne, concret) mais reste une **classification de l'existant**, pas un guidage du choix. Le cas « je ne sais pas ce que je VEUX » n'a pas de chemin.

### B. Guidage du choix
- **B1 — Intention avant mécanique** : ❌ — aucune question sur le pourquoi ; l'écran 1 est administratif (licence CC).
- **B2 — « Compétences ou intégration ? »** : 🟡 — `approche-evaluation` (artefacts vs objectifs, L547) en est un écho pour PAN-Standards ; mais standards-vs-specs est tranché dès Q1 par le comportement passé, jamais posé comme choix de design.
- **B3 — Questions du débutant adressées ou renvoyées** : ❌ — aucune des cinq questions n'a de réponse ni de renvoi (les guides PAN n'existent pas encore). → exigence centrale du futur guide.
- **B4 — Hybridation standards + specs** : ❌ — une pratique = un type exclusif. (Le « mode hybride » du portfolio, L609, est une règle de sélection d'artefacts, pas une hybridation de systèmes.)
- **B5 — « Adopter un modèle » présenté au bon moment** : ❌ — les gabarits de `pratiques-bibliotheque.js` (Modèle Chimie, Modèle simple, N meilleures, N plus récentes, Par objectifs…) ne sont jamais mentionnés dans le wizard ; seuls les forfaits SPE offrent des modèles, en fin de parcours (L876-904).

### C. Prévention des erreurs
- **C1 — Garde-fou tour de standards** : 🟡 — défaut prudent (6 objectifs, L419) mais max 30 sans aucun signal au-delà de ~15.
- **C2 — Garde-fou avalanche de reprises** : ❌ et même **inversé** — reprises artefacts par défaut « Illimitées » (L633), l'anti-pattern documenté mot pour mot (*Reasonable reassessments* : « be more stringent than you think ») ; aucune question reprises pour objectifs et sommative. Seuls les jetons SPE ont des défauts prudents (3 délai / 2 reprises ✓).
- **C3 — Garde-fou complexité** : 🟡 — récap lisible, mais aucun indicateur ni exemple de calcul permettant de juger la simplicité d'ensemble.
- **C4 — Jetons avec repères** : 🟡 — distinction structurante délai/reprise ✓, défauts prudents ✓ ; aucun repère d'usage (comment en gagner, expiration, dérive transactionnelle — matière à guide).
- **C5 — Pas de one-and-done** : ❌ aujourd'hui — aucune aide contextuelle dans le wizard, guides PAN inexistants. Le plan découvrabilité + le futur guide sont la réponse prévue.

### D. Posture (l'algorithme propose, le jugement tranche)
- **D1 — Montrer la conséquence des choix** : ❌ — aucun aperçu ni exemple de calcul ; le récap liste des paramètres. (La réponse forte est #307 ; un exemple statique dans le récap serait la version minimale.)
- **D2 — Rien d'imposé, défauts modifiables** : ✅ — tout est modifiable ; le mode holistique annonce explicitement « ajustée par jugement professionnel » (L776).
- **D3 — Pratique explicable aux étudiants** : 🟡 — récap honnête mais orienté enseignant ; pas de sortie « à présenter au groupe ».

### E. Efficacité pour l'expert
- **E1 — Chemin court** : 🟡 — 11 écrans pour S2 ; pas de voie rapide ; le sélecteur Expert/Exploration est du code mort.
- **E2 — Détours évitables** : 🟡 — rien de bloquant ✓, mais classification imposée même à qui sait déjà.
- **E3 — Vocabulaire exact, options complètes** : 🟡 — registre des modes complet et juste ✓ ; configuration fine différée hors wizard (annoncée, acceptable).
- **E4 — Édition directe** : ❌ — BG-3 : le round-trip perd la config portfolio et ne restaure pas les paramètres objectifs.
- **E5 — Récapitulatif fidèle** : 🟡 — BG-4 : peut afficher les valeurs Primo au lieu des réponses saisies.
- **E6 — Cycle de vie (modifier/adapter/dériver)** : 🟡 — édition existe (mais E4) ; pas de duplication « variante de » ; pas de trace d'évolution.

### F. Conformité projet
- **F1 — Design system** : ❌ dans le récap — couleurs en dur et styles inline (BG-6).
- **F2 — UX copy** : ✅ — tutoiement, québécois, validation nominative des champs manquants (L1941-1943) ; réserve : `alert()` natif (BG-5) et « ❌ Erreur » dans `pratiques.js`.
- **F3 — Accessibilité** : 🟡 — labels associés ✓, cartes radio = `<label>` englobant ✓ ; focus modal, dots sans équivalent textuel, navigation clavier : **non vérifiables sans passage fonctionnel** (réserve explicite).
- **F4 — Contexte cégep** : ✅ — la note chiffrée finale reste l'aboutissement de toutes les branches ; disciplines en nomenclature cégep ; seuils en %.

**Bilan chiffré** : 5 ✅ · 13 🟡 · 9 ❌ (sur 27). Les ✅ se concentrent en posture et conformité culturelle ; les ❌ se concentrent en **guidage du choix (B)** et aux deux extrêmes du double mode (A4/B1 côté novice, E4 côté expert).

---

## 4. Lecture d'ensemble

Le wizard fait bien ce pour quoi il a été conçu : **identifier et reproduire une pratique existante**, dans un vocabulaire comportemental accessible, sans jugement, dans le cadre cégep. C'est la fonction « configurer » — et elle est plus solide que sa réputation, à des bugs près (BG-1 à BG-7, dont deux sérieux).

Ce qu'il ne fait pas — et, décision du 5 juin, **ne doit pas faire lui-même** — c'est la fonction « explorer » : aucune intention questionnée, aucune conséquence montrée, aucun renvoi, aucune distinction essai/réel. L'écart n'est donc pas à combler dans le wizard mais **autour** : guide PAN (l'enseignement), simulation #307 (la conséquence des choix), statut d'essai (le « pour voir »), et quelques coutures dans le wizard (renvois, garde-fous, voie rapide).

Le paradoxe central : **le besoin de double mode avait été identifié et codé** (étape `mode-configuration`, Expert vs Exploration) **puis perdu** lors du passage à la classification comportementale — l'étape est orpheline. L'audit ne recommande pas de la ressusciter telle quelle, mais la décision (voie rapide expert : oui ou non, et comment) doit être prise consciemment, pas par code mort.

---

## 5. Recommandations

### (a) Corrections dans le wizard

| # | Recommandation | Critères servis | Effort |
|---|---|---|---|
| a1 | **Purger le code mort** `mode-configuration` et `config-reprises` (zéro-dette) — APRÈS décision sur a2 et a3 qui peuvent en réutiliser des morceaux | hygiène | S |
| a2 | **Voie rapide expert** : un lien « Je sais déjà ce que je veux » sur l'écran Q1 qui saute la classification (choix direct SOM/STD/SPE) | E1, E2 | M |
| a3 | **Réintégrer les reprises** : question reprises pour sommative (réactivable depuis `config-reprises`) et pour objectifs ; **défaut artefacts passé de « Illimitées » à « Limitées »** avec un repère d'une ligne (« des reprises limitées favorisent de meilleures soumissions ») | C2, A3 | M |
| a4 | **Garde-fou objectifs** : message doux si nbObjectifs > 15 (« au-delà de ~15, l'évaluation devient difficile à soutenir — c'est toi qui décides ») | C1 | S |
| a5 | **Corriger BG-1** (afficherEtapeV2 → afficherEtapeWizardV2), **BG-2** (calculerNbEtapes), **BG-3** (round-trip édition : noms de champs + restauration objectifs), **BG-4** (récap : réponses wizard prioritaires), **BG-5** (alert → notifications) | E4, E5, F2 | M |
| a6 | **Inverser l'ordre des écrans** : classification d'abord, infos-base/licence juste avant le récap (le novice rencontre du sens avant de l'administration) | B1 (partiel), accueil | M |
| a7 | **Écran d'entrée à deux portes** : « Partir d'un modèle (bibliothèque) » vs « Décrire ma pratique » — rend visibles les gabarits existants | B5, Gateways-modèles | M |
| a8 | **Mini-exemple de calcul dans le récap** (statique : « avec ces réglages, un étudiant qui aurait X obtiendrait Y ») — version minimale de D1 en attendant #307 | D1, C3 | M-L |
| a9 | **Phrase de réassurance S3** au moment de créer : « Ta pratique active n'est pas modifiée » (la garantie existe déjà dans le code, il suffit de la dire) | S3 | S |
| a10 | **Conformité design system** du récap (variables CSS, retrait des styles inline) + `echapperHtml` sur le nom (BG-6, BG-7) | F1 | S-M |
| a11 | **Renommer « Remplacement automatique »** en y adjoignant sa signification (« l'étudiant peut remplacer un résultat en se reprenant — une forme de reprise sans pénalité ») — nommer le pilier que le prof pratique déjà | A3, gateway | S |

### (b) Délégations → exigences de contenu pour le **guide PAN** (ébauche de cahier des charges)

Chaque renvoi recommandé dans le wizard suppose que le guide y réponde. Sources : corpus archivé + **CSÉ 2018** (ancrage québécois) + specs `pan`/`pan-rrec` du 29 mai.

1. **Les cinq questions du débutant** (formulation Grégoire) — l'ossature du guide : par quoi commencer ? qu'est-ce qui guide mes choix ? dois-je trancher tout de suite ? comment choisir un système de jetons ? est-ce que je me crée une montagne d'évaluations ?
2. **L'intention avant la mécanique** : qu'est-ce que ma note mesure / devrait mesurer (CSÉ 2018 : évaluer pour apprendre vs pour sanctionner ; Five W's adapté cégep) — c'est le contenu que le wizard ne doit PAS porter (décision : l'exploration se joue autour).
3. **La transition SOM → PAN comme passage, pas conversion** : partir des irritants reconnaissables (négociation de points, rétroaction ignorée), jamais du dénigrement du sommatif (Gateways) ; « un pilier, une chose » (20 small starts) ; le non-choix standards/specs (« compétences ou intégration ? », hybridation permise).
4. **Reprises raisonnables** : limites prudentes d'abord, assouplir ensuite ; la bonne friction (réflexion préalable) ; charge étudiante incluse (Reasonable reassessments, Whoops).
5. **Jetons** : à quoi ça sert, combien, usages, expiration, dérives (Care and feeding of tokens) — en appui de l'écran config-jetons.
6. **Les erreurs classiques** : avalanche, tour de standards (~15), système incompréhensible, explication unique (Whoops) — en miroir des garde-fous a3/a4.
7. **Transparence envers les étudiant·es** : expliquer sa pratique au groupe, plusieurs fois, aux bons moments (SAFE, Susciter l'adhésion) — appuie D3.
8. **Contraintes cégep** : PIEA, note finale chiffrée, ce qui est négociable et ce qui ne l'est pas (dimension absente de GfG ; commentaire A.-H. archivé ; CSÉ 2018).
9. **Posture** : l'algorithme propose, le jugement tranche (« La machine à produire des notes ») — fil rouge du guide ET de #307.
10. **Guide SOM ?** À trancher : un court guide « comprendre sa pratique sommative » (ce que la moyenne pondérée mesure, ses règles spéciales, remplacement = reprise) serait le **gateway naturel** vers le guide PAN — il parle au prof de ce qu'il fait déjà.

**Mécanique de renvoi** : via le moteur d'assistance/popups (plan découvrabilité), aux moments chauds : Q1 (« c'est quoi tout ça ? »), config-jetons, config-portfolio (reprises), récapitulatif (« et maintenant ? »).

### (c) Hors périmètre → backlog / chantiers existants

- **Aperçu dynamique du calcul** = #307 (la simulation est LA réponse à D1) — dépend des Sessions B → C.
- **Statut « pratique d'essai »** (créer pour voir, S3) = couvert par la spec #307 (éphémère, 2 max) — vérifier à la planification que le wizard pourra créer dans ce statut.
- **Hybridation standards+specs par évaluation** (B4) = design futur, pas un correctif.
- **Configuration fine dans le wizard** (objectifs détaillés, forfaits experts) = statu quo défendable (amorçeur + Conception), à réévaluer après a2.
- **Vérification accessibilité fonctionnelle** (F3 : focus modal, clavier, dots) = passage sur Mac/iPad à planifier.

---

## 6. Limites de cet audit

- Lecture de code sans exécution : les verdicts F3 (accessibilité) et le comportement réel des champs dynamiques n'ont pas été vérifiés à l'écran.
- Les personas sont des constructions ; un seul retour testeur direct sur le wizard existe (bug #126, Grégoire, 31 mai — déjà corrigé pour ses deux causes). Les futurs retours priment sur les verdicts.
- Le corpus de critères est majoritairement GfG (américain) ; F4 et le CSÉ compensent, mais la pondération des critères reste un jugement.

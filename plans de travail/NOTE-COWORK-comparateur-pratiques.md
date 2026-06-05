# NOTE COWORK — Comparateur de pratiques (réflexion amont)

**Date** : 5 juin 2026 (reconstituée — la note annoncée au relais du 5 juin PM n'avait pas été écrite ; celle-ci la remplace, établie depuis SESSION.md, `SPEC_simulation_pratiques_307.md` et vérifications dans le code)
**Statut** : réflexion en cours avec Grégoire. AUCUN code tant que la conception n'est pas actée.
**Successeur de** : #307 forme « panneau profil » (close le 5 juin — ne pas l'implémenter).

---

## 1. Principe directeur (Grégoire, 5 juin)

> « Aider à choisir une pratique en montrant ses effets, pas en les faisant deviner — ce qu'un tableur ne fait pas sans effort de projection. »

Posture héritée de l'audit et de Voisard : **l'algorithme propose, le jugement tranche**. Le Comparateur montre ; il ne recommande pas.

**Approfondissement acté (Grégoire, 5 juin)** : on ne compare pas que des chiffres — c'est trompeur. Avec une PAN, la note prétend représenter davantage l'apprentissage ; c'est précisément ce qui est remis en question avec SOM. **Le chemin qui mène au chiffre importe plus que le résultat.** Formulation validée : « l'enseignant comprend que le vrai travail n'est pas de choisir le chiffre qu'il préfère, mais de construire le chemin qui mesure ce qu'il veut mesurer. **Le Comparateur débouche donc naturellement sur l'assistant (construire/ajuster sa pratique), pas l'inverse.** » Anti-pattern nommé : laisser la vue se lire comme un palmarès de générosité (« +14 en PAN ! »).

## 2. Faits techniques établis (vérifiés dans le code, 5 juin)

- **Moteur complet sur `origin/main`** (HEAD `a8345986`, 224 tests verts) : `calculerDetailsNoteFinale(da, pratiqueId)` paramétrable et câblé jusqu'à la config (PR #28) ; `window.simulerIndices(da, pratiqueId)` lecture seule (PR #29) — C et P pour n'importe quel étudiant × n'importe quelle pratique, sans jamais écrire `indicesCP`. Indistinct démo/réel.
- **Représentations** : registre = source unique (codes, couleurs, familles — Session B). DEN existe au registre (`--den-violet`) ; reconnaissance par l'assistant = #319 Lot 5.
- **Diagnostic réutilisable** : mécanisme #128 (« non calculable » avec cause par pratique) — chaque cellule du Comparateur peut diagnostiquer sans échec global.
- **Précédent export** : `bilan-reflexif-csv.js` + Défense D (whitelist) + règle d'anonymisation des exports.
- ⚠️ **CORRECTIF sur le relais : « groupe démo 9999 » est un vestige.** Depuis le 21 avril (PLAN-AUTONOMISATION Plan 1 Phase 1), la démo vit en **namespace permanent `demo_*`** (source `pack-demo-20.js`, 20 étudiant·es, toggle via `demo-activation.js`). Les fichiers démo ne contiennent aucun « 9999 » ; il n'en reste que des filtres défensifs legacy (`modes.js:957 GROUPES_DEMO = ['9999','demo']`). Le Comparateur parle `demo_*`. (Le §8.2 de la spec #307 — « données démo (groupe 9999) » — est périmé sur ce point.)

## 3. Contraintes connues

- **Navigation** : une vraie entrée de menu touche `config.js`/`navigation.js` (zones protégées). Alternative actée comme possible : bouton depuis « Conception → Pratiques de notation ».
- **Non-destructif** (invariant §6 de la spec, conservé) : aucune écriture namespacée ; seul artefact = CSV téléchargé ; pratique active strictement inchangée ; test snapshot avant/après.
- **Design system** : variables CSS, 2 modes, cibles 44 px, iPad 768-1024 px ; marquage « Simulation » distinct (accent + bordure pointillée, spec §4.2).
- `echapperHtml()` sur les noms de pratiques ; `SKILL_Securite_donnees.md` §9 pour l'export.
- **Héritages directs de la spec §4-5** (réutilisables tels quels) : décomposition par famille (STD : artefacts retenus/obligatoires/pondérations/plafonnement ; SOM : productions × pondérations ; SPE : seuils), delta en points de %, CSV horodaté avec détail par artefact.

## 4. Cadre acté au relais du 5 juin (à confirmer en réflexion)

Vue dédiée d'aide au choix : échantillon de **profils-types contrastés** (fort / moyen / en difficulté / irrégulier) du **groupe démo**, 2-3 pratiques en regard, **disposition réversible** côte-à-côte ↔ empilé, non-destructif + export CSV. **Phase 2** = même vue sur un groupe réel. **Appropriation** (créer discipline/productions/critères/pratique via l'assistant) = ultérieure.

## 5. Questions ouvertes (l'ordre est une proposition de discussion)

1. **Public et moment. ✅ TRANCHÉ (Grégoire, 5 juin)** : le cœur de cible est **l'utilisateur SOM qui explore ce que deviendrait sa pédagogie en PAN** (P1 devenant P3). Conséquences actées en discussion :
   - La colonne de référence n'est pas « la pratique active » abstraite : c'est **SA pratique sommative**. Le Comparateur est asymétrique — « ta pratique » vs « ce que ça deviendrait » — pas un comparateur neutre de systèmes.
   - Le vivier de candidates en phase 1 = **gabarits prédéfinis de la bibliothèque** (Modèle simple, N meilleures, etc.) + ses propres créations — l'explorateur SOM n'a pas encore de pratiques PAN dans son groupe-cours (révise le « bibliothèque du groupe-cours » du §6).
   - Le vocabulaire des cellules PAN doit être traduit pour un œil SOM (renvois au futur guide PAN) ; la lecture qualitative (« ce que la pratique récompense ») prend le pas sur le delta brut.
   - Portes d'entrée naturelles : sortie du wizard après création d'une pratique SOM (#319 Lot 4) et moment « essayer avant de trancher » du guide PAN.
2. **L'échantillon de profils-types. ✅ TRANCHÉ (Grégoire, 5 juin)** : profils **curés** dans `pack-demo-20` (hypothèse de travail confirmée implicitement — étiquetés une fois, stables, racontables), et **si le pack ne contient pas de profils assez contrastés (notamment un « irrégulier » convaincant), l'ajuster fait partie du chantier**. Méthode de vérification au démarrage du chantier : le moteur lui-même — passer `simulerIndices(da, pratiqueId)` sur les 20 étudiant·es démo × 3 pratiques et examiner les deltas ; les profils retenus sont ceux qui séparent le mieux les pratiques (l'« irrégulier » doit produire l'écart signature SOM vs PAN-reprises). 4 profils : fort / moyen / en difficulté / irrégulier — les deux premiers montrent la convergence (rassurant), les deux derniers la divergence (l'insight).
3. **Démo d'abord, réel ensuite. ✅ TRANCHÉ (Grégoire, 5 juin) — option (a)** : la vue exige le **mode démo actif**. Si la démo est désactivée, le bouton affiche une invitation « Activer les données démo pour explorer » (un clic, réversible, mécanique `demo-activation.js` existante). Justifications : zéro travail moteur (les calculs lisent le namespace actif — c'est le toggle qui fait l'indistinction démo/réel), prudence post-Session C, et honnêteté pédagogique (l'enseignant sait qu'il regarde la démo). L'option (b) — moteur visant explicitement `demo_*` sans bascule — est tracée comme amélioration, à réévaluer en phase 2 où le problème disparaît (données réelles = namespace actif). Fondement pédagogique du « démo d'abord » consigné en question 1 : les données réelles d'un utilisateur SOM n'ont pas nécessairement la structure qu'une PAN exige ; la démo garantit que les trois familles calculent proprement.
4. **Granularité d'une cellule. ✅ TRANCHÉ (Grégoire, 5 juin) — les 3 engagements validés** :
   - **(E1) Chaque note porte sa question** : ligne fixe par famille « ce que cette note mesure », factuelle, tirée du registre — SOM « la moyenne pondérée des performances, chacune comptée une fois » ; STD « le niveau de maîtrise démontré, les reprises remplacent les premiers essais » ; SPE « les exigences satisfaites parmi celles annoncées ». Jamais évaluative (DEN s'ajoutera quand la famille existera).
   - **(E2) Le dépliage est un récit de calcul** : pour chaque profil, le **sort de chaque résultat** dans chaque pratique (compté 30 % / remplacé par la reprise / non exigé pour le forfait). La décomposition spec §4.2 re-présentée comme trajectoire, pas comme tableau de paramètres.
   - **(E3) Le delta est rétrogradé** : lisible mais discret, jamais en vedette ; ligne de garde sur la matrice : « des pratiques différentes mesurent des choses différentes — un écart n'est ni un bonus ni une erreur ».
5. **Disposition. ✅ TRANCHÉ (Grégoire, 5 juin)** : **hiérarchie plutôt que bascule** — la **matrice** (profils × pratiques, deltas discrets) comme vue d'ensemble par défaut ; cliquer une ligne ouvre la **fiche du profil** (récit empilé : phrase de contexte écrite à la main pour chacun des 4 profils démo + le chemin par pratique). La « réversibilité » du relais est réinterprétée : ensemble → récit. Tient sur iPad (4×3) ; maquettes discutées en session Cowork du 5 juin.
6. **Entrée de navigation. ✅ TRANCHÉ (Grégoire, 5 juin)** : **pas d'entrée de menu en phase 1**. Bouton dans « Conception → Pratiques de notation » (la boucle Comparateur → assistant se referme sur place) + portes contextuelles : récap du wizard (#319 Lot 4) et futur guide PAN ; bannière d'accueil possible (modèle guides). Zéro contact `config.js`/`navigation.js`. L'entrée de menu (Labo) = **réévaluation en phase 2** (groupe réel, usage observation/recherche).
7. **Articulation avec #319 et les pratiques d'essai. ✅ TRANCHÉ (Grégoire, 5 juin)** : **pas de statut d'essai à inventer**. « Créer pour voir » = créer dans l'assistant (sans assigner au groupe-cours), puis comparer — les essais **vivent dans la bibliothèque de pratiques**. Idée additionnelle de Grégoire, tracée comme chantier transversal distinct (BACKLOG #320) : **des répertoires dans les bibliothèques** (toutes les bibliothèques : pratiques, échelles, grilles…) pour classer ses hypothèses, les pratiques reçues de collègues, etc. Le sélecteur de candidates du Comparateur bénéficiera de ce classement sans en dépendre. Le récap du wizard (#319 Lot 4) = **extrait du Comparateur** (mêmes appels moteur, rendu réduit), pas un objet distinct.
8. **Trace et partage. ✅ TRANCHÉ (Grégoire, 5 juin)** : **le CSV suffit**. Aucune sortie « présentable » en phase 1, et la chronique est explicitement hors champ ici (« la priorité est sur l'application, pas sur ce qu'on en dira peut-être »).

## 6. Ce qui est déjà tranché (ne pas rouvrir sans raison)

Non-destructif ; éphémère + export CSV ; max 2 simulées en plus de la référence ; pas de graphique d'évolution en phase 1 ; vue groupe réel = phase 2 ; le moteur existant est conservé tel quel. (Le « vivier = bibliothèque du groupe-cours » de la spec #307 est révisé par la question 1 : vivier = gabarits + créations de l'utilisateur.)

---

# SYNTHÈSE DE CONCEPTION — 5 juin 2026 (réflexion close, les 8 questions tranchées)

**Pour la future spec.** Cette synthèse consolide les décisions ; le détail et les justifications sont dans les §§ ci-dessus.

## Ce qu'est le Comparateur

Une vue d'aide à la **transition SOM → PAN** : l'utilisateur sommatif voit ce que deviendrait sa pédagogie sous d'autres pratiques. Asymétrique par construction — « **ta pratique** » (référence) face à « **ce que ça deviendrait** » (1-2 candidates parmi les gabarits et ses créations). Principe directeur : **montrer les effets, pas les faire deviner ; le chemin qui mène au chiffre importe plus que le chiffre**. Le Comparateur ne recommande jamais ; il débouche sur l'assistant (construire/ajuster le chemin qui mesure ce qu'on veut mesurer) — pas l'inverse.

## La vue

1. **Matrice par défaut** : 4 profils-types démo (fort / moyen / en difficulté / irrégulier) × 2-3 pratiques. Deltas discrets (E3), ligne de garde « des pratiques différentes mesurent des choses différentes ». Tient sur iPad.
2. **Fiche de profil au clic** (hiérarchie, pas bascule) : phrase de contexte écrite à la main (« a raté l'examen de mi-session à fort poids ; maîtrise démontrée ensuite ») + le **récit de calcul** par pratique (E2) : le sort de chaque résultat — compté 30 % / remplacé par la reprise / non exigé pour le forfait.
3. **Chaque note porte sa question** (E1) : ligne fixe par famille « ce que cette note mesure », factuelle, du registre.
4. **Non calculable** = diagnostic dans la cellule (mécanisme #128), jamais d'échec global.
5. **Export CSV** horodaté (anonymisation, whitelist Défense D, précédent `bilan-reflexif-csv.js`). Aucune autre sortie.

## Données et accès

- **Phase 1 = démo exclusivement**, mode démo actif requis ; invitation « Activer les données démo pour explorer » si désactivé. Profils-types **curés** dans `pack-demo-20` ; **ajuster le pack fait partie du chantier** si les contrastes manquent (vérification au démarrage : `simulerIndices` × 20 étudiant·es × 3 pratiques ; l'« irrégulier » doit produire l'écart signature).
- **Entrée** : bouton dans Conception → Pratiques de notation + portes contextuelles (récap wizard #319 Lot 4 = extrait du Comparateur ; guide PAN ; bannière accueil possible). Pas d'entrée de menu en phase 1.
- **Essais** : pas de statut spécial — créer dans l'assistant sans assigner, la pratique vit dans la bibliothèque. Chantier transversal connexe : répertoires de classement dans les bibliothèques (#320).
- **Invariants conservés de la spec #307** : non-destructif (test snapshot avant/après), éphémère, max 2 simulées, design system (2 modes, 44 px), `echapperHtml()`, marquage visuel « Simulation ».

## Phase 2 (hors périmètre, orientations notées)

Même vue sur un **groupe réel** (le namespace actif règle l'accès aux données) ; réévaluer alors : l'entrée de menu (Labo), la calculabilité des PAN sur des données purement SOM (structure des évaluations), et l'option moteur (b) devenue sans objet. Appropriation complète (créer discipline/productions/critères/pratique) = ultérieure.

## Prochaine étape

✅ **Spec rédigée le 5 juin** : `plans de travail/SPEC_comparateur_pratiques.md` (6 lots C0-C5, ~15-19 h, bump `minor`). Reste : validation du découpage en lots par Grégoire, puis exécution Claude Code. Coordination #319 Lot 4 consignée dans la spec (§8).

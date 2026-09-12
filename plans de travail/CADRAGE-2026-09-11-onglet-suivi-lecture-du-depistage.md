# Cadrage — l'onglet Suivi comme lecture du dépistage (dossier « dépistage », seconde moitié)

> **Écrit le 11 septembre 2026 à 12 h 12 (Toronto, `TZ=America/Toronto date`) par Cowork**, à la demande de Grégoire
> (« écris-le maintenant », 12 h 10), sur `1.130.2` (`2280aa0d`, poussée). **Rien à coder : ce fichier porte des mesures, une
> proposition et UNE question ouverte.** Il prolonge `CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md` (cadrage 10, première
> moitié : l'écran de réglage, FINI le 11 à 11 h 22, cinq temps vus).
>
> ⚠ Remesure avant d'en faire une consigne : les numéros de ligne et les comptes datent d'aujourd'hui.

---

## 1 · Ce que Grégoire a dit, dans ses mots, daté

- **10 septembre** — l'intention : *« préparer le travail d'automne avec l'orthopédagogue, en faisant sur le dépistage ce qui a
  déjà été fait sur Cadre, Conception et Évaluation. Le dépistage n'est pas nommément explicité dans l'application. »*
- **10 septembre** — l'ordre : *« l'écran de réglage d'abord, puisque c'est lui qui entraîne le suivi »* ; l'onglet Suivi, **« ce que
  l'enseignant lit »**, ensuite.
- **10 septembre, 17 h 30** — une mesure reportée à ce chantier : le sigle « SRPNF » (ses cinq critères) est-il quelque part un
  **titre affiché** à un collègue dont la grille porte d'autres critères ?
- **24 août** — la règle du backlog, qui borne ce cadrage : *« les tâches s'accumulent sans jamais voir la fin »* — un item n'entre
  que s'il a un symptôme vécu par lui, ou s'il bloque un chantier en cours.
- **6 septembre** — pas de données fictives pour vérifier un geste à l'écran : ce que son groupe-cours ne permet pas attend un cas réel.

---

## 2 · Ce qui est mesuré aujourd'hui — trois prémisses corrigées

### 2.1 Le quatrième audit N'EST PAS « jamais exécuté » : il l'a été le 6, et ses six urgences sont livrées

La consigne de démarrage du 11 disait *« le prompt du quatrième audit, jamais exécuté — mesure-le »*. Faux : l'en-tête du prompt
porte `statut : exécuté le 6 septembre 2026 (10 h 12 – 11 h 05)`, le rapport existe
(`Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md`, 409 lignes, banc de 34 mesures), et ses **six « corriger maintenant » ont été
livrés le jour même** : `#767` à `#772` (`grep -n "CM-[1-6]" BACKLOG.md` rend six lignes `[x] LIVRÉ 6 sept.`). Onzième
occurrence du motif « ça existe déjà » — cette fois dans la consigne de démarrage elle-même.

**Ce qui reste du rapport** : `grep -o "Disposition : [a-zé]*" | sort | uniq -c` rend **35 « inscrire » et 7 « commenter »**, et
**aucun des 35 n'est au backlog** (témoin : cinq clés sondées — `datesVerrouillees`, `preferencesRapport`, `dejaPositions`,
« 58 contrôles », `etudiantsSuivis` — 0, 0, 0, 0 et 1 occurrence dans `BACKLOG.md`). Selon `CLAUDE.md` § « Ce qu'un audit
doit produire », l'audit n'est pas terminé ; selon la règle du 24 août, ces 35 constats **n'ont pas de symptôme vécu** et n'entrent
pas. ⮕ **Proposition, tranchée par Cowork : ils forment le RÉSERVOIR de ce chantier, lus au moment du lot concerné, jamais
versés en bloc au backlog.** Le rapport reçoit une disposition unique en tête (« réservoir du cadrage 11 »), ce qui le clôt au sens
de `CLAUDE.md` sans grossir le compte d'items.

### 2.2 « SRPNF » : non, ce n'est pas un titre affiché dans Suivi — et il reste UN mot égaré, ailleurs

- `grep -rn "SRPNF" js/ --include=*.js | wc -l` rend **55** (le cadrage 10 disait 48 : le compte a bougé avec les commits du 10 et
  du 11). Presque tous sont des noms de fonctions et des commentaires.
- **Dans ce qu'un collègue lit** : `sed -n 7469,8200p index.html | grep -c SRPNF` (les six sous-sections de Suivi) rend **0** ;
  dans les chaînes rendues de `js/` (`grep` des lignes portant une balise HTML, `textContent` ou `innerHTML`) : **0** hors
  `changelog-data.js`. Le rendu du profil parcourt les critères de la grille de chacun (`obtenirCriteresAvecValeurs`) — mesuré
  au cadrage 10, confirmé.
- Là où le sigle est affiché, il l'est **à raison** : l'Aide le présente comme *l'exemple fourni* (corrigé en 1.126,
  `index.html:10092`, `:10335`, `:14070`), et la pratique prédéfinie s'appelle « PAN-Standards (IDME + SRPNF) »
  (`pratiques-predefines.js:361`) — c'est bien SA grille d'exemple.
- **Un seul égaré** : la notification « **SRPNF copiés** dans le presse-papiers » (`js/evaluation.js:3164`, bouton de copie des
  critères, onglet Évaluation — pas Suivi). Un collègue en chimie lit « SRPNF » en copiant ses propres critères. ⮕ **Mot lu par un
  collègue : remonte à Grégoire** (§ 6). Une ligne.

⮕ **Réponse à sa mesure du 10 : non.** Le calcul suit la grille de chacun, et l'affichage aussi.

### 2.3 Ce que Suivi montre du dépistage — la carte de lecture, déjà mesurée par les audits 3 et 4

Le troisième audit (`Rapports/AUDIT-onglet-suivi-2026-09-05.md`) a jugé la **chaîne** (présences → A, C, P → niveau, IPB, patterns,
palier → diagnostic croisé, cible → interventions → agrégats) ; le quatrième a recensé **chaque geste et chaque écriture** des six
sous-onglets. La carte de lecture n'est donc pas à refaire, elle est à **extraire** :

| Sous-onglet | Ce qu'il lit du dépistage | D'où ça vient (réglages du cadrage 10, § 4) |
|---|---|---|
| **Suivi du groupe** | pilules A / C / P des élèves suivis, panneau « Détails » (palier, filtres « Filtrer : »), carte A-C-P-E, distribution, graphiques ACP et trajectoires | seuils Fragile / Acceptable / Bon, fenêtre d'analyse, grille de référence |
| **Profils individuels** | carte RàI (palier, défi principal), barres par critère et leurs flèches, forces / défis, diagnostic croisé, cible d'intervention, suivi des fondations | seuil de défi, sensibilité des flèches, grille de référence, collecte ACP |
| **Interventions** | critères ciblés (`mettreAJourCriteresCibles`), bilan avant / après en lettres | seuil de défi, bornes IDME en clair (`#742`) |
| **Liste des étudiant·es** | le filtre RàI et le palier par ligne | palier |
| Saisie des présences · Animation | **rien du dépistage** — hors dossier | — |

---

## 3 · La proposition — les mêmes cinq temps que l'écran de réglage, appliqués à ce que l'enseignant lit

L'écran de réglage a été trié en cinq temps (carte des effets · morts · mots · forme · liens). Le même patron, sur les trois
sous-onglets qui lisent le dépistage (Suivi du groupe, Profils, Interventions), avec le réservoir de l'audit 4 comme base mesurée :

1. **La carte de lecture** (docs seulement) : le tableau du § 2.3, déplié — pour chaque sortie du dépistage, l'écran, le réglage
   qui l'entraîne, et **le mot affiché**. Une matinée de Cowork, aucune consigne.
2. **Les morts** : ce que l'audit 4 a trouvé sans appelant ou sans effet — le panneau `#panneau-prioritaire` (G-5, `display:none`,
   rien ne l'ouvre), le handler `#btn-toggle-panneau-suivi` sans élément, les vestiges `prioritaire-tri-*` d'un tri devenu filtre
   (G-4), `completerIntervention` et `afficherNotesIndividuelles` (0 appelant). ⚠ **Leçon du 10** : un « mort » se mesure par sa
   clé et chaque lecteur de la clé, pas par le nom d'une fonction — un sur quatre était vivant.
3. **Les mots** — le lot le plus mince, parce que **les noms des zones et les bornes ne se rouvrent pas avant l'orthopédagogue**
   (`#821`, `#822`). Reste ce qui contredit le code ou le geste : « Filtrer : » sous des boutons nommés « tri », l'infobulle du
   tirage qui promet une réinitialisation automatique qui n'existe pas (audit 4, § 6), et ce que la carte de lecture (temps 1) fera
   remonter. **Ses mots : chacun remonte à lui**, en un tour, comme le 11 au matin.
4. **La forme** : l'audit 4 mesure **58 contrôles sous 44 px** sur les six sous-onglets à 1024 × 768 (selects 21-23 px, cases
   12-16 px) ; le panneau de suivi qui n'est accessible qu'après un clic « Détails » à chaque ouverture (G-6) ; le profil rendu
   trois fois à l'ouverture (`#754`). Sur maquette validée par lui, comme le temps 4 de l'écran de réglage.
5. **Les liens** : Suivi → Outils d'observation est livré (1.130.1). Reste à mesurer si le chemin inverse a un sens (depuis un
   réglage, « voir l'effet ») — probablement non : l'étiquette « où ça agit » de 1.130.0 le dit déjà.

**Ordre recommandé** : 1 puis 2 (invisibles, sans lui), 3 et 4 (ses décisions, à froid), 5 seulement si le temps 1 le justifie.
**Chaque temps = une consigne, une release, une porte relevée avant la suivante** — le motif qui a tenu du 10 au 11.

---

## 4 · LA QUESTION OUVERTE — une seule, pour Grégoire : le périmètre

**Option A — Suivi comme lecture du dépistage** : les trois sous-onglets du § 2.3 (Suivi du groupe, Profils, Interventions), les
cinq temps ci-dessus, et le réservoir de l'audit 4 lu **seulement** pour ces trois-là. Saisie des présences, Animation et la Liste
restent hors dossier ; leurs constats attendent un symptôme vécu (sa règle du 24 août).

**Option B — tout l'onglet Suivi** : six sous-onglets, les 35 « inscrire » de l'audit 4 traités en lots, les 12 clés nues, les 58
contrôles. C'est un chantier de plusieurs semaines, dont la moitié ne touche pas au dépistage.

⮕ **Recommandation de Cowork : l'option A.** Trois motifs : (1) c'est son intention, au mot — *« faire sur le dépistage ce qui a été
fait sur Cadre, Conception et Évaluation »*, pas « refaire Suivi » ; (2) l'orthopédagogue arrive à l'automne, et ce qu'elle doit lire,
c'est le dépistage, pas la saisie des présences ; (3) l'option B contredit sa règle du 24 août — trente-cinq items sans symptôme vécu.
**Ce que cette recommandation suppose** : que « ce que l'enseignant lit » (ses mots du 10) désigne les sorties du dépistage et non
l'onglet entier. Si c'est faux, dix secondes pour le dire.

---

## 5 · Ce qui ne se rouvre pas ici

- **Les bornes et les noms de zones** (`#821`, `#822`) — dossier prêt pour l'orthopédagogue (§ 8 de l'inventaire du 10, § 4 du cadrage 10).
- **Les vingt règles de l'audit 3** (`#735`-`#754`) — des règles, pas des défauts ; « après le 14, à trancher avec toi ». Le temps 2
  (les morts) et le temps 3 (les mots) ne les rejugent pas ; s'ils y ramènent, ils citent la fiche et passent.
- **La chaîne des indices** — jugée le 5. Une mesure d'affichage qui ramène à un nombre faux se recoupe avec sa fiche.
- **Les données** : rien de ce cadrage n'écrit chez qui que ce soit (tarir n'est pas réparer ; le stock des clés nues, s'il doit
  bouger un jour, remonte à lui).

---

## 6 · Ce qui se corrige sans cadrage — un mot, sa décision

La notification « SRPNF copiés dans le presse-papiers » (`js/evaluation.js:3164`). Proposition de Cowork : **« Critères copiés
dans le presse-papiers »**. Une ligne, avec la prochaine release, si Grégoire valide le mot — c'est un mot que ses collègues lisent.

---

## 7 · DÉCISION DE GRÉGOIRE — 12 h 31, dans ses mots : « tout l'onglet, 35 constats de l'audit »

**Option B retenue.** Le périmètre est l'onglet Suivi entier, six sous-onglets, et **les 35 « inscrire » + 7 « commenter » du
quatrième audit entrent dans le chantier** — c'est SA décision, et elle vaut exception nommée à sa règle du 24 août (aucun de ces
constats n'a de symptôme vécu par lui ; ils entrent parce qu'ils bloquent un chantier en cours, la seconde condition de la règle).
⮕ Le rapport du 6 reçoit sa disposition unique en tête : *« versé au cadrage 11, lot par lot »*. Le titre de ce fichier reste (le
dépistage est le motif), le périmètre non.

**La supposition de Cowork au § 4 était fausse** : « ce que l'enseignant lit » désignait bien l'onglet entier. Corrigée en une
ligne, comme prévu.

### Les lots — un par sous-onglet, dans l'ordre de la navigation, puis un transversal

*Un lot = une consigne, une release, une porte relevée avant le suivant (le motif qui a tenu du 10 au 11). ⚠ L'audit date du 6
sur `1.123.5` ; on est à `1.130.2`, une soixantaine de commits plus loin : **chaque constat se remesure avant d'être corrigé**, et
un constat périmé se dit périmé, pas corrigé.*

| Lot | Sous-onglet | Ce que Grégoire verra | Ce qui remonte à lui (didactique · mots · données) |
|---|---|---|---|
| **1** | **Suivi du groupe** (G-1 à G-8) | la liste suivie qui survit au changement de groupe-cours au lieu d'être **effacée** (G-2, le seul MAJEUR) ; « Filtrer » qui filtre vraiment (G-4) ; le panneau mort retiré (G-5) ; le sixième ajout refusé à voix haute (G-1) ; l'élève en abandon qui libère son siège (G-3) | **données** : `etudiantsSuivis` passe sous clé par groupe-cours — le stock nu chez les testeurs reste ou migre ? ; **mots** : le message du refus |
| **2** | **Liste des étudiant·es** (L-1 à L-11) | le tri « # » et « DA » qui trient (L-1) ; la note d'écran qui dit vrai sur les abandons (L-2) ; la recherche qui trouve « Aimé » avec « aime » (L-3) ; l'option « En progression » retirée (L-5) ; « ≥ Min. » qui tient (L-6) ; un DA en double refusé (L-8) ; l'aide contextuelle qui survit (L-11) | **didactique** : les abandons dans le tableau ou non (L-2 — la note ou le filtre a raison ?) ; **mots** : le refus du doublon |
| **3** | **Saisie des présences** (S-3, S-4, S-6, S-7) | une date verrouillée ne l'est que pour ce groupe et ce trimestre (S-4) ; les préférences ne fuient plus d'un trimestre à l'autre (S-6) ; le bandeau « Configuration incomplète » regarde les séances, pas seulement l'horaire (S-6) | **données** : `datesVerrouillees` — le stock ; **règles `#736`/`#747`** citées, pas rejugées |
| **4** | **Profils individuels** (P-1 à P-6) | le rapport dont les cases ne se partagent plus entre élèves (P-2) ; les graphiques qui disent « pas convertible » au lieu d'un trou (P-5) ; les gestes exportés jamais câblés retirés | **didactique** : ce qu'un graphique montre d'une échelle non convertible (P-5) ; **`#751`/`#754`** cités, pas rejugés |
| **5** | **Interventions** (I-1, I-5, I-6, I-7, code mort) | « Planifier » n'écrit plus un brouillon fantôme (I-1) ; le bilan qui ne dit plus « I 65 % » à côté de « seuil 64 % » (I-5) ; « Notes (2) » qui compte ce qu'il montre (I-7) ; deux fonctions mortes retirées | **mots** : le bilan (mais les bornes ne se rouvrent pas, `#742` cité) |
| **6** | **Animation** (§ 6 de l'audit) | l'infobulle du tirage qui dit vrai (pas de réinitialisation automatique) ; l'état du tirage par groupe-cours et par trimestre ; « 0 questions » expliqué | **données** : `etatTirage` / `dejaPositions` — le stock ; **ce qui est projeté** aux élèves : à lui |
| **7** | **Transversal** (§ 7 de l'audit) | les 58 contrôles sous 44 px sur iPad (forme, **sur maquette validée par lui**) ; les 12 clés nues restantes, une fiche | **forme** : maquette ; **données** : chaque migration de stock, une par une |

**Ordre recommandé, et pourquoi** : 1 → 2 → 3 → 4 → 5 → 6 → 7, l'ordre de l'audit — c'est ainsi qu'il a été écrit pour être arbitré,
et le lot 1 porte le seul défaut qui **détruit** quelque chose (G-2). Le lot 7 en dernier parce que la forme se règle une fois que
le contenu est trié (sa règle du 10 : trier, puis déplacer). **Un lot par séance.** Le premier a sa consigne quand il le dit.

**Ce qui vaut pour les sept** : rien n'écrit dans les données de quelqu'un sans sa décision (tarir n'est pas réparer : chaque clé
nue namespacée laisse un stock nu chez les testeurs — on mesure, on sépare, on lui propose) ; les mots que ses collègues lisent
remontent avant la release ; les règles de l'audit 3 (`#735`-`#754`) sont citées, jamais rejugées.

**Décision de Grégoire, 14 h 17, lot 2 (L-2), dans ses mots : « les abandons visibles (grisés) ».** La note de l'écran devient vraie ; les statistiques restent sur les actifs. Consigne du lot 2 écrite à 14 h 51.

**Décision de Grégoire, 17 h 15, lot 4 (« oui ») : `#754` (le profil rendu quatre fois, qui efface un texte tapé) et `#752` (les graphiques figés sur I/D/M/E) entrent dans le lot 4** — ils étaient marqués « après le 14 » par des sessions, pas par lui ; sa règle du 5 s'applique. Ce qui n'a pas de valeur convertible : un point absent et un mot, jamais une valeur devinée. Consigne écrite à froid à 17 h 14 : `CONSIGNE-SUIVANTE-lot-4-profils-individuels.md`, en file derrière le lot 3.

**Décisions de Grégoire, 17 h 20, lot 4 (volet confidentiel), dans ses mots** : (1) *« La case des services adaptés devrait être cochée si, lorsque la liste des étudiants est créée, un étudiant a cette option cochée. Donc, ça devrait correspondre à la liste originale des étudiants. »* — une seule source, `etudiant.sa` ; (2) *« nous allons retirer les dropdown IDME qui sont là uniquement pour ma pratique personnelle. Dans d'autres pratiques ou disciplines, il n'y a pas de « Portrait de lecteur » comme ça. »* — les cinq sélecteurs du volet sont retirés, le stock reste non lu. Inscrit dans `CONSIGNE-SUIVANTE-lot-4-profils-individuels.md` § D.

**Précision de Grégoire, 17 h 24** : *« Les données du portrait de lecteur dans la section confidentielle de l'élève peuvent disparaître complètement. Je n'ai jamais utilisé cette fonction. »* — aucune purge écrite pour autant ; les champs tombent au prochain enregistrement du volet.

**Retour de Grégoire, 17 h 28 (capture)** : dans Profil › Accompagnement, le bouton « + Nouvelle intervention » est « mal situé » (sous le titre HISTORIQUE, à gauche). Cause mesurée : une classe CSS jamais définie (`u-flex-between-mb10`) ; le code voulait titre à gauche, bouton à droite. Ajouté au lot 4 (§ F).

**Retour de Grégoire, 17 h 32 (capture)** : bandeau « MODE ANONYMISATION », le libellé « Afficher DA réels » presque illisible — *« l'écrire en blanc comme le texte à côté »*. Cause mesurée : une règle générique `label` qui gagne sur l'héritage du bandeau. **Les deux retours du soir (bandeau, bouton « Nouvelle intervention ») passent en tête de la consigne du lot 3**, retirés du lot 4.

**Correction de Grégoire, 17 h 35** : *« C'est un retour de moi, mais je voudrais que tu l'insères dans un lot comme les autres. »* ⮕ Les deux retours du soir ne sautent pas la file : le bouton « Nouvelle intervention » retourne au lot 4 (§ F, même écran) ; le libellé du bandeau d'anonymisation va au lot 7, transversal (forme, contrastes), fichier ouvert `CONSIGNE-SUIVANTE-lot-7-transversal-forme-et-cles-nues.md`. La consigne du lot 3 redevient le lot 3 seul.

**Décision de Grégoire, 17 h 47, lot 5 (Interventions, `#748`)** : *« la note reste visible, grisée, avec la mention « (n'est plus dans le groupe) » »* — recommandation de Cowork, reprise dans ses mots ; extension de sa décision du lot 2. Consigne en file : `CONSIGNE-SUIVANTE-lot-5-interventions.md`.

**Décision de Grégoire, 17 h 50, lot 6 (Animation)** : *« Il n'y a pas d'enjeu de confidentialité dans le tirage au sort. Au contraire, ça fait partie d'un jeu. Les élèves voient les noms qui défilent à l'écran et, finalement, quelqu'un est choisi. »* — rien ne change à ce qui est projeté ; la recommandation de Cowork (bandeau, DA hors du DOM) est retirée. Consigne en file : `CONSIGNE-SUIVANTE-lot-6-animation.md`.

**Lot 3 VU par Grégoire, 18 h 42** : porte 7/7 sur ses deux groupes réels, décision 3.1 « tel quel ». **Lot 4 promu consigne du jour à 18 h 43.**

**Lot 5 (Interventions) exécuté par Claude Code le 12 sept. à 12 h 31** (consigne promue par Cowork à 12 h 05, après la clôture du chantier de l'orthopédagogie) — commit `9ceca4ff` sur `main` local ; `1.139.0` (minor) due après la relecture croisée de Cowork ; porte `PORTES-TERRAIN-2026-09-12-interventions.md` (cinq cartes, une décision : le titre de l'entrée « Nouvelles »), **avant lundi**. Ce que la mesure a corrigé : `idme.etendu` n'existe pas ; `creerIntervention` et `marquerPresences` retirées avec le code mort (sans appelant après le lot). ~~⚠ La porte du lot 4 a un relevé vierge au dépôt~~ — périmé : `PORTES-TERRAIN-2026-09-11-profils-individuels.md` est RELEVÉE le 12 sept. à 12 h 49, 10 sur 10, zéro échec (noté le 12 sept. au soir). Lot 5 : `1.139.0` poussée ; sa porte relevée 6/6 à 15 h 03, rangées 2.4 et 2.5 sautées faute de cas. **Lot suivant : 6, l'Animation** (`CONSIGNE-SUIVANTE-lot-6-animation.md`).

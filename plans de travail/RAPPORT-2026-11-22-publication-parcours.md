# RAPPORT — la publication des parcours (session du cloud, nuit du 22 au 23 nov. 2026)

> **Relais.** Branche `lot/publication-parcours`, partie de `origin/claude/relaxed-feynman-0vcwct` (`a50b95bd4`).
> Trois consignes, copiées telles quelles, dans l'ordre : `CONSIGNE-2026-11-22-publication-parcours.md` (l'assemblage,
> § 1 à 8 de ce rapport), `CONSIGNE-2026-11-22-parcours-9-je-regarde.md` (§ 9), `CONSIGNE-2026-11-22-release-publication.md`
> (§ 10). Session : Claude Code dans un conteneur cloud Linux. **WebKit n'y existe pas** : tout ce qui est « vu » l'est
> sous Chromium. Safari et l'iPad ne sont pas vérifiés.
> `RELAIS.md` n'est touché qu'à la release (§ 10).

Ce rapport distingue ce qui est **mesuré** (au banc, dans un vrai Chromium contre le vrai `index.html`, ou par Vitest),
**lu dans le code**, **supposé** ou **décidé par la session**, et **non vérifié**.

---

# PREMIER RELAIS — L'ASSEMBLAGE

## 1. La branche et les trois réunions

`lot/publication-parcours` part de `a50b95bd4` (elle contient `main` = 1.254.1, `d0dd74205`, qui n'a pas bougé).
Réunies dans l'ordre demandé, par trois commits de fusion :

| Fusion | Commit | Conflits |
|---|---|---|
| `origin/lot/demo-par-standards` | `fc9e4b5e6` | `index.html` |
| `origin/lot/observation-par-standards` (elle contient la porte et les critères de la vue simple) | `caeb1862a` | `index.html`, `js/init-inline.js`, `js/main.js`, `version.js`, `version.json`, `tests/integration/harness/vue-simple-modeles-actuels.reference.json` |
| `origin/lot/modele-fourni-non-supprimable` | `247c3b4c4` | `index.html` |

### Chaque conflit, et sa résolution

1. **`index.html`, les jetons anticache** (aux trois fusions). Les deux côtés avaient relevé le jeton des mêmes
   fichiers. Résolu fichier par fichier : quand un seul côté change le contenu, son jeton ; quand les deux le changent
   (`js/parcours-classe.js`, fusionné sans conflit de contenu), un jeton neuf. Puis `node scripts/release.mjs
   --build-only` a tout recalculé (60 fichiers relevés, build `1122-2123`, commit `fc5f1326d`). Aucun contenu perdu :
   ces lignes ne portent que des jetons et leurs commentaires.
2. **`version.json`, `version.js`, `js/init-inline.js`, `js/main.js`.** La branche des parcours disait 1.254.1 ;
   `lot/observation-par-standards` disait 1.256.0 (ses deux releases préparées, 1.255.0 et 1.256.0). **Retenu : 1.256.0**,
   la version du lot réuni, parce que ses deux entrées de Nouvelles (1.255 et 1.256) restent telles quelles et que
   l'application affiche alors la version que ses Nouvelles annoncent. **Ce n'est pas un bump de cette session** : aucun
   `release.mjs patch|minor|major` n'a été lancé à l'assemblage ; le build, lui, est recalculé. *(Décidé par la session ;
   la consigne de la release, arrivée ensuite, part bien de ces deux entrées.)*
3. **`tests/integration/harness/vue-simple-modeles-actuels.reference.json`** (les écrans épinglés des deux modèles
   actuels de la vue simple). Les deux côtés gardés : l'accueil de la vue simple qui nomme les trois modèles (le lot de
   la porte) et « 0 – Aucun » en tête de l'échelle (les parcours). Vérifié en reprenant la référence sous Chromium : hors
   de deux écarts de plateforme (des largeurs en pixels, « ⌘Z » qui devient « Ctrl+Z »), elle est identique au code.
4. **`js/changelog-data.js`** : fusionné sans conflit. Les entrées 1.255 (« « Par standards », trouvable en vue simple »)
   et 1.256 (« Des critères pour tes cibles, en vue simple ») sont telles quelles.

Deux bancs ont suivi la réunion (`88a3ea50c`) : celui du troisième groupe attendait « Voir le parcours suivant », le mot de
`main` (la branche des parcours dit « Voir le parcours 3 » depuis le 20 nov.) ; `bulle-sur-telephone` inscrit un parcours
d'essai qui n'est pas dans la liste livrée, et l'ouvre désormais lui-même en mémoire.

## 2. Les retouches acceptées (a à f) : FAIT, mot pour mot (`21550f99c`)

- **a, b, c** (`js/wizard-pratique-v2.js`) : les trois phrases, remplacées. Aucun essai ne les épinglait.
- **d** (`js/tableau-cibles.js`, `MOTS.criteresAide`) : « touche de nouveau le même bouton pour laisser le critère non
  renseigné ». **La vue simple** : sa fenêtre d'inscription lit cette même constante (`_criteresHTML`), elle suit donc ;
  `js/vue-simple.js` a un autre `criteresAide` (« Les critères essentiels sont ceux sans lesquels… »), sans cette
  phrase : rien à y changer. L'écran d'observation a sa propre phrase (« … laisse vide ce que tu n'as pas vu. ») :
  inchangée.
- **e** : « Stratégies de lecture sur « Deux-Rives » » et « … sur « Marine » », dans le pack (les deux titres, deux
  commentaires) et dans l'essai du lot. Les `description` (« Stratégies de lecture appliquées au texte « … » ») ne
  portaient pas la forme à remplacer.
- **f** : (b) et (c) de `histoire.inscriptions` portent leurs critères et leur rétroaction ; (a) est inchangée. Un essai
  neuf le juge (deux break-tests : Nuance de (b) remise à vide ; un mot de (c) changé).

## 3. Le « 1er » : FAIT (`83f9de4df`)

**Un seul formateur**, `js/date-en-lettres.js` (`window.dateEnLettres(valeur, options)`), chargé par `index.html` avant
ses appelants : il écrit la date par `Intl.DateTimeFormat('fr-CA', options)`, morceau par morceau, et le jour « 1 »
devient « 1er » quand le mois est en lettres. `dateEnLettres.jourEnLettres(jour)` sert aux trois modules qui composent la
date à partir d'une chaîne AAAA-MM-JJ.

**Mesuré avant de coder** : 21 appels avec `month: 'long'` dans 18 fichiers, plus trois tableaux de mois.
**Vingt et un modules y passent** : les neuf de la consigne (`diagnostic-copies-liees`, `init-inline`, `modes`,
`reserve-copies`, `reserve-renvoyer`, `saisie-presences`, `synthese-retroaction-rendu`, `tableau-cibles`, `travaux-ui`)
et douze « autres formes » : `main.js` (`formaterDate`, `formaterDateComplete`), `export-pdf.js` (deux),
`codex.js` (deux, dont `_dateLongue`, qui collait `getDate()` au mois), `cartouches.js`, `cc-license.js`,
`partage-import.js`, `reserve-verifier.js`, `trust-tofu.js`, `graphiques-progression.js`, et les tableaux de mois de
`presences-rapport.js`, `planification-export.js` et `planification-carte.js` (ce dernier écrivait déjà « 1er » à sa
façon : il passe par le formateur).

**Hors de la règle, décidé par la session** : les mois abrégés (`month: 'short'`, 19 appels : « 6 fév. »). Ce ne sont pas
des dates « en toutes lettres ». À étendre si Grégoire veut aussi « 1er fév. ».

**Sentinelle** `tests/unit/sentinelle-date-en-lettres-1er-2026-11-23.test.js` (10 essais) : A, le formateur ; B, aucun
autre code n'écrit une date au mois en toutes lettres, « 1er » n'est écrit en dur nulle part ailleurs, un tableau de mois
passe son jour par `jourEnLettres` ; C, les vraies fonctions de quatre appelants ; D, l'ordre de chargement dans
`index.html`. **Quatre break-tests**, chacun rouge puis le code remis à l'identique (`cmp`) : la règle du « 1er »
faussée ; `tableau-cibles.js` rendu à `toLocaleDateString` ; `presences-rapport.js` rendu à `parseInt` ; la balise
déplacée après `main.js`.

**Les harnais** : `chargerScript` pose le vrai module ; cinq harnais qui montent leurs modules autrement le reçoivent par
`tests/unit/_helpers/date-en-lettres.js`. Quatre attentes passent de « 1 … » à « 1er … » (unitaires et un banc).

## 4. La démo déjà ouverte : FAIT (`3ed2c0ca4`)

**Mesuré avant de coder.**
- `initialiserDemoNamespace` ne réécrit `demo_*` que si la version du pack change (elle reste 21.3) : une démo déjà
  installée n'avait pas le troisième groupe.
- `listeCours` est une clé d'héritage, vidée dans `cours` à chaque démarrage (`_migrerListeCoursVersCoursV2`) : écrire
  dedans ne tient pas. Le cours d'un groupe-cours vit dans `cours`.
- Les caches `demo_horaireHebdo` et `demo_calendrierComplet` se recalculent de la liste des horaires à chaque démarrage :
  ils suivent le nouvel horaire au chargement d'après, comme ils le font pour l'horaire de la Modélisation.
- Les migrations de démarrage retouchent la démo ouverte au premier rechargement, avec ou sans ce lot (un témoin sans le
  versement l'a montré) : `dansBibliotheque` posé sur les échelles, l'échelle de départ semée, `demo_modalitesEvaluation`
  purgée de deux champs d'héritage. Le banc les laisse passer avant de mesurer.

**Ce qui est fait** : `verserGroupeParStandardsSiAbsent(pack)` (`js/demo-namespace.js`), appelée par
`initialiserDemoNamespace` quand la version installée est celle du pack. Si `demo_groupesCours` existe sans
`GC_DEMO_STD`, le seul bloc `groupeParStandards` est ajouté : son cours (dans `demo_listeCours`), son horaire, son
groupe-cours, et ses collections (étudiant·es, productions, échelle, pratique, cibles, inscriptions de départ).
- **Ajout seulement, par identité** (skill `integrite-globaux`, § 3.2, « push sans replace ») : un item n'entre que si
  aucun item de même `id` n'est dans la clé ; aucun item existant n'est réécrit ni retiré ; aucune clé n'est retirée.
- Marqué `isDemo`, comme `peuplerNamespace` (les détecteurs des parcours le reconnaissent ainsi).
- **L'histoire de Marmotte Pétillante n'entre pas** (elle n'est pas dans l'état de départ).
- La démo ouverte au chargement : son cours rejoint aussi `cours`, comme à l'entrée dans la démo (la sortie l'en retire :
  son id est dans le pack, il porte `isDemo`), et le menu de l'en-tête est repeuplé.
- **Idempotent** : un second appel ne trouve rien à faire. Le troisième groupe déjà là, même amputé d'une personne par
  la démo : rien ne s'écrit (la personne retirée ne revient pas).

**Ce qui la juge**
- `tests/unit/demo-deja-ouverte-troisieme-groupe.test.js` (8 essais, les modules réels) et **quatre break-tests** :
  l'appel retiré ; la clé réécrite au lieu d'être complétée ; la garde « déjà là » retirée ; la branche de la démo
  ouverte retirée.
- `tests/integration/demo-deja-ouverte-troisieme-groupe-2026-11-23.spec.js`, Chromium, à 1180 × 900 et 820 × 1180 (la
  Modélisation ne se joue pas à 1180 × 820 sur la base, § 5 du rapport du lot de la démo) : une démo d'avant ; **la
  Modélisation de « Mettre ta classe en place » jouée de bout en bout** (le deuxième groupe de la personne) ; un
  rechargement, la démo ouverte : chaque clé de la démo garde ce qu'elle avait, item pour item, à sa place, et le
  troisième groupe arrive ; « le deuxième groupe » reste celui de la personne ; l'en-tête offre les trois groupes ; un
  second rechargement ne change aucune des clés que le versement écrit ; à la sortie, **aucune clé hors de la démo ne
  reste changée**. **Un break-test** (l'appel retiré) : rouge à « le troisième groupe arrive ».
- L'essai « le stock » du lot de la démo disait « n'est PAS réécrite » : il dit maintenant « n'est pas réécrite ; elle
  reçoit le troisième groupe en plus ».

**Source et stock** : ici le stock est traité, par ajout. Ce que le versement ne fait pas : il ne remet pas dans la démo
ce que la personne en a retiré du troisième groupe, et il ne touche pas aux deux premiers groupes.

## 5. Les parcours 2 à 8 ouverts pour de vrai : FAIT (`7bc06f379`)

- **`PARCOURS_OUVERTS`** (`js/assistance.js`) : `decouvrir`, `classe`, `evaluer`, `recevoir`, `monter`, `donnees`,
  `lire-ta-classe`, `commentaires`. Le neuvième est resté fermé jusqu'au relais suivant (§ 9).
- **Les commits d'aperçu annulés** : `4c36db45f`, `52a12f6d6`, `b6eac399e`, `43271c717`. **Par le contenu, pas par
  `git revert`** : ils se chevauchent sur la même ligne et sur les jetons d'`index.html`, quatre `revert` auraient donné
  quatre conflits pour le même résultat. Leurs mentions « BRANCHE SEULEMENT », « APERÇU SEULEMENT » et « ESSAI
  SEULEMENT » sont retirées d'`assistance.js` et d'`index.html` (mesuré : `grep` n'en trouve plus dans `js/`, `css/`,
  `index.html`). `ce21d0778` (« ESSAI SEULEMENT », `departs.html` et ses `.zip`) : laissé tel quel, comme demandé ; ces
  fichiers ne sont liés nulle part (mesuré : aucune mention de `departs.html` dans `index.html` ni dans `js/`).
- **Les tests** : `rouvrirLesParcours` et l'option `parcoursFermes` retirés du harnais (`attendre-application.js`) ; ses
  appels retirés (un dans `en-tete-epure`, quatre dans `parcours-8-commentaires`, deux `parcoursFermes` dans
  `codex-de-depart`). **Les deux essais de la fermeture** (`sentinelle-parcours-verrou-2026-11-16.test.js`,
  `parcours-verrou-2026-11-16.spec.js`) étaient déjà retirés de cette branche par `4c36db45f` : ils le restent (ils
  partiront donc de `main` à la fusion). **`sentinelle-parcours-classe` resserrée** : la porte « Tu enseignes ? » lance
  le parcours, et le repli vers Cadre › Trimestre que la fermeture du 15 nov. avait ajouté est retiré d'`accueil.js`
  (deux break-tests : le repli remis ; `classe` retiré de la liste).
- **La carte « Besoin d'un coup de main ? »** : « Des parcours assistés s'y ajouteront bientôt pour te montrer les gestes
  un à un. » devient **« Des parcours assistés t'y montrent les gestes un à un. »** ⚠ **Mots de la session** (la consigne
  demandait le présent sans donner la phrase) : à valider ou à corriger par Grégoire.
- **Ce que l'Aide dit des parcours** (mesuré) : l'entrée « Assistance » de « Prendre en main l'application » et le terme
  « Parcours assisté » du glossaire parlent déjà au présent. Rien à y changer. Le panneau dit « À venir » sous la liste
  tant qu'un parcours inscrit reste fermé : plus aucun après le § 9.

## 6. Les vérifications de l'assemblage

**Vitest complet** (depuis `tests/`, sur `fc5f1326d`) : **957 fichiers, 12 386 essais, tous verts.**

**Les bancs de la vue simple, de « Par standards », du troisième groupe et du modèle fourni** (14 fichiers, Chromium) :
118 verts, 4 rouges, 2 sautés.
- `demo-par-standards`, A, aux deux tailles (2) : le mot « Voir le parcours suivant » (§ 1). **Corrigé, rejoué : 4 sur 4.**
- `vue-simple-modeles-actuels-epingles` (2) : **rouges de plateforme**. La référence a été prise sous WebKit sur le
  Mac ; sous Chromium Linux, deux largeurs en pixels et « ⌘Z » / « Ctrl+Z » diffèrent, rien d'autre (§ 1, point 3).
- Verts : `vue-simple` (61), `par-standards-a-l-essai`, `par-standards-lot-2-inscrire`, `par-standards-lots-3-4`,
  `modele-par-standards`, `comparateur-par-standards`, `demo-deja-ouverte-troisieme-groupe` (2),
  `modele-fourni-non-supprimable`, `bibliotheque-deux-colonnes-1156`, `menu-demo`, `noms-demo-totems`, `guidage-demo`.
- **L'écran d'observation n'a pas de banc d'intégration** (son rapport le disait : « sentinelle d'intégration à
  écrire ») ; sa sentinelle unitaire est verte. Le banc du parcours 9 (§ 9) le traverse de bout en bout.

**La batterie des parcours** (37 fichiers : les bancs des parcours, du moteur et du panneau ; le rapport précédent en
comptait 34 sans les nommer). Sous Chromium, sur l'état de l'assemblage (le neuvième fermé) : **138 verts, 45 rouges.**

| Rouges | Nombre | Cause |
|---|---|---|
| Les 17 de la base, nommés au rapport précédent, **tous retrouvés, même essai** | 17 | `bulle-sur-telephone` 129 (1) ; `bulles-au-doigt-540` (3) ; `parcours-1-et-2` 131 (1) ; `parcours-2-ma-classe` (3) ; `parcours-4-recevoir-et-rendre` (2) ; `parcours-6-donnees-a-l-abri` (5) ; `pied-de-page-et-assistance` (2) |
| D'autres rouges de la base, **rejoués sur l'arbre de la base (`a50b95bd4`) : mêmes erreurs** | 5 | `codex-de-depart` (3 : le bandeau « nouvelle version » couvre le menu de l'en-tête après l'ouverture d'un codex d'un autre build) ; `deux-temps-modelisation` 47 (1 : sa liste des parcours à modèle date d'avant les modèles des parcours 6, 7 et 8) ; `parcours-fleches` 425 (1 : « sous le zoom au pincement », instable selon le rapport précédent, rouge ici sur les deux arbres) |
| Venus du harnais qui ne rouvre plus rien | 3 | `bulle-sur-telephone` 318, 346, 397. **Corrigé, rejoué : verts** (reste le 129, de la base) |
| Le neuvième parcours fermé dans cet état d'étape | 19 | l'ancien banc du parcours 9 (14) ; `registre-des-parcours` (1, « neuf parcours ») ; `parcours-je-regarde` 261 (1, « À venir » paraît) ; `essai-novice-lot2-moteur` (e) (1) ; `je-regarde-commentaires` B (2, la suite « Voir le parcours 9 »). Les trois derniers : cause **supposée** ici, vérifiée au § 9 |
| Instable sous la charge (trois lots de bancs en parallèle) | 1 | `je-regarde-evaluer` B à 820 × 1180 : **vert rejoué seul** |

`parcours-1-et-2` 131 : le rapport précédent disait « une largeur à 430,00006 » ; ici la largeur passe et c'est le bord
droit du panneau qui est lu pendant son entrée (−172 à −354 px), sur la base comme sur la branche. Même essai.

**Aucun rouge propre à l'assemblage ne reste.** Les 19 de la ligne « neuvième fermé » sont l'état d'étape.

**Break-tests des sentinelles et bancs neufs de l'assemblage** : retouche f (2) ; « 1er » (4) ; démo déjà ouverte (4
unitaires, 1 au banc) ; `sentinelle-parcours-classe` (2). Tous rouges, tous remis à l'identique.

## 7. Supposé ou décidé par la session (assemblage)

- La version 1.256.0 à la réunion (§ 1, point 2).
- La phrase « Des parcours assistés t'y montrent les gestes un à un. » (§ 5) : **mots à valider.**
- Les mois abrégés hors de la règle du « 1er » (§ 3).
- L'annulation des commits d'aperçu par le contenu plutôt que par `git revert` (§ 5).
- Le versement écrit le cours du troisième groupe dans `cours` seulement, pas dans `listeCours` (§ 4).

## 8. Non vérifié, et trouvailles (assemblage)

**Non vérifié** : Safari et l'iPad (WebKit n'existe pas dans le conteneur) ; l'adresse d'aperçu elle-même (le proxy du
conteneur la refuse : seul l'état de Netlify sur la PR est lu) ; la suite Playwright entière (elle n'est pas un vert
possible sous Chromium).

**Trouvailles, et leur issue**
1. **`codex-de-depart`, rouge sur la base** : après l'ouverture d'un codex écrit sous un autre build, le bandeau
   « nouvelle version » couvre le bouton du menu de l'en-tête jusqu'à ce qu'on le ferme. Le banc ne le ferme pas.
   **Inscrire et continuer** (le banc ; à l'écran, c'est le bandeau de toute nouvelle version).
2. **`deux-temps-modelisation` 47, banc périmé sur la base** : corrigé au § 9, où le neuvième parcours y entre aussi.
3. **Les bulles 1 des deux temps du parcours 7** disent encore « Si ta pratique est « Par standards », le suivi de tes
   cibles viendra dans une prochaine version. » Le neuvième parcours existe maintenant. Mots validés par Grégoire le
   22 nov. : **non touchés, remontés ici** (les mots sont à lui).
4. **La carte d'Aide « Explorer la démonstration »** ne compte toujours que le premier groupe (trouvaille 1 du lot de la
   démo) : **inscrire et continuer**, inchangé.

---

# DEUXIÈME RELAIS — LE PARCOURS 9, « SUIVRE TON GROUPE PAR CIBLES »

## 9. Le parcours 9, « Je regarde »

Consigne : `plans de travail/CONSIGNE-2026-11-22-parcours-9-je-regarde.md` (copiée telle quelle, `4991b377c`).
Code : `e6b3cd6ad` ; build recalculé `41b5afda3` (`1122-2218`, version inchangée).

### 9.1 Ce qui est fait

- **`js/parcours-cibles.js`** (neuf), identifiant `cibles`, rang 9. Les douze bulles, mot pour mot. Il se joue dans la
  démo, sur le troisième groupe ; chaque étape remet la démo sur ce groupe. Une démo déjà ouverte à qui le groupe manque
  le reçoit avant la première bulle (le versement du § 4).
- **Un seul temps.** La définition n'a pas de `lancer`. Au panneau, sa carte porte le rang 9, le titre, la ligne
  « Pour la pratique « Par standards ». », et un seul bouton, « Je regarde », avec « Modélisation » et son état dessous :
  ni « Nous faisons », ni « Pratique guidée ». Sa pastille et le rang du menu suivent l'état de ce seul temps
  (`seulementModele`, `js/assistance.js`). La dernière bulle offre « Voir le parcours 6 » et « Terminer ».
- **La suite suggérée** : une définition peut nommer sa suite (`suite: 'donnees'`) ; sinon c'est, comme avant, le
  parcours qui la suit au panneau. La phrase et le libellé restent composés par le panneau.
- **Ouvert** : `PARCOURS_OUVERTS` porte `cibles`. Plus rien n'est « À venir ».
- **L'ancien neuvième parcours est retiré**, pas gardé à côté : `js/parcours-notation-alternative.js`, sa sentinelle et
  son banc ; le défaut `parcoursNotationAlternative` des préférences (une valeur déjà écrite chez quelqu'un reste dans
  ses préférences, rien ne la lit : **stock assumé**) ; l'événement `dossierPdfLivre` de l'export PDF, dont il était le
  seul lecteur ; ses deux formes de bulle dans `css/parcours.css`.
- **Deux petits ajouts ailleurs** : `lieuDit` au moteur (la phrase du lieu écrite par l'étape, à la place de celle que
  le moteur compose à partir du menu) ; `ObservationCibles.dater(date)` (la date des observations de l'écran ouvert).

### 9.2 Ce que « Remplir » pose, et qui inscrit

« Remplir » écrit dans les champs de l'écran ; **c'est la personne qui inscrit**, par les boutons de l'application.

| Bulle | « Remplir » pose | Le geste qui inscrit |
|---|---|---|
| 4 | la cible « La lecture stratégique », « Tout le groupe », **et la date de l'histoire (11 sept. 2025) à la place de celle du jour** | « Commencer » (rien ne s'écrit) |
| 5 | Structure et Rigueur « Respecté », Plausibilité « Non respecté », Nuance vide ; le texte de (a) | « Inscrire et passer au suivant » : (a) |
| 7 | les quatre critères de (b), le niveau 2, sa rétroaction, la production sur « Deux-Rives », le 17 sept. 2025 | « Inscrire le niveau » : (b) |
| 8 | les quatre critères de (c), le niveau 3, sa rétroaction, la production sur « Marine », le 1er oct. 2025 | « Inscrire le niveau » : (c) |

Les mots, les critères, les dates et les productions viennent du pack (`histoire.inscriptions`), pas du parcours.

**« Refaire »** (au panneau, le parcours fait) : seules les inscriptions de Marmotte Pétillante sur « La lecture
stratégique » partent (le pack n'en a aucune pour elle sur cette cible), et les annulations qui les désigneraient. La
démo n'est pas remise à neuf, aucune question n'est posée. Les clés écrites doivent commencer par `demo_`.

**La reprise** (décidé par la session) : un passage interrompu REPREND, chaque bulle se règle sur ce qui est déjà
inscrit. Mesuré : après un rechargement à la bulle 3, la démo est toujours ouverte sur le troisième groupe, la carte dit
« Étape 3 sur 12 », et « Je regarde » reprend à la bulle 3.

### 9.3 Chaque phrase qui cite l'écran, mesurée (Chromium, le vrai `index.html`, aux deux tailles)

| Bulle | Ce que la bulle cite | À l'écran |
|---|---|---|
| 1 | cinq cibles et leurs poids (25, 30, 10, 25, 10) | la fiche : « Poids 25 · 25 % », 30, 10, 25, 10, dans cet ordre |
| 1 | « à « Pratiques de notation » » | le titre de la page ; **l'onglet du menu, lui, dit « Pratiques »** |
| 2 | quatre critères, trois « critère essentiel » | Structure, Rigueur, Plausibilité « critère essentiel » ; Nuance sans marque |
| 2 | l'« Échelle de départ – Par standards », de 0 à 4 ; « 0 – Données insuffisantes », « 3 – Acquis », « 4 – Avancé » | l'échelle du groupe : ce nom, cinq niveaux, ces codes et ces noms |
| 3 | « Évaluation », « Tableau de notation » ; une rangée par étudiant·e, une colonne par cible | le menu dit ces deux noms ; dix rangées, cinq colonnes |
| 5 | le carrousel dit qui a été vu aujourd'hui | après l'inscription, « vu aujourd'hui » sur Marmotte Pétillante, et sur elle seule |
| 6 | la case porte ✎, aucun niveau | « ✎ », « Données insuffisantes », le compte 1 |
| 7 | la fenêtre « Inscrire un niveau » | son titre ; ses parties : « Critères », « Niveau », « Rétroaction », « D'où vient cette inscription ? », « Date » |
| 7, 8 | « Inscrire le niveau » ; les noms des deux productions ; « 2 – Ça y est presque », « 3 – Acquis » | le bouton prend ce nom dès qu'un niveau est choisi ; les productions s'appellent « Stratégies de lecture sur « Deux-Rives » » et « … sur « Marine » » ; les tuiles « 2 » « Ça y est presque », « 3 » « Acquis » |
| 9 | le petit nombre compte ses inscriptions | la case : « 3 », compte « 3 » (« 3 inscriptions, dont 1 remarque ») |
| 9 | « Niveau retenu : 3 · Acquis, inscrit le 1er octobre 2025. » | mot pour mot (le « 1er » du § 3) |
| 9 | le 2 sur « Deux-Rives » reste dans l'historique | « 17 septembre 2025 · 2 · Ça y est presque · Production : Stratégies de lecture sur « Deux-Rives » » |
| 10 | « En attente » avant, puis 69 % ; la colonne « Note » | avant : « En attente », « La lecture stratégique » ; après : « 69 % » ; l'en-tête « Note » |
| 11 | la carte « Note du cours » donne 68,8 % | « Note actuelle 68,8 % » |
| 11 | « La rédaction », à « 2 – Ça y est presque », vaut 50 % ; les quatre autres 75 % | le tableau : 3 · Acquis, 75 % (quatre fois) ; La rédaction, 2 · Ça y est presque, 50 % |

### 9.4 Les mots qui ne tiennent pas tout à fait à l'écran (codés tels quels, rien réécrit)

1. **Bulle 9** : « La case de Marmotte Pétillante montre maintenant « 3 – Acquis » ». La case montre **« 3 »** (un point de
   couleur, le code, le compte). Le nom « Acquis » se lit dans son infobulle (« niveau retenu Acquis ») et dans le repère
   de l'échelle au-dessus du tableau.
2. **« 3 – Acquis », « 2 – Ça y est presque », « 4 – Avancé »** (bulles 2, 7, 8, 9, 11) : là où l'application écrit le
   code et le nom ensemble (la fenêtre, le profil), elle écrit **« 3 · Acquis »**, avec un point médian. La bulle 9 cite la
   ligne du niveau retenu avec ce point, comme l'écran.
3. **Bulle 7** : « … et la production d'où vient le niveau ». Le champ s'appelle « D'où vient cette inscription ? » (un
   menu : « Observation en classe », « Conversation (hors séance) », ou une production), suivi de « Date ».
4. **Bulle 1** : l'onglet du menu dit « Pratiques » ; « Pratiques de notation » est le titre de la page (tableau du 9.3).
5. **Bulle 2** : « « 3 – Acquis » quand tous les critères essentiels sont respectés, « 4 – Avancé » quand tous le sont ».
   L'application ne calcule ni n'affiche cette règle : le niveau reste le choix de l'enseignant·e (la fenêtre le dit :
   « Le niveau reste ton choix. »). C'est un repère de la bulle, pas une citation de l'écran.
6. **Bulle 5** : « aujourd'hui ». L'écran d'observation prend la date du jour ; l'exemple lui donne la date de
   l'histoire. « vu aujourd'hui » se lit donc, dans l'exemple, pour le 11 septembre 2025.

### 9.5 Supposé ou décidé par la session (parcours 9)

- **La parenthèse de la bulle 10** : « → Touche « Suivant » (le tableau n'a pas de lien vers le profil : « Suivant » y mène
  le parcours) ». Lue comme une **note pour Claude Code**, pas comme des mots de la bulle (la règle des consignes du
  22 nov. : une parenthèse qui finit une ligne est une note) : la bulle dit « Touche « Suivant » ». ⚠ **À corriger en dix
  secondes si c'était un mot de la bulle.** De même la parenthèse de l'en-tête de la bulle 5 et celle des boutons de la 12.
- **« ─── Objectif atteint ─── »** (bulle 12) : posé par le moteur, comme aux autres parcours. La phrase suit leur
  règle : « Objectif atteint : tu es en mesure de décrire comment suivre ton groupe par cibles : nommer tes cibles,
  inscrire ce que tu observes et le niveau atteint, puis lire la note qui en découle. » **Elle n'est pas écrite dans la
  consigne** : dérivée de l'objectif.
- **Ce que le moule ajoute à la dernière bulle**, comme aux autres parcours : « Pour revoir une étape, touche
  « 12 sur 12 ». », « Chaque parcours a son objectif. C'est toi qui choisis la suite. », et la consigne « Touche « Voir le
  parcours 6 », ou « Terminer » ».
- **La phrase de la poignée** : le moteur la pose déjà, en petit, sur la première bulle de tout parcours. Les lignes
  grises des bulles 4 et 7 (celles de la consigne) s'y ajoutent.
- **`grandEcranSeulement`** : le parcours n'est pas offert sur téléphone (sous 500 px), comme le cinquième et le huitième.
- **Les gardes** : à la fin de la bulle 5, « Inscrire » ne répond pas pour la personne suivante ; à la bulle 9,
  « Inscrire » et « Annuler cette inscription » ne répondent pas dans la fenêtre (on y lit l'historique).
- **« Suivant »** : le bouton des bulles 1, 2, 10 et 11 porte ce nom (la consigne) ; les autres parcours disent
  « Continuer ».
- Si l'écran d'observation ou la fenêtre est refermé avant le geste attendu, la bulle revient à celle qui l'ouvre.

### 9.6 Les vérifications du parcours 9

- **Sentinelle** `tests/unit/sentinelle-parcours-cibles-2026-11-23.test.js` (20 essais) : elle lit la consigne et le
  vrai module, dans les deux sens, bulle par bulle, formes successives et lignes grises comprises ; l'entrée, l'objectif,
  la ligne du panneau, la suite, « un seul temps », « ouvert », l'ancien parcours retiré, les mots de l'histoire lus dans
  le pack. **Cinq break-tests** (un mot de la bulle 9 ; une forme de la bulle 5 retirée ; la ligne grise de la bulle 7
  retirée ; un `lancer` ajouté ; `cibles` retiré de la liste) : chacun rouge, puis le code remis à l'identique.
- **Banc** `tests/integration/je-regarde-cibles-2026-11-23.spec.js`, Chromium : **A**, à 1180 × 820 et 820 × 1180, sur un
  trimestre réel peuplé : la carte, les douze bulles et chacune de leurs formes mot pour mot, le tableau du 9.3, ce que
  « Remplir » pose, la date de (a), les gardes, la bulle dans l'écran, la fin, **à la sortie de la démo aucune clé hors de
  la démo ne change**, puis « Refaire » (les trois inscriptions partent, les 49 autres sont identiques octet pour octet,
  le modèle repart de sa première bulle, et de nouveau aucune clé hors de la démo ne change). **B** : une démo sans le
  troisième groupe le reçoit avant la première bulle. **3 sur 3.** **Cinq break-tests** (la date du jour gardée ; la garde
  de la bulle 5 retirée ; « Refaire » qui ne retire rien ; le versement retiré ; une clé écrite hors de la démo) : chacun
  rouge, puis le code remis à l'identique.
- **Vitest complet** (sur `41b5afda3`) : **957 fichiers, 12 329 essais, tous verts.**
- **La batterie des parcours** (37 fichiers : les 36 de l'assemblage sans l'ancien banc du parcours 9, plus le banc
  neuf), sous Chromium, sur `41b5afda3`, en trois lots lancés ensemble : **147 verts, 23 rouges, 14 sautés.**

| Rouges | Nombre | Cause |
|---|---|---|
| Les 17 de la base, **tous retrouvés, même essai** | 17 | comme au § 6 |
| `codex-de-depart` (rouge sur la base, § 6) | 3 | le bandeau « nouvelle version » couvre le menu |
| `essai-novice-lot2-moteur` 315 | 1 | **venu de ce relais** : sous l'identité du neuvième parcours, le moteur offre maintenant « Voir le parcours 6 » (il nomme sa suite) ; le banc disait « le dernier parcours n'offre que « Terminer » ». **Banc corrigé** (`f8f791afd` : la règle se juge sur un panneau dont le dernier ne nomme rien), rejoué : vert |
| Instables sous la charge des trois lots | 2 | `nous-faisons-evaluer` à 820 × 1180 (un contour lu 121 px trop tôt) ; `parcours-je-regarde` 297, « Découvrir » (le triangle en rotation, déjà nommé instable aux rapports d'avant). **Rejoués seuls : verts** (5 sur 5 et 3 sur 3) |

  **Ce que le § 6 supposait est vérifié** : le neuvième ouvert, `registre-des-parcours`, `parcours-je-regarde` 261,
  `essai-novice` (e) et `je-regarde-commentaires` B (aux deux tailles) sont verts. `deux-temps-modelisation` 47, périmé
  sur la base, est corrigé (il compte les huit parcours à modèle, dont le neuvième à un seul temps) : vert.
  `parcours-fleches` 425, rouge au § 6 sur les deux arbres, est vert à ce passage : instable.
  **Aucun rouge propre au parcours 9 ne reste.**

### 9.7 Non vérifié (parcours 9)

- **Safari et l'iPad** : le toucher sur l'écran d'observation et dans la fenêtre, la bulle par-dessus ces deux fenêtres
  (elle passe au-dessus par la classe `parcours-sur-modale` ; au banc, elle tient dans l'écran et aucun geste demandé
  n'est couvert, les clics de Playwright en font foi ; **personne ne l'a regardée**), le clavier de l'iPad qui monte
  quand « Remplir » pose un texte.
- **En vue simple** : la fenêtre d'une case n'y a ni production ni date ; le parcours se lance du panneau « Assistance »,
  que la vue simple n'offre pas de la même façon (rapport précédent, § 7). Non essayé.
- **Sur téléphone** : le parcours n'y est pas offert (décision de la session, § 9.5).
- « Voir le parcours 6 » : le libellé et la phrase sont jugés ; le panneau qui s'ouvre devant le sixième parcours l'est
  par le banc de la fin des parcours, pour les autres parcours seulement.

### 9.8 Trouvailles (parcours 9), et leur issue

1. **L'écran d'observation prend la date du jour sans l'offrir** : hors du parcours, une observation faite hier ne
   s'inscrit que par la fenêtre d'une case (son rapport le dit déjà). `dater` existe maintenant, mais seul le parcours
   l'appelle. **Commenter et oublier** (aucun symptôme vécu).
2. **Les bulles 1 des deux temps du parcours 7** (« … viendra dans une prochaine version ») : § 8, point 3. **Remonté.**
3. **La carte « Besoin d'un coup de main ? »** et l'Aide ne disent rien du neuvième parcours ni de son seul temps :
   rien d'inexact, rien à changer.

---

# TROISIÈME RELAIS — LA RELEASE ET LA MISE EN LIGNE

## 10. La release 1.258.0

Consigne : `plans de travail/CONSIGNE-2026-11-22-release-publication.md` (copiée telle quelle, `b486ce138`).

### 10.1 Les trois retouches (`7ef72aa8a`)

**a) La case du report des présences est retirée.**

*Mesuré avant de retirer.* La case « Reporter les présences dans la saisie des présences… » vivait dans la question
« Marquer cette intervention complétée ? » (`_demanderReport`, `js/interventions.js`), posée au passage à « Complétée »
et à la création d'une intervention déjà complétée. **Ce qu'elle écrivait**, cochée : par `transfererPresencesVersModule`
puis `ajouterPresencesIntervention` (`js/saisie-presences.js`), des fiches de `presences` marquées `facultatif: true`,
à la date de l'intervention (la durée en `heures` pour les participant·es ; en contexte « rattrapage », `heures: 0` et
« Absence motivée RàI » pour les autres), jamais là où une fiche existait déjà pour ce jour. **Ce qui lit ces fiches** :
la saisie des présences et le calcul de l'assiduité, comme toute fiche de `presences` ; rien ne lit la case elle-même.

*Ce qui est retiré* : la case ; la question, qui ne servait qu'à la porter (**décidé par la session** : passer à
« Complétée » enregistre sans question, et le bilan paraît, ce que dit maintenant la bulle) ; les deux écrivains ; les
mots `caseReport`, `caseReportUneFois`, `completerTitre` des deux vocabulaires (intervention, rencontre) ; le paragraphe
de l'Aide qui décrivait la case. `js/interventions.js` n'écrit plus dans `presences`.

**SOURCE TARIE, STOCK GARDÉ.** Les présences facultatives déjà écrites par la case restent dans `presences`, telles
quelles : rien ne les réécrit, rien ne les retire, et leurs lecteurs ne changent pas. Jugé par trois essais : la fiche
d'intervention (« le stock » : une présence facultative posée avant reste identique après deux passages à
« Complétée ») ; l'audit du Suivi, E2 (l'assiduité relue sur ce stock rend les mêmes nombres qu'avant : 40 → 50 %, et
l'absence motivée retire toujours la séance) ; le banc `lot-e3`, I-b (dans le navigateur).

*La bulle 8 du « Nous faisons » de « Lire ta classe »* : le paragraphe est « Tu choisis ensuite « Complétée ». ».
**#1304 reste ouvert**, avec la note de Grégoire (la compensation d'une absence doit rester un choix de l'utilisateur, à
concevoir plus tard).

⚠ **Trouvaille, remontée à Grégoire (mots et pédagogie), inscrite à #1304, non touchée** : dans la fiche, le contexte
« Séance de rattrapage — les non-participants ont congé » et son bloc « Gestion des absences » disent encore que les
non-participant·es « bénéficieront d'un congé (absence motivée) », et l'infobulle `interv-gestion-absences` que « les
absences sont motivées automatiquement ». Seule la case retirée l'écrivait (et seulement cochée) : **plus rien ne le
fait**. La retouche demandée s'arrêtait à la case et à la bulle.

*Laissé en place* : l'option `caseACocher` de `uiDialogues` (la fenêtre de confirmation générique) n'a plus d'appelant ;
elle garde son essai. **Commenter et oublier** : c'est la forme que prendra sans doute le choix à concevoir.

**b) et c)** « Automatiser tes commentaires », « Je regarde » : la bulle 6 dit « Cette grille est celle de la production
sur « Deux-Rives ». » ; la bulle 5, « La première donne le compte : « Ta rédaction contient… ». » (le « Nous faisons »
du même parcours dit toujours « Ta production contient… » : la retouche ne le visait pas).

**Sentinelles et break-tests.** Les trois retouches sont LUES dans la consigne de la release et appliquées aux bulles
des consignes d'avant ; chacune doit y trouver sa ligne, une fois. Break-tests, chacun rouge puis le code remis à
l'identique : la phrase de la case remise dans la bulle 8 ; « Artefact 1 » remis ; « Ta production contient… » remis ;
un report remis dans l'écrivain de la fiche ; la question remise ; `caseReport` remis dans les mots.
Quatre sentinelles ont suivi (`b6f34f7d6`) : l'Aide sans la case ; deux cliquets qui descendent (fonctions au-dessus de
15 : 434 → 433 ; pauses des bancs : 618 → 617) ; « À l'essai », que la Nouvelle 1.258 écrit pour les parcours, hors de
l'étiquette de la pratique.

### 10.2 Les Nouvelles (`bbefbb5e4`)

1.255 et 1.256 : telles quelles. Ajoutées, mot pour mot, à la typographie du fichier : **1.257, « Observer en
circulant »** et **1.258, « Les parcours assistés s'ouvrent »**, toutes deux en vert (des fonctionnalités). Aucune autre
ligne.

### 10.3 La release (`db0b5a035`)

`origin/main` n'avait pas bougé (`d0dd74205`) : rien à réunir. `node scripts/release.mjs --set 1.258.0` : l'intention
est `minor` ; `minor` seul aurait donné 1.257.0, et la consigne veut le numéro de la dernière entrée des Nouvelles
(**décidé par la session**). Les quatre points de vérité disent **1.258.0, build `1122-2306`** (mesuré : `version.json`,
`version.js`, `js/init-inline.js`, `js/main.js` ; l'ancien build n'est plus nulle part dans le code).
**Le verdict WebKit n'est PAS pris** (écart décidé par Grégoire, 20 h 56) : écrit au message de la release et dans
`RELAIS.md`.

**Juste avant, sur le code d'avant le bump :**
- **Vitest complet** : 957 fichiers, 12 327 essais, verts ; rejoué sur le commit de la release : identique.
- **La batterie des parcours** (37 fichiers, Chromium, trois lots ensemble) : **148 verts, 22 rouges, 14 sautés.**

| Rouges | Nombre | Cause |
|---|---|---|
| Les 17 de la base, **tous retrouvés, même essai** | 17 | comme au § 6 |
| `codex-de-depart` (rouge sur la base) | 3 | le bandeau « nouvelle version » couvre le menu |
| Instables sous la charge | 2 | `je-regarde-evaluer` C à 820 × 1180 : **vert rejoué seul** ; `parcours-je-regarde` 297, « Découvrir » (le triangle en rotation) : rejoué seul deux fois, **un vert, un rouge**, comme sur la base aux rapports d'avant |

  **Aucun rouge neuf.** Les bancs des parcours 7 et 8 (les deux temps) et du parcours 9 sont verts avec les retouches.
- **Les bancs de la vue simple, de « Par standards », du troisième groupe, du modèle fourni et de la fiche
  d'intervention** (15 fichiers) : **134 verts, 3 rouges, 2 sautés.** Les 2 rouges de plateforme de l'épinglage (§ 6) ;
  `bibliotheque-deux-colonnes-1156` 218, **vert rejoué seul** (lancé pendant d'autres bancs).
- **L'écran d'observation** : pas de banc à lui (§ 6) ; traversé par le banc du parcours 9 ; sa sentinelle unitaire verte.

### 10.4 Les parcours ouverts, et leurs temps

| Rang | Parcours | Temps |
|---|---|---|
| 1 | Découvrir | un seul (la visite de la démo) |
| 2 | Mettre ta classe en place | « Je regarde » · « Nous faisons » |
| 3 | Évaluer une première production | « Je regarde » · « Nous faisons » |
| 4 | Recevoir les productions, rendre tes rétroactions | « Je regarde » · « Nous faisons » |
| 5 | Monter ton cours | « Je regarde » · « Nous faisons » |
| 6 | Mettre tes données à l'abri | « Je regarde » · « Nous faisons » |
| 7 | Lire ta classe et intervenir | « Je regarde » · « Nous faisons » |
| 8 | Automatiser tes commentaires | « Je regarde » · « Nous faisons » |
| 9 | Suivre ton groupe par cibles | « Je regarde » seulement |

Mesuré au banc (`registre-des-parcours`, `deux-temps-modelisation`) : neuf cartes, rangs 1 à 9, « 1 sur 9 » au menu ;
huit parcours ont un « Je regarde », sept ont les deux temps. Sur téléphone, les parcours 5, 8 et 9 ne sont pas offerts.

### 10.5 Ce qui est mesuré, supposé, non vérifié (l'ensemble)

- **Mesuré** : tout ce que disent les § 6, 9.3, 9.6 et 10.3, sous Chromium et par Vitest.
- **Supposé ou décidé par la session**, à corriger d'un mot : § 7, § 9.5, et ici la question de complétion retirée avec
  sa case, `--set 1.258.0`.
- **Mots de la session, à valider par Grégoire** : « Des parcours assistés t'y montrent les gestes un à un. » (§ 5).
- **Non vérifié** : **Safari et l'iPad, en entier** ; les données réelles de Grégoire (rien n'y est réécrit : le seul
  écrivain ajouté ne touche que `demo_*`) ; l'adresse en ligne (le proxy du conteneur la refuse) ; la vue simple pour
  les parcours.
- **Aucune porte terrain n'est écrite** (skill `portes-terrain`, règles 1 et 2) : rien ici n'écrit de façon
  irréversible dans des données réelles, et Grégoire a décidé de publier pour l'essai des testeurs. Ce qui n'est pas
  vérifié est dit ci-dessus et ci-dessous.

### 10.6 Ce que le verdict WebKit de demain devra regarder en premier

1. **Le parcours 9** (`je-regarde-cibles-2026-11-23.spec.js`), jamais vu sous WebKit : la bulle par-dessus l'écran
   d'observation et par-dessus la fenêtre « Inscrire un niveau » ; à la main sur l'iPad, couché et debout : la bulle
   couvre-t-elle un bouton à toucher, le clavier monte-t-il quand « Remplir » pose un texte.
2. **Les « Je regarde » des parcours 6, 7 et 8** et le « Nous faisons » du 8 : écrits le 22 nov. dans le cloud, jamais
   vus sous WebKit non plus (`je-regarde-donnees`, `je-regarde-lire-ta-classe`, `je-regarde-commentaires`).
3. **`vue-simple-modeles-actuels-epingles`** : sa référence, prise sous WebKit, a été fusionnée à la main (§ 1, point 3).
   Un rouge ici dirait que la fusion s'est trompée, ou qu'un écran de la vue simple a bougé.
4. **`pied-de-page-et-assistance` à 820 px** : la version et « Nouveautés » sur une même ligne, avec « 1.258.0 » et le
   build `1122-2306` (ce banc a déjà rougi pour un build plus large, le 22 nov.).
5. **`demo-deja-ouverte-troisieme-groupe`** : la démo de Grégoire, ouverte avant ce soir, doit montrer trois groupes
   après un rechargement, et garder tout ce qu'il y a fait.
6. **Les 17 rouges de la base sous Chromium** : la plupart tiennent à Chromium (le toucher, des largeurs). Sous WebKit,
   leur état est celui du dernier verdict du Mac ; `codex-de-depart` (le bandeau qui couvre le menu) est à regarder.
7. **Les dates au premier du mois** : `par-standards-lots-3-4` attend maintenant « inscrit le 1er octobre 2026 ».

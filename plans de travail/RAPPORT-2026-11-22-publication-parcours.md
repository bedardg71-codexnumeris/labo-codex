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

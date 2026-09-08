# PORTES TERRAIN — 28 août 2026 · #575 (lot 4 du plan SOLO)

> **Artefact jumeau** : https://claude.ai/code/artifact/f0e40322-5813-4679-903f-f0be6fa6dd8d
> **Base** : `main`, 1.104.1, build `0827-1418` — **aucun bump**, la session `file://` de Grégoire
> est ouverte. Le travail de cette liste n'est **pas commité** au moment où elle est écrite.
> **État** : ✅ **RELEVÉE le 28 août 2026, 07 h 00 — 10 passées, 2 échecs, 0 non traitée.**
> Les deux échecs sont traités (voir « Au retour du terrain » en bas). Commit du lot : `e2819cea`.
> **Ce qui échoue devient un item du BACKLOG avec son numéro de porte**, pas une note mentale.

---

## Pourquoi cette liste existe

Vitest est à **3764/3764** (354 fichiers), et la sentinelle du lot
(`tests/unit/sentinelle-575-ordre-niveaux-derive-echelle.test.js`) porte **23 cas, 14 mutations,
14 rouges**, restauration vérifiée. Ces tests prouvent la **logique** : que l'ordre des niveaux
vient bien de l'échelle de l'utilisateur, et que rien n'est inventé quand elle manque.

Ils ne prouvent **aucun rendu** : l'environnement de test est `node`, sans navigateur. Les douze
gestes ci-dessous sont exactement ce qu'aucune machine n'a pu faire — application de la règle 1 du
skill `portes-terrain`.

**Aucune console, aucun Terminal, aucune commande.** Tout se fait dans l'application. ~8 minutes.

---

## §0 · Préalable

> ⚠ **PÉRIMÉ DEPUIS LE 8 SEPTEMBRE 2026 — ne pas recopier ce §0.** Ce qui suit décrivait le clone de
> Grégoire comme la source `file://` de son application : c'était vrai ce jour-là, ça ne l'est plus.
> Il ouvre désormais `https://app.codexnumeris.org` (`PROTOCOLE.md`, « L'application : UNE SEULE
> ADRESSE porte ses données réelles »), et un lot doit être **poussé et déployé** avant qu'une porte
> puisse le juger. Le §0 courant vit dans le skill `portes-terrain`. Le texte ci-dessous est conservé
> comme trace de la séance du 28 août.

Sans ces deux gestes, tout le reste peut être un **faux rouge** : Grégoire testerait l'ancienne
version. ⚠ **Pas de `git pull`** — la session a écrit directement dans son clone
(`~/Documents/GitHub/Monitorage_v6`), qui est aussi la source `file://` de son application : les
fichiers sont déjà sur son disque.

| # | Geste | Attendu |
|---|---|---|
| 0.1 | Recharger l'application (Cmd+R), lire le numéro en bas de page | **1.104.1, build 0827-1418 — INCHANGÉ.** Voulu : pas de bump pendant sa session ouverte. Le numéro ne prouve donc rien ici ; c'est 0.2 qui tranche |
| 0.2 | Évaluations → Liste des évaluations, curseur sur l'en-tête de colonne « Niveau » | L'infobulle dit **« Niveau de performance — cliquer pour trier selon l'échelle de l'évaluation »**. Si elle dit encore « Niveau de performance IDME » : **Cmd+Maj+R**. Tant que 0.2 n'est pas verte, ne rien cocher d'autre |

## §1 · Données

**Vide, et c'est une information.** Le lot ne touche que de l'affichage et du code mort : aucune
écriture, aucune migration, aucun geste irréversible. **Pas de sauvegarde Codex requise.**

## §2 · Interface

### A — l'onglet Évaluations a-t-il survécu au retrait de 584 lignes ?

Le risque principal du jour. `evaluation.js` passe de 3894 à 3295 lignes ; deux doublons `window`
disparaissent avec la vue « accordéon ».

| # | Geste | Attendu |
|---|---|---|
| 2.1 | Ouvrir Évaluations → Liste des évaluations, ne toucher à rien | Le tableau se remplit, le compteur affiche un nombre. **Rien de vide, aucun écran blanc** |
| 2.2 | Choisir une production dans le filtre « Production », puis « Réinitialiser » | La liste se réduit puis revient entière. **Et la liste déroulante ne propose aucun « portfolio »** — c'est la version corrigée qui répond maintenant |
| 2.3 | Verrouiller puis déverrouiller une évaluation | Notification, cadenas changé, **la liste reste à l'écran**. Aucune ligne ne disparaît, aucun filtre ne se réinitialise seul |

### B — le niveau se lit-il dans SON échelle ?

| # | Geste | Attendu |
|---|---|---|
| 2.4 | Cliquer sur l'en-tête de colonne « Niveau » | Les lignes se rangent **du plus faible au plus fort selon l'échelle de chaque évaluation**. ⮕ **MESURE** : noter l'ordre obtenu |
| 2.5 | Recliquer pour inverser, regarder le bas du tableau | L'ordre s'inverse **et les lignes « - » restent en bas**. Avant, le `?? 5` les faisait remonter en tête au décroissant |
| 2.6 | Ouvrir une évaluation → vue « Bilan » de la rétroaction | Les niveaux portent **les noms saisis dans son échelle**, aucune parenthèse vide. ⮕ **MESURE** : recopier une ligne |
| 2.7 | Dans ce bilan, chercher une ligne « Progrès : … » | Apparaît **si et seulement si** l'élève est monté d'un niveau depuis l'évaluation précédente, **sur la même échelle**. ⚠ Si aucun élève n'est dans ce cas : **sans objet**, ce n'est pas un échec. ⮕ **MESURE** |

### C — les trois rendus du 27 août au soir, toujours dus

Règle commune : **sans échelle résolue, l'application n'invente rien** — pas de lettre, fond neutre,
cause au survol.

| # | Geste | Attendu |
|---|---|---|
| 2.8 | Profil élève → « Développement des habiletés », lire la lettre du niveau | **La même** que celle affichée plus haut dans le profil pour la même note. Le défaut réel était pire qu'une lettre fausse : deux niveaux différents pour la même note, sur la même page |
| 2.9 | Dans ce profil, couleur des badges d'artefacts | La couleur **correspond au code affiché dans le badge**. Avant, la note était resituée dans une échelle devinée, ce qui pouvait contredire le code écrit à côté |
| 2.10 | Comparer les barres de critères de « Forces et défis » et du bloc voisin | **Même dégradé, même légende** — ils viennent maintenant du même endroit |

## §3 · Décisions — ce ne sont PAS des vérifications

Réponses à écrire, pas à cocher.

| # | Question | Contexte |
|---|---|---|
| 3.1 | Les lignes sans niveau, en bas dans les deux sens ? | Décidé par la session : une absence de niveau n'est pas un niveau élevé. **Changement de comportement** |
| 3.2 | Un filtre « par niveau » dans la liste des évaluations ? | Le code en portait un, en I-D-M-E, visant un `<select>` **qui n'a jamais existé** dans `index.html`. Retiré. En faire un vrai filtre = fonction neuve |
| 3.3 | Quand est-ce qu'on pousse ? | **Six commits non poussés** (dont deux d'un autre chantier : #508/#427), travail du jour non commité, verdict Playwright périmé, **et une autre session écrit dans le dépôt** |
| 3.4 | ~~Le 1er septembre, dans quatre jours~~ | ⚠⚠ **CETTE PORTE ÉTAIT FAUSSE, ET GRÉGOIRE L'A CORRIGÉE** : « il n'y a pas de liste nominale. Je crois que tes informations ne sont pas à jour. » Il avait raison. La policy est **ouverte** (`Include → Everyone`) ; la liste blanche de janvier a été abandonnée en cours d'hiver. La fiche §5 le dit noir sur blanc : « La porte étant ouverte, il n'y a **personne à inviter nominativement** : il y a un changement à ANNONCER. » ⮕ **Cause de mon erreur** : j'ai lu `RELAIS.md` à 04 h 30 et recopié cette ligne dans la porte à 06 h 30 **sans la revérifier**. Entre les deux, une autre session avait commité `8c71b534`, `fd9f07cb` et `299afb32`, dont la correction de cette exacte inférence. Le relais était juste ; c'est ma lecture qui était périmée. ⮕ **Ce qui reste réellement dû** : insérer le paragraphe d'annonce dans le message de rentrée à la CoP (`Cowork A26 CoP Labo Codex/message-cop-rentree-2026.md`, rédigé, non envoyé), et relever dans la console les trois noms Cloudflare, la durée de session et la règle `Include` réellement en place |

## §4 · Ce que je n'ai pas pu vérifier

- **Playwright non relancé.** Verdict au mauvais SHA, **et une autre session travaille dans le
  dépôt** (`styles.css` a reçu +21 lignes non écrites par cette session ; 4 jetons `?v=`
  d'`index.html` modifiés par elle). Lancer la suite dans cet état fait rougir des specs au hasard
  — incident du 26 août (#523).
- **Aucun rendu vu dans Safari.** Les tests tournent dans `node`. C'est tout l'objet de cette liste.
- **Pas de porte iPad, volontairement.** Le lot n'a pas touché une ligne de CSS ; en poser une
  serait le réflexe de gabarit que les deux règles du 24 août visent.
- **Une faille ouverte puis refermée dans la même session.** En remplaçant les libellés en dur par
  le nom saisi par l'utilisateur, la session faisait passer du texte utilisateur dans un `innerHTML`
  sans filtre — chemin d'injection **qui n'existait pas avant le correctif**. Trois échappements
  posés, banc d'injection à l'appui. ⚠ L'en-tête d'`evaluation-retroaction.js` affirmait « 0 usage
  d'`echapperHtml`, aucun innerHTML interpolé » : **c'était faux depuis l'origine** (noms de
  critères, de tampons, de cartouches). Mention corrigée ; **les autres sites restent à traiter**.
- **Deux assertions ne mordaient pas au premier jet**, trouvées par break-test et non par relecture :
  la garde « même échelle » passait pour la mauvaise raison (le code de l'évaluation précédente
  était simplement absent de l'échelle courante), et l'échappement du nom de critère n'était pas
  exercé par la fixture. Durcies, puis re-cassées.

---

## Au retour du terrain — FAIT le 28 août 2026

**0.2 était verte** : le build n'était pas en retard. Les deux échecs sont donc réels, et ils ont
**deux causes différentes**. Les captures de Grégoire (artefacts 8 et 10, Benjamin A.) les ont
départagées — le panneau Évaluation y affiche en jaune « **Grille d'origine introuvable dans les
modèles actuels — affichage depuis les données sauvegardées** », et le champ « Grille d'évaluation »
est vide.

### 2.6 — PAS une régression de ce lot → **#576 ouvert**

Le bilan affiche son entête puis **rien**, et saute aux jetons. Cause : `_chargerGrilleDefBilan`
rend `null` quand la grille d'origine n'est plus dans `grillesTemplates` ; `_collecterCriteresBilan`
exige cette grille et rend `[]` ; tout le bilan personnalisé en découle (`defis` vide,
`tousMaitrises` faux car il exige `criteres.length > 0`, `_rendreForceBilan` sans matière). Chemin
intact depuis l'origine — la porte l'a seulement mis sous les yeux. ⮕ La donnée est pourtant là :
l'évaluation enregistrée porte ses critères AVEC leur nom, et `evaluation.js` a déjà un repli
explicite pour ce cas (`:1158`, `:1426`). Le bilan n'en a jamais eu.

### 2.7 — **RÉGRESSION DE CE LOT, corrigée dans `e2819cea`**

La garde « même échelle » de la ligne « Progrès » comparait les `echelleId` **bruts**. L'échelle
courante de Grégoire est « IDME et niv 0 (**restaurée**) » — recréée par la réparation de #542, donc
sous un identifiant NEUF — pendant que ses évaluations d'H2026 en désignent un ancien : la ligne ne
pouvait plus jamais s'afficher. ⮕ Corrigé par `_memeEchelleBilan`, qui applique les deux règles déjà
écrites dans `obtenirEchelleCommuneDesEvaluations` : comparer les échelles **résolues** jamais les
ids, et traiter une échelle absente ou introuvable comme une **absence**, pas comme un barème
concurrent. Trois cas neufs à la sentinelle, **4 mutations de plus, 4 rouges** (18 au total).

### Les décisions

| # | Verdict de Grégoire | Suite donnée |
|---|---|---|
| 3.1 | « je garde » | Les lignes sans niveau restent en bas dans les deux sens. Verrouillé par la sentinelle |
| 3.2 | « je garde » | Le filtre par niveau reste retiré ; aucune fonction neuve à écrire |
| 3.3 | « commit et pousse maintenant » | **Commit fait** (`e2819cea`). **Push impossible pour l'instant** : la spec `planif-alignement` est rouge à cause du bandeau #508 (`position: fixed`, z-index 950, qui avale les clics) — diagnostic et correctif d'une session parallèle, qui attendaient que `index.html` se libère. Séquence proposée : elle commite son correctif, régénère le verdict au SHA, pousse les onze commits |
| 3.4 | « il n'y a pas de liste nominale » | **Il avait raison** — voir la ligne corrigée au §3 |

## Ce qui reste dû après cette liste

**B10 de #575**, et il bute sur **#555** (la marque de maîtrise). `synthese-retroaction-data.js` et
`evaluation-retroaction.js` testent les codes en toutes lettres — 8 lignes / 18 comparaisons pour le
second. L'ORDRE se dérive d'une échelle ; « faible » et « maîtrisé », non. Un test constate le
compte de 18 : il rougira quand #555 les retirera, et c'est le signal voulu.

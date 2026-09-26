# Demande de relecture croisée, AVANT fusion – lot A de l'enregistrement « en anonymisation, on travaille normalement, et rien d'identifiant ne s'affiche » (#751, #736)

> Écrite le 26 septembre 2026, vers 14 h 30 (Toronto), par Claude Code. Branche `lot-a-anonymisation-enregistre` (arbre principal), base `fd9d1dc7` (1.159.13, poussée). Commit du lot : `ad63a2e1`. **Rien n'est fusionné ni poussé, aucune release.** Verdict attendu dans `plans de travail/RELECTURE-2026-09-26-lot-A-anonymisation.md`. Quatre textes attendent l'accord de Grégoire (§ 6).
>
> Pour lire le code sans changer de branche : `git diff fd9d1dc7..ad63a2e1 -- js/ index.html tests/`.

## 1 · Le mécanisme : une garde centrale, et le masque là où la garde ne peut rien

**L'écriture.** `sauvegarderDonneesSelonMode` (`js/modes.js`) n'a plus de blocage. En anonymisation, avant d'écrire, elle passe les données à `retirerSubstitutionsAnonymisation`. Celle-ci retire **par motif** ce que l'anonymisation pose à la lecture, quel que soit le chemin qui l'a relu :

- « Élève N » dans n'importe quelle chaîne d'un élément (rétroaction finale, rétroaction d'un critère, « Bonjour Élève 3 ! ») → le prénom réel de l'élève que le mapping actuel numérote N ; un N absent du mapping reste tel quel ;
- `etudiantNom` pseudonyme → « prénom nom » de la fiche réelle ; `groupe` « Gr. A » → le vrai numéro (mapping des groupes inversé, sinon la fiche) ;
- les marqueurs `daReel`, `daAffichage`, `etudiantDAReel`, `etudiantDAffichage`, `groupeReel`, `ordreAffichage`, et le nom / prénom qu'une présence reçoit à la lecture.

Elle ne s'applique qu'aux trois clés que l'anonymisation substitue (`groupeEtudiants`, `evaluationsSauvegardees`, `presences`), et seulement en anonymisation.

**Pourquoi par motif et pas « ne pas écrire un champ inchangé »** : l'auto-save de l'évaluation modifie en place le tableau lu dans le cache (`evaluation-chargement.js` ≈ 1994) ; « l'avant » n'existe plus au moment d'écrire. Le motif « Élève N » est distinctif, et c'est la seule forme que la substitution prend depuis le format actuel du mapping.

**Le masque.** Un texte libre ne se dé-identifie pas de façon fiable (consigne § 2.3) : là où l'écran l'affichait, il est **masqué**, et un champ masqué **ne s'écrit pas** (la valeur en base est réécrite telle quelle). La mention vient d'une seule source, `window.MENTION_MASQUE_ANONYMISATION` (`modes.js`).

## 2 · Le recensement de la consigne § 2.2, champ par champ

| Écran | Ce qui arrivait | Remède (une ligne) | Banc |
|---|---|---|---|
| Évaluation d'une copie : rétroaction finale | pré-remplie par `anonymiserTexteRetroaction` ; l'« Adresse » génère « Bonjour Élève N ! » depuis la liste anonymisée ; l'auto-save relit la zone | garde centrale (prénom rendu) | WebKit (a)(c), Vitest B |
| Évaluation : `etudiantNom`, `groupe` d'une évaluation créée | bâtis depuis l'élève anonymisé (« Élève 3  », « Gr. A ») | garde centrale (fiche réelle) | Vitest B |
| Bulle « Rétroaction » des travaux (`travaux-ui.js`) | zone pré-remplie anonymisée, **et** tableau relu par `obtenirDonneesSelonMode` (anonymisé et filtré par cours) | lecture brute + garde centrale | Vitest B (garde) ; **pas de banc navigateur** |
| Présences : notes | affichées en clair ; écrites depuis la zone | masquées, non modifiables ; la note en base est réécrite (`_notesDuChamp`) | WebKit (b)(c)(d) |
| Présences : colonne DA | le vrai DA (la liste anonymisée garde `da`) | `obtenirDAAffichage` | WebKit (d) |
| Intervention : description, observations, bilan | affichés **en clair** dans le formulaire | masqués, non modifiables, gardés en base (`_texteDuChamp`) | WebKit (c)(d) |
| Intervention : notes individuelles | pré-remplies « Élève N » **et écrites telles quelles** (le chemin écrit en direct, sans garde, depuis toujours) | masquées ; un champ masqué est sauté | WebKit (c)(d) |
| Fiche d'élève (DA, nom, prénom) | refus « Repasse en mode normal » | **identité non modifiable** en anonymisation, reprise de la base à l'enregistrement ; le reste (programme, SA, groupe, date d'arrivée) se modifie | WebKit (c) |
| Messages de la fiche (modifié / ajouté / supprimer ? / DA en double / inactif) | nommaient l'élève réel | pseudonyme (`anonymiserNom`) | WebKit (c), pour « modifié » |

**Affichage seul (#751)** : volet confidentiel entier (parcours, diagnostic, défis, notes, notes de présences : ni lus ni affichés, bouton « Enregistrer » caché), notes et bilan des interventions dans les cartes et au profil. **Portraits** : sans objet — retirés le 11 sept. (D.2), plus lus nulle part. « Mes notes » du rapport : déjà masquées (#866), inchangées.

## 3 · Trouvailles, et leur issue

1. **Corrigé dans le lot** — `travaux-ui.js`, bulle de rétroaction et suppression d'un fichier avec son évaluation : ils lisaient par `obtenirDonneesSelonMode` puis réécrivaient. En **mode normal aussi**, la réécriture perdait les évaluations des autres cours du trimestre (le filtre par `coursId`). Sur le chemin du lot (source des substitutions) : lecture brute. Aucun banc navigateur pour ces deux gestes (aucune copie dans le pack démo) ; mesuré en lecture `[lu]`.
2. **Corrigé dans le lot** — au profil, la note individuelle et le titre d'une intervention étaient injectés **sans `echapperHtml`** (règle 1). Même ligne que le masque.
3. **À trancher (issue 2 ?)** — les **notes d'intégrité** de l'évaluation et le **titre** d'une intervention s'affichent en clair en anonymisation. Même règle, mais les notes d'intégrité ont trois écrivains à garder, dont l'« Enregistrer » ; hors du lot. Non inscrites au BACKLOG faute de symptôme vécu (règle du 24 août) : à toi de dire.
4. **Commenté (issue 3)** — `estModeeLectureSeule` garde son nom : il ment désormais, mais 47 bancs le simulent sous ce nom ; commentaire posé.
5. **Issue 3** — les deux refus de `groupe.js` étaient dans du code mort (`#students-tbody` absent d'`index.html`) ; retirés quand même.
6. **Assumé** — en anonymisation, l'import d'une liste d'élèves montre les noms qu'on vient de coller (ce que l'usager apporte lui-même à l'écran) ; et un **ajout** d'élève laisse taper le vrai nom.
7. **Observation, sans suite** — le menu des élèves de l'évaluation numérote « Élève 1… » par rang, le mapping par tirage : le même élève peut s'appeler « Élève 2 » au menu et « Élève 7 » dans la rétroaction. Préexistant, affichage seul.

## 4 · Preuves

**Bancs neufs** — `tests/unit/sentinelle-lot-a-anonymisation-garde-substitutions.test.js` (6) ; `tests/integration/lot-a-anonymisation-enregistre.spec.js` (5, WebKit). Les valeurs de substitution y sont produites par les **vraies** fonctions d'anonymisation, puis réécrites comme les écrans le font. Noms fictifs.

**Rouge avant, vert après** — sur `fd9d1dc7` (worktree jetable) : WebKit **5 rouges sur 5**, Vitest 3 rouges sur 6 (les deux cas « C » sont verts avant par construction : l'écriture était refusée, rien ne bougeait ; ils se prouvent par mutation, ci-dessous ; le cas « D » est un témoin). Après : 5/5 et 6/6.

**Mutations, 10 sur 10 rouges** (restauration par copie, empreinte vérifiée) :

| Mutation | Rouge |
|---|---|
| M1 rétablir `return false` en anonymisation | Vitest 3, WebKit (a) |
| M2 retirer l'appel à la garde | Vitest 3, WebKit (a)(c) |
| M3 ne plus rendre les prénoms | Vitest 1 |
| M4 ne plus rendre le groupe | Vitest 1 |
| M5 note de présence masquée écrite telle quelle | WebKit présences |
| M6 texte d'intervention masqué écrit tel quel | WebKit intervention |
| M7 note individuelle masquée écrite telle quelle | WebKit intervention |
| M8 identité de la fiche prise à l'écran | WebKit fiche |
| M9 volet confidentiel non masqué | WebKit volet |
| M10 notes de présence non masquées | WebKit présences |

**Bancs de l'ancien refus, réancrés délibérément** (motif écrit dans chaque fichier) : `sentinelle-560-garde-des-modes-liste` (B), `sentinelle-560-portee-suppression-fichier` (C), `sentinelle-563-jetons-echec-silencieux` (refus modélisé par `'error'`), `sentinelle-jeton-retire-fichier-reprise` (idem ; l'assertion du message part — `'error'` est truthy, #618, lot B), `sentinelle-anonymisation-cadre-liste-etudiants` (plus de refus, identité masquée), `audit-onglet-suivi-2026-09-05` E6 (l'échappement passe par `_valeurTexteLibre`), spec `anonymisation-cadre-liste-etudiants` (« Modifier » ouvre la fiche, identité masquée). **Aucune assertion supprimée sans remplaçant** : le refus n'existe plus ; son remplaçant est le banc neuf.

**Autres** — Vitest complet sur `ad63a2e1` : 642 fichiers, **7 450 / 7 450**, aucune ligne « Errors » ni « Unhandled ». Verdict Playwright complet : **pas encore**, après ta relecture.

## 5 · Stock (tarir n'est pas réparer)

- **Ce lot tarit** la source des substitutions pour l'évaluation, les présences, les interventions et la fiche.
- **Le stock possible** : des notes individuelles d'intervention enregistrées **en anonymisation avant ce lot** contiennent peut-être « Élève N » (ce chemin écrivait sans garde). Elles restent telles quelles ; masquées en anonymisation, visibles en mode normal. Non mesuré dans les données de Grégoire ; une mesure en lecture seule suffit (chercher `Élève \d+` dans `*_interventions`).
- **Le risque assumé de la garde** : un texte réel qui contiendrait déjà « Élève 12 » (écrit à la main, ou venu de ce stock) recevrait, s'il est réécrit **en anonymisation**, le prénom de l'élève que le mapping actuel numérote 12. Seulement pour les évaluations et les présences.

## 6 · Les textes que Grégoire doit accepter avant le push

1. **La mention** « Masqué en anonymisation » : placeholder des champs masqués (notes de présences, textes d'intervention, DA / nom / prénom de la fiche) ; texte en italique à la place d'un texte libre (cartes d'intervention, profil) ; phrase unique du volet confidentiel.
2. **L'aide « Mode Anonymisé »** (`index.html` ≈ l. 11291, accordéon « Formation ») dit aujourd'hui : « Tes vraies données avec noms fictifs automatiques » ; « Préfixe «AN.» devant les numéros de groupe » (faux : « Gr. A ») ; **« Lecture seule (aucune modification possible) »**. Proposition :
   - « Tes vraies données, les noms remplacés par « Élève 1 », « Élève 2 »… »
   - « Les groupes deviennent « Gr. A », « Gr. B »… »
   - « Tu travailles normalement : tout s'enregistre dans tes vraies données »
   - « Les notes libres et la fiche confidentielle sont masquées »
3. **L'aide de la fiche confidentielle** (`accompagnement-contenu-popup.js` l. 1594) finit par « et anonymisées en mode anonymisation ». Proposition : « et masquées en mode anonymisation ».
4. **Nouvelles** (proposition de Cowork, reprise telle quelle) : « Mode anonymisation : tu travailles normalement et tout s'enregistre ; seuls les noms, et tout ce qui pourrait identifier un·e élève, sont cachés à l'écran. »

## 7 · Ce que je te demande de regarder en particulier

1. **Le motif « Élève N »** : un faux positif réaliste dans les textes de Grégoire ? (La garde ne s'applique qu'en anonymisation, et seulement si N est dans le mapping du trimestre.)
2. **La fiche d'élève** : j'ai laissé le **groupe** modifiable et affiché en clair dans le formulaire (un numéro de groupe n'identifie pas un élève, et il faut pouvoir déplacer un élève). Dis-le si tu le veux masqué.
3. **Le volet confidentiel** : masqué **entier**, cases comprises (parcours, diagnostic). Le bouton « Confidentiel » reste, avec sa pastille verte (« a des informations ») : fuite ou pas ?
4. **Les deux lectures brutes de `travaux-ui.js`** (§ 3.1) : elles changent aussi le mode normal. Vérifie que rien en aval ne comptait sur le tableau filtré.

---

## 8 · Réponse aux cinq retouches (26 sept., vers 16 h, commit `10b3a9cf`)

> Verdict de Cowork : `RELECTURE-2026-09-26-lot-A-anonymisation.md` (À COMPLÉTER). Les quatre textes du § 6 sont acceptés par Grégoire tels quels ; les deux aides sont appliquées, les Nouvelles viendront avec la release.

| | Fait | Preuve |
|---|---|---|
| **R1** | La garde saute un élément identique à son **empreinte**. ⚠ Écart avec la consigne : pas de comparaison à « la version en base » — `db.getSync` rend l'objet même du cache mémoire quand les données sont volumineuses (`db.js` l. 1466), et l'auto-save le modifie en place : la « base » serait déjà la copie modifiée, et la garde n'agirait plus sur elle. Les empreintes sont prises par `changerMode` à l'entrée en anonymisation, puis reprises après chaque écriture gardée ; sans empreinte (démarrage déjà en anonymisation), tout le tableau passe par la garde. | Vitest R1 (2 essais) : la voisine « Élève N » ressort intacte, rouge sur `ad63a2e1` ; mutation « ne plus sauter l'inchangé » → rouge. |
| **R2** | Pas de pastille en anonymisation (`_pastilleConfidentielVisible`). | Essai (d) : pastille en mode normal (témoin), absente en anonymisation ; rouge sur `ad63a2e1` ; mutation → rouge. |
| **R3** | Banc `travaux-lecture-brute-autres-cours.spec.js`, fixture à deux cours : la bulle, la suppression, et la bulle en anonymisation (titre, zone, base). Fiche **#958** inscrite (issue 1, corrigée ici ; stock non mesuré). | 3 rouges sur `fd9d1dc7`, 3 verts ; 2 mutations (lecture filtrée rétablie, une par geste) → rouges. |
| **R4** | Notes d'intégrité : masquées (`poserChampTexteLibre`, `modes.js`), omises de l'écriture si masquées (la fusion garde la base). Titre : **titre générique** « Intervention du ‹date› » (« Rencontre du ‹date› » dans la vue Rencontres), par une seule fonction `titreInterventionAffiche`, aux neuf endroits où il s'affiche (cartes, rendez-vous, en-tête et champ du formulaire, profil, deux graphiques, trois points des corrélations) ; le champ est masqué et le titre gardé en base. Masquer aurait rendu les graphiques illisibles. | Essai R4 (notes) et essai intervention (titre) : rouges sur `ad63a2e1` ; 2 mutations → rouges. |
| **R5** | ⚠ La lecture de la fiche est inexacte, le défaut est réel. Les trois filtres comparent le menu à la liste **anonymisée** (pas brute). Le défaut mesuré : le menu n'est rempli **qu'au démarrage du module** ; après une bascule, il garde les vrais numéros pendant que la liste porte « Gr. A » → tableau à **0 ligne**, « Verrouiller » n'écrit rien sans un mot ; et, rempli en anonymisation, il écrivait la préférence « Gr. B » en base. Correctif : la valeur d'une option est le vrai numéro, le libellé celui de l'écran ; les filtres comparent le vrai groupe. | Essai R5 (mode cours, deux sous-groupes) : rouge sur `ad63a2e1` ; mutation → rouge. |

**Toutes les mutations, relancées sur le code final : 17 sur 17 rouges** (les 10 du § 4, les 7 des retouches). Vitest complet sur `10b3a9cf` : 642 fichiers, **7 452 / 7 452**, aucune ligne « Errors » ni « Unhandled ». Specs du lot en WebKit : 12 / 12. Verdict Playwright complet : pas encore.

**Trouvaille de la mesure R4, hors du lot — à trancher.** `[exécuté]` au banc, trajet de la copie rejoué (celui des specs #699/#882), **mode normal** : une évaluation au statut « IA » ouverte depuis sa copie, puis « Enregistrer » → la base repasse à **« recevable »**, notes d'intégrité **vidées**. Le chemin de la copie ne recharge pas le statut d'intégrité (seul `modifierEvaluation`, depuis la Liste, le fait : `_chargerStatutsEtBadgesModif`), et `_lireChampsDOMMod` relit l'écran. Touche des évaluations d'élèves ; non inscrite, faute de symptôme vécu — à toi et à Grégoire.

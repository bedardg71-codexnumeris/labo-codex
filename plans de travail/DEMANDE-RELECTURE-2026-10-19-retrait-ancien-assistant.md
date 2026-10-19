# Demande de relecture – retirer les écrans de l'ancien assistant en sept étapes

> Claude Code, lundi 19 octobre 2026, après-midi (Toronto). Consigne : `CONSIGNE-LOT-2026-10-19-retrait-ancien-assistant.md` (13 h 52), décision de Grégoire de 13 h 51 (« Oui, on le retire »). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit sur `main`, **non poussé**. Il porte aussi la consigne du jour, son archive (`_ancienne-CONSIGNE-DU-JOUR-2026-10-19-fusion-verdict-github.md`) et `VERDICT-RELECTURE-2026-10-19-fusion-verdict-github.md`. **Pas de verdict complet, pas de version, pas de push.**

## En bref

| | Avant | Après |
|---|---|---|
| `js/materiel.js` | 992 lignes, 118 définitions | 245 lignes, 26 |
| `js/materiel-assistant.js` | 554 lignes, 56 définitions | 396 lignes, 37 |
| `js/materiel-lecture.js` | 1 212 lignes, 119 définitions | 283 lignes, 20 |
| Application (`js/`, `styles.css`, `index.html`) | | **−2 134 lignes, +74** |
| Bancs (`tests/`) | | −2 229 lignes, +217 (dont les modèles figés) |
| Fonctions de `js/` (mesure de complexité) | 13 725 | 13 422 |
| **Au-dessus de 15 (#1051)** | **454** | **454** |

## 1. Les appelants, mesurés avant tout retrait

Méthode : un graphe d'atteignabilité (acorn) sur les trois fichiers. Les racines sont tout ce qui les appelle **hors d'eux** : `materiel-dissection.js`, `materiel-dissection-lecture.js`, `materiel-creation.js`, les `data-action` d'`index.html` (`materiel.essayerExemple`, `reconnaitreTexte`, `taperMain`), et les appels de la dissection (`montrerCreee`, `recommencer`, `MAX_NOM`). `grilles.js` et les autres modules n'appellent aucun des trois. Tout ce que ces racines n'atteignent pas part, et rien d'autre.

**Écart avec la mesure de Cowork** (indice, pas preuve) : `estEnPoints` et `estRetro` **restent**, car `calculs` et `construire` les appellent. `ramenerA100`, absent de sa liste, **part**.

**Ce qui part, définition par définition :**
- **`materiel.js` (92)** : LIBELLES_ETAT, A, texte, valeur, mention, classeChamp, champ, nomsGrillesDuTrimestre, calculs, libelleCode, detailsCritereHtml, enteteNiveau, mentionPonderation, casesHtml, rangeeCritere, legendeHtml, apercuHtml, points, apercuPointsHtml, avert, blocPonderation, blocAClasserRestant, blocPoints, derivesHtml, aDesTextes, creeListeHtml, manquantsHtml, MOTS_APP, MOT_FUSION, motApp, titreEtape, choix, etapeAxes, menuRole, caseLue, etapeRoles, premiereCase, etapeNature, champCode, champsNiveau, etapeValeurs, etapePond, etapePoints, etiquettePassage, etapeClasser, ETAPES, boutonPrecedent, progressionHtml, questionHtml, pilule, rappelsHtml, enteteVerifNiveau, rangeeVerif, nomGrilleHtml, rangeeVerifPoints, enteteVerifNiveauPoints, verificationPointsHtml, verificationHtml, assistantHtml, focaliser (fondu dans `rendre`), remplacer, rafraichirDerives, ouvrirAssistant, charger, changer, relu, montrerPlageARemplir, CIBLES, etatDeSaisie, saisir, etapeVers, creer.
  - Et dans l'objet `materiel` : allerEtape, suivant, precedent, allerClasser, choisirSens, choisirRole, choisirSuiteNom, choisirNature, ramenerA100, placer, ecarter, annuler, ajouterCritere, ajouterNiveau, saisir, creer, etatCourant, modeleCourant, apercuHtml, assistantHtml.
- **`materiel-assistant.js` (19)** : paire, copie, preparer, aDuTexte, niveauARegler, etapesPour, recalculerEtapes, ramenerA100, critereVide, ajouterCritere, ajouterNiveau, passage, placer, ecarter, annuler, choisirNature, choisirSens, choisirRole, choisirSuiteNom.
- **`materiel-lecture.js` (99)** : toute l'interprétation d'un tableau en grille. On y trouve le dépliage (`deplier`, `transposerGrille`), les rôles (`proposerRoles`, `changerRole`, `ROLES_*`, `CHOIX_SUITE`), la reconnaissance de l'étape 5b (réglettes, points des niveaux, pied, puces, suites, parties, pondération au bout du nom), `modeleDepuisRoles`, `interpreter`, `inverser`, `relire`, `charger` et ses deux messages, `modeleVide`, `exempleHtml`, et l'export `L.propre`, qui n'avait aucun consommateur. La liste complète, nom par nom, est dans le diff de ce commit sur `js/materiel-lecture.js`.

**Ce qui reste.**
- **`materiel.js`** : l'accueil, le collage vers la dissection, « Taper ma grille à la main », la confirmation et « Aller plus loin », le brouillon de la dissection.
- **`materiel-assistant.js`** : `calculs`, `construire`, les bornes `MAX_*`, `NOMS_ETAPES` (la dissection en cite une), `nombre`, `etatSaisi`, `nomLibre`, `estEnPoints`, `estRetro`.
- **`materiel-lecture.js`** : `lirePressePapiers`, `lireHtml`, `lireTexte`, `coder`, `partsEgales`, `casseDePartie`, `plagesContigues`.
- **Le bandeau « en développement »** : non touché.

## 2. Rien ne change à l'écran

- **Specs de la dissection :** les specs `materiel-dissection-*` passent **sans avoir été modifiées** (contrôlé : `git status` vide sur elles).
- **Une simplification, sans effet visible :** la confirmation disait « Apporter autre chose » quand elle ne venait pas de la dissection. Seule la dissection y mène désormais (`montrerCreee`), et elle posait toujours `depuisDissection`. J'ai retiré le drapeau et la branche : le bouton dit « Coller une autre grille », comme avant.

## 3. Les données

**Aucune clé ne servait à l'assistant seul.** Son état vivait en mémoire (`etat`, dans `materiel.js`) ; il ne lisait que la liste des grilles et n'écrivait que par `materielCreation`, qui reste. Il n'y a donc **aucun stock chez les gens**, rien à assumer.

## 4. Les bancs

### Partis avec les écrans

Six specs WebKit, toutes **suspendues depuis le 18 oct.** :
- **`materiel-etape5-points`** : une grille en points collée, vérifiée « sur 64 », créée seule.
- **`materiel-etape5b-reconnaissance`** : F1 et F6 collées, lues sans geste, vérifiées, créées.
- **`materiel-lot2-assistant`** : les six étapes de l'exemple ; la cartouche des rétroactions ; l'iPad (44 px, pas de défilement de côté).
- **`materiel-lot3a-roles`** : la grille fictive lue en rôles ; les sous-critères créés ; les menus de rôle à 44 px.
- **`materiel-lot3b1-visible`** : « La voir dans Grilles, Échelles, Cartouches » après une création par l'assistant. Grilles et Échelles restent couverts par `materiel-dissection-2a` et `-2b`. Pour Cartouches, voir les trouvailles.
- **`grilles-fictives-5b.js`** : une aide de banc qu'aucun banc n'employait plus. Le BACKLOG renvoie à l'historique.

Dans les bancs Vitest gardés, les essais qui n'éprouvaient que l'assistant (112 essais en tout) :
- **`materiel-lot2-assistant`** : E (ses étapes), R (« Ramener à 100 % »), K (« À classer »), S.a (son écran), et le geste « Ajouter un niveau » de N.a.
- **`materiel-lot3a-roles`** : D (le dépliage), G, P et M (la lecture en rôles et ce qu'elle proposait), S (son étape), R.b et R.c.
- **`materiel-etape5-points`** : G.a à G.c, L (la lecture), A.a (ses étapes), U.a à U.c et U.e (son interface), N.c.
- **`materiel-etape5b-reconnaissance`** : F et R (la reconnaissance), U.a à U.e et U.g, N.a, P.a et P.b.
- **`materiel-lot1-lecture`** : I et I bis (interpréter, inverser), L.g, la fin de L.f, S.b et S.c (l'aperçu).
- **`materiel-lot3b1-visible`** : l'assertion sur le message « aucun tableau », que l'assistant seul affichait.

### Restés, sans être affaiblis

Ces essais éprouvent la logique commune :
- **la création :** `calculs`, `construire`, `materielCreation.creer` ;
- **l'affichage :** la confirmation et « Aller plus loin » ;
- **la lecture :** `lireHtml`, `lireTexte`, `lirePressePapiers`, `coder`, `plagesContigues`, `casseDePartie`.

Ils prenaient leurs modèles de fonctions qui partent. Ces modèles sont **figés**, avant le retrait, avec le code d'avant : 24 modèles dans `tests/fixtures/materiel/modeles-assistant-figes.json`, lus par `tests/unit/_helpers/modeles-assistant-figes.js`.
- **Contrôles :** chaque modèle est du JSON exact (aller-retour vérifié), et une seconde génération rend les mêmes 23 premiers à l'identique.
- **Les assertions :** inchangées, sauf celles qui ne portaient que sur la lecture (désormais sur une donnée figée), retirées.
- **Supposition :** le générateur n'est pas commité, puisque le code qu'il appelle est parti. Les modèles se lisent, ne se régénèrent pas, et le fichier le dit.

### Regagnés

- **`materiel-etape6-plus-loin.spec.js` :** suspendue depuis le 18, elle tourne à nouveau, par la création réelle et `montrerCreee` (2 essais verts). C'était le seul banc où le lien « Les trois façons d'évaluer un critère » ouvre l'aide dans un navigateur.
- **`icones-i-catalogue-c3.spec.js` :** même montage, sur le modèle figé de F6.

### Résultats

- **Vitest complet :** 783 fichiers, **9 196 essais verts** (9 308 avant : 112 retirés, listés plus haut).
- **WebKit :** les 22 fichiers `materiel-*` et Grilles de critères, **44 verts**, 0 suspendu, 0 échec.

## 5. Le garde-fou de complexité (#1051)

**454 → 454.** Aucune des 210 définitions retirées ne dépassait 15 : elles avaient été écrites sous le cliquet. Le maximum mesuré sur les anciennes versions est 13 (`materiel.js` et `materiel-assistant.js`) et 14 (`materiel-lecture.js`). Ce qui baisse :
- 303 fonctions en moins (13 725 → 13 422) ;
- 1 296 lignes de code en moins (151 472 → 150 176).

La somme au-dessus de 15 ne bouge pas non plus (11 439).

## 6. Le BACKLOG

- **Périmées, avec leur motif :** #1099, #1100 et #1101, trois règles de la seule reconnaissance automatique (la dissection s'étiquette à la main).
- **Gardées :**
  - **#1097 :** la dissection lit toujours le premier tableau seulement (`lireHtml`).
  - **#1098 :** elle relève d'« Aller plus loin », pas de l'assistant.
  - **#1091 :** l'export ne borne toujours pas les niveaux. Seul son remède « à la saisie, dans l'assistant » est périmé ; la fiche le dit déjà assez pour être reprise.
- Aucune fiche neuve.

## 7. Jetons, documents

- **Jetons d'`index.html`** : `materiel.js`, `materiel-assistant.js`, `materiel-lecture.js`, `materiel-dissection.js` (son en-tête seul) et `styles.css`.
- **CSS :** 120 règles retirées (les écrans, l'aperçu, la vérification). Deux listes de sélecteurs ont été raccourcies, `.materiel-confirmation h2:focus` et `.materiel-confirmation .btn` gardés.
- **Documents :** `docs/` et `DATA-OWNERSHIP.md` ne décrivaient pas l'assistant.

## Trouvailles (aucune hors du code commun)

1. **Plus aucun chemin, à l'écran, vers les rétroactions.** Sont concernés : la carte « Tes rétroactions », « Les voir dans Cartouches de rétroaction » et `construireCartouche`. La dissection ne crée jamais de cartouche (elle pose la nature « descripteurs »), et seul l'assistant laissait choisir « rétroactions ». Le code reste, vivant, dans des fonctions qui restent, et `materiel-lot2-assistant` l'éprouve encore (B.d, B.e, W.a, W.e). Issue **3** : sans conséquence observable, notée ici seulement (pas de symptôme vécu, donc pas de fiche).
2. **`calculs` garde des branches que seul l'assistant nourrissait** : les passages « à classer », `peutRamener`, `manquesLecture`. La dissection n'en produit pas. Même issue **3**.
3. **Un commentaire de `materiel-dissection-1.spec.js`** (l. 81) dit encore « l'assistant reste débranché ». Je ne l'ai pas touché : la consigne veut ces specs intactes.

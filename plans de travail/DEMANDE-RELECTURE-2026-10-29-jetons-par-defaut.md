# Demande de relecture – Les jetons par défaut : l'écran dit ce que fait l'application (29 octobre 2026)

> Claude Code, jeudi 29 octobre 2026, matin (Toronto). Consigne : `plans de travail/CONSIGNE-LOT-2026-10-29-jetons-par-defaut.md`.
> Base : `main` = `75f3df3b` (le commit des documents de Cowork). Code : `3f4f60da`. BACKLOG : **#1179** (coché).
> Rien n'est poussé ; ni release ni verdict Playwright complet. Données fictives partout.

## Vue d'ensemble

Le lot applique la décision de Grégoire en trois gestes :
- **le moteur respecte un « non » explicite** (`js/evaluation-jetons.js:66`, `:116`) ;
- **le formulaire affiche ce que le moteur résout** (`js/pratiques-gestion.js:1350`, qui lit `configJetonsResolueDeLaPratique`, `evaluation-jetons.js:141`) ;
- **une pratique neuve porte un choix explicite.**

Pour une pratique existante sans réglage, le moteur ne change rien. Aucune donnée n'est réécrite.

**Un écart avec la consigne**, décidé et nommé au § 2 : l'assistant « écrit déjà la réponse » seulement pour une Spécifications. Les trois autres familles ne posent pas la question. Le refus explicite est donc posé à la création, dans l'assistant et dans les modèles fournis.

## 1. Les chemins de création, mesurés

Relevé en lecture sur l'arbre du lot (un agent en lecture seule, puis vérification aux sites touchés). « Tel quel » : la
copie reprend les trois emplacements (`configuration.jetons`, `config.jetons`, `jetons`).

| Chemin | Avant | Après |
|---|---|---|
| Assistant, Spécifications (`creerPratiqueV2`, `wizard-pratique-v2.js:2597`) | écrit `{ activer: … }` ; le « non » n'était pas lu | inchangé ; le « non » est respecté (moteur) |
| Assistant, Sommative, Standards, Dénotation | **aucun réglage** : jetons actifs | `jetons: { actif: false }` à la création (`:2677`) |
| Assistant, « Partir d'un modèle » (clone du modèle) | le modèle fourni n'en porte aucun : actifs | le modèle porte le refus ; l'assistant le pose aussi si la source n'en a pas |
| Assistant en **modification** | — | rien n'est posé (essai « en MODIFICATION ») |
| « Utiliser dans ce trimestre » (`ajouterPratiqueALaSelection`, `pratiques-gestion.js:756`), modèle fourni | aucun réglage : actifs | la copie du modèle porte `jetons: { actif: false }` (`pratiques-bibliotheque.js:49` et les quatre autres) |
| « Dupliquer pour créer ma pratique » (`dupliquerEtEditerPratique`, repli sur un modèle fourni) | idem | idem |
| Dupliquer (bibliothèque, éditeur), importer d'un autre trimestre, Réserve, codex `.zip` | tel quel | **inchangé** |
| Import d'un fichier de pratiques (bibliothèque) | tel quel | inchangé |
| Import sélectif d'une sauvegarde (`import-export.js:3543`) | **retire le bloc plat** (le schéma n'a pas de clé `jetons`) | inchangé : trouvaille (a) |
| Partage `.lcz` (`partage-schemas.js:620`) | **retire `config` et le bloc plat** | inchangé : trouvaille (a) |
| `dupliquerPratique` (« Dériver une maquette ») | déplace le bloc plat sous `config.jetons` | inchangé : trouvaille (a) |
| `window.PRATIQUES_PREDEFINES` | aucun installateur (#469) | inchangé |
| Démo (`peuplerNamespace`, `demo-std-litt`, `demo-spe-litt`) | aucun réglage | **inchangée** (consigne) |

## 2. Écart avec la consigne : où se pose le refus

La consigne prévoyait le refus dans « le formulaire, à la création ». **Mesuré : le formulaire ne crée pas de pratique.**
« + Nouvelle pratique » ouvre l'assistant (`creerNouvellePratique`, `pratiques.js:864`). L'assistant ne pose la question
des jetons qu'à une Spécifications. Sans geste de plus, une Sommative neuve aurait continué d'offrir les jetons, contre la
décision de Grégoire. Le refus est donc posé à deux endroits :

- **dans l'assistant**, à la création seulement (`finaliserCreationPratique`, `:2677`) : `jetons: { actif: false }` si la
  pratique ne règle rien ;
- **dans la définition des cinq modèles fournis** (`MODELES_PRATIQUES_PREDEFINIS`). Toutes leurs voies d'installation
  recopient le modèle ; une pratique déjà installée d'un modèle garde son id et ses jetons.

**Pourquoi le bloc plat** : c'est celui que le formulaire relit et que sa case peut changer. Un `configuration.jetons`
rendrait le formulaire inerte (« réglés à sa création »), et l'enseignant·e ne pourrait plus activer les jetons sans
rouvrir l'assistant.

**Supposé** : un modèle adopté depuis la bibliothèque de l'enseignant·e (et non fourni), sans réglage, reçoit lui aussi
le refus. L'assistant traite toute création de la même façon.

## 3. Avant → après, cas par cas (le banc)

`tests/unit/sentinelle-jetons-par-defaut-2026-10-29.test.js`, 16 essais.

| Cas | Avant | Après |
|---|---|---|
| (a) pratique sans réglage : moteur | actif (défaut) | **inchangé** |
| (a) pratique sans réglage : formulaire | case **décochée** ; enregistrer un champ voisin écrivait `actif: false` | case **cochée**, valeurs du défaut ; l'enregistrement garde les jetons |
| (b) assistant « non », `configuration.jetons = { activer: false }` | actifs (`null` → défaut) | **inactifs** ; Annoter ne propose plus « Jeton de reprise » (Playwright) |
| (c) Spécifications « non » par la classe (`{ actif: true, …, activer: false }`, mesuré) | actifs | **inactifs** |
| Bloc plat sans « reprise ciblée » ni « l'original » | l'écran disait « oui » aux deux, le moteur « non » | l'écran dit « non », comme le moteur |
| (d) assistant, Sommative / Standards / Dénotation | aucun réglage, actifs | `jetons: { actif: false }`, inactifs ; le formulaire les montre décochés, champs ouverts ; cochés et enregistrés → actifs |
| Modèles fournis (cinq) | aucun réglage | `{ actif: false }` |
| (e) reprise à 90 sur une originale à 60, sommative | P = 84 | **P = 84**, jetons offerts ou refusés |

## 4. Une pratique « non » : ce qui change à l'écran

Une pratique créée par l'assistant avec « non » à la question des jetons (une Spécifications) offrait les jetons malgré
tout. Désormais (lu au code ; Annoter et le formulaire rendus en WebKit) :

- **Annoter** : « Jeton de reprise » disparaît du menu « Production » et du menu par fichier (`travaux-ui.js:1873`) ;
  « Appliquer comme jeton de reprise » n'est plus proposé devant un doublon (`:4336`).
- **Liste des évaluations**, « Propriétés du fichier » : la case « Cette copie est une reprise… » disparaît
  (`liste-evaluations.js:2034`). Les badges « Reprise » et « Remplacée » restent : ils lisent les copies.
- **Évaluation**, options de jetons : « Système de jetons désactivé » (`evaluation-sauvegarde.js:958`) ; plus aucun jeton
  disponible (`verifierDisponibiliteJeton`).
- **La synthèse de l'élève** (écran et PDF) : le bloc des jetons disparaît (`jetonsDeclares` rend `null`).
- **Le profil** : **inchangé**. Le bloc des jetons ne lit pas l'activation (trouvaille b).
- **La note** : inchangée. Une reprise déjà appliquée se lit dans les copies (`remplaceeParId`), pas dans la
  configuration. Mesuré au cas (e).

**Qui est concerné** : seulement les pratiques qui portent un « non » explicite (une Spécifications de l'assistant
répondue « non », un bloc `actif: false`). Combien il y en a chez les utilisateurs : non mesurable d'ici.

## 5. Les mots

- **L'Aide** (« Utiliser les jetons ») ne dit aucun défaut d'activation (« 2 par défaut » parle du nombre, toujours
  vrai) : **rien à changer**.
- **Le message du formulaire** (`mat-jetons-regles-ailleurs`), avant → après :
  « Les jetons de cette pratique ont été réglés à sa création : ce formulaire ne peut pas les modifier, et les valeurs
  affichées ici ne sont pas celles qui s'appliquent. » → « Les jetons de cette pratique ont été réglés à sa création : ce
  formulaire ne peut pas les modifier. » La demi-phrase retirée est devenue fausse : le formulaire affiche désormais les
  valeurs qui s'appliquent. Aucun mot neuf ; mot d'enseignant·e, pas d'élève.

## 6. Les tests

- **Sentinelle** (16 essais) : A le moteur, B le formulaire, C la note, D les pratiques neuves (`describe` aux lignes
  46, 118, 150, 222).
- **Break-tests** (journal en fin de fichier, arbre restauré par sha256) :

  | Mutation | Rouges |
  |---|---|
  | J1 : l'ancien `_normaliserConfigJetons` | 11, dont (b) et (c) |
  | J2 : l'ancienne lecture du formulaire | (a) |
  | J3 : l'assistant ne pose plus le refus | (d), 2 |
  | J4 : le refus posé aussi en modification | 1 |
  | J5 : un modèle fourni sans refus | 1 |

  J1 rougit large parce que le « non » par le seul drapeau sert aussi aux cas C et D.
- **Playwright** `tests/integration/jetons-par-defaut-29-oct.spec.js` (WebKit, mode démo, 2 essais) : le formulaire
  (cochée sans réglage ; décochée et le message après un « non ») ; Annoter (« Jeton de reprise » proposé, puis plus).
  J1 → les deux rouges ; J2 → le formulaire rouge, Annoter vert. Les 21 specs voisines (lot E1, parcours des pratiques,
  #898, #1038) sont vertes.
- **Golden de l'assistant** (#319) : SOM et STD portent `jetons: { actif: false }`. Le contrat change délibérément, et le
  motif est écrit dans le golden.
- **Harnais** : le moteur des jetons est fourni par défaut aux bancs qui chargent le formulaire ou l'assistant sans lui,
  comme le pool au lot 2. Une garde empêche le registre et le moteur de se charger l'un l'autre sans fin.
- **Cliquet abaissé** : `remplirFormulairePratique` 64 → 60. `#853` suit la phrase raccourcie.
- **Vitest complet** : 848 fichiers, 10 281 verts.

## 7. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| (a) Trois transports perdent une partie du réglage. L'import sélectif retire le bloc plat ; le partage retire `config` et le bloc plat ; « Dériver une maquette » déplace le bloc plat sous `config.jetons`, ce qui rend le formulaire inerte sur la copie. Un « non » posé au formulaire redevient « oui » après import ou partage. Lu, non mesuré au banc | **Inscrit** dans la fiche #1179 |
| (b) Le bloc des jetons du profil ne lit pas l'activation : une pratique qui refuse les jetons y montre encore les jetons disponibles. Lu | **Inscrit** dans la fiche #1179 |
| `migrerConfigurationsSpecifiques` (`pratiques.js:73`) mute les pratiques sans jamais les écrire (`nbMigrees` ne bouge pas) | Sans conséquence observable (issue 3). Le commentaire dans le code n'est pas posé : ce lot ne touche pas ce fichier. À Cowork de dire s'il le faut |
| `traiterImportPratiqueFromEl` (`init-inline.js:67`) n'est référencé nulle part | Même issue, même réserve |

## 8. Ce qui n'a pas été mesuré

- Les données réelles : combien de pratiques portent un « non » explicite, et lesquelles ont reçu des jetons malgré lui.
- Le profil, la Liste des évaluations et le PDF d'une pratique « non » : lus au code, pas rendus.
- Safari sur iPad ; la suite Playwright complète.

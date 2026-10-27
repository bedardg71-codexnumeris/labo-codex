# Consigne – La chaîne d'étapes de la Carte d'alignement

> Écrite par Cowork le lundi 26 octobre 2026 à 21 h 18 (Toronto, mesuré par `date`), sur `main` = `daf259ff` (1.220.0 en ligne). Elle prolonge le chantier des chaînes d'étapes (#1149, lots 3a et 3b acceptés) : même composant (`js/chaine-etapes.js`), même patron (`etapesChaineProduction`, `rendreChaineProduction`, `suivreEtapeDeLaProduction`, `js/productions.js` l. ~2250-2290).
> **Source** : retour de Grégoire du 26 oct. à 21 h 05 (Chrome, Mac, 1.220.0, section Conception › Carte d'alignement) : « la carte d'alignement aurait besoin d'une chaîne d'étapes, comme les autres sous-onglets de conception. Ça pourrait guider les premières actions de l'utilisateur. » Symptôme vécu : il entre au BACKLOG (donne-lui un numéro).

## 0. Avant tout

- **Un seul lot à la fois** : ne commence que sur un `main` à jour, sans changement non commité d'une autre session, aucune suite en arrière-plan. Sinon, arrête et dis-le. Pas de `git stash`.
- Rituel de début de session.
- Note le retour dans `Retours des testeurs/USAGE-FORMATS.md` (26 oct., GB, une à trois lignes).
- Un commit de docs seul, fichiers nommés : ce fichier, la ligne d'USAGE-FORMATS, l'item du BACKLOG.

## 1. Ce que le lot livre, en gestes

Dans **Conception › Carte d'alignement**, entre la barre d'outils de la carte et le canevas, une chaîne de sept étapes. Chacune se coche dès que l'élément **existe** dans la carte active, et dit combien il y en a. Un clic sur une étape ouvre le guide de la carte **à la page de cette étape**. Ajouter, retirer, annuler ou rétablir un bloc met la chaîne à jour. La case « Afficher les chaînes d'étapes » la masque comme les autres.

## 2. Les étapes (validées par Grégoire, 21 h 14 à 21 h 16)

**Ce qu'est cette chaîne, dans ses mots (21 h 14)** : « il n'y a pas d'ordre comme tel à prescrire. C'est simplement que les éléments les plus importants doivent se retrouver dans la carte pour que le cours ait une colonne vertébrale. » Il monte ses cours sur un axe vertical (objectifs, ouverture, connaissances, modelage, pratiques, évaluation) et ne pose pas les objectifs en premier. **La chaîne ne prescrit donc aucun ordre de travail** : elle dit ce qui est présent. Son ordre de lecture est celui de la structure de la carte, de la compétence à l'évaluation. Aucun texte d'écran ne doit suggérer « commence par… ».

| # | Étape | Réglée quand (dans la carte active, clones exclus) | Clic : page du guide |
|---|---|---|---|
| 1 | Compétence | au moins un bloc `competence` | 2 « Commence par le pourquoi » |
| 2 | Idées maîtresses | au moins un bloc `idee-maitresse` | 3 « Ce que l'étudiant doit retenir » |
| 3 | Leçons | au moins un bloc `lecon` | 4 « Organise dans le temps » |
| 4 | Objectifs | au moins un objectif de leçon au texte non vide (`objectifsDeLecon`) | 5 « Ce que la leçon vise » |
| 5 | Connaissances | au moins un bloc de `TYPES_CONNAISSANCE` | 6 « Ce que tu enseignes concrètement » |
| 6 | Activités | au moins un bloc de `TYPES_ACTIVITE` (les cinq étapes de l'enseignement explicite y sont) | 7 « Comment l'étudiant va apprendre » |
| 7 | Évaluations (**arrivée**) | au moins un bloc `evaluation` | 8 « Vérifie que c'est acquis » |

Les **séquences** ne sont pas une étape : Grégoire, 21 h 16, « elles peuvent mobiliser des séquences, au besoin » ; le guide les dit facultatives.

## 3. Décidé par Cowork (si la mesure le contredit, dis-le plutôt que de le suivre)

1. **Présence, pas complétude.** Une étape est réglée dès qu'un élément existe. Aucun ton « attention » ni « critique » dans ce lot : les badges, le ⚠ et les pastilles jugent déjà l'alignement (validés le 27 sept., #966) ; la chaîne ne les double pas.
2. **L'info** : le compte (« 12 leçons ») quand l'étape est réglée ; « à poser » sinon, « à écrire » pour les Objectifs (comme l'objectif d'une production). Abrège comme la barre du Trimestre si 820 px l'exige ; dis lesquels.
3. **Le clic conduit, il n'écrit rien** : il ouvre le guide (ou, s'il est ouvert, le mène) à la page du tableau. Il faudra sans doute un paramètre de page à `ouvrirGuide` (l. ~2046 ; `_guidePageCourante`, `rendrePageGuide` l. ~2110). Les pages se repèrent par leur titre ou un identifiant posé sur `GUIDE_PAGES`, **jamais par un indice en dur** qui glisserait si une page s'ajoute.
4. **Une fonction pure** (`etapesChaineCarte`, ou ton nom) reçoit la liste des nœuds et rend les sept étapes ; le dessin passe par `ChaineEtapes.dessiner`, `aria-label` « Étapes de la carte ».
5. **Mise à jour** : au chargement d'une carte (`chargerCarte` l. ~6422), et après `sauvegarder()` (l. ~6390), le point de passage des écritures. Vérifie qu'annuler et rétablir y passent ; sinon, branche-les.
6. **Sans carte active** : les sept étapes « à poser », les clics ouvrent le guide. C'est le cas du premier contact, celui que vise le retour.

## 4. Où (mesuré par Cowork en lecture, à revérifier)

- `index.html` : la barre d'outils de la carte (l. ~4281-4394), le canevas `#planif-canvas` (l. ~4537) ; les conteneurs à imiter (`#chaineProduction` l. ~4700).
- `js/planification-carte.js` : `TYPES_ACTIVITE` (l. ~1406), `TYPES_CONNAISSANCE` (l. ~1373), `objectifsDeLecon` (l. ~119), `estClone` (l. ~3889, `cloneSourceId`), `GUIDE_PAGES` et `ouvrirGuide` (l. ~1887-2120), `sauvegarder`, `chargerCarte`.
- `js/chaine-etapes.js` : en lecture, sauf besoin démontré.

## 5. Pièges connus

1. **Les clones** partagent l'identité de leur source : un bloc cloné ne compte qu'une fois.
2. **La hauteur du canevas**, surtout sur iPad (1180 × 820 en paysage) : la chaîne la prend au canevas. Mesure ce qu'elle retire à 1440 et à 820 px et dis-le ; ne rétrécis pas le canevas en silence.
3. Le **panneau du guide** flotte : vérifie qu'il ne couvre pas la chaîne qui l'a ouvert.
4. Une carte d'exemple ou importée : la chaîne la lit pareil ; ses clics conduisent quand même.
5. Sécurité : `textContent` (règle 1), aucun gestionnaire en ligne (règle 2).
6. **Stock** : aucune donnée écrite, rien à migrer. Dis-le.

## 6. Preuve exigée

- **Vitest** : la fonction pure. Carte vide ; chaque type seul ; un clone non compté ; une leçon dont l'objectif est vide ; une étape de l'enseignement explicite comptée comme activité ; une carte sans compétence mais complète ailleurs (l'ordre n'est pas exigé : les étapes suivantes restent cochées).
- **Playwright (WebKit)** : la chaîne paraît sur la carte, avec et sans carte active ; elle suit l'ajout d'un bloc, puis Annuler et Rétablir ; chaque clic ouvre la bonne page du guide **sans rien écrire** (stockage comparé avant et après) ; la case décochée la masque ; 820 px. Chaque essai démontré capable d'échouer.
- **Captures** : carte vide et carte garnie (noms fictifs), 1440 et 820 px, clair et sombre.
- Portes terrain : skill `portes-terrain` (sa vraie carte est dans Chrome, sur son Mac).

## 7. Ce qui n'entre pas

Tout jugement d'alignement dans la chaîne (§ 3.1) ; les séquences ; le pont vers les productions (`metadata.productionId`) ; toute réécriture du guide ; toute écriture dans une carte.

## 8. Clôture

- L'item du BACKLOG coché dans le commit du code.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-26-chaine-carte-alignement.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.

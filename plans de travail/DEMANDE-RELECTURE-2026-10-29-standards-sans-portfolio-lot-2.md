# Demande de relecture – Des standards sans portfolio, lot 2 : les lecteurs secondaires lisent le même pool (29 octobre 2026)

> Claude Code, jeudi 29 octobre 2026, matin (Toronto). Consigne : `plans de travail/CONSIGNE-LOT-2026-10-29-standards-sans-portfolio-lot-2.md`.
> Base : `main` = `2d5a5711` (le commit de docs du § 0, sur `8ecdcb70`). Code : `aaa37857`. BACKLOG : **#1178** (lot 2 coché).
> Rien n'est poussé ; ni release ni verdict Playwright complet (consigne, § 4). Données fictives partout.

## Vue d'ensemble

Les six lecteurs du mandat passent par une seule définition du pool, `obtenirIdsPoolStdDuCorpus`
(`js/pratiques/pratique-registre.js:832`), qui identifie la terminale et appelle `obtenirArtefactsIdsPoolStd`. Hors
standards, chaque lecteur garde sa sélection d'avant. Pour la pratique de Grégoire, chaque lecteur rend ce qu'il rendait
avant, **sauf un cas que la consigne ne couvrait pas** : une diagnostique de type « Artefact » sort de l'export recherche
(§ 3). Pour la chimie, chaque lecteur nomme les productions de la note ; avant, tous rendaient vide.

Retirés : la sélection propre du panneau « Engagement », le repli « non-portfolio » du PDF, `calculerPerformanceRecente`
et `genererSectionCompletion` (ces deux-là sans appelant). Aucune donnée écrite ; tout se lit au calcul.

## 1. Chaque lecteur, avant → après

« Avant » : relevé sur l'ancien code (`8ecdcb70`) par une sonde jetable aux modules réels, sur le banc de
`sentinelle-standards-sans-portfolio` ; « après » : la section F de la même sentinelle. Pour GREG-0, 1 et 2, les
colonnes « avant » et « après » sont **identiques** pour chaque lecteur (et dans la variante « partiel », où l'élève n'a
pas remis A6 ni T1). CHIM-5 = CHIM-1 avec un test diagnostique noté 10 ; « partiel » : L3 et X2 pas encore remis.

| Lecteur (preuve) | GREG-0 à 2 | CHIM-1 et CHIM-5, avant | CHIM-1 et CHIM-5, après | CHIM-3 (hybride), après |
|---|---|---|---|---|
| Dépistage, `obtenirIdsProductionsEvaluables` (`profil-etudiant-helpers.js:476`) | A1 à A6 | vide | L1 à X2 | L1 à X2 |
| Panneau « Engagement », la liste (`_productionsNommeesMobilisation`, `profil-etudiant-sections-affichage.js:123`) ; carte Complétion | remises A1 à A6 | 0 remise | L1 à X2 remises (partiel : L1, L2, X1) | L1 à X2 |
| Panneau « Engagement », les retenues (`_selectionnerArtefactsMobilisation`, `:158`, lit `calculerDetailsNoteFinale`) | A4, A3, A6 | aucune | les cinq (« Tous ») ; partiel : L1, L2, X1 | L2, L3, X1, X2 |
| Colonne « ≥ Min. » (`compterEvaluationsPourMinimum`, `etudiants.js:761`) | 6 | 0 (tout le groupe sous le minimum) | 5 (partiel : 3) | 5 |
| Export recherche, `contexte.artefacts` (`productionsNommeesArtefacts`, `trimestres.js:2483`, lu `:2198`) | A1 à A6 | `[]` | L1 à X2 (types `laboratoire`, `examen`) ; D0 absent | L1 à X2 |
| Export recherche, `numero_artefact` des profils RLO (`trimestres.js:2507`) | A1 = 1 … A6 = 6 | `null` partout | L1 = 1 … X2 = 5 ; D0 `null` | idem |
| PDF, « Productions à venir » (`synthese-retroaction-data.js:1461`) | partiel : « Artefact 6 » | partiel : « Laboratoire 3 », « Examen 2 » | inchangé (X2 n'est pas une terminale ici) | partiel : « Laboratoire 3 » (obligatoires à part, inchangé) |

**Le PDF change pour CHIM-4** (l'Examen 2 typé « Évaluation terminale », partiel) : avant, « Laboratoire 3 », « Examen 2 »
(la terminale annoncée « à venir » par le repli) ; après, « Laboratoire 3 ». La terminale n'est plus au pool d'aucun
lecteur (dépistage, export, « ≥ Min. » : L1 à X1).

La note ne bouge pas : GREG 84,8 ; CHIM-1 et CHIM-5 77 ; CHIM-3 80,63 (épinglés dans la section F).

### L'export du banc (§ 2.2 de la consigne)

Aucune clé ne change (`artefacts`, `id_artefact`, `numero_artefact`, `type_artefact`) ; seul le contenu suit le pool.

```
GREG-0  avant  contexte.artefacts = [A1…A6 : artefact-portfolio]   numero_artefact A1…A6 = 1…6, T1 = null
        après  identique
CHIM-1  avant  contexte.artefacts = []                              numero_artefact null partout
        après  [L1, L2, L3 : laboratoire ; X1, X2 : examen]        L1…X2 = 1…5
CHIM-5  après  idem CHIM-1 ; D0 (diagnostique) absent de la liste, numero_artefact null
```

## 2. Le panneau « Engagement » : la mesure de début de lot (§ 2.3)

**Il peut lire les retenues de la note** : `calculerDetailsNoteFinale(da).portfolio.artefactsRetenus` porte les
`productionId` retenus, comme pour le panneau des habiletés (#714). Sa sélection propre est donc retirée. Elle divergeait
déjà de la note sur trois points : « N plus récents » triés par **date** quand la note trie par numéro (L9) ; les copies
« remises » au sens du panneau (statut) au lieu du prédicat de la note (#706) ; l'hybride recopié. Les mots du panneau
(méthode, N) restent lus dans la configuration, et « Productions indépendantes » (`portfolio.actif === false`) ne retient
rien, comme avant. La liste du panneau (cartes Complétion et Performance), elle, passe par le pool.

**Supposé, non mesuré** : sur les données réelles de Grégoire, les retenues du panneau changent seulement là où le panneau
contredisait déjà la note (une méthode « récents » avec des dates d'évaluation dans un autre ordre que les numéros, une
copie non recevable). Le banc ne contient aucun de ces cas.

## 3. Écart avec la consigne : une diagnostique de type « Artefact » sort de l'export recherche

La consigne dit « GREG : identique ». Le banc le confirme pour GREG-0 à 2. Mais l'export ne filtrait pas les productions
diagnostiques ; la note (#883), le dépistage (#790), le panneau et « ≥ Min. » (#1055) les écartaient déjà. Pour que
l'export parle « des mêmes productions que la note », le filtre est posé en premier, comme ailleurs
(`trimestres.js:2488`). Mesuré sur un cas ajouté (GREG plus une diagnostique « Artefact », A0) : avant,
`contexte.artefacts` = A0 à A6 et `numero_artefact` A0 = 1, A1 = 2 … A6 = 7 ; après, A1 à A6, A1 = 1 … A6 = 6, A0 `null`.
Épinglé : essai « ÉCART NOMMÉ » (`sentinelle-standards-sans-portfolio.test.js:466`).

**Ce qui en dépend** : si la pratique réelle de Grégoire a un « Artefact » diagnostique (le « Portrait de lecteur » de
#883 en était un en A2026), un export recherche fait après ce lot numérote ses artefacts à partir de 1 sans lui ; un export
fait avant les numérotait à partir de 2. Format qui voyage (règle 2 de `PROTOCOLE.md`) : c'est le point à relire. Si
l'exception doit tenir, le retrait est d'une ligne (`trimestres.js:2488`) et la sentinelle le dira (B6 ci-dessous).

## 4. Les tests

- **Sentinelle** `tests/unit/sentinelle-standards-sans-portfolio.test.js`, section F (`:422`, 6 essais) : GREG-0 à 2
  (complet et partiel) épinglés sur les valeurs de l'ancien code ; CHIM-1, 3, 5 : le pool, ni plus ni moins, jamais D0 ;
  CHIM-4 : la terminale ni au pool ni « à venir » ; l'écart du § 3 ; les deux fonctions retirées le restent.
- **Break-tests** (journal en fin de fichier, `:508`) : copie de référence, mutation, section F seule, restauration,
  sha256 identique. B1 dépistage, B2 liste du panneau, B3 retenues du panneau (sa sélection « N meilleurs »), B4
  « ≥ Min. », B5 export, B6 export sans le filtre des diagnostiques, B7 PDF avec son repli, B8 le pool du registre qui
  garde la terminale : **chacun rougit sur CHIM** ; sous B1 à B7, **GREG reste vert** (chaque lecteur rendait déjà le
  pool pour la pratique de Grégoire).
- **Playwright** `tests/integration/standards-sans-portfolio-lot-2.spec.js` (WebKit, 2 essais) : le profil, section
  Engagement ; CHIM-1 partiel : 3 remises (L1, L2, X1), 3 retenues ; GREG : A1 à A5 remises, A3, A4, A5 retenues. B2 →
  CHIM rouge (0 badge au lieu de 3), GREG vert. Les 24 specs voisines (lot 1, Complétion #871 et #922, rangée #1151,
  export #1013, N4) : vertes.
- **Vitest complet** depuis `tests/` : 847 fichiers, 10 265 verts.
- **Harnais** : `obtenirIdsPoolStdDuCorpus` est fourni par défaut aux bancs qui chargent ces modules sans le registre
  (`tests/unit/_helpers/charger-script.js:279`, `predicats-copie.js`), le vrai registre, comme `ProductionDiagnostique`.
  Sans cela, 41 essais de 13 fichiers tombaient en `TypeError`.
- **Cliquets abaissés** : complexité de `construireNoteProvisoire` 38 → 37 ; interpolations du profil (#467) 106 → 104
  (`genererSectionCompletion` partie) ; #1055 suit le filtre dans `compterEvaluationsPourMinimum`.
- `index.html` : les `?v=` des sept fichiers, sur la date du build (sentinelle anti-cache verte).

## 5. Les mots, notés pour le lot 5 (aucun n'a bougé)

Ce que la chimie lit maintenant, dit « artefact » d'une production qui n'en est pas un. Tous passent par
`obtenirTermeProduction` (« artefact » en standards), dont le lot 5 change déjà la règle :

1. Carte Complétion du panneau « Engagement » : « N artefacts remis ».
2. Carte Performance : le titre « N meilleurs artefacts » ou « Tous les artefacts (N) » ; la ligne « Performance du
   portfolio actuel (…) » (le mot « portfolio » est écrit en dur, `profil-etudiant-sections-affichage.js:181-187`) ; la
   méthodologie « Moyenne des N meilleurs artefacts » (aussi sous « Tous »).
3. Les jetons : « Artefact inconnu » quand une copie n'a pas de nom de production (`:512`, `:521`).
4. Liste des étudiants : les termes de `etudiants.js:367-370`.
5. Export recherche : les clés `artefacts`, `id_artefact`, `numero_artefact`, `type_artefact` (clés d'un format qui
   voyage : hors du lot 5 sauf décision contraire). Le PDF dit déjà « Productions à venir ».

## 6. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| Le panneau « Développement des habiletés » omet sa partie note sans conteneur « Portfolio » ou sans « Artefact » (`genererSectionPerformance`) : la chimie n'y voit ni règle ni retenues. Ce n'est pas une sélection (un interrupteur sur le type) | **Inscrit** dans la fiche #1178, hors lot |
| La carte Performance du panneau « Engagement » écrit « Indice P = » une moyenne simple des retenues ; la note hybride les pondère (CHIM-3 : 79 % à côté de 81). Préexistant, pour toute pratique hybride | **Inscrit** dans la fiche #1178 |
| « ≥ Min. » sous une sommative : aucun « Artefact », donc tout le groupe sous le minimum (lu, pas mesuré) | **Non inscrit** : aucun symptôme vécu (règle du 24 août). À Cowork de juger |
| `calculerPerformanceParObjectif` (`portfolio.js`) : exposé, aucun appelant ; il sélectionne par objectif, pas par pool | Hors du pool : aucun geste |
| La fiche #1176 citait `calculerPerformanceRecente` parmi ses sites | Fiche mise à jour (« cinq sites ») |

## 7. Ce qui n'a pas été mesuré

- Les données réelles de Grégoire (une diagnostique « Artefact », des méthodes « récents ») : § 2 et § 3.
- Le PDF rendu, la colonne « ≥ Min. » à l'écran et l'export téléchargé dans Safari ou sur l'iPad : lus au banc, pas
  rendus (seul le panneau « Engagement » est rendu, WebKit).
- La suite Playwright complète (consigne : pas de verdict sans le signal de Grégoire).

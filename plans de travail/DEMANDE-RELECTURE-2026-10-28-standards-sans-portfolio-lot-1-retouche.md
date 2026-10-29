# Demande de relecture – Des standards sans portfolio, lot 1 : la retouche (28 octobre 2026)

> Claude Code, mercredi 28 octobre 2026, soir (Toronto). Consigne : `plans de travail/CONSIGNE-LOT-2026-10-28-standards-sans-portfolio-lot-1-retouche.md`.
> Verdict relu : `VERDICT-RELECTURE-2026-10-28-standards-sans-portfolio-lot-1.md` (R1, R2, R3). Décisions : `DECISIONS-2026-10-28-construction-de-la-note.md`, mot neuf 3.
> Base : `main` = `73a25a16` (le commit de docs du § 0). Code : **`c1dadef1`**. BACKLOG : **#1178**.
> Rien n'est poussé ; ni release ni verdict Playwright complet (consigne, § 3). Données fictives partout.

## Vue d'ensemble

Les trois points de la retouche sont faits, dans un seul commit de code. Une catégorie restée hors hybride ne restreint
plus le pool (R1). Une note qui manque pour une cause propre à l'étudiant·e garde la carte de la note, sans l'alerte et
sans le bouton des réglages (R2). Le doublon se dit « en double · comptée une seule fois » aux deux récits (R3). Aucun
mot neuf hors du mot neuf 3. Deux suppositions sont nommées au § 2 : elles se corrigent en une ligne chacune.

## 1. R1 – une catégorie ne compte qu'en hybride

`obtenirArtefactsIdsPoolStd` (`js/pratiques/pratique-registre.js`) : sans « Artefact », le pool est fait de toutes les
productions hors conteneur et terminale. La restriction aux productions qui portent une `categorie` est retirée. Le
commentaire de la fonction et l'en-tête du bloc #394 disent maintenant « une catégorie ne compte qu'en hybride ».

| Cas | Lot 1 (`03cdf8a7`) | Retouche (`c1dadef1`) |
|---|---|---|
| Catégorie restée sur L1, productions pondérées | 70 | **77** |
| Catégorie restée sur L1, non pondérées | 70 | **77** |
| CHIM-3 (hybride, N = 2) | 80,63 | 80,63 (inchangé) |
| GREG-0 à 2 | 84,8 | 84,8 (inchangé) |
| Terminale marquée « obligatoire » (#339) | 78 | 78 (inchangé) |

## 2. R2 – ce que montre la carte pour CHIM-6 et GREG-3

Quand `causeNoteAbsente` est posée, le profil prend la branche de la carte, comme avant le lot 1. Mesuré en WebKit
(Playwright), dans l'application réelle :

| | CHIM-6 (seule la terminale) | GREG-3 (aucun artefact évalué) |
|---|---|---|
| Titre | « Note provisoire de session » + le nom de la pratique | idem |
| Composantes | celles de la carte d'avant, non touchées par la retouche (pas vérifiées une à une) | idem |
| À la place du nombre | « Seule l'évaluation terminale a une note. En standards, la note du cours s'appuie aussi sur les productions retenues : elle ne se calcule pas sur la terminale seule. » | « Aucun artefact du portfolio n'est encore évalué. » |
| Alerte « Note finale non calculable » | absente | absente |
| « Réglages de la pratique » | absent | absent |

La phrase prend la classe que la carte emploie déjà pour « Non évaluée » (`note-finale-non-evalue`) : aucun style neuf.
Une erreur de configuration (la terminale sans pondération) garde l'alerte, le bouton et son infobulle (essai Playwright).

**Deux suppositions, à confirmer :**
- **Le bouton de la carte.** La carte d'avant avait son propre « Réglages de la pratique » (infobulle « Modifier le
  statut (provisoire / finale) et les pondérations… »). La consigne demande « aucun bouton » pour CHIM-6 et GREG-3 : je
  l'ai donc retiré **de la carte aussi**, seulement quand la cause est posée. Pour une note calculée, il ne change pas.
- **« Basée uniquement sur le portfolio (évaluation terminale non complétée) ».** La carte d'avant l'écrivait sous un
  total vide quand la terminale n'est pas évaluée (GREG-3). À côté de « Aucun artefact du portfolio n'est encore
  évalué. », la phrase décrit une note qui n'existe pas : je ne l'écris plus quand la cause est posée. C'est le seul
  autre mot que la carte perd ; il ne change nulle part ailleurs.

Le total et le bouton sortent en deux fonctions (`_totalCarteNote`, `_boutonReglagesCarteNote`) ; la complexité de
`genererSectionProductions` baisse de 66 à 64 (cliquet abaissé).

## 3. R3 – les endroits du libellé

« en double · comptée une seule fois », au caractère près :

| Où | Avant | Lecteur |
|---|---|---|
| Récit Standards (`profil-etudiant-actions.js:658`) | « doublon note-égale » | carte du profil (lignes du récit), Comparateur |
| Récit sommatif (`pratique-sommative.js:261`) | « doublon note-égale · exclu de la moyenne » | carte sommative du profil (`profil-etudiant-sections-affichage.js`, lignes « autres »), Comparateur |

Cherché ailleurs : le **Comparateur** affiche le `detail` du récit (`comparateur-pratiques.js:982`) ; il lit donc le
mot neuf sans changement de son code. Le **PDF de rétroaction** (`synthese-retroaction-data.js`) ne garde que les
lignes « compte » du récit : le libellé du doublon n'y apparaît pas. Aucun autre texte affiché ne contient
« note-égale » (`grep` dans `js/` : seulement des commentaires).

## 4. Les tests

- **Sentinelle** `sentinelle-standards-sans-portfolio` : 24 essais (21 → 24). Catégorie restée → 77 ; CHIM-3 → 80,63 ;
  le doublon aux deux récits (l'essai sommatif est neuf) ; R2 : la carte de CHIM-6 et GREG-3, et l'erreur de
  configuration qui garde l'alerte. L'essai « source unique » lit maintenant la phrase dans la carte, pas dans l'alerte.
- **Break-tests** (copie de référence, mutation, lancement, restauration ; empreinte sha256 identique) : six mutations,
  six rouges : la restriction remise → 1 ; l'ancien libellé Standards → 1 ; l'ancien libellé sommatif → 1 ; toute
  `erreur` rend l'alerte → 2 ; le bouton ignore la cause → 1 ; le total au lieu de la phrase → 2. Journal en fin de
  fichier.
- **Playwright ciblé, WebKit** (`standards-sans-portfolio-lot-1.spec.js`) : 3 verts (CHIM-6, GREG-3, erreur de
  configuration). Aucun `waitForTimeout`. Break-test : l'alerte rendue pour toute `erreur` → CHIM-6 et GREG-3 rouges,
  l'erreur de configuration verte.
- **Vitest depuis `tests/`** : 845 fichiers, 10 207 verts.

## 5. Ce qui n'est pas dans ce lot

- L'arbre porte le texte de l'accueil (`js/accueil.js`, `styles.css`, sentinelle 846) et deux icônes, d'avant la
  session : non touchés, non commités.
- Stock : rien n'est réécrit, tout se lit au calcul. Les captures déjà prises gardent leur P.
- Pas de release, de verdict ni de push sans le signal de Grégoire.

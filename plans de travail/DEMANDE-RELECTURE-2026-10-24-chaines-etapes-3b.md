# Demande de relecture – Les chaînes d'étapes, lot 3b : échelles, cartouches, productions, pratiques (#1149)

> Claude Code, samedi 24 octobre 2026, soir. Consigne : `CONSIGNE-LOT-2026-10-24-chaines-etapes-3b.md` ; étapes : `CHAINES-ETAPES-3b-etapes-validees.md`.
> Parti de `914a0d31` (3a commité, `main` à jour, aucune suite en cours) ; commit de docs `c7fcd4da`, puis le commit du lot.
> **Ni release, ni verdict Playwright complet, ni push** : au signal de Grégoire. #1149 cochée au BACKLOG.

## 1. Ce que le lot livre

| Outil | Chaîne | Où | Suit la saisie |
|---|---|---|---|
| Échelles | Niveaux → Pourcentages → Repères → Production | en tête de `#conteneurEditionEchelle` | chaque modification passe par `afficherNiveauxEchelle` / `afficherNiveauxNouvelleEchelle` (le tampon en création) |
| Cartouches | Grille → Échelle → Commentaires → Production | en tête de `#infoCartouche` | chaque case écrite, chaque menu changé |
| Productions | Objectif → Tâche → Grille → Échelle → Cartouche → Échéance | en tête de `#formulaireProduction` | à la frappe (`input`) et à chaque changement ; lit le formulaire, en création comme en modification |
| Pratiques | Méthode → Échelle (selon la méthode) → Pondération (sommative) → Groupe-cours | entre la rangée des actions (Dupliquer, Supprimer) et la fiche | après chaque enregistrement de la fiche, après l'assistant et « Appliquer au cours actif » (le menu se redessine) |

Les quatre partent avec leur fiche ; la case « Afficher les chaînes d'étapes » les masque (banc Playwright). Lecteur d'écran : « Étapes de l'échelle », « … de la cartouche », « … de la production », « … de la pratique ». Rien n'est écrit par une chaîne ; **stock : rien à migrer**.

## 2. Les décisions de Cowork, et ce que la mesure en a fait

1. **Une fonction pure par chaîne** : `etapesChaineEchelle` (echelles.js), `etapesChaineCartouche` (cartouches.js), `etapesChaineProduction` (productions.js), `etapesChainePratique` (pratiques-gestion.js). Le dessin passe par `ChaineEtapes.dessiner`.
2. **Le compte des productions** : une seule copie, dans `js/productions-liste.js` (`productionsDuMenu`, `productionsVisiblesPourLaChaine`), à côté du menu des productions qui l'emploie maintenant lui aussi ; la copie de `grilles.js` est partie. Grilles, échelles et cartouches la lisent.
3. **Les Pourcentages** (`couvertureDesPourcentages`) : chaque entier de 0 à 100, le premier fautif nommé. **Deux écarts avec `niveauDuPourcentage`, que la mesure impose — à valider** :
   - une borne **vide** est absente. `niveauDuPourcentage` lit `Number('')`, qui vaut **0** : un niveau neuf aux bornes pas encore tapées se lirait « 0 à 0 » et donnerait « chevauchement à 0 % ». La règle de `valeurNumeriqueDuNiveau` (#525) est reprise. Une échelle enregistrée ne peut pas avoir de borne vide (refus #574) ; seul le tampon de création en a ;
   - le **niveau « 0 »** est écarté, comme le font les chemins algorithmique et analytique (`sansNiveauZero`). Sans cela, l'« IDME avec niveau 0 » du pack (niveau 0 à « 0-0 », I à « 0-64,99 ») donnerait « chevauchement à 0 % ». La note globale (`evaluation-calcul.js` l. ~1700) ne l'écarte pas : à 0 %, elle prend le premier niveau de la liste.
   - Aucune borne posée : « à poser », sans couleur (pas « trou à 0 % »).
4. **Les tons** : comme demandé. « En attention » : le trou et le chevauchement ; « critique » : la pondération sommative au-dessus de 100 %. Tout le reste, « à régler » sans couleur.
5. **Où mènent les clics** (aucun n'écrit ; un essai compare tout le stockage avant et après chaque clic, sur chaque étape) :

| Chaîne | Étape | Le clic |
|---|---|---|
| Échelle | Niveaux | descend à la table des niveaux |
| | Pourcentages | descend à la première borne « min » |
| | Repères | descend au bloc « Repères de maîtrise » (à la table tant qu'aucun niveau n'a de bornes : le bloc n'existe pas encore) |
| | Production | ouvre Productions étudiantes (`afficherSousSection`) |
| Cartouche | Grille | grille choisie : ouvre Grilles de critères, où ses critères se règlent ; sinon, descend au menu « Grille » de la fiche |
| | Échelle | descend au menu « Échelle » de la fiche |
| | Commentaires | descend à la première case vide de la matrice (la matrice si toutes sont remplies ; le menu de l'échelle si la matrice n'est pas encore là) |
| | Production | ouvre Productions étudiantes |
| Production | Objectif, Tâche, Grille, Échelle, Cartouche | descend au champ de la fiche |
| | Échéance | descend à la section des échéances |
| Pratique | Méthode | rouvre l'assistant en édition (`ouvrirWizardV2(true, id)`, comme `editerPratique`) |
| | Échelle | descend au menu « Échelle à utiliser » |
| | Pondération | ouvre Productions étudiantes, où les pondérations se règlent |
| | Groupe-cours | descend au bouton « Appliquer au cours actif », sans l'appuyer |

6. **Lecteur d'écran** : posé (§ 1).
7. **Formateurs** : pourcentages par `formaterPourcentage` (#1137, espace insécable) ; l'échéance par `formaterDateCourte` (main.js, « 14 nov. »), celle que les productions emploient déjà pour leurs dates.

## 3. Ce que j'ai supposé ou décidé seul (à corriger en dix secondes si c'est faux)

- **Le portfolio conteneur n'a pas de chaîne.** L'app lui interdit la grille et la date (« Ce n'est pas le portfolio comme tel qui est évalué, mais les artefacts qui le composent ») : sa chaîne resterait « à régler » pour toujours. Les artefacts ont la leur. Le tableau validé ne parlait pas de ce cas.
- **La méthode d'une pratique est lue comme le moteur la lit** (`methodeDeCalculDeLaPratique`, extraite de `construireConfigComplete` dans `pratique-registre.js`, une copie) : le `calcul_note` porté, sinon celui de la famille (#762). Mesuré : le « Modèle sommatif » adopté par Grégoire le 2 sept. n'a **pas** de `calcul_note` ; lu au pied de la lettre (`calcul_note.methode`), il serait resté « à choisir » pour toujours. Quand ni l'un ni l'autre ne dit la méthode, l'étape est « à choisir » (le moteur, lui, retombe sur `conversion_niveaux`).
- **La famille sommative se reconnaît à sa méthode** (`moyenne_ponderee`), comme demandé (piège 4). Le libellé affiché sous « Méthode » est celui de l'option du menu « Type de pratique » de la fiche pour la famille de cette méthode (« Sommative », « PAN-Standards », « PAN-Spécifications », « PAN-Dénotation »).
- **Pondération** : la somme de `mettreAJourPonderationTotale`, extraite telle quelle en `totalPonderationProductions` (productions.js), artefacts-portfolio exclus, sur la liste brute des productions du trimestre (comme elle). Le nom `mettreAJourPonderationTotale` (noms stables) ne bouge pas.
- **La liste des méthodes qui consomment une échelle** sort de `valider()` (`pratique-configurable.js`) en constante de module `METHODES_AVEC_ECHELLE`, exposée ; la validation et la chaîne la lisent.
- **Cartouche en création** : tant que grille ET échelle ne sont pas choisies, la chaîne lit les deux menus de la fiche (sans commentaires), et non `cartoucheActuel` — qui reste la cartouche ouverte avant « + Nouvelle cartouche » (voir § 5).
- **Cartouche, Grille** : compte les critères **nommés** de la grille, comme « Critères » au 3a.

## 4. Hors du § 3 de la consigne, ce que le lot a dû toucher

1. **Le menu « Échelle à utiliser » d'une pratique n'enregistrait rien** (`onMatEchelleIdChange`, `js/init-inline.js`). Depuis le lot E1 (« tout s'enregistre au changement de champ »), c'était le seul champ de la fiche dans ce cas : l'échelle choisie se perdait si aucun autre champ ne changeait, et la chaîne ne pouvait pas suivre « une échelle choisie » (preuve exigée). **Issue : corriger maintenant** (il casse le geste livré) — il appelle maintenant `sauvegarderConfigPratiqueMat`, comme ses voisins (refus d'une échelle d'exemple compris). **Source tarie ; stock** : rien à réparer, une pratique enregistrée garde l'échelle qu'elle a. ⚠ C'est un changement de comportement sur des données réelles (le choix s'écrit maintenant) : à confirmer par Cowork.
2. **Les métriques mortes de la cartouche** (`mettreAJourMetriques`, `calculerPourcentageComplete`) : elles écrivaient dans `#nbCriteres`, `#nbNiveaux`, `#nbCommentaires`, `#pctComplete`, **absents d'`index.html`** ; et leur compte fusionnait les niveaux de **toutes** les échelles, quand la matrice ne montre que ceux de la sienne (#578). La consigne demandait « le même compte que le pourcentage de complétion de l'écran » : **la mesure le contredit**, il n'y a plus de pourcentage à l'écran et ce compte était faux. La chaîne les remplace (zéro dette) ; les colonnes de la matrice passent par une seule lecture, `niveauxDeLaMatrice`, que la matrice et l'étape « Commentaires » emploient.
3. **Sentinelles ajustées, chacune avec son motif écrit dans le fichier** :
   - `sentinelle-555-d` : `seuilMaitrise` dans echelles.js 5 → 7 (l'étape « Repères » lit le code posé : le sens permis) ;
   - `sentinelle-834` : appels au point unique du groupe-cours 18 → 19 (l'échéance de la chaîne des productions) ;
   - `sentinelle-ablation-396` : elle cherchait `methodesAvecEchelle = ['conversion_niveaux']` ; elle cherche la constante ;
   - `sentinelle-593` (n° 3) : la bascule de cartouche se produisait pendant l'`await` du calcul de complétion, parti. **Déplacée sur l'attente qui reste, l'écriture** ; break-test refait : lire `cartoucheActuel` dans l'écriture au lieu de la cible la fait rougir ;
   - cliquet de complexité : `construireConfigComplete` 51 → 49 (reporté) ; trois fonctions neuves passaient 15, découpées (`criteresNommesDeLaGrille`, `casesDeLaMatrice`, `etapeEchelleDeLaPratique`, `etapePonderationSommative`, `pratiquePourLaChaine`, `libelleDeLaMethode`) ; le compte au-dessus de 15 reste 447 ;
   - `sentinelle-467` : un sélecteur CSS bâti par concaténation comptait comme interpolation nue ; réécrit sans concaténation (le compte ne monte pas).
4. Jetons `?v=` bumpés : productions-liste, grilles, echelles, cartouches, productions, pratiques-gestion, pratique-registre, pratique-configurable, init-inline.

## 5. Trouvailles

- ⚠⚠ **Mesuré, antérieur au lot, À TRANCHER : « + Nouvelle cartouche » après une cartouche ouverte RENOMME la cartouche ouverte au lieu d'en créer une.** `creerNouvelleCartouche` ne remet pas `cartoucheActuel` à zéro, et `initialiserNouveauCartoucheAvecEchelle` reprend `cartoucheActuel?.id` et ses commentaires. Sonde Playwright (WebKit, contexte neuf, noms fictifs) : ouvrir « Cartouche A » (un commentaire), « + Nouvelle cartouche » (une grille et une échelle : choisies d'office), nommer « Cartouche B », « Créer la cartouche » → **en base, une seule cartouche, `CART_A`, nommée « Cartouche B », avec le commentaire de A**. Juste après « + Nouvelle », la matrice montre déjà le texte de A. Aucune perte de commentaire, mais une cartouche disparaît sous un autre nom, et les productions qui la portaient pointent sur la « nouvelle ». **Issue proposée : un lot à part, au signal** (remettre `cartoucheActuel` à zéro dans `creerNouvelleCartouche`, avec sa sentinelle) ; **stock** : une cartouche déjà renommée ainsi ne se distingue pas d'un renommage voulu — rien à réparer d'office. Non corrigé ici : hors du parcours livré, et il touche l'écriture des cartouches. Pas inscrit au BACKLOG (aucun symptôme vécu) : à Cowork de décider.
- **Commenter et oublier** — Changer le « Type de pratique » dans la fiche (sommative → standards) ne change pas `calcul_note.methode` (seule la dénotation le pose) : la chaîne suit la méthode, donc ce que le moteur calculera ; l'en-tête suit le type. Aucun symptôme vécu.

## 6. Preuves

- **Vitest** `tests/unit/chaines-etapes-1149-lot-3b.test.js` : 29 essais (E 9, C 6, P 4, R 6, U 4), tous les cas du § 5 de la consigne. **Break-tests** (11, tous rougissent) : niveau 0 compté, borne vide = 0, chevauchement ignoré, un repère suffit, colonnes = copie de la cartouche, matrice partielle réglée, portfolio avec chaîne, assignation ignorée, 70 % critique, échelle toujours présente, méthode par défaut.
- **Playwright WebKit** `tests/integration/chaines-etapes-1149-lot-3b.spec.js` : 9 essais (+ captures sur demande) — chaque outil : paraît et part, suit une saisie (un niveau ajouté, un commentaire écrit, un objectif tapé, une échelle choisie), chaque clic conduit sans rien écrire ; création d'échelle (rien n'est écrit) ; création de cartouche après une cartouche ouverte ; l'étape Échelle d'une pratique part avec sa méthode (nœuds rebâtis) ; case décochée : les quatre masquées ; exemples en lecture seule (échelle, production) ; productions à 820 px (six étapes, pas de débordement, 44 px). **Break-tests** : un clic « Groupe-cours » qui appuierait « Appliquer » rougit (le stockage change) ; la frappe non suivie rougit ; sans le correctif du § 4.1, l'essai des pratiques rougit.
- Suite Vitest complète : 9 656 / 9 656. Specs Playwright WebKit touchant ces quatre écrans et les chaînes (34 fichiers, 203 essais) : 200 verts, 2 sautés, 1 instable (`lot3-analytique-niveau` : délai dépassé au `page.goto`, vert au second essai et vert rejoué seul).
- **Captures** : `captures-2026-10-24-chaines-etapes-3b/` — par outil, une fiche réglée et une à régler, 1440 et 820 px, clair et sombre.

## 7. Portes terrain

**Aucune porte due** (règles 1 et 2 du skill) : les chaînes ne font qu'afficher, WebKit a répondu à tout ce qui s'éprouve en machine ; le seul geste qui écrit (§ 4.1) est réversible. **Ce que je n'ai pas pu vérifier** : Safari sur un vrai iPad (le banc WebKit à 820 px en tient lieu) ; les quatre chaînes sur le corpus réel de Grégoire (ses échelles « IDME et niv 0 », ses cartouches) ; le verdict Playwright complet du dépôt.

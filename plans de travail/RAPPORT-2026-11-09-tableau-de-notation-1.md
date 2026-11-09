# Rapport : tableau de notation, lot 1 (9 nov. 2026)

*Session Claude Code dans le cloud, seule. Branche `lot/tableau-de-notation-1`, partie de `origin/main` (`158ff5dc`, 1.238.0) ; ce rapport remplace le rapport d'arrêt de la session précédente (`af12b9d1`). Rien n'est fusionné, rien n'est publié, la version ne bouge pas.*

## En tête

### Ce qui est fait, en gestes

- Dans **Évaluation › Liste**, deux boutons en haut de la carte : « Liste » et « Tableau de notation ». Le second montre les mêmes évaluations en tableau : élèves en lignes, productions en colonnes, la note en bout de ligne.
- **En standards**, toucher une case fait le tour des niveaux de l'échelle de ta pratique (PS, I, D, M, E, puis vide). Au clavier : la lettre du niveau, Retour arrière pour vider, les flèches pour se déplacer. Le niveau est enregistré tout de suite, sans grille ; il compte dans la note avec sa valeur ponctuelle (M vaut 75 avec l'échelle de départ).
- **En spécifications**, la case passe par ✓ (acceptable), ✗ (non acceptable), puis vide ; au clavier, A ou N. Aucun pourcentage, aucun seuil. Le compte par type de travail et le forfait atteint se lisent au bout de la ligne.
- **La note** du tableau est celle de l'export CSV, calculée par les réglages de ta pratique. Une case pleine compte dans la note ; une case en contour est évaluée mais pas retenue (en standards, « les 3 plus récentes » écartent la quatrième) ; une case en pointillé est à saisir.
- **Une copie évaluée avec une grille** s'affiche dans le tableau avec un petit point au coin. Elle ne s'y modifie pas : la toucher ouvre l'évaluation.
- **Le reste de l'application** reconnaît ces résultats. La Liste les dit « Évalué », avec leur niveau ou « Acceptable / Non acceptable », et « Consulter » ramène au tableau. Le formulaire Évaluer ne les charge pas : il repart vide, verrouillé, et dit « Cette copie a été notée au tableau de notation (Évaluation › Liste). Change son résultat là. »
- Le bouton « Exporter en CSV » du tableau est l'export des résultats finaux déjà existant.

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

1. **La consigne n'était pas dans ton message** : le collage contenait le plan deux fois (texte brut, puis markdown). J'ai posé le plan tel quel (`PLAN-2026-11-09-tableau-de-notation.md`), mais pas la consigne, que je n'ai pas. J'ai travaillé sur le lot 1 tel que le plan le définit (« l'évaluation sans grille et le tableau, sur un groupe-cours existant »). *Recommandation : pousse la consigne sur `main` ; ce rapport dit, à la section 2, où mon travail pourrait s'en écarter.*
2. **Les mots de l'écran**, tous proposés, réunis au § 3 de ce rapport (et dans `MOTS`, en tête de `js/tableau-notation.js`). *Recommandation : relis surtout la phrase d'avertissement (« Un résultat saisi ici n'a pas de critères… ») et le nom des deux boutons.*
3. **Vider une case retire le résultat qu'elle portait**, sans corbeille. *Recommandation : garder ainsi ; c'est ton propre geste, sur un résultat saisi au tableau, jamais sur une évaluation faite avec une grille.*
4. **Les élèves inactifs, en décrochage ou en abandon ne sont pas dans le tableau.** *Recommandation : garder ainsi ; ils sont déjà exclus des moyennes ; à revoir si tu veux y reporter un dernier résultat.*
5. **Les pastilles de l'ébauche qui changent la règle** (« les plus récentes / les meilleures », « 3 / 5 ») ne sont pas faites. Le tableau dit la règle, il ne la change pas : la modifier là, c'est réécrire la pratique, qui peut servir à d'autres groupes. *Recommandation : lot 2, avec « Ta structure ».*
6. **Remplacer un résultat sans grille par une évaluation avec grille** : aujourd'hui, il faut vider la case, puis évaluer. *Recommandation : lot 2, un geste explicite dans Évaluer (« Évaluer avec une grille »), qui remplace le résultat.*
7. **En spécifications, pas de seuil dans cette voie**, comme le plan le proposait : ✓ compte, ✗ ne compte pas. *Recommandation : confirmer.*
8. **Sommative et dénotation** : le tableau affiche un message, sans tableau (§ 3, « autreFamille »). *Recommandation : confirmer le message ; la place de la dénotation reste un point ouvert du plan.*
9. **Le PDF de synthèse d'un jugement « acceptable / non acceptable »** n'affiche aucun résultat. Il ne plante pas, mais rien n'y dit « Acceptable ». Ce sont des mots que tes élèves liront. *Recommandation : dans le bandeau du niveau, écrire « Acceptable » ou « Non acceptable » à la place du niveau, au lot 2 ; à toi de valider les mots.*
10. **Le bouton « Verrouiller »** reste visible sur le formulaire Évaluer vidé pour un résultat sans grille. Le toucher ne change rien en base, mais répond « Impossible de modifier une évaluation verrouillée ». *Recommandation : le masquer dans ce cas, au lot 2 (mineur).*

### Ce que je n'ai pas pu vérifier

- **WebKit, le vrai Safari, l'iPad.** La spec et les captures sont faites sous Chromium : à reprendre sur le Mac sous WebKit. Sur iPad, à regarder : le toucher des cases (64 × 44), le défilement horizontal avec la colonne des noms et celle de la note fixées, `color-mix` dans les cases pleines, le focus visible au clavier externe.
- **Tes données réelles** : rien ne s'y écrit sans ton geste, et il n'y a pas de stock à réparer, puisque les résultats sans grille n'existaient pas avant ce lot. À mesurer sur le Mac : le temps d'un rendu sur ton plus gros groupe (sous Chromium, ici : 35 élèves × 10 productions, 263 copies, rendu en 51 à 105 ms).
- **Le PDF de synthèse d'un résultat sans grille** : il se construit sans planter (lu par l'agent de mesure), mais je ne l'ai pas rendu. En spécifications, il n'a pas de niveau à montrer. Le plan dit la synthèse facultative dans cette voie.
- **Le dépistage par critère** : trois fenêtres « N dernières » écartent maintenant les résultats sans grille (sinon, la plus récente sans critères faisait lire « Maîtrise acquise »). C'est corrigé dans le code, mais aucun banc ne l'éprouve (voir § 4).
- **Le lecteur d'écran** : la note changée s'annonce par une zone `aria-live` recréée à chaque rendu, à entendre avec VoiceOver. Sur Safari Mac, Tab n'atteint les boutons que si l'option du système est active : le tableau garde un seul arrêt de Tab, et les flèches font le reste.

## Détail

### 1. Ce qu'a été la session

- 13 h 13 à 13 h 43 : arrêt propre de la première session, faute de consigne (`af12b9d1`).
- Reprise : le plan posé tel quel (`0bfcdad3`), puis les deux ébauches reçues en cours de session, posées sous les noms du plan (`60464d38`). `origin/main` n'a pas bougé (`158ff5dc`) : la fusion demandée n'avait rien à apporter. La consigne parle de `main` à 1.239.0 : sur GitHub, c'est encore 1.238.0 ; la fusion se fera sur le Mac.
- Étape 1 (`c586989e`) : le résultat sans grille et ses lecteurs. Étape 2 (`afe94c08`) : le tableau, ses bancs, ses captures.

### 2. Les décisions prises seul (techniques), et ce que j'ai supposé

**Le modèle d'un résultat sans grille.** La copie porte `sansGrille: true`, `grilleId: null`, `grilleNom: ''`, `criteres: []`, `statutRemise: 'evalue'`, `verrouillee: true` (elle compte dès sa saisie) et pas de `ponderationCouverte` (0 la sortirait de la note).
- Standards : `niveauFinal` (le code) et `noteFinale` (la valeur ponctuelle du niveau, `valeurNumeriqueDuNiveau`), et `echelleId`. C'est la conversion code → note que fait déjà une grille holistique. Le calcul la lit telle quelle : même note qu'une copie évaluée avec grille au même niveau (banc C1).
- Spécifications : `acceptable` (booléen) et `noteFinale: null`. **Aucun chiffre n'est fabriqué.** Conséquence : un tel jugement ne passe pas par la règle commune « la copie compte » (#706), qui exige une note et qu'une trentaine de lecteurs supposent chiffrée (moyennes, dépistage, sommative). Deux prédicats neufs dans `pratique-registre.js` l'admettent seulement là où un jugement binaire a un sens : le calcul des spécifications (`evaluationCompteEnSpecifications`) et l'indice C (`evaluationCompteCommeRemise`).

**Où vit le tableau.** Dans Évaluation › Liste, comme une seconde vue (décidé par Cowork). Aucune entrée de navigation neuve : rien dans `config.js` ni `navigation.js`.

**Ce que le tableau montre.** En standards, les productions qui entrent dans la note (le pool et la terminale, comme le calcul) ; en spécifications, les productions qui appartiennent à un type de travail de la pratique. Une production diagnostique, exclue, ou non assignée à ce groupe-cours n'y est pas. Les élèves sont triés par nom. Les inactifs sont exclus (question 4).

**Ce qui n'est pas fait, par choix** : l'import CSV (lot 3), « + Ajouter un·e étudiant·e » et l'en-tête autonome de l'ébauche (« Ouvrir l'application complète → », lot 2), les pastilles qui changent la règle (question 5).

**Où mon travail pourrait s'écarter de la consigne absente** (supposé) :
- les mots de l'écran ;
- la place exacte de la bascule ;
- le choix de dire la règle sans la changer ;
- l'exclusion des inactifs ;
- le refus du formulaire Évaluer plutôt qu'un remplacement.

### 3. Les mots de l'écran, PROPOSÉS

| Où | Texte |
|---|---|
| Bascule | « Liste » · « Tableau de notation » |
| Titre | « Tableau de notation » |
| Intro | « Saisis le résultat de chaque production, qu'elle ait été évaluée ici ou ailleurs. La note de chaque étudiant·e se construit dans la dernière colonne, selon les réglages de ta pratique. » (repris de l'ébauche) |
| Avertissement | « Un résultat saisi ici n'a pas de critères : ni forces, ni défis, ni rétroaction par critère. Le suivi qui lit la note continue de fonctionner. » |
| Règle (standards) | « La note retient les 3 productions les plus récentes. » ; « …les 4 meilleures productions, puis la terminale. » ; « …3 productions, récentes parmi les meilleures. » ; « …toutes les productions évaluées. » ; « …les catégories de ta pratique. » |
| Échelle | « Échelle « IDME » : » puis PS 0, I 40… |
| Forfaits (spécifications) | « Excellence · 90 » / « Exercices : 4, Projets : 2 » ; « palier d'échec » |
| Colonnes | « Étudiant·e », « Note provisoire » (« Note » quand « Notes finalisées » est cochée) |
| Sous la note | « 3 productions retenues », le nom du forfait, « en attente de résultats », « non calculable » (la cause en bulle) |
| Légende (standards) | « Plein : compte dans la note » · « Contour : évaluée, non retenue » · « Pointillé : à saisir » · « Point : évaluée avec une grille » · « Touche une case pour changer le niveau. Au clavier : la lettre du niveau, Retour arrière pour vider, les flèches pour se déplacer. » |
| Légende (spécifications) | « ✓ Acceptable » · « ✗ Non acceptable » · … · « Touche une case pour changer le résultat. Au clavier : A ou N, … » |
| Lecteur d'écran | « Ada Albatros, Production 1 : Maîtrise » ; « …, évaluée avec une grille ; toucher pour l'ouvrir » |
| États vides | « Ce groupe-cours n'a pas de pratique de notation. Choisis-en une dans Conception › Pratiques : le tableau suivra ses réglages. » · « Le tableau de notation sert les pratiques par standards et par spécifications. La pratique de ce groupe-cours se note autrement : la liste reste la vue de ses évaluations. » · « Aucun·e étudiant·e dans ce groupe-cours. Ajoute ta liste dans Cadre › Trimestre pour remplir le tableau. » · « Aucune production n'entre dans la note de ta pratique. Crée tes productions dans Conception › Productions. » · « Ta pratique n'a pas d'échelle dont les niveaux portent une valeur : aucun niveau ne peut être saisi. » |
| Liste (colonne Niveau) | « Acceptable » · « Non acceptable » |
| Évaluer (avis) | « Résultat saisi sans grille » / « Cette copie a été notée au tableau de notation (Évaluation › Liste). Change son résultat là. » |

Les chemins des états vides reprennent ceux que l'application écrit déjà ailleurs (« Conception › Pratiques », « Cadre › Trimestre », « Conception › Productions », mesurés par recherche dans `js/`).

### 4. Ce que dit le code, mesuré

- **L'inféré du plan est confirmé pour la note.** Le magasin des bancs n'a ni horaire, ni enseignant, ni dates de trimestre (banc C0), et la note s'y calcule en standards comme en spécifications (C1 à C4). **Nuance pour le lot 2** : l'indice C des standards (`pratique-pan-standards.js`) ne compte que les productions qui ont une **date d'échéance** assignée. Une entrée allégée sans échéances donnerait une note, mais pas de C.
- **Le verrou est levé pour le tableau seulement.** Le formulaire Évaluer exige toujours une grille. Le tableau écrit par son propre chemin. Il lit le stock BRUT (`db.getSync(cle('evaluationsSauvegardees'))`), comme la sauvegarde d'Évaluer : la lecture « selon le mode » filtre par cours, et réécrire un tableau filtré effacerait les autres cours. Il écrit par le témoin commun (`sauvegarderDonneesSelonMode`, geste « Tableau de notation »).
- **Les lecteurs** (carte faite par un agent de mesure, en lecture seule). Aucun ne plantait. Ceux qui affichaient faux sont corrigés :
  - la Liste disait « Non reçu / Importé » au lieu d'« Évalué », et ignorait le jugement ;
  - la pastille d'une copie et le rythme ne voyaient pas la copie comme évaluée ;
  - les trois fenêtres du dépistage par critère (`calculerMoyennesCriteresRecents`, l'IPB, le défi spécifique) se laissaient diluer ;
  - le formulaire Évaluer (rouvrir, déverrouiller, « Consulter »).
- Restent tolérés tels quels : le PDF de synthèse, le profil, le calcul, l'export, le codex (aucun schéma n'exige `grilleId` à l'import d'une évaluation).
- **Trouvé en écrivant le banc, corrigé (issue 1, c'est mon lot)** : la complétion des pratiques configurables (`pratique-configurable.js`, `calculerDetailsCompletion`) ne comptait au dénominateur que les productions à copie chiffrée. Une classe notée en spécifications au tableau aurait eu un C nul pour tout le monde.
- **Le formulaire Évaluer, en détail.** L'enregistrement automatique n'écrit jamais une copie verrouillée, et l'enregistrement d'une copie modifiée la refuse aussi. Un résultat sans grille naît verrouillé. La seule porte de réécriture était donc « Déverrouiller » : elle refuse maintenant ce résultat, depuis le formulaire comme depuis la palette Annotation (`_deverrouillerEvaluation`). Le bouton « Verrouiller » reste visible sur le formulaire vidé. Touché, il tombe sur le refus « Impossible de modifier une évaluation verrouillée » : le résultat est intact, mais le message n'est pas le plus clair.
- **Trouvaille hors lot (inscrire, mesure à faire)** : `genererBadgePratiqueHTML` lit un identifiant de famille, et rend « STD » pour tout identifiant qu'il ne connaît pas. Le tableau lui passe la famille. `comparateur-pratiques.js` lui passe l'identifiant d'une pratique configurable : son badge pourrait donc dire « STD » pour une pratique par spécifications. Non mesuré à l'écran, donc pas de symptôme vécu.

### 5. Les bancs

- **Vitest** : `tests/unit/tableau-notation-1.test.js`, 23 essais (A8 ajouté après la relecture). Ils couvrent l'écriture pure, les prédicats du registre, le vrai moteur (standards, spécifications, indice C, parité avec la grille), la Liste, l'échappement et la couleur filtrée de l'écran, la règle dite.
- **Break-tests faits**, chacun rougit son essai puis le code est restauré :
  - la branche binaire de `_estTravailAcceptable` (C2) ;
  - `copiePorteUneEvaluation` (B4, D1) ;
  - `couleurSure` (E1) ;
  - le refus d'une copie avec grille (A5) ;
  - le dénominateur de la complétion (C3).
- **Spec Chromium** : `tests/integration/tableau-de-notation-1.spec.js`, 8 essais, 8 verts (« la reprise » ajouté après la relecture ; ses deux gardes cassées exprès rougissent l'essai). Ils suivent le tour au toucher, le clavier, plein et contour, la copie avec grille (lue, non modifiée, ouverte), le retour à la Liste, le formulaire Évaluer, et les spécifications de bout en bout. **Break-tests** : la garde du formulaire et l'ouverture de la copie avec grille, chacune rougit son essai.
- **Harnais des bancs existants** : complétés des prédicats neufs (`tests/unit/_helpers/predicats-copie.js`, et cinq fichiers qui chargent la Liste, les travaux ou le rythme dans leur propre `window`). **Aucune assertion n'a changé.** Une exception nommée ajoutée à `sentinelle-note-provisoire-reservee` : le tableau ne sert que des pratiques alternatives.
- **Vitest complet** avant l'étape 2 : 10 861 verts sur 10 866. Les 5 rouges étaient des cliquets sur mon propre code (variable CSS sans définition, un masquage de `cle()`, « Note provisoire », une pause fixe dans la spec), tous corrigés ; les huit sentinelles concernées repassent (563 essais). Le hook pre-push relance Vitest au complet à chaque push (verdict au § 7).
- **Playwright** : seulement la spec du lot, sous Chromium. Le verdict WebKit complet se prend sur le Mac.

### 6. Les captures (Chromium, `plans de travail/captures-2026-11-09-tableau-de-notation-1/`)

`standards-1180-clair.png`, `standards-1180-sombre.png`, `standards-820-clair.png`, `standards-820-sombre.png`, et les mêmes pour `specifications-…`. 1 180 × 820 : l'iPad couché ou le Mac ; 820 × 1 180 : l'iPad debout, où le tableau défile et garde les noms à gauche et la note à droite. Élèves fictifs.

### 7. Relecture par un agent neuf

**Verdict de l'agent, en une ligne** : « les écritures, l'échappement et la note tiennent sur le chemin livré, mais la reprise sur un résultat sans grille est à corriger avant la fusion vers `main` ». Il a lancé le Vitest complet (10 867 verts) et la spec Chromium (7 sur 7), et posé ses propres sondes hors du dépôt.

Disposition de chaque constat (c'est mon lot : « corrigé » sauf mention) :

| Constat | Disposition |
|---|---|
| Un jeton de reprise sur un résultat sans grille : reprise déverrouillée où le tableau écrivait sans effet ; la vider laissait une originale pointer vers une copie disparue | **Corrigé** (`077c8b69`) : `appliquerJetonReprise` refuse ; le tableau ne touche pas une copie remplacée ; chaque saisie reverrouille. Banc A8 et spec « la reprise ». Pas de stock : la fonction est neuve. |
| « Modifier l'évaluation » (Liste) déverrouillait la copie sans grille avant que le formulaire refuse, et laissait le verrou du formulaire levé | **Corrigé** : la garde passe avant l'écriture et ramène au tableau. Spec « la reprise ». |
| En spécifications, un niveau saisi sous une pratique devenue « spécifications » s'affichait « + » plein ; un brouillon avec grille s'affichait ✗ | **Corrigé** : lu par le moteur quand il compte, montré en contour sinon ; une case sans valeur est vide. |
| Le PDF d'un jugement binaire n'affiche aucun résultat | **À Grégoire** (question 9) : ce sont des mots que les élèves liront. |
| `depistagePeutJugerLaNonParticipation` répond « aucune copie évaluée » pour une classe notée seulement au tableau en spécifications | **Pour le lot 2** : l'entrée allégée en fera le cas courant ; aujourd'hui, une classe a d'ordinaire des copies avec grille. |
| `compterEvaluationsEcarteesDeLaNote` ignore un jugement binaire en brouillon | **Sans conséquence** : aucun chemin n'en crée plus (le tableau reverrouille, la reprise est refusée). |
| Le dénominateur de C appelle `evaluationCompteEnSpecifications` pour toutes les familles | **Gardé** : le commentaire dit pourquoi (une production jugée a été évaluée) ; un nom plus général serait un renommage de plus. |
| « Verrouiller » visible sur le formulaire vidé | **À Grégoire** (question 10), mineur : le résultat reste intact. |
| Pas de garde « référence démo » au tableau | **Refusé** : le tableau ne lit et n'écrit que dans le mode actif (`cle()`) ; il ne peut pas lier une copie réelle à une production de démo. |
| Aucune entrée au Journal pour une saisie au tableau | **Limite connue** : le Journal mesure le temps passé à évaluer une copie, et une saisie au tableau n'a pas de durée. |
| 350 arrêts de Tab ; aucune annonce de la note changée ; pas de `touch-action` | **Corrigés** : tabindex itinérant, zone `aria-live`, `touch-action: manipulation`. |
| Exports sans lecteur, JSDoc du verrou séparée de sa fonction, booléen ignoré, paramètre inutile, mots en double, commentaire d'en-tête inexact, `sticky top` sans effet | **Corrigés** (le lot n'était pas fini). |

### 8. À inscrire au BACKLOG

Rien qui réponde à la règle d'entrée (un symptôme vécu, ou un chantier bloqué). Les suites du plan (lots 2 et 3) sont déjà écrites dans le plan. La trouvaille du badge du Comparateur (§ 4) reste une mesure à faire, pas une fiche.

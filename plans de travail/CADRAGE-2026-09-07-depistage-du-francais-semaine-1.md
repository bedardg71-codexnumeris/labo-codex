# CADRAGE — Le dépistage du français en première semaine : un signalement, pas un palier

> **Écrit le 7 septembre 2026 en soirée, par Cowork, avec Grégoire.** Né d'un besoin réel :
> il a fait écrire un portrait de lecteur en première semaine, l'a corrigé **sur le seul
> critère du français**, et veut s'en servir pour repérer qui référer au centre d'aide
> (le CAF de son collège, devenu « Passerelle + », transition en cours).
> **Application au moment de l'écriture** : 1.124.3, build `0907-1325`, tête `b8ccd67b`.
> ⛔ **Pas une consigne.** La place de consigne du jour est occupée par la purge de
> l'historique (#781). À exécuter quand Grégoire l'ouvrira.

## Le besoin, dans ses mots (7 septembre)

> « Ce texte est un portrait de lecteur qui n'est pas un artefact. J'ai seulement évalué le
> français pour éventuellement référer certains élèves au centre d'aide. Je voudrais que
> cette note ne serve qu'au dépistage et non comme une production comme telle. »

> « Le texte a été produit à la première semaine et ne constitue en aucun cas une évaluation
> sur des éléments vus en classe. Je voudrais qu'il serve uniquement à alimenter le
> dépistage, mais qu'il ne compte pas dans le calcul de P. »

> « Mon objectif était de repérer les étudiants ayant des difficultés pour les aider dès le
> départ. Mais le texte est très bien réussi pour d'autres élèves. Comme un seul critère a
> été évalué, ce résultat ne peut pas entrer dans le calcul de la note finale. »

## Ce qui a été mesuré, et comment

Toutes les commandes ci-dessous ont été lancées sur le Mac, dans le dépôt monté, le
7 septembre en soirée, sur `b8ccd67b`.

- **Aucun marqueur « hors calcul » n'existe sur une production.**
  `grep -rn "productionsExclues\|horsCalcul\|ignorerDansCalcul\|neCompte" --include="*.js" js/`
  rend zéro ligne. Témoin : le même grep sur `exclure` rend seize lignes, toutes étrangères
  au sujet (filtres de démo, doublons, conteneur portfolio).

- **Le dépistage et le calcul de la note ne passent PAS par la même porte.**
  `grep -rn "obtenirIdsProductionsEvaluables" --include="*.js" js/` rend cinq appelants, tous
  dans la chaîne de dépistage et de profil (`profil-etudiant-calculs.js` ×4,
  `profil-etudiant-sections-affichage.js`, `profil-etudiant-rapport.js`). **Aucun dans
  `js/pratiques/` ni dans `portfolio.js`** : la note et l'indice P sélectionnent leurs
  productions par la configuration de la pratique active
  (`pratique-configurable.js:475`, `_calculerPerformanceSommative`, `nombreARetenir`).
  ⮕ **Les deux chaînes sont séparables.** C'est ce qui rend le besoin réalisable.

- **Ce qui alimente réellement l'écran, c'est la voie P/patterns, pas l'IPB.**
  `grep -rn "determinerNiveauRaiPedagogique" --include="*.js" js/` rend des appelants dans
  `profil-etudiant-sections-affichage.js`, `etudiants.js` (×4), `tableau-bord-apercu.js`,
  `interventions.js` (×3), `snapshots.js`, `profil-etudiant-actions.js`.
  `grep -rn "diagnostiquerSuiviApprentissage"` n'en rend qu'**un seul hors du fichier qui la
  définit** : `tableau-bord-apercu.js:132`.
  ⮕ Le palier affiché partout vient de `determinerNiveauRaiPedagogique`
  (`profil-etudiant-calculs.js:1816`), qui lit `calculerIndicesNDerniersArtefacts(da, true)` —
  **la moyenne des notes finales des N derniers artefacts**, N valant 3 par défaut.

- **Un seul artefact suffit à produire un palier 2 ou 3 par cette voie.** La règle arrêtée par
  Grégoire le 7 septembre (#775, commentée à `profil-etudiant-calculs.js:1816`) fait décider le
  palier **sur le dépistage seul** tant que la note n'est pas constructible. Il n'y a pas de
  garde « trois artefacts minimum » sur ce chemin.
  ⚠ **Correction d'une affirmation faite en conversation** : « l'app refuse de conclure sur une
  seule mesure » vaut pour l'IPB (`calculerIPB`, qui compte des artefacts *consécutifs* sous le
  seuil et plafonne donc à 1), **pas** pour ce que Grégoire voit à l'écran.

- **La projection EUF existe déjà et n'est plus en dur.** `_projectionEUF`
  (`evaluation-calcul.js:193`) délègue au registre `evaluation-projection.js` et tire ses
  verdicts **du gabarit de la grille** depuis #668. Il n'y a donc pas d'algorithme à écrire :
  le ratio fautes/mots projeté sur le seuil de l'épreuve uniforme produit déjà une rétroaction.

- **Un champ « Services adaptés : CAF » existe sur la fiche de l'élève**
  (`profil-etudiant-sections-affichage.js:1169` et `:2484`, `etudiant.caf === 'Oui'`).
  C'est un **fait administratif déclaré**, pas un résultat de dépistage.

## Les décisions arrêtées par Grégoire (7 septembre)

1. **Le texte diagnostique ne compte ni dans la note finale, ni dans l'indice P.** Motif dans
   ses mots : un seul critère a été évalué.
2. **Il ne compte pas davantage dans la fenêtre des patterns du dépistage.** Motif : cette
   fenêtre moyenne des notes finales ; une note de français seul y entrerait comme si elle
   mesurait la compétence entière, et ferait basculer en palier 2 ou 3, dès la première
   semaine, un élève solide en analyse et faible en orthographe — sans que l'écran dise nulle
   part que ce palier repose sur une seule dimension.
3. **Ce qu'il produit à la place : un signalement, à côté du palier et pas dedans.** Visible au
   profil de l'élève, capable d'ouvrir une intervention, sans toucher au niveau RàI — lequel
   continue de se construire sur les artefacts complets du trimestre.
4. **Le signalement se lève automatiquement** dès que le ratio franchit le seuil. Grégoire
   contacte ensuite les élèves lui-même, par message. Il ne veut pas valider une liste élève
   par élève. Ses mots : « À ce moment du trimestre je les connais très peu, mais je veux
   avoir une incidence sur leur parcours. »
5. **Le signalement reste distinct du champ « Services adaptés ».** L'un dit que l'élève *est*
   inscrit, l'autre qu'il *devrait* être référé. Les fondre ferait perdre la trace de qui n'a
   jamais donné suite.

## Ce que la production diagnostique devient (7 septembre, en soirée)

Elle reste une production entière, **sans poids** : copie importée, annotation, rétroaction, résultat
visible dans le dossier de l'élève en tout temps. Elle ne pèse ni sur la note, ni sur P, ni sur la fenêtre
des patterns. Sa seule sortie est le signalement.

↻ **TRANCHÉ : elle est aussi exclue de l'indice C (complétion).** Motif de Grégoire : *« Certains élèves ne
sont pas au premier cours pour des raisons administratives (horaire, inscription, etc.). »* Une non-remise en
première semaine ne dit rien de la mobilisation de l'élève.

⚠ **Conséquence mesurée qui rendrait cette exclusion vaine si elle était oubliée.**
`depistagePeutJugerLaNonParticipation()` (`js/profil-etudiant-calculs.js:1789`) autorise le verdict
« Non-participation → niveau 3 » dès que le groupe réunit **un travail dû** (une production non facultative
dont l'échéance est passée) **et une copie évaluée**. En première semaine, le texte diagnostique remplit les
deux conditions à lui seul dès que Grégoire a corrigé une première copie. Un élève arrivé en retard pour une
raison d'horaire basculerait donc en palier intensif — **par l'autre porte**, l'exclusion de C n'y changeant
rien. ⮕ La production diagnostique doit sortir de cette fonction aussi. **Un seul marqueur, quatre exclusions :
note, P, fenêtre des patterns, et le jugement de non-participation.**

## Ce que Cowork a tranché seul, et qu'il nomme ici

- **Le marqueur vit sur la PRODUCTION, pas sur chaque évaluation.** Coché une fois à la
  création du travail, il vaut pour tout le groupe : sinon la case se coche trente-cinq fois.
- **Le signalement se calcule à la volée, il ne se stocke pas.** Motif : « tarir n'est pas
  réparer » — une donnée dérivée stockée devient du stock chez les utilisateurs, à migrer et à
  réparer. Rien à écrire chez personne.
- **Rien de ce qui est écrit ne nomme « Passerelle + » ni « français » en dur.** Le libellé du
  signalement vient du gabarit de projection de la grille, comme les verdicts depuis #668. Un
  enseignant de chimie doit pouvoir lever un signalement sur son propre critère. C'est le
  principe d'universalité du skill `depistage-rai`, et c'est aussi ce qui évite de recoder
  quand la transition CAF → Passerelle + sera terminée.

## Ce qui reste à trancher, et qui appartient à Grégoire

↻ **TRANCHÉ le 7 septembre au soir : « Aide en français recommandée »**, et « aucune
référence en dur à un quelconque service d'aide » (ses mots).
⮕ Conséquence que Cowork tranche et nomme : **cette phrase est la valeur par défaut de SON
gabarit de projection, pas une constante du code.** Écrire « français » en dur rejouerait le code
dur qui a été retiré du dépistage — un enseignant de chimie doit pouvoir écrire la sienne. Le champ
est libre et vide à la création d'un gabarit ; le gabarit « critères EUF » livré en exemple porte
cette phrase-là.
↻ **TRANCHÉ le 7 septembre au soir : le drapeau se lève dès le palier « Risqué »**, pas à « Échec ».
Mesure qui a fondé l'arbitrage (`js/evaluation-projection.js:249-292`) : les six paliers sont « Sans erreur »,
« Excellent » (ratio ≤ 0,3), « Très bien » (≤ 0,4), « Bien » (≤ 0,5), « Risqué » (≤ 1), « Échec » (> 1), le
ratio 1 valant le seuil. **Le palier « Risqué » porte déjà, en `texteAide`, « Il est recommandé de t'inscrire
au {service} »** : caler le drapeau sur « Échec » aurait laissé l'élève lire une recommandation d'aide que
l'enseignant ne voyait pas. Grégoire a préféré aligner les deux, en acceptant le coût — plus d'élèves
signalés en première semaine, sur une capacité d'accueil limitée.
⮕ Conséquence que Cowork tranche et nomme : **le déclenchement est une CASE SUR LE PALIER du gabarit
(« ce palier lève un signalement »), pas un seuil `0,5` écrit dans le code.** Même motif que le libellé : rien
en dur. Le gabarit « critères EUF » livré en exemple coche « Risqué » et « Échec ».
↻ **TRANCHÉ le 7 septembre au soir : le champ « CAF » devient « Aide en français », sans nom de service.**
⮕ Conséquence que Cowork tranche et nomme : **le LIBELLÉ change, la CLÉ `caf` reste.** Mesuré
(`grep -rn "\.caf\b|'caf'" --include="*.js" js/`) : la clé voyage — import CSV (`groupe.js:213`, qui reconnaît
déjà les alias « centre d'aide », « aide francais », « aide français »), export CSV (`groupe.js:826`), formulaire
(`etudiantCAF`), pack de démonstration. Renommer la clé casserait les fichiers d'élèves déjà constitués, pour un
gain nul : personne ne la lit. Les deux sites d'affichage à corriger sont
`profil-etudiant-sections-affichage.js:1169` et `:2484`.
⮕ **Bonne nouvelle mesurée** : l'import reconnaît déjà « aide français » parmi ses alias de colonne, donc
l'en-tête d'export peut porter le nom neuf sans qu'un fichier réexporté cesse d'être relisible.
⚠ **Réserve nommée, non tranchée** : « Aide en français » reste un libellé de discipline dans une application
qui vise toutes les disciplines. C'est un mot que Grégoire lit, pas ses élèves, et le champ est déjà spécifique
depuis toujours (« CAF ») — mais si un collègue d'une autre discipline s'en sert, la question se reposera.

⮕ **Les trois questions ouvertes du 7 septembre sont désormais tranchées. Ce cadrage est prêt à devenir une
consigne** : il ne reste plus que du technique et du mesurable.

## Issues

- Ce cadrage entre dans `00-CADRAGES-OUVERTS.md` le jour où il est écrit.
- Rien n'est inscrit au BACKLOG pour l'instant : la règle du 24 août veut un symptôme vécu.
  **Celui-ci en est un** — il vient de le vivre sur ses vraies copies — mais Grégoire n'a pas
  encore ouvert la séance. L'inscription se fera au moment où il l'ouvre, pas avant.

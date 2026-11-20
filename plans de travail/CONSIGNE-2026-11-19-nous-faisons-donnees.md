> Consigne du lot `lot/nous-faisons-donnees` (session de nuit A, 19 au 20 nov. 2026) : copie mot pour mot de
> `plans de travail/textes-parcours-2026-11-19/parcours-donnees-pratique-textes.md`, branche `origin/lot/textes-parcours-nuit` (`afb106679`).
> Le relais est le bloc « Pour Claude Code, à relayer » en fin de document.

# Parcours « Mettre tes données à l'abri », « Nous faisons » (Pratique guidée) : bulles réécrites avec Grégoire (19 nov. 2026)

Ouvert le 19 nov. 2026 à 12 h 15 par la séance de Cowork ouverte à 12 h 09, sur la consigne remise par la séance de 11 h 04 à 11 h 58 (parcours choisi par Cowork : son seul préalable est « Mettre ta classe en place », ni « Évaluer » ni les descripteurs, en pause ; quatre étapes, les plus courtes ; textes du 8 nov. déjà validés, à réécrire dans le ton plutôt qu'à inventer). Même moule que `claude/parcours-recevoir-pratique-textes.md` (le parcours 4) et `claude/parcours-classe-pratique-textes.md` (le parcours 2), écrits le 19 nov. au matin.

**Base.** Les quatre étapes telles qu'elles sont dans le code (`js/parcours-donnees.js`, `ETAPES`, lues sur `origin/claude/ecstatic-brown-urn6v8` = `ebc9a9ad` le 19 nov. à 12 h 10) : Pourquoi un codex ; Mettre à jour ; Range ton fichier ; Quand le rouvrir. Les textes actuels sont ceux validés par Grégoire le 8 nov. (12 h 48 à 13 h 43), en paragraphes (`texte`, `geste`) : `TEXTE_1`, `TEXTE_2`, `TEXTE_3_DEBUT` + une phrase selon le chemin d'écriture + `TEXTE_3_FIN`, `TEXTE_4` ; la ligne du panneau (`LIGNE`) et le refus sans trimestre réel (`REFUS_SANS_TRIMESTRE`) ne changent pas. Consigne d'origine : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-6-donnees-a-l-abri.md` ; rapport : `plans de travail/RAPPORT-2026-11-09-parcours-6-donnees-a-l-abri.md` ; la sentinelle `tests/unit/sentinelle-parcours-donnees-2026-11-09.test.js` confronte chaque texte posé à cette consigne (à repointer vers la nouvelle consigne au relais). Ce parcours n'a pas de « Je regarde » (prévu en visite dans la démo, pas écrit, hors mandat).

**Forme (celle des parcours 2 et 4).** La confirmation « C'est fait : … » au-dessus du titre, en petit, à partir de la bulle 2 ; l'objectif à la première bulle, rappelé comme atteint à la dernière ; les explications sans marque ; seuls les gestes marqués, d'une flèche (→) à faire, d'un crochet une fois faits. Dans ce document, les bulles sont montrées à leur ouverture : tous leurs gestes portent la flèche. Un geste conditionnel s'écrit dans une explication, sans marque. Pas de « Remplir » ; aucune donnée inventée ; aucun produit commercial nommé. Pas de phrase du lieu dans ce parcours : le bouton « Codex » est dans l'en-tête de toutes les pages (`index.html` l. 3792, `#btn-codex`), le menu et l'aperçu s'ouvrent par-dessus la page ; le parcours ne change jamais de page.

## Bulle 1 (validée par Grégoire le 19 nov. à 12 h 15 : « C'est bon »)

**Pourquoi un codex** · 1 sur 4

À la fin de ce parcours, tu seras en mesure de mettre tes données à l'abri : ton codex à jour, rangé dans un lieu protégé.

Tes données demeurent dans le navigateur de cet appareil : Labo Codex ne les envoie nulle part.
Elles peuvent donc se perdre si tu effaces les données de sites, ou si tu changes de navigateur ou d'ordinateur.
Ton codex en est une copie complète, productions de tes étudiant·es comprises, dans un seul fichier que tu rouvres sur n'importe quel appareil.
Ce fichier ne change que quand tu le mets à jour : l'application ne le fait jamais à ta place.

→ **Touche « Codex », en haut de l'écran**

(Puis la phrase de la poignée, posée par le moteur : « Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir. »)

Notation pour le relais : objectif (posé par le moteur depuis la définition, `objectif` sur `DEF`) ; [E] ×4 ; [G] la consigne (se grise quand le menu est ouvert : `atteint` actuel, `menuOuvert`). Pas de phrase du lieu. `avant`, `contour` (`boutonCodex`) inchangés.

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; l'objectif (verbe d'application, « mettre à l'abri », le titre du parcours, comme aux parcours 2 et 4) ; « Tes données vivent dans ce navigateur, sur cet appareil » devient « Tes données demeurent dans le navigateur de cet appareil » (le mot de la carte « À propos » : « Tout le reste demeure dans le navigateur de ton appareil ») ; « Elles peuvent donc être perdues » devient « se perdre » ; « Ton codex en garde une copie complète… que tu rouvres » devient « Ton codex en est une copie complète… dans un seul fichier que tu rouvres » (le texte du 8 nov. disait « Ce fichier » sans avoir dit que le codex en est un ; la carte : « ton codex, un fichier que tu transportes ») ; la consigne passe de la fin du paragraphe à la ligne marquée. Ni phrase du lieu (voir « Forme ») ni « Cette fois… » (pas de « Je regarde » auquel l'opposer ; le codex écarte déjà la démo, `_sansLeDemo`, `js/codex.js` l. 410). Objectif atteint, pour la dernière bulle : la forme des parcours 2 et 4 (« Objectif atteint : tu es en mesure de… ») donnerait deux deux-points dans la même phrase ; à régler avec la bulle 4.

**Supposé par Cowork (12 h 13, dit à Grégoire)** : le parcours se joue en vue étendue. En vue simple, le bouton de l'en-tête s'appelle « Sauvegarder » (`js/vue-simple.js` l. 268) et le menu n'offre que « Enregistrer dans un fichier » et « Ouvrir un fichier… » (`index.html` l. 3800 à 3805) : la bulle 1 et la bulle 2 y seraient fausses. À mesurer par Claude Code au relais (un parcours peut-il partir en vue simple ?).

## Bulle 2 (validée par Grégoire le 19 nov. à 12 h 17 : « C'est bon. »)

C'est fait : le menu Codex est ouvert. (en petit, au-dessus du titre)

**Mettre à jour** · 2 sur 4

Mettre ton codex à jour, c'est rassembler tes données et les fichiers des productions de tes étudiant·es en un seul fichier.
Plus tu as importé de productions, plus il est lourd, et plus sa préparation peut prendre un moment.
Refais ce geste chaque semaine, et après chaque travail important : une saisie de présences, une série d'évaluations.

→ **Touche « Mettre à jour le codex »**

Notation pour le relais : [C] ; [E] ×3 ; [G] la consigne (se grise quand l'aperçu s'ouvre : `atteint` actuel). Pas de phrase du lieu. `avant`, `zones` (le haut du menu), `nommeLeContour`, `contour` actuels inchangés.

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; la confirmation ; « Une fenêtre d'aperçu s'ouvre ; son « i » te dit ce que contient le fichier » et « Touche « Mettre à jour » » quittent cette bulle (l'étape avance dès que l'aperçu s'ouvre : ils vont à la bulle 3, l'aperçu sous les yeux) ; « l'application rassemble tes données… » devient « Mettre ton codex à jour, c'est rassembler… » (sans « Touche « Mettre à jour » » devant, le sujet devait changer ; le menu ne fait qu'ouvrir l'aperçu) ; « après chaque séance de travail importante » devient « après chaque travail important » (« séance » est réservé à une rencontre avec le groupe, règle 6 du 14 nov.).

## Bulle 3, forme de la fenêtre de choix (validée par Grégoire le 19 nov. à 12 h 20 : « Ok »)

C'est fait : l'aperçu de ton codex est ouvert. Rien n'est encore écrit. (en petit, au-dessus du titre)

**Range ton fichier** · 3 sur 4

Le « i » de l'aperçu te dit ce que contient le fichier.
Ton codex contient les noms, les DA et les productions de tes étudiant·es, et il n'est pas chiffré : quiconque a le fichier peut le lire.
Sa place est dans un lieu protégé : une clé USB chiffrée, ou un dossier synchronisé avec un infonuage chiffré, protégé par un mot de passe solide et une double authentification.
Ton appareil, lui, devrait avoir un mot de passe et un disque chiffré.

→ Touche « Mettre à jour »
→ **Dans la fenêtre qui te demande où l'enregistrer, choisis ta clé ou ton dossier synchronisé**

Jusqu'à ce que tu recharges la page, chaque mise à jour réécrira ce même fichier, sans rien te demander.

Notation pour le relais : [C] ; [E] ×4 ; [G] « Touche « Mettre à jour » » (se grise quand l'aperçu s'est refermé sur une écriture en cours, si le parcours sait le lire, `tentativeEnCours()` ; sinon ne se grise pas ; à dire au rapport) ; [G] la consigne, chemin `fenetre` (se grise quand le codex est écrit : `atteint` actuel) ; [E], après la consigne, la seconde phrase de la fenêtre (`FENETRE_2`). Pas de phrase du lieu. La phrase se choisit toujours à l'entrée de l'étape (`Codex.cheminDeLaProchaineEcriture`) ; `avant`, `zones` (la bulle à droite de l'aperçu à partir de 1180 px, au-dessus des fenêtres, qui cède la place aux fenêtres de dialogue), `contour`, `atteint` actuels inchangés. À mesurer par Claude Code : la bulle, plus longue d'une confirmation et de deux lignes de geste, tient-elle à droite de l'aperçu à 1180 × 820 (255 px de large, mesuré le 9 nov.) sans défiler ni rien couvrir ? Sinon, ce que fait le moteur (élargir, autre place), dit au rapport ; les mots ne changent pas.

**Les deux formes qui se déduisent de celle-ci (décidé par Cowork, 12 h 21, mécanique, sans mot neuf)** : le fichier déjà tenu (`tenu`, rare dans un premier parcours) : pas de second geste ; « Touche « Mettre à jour » » devient la consigne (en gras), suivie de la même explication (`FENETRE_2`). Des copies qui manquent (`fenetre` avec `copiesManquent`, #1012 : l'application redemande où écrire et ne garde pas le fichier) : la même bulle sans l'explication finale (validé par Grégoire le 9 nov. : « la première phrase seule »).

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; la confirmation (le moule de la bulle 2 du parcours 4 : « Rien n'est encore importé » devenu « écrit ») ; « son « i » te dit ce que contient le fichier » arrive de la bulle 2, devenu « Le « i » de l'aperçu… » ; « Range-le dans un lieu protégé » devient « Sa place est dans un lieu protégé » (une explication à l'impératif aurait l'air d'un geste, règle de Grégoire du 18 nov.) ; le geste du 8 nov. (« Touche « Mettre à jour », puis range ton fichier dans un lieu protégé ») devient deux gestes marqués ; la phrase de la fenêtre se coupe : sa première moitié devient la consigne (« Dans la fenêtre qui te demande où l'enregistrer… »), sa seconde l'explication finale ; « Quand le menu affiche « Ton codex est à jour », ta copie est faite » (`TEXTE_3_FIN`) part : le menu se ferme pendant la mise à jour (mesuré le 9 nov.), ce sera la confirmation de la bulle 4. « Ton ordinateur, lui, devrait… » devenu « Ton appareil, lui, devrait… » à 12 h 21, avec la forme du partage (voir plus bas).

## Bulle 3, forme du partage (validée par Grégoire le 19 nov. à 12 h 21 : « Ok »)

La confirmation, le titre et les quatre premières lignes : ceux de la forme de la fenêtre de choix, dont la quatrième, « Ton appareil, lui, devrait avoir un mot de passe et un disque chiffré. », commune aux formes. Puis :

→ Touche « Mettre à jour »
→ **Quand ton appareil te propose de partager le fichier, choisis de l'enregistrer, sur ta clé ou dans ton dossier synchronisé**

Notation pour le relais : comme la forme de la fenêtre, chemin `partage` ; la consigne (`PARTAGE` du 8 nov., devenue un geste) se grise quand le codex est écrit (le partage compte comme écrit aussitôt, `_ecrireLeCodexPrepare`) ; pas d'explication après.

Nouveau par rapport au texte du 8 nov. : « Ton appareil te propose de partager le fichier : choisis… » devient la consigne, « Quand ton appareil te propose… », parallèle à « Dans la fenêtre qui te demande… » ; aucune explication après la consigne (rien n'a été validé pour ce chemin le 8 nov. ; rien d'inventé). **« Ton ordinateur » devient « Ton appareil » dans le texte commun (recommandé par Cowork, accepté par Grégoire à 12 h 21)** : le partage est le chemin de la tablette, où « ordinateur » sonne faux ; « ton appareil » est le mot retenu par Grégoire le 8 nov. pour couvrir l'ordinateur et la tablette.

## Bulle 3, forme du téléchargement (validée par Grégoire le 19 nov. à 12 h 23 : « Ok »)

La confirmation, le titre et les quatre premières lignes : ceux des deux autres formes. Puis :

→ Touche « Mettre à jour »
→ **Quand le fichier est dans tes téléchargements, réponds « Il y est », puis déplace-le sur ta clé ou dans ton dossier synchronisé**

Chaque mise à jour t'en remettra un nouveau : c'est le plus récent qui compte.

Notation pour le relais : comme la forme de la fenêtre, chemin `telechargement` ; la consigne se grise quand le codex est écrit (« Il y est », `confirmerTelechargement`, puis `_marquerCodexAJour`) ; [E] après la consigne. La bulle cède toujours la place à la fenêtre « Téléchargement lancé » (`zones` actuel).

Nouveau par rapport au texte du 8 nov. (`TELECHARGEMENT`) : « Le fichier arrive dans tes téléchargements. Quand tu l'y vois, réponds « Il y est », puis déplace-le… » devient la consigne, « Quand le fichier est dans tes téléchargements, réponds… » ; « puis déplace-le » y reste (l'étape avance dès « Il y est » : la bulle disparaît alors, la suite doit être lue avant) ; les trois consignes finissent par « ta clé ou ton dossier synchronisé » ; « Chaque mise à jour t'en remettra un nouveau : c'est le plus récent qui compte. » passe après la consigne, comme l'explication de la forme de la fenêtre.

## Bulle 4 (validée par Grégoire le 19 nov. à 12 h 25 : « Ok »)

C'est fait : ton codex est à jour. (en petit, au-dessus du titre)

**Quand le rouvrir** · 4 sur 4

Ton codex te servira dans deux cas : pour travailler sur un autre appareil, ou pour retrouver tes données si ce navigateur les perd.
Tu l'ouvriras alors par « Ouvrir un codex… », ici, dans le menu.
Attention : ouvrir un codex remplace tout ce qui est dans l'application par le contenu du fichier. C'est donc toujours ton codex le plus récent qu'il faut ouvrir.
Le haut du menu te dit où tu en es : « Ton codex est à jour », ou « Ton codex n'a pas tes derniers changements ».
Et si tu oublies, le rappel « Mets ton codex à jour » reviendra toutes les deux semaines, ou au rythme que tu choisis.

Pour revoir une étape, touche « 4 sur 4 ».

(filet) **Objectif atteint : tu es en mesure de mettre tes données à l'abri (ton codex à jour, rangé dans un lieu protégé).** (filet), posé par le moteur (`objectifAtteint`).

Chaque parcours a son objectif. C'est toi qui choisis la suite.

→ **Touche « Parcours suivant », ou « Terminer ».** (la consigne de fin du moteur)

Boutons : « Parcours suivant » et « Terminer », de même poids (règle 9 du 14 nov.), à la place du seul « Terminer » primaire de l'étape.

Notation pour le relais : [C] ; [E] ×5 ; puis la fin du moteur, dans son ordre. `avant` (le menu rouvert), `zones` (le haut du menu), `contour` (« Ouvrir un codex… », gardé inactif pendant le parcours), `sansSortie`, `surEchap` gardés ; `terminer()` garde son ménage (le menu refermé) et l'état « fait ».

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; la confirmation (le `TEXTE_3_FIN` du 8 nov. : le menu se ferme pendant la mise à jour, l'état ne se lit qu'ici) ; « Touche alors « Ouvrir un codex… », ici, dans le menu » devient « Tu l'ouvriras alors par « Ouvrir un codex… », ici, dans le menu » (un geste pour plus tard, dont le bouton ne répond pas pendant le parcours : une explication, sans impératif) ; « Ouvre donc toujours ton codex le plus récent » devient « C'est donc toujours ton codex le plus récent qu'il faut ouvrir » ; « Pour savoir où tu en es, regarde le haut du menu » devient « Le haut du menu te dit où tu en es » (même motif) ; la fin du moteur (« Pour revoir une étape… », l'objectif atteint, « Chaque parcours a son objectif… », deux boutons) à la place de « Touche « Terminer » ». **L'objectif atteint (décidé par Cowork, accepté par Grégoire à 12 h 25)** : la forme des parcours 2 et 4 aurait mis deux deux-points dans la même phrase ; la seconde moitié de l'objectif de la bulle 1 passe entre parenthèses, mots inchangés.

## Faits mesurés en chemin
- Le bouton « Codex » de l'en-tête (`#btn-codex`, libellé `.codex-label-btn`) ouvre le menu (`Codex.toggleMenu`) ; le haut du menu (`#codex-menu-statut-haut`) dit « Pas encore de codex : « Mettre à jour le codex » en crée un avec tes données. », puis « Ton codex est à jour » ou « Ton codex n'a pas tes derniers changements » (`js/codex.js` l. 3258 et 3284). Sous « Mettre à jour le codex », une ligne dit « Partage un nouveau fichier » ou « Télécharge un nouveau fichier » selon le chemin (l. 3326).
- Le codex écarte la démo (`_sansLeDemo`, `js/codex.js` l. 410). `lancer()` de ce parcours ne quitte pas la démo (aucun `desactiverModeDemo` dans `js/parcours-donnees.js`, contrairement aux parcours 2 et 4) ; le rapport du 9 nov. : « Le parcours n'a pas été joué en démo ouverte. » À mesurer par Claude Code au relais.
- `DEF` n'a ni `objectif` ni `objectifAtteint` ; l'étape 4 n'offre que « Terminer » (`boutons`, `sansSortie`), sans la fin du moteur à deux boutons.

- L'aperçu « Mettre à jour le codex » (`js/securite-export-preview.js`, mots de `MOTS_APERCU_CODEX`, `js/codex.js` l. 454) : le titre, le « i » (`aria-label` « Aide : ce que contient le fichier », visible si « Aide dans les pages » est allumée, le défaut), le sous-titre « N fichiers ou dossiers à inclure », la liste, la note « Vérifie qu'aucun nom de fichier n'est inattendu avant de continuer. », puis « Annuler » et « Mettre à jour ».
- `_mettreAJourLeCodex` ferme le menu avant de préparer le fichier (rapport du 9 nov., `js/codex.js`) : « Ton codex est à jour » ne se voit qu'à l'étape 4, menu rouvert.

- La fenêtre du téléchargement (`confirmerTelechargement`, `js/fichier-sortant.js` l. 247) : titre « Téléchargement lancé », « L'application ne peut pas savoir si le téléchargement s'est terminé. Attends qu'il le soit, puis vérifie que le fichier « … » (…) se trouve dans tes Téléchargements. », boutons « Il y est » et « Il n'y est pas ». La bulle 3 lui cède la place.

- Le rappel « Mets ton codex à jour » (`js/modal-backup-reminder.js`) : 14 jours par défaut (`DELAI_PAR_DEFAUT`), au choix « Dans 7 jours », « Dans 14 jours », « Dans 30 jours » (l. 235 à 237). La phrase du 8 nov. (« toutes les deux semaines, ou au rythme que tu choisis ») tient.

## État (19 nov., 12 h 26)
Les quatre bulles de « Nous faisons » validées par Grégoire de 12 h 15 à 12 h 25 (la bulle 3 dans ses trois formes, et les deux formes qui s'en déduisent). Relais remis à Grégoire à 12 h 27, pour une session du cloud après la release de midi (texte ci-dessous).

## Le relais (remis à Grégoire le 19 nov. à 12 h 27)

Mesuré par Cowork à 12 h 26 (`git ls-remote` et `fetch` depuis le cloud) : `origin/main` = `f6acc378`, encore 1.249.0 (ses deux derniers commits ne sont que des entrées de `RELAIS.md` pour `lot/journees-reprise`) : la release de midi n'est pas en ligne ; ni `lot/nous-faisons-classe` ni `lot/nous-faisons-recevoir` n'existent ; `origin/claude/ecstatic-brown-urn6v8` = `ebc9a9ad`. D'où le préalable et la base conditionnels. Texte remis, mot pour mot :

```
Pour Claude Code, à relayer : parcours 6 (« Mettre tes données à l'abri »), « Nous faisons » : les quatre bulles réécrites, avec les formes de la bulle 3 selon le chemin d'écriture. Session du cloud, à lancer APRÈS la mise en ligne du 19 nov. à midi.

Contexte. Les quatre bulles de la Pratique guidée (`ETAPES` de `js/parcours-donnees.js`) ont été réécrites avec Grégoire le 19 nov., de 12 h 15 à 12 h 25, dans la forme et le ton des « Nous faisons » des parcours 2 et 4 (relais du même jour, à 10 h 55 et 11 h 45). Les textes ci-dessous sont validés par lui mot pour mot : ce sont des mots d'enseignant. Un mot qui ne tient pas techniquement se signale au rapport ; il ne se remplace pas. Les motifs et les faits mesurés sont dans le document du Projet de Cowork, `claude/parcours-donnees-pratique-textes.md` ; ce relais porte tout ce qu'il te faut. La ligne du panneau (`LIGNE`), le refus sans trimestre réel (`REFUS_SANS_TRIMESTRE`), le haut du menu Codex sans codex et la garde de « Ouvrir un codex… » ne changent pas.

0. Préalable. Vérifie que la release du 19 nov. est publiée : la version de `origin/main` a dépassé 1.249.0 et `RELAIS.md` sur `main` dit la release en ligne (mesuré par Cowork à 12 h 26 : `origin/main` = `f6acc378`, encore 1.249.0 ; ses deux derniers commits ne sont que des entrées de `RELAIS.md` pour `lot/journees-reprise`). Sinon, arrête-toi et dis-le, sans rien créer. Branche : `lot/nous-faisons-donnees`. Point de départ : la tête de la branche « Nous faisons » la plus récente qui existe, `origin/lot/nous-faisons-recevoir` (parcours 4), sinon `origin/lot/nous-faisons-classe` (parcours 2), pour que les « Nous faisons » voyagent ensemble ; sinon `origin/claude/ecstatic-brown-urn6v8` (`ebc9a9ad` ou plus récent : la disposition des bulles du 18 nov., `poserConfirmation`, `secondeForme`). Dis au rapport laquelle, son commit, et si sa session avait poussé son rapport (mesuré à 12 h 26 : aucune des deux n'existe encore). Puis `git merge --no-ff origin/main` ; conflits tranchés en gardant les deux côtés, nommés au rapport. Le commit `4c36db4` (parcours rouverts sur la branche) reste : c'est un aperçu ; ajoute `donnees` à `PARCOURS_OUVERTS` dans un commit à part, SUR LA BRANCHE SEULEMENT, nommé au rapport comme un commit à annuler avant toute fusion. Ne fusionne rien vers `main` ni vers les branches « Nous faisons » des parcours 2 et 4. Écris d'abord la consigne `plans de travail/CONSIGNE-2026-11-19-nous-faisons-donnees.md`, mot pour mot depuis ce relais.

1. Trois mesures d'abord, au rapport avant tout code. (a) Un parcours peut-il partir en vue simple ? Là, le bouton de l'en-tête s'appelle « Sauvegarder » (`js/vue-simple.js` l. 268) et le menu n'offre ni « Mettre à jour le codex » ni « Ouvrir un codex… » (`index.html` l. 3800 à 3805) : les bulles 1, 2 et 4 y seraient fausses. Si oui, n'invente rien : dis-le, Cowork tranchera. (b) Lancé pendant que la démo est active, avec un trimestre réel : `lancer()` de ce parcours ne quitte pas la démo, contrairement à ceux des parcours 2 et 4 ; le codex écarte la démo (`_sansLeDemo`). Règle de Grégoire : démo et réel ne se mêlent jamais. Si le menu Codex écrit alors le vrai codex sans rien de la démo, rien à faire ; sinon, `lancer()` quitte la démo avant la bulle 1, avec le mécanisme des parcours 2 et 4 (décision de Cowork). (c) Avec quels boutons le moteur ferme ce parcours quand le parcours suivant (7, « Lire ta classe et intervenir ») est fermé ou n'a pas son « Nous faisons » ; la bulle 4 prévoit « Parcours suivant » et « Terminer », de même poids ; si le moteur ne peut offrir que « Terminer », sa consigne de fin suit ses boutons (`consigneDeLaFin`) : dis-le, n'invente rien.

2. La forme, pour les quatre bulles, avec les mécanismes qui existent déjà (le moteur, et ceux des lots des parcours 2 et 4 s'ils sont dans ta base), sans en inventer d'autres : `geste` et `texte` remplacés par des lignes (`lignes`) ; la confirmation « C'est fait : … » au-dessus du titre, en petit, à partir de la bulle 2, seulement si l'étape d'avant a été faite pendant ce passage (après « Reprendre », pas de confirmation : décision de Cowork, la même qu'aux parcours 2 et 4) ; PAS de phrase du lieu dans ce parcours (le bouton « Codex » est dans l'en-tête de toutes les pages ; le menu et l'aperçu s'ouvrent par-dessus) ; les explications sans marque (`note`) ; seuls les gestes marqués (flèche à faire, crochet fait) ; l'objectif à la bulle 1 et l'objectif atteint à la bulle 4, posés par le moteur depuis la définition (`objectif`, `objectifAtteint` sur `DEF`, qui n'en a pas aujourd'hui) ; la phrase de la poignée, posée par le moteur. À la bulle 4, la fin du moteur remplace le seul bouton « Terminer » primaire de l'étape (`terminer()` garde son ménage, le menu refermé, et l'état « fait » ; `sansSortie` et `surEchap` gardés). Titres, `avant`, `zones`, `contour`, `nommeLeContour`, `atteint`, la place de la bulle 3 (à droite de l'aperçu à partir de 1180 px, au-dessus des fenêtres, cédant la place aux fenêtres de dialogue) et le choix de sa phrase à l'entrée de l'étape (`Codex.cheminDeLaProchaineEcriture`) : inchangés. Notation : [C] confirmation, [E] explication, [G] geste ; le dernier [G] est la consigne (en gras) ; « ne se grise pas » : rien ne dit que le geste est fait.

Bulle 1, « Pourquoi un codex » :
Objectif : « À la fin de ce parcours, tu seras en mesure de mettre tes données à l'abri : ton codex à jour, rangé dans un lieu protégé. »
[E] « Tes données demeurent dans le navigateur de cet appareil : Labo Codex ne les envoie nulle part. »
[E] « Elles peuvent donc se perdre si tu effaces les données de sites, ou si tu changes de navigateur ou d'ordinateur. »
[E] « Ton codex en est une copie complète, productions de tes étudiant·es comprises, dans un seul fichier que tu rouvres sur n'importe quel appareil. »
[E] « Ce fichier ne change que quand tu le mets à jour : l'application ne le fait jamais à ta place. »
[G] « Touche « Codex », en haut de l'écran » (se grise quand le menu est ouvert)

Bulle 2, « Mettre à jour » :
[C] « C'est fait : le menu Codex est ouvert. »
[E] « Mettre ton codex à jour, c'est rassembler tes données et les fichiers des productions de tes étudiant·es en un seul fichier. »
[E] « Plus tu as importé de productions, plus il est lourd, et plus sa préparation peut prendre un moment. »
[E] « Refais ce geste chaque semaine, et après chaque travail important : une saisie de présences, une série d'évaluations. »
[G] « Touche « Mettre à jour le codex » »

Bulle 3, « Range ton fichier », le début commun aux formes :
[C] « C'est fait : l'aperçu de ton codex est ouvert. Rien n'est encore écrit. »
[E] « Le « i » de l'aperçu te dit ce que contient le fichier. »
[E] « Ton codex contient les noms, les DA et les productions de tes étudiant·es, et il n'est pas chiffré : quiconque a le fichier peut le lire. »
[E] « Sa place est dans un lieu protégé : une clé USB chiffrée, ou un dossier synchronisé avec un infonuage chiffré, protégé par un mot de passe solide et une double authentification. »
[E] « Ton appareil, lui, devrait avoir un mot de passe et un disque chiffré. »
[G] « Touche « Mettre à jour » » (se grise quand l'aperçu s'est refermé sur une écriture en cours, si tu peux le lire, `tentativeEnCours()` ; sinon ne se grise pas ; dis lequel)
Puis, selon le chemin :
`fenetre` : [G] « Dans la fenêtre qui te demande où l'enregistrer, choisis ta clé ou ton dossier synchronisé » ; puis [E], après la consigne : « Jusqu'à ce que tu recharges la page, chaque mise à jour réécrira ce même fichier, sans rien te demander. » Quand des copies manquent (#1012), la même bulle sans cette explication.
`tenu` : pas de second geste ; « Touche « Mettre à jour » » est la consigne, suivie de la même explication.
`partage` : [G] « Quand ton appareil te propose de partager le fichier, choisis de l'enregistrer, sur ta clé ou dans ton dossier synchronisé » ; rien après.
`telechargement` : [G] « Quand le fichier est dans tes téléchargements, réponds « Il y est », puis déplace-le sur ta clé ou dans ton dossier synchronisé » ; puis [E], après la consigne : « Chaque mise à jour t'en remettra un nouveau : c'est le plus récent qui compte. »
La dernière phrase d'aujourd'hui (`TEXTE_3_FIN`, « Quand le menu affiche « Ton codex est à jour », ta copie est faite. ») est retirée : elle devient la confirmation de la bulle 4. Mesure que la bulle, plus longue d'une confirmation et de deux gestes, tient à droite de l'aperçu à 1180 × 820 sans défiler ni rien couvrir ; sinon, dis ce que fait le moteur ; les mots ne changent pas.

Bulle 4, « Quand le rouvrir » :
[C] « C'est fait : ton codex est à jour. »
[E] « Ton codex te servira dans deux cas : pour travailler sur un autre appareil, ou pour retrouver tes données si ce navigateur les perd. »
[E] « Tu l'ouvriras alors par « Ouvrir un codex… », ici, dans le menu. »
[E] « Attention : ouvrir un codex remplace tout ce qui est dans l'application par le contenu du fichier. C'est donc toujours ton codex le plus récent qu'il faut ouvrir. »
[E] « Le haut du menu te dit où tu en es : « Ton codex est à jour », ou « Ton codex n'a pas tes derniers changements ». »
[E] « Et si tu oublies, le rappel « Mets ton codex à jour » reviendra toutes les deux semaines, ou au rythme que tu choisis. »
Puis la fin du moteur, dans son ordre : « Pour revoir une étape, touche « 4 sur 4 ». » ; l'objectif atteint entre deux filets : « Objectif atteint : tu es en mesure de mettre tes données à l'abri (ton codex à jour, rangé dans un lieu protégé). » ; « Chaque parcours a son objectif. C'est toi qui choisis la suite. » ; la consigne « Touche « Parcours suivant », ou « Terminer ». » ; les boutons « Parcours suivant » et « Terminer », de même poids.

3. Tests. La sentinelle `tests/unit/sentinelle-parcours-donnees-2026-11-09.test.js` confronte désormais les textes des bulles à la consigne du point 0 (la ligne du panneau, le refus, le haut du menu et le bloc du rappel restent confrontés à leur consigne du 8 nov.) ; son essai « aucun produit nommé » couvre les mots neufs. Le banc `tests/integration/parcours-6-donnees-a-l-abri-2026-11-09.spec.js` suit les nouveaux textes sans s'affaiblir (la garde de « Ouvrir un codex… », la bulle 3 à droite de l'aperçu, la bulle qui cède la place à « Il y est »). Un banc neuf vérifie, bulle par bulle, la confirmation (présente après une étape faite, absente après « Reprendre »), le classement geste ou explication, les formes de la bulle 3 (`fenetre`, avec et sans copies manquantes, `tenu`, `partage`, `telechargement`) et la fin (objectif atteint, boutons, consigne), avec break-test. Vitest complet ; Playwright Chromium sur les fichiers liés, 1180 × 820 et 820 × 1180 ; WebKit par GitHub au push. Jetons `?v=` neufs pour chaque fichier touché, d'une lettre que n'emploient pas les lots des parcours 2 et 4.

4. Porte terrain en markdown (`plans de travail/PORTES-TERRAIN-2026-11-19-nous-faisons-donnees.md`), règle 1 : aucune porte quand une machine peut répondre (la vraie feuille de partage de l'iPad et la vraie fenêtre de choix d'un ordinateur, que le banc remplace par des fausses, n'ont que la porte). Cowork la relira avant d'en publier l'artefact. Commit, push, PR d'aperçu titrée « APERÇU, ne pas fusionner ». Ni fusion ni release. Rapport `plans de travail/RAPPORT-2026-11-19-nous-faisons-donnees.md` : la base choisie, les trois mesures, les commits (celui qui ouvre le parcours sur la branche nommé à part), les bancs et leurs break-tests, toute supposition nommée, l'adresse de l'aperçu.
```

## Prochaine étape
Au rapport de la session : le lire, mesurer les textes contre ce document, trancher la mesure (a) si un parcours peut partir en vue simple, puis la porte avec Grégoire.

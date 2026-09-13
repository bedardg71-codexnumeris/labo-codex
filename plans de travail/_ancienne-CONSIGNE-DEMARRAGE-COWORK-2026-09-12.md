# Consigne de démarrage — la session Cowork qui prend le relais

> **Réécrite le samedi 12 septembre 2026 à 10 h 30 (Toronto)**, par la session Cowork du 12 (5 h 20 – 10 h 30), à la clôture d'une
> matinée de **trois versions** (`1.135.1`, `1.136.0`, `1.137.0`), **trois portes terrain relevées** et **dix items inscrits**.
> Elle REMPLACE toute version précédente.
>
> ▣ **MISE À JOUR DU 13 SEPTEMBRE, FIN DE MATINÉE (Cowork) — DEUX LOTS MENÉS DEPUIS LE TRI.** **Lot 1, « les jetons de reprise ne mentent plus » : LIVRÉ en 1.139.3** (quatre fiches taries ; la cinquième candidate, #721, sortie du lot avant codage parce qu'elle demandait un arbitrage de didactique — elle reste ouverte). Relecture croisée de Cowork sur `828618b1` : trois trous de preuve trouvés (une moitié de garde qu'aucun essai n'éprouvait, le déliement après écriture acceptée non prouvé, six assertions infalsifiables), **trois retouches appliquées en `1c17f5dd` avant la release**.
> ⚠ **HORS SÉQUENCE, ET À NE PAS PERDRE — #853 « permettre un délai sur une reprise ».** Née d'une question de pédagogie que la relecture du lot 1 avait trouvée « posée à Grégoire » sans être inscrite nulle part ; inscrite, puis tranchée par lui (« la question dépend de l'utilisateur, je ne veux pas imposer ma pratique à moi »). Codée sur `claude/853-delai-sur-reprise` (`5f388409`) et relue. **Le moteur est juste ; l'interface ment** : sur une pratique PAN-Spécifications née de l'assistant, la case s'affiche, se coche, s'enregistre — et `obtenirConfigJetons` ne la lit jamais (il prend `configuration.jetons` en premier, le bloc plat du formulaire n'est jamais consulté ; aucun masquage, aucun avertissement). État mesuré le 13 à 11 h : **la fiche est COCHÉE au BACKLOG (l. 666), le commit n'est PAS sur `main`, et le correctif d'interface demandé par la relecture n'est PAS fait.** #854, inscrite le même jour, reconnaît qu'elle « bloque en partie #853 ». Deux autres écarts de ce commit : la garde `=== true` qui porte toute la promesse « aucune pratique importée ne change en silence » n'est éprouvée par aucun essai, et trois des douze essais sont des recherches de chaînes dans le texte des fichiers, pas du comportement.
> ▣ **Lot 2, « la chaîne anti-cache dit la vérité sur ce qu'elle a vérifié »** (#675, #547 volet ouvert, #600, #826, #602 moitié lecture) : **consigne écrite, lot pas engagé**. Il ne touche que `scripts/` et `tests/` — aucun écran, aucun arbitrage. Sortis avant codage : #827 en entier et la moitié « poser les jetons » de #602.
> ▣ **Comptes refaits** : 239 cases ouvertes au BACKLOG, concordance exacte avec la trace `plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md`, qui porte désormais le **journal des lots** ; l'artefact « Tri du chantier Labo Codex » est republié avec les mêmes comptes.
> ⮕ **Leçon versée à la méthode** (les deux relectures l'ont montrée) : un essai peut passer POUR LA MAUVAISE RAISON — un autre garde-fou intercepte avant celui qu'on croit éprouver. Toute consigne de lot doit donc nommer, pour chaque correctif, **la mutation qui ISOLE** le contrôle neuf ; et un break-test se refait soi-même, il ne se croit pas sur parole.
> ▣ **NOTE DU 13 SEPTEMBRE 2026 (Cowork, matin) — LE CHANTIER EST TRIÉ.** Les **241 fiches encore ouvertes** du BACKLOG (242 cases `- [ ]` moins le gabarit de la section « Notes ») sont classées par **coût de preuve** et groupées par **point du code**. Deux livrables jumeaux : `plans de travail/TRI-2026-09-13-fiches-ouvertes-par-cout.md` (la TRACE, à commiter) et l'artefact « Tri du chantier Labo Codex » (l'OPÉRATION, filtrable par palier et par attente). Comptes : **48 rapides, 88 intermédiaires, 100 laborieuses**, 5 indécidables ; **79 fiches attendent un arbitrage de Grégoire**, dont 17 se règlent par une phrase, 24 à froid, 13 ouvrent un chantier. **22 lots** partagent un goulot de code.
> ⚠ **Correction de grille, par la mesure** : la grille arrêtée par Grégoire comptait « attend une décision de Grégoire » comme quatrième déclencheur du palier « laborieux ». Appliquée, elle mettait **134 fiches sur 241 (56 %) dans un seul panier** — dont **54 qui ne sont lourdes que par l'attente**, aucune par le code. « Décision » est donc sorti de l'axe du coût et devient un **second axe** : *qui doit parler en premier*.
> ⚠ **Ce que vaut ce tri** : le palier de chaque fiche est **lu dans la fiche**, pas mesuré dans le code. Contre-épreuve adverse sur huit fiches reprises au code : **trois cotes fausses** (#690 périmée depuis 1.110.0, #655 `L/stock` accordé sur une inférence → `I`, #595 recompté 70 noms / 242 usages / 28 fichiers → `L/multi`) et **un goulot faux** (#689 vit dans `js/cartouches.js`, pas `js/grilles.js`) — les quatre erreurs venaient de la fiche, aucune de la grille. Corrections appliquées dans la trace. **Bon pour composer un lot, insuffisant pour promettre un coût** : la première mesure d'un lot se refait à l'ouverture.
> ▣ **CONSIGNE DE GRÉGOIRE, 13 SEPT. (durable)** : pour le CHOIX des prochains lots, prendre ceux qui **ne lui demandent ni arbitrage ni vérification à l'écran chez lui** — il travaille en parallèle sur autre chose, son attention disponible est limitée. Ce qui attend une décision de sa part se garde pour un moment où il est disponible.
>
> ✅ **MISE À JOUR 11 h 52 : `1.138.0` POUSSÉE — `origin/main` = `61b5c883`.** Grégoire a fermé Cowork, le verdict Playwright local est vert sur
> ce SHA (11 h 51, 0 échec), et il a décidé le push à 11 h 52. Ton relevé partiel de la porte (11 h 38) est commité tel quel (`61b5c883`),
> AVANT le verdict, pour que le SHA poussé le porte. **À toi** : la relecture de `e239787f` (lot E) à froid — elle n'a pas été vue avant le push ;
> l'artefact jumeau de la porte (sept rangées ; 5, 6, 7 et § 3 dus sur le site).
> ▣ **MISE À JOUR 11 h 20 : lot E exécuté (`e239787f`) et `1.138.0` RELEASÉE (`a0ed0929`, build 0912-1116) — NON POUSSÉE.** À toi : relire
> `git show e239787f` — `js/navigation.js` (`_configurationVisible`, `_interventionsMasqueesSurService`, `_poserBoutonsSousNav`,
> `afficherSousNavigation` refactorisée sans changement de sortie, `rafraichirSousNavigationSelonContexte`) et `js/contexte.js` (l'appel dans
> `mettreAJourContexteEntete`) ; la sentinelle `sentinelle-onglet-interventions-masque-sur-service-lot-e` (vm, vrais fichiers). ⚠ **Ce que la
> mesure a corrigé** : ta consigne supposait que la sous-navigation se reconstruit à la bascule — elle ne se reconstruisait pas (seul appelant :
> `afficherSection`) ; d'où le rafraîchissement, qui ne déplace personne. **Écarté** : rediriger `suivi-interventions` vers Rencontres — les deux
> boutons du profil (`naviguerVersNouvelleIntervention` / `naviguerVersIntervention`) attendent `#conteneurPrincipal`, leur formulaire ne se
> serait plus ouvert ; ils ouvrent donc encore la vue Interventions sur un service (laissé exprès, nommé). Puis : **verdict Playwright, toi
> FERMÉ** (règle 8), `scripts/pousser.sh`, l'artefact de la porte (**sept** rangées).
> ▣ **MISE À JOUR 11 h : ta révision de 10 h 50 (lot D) est exécutée — commit `62f24316`, à relire AVEC `e011ed64`.** Le bloc « Tes prochains
> rendez-vous » est rendu par `afficherListeInterventions` (garde `_enVueRencontres() && _surService()`), **pas par `afficherRencontres`** :
> mesuré, `ouvrirIntervention` remplace le conteneur et le retour (comme Enregistrer / Annuler / Supprimer) ne reconstruit que la liste — le bloc
> y aurait disparu ; `rencontres.js` n'est pas touché. Sans aucune rencontre : pas de bloc (la phrase arrêtée serait fausse sous une liste vide).
> `_formeRencontre` lit VOCABULAIRES.rencontres (le badge de la liste écrivait les deux mots une seconde fois). À relire aussi :
> `tests/unit/_helpers/bac-suivi.js` (fournit `dateLocaleYMD` aux modules). Changelog : quatre items. Porte : **six** rangées.
> ▣ **NOTE DU 12 SEPTEMBRE, 10 h 55 (Claude Code, exécution de ta consigne du jour, 10 h 25 révisée à 10 h 35).** **Lots A, B et C livrés**
> en un commit de code sur `main` local, **`e011ed64`** — **ni releasé, ni poussé** : ta consigne (§ 5) veut la release `minor` `1.138.0`
> APRÈS ta relecture croisée. **À toi** : relire `git show e011ed64` — `js/accueil.js` (la carte, le bandeau), le CSS de `.accueil-porte-ortho`
> (`index.html`) et la règle « mode clair » (`styles.css`) ; `js/mots-nature.js` (deux clés retirées), `trimestre-v2.js`, l'orchestre
> (`OPTIONS_VIDES`) ; `js/interventions.js` (le masque `_surService()` autour de la carte, la garde de `sauvegarderPresencesIntervention`,
> `VOCABULAIRES.rencontres.aideBilan`) ; les deux sentinelles neuves. Puis la session Claude Code suivante : `node scripts/release.mjs minor`,
> commit, Vitest, verdict Playwright (**toi fermé**, règle 8), `scripts/pousser.sh`. Changelog écrit (entrée 1.138, trois items).
> **Puis l'artefact jumeau** de `plans de travail/PORTES-TERRAIN-2026-09-12-accueil.md` (cinq rangées, deux décisions au § 3 avec champ de saisie).
> ⚠ **Ce que la mesure a corrigé ou ajouté** : (1) **`objectifVise`** : la conséquence 1 ne nommait que `criteresCibles`, mais l'objectif vit
> dans la même carte et s'écrivait `''` quand son champ manque — garde étendue, verrouillée ; (2) « Commencer → » ne mène aux trois questions
> que **sans trimestre** — sur un groupe-cours d'enseignement, à la porte « Créer un service » (porte, rangée 2) ; (3) **#847 était déjà pris
> par toi** (les exemples gris) quand j'ai voulu inscrire ma trouvaille : elle est **#848** (deux autres libellés du même cas que #846, dont la
> phrase des éléments obligatoires, liée au cours CHOISI par `_coursSelectionneEstServiceV2` — comportement, remonté au § 3.1 de la porte).
> **Le relevé de la porte de la section Cours est inscrit** dans son markdown (6/7 ; 3.1-3.3 « tel quel »). `CONSIGNE-DU-JOUR.md` commitée avec
> le lot (condition 2) ; ses trois archives, `Formation/`, `docs/orthopedagogie/` et la capture du 9 sept. supprimée : non commités, à Grégoire.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Il ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû, et les erreurs déjà payées. Ce qui a survécu à trois
> sessions monte dans `PROTOCOLE.md` et quitte ce fichier.

---

## 1 · CE QUE TU ES, ET CE QUE TU N'ES PAS

**Le dispositif est à trois, et les canaux ne se croisent pas.** Grégoire décide, relaie, et fait tourner l'application sur ses vraies
données. **Toi, Cowork** : tu **mesures** le dépôt en lecture seule, tu **rédiges** les consignes, tu **relis** ce qui ne se reprend pas,
tu publies les artefacts des portes et tu tiens ses fichiers de cadrage.

⛔ **TU NE PARLES PAS À CLAUDE CODE.** Une consigne va dans un FICHIER (`plans de travail/CONSIGNE-DU-JOUR.md`, l'ancienne archivée
`_ancienne-CONSIGNE-DU-JOUR-<date>-<sujet>.md`) et Grégoire ne colle qu'une ligne, dans un **bloc de code** du message — jamais dans un
artefact, jamais avec des retours à la ligne manuels. **Au-dessus du bloc, une ou deux phrases disent ce que la consigne va produire à
l'écran.**

⚠⚠ **NOUVEAU, 12 sept. : TU NE VOIS PAS LE CANAL ENTRE GRÉGOIRE ET CLAUDE CODE.** Il lui écrit directement, et il change d'avis. Devant
un écart entre ce que tu as relayé et ce que le dépôt porte, **la première hypothèse est « il a tranché autrement depuis », pas « le
relais a échoué »** — et ça se demande en une ligne au lieu de s'affirmer. Erreur payée ce matin : Cowork a écrit un patch pour
« réparer » une décision que Grégoire avait lui-même révoquée.

⚠ **TU N'ÉCRIS PAS DANS `js/`.** Un fichier temporaire va dans `$HOME`. ⚠ **`git --no-optional-locks status`**, jamais `git status` nu.
⚠ **Ce shell n'a pas de réseau** : `origin/main` est la dernière valeur connue de ce Mac. ⚠ **L'horloge du montage est en UTC** : toute
heure s'écrit après `TZ=America/Toronto date`, dans la même commande que l'écriture.
⚠ **Le PNG supprimé dans l'arbre** (`Retours des testeurs/grégoire/BUG_…journal-de-bord-sans-fond.png`, `D` non commis) est à Grégoire :
ne le commets pas, ne le restaure pas.

---

## 2 · À LIRE D'ABORD, DANS CET ORDRE

1. **`OU-EN-EST-ON.md`**, sa tête — où on en est, en gestes d'utilisateur.
2. **`PROTOCOLE.md`** — les huit règles, dont la 6 (ce que tu fais à l'ouverture) et la 8 (verdict Playwright, Cowork fermé).
3. **`plans de travail/CONSIGNE-DU-JOUR.md`** — l'accueil et #846, écrite à 10 h 25. **Si Claude Code ne l'a pas exécutée, redonne la
   ligne** ; s'il l'a fait, relis son commit (§ 4).
4. **`plans de travail/CADRAGE-2026-09-11-rencontres-l-orthopedagogue-entre-par-suivi.md`** — le chantier de la semaine, et les décisions
   de Grégoire dans ses mots.
5. **`BACKLOG.md`**, l'en-tête et les items **#836 à #846** seulement.

⛔ **Ne lis PAS les 150 autres fichiers de `plans de travail/`.**

---

## 3 · L'ÉTAT MESURÉ — le 12 septembre 2026 à 10 h 19 (Toronto), depuis le Mac, en lecture seule

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -3` · `git rev-list --count origin/main..HEAD`
· `git --no-optional-locks status --porcelain` · `TZ=America/Toronto date`.

- **`1.137.0`, build `0912-0935`**, `main` = `origin/main` = `305bb4c8`, **`rev-list` = 0**. Tout est en ligne.
- **Trois versions ce matin, les trois vues par lui** : `1.135.1` (dans un service, un élève appartient par son service — porte
  « Rencontres » 17/17) ; `1.136.0` (les étiquettes Enseignement / Orthopédagogie, point unique `js/mots-nature.js` — porte 11/12) ;
  `1.137.0` (la section « Cours et services » suit la nature, et la phrase des éléments obligatoires ne contredit plus le champ de
  l'horaire — porte 6/7).
- **Dix items inscrits** : #837 à #846. Les deux rouges à connaître : **#844** (une fiche de service est indélébile par les gestes de
  l'app — une capture hebdomadaire VIDE bloque le garde, aucun écran ne la retire ; vécu par Grégoire sur ses données réelles) et
  **#845** (`db.remove()` ne vide pas le cache mémoire : la clé supprimée continue d'être lue jusqu'au rechargement).
- **Non commis, de Cowork (10 h 30)** : `BACKLOG.md` (#844, #845, #846), la consigne du jour et ses archives. **La consigne du jour dit
  à Claude Code de les commettre.** Dans `docs/orthopedagogie/`, quatre brouillons de Cowork pour l'orthopédagogue, non commités exprès.
- **Console « Les huit gestes »** : à remettre à jour au prochain relevé.

---

## 4 · CE QUI EST DÛ — dans l'ordre

**a) À l'ouverture (règle 6)** : remesurer. Si `1.138.0` est livré, **relire le commit** (garde posée sur le contexte et jamais l'inverse ;
aucune valeur bougée au harnais ; les mots viennent d'un seul endroit), puis publier l'artefact de la porte
(`PORTES-TERRAIN-2026-09-12-accueil.md`, quatre rangées), attendre le relevé, verser les échecs au backlog. Si rien n'est livré :
redonner la ligne avec sa phrase d'écran.

**b) Les deux textes pour l'orthopédagogue** — `docs/orthopedagogie/2026-09-12 Pour elle — …(BROUILLON).md`, écrits et corrigés par
Grégoire. ⚠ **Ils citent des mots de l'écran, et l'écran a changé trois fois ce matin.** Avant qu'il les lui envoie : **relire chaque mot
cité contre l'application livrée**, pas contre les consignes. Puis retirer « BROUILLON » du nom.

**c) La date qui compte : LUNDI 14** — l'orthopédagogue ouvre l'application sur son poste. Elle n'aura ni tes yeux ni les siens :
ce qui casse chez elle se saura par un courriel, pas par une porte. **Et mardi, la communauté de pratique (une vingtaine) découvre
l'accueil neuf.**

**d) Ce qui attend son mois d'usage, et ne se rouvre pas avant** : #836 (tout est manuel pour un mois), #839 (un service ne devrait pas
produire de note), #840 (le second axe du partage), #838 (un élève dans deux cours). C'est sa règle du 11 ; ne propose pas de les
avancer.

---

## 5 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

*Ce ne sont pas des préférences de style. Ce sont les conditions pour qu'il puisse décider.*

- ⚠⚠ **Ce qui le met en surcharge n'est PAS la quantité de travail d'une séance, c'est la quantité d'information par TOUR.** Une séance
  peut avoir quarante tours et quatre lots ; **chaque tour n'a qu'un objet**.
- **UNE SEULE IDÉE PAR RÉPONSE.** ⚠ C'est la règle qui se perd en session longue — **revérifie-la avant chaque réponse.**
- **Pose ta question au moment où elle se pose**, et **ne reviens jamais trois tours plus tard** sur un item présenté avant.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. **Propose-lui un texte à corriger** plutôt que de lui
  demander d'en composer un. Tutoiement, guillemets français, réponse courte d'abord.
- **Les corrections se font le jour même**, pas après le 14.
- ⚠ **Il corrige bien, et souvent contre toi** — quatre fois ce matin, dont deux où il avait raison sur le fond (le mot « Accompagnement »,
  les irritants qu'on ne nomme pas sur un écran public). **Quand il propose un mot, cherche d'abord ce qui le rend juste, puis mesure
  ce qui le rend faux.** Les deux fois où Cowork l'a contredit utilement, c'était sur une **mesure** (une collision de nom, une date qui
  n'est pas celle qu'on croit), jamais sur un goût.

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.**

---

## 6 · LES ERREURS QUE COWORK A PAYÉES LE 12 SEPTEMBRE — ne les refais pas

Six en cinq heures, toutes de la même famille : **écrire à partir de la consigne plutôt qu'à partir de la mesure.**

1. **Une porte qui met une saisie multiligne en enfilade dans une phrase.** La rangée 9 de « Rencontres » demandait trois lignes,
   séparées par des virgules dans le texte. Grégoire les a collées **en une seule ligne** ; la lecture a fabriqué **un élève fantôme**
   (DA « Léa Tremblay, 1234567 », groupe « Gagnon »). Une heure perdue à chercher un défaut qui n'existait pas. ⮕ **Une saisie sur
   plusieurs lignes se montre EMPILÉE dans un bloc**, jamais dans une phrase.
2. **Une porte qui décrit un geste que l'application n'offre pas.** La rangée 2 de la section Cours disait « clique Modifier, puis
   Dupliquer » : ces deux boutons **n'existent pas** (le code garde même deux références mortes vers eux). ⮕ **Une porte se relit contre
   l'ÉCRAN, pas contre la consigne qui l'a produite.**
3. **Une relecture croisée qui vérifie le contenu d'une fonction sans vérifier qu'elle a un appelant.** Cowork a validé le lot des
   étiquettes en suivant la chaîne d'`appliquerMotsNatureCadre`, et n'a pas vu que `peuplerDropdownEnseignants`, qui posait l'autre
   moitié des mots, **n'était appelée de nulle part**. C'est la rangée 5 qui l'a trouvé. ⮕ **Dans une relecture, une fonction qui pose un
   mot se vérifie par son APPELANT.** Un `grep` de trois secondes.
4. **Une consigne qui annonce un défaut à deux sites sans avoir mesuré le second.** `obtenirDonneesSelonMode` ne comparait le groupe
   qu'aux fiches sans `coursId` : la garde qu'on y demandait était inatteignable, et le break-test l'a dit (0 rouge). ⮕ **Un site nommé
   dans une consigne se mesure, sinon il se nomme comme hypothèse.**
5. **Un libellé qu'on fait suivre au contexte actif alors qu'il nomme un CHOIX** (#846) : le champ 2 du groupe-cours dit « Service
   d'orthopédagogie » et liste tous les cours. ⮕ **Avant de faire suivre un mot au contexte, demande-toi de quoi ce mot parle** : de là
   où on est, ou de ce qu'on peut choisir ?
6. **Une accusation de relais raté** — voir § 1.

### Ce qui a tenu, et qu'il faut refaire
- **Mesurer avant de cadrer** : trois fois ce matin, ce que la consigne s'apprêtait à demander **existait déjà** (le tri des champs du
  formulaire de service, livré la veille) ou était **faux** (le second site du filtre). Le motif « ça existe déjà » en est à sa
  quatorzième occurrence.
- **Nommer une supposition plutôt que la taire** : les cinq fois où Cowork l'a fait, la correction a coûté dix secondes.
- **Une sonde en console plutôt qu'une hypothèse** : la liste vide du matin a été tranchée par six lignes de sortie, pas par un
  raisonnement.
- **Refuser un mot sur une mesure** : « Accompagnement » écarté parce que c'est déjà le nom d'une section du profil ; la sarcelle
  écartée parce que c'est la palette du mode démonstration. Dans les deux cas, Grégoire a suivi — parce que la raison était mesurée.

# Plan — le matériel semé, et le chemin d'entrée d'un nouvel enseignant

> Écrit le **1er septembre 2026** depuis Cowork, avec Grégoire, à partir d'une
> mesure du chemin d'entrée faite le même jour (lecture de code, aucun passage
> fonctionnel).
>
> **Le problème, dans ses mots** : « il y a des documents semés complètement
> inutiles, qui reviennent comme des zombies quand je les supprime. Retirons le
> matériel fictif, et créons plutôt des documents génériques réels sur lesquels
> les enseignants pourront bâtir. »

---

## 0. LES DEUX NOMBRES QUI ONT DÉCLENCHÉ CE PLAN

Entre un espace de travail vide et une première production évaluée :

- **88 gestes obligatoires**, sur **11 formulaires**, si tout est construit à la
  main (67 si la cartouche passe par le modèle Markdown, qui existe déjà) ;
- **48 gestes**, sur **7 formulaires**, en partant de ce que l'application sème
  déjà toute seule.

**L'écart entre les deux, c'est ce plan.**

---

## 1. ✅ LIVRÉ — LE DÉFAUT QUI DEVAIT PARTIR EN PREMIER

*↻ 1er septembre 2026. Le versement est retiré ; les données déjà en place ne
sont pas touchées, et c'est délibéré — voir « ce que le retrait ne fait pas ».*

**Les huit échelles « disciplinaires » de la bibliothèque produisaient une note
de zéro, sans un mot.**

`js/echelles-bibliotheque.js:115-160` livre huit échelles — Chimie, Info, Bio,
Philo ×2, Littérature, Admin, Géo. Leurs **32 niveaux portent `valeur:` au lieu
de `valeurCalcul:`**. Conséquence, lue dans le code : `valeurNumeriqueDuNiveau`
rend `null` (`echelles.js:3739-3778`, le repli milieu-de-plage ayant été retiré
par #527) → tous les critères sont exclus → `ponderationTotal = 0` → **note
affichée 0,0, niveau `--`, aucun message.**

⮕ Un enseignant de chimie qui fait la chose sensée — ouvrir la bibliothèque,
prendre l'échelle « Chimie » — obtient **zéro à sa première évaluation**.

**Décision de Grégoire : on les RETIRE, on ne les répare pas.** Ce sont
exactement le « matériel fictif qu'on croit utile dans d'autres disciplines
alors qu'il ne l'est pas ».

### Ce qui a été fait, et ce qui ne l'a pas été

✅ **La SOURCE est tarie.** `migrerEchellesColleguesVersBibliotheque` est retirée
avec ses huit définitions, et son appel dans `initialiserModuleEchelles` avec
elle. Plus aucun chemin du code ne sème ces échelles : **un nouvel utilisateur ne
les recevra jamais.** Quatre assertions le verrouillent (`sentinelle-464-cles-nues`),
et le break-test a rendu trois rouges sur trois sujets distincts.

⛔ **AUCUNE DONNÉE N'EST TOUCHÉE, et c'est délibéré.** Chez qui a déjà lancé
l'application, le drapeau `migration_echelles_collegues_biblio_done` est posé et
les huit échelles vivent dans `bibliothequeEchelles` — ce sont des données
utilisateur depuis #464/D2. Les supprimer serait détruire ce que Grégoire n'a pas
demandé de détruire, et le moratoire à trois gestes vaut ici comme ailleurs.

⚠ **Leurs identifiants RESTENT dans `IDS_GABARITS_HARDCODES`.** C'est cette liste
qui fait poser un tombstone à la suppression : sans elle, l'utilisateur qui
supprime son échelle « Chimie » la reverrait au prochain import. Un retrait de
semis n'emporte pas la durabilité d'une suppression.

### ⏳ LE GESTE QUI RESTE À GRÉGOIRE — la mesure que le code ne peut pas faire

Le plan demandait de mesurer avant de retirer : *quelqu'un a-t-il déjà importé
une de ces échelles ?* Cette mesure porte sur des données réelles, dans son
navigateur. Elle est maintenant **outillée** :

```js
await _sonderEchellesDisciplinaires()
```

Lecture seule, aucune écriture — c'est vérifié par une assertion, pas promis.
Elle rend, pour les huit identifiants : ce qui reste dans `bibliothequeEchelles`,
les copies présentes dans chaque `<trim>_echellesTemplates`, combien de leurs
niveaux sont MUETS, et **combien d'évaluations et de productions les désignent**.
C'est ce dernier chiffre qui dit si le sujet est théorique ou s'il touche du
travail réel.

⚠ Elle complète `_sonder574()` plutôt qu'elle ne la répète : celle-là ne connaît
que `ECHELLE_GENERIQUE` et les `GABARIT_ECHELLE_*`, et ne regarde pas la
bibliothèque partagée. Les huit-ci lui étaient **invisibles**.

✅ **ELLE A TOURNÉ, le 1er septembre.** **Zéro dans la bibliothèque, zéro copie
dans les trois trimestres, zéro usage** — et le zéro porte son témoin : 3
trimestres et la bibliothèque partagée réellement lus. Rien à décider sur ses
données.

⚠⚠ **MAIS CE ZÉRO NE COUVRE QUE SON CORPUS, et c'est le corollaire qui compte.**
Un enseignant qui a ouvert l'application avant aujourd'hui a pu ajouter l'échelle
« Chimie » à sa sélection : sa copie reste muette et rend 0,0 % sans un mot. Il
n'est ni sondable, ni joignable, et **on ne sait pas combien ils sont**.
⮕ **#674 est le seul filet qui atteint ces gens-là.** Ce n'est plus une
prévention pour la cohorte : c'est une réparation pour des utilisateurs déjà en
place. Ça change son poids, pas seulement son rang.

### ⚰ S'AJOUTE AU §1 — `js/spe-specifications.js` retiré *(#681)*

*Même chantier : retirer le matériel fictif. Décidé par Grégoire le 1er septembre.*

1009 lignes du 2 janvier 2026 qui semaient cinq objets signés « Labo Codex » —
une échelle, trois gabarits de grille, une production — dans les listes d'un
nouvel enseignant. **Geste 2 de la ligne d'arrivée.**

⛔ **CE QUI N'EST PAS TOUCHÉ.** La pratique de notation PAR SPÉCIFICATIONS reste,
comme celle par standards : elles sont codées et configurables dans le système de
pratiques. `js/pratiques/pratique-pan-specifications.js` et l'écran
`mat-config-pan-specifications` d'`index.html` sont intacts, et une assertion les
garde — pour qu'un retrait « de cohérence » ne les emporte pas plus tard.

▣ **LA MESURE, faite avant de couper — c'est la partie qui comptait.** 24 symboles
exposés sur `window`, 786 fichiers balayés (`js/`, `tests/`, `scripts/`,
`index.html`), commentaires retirés avant lecture :

| | |
|---|---|
| symboles sans AUCUN usage hors du module | **23 sur 24** |
| le 24e (`creerEchelleSPESiInexistante`) | cité comme CHAÎNE dans `sentinelle-599`, un banc qui surveillait le fichier — pas un consommateur métier |
| l'unique « SPE » de `main.js` | `GABARIT_GRILLE_CHECKLIST_SPE`, identifiant d'un gabarit de GRILLE — aucun rapport |
| `index.html` | la balise `<script>`, plus deux textes décrivant la PRATIQUE |
| appels dynamiques `window[nom]` | les 3 `data-action` du module pointaient vers ses propres fonctions, dans du HTML qu'il générait lui-même |
| les 5 identifiants semés | cités **nulle part** ailleurs |

⮕ **Zéro consommateur vivant.** Et le module ne démarrait que par lui-même :
`DOMContentLoaded`, un `setTimeout(100)`, `window.onload` + `setTimeout(500)`.
Personne ne l'appelait — il s'appelait.

✅ **VÉRIFIÉ À L'ÉCRAN.** Grégoire a supprimé les cinq gabarits `[SPE]` depuis la
bibliothèque et **rechargé deux fois : aucun retour.** Le semis est mort dans les
données comme dans le code — et c'était le symptôme d'origine de ce plan, « des
documents qui reviennent comme des zombies quand je les supprime ».
⚠ Ces cinq-là n'avaient AUCUN tombstone, contrairement aux huit échelles : rien
ne rendait leur suppression durable. La question s'éteint avec le semis.

✅ **LA SONDE A TOURNÉ** : les cinq objets présents, **zéro référence, tous
LIBRES**, 15 clés ouvertes. Rien de ce qui est parti ne portait la trace d'un
jugement posé — c'est ce qui a permis de supprimer sans arbitrage.

⚠ **L'INVITATION, ELLE, A RATÉ.** `await nettoyage681()` a rendu `ReferenceError`
au premier essai : l'étape 2 avait voyagé sans l'étape 1. La consigne était dans
l'en-tête du fichier et elle était bonne — **elle n'a pas voyagé avec
l'invitation.** ⮕ Une invitation à lancer une sonde porte désormais les trois
gestes, dont `pbcopy < ~/…/scripts/<fichier>`, et nomme l'asymétrie :
`_sonderEchellesDisciplinaires()` vit dans un fichier qu'`index.html` CHARGE — un
appel suffit, sans rien coller ; `nettoyage681()` non. **Deux sondes du même
jour, deux gestes différents.**

---

## 2. ✅ LIVRÉ — SEMER LE TRIPTYQUE : grille, échelle, cartouche

*↻ 1er septembre 2026. L'échelle manquante est semée, et la chaîne complète a été
mesurée de bout en bout.*

**`assurerEchelleIdmeDeDepart`** (`js/echelles.js`) sème `ECHELLE_IDME_DEPART`
dans le trimestre actif, sous la même garde archivé et la même garde anti-clé-nue
(#358) que `assurerGrilleGenerique`, et **par la file** (#599) — deux boots
concurrents sèmeraient sinon deux fois.

▣ **CE QUI A ÉTÉ MESURÉ, ET QUI EST LA SEULE QUESTION QUI COMPTE** : avec ce que
l'application sème toute seule et **sans rien créer**, une première évaluation
produit-elle une note ? Spec WebKit `triptyque-seme-produit-une-note.spec.js` —
espace vide, grille générique + échelle semée, « Maîtrisé » coché sur les quatre
critères ⮕ **79,5 % · niveau M**. Le banc n'exige pas « quelque chose de non
nul » : il exige **la valeur ponctuelle exacte du niveau coché**, sans quoi un
chiffre venu d'ailleurs passerait.

▣ **ET UN TÉMOIN NÉGATIF, dans le même fichier** : la même chaîne, sur une échelle
à `valeur:` (la forme des huit retirées au §1), rend **`0.0 %` · `--`**. Sans lui,
le 79,5 % n'exclurait rien. ⚠ Ce témoin documente un défaut **qui existe encore**
— le silence est #674. Le jour où #674 sera livré, ce test rougira : ce sera la
bonne nouvelle, et il faudra le corriger, pas élargir sa tolérance.

▣ **Décisions prises en écrivant, et pourquoi.**
· **Identifiant NEUF**, jamais `ECHELLE_GENERIQUE` : le réutiliser ferait se
  confondre l'échelle semée avec les copies CASSÉES encore présentes chez qui l'a
  connue — la collision d'identité de #524, rejouée.
· **`ECHELLE_IDME_DEPART` entre dans `IDS_GABARITS_HARDCODES`** : sans son id
  dans cette liste, l'utilisateur qui la supprime la reverrait au boot suivant, et
  l'énoncé 8 (« ce qu'un utilisateur détruit, il l'a voulu ») serait faux.
· **Les niveaux sont une copie PROFONDE de `niveauxDefaut`**, la forme canonique
  du module. Aucune valeur n'est inventée, et une modification de l'utilisateur ne
  peut pas remonter dans la constante que douze lecteurs partagent — un test le
  vérifie en saccageant la copie puis en resemant.
· **Le paragraphe de garde est écrit DANS le code**, comme ce plan l'exigeait,
  et une assertion vérifie qu'il y est encore.

▣ **Deux ratchets voisins ont vu passer ce lot, et ils ont bien travaillé** :
`sentinelle-522-lot2b` (24 → 25 écritures par la file : le semis en ajoute une, et
elle respecte la règle) et `sentinelle-599` (3 → 2 dans `echelles-bibliotheque.js` :
le versement retiré emportait une écriture). Les deux comptes sont mis à jour
**avec leur motif**, pas silencieusement.

---

### Ce qui suit — l'état des lieux qui a mené à ce semis


### Ce qui est déjà semé (et fonctionne)

- `GRILLE_GENERIQUE`, 4 critères — `grilles.js:1499-1512`
- `CART_GENERIQUE`, 16 commentaires — `cartouches.js:171-210`

Les deux sont semées automatiquement dès qu'un trimestre existe.
⚠ **Mais rien à l'écran ne dit qu'on peut évaluer avec elles telles quelles.**
Elles portent « (exemple) » et se noient dans la liste.

### Ce qui manque — et c'est le seul trou dur

**Aucune échelle n'est semée.** `assurerEchelleGenerique` a été **retirée par
#574/#578**, et `GABARITS_ECHELLES_DEFAUT` avec elle (`gabarits-utils.js:284-290`).
C'est la seule pièce du triptyque que rien de livré ne remplace, et sans échelle
`calculerNote` sort en silence (`evaluation-calcul.js:779-789` — le commentaire
dit lui-même « on dégrade SILENCIEUSEMENT »).

### ✅ LE MOTIF DU RETRAIT A ÉTÉ LU — et il ne s'oppose PAS au semis

*Mesuré le 1er septembre 2026. Ce paragraphe remplace un blocage qui n'existe pas.*

**#574 n'interdisait pas de semer une échelle. Il interdisait de semer une
échelle SANS valeurs exploitables.** L'ancienne `ECHELLE_GENERIQUE` portait
`valeur: 45/67/82/95` et **jamais `valeurCalcul`** — exactement le défaut des huit
échelles de bibliothèque du §1. Depuis #527, elle rendait donc toute évaluation
non calculable.

Motif cité, `BACKLOG.md:3799` : « *ARBITRÉ PAR GRÉGOIRE le 28 août — option B :
les RETIRER. N'offrir que des échelles que l'utilisateur complète, plutôt que de
leur donner des `valeurCalcul` choisies par le projet.* » Et la pierre tombale de
`echelles.js:487-497` dit la même chose : poser des valeurs à la place de
l'enseignant « refabriquerait l'arbitrage pédagogique » que #526/#527 ont supprimé.

⮕ **Ni la base d'utilisateurs, ni la pollution des données, ni un conflit avec le
dé-codage-en-dur du SOLO n'ont été invoqués.** Vérifié : aucune occurrence.

**Et Grégoire avait déjà tranché, par écrit, le 26 août** (`BACKLOG.md:2075-2081`,
règle posée pour #529) :

> « **SEEDER est permis** : livrer IDME comme valeur de départ, modifiable, dans
> les données. C'est une commodité d'accueil, pas une contrainte. **CODER EN DUR
> est interdit** : inscrire les codes ou les noms dans la LOGIQUE. »

⮕ **Semer une échelle IDME MUNIE de `valeurCalcul` n'est donc pas un
renversement de #574 — c'est son application.** Ce que #574 refuse, c'est
précisément ce qui avait été retiré : une échelle qui échoue en silence.

⚠ **La seule contrainte qui survit** : les `valeurCalcul` de l'échelle semée
doivent être **modifiables et présentées comme un point de départ**, jamais
comme une norme du projet. Le prix nommé dans l'item — « au prix du démarrage
rapide » — est exactement ce que la cohorte de mi-septembre rend exigible.

### L'échelle à semer — décidée par Grégoire le 1er septembre

**IDME** : Insuffisant · En développement · Maîtrisé · Étendu.

Deux motifs, et le second est le sien :

1. **L'application la suppose déjà.** I/D/M/E est le repli codé en dur de
   `evaluation-chargement.js:1113-1121` quand aucune échelle n'est trouvée. La
   semer ne fait qu'expliciter ce que le code fait déjà en cachette.
2. **Elle introduit la taxonomie SOLO et rend le dépistage possible** — ce que
   l'application a de singulier. Une échelle neutre priverait le nouvel
   utilisateur de la porte d'entrée vers ce qui la distingue.

### ⚠⚠ LA CONTRADICTION APPARENTE À VERROUILLER

Une session qui lit ces deux faits — « le SOLO codé en dur a été retiré du
dépistage cet été » et « on sème une échelle SOLO » — peut conclure à une
incohérence et **défaire le semis en croyant bien faire**.

**Ce n'est pas une contradiction. Retirer le code en dur n'est pas retirer la
proposition.** Le dépistage ne doit plus *exiger* SOLO ; l'échelle semée le
*propose*, et l'enseignant la remplace s'il veut. C'est la différence entre
« imposé par le code » et « offert par défaut », et c'est toute la doctrine du
chantier de l'été.

⮕ **Écrire ce paragraphe dans le code, à côté du semis.**

---

## 3. ✅ LIVRÉ — QUE LE MATÉRIEL SEMÉ SE DISE UTILISABLE

*↻ 1er septembre 2026. Livré, avec une porte terrain qui reste due : un lot de
libellés ne se prouve pas par un banc vert.*

Le geste : que les trois pièces se présentent comme **un point de départ prêt à
l'emploi**, et qu'on puisse évaluer avec elles sans rien créer.

| avant | après |
|---|---|
| Grille générique (exemple) | **Grille de départ** |
| Cartouche générique (exemple) | **Cartouche de départ** |
| Échelle IDME (point de départ) | **Échelle de départ (IDME)** |

⮕ Le mot **« de départ »** relie désormais les trois : dans une liste, elles se
reconnaissent comme un ensemble. « Générique » était froid, et « (exemple) »
disait « ceci ILLUSTRE » à qui avait besoin de lire « ceci SERT ».

### ⚠ CE QUE LA MESURE A CHANGÉ AU PLAN — deux fois

**1. Les descriptions ne servaient à rien pour ce lot.** Le §3 supposait qu'on
réécrirait libellés *et* descriptions. Mesuré sous WebKit : la `description`
d'une grille, d'une échelle ou d'une cartouche **n'est affichée dans AUCUNE
liste**. Seul le NOM est visible, dans les `<select>` de l'écran d'évaluation.
⮕ Tout le message devait tenir dans le nom. Les descriptions ont quand même été
reprises, mais pour une autre raison : elles **s'impriment sur les PDF de la
grille**, et « Modifie ou duplique selon tes besoins » y était une consigne
d'écran égarée dans un document.

**2. ⚠⚠ LE NOM DE LA GRILLE VOYAGE JUSQU'À L'ÉLÈVE, et le plan l'ignorait.**
`travaux-export-pdf.js` imprime « Évaluation : <nom de la grille> » sur le
document remis, depuis `evaluation.grilleNom`. **Un élève lisait donc le mot
« exemple » sur son propre travail.** C'est devenu la première raison de ce
changement, avant le confort du nouvel enseignant.
⮕ Et ça déplace une frontière : « les libellés sont des mots d'enseignants »
était vrai pour l'échelle et la cartouche (vérifié : leurs noms ne sortent nulle
part vers l'élève), **faux pour la grille**. Le nom retenu est digne des deux
contextes, mais il reste **à valider par Grégoire** — c'est un mot que ses élèves
lisent (porte terrain §3).

### ⚠ L'EFFET DE BORD NEUTRALISÉ — sans quoi ce lot n'était pas un lot de libellés

`estRessourceDemo` (`import-export.js`) exclut des exports tout ce dont le NOM
contient « exemple » ou « grille générique ». **Renommer aurait donc fait entrer
la grille et la cartouche semées dans les exports — en silence.** Un lot annoncé
comme « des libellés et de la présentation » aurait changé ce qui voyage.

⮕ L'exclusion est désormais ancrée sur les **identifiants**, qui ne bougent pas
quand le vocabulaire bouge. Comportement rigoureusement inchangé pour la grille
et la cartouche. Seule `ECHELLE_IDME_DEPART` est nouvellement reconnue : son nom
n'a jamais porté ces mots, elle échappait au filtre que ses deux sœurs
subissaient. **Les trois pièces du même triptyque sont enfin traitées pareil.**

⛔ **Ce qui n'a PAS été touché** : aucune valeur, aucun calcul, aucune règle de
design. Les listes d'interface n'ont pas de filtre par nom — mesuré : les trois
sites qui appellent `filtrerRessourcesNonDemo` sur ces familles sont **tous des
exports**, jamais un rendu.

### ⏳ LA CONDITION DE FIN — elle n'est pas remplie par les bancs

`plans de travail/PORTES-TERRAIN-2026-09-01-materiel-seme.md` — neuf portes, Mac
et iPad. Vitest et Playwright lisent le texte livré et le trouvent conforme à ce
qu'on leur a dit d'attendre ; ils ne disent rien de ce qu'un enseignant COMPREND.
⚠ Et une marche n'a été franchie par AUCUN banc : **enregistrer** l'évaluation
faite avec le matériel semé. Les specs appellent le calcul directement, sans
passer la garde de sauvegarde. La lecture du code dit qu'elle ne se déclenche pas
(`estItemDemo` ne teste que `isDemo` et l'auteur, qu'aucune des trois pièces ne
porte) — **mais c'est une lecture, pas une mesure.**

⮕ Si les neuf portes passent, le **geste 2** de la ligne d'arrivée peut passer
d'« éprouvé par Grégoire » à « fait ».

### ⛔ ↻ LA PORTE EST SUSPENDUE — et son échec a trouvé le vrai défaut

*1er septembre 2026, en soirée.*

⚠⚠ **LE §3 N'ATTEINT PAS LES BASES DÉJÀ OUVERTES.** Le code porte « Échelle de
départ (IDME) » ; l'écran de Grégoire affiche « Échelle IDME (point de départ) ».
Mesuré sous WebKit sur deux passages de la même base : **le semis est idempotent
par identifiant** — il vérifie la présence de l'id et sort sans écrire. Il ne
recrée pas, **donc il ne renomme jamais**.

⮕ **Un lot de libellés qui n'atteint que les espaces neufs n'est pas livré, il
est semé.** Le §3 ne change rien pour qui a déjà ouvert l'application. C'est la
même forme que le corollaire de #674 : ce qu'on répare pour les nouveaux
n'atteint pas ceux qui sont déjà là.

⮕ Inscrit en **#682**, **non corrigé** : renommer une copie en base, c'est écrire
dans les données de quelqu'un. `scripts/sonde-682-materiel-seme-noms.js` sépare
le nom **jamais touché** (renommable sans rien prendre) du nom **choisi par
l'utilisateur** (à ne jamais écraser) — et laisse la décision à Grégoire.

⚠ Deux fautes de la porte elle-même, corrigées : elle envoyait dans un onglet
« Matériel » **qui n'existe pas** (elle recopiait le message d'erreur de l'app,
faux depuis longtemps, et que le §4-2 avait recopié à son tour — les deux disent
maintenant « Conception → Échelles de performance ») ; et l'absence de la grille
et de la cartouche chez Grégoire s'explique vraisemblablement par un tombstone,
c'est-à-dire par **la durabilité qui fonctionne**, ce que la sonde dit désormais
au lieu de le supposer.

⮕ **Le geste 2 ne bouge pas. Il reste « éprouvé par Grégoire ».**

---

## 4. QUE L'ÉCRAN D'ÉVALUATION CESSE DE MENTIR

*↻ Mesuré et traité le 1er septembre 2026 (fin d'après-midi). Les défauts 1 et 2
sont **LIVRÉS** ; le 3 est **mesuré et laissé hors du lot**, par décision de
Grégoire. Ce §4 est désormais un compte rendu, plus un programme.*

1. ✅ **LIVRÉ — le texte d'attente nommait deux pièces sur trois.** Il disait
   « Sélectionne une grille **et une cartouche** » alors que l'écran a besoin de
   grille **+ échelle +** cartouche — et omettait précisément la seule sans
   laquelle rien ne s'affiche.
   ⚠ **Le plan citait deux sites ; il y en avait TROIS.** `evaluation.js:124`
   (`reinitialiserEvaluation`), `evaluation.js:178` (`reinitialiserFormulaire`)
   et `index.html`. Les trois passent maintenant par une source unique,
   `MESSAGE_ATTENTE_CRITERES` — sauf le texte statique d'`index.html`, qui ne
   peut appeler aucun JS et qu'une sentinelle Vitest oblige à dire le même mot à
   le mot.
2. ✅ **LIVRÉ — choisir une grille sans échelle ne produisait rien de visible.**
   `chargerGrilleSelectionnee` enveloppait tout son travail dans un
   `if (echelleId)` sans `else`. L'écran DIT désormais ce qui manque, et
   distingue deux gestes : *choisir* une échelle quand il en existe, *en créer
   une* (et où) quand il n'en existe aucune. Trois specs WebKit, dont un témoin
   qui exige que le message DISPARAISSE une fois l'échelle choisie.
3. ⏳ **MESURÉ, ET LAISSÉ HORS DU LOT — il se traite avec #674.**
   ⚠⚠ **LA MESURE A ÉTÉ FAITE, ET LE POINT NE TOMBE PAS : il est plus dur que ce
   paragraphe ne le supposait.** Témoin WebKit, même grille, mêmes critères
   cochés, la seule variable étant le nom du champ dans les niveaux :
   | cas | note affichée | niveau | message |
   |---|---|---|---|
   | échelle choisie, niveaux en `valeur:` (les 8 du §1) | **`0.0 %`** | `--` | **aucun** |
   | témoin — la MÊME échelle en `valeurCalcul:` | `82.0 %` | `M` | aucun |
   | aucune échelle choisie | `--` | `--` | aucun |
   ⮕ Ce n'est pas un `--`, c'est un **chiffre** : `0,0 %` se lit comme un
   résultat. Et il est **persistable** — les trois écritures de `noteFinale`
   testent `typeof === 'number'`, et `typeof 0 === 'number'`.
   ⚠ **CORRECTION À CE PLAN — « l'application le DIT déjà » était faux dans un
   cas sur deux.** Le message cité ici (`evaluation-chargement.js:297`,
   « Aucune échelle configurée — Aller dans Matériel › Niveaux de performance »)
   ne se déclenche **que si aucune échelle n'existe dans les données**. Dès
   qu'il en existe une et qu'aucune n'est choisie, l'écran affichait `--` sans un
   mot : honnête, mais muet. C'est ce trou-là qu'a refermé le défaut 2 ci-dessus.
   ⮕ Le détail complet de la mesure — témoin discriminant, trois sites de
   sauvegarde, et ce que le §1 ne referme PAS pour les données déjà en base —
   est écrit **dans la fiche #674 elle-même**, qui cesse d'être de la prévention.

⮕ Le 3 se traite **avec #674**, pas séparément : c'est le même défaut, vu depuis
un autre écran.

### ⚠ TROUVÉ EN CHEMIN — le canal de partage déshabillait l'échelle

Mesuré le même jour, en vérifiant que `partage-schemas.js:329` ne transporte que
`valeurCalcul` : une échelle à `valeur:` **arrivait NUE** chez son destinataire.
`projeterEntite` ne copie que les champs déclarés, et le schéma ignorait `valeur`
— sans erreur ni avertissement. C'est l'**énoncé 6** (« une grille partagée
arrive complète »), et c'est **corrigé et verrouillé** le 1er septembre.

⚠ **Ce que ce correctif ne fait PAS** : transporter `valeur` rend l'échelle
*fidèle*, pas *calculable*. `valeurNumeriqueDuNiveau` ne lit que `valeurCalcul`
depuis #525. Une échelle à `valeur` reste muette chez son auteur comme chez son
destinataire — ce silence-là est #674. **Le partage ne dégrade plus ; il ne
répare pas.**

⮕ Les autres champs que ce canal laisse en chemin (`seuilSuffisance`,
`seuilMaitrise`, `niveauSOLO`, `description`, `discipline`) sont inscrits en
**#680**, avec la mesure qui reste à faire avant d'y toucher.

---

## 5. CE QUI RESTE À TRANCHER PAR GRÉGOIRE

- ~~Le motif de #574/#578~~ ✅ **RÉSOLU le 1er septembre** — lu, cité, et il ne
  s'oppose pas au semis. Voir §2. Rien à trancher.
- ⏳ **Le « niveau NEUF »** (`code:'N', min:0, max:100, valeurCalcul:50`, 4 sites)
  reste **NON TRANCHÉ** depuis #574, et il touche la même zone. Le faire naître
  vide recréerait la collision de clés de #524 ; la forme proposée est un tampon
  jusqu'à complétude (patron `_reperesNouvelleEchelle`, #555 e). À trancher, ou à
  laisser explicitement de côté.
- **Les données de démonstration.** Elles enseignent bien (18 encarts, 20
  étudiants, 11 productions), mais elles sont **une impasse pour démarrer** :
  `verifierReferencesPasDemo` refuse toute référence démo dans un vrai
  groupe-cours (`trimestre-v2-groupes-cours.js:490-501`), et aucune fonction
  « copier la démo vers mes données » n'existe.
  ⮕ Veut-il que la démo devienne **copiable** vers un vrai trimestre ? C'est une
  question de conception, pas un correctif.
- **Les autres semis à auditer avant de retirer** : 3 gabarits de grilles
  (`gabarits-utils.js:294`), 3 modèles de pratiques
  (`pratiques-bibliotheque.js:26-90`). Mesurer leur utilité réelle avant de les
  ranger avec les huit échelles. **Ne rien retirer sans avoir mesuré.**

---

## 6. CE QUE CE PLAN NE FAIT PAS

- Il ne réduit pas les **26 champs obligatoires du Cadre** (trimestre, cours,
  enseignant, étudiants, horaire, groupe-cours). Rien de prêt à l'emploi n'existe
  de ce côté, et le raccourcir est un autre chantier.
- Il ne touche pas au **vocabulaire**. Mesuré : 48 termes au glossaire, 282
  infobulles, assistance active par défaut. Deux trous seulement — **ELLAC**
  (4 occurrences dans `index.html`, 0 au glossaire) et **codex** (118 occurrences,
  0 entrée). À inscrire, pas à traiter ici.

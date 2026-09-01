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

## 1. ⚠ LE DÉFAUT QUI DOIT PARTIR EN PREMIER

**Les huit échelles « disciplinaires » de la bibliothèque produisent une note de
zéro, sans un mot.**

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

⚠ **À mesurer avant de retirer** : quelqu'un a-t-il déjà importé une de ces
échelles ? Retirer de la bibliothèque ne retire pas la copie déjà importée — et
cette copie est cassée. Si le cas existe, il faut le dire à l'utilisateur, pas
le laisser avec une échelle muette.

---

## 2. SEMER LE TRIPTYQUE — grille, échelle, cartouche

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

## 3. QUE LE MATÉRIEL SEMÉ SE DISE UTILISABLE

Aujourd'hui l'application sème trois exemples et n'en dit rien. Un nouvel
enseignant croit devoir tout construire.

Le geste : que les trois pièces se présentent comme **un point de départ prêt à
l'emploi**, et qu'on puisse évaluer avec elles sans rien créer.

⚠ Ce lot touche des libellés et de la présentation, pas du calcul. Il ne
s'élargit pas au design général.

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

# Consigne de démarrage à froid — les sessions qui prennent le relais

> **Réécrite le 2 septembre 2026 en fin de matinée, par Cowork, avec Grégoire.**
> **Elle REMPLACE toutes les versions précédentes.**
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ;
> c'est elle qui fait foi.
>
> **↻ CE FICHIER VIENT DE PERDRE LES DEUX TIERS DE SON VOLUME** — 986 lignes, contre
> environ 300 ici. Ce n'est pas une perte : c'est la **règle 3 de `PROTOCOLE.md`**
> appliquée pour la première fois. Ce qui a survécu à trois sessions n'est plus une
> consigne, c'est une règle : ça monte, et ça quitte ce fichier. Le tableau du tri
> est en fin de document — **lis-le avant de conclure qu'une leçon a disparu.**
>
> ⛔ **Cette consigne ne porte plus que ce qui PÉRIME** : l'état mesuré, le mandat,
> et ce qui est dû. Rien d'autre n'a le droit d'y entrer.

---

## À LIRE D'ABORD, DANS CET ORDRE

1. **`PROTOCOLE.md`** (racine) — comment nous trois travaillons ensemble.
   ⚠ **Il a changé aujourd'hui** : une **règle 6** y est entrée, sur l'environnement
   de travail de Grégoire. Elle change l'ordre des livraisons et la façon dont les
   consignes circulent. **Ne code pas avant de l'avoir lue.**
2. **`OU-EN-EST-ON.md`** (racine) — où on en est, en gestes d'utilisateur.
3. **`CLAUDE.md`** — ce qui gouverne le code.
4. **`OBJECTIF-COHORTE-1.md`** — les huit énoncés, **arrêtés, liste fermée**.
   Toute trouvaille reçoit une seule question : *est-ce que ça empêche un des huit ?*
   Non → inscrire et continuer.

Puis le rituel : skill `debut-de-session-labo-codex`.

---

## ⛔ LES DEUX CHOSES QUI CHANGENT DANS TA FAÇON DE TRAVAILLER

*Arrêtées le 2 septembre 2026. Le détail est dans la règle 6 de `PROTOCOLE.md` ;
voici ce qui te concerne immédiatement.*

**1. LES CONSIGNES ARRIVENT PAR UN FICHIER, PLUS PAR UN BLOC COLLÉ.**
Cowork écrit dans `plans de travail/CONSIGNE-DU-JOUR.md`, et Grégoire ne colle
qu'une ligne. Motif : un bloc relayé a été **tronqué à la copie** ce matin — une
demi-consigne, coupée en plein milieu d'une mesure, sans que personne puisse s'en
apercevoir. ⮕ **Ce fichier se commite AVEC ton lot** : il en est la spécification.
⚠ Et il porte sa date : **s'il a plus de quelques heures, ou si `HEAD` a bougé
depuis, remesure et dis-le au lieu de l'exécuter.**

**2. TU COMMITES, PUIS TU T'ARRÊTES. TU NE POUSSES PAS.**
Une seule livraison par séance, à la fin, et **Grégoire regarde l'écran avant**.
Tu dis que c'est prêt, tu nommes ce qu'il doit aller voir, et tu attends.
Le verdict Playwright se prend **après** son coup d'œil, jamais avant : une
correction issue de son regard périmerait un verdict déjà pris.
▣ Motif, mesuré : le 2 septembre, **quatre versions sont parties avant midi et
aucune n'avait été regardée par lui.** À 8 h, il ne savait plus où il en était
dans son propre projet. L'attente n'est pas un coût, c'est la fonctionnalité.

⮕ **Et la règle qui commande tout le reste** : *jamais un numéro de fiche sans sa
phrase en français.* « #690 » ne lui dit rien. « Les trois pratiques offertes qui
se déclarent en chimie et en maths » lui dit tout.

---

## ÉTAT MESURÉ — 2 SEPTEMBRE 2026, EN SOIRÉE (#674, énoncé 5 : la note dit sur quoi elle porte) — ⏸ COMMITÉ, NON POUSSÉ

> Écrit par Claude Code à la clôture du LOT (règle 4), depuis la consigne du jour
> promue le 2 septembre au soir. Chaque chiffre porte sa commande (règle 1).
> **Le lot est commité et la session s'est ARRÊTÉE** : ni release, ni verdict au
> jeton, ni push. Grégoire regarde l'écran d'abord ; le verdict Playwright au jeton
> (`node ../scripts/verifier-playwright.mjs`) se prend APRÈS son coup d'œil.

**Le dépôt** — parti de `9fe13749` (tout poussé, Vitest 437 f. / 4724 t., Playwright
233/233 sur le run `33678001180`), mesuré par le rituel de début de session : **zéro
écart** avec la consigne. Un commit ajouté, non poussé (son SHA est dans `git log -1`).
`git diff --stat 9fe13749 -- js/ index.html styles.css tests/` : **11 fichiers hors
docs**, 7 dans `js/`. ⚠ `BACKLOG.md`, `PROTOCOLE.md` et six `.md` non suivis de
`plans de travail/` sont à Grégoire et à Cowork : **laissés hors du commit**, comme
la consigne l'exigeait. `CONSIGNE-DU-JOUR.md` (la spécification du lot) est commitée
avec lui.

**Les tests** — `cd tests && npm test` (suite COMPLÈTE, exigée par la consigne : le lot
touche le calcul d'une note) : Vitest **440 fichiers / 4753 tests, code 0** (437 + 3
fichiers neufs, 4724 + 29 cas) ; Playwright **240 passés, 0 échoué, 0 instable, en
7,9 min** (les 239 + le geste de Grégoire ajouté au triptyque), en local sous WebKit
macOS — ⚠ ce n'est pas encore le verdict au jeton, qui se prend après son coup d'œil.
Le rouge a été montré AVANT le correctif : sur la fonction réelle `calculerNote()`
chargée en bac à sable, le cas B rendait **« 95.0 % »** (attendu « -- ») et le cas C
**« 0.0 % »** — les deux mécanismes de la fiche, reproduits.
Break-tests par mutation, restauration vérifiée par empreinte `md5` :

| mutation | test attendu rouge | rouges obtenus |
|---|---|---|
| portée retirée du chemin de création (`evaluation-sauvegarde.js`) | sentinelle déduite | 1 (nomme `js/evaluation-sauvegarde.js:222`) |
| porte d'enregistrement retirée | portes | 5 |
| règle forcée à « complète » (`incomplete: false`) | reproduction + portes | 12 |
| rendu qui conclut quand même | portes (PDF) | 3 |

**Audit sécurité statique** (rituel §2, sur les 412 lignes ajoutées de `js/` +
`index.html`) : aucun `innerHTML`, aucun handler inline, aucun `eval`, aucun
`console.log`, aucune écriture `db.set`, aucune zone protégée. Un `console.warn`
(refus d'enregistrement nommé). Les noms de critères passent par `textContent` à
l'écran et par `esc()` dans le rendu du PDF (cas testé avec un nom piégé).

**La version** — inchangée, **1.110.0 / 0902-1218** sur les quatre points (pas de
release : consigne). Les jetons anti-cache d'`index.html` sont bumpés pour les huit
fichiers servis (7 `js/` + `styles.css`).

### Ce que le lot fait, en gestes d'utilisateur

1. **À l'écran** (`calculerNote`) : un critère pondéré sans niveau, ou dont le niveau
   n'a pas de valeur dans l'échelle → note et niveau « -- », et une ligne sous la note
   (`#porteeNote1`) nomme ce qui manque, avec le poids et quoi faire. Renseigné : la
   note revient, la ligne disparaît. Une évaluation VIDE (aucun niveau) n'est pas
   « incomplète » : son zéro est visible, et un jeton de délai seul s'enregistre.
2. **La portée voyage avec la note** : `window.porteeCalculeeCourante` est publiée à
   côté de `window.noteCalculeeCourante`, et les QUATRE chemins écrivent
   `ponderationCouverte` (points de pondération comptés, même unité que
   `criteres[].ponderation`) à côté de `noteFinale` — `grep -rn "porteeCalculeeCourante" js/`
   en rend 4 sur des écritures. L'auto-save écrit « 95 sur 80 % » sans refuser.
3. **Porte 1, l'enregistrement** (`sauvegarderEvaluation`, `sauvegarderEvaluationModifiee`) :
   refus nommé sur le patron `_validerReferencesSauv`, via `verifierPorteeAvantSauvegarde`
   (evaluation-calcul.js), qui **rappelle `calculerNote()` avant de juger**.
4. **Porte 2, le PDF de l'élève** (`construireFeedback` → `portee`, rendu) : la page est
   produite mais **refuse de conclure** — pas de bandeau « Niveau général », une phrase
   nomme les critères en attente — et l'export **le dit à l'enseignant** (export
   unitaire et dossier complet). Rétroactif : `porteeDepuisEvaluation` relit les
   évaluations d'avant ce lot depuis `criteres[]`, la grille et l'échelle ; quand la
   déclaration `ponderationCouverte` existe, elle fait foi pour le nombre.
5. **Sentinelle déduite** : tout `js/` est lu à chaque exécution ; une écriture de
   `noteFinale` depuis la valeur calculée sans `ponderationCouverte` à ±6 lignes
   rougit, fichier et ligne nommés. Pas de liste tapée à la main (leçon #572).

### Ce que j'ai décidé seul — dis-le-moi en dix secondes si c'est faux

- **Le nom et l'unité** : `ponderationCouverte`, en points de pondération (80 pour
  50 + 30), pas la fraction 0,8 — même unité que les voisins ; la complétude se juge
  contre la somme de la grille, pas contre 100 (une grille à 90 % reste jugeable).
- **L'écran retient la note** (« -- ») plutôt que d'afficher « 95,0 % » avec sa
  portée : « le dit AU LIEU de monter la note ». Si tu préfères le chiffre accompagné
  de sa portée, c'est une ligne dans `calculerNote` (`portee.incomplete ? '--' : …`).
- **Un critère de pondération nulle n'est jamais « hors note »** : il ne peut pas
  déplacer la note.
- **Le PDF est produit** (conclusion retenue + phrase), pas refusé en bloc — parce
  que la consigne parle des mots que l'ÉLÈVE lira.
- **Le PDF refuse aussi de conclure quand des critères ont un niveau mais qu'aucun
  niveau général n'est établi** (copie muette d'avant ce lot dont l'échelle aurait
  été réparée depuis) : la note en base reste 0, il faut la rouvrir.
- **Les mots de l'ENSEIGNANT** (ligne écran, refus, alerte d'export) sont de moi.
- Le témoin Playwright « 0,0 % muet » a été **retitré et retourné** (il annonçait
  qu'il rougirait le jour où #674 serait livré : il a rougi, puis a été corrigé, pas
  élargi), et un essai a été ajouté : le geste exact de Grégoire.

### ✅ ARRÊTÉ PAR GRÉGOIRE — les mots que l'élève lira (2 septembre 2026, en soirée)

Trois formulations lui ont été proposées avec l'exemple « Langue (20 %) » ; **il a
retenu la (C)**, dans un second commit qui suit le lot :

> « Cette copie n’a pas de niveau général : Langue (20 %) reste à évaluer. »

Au pluriel : « … : Contenu (M), Organisation (M), Langue (M) restent à évaluer. » Sans
liste (copie muette d'avant ce lot, niveau général jamais établi) : « Cette copie n’a
pas de niveau général. » Constante `TEXTE_PORTEE_INCOMPLETE` dans
`synthese-retroaction-rendu.js` ; les mots exacts sont gardés par quatre cas de
`sentinelle-674-les-portes-refusent-l-incomplet.test.js`. Motif de la préférence
(lecture de Claude Code, tranchée par lui) : (A) ouvrait sur deux abstractions
d'enseignant ; (B) ouvrait sur « Évaluation incomplète », qu'un élève peut lire comme
« ta copie est incomplète » ; (C) part de la copie, nomme, pointe la suite, tient en une
ligne et fonctionne sans liste. Il a aussi confirmé le « -- » à l'écran.

### ↻ CE QUE LE COUP D'ŒIL DE GRÉGOIRE A TROUVÉ (17 h 53) — corrigé, troisième commit

**Le symptôme** : après le refus d'Enregistrer sur une copie incomplète, la copie
restait « **Importé** », et l'export Léa rendait « Aucune évaluation trouvée pour ces
critères » (capture d'écran). Son inférence — « je ne peux pas enregistrer une
évaluation incomplète, donc je ne peux pas exporter de PDF » — était juste dans les
faits, fausse dans la cause : l'export Léa ne filtre pas sur le verrouillage
(`selectionnerEvaluationsLea`, `!remplaceeParId` seulement) ; un brouillon
s'exporterait. Il n'y avait AUCUNE évaluation en base, pas même le brouillon.

**La cause** : `sauvegarderEvaluation` **annule l'auto-save en attente** avant toute
validation (« la sauvegarde manuelle prend le relais », fix #109). Tant qu'Enregistrer
écrivait toujours, rien ne se perdait. Un refus qui n'écrit rien laissait le travail
nulle part — et, à la navigation, `_flusherAutoSave` n'avait plus de snapshot à
écrire. **Régression de ce lot**, issue 1 (elle casse le parcours livré).

**Le correctif** : `verifierPorteeAvantSauvegarde` écrit le brouillon sur-le-champ
(`window._autoSauvegarderCriteres(null)`, la note AVEC sa portée, non verrouillé),
exactement ce que l'auto-save aurait fait 1,5 s plus tard, puis refuse en le disant
(« Ton travail est conservé en brouillon : complète l'évaluation, puis enregistre. »).
La copie passe « Évalué », reste exportable, et son PDF porte la phrase (C).
Vérifié : `npx vitest run unit/sentinelle-674-les-portes-refusent-l-incomplet.test.js`
— 17 cas, dont les trois refus qui exigent maintenant UN brouillon non verrouillé
(helper `seulUnBrouillon`) et un témoin sans auto-save chargé (rien n'est écrit).
Break-test : retirer l'appel → rouge (voir le rapport de session).

⚠ **Ce que ça révèle, à inscrire** : un chemin de refus quel qu'il soit, posé après
l'annulation de l'auto-save dans `sauvegarderEvaluation`, jette le travail en cours.
`_validerReferencesSauv` et `_validerReferencesNonDemoSauv` sont dans ce cas depuis
toujours (une grille disparue, une référence démo) — moins probable, même trou.

⚠ **Trou dans le filet, nommé** : la suite complète était verte avec le défaut. Aucun
test n'exerçait « refus, puis que reste-t-il en base ? ». C'est le coup d'œil de
Grégoire à l'écran qui l'a vu — la règle 6 a fait exactement ce pour quoi elle existe.

### ↻↻ 18 h 04 : « C'est inchangé » — le troisième commit ne suffisait pas, quatrième commit

**Le symptôme, capture à l'appui** : nouveau code chargé (le refus dit bien « conservé en
brouillon »), et pourtant la copie reste « Importé », pastille « En cours », export Léa
« aucune évaluation ».

**La cause, MESURÉE dans le vrai flux** (nouveau banc
`tests/integration/evaluation-674-refus-conserve-le-brouillon.spec.js`, WebKit, qui
rejoue fonction par fonction la séquence de `travaux-ui.js` à l'ouverture d'une copie,
puis le geste) : `evaluationEnCours` désigne **deux objets** — c'est le constat #646 du
31 août, écarté par Grégoire (« pas un soir »). `config.js` déclare `let evaluationEnCours`
(aucune propriété sur `window`) ; le flux Travaux pose `window.evaluationEnCours`
(`demarrerEvaluationDepuisFichier`) PUIS le nom nu (`chargerEvaluationsEtudiant`).
`niveauSelectionne` écrit les niveaux dans le nu ; l'auto-save lit `window`.
Annotation du banc, telle quelle : *nu === window : **false** · critères nu ["c1","c2"]
· critères window [] · brouillons écrits par l'auto-save débouncé : **0***.
⮕ Les bancs unitaires ne pouvaient pas le voir : ils donnent le MÊME objet au bac à
sable sous les deux noms. Seul un banc dans le navigateur, avec les deux emplacements
tels que l'application les crée, pouvait rougir — il a rougi (0 brouillon), puis verdi.

**Le correctif** (`_instantanePourBrouillon`, evaluation-calcul.js) : la porte donne à
l'auto-save un instantané qui prend les critères LÀ OÙ ILS SONT (les deux emplacements,
le nu l'emportant — c'est lui que `calculerNote` vient de lire) et les identifiants là
où l'enregistrement manuel les prend (les sélecteurs d'abord) ; l'`idModification`
posé par l'auto-save est rendu aux deux objets. Break-test : ne plus lire le nu → le
banc réel rougit. Ce n'est PAS la réparation de #646 : c'est le chemin qui la contourne
pour ce geste.

⚠⚠ **CE QUE LE BANC A MESURÉ EN PLUS, ET QUI CHANGE UNE PRÉMISSE DE LA CONSIGNE** :
dans « Annoter et évaluer », **l'auto-save débouncé n'écrit AUCUN brouillon** — depuis
avant ce lot, pour la même raison (il lit `window`, les niveaux sont dans le nu). La
consigne disait « les évaluations nées de l'auto-save, c'est-à-dire la majorité » ; dans
ce flux, c'est zéro : tout vient de l'enregistrement manuel. Conséquences : (1) le
travail en cours n'est PAS conservé si l'on quitte une copie sans enregistrer ; (2) la
portée n'a d'évaluation à accompagner que par les portes. **C'est #646 — inscrit à sa
fiche, pas corrigé ici** (126 lectures du nom nu, 94 de `window`, 8 fichiers). Le
remède de fond tient peut-être en un mot dans une zone protégée (`let` → `var` dans
`config.js` unifie les deux emplacements) : **décision de Grégoire**, pas d'une session.

### ↻↻↻ 18 h 50 → 19 h 15 : LA TROUVAILLE QUI PÈSE LE PLUS — des critères SANS IDENTIFIANT

**Ce que Grégoire a vu** : le PDF imprimait la MÊME description sous ses quatre critères
holistiques ; au retour sur la copie, un seul des quatre niveaux était restauré. **Ce que
la sonde a mesuré** (`scripts/diagnostic-674-ids-criteres.js`, lecture seule, sur
« Grille-5 FR-ALGO A26 ») : **4 critères sur 5 ont `id: undefined`** (seul « Français
écrit », algorithmique, porte un identifiant — un `CR1759…` de 2025, hérité de la grille
A25). À l'écran : quatre sélecteurs `eval_undefined`. Dans les deux `evaluationEnCours` :
`{"undefined": "I"}`. Dans le brouillon : quatre entrées `critereId=undefined`, toutes au
niveau I, note 40 sur une portée de 80.

**La mécanique, lue dans le code** : l'écran, la note, la cartouche, le PDF et la
réouverture d'une copie retrouvent un critère PAR IDENTIFIANT (`eval_<id>`,
`criteres[id]`, `comm_<id>`, `find(gc => gc.id === critereId)`). Quatre critères sans
identifiant y deviennent UN SEUL : `getElementById('eval_undefined')` rend toujours le
premier, `niveauSelectionne` lit donc le sélecteur de *Structure* quel que soit celui
que l'enseignant a touché, et **les niveaux choisis sur Rigueur, Plausibilité et Nuance
n'ont jamais été enregistrés**. La note porte le niveau de Structure sur 80 % de la
grille. Le PDF imprime la description et le commentaire du premier sous les quatre.

**La source, nommée et TARIE** : `grilles.js`, `ajouterCritereGrille` — l'éditeur de
grille EN LIGNES (celui de la capture) poussait `{ nom: 'Nouveau critère', type,
ponderation, description }` **sans `id`**. Il travaille par index, donc il ne voyait
rien. Le chemin modal (`sauvegarderCritere`) posait l'identifiant depuis toujours.
Correctif : `id: genererIdUnique('CR_')` à la naissance, sentinelle sur la vraie
fonction. ⚠ **Tarir n'est pas réparer** : aucune grille ni évaluation n'est touchée.

**Le stock — PRÉCISÉ PAR GRÉGOIRE à 19 h 30 : rien n'est perdu.** L'évaluation de
Daniel T. était un TEST ; **aucune autre évaluation n'utilise cette grille
aujourd'hui** — il y en aura plus tard dans le trimestre. Les 27 évaluations d'A26 sont
sur d'autres grilles. Donc, avant les vraies évaluations sur « Grille-5 FR-ALGO A26 » :
**donner un identifiant à ses quatre critères** (une écriture dans SA grille : son
accord), et supprimer ou refaire l'évaluation-test de Daniel (elle porte quatre entrées
`critereId=undefined` qui ne se rattacheront plus qu'au nom). Trois voies proposées :
(1) supprimer et recréer les quatre critères dans l'éditeur — ils naissent maintenant
avec un identifiant, mais tout est à retaper ; (2) un script console qui pose un
identifiant aux critères qui n'en ont pas, sur cette grille seulement, après
sauvegarde — à préparer sur son feu vert ; (3) une réparation automatique au démarrage,
pour TOUTES les grilles de TOUS les utilisateurs (l'éditeur créait des critères sans
identifiant depuis le 30 octobre 2025, `6214d69c`) — écrit dans les données de
quelqu'un : **décision de Grégoire, à froid, avec Cowork**. La sonde
`scripts/diagnostic-674-criteres-sans-id.js` (lecture seule, `await diag674SansId()`)
mesure le stock local, tous trimestres, avant tout geste. Rien n'a été écrit.

⚠ **Ce que l'énoncé 5 n'aurait pas vu** : la couverture de ces évaluations est 100 %
(quatre entrées, quatre pondérations). La note ne ment pas sur sa PORTÉE ; elle ment
sur ce qu'elle porte. C'est un défaut de l'énoncé 2 (créer une grille… la retrouver)
qui se paie à l'énoncé 5.

### Trouvailles en chemin — issue 2 (inscrire et continuer), aucune corrigée

- **Tout refus placé après l'annulation de l'auto-save jette le brouillon en attente**
  (`_validerReferencesSauv`, `_validerReferencesNonDemoSauv`) — même famille que la
  régression ci-dessus, hors de ce lot.

- **Le portfolio et la Liste des évaluations ne lisent pas encore la portée** : une
  évaluation née de l'auto-save avec « 95 sur 80 % » entre dans l'agrégat à 95, comme
  avant. La fiche #674 disait « le portfolio avertit » ; ce n'est pas dans ce lot.
- **L'export unitaire (`exporterPDF`) ignorait la `raison` de #565** : quand la page de
  synthèse est omise, seul le « dossier complet » l'annonçait. J'y ai branché
  l'avertissement #674, pas la raison #565 — à aligner.
- **Un repli mort dans `calculerNote`** : si `valeurNumeriqueDuNiveau` manquait, le
  code local retomberait sur `(min + max) / 2`, retiré par #527 — inerte en
  production (`echelles.js` toujours chargé). Issue 3 : à commenter, pas à corriger.

### Ce qui reste ouvert

- ⏸ **Le push attend Grégoire.** Ce qu'il doit voir : Travaux → une copie → laisser un
  critère sans niveau → « -- » et la ligne qui nomme le critère ; Enregistrer → refus
  nommé ; donner le niveau → la note revient, plus un mot. Puis le verdict au jeton,
  puis le push (§4.5 de `fin-de-session`).
- **La formulation de l'élève** (ci-dessus).
- #688, #689, #690, #692 inchangés.

---

## ÉTAT MESURÉ — 2 SEPTEMBRE 2026, 10 h (release 1.109.2, parts égales) — ✅ POUSSÉ

> Écrit à la clôture du LOT (règle 4). Chaque chiffre porte sa commande (règle 1).

✅ **PREMIÈRE APPLICATION DE LA RÈGLE 6, ET ELLE A TENU.** Le lot a été commité
puis la session s'est ARRÊTÉE : ni verdict, ni push. Grégoire a regardé l'écran,
a dit « c'est bon », et le push a suivi. ⮕ **L'attente est la fonctionnalité**,
et elle a coûté ce qu'elle devait coûter : rien d'autre que le temps d'un
coup d'œil. Le verdict Playwright a été pris APRÈS son accord, pour qu'une
correction issue de son regard ne le périme pas.

**La version** — `cat version.json` rend `{"build":"0902-1006","beta":"1.109.2"}`.
Quatre points alignés, mesurés PAR TÉMOIN : `grep -rl '1\.109\.1' --include=*.js
--include=*.json --include=*.html .` rend **0** ; **témoin du périmètre** :
`grep -rl '1\.109' .` sur tout le dépôt rend **11** fichiers de prose datée.

**Les tests** — `cd tests && npm run test:unit` : **435 fichiers / 4701 tests,
code 0**. Sentinelle #687 à **27 cas**, dont deux neufs, **break-testés 4 fois**
(y compris la mutation `20/20/30/30` que la consigne désignait).

### Le lot — une seule ligne de données, et un raisonnement à ne pas perdre

Les quatre évaluations du modèle sommatif passent de `20/20/30/30` à **`25` chacune**.
Rien d'autre ne bouge : ni les noms, ni les types, ni les critères, ni les seuils,
ni l'identifiant.

**Le motif est inscrit EN COMMENTAIRE au-dessus du bloc**, pour qu'une session
future ne « corrige » pas ces 25 % en les trouvant trop plats : les NOMS étaient
déjà neutres, la PONDÉRATION ne l'était pas. `20/20/30/30` met **60 % du poids
sur les examens** — une position pédagogique servie comme point de départ à des
programmes (arts, techniques, éducation physique) où les examens sont
minoritaires ou absents. Des parts égales ne disent rien, et **quatre nombres
identiques se voient comme un réglage à poser**.

### ⚠ CE QUE LA SENTINELLE NE GARDAIT PAS, ET QUE LA CONSIGNE M'A FAIT VÉRIFIER

La consigne demandait de mesurer si un cas affirmait les pondérations. **Réponse :
un cas les touchait sans les garder.** `A bis.e` vérifiait la SOMME (100) et
l'arrondi (multiples de 5) — il passait donc à l'identique avec `20/20/30/30` ET
avec `25/25/25/25`. Il ne gardait pas la RÉPARTITION, qui est pourtant ce qui
portait la position pédagogique.
⮕ **`A bis.f` ajouté** : *aucune évaluation d'un modèle fourni ne pèse plus qu'une
autre*, sur TOUS les modèles offerts, pas seulement le sommatif. Plus `A bis.g`
en témoin — sans lui, un modèle sans `evaluations` passerait par le `return` de
garde et l'invariant ne garderait plus rien.
⮕ La leçon : **un cas qui touche une donnée ne la garde pas forcément.** « Il y a
un test dessus » ne dit pas lequel des invariants il tient.

**Le changelog n'est pas touché** : l'entrée `1.109` dit « deux travaux et deux
examens » et ne mentionne aucune pondération (`grep` sur `changelog-data.js` :
les deux autres occurrences de « pondération » sont dans des entrées anciennes,
sans rapport). Convention du dépôt : une entrée par version mineure.

### Ce qui reste ouvert

- ⏸ **Le push attend Grégoire.** Ce qu'il doit voir : Conception › Pratiques ›
  « Partir d'un modèle » › **Modèle sommatif** — ses quatre évaluations doivent
  afficher **25 % chacune**.
- **#688, #689, #690, #692** inchangés.

---

## CE QUE LA JOURNÉE DU 2 SEPTEMBRE A LIVRÉ — quatre versions, un seul fil

Un seul chantier, tenu du matin à midi : **le matériel fourni par l'application ne
doit se réclamer d'aucune discipline.** Ni chimie, ni géographie — ni la
littérature, qui est pourtant celle de Grégoire.

| Version | Ce qu'un enseignant y gagne |
|---|---|
| **1.108.0** | Le mot « français » ne s'imprime plus dans le PDF d'un élève dont le critère s'appelle autrement. Les quatre phrases engendrées se règlent depuis le gabarit de la grille et voyagent avec elle. *(#581)* |
| **1.109.0** | Les modèles de pratique nommés « Chimie », « Géographie », « Philosophie », « Comptabilité » ne sont plus offerts. Les modes de calcul perdent leur parenthèse disciplinaire. *(#687)* |
| **1.109.1** | Le modèle sommatif cesse de reproduire la pratique de son auteur : sa configuration était un cours de littérature. *(#691)* |
| **1.109.2** | Ses quatre évaluations passent à parts égales — une pondération est une position pédagogique, pas un point de départ. |

**Trois trouvailles de la journée valent plus que les lots eux-mêmes :**

▣ **Un « fini quand » qui cherche un MOT se trompe de cible ; il faut chercher une
OFFRE.** Le même mot « Chimie » est un défaut dans un libellé de gabarit et une
donnée officielle dans un code de programme du ministère. Le compte est passé de
105 à 71, et **ce n'est pas zéro parce que ça ne doit pas l'être**.

▣ **Un cas de test qui touche une donnée ne la garde pas forcément.** Un cas
vérifiait que les pondérations totalisent 100 et sont rondes — vrai avant comme
après. La RÉPARTITION, qui portait toute la position pédagogique, n'était
surveillée par rien. *« Il y a un test dessus » ne dit pas lequel des invariants
il tient.*

▣ **Une relecture croisée a rattrapé, avant l'envoi, un trou qu'aucun banc ne
voyait** : un critère nommé « Maîtrise de la langue **française** » n'était pas
reconnu et basculait en silence sur le texte neutre. Le motif exigeait un
non-alphabétique après « francais » ; la forme fléchie échouait.

⮕ **Et une décision de fond a été prise, qui n'est PAS codée** : le matériel de
départ (grille, cartouche, échelle) **cessera d'être semé** dans l'espace de
l'utilisateur. Il vivra dans les données de démonstration, en lecture seule, et
s'adoptera par le bouton « Dupliquer » qui existe déjà. Ça fait tomber deux
défauts d'un coup — plus rien ne s'écrit chez quelqu'un sans qu'il le demande, et
la portée fausse des suppressions disparaît avec le semis. **Ce chantier n'est pas
commencé.**

---

## ⛔ LE MORATOIRE EST TOUJOURS ACTIF

Les trois gestes de l'écran Trimestres restent interdits. **La levée est une décision de
Grégoire, et il ne l'a pas prise.** Rien ce soir ne l'a approchée.

⮕ Toujours pas réparé, et à ne pas croire réparé :
- **le fichier « Exporter » n'a aucun chemin de restauration** ;
- **le snapshot d'archivage n'a aucun lecteur.**

**Le corpus de `file://` est le corpus RÉEL de Grégoire.** La bonne question n'est jamais
« puis-je me permettre de détruire » mais « **ai-je besoin de détruire pour prouver** ».

---

## LES DEUX LOTS PRÊTS, SAUVÉS HORS DÉPÔT, NON DÉPOSÉS

⚠ **Aucun n'a obtenu son rouge d'abord sous vitest. Ils sont PRÊTS, pas FAITS.**
Les deux vivent dans `/Users/kuekatsheu/Documents/GitHub/lots-en-attente-2026-08-31/`,
**hors du dépôt**, empreintes vérifiées une par une. Chacun porte son propre fichier de
reprise — **lis-le avant de toucher au lot**.

- **`S9a-627/`** — unification des quatre remaps d'import. 16 fichiers, 408 Ko, patch de
  845 lignes, `git apply --check` code 0. Contient un **break-test rejouable** qui valide
  le témoin de chaque mutation avant de l'appliquer.
- **`S10a-628-659/`** — legacy des échelles, en deux gestes. **Le geste 1 (#659) est le
  seul correctif préparé qui arrête quelque chose d'ACTIF** : entrer dans la section
  Échelles écrit en base **à chaque visite, sans aucune action de l'utilisateur**.

---

## LE MANDAT DE LA PROCHAINE SESSION — finir l'énoncé 4

> Section tenue par **Cowork** (`PROTOCOLE.md`, « qui écrit quoi »). Une session qui
> rend son état mesuré ne la réécrit pas : elle réécrit l'ÉTAT, au-dessus.

**Pourquoi celui-là et pas un autre** : l'énoncé 4 est le seul des huit qui ait bougé
aujourd'hui, et il est à deux gestes d'être vert. Les autres attendent une décision
de Grégoire ou ouvrent un chantier neuf. On finit ce qu'on a commencé.

L'énoncé, dans ses mots : *« Aucun élève ne reçoit un PDF où son critère est
rebaptisé "français". Aucun enseignant ne lit dans son interface le SRPNF, l'EUF,
le CAF ou la littérature s'il n'en fait pas. »* La première phrase est faite. **La
seconde ne l'est pas.**

### Geste 1 — les pratiques offertes qui déclarent une discipline *(#690)*

⚠ **C'est plus gros que ce que la fiche laisse croire.** Mesuré le 2 septembre à
10 h 40 dans `js/pratiques/pratiques-predefines.js` (à rejouer avant de planifier) :

```bash
grep -nE "id: 'pan-[a-z-]+'|discipline: '" js/pratiques/pratiques-predefines.js
```

⮕ **Six entrées au moins portent un champ `discipline:` rempli** — Chimie (l. 28 et
269), Littérature (l. 163 et 365), Mathématiques – Calcul différentiel (l. 480),
Philosophie 101 (l. 599), Biologie – Anatomie et physiologie 3 (l. 707).
⮕ **Et quatre identifiants portent le prénom d'un collègue** : `pan-standards-bruno`,
`pan-specifications-fah`, `pan-objectifs-ponderes-michel`,
`pan-jugement-global-isabelle`.

⚠⚠ **CE MODULE EST VIVANT**, contrairement à ce qui est parti hier : il est chargé
par `index.html` et lu par `js/bibliotheque-ui.js` et
`js/pratiques/pratique-configurable.js`. Ces pratiques sont **offertes à
l'adoption**. Ce n'est plus du matériel mort, c'est ce que les gens peuvent prendre.

**LE LOT SE COUPE EN DEUX, ET LA SECONDE MOITIÉ N'EST PAS À TOI.**

· **(a) Le champ `discipline:` et tout ce qui l'affiche** : c'est du texte, ça se
  corrige. Neutralise la valeur comme le lot d'hier l'a fait ailleurs (`'Général'`),
  et déplace l'origine dans la `description` si elle informe.
· **(b) Les identifiants : ↻ TRANCHÉ PAR GRÉGOIRE le 2 septembre — ils partent.**
  « On retire absolument tout nom de collègue », puis, après mesure : « on retire
  TOUS les noms. » Le motif est le sien : ce code est servi au navigateur de tout le
  monde, et un nom gravé dedans est un nom publié sans qu'on l'ait demandé à son
  porteur.
  ⮕ **La mesure a trouvé trois familles, pas une**, et ↻ **les trois sont gratuites** :
  les huit identifiants d'échelles de `IDS_GABARITS_HARDCODES` sont **inertes** — le
  tombstone a cinq lecteurs, aucun ne les concerne, et l'import ne le consulte pas.
  ⚠ Un commentaire du code affirme le contraire ; **il est périmé depuis le retrait du
  semis du 1er septembre**, et il doit être corrigé dans le même commit.
  **Le détail exécutable est dans
  `plans de travail/CONSIGNE-DU-JOUR.md`, écrit le 2 septembre à 10 h 54. Lis-le : ce
  mandat-ci le résume, il ne le remplace pas.**

### Geste 2 — le CAF et les services adaptés servis à tout le monde *(#539)*

Mesuré : `js/pratiques/pratique-sommative.js`, l. **642** (« Référence aux services
de soutien (SA, CAF, etc.) ») et l. **648** (« Services adaptés (SA) »).

⚠ **Le CAF n'existe plus** : le Centre d'aide en français de son collège est devenu
« Passerelle + », et la transition n'est pas finie. **Le nom du service est une
décision de Grégoire**, elle est due depuis des semaines — ne l'invente pas.
⮕ Ce qui est à TOI : que ces libellés cessent d'être servis **à un enseignant qui
n'a ni CAF ni services adaptés dans son établissement**. Le patron existe déjà :
`js/evaluation-projection.js` porte un registre où le nom du service est un
paramètre réglable, avec `defaut: 'Centre d'aide en français (CAF)'` (l. 213).
**Réutilise-le, ne réinvente rien.**

### Fini quand

Un enseignant qui n'enseigne pas le français, et dont l'établissement n'a ni CAF ni
services adaptés, **ne rencontre aucun de ces quatre mots dans son interface** — sauf
s'il les a écrits lui-même. Publie le compte AVANT et APRÈS, **avec son témoin**.

---

## SI GRÉGOIRE VEUT AUTRE CHOSE — choix fermé

**(a) #674 — la note qui monte en silence quand un critère reste sans niveau.**
C'est l'énoncé 5, et ce n'est plus de la prévention : des utilisateurs déjà en place
ont des échelles muettes qui rendent **0,0 %** sans un mot. Ni sondables, ni
joignables. La forme est déjà tranchée : persister `ponderationTotal` à côté de
`noteFinale` — **pas** un état « brouillon / conclue », explicitement écarté.

**(b) Le retrait du semis** — la décision de fond du 2 septembre, non codée. Le
matériel de départ passe dans la démo, l'état vide de chaque section dit ce qui
manque et propose l'activation. Fait tomber une menace sur l'énoncé 8.

**(c) Déposer les deux lots préparés hors dépôt** (voir plus bas). Le geste 1 de
`S10a` est le seul correctif prêt qui **arrête quelque chose d'ACTIF**.

**(d) #692 — le piège dormant du filtre « mode démo ».** Trois des cinq modèles
offerts portent `auteur: 'Demo Labo Codex'`. La bibliothèque des pratiques est la
seule des cinq à ne pas filtrer sur ce champ : le jour où quelqu'un « harmonise »,
les familles spécifications et standards se vident **en silence**.

⮕ **Une seule décision principale par session** (règle 6).

---

## ⏳ CE QUI EST DÛ PAR GRÉGOIRE — ne pas le coder à sa place, ne pas l'oublier

**Neuf, ou remis à jour le 2 septembre :**

- ⏸ **Pousser la release 1.109.2.** Elle est commitée et **non poussée** — elle
  n'existe que sur sa machine.
- **Le message Teams à la communauté de pratique** sur l'adresse unique. Le
  changelog s'affiche DANS l'application, donc derrière la porte : quelqu'un qui a
  un vieux signet rencontre l'écran de code AVANT de pouvoir le lire. *(Rédigé,
  attend sa correction.)*
- ✅ **Les identifiants qui portent un prénom de collègue** *(#690b)* : **tranché le
  2 septembre — ils partent tous, et le retrait ne coûte rien.** Mesuré : les huit
  identifiants d'échelles sont inertes. Plus rien ne lui est dû sur ce point ; la
  consigne du jour porte le geste.
- **Deux attributions d'idée** (« l'algorithme propose, le jugement tranche —
  Voisard ») : si la formule vient d'une source publiée, elle se cite en règle au
  lieu de disparaître ; sinon elle part. **Question d'honnêteté intellectuelle, pas
  de code** — elle lui sera posée avec les deux lignes exactes sous les yeux.
- **Une porte terrain** sur « Partir d'un modèle » : cinq modèles fournis, aucun
  nommé par discipline. *Fait le 2 septembre pour la liste ; le contenu du modèle
  sommatif reste à ouvrir.*

**Repris tel quel, rien n'est réglé :**

- **Le test manuel de #612** : (1) `12345678_devoir.pdf` dans un groupe où ce DA
  n'existe pas → bandeau AVANT, ligne « Non associé » APRÈS ; (2) sans groupe-cours
  actif, tenter un import → refus dit, aucun fichier écrit.
- **Effacer `_to_delete/`** à la racine (déjà dans `.gitignore`).
- **Le facteur de normalisation 500 → 600** sur *Grille-1 FR-ALGO seul A26*.
  ⚠ **Entre deux évaluations, jamais au milieu d'une correction** : deux copies
  notées sous deux facteurs différents ne sont pas comparables.
- **La règle métier de #560** : que doit emporter la suppression d'un fichier ?
- **Les portes terrain jamais relevées** : #568 (cibles tactiles iPad), #572
  (hiérarchie des titres), #660 / #661 (zoom, iPad).
- **#598 volet B** — la balance des blancs, après avoir regardé ses images.
- **Le nom du service d'aide** pendant la transition CAF → Passerelle +.
  ⮕ **Le mandat ci-dessus en dépend.**

---

## LE TRI DU 2 SEPTEMBRE — où sont parties les leçons

*Règle 3 de `PROTOCOLE.md`. Rien n'a été jeté : tout ce qui a quitté ce fichier est
arrivé quelque part, et huit fichiers en portent la trace (`181d608a`, `a4b58eda`).*

| Ce qui a quitté ce fichier | Où c'est maintenant |
|---|---|
| Le piège du répertoire de démarrage (session hors dépôt → skills muets) | skill `debut-de-session-labo-codex` §0.5 |
| Les deux mesures d'ouverture (`rev-list`, verdict Playwright) | skill `debut-de-session-labo-codex` §2 |
| « Push réussi ≠ suite verte » | `CLAUDE.md`, §Avant chaque commit |
| L'ordre `commit → relecture → verdict → push`, et pourquoi le hook ne peut pas lancer la suite | skill `fin-de-session-labo-codex` §4.5 |
| **Le bump à quatre emplacements**, et `version.js` qui n'y était pas nommé | skill `release-et-changelog` §3 |
| Les sept règles du travail à plusieurs sessions | `PROTOCOLE.md`, règle 5 |
| La condition de la relecture croisée (cartographier AVANT) | `PROTOCOLE.md`, règle 2 |
| Un banc vert peut couvrir un écran cassé · `grep` la cible avant de planifier · l'assertion à borne · le break-test sans mutation · le JSDoc relié par la position · `ls` avant d'écrire un chemin | skill `verification-adverse` §8 |
| `head -n -1` n'existe pas sur ce Mac | skill `debug-labo-codex` |
| Le garde anti-cache ne surveille que `main.js` | skill `portes-terrain` |
| Les notes d'A2025 et H2026 ne sont pas rouvertes | `CLAUDE.md`, §Zones protégées |

⚠ **Deux destinations étaient PÉRIMÉES et ont été corrigées au passage** :
`release-et-changelog` prescrivait `npm test` (qui enchaîne Playwright, plus de dix
minutes) et n'énumérait pas `version.js` parmi les quatre points de vérité.
`debut-de-session` prescrivait `npm test` aussi. **La règle 3 ne déplace pas du
texte : elle répare les endroits qui donnaient de mauvaises instructions.**

⚠ **`CLAUDE.md` est à 250 lignes, EXACTEMENT au plafond.** La prochaine promotion
vers lui exigera un retrait délibéré, pas une compression.

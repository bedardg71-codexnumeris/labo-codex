# Consigne de démarrage à froid — les sessions qui prennent le relais

> Écrite le **31 août 2026, en soirée tardive**, par `kuekatsheu-9f`, qui a coordonné
> un trio (`67`, `94`) sur **S6 / #624**, plus une quatrième session (`5d`) pilotée
> directement par Grégoire sur des retours terrain. Elle **REMPLACE** celle du second
> trio, qui décrivait la fermeture de S5.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ;
> c'est elle qui fait foi. Un nom qui ne peut pas rôtir vaut mieux qu'une date qu'on
> oublie de retirer.

---

Ouvre le dépôt Monitorage_v6. Rituel d'abord : audit git + tests **avant** de croire
la moindre prémisse de ce fichier, puis lis le bloc en tête de `RELAIS.md`.

⚠ **Piège de démarrage payé cinq jours de suite** : si ta session s'ouvre dans
`/Users/kuekatsheu` et non dans le dépôt, **les skills et les agents de `.claude/` ne
se chargent PAS, en silence**. Lis leur fichier à la main.

---

## ⛔ LE MORATOIRE EST TOUJOURS ACTIF

Les trois gestes de l'écran Trimestres restent interdits. **La levée est une décision
de Grégoire, et il ne l'a pas prise.** Rien ce soir ne l'a approchée.

⮕ Toujours pas réparé, et à ne pas croire réparé :
- **le fichier « Exporter » n'a aucun chemin de restauration** ;
- **le snapshot d'archivage n'a aucun lecteur.**

⚠ Le premier a servi d'argument ce soir dans un arbitrage réel (#647) : une session
allait détruire une entrée de bibliothèque pour prouver son correctif. Elle ne l'a pas
fait, et elle a eu raison. **Le corpus de `file://` est le corpus RÉEL de Grégoire.**

---

## LE PROTOCOLE DE CRÉNEAUX — la trouvaille de méthode de ce cycle

Il n'existait pas ce matin. Il est né d'un incident et il a tenu le reste de la soirée.

· **Une seule session à la fois touche `file://`** — qu'elle **roule une suite** ou
  qu'elle **écrive dans un fichier de production**. Les deux faussent le verdict de
  celle qui roule. C'est la formulation d'une session, et elle est meilleure que la
  mienne : *modifier un fichier pendant que le hook teste l'ARBRE fausse le verdict
  aussi sûrement qu'un run concurrent — et ça peut produire un rouge qui RESSEMBLE à
  un vrai défaut.*
· **Les autres préparent hors dépôt** et ne déposent que quand c'est vert. Ça marche :
  les trois sessions l'ont fait, `git apply --check` et bancs compris.
· **Le créneau se rend explicitement.** Dis « créneau rendu », jamais « j'ai fini mon
  test » — l'autre ne peut pas savoir si tu comptes en relancer un.
· **Un seul push groupé en fin de cycle.** Le hook pre-push teste l'arbre entier
  (~8 min) : trois push le font tourner trois fois pour rien.
· ⚠ **L'ordre des créneaux se fait sur les DÉPENDANCES DE CONTENU, pas sur les
  périmètres de fichiers.** Erreur commise ce soir : j'avais ordonné deux sessions sur
  des fichiers disjoints, sans voir que la sentinelle de l'une visait le code de
  l'autre. Elle l'a vu avant moi. **Deux périmètres disjoints peuvent avoir un ordre
  obligé.** Et le vrai coût n'était pas le conflit : l'arbre aurait porté, entre les
  deux dépôts, **une sentinelle que personne n'a jamais vue verte**, que le push
  groupé aurait avalée sans rien dire.

---

## ⚠⚠ CE QUE CE CYCLE A APPRIS — les pièges neufs

**1. UNE SOMME COHÉRENTE PEUT COIFFER UN FICHIER DONT LE CORRECTIF A DISPARU.**
Une session a refermé une fenêtre de mutation sur une somme parfaitement cohérente
avec elle-même — sa sauvegarde datait d'**avant** son correctif, donc sa restauration
a reposé l'état d'avant. Elle allait annoncer « restauré » de bonne foi, avec une
preuve valide.
⮕ **Referme TOUJOURS sur l'EFFET** (un `grep` d'un marqueur distinctif du patch), pas
sur le jeton qui prétend l'attester. C'est le `grep` qui l'a rattrapée.

**2. UNE SOMME SANS SA MÉTHODE NE COMPARE RIEN.** `shasum` (SHA-1 des octets) et
`git hash-object` (avec en-tête de blob) donnent des valeurs différentes sur le même
contenu. Un écart de fermeture peut n'être qu'un écart d'outil.
⮕ **Méthode commune du dépôt : `git hash-object`.** C'est celle que git emploie, donc
celle qui décide de ce qui sera commité.

**3. ANNONCER ET AGIR DANS LE MÊME GESTE REVIENT À NE PAS DEMANDER.** Une session a
annoncé un run puis l'a lancé sans attendre la réponse ; il a chevauché un pre-push.
Sa propre formulation : *ça ne laisse à personne le temps de dire non.*
⮕ Une annonce qui n'attend pas de réponse est une notification, pas une demande.

**4. UN ÉTAT DU DÉPÔT RAPPORTÉ EST UN SOUVENIR, PAS UN FAIT.** Une session m'a décrit
un lot comme non commité alors qu'il l'était depuis longtemps. Sans vérification,
j'aurais commité deux fois ou cherché un fichier déjà parti.
⮕ **Mesure l'arbre au moment où tu le rapportes, ou dis qu'il date.**

**5. UN EXTRAIT DE CODE CITÉ SANS DIRE CE QU'ON EN A RETIRÉ EST FAUX À L'USAGE.**
J'ai cité un bloc en élidant quatre lignes — le garde exact qui traitait le cas.
La session a mesuré ce que je lui ai donné, trouvé un `TypeError` réel sur mon extrait,
et instrumenté un défaut inexistant.
⮕ Version « code » du chiffre qui voyage sans son scénario. **Cite entier ou dis ce
que tu coupes.**

**6. UNE RÉPONSE JUSTE À LA QUESTION POSÉE PEUT LAISSER DEHORS LA MOITIÉ QUI COMPTE.**
Deux fois ce soir, une confirmation de coordinatrice s'est révélée vraie-mais-partielle
(« les critères viennent de `grillesTemplates` » — exact pour la **cible**, faux pour
la **source**, qui vient de `cartouche.criteres`). Les deux fois, la session l'a
rattrapée en **lisant le code plutôt qu'en croyant**.
⮕ Le mode d'échec est pire qu'un simple rouge : des cas qui **échouent pour une raison
qui n'est pas celle qu'ils testent**, ou qui passent par accident.

**7. UN CAS DE TEST PEUT PORTER LE BON NOM ET LA MAUVAISE DONNÉE.** Un cas nommé pour
un garde précis employait une clé qui ne pouvait jamais atteindre ce garde : vert avec
le garde, vert sans lui. **Garde née morte, couverte par un cas jamais confrontant.**
⮕ Pour chaque cas, demande : *quelle mutation ce cas tue-t-il ?* S'il n'en tue aucune,
il est décoratif.

**8. « CAS DE DÉFAUT » ET « VERROU DE CONVENTION » SONT DEUX OBJETS DIFFÉRENTS.**
La formulation d'une session, et elle est meilleure que la mienne : *pour un cas de
défaut, « ce scénario peut-il se produire ? » ; pour un verrou de convention, « cette
règle peut-elle être défaite de bonne foi ? »*. Un cas peut échouer au premier test et
rester indispensable au second.
⮕ J'avais ordonné de retirer un cas sans producteur réel. C'était le **seul** témoin
d'une convention documentée. **Une convention documentée sans témoin s'érode.**

**9. UNE ASSERTION BRANCHÉE SUR UN DÉRIVÉ NE TESTE PAS SA SOURCE.** Trois occurrences
ce soir. La dernière : une alerte déclenchée par `A > 0 || B > 0` reste affichée si une
mutation verse A dans B. Tester « l'alerte apparaît » serait vert sur la fusion même
qu'on interdit.
⮕ **Asserte les deux nombres séparément, jamais l'affichage.**

**10. UN IDENTIFIANT DE CRITÈRE CONTIENT DÉJÀ UN SOULIGNÉ.** Les clés de commentaire
sont `critereId_niveauCode`, et les identifiants sont `CR_…` — semés
(`CR_COMPREHENSION`…) ou générés (`genererIdUnique('CR_')`). Découper au **premier**
souligné rend `CR` : pas un cas limite, **le cas général, 100 % des cartouches**.
Découper au **dernier** échoue aussi — les niveaux d'une échelle en pourcentage ont un
code **vide**, et `codesPersonnalises` est une saisie libre.
⮕ **Ne reparse pas une clé fabriquée par concaténation** : reconnais l'identifiant par
préfixe parmi ceux que tu connais, en gardant le plus long. Voir
`js/grilles.js` (`deplacerCartouchesVersAutreGrille`).

**11. UN GARDE MORT EST UNE BASCULE ARMÉE.** `retirerProductionDeLaBibliotheque`
n'existe nulle part : son `typeof === 'function'` est faux depuis toujours, et le
« fallback » est l'unique chemin. Il vise la bonne clé aujourd'hui — mais le jour où
quelqu'un déclare une fonction de ce nom, le chemin bascule **en silence** vers une
sémantique que personne n'a comparée. (#649)

**12. LE HOOK `security-ok` ACCEPTE LES DEUX LIGNES PRÉCÉDENTES, pas trois.** Et le
contrôle n'est **bloquant que si UNE SEULE ligne** réunit `.innerHTML =` **et** un
marqueur d'interpolation. Une note du dépôt affirmait le contraire depuis mai ; elle
était **fausse dès l'écriture** (`git log -S` date la règle réelle de douze jours
avant). Corrigée.
⮕ **N'acquitte pas ce qui ne se déclenche pas** : une tolérance survit à sa raison et
fait croire à un danger que quelqu'un aurait revu. Règle d'écriture à la place : **ne
jamais ramener un `${` sur la ligne de l'affectation.**
⚠ Et le hook cherche littéralement `echapperHtml` ; `js/donnees-v2.js` emploie
`escapeHtml`. Les deux échappent, **seul le premier éteint le contrôle**.

**13. UN ACCENT GRAVE DANS UN COMMENTAIRE ÉCRIT À L'INTÉRIEUR D'UN LITTÉRAL DE GABARIT
TERMINE LE GABARIT.** Payé deux fois en vingt minutes par la même session. La seconde
fois, le symptôme était `ReferenceError: Can't find variable: afficherCriteresDepuisGrille`
— qui ne ressemble en rien à sa cause. ⮕ `node --check` après chaque patch.

---

## CE QUI A ÉTÉ FAIT — neuf identifiants, #644 à #652

⚠ **Distingue les CORRIGÉS des CONSTATS INSCRITS.** Quatre des neuf n'ont pas été
corrigés, et trois portent une cause **lue, pas mesurée** — c'est écrit dans l'item.
Ne les cite pas comme des faits acquis.

| ID | État |
|---|---|
| **#644** | CORRIGÉ — le cadenas de palette ; la CAPTURE mangeait le clic, pas `preventDefault()` |
| **#645** | CORRIGÉ — saisie algorithmique perdue à la bascule ; **DEUX causes**, la seconde trouvée par accident de banc |
| **#646** | **CONSTAT** — `evaluationEnCours` désigne deux emplacements sous un nom ; partie mesurée / partie raisonnée séparées dans l'item |
| **#647** | CORRIGÉ — la modal annonçait une perte inexistante et taisait une survivance |
| **#648** | **CONSTAT** — la garde d'échelle compte le mauvais référent, et sur un seul trimestre |
| **#649** | **CONSTAT** — garde mort (`retirerProductionDeLaBibliotheque`) |
| **#650** | CORRIGÉ — la porte de sortie des échelles écrivait hors file |
| **#651** | OUVERT — « annoter » sans palette depuis le mode Évaluer ; **cause lue, pas mesurée** |
| **#652** | **CONSTAT** — une attente expire sur des éléments présents ; rien de mesuré |

---

## S6 / #624 — CE QUE LA MESURE A TROUVÉ, ET QUI DÉPASSE L'ÉNONCÉ

Ce n'était pas « un chemin non gardé ». C'était **sept portes de suppression sous
trois régimes qui se contredisent**, plus une **implémentation parallèle privée des
cinq familles** dans l'onglet Données — cinq fonctions homonymes dans une IIFE qui
**masquent** les publiques. Même bouton « Supprimer », deux issues opposées, et
l'enseignant ne peut pas savoir laquelle il actionne.

⚠ **Le motif à retenir au-delà de ce lot** : *deux emplacements, un seul nom, personne
ne le voit.* Il est apparu **deux fois le même soir sous deux formes inverses** — une
IIFE qui masque un `window.X` (#624), et un `let` de premier niveau qui empêche le
`window.X` d'exister (#646).

**La forme de la porte de sortie a été tranchée par Grégoire** après qu'une prémisse
de ma présentation se soit révélée fausse : une évaluation **pointe** son échelle
(changer le pointeur suffit), mais une cartouche **copie** les critères de sa grille.
Le patron ne se porte pas mécaniquement. Décision retenue : **déplacer + remapper par
ID puis par NOM, et NOMMER les commentaires sans correspondance** plutôt que de les
perdre en silence.

---

## RÉSERVES QUE LES SESSIONS ONT POSÉES SUR LEURS PROPRES VERTS — à ne pas perdre

· Le témoin de #647 a tourné dans un **contexte WebKit neuf, sans trimestre actif** :
  `cle('X')` y rend `'X'`. Le chemin de code est identique, mais **le namespacing par
  trimestre n'a PAS été exercé**. Ce vert dit « les libellés sont justes » ; il ne dit
  rien du trimestre archivé.
· Le fait de #645 sur la liaison du nom nu est vrai **du banc**, pas du chemin de la
  visionneuse chez Grégoire. **N'innocente pas #646.**
· #647 est établi **par lecture de code, pas par exécution** : la structure dit que la
  cartouche survit dans l'ancrage, seules les **données** diraient combien sont dans
  les deux magasins à la fois.
· ⚠ Un bloc d'avertissement de la modal de suppression est **masqué** quand la liste
  est vide, mais son `innerHTML` **garde le texte de l'ouverture précédente**.
  Invisible aujourd'hui ; le jour où quelqu'un le démasque ou lit son contenu sans
  lire sa visibilité, il verra l'avertissement de la ressource **précédente**.
  Comportement préexistant, non inscrit — à inscrire si quelqu'un le rencontre.

---

## S6 / #624 — CE QUI EST FAIT, ET CE QUI NE L'EST PAS

⚠ **#624 N'EST PAS COCHÉ, et il ne doit pas l'être.** Son titre promet deux volets ;
un seul est fait.

**LIVRÉ — le volet « chemins » côté GRILLES.** Les quatre portes de `js/grilles.js`
délèguent à `supprimerGrilleAvecPorteDeSortie`, qui bloque, NOMME les cartouches et
offre de les déplacer avec remappage des critères. Plus #650 en précondition, et #647
pour l'avertissement qui mentait.

**RESTE OUVERT :**
· **les `ECHELLE_DEMO` résiduelles et la CAUSE de #542** — pas touchées.
  ⚠ **Les chiffres 383 → 44 sont RAPPORTÉS, pas remesurés**, et ils voyagent depuis
  plusieurs sessions. Qui s'en sert doit les remesurer avant d'y greffer une décision.
· **les chemins nus côté ÉCHELLES.** `supprimerEchelle` et
  `supprimerEchelleDefinitivement` sont nus. `supprimerEchelleDeBibliothequePartagee`
  l'est **délibérément** — la bibliothèque n'est pas namespacée, l'import conserve
  l'id, rien n'y est orphelin. **C'est une frontière, pas un oubli.**
· **la sixième porte a son corps propre dans `js/donnees-v2.js:1624`**, pas dans
  `js/echelles.js`. Qui reprend le volet commence là.
· ⮕ **Et le patron à porter est celui que #650 vient de rendre sûr, pas celui d'avant.**
· **#648**, **#649**, **#653**, et les **quatre autres paires d'homonymes** de
  `donnees-v2.js`, jamais comparées.

---

## ÉTAT MESURÉ À LA FERMETURE

**Branche `main`.** Version inchangée **1.106.13**, build `0831-0734` — **aucune
release**. **Cinq jetons `?v=` posés** : `20260831g` (travaux-outils), `h`
(evaluation-chargement), `i` (donnees-v2), `j` (echelles), `k` (grilles).
⚠ **Recharge ta session `file://`.**

**Vitest : 421 fichiers / 4464 tests, CODE DE SORTIE 0.**
**Playwright WebKit : **226 passés, CODE DE SORTIE 0.****
Lus **après** le dernier changement.

**Dernier ID utilisé : #653.** Prochain libre : **#654**.

---

## PROPOSE-LUI UN CHOIX FERMÉ ENTRE

**(a)** **Finir le volet ÉCHELLES de #624** — le plus continu. La cartographie des cinq
chemins existe, la frontière du chemin légitimement nu est établie, et le patron à
porter est celui que #650 a rendu sûr. C'est la moitié manquante du titre.
**(b)** **#651** — « annoter » ouvre la page sans palette depuis le mode Évaluer.
Retour terrain, cause **lue mais pas mesurée**, remède étroit identifié. Une session
l'avait commencé et attendait un créneau.
**(c)** **Les quatre paires d'homonymes de `donnees-v2.js`** — l'onglet Données fait
tourner une implémentation parallèle privée des cinq familles. Une seule (cartouche) a
été traitée. C'est le chantier qui explique le plus de défauts d'un coup.
**(d)** **Une porte terrain** — plusieurs chantiers attendent une vérification
iPad/Safari que les sessions ne peuvent pas faire à sa place. Et **#647 n'a PAS exercé
le namespacing par trimestre** : c'est une vérification que seul un vrai corpus donne.

⮕ **Une seule décision principale par session.**

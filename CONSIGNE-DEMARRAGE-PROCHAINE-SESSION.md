# Consigne de démarrage à froid — les sessions qui prennent le relais

> Écrite le **31 août 2026, en soirée**, par `kuekatsheu-14`, qui a coordonné un trio
> (`80`, `f2`) sur les **plans de travail issus des audits Fable 5**, plus une quatrième
> session (`c6`) pilotée directement par Grégoire sur un retour terrain de zoom.
> Elle **REMPLACE** celle du troisième trio.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ;
> c'est elle qui fait foi. Un nom qui ne peut pas rôtir vaut mieux qu'une date qu'on
> oublie de retirer.

---

Ouvre le dépôt Monitorage_v6. Rituel d'abord : audit git + tests **avant** de croire la
moindre prémisse de ce fichier, puis lis le bloc en tête de `RELAIS.md`.

⚠ **Piège de démarrage payé six jours de suite** : si ta session s'ouvre dans
`/Users/kuekatsheu` et non dans le dépôt, **les skills et les agents de `.claude/` ne se
chargent PAS, en silence**. Lis leur fichier à la main.

---

## ⛔ AVANT TOUT — DEUX MESURES QUE PERSONNE N'AVAIT FAITES DEPUIS CINQ JOURS

**Elles prennent dix secondes et elles ont trouvé deux retards ce soir.**

```bash
git log --oneline origin/main..HEAD | wc -l    # doit rendre 0
```
⮕ À l'ouverture de ce cycle, il rendait **8** : tout le travail du troisième trio, **son
propre relais compris**, ne vivait que sur cette machine. Personne ne l'avait vu. Soldé.

```bash
cd tests && node ../scripts/verifier-playwright.mjs
```
⮕ **La suite Playwright n'avait pas tourné depuis le 26 août** — 299 commits, dont 35
touchant `tests/integration/`. Quand on l'a enfin lancée, elle était **rouge**. Elle
l'est encore à deux (voir plus bas).

⚠⚠ **ET VOICI POURQUOI PERSONNE NE L'AVAIT VU — la chose la plus importante de ce
fichier. « PUSH RÉUSSI » NE SIGNIFIE PAS « SUITE COMPLÈTE VERTE », ET NE LE SIGNIFIERA
JAMAIS.** Le hook pre-push lance **Vitest seulement**. Pour Playwright, il constate
qu'aucun verdict local n'existe **et laisse passer**. Ce n'est pas une prudence, c'est
une **impossibilité structurelle** : la suite dure **plus de dix minutes** sur cette
machine — pas les « ~4 min » annoncés — et six minutes de silence ferment la connexion au
serveur (#533). **Le hook ne PEUT pas la lancer.**
⮕ Depuis le 26 août, **aucun push n'a été bloqué par un rouge Playwright, parce qu'aucun
push ne l'a jamais consultée.**
⮕ **Un spec seul se lance en secondes** et départage mieux qu'une suite complète :
`cd tests && npx playwright test integration/<spec>.js`. C'est ce geste qui a tranché ce
soir, après qu'un run de dix minutes eut été lancé pour rien.

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

## ⚠⚠ LE PIÈGE QUI A COÛTÉ LE PLUS — LE BUMP A QUATRE EMPLACEMENTS, PAS TROIS

**`version.js` (RACINE) est le seul que l'application lise en `file://`.** C'est un
jumeau généré de `version.json`, créé parce qu'en `file://` **`fetch` et XHR sont refusés
par WebKit** (#495). Il est chargé par `index.html`, et `js/init-inline.js:235-237` lui
donne la **PRIORITÉ** :

```js
if (window.__VERSION__.build) BUILD_ID = window.__VERSION__.build;
```

⮕ **Les trois emplacements habituels (`version.json`, `init-inline.js`, `main.js`) sont
un REPLI. `version.js` décide de ce que Grégoire voit à l'écran.**

Ce soir, un bump `1.106.13 → 1.106.14` fait à la main sur trois emplacements a laissé
`version.js` en arrière : **l'application a continué d'afficher `1.106.13`**, et quatre
cas de `bandeau-maj-chargement.spec.js` ont rougi. Corrigé — **#665**, `e373bd8a`.

⚠ **Le bump MANUEL est le seul chemin qui puisse les désynchroniser** : `release.mjs`
écrit `version.json` et `version.js` ensemble et documente lui-même les 4 endroits. Or le
bump manuel est exactement ce qu'on fait quand plusieurs sessions partagent le dépôt et
qu'on refuse `release.mjs`, qui recalcule les jetons de tout l'arbre.

⮕ **RÈGLE : après tout bump manuel, `grep` l'ANCIEN build dans tout le dépôt et exiger
ZÉRO.** Vérifier « les quatre » ne suffit pas si on ne sait pas qu'il y en a quatre.
⚠ Le jeton de `version.js` suit un AUTRE format : **`MMJJHHMM`** (le build sans tiret),
pas le `AAAAMMJJ`+lettre des autres.
⚠ Et le hook pre-commit **refuse** un bump qui n'a pas bumpé les jetons de
`js/init-inline.js` et `js/main.js` — les deux fichiers que le bump lui-même modifie.

---

## ÉTAT MESURÉ À LA FERMETURE

**Branche `main`, version `1.106.14`, build `0831-1552`.** `origin/main` = **`e373bd8a`**,
**zéro commit non poussé**. Arbre propre (trois non suivis antérieurs au cycle).

**Vitest : VERT** (hook pre-push, deux fois).
⚠⚠ **Playwright WebKit : ROUGE À DEUX, cause NON établie.** Mesurés **isolément, machine
libre** — ce ne sont ni de la contention ni du flaky :
- `modal-soutien.spec.js` › « modale Soutien : Échap et clic sur l'arrière-plan ferment »
- `palettes-drag-rendu.spec.js` › « #144 · layout annotation : palette Annotation
  déplaçable, position hors zone bornée »

⚠ **Le second touche la palette d'ANNOTATION, c'est-à-dire l'écran que #660/#661 viennent
de modifier.** À regarder pour lui-même : **un vert ailleurs ne le blanchit pas.**

**Dernier ID utilisé : #665.** Prochain libre : **#666**.
⚠ **#662 est RÉSERVÉ** — les 4 gardes `IDS_GABARITS_HARDCODES` de `js/echelles.js`
(957, 2642, 2681, 4350), à écrire quand ce fichier sera libre.

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

## LE PROTOCOLE DE CRÉNEAUX — il a tenu à quatre sessions

· **Une seule session à la fois touche `file://`** — qu'elle roule une suite ou qu'elle
  écrive dans un fichier de production.
· **Le créneau se rend explicitement**, et en deux temps : « rendu, stabilisé » ou
  « rendu, mais j'y reviens ». Ce n'est pas la même chose pour qui va rouler une suite.
· **Une annonce qui n'attend pas de réponse est une notification, pas une demande.**
· **GRÉGOIRE N'EST PAS SOUMIS AU PROTOCOLE, et c'est normal.** Sa session PRÉVIENT, elle
  ne demande pas. Un créneau accordé signifie « personne d'autre du TRIO ne touche
  l'arbre », **pas** « l'arbre est gelé ». **Le dire explicitement aux sessions** : sinon
  elles instruisent comme un défaut un rouge venu d'une écriture qu'elles ignoraient.
· **Le geste qui DÉCALE passe en dernier.** Un retrait de 165 lignes périme tout repère en
  aval ; une insertion ne périme rien.
· **`BACKLOG.md` appartient à la coordinatrice seule** : les sessions passent le texte
  prêt, elle inscrit et confirme.
· ⚠ **Tout lot touchant un `js/` touche mécaniquement le bloc des balises d'`index.html`**
  (le hook exige un jeton neuf). **L'inscrire dans le périmètre dès le mandat** — aucun
  mandat de ce cycle ne l'avait prévu, et trois sessions s'y sont retrouvées ensemble.
· ⚠ **Deux suites concurrentes se polluent comme deux workers** : tous les specs ouvrent
  le MÊME `index.html` en `file://` et partagent le `localStorage` de cette origine.

---

## LA RELECTURE CROISÉE — à refaire, et voici la condition

Née d'une attente : Grégoire pilotait l'écran, le trio ne pouvait ni écrire ni rouler.
Chacune a relu le lot de l'autre. **Quatre défauts réels trouvés**, dont un `id:`
inconditionnel qui écrasait une valeur assainie sur un fichier sous surveillance sécurité.

⚠ **LA CONDITION, mesurée** : la relectrice avait **cartographié l'état AVANT** plutôt que
de lire le patch seul. *Lire un patch seul, c'est lire ce que l'auteur a décidé de
montrer.* Sa cartographie disait **où le risque naîtrait s'il naissait**.
⚠ **Piège** : un patch qui vit dans le scratchpad d'une session n'est pas relisible par
une autre. **Le faire transiter explicitement.**

⮕ **Et l'argument qui justifie tout le dispositif**, donné par la session qui en a fait
les frais : *on ne voit pas dans son propre code ce qu'on vient d'écrire, même quand on
sait exactement quoi chercher.* Elle avait nommé le risque en désignant la cible à sa
relectrice — **dix minutes après l'avoir commis**.

---

## ⚠ LES PIÈGES DE MESURE — ils ont frappé les trois sessions

**UN ZÉRO SANS TÉMOIN.** Cinq occurrences en une soirée. Un motif trop étroit rend un zéro
rassurant pour la mauvaise raison : `grep -c "config'"` qui n'attrape que ce qui est suivi
d'une apostrophe · `^/\*\*$` ancré sans tolérer l'indentation (2 au lieu de 6) ·
`grep -c 'configuration'` sur le mot NU, qui compte la prose des commentaires (**157 au
lieu de 45**).
⮕ **Le témoin d'un zéro, c'est LE MÊME MOTIF RENDANT NON-ZÉRO AILLEURS.** Publier les deux
comptes côte à côte.
⚠ À chaque fois le raisonnement tenait ; **le risque est pour l'ÉCRIT**. Un item qui porte
un nombre obtenu par un motif non dit est invérifiable dans six mois. **Inscrire la
MÉTHODE avec le nombre.**

**UNE ASSERTION PEUT ÊTRE VRAIE ET NE TUER AUCUNE MUTATION.** `toBeGreaterThanOrEqual(2)`
sur quatre appels : en retirer un en laisse trois, et `3 >= 2` reste vrai. ⮕ **Toute
assertion qui porte une borne : demander quelle mutation elle laisse passer.**

**UN BREAK-TEST VERT PEUT VENIR D'UNE MUTATION JAMAIS APPLIQUÉE.** ⮕ **Un témoin par
mutation, ciblé sur ce que CETTE mutation change**, lu AVANT de lancer.

**`head -n -1` N'EXISTE PAS SUR CE MAC** : il échoue, et sa redirection produit un fichier
de **0 octet** que `node --check` valide. ⮕ `sed '$d'`, et **mesurer l'EFFET après toute
réécriture**.

**`js/pratiques/` EST CITÉ À PLAT — trois fois en 24 h.** Le fait est juste, le chemin est
faux : personne ne remet le fait en cause, et personne ne peut le recouper. ⮕ `ls` avant
d'écrire un chemin.

**UN JSDoc N'EST RELIÉ À SA FONCTION QUE PAR LA POSITION.** Une extraction déplace le
corps ; la doc reste et change de sujet sans bouger. ⮕ **À quelle fonction ce bloc est-il
collé MAINTENANT ?**

**LE GARDE ANTI-CACHE NE SURVEILLE QUE `main.js`.** Tout autre fichier corrigé peut
arriver **périmé** dans un navigateur sans aucun signal — Grégoire a jugé Safari sur du
code qui n'était pas celui du disque. ⮕ **Une porte terrain rendue sans bump vérifié porte
sur du code inconnu.**

---

## PROPOSE-LUI UN CHOIX FERMÉ ENTRE

**(a)** **Les deux rouges Playwright** — cause non établie, mesurés isolément donc réels,
et `palettes-drag-rendu` touche l'écran que #660/#661 viennent de modifier. **C'est le
seul chantier qui porte une incertitude sur du code déjà poussé.**
**(b)** **Déposer les deux lots préparés** — tout est écrit, break-testé sur son cœur,
sauvé. **Ordre obligé : `#659` d'abord** (il arrête une écriture active), **puis
S9a/#627**, **puis `#628`** (le retrait de 165 lignes passe en dernier).
**(c)** **La porte terrain iPad** de #660/#661 — seul Grégoire peut la donner.
**(d)** **Le volet ÉCHELLES de #624**, ouvert depuis le troisième cycle :
`supprimerEchelle` et `supprimerEchelleDefinitivement` sont nus, et la sixième porte a son
corps propre dans `js/donnees-v2.js:1624`.

⮕ **Une seule décision principale par session.**

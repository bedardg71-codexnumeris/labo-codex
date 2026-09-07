# PORTES TERRAIN — Reporter les absences dans Léa (1.124.0)

> ## ⛔ CLOSE — LE MODULE EST ABANDONNÉ (décision de Grégoire, 7 sept. 2026, en fin de matinée)
>
> **Ne pas exécuter cette liste.** Elle a été passée en entier le 7 sept. à 09 h 52
> (10 passées, 2 échecs), puis Grégoire a tranché : le panneau ne fait que trier
> l'information à recopier, la saisie dans Léa reste manuelle, et **rien ne prouve
> que Léa accepte une entrée en masse**. Sans copier-coller possible, le gain se
> compte en dizaines de secondes pour trois ou quatre absents. Retour à l'état
> d'avant 1.124.0 demandé.
>
> **Ce qui SURVIT au retrait et reste dû** (signalé par Grégoire au même moment,
> hors du panneau) : *« l'enregistrement semble instable, j'ai dû saisir et
> enregistrer les présences à plusieurs reprises »*. C'est la saisie des présences
> elle-même, pas le module de report. À reproduire et à inscrire.
>
> Le relevé complet de la passation est conservé plus bas, section AU RETOUR.

**7 septembre 2026** · release `minor` **1.124.0**, build **0907-0834**
Branche `claude/bokadex-lea-presence-transfer-e6ynxi` · **fusionnée dans `main` et déployée** (commits `95195d6e` → `e05355f3`, 7 sept.)
Artefact jumeau publié par Cowork le 7 sept. : https://claude.ai/code/artifact/ffd40fff-45ac-430f-9fd9-27b72e13a44d

> **Cette liste est courte, et c'est voulu.** Règle 1 du skill `portes-terrain` :
> une porte n'existe que si aucune machine ne peut répondre. Le calcul est couvert
> par 16 tests Vitest et 5 break-tests rouges ; l'échappement, les contrastes et le
> rendu dans les deux modes ont été mesurés au navigateur (Chromium) pendant la
> session. **Il ne reste que ce qui exige Safari, ton iPad, ou ton vrai groupe.**
>
> Règle 2 : rien ici n'est un préalable. **Le module ne peut écrire nulle part** —
> ni dans Codex, ni dans Léa. Un raté se voit et se dit.
>
> Ce qui échoue devient un item de backlog, pas une note mentale.

---

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | Recharge l'application (vidage de cache si un onglet était déjà ouvert) et lis le numéro en bas de page. | **1.124.0**. Si tu lis 1.123.x, le reste de cette liste juge du code que tu n'as pas. |

⚠ ~~Un `git pull` t'est nécessaire cette fois~~ — **fait le 7 sept. en début
d'après-midi.** Le clone de Grégoire porte bien 1.124.0 / `0907-0834` (mesuré par
Cowork dans `version.json`). Il n'y a plus rien à tirer : seul le rechargement
de l'application reste dû.

---

## §1 · ⚠⚠ Données

**Aucune.** Le module `presences-transfert.js` ne contient aucune écriture :
ni `db.set`, ni `localStorage.setItem`, ni sauvegarde. Vérifié par recherche sur
tout le fichier. Aucun backup n'est requis avant cette liste.

---

## §2 · Ce que seules Safari et ton iPad peuvent dire

### 2.1 Le panneau s'ouvre et se lit sur iPad `iPad`

> **POURQUOI** — Le panneau est neuf, et il apporte une puce « RàI » dont le style
> n'existait pas. Tout ce qui a été mesuré l'a été dans Chromium ; WebKit n'existe
> pas dans les conteneurs où travaillent les sessions.

| | Geste | Attendu |
|---|---|---|
| 2.1a | Sur l'iPad, va dans Suivi › Saisie des présences, choisis une date de séance déjà saisie, et touche **« Reporter dans Léa »**. | Un panneau s'ouvre au-dessus du tableau, avec la date en toutes lettres et un tableau de quelques lignes. |
| 2.1b | Regarde la mention **RàI** si un élève en porte une. | Une petite puce encadrée, lisible, à droite du nom. Pas un texte pâle noyé dans la ligne. |
| 2.1c | Bascule en mode sombre, puis en mode clair. | Le panneau reste lisible dans les deux. Aucun texte qui disparaît dans son fond. |
| 2.1d | Touche **« Fermer »**, puis rouvre. | Le panneau se referme et se rouvre. La cible se touche du doigt sans viser. |

### 2.2 L'ordre correspond vraiment à celui de Léa `⚠ ton corpus`

> **POURQUOI** — C'est la seule chose qui décide si le panneau te fait gagner du
> temps. Le tri suit « Nom, Prénom » avec un classement français des accents
> (« Laguë » se range entre « Lafond » et « Lebel »), ce qu'un test vérifie déjà.
> Ce qu'aucun test ne peut vérifier, c'est que Léa classe **de la même façon** un
> nom composé, une particule ou une majuscule accentuée dans ta vraie liste.

| | Geste | Attendu |
|---|---|---|
| 2.2a | Ouvre côte à côte le panneau de Codex et ta page Léa « Absences et retards », sur la même séance. | Les élèves que le panneau nomme se retrouvent dans Léa. |
| 2.2b | Descends la liste de Léa en cherchant chaque **DA** du panneau, dans l'ordre où le panneau les donne. | Tu descends toujours, jamais tu ne remontes. Si tu dois remonter, note quel nom a été mal classé — c'est un défaut réel. |

### 2.3 Le compte tombe juste sur une vraie séance `⚠ ton corpus`

> **POURQUOI** — Codex compte les présences, Léa réclame les absences. Le panneau
> fait l'inversion : il montre les périodes de la séance, celles que tu as saisies,
> et l'absence qui en découle. Tu peux donc le contredire.

| | Geste | Attendu |
|---|---|---|
| 2.3a | Sur une séance que tu te rappelles, compare la colonne « Présent » du panneau à ce que tu as saisi. | Les deux disent la même chose. |
| 2.3b | Vérifie que la colonne « À saisir dans Léa » vaut bien la différence. | Séance de 2 périodes, 1 période présente → 1. Séance de 2, aucune présence → 2. |
| 2.3c | S'il y a un bloc « élèves sans aucune saisie », vérifie qu'il ne contient que des élèves que tu n'as effectivement pas comptés ce jour-là. | Aucun élève réellement saisi ne s'y trouve. Aucun d'eux n'apparaît dans la liste à reporter. |

### 2.4 Changer de date ne laisse pas un panneau menteur

| | Geste | Attendu |
|---|---|---|
| 2.4a | Le panneau ouvert, change la date de séance dans le champ au-dessus. | La date en gras dans le panneau change aussi, et les lignes se refont. **Un panneau qui garderait l'ancienne date est un défaut grave** : tu écrirais de vraies absences sur la mauvaise séance. |
| 2.4b | Le panneau ouvert, change de sous-groupe s'il y en a. | Même chose : les lignes se refont. |

---

## §3 · Ce qui attend ton verdict

**Ce ne sont pas des vérifications.** Ce sont des choix que je ne peux pas faire à
ta place. Écris ta réponse, ne coche rien.

| | Question | Ta réponse |
|---|---|---|
| 3.1 | **Un rattrapage annule-t-il l'absence au cours régulier, du point de vue de ton cégep ?** Aujourd'hui le panneau ne déduit rien : il reporte l'absence entière et pose la puce « RàI » à côté du nom. C'est BACKLOG #747, ouvert depuis le 5 septembre. Si ton cégep a une règle, on l'appliquera. | ………………… |
| 3.2 | **Le panneau devrait-il aussi montrer les présents ?** Aujourd'hui il ne montre que les élèves à reporter, plus un compte (« 24 présents sur 28 »). C'est ce qui le rend court. | ………………… |
| 3.3 | **As-tu d'autres groupes où le nombre d'absents par séance est beaucoup plus élevé ?** Tu as dit « trois ou quatre, ça dépend des cours et des enseignants ». Si un de tes groupes tourne à douze ou quinze, la transcription à la main redevient coûteuse et la question du remplissage automatique se rouvre. | ………………… |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Safari, sur Mac comme sur iPad.** WebKit n'existe pas dans les conteneurs de
  session. Tout ce que j'ai mesuré l'a été dans Chromium. C'est la raison d'être
  du §2.1.
- **Playwright.** Non lançable ici (`WebKit introuvable`, #456). La suite Vitest
  est verte, 502 fichiers / 5551 tests, dont les 16 neufs. Le verdict Playwright
  viendra de la CI.
- **Ta vraie page Léa.** Je n'ai vu qu'une ligne de son tableau, que tu m'as
  transmise. Le panneau ne touche pas à Léa, donc rien ne peut mal tourner de ce
  côté, mais je n'ai pas pu confronter l'ordre de tri au sien : §2.2.
- **Une erreur de la session, rattrapée.** J'ai d'abord écrit la puce « RàI » sur
  deux variables CSS (`--orange-clair`, `--orange-fonce`) qui n'existent pas dans
  `styles.css` : elle rendait sans fond ni couleur. C'est la mesure au navigateur
  qui l'a attrapée, pas la relecture. La classe a été refaite sur des variables
  réelles, et le contraste mesuré à 15,9:1 en clair et 7,2:1 en sombre. ⮕ La même
  déclaration existe depuis longtemps dans `.badge-sa` (le badge des Services
  adaptés), qui est donc sans couleur lui aussi : inscrit **#778**, pas corrigé.
- **Une divergence assumée.** L'inversion « présences → absences » est maintenant
  calculée à deux endroits : le PDF de la grille imprimable (#485) et ce panneau.
  Les deux s'accordent sur toute donnée saine. Inscrit **#780**.
- **Ce que j'ai d'abord recommandé, et écarté.** Un bookmarklet remplissant les
  cases de Léa était faisable — le test de faisabilité est passé sur ta page. Il a
  été écarté sur ton objection : chaque enseignant aurait dû l'installer à la main.
  Si le §3.3 fait apparaître des groupes à douze absents, la question se rouvre.

---

## AU RETOUR

1. Trier les échecs : défaut réel, ou build en retard (relire §0.1) ?
2. Verser chaque échec réel au BACKLOG, avec son numéro de porte.
3. Mettre à jour ce fichier : état, date, ce qui reste dû.

---

## RELEVÉ DE LA PASSATION — 7 septembre 2026, 09 h 52

BILAN : 10 passées · 2 échecs · 0 non traitée.

**Passées** : 0.1 · 2.1a · 2.1b · 2.1c · 2.1d · 2.2a · 2.2b · 2.3a · 2.3b · 2.3c.
Le tri n'a jamais fait remonter dans la liste de Léa (2.2b) : **l'ordre du panneau
s'accorde au sien**. C'est le seul acquis technique du lot qui mérite d'être retenu.

**Échec 2.4a** — « le panneau ne se met pas à jour quand je change de date ». C'est
le défaut grave annoncé par la porte : le panneau garde l'ancienne séance. Sans
conséquence désormais, le module étant retiré.

**Échec 2.4b** — sans objet : *« je n'ai pas de sous-groupe et je ne connais pas ce
concept »*. ⮕ Une porte a été posée sur une notion qui n'existe pas dans son usage.

**Retard sur 2.1a** — le bouton n'apparaissait ni sur Mac ni sur iPad :
`restaurerCompteurPresences()` (`js/saisie-presences.js:2007`) régénère
`#actions-presences-bar` en `innerHTML` et écrasait le bouton ajouté à
`index.html`. Deux définitions de la même barre. **Ce défaut de structure survit au
retrait du module** et retombera sur le prochain lot qui ajoutera un bouton là.

**Défaut de confidentialité mesuré à la passation** : le panneau affichait le vrai
nom et le vrai DA d'un élève **alors que le mode anonymisation était actif**, la
case du bandeau du bas non cochée. Disparaît avec le module ; à vérifier qu'il
n'existe nulle part ailleurs.

### Réponses de Grégoire aux trois décisions (§3)

| | Question | Réponse |
|---|---|---|
| 3.1 | Un rattrapage annule-t-il l'absence au cours régulier ? | **C'est l'enseignant qui juge** si un rattrapage reprend une absence. Ce n'est donc pas une règle institutionnelle automatisable. ⮕ Ferme #747. |
| 3.2 | Le panneau devrait-il montrer les présents ? | Non. |
| 3.3 | D'autres groupes à beaucoup plus d'absents ? | Pas lui ; peut-être d'autres utilisateurs. ⮕ La question du remplissage automatique ne se rouvre pas pour la cohorte 1. |

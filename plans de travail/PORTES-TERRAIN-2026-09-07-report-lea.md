# PORTES TERRAIN — Reporter les absences dans Léa (1.124.0)

**7 septembre 2026** · release **1.124.1**, build **0907-0938**
> ⚠⚠ **RELEVÉ DU JOUR MÊME : 2.1a A ÉCHOUÉ, ET C'EST CORRIGÉ.** Le bouton « Reporter dans Léa »
> n'apparaissait nulle part, sur Mac comme sur iPad. La barre d'actions de la saisie existait en
> DEUX exemplaires — un dans `index.html`, un second en gabarit `innerHTML` dans
> `saisie-presences.js` — et le second écrasait le premier au premier rendu d'une séance. Le
> bouton, ajouté au seul `index.html`, était détruit avant d'avoir pu être cliqué.
> ⮕ **Corrigé en 1.124.1** : le JS ne reconstruit plus rien, il bascule la visibilité de deux
> blocs. La barre n'a plus qu'une définition. **Reprendre cette liste à partir de 2.1a**, sur un
> build qui affiche **1.124.1**.
Branche `claude/bokadex-lea-presence-transfer-e6ynxi` · **non fusionnée dans `main`** (voir `RELAIS.md`)

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

⚠ **Un `git pull` t'est nécessaire cette fois** : cette session a travaillé sur une
branche, pas dans ton clone. Les fichiers de ton disque sont encore en 1.123.12
tant que la branche n'est pas fusionnée.

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

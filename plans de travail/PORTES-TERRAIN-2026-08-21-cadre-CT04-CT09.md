# PORTES TERRAIN — Cadre du trimestre : CT-04, CT-09, CT-29 (21 août 2026)

> **Cycle** : voie parallèle « Cadre du trimestre », branche
> `claude/code-terminal-c0-instances-2rbbr0`, commit `73260e79`.
> **Artefact interactif** (l'OPÉRATION — ce fichier est la TRACE) :
> <https://claude.ai/code/artifact/00ea2197-fa73-48bd-9959-0de9aa59245d>
> Bouton **« Copier mes résultats »** à la fin, obligatoire : l'avancement vit
> dans le navigateur de Grégoire, la session ne peut pas le lire. Éprouvé dans
> Chromium avant publication (12 bascules, 0 bascule au §3, filtres et export
> vérifiés, zéro erreur de page hors blocage réseau des polices).
> **Ce qui échoue devient un item de BACKLOG avec son numéro de porte**, pas une
> note mentale.

---

## ⚠⚠ §0 · PRÉALABLE — À LIRE AVANT TOUTE PORTE

### 0.1 Ces portes ne sont PAS exécutables depuis `main`

Le correctif vit sur une **branche**, pas sur `main`. Trois sessions ont
travaillé en parallèle le 21 août (terminal sur le lot L6, Mac sur le lot L4,
cette session-ci sur le Cadre). Tant que la fusion n'est pas faite, l'app
lancée depuis `main` **ne contient pas ces changements** — et chaque porte
ci-dessous rendra exactement le symptôme d'AVANT, ce qui se lit comme un échec
alors que rien n'a échoué.

Deux voies, au choix :

- **Attendre la fusion** (recommandé) — les portes deviennent exécutables dès
  que la branche est dans `main` et que le `git pull` est fait ;
- **Ouvrir la branche maintenant**, dans le **Terminal** de macOS
  (⚠ **seule commande de Terminal de toute cette liste** — tout le reste se
  passe dans le navigateur) :

```
git fetch origin claude/code-terminal-c0-instances-2rbbr0
git checkout claude/code-terminal-c0-instances-2rbbr0
```

### 0.2 Le reste du préalable

- **Backup Codex** avant le §1 : les portes du §1 écrivent dans les données
  réelles (sauvegarder un horaire réécrit la clé des séances de la semaine).
- **Vérifier la version en bas de page** après le `git pull` / `checkout`.
  ⚠ **Il n'y a PAS de bump de version dans ce lot** : `1.91.1` est réservée de
  fait par la session Mac (#466 livré, non poussé). Le numéro sera attribué à
  la fusion. Le bas de page dira donc encore **1.91.0** — ce n'est pas un signe
  que le `checkout` a raté. Pour vérifier que le bon code est chargé, utiliser
  la porte 0.3.
- **Les deux appareils** (Mac et iPad), **les deux modes** (normal et démo).
- `allow pasting` dans la console avant la porte 0.3.

### 0.3 Vérifier que le nouveau code est bien chargé — `Console`

Coller **cette ligne** dans la console du navigateur (onglet de l'app), Entrée :

```
typeof fusionnerSeancesHoraires + ' / ' + typeof echapperAttribut
```

⮕ **Attendu** : `function / function`.
Si la console répond `undefined / undefined`, l'ancien code est encore chargé :
refaire le `checkout` (ou attendre la fusion), puis recharger la page à fond.
**Ne rien cocher d'autre tant que cette porte n'est pas verte** — toutes les
suivantes seraient des faux rouges.

---

## ⚠⚠ §1 · DONNÉES — ce qui s'exécute sur le corpus réel

> Backup Codex fait ? Sinon, remonter au §0.

### 1.1 Reconstituer les séances de la semaine `⚠⚠ Données`

**POURQUOI** — Jusqu'ici, quand deux groupes avaient cours **le même jour à des
heures différentes**, la seconde séance disparaissait : le calendrier et la
saisie des présences ne l'ont jamais vue. Les données déjà enregistrées portent
encore cette perte ; elles ne se réparent pas toutes seules.

**Geste** — Aller dans **Calendrier › Trimestre**, section Horaire. Ouvrir un
horaire existant, ne rien changer, et cliquer **Enregistrer**.

⮕ **Attendu** : le toast « Horaire … modifié ». Cet enregistrement réécrit les
séances de la semaine pour **tous** les horaires du trimestre, avec la nouvelle
règle. C'est ce qui rend les portes du §2 observables.

### 1.2 Mesure — combien de séances après reconstitution `Console` `⚠⚠ Données`

**POURQUOI** — C'est le chiffre qui dit si la 2e séance d'un même jour est
revenue. Aucun chiffre n'est un échec ici : c'est une **mesure d'entrée**.

**Geste** — Après la porte 1.1, coller dans la console :

```
db.getSync(cle('horaireHebdo'), []).map(s => `${s.jour} ${s.heureDebut || s.debut || '?'}`)
```

⮕ **Attendu** : la liste doit contenir **une entrée par créneau réel**, y
compris deux entrées le même jour si deux groupes y ont cours à des heures
différentes. **Recopier la liste dans le champ de saisie** de l'artefact — une
case cochée dit « fait », jamais « combien ».

---

## §2 · INTERFACE — ce qui se vérifie à l'écran

### 2.1 Le calendrier montre la seconde séance du même jour

**POURQUOI** — Deux groupes le mardi, l'un à 10 h, l'autre à 18 h : seul le
premier apparaissait au calendrier. Le second n'existait nulle part.

**Geste** — Ouvrir **Calendrier › Vue** et chercher un jour où deux de tes
groupes ont cours à des heures différentes.

⮕ **Attendu** : les **deux** séances de ce jour sont affichées.
**Avant le correctif** : une seule, toujours la première saisie.

*(Si aucun de tes groupes n'est dans ce cas, cocher « sans objet » plutôt
qu'échec — et le dire dans le champ de note.)*

### 2.2 La saisie des présences voit la seconde séance

**POURQUOI** — Même cause : la saisie lit la même liste que le calendrier. Une
séance absente de la liste ne peut pas être saisie du tout.

**Geste** — Ouvrir **Suivi › Saisie des présences** pour le groupe dont la
séance manquait.

⮕ **Attendu** : la séance manquante est proposée à la saisie.

### 2.3 Supprimer un horaire n'emporte pas les séances des autres `⚠⚠ Données`

**POURQUOI** — La suppression d'un horaire recalcule aussi les séances de la
semaine. Le même défaut y vivait ; il fallait vérifier que la correction tient
des deux côtés.

**Geste** — Créer un horaire **de test** (nom `ZZ-test`), l'enregistrer, puis le
supprimer.

⮕ **Attendu** : après la suppression, les séances de tes **vrais** horaires sont
toujours au calendrier, la 2e séance d'un même jour comprise.

### 2.4 Un nom d'horaire avec des chevrons s'affiche tel quel `⚠⚠ Données`

**POURQUOI** — Les noms venus d'un import (ZIP, collage CSV, restauration
Codex) étaient réinjectés dans la page sans précaution. Un nom contenant du
balisage pouvait déformer l'affichage.

**Geste** — Créer un horaire de test nommé exactement :

```
<b>ZZ</b>
```

Puis regarder le **menu déroulant des horaires** et la **carte résumé** à
droite. **Supprimer cet horaire de test à la fin.**

⮕ **Attendu** : le nom s'affiche **littéralement** `<b>ZZ</b>`, avec ses
chevrons, en texte normal. **Avant le correctif** : il s'affichait `ZZ` en
**gras**, les chevrons ayant été interprétés.

### 2.5 Même vérification sur un profil d'enseignant·e `⚠⚠ Données`

**Geste** — Créer un profil de test dont le prénom est `<b>ZZ</b>`, regarder le
menu déroulant des enseignant·es, puis supprimer le profil.

⮕ **Attendu** : `<b>ZZ</b>` en toutes lettres dans le menu, jamais en gras.

### 2.6 Le local et l'heure d'une séance s'affichent tels quels `⚠⚠ Données`

**Geste** — Dans une séance de test, mettre le local `<i>101</i>` et regarder la
carte résumé de l'horaire. Remettre le local d'origine ensuite.

⮕ **Attendu** : `<i>101</i>` en toutes lettres, jamais en italique.

### 2.7 iPad — les menus déroulants se remplissent toujours `iPad`

**POURQUOI** — La passe d'échappement touche le texte des options de trois
menus déroulants (horaires, enseignant·es, groupes). Si quelque chose s'était
cassé, un menu reviendrait **vide**. WebKit n'existe pas dans le conteneur :
c'est structurellement invérifiable en session.

**Geste** — Sur iPad, ouvrir **Calendrier › Trimestre** et dérouler les trois
menus : Horaire, Enseignant·e, Groupe associé.

⮕ **Attendu** : chacun propose ses entrées, avec les accents corrects
(« Sélectionner… », les noms avec é/è).

### 2.8 Safari sur Mac — même vérification

**Geste** — Répéter la porte 2.7 dans Safari sur le Mac.

⮕ **Attendu** : identique.

---

## §3 · DÉCISIONS — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Ce sont des choix posés faute de pouvoir
> les trancher à ta place. Chaque rangée attend une réponse **écrite**, pas une
> case cochée.

### 3.1 Quel numéro de version pour ce lot ?

`1.91.1` est réservée de fait par la session Mac (#466 livré, non poussé). Ce
lot est donc parti **sans bump**, pour ne pas rejouer l'incident du 8 août (deux
sessions, deux « 1.55.0 » différentes). Le numéro doit être attribué **à la
fusion**, quand l'ordre des trois branches sera connu.

**Verdict attendu** : quel numéro, et dans quel ordre fusionner les trois
branches en vol.

### 3.2 Le cliquet de sécurité reste-t-il strict ?

Le test `lint-securite` tolérait **115** cas suspects pour **107** réellement
mesurés : huit régressions pouvaient passer en silence. Le seuil est ramené à la
mesure exacte (**106**), sans marge. Conséquence : toute session qui ajoute un
`innerHTML` interpolé non échappé voit son test rougir — y compris les deux
autres sessions en vol, si elles en ajoutent un.

**Verdict attendu** : garder le seuil strict, ou remettre une marge (et
laquelle).

### 3.3 `RELAIS.md` n'a pas été mis à jour

La règle du dépôt veut que `RELAIS.md` vive **sur `main`** et signale où est le
travail en cours. Cette session n'a pas l'autorisation de pousser sur `main`
(consigne de branche dédiée) : `RELAIS.md` dit donc toujours « branche à ouvrir :
`main` », et cette branche-ci y est **invisible** pour la prochaine session.

**Verdict attendu** : qui met `RELAIS.md` à jour, et quand.

### 3.4 Que faire des sites CT-09 laissés de côté ?

Deux fichiers du constat CT-09 n'ont **pas** été touchés, pour ne pas entrer en
collision avec les autres sessions : `trimestre-v2-cours.js` (dont les
**3 renderers morts non échappés** — code inactif mais armé, le cas d'école
`51e5cdc`) et `trimestre-v2-liste.js`. Ils appartiennent aux périmètres L6 et L4.

**Verdict attendu** : les verser en item de suite du lot #467, ou les confier à
la session qui tient déjà ces fichiers.

---

## §4 · CE QUE JE N'AI PAS PU VÉRIFIER — angles morts déclarés

- **Rien n'a été éprouvé dans Safari ni sur iPad.** WebKit n'existe pas dans le
  conteneur : les portes 2.7 et 2.8 sont structurellement invérifiables en
  session. Playwright n'a pas été lancé.
- **Le corpus réel n'était pas là.** CT-04 est corrigé et couvert par 9 cas
  Vitest reproduisant le scénario de l'audit (Mardi 10:00 + Jeudi 14:00 +
  Mardi 18:00), mais **jamais rejoué sur tes données**. C'est tout l'objet du §1.
- **`echapperHtml` n'a pas été corrigée** (CT-29 dans sa forme structurelle) :
  `js/config.js` est une **zone protégée** du projet, on n'y touche pas sans
  autorisation. La fonction continue donc de ne pas encoder les guillemets
  partout ailleurs dans l'app. Le contournement livré est additif : un
  `echapperAttribut()` séparé, utilisé aux sites d'attribut du périmètre Cadre
  **seulement**. Les autres modules gardent le trou.
- **Le compteur du cliquet ne mesure pas ce qu'on croit.** Le script d'audit est
  une heuristique d'**une seule ligne** sur les instructions `.innerHTML =` : un
  gabarit multi-lignes affecté par `conteneur.innerHTML = html` compte pour
  « statique » quel que soit son contenu. La passe a échappé **~13 sites** ;
  le compteur n'en a enregistré **qu'un** (107 → 106). Il garde la porte
  d'entrée, pas le contenu.
- **Erreur de session, rattrapée** : le seuil du cliquet a d'abord été fixé à
  **109** en partant du chiffre « 112 » lu dans un document de **mai**, sans le
  mesurer. La mesure réelle avant modification était **107** — le document avait
  dérivé de cinq. Le seuil a été refait sur mesure (106). Leçon : ne jamais
  prendre un chiffre de baseline dans une doc, toujours le relancer.
- **Deuxième rattrapage** : un break-test a révélé que retirer un échappement ne
  faisait **pas** bouger le compteur — c'est ce qui a mis au jour la limite
  ci-dessus. Sans ce break-test, le commit aurait affirmé « 6 suspects retirés »,
  ce qui était faux.
- **CT-09 : un jumeau non relevé par l'audit** a été trouvé au passage
  (`horaire.js`, carte de séance en mode **affichage** : jour, début, fin et
  local étaient échappés, mais pas la lettre ni le nom). Il est corrigé. Cela
  suggère que le relevé CT-09 de l'audit n'est **pas exhaustif** — les autres
  modules n'ont pas été re-balayés.
- **Aucune porte n'a été jouée sur les données de démo**, seulement en mode
  normal côté raisonnement.

---

## ÉTAT

| | |
|---|---|
| **Portes** | 13 vérifications (§0 : 1 · §1 : 2 · §2 : 8 · §3 : 4 décisions) |
| **Relevé** | ⏳ **AUCUNE porte jouée à cette heure** |
| **Bloquant** | ⚠ les portes ne sont pas exécutables tant que la branche n'est pas fusionnée ou ouverte (§0.1) |
| **Vitest** | 2817/2817 (283 fichiers), lancé depuis `tests/` |
| **Break-tests** | 2 joués, 2 ROUGES (sentinelle CT-04, sentinelle CT-29) |

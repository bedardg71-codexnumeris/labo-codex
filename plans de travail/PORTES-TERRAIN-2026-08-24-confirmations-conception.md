# Portes terrain — Confirmations uniformes de la section Conception

**Version à tester : 1.94.1** · branche `claude/uniform-save-confirmations-qbb33o`
Jumeau interactif : `plans de travail/portes-terrain-2026-08-24-confirmations-conception.html`

> Ce qui échoue ici devient un item de BACKLOG avec son numéro de porte, jamais une note mentale.

---

## Ce qui a changé, en une phrase

Enregistrer une grille faisait glisser un bandeau vert en haut à droite ;
enregistrer une échelle ouvrait une fenêtre du navigateur à refermer d'un clic ;
la cartouche avait une troisième forme. **Les six sous-sections de Conception
répondent maintenant toutes par le bandeau glissant.** 43 messages migrés.

Les fenêtres du navigateur qui signalent une **erreur** ou un **champ
obligatoire** restent : elles interrompent volontairement, parce que l'action
n'a PAS eu lieu et qu'il y a quelque chose à corriger.

## Cette liste a été triée avant d'être écrite

Douze rangées ont été retirées **parce qu'elles ont été prouvées en session**,
dans un vrai navigateur, contre le vrai `index.html`. Le détail des preuves est
au §2 bis : une rangée retirée n'est pas une rangée sautée. **Il reste 18
rangées à cocher — dont 2 de préalable — et 5 décisions.**

---

## §0 · Préalable — à faire avant tout le reste

| | Geste | Attendu |
|---|---|---|
| 0.1 | `git pull` puis recharger l'app | **En bas de page : 1.94.1, build 0824-1453.** Si tu lis 1.94.0 ou moins, tu testes l'état d'AVANT le correctif et tout va sembler cassé. |
| 0.2 | Exporter un Codex de sauvegarde | Les trois portes du §1 écrivent dans ton corpus réel. |

---

## §1 · ⚠⚠ Données — gestes sur ton corpus

> Backup fait (0.2) avant d'entrer ici. Ces trois-là ne peuvent pas être jouées
> en session : je n'ai ni tes trimestres ni tes fichiers.

| | Geste | Attendu | Tags |
|---|---|---|---|
| 1.1 | Conception › Grilles › bibliothèque › **importer toutes les grilles d'un autre trimestre** | Bandeau vert « Import terminé », et en dessous le compte de grilles copiées. Avant : une fenêtre à refermer. | ⚠⚠ Données |
| 1.2 | Conception › Échelles › bibliothèque › **importer un fichier `.json` d'échelles** | Bandeau vert « Import réussi », et en dessous les comptes sur **une seule ligne qui tient dans le bandeau**. | ⚠⚠ Données |
| 1.3 | Conception › Pratiques › **importer les pratiques d'un autre trimestre** | Bandeau vert « Import terminé » + le compte. | ⚠⚠ Données |

---

## §2 · Interface — ce qui reste à vérifier à l'écran

### 2.1 — Les trois éditeurs que la preuve ne couvre pas

L'échelle et la grille ont été jouées dans un vrai navigateur (§2 bis). Ces
trois-là ont un formulaire trop lié à l'état de l'app pour être pilotés
mécaniquement : c'est à toi.

| | Geste | Attendu |
|---|---|---|
| 2.1.1 | Conception › **Productions** › ouvrir une production, changer un mot, Enregistrer | Bandeau vert en haut à droite, qui s'efface seul. Aucune fenêtre à refermer. |
| 2.1.2 | Conception › **Cartouches de rétroaction** › ouvrir une cartouche, changer un mot, Enregistrer | Bandeau vert `Cartouche "…" sauvegardée !` — **avant : une fenêtre du navigateur.** |
| 2.1.3 | Conception › **Pratiques de notation** › ouvrir une pratique, changer un mot, Enregistrer | Bandeau vert « Pratique enregistrée ». |
| 2.1.4 | Refaire 2.1.1 → 2.1.3 d'affilée et regarder **où** chaque bandeau apparaît | Toujours le même coin, la même taille, la même durée. C'est l'uniformité demandée. |

### 2.2 — Ce qui ne doit PAS être devenu un bandeau

| | Geste | Attendu |
|---|---|---|
| 2.2.1 | Cartouche en édition › **vider le champ Nom** › Enregistrer | Une **fenêtre du navigateur** « Veuillez donner un nom à la cartouche ». C'est voulu : rien n'a été enregistré, il faut corriger. |
| 2.2.2 | Juste après 2.2.1, regarder le coin haut droit | **Aucun bandeau vert.** Avant ce correctif, la cartouche annonçait « sauvegardée » même quand elle ne l'était pas. |

### 2.3 — Le bandeau passe maintenant DEVANT les fenêtres

> Un doublon de la règle CSS du bandeau vivait dans `index.html` et écrasait
> celle de `styles.css` : le bandeau plafonnait sous les fenêtres de
> bibliothèque. Le doublon est retiré. **Le changement vaut pour toute l'app, pas
> seulement Conception** — d'où la rangée 2.3.2.

| | Geste | Attendu |
|---|---|---|
| 2.3.1 | Ouvrir la bibliothèque de grilles, importer un fichier depuis la fenêtre **restée ouverte** | Le bandeau vert s'affiche **par-dessus** la fenêtre de bibliothèque, pas derrière. |
| 2.3.2 | Te promener dans Suivi, Évaluations et Calendrier, déclencher deux ou trois enregistrements ordinaires | Les bandeaux ont la même allure qu'avant : même vert, même coin. Ils passent seulement devant ce qui les cachait. |

### 2.4 — Lisibilité, là où je n'ai aucun navigateur

| | Geste | Attendu | Tags |
|---|---|---|---|
| 2.4.1 | Sur **iPad**, enregistrer une échelle | Le bandeau est lisible et ne masque pas un contrôle dont tu as besoin dans la seconde qui suit. | iPad |
| 2.4.2 | Sur **iPad**, refaire l'import du 1.2 (résumé à deux lignes) | Le texte du détail ne déborde pas et ne se fait pas couper. | iPad |
| 2.4.3 | Sur **Mac**, refaire 2.1.2 en **mode sombre**, puis en **mode clair** | Lisible dans les deux. | |
| 2.4.4 | Sur **iPad**, enregistrer une cartouche | Même forme qu'au Mac. | iPad |

**Mesure à noter (pas une case à cocher)** — chronomètre à la main sur le
résumé d'import du 1.2 : combien de secondes le bandeau reste-t-il ? Attendu
autour de 3 s. Le point n'est pas le chiffre, c'est de savoir si c'est assez
pour LIRE deux lignes. → décision 3.4.

---

## §2 bis · Ce qui a été retiré, et la preuve qui le permet

> Ces cartes se lisent, elles ne se cochent pas. Chaque ligne a été exécutée le
> 24 août dans Chromium contre le vrai `index.html`, avant d'être coupée de la
> liste. Le fichier : `tests/integration/confirmations-conception-uniformes.spec.js`.

| Retiré | Preuve mesurée |
|---|---|
| « Enregistrer une échelle donne un bandeau, pas une fenêtre » (3 rangées) | App ouverte, échelle semée dans la clé namespacée réelle, `sauvegarderEchelleComplete()` appelée. Relevé : **1 seul bandeau**, texte `Échelle "Échelle témoin" sauvegardée !`, `position: fixed`, `top: 20px`, `z-index: 11000`, **0 fenêtre native ouverte**. |
| « La grille n'a pas bougé » (2 rangées) | Même harnais : `Grille "Grille témoin" sauvegardée !`, même coin, même z-index, 0 fenêtre native. Les deux objets rendent la **même** forme — c'est la demande, mesurée. |
| « Le refus n'annonce pas une sauvegarde » (4 rangées, #466/CO-16) | Échelle chargée dans l'éditeur puis retirée du namespace actif, `Enregistrer`. Relevé : **1 seul bandeau**, classe `notification-erreur`, `role="alert"`, texte « Impossible d'enregistrer cette échelle · Elle n'appartient pas au trimestre actif. » — **aucune occurrence de « sauvegardée »**, aucune fenêtre native. Break-test : en retirant `if (!ecrite) return`, ce cas rougit. |
| « Le résumé d'import n'a pas de `\n` orphelin » (2 rangées) | Résumé à trois phrases rendu : **aucun retour à la ligne littéral**, largeur 420 px, **ne déborde pas** de la fenêtre. |
| « Le bandeau passe devant les modales » (1 rangée, partiellement) | `z-index` mesuré à **11000** après retrait du doublon (il valait 9999, sous les modales à 10000). Break-test : remis à 9999, le spec rougit. **La rangée 2.3.1 reste** parce que la superposition réelle avec la fenêtre ouverte n'a pas été jouée bout en bout. |

⚠ **Un faux constat évité, pour mémoire.** Mon premier relevé annonçait un
débordement de 13 px hors de l'écran. C'était une mesure prise **pendant**
l'animation d'entrée (300 ms, départ à `translateX(400px)`). Mesuré après, le
bandeau est à 20 px du bord. Si j'avais écrit la porte sans revérifier, tu
aurais cherché un défaut qui n'existe pas.

---

## §3 · Décisions — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Ce sont des choix que j'ai posés faute de
> pouvoir les trancher à ta place. Chacun attend une phrase écrite, pas une coche.

| | Question | Ce que j'ai fait, et pourquoi |
|---|---|---|
| 3.1 | **Guillemets.** Le bandeau écrit `Échelle "Nom" sauvegardée !` avec des guillemets droits. | J'ai calqué la forme exacte de la grille — celle de ta capture — plutôt que d'imposer des « » français partout. Toi qui enseignes le français, tu voudras peut-être l'inverse. |
| 3.2 | **Créer vs sauvegarder.** Enregistrer une échelle **neuve** dit maintenant « sauvegardée », plus « créée ». | La grille ne distingue pas non plus. J'ai choisi la parité stricte, mais « créée » était plus informatif. |
| 3.3 | **Les fenêtres d'erreur restent.** Environ 165 messages de validation et d'erreur de Conception sont toujours des fenêtres du navigateur. | Je ne les ai pas migrés : une erreur qui s'efface seule au bout de 5 s peut se rater, et là il y a quelque chose à corriger. Mais ça reste deux formes à l'écran. |
| 3.4 | **Durée.** 3 s pour un succès, 5 s pour une erreur — valeurs déjà en place, non touchées. | La mesure du §2.4 dira si 3 s suffit pour un résumé à deux lignes. |
| 3.5 | **Empilement.** Deux bandeaux déclenchés en même temps se superposent au même endroit. | J'ai supprimé les deux cas que la migration créait (le refus + la confirmation). Je n'ai pas audité tous les autres chemins de l'app. |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Safari et WebKit.** Le navigateur cible n'existe pas dans le conteneur. Toutes
  les preuves du §2 bis viennent de **Chromium** : un vert Chromium est un indice,
  pas un verdict Safari. C'est structurel, pas un oubli.
- **L'iPad.** Aucun moyen de l'éprouver ici. Le §2.4 est entièrement à ta charge.
- **Ton corpus réel.** Le §1 s'exécute sur des données que je n'ai pas. Les comptes
  affichés par les résumés d'import n'ont jamais été vus avec de vrais volumes.
- **Production, cartouche, pratique au rendu.** Leurs formulaires sont trop liés à
  l'état de l'app pour être pilotés mécaniquement. Le test unitaire garantit qu'aucun
  `alert()` de confirmation ne subsiste **dans le source** ; il ne dit rien du rendu.
  D'où le §2.1.
- **La suite Playwright existante.** 7 specs des flux touchés rougissent en Chromium.
  Vérifié : elles rougissent **à l'identique sur le commit d'avant mon travail** — ce
  sont des rouges préexistants, documentés dans l'en-tête de
  `playwright.chromium.config.js`. Mesuré, pas supposé. Ça veut aussi dire qu'aucune
  spec d'intégration ancienne ne couvrait ce lot ; celle du §2 bis est neuve.
- **Erreur de session, rattrapée.** Pendant le premier break-test, un `git checkout --`
  de ma part a effacé les modifications non commitées de `echelles.js` et
  `cartouches.js`. Réappliquées, puis comparées octet à octet avec une sauvegarde
  antérieure : identiques. Le break-test des deux assertions concernées a été **refait
  proprement** ensuite, parce que le premier passage était contaminé.
- **`sauvegarderNiveaux`** (bouton « Sauvegarder les niveaux » d'une échelle) affiche
  « Échelle de performance sauvegardée ! » sans rien écrire. Ce n'est PAS un faux
  message : les niveaux sont enregistrés au fil de chaque modification, le bouton ne
  fait que valider. Vérifié, non touché — noté pour que la prochaine session ne le
  prenne pas pour un défaut du même type que le refus.

---

## Ce qui a été mesuré en session

- **3012 tests unitaires verts** (297 fichiers), dont 4 assertions neuves.
- **4 preuves d'intégration** dans Chromium, neuves.
- **Break-tests, un par un** : 4 sur la sentinelle unitaire, 2 sur la sentinelle
  d'intégration. Chacun rougit isolément et revient vert à la restauration.
- 43 `alert()` retirés, 43 `notifications.*` ajoutés — comptés sur le diff.
- 0 `console.log`, 0 `innerHTML`, 0 handler inline ajoutés.

# PORTES TERRAIN — #486 · un gabarit s'enregistre sans date d'échéance

**Version à éprouver** : **1.94.0** · build `0824-1141`
**Date d'émission** : 24 août 2026
**Artefact interactif** : https://claude.ai/code/artifact/886278b4-72e8-43b3-ba74-cb8116eefded
**Jumeau HTML versionné** : `plans de travail/portes-terrain-2026-08-24-486-gabarit-sans-echeance.html`
**Volume** : 34 vérifications (§0 à §2) + 5 décisions (§3)
**État** : ⏳ **DUE** — aucune porte relevée

> **Ce qui échoue ici devient un item de BACKLOG avec son numéro de porte, pas
> une note mentale.** Une porte est soit cochée, soit due. Jamais
> « probablement passée ».

---

## Ce que le cycle a livré

Tu m'as écrit : *« j'ai besoin de pouvoir enregistrer un gabarit même s'il
n'est pas entièrement complété. Ici, je ne peux faire de sauvegarde parce que
je n'ai pas de date d'échéance. Ça me bloque dans ma planification. »*

Trois choses ont changé.

1. **La date d'échéance n'empêche plus d'enregistrer.** Titre, type et
   pondération restent exigés — c'est la portée que tu as arrêtée.
2. **Un badge « à planifier »** apparaît dans la liste de gauche sur les
   productions sans échéance, pour qu'un gabarit oublié reste visible sans
   avoir à ouvrir chaque fiche.
3. **Le texte d'aide** ne prétend plus l'inverse aux trois endroits où il le
   faisait (survol du champ, bulle d'aide, note sous le champ).

**Ce qui n'a PAS changé** : une production sans échéance n'apparaît ni au
calendrier ni dans les indices C et P. C'était déjà le cas, et c'est voulu —
rien n'est dû tant que rien n'est annoncé. Elle rejoint ces calculs à la
seconde où tu poses la date.

---

## §0 · PRÉALABLE — à faire avant tout le reste

Sauter le §0 rend faux tout ce qui suit.

| | Geste | Attendu | Tags |
|---|---|---|---|
| 0.1 | `git pull` dans ton clone | Le dépôt descend le commit `4970f11` | Terminal |
| 0.2 | Ouvre l'app, regarde le **bas de page** | **`1.94.0 · build 0824-1141`**. Si tu lis 1.93.0, ton app est celle d'AVANT et **toutes les portes ci-dessous seront de faux rouges** — refais 0.1 | |
| 0.3 | **Sauvegarde ton Codex** (export d'archive) avant le §1 | Un fichier d'archive daté d'aujourd'hui existe | ⚠⚠ Données |
| 0.4 | Prévois les deux appareils et les deux modes | Mac + iPad, mode clair + mode sombre | iPad |

> ⚠ **Ton app tourne depuis ton clone, en `file://`.** Elle est à la version de
> ton dernier `git pull`, pas à celle de `main`. C'est la source de faux rouges
> la plus fréquente, et elle est **indétectable au récit** : un build en retard
> décrit exactement l'état d'avant le correctif — c'est-à-dire précisément ce
> que la porte teste.

---

## §1 · ⚠⚠ DONNÉES — ce que tu exécutes sur ton corpus réel

Ce sont des écritures dans tes vraies productions. Le §0.3 doit être fait.

### 1.1 — Le geste qui t'a bloqué

> **POURQUOI** — Hier, sur ta production « Description de personnage
> (Madawigouche) », tu as cliqué Enregistrer et l'app t'a répondu *« La date
> d'échéance est obligatoire pour les productions (sauf portfolios
> conteneurs) »*. Impossible d'avancer sans inventer une date que tu ne
> connaissais pas encore.

| | Geste | Attendu | Tags |
|---|---|---|---|
| 1.1a | Conception › Production étudiante. Ouvre **la production exacte de ta capture** | La fiche s'ouvre, le champ Date d'échéance est vide (`jj/mm/aaaa`) | ⚠⚠ Données |
| 1.1b | Sans toucher à la date, clique **Enregistrer** | **Aucune alerte.** Notification « Production modifiée avec succès ! » | ⚠⚠ Données |
| 1.1c | Quitte la section, reviens, rouvre la fiche | Tes consignes sont toujours là. La date est toujours vide | ⚠⚠ Données |

### 1.2 — Préparer une production neuve de bout en bout

> **POURQUOI** — C'est ton vrai usage : tu prépares TOUTES tes productions
> avant de les transmettre. Cette porte éprouve le parcours complet, pas
> seulement le déblocage.

| | Geste | Attendu | Tags |
|---|---|---|---|
| 1.2a | « + Nouvelle production ». Remplis titre, type, pondération, objectif, tâche, détail. **Laisse la date vide** | — | ⚠⚠ Données |
| 1.2b | Enregistre | Aucune alerte, « Production ajoutée avec succès ! » | ⚠⚠ Données |
| 1.2c | Retire le titre, réenregistre | L'alerte « Titre, Type et Pondération » **doit** revenir. C'est le garde-fou qui reste | ⚠⚠ Données |
| 1.2d | Remets le titre, mets la pondération à 0, réenregistre | Même alerte. La pondération reste exigée — c'est la portée que tu as choisie | ⚠⚠ Données |

### 1.3 — Le cas multi-groupes (si tu as deux groupes sur un même cours)

> **POURQUOI** — L'écran annonçait déjà que « décoché = les étudiant·es n'ont
> pas encore reçu le travail ». C'était donc un état déclaré légitime… que la
> sauvegarde refusait d'enregistrer. Contradiction levée.

| | Geste | Attendu | Tags |
|---|---|---|---|
| 1.3a | Ouvre une production d'un cours à deux groupes. **Décoche tous les groupes** | Les champs de date se grisent | ⚠⚠ Données |
| 1.3b | Enregistre | Aucune alerte. L'enregistrement passe | ⚠⚠ Données |
| 1.3c | Recoche UN groupe, donne-lui une date, enregistre, rouvre | La case est cochée, la date est là | ⚠⚠ Données |

### 1.4 — La mesure d'entrée

> **Aucun chiffre n'est un échec ici** — c'est un relevé, pas un seuil.

| | Geste | À NOTER (champ de saisie, pas une case) | Tags |
|---|---|---|---|
| 1.4a | Compte les productions qui portent le badge « à planifier » dans ta liste | **Nombre : \_\_\_\_** | |
| 1.4b | Parmi elles, combien te surprennent (tu les croyais datées) ? | **Nombre : \_\_\_\_** | |

---

## §2 · INTERFACE — ce que tu vérifies à l'écran

### 2.1 — Le badge « à planifier »

> **POURQUOI** — Sans marquage, un gabarit oublié sans échéance devient
> invisible : il ne remonte dans aucun calendrier ni aucun indice, et rien à
> l'écran ne te le rappelle. Tu as demandé un badge dans la liste.

| | Geste | Attendu | Tags |
|---|---|---|---|
| 2.1a | Regarde la liste de gauche, sur la production du 1.1 | Une pastille grise **« à planifier »** à côté du badge de pondération | |
| 2.1b | Donne-lui une date, enregistre, regarde la liste | **Le badge disparaît** | ⚠⚠ Données |
| 2.1c | Retire la date, enregistre, regarde la liste | **Le badge revient** | ⚠⚠ Données |
| 2.1d | Trouve un **portfolio conteneur** dans ta liste | **Aucun badge** — un portfolio n'a jamais de date propre, seuls ses artefacts en ont | |
| 2.1e | Trouve un **artefact** sans date | Le badge **est** présent — les artefacts, eux, ont une échéance | |

### 2.2 — Le badge à l'œil

> **POURQUOI** — J'ai calculé les contrastes (5,63:1 en clair, 5,20:1 en
> sombre) mais **je n'ai pas pu les regarder** : aucun navigateur Safari dans
> l'environnement de session. Seul ton œil sur ton matériel tranche.

| | Geste | Attendu | Tags |
|---|---|---|---|
| 2.2a | **Mode clair** : lis le badge sans te pencher | Lisible du premier coup d'œil | |
| 2.2b | **Mode sombre** : idem | Lisible du premier coup d'œil | |
| 2.2c | **Survole** la ligne de la production avec la souris | Le badge reste lisible pendant que la ligne s'assombrit | |
| 2.2d | Sur **iPad**, en clair puis en sombre | Lisible, et ne déborde pas de la carte | iPad |
| 2.2e | Une production dont le titre est long, avec badges de pratique + pondération + « à planifier » | Les badges passent à la ligne proprement, rien n'est coupé | iPad |
| 2.2f | Survole le badge (Mac) | Une infobulle explique pourquoi la production n'est ni au calendrier ni dans C et P | |

### 2.3 — Le texte d'aide

> **POURQUOI** — Trois endroits affirmaient encore que ce champ conditionne
> tout, sans dire qu'il est facultatif. Un texte qui contredit le
> comportement, c'est le comportement qu'on croit cassé.

| | Geste | Attendu | Tags |
|---|---|---|---|
| 2.3a | Survole le libellé **Date d'échéance** | Le texte contient « **Facultative** : laisse-la vide tant que les consignes ne sont pas transmises » | |
| 2.3b | Clique l'icône ⓘ à côté de « Date d'échéance » | La bulle contient un **conseil** disant que la date est facultative et ce que vaut le badge « à planifier » | |
| 2.3c | Regarde la note grise sous le champ Date d'échéance | Elle se termine par « Facultative : laisse-la vide tant que les consignes ne sont pas transmises » | |

### 2.4 — Ce que le reste de l'app en dit (le vecteur, pas l'état)

> **POURQUOI** — Vérifier que le badge s'affiche ne prouve que l'affichage.
> Ce qui compte est que la production sans date reste **hors** des calculs, et
> y **entre** dès que la date est posée.

| | Geste | Attendu | Tags |
|---|---|---|---|
| 2.4a | Va au **calendrier** avec la production du 1.1 sans date | Elle n'y figure pas | |
| 2.4b | Donne-lui une date **dans ton trimestre**, enregistre, retourne au calendrier | Elle apparaît à la bonne date | ⚠⚠ Données |
| 2.4c | Donne-lui une date **hors du trimestre**, enregistre | La demande de confirmation « en dehors du trimestre » **doit** toujours apparaître | ⚠⚠ Données |
| 2.4d | Exporte la production en **PDF** sans date | Le PDF sort, l'échéance s'affiche « — » plutôt que de faire échouer l'export | |

---

## §3 · DÉCISIONS — ce qui attend TON verdict

> ⚠ **Ce ne sont pas des vérifications.** Ce sont des choix que j'ai posés
> faute de pouvoir les trancher à ta place. **Chaque ligne attend une phrase
> écrite, pas une coche** — une décision sans verdict écrit est une décision
> perdue.

| | Question | Ton verdict |
|---|---|---|
| 3.1 | **Le mot du badge.** J'ai écrit « à planifier ». Autres pistes : « sans échéance », « non transmise », « en préparation ». Lequel dit le mieux ce que tu vis ? | \_\_\_\_ |
| 3.2 | **Le registre.** Le badge est gris neutre, volontairement : préparer avant de transmettre est normal, pas une anomalie. Après usage — trop discret, ou juste ? | \_\_\_\_ |
| 3.3 | **La pondération.** Tu as choisi que seule la date cesse de bloquer. Après avoir préparé quelques productions : la pondération à 0 t'a-t-elle rebloqué ? Faut-il la libérer aussi ? | \_\_\_\_ |
| 3.4 | **Ailleurs que dans la liste.** Le badge ne vit que dans la barre latérale. Le voudrais-tu aussi dans le tableau des productions, ou dans un rappel de fin de préparation (« 4 productions restent à planifier ») ? | \_\_\_\_ |
| 3.5 | **Le portfolio conteneur.** Je l'ai exclu du badge : il n'a jamais de date propre. Es-tu d'accord, ou préfères-tu qu'il porte un badge quand aucun de ses artefacts n'a de date ? | \_\_\_\_ |

---

## §4 · CE QUE JE N'AI PAS PU VÉRIFIER

Une liste qui ne déclare pas ses angles morts se fait croire complète.

1. **Aucun verdict Safari/WebKit.** Le binaire WebKit est absent de
   l'environnement de session — la suite Playwright n'a pas pu démarrer. Tout
   le §2 est donc structurellement invérifiable de mon côté.

2. **Contrôle de substitution sur Chromium, et sa valeur exacte.** J'ai lancé
   la suite d'intégration sur le Chromium local via une configuration
   temporaire : **57 passés / 54 échoués**. J'ai relancé la même suite sur
   l'arbre **propre** (mes changements mis de côté) : **exactement la même
   liste d'échecs, au bit près**. Ces 54 échecs préexistent et sont propres à
   Chromium ; aucun n'est causé par ce chantier. Mais cela ne dit **rien** de
   Safari.

3. **Les contrastes sont calculés, pas regardés.** 5,63:1 en mode clair,
   5,20:1 en sombre, 5,34:1 à l'impression — au-dessus du seuil AA de 4,5:1
   dans les quatre combinaisons, y compris au survol. C'est de l'arithmétique
   sur les jetons de couleur, pas un jugement d'œil. D'où les portes 2.2a-e.

4. **Ton corpus n'est pas là.** Je ne sais pas combien de tes productions
   porteront le badge, ni si l'une d'elles te surprendra. C'est la mesure 1.4.

5. **L'iPad n'existe pas en session.** Débordement, retour à la ligne des
   badges, taille tactile : seul ton matériel tranche (2.2d, 2.2e).

6. **Une correction que j'ai faite en route, à signaler.** Mon premier jet
   donnait au badge un fond **translucide**, comme le badge « non évalué »
   existant. En calculant le contraste au **survol** de la ligne — qui
   s'assombrit — je suis tombé à **4,30:1** en mode clair, sous le seuil. J'ai
   basculé sur un fond opaque. Sans ce calcul, le défaut serait parti en
   production et n'aurait été visible qu'à l'œil, au survol, en mode clair.

7. **Un faux rouge rencontré, et sa cause.** La sentinelle anti-cache du
   23 août a rougi pendant le cycle. Ce n'était pas un défaut : elle prend
   pour repère l'avant-dernier commit touchant `version.json`, et je l'avais
   lancée **avant** de commiter la release — elle comparait donc depuis 1.92.1
   et voyait les fichiers de CT-15. Verte après le commit. À savoir pour la
   prochaine session : **cette sentinelle ne se lit qu'après le commit de
   release.**

---

## Au retour du terrain

1. Trier les échecs : défaut réel, ou build en retard (§0.2) ?
2. Verser chaque échec réel au `BACKLOG.md` avec son numéro de porte.
3. Reporter ici l'état, la date du relevé, et ce qui reste dû.
4. Reporter les cinq verdicts du §3.

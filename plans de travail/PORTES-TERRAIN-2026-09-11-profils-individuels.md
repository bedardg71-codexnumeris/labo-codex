# Portes terrain — 11 septembre 2026 (Profils individuels : un seul rendu à l'ouverture, des graphiques qui lisent l'échelle de chaque évaluation, le volet confidentiel qui suit la liste — lot 4 du cadrage 11, 1.134.0)

> **Version à l'écran attendue : `1.134.0`** (le build est écrit par la release ; lis-le en bas de page).
> Couvre : le profil qui s'ouvre une fois et ne t'efface plus ce que tu tapes (`#754`) ; les graphiques de progression qui lisent
> l'échelle de chaque évaluation et disent quand une valeur ne se convertit pas (`#752`) ; les cases du rapport par trimestre ;
> la case « Services adaptés » qui suit la liste des étudiant·es et le « Portrait de lecteur » retiré (tes décisions de 17 h 20-24) ;
> le bouton « + Nouvelle intervention » à sa place (17 h 28). Le reste du lot (trois gestes exportés sans bouton retirés, l'export
> anonymisé qui écrit enfin `services_adaptes` d'après la liste) n'a **aucune porte** : invisible, mesuré par la sentinelle.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.
>
> ✅ **RELEVÉE le 12 septembre 2026 à 12 h 49 (Toronto) — 10 sur 10, zéro échec**, version `1.138.0` lue en bas de page
> (la porte était écrite sur `1.134.0` ; les quatre versions livrées depuis portaient sur l'orthopédagogie). Artefact
> « Porte terrain des Profils individuels » publié par Cowork à 12 h 40, à la demande de Grégoire (« je ne me souviens
> pas d'avoir passé la porte du lot 4 ») ; relevé collé dans la conversation Cowork. **Rangée 7 close à 12 h 58 sur
> capture d'écran** : le bloc « Portrait de lecteur » absent, et Parcours, Défis particuliers, Diagnostic (« Services
> adaptés » grisée, suivie de « (d'après la liste des étudiant·es) »), Notes personnelles et Notes de présences tous
> présents — dans ses mots, *« oui, tout est là »*. Il avait d'abord noté la rangée non traitée, le bloc ayant été
> retiré « dans une séance antérieure » : c'est la livraison de 1.134.0 elle-même, le 11 au soir. Les deux mots du § 3 :
> **tel quel**, aucun verdict écrit. Noté par Cowork à 13 h.

**Pourquoi cette liste est courte.** Huit rangées, fixées par la consigne. Chaque brique est prouvée au banc (onze essais, quatre fois
cassés exprès, quatre rouges), le nombre de rendus est compté dans un vrai navigateur (WebKit, `index.html` réel : un rendu par six
chemins, quatre avant), et les courbes du pack démo ont été capturées AVANT le correctif et comparées APRÈS (20 profils, 945 points,
105 courbes de trajectoires : identiques). Reste ce que seul ton écran tranche : **tes courbes sur tes échelles** (personne d'autre ne
les connaît), tes deux groupes réels, Safari, l'adresse en ligne.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** dans un **nouvel onglet** (si un onglet de l'app était déjà ouvert : recharge-le avec vidage de cache, Cmd+Maj+R) | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.134.0`**. Sinon, arrête-toi : la liste jugerait la version d'avant. |

---

## §1 · Tes données — ce que cette liste écrit chez toi

**Presque rien.** La rangée 5 écrit une clé d'état d'écran par trimestre (`<trim>_preferencesRapport`, six cases de forme) ; l'ancienne
clé nue reste en place, orpheline (connue de `diagnostic-353`). Les rangées 6 et 7 **n'exigent pas de cliquer « Enregistrer »** dans le
volet confidentiel : regarde, puis ferme. ⚠ Si tu cliques « Enregistrer », l'objet confidentiel de CET élève est réécrit depuis le
formulaire : ses anciens champs « Portrait de lecteur » et le booléen « Services adaptés » du volet tombent — c'est ta décision de
17 h 24 (« peuvent disparaître complètement »), sans script de purge : ça arrive élève par élève, au premier Enregistrer. Aucune note,
aucune évaluation, aucune grille n'est touchée par ce lot.

---

## §2 · Ce que seul ton écran peut trancher

### 2.1 · Le profil s'ouvre une fois, et garde ce que tu tapes

**Pourquoi.** Le 6, le profil se dessinait quatre fois à l'ouverture (vide à 7 ms, rempli à 108, vide à 212, rempli à 317) ; trois
mots tapés dans la zone de texte du rapport disparaissaient. `navigation.js` (zone protégée) n'a pas été touché.

| | Geste | Attendu |
|---|---|---|
| **1** | `Suivi › Profils individuels`, un élève, section **Rapport** : tape trois mots à la fin de la zone de texte, attends deux secondes | **les trois mots sont encore là** (avant : effacés à 100 ms) |
| **2** | Ferme le profil (va dans `Liste des étudiant·es`), rouvre-le en cliquant la ligne d'un élève | il s'affiche **une fois**, sans clignotement ni page vide entre deux |

### 2.2 · Les graphiques lisent l'échelle de chaque évaluation

**Pourquoi.** Les courbes convertissaient I/D/M/E en 40 / 65 / 75 / 100 écrits en dur — justes chez toi par coïncidence (ton échelle
vaut ces nombres), fausses chez un collègue. Maintenant chaque évaluation est lue dans SON échelle. **La rangée 3 est la vraie porte :
aucun banc ne connaît tes courbes comme toi.**

| | Geste | Attendu |
|---|---|---|
| **3** | Un élève que tu connais, section **Performance › Critères**, sur TON échelle | **les mêmes courbes qu'avant** — mêmes hauteurs, mêmes creux, aucun point disparu. ⚠ **Sauf un critère noté en points** (si ta grille en a — le cas du 4 sept., trouvé sur ton écran, le laisse penser) : sa hauteur peut bouger, elle vaut maintenant sa fraction (21 sur 30 → 70 %), plus le niveau déduit — c'est le correctif, pas une régression ; dis-le dans la note. Le pack démo n'a aucun critère en points : sa non-régression ne couvre pas ce chemin (relecture croisée Cowork, 19 h 43). Sous la légende « Critères : », aucune ligne « … sans valeur convertible » (sauf si une de ses évaluations désigne une échelle disparue : alors la ligne le dit, et c'est vrai) |
| **4** | Mode démonstration, un élève, mêmes graphiques | pas de trou dans les courbes ; **une ligne sous la légende dit « Zones : échelle « IDME et niv 0 » (n évaluations sur m) »** — c'est voulu : le pack démo désigne deux échelles, le graphique dit laquelle donne les zones. S'il y a un trou, la ligne « n évaluations sans valeur convertible dans cette échelle » est là |

### 2.3 · Les cases du rapport appartiennent au trimestre

| | Geste | Attendu |
|---|---|---|
| **5** | Section **Rapport** : décoche une case « Inclure… », change de trimestre (Cadre › Trimestre), reviens au profil, section Rapport | la case est **celle du trimestre** — décochée ici, cochée dans l'autre trimestre (avant : partagée entre trimestres et entre élèves) |

### 2.4 · Le volet confidentiel suit la liste des étudiant·es

**Pourquoi.** Tes mots (17 h 20) : *« La case des services adaptés devrait être cochée si, lorsque la liste des étudiants est créée,
un étudiant a cette option cochée. »* Et : *« nous allons retirer les dropdown IDME qui sont là uniquement pour ma pratique
personnelle. »*

| | Geste | Attendu |
|---|---|---|
| **6** | Section **Accompagnement › bouton « Confidentiel »** d'un élève marqué SA « Oui » dans `Cadre › Trimestre`, puis d'un élève « Non » | la case « Services adaptés » **suit la liste** : cochée pour le premier, décochée pour le second, **non modifiable** (grisée), avec « (d'après la liste des étudiant·es) » à côté ; **Catégorie et Sous-catégorie visibles seulement pour le premier** |
| **7** | Même volet : le bloc « Portrait de lecteur » (Conception · Rigueur · Plausibilité · Nuance · Français) | **absent** ; Parcours, Défis, Diagnostic, Notes personnelles et Notes de présences **intacts** |

### 2.5 · Le bouton « + Nouvelle intervention »

| | Geste | Attendu |
|---|---|---|
| **8** | Section **Accompagnement**, sous-titre « HISTORIQUE » | le bouton « + Nouvelle intervention » est **à droite du titre, sur la même ligne** ; la carte de l'historique dessous (mesuré sous WebKit à 1024 et 1366 ; ton Safari tranche) |

---

## §3 · Deux mots proposés — silence = tel quel

| Où | Le mot | Ta réponse |
|---|---|---|
| Volet confidentiel, à côté de la case | « (d'après la liste des étudiant·es) » | _______ |
| Sous la légende des graphiques | « n évaluations sans valeur convertible dans cette échelle » (et, si plusieurs échelles : « Zones : échelle « … » (n évaluations sur m) ») | _______ |

---

## §4 · Relevé

| Rangée | ✅ / ❌ | Note |
|---|---|---|
| 0.1 | ✅ | |
| 0.2 | ✅ | version lue : `1.138` |
| 1 | ✅ | |
| 2 | ✅ | |
| 3 | ✅ | aucun critère en points signalé |
| 4 | ✅ | |
| 5 | ✅ | |
| 6 | ✅ | |
| 7 | ✅ | bloc « Portrait de lecteur » absent ; Parcours, Défis, Diagnostic, Notes personnelles et Notes de présences intacts (capture, 12 h 58) |
| 8 | ✅ | |

**Relevée le** : 12 septembre 2026, 12 h 49 (Toronto), rangée 7 close à 12 h 58 · **Version lue en bas de page** : `1.138.0` · **Échecs → BACKLOG** : aucun

**§ 3 · Les deux mots** : tel quel (silence), les deux.

⮕ **Porte close, 10 sur 10.** Rien n'en sort vers le BACKLOG.

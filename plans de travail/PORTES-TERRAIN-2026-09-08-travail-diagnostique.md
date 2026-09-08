# PORTES TERRAIN — 8 septembre 2026 · #790, le travail diagnostique

> **Artefact jumeau** : *(lien ajouté à la publication)*
> **Base** : `main`, **1.125.0**, build **`0908-1502`**. Le lot est **poussé et déployé** —
> c'est l'adresse en ligne que tu ouvres, pas ton dossier.
> **État** : ⏳ **DUE.**
> **Ce qui échoue devient un item du BACKLOG avec son numéro de porte**, pas une note mentale.

---

## Pourquoi cette liste est courte

La plupart de ce qui a été livré est déjà **mesuré par des essais automatiques** : que le travail
diagnostique sorte des quatre calculs, qu'une grille sans case cochée ne signale rien, qu'un libellé
vide ne lève rien, que deux copies ne fassent pas lire deux fois la même phrase. Quarante-cinq cas,
et treize mutations du code faites exprès pour les faire rougir.

**Ne reste ici que ce qu'aucune machine ne peut faire** : ce que tes vraies données donnent, et ce
que ça donne sous ton doigt.

---

## §0 · Préalable

| # | Geste | Attendu |
|---|---|---|
| 0.1 | Ouvre **`https://app.codexnumeris.org`**, recharge la page, lis le numéro en bas | **1.125.0 — build `0908-1502`.** Si tu vois autre chose, recharge en vidant le cache (Cmd+Maj+R). Rien d'autre à faire avant : ton dossier sur le Mac n'alimente plus ton écran |
| 0.2 | Fais un export Codex avant de commencer | Un fichier de sauvegarde à toi. Tu vas cocher une case sur une vraie production ; c'est réversible, mais une sauvegarde fraîche ne coûte rien |

---

## §1 · ⚠⚠ Sur tes vraies données — le geste qui compte

> **C'est la seule section qui touche ton corpus.** Elle tient en trois rangées, et elle répond à la
> question qui a lancé tout ce chantier : ton portrait de lecteur peut-il cesser de peser sans
> disparaître ?

### 1.1 · Relève AVANT de cocher

> ┌ POURQUOI ─────────────────────────────────────────────────────────────────┐
> │ Tu as corrigé ce texte sur le seul critère du français, et il fait bouger  │
> │ la note et le palier RàI de tes élèves comme s'il mesurait la compétence   │
> │ entière. C'est ce qu'on veut faire cesser — sans perdre le travail.        │
> └───────────────────────────────────────────────────────────────────────────┘

| # | Geste | Attendu | Tags |
|---|---|---|---|
| 1.1 | Ouvre le profil de **deux élèves** de ton groupe et **note leur note finale et leur palier RàI**. Écris-les dans le champ à côté | *Mesure d'entrée : aucun chiffre n'est un échec ici.* Deux lignes du genre « Untel : 72 %, niveau 2 » | ⚠⚠ Données |

### 1.2 · Coche

| # | Geste | Attendu | Tags |
|---|---|---|---|
| 1.2 | Va dans **Productions**, ouvre ton **portrait de lecteur**, coche **« Travail diagnostique — ne compte dans aucun calcul »**, enregistre | La case est sous la pondération, dans un encadré bleu pâle. Rien d'autre ne change à l'écran | ⚠⚠ Données |
| 1.3 | Rouvre la même production | **La case est toujours cochée.** Si elle s'est vidée, arrête-toi : ✗, et dis-le | ⚠⚠ Données |

### 1.3 · Relève APRÈS

| # | Geste | Attendu | Tags |
|---|---|---|---|
| 1.4 | Rouvre le profil des **deux mêmes élèves** et note à nouveau note finale et palier RàI | **Les deux ont changé, ou pas** — l'un ou l'autre est normal, ça dépend de ce que ce texte pesait chez eux. Ce qui compte : **la note ne doit pas être devenue vide ni « 0 »**, et personne ne doit être passé au **niveau 3** | ⚠⚠ Données |
| 1.5 | Sur le profil d'un de ces élèves, **le travail diagnostique est-il toujours là** ? Sa copie, son annotation, son résultat | **Oui, tout est là.** On lui a retiré son poids, pas son existence. Si le travail a disparu du dossier, c'est ✗ | ⚠⚠ Données |
| 1.6 | Regarde ton groupe (**Suivi › Groupe**) : y a-t-il des élèves déclarés **« sans aucun travail remis »** qui n'auraient pas dû l'être ? | **Personne ne devrait l'être à cause du portrait de lecteur seul.** C'était le piège de la première semaine : un élève arrivé en retard pour une raison d'horaire basculait au niveau intensif | ⚠⚠ Données |

---

## §2 · À l'écran — ce que seul ton matériel peut dire

> WebKit n'existe pas dans nos conteneurs : **rien de ce qui suit n'a été vu dans Safari ni sur
> l'iPad.** Trois éléments visuels sont neufs.

| # | Geste | Attendu | Tags |
|---|---|---|---|
| 2.1 | **Sur l'iPad**, ouvre une production et touche la case « Travail diagnostique » — **sur son texte**, pas sur le petit carré | Elle se coche. Toute la rangée est sensible au doigt, pas seulement la case | iPad |
| 2.2 | **Sur l'iPad**, va dans une grille de critères, ouvre un critère algorithmique, descends aux paliers | Sous « Verdict » et « Recommandation », une rangée **« Ce palier lève un signalement »** avec sa case. Elle se coche au doigt | iPad |
| 2.3 | Sur Mac **et** iPad, regarde l'encadré de la case dans le formulaire de production, en mode clair **et** en mode sombre | Le texte se lit dans les deux modes, l'encadré ne déborde pas de sa colonne | iPad |

---

## §3 · Ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Ce sont des choix posés faute de pouvoir les trancher à ta
> place. **Écris ta réponse** — une case cochée ne dit pas laquelle.

| # | La question | Ce qui a été posé, et pourquoi |
|---|---|---|
| 3.1 | **Le libellé de la case te convient-il ?** « Travail diagnostique — ne compte dans aucun calcul » | Choisi pour dire l'effet avant le concept. « Diagnostique » plutôt que « formatif » : le mot est générique et ne suppose aucune discipline. **Ta réponse :** |
| 3.2 | **Quels paliers de TA grille doivent lever un signalement ?** | Rien n'est coché dans tes grilles — c'est à toi de le faire, et c'est voulu : aucune de tes grilles ne s'est mise à signaler toute seule. Le cadrage du 7 disait « dès *Risqué* », parce que ce palier recommande déjà l'aide dans le texte que l'élève lit. **Ta réponse :** |
| 3.3 | **Quelle phrase veux-tu lire quand un élève est signalé ?** | Le champ est **vide** par défaut, dans les paramètres de ton critère, à côté du nom du service. Tant qu'il est vide, aucun signalement ne se lève, même sur un palier coché. Le cadrage proposait « Aide en français recommandée ». **Ta réponse :** |
| 3.4 | **« Mesure d'aide » à la place de « CAF » — ça te va ?** | Ton choix d'aujourd'hui. Vérifie-le à l'écran sur un profil d'élève inscrit. **Ta réponse :** |

---

## §4 · Ce que je n'ai PAS pu vérifier

- **Safari et l'iPad, en entier.** WebKit est absent des conteneurs (#456). Les trois éléments
  visuels neufs — la case du formulaire, la case des paliers, l'encadré du signalement — n'ont
  jamais été rendus ailleurs que dans un moteur qui n'est pas le tien.
- **Le signalement de bout en bout sur de vraies copies.** Sa mécanique est mesurée sur banc, avec
  le vrai registre de projection ; mais aucune de tes copies n'a été traversée. Rangée 3.2 et 3.3 :
  tant que tu n'as rien coché ni écrit, il n'y a rien à voir — **ce n'est pas un échec, c'est l'état
  de départ.**
- **Le champ « Mesure d'aide » ne se saisit nulle part à l'écran.** Mesuré aujourd'hui : il n'entre
  que par import CSV, et c'était déjà le cas avant ce lot. Inscrit (#792), pas corrigé — la
  question de savoir si tu veux le cocher élève par élève t'appartient.
- **Deux erreurs de la session, rattrapées par le break-test, et je les dis parce qu'elles auraient
  passé pour du travail fini :** un garde-fou en double dont aucun des deux n'était éprouvable (un
  retiré), et un cas de test qui restait vert quoi qu'on casse (refait). Sans les mutations, les
  deux auraient été livrés verts.
- **Trois essais du toucher des bulles sont rouges** (Suivi › Groupe) — mesuré : **ils l'étaient
  déjà avant ce lot**, ils ne viennent pas de lui (#789).

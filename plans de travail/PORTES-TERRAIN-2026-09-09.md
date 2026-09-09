# Portes terrain — 9 septembre 2026 (#802)

> **Version à l'écran attendue : `1.127.1`, build `0909-1745`.**
> Couvre sept livraisons de la journée, de `1.125.2` à `1.127.1`.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.**
> Jamais une note mentale.
>
> ✅ **RELEVÉE LE 9 SEPTEMBRE 2026, 18 h 49 — 14 passées / 0 échec / 0 non traitée.**
> Les trois décisions du §3 sont tranchées et reportées ci-dessous. Seule la 3.3 appelle du code : **#810**.

**Pourquoi cette liste est courte.** Sept versions sont sorties aujourd'hui, et
la liste tient en **six rangées et trois décisions**. C'est voulu : une porte
n'existe que si aucune machine ne peut répondre à sa place, et une vérification
n'est due *avant* usage que si un raté serait irréversible. Tout le reste — le
texte de l'Aide, la mise en page du Comparateur, la fiche production — est
livré : si quelque chose cloche, tu le diras en travaillant, et on corrigera.
Ce qui n'a pas été vérifié est écrit au §4, porte ou pas.

---

## §0 · Préalable — trois gestes, deux minutes

Sans eux, tout le reste juge la mauvaise version.

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** (pas un fichier local), puis recharge en vidant le cache : **Cmd + Maj + R** | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.127.1`**, build **`0909-1745`**. Si tu lis autre chose, **arrête-toi** : le reste de la liste jugerait la version d'avant, et tous les rouges seraient faux. |
| **0.3** | Si tu comptes faire le §1 : **fais un export Codex** avant | Un fichier de sauvegarde daté d'aujourd'hui |

---

## §1 · ⚠⚠ Tes données — un seul geste, et il n'est pas optionnel

> Ce geste touche ton corpus réel. Il est ici parce que **le correctif tarit la
> source, il ne répare pas ce qui est déjà écrit chez toi**.

### 1.1 · Ta grille de référence pour le dépistage — à re-sélectionner UNE fois `⚠⚠ Données`

> **Pourquoi.** Tu avais remarqué que ta grille de critères pour le dépistage se
> vidait toute seule et qu'il fallait la re-choisir régulièrement. La cause est
> corrigée : elle ne se videra plus. Mais **la préférence déjà vidée dans tes
> données ne se remplit pas d'elle-même** — personne n'ira écrire dans ton codex
> à ta place. Un dernier choix manuel, et c'est fini.

| | Geste | Attendu |
|---|---|---|
| **1.1a** | Va dans **Labo → Outils d'observation** et regarde le sélecteur de grille de référence | Il montre soit ta grille, soit « — Sélectionner une grille — » |
| **1.1b** | S'il est vide : **choisis ta grille**, puis enregistre | Le nom de ta grille reste affiché |
| **1.1c** | **Recharge la page** (Cmd + R), reviens au même écran | ⮕ **Ta grille est toujours là.** C'est ça, le correctif. Avant, elle avait disparu. |

---

## §2 · Ce que seule ta tablette peut trancher

> Deux rangées. Ce sont les seules choses de la journée qu'aucun test ne peut
> juger : **le toucher réel d'un doigt sur un écran**.

### 2.1 · Saisir une bulle d'élève au doigt `iPad`

> **Pourquoi.** Tu avais écrit : « j'ai du mal à saisir les bulles blanches dans
> les barres de dégradés ». Elles font 10 pixels et bougent. Une tolérance a été
> posée : viser **à côté** doit suffire, et c'est la bulle **la plus proche du
> doigt** qui est saisie.
>
> ⚠ **Ce que les tests ne prouvent PAS ici.** Ils tournent dans un navigateur
> sans écran, qui n'émet même pas l'événement d'un tap — ils ont d'ailleurs
> accusé ce code à tort pendant 24 h. Ils disent que la mécanique fait ce qu'on
> lui demande. Ils ne disent rien de ton doigt.

| | Geste | Attendu |
|---|---|---|
| **2.1a** | Sur **l'iPad**, va au **tableau de bord** (Accueil ou Suivi) où s'affichent les barres avec les bulles d'élèves | Les barres sont visibles |
| **2.1b** | Pose le doigt **à côté** d'une bulle — pas dessus, à quelques millimètres | ⮕ **La bulle est saisie quand même**, et l'infobulle donne le nom de l'élève |
| **2.1c** | Là où deux bulles sont proches, pose le doigt **plus près de celle de gauche** | ⮕ C'est **celle de gauche** qui est saisie — la plus proche du doigt, pas celle du dessus |
| **2.1d** | Pose le doigt **loin de toute bulle**, sur le fond de la barre | ⮕ **Rien n'est saisi.** Aucune infobulle |
| **2.1e** | Un **seul** toucher sur une bulle | ⮕ Le nom apparaît **du premier coup**. Avant, le premier toucher ne servait qu'à faire grossir la bulle |

### 2.2 · Le Comparateur sur l'iPad, en mode sombre `iPad`

> **Pourquoi.** Le tableau du Comparateur a été réorganisé aujourd'hui : ses
> lignes sont regroupées sous six titres. Ces titres ne se distinguaient pas des
> lignes qu'ils coiffent, ce qui a été corrigé — mais **le rendu a été jugé sur
> un navigateur simulé**, et une première version inversait la hiérarchie en
> mode sombre sans que rien ne le signale.

| | Geste | Attendu |
|---|---|---|
| **2.2a** | Sur **l'iPad, en mode sombre**, va dans **Labo → Comparateur** | Le tableau s'affiche |
| **2.2b** | Regarde la colonne de gauche | ⮕ Trois niveaux se distinguent : **CONSTRUCTION DE LA NOTE** en majuscules sur fond plein ; les six paramètres (Objet, Révisabilité, Agentivité, Communication, Granularité, Détermination) en sarcelle, sans fond ; les lignes **en retrait** sous le leur |
| **2.2c** | Passe en **mode clair**, même écran | ⮕ Les trois niveaux se distinguent toujours. Rien n'est illisible, rien ne disparaît |

---

## §3 · Décisions — ce qui attend TON verdict

> **Ce ne sont pas des vérifications.** Rien à cocher : ce sont des choix posés
> aujourd'hui faute de pouvoir te les demander, et **il faut ta réponse écrite**.
> Une décision sans verdict écrit est une décision perdue.

### 3.1 · La prose de l'Aide sur les pratiques alternatives de notation

L'Aide définissait la PAN par **ta** façon de faire (« les N meilleurs
artefacts »). Elle présente maintenant quatre familles côte à côte et six
paramètres tirés du rapport PAREA. **Ces mots seront lus par tes collègues de la
cohorte.**

⮕ **Lis la carte « Les pratiques alternatives de notation (PAN) » dans
Aide → Introduction, et écris ton verdict :** les mots conviennent-ils ? Qu'est-ce
qui sonne faux, ou manque ?

> **Réponse de Grégoire (9 sept. 2026, 18 h 49) :** « C'est très bien. » ⮕ La prose de la carte PAN est retenue telle quelle.

### 3.2 · « Verrou sur une évaluation » — le mot retenu

L'assistant te faisait cocher « **Verrou sur une évaluation** » et son
récapitulatif répondait « **Verrou d'évaluation** ». Une seule case, deux mots.
J'ai retenu celui de l'écran de saisie, sans te le demander.

⮕ **Est-ce le bon mot ?** Si tu en préfères un autre, il ne se change plus qu'à
un seul endroit désormais.

> **Réponse de Grégoire (9 sept. 2026, 18 h 49) :** « C'est le bon mot. » ⮕ « Verrou sur une évaluation » est confirmé comme libellé unique.

### 3.3 · Ce à quoi la note se rapporte, en PAN – Standards

Le Comparateur affiche, pour PAN – Standards : « **Artefacts (instruments
d'évaluation)** ». C'est ce que le code fait — la note se construit sur des
artefacts de portfolio. Mais l'Aide, écrite le même jour, dit que les standards
portent sur « le niveau atteint pour des **cibles d'apprentissage** ».

⮕ **Les deux surfaces disent donc deux choses différentes**, et c'est une
question de pédagogie, pas de code : le Comparateur décrit la mécanique, l'Aide
l'intention. **Laquelle doit primer ?** Faut-il aligner l'une sur l'autre, ou
assumer la distinction en l'expliquant ?

> **Réponse de Grégoire (9 sept. 2026, 18 h 49) :** « C'est l'intention qui doit primer (la cible d'apprentissage). » ⮕ L'Aide fait foi ; le Comparateur doit être aligné sur elle pour PAN – Standards. Inscrit au backlog sous **#810**.

---

## §4 · Ce qui n'a PAS été vérifié — et les erreurs de la journée

**Aucune des sept livraisons n'a été vue sur Safari ni sur l'iPad.** Tout ce qui
suit a été mesuré sur un WebKit sans écran, ou sur un banc de démonstration.

**Ce qui n'a volontairement PAS de porte**, en application des deux règles du
modèle — aucune machine ne pouvant répondre, et un raté n'étant pas irréversible :
- le texte de l'Aide, du glossaire et de l'À propos (trois versions de prose) ;
- la mise en page de la fiche production et les boutons « Enregistrer » remontés ;
- les cinq correctifs testeurs de `1.125.2`.
⮕ **Livrés. Si quelque chose cloche, dis-le en travaillant.**

**Trois erreurs de session, rattrapées, qui disent où regarder si un doute
survient :**
1. **Des classes CSS employées mais définies nulle part.** `mt-10` (96 fois dans
   la page), et trois variables de couleur que j'ai failli utiliser. Elles ne
   « marchent » que par leur valeur de repli. Si un écart d'apparence apparaît
   quelque part, c'est une piste.
2. **Des tests qui n'attestaient rien.** Deux essais du toucher étaient verts
   *quoi qu'il arrive* — la tolérance entièrement retirée du code, ils restaient
   verts. Trois de mes propres gardes du jour ont eu le même défaut, attrapées
   en les cassant volontairement. **C'est pourquoi la rangée 2.1 existe : le
   vert des tests n'a jamais rien prouvé sur ce point.**
3. **Une collision d'identifiants** entre deux sessions travaillant en parallèle
   (`#807` pris deux fois). Rattrapée parce que les deux se parlaient — pas par
   le compteur.

**Diagnostiqué sans être reproduit :** la CI GitHub était rouge depuis 24 h sur
quatre essais. Aucun défaut applicatif dedans ; les quatre essais sont réparés.
Mais **le run de vérification en ligne n'avait pas encore conclu** au moment
d'écrire ceci.

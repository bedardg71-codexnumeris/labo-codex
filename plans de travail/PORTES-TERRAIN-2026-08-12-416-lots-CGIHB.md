# PORTES TERRAIN — #416 lots C · G · I · H · B (12 août 2026)

> **Jumeau markdown de l'artefact interactif** — les deux vont ensemble
> (`SKILL_portes_terrain.md`). L'artefact sert à cocher ; ce fichier sert à ce
> qu'une prochaine session retrouve ce qui reste dû **sans accès à la
> conversation**.
>
> **Ce qui échoue devient un item de BACKLOG, pas une note mentale.**

**Artefact interactif** : <https://claude.ai/code/artifact/cf5f2a4a-194a-4592-ac41-3a27d8b5fc65>
(publié le 12 août 2026 ; éprouvé au navigateur WebKit avant publication —
36 rangées, 4 champs de mesure qui remontent dans le relevé, filtres,
persistance, zéro erreur console).
**Périmètre** : cinq lots, de 1.76.0 à 1.78.0. La date dérivée (C), le
générateur à trois axes (G), le gabarit Calendrier (I), les gabarits nommés
(H), le travail hors classe (B).
**Précédente liste** : `PORTES-TERRAIN-2026-08-12-416-lotA.md` — 12/12 closes.

⚠ **C'est le cycle le plus lourd en INTERFACE de tout le chantier**, et
c'est ce qui justifie cette liste. Les tests exercent le moteur : 2347 cas
verts, 72 break-tests rouges, douze sorties d'usine identiques à l'octet. Rien
de tout ça ne dit si un bouton est atteignable au doigt, si un tableau se colle
correctement dans Pages, ou si un réglage que tu avais posé le 8 août est bien
revenu sous un autre nom.

---

## §0 · AVANT DE COMMENCER

⚠⚠ **LA PREMIÈRE RANGÉE N'EST PAS UNE VÉRIFICATION, C'EST UN DÉPLOIEMENT.**
Le lot B est commité mais **pas poussé** : la session ne pousse pas de sa
propre initiative. Sans ce geste, tout le §4 est invérifiable et l'iPad reste
sur 1.77.0.

- [ ] **SEULE commande de Terminal de toute la liste** (app Terminal, dans
      `Monitorage_v6`) :

      git push origin main

      ⮕ Attendu : le hook lance Vitest, puis `main -> main`. Netlify déploie
      en une minute environ. `Terminal`
- [ ] Ouvrir l'app et vérifier **1.78.0** en bas de page.
      ⚠ Contrairement à la liste du lot A, **le numéro est le bon repère cette
      fois** — une release a bien été faite.
- [ ] Sur iPad, si le numéro reste à 1.77.0 ou moins : **onglet privé**.
      Safari iPad garde le cache malgré les en-têtes (`DEPLOY.md` §2.2).
- [ ] **Backup Codex** ⚠⚠ — le §1 et le §5 écrivent dans ta carte A26, et le
      §2 vérifie une migration qui a déjà eu lieu toute seule.
- [ ] Prévoir **les deux appareils** (Mac et iPad) et **les deux modes**
      (clair et sombre).

---

## §1 · ⚠⚠ DONNÉES — la migration a déjà eu lieu

### 1.1 · Ton réglage d'export du 8 août est-il devenu un gabarit ?
`#416 lot H` · migration automatique

> **POURQUOI.** Le 8 août, tu as réglé un export « Personnalisé » pour te
> conformer aux exigences de ton département. Ce niveau n'existe plus : il est
> remplacé par des gabarits nommés, que tu peux avoir en plusieurs exemplaires.
> Ton réglage n'a pas été effacé — il a été **converti**, automatiquement, au
> premier ouvrage du panneau.

- [ ] Ouvrir la carte d'alignement → **Actions ▸ Exporter le plan…**
      ⮕ **Attendu** : la liste s'appelle maintenant **Gabarit** et non plus
      « Niveau ». `⚠⚠ Données`
- [ ] Cliquer **Gabarits d'export…** et regarder la liste.
      ⮕ **Attendu** : quatre gabarits marqués **d'usine** (Plan de cours, En
      classe, Preuve d'alignement, Calendrier) et, **si tu avais réglé un
      export personnalisé**, un cinquième nommé **« Mon export personnalisé »**
      sans la mention d'usine. `⚠⚠ Données`
- [ ] Le sélectionner et regarder ses colonnes.
      ⮕ **Attendu** : elles correspondent à ce que tu avais coché le 8 août —
      si tu avais décoché les rétroactions, il n'y a pas de colonne
      Rétroaction. `⚠⚠ Données`

⚠ **Si le cinquième gabarit n'y est pas** : soit tu n'avais jamais réglé
d'export personnalisé (c'est possible et normal), soit la migration a échoué.
La différence se voit à ceci : dans le second cas, tu te souviens d'avoir
réglé des cases le 8 août. **Me le dire — c'est un défaut de migration, pas
une préférence perdue** : l'ancien réglage n'est effacé qu'après que le
gabarit soit écrit.

---

## §2 · LE CALENDRIER — le livrable que tu attendais

### 2.1 · Sortir ton déroulement A26
`#416 lots C + I` · le CSV que tu tiens à la main

> **POURQUOI.** C'est le point d'arrivée de tout le chantier : le déroulement
> que tu tiens à la main, produit par l'application, avec des dates que tu n'as
> pas saisies.

- [ ] Actions ▸ Exporter le plan… → gabarit **Calendrier**.
      ⮕ **Attendu** : le format **Texte a disparu** de la liste. Seuls TSV et
      Markdown restent. Ce n'est pas un bug.
- [ ] Si ton cours A26 a **plusieurs groupes** : un menu **Groupe** apparaît
      sous les formats.
      ⮕ **Attendu** : il n'apparaît QUE pour le Calendrier, et seulement si tu
      as plus d'un groupe. Avec un seul groupe, aucune question n'est posée.
- [ ] Choisir **TSV**, cliquer **Télécharger**, ouvrir dans Numbers.
      ⮕ **Attendu** : six colonnes — Semaine · Séance · Date · Contenu ·
      Évaluations · Travail personnel. **Une ligne par rencontre**, pas une
      ligne par activité.

### 2.2 · Les dates sont-elles les BONNES ?
`#416 lot C` · ⚠ c'est la porte la plus importante de la liste

> **POURQUOI.** La date n'est jamais saisie : elle est déduite de la semaine de
> la leçon, de son rang dans la semaine, et de l'horaire du groupe. Personne ne
> peut vérifier ça à ta place — seul toi sais quel jour tu vois ce groupe.

- [ ] Prendre **trois lignes au hasard** et comparer avec ton horaire réel.
      ⮕ **Attendu** : la date tombe un jour où tu vois effectivement ce
      groupe-là.
      **Mesure à écrire** : combien de dates justes sur trois ?
- [ ] Regarder une **semaine à deux séances** : les deux leçons ont-elles des
      dates différentes, dans le bon ordre ?
      ⮕ **Attendu** : la séance A précède la séance B.
- [ ] Si tu as deux groupes, refaire l'export avec **l'autre groupe**.
      ⮕ **Attendu** : les dates **changent**, et le reste ne bouge pas.

### 2.3 · Ce qui n'a pas de date
`#416 lot C` · les états dégradés

- [ ] Repérer une leçon **sans rang de séance** posé.
      ⮕ **Attendu** : sa ligne existe, avec sa semaine, mais **la colonne Date
      est vide**. Elle ne disparaît pas du calendrier.
- [ ] Repérer une **semaine sans rien de prévu**.
      ⮕ **Attendu** : sa ligne est là, vide à droite. « Semaine 7, rien de
      prévu » est une information.

### 2.4 · Le Markdown se colle-t-il en tableau ?
`#416 lot I`

- [ ] Refaire l'export en **Markdown**, cliquer **Copier**, coller dans Pages
      (ou Word).
      ⮕ **Attendu** : ça arrive comme un **tableau**, pas comme du texte avec
      des barres verticales. **Avant ce cycle, le Markdown sortait en sections
      (`### Titre`) — c'est la nouveauté.**
      **Mesure à écrire** : dans quelle application as-tu collé, et le tableau
      s'est-il formé ?

---

## §3 · LES GABARITS — en fabriquer un à toi

### 3.1 · Dupliquer, modifier, retrouver
`#416 lot H`

> **POURQUOI.** Les quatre gabarits d'usine ne se modifient pas sur place :
> si tu cassais « Plan de cours », tu n'aurais aucun moyen de le retrouver.
> Dupliquer coûte un clic.

- [ ] Gabarits d'export… → choisir **Calendrier** → **Dupliquer**.
      ⮕ **Attendu** : un nouveau gabarit « Calendrier (copie) » apparaît,
      **sans** la mention d'usine, et ses contrôles deviennent actifs.
- [ ] Le renommer « Plan département » dans le champ **Nom**.
      ⮕ **Attendu** : le nom change dans la liste au-dessus.
- [ ] **Décocher** une colonne, en **ajouter** une autre (section « À ajouter »),
      en **déplacer** une avec les flèches.
      ⮕ **Attendu** : l'aperçu à droite suit **à chaque geste**.
- [ ] **Renommer** une colonne — taper « Travaux en atelier » en face de Contenu.
      ⮕ **Attendu** : l'en-tête de l'aperçu change, **le contenu des cellules
      ne bouge pas**.
- [ ] Vider ce champ de renommage.
      ⮕ **Attendu** : la colonne **reprend son nom d'usine**.
- [ ] Fermer la modale, rouvrir **Actions ▸ Exporter le plan…**.
      ⮕ **Attendu** : « Plan département » est dans la liste des gabarits,
      **exportable directement** sans repasser par la modale.

### 3.2 · Ce qu'un gabarit d'usine refuse
`#416 lot H`

- [ ] Sélectionner **Plan de cours** dans la modale.
      ⮕ **Attendu** : le champ Nom est **grisé**, les cases de colonnes aussi,
      et le bouton **Supprimer** est inactif.
- [ ] Sur ton gabarit à toi, essayer de **décocher toutes les colonnes**.
      ⮕ **Attendu** : la dernière refuse de partir, avec le message « Un
      gabarit garde au moins une colonne. »

### 3.3 · Supprimer
`#416 lot H`

- [ ] Supprimer « Plan département ».
      ⮕ **Attendu** : il disparaît de la liste, et l'éditeur bascule sur un
      autre gabarit sans écran vide.
- [ ] **Recharger la page**, rouvrir la modale.
      ⮕ **Attendu** : il est toujours supprimé. Et si c'était le gabarit issu
      de ta migration, **il ne revient pas** — supprimer est une décision.

---

## §4 · LE TRAVAIL HORS CLASSE — ⚠ le Σ des leçons

> ⚠⚠ **CE §4 N'EST VÉRIFIABLE QU'APRÈS LE PUSH DU §0.** Le lot B n'est pas en
> ligne avant.

### 4.1 · Le total d'une leçon ne compte que du temps de classe
`#416 lot B` · ⚠ la porte la plus risquée du cycle

> **POURQUOI.** Le compteur dans l'en-tête d'une leçon et la jauge du
> planificateur servent à décider quoi couper. Si du travail personnel s'y
> ajoutait, le total aurait l'air juste et serait faux — et ça ne ressemblerait
> pas à un bug d'export.

- [ ] Choisir une leçon dont le total te est familier. **Noter son Σ.**
      **Mesure à écrire** : le total avant.
- [ ] Ouvrir l'Inspecteur d'une de ses activités qui porte une durée, cocher
      **Travail hors classe**.
      ⮕ **Attendu** : le champ **Durée disparaît** du bloc sur la carte, et le
      Σ de la leçon **baisse exactement de cette durée**.
      **Mesure à écrire** : le total après, et la durée de l'activité.
- [ ] Regarder le Σ de la **séquence** qui contient cette leçon.
      ⮕ **Attendu** : il a baissé du même montant.
- [ ] **Décocher** la case.
      ⮕ **Attendu** : le champ Durée revient **vide**. La durée n'est pas
      restaurée — c'est voulu : elle a été retirée quand tu as coché, et
      personne ne l'a ressaisie.

### 4.2 · Où la case apparaît, et où elle n'apparaît pas
`#416 lot B` · D4

- [ ] Ouvrir l'Inspecteur d'une **connaissance** (factuelle, conceptuelle…).
      ⮕ **Attendu** : **aucune** case « Travail hors classe ». Une connaissance
      ne se « fait » pas.
- [ ] Ouvrir celui d'une **évaluation**, puis d'un **exposé**.
      ⮕ **Attendu** : la case est là dans les deux cas.
- [ ] Ouvrir celui d'une **leçon** ou d'une **séquence**.
      ⮕ **Attendu** : pas de case non plus.

### 4.3 · La sixième colonne se remplit
`#416 lots B + I`

- [ ] Marquer une activité et une évaluation **hors classe** dans la même
      leçon, puis réexporter le **Calendrier**.
      ⮕ **Attendu** : les deux sortent dans **Travail personnel**, l'activité
      par son titre, l'évaluation par le **nom de sa production**.
- [ ] Regarder les colonnes Contenu et Évaluations de la même ligne.
      ⮕ **Attendu** : les deux éléments **n'y sont plus**. Rien n'apparaît deux
      fois sur une même ligne.

---

## §5 · DÉCISIONS — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Chacune attend une **réponse écrite**.

### 5.1 · Le séparateur des cellules qui agrègent
Quand plusieurs activités tombent le même jour, elles sont séparées par
**« · »** : `Exposé magistral · Atelier d'analyse`. Choix de lisibilité en
tableur — une virgule se confond avec la ponctuation des titres.

**Verdict attendu** (à écrire) : *lisible* · *préférer autre chose (quoi ?)*.

### 5.2 · Le nom des colonnes du Calendrier
« Semaine · Séance · Date · Contenu · Évaluations · Travail personnel » — repris
de ton CSV. Tu peux les renommer par gabarit, mais **les noms d'usine sont ce
que tout le monde verra en premier**.

**Verdict attendu** (à écrire) : *bons* · *à changer (lesquels, en quoi ?)*.

### 5.3 · Le mot « Gabarit »
Le panneau dit maintenant **Gabarit** là où il disait « Niveau ». Le vocabulaire
du projet privilégie l'universel avant l'ésotérique.

**Verdict attendu** (à écrire) : *clair* · *préférer* … (« Modèle » ?
« Format » ? « Présentation » ?).

### 5.4 · L'ordre des colonnes disponibles
Dans l'éditeur, les colonnes **choisies** sont en haut dans ton ordre, les
**disponibles** en dessous sous « À ajouter », dans l'ordre du catalogue. Une
colonne ajoutée arrive **à la fin** de ta liste.

**Verdict attendu** (à écrire) : *logique* · *elle devrait arriver ailleurs
(où ?)*.

---

## §6 · CE QUE JE N'AI PAS PU VÉRIFIER

**Tout ce qui est dans cette liste, par construction.** L'éditeur de gabarits,
le menu Groupe, la case de l'Inspecteur, le collage Markdown dans Pages : c'est
de l'interface neuve, et les tests exercent le moteur. C'est le cycle le plus
lourd en interface du chantier, et le moins éprouvé au navigateur.

**Les dates sur tes VRAIES données.** La carte d'essai a deux groupes fictifs
avec quatre séances chacun. Ton A26 a 30 séances réelles, un calendrier avec
des congés, et une carte importée dont le rattachement au cours a pu bouger. La
porte 2.2 est celle qui compte.

**La migration sur TON réglage.** Elle est testée sur des configurations
construites pour le test — y compris tronquées, bricolées, écrites par une
version antérieure. Elle n'a jamais tourné sur le réglage que tu as réellement
posé le 8 août. C'est la porte 1.1.

**Cinq tests d'intégration restent ROUGES** — les mêmes cinq que ce matin,
mesurés sur `main` avant ce chantier. Aucune régression, mais aucune correction
non plus : c'est un chantier distinct, toujours à ouvrir.

**Ce que j'ai retiré, et qui pourrait manquer.** Le niveau « Personnalisé » et
sa modale ont disparu. Deux de ses sentinelles portaient des gardes
transversales — l'aperçu sans `innerHTML`, le ratchet « zéro listener souris » —
qui ont été **reprises** dans la sentinelle de l'éditeur. Ce qui a été supprimé,
ce sont les cas qui verrouillaient un comportement qui n'existe plus. Si tu
retrouves un usage que tu avais et qui n'est plus possible, **c'est un item de
backlog, pas une fatalité**.

**Une erreur de session à consigner.** Un octet NUL s'est glissé dans une chaîne
de `planification-export.js` pendant l'écriture du lot I : `grep` voyait le
fichier comme binaire et les remplacements échouaient sans raison apparente.
Corrigé, et le dépôt entier balayé — il n'y en a aucun autre. Rien n'est parti
en ligne avec.

---

## ÉTAT

| | |
|---|---|
| **Portes ouvertes** | 31 vérifications + 5 préalables + 4 décisions |
| **Fermées** | 0 — liste émise le 12 août |
| **Vitest** | 2347 / 2347 (255 fichiers) |
| **Break-tests** | 72 / 72 ROUGE, six bancs |
| **Sorties d'usine** | identiques à l'octet (golden master, 11 références) |
| **Playwright WebKit** | 87 verts, 5 rouges — préexistants, mesurés avant le chantier |

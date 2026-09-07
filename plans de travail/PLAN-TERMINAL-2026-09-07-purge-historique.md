# PLAN DE TRAVAIL — la purge au terminal, sur le Mac de Grégoire (#781)

**Écrit le 7 septembre 2026 au soir. Exécution prévue le JEUDI 10 SEPTEMBRE**, au terminal,
sur le Mac de Grégoire. Ce document est court exprès : il ne porte que ce qui change quand le
chantier tourne **chez lui** plutôt que dans un conteneur.

▣ **Il ne suppose rien de la session qui l'exécutera** — ni son modèle, ni qu'elle ait vu la
conversation du 7 septembre. C'est le sens de « à froid » : tout ce qui est nécessaire est
écrit, ici et dans le chantier.

| | Où |
|---|---|
| **Le détail technique** | `plans de travail/CHANTIER-historique-git-donnees-personnelles.md` — §0 la consigne d'exécution, §4 les commandes, §5 les vérifications |
| **Ce que Grégoire fait** | `plans de travail/PORTES-TERRAIN-2026-09-07-purge-historique.md` + son artefact |
| **Ce document-ci** | le déroulé au terminal : qui agit, et **où ça s'arrête** |

---

## Ce qui CHANGE parce qu'on est sur son Mac

| | En conteneur | Chez lui |
|---|---|---|
| Historique | clone superficiel — **`--unshallow` obligatoire** | clone complet : **l'étape disparaît** |
| Sauvegarde | meurt avec le conteneur | **reste sur son disque** — c'est ce qui avait tué la 1ʳᵉ tentative |
| Les listes | à faire voyager | déjà là, `~/purge-identites/` |
| Le reclonage | impossible | c'est lui qui le fait, à la fin |
| GitHub Desktop | absent | **ouvert et surveillant le dossier** — à fermer |

⛔⛔ **LANCER `claude` DEPUIS LE DOSSIER PERSONNEL, PAS DEPUIS LE DÉPÔT.**

```bash
cd ~
claude
```

**Pourquoi c'est la première chose écrite ici** : à la fin, Grégoire renomme
`~/Documents/GitHub/Monitorage_v6` en `_ancien`. Si la session tourne DANS ce dossier, on lui
retire le sol sous les pieds au moment le plus délicat. Depuis `~`, elle lit le dépôt, écrit la
copie de travail à côté, et survit au renommage.

---

## LA CONSIGNE DE DÉPART — à coller telle quelle dans le terminal

> Purge de l'historique git, chantier #781. Lis d'abord, en entier et dans cet ordre :
> `~/Documents/GitHub/Monitorage_v6/plans de travail/CHANTIER-historique-git-donnees-personnelles.md`
> (son §0 est ta consigne d'exécution), puis
> `~/Documents/GitHub/Monitorage_v6/plans de travail/PLAN-TERMINAL-2026-09-07-purge-historique.md`.
>
> Mes listes d'élèves sont dans `~/purge-identites/` — dix fichiers au format d'export du
> collège. Elles ne sortent jamais de là et n'entrent jamais dans le dépôt.
>
> Tu travailles en six phases. **Tu t'arrêtes à la fin de la phase 2 et de la phase 4, et tu
> attends ma réponse.** Le `push --force` n'a lieu qu'à la phase 5, sur ma phrase explicite —
> pas avant, quoi que disent les documents sur mon accord de septembre.
>
> Commence par la phase 1.

---

## LES SIX PHASES

### Phase 1 · État des lieux et sauvegarde — *la session*

1. Vérifier que le clone est complet (`git rev-list --count main` ≈ 4 600, pas 60) et
   **ne pas faire `--unshallow`** s'il l'est déjà.
2. **Mesure d'entrée** : le balayage des DA sur le dépôt d'origine — c'est le témoin
   obligatoire du §5 C. Sans lui, la vérification d'après ne prouve rien.
   *Repère mesuré le 7 sept. sur les 19 DA connus : 197 blobs, 10 chemins, 182 dans `BACKLOG.md`.*
3. `git bundle create ~/sauvegarde-monitorage.bundle --all`, puis `git bundle verify`.
   ⮕ **Le dire à Grégoire** : le fichier est là, c'est son filet.

⚠ Avant tout : **GitHub Desktop fermé** (rangée 0.1 de la porte).

### Phase 2 · Le rapport de collisions — *la session prépare, ⛔ **Grégoire tranche***

Lire les dix listes, dédupliquer par DA, puis **compter chaque nom et chaque prénom dans le
dépôt** (§4.4 du chantier). Présenter le rapport, et **s'arrêter là**.

▣ **C'est la phase qui décide de la qualité de tout le reste.** Un prénom mal jugé casse des
centaines de mentions : « Léa » apparaît **214 fois** dans le dépôt — c'est la plateforme du
collège, pas une élève. « Alice » 66 (l'élève fictive des bancs), « Rose » 57 (une couleur),
« Camille » 24 (la démo), « Olivier » 23 (un collègue testeur).

⛔ **ARRÊT.** Aucune règle n'est écrite avant que Grégoire ait lu ce rapport.

### Phase 3 · La copie, les règles, la réécriture — *la session*

1. Copie de travail **hors du dépôt** : `git clone --no-local ~/Documents/GitHub/Monitorage_v6 ~/purge-travail`
   ⚠ **Vérifier ce que la copie contient** (quelles refs, combien de commits) **avant** de
   réécrire : on ne réécrit pas un historique qu'on n'a pas.
2. Les deux fichiers de règles, générés **hors du dépôt**, depuis `~/purge-identites/` et les
   arbitrages de la phase 2 (§4.4).
3. `git filter-repo` (§4.5). Sur la copie, jamais sur son dépôt.

### Phase 4 · Les quatre vérifications — *la session*, ⛔ arrêt si l'une échoue

A l'arbre intact · B les chemins disparus · C les identités disparues · D `git fsck` (§5).
⚠ **Chacune avec son témoin.** La plus importante avait d'abord été écrite comme une
tautologie : elle comparait la copie avec elle-même et rendait « identique » par construction.

⛔ **ARRÊT.** Rapport à Grégoire, et attente.

### Phase 5 · Le déclenchement — *sur sa phrase, jamais avant*

Avant de pousser, **lui redemander** (§0 du chantier) : a-t-il du travail non commité ?
confirme-t-il la perte des 65 branches non fusionnées ? Puis le force-push et la suppression des
branches distantes sauf `main` (§6).

### Phase 6 · Chez lui — *Grégoire, avec la porte terrain*

Renommer en `_ancien` · recloner **au même chemin** · lire le numéro de version ·
**vérifier que ses trimestres sont là AVANT d'effacer quoi que ce soit** · puis jeter
`_ancien` **et** `~/purge-identites/`.

---

## CE QUI RESTE DÛ APRÈS — à ne pas laisser tomber

- **La question du support GitHub** (§7) : les anciens objets restent joignables un temps par
  leur adresse. Obligatoire si le dépôt passe en public — décision 3.3 de la porte.
- **Verser au BACKLOG** ce qui aura échoué, avec son numéro de rangée.
- **Mettre à jour** le §8 du chantier et le `RELAIS.md`.

## LE CALENDRIER — un fait à avoir en tête, pas un avertissement

**Jeudi 10 septembre, c'est quelques jours avant l'arrivée de la cohorte 1.** La manœuvre rend
le clone de Grégoire irréconciliable et l'oblige à recloner : son application se lance depuis ce
dossier. Le filet existe et il est bon — le dossier `_ancien` reste entier jusqu'à ce qu'il ait
vérifié ses trimestres (rangées 2.1 à 2.5) —, et **la réécriture ne change aucun fichier du
présent** : l'application d'après est bit-pour-bit celle d'avant, c'est la vérification A.
⮕ Le risque n'est donc pas dans le résultat, il est dans **le temps** qu'une reprise coûterait
si une étape coinçait ce jour-là. À lui de juger si la fenêtre lui convient.

## CE QUE CE PLAN NE PROMET PAS

- **Les commandes exactes de la réécriture vivent au §4 du chantier, pas ici.** Ce document ne
  les recopie pas : deux copies d'une commande destructrice finissent par diverger.
- **La couverture vaut celle des listes.** Un élève absent survit sans signal.
- **Rien de tout ceci n'a été exécuté.** Le chantier n'a jamais été mené à son terme : la
  première tentative est morte avec son conteneur.

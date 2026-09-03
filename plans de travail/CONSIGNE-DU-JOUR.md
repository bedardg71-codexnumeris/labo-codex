# Consigne du jour — fermer l'audit du 25 août pour de bon

> **Promue consigne du jour le 3 septembre 2026 à 11 h 20 (heure de Grégoire), par Cowork,
> avec lui.** Écrite le 2 septembre à 13 h, **remesurée et corrigée avant promotion**.
> **Application au moment de l'écriture : `1.113.0`, build `0903-0906`, POUSSÉE.**
>
> ▣ **État à l'écriture, mesuré** : `HEAD` = `76cb53c3`,
> `git rev-list --count origin/main..HEAD` rend **0** — témoin, `HEAD..origin/main` rend **0**
> lui aussi. Arbre propre sauf `OU-EN-EST-ON.md` et `PROTOCOLE.md`, à Cowork :
> **ne les commite pas.**
>
> ▣ **LES HUIT ÉNONCÉS DE LA COHORTE 1 SONT PARCOURUS**, depuis ce matin. Ce lot ne les
> touche pas : il éteint une dette de méthode.
>
> ⚠ **REMESURE** (règle 1). Les lignes citées datent d'hier.
>
> **Source** : `plans de travail/PLAN-2026-09-02-evaluation-avant-la-chronique.md`, temps 1.
> Ce fichier-ci exécute ; le plan explique.

---

## Le mandat — un audit n'est pas fini tant que ses constats n'ont pas de disposition

`CLAUDE.md`, §« Ce qu'un audit doit produire » :

> *Un audit n'est pas terminé quand il est déposé — mesuré le 1er sept. : sur 51 rapports,
> **22 sans suite**. Il l'est quand chaque constat porte, **DANS le fichier d'audit**, l'une
> de trois dispositions : inscrit (n°), refusé (motif), périmé.*

`Rapports/AUDIT-evaluation-onglet-2026-08-25.md` **n'en porte aucune.** Le compte des
livraisons vit ailleurs — au backlog et dans `OU-EN-EST-ON.md`. Quelqu'un qui ouvre le
rapport ne peut pas savoir ce qu'il est devenu.

⮕ **Le livrable est le FICHIER D'AUDIT lui-même.** Rien d'autre ne bouge.

⛔ **CE N'EST PAS UN RÉ-AUDIT.** Tu ne rouvres aucun constat, tu ne relis pas le code pour
vérifier les seize corrections. **La correspondance est déjà faite et mesurée** (ci-dessous).
C'est de la transcription, plus quatre corrections nommées.
⚠ **Si une ligne du tableau ne correspond pas à ce que tu trouves au backlog : NE CORRIGE
PAS EN SILENCE. Dis l'écart dans ton rapport.** C'est Cowork qui l'a mesuré, et Cowork s'est
trompé quatre fois aujourd'hui.

---

## La correspondance — mesurée par Cowork le 2 septembre à 11 h 40

Commandes qui l'ont produite, à rejouer si tu veux la vérifier :

```bash
grep -n "Constats de l'audit de l'onglet ÉVALUATIONS" BACKLOG.md
awk 'NR>=4145 && NR<=4620' BACKLOG.md | grep -nE "^- \[[ x]\] \*\*#[0-9]+"
```

Le rapport porte **A1-A2** (2 critiques), **B1-B13** (13 majeurs), **C1-C5** (5 de design) =
**20**. Sa section **D — « Mineurs (condensé) » — n'est PAS dans les vingt** ; elle a sa
propre fiche.

| Constat | Disposition à inscrire |
|---|---|
| **A1** | *inscrit* → **#556**, livré le 28 août |
| **A2** | *inscrit* → **#557**, livré le 28 août |
| **B1, B2, B3** | *inscrit* → **#558**, livré |
| **B4** | *inscrit* → **#559**, livré |
| **B5, B8** | *inscrit* → **#560**, ⚠ **PARTIEL** — voir correction 1 |
| **B6** | *inscrit* → **#561**, livré le 29 août |
| **B7** | *inscrit* → **#562**, livré le 29 août |
| **B9** | *inscrit* → **#563**, livré le 29 août |
| **B10** | *inscrit* → **#564**, livré |
| **B11, B12** | *inscrit* → **#565**, livré |
| **B13** | *inscrit* → **#566**, livré le 29 août |
| **C1** | *inscrit* → **#567**, ⚠ **PARTIEL** — voir correction 2 |
| **C2** | *inscrit* → **#568**, livré le 29 août |
| **C3** | *inscrit* → **#569**, livré le 29 août |
| **C4** | *inscrit* → **#570**, livré le 29 août |
| **C5** | *inscrit* → **#571**, ⚠ **livré + une part REFUSÉE** — voir correction 3 |
| **Section D** | *inscrit* → **#572**, ⚠ **PARTIEL** — voir correction 4 |

---

## Les quatre corrections — c'est là qu'est le travail

### Correction 1 · B5/B8 → #560 : ↻ **CE N'EST PLUS « PARTIEL ». C'EST TRANCHÉ ET LIVRÉ.**

⚠⚠ **CETTE LIGNE A CHANGÉ DEPUIS L'ÉCRITURE D'HIER. Ne recopie pas l'ancienne.**

▣ **Le constat B5 est REFUSÉ, et le motif est de Grégoire.** B5 décrivait la portée des
suppressions par couple `(élève, production)` comme *« trop large »*. **Elle ne l'est pas** :
tranché le 2 septembre 2026 — *« TOUT ce qui touche le couple part : originale, reprises,
évaluation d'un fichier réimporté »*. Le code faisait déjà le bon geste ; **c'est l'écran qui
ne le disait pas.**

▣ **B8, et la part restante de B5 : INSCRIT → livré en 1.111.2**, le 3 septembre au matin.
La fenêtre annonce désormais, dans les mots de Grégoire :
*« Le fichier, ses annotations et toutes les évaluations de cet élève pour cette production
seront effacés. »* ▣ **ÉPROUVÉ PAR GRÉGOIRE à l'écran** le 3 septembre.
▣ **Témoin négatif tenu** : le déplacement à la corbeille, qui ne détruit rien, ne dit rien de
plus qu'avant.

⮕ **Dispositions à inscrire dans le fichier d'audit** : pour **B5**, *refusé* — avec le motif
ci-dessus, en toutes lettres. Pour **B8**, *inscrit* → #560, livré en 1.111.2.
⚠ **Un refus sans son motif ne vaut rien** : c'est ce qui fait revenir le constat dans six mois.

### Correction 2 · C1 → #567 est PARTIEL

Quatre variables CSS fantômes remplacées ; **les 78 autres tiennent par un cliquet global**.
⮕ Disposition : **partiel**, avec renvoi à **#595** (78 variables employées et jamais
définies, ≈ 270 usages — ouvert) et **#679** (rien ne vérifie qu'une classe CSS employée
dans `js/` existe dans `styles.css` — ouvert).

### Correction 3 · C5 → #571 porte une part REFUSÉE, et le motif est de Grégoire

Le backlog dit : *« les correctifs ; **les tailles restent, par décision** »*. La densité du
PDF (base 10 px, dates à 6 px) desservait l'usage cellulaire ; Grégoire a tranché de la garder.
⮕ Disposition : **inscrit** pour les correctifs (lisibilité sur les couleurs d'échelle, date
échappée) **+ refusé** pour les tailles, **avec le motif nommé**. Un refus sans motif ne vaut
rien : c'est ce qui fait revenir le constat dans six mois.

### Correction 4 · Section D → #572 est PARTIEL, et sa ligne est FAUSSE

⚠⚠ **C'est la correction qui compte, et elle vaut son paragraphe.**

`#572` déclare, au backlog comme dans le code :

> `// #572 — LA VALEUR CALCULÉE EST LA SOURCE, l'écran n'en est que l'affichage.`
> *« la note finale n'est plus relue depuis le DOM (`parseFloat(textContent)`, **trois
> sites**) mais depuis `noteCalculeeCourante` »*

**Il y en avait quatre.** Mesuré par Cowork le 2 septembre à 11 h 40, **rejoué à 12 h 45**,
inchangé après 1.110.0 :

```bash
grep -rn "parseFloat(.*noteProduction1" js/ --include=*.js
grep -rn "noteCalculeeCourante" js/ --include=*.js
```

▣ Trois sites écrivent bien la valeur calculée : `evaluation-sauvegarde.js:209`,
`evaluation-chargement.js:1452`, `evaluation-chargement.js:1476`.
▣ **Le quatrième relit toujours l'écran** — `js/evaluation.js:1784`, dans
`_lireChampsDOMMod`, appelé **une seule fois**, à `js/evaluation.js:1959`, qui est **le chemin
de MODIFICATION d'une évaluation existante** :

```js
noteFinale: parseFloat(document.getElementById('noteProduction1').textContent) || 0,
```

▣ **Et la sentinelle est verte parce qu'elle ne regarde que deux fichiers.**
`tests/unit/sentinelle-572-mineurs-liste-annoter-design.test.js`, **l. 77** :

```js
for (const [nom, src] of [['evaluation-sauvegarde', sauvegarde], ['evaluation-chargement', chargement]]) {
```

`evaluation.js` n'y est pas. Le titre du cas dit *« et plus personne ne relit le DOM »* ; il
en vérifie deux sur trois.

⮕ Disposition à inscrire : **partiel**, avec les trois faits ci-dessus, et le renvoi au
**temps 2** du plan.

⛔ **NE CORRIGE RIEN DE TOUT ÇA DANS CE LOT.** Ni le quatrième site, ni la sentinelle.
**C'est le temps 2, et c'est une autre séance** (règle 6 : une seule décision principale par
séance). Ici, tu ÉCRIS que c'est ouvert. *Inscrire et continuer* — issue 2 de `CLAUDE.md`.

---

## Ce que le fichier d'audit doit porter en plus, en tête

1. **Sa base de REMESURE à côté de sa base d'audit.** Aujourd'hui il annonce
   *« Base auditée : `main` 1.99.0 (commit `8dfda3ed`) »*. Ajoute la date et la version où
   les dispositions ont été établies — c'est ce qui dit au lecteur suivant à quel point elles
   ont vieilli.
2. **Le rappel que ses numéros de ligne datent de 1.99.0** et ne se suivent pas au doigt.
3. **Le rappel que ses verdicts sont `[lecture]`** : *« aucun Chromium n'a été lancé »*.
   ⮕ Vingt constats lus, **zéro écran parcouru**. C'est le temps 3 du plan, et il n'est pas
   fait. **Ne laisse pas croire qu'un audit fermé est une section vérifiée.**

---

## Fini quand

`grep -c` des trois mots de disposition dans le fichier d'audit rend un compte **non nul**,
et **chacun** des dix-sept blocs (A1, A2, B1→B13, C1→C5, section D) en porte un.

⚠ **Le vrai « fini quand » n'est pas un compte** : c'est qu'une personne qui ouvre
`Rapports/AUDIT-evaluation-onglet-2026-08-25.md` **sans rien connaître du backlog** sache, pour
chaque constat, ce qu'il est devenu — sans avoir à ouvrir un autre fichier.

## L'ordre

- **Lot documentaire : aucun fichier de `js/` ne bouge.** ⮕ Donc **pas de bump du bloc de
  jetons d'`index.html`**, et pas de release. Si tu te retrouves à toucher `js/`, tu es sorti
  du lot : arrête et dis-le.
- `cd tests && npm run test:unit` **quand même**, une fois, comme témoin que rien n'a bougé
  — pas comme preuve du lot.
- Règle 6 : **tu commites, puis tu t'arrêtes.**
- ⮕ **Ce que Grégoire doit aller voir : RIEN à l'écran.** Aucun utilisateur ne rencontre ce
  fichier. **Dis-le-lui plutôt que de lui inventer une vérification.** Ce qu'il peut faire,
  s'il le veut : ouvrir le rapport et vérifier qu'il se lit seul.
- Ce fichier-ci se commite avec ton lot.

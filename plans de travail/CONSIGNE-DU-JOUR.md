# Consigne — la note dit sur quoi elle porte *(énoncé 5, #674)*

> **Écrite le 2 septembre 2026 en soirée, par Cowork, avec Grégoire.**
> **Promue consigne du jour le 2 septembre au soir**, le lot de la CI étant clos et vert.
>
> ▣ **État à la promotion, mesuré** : `HEAD` = `9fe13749`, **tout est poussé**. Run
> `33678001180` — **Vitest 437 fichiers / 4724 tests vert · Playwright 233 passés, 0 échoué,
> 0 instable en 27,4 min**. ⚠ **Ce vert porte sur 233 essais, pas 239** : six sont déclarés non
> jugeables sous WebKit Linux, et l'étape de garde les nomme. **C'est la première fois depuis le
> 31 août que le filet juge de bout en bout.**
>
> ⚠ **Remesure avant d'exécuter** (règle 1). Les numéros de ligne ci-dessous ont été relevés le
> 2 septembre au soir, et **ils avaient déjà bougé depuis la fiche du 1er** — preuve qu'il faut
> les rejouer, pas les suivre.
>
> ⛔ **OUVRE UNE SESSION NEUVE POUR CE LOT.** Il touche le calcul d'une note. Cette consigne est
> écrite pour être lue à froid, par quelqu'un qui ne sait rien du reste de la journée.
>
> ⚠ **Quatre `.md` non commités traînent dans `plans de travail/` et un dans la racine
> (`PROTOCOLE.md`, règle 7)** : ils sont à Grégoire, **ne les commite pas avec ton lot.**

---

## Le mandat

**Énoncé 5 d'`OBJECTIF-COHORTE-1.md`** : *« Aucune note remise ne repose sur une pondération
incomplète sans le dire. Un critère laissé sans niveau ne peut pas disparaître en silence et
faire monter la note. »*

⮕ **C'est le seul défaut ouvert que des utilisateurs ont dans les mains aujourd'hui.** Requalifié
le 1er septembre : ce n'est plus une prévention pour la cohorte qui arrive, c'est une
**réparation** pour des gens déjà en place, qu'on ne peut ni sonder ni joindre.

## Le défaut — et il ne fait PAS ce que son titre laisse croire

⚠⚠ **Il ne baisse pas la note. Il la MONTE.** Mesuré sous WebKit, grille 50/30/20 :

| état | note | niveau |
|---|---|---|
| les trois critères renseignés | **84,0 %** | M |
| le critère à 20 % perd son niveau | **95,0 %** | **E** |

⮕ **Onze points et un niveau de plus.** Une note trop basse se conteste ; **une note trop haute
passe.** C'est ce qui la rend indétectable à la relecture.

### Mécanisme 1 — critère par critère

`calculerNote()`, `js/evaluation-calcul.js`. Un `if (niveau)` saute le critère, qui quitte le
numérateur **et** `ponderationTotal` ; la division finale renormalise les pondérations restantes
à 100 %.

**Relevé le 2 septembre au soir** — `grep -rn "ponderationTotal" js/` :
l. **831** (init à 0) · l. **864** (`+= ponderation`) · l. **876** (`if (… > 0)`) · l. **878**
(la division). ▣ **Aucune ne le compare à 1.** ⚠ La fiche #674 en annonçait *trois* aux lignes
811/844/856 : **le compte et les lignes ont changé. Rejoue le grep.**

### Mécanisme 2 — tout d'un coup, et il est déjà chez des gens

L'échelle est choisie, mais aucun de ses niveaux n'a de `valeurCalcul` : `valeurNumeriqueDuNiveau`
rend `null` pour tous, le map des valeurs reste vide, **tous** les critères sortent du total, et
`ponderationTotal` tombe à **0**.
⮕ **C'est le cas des huit échelles disciplinaires** (32 niveaux en `valeur:`, aucun en
`valeurCalcul:`). Le semis est tari depuis le 1er septembre — **mais les copies restent dans la
base de quiconque en avait adopté une avant.**

### ▣ ET LE CRITÈRE NE DISPARAÎT PAS QUE DE LA NOTE — IL DISPARAÎT DU DOCUMENT

`_collecterCriteresSauv` (`js/evaluation-sauvegarde.js`) ne pousse un critère que `if (niveau)` :
il est **absent du tableau `criteres[]` enregistré**, et `construireCriteres` mappe ce tableau.
⮕ **Le PDF remis ne porte aucune trace qu'un critère existait.** Une grille amputée est
indistinguable d'une grille qui n'a jamais eu ce critère.

---

## La forme du correctif — TRANCHÉE, et fermée

⛔ **PAS d'état « brouillon / conclue ».** Écarté par Grégoire le 1er septembre, **avec les
autres formes envisagées en séance. Ne les rouvre pas.** Motif : ce serait ajouter un état de
flux de travail — un geste de plus, un champ de plus, une intention à deviner — pour une
question qui n'en demande aucune.

⮕ **CE QUI MANQUE N'EST PAS UN ÉTAT, C'EST UNE PORTÉE.** `noteFinale` circule sans dire **sur
quoi elle porte**. Or `ponderationTotal` est **déjà calculée à chaque appel** de `calculerNote()`,
puis **jetée**.

⮕ **La persister à côté de `noteFinale`.** Chaque consommateur décide alors pour lui-même.

**Trois propriétés qui font que c'est celle-là et pas une autre :**
1. aucun geste nouveau pour l'enseignant ;
2. aucune intention à deviner ;
3. ▣ **valable RÉTROACTIVEMENT** — la portée se recalcule sur les évaluations déjà en base, depuis
   leur `criteres[]` et leur grille. **C'est cette propriété qui a écarté l'état de flux**, qui
   n'aurait jamais pu réparer l'existant.

## Les deux portes — le refus va au LIVRABLE, jamais à la saisie

⛔ **Aucun refus pendant la saisie.** Une évaluation en cours est forcément incomplète ; bloquer
serait insupportable.

· **`sauvegarderEvaluation()` et `sauvegarderEvaluationModifiee()`** (`js/evaluation-sauvegarde.js`).
  ▣ **Le patron de refus y existe déjà** : `_validerReferencesSauv` (défini l. **151**, appelé
  l. **388**) rend `false` et sort. **Calque-toi dessus, n'invente pas un second patron.**
· **`js/travaux-export-pdf.js:707`** — **seul appelant** de `construireFeedback`
  (`js/synthese-retroaction-data.js:86`), donc **porte unique** du PDF de l'élève.

⮕ **Les deux portes peuvent refuser franchement.** Décision de Grégoire, 1er septembre :
*« un critère dont on ne tient pas compte n'est pas un critère non noté — c'est une grille
différente. »* Une couverture sous 100 % est **toujours** un défaut, jamais une intention. **Il
n'y a donc rien à modéliser du côté "critère délibérément écarté".**

## ⚠ CE QUE LE CORRECTIF DOIT REGARDER EN PLUS

**L'auto-save écrit `noteFinale` en base et CRÉE l'évaluation** dès qu'un seul critère porte un
niveau (`_autoSauvegarderCriteres`). ⮕ **La portée doit être écrite par le même chemin que la
note**, sans quoi elle manquerait précisément sur les évaluations nées de l'auto-save — c'est-à-dire
sur la majorité.

▣ **Et il y a maintenant QUATRE chemins qui écrivent `noteFinale`**, pas trois : le lot #572 du
2 septembre a montré qu'un quatrième avait été oublié. `grep -rn "noteCalculeeCourante" js/` les
rend tous. **La portée doit accompagner la note aux quatre.**

---

## ⛔ PÉRIMÈTRE — DÉCISION PÉDAGOGIQUE DÉFINITIVE

**Les notes d'A2025 et d'H2026 ne sont pas rouvertes.** Elles sont remises, les élèves sont rendus
ailleurs dans leur parcours. **Ce n'est pas un oubli.** ⛔ Ne propose ni de les recompter, ni de les
corriger, ni de les signaler. **Seul l'automne 2026 compte.**

## ⚠ CE QUI EST DÛ PAR GRÉGOIRE, ET QU'IL FAUT LUI DEMANDER

**Les mots que l'élève lira.** Le comportement est tranché — le PDF refuse de conclure et **nomme**
les critères sans niveau — **mais la formulation ne l'est pas.** ⮕ **Ne l'invente pas.** Propose-lui
deux ou trois phrases exactes et laisse-le trancher : c'est du texte que ses élèves reçoivent.

---

## L'ordre du travail — reproduire, puis corriger

1. **Rejoue les deux mécanismes** avant de toucher quoi que ce soit, et montre le rouge. Le
   témoin du haut de fiche (84 % → 95 %) est reproductible ; le second l'est avec une échelle
   sans `valeurCalcul`.
2. **Persiste la portée**, aux quatre chemins d'écriture.
3. **Les deux portes**, sur le patron existant.
4. **Une sentinelle** dont le périmètre se DÉDUIT du dépôt — *aucun chemin n'écrit `noteFinale`
   sans sa portée*. ⚠ **Pas une liste de fichiers tapée à la main** : c'est la faute exacte de la
   sentinelle #572, verte pendant que le défaut vivait.

## Fini quand

**Une évaluation dont un critère n'a pas de niveau ne peut pas être remise sans que ce soit dit.**

▣ **Le témoin qui compte** : rejouer le cas 50/30/20 rend **84,0 %** — ou un refus nommé — mais
**plus jamais 95,0 % en silence.**
⚠ **Et le second témoin, souvent oublié** : une évaluation COMPLÈTE doit continuer de s'enregistrer
et de s'exporter **sans un mot de plus**. Un correctif qui avertit tout le monde n'avertit personne.

## L'ordre (règle 6)

- ⚠ **Ce lot touche le calcul d'une note. `npm test` — suite COMPLÈTE — avant de dire que c'est
  prêt**, pas seulement `test:unit`.
- Bump du bloc de jetons d'`index.html` (`js/` est touché).
- **Tu commites, puis tu t'arrêtes.** Pas de release, pas de push.
- ⮕ **Ce que Grégoire devra aller voir, et c'est un vrai geste** : ouvrir une évaluation, laisser
  un critère sans niveau, et vérifier que l'application **le dit** au lieu de monter la note.
- Ce fichier se commite avec ton lot.

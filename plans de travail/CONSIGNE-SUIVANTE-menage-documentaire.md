# Consigne suivante — le ménage documentaire : deux traces manquantes, une branche morte

> **Écrite le 8 septembre 2026, en début d'après-midi (Toronto), par Cowork, en lecture seule.**
> État à l'écriture : `main` à `b8ccd67b`, version `1.124.3`, build `0907-1325`, vérifiés par
> `git --no-optional-locks log --oneline -1` et `cat version.json`.
> ⚠ **Une consigne peut se tromper : remesure avant d'exécuter.** Si l'état ci-dessus ne correspond
> plus, signale l'écart à Grégoire au lieu de continuer.
>
> ⛔ **Ce fichier n'est PAS la consigne du jour.** `plans de travail/CONSIGNE-DU-JOUR.md` porte le
> chantier du dépistage du français en première semaine, et Grégoire l'a maintenue le 8 septembre.
> **Ce ménage passe AVANT elle** — il est court, il ne touche aucun code, et il laisse le dépôt
> propre pour le gros lot. Arbitrage de Cowork ; si tu vois une raison de l'inverser, dis-la.

## Le mandat, en une phrase

Rendre au dépôt les deux traces que la séance du 7 n'a pas écrites, et retirer une branche qui
n'apporte plus rien.

---

## Ce que ce ménage NE touche pas

- **Le chantier de purge de l'historique (#781).** Il attend ailleurs, prêt à froid.
- **`plans de travail/CONSIGNE-DU-JOUR.md`** (modifié dans l'arbre, non commité) et
  **`plans de travail/00-CADRAGES-OUVERTS.md`** (modifié, non commité). Fichiers de Cowork,
  contenu de leur auteur : **commets-les tels quels avec ton premier commit, sans les relire pour
  les corriger.**
- **`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`.** Fichier de Cowork, réécrit par Cowork le même jour.
  Ne le touche pas.

---

## Temps 1 — `SESSION.md` s'arrête à 1.123.12

**Le constat, mesuré le 8 septembre** : le bloc le plus récent en tête de `SESSION.md` est
« SESSION 35 — 7 septembre 2026, matin », qui clôt à `1.123.12`. Rien n'y couvre ce qui a suivi.

**Le périmètre exact** : `6eed06a9..b8ccd67b`, soit vingt commits — `1.124.0` (le report des
absences dans Léa), `1.124.1` (le bouton réapparu, deux tests menteurs), `1.124.2` (le revert du
module de report, décision de Grégoire), `1.124.3` (les six mineurs enchaînés), les deux trouvailles
Playwright `#788`/`#789`, l'enquête `#542`/`#785` sur l'enregistrement des présences, et le chantier
`#781` jusqu'à sa mise au froid.

**Ce que tu écris** : un bloc, en tête, à la manière des précédents. **Pas un résumé de commits** —
l'état mesuré au sens de la règle 4 du `PROTOCOLE.md` : ce qui a été trouvé, ce qui a tranché avant
la lecture du code, ce qu'il ne faut pas défaire, et ce qui reste ouvert. `RELAIS.md` et
`OU-EN-EST-ON.md` sont à jour et portent déjà la matière ; ne les recopie pas, sers-t'en.

⚠ **`#542` n'est PLUS ouvert** — voir le temps 3. Le bloc doit porter la requalification, pas
l'enquête : ce que les deux hypothèses réfutées ont coûté est une leçon de méthode, et elle vaut
d'être écrite (une cause reproduite au banc n'est pas la cause du cas de Grégoire tant qu'on n'a pas
mesuré SES données).

⚠ **Le signet persistant reste EN TÊTE**, au-dessus de ton nouveau bloc. Remonte-le.

---

## Temps 2 — la branche `claude/consigne-du-jour-wybfs0`

**Ce que Cowork n'a PAS pu mesurer** : ce shell n'a pas d'accès à GitHub (`git fetch` échoue sur
« Host key verification failed »). L'existence de cette branche sur le distant, et son identité avec
`main`, sont **ton constat du 7 septembre, pas une mesure de Cowork.**

**Donc remesure d'abord** :

```
git --no-optional-locks fetch --prune origin
git --no-optional-locks rev-parse origin/main origin/claude/consigne-du-jour-wybfs0
```

**Si les deux empreintes sont identiques** : supprime la branche distante, puis sa trace locale s'il
y en a une. Grégoire l'a autorisé le 8 septembre.

**Si elles diffèrent** : ne supprime rien. Dis à Grégoire ce que la branche porte de plus que `main`.

---

## Temps 3 — `#542` n'était pas un bug, et trois fichiers l'ignorent encore

**Ce que Grégoire a établi le 8 septembre** : il a ouvert l'application à DEUX adresses cet automne —
son fichier local (`file://`) et `https://app.codexnumeris.org`. Deux **origines** au sens du
navigateur : `localStorage` et IndexedDB y sont cloisonnés. Il saisissait ses présences d'un côté et
les cherchait de l'autre. Deux séances (21 août, 1er septembre) ne vivaient que dans le local, et
ont été ressaisies depuis. **Aucun défaut dans `enregistrerPresences`.**

▣ **DÉCISION DE GRÉGOIRE : `https://app.codexnumeris.org` est sa SOURCE UNIQUE DE VÉRITÉ.**
L'instance locale ne sert plus à ses vraies données.

**Ce que tu fais :**

**(a)** Bascule `#542` dans `Retours des testeurs/SUIVI-BUGS.md` : hors de la table des ouverts, vers
les corrigés, **requalifié — pas corrigé**. La distinction compte : rien n'a été réparé dans le code.
Le seul HAUTE ouvert disparaît ainsi de la table.

**(b)** Commets `scripts/diagnostic785presencesdeuxinstances.js`, non suivi au 8 septembre. C'est lui
qui a établi le partage entre les deux origines ; il est en lecture seule et ne sort aucune donnée
personnelle.

**(c)** `grep -rn "file://" --include="*.md" .` et corrige les mentions qui décrivent le dépôt comme
la source de l'application que Grégoire fait tourner : **`ETAT-PROJET.md`** et **`plans de travail/PORTES-TERRAIN-2026-08-28.md`**
en portent, il peut y en avoir d'autres. Une porte terrain vise désormais le site web.
⚠ **Ne touche pas** aux mentions `file://` qui parlent d'une contrainte technique du navigateur
(contexte sécurisé, `crypto.subtle`, cache Safari) : elles restent vraies.

**(d)** Écris la décision là où une session la lira avant de demander à Grégoire d'aller vérifier
quelque chose à l'écran. **Cowork a supposé** que `ETAT-PROJET.md` est le bon endroit — `CLAUDE.md`
est à son plafond de 250 lignes. Si le skill `portes-terrain` est le meilleur porteur, tranche et
dis-le.

---

## La livraison

Un commit `docs` par temps, ou un seul si tu préfères — mais le temps 3 se commite à part : il
porte un fichier de code (le diagnostic) et une décision de Grégoire. Aucun bump de version : rien
d'exécutable ne change, donc rien à annoncer aux utilisateurs.

**Puis enchaîne sur `plans de travail/CONSIGNE-DU-JOUR.md`**, qui porte le vrai chantier de la
journée.

## Comment Grégoire vérifie que c'est fait

Il ouvre `SESSION.md` : le bloc en tête doit parler de la version qui est en ligne, `1.124.3`, et
non plus de `1.123.12`. Trente secondes, sans terminal.

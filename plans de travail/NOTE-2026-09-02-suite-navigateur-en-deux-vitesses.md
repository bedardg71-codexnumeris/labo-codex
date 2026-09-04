# Note — la suite en navigateur à deux vitesses

> **Écrite le 2 septembre 2026 en soirée, par Cowork, à la demande de Grégoire.**
> **Ce n'est ni une consigne ni un plan.** C'est une idée de Grégoire, notée pendant qu'elle
> est fraîche, avec la mesure qui l'a fait naître. **Rien n'est décidé, rien n'est à coder.**

---

## D'où ça vient

En attendant un run de trente minutes, Grégoire a demandé : *« Qu'est-ce qui dure si longtemps ?
Est-ce nécessaire ? Est-ce qu'on est un peu zélé ? »*

Puis, ayant vu la mesure : *« Ces tests pourraient être les derniers d'une routine quotidienne.
Le lendemain, on lit le résultat et on le met ou non à l'ordre du jour. »*

⚠ **Et il avait posé d'avance la limite qui compte** : *« Je ne serai sûrement pas en mesure de
décider lesquels de ces 239 méritent leurs sept secondes. »*
⮕ **Réponse retenue : il ne choisit pas des fichiers, il choisit un CRITÈRE.** Et il l'a déjà :
`OBJECTIF-COHORTE-1.md`, les huit gestes. **C'est la ligne d'arrivée qui trie, pas une opinion
sur 82 fichiers.**

## La mesure — 2 septembre, depuis Cowork

```bash
ls tests/integration/*.spec.js | wc -l
grep -h -c "^\s*test(\|^\s*it(" tests/integration/*.spec.js | paste -sd+ | bc
```

▣ **82 fichiers, 232 cas.** (Claude Code annonçait « 239 specs » d'après le rapport Playwright ;
l'écart de 7 n'a pas été élucidé — cas engendrés dynamiquement, ou projections. **À départager
avant de se fier au compte.**)

▣ **95 cas sur 232 — 41 % — ne touchent AUCUN des huit gestes.** Ils gardent le planificateur
et sa carte, le comparateur de pratiques, le dépistage, la dénotation, les profils étudiants, et
l'outillage des tests lui-même.

⚠ **Le classement a été fait par MOTIF SUR LES NOMS DE FICHIERS, pas en lisant les 82.** Il est
grossier et il n'a pas été contre-vérifié. **À refaire proprement avant d'agir** — c'est
exactement le genre de mesure qui a menti trois fois le 2 septembre.

▣ **Un seul fichier porte 30 cas** — `carac-476-volet2-duplication` (24 août), soit **13 % de
toute la suite**.

⛔ **CE QUI N'A PAS ÉTÉ MESURÉ, et qui manque pour trancher : LES TEMPS.** Cowork ne peut pas
faire tourner la suite (une seule session à la fois le peut). **Il se peut que les 95 soient les
rapides et les 137 autres les lents** — auquel cas l'économie n'est pas là. ⮕ **Le rapport
Playwright donne le temps par spec : le lire AVANT de bâtir quoi que ce soit.**

## L'idée

**Deux vitesses :**
· les essais qui parcourent les huit gestes tournent **à chaque push de code** ;
· les 95 autres tournent **une fois par nuit**.

**L'avantage principal, et il est chiffrable** : ça transforme une dépense variable en dépense
fixe. Ces 95 coûtent aujourd'hui leurs minutes à *chaque* push de code ; une fois par nuit,
c'est ~11 min une seule fois, que Grégoire pousse trois fois ou dix fois dans la journée.
⚠ **Contrepartie honnête** : les jours SANS push, on paierait pour rien. À comparer à sa
fréquence réelle avant de conclure.

**Où le résultat atterrit** : dans le rituel d'ouverture (`§2.1` du skill
`debut-de-session-labo-codex`), qui lit déjà le verdict de GitHub. La ligne du matin porterait
**deux** verdicts au lieu d'un.

## ⛔ LA GARDE À POSER DÈS LE DÉPART

**La ligne du matin doit dire CE QUI A CHANGÉ DEPUIS HIER, pas seulement rouge ou vert.**

⮕ Un rouge qui dure depuis une semaine ne doit pas ressembler à une nouvelle. **C'est
exactement le piège du 2 septembre** : la CI a été rouge huit runs d'affilée, Grégoire a
regardé, et il a répondu « je ne vois pas de rouge ». Une routine quotidienne dont le résultat
n'appelle aucune action deviendra du bruit en une semaine.

## Ce qui reste ouvert

1. **Les temps par spec.** Sans eux, l'économie annoncée est une supposition.
2. **Le classement des 82 fichiers**, à refaire en les lisant, pas en devinant d'après leur nom.
3. **L'écart 232 / 239.**
4. **Les 30 cas de `carac-476-volet2-duplication`** : un seul fichier à 13 % de la suite mérite
   qu'on regarde ce qu'il garde vraiment.
5. **La fréquence réelle des push de Grégoire**, qui décide si le fixe bat le variable.

⚠ **Et le rappel qui vaut pour tout ce document** : une suite qui rétrécit est une suite qui
garde moins. Chacun de ces 95 est né d'une correction. ⮕ **On ne les supprime pas — on change
QUAND ils tournent.** Si un lot commence à parler de « nettoyer » ou de « retirer », il a
dérivé.

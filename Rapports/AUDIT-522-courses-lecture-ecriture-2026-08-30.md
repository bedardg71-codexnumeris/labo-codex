# AUDIT #522 — la course lecture-modification-écriture, hors de `db.modifier`

**30 août 2026.** Item : « Auditer les autres autosaves pour la course
lecture-modification-écriture », extrait de #510. Ce rapport rend la mesure, le
critère qui la produit, et le découpage en lots. Il est fait pour être relu à
froid : chaque lot suivant peut partir d'ici sans refaire l'audit.

---

## 1. Ce que #510 avait laissé ouvert

`db.modifier` (file par clé) est né le 25 août avec #510, et **deux** éditeurs y
sont passés : grilles et échelles. L'item #522 demandait de mesurer le reste.

---

## 2. Le critère — et le fait qui l'a redressé

Une séquence lire → modifier → écrire n'est en course que si elle **rend la
main** entre la lecture et l'écriture. JavaScript est mono-thread : sans point de
suspension, rien ne peut s'intercaler.

D'où trois régimes :

| Régime | Forme | Verdict |
|---|---|---|
| **R1** | lecture `await db.get(…)` | **course** — la lecture rend la main |
| **R2** | `db.getSync(…)` puis `await db.set(…)` | **course** — voir ci-dessous |
| **R3** | `getSync` → `setSync`, sans suspension | sûr |

> ⚠ **R2 est le régime contre-intuitif, et c'est lui qui a orienté l'audit.**
> « Lecture synchrone » ne veut pas dire « séquence atomique ». Dans `db.set`
> (js/db.js), l'écriture IndexedDB est **attendue AVANT** le rafraîchissement de
> localStorage. Pendant tout cet aller-retour, `db.getSync` rend encore
> l'**ancienne** valeur :
>
> ```
> A : getSync[v0] ─ mute ─ set: await IDB ······· localStorage = v0+A
> B :                 getSync[v0 !] ─ mute ─ set ······ localStorage = v0+B
>                                                      ⇒ A perdu, en silence
> ```
>
> Une conversion qui n'aurait visé que les lectures `await` aurait donc manqué
> tout le fichier `pratiques-gestion.js`, qui lit en `getSync`.

**Méthode** : balayage statique de `js/*.js` (hors `db.js`), commentaires et
chaînes neutralisés à longueur constante pour préserver les offsets ; appariement
lecture/écriture **sur la même clé, dans la même fonction** ; l'`await` collé à
`db.set` est exclu du calcul (il appartient à l'écriture, il n'ouvre pas de
fenêtre).

---

## 3. La mesure

**213 sites** lire → écrire sur la même clé dans la même fonction, dont
**102 en course** (84 en R1, 18 en R2) et 111 sûrs.

**Un seul groupe de clés est atteint par un déclencheur de SAISIE** — le geste de
#510, où le `change` part au blur : la clé `pratiquesConfigurables`
(10 champs `data-on-change` vers `sauvegarderConfigPratiqueMat`, plus cinq
cellules de tableau vers leurs propres éditeurs). Les autres sites sont
déclenchés par des clics ou tournent au démarrage.

⮕ C'est exactement le site que Grégoire avait signalé en mai 2026 :
« le bouton radio *note chiffrée* / *niveau de performance* — c'est supposé être
lu dans les réglages, mais souvent ce n'est pas le cas. »

---

## 4. État après le lot 1 (clé des pratiques, livré le 30 août)

| Clé | Sites en course | Fichiers | Lot |
|---|---|---|---|
| `grillesTemplates` | 19 | 2 | lot 2 |
| `echellesTemplates` | 14 | 1 | lot 2 |
| productions (`getCleProductions()`, `cleProductions`, `bibliothequeProductions`) | 12 | 5 | lot 3 |
| `cartouches_*` (4 formes) | 9 | 1 | lot 3 |
| `niveauxEchelle` | 6 | 1 | lot 2 |
| bibliothèques (`CLE_BIBLIOTHEQUE*`, 5 constantes) | 14 | 7 | **lot 4 — voir §6** |
| `cleEtud` (étudiants v2) | 3 | 1 | lot 5 |
| divers : `cours`, `evaluationsSauvegardees`, snapshots, drapeaux de migration | 12 | — | lot 5 |
| ~~`pratiquesConfigurables`~~ | ~~13~~ → **0** | 2 | ✅ **livré** |

**Total restant : 89 sites en course** (84 R1 + 5 R2).

---

## 5. Ce que le lot 1 a livré

**22 écritures** de `pratiquesConfigurables` passent désormais par
`db.modifier` (`pratiques-gestion.js`, `pratiques.js`). Six restent hors de la
file, **nommées et motivées** dans la liste fermée du cliquet
(`tests/unit/sentinelle-522-pratiques-serialisees.test.js`) :

- trois fonctions **entièrement synchrones** (`copierPratiqueDepuisTrimestre`,
  deux migrations de démarrage) — aucune course possible ;
- `importerPratiquesExternes`, synchrone et qui **rend un compteur** : la rendre
  asynchrone changerait son contrat, donc ses appelants ;
- deux qui écrivent **via le helper transversal** `BibliothequeUI` — c'est le
  lot 4, pas celui-ci.

Trois défauts trouvés en chemin, corrigés avec le lot :

1. `modifierTypeTravailMat` / `modifierForfaitMat` ne vérifiaient que l'existence
   du tableau, **pas les bornes de l'index** : un index hors bornes levait une
   `TypeError` au lieu de refuser l'écriture. Le banc l'a attrapé.
2. `adopterMaquette` écrivait la collection **deux fois** (`setSync` puis `set`)
   sur le même instantané lu hors file, pour une seule bascule de drapeau.
3. `partagerPratique` portait **la plus longue fenêtre du lot** : lecture, puis
   attente que l'utilisateur remplisse un formulaire de métadonnées, puis
   réécriture de la collection lue **avant** la question — tout ce qui avait été
   enregistré pendant ce temps était écrasé.

Retiré au passage : le repli `catch → db.setSync` de `sauvegarderConfigPratiqueMat`
et celui de `creerNouvellePratique`. Réécrire la collection hors de la file après
un échec d'écriture y remet exactement l'instantané que la file sert à ne plus
perdre.

**Vérification** : 8 cas Vitest (4 de course, 2 de refus, 2 de cliquet) ;
break-test **4 mutations → 4 rouges**, témoin vert.

---

## 6. Le lot 4 mérite d'être nommé à part

Les bibliothèques ne se convertissent pas fichier par fichier : les cinq familles
(grilles, échelles, cartouches, productions, pratiques) écrivent à travers
**`BibliothequeUI.dupliquerVersBibliotheque`** et `dupliquerEtEditerItem`
(`js/bibliotheque-ui.js`), qui font `var liste = await d.lireListe();` puis
`await d.ecrireListe(liste)`.

⮕ La course y est réelle, et la corriger **une fois** dans le helper la corrige
pour les cinq familles — à condition de remplacer le couple
`lireListe`/`ecrireListe` par un `modifierListe(mutateur)`. C'est un changement
de contrat du helper : à faire d'un seul geste, avec les cinq appelants.

---

## 7. Ordre proposé pour la suite

1. **Lot 2 — grilles et échelles** (39 sites, 2 fichiers). Les deux éditeurs de
   #510 sont déjà convertis ; ce sont leurs voisins qui restent. Volume élevé,
   patron connu, aucune décision.
2. **Lot 4 — le helper des bibliothèques** (14 sites, 7 fichiers, un seul
   changement de contrat). Meilleur rapport effort/portée.
3. **Lot 3 — productions et cartouches** (21 sites).
4. **Lot 5 — étudiants et divers** (15 sites), dont les drapeaux de migration :
   la plupart tournent une seule fois au démarrage, la course y est théorique.
   ⮕ Vérifier avant de convertir : ce lot est probablement plus petit qu'il n'en
   a l'air.

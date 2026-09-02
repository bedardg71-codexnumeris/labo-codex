# Consigne du jour — relever le plafond, pour que la CI puisse enfin rendre un vert

> **Écrite le 2 septembre 2026 en soirée, par Cowork, avec Grégoire.**
> Elle REMPLACE la consigne du bac à sable `navigator`, exécutée et publiée (`ed6aac3c`).
>
> ⚠ **Remesure `HEAD` avant d'exécuter** (règle 1).
> Un fichier non commité dans l'arbre : `plans de travail/CADRAGE-2026-09-02-badges-texte-troue.md`
> — c'est du texte, il appartient à Grégoire, **ne le commite pas.**

---

## Le mandat — une seule ligne

`.github/workflows/tests.yml`, l. **97** : `timeout-minutes: 15`.
⮕ **Passe-le à 40.**

## Pourquoi 40, et pas 20 ni 60

**Mesuré par toi le 2 septembre, sur le run de `ed6aac3c` :**
· le job a duré **15 min 26** et s'est fait couper — `The operation was canceled` ;
· environ **3 min** d'installation et de Vitest, puis **12,5 min** de Playwright pour
  **105 specs sur 239** ;
· soit **~7 s par spec** sur ce serveur, contre ~2 s sur la machine de Grégoire (239 en 8 min).

▣ **Extrapolation, et elle est nommée comme telle** : 239 × 7 s ≈ **28 min**, plus 3 min
d'installation ≈ **31 min**. ⮕ **40 laisse une marge d'un tiers** sans être un plafond qui ne
plafonne plus rien.
⚠ **Ce n'est pas une mesure, c'est une projection à partir de 105 specs.** Si le run réel
dépasse 40, ne remonte pas le chiffre en boucle : **dis-le**, avec la durée observée.

⛔ **Le plafond ne DOIT PAS disparaître.** Un job sans limite qui part en boucle consomme des
minutes jusqu'à épuisement. On le déplace, on ne le retire pas.

## Ce que ce lot n'est PAS

⛔ **Pas de shards, pas de parallélisation.** Écarté par Grégoire ce soir, motif retenu :
*paralléliser raccourcit l'attente, pas la facture* — même nombre de minutes-machine, réparti
sur plusieurs postes, plus le temps d'installation multiplié par autant.

⛔ **Ne touche pas aux déclencheurs ni au `paths-ignore`.** ↻ **Grégoire a tranché ce soir que
239 essais en navigateur ne doivent PAS tourner à chaque push** — mais **c'est le lot SUIVANT**,
et il est plus gros. Ce lot-ci ne fait qu'une chose.

⛔ **Rien dans `js/`, rien dans `tests/`.** Pas de bump du bloc de jetons, pas de release.

⚠ **L'en-tête de `tests.yml` porte un journal de pannes** (le job qui ne démarrait plus, les
specs instables, `cancel-in-progress` qui fauche les runs). ⮕ **Ajoute-y une entrée courte** :
la date, la cause mesurée (plafond de 15 min hérité d'une suite de 88-93 specs, qui en compte
239), et la valeur retenue. Ce journal est la mémoire de ce fichier ; une modification muette
s'y perdrait.

## Fini quand

▣ **Un seul témoin compte, et il n'est pas local** : après le push, la commande du rituel
(`§2.1` du skill d'ouverture) rend **`success`** sur le commit poussé.

⚠ **Trois issues, et deux sont des succès de ce lot :**
1. **`success`** → le filet juge de bout en bout pour la première fois depuis le 31 août.
2. **`failure` à l'étape Playwright** → **succès aussi.** Le plafond n'était que le plafond ;
   la suite va maintenant au bout et elle a trouvé quelque chose. **Rapporte le nom des specs,
   ne corrige rien** : nouveau sujet, nouveau lot.
3. **`cancelled` encore** → la projection était fausse. **Dis la durée observée**, et
   n'augmente pas le chiffre de toi-même.

## L'ordre

- Règle 6 : **tu commites, puis tu t'arrêtes.**
- ⚠ **Exception nommée, comme au lot précédent** : le verdict ne peut être pris qu'APRÈS le
  push, puisque c'est la CI qu'on répare. ⮕ Grégoire pousse, **puis** tu lis le verdict et tu le
  rapportes.
- ⮕ **Ce que Grégoire doit aller voir : RIEN à l'écran.** Dis-le-lui.
- Ce fichier se commite avec ton lot.

---

# ✅ EXÉCUTÉE — 2 septembre 2026, 14 h 57 → 15 h 05 · committée, NON poussée

**Remesure** : HEAD `ed6aac3c`, poussé — conforme. `CADRAGE-…badges-texte-troue.md`
laissé hors du commit. `OU-EN-EST-ON.md`, modifié par Cowork dans l'arbre, **embarqué tel
quel** pour ne pas l'exposer — dit ici.

**Fait** : `.github/workflows/tests.yml` — `timeout-minutes: 15` → **`40`**, avec un
commentaire sur la ligne, et le **point (4)** ajouté au journal de pannes en tête : date,
cause mesurée (plafond hérité d'une suite de 88-93 specs, 239 aujourd'hui ; 105 specs en
12,5 min, ~7 s l'une, coupé à 15 min 26), valeur retenue et son statut de projection,
shards écartés par Grégoire, lot suivant nommé. Rien dans `js/` ni `tests/`.
La seule sentinelle qui lit ce fichier (`sentinelle-ci-paths-ignore`) reste verte.

**Fini quand — après le push de Grégoire**, la commande du §2.1 doit rendre `success`
sur le commit poussé. Trois issues ; deux sont des succès. Si `cancelled` encore : dire
la durée observée, ne pas remonter le chiffre. Rien à voir à l'écran.

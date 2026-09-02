# Consigne du jour — la CI redevient capable d'être verte, sans devenir trop chère pour tourner

> **Écrite le 2 septembre 2026 en soirée, par Cowork, avec Grégoire.**
> Elle REMPLACE la version précédente (plafond seul), retirée avant exécution.
>
> ⚠ **Remesure `HEAD` avant d'exécuter** (règle 1). Un fichier non commité dans l'arbre :
> `plans de travail/CADRAGE-2026-09-02-badges-texte-troue.md` — **ne le commite pas**, il est à
> Grégoire.

---

## Le mandat — deux gestes, et ils vont ensemble

**Ce que la mesure a établi aujourd'hui**, par toi puis par Cowork :

· `.github/workflows/tests.yml:97` porte `timeout-minutes: 15`. Le run de `ed6aac3c` a duré
  **15 min 26** et s'est fait couper à **105 specs sur 239**, sans un seul échec.
· Ce plafond date d'une suite de **88-93 specs** ; elle en compte **239**.
· Projection : 239 × ~7 s ≈ 28 min, plus ~3 min d'installation ≈ **31 min**.

⚠⚠ **ET LA CONTRAINTE QUI COMMANDE, LUE DANS L'EN-TÊTE DU MÊME FICHIER.** Au 23 août :
*« Depuis le 21 août, le job ne démarre plus. Vingt-six runs d'affilée échouent en 3 à 5 s…
Cette signature est typiquement celle de minutes Actions indisponibles sur un dépôt privé
(quota du compte épuisé). »*

⮕ **Les minutes de Grégoire sont une contrainte réelle, avec un antécédent.** Relever le
plafond SEUL ferait passer chaque push de code de 12,5 à ~31 minutes. **On réparerait la CI en
la rendant trop chère pour tourner.** C'est pourquoi les deux gestes sont dans le même lot.

---

## Geste 1 — le plafond

`.github/workflows/tests.yml`, l. **97** : `timeout-minutes: 15` ⮕ **40**.

⛔ **Le plafond ne disparaît pas.** Un job sans limite qui part en boucle consomme jusqu'à
épuisement — et ce dépôt en a déjà fait l'expérience. On le déplace, on ne le retire pas.
⚠ **40 est une projection à partir de 105 specs, pas une mesure.** Si le run réel dépasse,
**dis-le avec la durée observée** ; ne remonte pas le chiffre en boucle.

## Geste 2 — Playwright cesse de tourner à chaque push

**Décision de Grégoire, 2 septembre :** *« Je ne crois pas que 239 essais en navigateur doivent
tourner à chaque push. »*

**L'intention, et c'est elle qui compte** : **Vitest continue de juger tout ce qui déclenche la
CI** ; **Playwright ne tourne que lorsque le push touche quelque chose d'observable au
navigateur** — en pratique `js/`, `index.html`, les feuilles de style, et `tests/`.

⮕ **Le mécanisme est à toi.** Deux étapes dans un job, une condition sur la seconde ; ou deux
jobs ; ou un filtre de chemins. **Tranche et dis pourquoi**, en une ligne. ⛔ **N'ajoute pas
d'action tierce** si un `git diff --name-only` suffit.

### ⛔ LES DEUX GARDES, ET ELLES NE SONT PAS NÉGOCIABLES

**1. Un Playwright SAUTÉ ne doit jamais ressembler à un Playwright VERT.**
C'est la faute exacte qui a coûté deux jours cette semaine : un verdict absent s'est confondu
avec un verdict bon. ⮕ Le résultat lu par le rituel d'ouverture (`§2.1` du skill) doit
**distinguer les trois états** : *jugé et vert* · *jugé et rouge* · **_non jugé, et pourquoi_**.
⚠ **Si ton mécanisme fait rendre `success` à un run qui n'a pas lancé Playwright, c'est un
angle mort — et tu viens d'en fabriquer un.** Vérifie ce que la commande du rituel rend dans ce
cas, et si elle ment, corrige-la : elle fait partie de ce lot.

**2. Le cliquet doit couvrir la nouvelle règle.**
`tests/unit/sentinelle-ci-paths-ignore.test.js` existe précisément pour ça : il vérifie
qu'aucun test ne LIT un chemin exclu, *« sans quoi l'optimisation créerait un angle mort
silencieux »*. ⮕ **Étends-le à ta nouvelle condition**, dans le même esprit : si un spec
Playwright se met à dépendre d'un chemin qui ne le déclenche pas, la sentinelle doit rougir.
⚠ **Une optimisation de CI sans son cliquet est refusée dans ce dépôt.** C'est écrit dans
l'en-tête de la sentinelle, daté du 23 août.

⚠ **Et le `paths-ignore` existant ne bouge pas.** Il porte un commentaire qui explique pourquoi
`.claude/**` en est volontairement absent (`sentinelle-skill-alignement` lit un SKILL.md). **Ne
le « nettoie » pas.**

## Le journal de l'en-tête

`tests.yml` porte un journal de pannes daté. ⮕ **Ajoutes-y une entrée courte** : la date, les
deux causes mesurées (plafond hérité d'une suite trois fois plus petite ; 239 specs à chaque
push sur un compte dont le quota a déjà été épuisé), et les deux décisions. **Ce journal est la
mémoire de ce fichier** ; une modification muette s'y perdrait.

## Fini quand

▣ **Le témoin n'est pas local.** Après le push, la commande du rituel rend un verdict **sur le
commit poussé**, et tu rapportes lequel des trois états.

**Quatre issues, et trois sont des succès :**
1. **Vert, Playwright inclus** → le filet juge de bout en bout pour la première fois depuis le
   31 août.
2. **Rouge à l'étape Playwright** → **succès.** La suite va au bout et elle a trouvé quelque
   chose. **Rapporte les noms des specs, ne corrige rien.**
3. **Vert avec Playwright non lancé** → **succès seulement si c'est DIT.** Ce push touchait-il
   du code observable ? Si non, c'est le comportement voulu. Si oui, ta condition est trop
   étroite : dis-le.
4. **Coupé encore** → la projection était fausse. **Dis la durée observée**, n'augmente rien.

## L'ordre

- Règle 6 : **tu commites, puis tu t'arrêtes.**
- ⚠ **Exception nommée** : le verdict ne se prend qu'APRÈS le push, puisque c'est la CI qu'on
  répare. Grégoire pousse, **puis** tu lis et tu rapportes.
- ⚠ **Ce lot touche `tests/`** (le cliquet) : `cd tests && npm run test:unit` avant de dire que
  c'est prêt. Rien dans `js/` ⮕ pas de bump de jetons, pas de release.
- ⮕ **Ce que Grégoire doit aller voir : RIEN à l'écran.** Dis-le-lui.
- Ce fichier se commite avec ton lot.

---

# ✅ EXÉCUTÉE — 2 septembre 2026, 15 h 01 → 15 h 25 · committée, NON poussée

**Remesure, et un écart avec la prémisse** : HEAD `8b0dd728`, **1 commit non poussé** — le
geste 1 (plafond 15 → 40, point (4) du journal), que la version précédente de cette consigne
avait mandaté et que j'avais committé avant qu'elle soit « retirée ». Il n'a pas été défait :
c'est le même geste 1. Ce lot s'empile dessus ; **les deux commits partent ensemble**.
`CADRAGE-…badges-texte-troue.md` laissé hors du commit.

## Geste 1 — déjà fait (`8b0dd728`), inchangé

## Geste 2 — le mécanisme, tranché : DEUX JOBS

`vitest` (toujours, 15 min) puis `playwright` (`needs: vitest`,
`if: needs.vitest.outputs.playwright == 'oui'`, 40 min). **Pourquoi deux jobs et pas une
étape conditionnelle** : un job sauté apparaît `skipped` dans `gh run view --json jobs` —
c'est ce qui rend le non-jugé LISIBLE — et les trois minutes d'installation de WebKit ne
sont pas payées quand il saute. Aucune action tierce : la décision est un `git diff
--name-only ${before} ${sha}` en `shell: bash` (`fetch-depth: 0` pour atteindre `before`),
avec repli « on juge tout » si la base est introuvable (premier push, push forcé).

**La liste `OBSERVABLE`** (env du job `vitest`, **une seule source**, lue par le shell ET
par le cliquet) : `js/ css/ icons/ img/ libs/ index.html styles.css version.js
version.json noms_stables.json scripts/ tests/ .github/workflows/tests.yml`. Mesurée :
Playwright ouvre `index.html` en `file://` — tout ce qu'il charge est observable ; trois
specs lisent `scripts/`, une lit `version.json` ; le workflow doit se juger lui-même.

**Simulé sous bash avant de pousser** (⚠ zsh ne découpe pas `$OBSERVABLE` — première
simulation fausse, corrigée) : `docs/ + plans de travail/ + OU-EN-EST-ON.md` → **non** ;
`js/evaluation.js` → **oui** ; `.github/workflows/tests.yml` → **oui** ; `index.html` →
**oui** ; `jsx/faux.js`, `index.html.bak` → **non** (pas de faux positif par préfixe).

### Garde 1 — un Playwright sauté ne ressemble pas à un vert
Le rituel (`§2.1` du skill d'ouverture) **lit désormais les JOBS, pas le run** : seconde
commande `gh run view <id> --json jobs`, et **trois états nommés** — jugé-vert, jugé-rouge,
**non jugé et pourquoi** (`skipped` + vérification par `git diff --name-only HEAD~1`). Le
run, lui, rendra `success` avec Playwright `skipped` : c'est **dit**, dans le skill et dans
le journal de `tests.yml`. Le résumé du job (`$GITHUB_STEP_SUMMARY`) porte la raison.

### Garde 2 — le cliquet couvre la nouvelle règle
`sentinelle-ci-paths-ignore.test.js`, **bloc 2** (4 cas) : deux jobs et la condition
exacte présents, Vitest sans `if:` ; `OBSERVABLE` existe et porte `js/`, `index.html`,
`styles.css`, `tests/`, le workflow ; **aucun spec de `tests/integration/` ne lit un
chemin hors de `OBSERVABLE`** (lecture des `path.join(racine…)`, commentaires retirés) ;
témoin : >50 lectures vues, `scripts/` et `version.json` présents.
**Break-tests joués** : retirer `scripts/` de `OBSERVABLE` → **2 rouges** ; faire lire
`docs/x.md` à un spec → **2 rouges** (bloc 1 ET bloc 2). Restauré, 8/8.
Le `paths-ignore` existant et son commentaire sur `.claude/**` : **intacts**.

**Journal** : point (4) de `tests.yml` réécrit en (4a) plafond et (4b) deux jobs.
**Suite** : `npm run test:unit` → **437 f. / 4719 t.** (+4, le bloc 2). Rien dans `js/`.

## Fini quand — après le push de Grégoire
Ce push touche `tests.yml` et `tests/` → **Playwright DOIT tourner** (simulé : oui). Quatre
issues, trois sont des succès ; à rapporter par JOB. Rien à voir à l'écran.

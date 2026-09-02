# Consigne du jour — le verdict de GitHub entre dans le rituel d'ouverture

> **Écrite le 2 septembre 2026 en fin d'après-midi, par Cowork, avec Grégoire.**
> Elle REMPLACE la consigne du quatrième site (#572), exécutée et publiée.
>
> **État à l'écriture** : `1.110.0`, `HEAD` = `3d3a57be`, **tout est publié**. Un fichier non
> commité dans l'arbre : `plans de travail/CADRAGE-2026-09-02-badges-texte-troue.md` — c'est
> du texte, Grégoire l'enregistre lui-même.
>
> ⚠ **Si `HEAD` a bougé ou si plusieurs heures ont passé, remesure et dis-le** (règle 1).

---

## Le mandat — un verdict qui existe et que personne ne va chercher

**Point de départ, dans les mots de Grégoire.** Question posée : *« Quand la vérification de
GitHub échoue après un push, est-ce que tu l'apprends ? »* Réponse : **« Je ne sais pas. »**
Puis, après avoir regardé : **« Je ne vois pas de rouge. »**

⮕ **Le trou est donc probablement théorique — et « probablement » n'est pas « vert ».** C'est
exactement la confusion que `OU-EN-EST-ON.md` nomme comme la plus coûteuse du projet.

### ⛔ CE QUI A ÉTÉ ENVISAGÉ PUIS ÉCARTÉ, ET POURQUOI — ne le repropose pas

**Cowork avait d'abord recommandé de faire BLOQUER le hook pré-push** quand aucun verdict
Playwright n'existe. **Recommandation retirée après mesure**, le 2 septembre. Trois faits, tous
lus dans `scripts/hooks/pre-push` :

1. **Le hook bloque déjà le cas qui compte** : `lire-verdict.mjs` code **1** — une rougeur
   connue — refuse le push (l. 148-152).
2. **Le fail-open du code 3 est une décision documentée du 26 août**, pas un oubli. Son
   commentaire : *« La première version refusait. Elle a bloqué un push lancé depuis GITHUB
   DESKTOP, en donnant pour seule issue une commande de terminal : un refus dont la solution
   est hors de portée de l'outil où il se produit. »* ⚠ **Grégoire pousse depuis GitHub
   Desktop.** Rétablir le refus reproduirait exactement ce blocage.
3. **La CI juge chaque push de toute façon** : `.github/workflows/tests.yml` lance
   `npm run test:unit` **et** `npm run test:int` (Playwright WebKit), avec les traces en
   artefact à l'échec.

⮕ **Donc on ne touche pas au hook. Le manque est ailleurs : le verdict existe, personne ne le
lit.**

---

## Ce que tu fais

### Étape 1 — MESURE D'ABORD : de quoi disposes-tu pour lire ce verdict ?

⚠⚠ **Cowork ne peut pas répondre à cette question et ne l'a pas fait.** Son shell est une
machine virtuelle distincte de la tienne ; `which gh` y rend « absent », **et ça ne dit rien de
la machine de Grégoire**. C'est une erreur que Cowork a commise deux fois aujourd'hui —
conclure d'un poste sur un autre. **Mesure toi-même :**

```bash
which gh && gh auth status
```

· **Si `gh` est présent et authentifié** → va à l'étape 2.
· **S'il est absent, ou présent mais non authentifié** → ⛔ **N'INSTALLE RIEN, NE CONNECTE
  RIEN.** Un outil qui s'authentifie au compte GitHub de Grégoire est une décision qui lui
  appartient. **Arrête-toi, dis ce que tu as mesuré, et propose-lui le choix** — sans le faire.

### Étape 2 — ajoute la mesure au rituel d'ouverture

Le fichier : `.claude/skills/debut-de-session-labo-codex/SKILL.md`, **§2 « ÉTAT DES TESTS »**,
juste après le bloc des deux mesures d'ouverture (`git rev-list`, `verifier-playwright.mjs`),
vers la l. **145**.

**Ce que la nouvelle mesure doit rendre** — en une ligne, lisible par Grégoire :
· le verdict de la **dernière** exécution sur `main` : réussie ou échouée ;
· **sa date**, pour qu'un vert vieux de trois semaines ne se confonde pas avec un vert frais ;
· **le commit jugé**, et s'il correspond à `HEAD`.

⚠ **Le troisième point est le plus important, et c'est la leçon du jeton Playwright** : un
verdict qui ne porte pas le SHA jugé ne dit pas sur QUOI il porte. `scripts/lire-verdict.mjs`
fait déjà exactement cette vérification pour Playwright — **relis-le, et calque-toi dessus.**

⛔ **N'écris PAS de script neuf si une commande suffit.** Ce rituel doit rester à dix secondes ;
tout ce qui l'allonge finira par être sauté, et un rituel sauté ne mesure rien.

### Étape 3 — écris ce qu'on fait du rouge

Ajoute au skill, en deux lignes, **ce qu'une session fait quand le verdict est rouge** :
⮕ **Elle le DIT à Grégoire en français, en tête de son rapport d'ouverture, avant tout le
reste. Elle ne corrige rien d'elle-même** — un rouge de CI sur un commit déjà publié n'est pas
le mandat du jour, c'est une trouvaille, et elle reçoit la question habituelle : *est-ce que ça
empêche un des huit énoncés ?*

---

## Ce que ce lot n'est PAS

⛔ **Aucune modification de `scripts/hooks/pre-push`.** Si tu te retrouves à l'éditer, tu es
sorti du lot : arrête et dis-le.
⛔ **Aucune modification de la CI** (`.github/workflows/tests.yml`).
⛔ **Aucune installation, aucune authentification** sans un « oui » de Grégoire.

## Fini quand

Une session qui ouvre le rituel `debut-de-session-labo-codex` rend, dans son rapport d'état,
**une ligne en français disant si la dernière vérification de GitHub sur `main` a réussi, quand,
et sur quel commit** — ou, faute d'outil, une ligne disant **pourquoi elle ne peut pas le lire**.

⚠ **Les deux issues sont des succès de ce lot.** Un « je ne peux pas lire ce verdict, voici
pourquoi » vaut infiniment mieux qu'un silence : c'est le silence qui a produit « je ne sais
pas ».

## L'ordre

- **Lot documentaire et outillage** : le skill, et rien dans `js/`. ⮕ **Pas de bump du bloc de
  jetons d'`index.html`**, pas de release.
- `cd tests && npm run test:unit` une fois, comme témoin que rien n'a bougé.
- Règle 6 : **tu commites, puis tu t'arrêtes.**
- ⮕ **Ce que Grégoire doit aller voir : RIEN à l'écran.** Dis-le-lui plutôt que de lui inventer
  une vérification. Ce qu'il verra, c'est la ligne neuve à l'ouverture de ta prochaine séance.
- Ce fichier se commite avec ton lot.

---

# ✅ EXÉCUTÉE — 2 septembre 2026, 14 h 24 → 14 h 50 · committée, NON poussée

**Remesure** : HEAD `3d3a57be`, tout publié, 1.110.0 — conforme. Un fichier non commité
dans l'arbre, `CADRAGE-2026-09-02-badges-texte-troue.md` : **laissé hors du commit**, comme
demandé.

## Étape 1 — la mesure que Cowork ne pouvait pas faire

`which gh` → `/Users/kuekatsheu/.local/bin/gh` · `gh auth status` → **connecté**, compte
`bedardg71-codexnumeris`, protocole ssh, portées `gist`, `read:org`, `repo`. ⮕ Étape 2,
rien installé, rien connecté.

## ⚠⚠ CE QUE LA MESURE A RENDU — le trou n'était PAS théorique

`gh run list --branch main --limit 8` : **huit runs consécutifs en échec ou annulés**, le
plus récent sur **`HEAD` exact** (`3d3a57be`, 13 h 22 heure de Drummondville, run
33660682487). **« Je ne vois pas de rouge »** — il y en avait sur chaque push du jour.
**Dernier run VERT sur `main` : le 31 août, 10 h 08 UTC, commit `efd357e5`.**

**Pourquoi c'est rouge, mesuré (`gh run view --log-failed`)** : le job s'arrête à l'étape
**Vitest** — Playwright n'est jamais atteint. **1 fichier rouge sur 437** :
`tests/unit/sentinelle-635-codex-aller-retour-cartouches.test.js`, **10 cas sur 11**.
⮕ **Ce fichier est VERT sur cette machine** (437 f. / 4715 t., rejoué à 14 h 45) et
**ROUGE sur le runner Linux**. Il est né le 31 août (`69c0de12`), **après** le dernier
run vert : la CI n'a jamais été verte avec lui. ⮕ Est-ce que ça empêche un des huit
énoncés ? **Non, pas directement** — c'est une sentinelle de l'aller-retour Codex (#635),
et le code qu'elle garde passe sur macOS. Mais une CI rouge en continu ne juge plus rien :
un vrai rouge y serait invisible. **Issue : inscrire et continuer** — rien corrigé ici,
comme la consigne l'exige. La cause (Linux ≠ macOS : casse de chemin, locale, ordre ?) est
une mesure à faire dans une séance à elle.

## Étape 2 — la mesure entre dans le rituel

`.claude/skills/debut-de-session-labo-codex/SKILL.md`, **§2.1 neuf**, après les deux
mesures d'ouverture. **Une commande, pas de script** — jouée telle quelle, elle rend :
`Tests · failure · 2026-09-02T17:22:40Z · commit 3d3a57be` puis `3d3a57be`. Calquée sur
`lire-verdict.mjs` : le SHA jugé est comparé à `HEAD`, et **les deux cas d'écart sont
distingués** — `HEAD` documentaire (aucun run, c'est normal, `paths-ignore`) contre `HEAD`
de code sans run (pas démarré, ou pas fini). La ligne « Reporter » du §2 s'y réfère.

## Étape 3 — ce qu'on fait du rouge

Écrit au §2.1 : **le dire en français, en tête du rapport d'ouverture, avant tout le
reste — job, étape, fichier(s) ; ne rien corriger soi-même** ; question habituelle (un des
huit énoncés ?), puis l'une des trois issues. Et la conduite sans `gh` : rendre la ligne
quand même, avec le motif, sans rien installer ni connecter.

## Fini quand — les deux issues étaient des succès ; c'est la première

Une session qui ouvre le rituel rend désormais la ligne. Vitest témoin : **437 / 4715**,
rien de `js/` touché, pas de jeton, pas de release. Rien à voir à l'écran.

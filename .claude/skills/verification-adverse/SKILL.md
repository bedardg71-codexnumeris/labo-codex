---
name: verification-adverse
description: >
  Principes pour vérifier de façon fiable la qualité d'un travail de
  développement — le sien (auto-vérification en cours de session, avant de
  déclarer fini) ou celui d'une autre session/IA (audit tiers, post-hoc).
  Charger ce skill AVANT de déclarer un chantier terminé, avant un commit qui
  clôt un travail, ou quand on demande de « vérifier », « auditer », « valider
  la qualité », « contrôler le travail » d'une session. Applicable à tout
  projet, tout langage. Le cœur : ne jamais confondre une affirmation (journal,
  tests verts, libellé « réparé ») avec une preuve, et démontrer qu'un test
  peut échouer avant de lui faire confiance.

  Mots-clés déclencheurs : vérifier, auditer, valider, contrôle qualité,
  relecture, review, le travail est-il bon, est-ce que ça marche, tests verts,
  c'est testé, j'ai fini, before commit, self-check, auto-vérification, audit,
  break-test, test tautologique, attestation, preuve, sentinelle, régression.
---

# SKILL : Vérification adverse d'un travail de développement

> **Principe fondateur** : Un travail parle de lui-même — journal, messages de
> commit, libellés de statut, tests écrits par son auteur. Tout cela est de
> l'**attestation**, pas de la **preuve**. Vérifier, c'est re-dériver chaque
> affirmation porteuse par un moyen indépendant, et démontrer qu'un test peut
> *échouer* avant de croire qu'il protège quoi que ce soit. La défiance ne se
> juge pas : elle se mécanise.

---

## 0. QUAND DÉCLENCHER

- **Avant de déclarer un chantier fini** (auto-vérification, mode A).
- **Avant un commit/push qui clôt un travail** (en complément du rituel de fin
  de session — voir §10).
- **Quand on demande de vérifier/auditer/valider** le travail d'une autre
  session ou d'une autre IA (audit tiers, mode B).
- **Après un « c'est testé, ça marche »** — surtout si c'est toi qui le dis.

Ne PAS déclencher pendant l'exploration ou la planification d'une fonctionnalité
(rien n'est encore à vérifier), ni pour un debug actif (le bug est déjà connu).

---

## 1. CONTEXTE DU PROBLÈME

Vérifier la qualité d'un travail — surtout du code généré par une IA, surtout
quand le vérificateur est l'auteur — bute sur cinq pièges, indépendants du
langage et du projet :

1. **L'attestation prise pour preuve** — « 706 tests verts », « bug réparé »,
   « miroir mort » sont des *affirmations* de l'auteur. Crues telles quelles,
   elles ne vérifient rien.
2. **Le test tautologique** — un test écrit par l'auteur du correctif peut
   passer quelle que soit l'implémentation (sur-mocké, assertion creuse,
   vérifie sa propre fixture). « Vert » ne veut pas dire « protège ».
3. **Le défaut aux coutures** — les bugs se logent entre le récit et le code, et
   entre les chantiers, pas au milieu d'un fichier déjà testé. L'audit en silos
   les manque.
4. **La confiance surclamée** — présenter « je n'ai pas pu vérifier ceci »
   (environnement, temps) comme « c'est bon » corrompt la valeur du verdict.
5. **La contamination de la cible** — vérifier en modifiant, ou pire « réparer
   en vérifiant », masque le défaut au lieu de le constater.

### Pourquoi l'IA est particulièrement vulnérable

En **auto-vérification**, le vérificateur EST l'auteur : il a un biais de
confirmation envers son propre travail, et « je suis raisonnablement sûr que ça
marche » est exactement le piège. Un LLM relit son code avec le même modèle
mental qui l'a produit — il re-confirme ses suppositions. La seule défense n'est
pas un meilleur jugement : c'est de remplacer le jugement introspectif par des
**preuves qu'on ne peut pas se mentir à soi-même** (un test qu'on a fait rougir,
un re-run, un grep). C'est la raison d'être de ce skill.

---

## 2. LES 7 PRINCIPES (et leur anti-pattern)

Chaque principe se lit avec son anti-pattern jumeau (la violation reconnaissable)
et son antidote. La technique du break-test est détaillée au §4 ; le barème de
profondeur au §5.

### Principe 1 — L'attestation n'est pas la preuve

> **Ne jamais traiter ce que le travail dit de lui-même comme une vérification
> de ce qu'il fait.**

Journal de session, messages de commit, libellés de statut (« réparé »,
« livré »), compte de tests, commentaires : ce sont des affirmations de l'auteur.
Toute affirmation porteuse (chiffrée, factuelle, ou de complétude) doit être
re-dérivée par un moyen indépendant : re-rouler, grep, diff, relecture.

**Anti-pattern (AP-1, croire le récit)** : reprendre « N tests verts » ou
« bug X corrigé » dans son verdict sans l'avoir reproduit. Signature : un rapport
de vérification dont les preuves sont des citations du journal de l'audité.

**Antidote** : pour chaque affirmation, écrire à côté *comment je l'ai re-dérivée*
(commande, ligne de diff, grep). Si je ne peux pas → la marquer « non vérifiée »
(P6), jamais « confirmée ».

### Principe 2 — Un test qui ne peut pas échouer ne prouve rien

> **Avant de faire confiance à un test, démontrer qu'il rougit quand le
> comportement qu'il prétend protéger est retiré.**

C'est le mouvement à plus haut levier de toute vérification. Un test vert
n'atteste rien tant qu'on n'a pas vu son rouge. Casser le correctif (ou le code
sous test), exiger l'échec, restaurer. Voir §4.

**Anti-pattern (AP-2, le test tautologique)** : se contenter de « la suite est
verte ». Le test peut être sur-mocké, asserter sur sa propre fixture, ou ne
toucher aucune branche du correctif. Il reste vert même cassé.

**Antidote** : le break-test (§4). Si le test reste vert sans le correctif, il
est décoratif → réserve explicite, le comportement n'est PAS prouvé.

### Principe 3 — Mécanique d'abord, profondeur ensuite

> **Dépenser le balayage scriptable (bon marché) partout, et la relecture
> adverse (chère) seulement là où ça survit et là où l'erreur coûte cher.**

Le balayage catégoriel (règles de sécurité, zones protégées, motifs interdits,
invariants grepables) attrape vite les violations de classe entière. La
relecture ligne-à-ligne et le break-test se réservent aux données, à la
sécurité, aux invariants et aux garde-fous. Voir le barème §5.

**Anti-pattern (AP-3, profondeur uniforme)** : soit tout survoler (on rate les
bugs de logique), soit tout disséquer (on épuise le budget sur du microcopy et
on n'arrive jamais au cœur risqué).

**Antidote** : trier par surface touchée (§5) avant de choisir la profondeur.

### Principe 4 — Chercher le défaut aux coutures

> **Vérifier explicitement les jonctions : affirmation ↔ code, et chantier ↔
> chantier. C'est là que vivent les défauts, pas au milieu d'une pièce testée.**

Deux coutures à inspecter systématiquement : (a) chaque affirmation du récit
correspond-elle au diff réel ? (b) en reliant les chantiers entre eux, un
garde-fou en couvre-t-il un, mais laisse-t-il un chemin voisin non protégé ?

**Anti-pattern (AP-4, l'audit en silos)** : juger chaque chantier isolément,
valider chacun, et manquer le trou transversal (ex. : une protection à l'import
absente au chemin voisin qui mute les mêmes données).

**Antidote** : après les vérifications par chantier, faire une passe
« connexions » — lister les invariants partagés et vérifier que TOUS les chemins
qui les touchent sont couverts, pas seulement celui qui vient d'être modifié.

> **Maillon mécanique (le plus oublié)** : quand un chantier ajoute un garde-fou
> de vérification, **les données/clés que ce garde-fou contrôle SONT l'invariant
> partagé**. Énumérer alors *tous* les écrivains de ces clés (grep) ; chaque
> écrivain qui ne passe PAS par le garde-fou est un trou candidat. C'est ce qui
> fait surgir le défaut transversal sans connaître la réponse d'avance : un
> garde-fou posé sur un chemin (l'import) laisse les autres écrivains des mêmes
> clés (l'autosave, un changement d'état) non protégés.

### Principe 5 — Lecture seule sur la cible ; le doute s'exerce en jetable

> **La vérification ne modifie jamais ce qu'elle juge. Les manipulations
> destructives se font en copie/worktree jetable, restaurées aussitôt.**

Un break-test casse du code : il se fait sur une copie de sauvegarde restaurée
dans la foulée, ou dans un `git worktree` jetable, jamais commité. Après chaque
manipulation : vérifier que l'arbre est propre.

**Anti-pattern (AP-5, vérifier en modifiant)** : laisser une trace de la casse,
ou — le pire — « réparer » un défaut pendant qu'on le vérifie, ce qui le masque
au lieu de le constater et de le rapporter.

**Antidote** : `cp fichier /tmp/bak` → casser → re-rouler → `cp /tmp/bak fichier`
→ `git status` propre. Ou `git worktree add` jetable. Vérifier, ne pas réparer.

### Principe 6 — Nommer ce qu'on n'a pas pu vérifier

> **« Confirmé » et « non vérifié » sont deux verdicts distincts. Une
> vérification honnête déclare ses angles morts pour calibrer la confiance.**

Ce qui n'a pas pu être re-dérivé (suite non exécutable dans l'environnement,
navigateur indisponible, historique tronqué, donnée terrain absente) est listé
comme limite, avec le moyen de le clore plus tard. Ne jamais combler un trou de
vérification par une supposition optimiste.

**Anti-pattern (AP-6, la confiance surclamée)** : présenter une suite non
re-roulée comme « verte », ou déduire « ça marche » d'un « je n'ai pas vu de
problème ».

**Antidote** : une section « limites » explicite ; chaque verdict porte son
niveau de preuve (re-run / diff lu / grep / non vérifié).

### Principe 7 — En auto-vérification, mécaniser la défiance envers soi

> **Quand le vérificateur est l'auteur, exiger l'artefact factuel, jamais
> l'opinion introspective.**

« Je crois que ça marche » est le biais à neutraliser, pas un constat. Seules
comptent les preuves infalsifiables par soi-même : un rouge produit (§4), un
re-run complet, un grep reproductible. Le skill remplace la conviction par la
production d'un fait.

**Anti-pattern (AP-7, l'auto-complaisance déguisée en checklist)** : cocher
« testé ✓ », « vérifié ✓ » sans avoir produit le rouge ni relancé la suite —
une checklist qui mesure l'intention, pas le réel.

**Antidote** : pour chaque case cochée, un artefact attaché (sortie de re-run,
nom du test fait rougir, ligne de grep). Pas d'artefact → pas de coche.

---

## 3. SYNTHÈSE DES ANTI-PATTERNS

| Code | Anti-pattern | Principe | Antidote |
|---|---|---|---|
| AP-1 | Croire le récit (journal, libellé, compte de tests) | P1 | Re-dériver chaque affirmation (re-run/diff/grep) |
| AP-2 | Le test tautologique (vert même cassé) | P2 | Break-test : exiger le rouge (§4) |
| AP-3 | Profondeur uniforme (tout survoler / tout disséquer) | P3 | Trier par surface (§5) |
| AP-4 | L'audit en silos (rate le défaut transversal) | P4 | Passe « connexions » sur les invariants partagés |
| AP-5 | Vérifier en modifiant / réparer en vérifiant | P5 | Jetable + restauration ; constater, pas réparer |
| AP-6 | La confiance surclamée (non vérifié → « bon ») | P6 | Section limites + niveau de preuve par verdict |
| AP-7 | L'auto-complaisance déguisée en checklist | P7 | Un artefact factuel par coche |

---

## 4. LE BREAK-TEST EN PRATIQUE (cœur opérationnel)

Le break-test est ce qui transforme « les tests passent » en « les tests
protègent X ». Procédure générique, sûre (lecture seule sur la branche, P5) :

```
1. Identifier le test censé protéger le comportement (la "sentinelle").
2. Sauvegarder le fichier source du correctif : cp <src> /tmp/bak
3. RETIRER le correctif (revert du hunk, ou inverser la condition, ou
   neutraliser la ligne porteuse) — la plus petite mutation qui annule
   le comportement protégé.
4. Re-rouler CE test ciblé.
   → Attendu : ROUGE, et sur l'assertion qui décrit le comportement.
   → Si VERT : le test est tautologique (AP-2) → réserve, comportement non prouvé.
5. Restaurer : cp /tmp/bak <src>  ;  vérifier git status propre.
```

**Lecture du résultat** :
- Rouge sur la bonne assertion → la sentinelle mord, comportement **prouvé**.
- Rouge ailleurs / erreur de chargement → la mutation était trop large, affiner.
- Vert → **réserve** : on ne sait pas si le comportement est protégé.

**Quoi break-tester** (P3/§5) : tout test neuf ou modifié qui prétend couvrir un
correctif de **données, sécurité, invariant, garde-fou**. Pas le microcopy.

**Économie** : cibler le fichier de test concerné (pas toute la suite) pour
itérer vite. Un seul break-test échantillon par chantier suffit souvent à
qualifier la discipline de test de l'auteur.

### Cas particulier — sentinelle d'ablation / « ratchet » (mutation INVERSE)

La procédure ci-dessus est écrite pour un correctif **additif** : on RETIRE le
correctif et on attend le rouge. Pour un chantier d'**ablation** (suppression de
code mort, retrait d'un alias, nettoyage zéro-dette), la sentinelle est un
**cliquet** (« ratchet ») : elle affirme une **absence** (`expect(source).not.toMatch(...)`
ou `includes(...).toBe(false)`). Le break-test prend alors la forme **inverse** :

```
3'. RÉINTRODUIRE ce qui a été retiré (re-coller la fonction/le symbole/l'alias
    supprimé) — la plus petite résurrection du code mort.
4'. Re-rouler la sentinelle.
    → Attendu : ROUGE sur l'assertion d'absence.
    → Si VERT : la sentinelle est tautologique (regex trop stricte, mauvais
      fichier lu, motif jamais présent) → réserve, l'ablation n'est PAS verrouillée.
5'. Restaurer (retirer la résurrection) ; vérifier git status propre.
```

Sans cette étape, une sentinelle d'absence peut passer **vacuously** (p. ex. une
regex qui ne matche jamais, même si le symbole revenait sous une autre forme) :
verte mais décorative. C'est exactement le piège AP-2 transposé à l'ablation.

---

## 5. PROPORTIONNALITÉ — LE TRIAGE DE LA PROFONDEUR

| Surface touchée | Vérification minimale exigée |
|---|---|
| Données, sécurité, invariant central, garde-fou | **Break-test obligatoire** + relecture ligne-à-ligne + balayage mécanique |
| Logique métier sans persistance | Relecture + au moins **un break-test échantillon** du test associé |
| UI / rendu / microcopy | Balayage mécanique + test de rendu présent ; pas de break-test exigé |
| Docs / commentaires | Confronter au code décrit (couture récit↔code, P4) ; rien d'autre |

> Calqué sur le barème de réversibilité du skill `hygiene-donnees-partagees`
> (§2/P5) : la protection se dose à l'impact, pas uniformément.

---

## 6. LES DEUX MODES (même méthode, deux postures)

Les principes P1–P6 et le break-test (§4) sont **identiques** dans les deux modes.
Seule la posture change :

| Axe | **Mode A — Auto-vérification** (en session, avant de déclarer fini) | **Mode B — Audit tiers** (session fraîche, travail terminé) |
|---|---|---|
| But | Prévenir : ne pas livrer un défaut | Constater : juger un livré |
| Biais dominant | Confirmation envers son propre travail → **P7 central** | Manque de contexte → lire tout récit comme des claims (P1) |
| Déclencheur | Fin de chantier, avant commit | Demande explicite de vérifier/auditer une session |
| Coût du re-run | Faible (déjà en place, incrémental) | Peut exiger du setup (deps, historique complet, navigateur) |
| Sortie | Feu vert / réserves à lever avant de livrer | Rapport : verdict par chantier + risques résiduels |
| Égalisateur | Le break-test : factuel quel que soit l'auteur | idem |

En **mode B**, commencer par reconstruire un baseline factuel indépendant
(arbre, tests re-roulés, version) avant tout jugement, et nommer d'emblée les
limites d'environnement (P6).

---

## 7. ORCHESTRATION — qui applique ce skill (principale ou sous-agents)

**Le facteur décisif n'est pas le volume de travail, c'est que le break-test (§4)
MUTE l'arbre de travail.** C'est lui qui dicte l'architecture.

### Contrainte d'isolation (le P5 opérationnalisé)

Deux vérificateurs qui break-testent **en parallèle sur le MÊME arbre** se corrompent
mutuellement : sauvegardes qui s'écrasent, source lue en plein milieu d'une casse,
`git status` qui n'est plus un témoin fiable de propreté. Donc : break-tests parallèles
→ **chaque agent dans son propre worktree isolé** (`isolation: "worktree"`), un chantier
par agent. **Jamais** de break-tests parallèles sur un arbre partagé.

### Mode A — auto-vérification

Par défaut : **instance principale**. Le diff à vérifier est *non commité*, dans ton
arbre ; tu portes le contexte (ce que tu viens de faire, les affirmations que tu
t'apprêtes à écrire) ; un sous-agent en worktree séparé ne verrait même pas tes
changements non commités. **Exception à forte valeur** : sur un chantier
données/sécurité, déléguer à **un** sous-agent frais réduit le biais de confirmation
(il n'a pas écrit le code → quasi-mode B, P7). Si tu le fais : committe ou `stash`
d'abord (pour qu'il voie le travail), et exige des **artefacts**, pas un verdict.

### Mode B — audit tiers

- **Paralléliser la vérification profonde PAR CHANTIER** : un sous-agent par chantier,
  chacun en worktree isolé, renvoyant verdict **et artefacts bruts**.
- **NE PAS paralléliser la passe « connexions » (P4) ni la synthèse** : le défaut
  transversal vit ENTRE les chantiers, invisible à tout agent qui n'en regarde qu'un.
  Verdict final, risques résiduels et section « limites » = **propriétaire unique** qui
  voit tous les retours.

### Les deux non-négociables (quel que soit le découpage)

1. **Le rapport d'un sous-agent est une attestation (P1)** : l'orchestrateur ne tamponne
   pas son « ✅ » — il réclame l'artefact factuel (sortie de test rouge, lignes de grep)
   et en rejoue un par échantillon. Sinon le rubber-stamp est juste déplacé d'un cran.
2. **La passe « connexions » + le verdict = un seul cerveau.** Le transversal ne se
   découpe pas.

### Règle simple

| Situation | Orchestration |
|---|---|
| 2-3 chantiers | **Principale, en série** — le surcoût d'orchestration dépasse le gain, la vue transversale est déjà dans une tête |
| Beaucoup de chantiers indépendants | **Fan-out par chantier en worktrees isolés**, puis synthèse + passe connexions par la principale |

---

## 8. CHECKLIST DE SORTIE — gate explicite

Avant de prononcer un verdict (« vérifié » / « confirmé ») :

1. **Chaque affirmation porteuse re-dérivée ?** (P1) — sinon, marquée « non
   vérifiée », pas « confirmée ».
2. **Chaque correctif risqué adossé à un test fait rougir ?** (P2/P3/§4) — sinon,
   réserve explicite.
3. **Passe « connexions » faite ?** (P4) — les chemins voisins du même invariant
   sont-ils couverts, pas seulement celui modifié ?
4. **Arbre propre, aucune réparation glissée ?** (P5) — `git status` vérifié.
5. **Limites nommées ?** (P6) — ce qui n'a pas pu être vérifié est listé.
6. **(Mode A) Chaque coche porte un artefact ?** (P7) — pas d'opinion sans fait.

> **Tous validés → verdict prononçable.**
> **Un seul non validé → ne pas conclure « vérifié »** : annoncer ce qui manque
> et ce qu'il faudrait pour le clore. Un verdict honnête partiel vaut mieux qu'un
> « tout est bon » non étayé.

---

## 9. SIGNAUX D'ALERTE — formulations à ne pas croire sur parole

| Signal | Risque | Principe |
|---|---|---|
| « N tests verts » (sans re-run de ma part) | AP-1 | P1 |
| « Bug corrigé / réparé / livré » (libellé de statut) | AP-1 | P1 |
| « C'est testé », « il y a une sentinelle » | AP-2 : test peut-être tautologique | P2 |
| « Tout passe, donc c'est bon » | AP-2/AP-7 | P2, P7 |
| « Je suis raisonnablement sûr que… » (introspection) | AP-7 | P7 |
| « Aucun problème détecté » → conclu « ça marche » | AP-6 | P6 |
| Un chantier validé isolément, voisins non regardés | AP-4 | P4 |
| Statut « réparé » en un endroit, « en attente » ailleurs | AP-1 : couture récit↔code | P1, P4 |
| Sentinelle d'**absence** (ablation/ratchet) verte mais jamais faite rougir | AP-2 : peut passer vacuously (regex jamais matchée) | P2, §4 cas ratchet |

---

## 10. RELATION AVEC LES SKILLS PROJET

Ce skill est **agnostique au projet** : il porte les principes et le break-test.
Chaque projet l'instancie via ses rituels et ses cas concrets.

### Instanciations connues (Labo Codex)

| Posture | Instanciation projet | Rôle |
|---|---|---|
| Mode A (auto, avant commit) | le skill `fin-de-session-labo-codex` §4 | Applique le break-test aux tests neufs/modifiés + confronte les affirmations de session au diff. Le balayage mécanique (P3) y est déjà couvert par §2 (audit sécurité statique). |
| Mode A (baseline d'entrée) | le skill `debut-de-session-labo-codex` | Re-dérive l'état factuel (P1) : git/tests/version, prémisse vs réel. |
| Mode B (audit tiers) | Rapports `Rapports/AUDIT-*` | Gabarits de rapport : verdict par chantier (Confirmé/Réserve/Problème) + risques résiduels + preuves reproductibles (break-tests réalisés). |

### Consignes de chargement (réciproques)

- **Si un rituel projet l'invoque** (le skill `fin-de-session-labo-codex` §4), charger ce
  parent pour le « pourquoi » et la procédure de break-test (§4) — ne pas la
  dupliquer dans le rituel.
- **En mode B**, charger aussi le skill `debut-de-session-labo-codex` (baseline factuel) et,
  si le travail touche les données, le skill `hygiene-donnees-partagees` /
  le skill `integrite-globaux` (les invariants à vérifier aux coutures, P4).

### Co-évolution

Quand un audit découvre un nouveau type de défaut « aux coutures » ou un nouveau
motif de test trompeur, l'ajouter à §3/§9. Quand un rituel projet change sa façon
de lancer les tests ou de borner un diff, vérifier que la procédure §4 reste
valide.

---

## 11. RETOURS TERRAIN

### Premier essai — #338 « ablation du vieil éditeur de pratique mort » (14 juin 2026)

Premier banc d'essai réel (mode A, auto-vérification), cadré d'avance dans
`plans de travail/CADRAGE-premier-essai-verification-adverse-338.md`. Chantier
données/SSOT borné et à faible risque (suppression de code mort), idéal pour
roder le skill. Résultat : ~1987 lignes mortes retirées sur 3 passages
(`pratiques.js` ~1244 + `pratique-notation-v2.js` 743), PR mergée, CI verte.

**Ce que le skill a bien servi (appliqué même sans chargement explicite)** :
- **P1** a payé directement : le BACKLOG affirmait que le « trio v2 » était mort ;
  re-dérivé → `sauvegarderPratiqueBaseV2` est en fait **vivant** (atteint par
  `changerVariantePANStandards`, consommé par la bibliothèque). Croire le récit
  aurait cassé le moteur de config.
- **P4** (passe connexions) a été l'outil central : analyse d'atteignabilité
  scriptée (graphe d'appels) + **résolution des alias d'export** — qui a évité de
  retirer une fonction vivante exportée sous un nom différent (`supprimerTypeTravailSpec`
  → `window.supprimerTypeTravailSpecV2`, câblée en `data-action`). Le maillon
  « invariant partagé » s'est instancié en « qui écrit encore `pratiquesConfigurables` ? ».
- **P6** : Playwright non exécutable en cloud, nommé comme angle mort, puis levé
  par la CI sur la PR.

**Friction observée → corrigée dans ce skill** :
1. **P2 (break-test) oublié pendant la session.** Les sentinelles d'ablation ont
   été déclarées « vertes » sans jamais être faites **rougir** — exactement AP-2/AP-7.
   Rattrapé en fin de session (réintroduction d'un symbole retiré → rouge sur la
   bonne assertion, puis restauration, arbre propre). Le motif d'absence-jamais-rougie
   est désormais documenté au **§4 (cas « ratchet »)** et ci-dessous au §9.
2. **Déclenchement non automatique.** Le skill a été appliqué « d'instinct » + via
   le cadrage, mais il n'était ni dans la liste de skills de `CLAUDE.md`, ni câblé
   dans le skill `fin-de-session-labo-codex` §4 de façon contraignante. C'est probablement la
   cause racine de la friction nº 1 : sans déclencheur ferme, l'étape la plus
   importante (P2) est celle que le biais d'auteur saute. **Action de suivi** : une
   fois ce skill mergé sur `main`, l'ajouter à la liste « Charger les skills » de
   `CLAUDE.md` et faire de la checklist de sortie (§8) un passage **obligatoire**
   du rituel de fin de session.

**Verdict** : le skill fait ce qu'il promet. Son apport le plus net n'a pas été un
meilleur jugement mais le **rappel mécanique de l'étape que l'auteur allait
oublier** — ce qui valide P7 (« mécaniser la défiance envers soi ») comme étant
le cœur du skill, pas un principe parmi d'autres.

---

**Date de création** : 14 juin 2026
**Origine** : généralisation de la méthode appliquée dans les deux audits du
13-14 juin 2026 (travail autonome puis collaboratif de l'IA), où 7 break-tests
ont qualifié les sentinelles et où le défaut le plus utile (#340, protection à
l'import mais pas au changement de trimestre) a émergé d'une couture entre
chantiers. Analyse complète : `.claude/skills/verification-adverse/ANALYSE-verification-adverse.md`.
**Révision attendue** : à chaque découverte d'un nouveau motif d'attestation
trompeuse ou de défaut transversal, quel que soit le projet.

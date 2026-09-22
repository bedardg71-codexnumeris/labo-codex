# Monitorage Pédagogique — Guide Claude Code

> **Point d'entrée léger, chargé à chaque session.** Tout ce qui est volumineux ou
> conditionnel vit dans `.claude/skills/` et se charge à la demande.
> Ne rien ajouter ici sans retirer autant.
> **Cible : moins de 250 lignes.** C'est le seul texte lu par TOUTES les sessions :
> ce qui y entre doit valoir la place qu'il prend à chacune.

---
## Lecture obligatoire

**Commence TOUJOURS par** : `OU-EN-EST-ON.md` (racine) — où en est chacun des huit
gestes, en français, sans numéros de fiche ; mis à jour EN FIN DE SESSION, et une ligne
ne passe à « fait » qu'avec sa phrase « vérifié comment ». Puis
`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` (état mesuré, mandat courant) et
`OBJECTIF-COHORTE-1.md` (la ligne d'arrivée, arrêtée).

**Puis `PROTOCOLE.md` (racine)** — comment nous trois travaillons ensemble : les rôles,
la preuve exigée d'une mesure, la relecture croisée, ce qui monte hors de la consigne.
Seul fichier de coordination lu par Cowork ET Claude Code (Cowork ne lit pas `.claude/`).

### Une porte terrain a DEUX livrables jumeaux

Skill `portes-terrain` : le markdown de `plans de travail/` (la TRACE) **et** un
artefact publié (l'OPÉRATION, bouton « Copier mes résultats » — sans lui, l'avancement
reste dans le navigateur de Grégoire et personne ne le lit). **Claude Code écrit le
markdown ; Cowork publie l'artefact.** Cowork ne lit pas `.claude/skills/` : la consigne
doit être ICI. Oublié le 1er sept. 2026.

---

## Avant de coder

**REGLE DE RELAIS (8 août 2026)** : on FUSIONNE vers `main` à la fin de CHAQUE
session. Si un merge doit attendre, remplir `RELAIS.md` et le pousser sur `main`
SEUL — le seul point que toute session lit, quelle que soit la branche. Motif : le
8 août, deux sessions parties du même commit ont livré deux « 1.55.0 ».

**EN TOUT PREMIER, AU DÉBUT DE CHAQUE SESSION** : **déléguer le rituel au
subagent `audit-debut-session`** (skill `debut-de-session-labo-codex` en contexte
isolé, ~500 tokens au lieu de ~135 000) : audit git + tests + version, lecture
ciblée de `SESSION.md`/`BACKLOG.md`, comparaison avec la prémisse. Lecture seule.
Acté le 28 mai 2026 après un écart de 24 h.

⚠ **Vitest se lance DEPUIS `tests/`** : de la racine il balaie
`.claude/worktrees/` sans la config et rend 217 fichiers rouges.

⚠ **Lectures ciblées obligatoires.** `SESSION.md`, `BACKLOG.md` et `RELAIS.md`
pèsent chacun des centaines de milliers d'octets. **Jamais sans `offset`/`limit`** :
un `Read` par défaut sur `SESSION.md` coûte plus de 100 000 tokens. En-tête, puis cibler.

Ensuite, selon le chantier :

1. `BACKLOG.md` (tâches en attente) et `SESSION.md` (contexte récent)
2. `ETAT-PROJET.md` pour les objectifs de stabilité, pérennité et qualité
3. Le module concerné dans `docs/modules/`, et `docs/legacy/` pour les
   problèmes connus

**Les skills métier se chargent tout seuls** selon le chantier (architecture,
notation, cadre pédagogique, RàI, sécurité, intégrité des globaux, portes terrain,
vérification adverse, design d'interface, release). En invoquer un par son nom
s'il ne se déclenche pas : c'est que sa `description` est à corriger.

---

## Priorité absolue : retours testeurs

**Quand un testeur signale un bug ou un besoin, on interrompt le plan en cours** :
les retours passent AVANT le backlog prévu.

- `Retours des testeurs/SUIVI-BUGS.md` — bugs ouverts vs corrigés. Consulter **de
  façon ciblée** (120 Ko) AVANT de corriger un bug.
- `Retours des testeurs/USAGE-FORMATS.md` — journal d'usage. Y noter toute
  observation en moins de 30 s (date + initiales + 1-3 lignes).

### Ce qui entre au BACKLOG (24 août 2026)

**Un item n'entre que s'il a un symptôme que Grégoire a VÉCU, ou s'il bloque un
chantier en cours.** Motif, dans ses mots : « les tâches s'accumulent sans jamais
voir la fin ». Le compte d'items monte quand on cherche mieux : il ne mesure rien.

### Ce qu'une trouvaille devient — TROIS ISSUES, PAS DEUX (1er septembre 2026)

Toute découverte faite en chemin reçoit l'une de ces trois issues, et tu la
NOMMES dans ton rapport :

1. **Corriger maintenant** — seulement si ça casse le parcours qu'on est en train
   de livrer, ou si ça touche quelque chose que des élèves ont déjà entre les mains.
2. **Inscrire et continuer** — réel, mais hors du lot en cours. ⮕ **C'EST LE
   DÉFAUT.** Dans le doute, c'est celui-là.
3. **Commenter dans le code et oublier** — vrai, sans conséquence observable.

⚠ Le premier niveau était devenu le défaut de fait : c'est ce qui produit les
corrections de corrections, et fait grossir le backlog quand on s'y attaque.

⚠⚠ **CES TROIS NIVEAUX ARBITRENT DU CODE ÉTRANGER — pas ton propre lot** (1er sept.,
cas réel en #612). Une classe CSS jamais définie, un export sans consommateur, une
fonction que rien n'appelle : **ce n'est pas une trouvaille, c'est le lot qui n'est
pas fini.** Le test qui départage : **est-ce que je viens de l'écrire ?** Si oui,
finis — ça n'élargit aucun périmètre. Sinon, applique les trois niveaux.

### Ce qu'un audit doit produire

**Un audit n'est pas terminé quand il est déposé** — mesuré le 1er sept. : sur 51
rapports, **22 sans suite**. Il l'est quand chaque constat porte, DANS le fichier
d'audit, l'une de trois dispositions : *inscrit* (n°), *refusé* (motif), *périmé*.

⮕ Même esprit pour les portes terrain — **deux règles de tête** du skill
`portes-terrain` : aucune porte si une machine peut répondre ; préalable dû
seulement si un raté est irréversible.

---

## Principes directeurs

### Stabilité zéro-dette (21 avril 2026)

> Tout nouveau chantier RETIRE ce qu'il remplace, il ne l'empile pas à côté.
> La stabilité prime sur la vitesse de livraison.

⚠ **RÉVISÉ LE 1er SEPT. 2026 : la prémisse « sans base d'utilisateurs » a expiré**
— la cohorte 1 arrive à la mi-septembre, et la rétro-compat couvre désormais **ce
qui voyage** (grilles partagées, imports, exports). **L'élargissement de scope
n'est plus gratuit** : « refactoriser est attendu » vaut À L'INTÉRIEUR d'un lot.

- Un chantier n'est pas fini tant que l'ancien système n'est pas retiré. Pas
  d'alias « au cas où », pas de code mort « pour plus tard ».
- Avant de changer un défaut, un flag ou une signature : auditer les call-sites,
  pour le code dormant qui pourrait se réveiller (`51e5cdc`, 20 avril).
- Pas de report. Pas de chantiers « à reporter ».
- **Seule contrainte de rétro-compat** : les données personnelles de Grégoire
  (trimestres réels, grilles, évaluations) survivent aux changements.

### TARIR N'EST PAS RÉPARER (1er sept. 2026)

**Tout l'état de cette app vit chez l'utilisateur : un correctif tarit la SOURCE,
il ne touche pas le STOCK déjà écrit chez les gens.** Le vert des bancs ne voit
jamais la différence — ils partent d'un espace vide. Trois fois le 1er sept. : les
huit échelles (les copies importées restent muettes), **#674**, **#682**.
⮕ **À chaque correctif : source, stock, ou les deux ?** Si le stock reste, ce
n'est pas un défaut — mais il faut l'ASSUMER et l'écrire, pas le découvrir trois
jours plus tard. ⛔ Et le réparer d'office est exclu : **écrire dans les données de
quelqu'un remonte à Grégoire.** On mesure, on sépare, on propose.

### Single Source of Truth

Chaque donnée a UNE source unique. Les modules ne se parlent JAMAIS directement :
communication via localStorage/IndexedDB uniquement. Registre des clés avec
propriétaires : `docs/DATA-OWNERSHIP.md`.

### Namespacing

Les données sont préfixées par trimestre (`h2026_groupeEtudiants`,
`a2025_presences`). Utiliser `window.cle('nomCle')`.

---

## Contraintes techniques

**Architecture des données** : `docs/architecture/ECOSYSTEME-DONNEES.md` — quatre
concepts (Codex, Archives, Codex data, Voûte). À lire AVANT de toucher à `codex.js`,
`import-export.js`, `db.js` ou `travaux-stockage.js`.

- **Stack** : HTML5 / CSS3 / JS ES6+ pur (aucune dépendance externe sauf Chart.js), 100 % hors-ligne
- **Stockage** : localStorage (< 200 Ko) + IndexedDB/memoryCache (> 200 Ko) via `db.js`
- **CSP** : `script-src 'self'` — zéro script inline, zéro `eval()`

---

## Règles de sécurité — NON NÉGOCIABLES

**Tout nouveau code DOIT les respecter.** (Audit du 26 mars 2026. Détail,
exemples et modèle de menaces : skill `securite-donnees`.)

1. **`innerHTML` + données utilisateur** → `echapperHtml()`, sans exception : noms
   d'étudiants, titres de productions, texte libre, données importées.
2. **Zéro handler inline** (`onclick=`…) dans le HTML généré : `data-action` /
   `data-on-change` (dispatcher dans `main.js`).
3. **Tout import ZIP** passe par `validerZipSecurite(zip)` (`import-export.js`) ;
   **tout import image/PDF** par `validerMagicBytes(blob)` (`travaux-import.js`).
4. **Zéro `console.log`** dans le nouveau code — `warn`/`error` seulement, et les
   `log` de debug sont retirés avant commit.
5. **Tout chantier sécurité Phase 1+ ajoute ≥ 1 test** couvrant la défense livrée :
   fonction pure → Vitest `tests/unit/` ; navigateur → Playwright `tests/integration/`.
6. **Aucun nom d'élève réel** dans le code, tests, rapports, plans, exemples : noms fictifs (22 sept. 2026).

Avant un commit touchant `js/securite-*.js`, `js/import-export.js`,
`js/cc-license.js` ou la CSP : `cd tests && npm test` — il enchaîne Vitest ET
Playwright (>10 min) ; Vitest seul = `npm run test:unit`. Doc : `docs/securite/TESTS-AUTOMATISES.md`.

---

## Zones protégées

**NE JAMAIS MODIFIER sans autorisation** : `js/config.js` et `js/navigation.js`
(navigation), `noms_stables.json` (registre des noms protégés).

**Les notes d'A2025 et d'H2026 ne sont PAS rouvertes** (décision de Grégoire,
1er sept. 2026, explicitement sans retour). Des notes faussées et déjà remises y
ont été trouvées : ne pas les rouvrir, ne pas proposer de les recompter, ne pas
les signaler. Seul l'automne 2026 compte.

---

## Procédure de développement

1. Discussion (Cowork au besoin), puis LIRE les fichiers concernés avant de planifier
2. Planifier étape par étape, en anticipant Mac et iPad **séparément**
3. Implémenter UN fichier à la fois, valider et déboguer après chacun

**Travail visuel ou UI** : `design-system.html` reste la source de vérité.

---

## Avant chaque commit

**Lancer `/fin-de-session`**, qui porte le rituel complet, puis le skill
`release-et-changelog`. Ne pas les recopier ici. **Confirmer avec Grégoire avant
un `major`.**

⚠ **« PUSH RÉUSSI » NE SIGNIFIE PAS « SUITE COMPLÈTE VERTE ».** Le hook pre-push
ne lance que Vitest ; faute de verdict Playwright local, il laisse passer. L'ordre
qui fait qu'un push est jugé est au §4.5 de `fin-de-session` : commit, relecture,
**puis** verdict, **puis** push.

---

## Ce qui remonte jusqu'à Grégoire — et ce qui ne remonte pas

**RÉVISÉ LE 1er SEPT. 2026** — « pose la question plutôt que de supposer » lui
faisait arbitrer une quinzaine de décisions par session.

**Le défaut est maintenant : DÉCIDE, puis DIS-LE en une ligne.** Tranche toi-même
le technique (nommage, découpage, ordre des lots, forme d'un test, emplacement
d'un correctif) et tout ce qui est **mesurable** : un doute qui se lève par un
`grep` n'est pas une question, c'est une mesure que tu n'as pas faite.

**Demande-lui — et attends sa réponse — seulement pour :**
1. **la pédagogie et sa didactique** — ce qu'une note veut dire, ce qu'un critère
   mesure, ce qu'une suppression doit emporter ;
2. **ses données réelles** — tout geste irréversible sur ses trimestres, grilles,
   évaluations. ⚠ Y compris RENOMMER une copie en base (cf. « tarir n'est pas
   réparer ») ;
3. **les mots que ses élèves liront** — la prose des rétroactions, et **le nom
   d'une grille** : il s'imprime sur leur PDF (mesuré le 1er sept.) ;
4. **ce qui l'engage publiquement** — release `major`, partage, communication.

⚠ Grégoire a la mémoire contextuelle du projet : quand tu décides seul, **dis ce
que tu as supposé**. Une supposition nommée se corrige en dix secondes ; une
supposition tue se découvre trois jours plus tard.

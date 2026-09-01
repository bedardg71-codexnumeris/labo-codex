# Monitorage Pédagogique — Guide Claude Code

> **Ce fichier est un point d'entrée léger, chargé à chaque session.**
> Tout ce qui est volumineux ou conditionnel vit dans `.claude/skills/`
> et se charge à la demande. Ne rien ajouter ici sans retirer autant.
> **Cible : moins de 250 lignes.** C'est le seul texte lu par TOUTES les sessions :
> ce qui y entre doit valoir la place qu'il prend à chacune.

---

## Lecture obligatoire

**Commence TOUJOURS par** : `OU-EN-EST-ON.md` (racine) — où en est chacun des huit
gestes, en français, sans numéros de fiche ; mis à jour EN FIN DE SESSION, et une ligne
ne passe à « fait » qu'avec sa phrase « vérifié comment ». Puis
`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` (état mesuré, mandat courant) et
`OBJECTIF-COHORTE-1.md` (la ligne d'arrivée, arrêtée).

### Qui écrit quoi dans la consigne de démarrage (1er sept. 2026)

**Claude Code rend l'ÉTAT MESURÉ** en fin de session : des faits datés, rien d'autre.
**Cowork écrit le MANDAT** et la séquence, à froid, avec Grégoire. Motif : une session
qui rédige sa propre consigne de relais **se relit elle-même** — elle transmet ce
qu'elle a vu, pas ce qu'elle a manqué. C'est l'argument de la relecture croisée,
appliqué au relais.

---

## Avant de coder

**REGLE DE RELAIS (8 août 2026)** : on FUSIONNE vers `main` à la fin de CHAQUE
session. Si un merge doit vraiment attendre, remplir `RELAIS.md` à la racine et
le pousser sur `main` SEUL — c'est le seul point que toute session lit, quelle que
soit la branche. Motif : le 8 août, deux sessions parties du même commit ont livré
deux « 1.55.0 » et pris les mêmes identifiants.

**EN TOUT PREMIER, AU DÉBUT DE CHAQUE SESSION** : **déléguer le rituel au
subagent `audit-debut-session`** (skill `debut-de-session-labo-codex` en contexte
isolé, ~500 tokens rendus au lieu de ~135 000 de bruit). Audit git + tests +
version, lecture ciblée de `SESSION.md`/`BACKLOG.md`, comparaison avec la
prémisse reçue. Lecture seule. Acté le 28 mai 2026 après un écart de 24 h.

⚠ **Vitest se lance DEPUIS `tests/`**, jamais de la racine : de la racine il
balaie `.claude/worktrees/` sans la config et rend 217 fichiers rouges.

⚠ **Lectures ciblées obligatoires.** `SESSION.md`, `BACKLOG.md` et `RELAIS.md` pèsent
chacun des centaines de milliers d'octets, sur des lignes de plusieurs milliers de
caractères. **Ne jamais les lire sans `offset`/`limit`** : un `Read` par défaut sur
`SESSION.md` coûte plus de 100 000 tokens. Lire l'en-tête, puis cibler.

Ensuite, selon le chantier :

1. `BACKLOG.md` (tâches en attente) et `SESSION.md` (contexte récent)
2. `ETAT-PROJET.md` pour les objectifs de stabilité, pérennité et qualité
3. Le module concerné dans `docs/modules/`, et `docs/legacy/` pour les
   problèmes connus

**Les skills métier se chargent tout seuls** selon le chantier (architecture,
notation, cadre pédagogique, RàI, sécurité, intégrité des globaux, portes
terrain, vérification adverse, design d'interface, release). Les invoquer par
leur nom si l'un ne se déclenche pas alors qu'il devrait : c'est le signal que
sa `description` est à corriger.

---

## Priorité absolue : retours testeurs

**Quand un testeur signale un bug ou un besoin, on interrompt le plan en cours.**
Les retours utilisateurs passent AVANT le backlog prévu.

- `Retours des testeurs/SUIVI-BUGS.md` — bugs ouverts vs corrigés. Consulter
  **de façon ciblée** (le fichier fait 120 Ko) AVANT de corriger un bug.
- `Retours des testeurs/USAGE-FORMATS.md` — journal d'usage des formats. Y noter
  toute observation en moins de 30 s (date + initiales + 1-3 lignes).

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

⚠ Le premier niveau était devenu le défaut de fait. C'est ce qui produit les
corrections de corrections, et ce qui fait grossir le backlog à chaque fois qu'on
s'y attaque.

⚠⚠ **CES TROIS NIVEAUX ARBITRENT DES TROUVAILLES SUR DU CODE ÉTRANGER — pas ton
propre lot** (précision du 1er sept. 2026, née d'un cas réel en #612). Une classe
CSS écrite dans `js/` et jamais définie dans `styles.css`, un export posé sans
consommateur, une fonction livrée que rien n'appelle : **ce ne sont pas des
trouvailles, c'est le lot qui n'est pas fini.** Les terminer n'élargit aucun
périmètre, et ne se négocie pas.
⮕ Le test qui départage : **est-ce que je viens de l'écrire ?** Si oui, finis. Si
c'était là avant toi, applique les trois niveaux.

### Ce qu'un audit doit produire

**Un audit n'est pas terminé quand il est déposé** — mesuré le 1er sept. 2026 :
sur 51 rapports, **22 n'ont jamais eu de suite**. Il est terminé quand chacun de
ses constats porte, **dans le fichier d'audit lui-même**, l'une de trois
dispositions : *inscrit* (avec le numéro), *refusé* (avec le motif), *périmé*.

⮕ Même esprit pour les portes terrain : les **deux règles de tête** du skill
`portes-terrain` (aucune porte si une machine peut répondre ; préalable dû
seulement si un raté est irréversible).

---

## Principes directeurs

### Stabilité zéro-dette (21 avril 2026)

> Tout nouveau chantier RETIRE ce qu'il remplace, il ne l'empile pas à côté.
> La stabilité prime sur la vitesse de livraison.

⚠ **RÉVISÉ LE 1er SEPT. 2026 : la prémisse « sans base d'utilisateurs » a expiré**
— la cohorte 1 arrive à la mi-septembre. La rétro-compat couvre désormais aussi
**ce qui voyage** (grilles partagées, paquets d'import, exports). Et
**l'élargissement de scope n'est plus gratuit** : « refactoriser est attendu »
vaut À L'INTÉRIEUR d'un lot, ce n'est pas une licence pour l'agrandir.

- Un chantier n'est pas fini tant que l'ancien système n'est pas retiré. Pas
  d'alias « au cas où », pas de code mort « pour plus tard ».
- Avant de changer un défaut de préférence, un flag ou une signature : auditer
  les call-sites pour détecter le code dormant qui pourrait se réveiller.
  (Cas d'école : commit `51e5cdc` du 20 avril, primo-accueil réveillé.)
- Pas de report. Pas de chantiers « à reporter ».
- **Seule contrainte de rétro-compat** : les données personnelles de Grégoire
  (trimestres réels, grilles, évaluations) survivent aux changements.

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

- **Stack** : HTML5 / CSS3 / JavaScript ES6+ pur (aucune dépendance externe sauf Chart.js)
- **Stockage** : hybride localStorage (< 200 Ko) + IndexedDB/memoryCache (> 200 Ko) via `db.js`
- **Fonctionnement** : 100 % hors-ligne
- **CSP** : `script-src 'self'` — zéro script inline, zéro `eval()`

---

## Règles de sécurité — NON NÉGOCIABLES

**Tout nouveau code DOIT les respecter.** (Audit du 26 mars 2026. Détail,
exemples et modèle de menaces : skill `securite-donnees`.)

1. **`innerHTML` + données utilisateur** → `echapperHtml()` obligatoire, sans
   exception. Concerne noms d'étudiants, titres de productions, texte libre,
   données importées.
2. **Zéro handler inline** (`onclick=`, `onchange=`…) dans le HTML généré.
   Utiliser `data-action` / `data-on-change` (dispatcher dans `main.js`).
3. **Tout import ZIP** passe par `validerZipSecurite(zip)` (`import-export.js`).
4. **Tout import image/PDF** passe par `validerMagicBytes(blob)` (`travaux-import.js`).
5. **Zéro `console.log`** dans le nouveau code : `console.warn` / `console.error`
   uniquement. Les `console.log` de debug sont retirés avant commit.
6. **Tout chantier sécurité Phase 1+ ajoute au minimum 1 test** couvrant la
   défense livrée. Fonction pure → Vitest dans `tests/unit/`. Comportement
   navigateur → Playwright dans `tests/integration/`.

Avant un commit touchant `js/securite-*.js`, `js/import-export.js`,
`js/cc-license.js` ou la CSP d'`index.html` : `cd tests && npm test`.
Documentation : `docs/securite/TESTS-AUTOMATISES.md`.

---

## Zones protégées

**NE JAMAIS MODIFIER sans autorisation** : `js/config.js` et `js/navigation.js`
(navigation), `noms_stables.json` (registre des noms protégés).

---

## Procédure de développement

1. Discussion sur la fonctionnalité (Cowork au besoin)
2. Lire les fichiers concernés AVANT de planifier
3. Planification détaillée, étape par étape
4. Anticiper les erreurs utilisateur sur Mac et iPad **séparément**
5. Implémenter UN fichier à la fois, valider fonctionnellement après chacun
6. Déboguer avant de passer à l'étape suivante
7. Documenter, committer et pousser seulement après validation
8. En fin de session : ce qui est fait, ce qui reste, les risques

**Travail visuel ou UI** : `design-system.html` reste la source de vérité.

---

## Avant chaque commit

**Lancer `/fin-de-session`** (rituel complet, dont le break-test du §4 : faire
ROUGIR chaque sentinelle de correctif données/sécurité/SSOT avant de lui faire
confiance). Le filet mécanique (contrôle `innerHTML` au commit, Vitest au push)
s'active seul via le hook SessionStart. Le §4 adverse reste à ta charge : c'est
l'étape que le biais d'auteur saute.

Puis le skill `release-et-changelog` — il porte la procédure complète. Ne pas
la recopier ici. **Confirmer avec Grégoire avant un `major`.**

---

## Ce qui remonte jusqu'à Grégoire — et ce qui ne remonte pas

**RÉVISÉ LE 1er SEPT. 2026** — « pose la question plutôt que de supposer » lui
faisait arbitrer une quinzaine de décisions par session.

**Le défaut est maintenant : DÉCIDE, puis DIS-LE en une ligne.** Tranche
toi-même les questions techniques (nommage, découpage, ordre des lots, forme
d'un test, emplacement d'un correctif) et tout ce qui est **mesurable** : un
doute qui se lève par un `grep` n'est pas une question, c'est une mesure que tu
n'as pas faite.

**Demande-lui — et attends sa réponse — seulement pour :**
1. **la pédagogie et sa didactique** — ce qu'une note veut dire, ce qu'un critère
   mesure, ce qu'une suppression doit emporter ;
2. **ses données réelles** — tout geste irréversible sur ses trimestres, ses
   grilles, ses évaluations ;
3. **les mots que ses élèves liront** — la prose des rétroactions ;
4. **ce qui l'engage publiquement** — une release `major`, un partage, une
   communication.

⚠ Grégoire a la mémoire contextuelle réelle du projet : quand tu décides seul,
**dis ce que tu as supposé**. Une supposition nommée se corrige en dix secondes ;
une supposition tue se découvre trois jours plus tard.

# Consigne du jour — le lot correctif des six « corriger maintenant » de l'audit des sous-onglets de Suivi

> **Écrite le 6 septembre 2026, 10 h 57 (Toronto), par Cowork, sur l'arbitrage de Grégoire.** Elle remplace la consigne d'audit du matin, archivée à côté sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-06-audit-sous-onglets.md` — commets l'archivage avec ton premier commit.
> **Cette séance tourne SUR LE MAC**, dans le dépôt monté. **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `git --no-optional-locks rev-parse --short origin/main`, `cat version.json`, `TZ=America/Toronto date`.
> **Source de vérité des constats** : `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md`, §0 et les sections citées. Cowork a revérifié les six au code sur le Mac le 6 en fin de matinée ; les six tiennent. **Une consigne peut se tromper : mesure, n'obéis pas.**

## Le mandat, en une phrase

Corriger les six « corriger maintenant » du §0, en UN lot, avec une sentinelle par correctif, et livrer une seule fois à la fin.

## L'arbitrage de Grégoire, au mot

> « Une intervention appartient à un groupe-cours. »

C'est sa réponse à la règle laissée ouverte en CM-6 (#746). Rien d'autre n'a été tranché : ce qui n'est pas dans cette consigne reste « inscrire ».

## Les six, dans l'ordre

### 1 · CM-1 — Le mode anonymisation plante sur tout trimestre sans mapping

- **Ce que l'utilisateur voit** : il bascule en mode anonymisation sur un trimestre neuf (A2026, ou la démo) et les six sous-onglets de Suivi deviennent vides ou muets.
- **Site** : `js/modes.js:310` et `:338` — `doitRegenerer = true` sans déclaration, sous le `'use strict'` de la ligne 9. `ReferenceError: Can't find variable: doitRegenerer` à chaque lecture de `groupeEtudiants`. Introduit le 22 février (`8b739ae3`).
- **Correctif attendu** : déclarer `doitRegenerer` en tête de `genererMappingAnonyme` (`:279`). Vérifie la portée réelle avant d'écrire — le rapport propose `let doitRegenerer = false;`, pas plus.
- **Source ou stock ?** Réponds-y dans le commit : le plantage empêche-t-il seulement la lecture, ou a-t-il pu laisser un mapping partiel écrit chez quelqu'un ? Si du stock reste, **ne le répare pas** — mesure-le, écris-le, et remonte-le.

### 2 · CM-2 — « Annuler » vide l'onglet Suivi, et le bouton « Rapport » disparaît

- **Ce que l'utilisateur voit** : dans la saisie des présences, « Annuler » laisse une zone blanche jusqu'au prochain clic d'onglet ; et dès qu'une date est choisie, le bouton « Rapport » n'est plus là — la modale du PDF des présences devient inatteignable.
- **Site** : `js/saisie-presences.js:2023` (`data-param="suivi-apercu-legacy"`, sous-section qui n'existe pas — `config.js:62-69` en liste six : groupe, liste, saisie, profil, interventions, animation) et `restaurerCompteurPresences` (`:2007`), qui reconstruit la barre sans le bouton « Rapport » de `index.html:8003`.
- **Correctif attendu** : viser une sous-section qui existe, et rendre « Rapport » dans la barre reconstruite. **Le choix de la cible d'« Annuler » est à toi** (le rapport suggère `suivi-liste` ou `suivi-groupe`) — dis en une ligne laquelle tu as prise et pourquoi.
- La mesure S-5 du banc d'audit rougit sur la mutation : garde-la comme sentinelle.

### 3 · CM-3 — Le titre et la description d'une intervention entrent bruts dans la page

- **Règle 1 de `CLAUDE.md`, non négociable.** `js/interventions.js:363` (titre, dans l'innerHTML de la liste), `:793` (description, dans le `<textarea>`), `:780` et `:824` (attributs). Le formulaire, lui, échappe déjà (`:735`) — c'est le motif corrigé pour `observations` en #733, six lignes plus bas.
- **Correctif attendu** : `echapperHtml` sur les quatre sites, et étendre la sentinelle de #733 plutôt que d'en écrire une neuve.

### 4 · CM-4 — Le nom et le prénom entrent bruts dans la modale du tirage au sort

- **Règle 1.** `js/boite-outils.js:387` (`${e.nom}, ${e.prenom}`), `:891` (texte de question), `:829` et `:962` (nom de catégorie). Les treize autres injections du module sont échappées : c'est la seule nominative qui ne l'est pas, **et cette modale est projetée en classe**.
- **Correctif attendu** : `echapperHtml` sur les quatre sites, une sentinelle.

### 5 · CM-5 — Confirmer un import CSV écrit les élèves puis lève, sans confirmation

- **Ce que l'utilisateur voit** : il confirme l'import, rien ne dit « N étudiant(s) importé(s) », et il ne sait pas si ses élèves sont entrés. **C'est le premier geste des collègues le 14.**
- **Site** : `js/trimestre-v2-etudiants.js:801` — `etudiants` est le paramètre du `reduce` refermé à `:785` ; sous `'use strict'`, `ReferenceError: etudiants is not defined` **après** l'écriture.
- **Correctif attendu** : utiliser `verification` (`:789`), déjà calculé et inutilisé. Vérifie qu'il compte bien ce que la notification annonce (il lit `cleEtud` en entier, pas le lot importé) — si les deux nombres diffèrent, c'est le libellé qu'il faut ajuster, pas la mesure.

### 6 · CM-6 — Enregistrer une intervention efface ce qui n'était pas affiché

- **Ce que l'utilisateur perd** : décocher un élève **détruit sa note d'intervention** ; et ouvrir une intervention rattachée à un autre groupe-cours puis l'enregistrer sans rien toucher **retire tous ses participants et leurs notes**. Sans avertissement, par un geste ordinaire.
- **Site** : `js/interventions.js:1277-1283` (`notesIndividuelles` reconstruit à partir des seuls cochés) et `:1224` (`etudiants` réécrit avec les seuls cochés du groupe courant).
- **Correctif attendu, en deux temps** :
  1. **Le garde-fou, qui vaut quelle que soit la règle** : fusionner `notesIndividuelles` au lieu de le remplacer (conserver les DA que le formulaire n'a pas affichés), et ne pas réécrire `etudiants` avec les seuls cochés du groupe courant. **Ne jamais détruire ce que le formulaire n'a pas montré.**
  2. **La règle de Grégoire** : une intervention appartient à un groupe-cours. Mesure d'abord ce que le code en fait aujourd'hui (une intervention porte-t-elle un `coursId` ? la liste filtre-t-elle par groupe-cours actif ?) et **rapporte-le sans l'implémenter dans ce lot** si ça dépasse le garde-fou — c'est alors une ligne à inscrire, pas un élargissement.
- **Source et stock, celui-ci en a les deux.** Le correctif tarit la source ; **les notes déjà effacées chez Grégoire ne reviennent pas**. Mesure si son trimestre actif porte des interventions dont les participants ont été rognés, écris ce que tu trouves, **et n'écris rien dans ses données** : ça remonte à lui.

## Les règles de la séance

- **Une seule livraison à la fin**, pas six. Rituel `/fin-de-session` puis `release-et-changelog` ; `patch`, pas `minor` — ce sont des correctifs.
- **Chaque correctif porte au moins une sentinelle** qui rougit sur la mutation (break-test, puis restauration à empreinte identique). C'est la preuve exigée, pas les tests verts.
- **Ne dépasse pas les six.** Toute trouvaille en chemin prend une des trois issues de `CLAUDE.md` et tu la NOMMES dans ton rapport ; le défaut est « inscrire et continuer ». Ce que tu viens d'écrire toi-même, tu le finis : ce n'est pas une trouvaille.
- **Ce qui remonte à Grégoire** : sa didactique, ses données réelles, les mots que ses élèves et ses collègues liront, ce qui l'engage publiquement. **Le reste, tranche-le seul et dis en une ligne ce que tu as supposé.**
- `js/config.js`, `js/navigation.js` et `noms_stables.json` restent des zones protégées.
- Vitest se lance **depuis `tests/`**. Le hook pre-push ne juge pas Playwright : commit, relecture, **puis** verdict, **puis** push.

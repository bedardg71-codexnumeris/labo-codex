# Consigne suivante — le choix d'échelle de l'assistant de pratique (#910)

> Écrite le 19 septembre 2026 à 8 h 02, déposée à 9 h 37 (Toronto), par Cowork. **Proposée**, relayée par Grégoire quand il l'aura dit.
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` montre `81ae1e03` ou plus récent. `main` local porte `5fcd7e5e` (relais du 19, docs) d'avance : ce n'est pas un blocage, il partira avec ce lot. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-19-specs-second-essai.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> ⚠ **Arbre partagé** : à l'écriture, quatre fichiers modifiés ne sont ni à toi ni à ce lot – `js/interpretation-config.js`, `.claude/skills/ecosysteme-classe/SKILL.md`, le CADRAGE du 17 au soir et la RELECTURE du 17 (travail du dossier 101-102, en cours ailleurs). **N'y touche pas, ne les commite pas** ; indexe par chemins nommés, comme ce matin. Si `js/interpretation-config.js` bouge encore pendant ton verdict, dis-le avant de pousser.
> **Identifiant** : aucune fiche neuve attendue. Si tu en inscris une, relis « Dernier ID utilisé » sur `main` (#922 à l'écriture) et `grep` les deux registres.
> **Ce lot ne demande rien à Grégoire avant le push**, sauf la phrase de « Nouvelles » (§ 6). Aucun arbitrage, aucun écran à vérifier chez lui. S'il en fallait un, c'est un arrêt (§ 4).

---

## 1 · Ce que Grégoire verra

Dans l'assistant de pratique, la liste « échelle » propose les mêmes échelles que l'éditeur de pratique et que la question d'adoption du lot 34 : celles qui sont dans la bibliothèque. Une échelle qu'il a retirée de la barre latérale n'y paraît plus, sauf si c'est celle que la pratique ouverte utilise déjà. Rien d'autre ne change à l'écran.

## 2 · Ce que Cowork a mesuré (19 sept., 8 h, lecture de `main` à `80661049` ; `js/` inchangé depuis, vérifié à 9 h 37) – à remesurer avant de coder

- `js/wizard-pratique-v2.js`, `genererSelectEchelle` (≈ l. 1737), un seul appelant vivant (`case 'select-echelle'`, ≈ l. 1416) :
  - `${e.nom || 'Sans nom'}` est écrit dans le gabarit **sans `echapperHtml`**, alors que `e.id` l'est sur la même ligne. Règle de sécurité n° 1 de `CLAUDE.md` : un nom d'échelle peut venir d'un partage importé ; la CSP bloque le script, pas l'injection de balises.
  - La liste lit `db.getSync(cle('echellesTemplates'), [])` **sans** le filtre `dansBibliotheque !== false` que portent l'éditeur (`chargerDropdownEchellesMat`), `accompagnement.js` (l. 520) et, depuis le lot 34, `obtenirEchellesOffertesAdoption` (`pratiques-bibliotheque.js`, ≈ l. 881).
- **Le piège, trouvé en préparant la consigne** : `restaurerValeursEtape` (≈ l. 2440) remet la valeur par `element.value = wizardState.reponses[champ.id]`. Si l'échelle d'une pratique existante est retirée de la bibliothèque et que le filtre l'écarte, **l'option n'existe plus, le `<select>` retombe sur « -- Sélectionner une échelle -- », et la pratique rouverte perd son échelle en silence** à l'enregistrement. Le filtre seul serait une régression sur ses données.

## 3 · Ce qui est attendu

1. **Échapper le nom** : `echapperHtml(e.nom || 'Sans nom')`. Un essai qui rougit sur le code actuel (un nom portant `<b>` ou `"><img …>` rend du texte, pas une balise).
2. **Filtrer comme les autres** : réutilise le prédicat existant plutôt qu'une quatrième copie. `obtenirEchellesOffertesAdoption` fait exactement ce filtre ; si le lire depuis l'assistant crée une dépendance de chargement douteuse (ordre des scripts dans `index.html`), tranche toi-même où vit le prédicat commun et dis-le en une ligne. Zéro-dette : pas de filtre de plus écrit à la main.
3. **Garder l'échelle déjà choisie** : si `wizardState.reponses.echelleId` désigne une échelle retirée de la bibliothèque, elle reste dans la liste et reste sélectionnée. **Sans libellé neuf** (pas de « (retirée) ») : un mot neuf remonterait à Grégoire. Si elle n'existe plus du tout dans `echellesTemplates`, le comportement actuel ne change pas : ce n'est pas ce lot.
4. **L'état « aucune échelle »** : la branche `echelles.length === 0` se juge APRÈS le filtre (sinon une bibliothèque où tout est retiré montre une liste vide au lieu du message). Le message existant ne change pas d'un mot.

## 4 · Arrêts

- Si garder l'échelle déjà choisie exige un mot neuf à l'écran pour être compréhensible : **arrête-toi avant ce volet**, livre les volets 1, 2 et 4, et remonte la question à Grégoire par Cowork avec le texte que tu proposerais.
- Si un chemin réel (pack démo, bancs, parcours WebKit) montre une pratique dont l'échelle choisie est retirée ET dont la réouverture doit se comporter autrement qu'au § 3.3 : arrête-toi, quel que soit le stock.

## 5 · Preuve

- Une sentinelle Vitest sur `genererSelectEchelle` par sa vraie fonction (pas par expression régulière sur le source) : nom échappé ; échelle retirée absente ; échelle retirée mais choisie présente ET sélectionnée après `restaurerValeursEtape` ; bibliothèque vide après filtre → message.
- **Mutations** à poser et à voir rougir : retirer l'`echapperHtml` ; retirer le filtre ; filtrer AUSSI l'échelle choisie (la mutation du piège) ; juger le vide AVANT le filtre. Pose au moins une mutation qui garde le texte exigé et change le calcul.
- Respecter `sentinelle-648-supprimer-une-echelle-est-la-remplacer` et `sentinelle-577-assistant-reperes-echelle`, qui lisent ce même champ.
- Le parcours de l'assistant existe en WebKit : fais-le passer. **Aucune porte terrain** : une machine répond à tout, et rien n'est irréversible.

## 6 · Livraison

- **Stock** : source seulement, rien n'est écrit dans les données. À dire tel quel.
- Patch (`1.146.9` attendu). **Entrée de « Nouvelles »** : le changement se voit. Propose la phrase à Grégoire par Cowork AVANT le push ; ne la pose pas sans son accord.
- Coche **#910** dans le même commit que le code.
- Fichiers de Cowork à commiter avec le lot : cette consigne renommée et l'archive de la précédente. Rien d'autre de l'arbre partagé.
- Verdict par `scripts/pousser.sh` (la garde de charge s'applique), push sur demande de Grégoire.

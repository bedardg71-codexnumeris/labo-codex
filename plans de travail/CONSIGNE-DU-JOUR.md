# Consigne suivante – un seul palier d'intervention (lot 31 : lot C du dépistage, #744, #822)

> Écrite le 17 septembre 2026, 10 h 12 (Toronto), par Cowork, après le push de 1.142.26.
> **Condition de départ** : `git log origin/main` (pas `git log`) doit montrer `1.142.26` (`38f3a8b5`) ; sinon, arrête-toi et signale-le. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-carte-completion.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.

Mandat : le lot C de `plans de travail/CADRAGE-2026-09-16-regles-du-depistage.md`. Règles tranchées par Grégoire le 16 au soir, mots choisis le 17 au matin : **aucune question ne l'attend**, sauf la phrase de « Nouvelles » et toute phrase de l'Aide que tu réécrirais.

## 1 · Un seul palier : la carte RàI (#744)

- **Règle** : la carte RàI (`determinerNiveauRaiPedagogique`) donne SEULE le palier d'intervention, partout. Le suivi des fondations (`diagnostiquerSuiviApprentissage`) décrit la persistance (IPB × direction) et ne rend plus de palier.
- **Mot, tel quel** : le diagnostic « IPB = 1, direction → ou ↘ » devient **« Difficulté récente »**. Le pattern de la carte RàI (P < 75 % et un défi) garde **« Difficulté émergente »**.
- **Sites relevés par Cowork `[lecture]`, à remesurer** (`grep -rn` sur `niveauRaI`, `suivi`, « Difficulté émergente ») :
  - `profil-etudiant-calculs.js` : `diagnostiquerSuiviApprentissage` (~1210, le champ `niveauRaI`) ; `determinerCibleIntervention` (~2132 : `niveau: suivi.niveauRaI` – c'est « la cible suit le second » de la fiche) ;
  - `tableau-bord-apercu.js` : filtres « Suivi » (`ipb < 2`) et « RàI 2-3 » (`e.niveau`, ~340-360 : d'où vient `e.niveau` ?), le bilan `genererInterpretationSuiviFondamentaux` (~1434, compte « Difficulté émergente ») ;
  - `index.html` (~10200), Aide « Comment interpréter les diagnostics ? » : le tableau porte une colonne « Niveau RàI » et la ligne « Difficulté émergente ». Il y manque aussi la ligne « ≥ 3 ↗ Progression lente » que le code rend – à vérifier contre ce que le code rend ;
  - à CLASSER, lequel des deux diagnostics ils lisent : `etudiants.js` (~1027, ~1601), `profil-etudiant-helpers.js` (~1044), `guides-pedagogiques.js` (~198). Seuls ceux qui lisent le suivi changent de mot.
- ⛔ **Arrêt** : si, pour un élève, la carte RàI ne rend AUCUN palier là où le suivi en rendait un (chemin réel, quel que soit le stock), arrête-toi avant de coder ce cas et rapporte le chemin : la page du 16 ne l'a pas vu, il remonte à Grégoire.
- **Stock** : mesure si un palier est ÉCRIT quelque part (intervention enregistrée, relevé hebdomadaire). S'il l'est, il garde sa valeur : dis-le, n'y écris rien.

## 2 · Le palier « Insuffisant » retiré (#822)

- `qualifierContexteApprentissage` (`contexte-qualification.js`, ~308-318) : la branche « Insuffisant » est inatteignable (mesuré le 10 sept.) ; retire-la avec ce qui n'a plus de lecteur (`badge-engagement-insuffisant` de `styles.css`, et `BORNE_FIXE_INSUFFISANT` ~440 si plus rien ne le lit – mesure).
- **Aucune borne ne bouge** (gel d'octobre, #742) ; l'échelle affichée reste celle d'aujourd'hui. Les mots des autres bandes ne se touchent pas (#821, orthopédagogue).

## 3 · Un brouillon ne lève pas de signalement (tranché par Grégoire le 17 au matin)

- `SignalementDepistage._evaluationActive` (`js/entites/signalement-depistage.js`, ~44) ne lit pas la règle unique : fais-la lire `evaluationEntreDansLaNote`. **Inscris une fiche** (complément du lot A), livrée dans ce lot.
- ⚠ Les trois sentinelles #790 (dont `sentinelle-790-production-diagnostique-quatre-portes`) interdisent d'y appliquer le filtre des quatre portes : `evaluationEntreDansLaNote` ne filtre pas les diagnostiques, il devrait être compatible – **à remesurer**, pas à supposer.

## 4 · Au passage, sans mot

- **Trou de preuve de la relecture du lot 29** (en tête de la section 1.142.25 de `RELAIS.md`) : aucun essai ne place une note SUR le seuil du verrou ; la mutation `comparateur: '<'` → `'<='` (assistant) reste verte. Ajoute au banc de l'audit un cas « note = seuil → non plafonnée » et vérifie que la mutation rougit.
- **Ligne à poser sous #903, telle quelle** : « **Ajout du 17 sept. (relecture croisée du lot 29, Cowork)** : le verrou a le même défaut d'origine. Le nom de l'évaluation verrouillée est un texte libre que rien ne rapproche des titres des productions ; « Dissertation » contre « Dissertation finale », ou une production renommée, laisse le verrou sans effet et sans message. Aucun symptôme vécu ; à traiter avec la décision de #903. »
- **Les deux trous de preuve du lot F** : ce lot traverse `tableau-bord-apercu.js`. Dans `sentinelle-lot-F-860-828-les-ecrans-du-groupe`, un élève dont le nom contredit l'ordre d'urgence attendu, et la boucle `['P', 'A']` complétée par `'C'`. La mutation « meilleur indice au lieu du pire » doit rougir.

## Preuve

- Sentinelle du lot : un élève IPB = 1 (une seule copie sous le seuil) dont la carte RàI dit un autre palier – la cible d'intervention, les filtres et le bilan suivent la carte ; le suivi écrit « Difficulté récente » ; aucun site ne lit plus `suivi.niveauRaI`. « Insuffisant » absent du code. Un brouillon sous le seuil ne lève aucun signalement ; la même copie enregistrée en lève un.
- Break-test : la cible relit le suivi ; un site garde l'ancien mot ; `_evaluationActive` sans la règle unique. Des essais de COMPORTEMENT (erreur 16 de Cowork : une mutation qui garde le texte exigé et change le calcul doit rougir).
- Vitest depuis `tests/`, puis le verdict Playwright, Cowork fermé. **Porte terrain : aucune attendue** (aucun écran ne change de taille).

## Livraison

Patch `1.142.27` par `scripts/release.mjs`. **Phrase de « Nouvelles », et toute phrase réécrite dans l'Aide** : propose-les à Grégoire avant de les figer. Puis `OU-EN-EST-ON.md`, `RELAIS.md`, le backlog (#744, #822 et la fiche du brouillon), le cadrage (lot C livré), le markdown du tri. **Commite aussi les fichiers de Cowork** : la consigne renommée et son archive, et l'ajout de Cowork en tête de la section 1.142.25 de `RELAIS.md` (relecture du lot 29). Push par `scripts/pousser.sh`, puis signale à Cowork que c'est poussé.

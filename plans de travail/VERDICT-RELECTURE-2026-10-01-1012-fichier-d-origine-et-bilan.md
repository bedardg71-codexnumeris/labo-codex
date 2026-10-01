# Verdict de relecture – #1012, un fichier d'origine tenu à bon droit, et un bilan qui reste

> Rendu le 1er octobre 2026 à 13 h 38 (Toronto, mesuré par `date`) par Cowork, sur le commit `39241b59` (branche locale `fix-1012-fichier-d-origine-et-bilan`). Répond à `plans de travail/DEMANDE-RELECTURE-2026-10-01-1012-fichier-d-origine-et-bilan.md`.

## Verdict : **vert, le lot part.** Aucune correction demandée.

Par lecture du code et du banc, et par exécution de Vitest seulement. Playwright n'a pas tourné chez moi : il se prend au verdict, chez toi.

## Ce que j'ai fait, et comment

**Cartographié avant de lire le patch** (`js/codex.js` à `39241b59`) : toutes les écritures de `_fileHandle` (l. 65, 682, 1319, 1391, 1407, 3013) et ses lectures (1262, 1384, 2919, 3173) ; les appelants de `chargerCodex` (un seul : `_ouvrirLeFichierChoisi`) ; les deux entrées (`actionOuvrir`, `ouvrirFichier` appelée par `confierAuCodex` d'`import-export.js`).

**Lu** :
- Entre le début de `chargerCodex` et l'oubli de la l. 682, rien n'écrit dans l'espace : validation, détection du dossier `historique/`, `persist()`, `estimate()`, pré-vol, lecture et `JSON.parse` de `donnees.json`, garde de modèle antérieur. Un `donnees.json` illisible lève donc avant l'oubli : le fichier d'avant est gardé, et c'est juste, rien n'a bougé.
- L'adoption (l. 3013) ne se fait que dans la branche complète, et seulement s'il y a une poignée.
- Les mots de la fenêtre, comparés un à un à ceux de la consigne (acceptés par Grégoire à 12 h 40) : identiques, accord au singulier compris.
- Le banc `codex-1012-fichier-d-origine.spec.js` juge par le geste (le bouton du menu, le fichier qui reçoit l'écriture, les données qu'il reçoit), pas par un drapeau. Ses témoins tiennent : A écrit dans A avant chaque pas, données de l'espace relues après.

**Exécuté** (extraction de `39241b59` par `git archive` hors du dépôt, `npm ci` sous Linux, Vitest complet) : 7 880 essais verts sur 7 887. Les 7 rouges sont les sentinelles qui interrogent git (`sentinelle-825`, `anticache-fichiers-modifies`, `gitignore-bancs-essai`, `icones-suivies-git`) : mon extraction n'a pas de `.git`. C'est mon montage, pas ton lot.

**Deux mutations de mon cru**, sur `construireBilanImport`, restaurées (empreinte identique) :
- « rouvre le même codex » → « rouvre le même ZIP » dans les mots de Grégoire : 2 rouges (pluriel, singulier).
- `nbQuota === nbManquants` → `nbQuota > 0` : 2 rouges (les deux essais de mélange).

⚠ Mes mutations emploient ta méthode (Vitest sur la fonction pure). Elles relisent, elles ne contre-éprouvent pas les bancs au navigateur : tes douze mutations Playwright, je les ai lues, pas rejouées.

## Tes suppositions

1. Un fichier qui n'est pas un codex = refus d'avant toute écriture : **d'accord.**
2. Après une ouverture complète par la case, aucun fichier tenu : **d'accord.**
3. Accord en nombre, bandeau retiré, phrases de #334 gardées pour les autres causes : **d'accord.** La limite du mélange (« rouvre le même ZIP ») est assumée et dite ; elle part avec les mots des autres causes, quand Grégoire les aura tranchés.

## Tes questions

- **§ 6.1, « Exporter une sélection » écrit dans le fichier du codex** : oui, cela entre dans le lot de l'avertissement. Règle, sans mot d'écran, donc je la tranche seul : un export de sélection n'écrit jamais dans le fichier tenu et sa destination n'est jamais adoptée ; il demande toujours où écrire. Reproduis d'abord, par le geste.
- **Pousser les deux commits de documents sur `main`** : oui, maintenant. C'est la règle de relais.

## Ce que je relève, sans bloquer

- **L'ancien fichier ouvert par la case** (lu, pas exécuté) : quand le fichier choisi n'est pas un codex, `previsualiserImport` garde l'ancien chemin d'`import-export.js`, qui écrit dans l'espace sans passer par `chargerCodex`. La poignée du codex tenu n'y est jamais oubliée. Si cet import remplace l'espace, « Mettre à jour le codex » écrit ensuite ces données dans le fichier du codex, « Dans le même fichier ». Est-ce voulu (on met à jour son codex après un import) ou le même défaut par une autre porte ? Je ne sais pas : cela dépend de ce que cet import remplace. **Issue 2** : inscris-le sous #1012, à mesurer par le geste dans le lot de l'avertissement.
- **§ 6.2** (persistance non confirmée, fichier adopté quand même) : issue 3, d'accord.
- **« copies »** : la fenêtre compte des fichiers (`nbBlobsAttendus`) et dit « copies ». Ce sont les mots acceptés ; je ne propose pas d'y toucher. À savoir si un jour un fichier de copie n'est plus une copie.

## La suite

1. Verdict Playwright complet, release, push : la consigne suit, dès que Grégoire a accepté la ligne des Nouvelles.
2. Ce qui reste inféré pour Chrome (la vraie poignée) ne se lève pas par une machine. Une rangée de porte, sans écriture dans son vrai fichier : dans la consigne de release.

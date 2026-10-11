# Demande de relecture – lot 13 : la documentation

> Claude Code, 11 octobre 2026, ≈ 14 h (mesuré par `date` en cours de lot). Consigne : `CONSIGNE-DU-JOUR.md`, enchaînement des lots 10 à 13 (Cowork, 13 h 32).
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Rien dans `js/`, sauf le commentaire d'`index.html` qui renvoyait à `ordre-chargement.txt`. Vitest complet vert (723 fichiers, 8 585 essais).
> Motif gardé en tête (consigne) : quelqu'un qui reprendrait le code doit pouvoir se fier à la documentation (rencontre du 23 sept. avec le service informatique).

## 1 · Fiche par fiche

| Fiche | Commit | Ce qui change |
|---|---|---|
| #989 | `4372ba7f` | `ECOSYSTEME-DONNEES.md` : l'anonymisation du codex data est « prévue, non codée ». Ce document disait aussi « le concept n'existe pas encore » : faux, extraire et charger sont codés. Même mention au skill `securite-donnees` § 3.2 (« la cible, pas l'état »). |
| #476 | `a9c52f56` | La ligne « ⏳ DÛ PAR GRÉGOIRE » de la réparation devient « sans objet » (relevé du 26 août : dry-run à 0 copie). |
| #804 | `48721474` | `docs/modules/pratiques.md` est remplacé par un renvoi juste. Skill `labo-codex` § 5 corrigé. Skill `pratiques-notation` § 5 et § 10 corrigés. Encart « schéma réel » sur la spécification archivée. Deux documents archivés. |
| #471 + #629 (doc) | `fa3b36fe` | Inventaire SSOT régénéré. **Annexe de 83 clés non déclarées** dans `DATA-OWNERSHIP.md`, dont `planification_seances` (#629). Ligne `cartouches_[grilleId]` corrigée (globale → namespacée). Verdicts D1 et D2 écrits avec leur état. |
| #471 | `646fba22` | `ordre-chargement.txt` retiré (49 lignes pour 203 scripts). Bandeau « périmé » sur `evaluations-productions.md`, `trimestres.md` et `pattern-bibliotheque-assemblage.md`. |

## 2 · Trois corrections que l'audit n'annonçait pas

- **Labo-codex § 5** : l'audit du 16 sept. demandait de retirer « Seuils critiques » des modes de Standards. En remesurant, #435 (9 août) a retiré **les quatre** modes « par objectifs » (comptage, moyenne pondérée, seuils critiques, holistique). Le § 5 le dit maintenant ; il n'en annonce plus trois.
- **DATA-OWNERSHIP** : la ligne des cartouches disait « G ». Elles sont namespacées depuis D1, et leur migration tourne au démarrage (`main.js`).
- **ECOSYSTEME-DONNEES** : « concept nouveau, n'existe pas encore » était faux pour le codex data. Le document dit maintenant ce qui est codé et ce qui ne l'est pas.

## 3 · Ce qui n'est pas fait, et pourquoi

- **Les tables déclarées de `DATA-OWNERSHIP.md`** (propriétaires, contourneurs du 22 mai) ne sont pas réécrites. Déclarer un propriétaire pour 83 clés n'est pas relisible d'un coup. L'annexe les montre comme **inventaire**, sans propriétaire déclaré, et l'en-tête le dit.
- **Les bandeaux « périmé »** reprennent les écarts mesurés par l'audit du 20 août (CO-30, CT-25). J'en ai remesuré deux (`js/entites-ui.js` absent, `journeesSansCours` présent), pas tous.
- **Compacter le § 12 du skill `pratiques-notation`**, et **l'aide contextuelle du Comparateur** (des mots, donc à Grégoire) : restent dans #804.
- **#805** (ancrer le skill dans le rapport PAREA) reste sa propre fiche.

## 4 · Trouvaille, issue 3 (commenter et oublier)

L'assistant (`wizard-pratique-v2.js`, ≈ 1973) garde des libellés de variante pour les modes retirés par #435 (« Seuils critiques », « Comptage d'objectifs »…). Ils ne s'affichent que si une pratique stockée porte encore cette variante. Sans conséquence observable : laissé.

## 5 · Ce que j'ai supposé – une ligne chacune

- Les deux documents archivés (`Rapport - Flux de configuration (0207).md`, `aide-contextuelle-contenu-revue.md`) ne sont cités que par des rapports historiques : je n'ai pas réécrit ces liens.
- `scripts/audit-ssot.json` garde des chemins absolus (`/Users/…`), comme avant : c'est la sortie du script, pas une donnée d'élève.

## 6 · Item de Nouvelles proposé

Aucun. C'est de la documentation interne, sans effet à l'écran.

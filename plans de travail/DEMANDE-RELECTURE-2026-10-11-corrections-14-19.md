# Demande de relecture – corrections des lots 14 à 19

> Claude Code, 11 octobre 2026, 17 h 38 (mesuré par `date`). Verdict de Cowork (17 h 29), `CONSIGNE-DU-JOUR.md`.
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert (744 fichiers, 8 686 essais). Deux specs Playwright lancées seules (§ 2).

## 1 · Ce qui change pour l'usager

- Les indices C et P d'un groupe nombreux sont de nouveau écrits dans IndexedDB, donc dans le codex, à chaque recalcul (#1040, bloquant).
- Évaluation : le menu des échelles redevient ce qu'il était avant le lot 14 (#580 retiré).
- Après un import, la phrase « décoche Masquer… » ne paraît que dans une bibliothèque qui a cette case, et seulement quand elle est cochée. Productions et Pratiques se taisent ; les grilles gardent leur phrase d'avant (#793).
- Supprimer un critère n'affiche plus « Grille enregistrée : … % » (#483).
- Suppression d'un trimestre : le bouton « Supprimer » de la ressaisie du nom est rouge, comme celui de la question (#1037).

## 2 · Correction par correction

| N° | Fiche | Commit | Geste | Vérification |
|---|---|---|---|---|
| 1 (bloquant) | #1040 | `a6753d01` | `setSyncSiChange` écrit quand on lui repasse l'**objet même** que `getSync` a rendu (au-delà de 25 Ki, par référence depuis `memoryCache`) ; même règle dans le défaut du harnais | essai par le **vrai `db.js`** : valeur de 30 Ki posée en `memoryCache`, lue, modifiée en place, repassée → écrite ; une copie égale reste sautée ; 1 mutation rouge |
| 2 | #580 | `5f639758` | `6f48c2ae` retiré par `git revert` (code, banc #580, ajustement du banc #939) ; jeton anti-cache reposé | bancs d'évaluation verts (29 fichiers) |
| 3 | #793 | `edbc5b05` | la case est lue **dans la modale redessinée** (`.biblio-toggle-deja-present input`), plus la préférence commune ; sans case, ou case décochée : rien. Les grilles gardent leur phrase générique (`repliFiltre`), seules | 2 mutations rouges ; spec `import-grilles-conduit-a-la-carte` lancée seule : 2 verts |
| 4 | #483 | `f4b0bf68` | avertissement si `!silencieux && !appliquer` : « Sauvegarder la grille » et `sauvegarderGrilleComplete` ; la suppression d'un critère passe une modification et se tait | essai sur la suppression d'un critère ; 1 mutation rouge |
| 5 | #980 | `b4ece530` | tous les arguments non-options sont lus : le premier est le dépôt, chacun des suivants doit désigner la branche courante (source : branche ou `HEAD` ; destination : branche ou `HEAD`) ; `+ref` compris | 16 cas, dont `origin --force lot-x` et `origin main lot-x` refusés, `origin HEAD` accepté ; 3 mutations rouges |
| 6 | #1037 | `491bda42` | `demanderSaisie` accepte `variante: 'danger'` (bouton `btn-supprimer`) ; la ressaisie du nom l'emploie ; spec 1007 : 60 s pour la première question | 2 mutations rouges ; spec 1007 (X1) lancée seule : 3 verts (43,7 s) |
| mineurs | #663, #469, #679, #784 | `cdf99efb` | branche du partage de #663 retirée avec ses deux essais ; `pratique-notation-v2.js` retiré du banc L0 et de `audit-innerhtml.sh` ; un témoin positif sur dépôt fabriqué pour #679 et #784 | les deux témoins rougissent sous mutation du détecteur |

## 3 · Ce qui revient à Grégoire — à écrire dans #580

Le garde-fou BACKLOG m'a déjà refusé l'écriture (mémoire du 2 oct.) : voici le texte dû, à poser par Cowork.

> **#580 (11 oct. 2026, lots 14 à 19) : la correction est RETIRÉE (`6f48c2ae` → `5f639758`).** Faire passer les menus de l'évaluation par `obtenirEchelleResolue` leur faisait reconnaître `idOriginal`, alors que le calcul (`evaluation-calcul.js` ≈ 1437) et la garde d'enregistrement (`evaluation-chargement.js` ≈ 2059) lisent l'id exact : une évaluation désignant une échelle par son ancien id voyait ses niveaux sans pouvoir être notée ni enregistrée. Aligner aussi le calcul ferait apparaître des notes sur des évaluations d'A2025 ou d'H2026 restées « -- », trimestres qui ne sont pas rouverts. **Décision de Grégoire** : aligner les trois (et accepter ces notes qui apparaissent), ou laisser les listes blanches.

## 4 · Mineurs, écrits ici (sans code)

- **#586** : retirer `idOriginal` aux copies aveugle, pour les copies **futures**, `_sonder574` (`echelles.js` ≈ 444) et `estVisee` (`echelles-bibliotheque.js` ≈ 188), qui reconnaissent un gabarit par son `idOriginal`.
- **#1040** : la recopie d'une petite clé restée seulement dans localStorage n'a plus lieu à l'ouverture (la valeur égale n'est plus réécrite, donc plus envoyée vers IndexedDB) ; accepté par Cowork.
- **#633** : « Fermer » juste après une frappe, sans quitter le champ, peut perdre le titre (garde `productionEnEdition !== id`) ; la fenêtre est étroite et existait déjà par `u-hide`.
- **#1040, reste nommé** : la garde ne voit que la **même référence** en tête. Un appelant qui repasserait une copie superficielle dont un sous-objet partagé avec le cache a été modifié en place serait encore sauté. Aucun site mesuré ne le fait aujourd'hui (`indicesCP`, `patternsGroupe` et `indicesAssiduite` reconstruisent leurs sous-objets).

## 5 · Ce que j'ai supposé – une ligne chacune

- #793 : les grilles gardent la phrase générique, qui n'est pas neuve chez elles (8 sept., filtre démo, éprouvée par leur spec) ; c'est l'unique `repliFiltre`.
- #483 : « explicite » = pas de modification passée à `sauvegarderGrilleTemplate` ; s'il naît un geste explicite qui en passe une, il faudra un drapeau nommé.
- #980 : `origin --force` reste accepté, mais parce qu'aucune référence n'est nommée (git pousse la branche courante), plus parce que le 2ᵉ argument est une option.
- #580 : le banc #580 part avec le retrait ; le banc #939 retrouve son harnais d'avant.

## 6 · Item de Nouvelles

Inchangé pour les lots 14 à 19. Pour le lot 14, retirer « la même résolution » de toute phrase qui en parlerait.

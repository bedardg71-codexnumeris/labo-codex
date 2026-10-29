# Consigne – Poser les textes du guidage de la démo et de la fenêtre « Données démo » (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 8 h 03 (Toronto, mesuré par `date`), sur `main` = `2d5a5711` (non poussé). Ne remplace aucune autre consigne. **À lancer après le lot des jetons par défaut** (un seul lot qui écrit à la fois).
> Les textes : `plans de travail/TEXTES-2026-10-28-guidage-demo.md`, **validés par Grégoire le 29 oct. de 7 h 53 à 8 h 03, groupe par groupe, à poser mot pour mot** (section « Validations de Grégoire » en fin de fichier ; le bloc 4 dans sa version ↻).

## 0. Avant tout

- Rituel de début de session ; aucune suite qui tourne.
- Commit de docs seul : ce fichier, `TEXTES-2026-10-28-guidage-demo.md` (relecture de Cowork et validations ajoutées), `CONSIGNE-LOT-2026-10-29-jetons-par-defaut.md` s'il n'est pas encore commité.
- **Zones protégées** : `js/navigation.js` n'est pas touché (l'appel `afficherGuidageDemo(idSousSection)`, `:674-675`, suffit) ; `js/config.js` non plus.

## 1. Le mandat

1. **Les bulles** (`js/guidage-demo.js`, `GUIDAGE_TEXTES`) : les 17 textes « APRÈS » validés, titre et texte, mot pour mot. La bulle 1 change de clé : `apercu-contenu` → `suivi-groupe` (`index.html:7377`). La bulle 5 (`suivi-apercu-legacy`) part. **À mesurer** : la bulle de `suivi-groupe` s'affiche bien quand la démo s'ouvre sur Suivi du groupe (l'ouverture passe-t-elle par l'appel de `navigation.js:674-675` ?). Si elle ne s'affiche pas sans toucher `navigation.js`, arrête-toi et dis-le.
2. **La fenêtre « Données démo »** (`js/accompagnement-contenu-popup.js:~1254-1293`) : le titre « Données démo » et les blocs 1, 3, 4, 5, 6, 7 validés ; le bloc 2 (G4, 7 oct.) ne bouge pas ; le `voirAussi` reste.
3. **Typographie** : les espaces avant « ; », « : », « ? », « ! » et à l'intérieur des « » deviennent insécables, comme dans le code actuel ; « 40 % » prend l'insécable (#1137) ; les « – » du bloc 4 sont des demi-cadratins. Aucun autre changement de mot.
4. **Hors périmètre, constaté par la session qui a écrit les textes** : les définitions du glossaire « Cartouche de rétroaction » (« automatiquement ») et « Niveau RàI » (« tableau de bord », « recommandée ») gardent des mots que les bulles abandonnent. Issue : *inscrire et continuer*.

## 2. Les tests

- **Une sentinelle neuve**, `tests/unit/sentinelle-guidage-demo-2026-10-29.test.js` : chaque texte « APRÈS » validé, **lu dans le fichier TEXTES** (pas recopié), paraît sous sa clé ; `apercu-contenu` et `suivi-apercu-legacy` n'existent plus ; chaque clé de `GUIDAGE_TEXTES` est l'identifiant d'une sous-section d'`index.html` ; les nombres cités (10, 11, 101, 32, 3, 2, 9, 17, 12) se recomptent dans le pack et dans `CARTE_DEMO_ALIGNEMENT`. Break-test, arbre restauré par sha256.
- Les sentinelles qui épinglent les anciens textes suivent par décision, en citant ce fichier.
- Un essai Playwright ciblé : la démo activée, Suivi du groupe montre la bulle « Suivi du groupe ». On attend l'élément, jamais `waitForTimeout`.
- Vitest depuis `tests/`.

## 3. Clôture

`BACKLOG.md` (#1152, le guidage de la démo) ; demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-29-guidage-demo.md`. Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.

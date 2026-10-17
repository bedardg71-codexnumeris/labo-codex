# Demande de relecture – « Apporter mon matériel », lot 3b1 (étape 2 du plan)

> Claude Code, samedi 17 octobre 2026, fin de matinée (Toronto). Consigne : `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3b1-visible.md`, via `CONSIGNE-DU-JOUR.md` (9 h 51). Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Un commit local, non poussé : `96812253`**, sur `4a972d13` (en ligne). Aucun push, aucune release, aucun verdict complet.

## Ce qui précède, fait dans la même session

- **Bandeau « En construction »** (`4d27a3af`) et **étape 1** (`4a972d13`, verdict du lot 3a : les puces retirées aussi de la description, en suite ET en colonne « Description du critère » — même fonction, une supposition de ma part) : **en ligne**. Vérification complète par `scripts/pousser.sh` (Cowork, Chrome, Safari fermés) : aucune rougeur, aucune spec au second essai ; déploiement Netlify `6ad38f7d`, `commit_ref` `4a972d13`, `ready`, publié à 15:08:55 Z. Numéro inchangé (1.202.0).

## État mesuré

- Vitest complet, depuis `tests/` : 767 fichiers, **9 047 essais, verts**.
- Banc neuf `tests/unit/materiel-lot3b1-visible.test.js` : 9 essais, **9 mutations, 9 rouges**, restaurées, vert après.
- Spec neuve `tests/integration/materiel-lot3b1-visible.spec.js` : 3 essais (grille, échelle, cartouche), **4 mutations, 4 rouges**. Les specs du matériel (lots 1, 2, 3a, bandeau, 3b1) lancées seules dans WebKit : 12/12. Ce n'est pas le verdict.
- Captures iPad (820 px), clair et sombre : le bloc et le bandeau lisibles ; la page ne défile pas de côté.

## Ce que j'ai fait, et ce que j'ai supposé

1. **Le bloc en lecture** (`grilles.js`, `rendreAttenduCritere` et deux sous-fonctions), sous la rangée de chaque critère qui en porte. **Ouvert, sans accordéon** (Grégoire, 11 sept.) : les niveaux en cartes côte à côte (grille `auto-fit`, 180 px), pour tenir la hauteur. Niveaux dans l'**ordre de l'échelle** ; un code qu'elle ne connaît pas suit, dans l'ordre écrit. Le mot « descripteur » n'y figure pas ; le champ « Descripteur » n'est pas renommé.
   - **Supposé** : un critère **algorithmique** ne répète pas ses sous-critères dans ce bloc ; ils ont déjà leur place, éditable, dans son gabarit.
   - **HTML inchangé** sans données : l'appel est collé au gabarit et rend `''` (essai H.a, mutation « une espace de plus » rouge).
   - La sentinelle #467 a refusé deux variables nues (65 → 67) ; découpé en deux fonctions plutôt que relever le compte.
   - **Aperçu hors de l'éditeur : aucun.** `afficherApercuGrilleSelectionnee` (`export-pdf.js`) vise `#zoneApercuGrille`, absent de `index.html`. Disposition : **commenter et oublier** (code d'autrui, sans conséquence observable).
2. **Les boutons de la confirmation** ouvrent l'objet créé par `ouvrirGrilleDepuisListe`, `ouvrirEchelleDepuisListe`, `ouvrirCartoucheDepuisListe` (aucune fonction neuve d'ouverture). Le résumé de création porte les trois identifiants.
   - ⚠ **Mesuré en route** : l'initialisation de chaque sous-section (`navigation.js`, `setTimeout` 100 ms — zone protégée, non touchée) redessine la liste APRÈS l'ouverture et efface la sélection. Correctif : `afficherListeGrilles` et `afficherListeEchelles` re-marquent l'objet ouvert quand l'éditeur est visible (2 lignes chacune). La cartouche le faisait déjà (`estActive`). Effet de bord voulu : la sélection survit aussi au redessin après une sauvegarde.
3. **Les deux textes « fichier d'origine »**, mot pour mot (`A-INCLURE-3b`, § 1).
4. **Survie, mesurée en lecture** (pas exécutée) : descripteurs et sous-critères **intacts aux six chemins** — modifier nom ou pondération (`grilles.js:4915`, champ par champ), changer le type, dupliquer (deux chemins, `bibliotheque-ui.js:458` copie profonde), Codex (`codex.js:485`, sans liste blanche), export/import d'une sélection (`import-export.js:962-987`), partage (`partage-schemas.js:312-345`). Une remarque, sans correction : à l'import d'une sélection, `echelleId` n'est pas rebranché si l'échelle change d'id par collision (`import-export.js:193-196`) ; le bloc retombe alors sur les codes, rien n'est corrompu. Disposition : **inscrire et continuer** — à toi de juger si elle monte.

## Trouvaille hors lot

Sur iPad, la rangée d'un critère (`critere-rangee`, grille fixe `2fr 140px 90px 150px 3fr`) écrase le champ « Nom du critère » (« Cor… », libellé sur quatre lignes) — visible sur la capture, antérieur au lot. Disposition : **inscrire et continuer** ; je ne l'ai pas inscrite au BACKLOG (aucun symptôme vécu par Grégoire à ce jour).

## Textes provisoires neufs (pour l'étape 7)

- « Ce qui est attendu à chaque niveau » (titre du bloc)
- « Sous-critères » (titre de la liste)

## Pour toi

Relecture du lot ; puis, au signal de Grégoire, l'étape 5 (`CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5-points.md`).

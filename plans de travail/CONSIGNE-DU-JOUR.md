# Consigne de la prochaine séance — la carte « Bilan » : une livraison, 1.120

> **Écrite le 5 septembre 2026 à 11 h 53 (Toronto, heure lue), par Cowork, à froid, avec Grégoire.**
> **Application au moment de l'écriture : 1.119.0 en ligne (build `0905-1053`, `f2fa5a2e`) ; `main` = `origin/main`.**
> ⚠ **Ce fichier porte un nom sans date, exprès** : la séance n'est pas datée. **Au démarrage, Claude Code le promeut** :
> archive `CONSIGNE-DU-JOUR.md` (celle du 5) sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-05-quatre-lots-1.119.md`, renomme
> celui-ci en `CONSIGNE-DU-JOUR.md`, et **remesure avant d'exécuter** (`git --no-optional-locks log --oneline -5`,
> `cat version.json`, `TZ=America/Toronto date`) : si 1.119.0 n'est plus la version en ligne, dis-le en tête de ton rapport.
> Les deux fichiers partent avec le premier commit du lot.

## Ce que cette séance produit à l'écran, pour Grégoire

**Un seul lot, une livraison mineure, 1.120, à la fin, après son coup d'œil.** Dans Conception › Grilles › un critère
algorithmique : la carte « Observation » s'appelle **« Bilan »** et ne porte plus que ce que l'élève lit dans son bilan
(« Défi prioritaire », « Quand tout est maîtrisé ») ; le menu du modèle s'appelle **« Modèle des phrases (bilan et
décompte) »** et son modèle « Français écrit (formulations d'origine) » s'appelle **« Français écrit »**, avec une description
neuve ; « Aucune annotation », qui ne s'affiche qu'à l'enseignant·e, vit désormais **sous la case « Utiliser ces
sous-critères comme codes d'annotation »**, dans la liste « Sous-critères », sous un pli fermé. Plus rien n'est écrit à deux
endroits ; aucune donnée ne change.

**Source, à lire d'abord et en entier** : `plans de travail/CADRAGE-2026-09-05-carte-bilan.md` (les cinq points arrêtés, les
mots au caractère). ⛔ Pas les 130 autres fichiers de `plans de travail/`.

## 0 · Lis d'abord

1. `PROTOCOLE.md` (règles 1, 2, 7) ; `OU-EN-EST-ON.md` en tête ; `CONSIGNE-DEMARRAGE-COWORK.md` §3 (l'état du 5 au soir).
2. Ton bloc de clôture de 1.119 dans `SESSION.md` (`grep -n "1.119" SESSION.md`, jamais en entier).
3. Le cadrage « Bilan », puis les deux fichiers que tu touches : `rendreBlocEnoncesAlgo` (`grilles.js:~3634`),
   `rendreCartesGabaritAlgo` (`:~4378`), `rendreSousCriteresAlgo` / `rendreActivationCodes` (`:~4238`, `:~3720`) ;
   `evaluation-enonces.js:240-249` (les deux modèles). **Remesure les repères de lignes avant de toucher.**

## Le lot — la carte « Bilan » (`js/grilles.js`, `js/evaluation-enonces.js` pour deux chaînes, `styles.css` si besoin, `index.html` bump)

**Mesure d'abord, en une ligne chacune** : ce que `rendreBlocEnoncesAlgo` rend après le filtre du §8 du 5 (trois énoncés +
menu) ; où `rendreActivationCodes` est appelé et avec quel `ctx` ; les tests qui nomment la carte (mesuré le 5 :
`lot4-gabarit-algo-cartes.spec.js`, `texte-troue-badges-dans-la-phrase.spec.js`, `sentinelle-lot4-C-gabarit-algo-range`,
`sentinelle-texte-troue-etape-2-une-seule-carte` — `grep -rln "'Observation'\|CR:commentaire\|Modèle d'observation" tests/`).

**Ce qui est arrêté (Grégoire, 5 septembre, 7 h 55 et 11 h 41 — cadrage, points 1 à 5)** :
1. Titre de la carte : `Observation` → **`Bilan`** (`rendreCartesGabaritAlgo`) ; la clé de pli `commentaire` ne change pas
   (mémoire seulement).
2. La carte rend le menu et **deux** énoncés : `priorite`, `concentre` (filtre : ni `decompte`, ni `aucune`).
3. `aucune` se rend **sous la case des codes**, dans `rendreSousCriteresAlgo`, par `rendreChampEnonceAlgo(cle 'aucune', e, ctx)`
   sous un pli fermé **« Quand la copie ne porte aucun code »** (le composant accordéon de l'application, comme le pli
   « Observation » des rangées, état en mémoire) — grille enregistrée seulement, comme la case ; mêmes handlers, même clé.
4. Étiquette du menu : `Modèle d'observation` → **`Modèle des phrases (bilan et décompte)`** ; une ligne d'aide sous le menu :
   « Fournit le texte de départ des deux phrases du bilan et du décompte de la carte « Ce que l'élève lit ». »
   (texte de départ, Grégoire le reprend au coup d'œil).
5. `evaluation-enonces.js:247-248`, **au caractère** :
   - `nom: 'Français écrit'`
   - `description: 'Les phrases parlent du français écrit (« erreurs de français », « la qualité du français »). Pour un critère d\'une autre discipline, choisis « Générique », qui nomme le critère tel qu\'il est écrit dans la grille.'`
   L'identifiant `discipline_francais` et `_nomDitFrancais` ne changent pas.
- `echapperHtml` partout ; zéro handler inline ; classes dans `styles.css`, rien en `style=` inline neuf ; cibles ≥ 44 px.
- ⛔ **Aucune donnée ne change** : `enonces.*`, `modeleEnonces`, les grilles, ce qui voyage. Témoin : `git diff --
  js/import-export.js js/partage-schemas.js js/evaluation-projection.js` rend **zéro**, et le diff d'`evaluation-enonces.js`
  ne touche que les deux chaînes du point 5 (`git diff --stat -- js/evaluation-enonces.js` : 2 lignes).

**Témoins** : la sentinelle « une seule carte » (étape 2) adaptée : une carte « Bilan », deux énoncés dedans, `aucune` rendu
UNE fois dans le gabarit, sous la case des codes, absent de « Bilan » ; **break-test** : `aucune` réintroduit dans « Bilan »
→ rouge. Une sentinelle sur les deux chaînes du modèle (le nom sans parenthèse, la description sans `#`). Les specs WebKit qui
ouvraient « Observation » ouvrent « Bilan » ; ⛔ pas de `page.click` à l'aveugle, pas de `waitForTimeout`. Vitest depuis
`tests/`.

**Un ou deux commits.** Puis : rapport à Cowork (une passe courte, pas de relecture croisée : rendu seul, aucune donnée) ;
**coup d'œil de Grégoire** (Conception › Grilles › un critère algorithmique : une carte « Bilan » à deux phrases, le menu
renommé et son modèle « Français écrit », puis dans « Sous-critères », sous la case des codes, le pli « Quand la copie ne
porte aucun code ») ; **une entrée de changelog** (Cowork la lui propose, ses mots) ; verdict au jeton (`scripts/pousser.sh`) ;
**release MINEURE 1.120** ; push ; on n'attend pas le run (règle 7).

## Ce qui revient à Grégoire, au coup d'œil seulement

La ligne d'aide sous le menu (point 4), et les mots du changelog. Tout le reste est arrêté.

## Hors de cette séance, à ne pas ouvrir

La synthèse des rétroactions dans le PDF (nommée par Grégoire le 5, non cadrée) ; recueillir ce qui sortira du 14 (un gabarit
et un canal : Cowork, à froid, avec lui) ; l'étape 4 du texte troué : **abandonnée**, ne pas la reproposer.

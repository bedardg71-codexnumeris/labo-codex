# Consigne du jour – Retirer l'« ANCIEN SYSTÈME » des échelles d'`index.html` (#520)

> **Écrite par Cowork le dimanche 13 septembre 2026, 14 h 36 (Toronto).** Elle remplace la consigne #551, codée et commitée
> dans `d21d320f`, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-13-551-suggestion-sans-lettre.md`.
>
> ⛔ **#551 N'EST PAS TERMINÉ.** Il lui manque la relecture croisée de Cowork, la release patch avec son entrée « Nouvelles »,
> le verdict Playwright pris Cowork fermé, et le push (`main` a deux commits d'avance sur `origin/main` ; `version.json` est
> resté en `1.140.4` / `0913-1400`). **Ce lot-ci vient APRÈS cette livraison, pas à sa place.**
>
> ✅ **Aucune interdiction de la consigne précédente n'est renversée ici** : ce lot ne touche ni `js/interventions.js`, ni
> aucune assertion du cadrage 11.

---

## 0 · Ce que ce lot livre

**À l'écran : rien.** Le bloc visé porte `class="u-hide"` et ses champs sont des doublons morts. Ce qui change est invisible et
mesurable : **`index.html` ne porte plus un seul identifiant dupliqué**, et l'ancien éditeur d'échelles cesse d'exister.

C'est un lot qui ne demande à Grégoire **ni arbitrage ni vérification à l'écran** — la règle de sélection du 13 sept.

---

## 1 · Ce qui est mesuré (Cowork, le 13 sept. à 14 h 30, sur `291216b7`)

Chaque compte est écrit avec la commande qui le produit.

- `grep -oE 'id="[A-Za-z0-9_-]+"' index.html | sort | uniq -d` ⮕ **exactement 8 identifiants dupliqués**, chacun deux fois :
  `apercuEchelle`, `champAutreEchelle`, `nomEchelleContainer`, `nomEchelleTemplate`, `selectEchelleTemplate`, `seuilReussite`,
  `tableauNiveaux`, `typeEchelle`.
- **Les huit viennent tous du même bloc**, et de lui seul : `index.html` **5233** (`<!-- ANCIEN SYSTÈME (Caché par défaut, gardé
  pour compatibilité) -->`, suivi de `<div class="u-hide">`) à **5386** (`</div><!-- Fin ANCIEN SYSTÈME -->`) — 154 lignes.
- **La PREMIÈRE occurrence des huit est en 5188–5226, donc AVANT le bloc.** `getElementById` rend déjà l'éditeur vivant ; les
  copies du bloc ne sont jamais lues. ⮕ **L'ablation ne change aucun comportement.** (La fiche l'affirmait ; c'est mesuré.)
- **Onze** `data-action` / `data-on-change` vivent dans le bloc. **Dix n'ont aucun autre appelant dans `index.html`** ; seul
  `sauvegarderNomEchelle` en garde deux hors du bloc.

### Ce que la mesure corrige de la fiche #520

La fiche nomme cinq identifiants et annonce `nomEchelleTemplate` **×3**. **Faux des deux côtés** : ils sont **huit**, chacun
**×2**, et `btnDupliquerEchelle` — qu'elle cite — **n'est pas dupliqué du tout** (une seule occurrence dans le fichier).
Reprends la liste ci-dessus, pas celle de la fiche.

---

## 2 · Portée

**Le geste : supprimer `index.html` 5233–5386**, plus le code que cette suppression rend mort (§ 4).

- ⛔ **Ne touche pas au second « ANCIEN SYSTÈME »** (à partir de la ligne **5487**) : c'est la zone des cartouches, elle ne
  produit **aucun** identifiant dupliqué, et rien dans #520 ne la vise.
- ⛔ **Ne rouvre pas #766.** Décision de Grégoire du 6 sept., 11 h : « laissé inscrit, pas de lot ; ne pas le reposer. »
- ⛔ **Ne fusionne pas les autres doubles `class` de #787.** Ceux-là changent un rendu et se jugent à l'écran, avec Grégoire.
  Seuls partent ceux que l'ablation emporte (§ 3).

---

## 3 · LE PIÈGE – la liste figée de la sentinelle #779

`tests/unit/sentinelle-779-un-seul-attribut-class.test.js` (**bord B**) fige la liste des balises qui portent deux attributs
`class`. **Cinq des dix-sept que compte `index.html` aujourd'hui sont DANS le bloc** — dont
`<div class="groupe-form" class="max-w-400-mb20">`, ligne 5236.

⮕ **Les retirer fait rougir la sentinelle par construction.** Ce n'est pas une régression : la fiche #787 le prévoit
explicitement — « retirer un cas réparé de la liste fait partie du geste ». **Mets la liste à jour dans le MÊME commit**, et
écris le compte avant / après dans le message de commit.

⚠ **#787 annonce vingt-deux cas ; `index.html` en mesure dix-sept aujourd'hui**
(`grep -cE 'class="[^"]*"[^>]*class="' index.html`). Le chiffre de la fiche est périmé ou compte d'autres fichiers :
**remesure avant de t'y fier.**

---

## 4 · Le code que l'ablation rend mort

Dix handlers perdent leur seul appelant HTML : `enregistrerCommeEchelle`, `exporterEchelles`, `genererNiveauxPersonnalises`,
`ouvrirImportEchellesLocal`, `reinitialiserNiveauxDefaut`, `sauvegarderNiveaux`, `changerTypeEchelle`,
`chargerEchelleTemplate`, `importerEchelles`, `sauvegarderConfigEchelle`. Ils vivent dans `js/echelles.js`, sauf
`ouvrirImportEchellesLocal` (`js/main.js`) et `importerEchelles` (aussi cité dans `js/echelles-bibliotheque.js`).

⮕ **Mesure, pour chacun, s'il garde un appelant en JS** (`grep -rn` dans `js/`). Ceux qui n'en ont aucun **partent avec le
bloc** — c'est le zéro-dette, et c'est le lot qui se termine, pas un élargissement. Ceux qui en gardent un **restent**, et tu
**nommes lesquels et par qui** dans ton rapport.

⚠ **`sauvegarderNomEchelle` reste** : deux appels hors du bloc.

---

## 5 · La preuve

1. **Avant / après, la même commande** : `grep -oE 'id="[A-Za-z0-9_-]+"' index.html | sort | uniq -d | wc -l` ⮕ **8 avant,
   0 après**. C'est la preuve principale, et une machine y répond seule.
2. **Une sentinelle ratchet neuve** : `index.html` ne porte aucun identifiant dupliqué. **Casse-la exprès** (réintroduis un id
   en double), vérifie qu'elle rougit, remets le fichier à l'identique.
3. **Les bancs qui nomment ces identifiants** — `sentinelle-625-etats-edition-purges`, `sentinelle-555-reperes-maitrise-echelle`,
   `sentinelle-505-rendus-blocs-executent`, `sentinelle-524-code-niveau-obligatoire`, `sentinelle-555-e-reperes-echelle-neuve`,
   et les specs `confirmations-conception-uniformes` et `echelle-reperes-maitrise-rendu` : **vérifie qu'ils lisent bien la
   première occurrence** (l'éditeur vivant) et non les copies du bloc. S'ils restent verts sans rien avoir éprouvé, dis-le.
4. **La suite complète se prend dans le CLONE PARTAGÉ** (`git clone --shared`), jamais dans un banc monté par `git archive` :
   sept essais y rougissent faute de `.git`. `npm install` dans le banc, `timeout 170`, en synchrone.

---

## 6 · Écritures de backlog, dans le même commit

- **#520 cochée**, avec la liste réelle des huit identifiants et le compte avant / après.
- **#787 mise à jour** : les cas emportés par l'ablation retirés de son énoncé, le compte remesuré sur `index.html`.

---

## 7 · Ce qu'on annonce

**Rien dans « Nouvelles ».** Aucun geste d'utilisateur ne change, aucun écran ne bouge : une entrée de changelog dirait à vingt
collègues qu'il s'est passé quelque chose qu'ils ne peuvent pas voir. *(Décidé par Cowork ; supposition nommée : que Grégoire ne
veut pas de release pour un lot invisible. Une phrase de sa part la renverse.)*

---

## 8 · Livraison

Commit — **relecture croisée de Cowork** — verdict Playwright pris **Cowork fermé** — push. Dans cet ordre : « push réussi » ne
vaut pas « suite complète verte », le hook pre-push ne lance que Vitest.

⛔ **Et après la livraison de #551**, pas avant.

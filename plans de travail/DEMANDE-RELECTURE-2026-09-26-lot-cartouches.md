# Demande de relecture croisée, AVANT fusion – lot « les cartouches arrivent entières » (#643, #654, #637)

> Écrite le 26 septembre 2026, vers 8 h 45 (Toronto), par Claude Code. Branche `lot-cartouches-643-654-637` (arbre principal), base `ac24acb7` (1.159.10). Trois commits : `8e87853d` (#643), `d7da0b66` (#654), `6c4a21c6` (#637). **Rien n'est fusionné ni poussé, aucune release.** Verdict attendu dans `plans de travail/RELECTURE-2026-09-26-lot-cartouches.md`. Deux textes attendent l'accord de Grégoire (§ 5).
>
> Pour lire le code sans changer de branche : `git diff ac24acb7..lot-cartouches-643-654-637 -- js/ index.html`.

## 1 · #643 – le fichier de partage dit de quel trimestre viennent les cartouches

**Mesure (WebKit, `tests/integration/partage-trimestre-cartouches-643.spec.js`)** : une émettrice (deux trimestres, Automne 2026 actif) fabrique le `.lcz` signé de sa grille à cartouche par la vraie chaîne ; le fichier passe dans un contexte vierge. **Avant** : `manifest.trimestreCartouches` absent. **Après** : « Automne 2026 », et la prévisualisation affiche le paragraphe « Cartouches tirées du trimestre : Automne 2026 ». Un fichier sans le champ (re-signé sans lui) ne fait rien dire (témoin : le paragraphe « Contenu : » est bien lu).

**Mes choix (à contester)** :
- **Où** : au **manifeste** (`trimestreCartouches`, chaîne, 200 max), pas sur chaque cartouche — toutes les cartouches d'un paquet viennent du même trimestre actif.
- **Quand** : **toujours** dès qu'une cartouche part, lue par les lecteurs par défaut (préférence de Cowork suivie). **Jamais** : paquet sans cartouche ; ré-export depuis « Partagés » (`options.lecteurs` injectés : ses cartouches viennent d'une collection plate, sans trimestre) ; trimestre actif sans `nom` (on ne remplace pas par l'id).
- **Registre** : il n'existe pas de registre de transport du manifeste ; le jumeau de la section AE est le cas **T.a** (tout champ que `construirePackage` pose au manifeste est déclaré au schéma fermé — sinon l'auto-contrôle de l'export refuserait tout le paquet). ⚠ C'est ma lecture du § 2.3 de la consigne : dis-le si tu attendais autre chose.
- À la réception, l'aperçu ne rend le trimestre que si le paquet contient au moins une cartouche (R.f).

**Preuves** : Vitest `tests/unit/partage-trimestre-cartouches-643.test.js`, 16 essais (émission, réception, bornes, assainissement d'un nom à balise, **le vecteur signé de juin se valide et se vérifie encore**, et y poser le champ après coup casse la signature). WebKit 2 cas. **8 sabotages, 8 rouges** (7 Vitest + retrait du paragraphe à l'écran, rouge en WebKit).

## 2 · #654 – une production importée retrouve sa cartouche

**Mesure (WebKit, `tests/integration/import-cartouche-renommee-654.spec.js`, chaque chemin par son vrai geste)** — rouge avant, sur le code de `8e87853d` :
- configuration complète (`#fichierImport` → `executerImportConfigComplete`) : la production désignait `CART654` = **la cartouche LOCALE** (« Cartouche locale ») ;
- import sélectif (`#fichierImport`, format brut → `executerImportSelectif`) : idem, la cartouche locale ;
- Réserve, « Copier en double » : la production copiée désignait `CART654`, **absent** du magasin de sa grille copiée (`designee: null`).

Après : chacune désigne la cartouche venue avec elle.

**Ce que fait le lot** : `fusionnerParIdentite` rend `renommages` (ancienId → id neuf) pour les cinq collections ; seuls ceux des cartouches sont consommés. Dans les deux chemins d'`import-export.js`, le bloc cartouches passe **avant** les productions (déplacement pur, rien d'autre ne dépend de l'ordre) ; dans `reserve-ouvrir.js`, les passes de **préparation** sont réordonnées (cartouches avant productions) — confirmé à l'exécution : réordonnancement retiré → rouge (sabotages N4, N8, N10). **L'ordre d'écriture de la Réserve ne change pas.**

**Ma décision de sémantique, à regarder en premier** : dans le chemin configuration complète, une production **déjà en place à l'identique** n'est pas rebranchée. Sinon, son `cartoucheId` changé la ferait passer pour différente, et `fusionnerParIdentite` fabriquerait une production jumelle. Elle garde la cartouche locale de même id. Cas WebKit 2, vert avant et après (témoin) ; sabotage N5 → rouge.

**La « bascule armée » (§ 3 de la consigne)** : la sentinelle de #627 qui devait figer la table vide **n'existe pas sur `main`** — `grep -rn "sentinelle-627" tests/` rend 0 ; `git log -S"sentinelle-627"` ne rend que deux commits de documentation (`7781e1b4`, `c57b6631`). Le module unifié de #627 n'a jamais été livré. Rien à mettre à jour ; noté ici plutôt que découvert plus tard.

**Autres familles (§ 3)** : mesurées, **une seule inscrite** – #952, l'import sélectif renomme grilles et échelles sans aucune table de remap (le motif `remap` ne rend dans cette fonction que mes lignes ; témoin, 23 lignes dans la configuration complète). La configuration complète remappe grilles et échelles avant la fusion ; la Réserve aussi (hors #663, déjà inscrit). Le partage ne transporte pas `production.cartoucheId` (absent du schéma `production`) : sans objet ici.

**Preuves** : WebKit 4 cas ; Vitest `tests/unit/fusion-renommages-654.test.js` (2) ; **11 sabotages, 11 rouges**. **Stock** : rien n'est réécrit.

## 3 · #637 – une archive rouverte montre toutes ses cartouches

**Confirmé à l'exécution AVANT le correctif** (WebKit, `tests/integration/reserve-reouverture-cartouches-637.spec.js`) : un groupe-cours d'a2025 est **versé par `Reserve.verserGroupeCours`** (ZIP téléchargé, aperçu K-β confirmé), puis rouvert par `ReserveOuvrir.onFichierChoisi` dans un espace vierge. L'archive contient `a2025_cartouches_G637` ; la liste proposait **0 cartouche**. Avec les deux formes dans l'archive, elle ne proposait **que la forme nue**, dont une version périmée de la cartouche A.

**Ce que fait le lot** : `_extraireRessources` reconnaît `<préfixe>_cartouches_<g>` et `cartouches_<g>`. Pour une même grille, **la forme namespacée l'emporte en bloc** (la supposition de Cowork, que la mesure ne dément pas : `cle('cartouches_…')` ne lisait que celle-là) ; la nue ne sert que si la namespacée manque (cas GNUE du banc). **Et une ligne de plus que la consigne ne demandait pas** : la détection des doublons lit désormais `cle('cartouches_<g>')`, le magasin où `importerCartouchesExternes` écrira, au lieu de la clé de l'archive (`db.getSync(k)`). Motif : avec la clé complète reconnue, `k` devenait `a2025_cartouches_…`, un autre magasin que la destination. Cas 3 du banc ; sabotage P4 → rouge.

`js/codex-data.js` non touché, et il ne partage aucune fonction avec la réouverture. Rien n'est effacé (lecture seule).

**Preuves** : 3 cas WebKit ; rouge avant (3/3 sur le code de `d7da0b66`) ; **4 sabotages, 4 rouges**.

**Trouvaille inscrite** : #953 – la même lecture « forme nue seulement » touche les **grilles et échelles** à la réouverture ; au banc, chaque cartouche proposée porte « grille manquante » alors que la grille est dans l'archive.

## 4 · Suites

- Vitest complet : 7 442 / 7 443. **Le seul rouge est `sentinelle-anticache-fichiers-modifies`**, qui exige un `?v=` au jour du build : il tombera au bump de release (build du 26).
- WebKit : les 9 cas neufs, plus 32 specs voisines (imports, partage, Réserve, bac à sable), verts.
- **Verdict Playwright complet : pas encore** — il se prend après ta relecture et les corrections (règle 2).

## 5 · Deux textes que Grégoire doit accepter avant le push

- **La phrase de la prévisualisation** (texte de Cowork, repris tel quel) : « Cartouches tirées du trimestre : Automne 2026 ».
- **Les « Nouvelles »** (proposition de Cowork, fidèle à ce qui part) : « Partage et archives : les cartouches arrivent entières. Un fichier partagé dit de quel trimestre viennent ses cartouches, une production importée retrouve sa cartouche, et une archive rouverte les montre toutes. »

## 6 · Ce que je te demande de regarder en particulier

1. La garde « production identique » (§ 2) : bonne sémantique, ou faut-il rebrancher quand même ?
2. Le déplacement du bloc cartouches dans `executerImportSelectif` : il reste sous la variable `cle` qui masque la fonction (#642/#655) — je n'y ai rien changé, mais c'est le voisinage le plus fragile.
3. La détection des doublons de la Réserve (§ 3), ajout hors du texte de la consigne.
4. L'avertissement « écriture sans assainirObjet » du hook au commit de #654 : il porte sur `db.setSync(cle, fusionC.liste)` déplacé ; les cartouches y sont assainies trois lignes plus haut (`assainirObjet(c, SCHEMAS_IMPORT.cartouche)`).

# Rapport du lot — « Je regarde » de « Recevoir les productions, rendre tes rétroactions » (17 nov. 2026)

**Dernier relais (17 nov. 2026, soir)** : branche `claude/ecstatic-brown-urn6v8`, partie de `origin/main` à `03dc7d2`
(1.249.0). **Fait** : les six mesures du §3 de la consigne, rien d'autre. Aucun code. **Arrêt** sur la mesure 3.1 :
le modèle d'« Évaluer » peut tomber sur l'une des trois copies. La consigne réserve cette décision à Grégoire.
**Reste** : tout le lot, après sa décision. Mandat : `plans de travail/CONSIGNE-LOT-2026-11-17-je-regarde-recevoir.md`
et les trois copies, repris du commit `450ddabf` (`origin/claude/deux-temps-modelisation-da3icr`).

---

## Les six mesures (§3)

Navigateur : Chromium du nuage seulement.

### 3.1 Qui le modèle d'« Évaluer » fait évaluer — ARRÊT

**Mesuré à l'écran** au moyen d'un banc jetable, retiré depuis. Le modèle d'« Évaluer » est joué jusqu'à son étape 4, à 820 × 1180.
`etudiantDeLaLigne()` lit la première ligne visible de la Liste, et la Liste suit son tri.

| Tri de la Liste | Personne désignée |
|---|---|
| par défaut (nom, croissant) | **Yack Amical** (9900007) |
| prénom, croissant | **Antilope Vaillante** (9900006) : l'une des trois copies |
| prénom, décroissant | Yack Amical |
| nom, décroissant | **Antilope Vaillante** |
| DA, croissant | Koala Câlin (9900001) |

Le tri vit en mémoire (`triEvaluationsActuel`, `js/liste-evaluations.js:168`) et revient au tri par nom à chaque
chargement. Il suffit pourtant d'un toucher sur un en-tête de colonne avant l'étape 4 pour que l'évaluation
tombe sur Antilope Vaillante. **L'hypothèse de la consigne (Yack Amical) vaut donc pour le tri par défaut seulement.**

**Proposition (non appliquée)** : le modèle d'« Évaluer » désigne Yack Amical par son DA, quel que soit le tri.
`ligneDeLaListe(productionId, da)` (`js/parcours-evaluer.js:441`) accepte déjà un DA : le changement tient en une ligne
à `etudiantDeLaLigne`. Il touche le modèle d'« Évaluer » : décision de Grégoire.

### 3.2 Comment poser les évaluations fictives

**Mesuré (lecture du code)** : l'application n'offre aucune fonction qui écrive une évaluation hors de l'écran.
`sauvegarderEvaluation` (`js/evaluation-sauvegarde.js:389`) et `sauvegarderEvaluationModifiee` lisent le formulaire :
`_lireChampsDOMSauv` lit les menus, la note affichée (`window.noteCalculeeCourante`), le niveau affiché et la rétroaction
du champ. Les évaluations du pack, elles, s'écrivent directement dans `demo_evaluationsSauvegardees`
(`peuplerNamespace`, `js/demo-namespace.js`).

**Plan retenu, sous réserve de 3.1** : une écriture directe dans `demo_evaluationsSauvegardees`, en démo seulement,
en ajout. Une personne qui a déjà une évaluation pour cette production n'en reçoit pas d'autre. Les champs sont
ceux de `_construireObjetEvaluationSauv`, avec `verrouillee: true`. La rétroaction est assemblée à partir de la
cartouche du modèle. La note doit venir du calcul de l'application et non d'une valeur posée à la main. Ce point
reste à mesurer au moment du code.

### 3.3 Les fichiers dans une page `file://`

**Mesuré (code)** : le pack est déjà livré par une balise de script créée à la demande, avec le jeton du build
(`chargerPackDemarrage`, `js/demo-namespace.js:123`, sentinelle #825). **Choix** : les trois PDF iront dans un script à
part, chargé au bouton de l'étape 1, avec `?v=` + le build et le même patron. Ils ne passeront ni par `index.html` ni
par `fetch`. Poids : 830 Ko, soit environ 1,1 Mo en base64.

### 3.4 Les dates

**Mesuré (code)** : `parserNomFichierLea` (`js/travaux-import.js:128`) lit bien la date du nom de fichier. Elle ne sert
cependant qu'à ordonner les pages d'un même document (`js/travaux-import.js:1380`). Rien ne la conserve, et aucun calcul
de retard ne la consulte. Des noms en 2026 ne causeraient donc aucun retard. **Choix** : déposer quand même les fichiers
sous des noms en 2025 (mêmes jours, mêmes heures), comme la consigne le supposait. C'est cohérent avec la démo A2025 et
ça ne coûte rien. L'image imprimée garde « A2026 ».

**Constaté en chemin** : « Artefact-1 » se normalise en `artefact1` et ne se rattache seul ni à l'« Artefact 1 » du pack
ni à la production du modèle. C'est l'étape 2 qui fait choisir la production, comme prévu.

### 3.5 L'import en démo

**Mesuré (code)** : `validerMagicBytes` s'applique à chaque fichier importé (`js/travaux-import.js:783`). En démo,
les blobs vont dans IndexedDB seulement (T4). « Retirer les copies » (`retirerCopiesDuDemo`) et « Remettre la démo à
neuf » (`remettreDemoANeuf`, qui appelle le retrait) emportent fichiers et vignettes (`thumbnail_<id>`). À vérifier par
le banc de confinement, IndexedDB compris.

### 3.6 « Exporter pour Léa » en démo

**Inférence (lecture du code, pas encore jouée)** : `exporterPourLea` (`js/travaux-archivage.js:490`) produit un PDF
par évaluation verrouillée : la copie annotée suivie de la synthèse pour Loutre Enjouée, la synthèse seule pour les
sept évaluations sans fichier (#1245, « sur papier »). Les huit PDF partent dans un ZIP. Tapir Doux et Antilope
Vaillante, importés sans évaluation, n'en font pas partie. Aucune écriture en base n'apparaît dans `exporterPourLea`.
Le banc de confinement le jugera.

## Trouvaille hors du lot

- Le banc B de `deux-temps-modeles-2026-11-13.spec.js` **rougit sous Chromium, sur `main`, à 1180 × 820**. L'échec se
  produit dans la Modélisation de « Mettre ta classe en place » : `flecheVers`, pointes à plus de 400 px de la cible.
  À 820 × 1180, le même banc est vert. Rien n'a été départagé avec WebKit. **Disposition : inscrire et continuer**,
  noté ici. Ce lot rejouera ce banc, et il faudra départager ce rouge du sien.

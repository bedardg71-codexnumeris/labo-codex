# Carte — les collections de paramètres de projection (lot B du 5 septembre 2026)

> **Écrite le 5 septembre 2026, 8 h 55 (Toronto), par Claude Code, sur `a3deac63` (lot A commité, 1.118.0 en
> ligne).** Rendue à Cowork AVANT le code (règle 2 : un objet neuf dans les données de Grégoire).
> Source : `CADRAGE-2026-09-03-collections-de-parametres.md` — **tranché par Grégoire : la COPIE.** Ce point
> est fermé. Hors périmètre, nommé là : le menu des formules, une collection formule + projection, toute
> migration, le partage entre enseignants.
> Tout ce qui suit est MESURÉ (commande ou ligne), sauf ce qui est marqué « proposé ».

## 0 · La vue d'ensemble

Une collection = **un jeu nommé de réglages de projection** (le modèle, ses paramètres, ses paliers), pris sur un
critère et rangé dans le trimestre. La choisir dans le menu de projection d'un autre critère **copie** ces valeurs
dans le critère ; le critère reste la source unique du calcul et du texte. Corriger ou supprimer la collection
ensuite ne touche aucune grille, aucune évaluation.

Un module neuf, propriétaire d'une clé neuve ; le registre de projection ne bouge pas ; le gabarit gagne un
sous-titre au menu, un bouton et une ligne.

## a) Où la collection s'enregistre

**La clé** : `collectionsProjection`, **namespacée par trimestre via `cle()`**, comme `echellesTemplates`.
▣ Mesuré : `cle()` (`trimestres.js:354`) ne préfixe que les noms inscrits à `CLES_NAMESPACEES` (`:51`) ; une clé
absente est rendue NUE avec un `console.warn` (`:374`, #464). ⮕ **Inscrire `'collectionsProjection'` à
`CLES_NAMESPACEES`** (une ligne). ⛔ Pas à `CLES_TEMPLATES_ARCHIVES` (`:162`, mécanisme d'archivage antérieur à
#358 : une clé namespacée vit déjà par trimestre). Démo : `demo_collectionsProjection` reste vide (le pack n'en
sème pas) — rien à faire. Un trimestre neuf part sans collection ; « importer depuis un autre trimestre »
(le mécanisme des grilles et des échelles) n'est pas dans ce lot — dit ici.

**Le propriétaire** : un module neuf, **`js/collections-projection.js`** (chargé après
`evaluation-projection.js`, avant `grilles.js`, `index.html:14518-14522`), et une ligne au registre
`docs/DATA-OWNERSHIP.md` (« Structure pédagogique (templates) », `:57`).
▣ Pourquoi pas dans `evaluation-projection.js` : la sentinelle de l'aperçu (A.e) verrouille que **le registre ne
lit rien d'autre que le critère** — ni `db.`, ni `document.`. Une collection, elle, se lit et s'écrit en base.
Le module neuf est pur pour ce qui se teste en Node (`depuisCritere`, `appliquer` sur un critère donné,
la règle du nom) et n'appelle `db` que dans `lister` / `enregistrer` / `supprimer`, par `db.modifier`
(durabilité, #352) et `cle()`.

**Ce que la collection porte exactement** — mesuré sur ce que « Fini quand » exige (« les quatre paliers et le
nom du service arrivent réglés ») et sur ce que `normaliser` (`evaluation-projection.js:476`) rend :

```
{ id: 'coll_<horodatage>_<aléa>', nom: 'EUF', dateCreation: ISO,
  modeleId: 'norme_externe',
  params: { motsReference: 900, erreursTolerees: 30, nomServiceAide: 'Passerelle +', lienServiceAide: '' },
  paliers: [ { cle, libelle, sansErreur, ratioMax, texte, texteAide } × n ] }
```

- `params` = les QUATRE paramètres du modèle, pas seulement le nom du service : la longueur de référence et les
  erreurs tolérées SONT la norme que la collection nomme (« EUF » = 900 / 30) ; le lien du service suit le nom.
  Ils sortent de `normaliser(critere).params`, donc toujours complets et typés (`_valeurParametre`, `:423`).
- `paliers` = `normaliser(critere).paliers`, c'est-à-dire les paliers ÉCRITS du critère s'il en a, sinon ceux du
  modèle (`_paliersRetenus`, `:437`) — copiés profondément à l'enregistrement.
- `modeleId` : seul un modèle qui projette a des paliers ; « Aucune projection » n'a rien à nommer. Le bouton
  n'apparaît que sous un modèle qui projette.
- ⛔ Rien de la formule, rien des énoncés, rien des sous-critères (hors périmètre du cadrage).

**Le nom** : unique dans le trimestre, comparé après `trim()` et sans casse ; un nom pris se DIT (voir c). Zéro
`echapperHtml` manquant : nom rendu par `esc()` partout.

## b) Où elle se choisit

▣ Mesuré : le menu est un `<select>` bâti dans `rendreBlocProjectionAlgo` (`grilles.js`, `options` =
`listerModeles().map(<option>)`), et ses deux handlers ne lisent que `el.value`
(`modifierModeleProjectionTempHandler` `:5450`, `modifierModeleProjectionGrilleHandler` `:5480`) puis appellent
`appliquerAuCritere(critere, el.value, null, null)` et effacent `paliersProjection`. Aucun autre consommateur
du `<select>`. Un `<optgroup>` passe par le même gabarit (`innerHTML`) sans rien changer ailleurs.

**Proposé** : après les modèles livrés, `<optgroup label="Mes collections">` (sous-titre : mots à Grégoire)
avec une `<option value="collection:<id>">` par collection du trimestre, dans l'ordre alphabétique ; le groupe
est absent s'il n'y a aucune collection. `listerModeles` reste une liste fermée, intouchée.

**Le choix** : les deux handlers reconnaissent le préfixe `collection:` et appellent
`collectionsProjection.appliquer(critere, id)` → `projectionAlgo.appliquerAuCritere(critere, c.modeleId,
c.params, c.paliers)`. C'est la COPIE : `_paliersRetenus` reconstruit des objets neufs (égaux, `!==`), et
`appliquerAuCritere` recopie les params. Le critère ne garde AUCUN lien vers la collection : après le choix, le
menu affiche le modèle copié (« Projection à l'EUF »), pas la collection. ⚠ C'est voulu (la copie), et une ligne
d'aide le dit (voir d). Un id inconnu (collection supprimée entre le rendu et le clic) : rien n'est écrit, une
notification le dit.

## c) Le geste d'enregistrement

**Proposé** : dans la carte « Ce que l'élève lit », sous les paliers, à côté de « + Ajouter un palier », un
bouton **« Enregistrer ces paliers sous un nom… »** (mots à Grégoire). Il ouvre une section INLINE dans la carte
— un champ « Nom de la collection », « Enregistrer », « Annuler » — ⛔ pas de `prompt()`, pas de modale (skill
`design-interface`). L'état ouvert / fermé vit en mémoire (comme `plisGabaritAlgo`), jamais dans la grille, et
survit aux redessins. « Enregistrer » lit le champ : nom vide → le champ se marque (`marquerChampRefuse`, déjà
là) ; nom pris → la section dit « Une collection porte déjà ce nom. » sans rien écrire ; sinon la collection est
écrite, une notification le dit, la section se ferme, le menu la liste. Disponible en édition ET en création
(mode temp : les paliers d'un critère en création sont aussi enregistrables — la collection ne dépend pas de la
grille).

**La suppression** — nécessaire pour la sentinelle (« supprimer la collection ne change pas le critère ») et
pour que le menu ne grossisse pas sans retour : sous le menu, quand il existe des collections, une ligne par
collection avec **la corbeille** (lot C : un seul bouton de suppression) et `data-confirm` : « Supprimer la
collection « EUF » ? Les grilles qui l'ont copiée ne changent pas. » ⚠ POINT À TRANCHER PAR COWORK : la
consigne nomme « la cinquième famille de la bibliothèque » (`BibliothequeUI.repertoires.enregistrer`). Mesuré :
cet appel ne fait qu'inscrire les rappels de la zone « Mes dossiers » d'une MODALE de bibliothèque
(`bibliotheque-ui.js:1397-1456`) ; sans modale (`afficherBibliothequeEchelles` en fait ~200 lignes : sections,
import trimestre, dossiers, partage), l'inscription est inerte — du code mort. **Recommandation** : ce lot
livre la clé, le module, le menu et la gestion inline dans la carte ; la modale de bibliothèque (dossiers,
import d'un autre trimestre, partage `.lcz`) vient avec le partage, hors périmètre nommé au cadrage — et
l'inscription à `repertoires` avec elle, quand elle a une modale à servir.
↻ **TRANCHÉ PAR COWORK (relecture, 5 sept., 9 h) : rien à corriger, ancres remesurées ; ce lot livre la clé, le
module, le menu et la gestion inline ; la modale de bibliothèque et l'inscription à `repertoires` viennent avec
le partage, hors périmètre.** ⮕ Et « importer depuis un autre trimestre » (les collections d'un trimestre
passé) attend cette modale : un trimestre neuf part sans collection jusque-là.

## d) Ce que voit une grille qui a copié une collection ensuite supprimée

Rien ne change : ses paliers et ses paramètres sont les siens (`critere.paliersProjection`,
`critere.paramsProjection`), écrits par `appliquerAuCritere` ; aucune lecture ne repasse par la collection.
Une ligne d'aide sous le menu le dit (texte de départ, à reprendre) : « Choisir une collection copie ses
paliers et ses réglages dans ce critère. Corriger ou supprimer la collection ensuite ne change pas cette grille,
ni ce qu'un élève a déjà lu. »

## e) Ce qu'export et import font de la clé neuve

▣ Mesuré, deux chemins :
- **Export des données** (`ouvrirModalExport`, `import-export.js:1023`) : liste TOUTES les clés de `db.keys()`
  → `<trim>_collectionsProjection` y figure, exportable ; l'import de ce format écrit chaque clé reçue telle
  quelle (`db.set(cle, valeur)`, `:2775`). **Rien à faire.**
- **Configuration complète** (`exporterConfigurationComplete`, `:3331`) : un ensemble FIXE — échelles,
  grilles, productions, cartouches, paramètres. **La clé neuve n'y est pas, ni dans les familles de l'import
  sélectif (`:2087`).** ⮕ Proposé : PAS dans ce lot. Ce qui voyage avec une grille (ses paliers copiés) voyage
  déjà ; la collection est une commodité du trimestre, portée par l'export brut. À inscrire (« configuration
  complète : les collections de projection ») si Grégoire ou un collègue en manque.
- ⛔ Partage entre enseignants (`partage-schemas.js`) : rien dans ce lot. `git diff -- js/evaluation-projection.js
  js/import-export.js js/partage-schemas.js` rendra ZÉRO.

## Les volets, un commit chacun (après la relecture de Cowork)

1. **Registre + clé** : `js/collections-projection.js`, `CLES_NAMESPACEES`, `index.html` (script + jetons),
   `docs/DATA-OWNERSHIP.md`. Sentinelle Vitest sur le module réel avec une base factice : enregistrer, lister,
   appliquer (paliers égaux mais `!==`, params recopiés, `modeleProjection` posé), nom pris refusé, supprimer
   ne change pas le critère, aucune lecture hors `cle('collectionsProjection')` ; break-test.
2. **Gabarit** : `grilles.js` — le sous-titre au menu, les deux handlers, le bouton et la section inline, la
   ligne des collections avec corbeille, la ligne d'aide ; `styles.css` si une classe est nécessaire.
3. **Spec WebKit** : régler un palier, enregistrer sous « EUF », créer une grille neuve, choisir « EUF »,
   relire les paliers et le nom du service ; corriger la collection → la grille ne bouge pas. ⛔ Pas de
   `page.click` à l'aveugle, pas de `waitForTimeout`.

## Ce qui revient à Grégoire (au coup d'œil, pas avant)

Les mots du bouton (« Enregistrer ces paliers sous un nom… ») et du sous-titre (« Mes collections ») ; la ligne
d'aide ; la confirmation de suppression.

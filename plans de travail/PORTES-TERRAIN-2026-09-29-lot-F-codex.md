# Portes terrain – lot F (1.168.0) : ton codex sur l'iPad

> Écrites le 29 septembre 2026, vers 7 h 20, par Cowork (Claude Code n'avait pas encore écrit ce markdown ; les deux livrables sont donc de Cowork). **Artefact publié** : « Porte · Ton codex à jour » (https://claude.ai/artifact/TUTdxw4GjEAhYfC27jVyhB), bouton « Copier mes résultats ». Sur tes **données réelles**, à l'adresse `https://app.codexnumeris.org`, **sans rien créer de fictif** ; chaque geste qui modifie a sa rangée de retour. Ce qui échoue devient une fiche du BACKLOG.
>
> ✅ **1.168.0 est en ligne** depuis le 29 à 8 h 26 (Netlify, `commit_ref` `27fa681d`, « ready », constaté par Cowork à 8 h 31). Verdict WebKit de Claude Code : aucun rouge, quatre essais verts au second essai (#959/#960, #866).
>
> **Pourquoi une porte, par les deux règles de tête** : le codex est la sauvegarde de Grégoire (environ 1 Go) et l'enregistrement automatique est retiré. Si « Mettre à jour le codex » ratait au doigt sous Safari iPad (aperçu, puis partage vers Fichiers), ou si le menu disait « à jour » à tort, il croirait sa sauvegarde complète : un raté irréversible. Les bancs WebKit du Mac jugent le reste (`codex-temoin-dit-vrai-lot-f`, `lot-f-rappel-et-reserve`, `lot-f-gestes-hors-temoin`, `lot-f-placement-mots`, banc du stock) : pas de rangée pour les mots, le rappel ni l'archive annulée.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | Sur l'iPad, ouvre `https://app.codexnumeris.org`, recharge, lis le numéro en bas de page. | **1.168.0**. Un autre numéro : arrête-toi. |

## §1 · Mettre ton codex à jour `iPad` `⚠⚠ Données`

*Pourquoi : le fichier ne change plus que lorsque tu le mets à jour ; si ce bouton ratait sur l'iPad, ton codex resterait vieux sans que tu le saches.*

| | Geste | Attendu |
|---|---|---|
| 1.1 | Bouton « Codex » (en haut à gauche) ; lis la ligne sous le nom du codex. **Champ de constat.** | « Ton codex n'a pas tes derniers changements », pastille orange (marque du premier lancement, `_marquerStockAvantLotF`). « Aucun codex actif » : le noter, le reste ne s'applique pas sur cet iPad. |
| 1.2 | « Mettre à jour le codex » (sous-texte « Télécharge un nouveau fichier ») ; aperçu « Télécharger » ; « Enregistrer dans Fichiers ». | « Codex mis à jour » ; le menu dit « Ton codex est à jour », pastille verte. |
| 1.3 | App Fichiers, dans le dossier choisi. **Champ : taille.** | Un fichier `codex-‹nom›-2026-09-29-‹heure›.zip` à l'heure de 1.2. |
| 1.4 | Revenir, recharger, rouvrir le menu « Codex ». | Toujours « Ton codex est à jour » : la marque ne revient pas. |

## §2 · Un geste le rend « pas à jour » `iPad`

*Pourquoi : si le menu restait « à jour » après un changement, tu croirais ton codex complet alors qu'il lui manque ton dernier travail.*

| | Geste | Attendu |
|---|---|---|
| 2.1 | Conception › Productions : ajoute « (essai) » au champ « Activité d'apprentissage », puis ferme le clavier (touche en bas à droite du clavier). | « Enregistré » en bas à gauche : le clavier le cache tant qu'il est ouvert (constat de la porte E3, 29 sept.). |
| 2.2 | Menu « Codex ». | « Ton codex n'a pas tes derniers changements ». |
| 2.3 | **Retour** : retire « (essai) », ferme le clavier. | « Enregistré » ; texte d'origine. |
| 2.4 | « Mettre à jour le codex », « Télécharger », enregistrer dans Fichiers. | « Codex mis à jour », puis « Ton codex est à jour ». |

La porte de 1.167.0 est close (29 sept., 7 h 23, 9/9).

## §3 · Décisions

Aucune : le stock (b), les textes et les Nouvelles sont acceptés (29 sept., 5 h 57, 5 h 59, 6 h 08).

## §4 · Ce que je n'ai pas pu vérifier

- **Les autres gestes raccordés, au doigt** : le banc appelle les fonctions des gestes, pas les boutons. Deux gestes restent sans signal, assumé (moratoire #622) : créer un trimestre depuis la liste des trimestres ; l'export « format recherche ».
- **Sous Chrome sur le Mac, fichier tenu** : la mise à jour réécrit le même fichier ; jugé par les bancs, pas sur son codex réel.
- **Le stock (b)** : relu par Cowork dans le code le 29 vers 7 h 15 (`_marquerStockAvantLotF` : n'agit que sur un état actif sans `temoinFiable`, n'écrit que `_codex_etat`, après db-ready ; `_instantaneEtat` pose `temoinFiable: true`, donc une seule fois). Pas rejoué par Cowork ; les mutations du banc et de la sentinelle sont celles de Claude Code.
- **Les archives fantômes déjà listées sous Safari** restent dans `_manifesteReserve` : ni mesurées, ni réparées.
- **Le verdict WebKit complet de 1.168.0** : vert, rendu le 29 au matin par Claude Code, après environ une heure (deux fois de suite) ; quatre essais verts au second essai.

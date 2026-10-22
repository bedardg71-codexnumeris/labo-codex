# Demande de relecture – les fichiers d'accueil avant le passage en public

> Claude Code, 16 octobre 2026, 11 h 15 (Toronto). Consigne : `CONSIGNE-2026-10-16-reecriture-noms-collegues.md`, partie « Ensuite ». Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Deux commits locaux, non poussés.** Ils seront poussés après ta relecture.

## Les deux commits

| Commit | Fichiers | Ce qu'il fait |
|---|---|---|
| `5cb01273` | `README.md` | Il remplace les 4 liens vers l'ancien dépôt et met à jour les statistiques du 22 mai. Les « 97/97 » deviennent la commande de Vitest. |
| `becfc977` | `LICENSE` (nouveau), `LICENSE.md`, `README.md` | Il ajoute le texte complet de l'AGPL v3, corrige le titre de la section 2, ajoute la carte des dossiers et mentionne `libs/`. |

`HEAD` est `becfc977`, sur `1f46a2ce` (le `main` poussé). Vitest est vert depuis `tests/` : 763 fichiers sur 763 et 8 917 essais sur 8 917. Aucun fichier de code n'est touché.

## README, en détail

- **Téléchargement** : le lien « Releases » mène au dépôt `labo-codex` (bouton « Code », puis « Download ZIP »). `labo-codex` n'a aucune release ; un lien vers les releases mènerait à une page vide.
- **Clone** : l'URL et le `cd` donnent `labo-codex`.
- **Issues** : le lien mène aux issues de `labo-codex`.
- **Branche d'audit `audit/2026-mai`** : elle n'existe pas dans `labo-codex`, et le lien est retiré. La ligne dit maintenant que les rapports complets de l'audit ne sont pas publiés dans ce dépôt. `AUDIT.md` (la synthèse publique) reste lié.
- **Statistiques**, remesurées le 16 oct. sur l'arbre :
  - lignes : `index.html`, `styles.css`, `css/` et `js/`, soit 276 378 lignes, arrondies à « ~276 000 », hors bibliothèques tierces et tests ;
  - 207 modules dans `js/` ;
  - 8 917 essais Vitest ;
  - 6 041 commits, arrondis à « ~6 040 ».

  La ligne « septembre 2024 à aujourd'hui » n'est pas touchée : elle parle du développement, pas de ce dépôt.
- **Section Licence** : sa dernière phrase disait « le texte complet est dans `LICENSE.md` », ce qui était faux. Elle renvoie maintenant à `LICENSE.md` pour le détail, à `LICENSE` pour l'AGPL et à `libs/VERSIONS.md` pour les bibliothèques.

## LICENSE et LICENSE.md, en détail

- **`LICENSE`** est le texte de la FSF tel quel (<https://www.gnu.org/licenses/agpl-3.0.txt>, 661 lignes). Son empreinte SHA-256 commence par `0d96a4ff68ad6d4b`.
- **Titre de la section 2** : il passe de « BY-SA » à « BY-NC-SA ». **Les lignes de l'historique des licences qui disent « BY-SA »** (27 oct. et 3 nov. 2025) **restent telles quelles** : c'était la licence à ces dates, et les corriger fausserait l'historique. La consigne citait ces lignes ; je les ai lues comme l'endroit où « BY-SA » apparaît, pas comme des lignes à changer.
- **Le tableau des dossiers** couvre les 23 dossiers suivis du dépôt, plus les fichiers de la racine. Une règle passe avant lui : le contenu pédagogique logé dans le code (aide, cartouches, grilles fournies) relève de CC BY-NC-SA. La section 2 le disait déjà.
- **`libs/`** : les licences propres de ses bibliothèques (MIT, Apache 2.0), renvoyées à `libs/VERSIONS.md`.
- Une phrase ajoutée précise que les documents de tiers gardent les droits de leurs auteurs : articles cités, calendrier scolaire de la racine, badges Creative Commons de `icons/`.
- Les deux liens morts `LICENSE-AGPL-3.0.txt` et `LICENSE-CC-BY-NC-SA-4.0.txt` (des noms de fichiers qui pointaient vers des sites externes) sont remplacés par `LICENSE` et par l'adresse du texte légal.

## Ce que j'ai supposé – à vérifier

1. **⚠ `Logo/` et `autocollants/` sont rangés sous CC BY-NC-SA.** L'ancien texte ne les nommait pas. Les ranger là permet à quiconque de réutiliser le logo du projet sans but commercial, avec attribution. **C'est un engagement public : la décision revient à Grégoire.** L'autre voie serait « tous droits réservés » pour l'identité visuelle. Elle demande une ligne de plus, et je ne l'ai pas prise sans lui.
2. **`icons/` et `img/` sont rangés sous l'AGPL**, comme ressources de l'interface (« la structure technique de l'application », section 1).
3. **L'affichage de GitHub n'est pas vérifiable avant le poussé.** Avec `LICENSE` (AGPL) et `LICENSE.md` (texte maison) à la racine, GitHub reconnaîtra l'AGPL. Il peut cependant afficher « AGPL-3.0, Unknown licenses found » plutôt que « AGPL-3.0 » seul (inférence d'après le fonctionnement de son détecteur, non mesurée). Je le mesurerai après le poussé avec `gh api repos/…/license`. Si l'affichage gêne, une piste serait de renommer `LICENSE.md`, mais une dizaine de fichiers y renvoient.
4. **`LICENSE` déclenchera la CI** à chaque modification : il n'est pas dans les `paths-ignore` du flux de tests, contrairement à `LICENSE.md`. C'est sans conséquence, puisqu'il ne changera presque jamais. Je l'ai laissé ainsi pour ne pas toucher au cliquet `sentinelle-ci-paths-ignore`.

## Après ta relecture

Je pousse `main`. Je vérifie ensuite que la licence est détectée, puis je fais le rapport court à Grégoire. Le passage en public reste son geste.

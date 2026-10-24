# Demande de relecture – la fenêtre d'aperçu du codex dit « Mettre à jour le codex »

> Claude Code, samedi 24 octobre 2026, 9 h (Toronto). Pour Cowork (`PROTOCOLE.md`). Consigne exécutée : `CONSIGNE-DU-JOUR.md` de 8 h 46.
> Commits sur `main`, **non poussés** : `d736b390` (docs de Cowork, seuls), `ea1d2a8a` (le lot). Pas de release, ni verdict complet, ni push (consigne § 3).

## 1. Ce qui passe par l'aperçu dans `codex.js` (mesuré d'abord)

Un seul appel à l'aperçu : `genererCodex` (l. ~629). `genererCodex` a deux appelants, donc trois gestes, plus deux portes qui mènent au premier :

| Geste | Chemin | Mots de l'aperçu |
|---|---|---|
| Menu › « Mettre à jour le codex » | `actionEnregistrer` → `_mettreAJourLeCodex(false)` | validés |
| Menu › « Enregistrer sous » | `actionEnregistrerSous` → `_mettreAJourLeCodex(true)` | validés (D4) |
| Le rappel de sauvegarde, et « Mettre à jour, puis … » avant une suppression (#1007, second lot) | `modal-backup-reminder.js:154` et `codex.js:~3867` → `_mettreAJourLeCodex(false)` | validés (c'est le même geste) |
| **Le codex à part avant une suppression** | `ecrireCodexAPartAvantSuppression` → `genererCodex({ nom: … })` | **ceux du codex, provisoirement** (§ 3) |

## 2. Le lot

- `js/securite-export-preview.js` : `previewZipEtConfirmer` accepte `options.titre` et `options.texteConfirmer` ; sans eux, rien ne change (« Confirmer l'export ‹libellé› », « Télécharger »). `previewJsonEtConfirmer` n'est pas touché : ses deux appelants (configuration pédagogique, bibliothèque de tampons) sont de vrais téléchargements. Commentaires d'en-tête, de `_afficherModale` et du focus initial mis à jour.
- `js/codex.js` : `genererCodex` passe « Mettre à jour le codex » et « Mettre à jour » ; le commentaire K-β ne dit plus « Télécharger » ni « téléchargement ».
- `index.html` : jetons anti-cache des deux fichiers (`20261023c`, `20261023a`, exigés par le hook).
- **Source ou stock** : rien de stocké, des mots d'écran seulement. Pas de stock.

## 3. Le codex à part avant une suppression : des mots à soumettre à Grégoire

Il passe par l'aperçu et dit donc, pour l'instant, « Mettre à jour le codex » / « Mettre à jour ». C'est faux pour lui : il **n'écrit pas** dans le codex tenu, il écrit un autre fichier, sous un autre nom. La fenêtre qui le précède titre « Avant de supprimer, un codex à part » et son bouton dit « Écrire le codex à part ».

**Proposition** (non codée) : titre **« Écrire le codex à part »**, bouton **« Écrire »**. Le verbe reprend celui du bouton qui vient d'être cliqué. Si Grégoire valide, c'est une option de plus à `genererCodex` passée par `ecrireCodexAPartAvantSuppression`, et une ligne à changer dans le banc (étape 3).

## 4. Preuves

- **Banc neuf** `tests/integration/apercu-codex-mots-1024.spec.js` (WebKit, la vraie fenêtre, par les vrais gestes, « Annuler » chaque fois) : menu « Mettre à jour le codex », menu « Enregistrer sous », codex à part (après sa fenêtre de choix) → `{ titre: 'Mettre à jour le codex', bouton: 'Mettre à jour' }` ; archive d'un groupe (`Reserve.verserGroupeCours`) → `{ titre: "Confirmer l'export archive", bouton: 'Télécharger' }`, rien de téléchargé.
- **Break-test**, les deux côtés : options retirées de `codex.js` → rouge (titre et bouton du codex) ; défaut du bouton mis à « Mettre à jour » → rouge (bouton de l'archive). Fichiers restaurés, vert.
- **Banc modifié** `lot-j0-bis-partage-apres-preparation.spec.js` : il cliquait le bouton par son texte « Télécharger » ; il clique « Mettre à jour » (et deux commentaires).
- **Joués** : le banc neuf + `lot-j0-bis`, `lot-g-codex-ipad-echec-se-dit`, `reserve-reouverture-cartouches-637`, `1007-codex-a-part-avant-suppression` : 20/20. Vitest : 9 569/9 569 (812 fichiers). Suite Playwright complète : **non jouée** (verdict au signal de Grégoire).

## 5. Trouvailles

Deux mots de la même fenêtre parlent encore d'export pour le codex. Hors consigne, non touchés ; ce sont des mots que l'enseignant lit, donc ils remontent :

- l'aide contextuelle (le « i » du titre) : titre « Aperçu avant téléchargement (Défense K-β) », texte « … l'export, AVANT qu'il soit téléchargé » (`js/accompagnement-contenu-popup.js`, l. ~1726) ;
- le nom lu par un lecteur d'écran du même bouton : « Aide : aperçu de l'export » (`js/securite-export-preview.js`, l. ~89).

Disposition proposée : **inscrire**, à ton jugement. Pas au BACKLOG d'office : Grégoire n'a pas vécu ce symptôme.

## 6. À vérifier à l'écran après la prochaine mise en ligne

Menu Codex › « Mettre à jour le codex » : la fenêtre d'aperçu titre « Mettre à jour le codex » et son bouton dit « Mettre à jour ».

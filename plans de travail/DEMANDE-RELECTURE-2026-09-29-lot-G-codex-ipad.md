# Demande de relecture – lot G : « Mettre à jour le codex » sur l'iPad ne dit rien quand il échoue (#988)

> Écrite le 29 sept. 2026, vers 11 h 50 (Toronto), par Claude Code. Répond à `plans de travail/CONSIGNE-DU-JOUR.md` (lot G). Branche `lot-g-codex-ipad`, partie de `main` (`44376e21`). Pas de release : elle attend ta relecture et l'accord de Grégoire sur les mots (§ 4).

## 1 · Ce que le lot fait

Un seul parcours pour « Mettre à jour le codex » et « Enregistrer sous » (`_mettreAJourLeCodex`, `js/codex.js`) :

| Issue | Avant | Après |
|---|---|---|
| Aperçu refusé | muet | muet (seul cas), tentative gardée |
| Fenêtre de choix de Chrome annulée (FSAPI) | muet | **muet, supposition nommée** : `AbortError` n'y vient que de l'usager ; le banc du lot F (g) l'arrête |
| Partage (iPad) rejeté, `AbortError` | muet (« annulé ») | témoin « Codex non mis à jour », modale « Réessayer » · « Télécharger à la place » |
| Partage rejeté, autre erreur | téléchargement en silence, URL libérée aussitôt, « à jour » posé | idem ci-dessus |
| Téléchargement direct | « à jour » posé sans rien savoir | l'usager dit « Il y est » ou « Il n'y est pas » (§ 3) |
| Préparation du fichier en erreur | toast « Erreur » | témoin « Codex non mis à jour : le fichier n'a pas pu être préparé (‹message›)… » |

- **« Réessayer » reprend le MÊME fichier**, sans le regénérer : plus rapide, et le geste est neuf quand `navigator.share` est appelé (hypothèse b de la consigne, activation expirée pendant une longue compression, **non mesurée** : le rapport le dira).
- **URL du téléchargement direct** : libérée après **cinq minutes** (délai long, choisi plutôt que `pagehide` pour ne pas garder la mémoire du fichier toute la séance).
- **La taille se voit avant** : l'aperçu dit « environ ‹taille› » (taille non compressée : les travaux se compressent peu ; nouvelle option `taille` de `previewZipEtConfirmer`, `js/securite-export-preview.js`).
- **La cause devient lisible** : `Codex.derniereTentative()` garde geste, heure, étape atteinte (lecture des données, aperçu, compression, enregistrement du fichier, téléchargement lancé), taille estimée et réelle, essais, stratégie, erreur (nom, message tronqué à 300), issue. Gardée en `sessionStorage` (clé `labo_codex_derniere_maj_codex`, hors `db`, diagnostic de l'onglet) : **une page tuée pendant la tentative se lit « interrompue »** au rapport suivant. Le rapport de bug (`js/rapport-bug.js`) a la section « DERNIÈRE MISE À JOUR DU CODEX » (ou « Aucune tentative dans cet onglet ») et « AVERTISSEMENTS DU CODEX » (les `console.warn` préfixés `[Codex]` ou `📂`, 20 au plus). Ni nom de fichier, ni nom du codex, ni contenu.
- Outils communs étendus : `uiDialogues.demanderAction` (plusieurs gestes nommés + « Fermer ») ; le témoin commun prend un verdict (« Codex non mis à jour ») et `fermerSi(cle)`, qui l'efface à la réussite sans émettre `donnees-enregistrees`.
- **Export sélectif** : inchangé (ni `sansRepli`, ni confirmation), sauf l'URL libérée tard et le texte de l'avertissement.

## 2 · Mesuré en chemin

- **Le journal d'actions voit le clic du menu** dans WebKit (Mac, Playwright) : `clic: #codex-menu-enreg-info "Télécharge un nouveau fichier"`. La lecture de la consigne (§ 2, dernier point) n'est pas confirmée sur ce moteur. **L'absence de ce clic dans le rapport de l'iPad reste inexpliquée** (fait) ; la nouvelle section, par onglet, dira au prochain rapport si la tentative a eu lieu dans le même onglet.
- Aucune régression du lot F : les quatre bancs du lot F, 9/9 verts sur la branche.

## 3 · Ma règle pour le téléchargement direct (point 3.2 de la consigne) — à Grégoire

**En une phrase : l'application ne peut pas savoir si un téléchargement s'est terminé ; le codex n'est dit « à jour » que si tu confirmes avoir trouvé le fichier.** Elle vaut aussi pour les navigateurs sans partage ni fenêtre de choix (Firefox), qui passaient par ce chemin et se disaient « à jour » sans rien savoir.

## 4 · Mots d'écran, à faire accepter par Grégoire avant la release

1. Modale d'échec — titre « Codex non mis à jour » ; texte « Le fichier (environ ‹taille›) n'a pas été enregistré. Si ton appareil manque d'espace, libères-en, puis réessaie. Tes données restent dans l'application. » ; boutons « Fermer » · « Télécharger à la place » · « Réessayer » (Cowork, mot pour mot ; « Fermer » ajouté : sortir sans geste).
2. Témoin commun — « Codex non mis à jour : le fichier (environ ‹taille›) n'a pas été enregistré. Tes données restent dans l'application. »
3. Témoin, préparation échouée — « Codex non mis à jour : le fichier n'a pas pu être préparé (‹message du navigateur›). Tes données restent dans l'application. »
4. Aperçu — sous-titre « ‹N› fichier(s) ou dossier(s) à inclure – environ ‹taille› ».
5. Téléchargement direct — titre « Téléchargement lancé » ; texte « L'application ne peut pas savoir si le téléchargement s'est terminé. Vérifie que le fichier « ‹nom› » (environ ‹taille›) est dans tes Téléchargements. » ; boutons « Il n'y est pas » · « Il y est ».
6. Nouvelles (proposition) — « Si « Mettre à jour le codex » n'arrive pas à enregistrer le fichier, l'application le dit maintenant, avec sa taille, et te propose de réessayer ou de le télécharger à la place. Après un téléchargement, c'est toi qui confirmes que le fichier est bien là. »

Format de taille : « environ 1,0 Go », « environ 350 Mo », « environ 12 Ko ».

## 5 · Preuves

- Banc WebKit `tests/integration/lot-g-codex-ipad-echec-se-dit.spec.js`, 2 essais verts : aperçu refusé (seul muet) ; partage `AbortError`, puis « Réessayer » → `NotAllowedError`, puis réussi (même fichier, aucune nouvelle génération) ; « Télécharger à la place » (URL non libérée, rien de posé avant la réponse, « Il n'y est pas » puis « Il y est ») ; « Fermer » ; page rechargée pendant la tentative → « interrompue ». Pour chaque cas : message, état du menu, section du rapport lue par la vraie fenêtre « Signaler un bug ».
- **Mutations, 8 / 8 rouges**, arbre restauré par copie et empreinte : sortie muette remise ; `revokeObjectURL` immédiat ; « à jour » posé sur un échec ; « à jour » posé après téléchargement sans demander ; section du rapport retirée ; témoin non effacé après réussite ; tentative non gardée au rechargement ; « Réessayer » qui regénère le fichier.
- Vitest : 662 / 662 fichiers, 7 762 essais verts.
- ⚠ `js/securite-export-preview.js` est modifié : `cd tests && npm test` (suite complète) est dû avant le push, au verdict.
- ⚠ Aucune machine ne juge la feuille de partage de l'iPad : la porte du lot F reprend à sa rangée 1.2 après la livraison.

## 6 · Release

**`minor`** : un comportement neuf visible (modale d'échec, confirmation du téléchargement). À la livraison, #988 passe aux corrigés **pour le volet « l'échec se dit » seulement** ; la fiche reste ouverte à dessein tant que l'iPad n'a pas réussi une mise à jour.

## 7 · Où regarder d'abord (cartographie avant)

`sauvegarderVersDestination` avait trois appelants (`actionEnregistrer`, `actionEnregistrerSous`, `actionExporterSelection`) et une exposition (`Codex.sauvegarder`, sans appelant hors `codex.js`, mesuré par grep). Le risque naîtrait (a) dans l'export sélectif si les options fuyaient ; (b) dans le témoin commun, partagé par tous les gestes (verdict par défaut inchangé, `fermerSi` ne touche qu'une clé) ; (c) dans la capture de `console.warn`, posée par `rapport-bug.js` sur toute l'app (elle appelle l'original d'abord et ne garde que le codex).

# PORTES TERRAIN — #468 (L6, boutons qui mentent) · 1.91.2

> **Date** : 21 août 2026 · **Livraison** : 1.91.2 (lot L6 du triage des audits)
> **Artefact interactif** (l'OPÉRATION — ce fichier est la TRACE) :
> <https://claude.ai/code/artifact/4162dce1-e72d-4587-8441-2c2113330218>
> Construit le 22 août par la session cloud depuis CE fichier : la porte n'avait que
> sa moitié versionnée, pas son jumeau opérable. 15 vérifications + 2 décisions
> (D-a et 3.1 portent un champ de saisie, jamais une case — une case ne rend pas un
> verdict). Éprouvé dans Chromium avant publication : 15 bascules, **0 bascule sur les
> décisions**, filtres et export vérifiés, zéro erreur de page dans les deux thèmes.
> ⚠ Le repère de version du §0 dit désormais « **1.91.2 ou plus récent** » : `main` est
> passé à 1.91.8 depuis, et un numéro supérieur ne doit pas se lire comme un échec.
>
> **État : ✅ CLOSE — relevé reçu le 22 août 2026 : 15/15, ZÉRO ÉCHEC, zéro sans objet.**
> Les deux décisions sont rendues (voir §3). Rien de ce lot n'est dû.
> Build relevé : **1.91.8 / 0822-0948**. Note de Grégoire au geste 2.7 (cases du mode
> hybride) : « Enfin, merci ! » — la fonctionnalité était inopérante depuis Beta 95.4.
> Geste 2.13 : champ de mesure vide, ce qui est le résultat ATTENDU — il n'y avait
> aucune ligne rouge à recopier.
> Aucune migration de données dans ce lot — backup non requis (le réflexe Codex reste bon).
> ⚠ Deux gestes de ce lot sont IRRÉVERSIBLES sur tes données : 2.2 (dépôt d'une fiche
> de cours) et 2.8 (suppression d'un gabarit). Les faire sur des éléments de TEST.

## §0 · Préalable

- [ ] 0.1 `git pull`, puis **vérifier « 1.91.2 » en bas de page** après rechargement.

## §2 · Interface — les six gestes qui mentaient

### Cours (CT-13)

- [ ] 2.1 **Bibliothèque de cours › menu ⋮ d'une fiche › « Exporter ».** ⮕ Attendu :
      la fenêtre des métadonnées Creative Commons s'ouvre, puis **un fichier
      `cours-<CODE>-<date>.json` se télécharge**, et la fiche RESTE dans ta sélection.
      (Avant : aucun fichier, et la fiche quittait la sélection en silence.)
      → Ouvrir le fichier : il doit contenir CE cours seul.
- [ ] 2.2 **Menu ⋮ › « Déposer dans les cours disponibles »** (entrée NEUVE) — sur une
      fiche de TEST. ⮕ Attendu : la fiche passe en section « Cours disponibles à
      ajouter » et n'est plus le cours actif. Aucun fichier ne se télécharge.
- [ ] 2.3 **Les deux autres entrées du menu ⋮ n'ont pas bougé** : « Retirer de ma
      sélection » (réversible) et « Supprimer la fiche » (rouge, définitif, refusé si
      la fiche porte des données — garde #449).

### Échelles (CO-05)

- [ ] 2.4 **Éditeur d'échelles : ajouter un niveau, puis en retirer un.** ⮕ Attendu :
      chaque geste va au bout — le message de confirmation s'affiche et la barre
      latérale se met à jour. (Avant : TypeError console, geste interrompu à
      mi-chemin.)
- [ ] 2.5 **Supprimer une échelle de TEST.** ⮕ Attendu : le message « Échelle
      supprimée » s'affiche. (Avant : elle partait vraiment, mais sans un mot.)

### Pratiques (CO-12) et mode hybride (CO-18)

- [ ] 2.6 **Dupliquer une pratique**, puis **dériver une maquette et l'adopter**.
      ⮕ Attendu : dans les deux cas, la pratique **apparaît dans la barre latérale**
      juste après le message de succès. (Avant : « ajoutée à tes pratiques », et
      introuvable.)
- [ ] 2.7 **Pratique en mode hybride › listes Sélection / Obligatoires.** ⮕ Attendu :
      **une case à cocher devant chaque production**, et cocher une case l'assigne à
      la catégorie. (Avant : les titres seuls, aucune case — la fonctionnalité était
      inopérante depuis Beta 95.4.)

### Gabarits de bibliothèque (CO-25)

- [ ] 2.8 **Supprimer un gabarit fourni par défaut** (ex. « [Multi] Grille
      analytique ») **depuis la bibliothèque partagée, puis RECHARGER la page.**
      ⮕ Attendu : il ne revient pas. (Avant : il revenait à chaque chargement.)
- [ ] 2.9 **Bibliothèque de cartouches** : les deux gabarits `[Multi] Rétroaction
      analytique` et `[SPE] Feedback pour révision` ont été RETIRÉS (verdict du
      21 août : schéma en cul-de-sac, « 0 commentaire(s) »). ⮕ Attendu : ils
      n'apparaissent plus. **Décision D-a** : rien d'autre ne doit les remplacer,
      ou tu veux un vrai gabarit de cartouche ancré sur une grille ?
      → **verdict (22 août) : NON** — rien ne doit les remplacer. Les deux gabarits
        restent retirés, et aucun gabarit de cartouche ancré sur une grille n'est à créer.

### Productions (CO-17) — le plus important du lot

- [ ] 2.10 **Sur un cours qui a PLUSIEURS groupes** : ouvrir une production
      existante, cocher des échéances par groupe, enregistrer. Rouvrir la même
      production, **changer seulement le titre**, enregistrer. ⮕ Attendu : les
      échéances par groupe sont **intactes**. (Avant : détruites sans un mot dès que
      le bloc multi-groupes n'était pas affiché.)
- [ ] 2.11 **Le vol de production (#346, mécanisme)** : rendre actif le cours A,
      ouvrir une production du cours A, changer son titre, enregistrer. Puis passer
      au cours B et rouvrir cette production pour la retoucher. ⮕ Attendu : elle
      **reste au cours A**. (Avant : chaque enregistrement la réassignait au cours
      affiché du moment.) ⚠ **Ce correctif ferme le mécanisme, PAS les dégâts déjà
      faits** : si des productions sont déjà mal rattachées, c'est #346, à traiter à
      part.
- [ ] 2.12 **« + Nouvelle production » juste après en avoir ouvert une** sur un
      cours multi-groupes. ⮕ Attendu : le bloc des échéances par groupe est
      **vierge** (aucune case cochée, aucune date héritée).
- [ ] 2.13 **Console pendant tous ces gestes** : rien de rouge. → Copier toute ligne
      inattendue.
- [ ] 2.14 **iPad, léger** : refaire 2.6 et 2.7 au doigt (les cases à cocher du mode
      hybride sont neuves à l'écran — leur zone tactile n'a jamais été éprouvée).

## §3 · Décisions à rendre

- [ ] 3.1 **Le menu ⋮ d'une fiche de cours compte maintenant QUATRE entrées** :
      Exporter · Déposer dans les cours disponibles · Retirer de ma sélection ·
      Supprimer la fiche. « Déposer » et « Retirer » ont le même effet sur la fiche
      (elle quitte ta sélection) — « Déposer » y ajoute en plus les métadonnées
      Creative Commons. Est-ce que les deux se justifient, ou faut-il n'en garder
      qu'une ? → **verdict (22 août) : OK** — les quatre entrées sont gardées telles quelles.

## §4 · Ce que la session n'a pas pu vérifier

- Rien n'a été rejoué dans un vrai navigateur : tout est éprouvé par sentinelle
  Vitest (30 essais, 4 break-tests) sur des sandboxes. Les six gestes du §2 sont
  donc à voir de tes yeux — c'est le sens de cette porte.
- `verrouillerEvaluation` reste **sans point d'entrée dans l'interface** : le champ
  `verrouille` est désormais préservé, mais rien ne permet encore de verrouiller une
  production. Constat noté, hors périmètre du lot.
- Le nom de fichier de 2.1 épure le code de cours (tout ce qui n'est ni lettre, ni
  chiffre, ni `-`/`_` devient `-`). À vérifier sur un code de cours réel.

## Au retour — FAIT le 22 août 2026

1. **Aucun échec** : rien à verser au BACKLOG.
2. Les deux décisions sont rendues : **D-a NON** (rien ne remplace les gabarits retirés),
   **3.1 OK** (les quatre entrées du menu restent).
3. Fichier mis à jour. ⮕ **Le lot #468 est CLOS, terrain compris.**

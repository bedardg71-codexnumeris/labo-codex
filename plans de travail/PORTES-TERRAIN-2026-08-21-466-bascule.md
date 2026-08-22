# PORTES TERRAIN — #466 (L4, bascule de trimestre) · 1.91.1

> **Date** : 21 août 2026 · **Livraison** : 1.91.1 (lot L4 du triage des audits)
> **Artefact interactif** : `portes-terrain-466-bascule.html`, publié : <https://claude.ai/code/artifact/dac4d06b-9ee0-46ca-90a3-9a1772e43243>.
> **État : EN ATTENTE DU RELEVÉ.** Ce qui échoue devient un item de backlog.
> Pas de migration de données dans ce lot — backup non requis (le réflexe Codex reste bon).

## §0 · Préalable

- [ ] 0.1 `git pull`, puis **vérifier « 1.91.1 » en bas de page** après rechargement.

## §2 · Interface — le scénario d'une rentrée, en 6 gestes

- [ ] 2.1 **Créer un trimestre de TEST avec activation immédiate** (« + Nouveau
      trimestre », répondre oui à l'activation). ⮕ Attendu : l'en-tête ne propose
      PLUS le groupe-cours de ton vrai trimestre ; le formulaire d'assemblage n'offre
      plus les horaires de l'ancien ; l'écran Trimestre montre le nouveau partout.
      (Avant : le contexte de l'ancien survivait — c'était le Majeur CT-05.)
- [ ] 2.2 **Revenir à ton vrai trimestre par le sélecteur.** ⮕ Attendu : ton
      groupe-cours actif est restauré partout (en-tête, carte résumé) — pas de
      « Aucun groupe-cours sélectionné ». Supprimer ensuite le trimestre de test.
- [ ] 2.3 **Journée sans cours à cheval** : ouvrir une journée en « Modifier »,
      puis basculer de trimestre SANS enregistrer. ⮕ Attendu : le formulaire se
      referme tout seul. (Avant : « Journée modifiée » ensuite, sans rien écrire.)
- [ ] 2.4 **Grille à cheval** : ouvrir une grille en édition, basculer de
      trimestre, puis « Enregistrer la grille ». ⮕ Attendu : SOIT une nouvelle
      grille est créée dans le trimestre courant (copie locale — aucune perte,
      c'est le mode création), SOIT un message « n'appartient pas au trimestre
      actif ». Ce qui ne doit PLUS arriver : « sauvegardée ! » sans aucune écriture.
- [ ] 2.5 **Type de critère** : dans l'éditeur de grille, changer le type d'un
      critère (ex. holistique → algorithmique). ⮕ Attendu : la liste des critères
      reste affichée. (Avant : « Aucun critère défini » jusqu'au rechargement.)
- [ ] 2.6 **Console pendant ces gestes** : rien de rouge, et aucune nouvelle ligne
      « clé ABSENTE des registres ». → Copier toute ligne inattendue.
- [ ] 2.7 **iPad, léger** : refaire 2.1-2.2 au doigt quand l'iPad sera ouvert
      (le sélecteur d'en-tête et la carte doivent suivre pareil).

## §4 · Ce que la session n'a pas pu vérifier

- Le croisement de cartouches (CO-20) est fermé au code et par sentinelle, mais le
  geste réel (« créer une nouvelle cartouche après en avoir ouvert une autre, puis
  sauvegarder ») n'a pas été rejoué à l'écran — le faire au passage si tu es dans
  Rétroactions.
- `rafraichirVuesApresCours` était MORTE à la bascule depuis des mois et revit :
  si un écran se comporte bizarrement JUSTE après une bascule, le dire — c'est
  peut-être elle qui rafraîchit désormais quelque chose qui ne l'était jamais.
- Safari/iPad : rien d'éprouvé en session (2.7).

## Au retour

1. Chaque échec → item BACKLOG avec son numéro de porte.
2. Mettre ce fichier à jour (état, date).

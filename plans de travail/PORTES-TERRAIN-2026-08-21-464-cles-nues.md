# PORTES TERRAIN — #464 (L2, clés nues) · 1.89.0

> **Date** : 21 août 2026 · **Livraison** : 1.89.0 (lot L2 du triage des audits)
> **Artefact interactif** (l'OPÉRATION — ce fichier est la TRACE) :
> `portes-terrain-464-cles-nues.html`, publié : <https://claude.ai/code/artifact/20854df0-6124-4ed5-b45c-48b643e3fa7a>.
> **Règle** : ce qui échoue devient un item de backlog, pas une note mentale.
> **État : RELEVÉ REÇU le 21 août 2026 — 8 passées · 1 échec (2.1) · 1 mesure (2.5).**
> · §1 : 5/5 ✓ (migration silencieuse — « aucune » ligne : les résidus historiques avaient
>   déjà été purgés par l'ancienne forcerMigration ; durée 50 min préservée ; Safari ✓).
> · **2.1 ✗ (4 échelles au lieu de 8)** : diagnostic probable = tombstones réels de Grégoire
>   (échelles supprimées par le passé, `ressourcesSupprimees`) que la migration RESPECTE —
>   comportement voulu, attendu de la porte mal calibré. Script console de confirmation envoyé ;
>   verdict en attente. Si les tombstones ne couvrent pas les 8 → enquête à rouvrir.
> · **2.5 (mesure)** : warn `cle(chaîne vide)` attrapé → VRAI BUG : la file d'attente d'import
>   des travaux n'a jamais été namespacée (travaux-import.js:750/787 — le hack rendait '').
>   **CORRIGÉ dans la foulée (1.90.1)** : clé réelle `pipeline_queue` inscrite au registre,
>   ratchet « zéro cle(chaîne vide) » ajouté à la sentinelle (break-testé rouge).

## §0 · Préalable — dans cet ordre, sans en sauter

- [ ] 0.1 ⚠⚠ **Backup Codex AVANT tout** (les migrations one-shot tournent au premier
      démarrage après la mise à jour — export Codex USB comme d'habitude).
- [ ] 0.2 `git pull` sur le Mac, puis **vérifier « 1.89.0 » en bas de page** après
      rechargement. Un faux rouge sur build en retard est indétectable au récit.
- [ ] 0.3 Ouvrir la **console du navigateur AVANT** le premier rechargement (les
      messages de migration ne s'affichent qu'une fois).

## §1 · ⚠⚠ Données — le premier démarrage (Chrome d'abord, puis Safari)

⚠ La migration est PAR NAVIGATEUR : chaque copie (Chrome, Safari, iPad) migre à
SON premier démarrage. Refaire 1.1-1.4 sur Safari après Chrome.

- [ ] 1.1 **Recharger l'app, lire la console** : des lignes « [Trimestres] #464 :
      résidu nu « … » rapatrié / purgé » peuvent s'afficher. → **Copier ces lignes
      dans le champ de mesure** (aucune ligne = aussi une réponse valable).
- [ ] 1.2 **Durée de période** (Calendrier › Trimestre › réglages horaire) : la
      valeur affichée est celle d'avant la mise à jour. → **Noter la valeur.**
- [ ] 1.3 **Bilan réflexif** : les données existantes (questionnaires, résultats)
      sont toujours là, sous le trimestre actif.
- [ ] 1.4 **Pratiques du trimestre actif** : la liste de la sidebar est identique
      à celle d'avant (aucune pratique disparue, aucune ancienne ressuscitée).
- [ ] 1.5 **Refaire 1.1 à 1.4 sur Safari** (sa migration à lui).

## §2 · Interface

- [ ] 2.1 **Bibliothèque des échelles** (« Consulter la bibliothèque ») : les 8
      échelles d'exemple (Chimie organique, Interfaces/BD, Anatomie, Philosophie,
      Littérature, Comptabilité, Géographie, Philosophie 101) y figurent, auteur
      « Labo Codex ».
- [ ] 2.2 **Trimestre de test** : en créer un, ouvrir Conception › Échelles →
      il ne contient QUE « Échelle générique (exemple) » (plus les 8 d'office).
      Supprimer ensuite le trimestre de test.
- [ ] 2.3 **Mode démonstration** : activer → tout s'affiche normalement (console :
      un message « rafraîchi depuis 20.8 » possible, normal) ; désactiver →
      retour propre, rien de démo ne traîne dans le réel.
- [ ] 2.4 **Profil étudiant** (un étudiant au hasard) : les niveaux I-D-M-E et la
      note affichés sont les mêmes qu'avant la mise à jour. → **Noter le DA
      (anonyme) et la note vérifiée.**
- [ ] 2.5 **Console après usage normal** (5 minutes de navigation) : des warns
      « cle('…') : clé ABSENTE des registres » ? → **Copier chaque ligne** (ce
      n'est PAS un échec : c'est une mesure d'entrée — chaque ligne est une clé
      qu'on inscrira au registre).

## §3 · Décisions

Aucune — les quatre décisions de fond du triage sont déjà tranchées.

## §4 · Ce que la session n'a pas pu vérifier

- La migration sur TES données réelles (profils Chrome/Safari/iPad — d'où §1).
- L'iPad : mêmes portes §1-§2 quand tu l'ouvres (sa copie migrera à ce moment-là).
- Le régime « clés nues » après suppression du dernier trimestre (CT-21a) : sera
  fermé par le lot L1/#463.
- Les lecteurs ternaires morts de `seancesHoraire` (7 sites) : retrait au lot L7.

## Au retour

1. Chaque échec → item BACKLOG avec le numéro de porte.
2. Chaque ligne de console copiée en 2.5 → inscription de la clé au registre.
3. Mettre ce fichier à jour (état, date, ce qui reste).

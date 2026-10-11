# Consigne du jour – lot 8 : le Cadre, les petits défauts sans décision (sur une branche)

> Écrite par Cowork le 11 octobre 2026 à 8 h 58 (Toronto, mesurée par `date`). Remplace la consigne du lot 7, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-11-lot7.md`. **La release du soir est décrite dans les deux archives `_ancienne-CONSIGNE-DU-JOUR-2026-10-11-lots5-6.md` et `_ancienne-CONSIGNE-DU-JOUR-2026-10-11-lot7.md` : relis-les au signal de Grégoire.** Tu peux commiter ce fichier sur `main` avant de créer la branche.

## Décision de Grégoire (11 oct., vers 8 h 55, de vive voix)

**La release de ce soir ne porte que les lots 5, 6 et 7** (`main` jusqu'à `479c37f6` plus le commit de ce fichier). **Le lot 8 se code maintenant, sur une branche `lot8-cadre` partie de `main`**, avec sa relecture ; il ne rejoint `main` qu'**après** la mise en ligne de ce soir, et sera mis en ligne demain, à part. Motif : si le verdict du soir rougit, on sait dans quel paquet chercher.

Au signal du soir : reviens sur `main` avant la release ; aucun commit du lot 8 ne doit y être.

## Rappels

Cadence : pas de verdict ni de release dans la journée. « Sans Grégoire » : aucune décision de pédagogie, **aucune écriture dans des données déjà écrites chez l'utilisateur**, aucune zone protégée (`js/config.js`, `js/navigation.js`, `noms_stables.json`), **aucune suppression de données d'utilisateur**. Les mots d'écran neufs reviennent à Grégoire, par Cowork.

## Lot 8 – ce qu'il fait

**Remesure d'abord** chaque fiche au code actuel : elles datent d'août (audit Cadre, `TRIAGE-audits-2026-08-21.md`), et le lot E2 du 28 sept. en a déjà réglé une partie (`DEMANDE-RELECTURE-2026-09-28-lot-E2-cadre-eleves.md`, ligne de #477). Une fiche morte se ferme sur sa preuve.

1. **#477** – annuler un horaire qui colle (« Fermer » ne vide pas l'horaire mémorisé), trimestres en double, schéma de l'outil de diagnostic. **Les doublons se règlent à la lecture** (dédoublonner ce qu'on affiche et ce qu'on calcule) ; la liste des trimestres enregistrée n'est pas réécrite.
2. **#472** – le nom du groupe-cours recalculé à l'affichage, et la carte et l'en-tête rafraîchis après l'enregistrement d'un horaire ou d'un cours.
3. **#474** – « mon profil » ne doit plus être remplacé par le dernier profil d'enseignant modifié : un marqueur explicite. **Sans la purge** : la fiche demande aussi d'effacer `profilEnseignant` à la suppression d'un profil ; ne le fais pas (suppression de donnée), inscris-le à la fiche pour Grégoire.
4. **#475** – le compteur « X/5 configurés » ne compte une référence que si ce qu'elle désigne existe.
5. **#1018** – « Clore » offert sur le trimestre actif, puis toujours refusé. **Décision de Cowork : retirer l'offre** sur le trimestre actif (un geste qui ne peut que refuser ne s'offre pas ; aucun mot neuf). Si le retrait laisse le menu vide ou bancal, écris-le et arrête-toi sur cette fiche.
6. **#990** – au démarrage, la saisie des présences s'initialise avant que le trimestre soit connu : elle doit attendre `db-ready` (famille de #142) et ne plus écrire de clés nues. **Le stock** (les clés nues déjà écrites chez Grégoire : `calendrierComplet`, `presences_date`, `presences_groupe`, `presences_tri`) **ne se nettoie pas** : assumé, écrit à la fiche. Banc sous WebKit, la sonde de la fiche (« trimestres » hors du localStorage).

**Aucun mot d'écran changé.** Si un correctif en demande un, écris-le dans le code et cite-le.

## Puis arrête-toi

Commits séparés **sur `lot8-cadre`**. Vitest complet. Demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-11-lot8-cadre.md` (sur la branche). Rapport court à Grégoire en gestes d'utilisateur, une ligne par supposition, ta proposition d'un item de Nouvelles (pour la release de demain). Pas de release, pas de fusion dans `main`.

## Ajout de Cowork (9 h 13) – une fiche urgente entre en tête du lot 8

Trouvaille de la session de mesure en lecture seule (`DECISIONS-A-PRENDRE-2026-10-11.md`, branche `claude/inspiring-mccarthy-99htj8`), **confirmée au code par Cowork sur `origin/main` (1.197.0)** : « Recalculer les captures » (`lancerReconstructionRetroactive` → `reconstruireSnapshotsHistoriques`, `js/snapshots.js` ≈ 851-855) remet **`interventions: []`** avant de reconstruire les seules captures hebdomadaires. Les captures avant/après des interventions RàI sont prises au moment de l'intervention et rien ne les reconstruit : un clic les efface pour de bon. La confirmation (≈ 1113) ne parle que des captures hebdomadaires, et les Nouvelles conseillent ce bouton (`js/changelog-data.js` ≈ 587).

**À faire, sur `lot8-cadre`, en premier commit de ce qui reste** : la reconstruction **garde** les captures d'intervention en place (et `dernierSnapshotIntervention`) ; elle ne remplace que les hebdomadaires. Inscris la fiche au BACKLOG avec un numéro neuf. Banc avec break-test : des captures d'intervention présentes avant la reconstruction sont identiques après. Aucun mot d'écran changé (le texte de la confirmation devient vrai). Ce qui a déjà été effacé chez les utilisateurs ne se récupère pas : écris-le.

Grégoire est prévenu de ne pas cliquer sur ce bouton d'ici la mise en ligne du correctif.

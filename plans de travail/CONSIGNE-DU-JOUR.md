# Consigne du jour – la fenêtre d'aperçu du codex dit « Mettre à jour le codex » (samedi 24 octobre 2026)

> Écrite par Cowork le samedi 24 octobre 2026 à 8 h 46 (Toronto, mesuré par `date`), sur `main` = `origin/main` = `35745bdc` (1.216.2 en ligne). Elle remplace l'état neutre du 23 oct. à 19 h 46, archivé sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-23-neutre-1.216.2.md`.
> Retour de Grégoire (24 oct., 8 h 45, Chrome, capture vue par Cowork) : avant d'écrire le codex, la fenêtre d'aperçu titre « Confirmer l'export codex » et propose « Télécharger ». Ce n'est plus un export ni un téléchargement : depuis sa décision D4 du 26 sept. 2026, le codex a un seul verbe, « Mettre à jour le codex » (`js/codex.js`, l. ~3198, libellé du menu).

## 0. Avant tout

- Aucune suite ne tourne en arrière-plan (règle 5).
- Un commit de docs seul, fichiers nommés : cette consigne et son archive.

## 1. Les mots (validés par Grégoire à 8 h 46, mot pour mot)

Dans la fenêtre d'aperçu, **pour le codex seulement** :

- Titre : **Mettre à jour le codex**
- Bouton : **Mettre à jour**

Le sous-titre (« N fichiers ou dossiers à inclure – environ X Mo »), la liste, la note et « Annuler » ne changent pas.

## 2. Où

- La fenêtre est commune (`js/securite-export-preview.js`, `_afficherModale`) : elle sert aussi l'archive (`reserve.js`), la configuration pédagogique (`import-export.js`) et la bibliothèque de tampons (`tampons-bibliotheque.js`), qui sont de vrais fichiers téléchargés : **pour eux, rien ne change** (« Confirmer l'export … », « Télécharger »).
- Le titre et le libellé du bouton deviennent des options de l'appelant ; `js/codex.js` (l. ~626) passe les mots ci-dessus. Mets à jour les commentaires qui parlent de « Télécharger » pour le codex (l. ~615-622 de `codex.js`, focus initial dans `securite-export-preview.js`).
- **Mesure d'abord** quels gestes passent par cet aperçu dans `codex.js` (« Mettre à jour le codex », « Enregistrer sous », le codex à part avant une suppression, d'autres ?). Les mots validés valent pour « Mettre à jour le codex » et « Enregistrer sous » (même verbe partout, D4). Si **le codex à part avant une suppression** passe aussi par là, **n'invente pas ses mots** : garde-lui provisoirement ceux du codex, et propose dans la demande de relecture le titre et le bouton qui lui conviendraient ; Cowork les soumettra à Grégoire.
- Un test qui lit le titre et le bouton pour le codex et pour un autre appelant (l'archive), break-test.

## 3. Clôture

- **Pas de release, ni verdict, ni push** : ce lot attend d'autres lots du jour (une release et un verdict par jour, au signal de Grégoire).
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-apercu-codex-mots.md`.
- Termine par le geste à vérifier à l'écran après la prochaine mise en ligne : menu Codex › « Mettre à jour le codex » ; la fenêtre d'aperçu dit « Mettre à jour le codex » et son bouton « Mettre à jour ».

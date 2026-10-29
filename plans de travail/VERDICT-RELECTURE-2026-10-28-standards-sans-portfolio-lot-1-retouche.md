# Verdict – Des standards sans portfolio, lot 1 : la retouche (`c1dadef1`)

> Cowork, mercredi 28 octobre 2026, 21 h 45 (Toronto). Relu : le rapport de Claude Code relayé par Grégoire (21 h 44) ; le diff de `c1dadef1` (`pratique-registre.js`, `pratique-sommative.js`, `profil-etudiant-actions.js`, `profil-etudiant-sections-affichage.js`) ; `.note-finale-non-evalue` existe (`styles.css:13893`). Pas relancé par Cowork.

## Verdict : accepté, avec une retouche d'une ligne

- **R1** : conforme ; le pool sans « Artefact » est fait de toutes les productions hors conteneur et terminale ; commentaires vrais.
- **R3** : conforme, au caractère près, aux deux récits.
- **R2, supposition 2** (la carte n'écrit plus « Basée uniquement sur le portfolio… » quand la note manque) : **acceptée** ; la phrase décrivait une note qui n'existe pas.
- **R2, supposition 1** (le bouton de la carte retiré quand la cause est propre à l'étudiant·e) : **refusée**. L'erreur est dans la consigne de Cowork, qui disait « aucun bouton » en pensant au bouton de l'alerte (infobulle « vérifier ses paramètres »). Le bouton de la carte est autre chose : la carte l'avait déjà avant le lot, et son infobulle dit « Modifier le statut (provisoire / finale) et les pondérations… », un chemin utile à l'enseignant·e. Il reste dans tous les cas.

## La retouche (R2 bis)

Dans `_boutonReglagesCarteNote` (`js/profil-etudiant-sections-affichage.js`), retire la condition `|| details.causeNoteAbsente`. Mets à jour l'essai Playwright : CHIM-6 et GREG-3 montrent la carte, la phrase, **le bouton de la carte**, et **ni l'alerte ni son bouton** ; une erreur de configuration garde l'alerte. Break-test de l'essai. Vitest depuis `tests/`.

## Pour le lot 5 (note de Cowork)

- La carte dit « Basée uniquement sur le portfolio (évaluation terminale non complétée) » aussi dans une pratique sans « Artefact » (Q1 : « productions » partout). Mot neuf à soumettre à Grégoire avec ceux du lot 5.

## Clôture

Commit de docs seul d'abord, fichiers nommés : ce verdict, `VERDICT-RELECTURE-2026-10-28-standards-sans-portfolio-lot-1.md` (notes pour les lots 4 et 5 ajoutées après `73a25a16`), `IDEE-2026-10-19-interface-simple-d-abord.md` (la phrase de Grégoire du 28 oct.). Puis un commit pour le code. Le texte de l'accueil et les deux icônes, dans l'arbre, ne sont pas de ce lot : n'y touche pas. Pas de release, de verdict ni de push sans le signal de Grégoire.

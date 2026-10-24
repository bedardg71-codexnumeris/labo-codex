# Verdict de relecture – la fenêtre d'aperçu du codex dit « Mettre à jour le codex »

> Cowork, samedi 24 octobre 2026, 9 h (Toronto). Relu : `ea1d2a8a` (le diff entier), la demande `DEMANDE-RELECTURE-2026-10-24-apercu-codex-mots.md`, le banc `apercu-codex-mots-1024.spec.js`.

## Verdict : accepté

- Le diff fait ce que dit la consigne, et rien d'autre : deux options de l'appelant dans `previewZipEtConfirmer`, le défaut inchangé pour l'archive, la configuration et les tampons ; `previewJsonEtConfirmer` non touché (ses deux appelants téléchargent vraiment).
- Les mots passent par `textContent` (titre, bouton) : aucune donnée en HTML.
- La mesure préalable est faite et tracée (tableau du § 1 de la demande) ; le codex à part n'a pas reçu de mots inventés, conformément à la consigne.
- Le banc ouvre la vraie fenêtre par les vrais gestes et lit titre et bouton, des deux côtés ; break-test démontré des deux côtés.

## Remarques (aucune ne bloque)

1. Le commentaire du `<script>` de `securite-export-preview.js` dans `index.html` dit encore « Beta 99.41 : #256-bis … » : le jeton a changé, pas la note. **Commenter et oublier** : à compléter au prochain passage sur ce fichier.

## Dispositions

- **Les mots du codex à part** (§ 3 de la demande) : soumis à Grégoire le 24 oct. à 9 h – titre « Écrire le codex à part », bouton « Écrire ». Codés dans un petit lot complémentaire après sa réponse, APRÈS le lot du verrou dans la palette Annotation.
- **L'aide du « i » et le nom lu par le lecteur d'écran** (§ 5) : **inscrit**, dans ce même lot complémentaire. Décision de Cowork : des mots qui valent pour TOUS les appelants de la fenêtre (une seule aide, pas de variante), sans « export » ni « téléchargement », et sans le jargon interne « Défense K-β » qui s'affiche aujourd'hui à l'enseignant. Les mots exacts seront proposés dans la consigne complémentaire.

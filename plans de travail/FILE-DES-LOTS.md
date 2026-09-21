# File des lots – tenue par Cowork

> Mise à jour le 21 septembre 2026, 14 h 30 (Toronto) — par Claude Code : « les trois derniers « artefact » du PDF de synthèse » est sorti, poussé en 1.152.6 (`91d4d15d`). Reste tenu par Cowork. Un lot entre ici quand Grégoire a dit « oui » ; il en sort quand il est poussé.

1. Tranchées le 17 sept., code seulement : le suffixe « pér. » d'une séance d'horaire (#888) ; une seule carte « Exporter des travaux » (#895).
2. À Grégoire : la phrase de la barre « Assiduité » du groupe quand aucune séance ne porte de périodes (#830) ; la disposition de F4-2 (« En prévision de l'EUF » pour les critères d'avant le 4 sept.) ; F3-6 (l'export pour la recherche compte les niveaux par I / D / M / E).

## Cap fixé par Grégoire le 21 sept. à 13 h 08

1. Les demies de Léa : ✅ poussé en 1.152.5 (`518a79c4`).
2. Puis **les dix fiches de notation encore ouvertes** : ce qui se passe quand la pratique n'est pas la sienne (#710, #711, #712, #713, #714, #716, #717, #719, #854, #900). À remesurer et à grouper en lots par Cowork.
3. Puis **la synthèse des rétroactions** : son prochain « Labo » portera là-dessus.

## Les dix fiches de notation, remesurées et groupées par Cowork (21 sept., 14 h 29)

Remesure rapide au code (grep, pas exécuté) : les constats tiennent encore — `obtenirPratiqueActiveGroupeCours` rend `'sommative'` par défaut (modes.js ≈ 1352) pendant que `PRATIQUE_DEFAUT = 'standards'` (pratique-registre.js:29) ; `obtenirConfigPratiqueActive` ne lit que `.configuration` (portfolio.js ≈ 1176) ; le gestionnaire tient `'specifications'` pour une pratique codée en dur (pratique-manager.js:52) ; `calculerPerformanceHistorique` n'existe que chez la sommative et la STD ; la sommative lit encore `e.da` / `e.note` (pratique-sommative.js:317-319).

- ~~**Lot N1**~~ — **SORTI DE LA FILE : livré en 1.153.0 (N1a + N1b), poussé le 21 sept. 2026 à 19 h 30 (`a37d50bf`).** Le constat de didactique (deux échelles pour le niveau de la note globale d'une Standards) part avec N2.
- **Lot N2 – Le P historique suit la note du cours** (#716). Dépend de N1 (sous DEN, l'historique passe par la même résolution que #719). Sommative : lire `etudiantDA` / `noteFinale` ; SPE et DEN : plus de conversion IDME en dur.
- **Lot N3 – Le panneau « Développement des habiletés » lit la note, et n'écrit rien** (#714). Isolé ; aucune question.
- **Lot N4 – Spécifications : le plancher de 50 et la réédition** (#713 volet plancher, #854 volet SPE). ⚠ **Didactique, à Grégoire** : un·e élève qui n'atteint aucun forfait reçoit 50 « final » — que doit dire la note ? Plus : rééditer une SPE par l'assistant ramène le seuil à 70 et perd ses jetons.
- **Lot N5 – Dénotation : une cible renommée ne plafonne plus en silence** (#717). **À Grégoire** : ids stables à la création (recommandé) ou message.
- **Lot N6 – Zéro-dette : les réglages que rien ne lit** (#900). Retirer du CODE ce qui écrit des champs sans lecteur ; rien n'est effacé des données déjà écrites. À joindre à un lot qui passe par l'assistant.

Ordre recommandé : N3, N2, N4, N5, N6 (N1 livré).

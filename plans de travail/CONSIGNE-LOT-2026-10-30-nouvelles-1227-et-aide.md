# Consigne – Les Nouvelles de la 1.227 et une phrase de l'Aide

> Cowork, vendredi 30 octobre 2026, 14 h 17 (Toronto), sur `main` = `7dd18636`. Textes validés par Grégoire à 14 h 15 (« ok pour les Nouvelles »). La phrase de l'Aide lui a été soumise dans le même message ; Cowork l'y inclut, c'est une correction de fait.

## 1. Les Nouvelles 1.227 (`js/changelog-data.js`, l'entrée 1.227, pas une nouvelle entrée)

Mot pour mot, insécables en `&nbsp;`, apostrophes typographiques. Le commentaire dit : validé par Grégoire le 30 oct. 2026 à 14 h 15, proposé par Cowork.

- **Titre** : Le niveau RàI comparé au groupe-cours, et des signaux qui suivent tes réglages
- Le niveau RàI d’un·e étudiant·e compare la moyenne de ses copies à celle de son groupe-cours, dès 2 copies et 5 étudiant·es avec copie. Au-dessus du repère de maîtrise de ton échelle, pas de signal. Sous la note de passage, c’est au moins le niveau 2, sauf si la moyenne du groupe l’est aussi : le signal vise alors tout le groupe.
- Le pattern et le défi nomment le besoin sans fixer le niveau. Une intervention déjà enregistrée garde son niveau d’alors.
- A et C suivent partout les trois seuils de Labo › Outils d’observation : 95, 90 et 85 %, en quatre paliers, si tu ne les as jamais changés. Tu les avais réglés ? « Remettre les valeurs par défaut » prend les nouveaux.
- P suit les repères de l’échelle de tes copies, dans toutes les pratiques ; sans repère, seule la note de passage le signale. Les barres de l’Aperçu ont les mêmes bornes que les pastilles.
- La note du cours ne change pas.

Vérifie avant d'écrire, et arrête-toi si l'un est faux : « dès 2 copies et 5 étudiant·es avec copie », « Au-dessus du repère de maîtrise […] pas de signal » (`classerNiveauDansLeGroupe`), le libellé réel du bouton « Remettre les valeurs par défaut ».

## 2. L'Aide « Repérer les patterns » (`index.html`, vers la ligne 11026)

Remplacer « Le pattern nomme le besoin sans fixer le niveau : le niveau compare la moyenne des copies au groupe-cours (voir la carte juste au-dessus). » par :

> Le pattern nomme le besoin sans fixer le niveau : le niveau compare la moyenne des copies au groupe-cours (voir la carte juste au-dessus). Seule « Non-participation », sans copie à comparer, donne le niveau 3.

Motif (relecture a posteriori de `1aa8393c`) : `determinerNiveauRaiPedagogique` fixe le niveau 3 pour « Non-participation » (`js/profil-etudiant-calculs.js:1960-1963`) ; plus aucun texte d'aide ne le disait. Garde : `sentinelle-aide-2026-10-28-lot-2c-bis.test.js:146` lie ce texte au niveau 3 que rend le code pour un·e étudiant·e présent·e sans copie (pas seulement la présence de la chaîne). Break-test.

## 3. Fin

Commit, Vitest entier, specs WebKit touchées. **Pas de release maintenant** : la 1.227.1 part ce soir, avec le verdict complet, au signal de Grégoire (cadence du 11 oct.). Rapport d'une ligne par point dans `RELAIS.md`.

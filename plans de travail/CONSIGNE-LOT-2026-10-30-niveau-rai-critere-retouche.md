# Consigne – La retouche du niveau RàI au critère, et les Nouvelles de la version du soir

> Cowork, vendredi 30 octobre 2026, 17 h 30 (Toronto), sur `main` = `234e1da3`. Source : `VERDICT-RELECTURE-2026-10-30-niveau-rai-critere.md` (non commité : commite-le d'abord, avec `TEXTES-2026-10-30-aide-rai-niveau-critere.md`, non suivi lui aussi). Les numéros renvoient à ses constats.

## 1. Finir

C1, C2, C3 (le prédicat unique et sa lecture par la carte RàI ; le reste inscrit), C4, C5, C6, T3 du verdict, chacun avec le test qui le garde (break-test). Les phrases neuves ou changées vont dans la liste des mots à valider ; pour C4, la formulation est déjà tranchée par Grégoire (« En attente » avant la note). Inscrire les points de la section « Inscrire et continuer » et T2 (« note provisoire » en sommative : prochain lot, mots à soumettre à Grégoire).

## 2. Les Nouvelles de la version du soir (nouvelle entrée, la 1.227 reste telle quelle)

**Validées par Grégoire le 30 oct. à 18 h 07 (« je valide »), mot pour mot.** Proposées par Cowork ; insécables en `&nbsp;`, apostrophes typographiques. Écris-les dans ce lot :

- **Titre** : Le niveau RàI suit ton seuil de réussite
- Le niveau RàI d’un·e étudiant·e ne dépend plus de son groupe : il suit ton seuil minimal de réussite, le repère « Suffisant à partir de » de ton échelle, ou 60 % sans repère.
- Niveau 2 : la note du cours à ce jour sous ce seuil, ou « Difficulté persistante » même si la note tient. Niveau 3 : la note sous ce seuil avec un critère des fondations aussi en dessous, ou « Non-participation ».
- Avant que la note du cours s’affiche, le niveau reste « En attente », sauf « Difficulté persistante », « Non-participation » ou un signalement diagnostique.
- Un palier qui lève un signalement diagnostique peut maintenant fixer le niveau 2 ou 3, jusqu’à ce que la note du cours s’affiche. Le signalement se lève aussi quand le nombre d’erreurs est saisi directement.
- L’Aide dit tout ce qui fixe le niveau, et ce qui ne le fixe jamais : la place dans le groupe, l’inscription aux services adaptés, l’assiduité et la complétion.
- La note du cours ne change pas.

Vérifie avant de les écrire, et arrête-toi si l'une est fausse : chaque phrase contre le code, en particulier la troisième (« En attente » et ses trois exceptions) et la quatrième (le compte d'erreurs saisi directement est bien le champ `erreurs` de `8e14b131`).

## 3. Fin

Commit, Vitest entier, specs WebKit touchées ; pas de push, pas de release. Rapport d'une ligne par point. Cowork relit ; ensuite seulement, au signal de Grégoire (tout fermé), la release et le verdict complet.

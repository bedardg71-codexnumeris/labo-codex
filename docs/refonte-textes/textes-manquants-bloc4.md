# Bloc 4 — Textes manquants (bannière d'accueil, états vides, transitions)

**Statut** : Validé (19 avril 2026)  
**Charte de référence** : `plans de travail/PLAN-REFONTE-TEXTES-ACCOMPAGNEMENT.md`, section 1  
**Fichier cible** : à déterminer selon l'implémentation technique

---

## Bannière d'accueil (nouvel utilisateur)

**Contexte** : affichée sur la page d'accueil quand aucun groupe-cours n'est configuré.

**Bienvenue dans Labo Codex**

Labo Codex numérise le travail que tu fais déjà : planifier ton cours, concevoir tes activités d'apprentissage, évaluer les travaux, suivre la progression de tes étudiant·es. Tu y poses les mêmes gestes que sur papier avec calculette ou tableur, mais dans un seul outil portable.

**Par où commencer ?** Configure ton trimestre, ton cours et ton groupe dans Réglages. C'est la même information que dans ton plan de cours. Tu la saisis une fois, l'application s'en sert partout.

---

## États vides — Étape 1 : Numérisation

### Réglages — Groupe d'étudiant·es
*Condition : aucun·e étudiant·e ajouté·e*

Aucun·e étudiant·e pour le moment. Ajoute-les séparément ou importe ta liste depuis un tableur ou le système de gestion institutionnel. Le format attendu est affiché dans le panneau d'import.

### Réglages — Groupe-cours
*Condition : aucun groupe-cours assemblé*

Aucun groupe-cours configuré. Un groupe-cours relie ton trimestre, ton cours, ton groupe, ton horaire et ta façon de construire la note. C'est lui qui détermine ce que tu vois partout dans l'application.

### Structure — Productions
*Condition : aucune production définie*

Aucune production définie. Une production, c'est une occasion pour tes étudiant·es de mettre en pratique ce qu'ils et elles apprennent — un exercice, un travail, un examen. Commence par créer tes productions avec leurs pondérations et échéances.

### Structure — Grilles
*Condition : aucune grille créée*

Aucune grille de critères. Crée ta première grille comme tu le ferais sur papier : nomme tes critères, choisis leur type (holistique, analytique ou algorithmique) et répartis les pondérations pour totaliser 100 %.

### Structure — Échelles
*Condition : aucune échelle configurée*

Aucune échelle de performance. L'échelle établit le niveau de performance du critère ou de l'habileté évaluée (ex. : Insuffisant, Développement, Maîtrise, Étendu). Configure les seuils et les couleurs qui correspondent à ton jugement professionnel.

### Structure — Cartouches
*Condition : aucune cartouche créée*

Aucune cartouche de rétroaction. Les cartouches sont des gabarits de commentaires généraux que tu prépares une fois : un commentaire par combinaison critère × niveau. Lors de l'évaluation, l'application assemble automatiquement une rétroaction personnalisée.

### Structure — Pratiques
*Condition : aucune pratique configurée*

Aucune pratique de notation configurée. La pratique, c'est ta recette complète : type de notation (SOM, STD, SPE ou DEN), échelle, structure des évaluations et jetons. C'est elle qui détermine comment la note se construit.

---

## États vides — Étape 2 : Croisement

### Évaluations — Liste
*Condition : aucune évaluation enregistrée*

Aucune évaluation enregistrée. Pour commencer, sélectionne une production et un·e étudiant·e, puis applique ta grille de critères. La rétroaction se construit au fur et à mesure que tu attribues les niveaux.

### Travaux — Import
*Condition : aucun fichier importé*

Aucun travail importé. Importe les travaux de tes étudiant·es (PDF ou images) pour les annoter et les évaluer directement dans l'application. Les images sont optimisées automatiquement (contraste, luminosité, etc.), mais tu peux aussi faire des ajustements manuels.

### Présences
*Condition : aucune séance saisie*

Aucune présence saisie. Les séances sont générées automatiquement à partir de ton calendrier et de ton horaire. Sélectionne une séance pour saisir les présences et absences.

---

## États vides — Étape 3 : Observation

### Tableau de bord — Aperçu
*Condition : aucune donnée à afficher*

Le tableau de bord se remplit au fur et à mesure que tu saisis les présences et les évaluations. Les indices A-C-P, les patterns et les niveaux RàI apparaîtront dès que tu auras enregistré quelques données — c'est le portrait de ton groupe qui se dessine.

### Tableau de bord — Profil
*Condition : aucun·e étudiant·e sélectionné·e*

Sélectionne un·e étudiant·e pour afficher son profil : productions, mobilisation, progression, habiletés et accompagnement.

### Tableau de bord — Interventions
*Condition : aucune intervention planifiée*

Aucune intervention planifiée. Les interventions RàI de niveaux 2 (préventif) et 3 (intensif) se créent à partir des signaux du tableau de bord. Quand un·e étudiant·e ou un sous-groupe montre des difficultés émergentes ou persistantes, c'est le moment d'intervenir.

---

## États vides — Étape 4 : Compétence

### Planification — Alignement
*Condition : carte mentale vide*

Ta carte mentale est vide. Commence par glisser un noeud depuis la palette. La compétence du devis ministériel ou du plan-cadre de ton cours est un bon point de départ. Relie ensuite tes connaissances requises, tes activités d'apprentissage et tes évaluations pour rendre visible l'alignement pédagogique.

### Planification — Organisateur
*Condition : aucune séquence définie*

Aucune séquence définie. Les séquences organisent tes leçons sur les 15 semaines du trimestre. Une séquence peut contenir plusieurs leçons. Crée ta première séquence, puis ajoute des leçons avec l'option d'enseignement explicite en 5 phases.

---

## Textes de transition (entre les étapes du parcours)

Format envisagé : bannière ou notification affichée quand l'utilisateur atteint un jalon.

### Numérisation → Croisement
*Déclencheur : premier groupe-cours complet*

Ton espace de travail est prêt : trimestre, cours, groupe, horaire et pratique sont configurés. Tu peux maintenant saisir les présences et évaluer les productions de tes étudiant·es.

### Croisement → Observation
*Déclencheur : premières évaluations enregistrées*

Tes premières évaluations sont enregistrées. Le tableau de bord commence à se remplir. Les indices A-C-P et les premiers patterns d'apprentissage apparaissent. Tu peux maintenant observer la progression de ton groupe.

### Observation → Compétence
*Déclencheur : premiers signaux RàI détectés*

Le tableau de bord montre des signaux qui méritent attention. Tu peux maintenant planifier des interventions préventives pour les étudiant·es qui en ont besoin, et approfondir l'alignement pédagogique de ton cours.

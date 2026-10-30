# Consigne – Le niveau RàI sur un critère, plus sur le groupe (lot 3 du chantier des seuils)

> Cowork, vendredi 30 octobre 2026, 15 h 19 (Toronto). Fondée sur les décisions de Grégoire de 14 h 36 à 15 h 19 : `plans de travail/REFLEXION-2026-10-30-seuils-normatif-critere-ipsatif.md` (lis-la en entier, section « Décidé par Grégoire » et les lignes datées). À faire après les deux consignes en file (Nouvelles et Aide ; mesure A et C).

## 0. Le pourquoi, en une phrase

Le niveau en ligne (1.227) situe l'étudiant·e par rapport à son groupe (interprétation normative) ; Grégoire veut une interprétation critériée (le seuil que l'enseignant·e a posé) et ipsative (la trajectoire). Le groupe ne servira plus qu'à un miroir de l'enseignement, plus tard (consentement à discuter, hors de ce lot).

## 1. Le modèle décidé

- **La ligne** : le seuil minimal de réussite que l'enseignant·e a posé, c'est-à-dire le repère « Suffisant à partir de » de l'échelle des copies (`reperesPerformance().suffisance`) ; sans ce repère, `NOTE_DE_PASSAGE` (60 %, RREC). Une échelle qui ne porte que la maîtrise : 60 %. Rien codé en dur pour une pratique.
- **Le résultat comparé** : la note provisoire telle que la pratique la construit (l'indice P), pas la moyenne brute des copies. Note non constructible : le niveau ne se fixe pas par la note.
- **Niveau 2** : P sous la ligne ; OU pattern « Difficulté persistante », même si P tient au-dessus ; OU signalement diagnostique réglé à 2.
- **Niveau 3** : P sous la ligne ET difficulté sur un critère désigné comme fondation (multistructurel SOLO) ; OU signalement diagnostique réglé à 3 ; OU « Non-participation » (règle inchangée).
- **Niveau 1** : le reste.
- **Jamais** : l'inscription aux services adaptés (« Mesure d'aide ») ne fixe ni n'influence un niveau. C'est déjà vrai (mesuré : aucun calcul du niveau ne la lit) ; une sentinelle le garde.
- **Retiré** (zéro dette) : la comparaison au groupe-cours (écart-type, minimum de 5, minimum de 2 copies, protection par la maîtrise) et l'exception de la règle 1 (dans un groupe sous la ligne, l'étudiant·e sous la ligne garde son signal individuel).
- **Gardé en attendant le miroir** : la phrase sous la barre RàI quand la moyenne des notes provisoires du groupe est sous la ligne ; elle n'enlève plus aucun signal individuel.
- **Inchangé** : une intervention enregistrée garde son niveau d'alors.

## 2. Le signalement diagnostique

Là où l'enseignant·e coche « lève un signalement » sur un palier du gabarit (#790), il ou elle choisit aussi le niveau que ce palier fixe : 2 ou 3. Un palier, un niveau.
- **Durée** (décision de Grégoire, 15 h 28) : le signalement fixe le niveau jusqu'à la première note provisoire constructible de l'étudiant·e ; ensuite, la note et la trajectoire décident, et le signalement reste affiché à côté du niveau (trace de l'orientation).
- Format qui voyage (grilles partagées, imports) : un palier déjà coché sans niveau garde le comportement actuel (signalement à côté, aucun niveau) jusqu'à ce que l'enseignant·e choisisse. **Aucun défaut silencieux.** Décision technique de Cowork, nommée : on ne fait pas dire à une case cochée en septembre ce qu'elle ne disait pas.
- Les mots du choix : à proposer, à faire valider par Grégoire.

## 3. Avant de coder : la mesure, puis arrêt

Comme ce matin : un script dans `scripts/mesures-depistage/`, sur son codex, aux mêmes dates de coupe ; effectifs seulement, page privée. Colonnes : le modèle en ligne (1.227), le modèle décidé. Lignes : niveaux 1-2-3 par trimestre à chaque date ; d'où vient chaque niveau 2 et 3 (note sous la ligne, persistante, fondation, diagnostic, non-participation) ; combien d'étudiant·es sous la ligne n'ont aucun signal (cible : 0). **Arrête-toi là** et rends les chiffres : Grégoire les voit avant le code.

Suppositions à trancher toi-même et à nommer au rapport : la fenêtre et la règle de la « difficulté sur un critère de fondation » (même ligne que la note, lue comme le fait la détection des défis, à vérifier) ; ce qui se passe avant la première note provisoire (diagnostic et non-participation seulement ; le rôle de A et C attend la mesure en file).

## 3 bis. Décisions de Grégoire après la mesure (30 oct., 15 h 40)

Sur la page privée de la mesure (\`7e5704eb\`), ses deux réponses :
1. **Quand la note fixe le niveau** : ton option C, dans cette formulation : avant le minimum de la pratique (là où l'écran écrit « — »), une note sous la ligne donne **au plus le niveau 2** (par « Difficulté persistante », telle que le code la calcule) ; le niveau 3 par la note n'arrive qu'avec la note provisoire affichée. Diagnostic et non-participation gardent leur règle.
2. **La fondation au niveau 3** : ton option A, la règle telle quelle ; sur son codex, sous la ligne, c'est toujours le niveau 3. L'Aide le dira.

Les suppositions de ta page sont retenues telles quelles. Tu peux coder (§ 4).

## 4. Le code, après son accord

**L'Aide part avec le code, jamais après** (Grégoire, 15 h 28 : « absolument transparent sur le fonctionnement de l'application »). La section qui décrit le dépistage et l'application de la RàI est réécrite par Cowork, à partir du modèle tel que codé, et validée par Grégoire ; tu l'intègres dans le même lot. Aucun niveau du nouveau modèle ne part en ligne avec l'ancienne Aide.

Tous les lecteurs du niveau suivent (carte du profil, liste, filtres « RàI 2-3 », Aperçu, cible d'intervention, interventions, cache dérivé `indicesPatternsRaI`). Les mots neufs ou changés (motifs de la carte, Aide, bulles, glossaire) vont dans la liste à valider, aucun n'est posé comme validé. Les questions 2 à 5 du lot 2 : dire au rapport lesquelles ce lot rend caduques. Sentinelles : chaque règle du § 1 peut rougir (break-test). Pas de release ; relecture de Cowork.

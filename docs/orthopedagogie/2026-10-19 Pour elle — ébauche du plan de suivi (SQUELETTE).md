# Pour elle : ébauche du plan de suivi (SQUELETTE)

> **Statut.** Squelette monté par Grégoire et Cowork le 19 oct. 2026 (14 h 08-14 h 37), après la 2e rencontre de la CoP. Destiné à l'orthopédagogue, pour lui demander si c'est conforme à sa pratique. Adressé au « tu », comme les textes de septembre. **Sections non rédigées** : on remplit section par section, avec Grégoire.
>
> ⮕ **DÉPASSÉ le soir même (19 oct. 2026, 18 h 30)** : ce squelette a donné six documents, publiés comme documents partagés (artefacts claude.ai, privés à Grégoire) et non versés au dépôt. Ce qui part chez Isabelle : la **version finale** et le **mode d'emploi**.
> - Ébauche (citations minutées de la transcription) : https://claude.ai/code/artifact/a19eda3c-8040-4227-96e3-dc62bdc8384f
> - Version 1 (objectifs à confirmer, pistes d'adaptation) : https://claude.ai/code/artifact/b4f011ad-7290-49de-80ea-917c477cf046
> - Version 2 (trois semaines en étapes) : https://claude.ai/code/artifact/62a36b74-7150-4abc-bc42-f17f999b95c2
> - **Version finale** (une page, jusqu'au 9 nov.) : https://claude.ai/code/artifact/d45c0ead-3e7d-44d6-ab0a-53900054d04d
> - **Mode d'emploi** (Isabelle construit échelle, grille, activités, puis les exporte en `.lcz`) : https://claude.ai/code/artifact/5f637b7a-261e-4002-a736-458afe547baa
> - Recette pour Grégoire (trousse fabriquée par lui ; remplacée par le mode d'emploi) : https://claude.ai/code/artifact/803a79c6-ebd3-430c-83a8-34919d481d93
> Décisions du soir : les modules restent de notre côté (pas chez Isabelle pour l'instant) ; le vocabulaire du *Référentiel d'intervention en écriture* sert de langue commune ; niveaux d'observation : Pas encore / En pratique guidée / En pratique autonome / Transfert ; Isabelle exporte ses outils vers Grégoire (premier partage `.lcz` entre deux personnes) et écrit d'ici le 6 nov.
>
> **Principe de conception, posé par Grégoire le 19 oct. 2026 (14 h 40)** : « des transferts qui se font dans les deux sens ». Il ne s'agit pas seulement de transposer une application d'enseignant à l'orthopédagogie, mais aussi de voir ce qui, dans l'orthopédagogie, peut être utile à l'enseignant, et de concevoir l'application pour qu'elle fonctionne dans les deux sens. ⮕ Règle qui en découle (Cowork) : **les mots suivent la nature (cours ou service) ; les outils, non.** Un outil né pour elle (niveau sans note, observation répétée et datée, module, fil de l'élève) est offert à l'enseignant aussi, sans lui être imposé. Cohérent avec le but du 11 sept. 2026 (« universaliser l'application » : des options qu'elle et l'enseignant pourront utiliser).
>
> **Second principe, posé par Grégoire le 19 oct. 2026 (14 h 43)** : une interface simple qui devient experte **progressivement, pas de façon binaire**, en activant des fonctionnalités dans les réglages (« un enseignant pourrait décider d'appliquer le modèle de la réponse à l'intervention et coche ») ; ces fonctionnalités pourraient être « bilingues » : parler à la fois orthopédagogie et enseignement.
> Mesuré : le mécanisme existe en partie. Labo › Outils d'observation porte huit cases (`preferencesUtilisateur`, `js/preferences.js:54-75`) : SOLO, RàI, dépistage ACP, graphiques, seuils visuels, développement des habiletés (cochées par défaut), actions de repérage et note différée (décochées). **Six sur huit sont cochées par défaut : un nouvel utilisateur arrive dans l'interface d'expert**, l'inverse du principe. ⮕ Recommandation de Cowork : les outils nés pour l'orthopédagogue entrent comme des cases de ce panneau, décochées par défaut, bilingues par `js/mots-nature.js`. ▣ **Tranché par Grégoire le 19 oct. 2026 (14 h 50)** : « L'application devrait d'abord être simplifiée et progressivement, les utilisateurs ajoutent des fonctionnalités au fil de leur propre développement. » Le changement d'écran des membres de la CoP est accepté (bêta publique, très peu d'utilisateurs). Chantier distinct : `plans de travail/IDEE-2026-10-19-interface-simple-d-abord.md`.
>
> Sources : `2026-10-19 Mesure — ce que l'application offre déjà au suivi de l'orthopédagogue.md` ; `2026-10-19 Lecture — Référentiel d'intervention en écriture (MEES 2017).md`.

1. **Ce qu'on a compris de ta pratique** (à valider) : des objectifs par élève, des étapes observées, un niveau et ce que tu vois, plusieurs rencontres, l'apprentissage et le transfert.
2. **Ce que tu peux déjà faire aujourd'hui** : les quatre correspondances (activité = production ; fiche d'observation = grille ; observer = évaluer ; progression = profil), avec leurs limites franchement dites.
3. **Le module, l'unité de ton travail.** Un module réunit le plan (la carte), l'activité (la production), les étapes (la grille), tes niveaux (l'échelle) et tes phrases (les cartouches). Tu les crées au fil de ta pratique et ils s'accumulent dans une bibliothèque de modules, commune à tous les trimestres. Chaque élève passe de module en module ; son fil (quel module est ouvert, depuis quand, lequel est terminé) vit dans son profil. Pas une carte par élève : une carte par module.
   - Décidé le 19 oct. 2026 (14 h 33-14 h 37) : Grégoire propose le module et la bibliothèque de modules, plutôt qu'une carte d'alignement par élève (« ce pourrait être vraiment long et fastidieux de concevoir 50 cartes »).
   - Mesuré : la bibliothèque des cartes d'alignement est déjà commune aux trimestres (`bibliothequeAlignements`, non namespacée) ; le paquet de partage d'une production embarque déjà sa grille et ses cartouches (`partage-format.js:39`) ; il n'embarque ni l'échelle ni la carte. Le fil de l'élève n'existe nulle part.
4. **Ce qu'on propose de transformer**, en gestes :
   - choisir un niveau sans qu'il devienne une note ;
   - écrire ce que tu vois, critère par critère, avec une banque de phrases ;
   - observer la même activité à plusieurs rencontres, chaque fois datée ;
   - relier chaque rencontre au module et aux objectifs qu'elle travaille ;
   - puiser tes objectifs et tes observations dans des menus ;
   - retrouver tes rencontres dans le profil de l'élève, même sans évaluation (aujourd'hui elles y sont cachées).
5. **Voir la progression autrement qu'en courbe** : une piste à inventer avec elle.
6. **Ce que le référentiel pourrait fournir** comme banques de départ (modules, grilles, niveaux, vocabulaire).
7. **Nos questions pour toi** :
   - chaque étape observée est-elle un critère (avec ses niveaux), ou un niveau d'un même critère ? (Cowork recommande la première lecture.)
   - planifies-tu par élève, ou par objectif / module ?

# Portes terrain — 12 septembre 2026 (la section Cours du Cadre parle les deux métiers, sans se contredire — à livrer en 1.137.0)

> **Version à l'écran attendue : `1.137.0`** (release due APRÈS la relecture croisée de Cowork ; le commit de code est sur `main` local,
> non poussé — consigne du 12 sept., 8 h 55, § 6). **Tant que la version lue en bas de page est `1.136.0`, cette liste ne juge rien** :
> recharge avec vidage de cache (Cmd+Maj+R).
> Couvre : #841 (l'option vide des menus de personne, la rangée 5 échouée de la porte des étiquettes) et #842 (décision 3.4 : la section
> « Cours » du Cadre suit la nature — titre proposé, titres du formulaire, bandeau, synthèse vide, menus, et la phrase des éléments
> obligatoires qui contredisait le champ de l'horaire). **Aucun comportement, aucune donnée, aucune règle ne change** : des mots, lus
> dans `js/mots-nature.js`.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.

**Pourquoi cette liste est courte.** Le pack démo a été capturé AVANT le premier changement et rejoué APRÈS le dernier : 411 feuilles
(les valeurs de `cours`, `groupesCours`, `groupeEtudiants`, `infoCours`, `groupeCoursActif` ; les textes du Cadre dans huit états du
formulaire, de Suivi du groupe, Liste et un profil — sur le groupe-cours démo, sur un service créé par les trois questions, puis au
retour) : **zéro valeur ne bouge** (les seules différences de valeur sont des identifiants générés, des dates de création et deux DA
provisoires, différents à chaque exécution) ; Suivi du groupe, Liste et le profil sont **identiques** hors service ; les seules
différences de texte sont les mots de ce lot. Une sentinelle de 17 essais, onze fois cassée exprès, onze rouges. Reste ce que seul ton
écran tranche : **ton 601-101-MQ**, Safari, et les mots.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** dans un **nouvel onglet** (si un onglet de l'app était déjà ouvert : recharge-le avec vidage de cache, Cmd+Maj+R) | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.137.0`**. Sinon, arrête-toi : la liste jugerait la version d'avant. |

---

## §1 · Tes données — ce que cette liste écrit chez toi

**Rien.** Aucune rangée n'enregistre quoi que ce soit : les rangées 1 à 3 se font en démonstration, la rangée 4 ne fait que lire, et
la bascule du menu Nature de la rangée 2 se fait **sans** Enregistrer. ⛔ Ne crée PAS de service hors démo pour cette porte.

---

## §2 · Interface — ce que tu vérifies à l'écran

┌ POURQUOI ─────────────────────────────────────────────────────────────────────────────────┐
│ Lundi, l'orthopédagogue ouvrira le Cadre. Ce matin, un même écran lui disait que l'horaire  │
│ fait partie des cinq éléments obligatoires, et deux lignes plus bas qu'il est facultatif    │
│ pour un service. Et le menu des profils disait « — Sélectionner — » là où l'accordéon disait │
│ « Orthopédagogue ». Ta décision 3.4 : la section suit le choix fait par l'utilisateur.       │
└────────────────────────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| **1** | Active la **démonstration**, crée le service par les trois questions (`Suivi › Rencontres`, un nom, deux élèves), puis `Cadre › Trimestre`, accordéon du profil (**Orthopédagogue**) | Le menu des profils dit **« Sélectionner un·e orthopédagogue »** comme premier choix (la rangée 5 qui avait échoué). Ouvre l'accordéon **Groupe-cours**, clique **Modifier** sur le groupe-cours du service : le champ **5. Orthopédagogue** dit **« — Choisir un·e orthopédagogue — »**, le champ **2. Service d’orthopédagogie** dit **« — Choisir un service — »**. |
| **2** | Toujours sur le service, accordéon **Cours et services** : lis le titre de l'accordéon, le libellé du menu, sélectionne le service dans le menu, puis **Modifier** ; puis **Dupliquer** (sans enregistrer) ; puis **Annuler** | Le titre de l'accordéon dit **« Cours et services »** (mot proposé, § 3.1). Le libellé du menu dit **« Service : »**, son premier choix **« Sélectionner un service... »**. Le formulaire dit **« Modifier le service »**, le bandeau **« Mode modification — Service *Aide à la réussite* »** ; sur Dupliquer, **« Dupliquer le service »**. Le fil d'Ariane en haut dit **« Service »** à la place de « Cours ». Après Annuler, la synthèse à gauche dit **« Aucun service sélectionné »**. ⚠ Le bouton **« + Nouveau cours »** et la phrase « … ou crée un nouveau cours » disent encore *cours* : laissé exprès (§ 3.2). |
| **3** | Toujours sur le service, accordéon **Groupe-cours** : lis la phrase en tête, l'état vide à droite (clique **Annuler** si un formulaire est ouvert), puis **+ Nouveau groupe-cours** | La phrase dit **« renseigne les 4 éléments obligatoires : trimestre, service d’orthopédagogie, numéro de groupe et orthopédagogue. L’horaire et la pratique de notation sont facultatifs. »** L'état vide dit « … pour renseigner les **4 éléments obligatoires** » et sa liste dit « L'horaire des séances **(facultatif)** ». Le formulaire dit « Renseigne les 4 éléments obligatoires (l’horaire et la pratique de notation sont facultatifs). » Le champ **4. Horaire** dit toujours « (facultatif pour un service) » — la contradiction a disparu. |
| **4** | Quitte la démonstration, reviens sur ton **601-101-MQ**, accordéons **Cours et services**, **Enseignant·e**, **Groupe-cours** | **Tous les mots sont ceux d'avant**, sauf deux : le titre **« Cours et services »** (§ 3.1) et le premier choix du menu des profils, **« Sélectionner un enseignant·e »** (il disait « — Sélectionner — » ; c'est le mot que le point unique portait déjà depuis 1.136.0). Le reste : « Cours : », « Sélectionner un cours... », « + Nouveau cours », « Aucun cours sélectionné », « Modifier le cours », bandeau « — Cours 601-101-MQ », « — Choisir un cours — », « — Choisir un enseignant — », « renseigne les 5 éléments obligatoires : trimestre, cours, numéro de groupe, horaire et enseignant·e ». Survole le titre de l'accordéon Groupe-cours : l'infobulle dit « tu relies ici ton cours ou ton service d’orthopédagogie, ton groupe, ton horaire… ». |
| **5** | Sur chacun de tes deux groupes : `Suivi du groupe`, `Liste des étudiant·es`, un profil | **Identiques à 1.136.0** : mêmes élèves, mêmes indices, mêmes graphiques. (Le harnais démo le mesure à 0 différence sur ces trois écrans ; ton écran tranche pour tes données.) |

---

## §3 · Décisions — ce qui attend ton verdict (ce ne sont pas des vérifications : écris ta réponse)

| | Question | Ta réponse |
|---|---|---|
| **3.1** | **Le nom de la section.** Tu as proposé « cours/service ». Livré : **« Cours et services »** (recommandation de Cowork : un titre qui ne prend pas parti, parce que la section liste les deux natures à la fois ; un titre qui bascule dirait « Service » pendant qu'elle montre aussi tes cours). Il vit à un seul endroit (`index.html`, ligne du titre de l'accordéon). **Le mot te va, ou tu le corriges ?** (« Cours / Service », « Cours ou service », ton mot) | ______ |
| **3.2** | **« + Nouveau cours » et « … ou crée un nouveau cours » ne suivent PAS le contexte, exprès.** Sur un service, « + Nouveau service » ouvrirait un formulaire dont le menu Nature dit « Enseignement » (c'est son défaut) : contradiction. Faire suivre le défaut du menu Nature par le contexte actif est un **comportement**, pas un mot (consigne § 5) — inscrit **#843**. **Veux-tu que le défaut du menu Nature suive le contexte actif** (un formulaire neuf s'ouvre sur « Orthopédagogie » quand un service est actif) ? Si oui, le bouton et la phrase suivront avec lui. | ______ |
| **3.3** | **Les mots neufs du lot**, à corriger d'un mot : « Sélectionner un service... », « — Choisir un service — », « — Choisir un·e orthopédagogue — », « Aucun service sélectionné », « Nouveau service » / « Modifier le service » / « Dupliquer le service », « Service : », et la phrase des quatre éléments (rangée 3). Tous dans `js/mots-nature.js`. | ______ |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Safari et l'iPad** : le harnais tourne dans WebKit headless ; la largeur des menus avec « — Choisir un·e orthopédagogue — » et
  le titre « Cours et services » dans le fil d'Ariane ne sont pas vus.
- **Tes deux groupes réels** : le harnais mesure le pack démo, pas ton corpus (rangée 5).
- **Le mot du titre** (§ 3.1) et **le défaut du menu Nature** (§ 3.2) : décisions, pas des mesures.
- **Ce que la mesure a corrigé de la consigne** : (1) la fonction `peuplerDropdownEnseignants` de l'orchestre, qui posait déjà le bon mot,
  **n'avait aucun appelant** — retirée ; le vrai peuplement est `populerDropdownEnseignantsV2` ; (2) le champ 5 du groupe-cours
  (`v2-gc-enseignant`) est peuplé par `trimestre-v2.js`, avec un troisième libellé (« — Choisir un enseignant — ») que la consigne
  n'avait pas mesuré ; (3) la liste des sites du § 3.2 de la consigne manquait le fil d'Ariane (« Cours »), le libellé « Cours : »,
  l'option « — Choisir un cours — » du groupe-cours, et trois autres « 5 éléments obligatoires » dans l'accordéon Groupe-cours.

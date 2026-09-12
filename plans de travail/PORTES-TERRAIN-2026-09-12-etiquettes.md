# Portes terrain — 12 septembre 2026 (les étiquettes : l'orthopédagogue entre par le Cadre, comme tout le monde — à livrer en 1.136.0)

> **Version à l'écran attendue : `1.136.0`**, build `0912-0813` (release `2c84a34a`, **poussée le 12 sept. à 8 h 20** après la relecture
> croisée de Cowork et le verdict Playwright ; Netlify met en ligne en 30 à 60 s). **Tant que la version lue en bas de page est `1.135.1`,
> cette liste ne juge rien** : recharge avec vidage de cache.)
> Couvre : le mot de chaque nature de cours à UN seul endroit (`js/mots-nature.js`) — « Enseignement » / « Orthopédagogie » — et tous les
> sites qui l'affichent (Cadre › Cours, Cadre › Groupe-cours, la bibliothèque des cours, Suivi › Rencontres, deux infobulles) ; le mot de la
> personne (enseignant·e / orthopédagogue) qui suit la nature du contexte actif. **Aucun comportement, aucune donnée, aucune règle ne
> change** : les valeurs en base restent `'cours'` et `'service'`.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.

**Pourquoi cette liste est courte.** Le pack démo a été capturé AVANT le premier changement et rejoué APRÈS le dernier : 54 feuilles (les
valeurs de `cours`, `groupesCours`, `groupeEtudiants`, `infoCours`, `groupeCoursActif` ; le texte du Cadre, de Suivi du groupe, Liste,
Présences, Interventions, Rencontres et de cinq profils — sur le groupe-cours démo, puis sur un service créé par les trois questions, puis
au retour) : **zéro valeur ne bouge** (les seules différences de valeur sont deux identifiants générés et un DA provisoire, différents à
chaque exécution), et les seules différences de texte sont les mots de ce lot. Une sentinelle de 13 essais, huit fois cassée exprès, huit
rouges. Reste ce que seul ton écran tranche : **ton 601-101-MQ**, Safari, et les mots.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** dans un **nouvel onglet** (si un onglet de l'app était déjà ouvert : recharge-le avec vidage de cache, Cmd+Maj+R) | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.136.0`**. Sinon, arrête-toi : la liste jugerait la version d'avant. |

---

## §1 · Tes données — ce que cette liste écrit chez toi

**Rien.** Aucune rangée n'enregistre quoi que ce soit : la rangée 2 bascule un menu **sans** cliquer Enregistrer, et la rangée 3 se fait
en démonstration. Les valeurs en base ne changent pas dans ce lot (`nature` vaut toujours `'cours'` ou `'service'`) ; une sentinelle
prouve qu'un aller-retour complet du formulaire (créer, modifier, relire) laisse `'service'` intact. ⛔ Ne crée PAS de service hors démo
pour cette porte : il entrerait dans ta vraie liste de cours.

---

## §2 · Interface — ce que tu vérifies à l'écran

### 2.1 · `Cadre › Cours` sur ton 601-101-MQ — le menu dit les deux usages, rien d'autre ne bouge

┌ POURQUOI ─────────────────────────────────────────────────────────────────────────────────┐
│ Tu l'as dit à 7 h 35 : « Je veux que l'orthopédagogue sente qu'elle entre par la porte     │
│ principale […]. Elle entre par le Cadre, elle aussi. » Un enseignant qui ouvre ce menu doit │
│ voir que l'application connaît deux usages ; une orthopédagogue doit y voir son métier.     │
└────────────────────────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| **1** | `Cadre › Trimestre`, accordéon **Cours**, sélectionne ton **601-101-MQ**, clique **Modifier** | Le menu **Nature** dit **« Enseignement »** (plus « Cours »). Ses deux choix : **Enseignement / Orthopédagogie**. Tous tes champs sont là, intacts : code, nom, compétence, pondération, heures, discipline. Le titre dit toujours « Modifier le cours ». |
| **2** | Bascule le menu Nature sur **Orthopédagogie**, **sans enregistrer** ; puis remets **Enseignement** ; puis **Annuler** | Sur Orthopédagogie : les champs code, compétence, pondération, discipline se masquent (comme avant), le libellé dit « Nom du service * » et l'aide dit « Un service d’orthopédagogie n'a ni code… ». Sur Enseignement : **tout revient**, valeurs comprises. Après Annuler : ta fiche n'a pas changé (re-sélectionne-la : code et nom identiques). |

### 2.2 · En démonstration, sur le service — le Cadre dit l'orthopédagogie, y compris le mot de l'orthopédagogue

┌ POURQUOI ─────────────────────────────────────────────────────────────────────────────────┐
│ Avant, un service se lisait « Service » dans le Cadre et le Cadre parlait d'« Enseignant·e » │
│ partout — l'orthopédagogue entrait par une porte de côté, avec les mots d'un autre métier.  │
└────────────────────────────────────────────────────────────────────────────────────────────┘

| | Geste | Attendu |
|---|---|---|
| **3** | Active la **démonstration**, va dans `Suivi › Rencontres (ortho.)`, clique **Créer un service d’orthopédagogie**, réponds aux trois questions (un nom, deux ou trois élèves), **Créer mon service d’orthopédagogie** | Notification « **Service d’orthopédagogie créé** — … Tes rencontres d'orthopédagogie se tiennent ici ; Cadre montre le service tel quel. » L'en-tête bascule sur le service. |
| **4** | `Cadre › Trimestre`, accordéon **Cours**, sélectionne le service dans le menu | Dans le menu, il se lit « *Nom* — **Orthopédagogie** ». Sa synthèse à gauche : le badge « **Service d’orthopédagogie actif** », le mot **Orthopédagogie** sous le nom. Ses détails : **Nature : Orthopédagogie**, **Nom du service**. |
| **5** | Regarde le fil d'Ariane en haut du Cadre et l'accordéon du profil | Le fil d'Ariane et l'accordéon disent **« Orthopédagogue »** (plus « Enseignant·e ») ; dans l'accordéon, le sélecteur dit **« Profil orthopédagogue »** et son choix vide **« Sélectionner un·e orthopédagogue »**. |
| **6** | Accordéon **Groupe-cours**, sélectionne le groupe-cours du service | La carte résumé dit **Service** (devant le nom), **Ortho.** (devant le nom du profil), « Horaire : Aucun — la présence se note dans la rencontre ». Le formulaire (Modifier) dit **« 2. Service d’orthopédagogie * »** et **« 5. Orthopédagogue * »** ; la liste des cinq éléments dit « L'orthopédagogue responsable ». |
| **7** | Quitte la démonstration, reviens sur ton 601-101-MQ | Tout redit **enseignant·e** : fil d'Ariane, accordéon, « Profil enseignant », « 2. Cours à enseigner », « 5. Enseignant·e », carte résumé « Cours » / « Enseig. ». |

### 2.3 · `Suivi` — les mots du § 2 B de ta consigne

| | Geste | Attendu |
|---|---|---|
| **8** | `Suivi`, sous-onglet **Rencontres** : lis le titre de la section et survole le sous-onglet | Le **titre** de la section dit **« Rencontres (ortho.) »**. ⚠ **Le libellé de l'ONGLET dit encore « Rencontres »** : il vit dans `js/config.js`, zone protégée — non touché, voir § 3. L'infobulle du sous-onglet dit « Tiens tes rencontres d’orthopédagogie… Un service d’orthopédagogie se crée ici en trois questions. » |
| **9** | Sur ton 601-101-MQ (hors démo), lis la carte de ce sous-onglet | « Les rencontres d'orthopédagogie se tiennent dans un **service d’orthopédagogie** — dans Cadre, un cours de nature « Orthopédagogie », sans code ni horaire. Le groupe-cours actif est un cours d'enseignement : ses interventions sont sous **Suivi › Interventions**. » puis « Tu es orthopédagogue et tu reçois des élèves hors d'un groupe-cours ? **Créer un service d’orthopédagogie** ». Le texte est proposé (ta consigne § 2 B, dernière ligne) : corrige-le au § 3. |

### 2.4 · Tes deux groupes réels — identiques

| | Geste | Attendu |
|---|---|---|
| **10** | Sur chacun de tes deux groupes : `Suivi du groupe`, `Liste des étudiant·es`, un profil | **Identiques à 1.135.1** : mêmes élèves, mêmes indices, mêmes graphiques. (Le harnais démo le mesure à 0 différence ; ton écran tranche pour tes données.) |

---

## §3 · Décisions — ce qui attend ton verdict (ce ne sont pas des vérifications : écris ta réponse)

| | Question | Ta réponse |
|---|---|---|
| **3.1** | **Le libellé de l'onglet `Suivi › Rencontres`** : il vit dans `js/config.js` (ligne 70, `{ id: 'rencontres', label: 'Rencontres' }`), zone protégée que ta consigne interdisait d'ouvrir. Le titre de la section dit déjà « Rencontres (ortho.) ». **Autorises-tu la ligne `label: 'Rencontres (ortho.)'` dans `config.js` ?** (un mot, une ligne) | ______ |
| **3.2** | **Le texte de la carte sur un groupe-cours ordinaire** (rangée 9) : tel quel, ou ta version ? | ______ |
| **3.3** | **Le mot de la nature** est « Orthopédagogie » et l'objet « service d’orthopédagogie ». Le jour où d'autres services existent, tout change dans `js/mots-nature.js` — rien d'autre. Ces mots te vont ? | ______ |
| **3.4** | **Ce que le Cadre dit encore avec les mots de l'enseignement, laissé exprès** (perfectible, pas faux — un service EST un cours dans le Cadre) : « + Nouveau cours », « Modifier le cours », « Dupliquer le cours », le bandeau « Mode modification — Cours *nom* », « Sélectionner un cours… », « Aucun cours sélectionné », l'infobulle du groupe-cours (« tu relies ici ton cours, ton groupe, ton horaire et ta façon de construire la note »), et la phrase « renseigne les 5 éléments obligatoires : trimestre, cours, numéro de groupe, horaire et orthopédagogue » — **l'horaire n'est pas obligatoire pour un service** (le champ le dit déjà : « facultatif pour un service »). Lequel de ces mots veux-tu voir suivre la nature, s'il y en a ? | ______ |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Safari et l'iPad** : le harnais tourne dans WebKit headless ; le rendu réel des libellés (largeur des menus, retour à la ligne du
  fil d'Ariane avec « Orthopédagogue ») ne l'est pas.
- **Tes deux groupes réels** : le harnais mesure le pack démo, pas ton corpus (rangée 10).
- **Le libellé de l'onglet** (rangée 8, § 3.1) : non livré, exprès.
- **Erreur de la session, rattrapée par la sentinelle** : la liste des sites de ta consigne était incomplète — `js/cours.js` (la
  bibliothèque des cours, deux cartes) écrivait aussi « - Service ». Le verrou structurel l'a attrapé au premier passage ; migré.
- **Une reprise en cours de route** : j'avais fait suivre « Modifier le cours » / « Dupliquer le cours » par la nature ; la sentinelle
  #306 (libellés d'assemblage) l'a refusé et ta consigne dit de ne réécrire que ce qui est faux pour elle — remis tels quels, listés en § 3.4.

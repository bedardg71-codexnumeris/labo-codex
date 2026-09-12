# Consigne du jour — finir la section Cours du Cadre : elle parle les deux métiers, sans se contredire

> **Écrite le samedi 12 septembre 2026 à 8 h 55 (Toronto) par Cowork**, au retour de la porte des étiquettes (**11/12, rangée 5 échouée**).
> État mesuré : **`1.136.0`**, build `0912-0813`, `main` = `origin/main` = `e8374bc6`, `rev-list` = **0**.
> Elle remplace la consigne des étiquettes, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-12-etiquettes.md`.
>
> **Porte relevée** : `plans de travail/PORTES-TERRAIN-2026-09-12-etiquettes.md` — **inscris-y le relevé** (11/12, rangée 5 échouée,
> les quatre décisions) dans ton commit documentaire. **Le lot 5 du cadrage 11 reste EN PAUSE.**
>
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** Les numéros de ligne datent du 12 sept. à 8 h 45 sur `1.136.0`.
> ⛔ **`js/config.js` reste fermé** : décision 3.1 de Grégoire, « tel quel ». L'onglet continue de dire « Rencontres ».
> **Skills** : `labo-codex`, `design-interface`, `verification-adverse`, `portes-terrain`, `release-et-changelog`.

---

## 0 · L'INTENTION — ce qui juge le résultat

Lundi, l'orthopédagogue ouvrira le Cadre. Aujourd'hui, ce qu'elle y lira **se contredit sur un même écran** : la phrase du haut lui
annonce que l'horaire fait partie des cinq éléments obligatoires, et le champ juste en dessous lui dit qu'il est facultatif pour un
service. C'est le genre de détail qui fait douter quelqu'un de son propre geste.

Grégoire, décision 3.4 de la porte : **« On devrait peut-être renommer cette section "cours/service" et l'adapter selon le choix qui
est fait par l'utilisateur. »**

⮕ Comme hier : **aucun comportement, aucune donnée, aucune règle ne change.** Des mots, et un point unique.

---

## 1 · CE QUI EXISTE DÉJÀ — ne le refais pas

Le point unique est livré : `js/mots-nature.js` donne le mot de chaque nature, l'objet, la personne, le profil ; `appliquerMotsNatureCadre`
(`js/trimestre-v2-orchestre.js`) l'applique aux éléments porteurs de `data-mot-nature`, au démarrage et à chaque activation ; un verrou
structurel refuse toute recopie en dur de « Enseignement », « Orthopédagogie » et « Service » hors du point unique.

⮕ **Tout ce lot s'accroche là.** Si tu te surprends à créer un second endroit pour un mot, arrête.

---

## 2 · LOT A — l'option vide du sélecteur de profil (#841, la rangée 5 échouée)

**Le symptôme, mesuré par Grégoire à l'écran** : sur un service, l'accordéon dit bien « Orthopédagogue », mais le premier choix du menu
déroulant des profils dit encore **« — Sélectionner — »** au lieu de « Sélectionner un·e orthopédagogue ».

**La cause, mesurée par Cowork** : `appliquerMotsNatureCadre` pose bien le mot sur l'option vide de `v2-selectEnseignant`, puis
`populerDropdownEnseignantsV2` (`js/trimestre-v2-enseignants.js:112`) **reconstruit tout le menu** avec
`'<option value="">— Sélectionner —</option>'` en dur. Le dernier qui écrit gagne.

- **Répare à la source, pas après** : le mot de l'option vide se lit dans le point unique **au moment où le menu est construit**.
  Cherche les autres reconstructions du même genre (`v2-gc-enseignant`, et tout menu dont l'option vide nomme une personne) — le grep
  de Cowork n'a mesuré que celui-ci.
- **Le verrou structurel gagne ce site** : il surveille aujourd'hui les mots des NATURES, pas les options vides. Étends-le pour qu'une
  option vide nommant une personne ne puisse plus s'écrire en dur. Break-test rouge exigé.
- ✅ **Obstacle écarté d'avance** (mesuré) : la sentinelle `sentinelle-etat-vide-enseignant-306` ne cite « — Sélectionner — » que dans
  un commentaire et un nom d'essai ; **elle n'asserte pas ce littéral**. Renommer l'option vide ne la casse pas.

---

## 3 · LOT B — la section Cours du Cadre s'adapte à la nature (#842)

### B1 · La phrase qui se contredit — celle-là se corrige, elle ne s'inscrit pas
« Pour constituer un groupe-cours, renseigne les 5 éléments obligatoires : trimestre, **cours**, numéro de groupe, **horaire** et
orthopédagogue. » Sur un service, **l'horaire n'est pas obligatoire** — le champ le dit lui-même deux lignes plus bas. Cette phrase suit
la nature : le mot de l'objet, et l'horaire annoncé pour ce qu'il est.

### B2 · Les autres mots de la section, à faire suivre la nature
Le titre de la section, « + Nouveau cours », « Sélectionner un cours… », « Aucun cours sélectionné », le bandeau
« Mode modification — Cours *nom* », et l'infobulle du groupe-cours (« tu relies ici ton cours, ton groupe, ton horaire et ta façon de
construire la note »). **Mesure la liste complète toi-même** : celle-ci vient du § 3.4 de la porte et la précédente s'était révélée
incomplète.

### B3 · « Modifier le cours » et « Dupliquer le cours » — tranche, puis dis-le
Ta tentative d'hier a été refusée par `sentinelle-libelles-assemblage-306`. Mesuré par Cowork : cette sentinelle verrouille les mots des
**boutons assemblés** (« Créer » / « Enregistrer », « Nouveau profil ») et porte un contrôle statique sur Cours, Horaire et Groupe-cours.
**Mesure ce qu'elle protège exactement.** Si son objet est la mécanique d'assemblage et non ces deux titres, fais-les suivre la nature et
adapte la sentinelle avec un break-test. Si elle protège réellement un défaut passé qui reviendrait, **laisse les deux mots, et écris
pourquoi** — c'est une réponse acceptable, pas un échec.

### B4 · Le nom de la section
Grégoire propose « cours/service ». ⚠ Le mot exact est à lui : **propose-le dans le rapport avec son emplacement**, livre-le tel quel,
il corrigera. Ma recommandation, à soumettre comme telle : un titre qui ne prenne pas parti (« Cours et services ») plutôt qu'un titre
qui bascule, parce que la section liste **les deux** à la fois — mais c'est son arbitrage, pas le tien.

---

## 4 · SENTINELLES ET HARNAIS
1. L'option vide de chaque menu de personne vient du point unique, après une reconstruction complète du menu (c'est le cas de #841).
2. Le verrou structurel étendu : aucune option vide nommant une personne n'est écrite en dur.
3. La phrase des cinq éléments suit la nature, et n'annonce plus l'horaire comme obligatoire sur un service.
4. Hors service, **tous les mots de la section Cours sont ceux de `1.136.0`** — c'est le verrou de non-régression, il compte plus que
   les trois autres.

**Harnais AVANT/APRÈS sur le pack démo** : seules des chaînes affichées peuvent différer. Une valeur qui bouge est un défaut.

---

## 5 · CE QUI REMONTE À GRÉGOIRE
- Le nom de la section (B4) et tout mot neuf : **propose, livre tel quel, il corrigera.**
- Si B3 conclut que la sentinelle doit changer : dis-le en une ligne dans le rapport, ne le lui demande pas — c'est technique.
- Si un mot du Cadre s'avère lié à un **comportement** (un champ requis qui ne devrait pas l'être) : arrête ce point, inscris, remonte.

## 6 · LIVRER — `minor` (`1.137.0`)
Des mots visibles chez tous les utilisateurs, comme hier. Une seule livraison, après la relecture croisée de Cowork. Changelog : une ou
deux lignes — la section du Cadre parle maintenant le métier choisi, et elle ne se contredit plus sur l'horaire.

## 7 · LA PORTE TERRAIN
Courte, cinq rangées au plus (`PORTES-TERRAIN-2026-09-12-section-cours.md`), markdown par toi, artefact par Cowork :
1. En démo, sur le service : le menu des profils dit **« Sélectionner un·e orthopédagogue »** (la rangée 5 qui avait échoué).
2. En démo, sur le service : la phrase des cinq éléments ne dit plus l'horaire obligatoire, et la section porte son nom.
3. En démo, sur le service : les autres mots de B2.
4. Hors démo, sur son 601-101-MQ : **tous les mots de la section sont ceux d'avant**.
5. Ses deux groupes réels : Suivi du groupe, Liste, un profil — identiques.

## 8 · RAPPORT
La liste mesurée des sites de B2 (et ce que la liste de cette consigne avait manqué) ; ce que B3 a tranché et pourquoi ; les mots
proposés. Fin de course : `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-COWORK.md` remesurés, et le relevé de la porte des étiquettes inscrit
dans son markdown.

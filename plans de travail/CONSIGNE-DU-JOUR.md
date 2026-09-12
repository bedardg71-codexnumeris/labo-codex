# Consigne du jour — les étiquettes : l'orthopédagogue entre par le Cadre, comme tout le monde

> **Écrite le samedi 12 septembre 2026 à 7 h 40 (Toronto) par Cowork**, après le relevé de la porte de « Rencontres » (17/17, zéro échec)
> et les décisions de Grégoire de 7 h 05 à 7 h 35.
> État mesuré au moment de l'écriture : **`1.135.1`**, build `0912-0635`, `main` = `origin/main` = `473f3d75`, `rev-list` = **0**.
> Elle remplace la consigne du correctif d'appartenance, archivée à côté sous
> `_ancienne-CONSIGNE-DU-JOUR-2026-09-12-appartenance-par-le-service.md`.
>
> **Cadrage** : `plans de travail/CADRAGE-2026-09-11-rencontres-l-orthopedagogue-entre-par-suivi.md` (entrée 11 de `00-CADRAGES-OUVERTS.md`).
> **Le lot 5 du cadrage 11 (Interventions) reste EN PAUSE.**
>
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** Les numéros de ligne datent du 12 sept. à 7 h 35 sur `1.135.1`.
> ⛔ **Aucune zone protégée n'est requise** (`js/config.js`, `js/navigation.js`). Si tu crois devoir les ouvrir, arrête et remonte.
> **Skills** : `labo-codex`, `design-interface` (tout mot à l'écran), `verification-adverse`, `portes-terrain`, `release-et-changelog`.

---

## 0 · L'INTENTION DE GRÉGOIRE — à lire avant le lot, c'est elle qui juge le résultat

Dans ses mots, le 12 sept. à 7 h 35 : **« Je veux que l'orthopédagogue sente qu'elle entre par la porte principale et non par une porte
de côté qui serait l'onglet Suivi. Elle entre par le Cadre, elle aussi. »**

Et à 7 h 05 : **« Je voudrais que les utilisateurs enseignants comprennent qu'il y a vraiment deux types d'utilisation (l'orthopédagogie
et l'enseignement) et que les orthopédagogues comprennent que l'application n'est pas que pour les enseignants, mais pour eux aussi.
[…] On ne change rien au fonctionnement, on fait juste mettre une étiquette (qui pourrait éventuellement changer) pour clarifier
comment ça fonctionne. »**

⮕ **Ce lot ne change AUCUN comportement, AUCUNE donnée, AUCUNE règle.** Il change des mots, et il en fait un point unique.
Le critère de réussite : une orthopédagogue qui ouvre `Cadre › Cours` voit, en premier choix, que l'application connaît son métier ;
un enseignant y voit que l'application en connaît deux.

---

## 1 · CE QUI EXISTE DÉJÀ — ne le refais pas (mesuré par Cowork le 12 sept. à 7 h 20)

Le tri des champs **est livré** depuis le lot A (1.135.0). `changerNatureCoursV2` (`js/trimestre-v2-cours.js:1226`) masque aujourd'hui,
quand la nature est un service : `v2-champCodeCours`, `v2-ligneCompetence`, `v2-lignePonderation` (qui porte **aussi** les heures
d'enseignement) et `v2-ligneDiscipline`. Seul le nom reste, requis, avec son libellé et son exemple propres.

Et la mesure dit pourquoi c'est juste, champ par champ — **à ne pas rouvrir** : la pondération n'a qu'un lecteur
(`trimestre-v2-horaires.js:203`, le recoupement avec l'horaire hebdomadaire — un service n'a pas d'horaire) ; les heures
d'enseignement n'en ont qu'un (`planification-carte.js:9322`, la carte d'alignement) ; les trois champs ministériels ne sont lus que
pour être recopiés sur le groupe-cours (`entites/groupe-cours.js`) et par une migration ; le **nom** est lu partout (en-tête, cartes,
dropdowns, exports, PDF, Codex) et le **code** aussi, d'où la règle « ce qui affiche un code vide affiche le nom ».

⮕ **Il ne reste donc que les mots.** Si tu te surprends à retirer un champ, c'est que tu refais hier.

---

## 2 · LE LOT

### A. Un point unique pour le mot de chaque nature
- Les VALEURS en base **ne changent pas** : `cours.nature` vaut toujours `'cours'` ou `'service'`. Aucune migration, aucune écriture,
  aucune donnée touchée. C'est la règle qui commande tout ce lot.
- **Un seul endroit** dans le code donne le mot affiché pour une nature : `'cours'` → **« Enseignement »**, `'service'` →
  **« Orthopédagogie »**. Grégoire a dit explicitement que ce mot **changera** le jour où d'autres services existeront : il doit se
  changer là, et nulle part ailleurs. Nomme-le et exporte-le comme les autres points uniques du projet (`contexteActifEstService`,
  `GROUPE_SERVICE`).
- **Mesure d'abord tous les sites qui écrivent ces mots à l'écran**, puis fais-les passer par le point unique. Départ mesuré
  (12 sept., 7 h 35) — **vérifie-le, il est probablement incomplet** :
  `index.html:6594` (l'option du menu Nature) · `trimestre-v2-cours.js:190, 473, 476, 993, 1159, 1235, 1331, 1354` ·
  `trimestre-v2-groupes-cours.js:856` · `rencontres.js:129, 164, 178, 301`.
  ⚠ **Faux ami** : `evaluation-projection.js:370` (« Nom du service d'aide ») ne parle pas de ça — ne le touche pas.

### B. Les mots tranchés par Grégoire sur la porte (§ 3, relevé du 12 sept.) — livre-les tels quels
| Où | Le mot |
|---|---|
| `Cadre › Cours`, menu **Nature** | « Enseignement » / « Orthopédagogie » (à la place de « Cours » / « Service ») |
| Sous-navigation de Suivi | « Rencontres (ortho.) » |
| Rencontres, les trois questions | « … l'application a besoin de trois choses. Elle crée ensuite **ton service d'orthopédagogie**, visible dans Cadre, tel quel. » · bouton « **Créer mon service d'orthopédagogie** » |
| Rencontres, notification de création | « **Tes rencontres d'orthopédagogie se tiennent ici** ; Cadre montre le service tel quel. » |
| Rencontres, carte sur un groupe-cours ordinaire | **nomme l'orthopédagogie directement** (décision de Grégoire : « il s'agit d'un type d'utilisateur complètement différent d'un enseignant »). Propose le texte dans le rapport ; il corrigera. |

### C. Le Cadre comme porte principale — c'est le § 0, et c'est la partie qui demande ton jugement
- **Le formulaire de groupe-cours** : l'accordéon « Enseignant·e » (`index.html:6294`, `6822`, libellé « Profil enseignant ») et tout
  libellé qui nomme l'enseignant doivent dire **« orthopédagogue »** quand la nature du cours actif est l'orthopédagogie. Même
  mécanisme que `changerNatureCoursV2` : un mot, pas un champ retiré.
- **Relis le Cadre avec ses yeux à elle**, et mesure : titres, états vides, bandeaux d'aide, infobulles de `Cadre › Cours` et
  `Cadre › Groupe-cours`. Tout ce qui présume l'enseignement (« ton cours », « tes élèves de classe », « le devis ministériel ») se
  note. **Liste tes trouvailles dans le rapport avec le texte proposé ; ne réécris QUE ce qui est faux pour elle**, pas ce qui est
  seulement perfectible — sinon ce lot devient une refonte.

### D. Sentinelles, avec break-test rouge
1. Le point unique rend « Enseignement » pour `'cours'` et « Orthopédagogie » pour `'service'` ; **aucun site ne réécrit le mot en dur**
   (verrou structurel, à la manière de `obtenirIdContexteActif` : plus aucune recopie hors du point unique).
2. La valeur en base reste `'service'` après un aller-retour complet du formulaire (création, modification, relecture) — **c'est le
   verrou qui prouve qu'on n'a changé qu'une étiquette.**
3. Le libellé de l'enseignant suit la nature du cours actif, dans les deux sens.

**Harnais AVANT/APRÈS sur le pack démo** : les seules différences admises sont des **chaînes affichées**. Zéro valeur, zéro clé,
zéro identifiant. Si un nombre bouge, arrête et remonte.

---

## 3 · CE QUI NE SE FAIT PAS DANS CE LOT
- ⛔ **La liste des disciplines ne s'ouvre pas.** Question de Grégoire (7 h 30 : « pourrait-on considérer le service d'orthopédagogie
  comme une discipline ? »), tranchée par la mesure : la liste est fermée, codée dans `index.html`, organisée par familles
  ministérielles — c'est le registre du collégial. L'orthopédagogie n'y entre pas. Le partage aura un **second axe** (la nature, qui
  voyagerait avec le matériel à côté de sa discipline) ; à inscrire, pas à coder.
- ⛔ **#838** (un élève déjà inscrit à un autre cours n'entre pas dans un service) n'est pas ce lot.
- ⛔ Aucune migration, aucune réécriture de données, aucun changement de `nature` en base.

## 4 · CE QUI REMONTE À GRÉGOIRE
- Le texte de la carte sur un groupe-cours ordinaire (§ 2 B, dernière ligne) et tout mot du Cadre que § 2 C fait apparaître :
  **propose-les dans le rapport, avec leur emplacement** ; livre-les tels quels, il corrigera.
- Si § 2 C révèle qu'un mot du Cadre est faux pour elle **et** qu'un comportement va avec (un champ requis qui n'a pas de sens),
  **arrête ce point, inscris, remonte** : ce lot ne change aucun comportement.

## 5 · LIVRER — `minor` (`1.136.0`)
Le mot « Cours » devient « Enseignement » sur l'écran de **tous** les utilisateurs, pas seulement le sien : c'est visible, donc `minor`.
Une seule livraison, après la relecture croisée de Cowork. Changelog utilisateur : deux ou trois lignes qui disent ce que chacun voit —
qu'il y a désormais deux usages nommés dans le Cadre, l'enseignement et l'orthopédagogie, et que rien d'autre ne change.

## 6 · LA PORTE TERRAIN
Porte neuve et courte (`PORTES-TERRAIN-2026-09-12-etiquettes.md`), markdown par toi, artefact par Cowork :
1. `Cadre › Cours` sur son 601-101-MQ : le menu Nature dit **Enseignement / Orthopédagogie**, tous ses champs intacts, rien d'autre changé.
2. Bascule le menu sur Orthopédagogie **sans enregistrer** : les champs se masquent comme avant, les mots suivent ; remets sur
   Enseignement : tout revient.
3. En démo, sur le service existant : `Cadre › Cours` et `Cadre › Groupe-cours` disent l'orthopédagogie, y compris le mot de
   l'orthopédagogue là où l'autre dit l'enseignant.
4. `Suivi` : le sous-onglet dit « Rencontres (ortho.) » ; les trois questions et la notification portent les mots du § 2 B.
5. Sur ses deux groupes réels : Suivi du groupe, Liste, un profil — **identiques**.

## 7 · RAPPORT
Les sites du mot, avant et après le point unique (le compte) ; ce que § 2 C a trouvé dans le Cadre, avec les textes proposés ; ce que
tu as laissé exprès. Fin de course : `OU-EN-EST-ON.md` et `CONSIGNE-DEMARRAGE-COWORK.md` remesurés.

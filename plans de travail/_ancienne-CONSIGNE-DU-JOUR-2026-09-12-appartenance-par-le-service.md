# Consigne du jour — dans un service, un élève appartient par son service, pas par un numéro de groupe

> **Écrite le samedi 12 septembre 2026 à 6 h 15 (Toronto) par Cowork**, pendant le relevé de la porte terrain de « Rencontres ».
> État mesuré au moment de l'écriture : **`1.135.0`**, build `0911-2145`, `main` = `origin/main` = `6727ed93`, `rev-list origin/main..HEAD` = **0**.
> Elle remplace la consigne des lots 1 et 2 du chantier « Rencontres », archivée à côté sous
> `_ancienne-CONSIGNE-DU-JOUR-2026-09-12-rencontres-lots-1-2.md`.
>
> **Cadrage** : `plans de travail/CADRAGE-2026-09-11-rencontres-l-orthopedagogue-entre-par-suivi.md` (entrée 11 de `00-CADRAGES-OUVERTS.md`).
> **Porte terrain** : `plans de travail/PORTES-TERRAIN-2026-09-12-rencontres.md`, rangées 9 et 11.
> **Le lot 5 du cadrage 11 (Interventions) reste EN PAUSE** — cette consigne ne l'ouvre pas.
>
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** Les numéros de ligne ci-dessous datent du 12 sept. à 6 h 10 sur `1.135.0`.
> ⛔ **Aucune zone protégée ici** : `js/config.js` et `js/navigation.js` ne sont pas touchés. Si tu crois devoir les ouvrir, arrête et remonte.
> **Skills** : `labo-codex`, `depistage-rai`, `verification-adverse`, `portes-terrain`, `release-et-changelog`, `integrite-globaux`.

---

## 0 · CE QUE CE LOT CHANGE, À L'ÉCRAN

L'orthopédagogue colle sa liste d'élèves dans les trois questions de `Suivi › Rencontres`. Chaque ligne de sa liste porte le numéro
de groupe d'origine de son collège (`00007`, `00012`…). Son service, lui, est un groupe-cours numéroté `00001`. **Aujourd'hui, ses
élèves disparaissent de sa propre liste** : `Suivi › Liste des étudiant·es` les compte, puis n'en affiche aucun, sans un mot.
Après ce lot, ils sont là, tous, quel que soit le numéro que portait leur ligne.

---

## 1 · CE QUI A ÉTÉ MESURÉ CE MATIN — la preuve, pas le récit

Relevé de la porte, rangées 9 et 11, sur `1.135.0` en mode démonstration, par Grégoire.

**La création marche.** Le service, ses élèves et son groupe-cours sans horaire sont bien écrits, et le contexte bascule dessus.
Sonde en console, sortie brute :

```
cle eleves : demo_groupeEtudiants | total dans la cle : 21
infoCours.id : COURS_1789206387370_1_c675b062e0d0 | Ortho Grégoire
gc actifs : [{"nom":"Démonstration - Ortho Grégoire - 00001","coursId":"COURS_1789206387370_1_c675b062e0d0","horaireId":null,"groupeNum":"00001"}]
coursId des eleves : ["demo-cours","COURS_1789206387370_1_c675b062e0d0"]
rendu par le goulot : 0
```

**Le défaut est à la LECTURE.** Trois élèves saisis (« Service créé — 3 élèves »), **deux affichés**. Le troisième venait d'une
ligne Omnivox réelle : `="9000931";="00007";="Exemple";="Sara";="241.A0";`. Sa fiche porte `groupe: "00007"` — le vrai groupe de
ce collège. Le groupe-cours du service porte `groupeNum: "00001"`. Les deux lectures ci-dessous exigent l'égalité des deux, et
l'élève tombe.

**Les deux sites, mesurés :**
- `js/modes.js:754` — dans `obtenirDonneesSelonMode`, le filtre `clesAvecCoursId` : après avoir gardé les items du bon `coursId`,
  il compare encore `normaliserNumeroGroupe(item.groupe)` au groupe du contexte.
- `js/modes.js:1258` et `js/modes.js:1274` — dans `obtenirEtudiantsCoursActif` (l. 1223), la même comparaison, deux fois : la
  branche « ancien format sans `coursId` » et la branche « nouveau format ».

**Ce que ça exclut comme cause** (vérifié, pour t'éviter de le refaire) : la clé n'est pas en cause (écriture et lecture passent
toutes deux par `cle('groupeEtudiants')`) ; `filtrerEtudiantsParMode` (l. 1178) ne filtre rien en démo ; `infoCours.id` correspond
bien au `coursId` du groupe-cours actif.

---

## 2 · LE LOT A — la règle d'appartenance (obligatoire)

**La règle, en une phrase : dans un contexte de SERVICE, un élève appartient par son `coursId`. Le numéro de groupe ne départage
rien** — un service n'a qu'un seul groupe-cours, il n'y a rien à départager.

- Le point unique existe déjà : **`contexteActifEstService()`** (`js/modes.js:560`, sept appelants). **Utilise-le, ne recopie pas
  le test.** Si le contexte actif est un service, les trois comparaisons de groupe (l. 754, 1258, 1274) ne s'appliquent pas :
  l'appartenance se conclut sur le `coursId` seul. Pour la branche « ancien format sans `coursId` » (l. 1258), un service n'a pas
  d'historique : décide toi-même du comportement le plus sobre et dis-le en une ligne dans le rapport.
- ⚠ **Hors service, rien ne change. C'est la condition qui commande tout le reste** : ces trois lignes sont lues par tous les
  écrans de tous les enseignants. La garde se pose sur le service, jamais l'inverse.
- **Pourquoi la lecture et pas l'écriture** : réécrire le groupe des fiches à la saisie tarirait la source, mais laisserait
  invisible l'élève déjà écrite ce matin — et on n'écrit pas dans les données de quelqu'un pour réparer un stock (`CLAUDE.md`,
  « tarir n'est pas réparer »). Corrigée à la lecture, elle réapparaît sans qu'on touche à rien.

**Et, en complément, à l'écriture** (`js/rencontres.js`, `creerMonService`, étape 3) : pour un service, écris `groupe: '00001'`
pour toutes les fiches, quel que soit le numéro lu dans la ligne collée. Motif : la colonne « Groupe » de `Suivi › Liste des
étudiant·es` afficherait sinon `00007` pour une élève et `00001` pour les autres, dans un service qui n'a qu'un groupe — un chiffre
qui ne veut rien dire à l'écran. *Supposition nommée : je tiens le numéro de groupe d'origine pour sans valeur dans un service.
Si tu mesures qu'un écran s'en sert, arrête ce point et inscris-le.*

**Sentinelles, avec break-test rouge pour chacune :**
1. Un service dont les élèves portent des groupes hétérogènes (`00001`, `00007`, vide) : les trois sont rendus par
   `obtenirEtudiantsCoursActif` et par `obtenirDonneesSelonMode('groupeEtudiants')`.
2. Un groupe-cours **ordinaire** à deux groupes : le filtre par groupe mord toujours, exactement comme avant (c'est le verrou de
   non-régression, il compte plus que le premier).
3. Un service et un cours ordinaire dans le même trimestre : les élèves de l'un n'apparaissent pas dans l'autre.

**Harnais AVANT/APRÈS sur le pack démo**, comme celui du 11 (1 284 feuilles) : **zéro différence de valeur** attendue. Une seule
feuille qui bouge hors d'un contexte de service est un défaut, pas un progrès.

---

## 3 · LE LOT B — une ligne illisible doit se dire (si le temps reste)

Mesuré ce matin aussi, sur la même porte : les trois lignes collées **en une seule** ont produit **un élève fantôme**, sans erreur
ni avertissement — `DA = "Léa Tremblay, 1234567"`, `groupe = "Gagnon"`, `prénom = "00007"`. Cause : `analyserListeEleves`
(`js/rencontres.js`) confie toute ligne de quatre colonnes ou plus au lecteur Omnivox, qui prend la 2ᵉ colonne pour le groupe et
la 1ʳᵉ pour le DA, sans vérifier qu'elles en ont la forme.

**Ce qui est dû** : à la création, une ligne dont le « DA » n'a pas la forme d'un DA est **refusée et nommée** — « La ligne 1 n'a
pas pu être lue : … . Une ligne par élève. » Le service se crée avec les lignes valides, ou pas du tout si aucune ne l'est ; jamais
un élève fantôme en silence. Le mot exact est à toi, propose-le dans le rapport.

⛔ **Si ce lot dépasse une heure, ne le fais pas : inscris-le au backlog et dis-le.** Le lot A part lundi, pas celui-ci.

---

## 4 · CE QUI REMONTE À GRÉGOIRE (ne code pas à sa place)
- Si le lot A révèle qu'un calcul (indice, note, moyenne) change de valeur pour un cours **ordinaire** : arrête ce point, inscris,
  remonte. C'est la seule chose qui doit l'interrompre.
- Tout mot nouveau à l'écran (le message de refus du lot B) : propose-le dans le rapport avec son emplacement ; livre-le tel quel,
  il corrigera.

## 5 · LIVRER — `patch` (`1.135.1`)
Un correctif sur une fonctionnalité livrée hier, rien de neuf à l'écran. Une seule livraison, à la fin, après la relecture croisée
de Cowork sur les commits. Changelog utilisateur : une ligne, sans le mot « orthopédagogue » — ce que verra quelqu'un qui tient des
rencontres, pas ce qui a été réparé dans le code. Si le lot B n'est pas fait, le changelog ne le mentionne pas.

## 6 · LA PORTE TERRAIN
Deux rangées à ajouter au markdown existant (`PORTES-TERRAIN-2026-09-12-rencontres.md`), pas une porte neuve :
- **13** — en démo, sur le service déjà créé ce matin : `Suivi › Liste des étudiant·es` montre **les trois élèves**, dont Exemple
  Sara, sans que Grégoire ait rien ressaisi (c'est la preuve que le stock est réparé par la lecture).
- **14** — sur ses **deux groupes réels** : Liste, Suivi du groupe et un profil, identiques à ce matin.

## 7 · TROUVAILLES ET RAPPORT
Ce que la garde de service a coûté à chacun des trois sites ; ce qui a été décidé pour la branche « ancien format » ; le mot du
lot B ; et, si tu le vois passer, ce que devient le numéro de groupe d'origine d'une ligne Omnivox dans un service —
**inscris, ne code pas**. Fin de course : `OU-EN-EST-ON.md` et `CONSIGNE-DEMARRAGE-COWORK.md` remesurés.

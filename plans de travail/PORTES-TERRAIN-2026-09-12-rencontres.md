# Portes terrain — 12 septembre 2026 (« Rencontres » : l'orthopédagogue entre par Suivi — lots 1 et 2 du cadrage, à livrer en 1.135.0)

> **Version à l'écran attendue : `1.135.0`** (la release n'est PAS faite au moment où cette porte est écrite — 11 sept., 22 h : quatre
> commits de code sur `main` local, non poussés, exprès : la consigne du jour demande une seule livraison après ton coup d'œil et la
> relecture croisée de Cowork. **Tant que la version lue en bas de page est `1.134.0`, cette liste ne juge rien.**)
> Couvre : un cours de nature « Service » dans Cadre (lot A) ; un groupe-cours sans horaire (lot B) ; le sous-onglet **Suivi › Rencontres**
> avec les trois questions et la liste des rencontres (lot C, `config.js` et `navigation.js` touchés avec ton autorisation) ; une
> intervention qui porte son groupe-cours de naissance (lot D) ; le point unique de l'identifiant du contexte (lot E, invisible).
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.

**Pourquoi cette liste est courte.** Le harnais du pack démo a été capturé AVANT le premier commit et rejoué APRÈS le dernier : 1 284
feuilles (Cadre, Suivi du groupe et ses deux graphiques, Liste, Présences, 20 profils avec indices et palier RàI, Interventions, export),
**0 différence de valeur** — seules les chaînes statiques ajoutées (le choix Cours / Service, la mention « facultatif pour un service »,
la phrase du bandeau cachée) diffèrent. Quatre sentinelles (40 essais), vingt-quatre fois cassées exprès, vingt-quatre rouges. Le parcours
des trois questions a été joué dans WebKit sur un poste vide (0 erreur). Reste ce que seul ton écran tranche : **tes deux groupes réels**,
Safari, et les mots.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** dans un **nouvel onglet** (si un onglet de l'app était déjà ouvert : recharge-le avec vidage de cache, Cmd+Maj+R) | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.135.0`**. Sinon, arrête-toi : la liste jugerait la version d'avant. |

---

## §1 · Tes données — ce que cette liste écrit chez toi

**Rangée 1 à 6 : rien.** Regarder ne touche à rien. **Rangée 7 (Interventions) : rien non plus** — tes interventions existantes n'ont
pas de `groupeCoursId` ; elles restent visibles dans tous tes groupes-cours et ne prennent leur contexte **qu'au prochain Enregistrer**
de chacune, sous le groupe-cours actif à ce moment-là (jamais réécrites en masse). Si tu rouvres une intervention et cliques Enregistrer,
elle prend le groupe-cours actif : c'est voulu, et c'est réversible en la rouvrant sous l'autre.

**Rangées 8 à 12 : en mode démonstration.** Les élèves saisis vont dans `demo_groupeEtudiants`, le groupe-cours dans `demo_groupesCours`
(namespace démo, jamais purgé, rafraîchi au prochain pack) ; le service, lui, entre dans la clé **globale** `cours` — mesuré le 11 au
soir : la désactivation de la démo ne retirait que les items du pack. Corrigé avant cette porte : un service créé en démo est marqué et
**retiré quand tu quittes la démonstration**. La rangée 12 le vérifie. ⛔ Ne crée PAS de service hors démo pour cette porte : il
entrerait dans ta vraie liste de cours, et sa suppression passe par le garde #449 (refus tant qu'un groupe-cours le porte).

---

## §2 · Ce que seul ton écran peut trancher

### 2.1 · Rien ne bouge sur tes deux groupes réels

**Pourquoi.** Le cadrage l'exige : « zéro pixel ne bouge pour l'enseignant ». Le harnais le prouve sur le pack démo, pas sur tes
données ; c'est toi qui connais tes écrans.

| | Geste | Attendu |
|---|---|---|
| **1** | `Cadre › Trimestre`, accordéon **Cours** : ouvre ta fiche 601-101-MQ | un nouveau choix **« Nature : Cours / Service »** en tête du formulaire, sur **Cours** ; tous tes champs (code, compétence, pondération, discipline) **intacts**, rien d'autre de changé |
| **2** | Accordéon **Groupe-cours**, ton groupe actif | carte identique à hier ; le label « 4. Horaire * » garde son astérisque |
| **3** | `Suivi › Suivi du groupe` | **identique à hier** : mêmes barres A, C, P, mêmes graphiques, même liste suivie |
| **4** | `Suivi › Liste des étudiant·es`, puis `Saisie des présences` | **identiques à hier** (la Saisie : même date par défaut, même bandeau ou absence de bandeau) |
| **5** | Un profil que tu connais (indices, cartes RàI, rapport) | **identique à hier** |
| **6** | La sous-navigation de Suivi | **« Rencontres » entre « Interventions » et « Animation »** — c'est le seul pixel neuf hors Cadre |
| **7** | `Suivi › Interventions` | **toutes tes interventions existantes sont là**, dans chacun de tes deux groupes-cours (elles n'ont pas encore de contexte) ; libellés inchangés (« Planifier une intervention », « Niveau RàI ») |

### 2.2 · Le sous-onglet Rencontres, en démonstration (pas tes données)

**Pourquoi.** C'est le parcours de lundi. Ici tu le fais sur le trimestre « Démonstration » : le trimestre existe déjà, donc la
question 1 (les dates) **ne s'affiche pas** — elle ne s'affiche que sur un poste sans trimestre, comme celui de l'orthopédagogue.

| | Geste | Attendu |
|---|---|---|
| **8** | Active la démonstration, `Suivi › Rencontres` | la liste (vide) avec **« + Nouvelle rencontre »**, précédée de la ligne « Tu reçois des élèves hors d'un groupe-cours ? **Créer un service** » |
| **9** | Clique **Créer un service** : « 1. Ton trimestre : Démonstration » (pas de dates), nom du service, puis colle trois lignes — `Léa Tremblay`, `1234567 ; Gagnon ; Noah`, et une ligne Omnivox de ta liste réelle (DA, groupe, nom, prénom…) — puis **« Créer mon service »** | notification « Service créé — 3 élèves ajoutés (1 sans DA : numéro provisoire) » ; l'en-tête bascule sur **« Aide à la réussite… gr.00001 »** ; l'écran passe à la liste des rencontres |
| **10** | `Cadre › Trimestre` : accordéon Cours, puis Groupe-cours | le cours **« … — Service (actif) »** dans le menu, sa fiche montre **Nature : Service** et le nom, rien d'autre ; le groupe-cours **« Démonstration - … - 00001 »**, carte : **Horaire : Aucun — la présence se note dans la rencontre**, 4/5 configurés |
| **11** | `Suivi › Liste des étudiant·es`, puis `Suivi › Rencontres` › **+ Nouvelle rencontre** | la Liste montre **tes trois élèves saisis** (rien du pack) ; le formulaire s'intitule **« Nouvelle rencontre »**, « Rencontre : Individuelle » par défaut, **sans** « Contexte de l'intervention » ni « Séance concernée » ; coche un élève, écris une note, Enregistre : « Rencontre enregistrée », la carte porte **« Individuelle »** (pas de « Niveau 3 ») ; la même rencontre apparaît aussi sous `Suivi › Interventions` (« Hors classe · Niveau 3 ») — **c'est le chevauchement nommé dans le rapport, à trancher** |
| **12** | Quitte la démonstration, `Cadre › Trimestre` › Cours | **le service n'est plus dans ta liste de cours** ; tes deux groupes réels sont revenus |

---

## §3 · Les mots proposés — silence = tel quel (règle du 11)

| Où | Le mot | Ta réponse |
|---|---|---|
| Sous-navigation de Suivi | « Rencontres » (tranché le 11, 19 h 35) | — |
| Cadre › Cours, formulaire | « Nature : Cours / Service » et « Un service (aide, rencontres) n'a ni code, ni discipline, ni compétence : seul son nom est requis. » ; « Nom du service * » | _______ |
| Cadre › Groupe-cours | « (facultatif pour un service) » à la place de l'astérisque ; carte : « Horaire : Aucun — la présence se note dans la rencontre » | _______ |
| Saisie des présences, bandeau, sur un service | « Ce service n'a pas d'horaire : la présence se note dans la rencontre (Suivi › Rencontres). » | _______ |
| Rencontres, écran des trois questions | « Pour tenir tes rencontres ici, l'application a besoin de trois choses. Elle crée ensuite ton service, visible dans Cadre, tel quel. » — « 1. Les dates de ton trimestre » / « 1. Ton trimestre » — « 2. Le nom de ton service — C'est le seul nom qu'on te demandera… » — « 3. Tes élèves — Une ligne par élève : Prénom Nom, ou DA ; Nom ; Prénom, ou la liste Omnivox collée… Sans numéro de DA, un numéro provisoire est attribué. » — bouton « Créer mon service » | _______ |
| Rencontres, sous un groupe-cours ordinaire | « Tu reçois des élèves hors d'un groupe-cours ? Créer un service » | _______ |
| Rencontres, liste et formulaire | « + Nouvelle rencontre », « Nouvelle rencontre », « Aucune rencontre. », « Rencontre : En sous-groupe / Individuelle », « Participants et notes », « Aperçu des participants », « Bilan de la rencontre », « Rencontre enregistrée », « Supprimer cette rencontre ? » | _______ |
| Notification de création | « Service créé — n élèves ajoutés (…) Tes rencontres se tiennent ici ; Cadre montre le service tel quel. » | _______ |
| Non renommé, à dire si tu le veux | « Durée (périodes) » dans le formulaire de rencontre ; le bouton « Guide RàI » ; les cartes « Patterns d'apprentissage / Niveaux RàI » de l'aperçu | _______ |

---

## §4 · Relevé

| Rangée | ✅ / ❌ | Note |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |
| 6 | | |
| 7 | | |
| 8 | | |
| 9 | | |
| 10 | | |
| 11 | | |
| 12 | | |

**Relevée le** : _______ · **Version lue en bas de page** : _______ · **Échecs → BACKLOG** : _______

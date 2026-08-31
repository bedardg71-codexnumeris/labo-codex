# Portes terrain — chaîne d'importation des travaux (30 août 2026)

> # ⛔ ABANDONNÉES — décision de Grégoire, 30 août 2026 au soir
>
> **Ces quatre portes ne sont pas à jouer.** Elles sont complètes et exactes ; elles
> ne sont simplement pas dues. Le fichier est gardé parce que son §1 dit ce qu'il
> faudra regarder si un symptôme apparaît, et parce que son tri documente une
> méthode.
>
> **Le motif, et il vaut pour les cycles suivants.** Aucun des quatre ratés visés
> n'est IRRÉVERSIBLE : un fichier en corbeille se restaure (la rangée 1.5 le
> vérifiait elle-même), des doublons se suppriment, un statut « exporté » écrasé est
> une perte d'information, pas de travail. La règle 2 du skill `portes-terrain` les
> écarte donc toutes les quatre — le tri initial l'avait appliquée à S2 et S8, sans
> la retourner contre les quatre retenues.
> ⮕ Et un fait que le tri n'avait pas vu : **la porte P3 demandait d'importer dans
> le corpus réel, de recharger en plein milieu et de confirmer un re-dépôt.** Si le
> correctif avait un défaut, la porte mettait Grégoire dans l'état exact qu'elle
> prétendait prévenir, dans ses vraies données, à trois jours de la rentrée. **Le
> test coûtait le risque qu'il mesurait.**
>
> **Ce qui les remplace, et c'est tout** : au premier import d'un vrai lot en
> septembre, regarder **l'attribution des copies**. C'est le seul défaut du lot qui
> soit SILENCIEUX — une copie sous le nom d'un autre élève ne se signale pas, et
> pourrait faire annoter le travail de l'un pour l'autre. Tout le reste se voit en
> usage normal et se dit.
>
> **Ce qui rend cet abandon raisonnable** : les correctifs ne sont pas « probablement
> bons », ils sont mesurés — 4344 tests verts, et surtout des **break-tests avec
> rouges obtenus**, chaque correctif muté pour vérifier que sa sentinelle savait
> échouer. Ce que le banc ne voit pas est étroit : le rendu et l'iPad.

> Jumeau markdown de l'artefact interactif. L'artefact sert à COCHER, ce fichier
> sert à RETROUVER — une session qui fait son rituel de début doit savoir ce qui
> reste dû sans accès à la conversation.
>
> **Artefact** : https://claude.ai/code/artifact/a31e941f-6983-42f9-a3ef-34390457b141
> (éprouvé dans WebKit avant publication : 19 rangées, compteurs, filtres par tag,
> relevé exportable avec les mesures et les verdicts, état persistant au
> rechargement, zéro erreur console).
>
> **Cycle couvert** : S1 à S8 du plan `PLAN-chaine-importation-travaux-2026-08-30.md`
> — #607, #608, #609, #610, #611, #613, #614.
> **Écrit par** : session `kuekatsheu-0d`, 30 août 2026, 20 h.
> **Ce qui échoue devient un item de BACKLOG avec son numéro de porte, pas une
> note mentale.**

---

## Tri préalable — six tests annoncés, quatre portes retenues

Les deux règles de tête du skill `portes-terrain` ont été appliquées avant
d'écrire une seule rangée. Le tableau dit ce qui a été écarté et pourquoi ; il
est là pour qu'on ne le remette pas par réflexe de gabarit au cycle suivant.

| Test annoncé au plan | Retenu ? | Motif |
|---|---|---|
| S1 · jeton retiré → fichier de la reprise | **Oui — P1** | Écriture irréversible : un fichier part en corbeille. Le banc teste la fonction, pas l'enchaînement sur le corpus réel. |
| S2 · `maxParProduction = 1`, bouton « jeton » masqué | **Non** | Règle 2. Aucune perte : si le bouton paraissait à tort, un clic donne une notification d'erreur explicite et **aucun jeton n'est consommé** (livré en T2.3). La décision est déjà verrouillée au banc (`_jetonRepriseOffrable`, 9 cas). ⮕ Reste un trou d'AFFICHAGE, automatisable en Playwright : à écrire, pas à faire faire. |
| S3 · lot iPad, deux homonymes | **Oui — P2** | Un travail attribué au mauvais élève est irréversible et silencieux. L'ordre réel de la `FileList` sur iPad n'existe pas au banc. |
| S4 · import interrompu, re-dépôt | **Oui — P3** | La porte centrale du cycle. Doublons muets + blob sous le mauvais DA. La veille de l'iPad ne se simule pas. |
| S7 · restauration d'archive | **Oui — P4** | Un import écrit dans la base. Et la garde `blobStatut !== 'exporte'` peut, si elle est fausse, **écraser une métadonnée juste** par un « manquant » faux. |
| S8 · codex à fichier piégé | **Non** | Règle 1. Entièrement couvert au banc (sentinelle #614, 15 cas, 8 break-tests rouges) : `validerMagicBytes` est appelé avant `stockerBlob` dans `_fusionnerTravaux`. Fabriquer un fichier piégé est un geste technique qui ne mesurerait rien de plus. ⮕ Ce qui RESTE de S8 n'est pas une vérification mais une **décision** : voir §3. |

---

## §0 · Préalable — à lire avant de toucher à quoi que ce soit

✅ **C'EST OUVERT — mesuré à 19 h 55, et les deux avertissements de la version
précédente de ce fichier sont LEVÉS.** Ils ont tenu quarante minutes ; le détail
est gardé plus bas parce qu'il dit ce qu'il faut re-vérifier au prochain cycle,
pas parce qu'il vaut encore.

- `git status -- js index.html` ne rend **rien** : aucun fichier que ton
  application charge ne porte de travail non commité.
- `main` porte **4 commits d'avance** sur `origin/main`, non poussés — ils sont
  POSTÉRIEURS à la release et **ne changent rien à ce que tu testes** : de la
  documentation, plus une fonction ajoutée (`detecterFichiersDAInconnu`) que
  **rien n'appelle encore** — vérifié par grep, son seul usage est son propre
  export. Son bandeau viendra plus tard (T6.4).
- **Release 1.106.12 faite, build `0830-1947`.** Elle contient S4, S5, S7, S8
  **et T6.6** — donc le correctif dont dépend la porte P1.
- Vitest **412 fichiers / 4344 tests, code de sortie 0**, mesuré à 20 h 03,
  **suite entière, sans aucune exclusion**. *(Une version antérieure de cette page
  annonçait 4334 tests « hors une sentinelle rouge par construction » : cette
  sentinelle est passée au vert à 20 h, son correctif ayant été écrit.)*

⮕ **LE NUMÉRO DE VERSION EST REDEVENU TON REPÈRE, et c'est le bon.** Recharge
l'application et lis le bas de page : tu dois voir **1.106.12 · build 0830-1947**.
Si tu vois encore 1.106.11, c'est du cache — recharge en forçant. *(La version
précédente de ce fichier disait que ce repère était inopérant : c'était vrai
avant la release de 19 h 47, ce ne l'est plus.)*

- **Rien à tirer, et ne tire rien** : les sessions ont commité et poussé depuis
  ton clone. Pas de `git pull` — et surtout pas pendant qu'une suite de tests
  tourne à côté. Recharge l'application, c'est tout.
- **Backup Codex avant P1, P3 et P4** — les trois écrivent sur ton corpus.
- **`allow pasting`** dans la console avant la rangée 3.1.
- Les deux appareils quand la porte porte le tag `iPad`.

---

## §1 · ⚠⚠ Données — ce qui s'exécute sur ton corpus

### P1 · Retirer un jeton de reprise emporte son fichier — #607 (S1)

**Pourquoi.** Avant le correctif, retirer un jeton de reprise laissait le fichier
de la reprise actif. La ligne de l'évaluation originale, restaurée, ouvrait alors
le travail de la reprise que tu venais d'annuler : le mauvais document, sans rien
qui le signale.

| # | Geste | Attendu | Tags |
|---|---|---|---|
| 1.1 | Enregistre un Codex de sauvegarde | Fichier `.codex` sur le disque | ⚠⚠ Données |
| 1.2 | Ouvre une évaluation qui porte un jeton de reprise, note le nom du fichier de la reprise | *(mesure — à écrire)* | |
| 1.3 | Retire le jeton | La confirmation **annonce** que le fichier de la reprise part à la corbeille. Avant, elle n'en parlait pas. | ⚠⚠ Données |
| 1.4 | Depuis la ligne de l'originale restaurée, ouvre le travail | C'est le fichier **ORIGINAL**. Avant : celui de la reprise effacée. | |
| 1.5 | Va dans la corbeille | Le fichier de la reprise y est, et il est restaurable | |

### P2 · Deux photos du même nom ne sont plus soudées — #609 (S3)

**Pourquoi.** Deux photos portant le même nom de fichier — ce que produit un
iPhone en série — étaient assemblées en un seul document. Un élève recevait la
copie d'un autre, et l'écran annonçait quand même le bon compte.

| # | Geste | Attendu | Tags |
|---|---|---|---|
| 2.1 | Prépare deux photos de DEUX élèves différents portant le même nom de fichier | | iPad |
| 2.2 | Importe-les dans le même lot | **Deux** documents distincts, pas un | iPad · ⚠⚠ Données |
| 2.3 | Vérifie à qui chaque copie est attribuée | Chaque élève a SA copie | iPad |
| 2.4 | Importe deux remises du MÊME élève, faites à deux dates différentes | Deux documents, jamais fusionnés (décision D1 du 30 août) | iPad |

### P3 · Import interrompu, puis re-dépôt — #610 (S4) · LA PORTE CENTRALE

**Pourquoi.** Deux pannes vécues, deux pertes différentes. La première : 40 photos
sans DA, l'iPad en veille au 25ᵉ fichier ; au retour, la file en affichait 40 « à
re-déposer » alors que 25 étaient déjà en base. Tu re-déposais, tu confirmais —
25 fichiers en double, aucun avertissement, et l'écran annonçait « 40 fichier(s)
importé(s) ». La seconde : au re-dépôt, deux fichiers de même nom étaient
rattachés dans l'ordre où le navigateur les rendait, sans regarder leur contenu.
Le travail d'un élève pouvait se retrouver sous le nom d'un autre.

| # | Geste | Attendu | Tags |
|---|---|---|---|
| 3.1 | Colle dans la console : `travauxImport.reattacherBlobs.toString().includes('tailleOriginale')` | `true`. Si `false`, ton application ne charge pas le code corrigé — arrête-toi ici, rien de ce qui suit n'a de sens. | Console |
| 3.2 | Lance l'import d'au moins 10 fichiers, puis recharge la page en plein milieu | | ⚠⚠ Données |
| 3.3 | Regarde la file d'attente | Elle ne propose à re-déposer QUE ce qui n'est pas passé *(mesure : combien)* | |
| 3.4 | Re-dépose deux fichiers de MÊME NOM et de TAILLES DIFFÉRENTES | Chacun retrouve SON entrée ; les fichiers non reconnus sont **nommés à l'écran**, pas écartés en silence | |
| 3.5 | Confirme l'import | Aucun doublon silencieux. Un doublon détecté est annoncé avec son motif : « même nom et même taille » | ⚠⚠ Données |
| 3.6 | Refais 3.2 sur l'iPad, en laissant l'appareil se mettre en veille pendant le lot | Même comportement qu'au Mac | iPad · ⚠⚠ Données |


⚠ **Un message inexact que tu vas peut-être croiser, et qui n'est PAS un échec de
cette porte.** Le bandeau « sans DA » annonce « l'association devra être faite
manuellement ». Depuis #611, c'est faux pour un fichier dont l'élève a été trouvé
par son NOM : l'association est déjà faite. Le message reste juste pour le
regroupement multi-pages. Défaut connu, relevé le 30 août au soir, à reformuler
en T6.4 — ne le coche pas en échec.

### P4 · Aller-retour d'un codex — #613 (S7)

**Pourquoi.** À la restauration d'une archive, un fichier qui n'arrivait pas était
avalé en silence et l'application annonçait « Import réussi ! ». Tu découvrais le
trou plus tard, devant un cadre vide, sans savoir quels travaux manquaient.

| # | Geste | Attendu | Tags |
|---|---|---|---|
| 4.1 | Enregistre un Codex de sauvegarde | | ⚠⚠ Données |
| 4.2 | Exporte un codex complet, avec des travaux | | |
| 4.3 | Réimporte-le | « Import **réussi** », **aucune** mention de fichiers manquants *(mesure : le message exact)* | ⚠⚠ Données |
| 4.4 | Si ton corpus contient des fichiers déjà exportés hors de l'application (statut « exporté ») : refais 4.3 | Ils ne sont **pas** comptés manquants et leur statut n'est **pas** écrasé. C'est le point que le diff de l'audit avait oublié. | ⚠⚠ Données |

---

## §2 · Interface

Aucune porte. Le seul changement purement visuel du cycle — le bouton « jeton »
masqué au-delà du maximum — est écarté au tri (voir le tableau en tête) et sera
automatisé.

---

## §3 · Décisions — ce qui attend ton verdict

**Ce ne sont pas des vérifications.** Ce sont trois choix posés faute de pouvoir
les trancher à ta place. Chacun attend une phrase écrite, pas une case cochée.

| # | Décision | Ce qui est en jeu |
|---|---|---|
| D1 | **Le chemin « ouvrir » d'un codex reste fail-open.** La FUSION a été passée fail-closed le 30 août (#614) : un blob sans magic bytes valides est refusé. Le chemin « ouvrir » ne l'a pas été. | Cohérence : deux portes d'entrée, deux réponses à la même question. Fermer la seconde peut refuser l'ouverture d'un vieux codex légitime. |
| D2 | ~~Go pour la release groupée et le push ?~~ **TRANCHÉ ET FAIT, 30 août 19 h 47.** Tu as donné le go ; la release groupée **1.106.12** est lancée et les douze commits sont poussés (`3208ab0e..540531e3`). Elle emporte S4, S5, S7, S8 et T6.6. ⮕ **Il te reste une seule chose à faire de ce côté : recharger ta session `file://`** — 25+ jetons anti-cache ont changé. | Sans objet désormais. |
| D3 | **Supprimer `_sauvegarde-20260830-1905/` et `ETAT-AVANT-REDEMARRAGE-2026-08-30.md` ?** Leur condition de suppression est remplie — le travail qu'ils protégeaient est commité. | Rien à perdre, mais une suppression se demande. |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Tout ce qui touche l'iPad et Safari.** Aucune session ne peut les éprouver.
  Les portes P2 et P3.6 existent uniquement pour ça.
- **S2 et S8 ne sont pas dans cette liste**, et c'est délibéré — motifs au tri en
  tête. Si l'un des deux te paraît devoir y être, dis-le : le tri est un jugement,
  pas une mesure.
- **Le trou d'affichage de S2 reste ouvert** tant que la spec Playwright n'est pas
  écrite. Ce n'est pas « vérifié », c'est « jugé sans conséquence ».
- **Aucune des quatre portes n'a été jouée sur ton corpus réel.** Les chiffres du
  cycle (Vitest 410 fichiers / 4307 tests, Playwright 210/210, code de sortie 0)
  portent sur le banc et sur un `index.html` de test, jamais sur tes données.
- **Une erreur de ma session, rattrapée par une autre.** J'ai dit aux deux
  sessions que `git status`, `git log` et `git diff` perturbaient la suite
  Playwright. C'est faux : ces trois-là ne modifient pas l'arbre de travail. La
  règle du dépôt (#523) vise ce qui ÉCRIT pendant que les specs lisent.
  `kuekatsheu-00` l'a relevé plutôt que d'obéir en silence.
- **Le placeholder `COMMIT_S5` a existé une heure, et il est réglé.** Écrit par la
  session S5 dans le tableau d'état — même défaut que le `COMMIT_S4` rattrapé plus
  tôt dans la soirée. Elle l'a retiré AVANT son commit et inscrit le hachage réel
  ensuite (`349b780d`, puis `20c67e2f`) : il n'a jamais existé dans l'historique.
  Rien à faire ; noté parce que c'est le deuxième du même genre en une journée.

---

## Au retour du terrain

1. Trier les échecs : **défaut réel, ou état intermédiaire de l'arbre ?** Sur les
   quatre échecs des 81 portes du 10 août, deux étaient des faux rouges de ce type.
2. Verser chaque échec réel au BACKLOG avec son numéro de porte.
3. Mettre à jour ce fichier : état, date, ce qui reste.
4. Ne jamais laisser une porte « probablement passée ».

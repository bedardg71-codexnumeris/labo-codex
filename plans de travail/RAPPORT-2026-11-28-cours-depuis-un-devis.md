# Rapport – créer un cours à partir d'un devis rangé

> Dernier relais : 28 novembre 2026, 10 h 40 (Toronto), session du nuage.
> Branche : `claude/devis-ministeriel-8vylul`, la même que le lot « numériser un devis » (rapport voisin : `RAPPORT-2026-11-28-devis-ministeriel.md`). Base : `main` à `574bb60`, la 1.260.0. PR #67, en brouillon, qui porte maintenant les deux lots.
> Sans bump ni changelog : les deux lots partent en ligne ensemble, au feu vert de Grégoire.
> Fait : les six gestes dans Cadre › « Cours et services », le champ `devisCode`, le lien de la fiche vers son devis, les bancs, les mots de travail (TEXTES, numéros 51 à 70).
> Reste : la relecture des mots 51 à 70 ; le verdict WebKit (aucun WebKit dans le conteneur) ; trois questions plus bas.

## Ce qui est livré

Dans la fiche d'un cours EN CRÉATION, sous le code et le nom, une liste « Devis ministériel » offre les devis rangés et « Aucun ». Un devis choisi fait paraître « Ce que le devis propose » : le numéro, l'énoncé, les pondérations, les heures quand le devis en donne un nombre net, les éléments, et les repères du devis.

| Fichier | Rôle |
|---|---|
| `js/cours-devis.js` (neuf) | ce qu'un devis propose, l'état des réponses, l'écran. Il ne fait que lire la réserve et poser des valeurs dans le formulaire |
| `js/trimestre-v2-cours.js` | quatre accroches : la création prépare la liste ; une fiche existante montre le lien ; la nature « service » cache le bloc ; la création joint `devisCode` à ce qu'elle lit |
| `js/entites/cours-entite.js` | `devisCode` : posé à la création s'il est donné, inscrit à `champsModifiables` |
| `js/materiel-devis.js` | `reserveCourante` (la réserve lue sans attendre, celle de la démo quand on y est) et `rouvrirParCode` (le lien de la fiche) |
| `index.html`, `styles.css`, `docs/DATA-OWNERSHIP.md` | le bloc dans la fiche, ses styles, la ligne de `cours` |

L'écrivain du cours reste `sauvegarderCoursV2`, qui lit le formulaire comme avant. Les vérifications de la fiche (code, discipline, pondération requis) ne changent pas.

## Les règles, et comment l'écran les tient

**Rien n'est accepté d'office.** Choisir un devis ne pose rien dans les champs (mesuré : les six champs sont vides). « Confirmer » est le seul geste qui pose une valeur du devis dans un champ.

**Une proposition sans réponse ne s'écrit pas, et l'écran le fait voir de trois façons :**
- chaque proposition porte son état à côté de sa valeur : « À confirmer » (en italique, couleur d'attention), « Confirmé », ou « Autre : à écrire dans le champ » ;
- sous les propositions, une ligne compte ce qui reste : « 3 propositions sont restées sans réponse : elles ne seront pas écrites dans le cours. » ;
- les champs de la fiche restent visibles sous les propositions : ce qui s'écrira est ce qu'on y lit.

« Créer le cours » n'est pas bloqué par une proposition sans réponse : elle ne s'écrit pas, c'est tout.

**« Autre » n'écrit rien.** Il laisse le champ tel qu'il est et y porte le curseur. Sur un champ vide, il reste vide, à taper. Sur une valeur déjà confirmée, elle reste, à reformuler. Vérifié au navigateur dans les deux cas, et l'essai rougit si « Autre » vide le champ.

**Les éléments.** Chaque élément du devis a trois gestes : « Garder », « Reformuler » (un champ s'ouvre, prérempli de son texte), « Retirer ». « Ajouter un élément » ouvre un champ vide. Le champ « Éléments de compétence » de la fiche reçoit les gardés et les reformulés dans l'ordre du devis, puis les ajoutés, un par ligne, sans numéro ni puce. Les retirés et les sans-réponse ne s'écrivent pas.

**La pondération.** 4EF0 en porte deux : deux rangées, chacune avec son « Confirmer », plus « Autre ». La pondération confirmée déclenche, comme une pondération tapée, la proposition d'heures de la fiche (« 1-3-3 » donne 60).

**Les heures.** Proposées seulement quand le texte du devis est un nombre seul (000Z : « 45 »). Sinon, le texte du devis paraît dans les repères et le champ reste à taper.

**La discipline.** Jamais proposée, jamais rapprochée. Le texte du devis paraît dans « Repères du devis », avec « Choisis la discipline dans le menu ». Pas de « Autre ».

**Les critères de performance et le contexte de réalisation** ne paraissent pas dans la fiche et ne sont pas copiés (un essai le vérifie sur le cours écrit).

**Le lien.** La fiche d'un cours qui retient un devis dit « Ce cours a été créé à partir du devis 4EF0. » et offre « Voir le devis 4EF0 dans « Apporter mon matériel » », qui l'ouvre sur sa feuille, avec ses critères. Si le devis n'est plus rangé, la fiche le dit, sans lien.

## Le champ `devisCode`

- Un texte : le code du devis. Jamais une copie du devis.
- Posé à la création seulement, quand le cours a réellement puisé dans le devis (voir « Ce que j'ai tranché », 2).
- Une fiche existante ne lit pas ce champ dans le formulaire : il reste `undefined` dans ce que l'écrivain reçoit, et `CoursEntite.mettreAJour` ne touche pas un champ `undefined`. L'enregistrement champ par champ ne peut donc ni l'effacer ni le changer. L'essai rougit si cette garde saute.
- Un cours dont le devis a été remplacé ou n'existe plus s'ouvre et s'enregistre sans rien perdre (essai : la réserve vidée, la fiche rouverte et modifiée, le code toujours là).

### Ce qui arrive à ce champ quand le cours voyage (source ou stock)

| Chemin | Ce qui arrive | Preuve |
|---|---|---|
| Codex (sauvegarde complète) | `cours` part entier, le champ avec ; le devis part aussi, dans `devisMinisteriels` | lu dans le code, non exécuté |
| Archive d'un groupe-cours | `cours` y est copié entier, le champ avec ; la réserve de devis n'y est PAS (décision de Grégoire). À la réouverture ailleurs, le champ peut donc désigner un devis absent : la fiche le dit et continue de s'enregistrer | lu (relevé délégué), le cas « devis absent » est éprouvé |
| Import par cases | la collection `cours` n'y passe pas (seule l'ancienne `listeCours`) ; le champ ne voyage donc pas par ce chemin. Les devis, eux, y passent depuis le second amendement | lu (relevé délégué) |
| Reprise d'un trimestre | un cours repris n'est pas dupliqué, c'est la même fiche : le champ reste | lu : commentaire du banc `cours-refonte-rendu.spec.js`, non réexécuté pour ce champ |
| « Dupliquer » un cours | la copie ne retient aucun devis | par construction (`codeRetenu` rend vide hors d'un choix confirmé), non éprouvé par un essai dédié |

- **Source** : rien n'est tari, c'est un ajout.
- **Stock** : aucun cours existant n'est touché. Le champ n'existe que sur un cours créé en puisant dans un devis. Une version antérieure de l'application qui reçoit un tel cours ignore le champ ; si elle modifie la fiche, le champ survit (`mettreAJour` ne réécrit que ses champs nommés).

## Ce que j'ai tranché

1. **Un fichier neuf**, `js/cours-devis.js`, plutôt que d'alourdir `trimestre-v2-cours.js` : quatre accroches d'une ligne, sans branche neuve (la garde de complexité).
2. **Quand le cours « vient » d'un devis.** `devisCode` n'est posé que si au moins une proposition a été confirmée ou un élément gardé ou reformulé. Un devis choisi dont tout est resté sans réponse, ou tout en « Autre » et « Retirer », ne laisse aucun code. Un cours qui ne porte rien du devis n'en vient pas.
3. **Où vont les valeurs confirmées** : dans les champs existants de la fiche, visibles sous les propositions. Pas de second jeu de champs.
4. **Changer de devis en cours de route** retire des champs ce que les confirmations du devis précédent y avaient posé, et garde ce qui a été tapé.
5. **Une saisie dans le champ « Éléments de compétence » n'est jamais remplacée** par les gestes : l'application ne réécrit ce champ que s'il est vide ou porte encore ce qu'elle y a elle-même écrit.
6. **Les éléments s'écrivent nus**, sans numéro ni puce (« un par ligne », selon ton relais).
7. **Une fiche existante ne propose rien** : ni liste, ni propositions, seulement le lien. Une copie par « Dupliquer » non plus.
8. **Un service** n'a pas de devis : le bloc se cache avec les autres champs ministériels.
9. **La réserve est lue à l'ouverture du formulaire**, par `materielDevis.reserveCourante` : en démonstration, c'est la réserve de la démo (essai : la liste montre le devis de la démo, pas le réel).
10. **Le lien ferme un étiquetage en brouillon sans le perdre**, comme le bouton de l'en-tête de l'étiquetage.

## Ce que j'ai supposé

- **« Périodes d'enseignement : 45 » vaut 45 heures** dans le champ « Heures d'enseignement » : ton relais le donne en exemple de nombre sans ambiguïté. L'application ne convertit rien.
- **La liste montre « code – énoncé »**, dans l'ordre où les devis ont été rangés.
- **Le formulaire s'ouvre sur « Aucun »** : c'est le formulaire d'aujourd'hui tant qu'on ne choisit rien.

## Ce que demanderait le mode modification (hors du lot)

Rattacher un devis à un cours déjà créé demanderait :
1. **Une règle pour les champs déjà remplis** : chaque proposition devrait montrer la valeur de la fiche et celle du devis, et ne remplacer qu'à la confirmation. C'est la comparaison « ancien et nouveau » du premier lot, champ par champ.
2. **Une écriture différente** : une fiche existante s'enregistre à chaque changement de champ. Une confirmation écrirait donc tout de suite en base, sans « Créer le cours » pour la retenir. Il faudrait décider si c'est voulu, ou regrouper les confirmations derrière un bouton.
3. **Les éléments** : la fiche les porte en texte libre. Il faudrait rapprocher ses lignes de celles du devis, ou accepter de remplacer le champ entier après comparaison.
4. **Poser ou changer `devisCode`** sur une fiche existante : aujourd'hui la garde l'interdit, exprès.
5. **Des cours actifs** : un cours en modification peut déjà porter des groupes et des évaluations. Changer sa pondération ou ses heures touche la conformité affichée.

## Ce que je n'ai pas pu vérifier

- **WebKit, Safari, l'iPad** : les cinq essais Playwright du lot sont verts sous Chromium seulement. La mise en page du bloc sur l'iPad debout n'est pas jugée.
- **Le codex, l'archive d'un groupe-cours, la reprise d'un trimestre** : lus, non exécutés pour ce champ.
- **La vue simple** : je n'y ai pas touché ; je n'ai pas vérifié à l'écran qu'elle ne montre rien de neuf. Elle crée ses cours par un autre chemin que `nouveauCoursV2`, d'après ton relais.

## Trouvailles, et leur issue

1. **Deux essais existants rouges sous Chromium**, `cours-actif-hors-bibliotheque-916` et `groupe-nomme-son-cours-872b` : rouges aussi sans le lot (mesuré en retirant mes changements). Issue : **commenter et oublier**, non jugés ici.
2. **Un cours qui devient un service garde son `devisCode`** : l'écrivain vide ses champs ministériels mais ne connaît pas ce champ. Sans effet visible aujourd'hui (le bloc est caché pour un service). Issue : **inscrire et continuer** ; question 3 plus bas.

## Mesures

- Vitest : `tests/unit/cours-devis.test.js`, 11 essais. Suite complète verte : 987 fichiers, 12 733 essais.
- Playwright (Chromium) : `tests/integration/cours-depuis-un-devis.spec.js`, 5 essais verts. Deux essais cassés puis rétablis (« Autre » qui vide le champ ; la garde de `devisCode` sur une fiche existante).
- Bancs voisins sous Chromium : les parcours qui créent un cours (`parcours-5`, `je-regarde-cours`, `deux-temps-modelisation`) et `cours-refonte-rendu` restent verts.
- **Le devis rangé identique avant et après** : la réserve est comparée octet pour octet dans les essais 1 et 2, et sur l'aperçu.

## Le parcours joué à l'écran, sur l'aperçu Netlify

Voir la section « Captures » en fin de fichier.

## Ce qui remonte à Grégoire

1. **Les mots 51 à 70** du fichier TEXTES.
2. **Les éléments dans la fiche** : écrits nus, un par ligne. L'exemple du champ montre des puces (« • Reconnaître… »). Veux-tu des puces ?
3. **Un cours qui devient un service** : doit-il oublier le devis dont il venait ?

## Gestes d'essai pour Grégoire : les deux lots à la suite

Sur l'aperçu : rien de ceci n'est en ligne. Rien ne s'écrit avant « Ranger ce devis », puis avant « Créer le cours ».

1. **Numérise ton devis.** Dans Aperçu sur le Mac, ouvre le PDF du devis de ton cours, sélectionne tout le devis de la compétence, copie. Dans Labo Codex : Conception › Mon matériel › « Numériser un devis », colle, « Lire mon devis ». Corrige ce qui est mal rangé, puis « Ranger ce devis ».
2. **Commence ton cours.** Cadre › « Cours et services » › « + Nouveau cours ». Tape le code et le nom de ton cours.
3. **Choisis ton devis** dans la liste « Devis ministériel ». Regarde les champs du bas : ils doivent être vides.
4. **Confirme le numéro**, puis touche **« Autre » sur la compétence** et écris ton propre énoncé dans le champ.
5. **La pondération** : si ton devis en porte deux, confirme celle de ton cours. Les heures doivent se proposer d'elles-mêmes.
6. **La discipline** : lis le repère du devis, puis choisis dans le menu.
7. **Les éléments** : garde-en un, reformules-en un, retires-en un, ajoutes-en un. Laisse les autres sans réponse et lis la ligne du bas.
8. **« Créer le cours »**, puis rouvre sa fiche : les éléments laissés sans réponse ne doivent pas y être ; le lien « Voir le devis… » doit ouvrir ton devis, intact, avec ses critères de performance.
9. **Refais un cours avec « Aucun »** : le formulaire doit être celui que tu connais.

Dis ce qui te surprend, surtout la place du bloc dans la fiche et la longueur de la liste des éléments sur l'iPad.

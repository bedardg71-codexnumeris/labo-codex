# 2. Principes et politique

> **Statut : BROUILLON du 12 octobre 2026**, rédigé par Claude Code à partir des ADR, de
> `CLAUDE.md`, de `PROTOCOLE.md`, des skills du projet, de `PRIVACY.md` et `LICENSE.md`, et du
> code (version 1.199.0). **À corriger par Grégoire Bédard.** Les passages marqués
> **[À valider]** ou **[À décider]** attendent sa réponse.
>
> **Pour qui** : tous les lecteurs du guide. C'est le document à lire avant de changer quoi que
> ce soit : il dit ce que le projet tient pour non négociable, et pourquoi.
>
> **Comment le lire** : chaque principe donne son énoncé, son **pourquoi**, et son **état réel**
> quand le code ou les textes publiés ne le tiennent pas entièrement. Un principe déclaré mais
> mal tenu reste un principe : l'écart dit où le travail reste à faire, pas que la règle est
> caduque.

---

## 2.1 Les données des gens

### P1. Les données restent chez l'utilisateur

**Énoncé.** Aucun serveur d'application, aucune base centrale, aucune télémétrie. Tout vit dans
le navigateur de l'enseignant et dans les fichiers qu'il enregistre lui-même. Le réseau ne sert
qu'à charger l'application. (ADR-002, ADR-003)

**Pourquoi.** Les données d'élèves sont sensibles : tout transit élargit le risque. Un serveur
serait aussi intenable pour un mainteneur seul. Et l'iPad, usage principal, doit pouvoir
travailler sans réseau.

**Conséquences à connaître :**
- personne ne sait combien de gens utilisent l'application ni comment : c'est voulu ;
- les données d'un utilisateur sont liées au navigateur **et à l'adresse** d'où il ouvre
  l'application. La sauvegarde, et le passage d'un appareil à l'autre, reposent sur le fichier
  Codex (document 1, §1.6) ;
- le seul canal de retour est le formulaire de rapport, qui prépare un courriel que
  l'utilisateur envoie lui-même.

**État réel.** Tenu dans le code : il n'appelle que sa propre origine. Un outil de mesure de
Netlify était injecté dans les pages jusqu'au 21 septembre 2026 ; il a été retiré.

### P2. On n'écrit pas dans les données des gens sans eux

**Énoncé.** Tout l'état de l'application vit chez l'utilisateur. **Un correctif tarit la
source ; il ne répare pas le stock déjà écrit chez les gens.** À chaque correctif, il faut dire
s'il touche la source, le stock, ou les deux. Réparer le stock d'office est exclu : écrire dans
les données de quelqu'un est une décision du responsable du projet, pas du développeur.
(`CLAUDE.md`, « Tarir n'est pas réparer », 1er sept. 2026)

**Pourquoi.** Les tests partent toujours d'un espace vide : ils ne voient jamais ce qui est déjà
écrit chez un utilisateur. Le 1er septembre 2026, trois correctifs « réussis » ont laissé intactes
des données fausses chez les utilisateurs, et on ne l'a découvert qu'après.

**Corollaire, la compatibilité.** Depuis l'arrivée d'autres utilisateurs (septembre 2026), ce
qui **voyage** doit rester lisible d'une version à l'autre : grilles partagées, fichiers
importés et exportés, codex. Avant cela, seules les données de l'auteur comptaient.

**Décision définitive de l'auteur** : les notes des trimestres A2025 et H2026, déjà remises, ne
sont pas rouvertes ni recalculées.

### P3. Chaque donnée a une seule source

**Énoncé.** Chaque donnée a un propriétaire : le module qui l'écrit, ou la fonction de calcul
qui la produit. Les autres la lisent, ils ne la recalculent pas et ne l'écrivent pas. Le registre
des propriétaires est `docs/DATA-OWNERSHIP.md`. (ADR-004)

**Pourquoi.** Deux écrivains pour une même donnée produisent tôt ou tard deux vérités. C'est la
cause de plusieurs des bogues les plus coûteux du projet : une note différente selon l'écran.

**État réel : à lire avec nuance.** Les textes du projet ajoutent que « les modules ne se parlent
jamais directement ». **Ce n'est pas vrai du code** : les modules s'appellent constamment par des
fonctions globales, protégées par des tests d'existence. Ce qui est tenu, imparfaitement, c'est
la règle sur les **données** : selon la mesure du 12 octobre 2026 (`ETAT-PROJET.md` §00), une
partie des clés a encore plusieurs écrivains. Le développeur doit retenir la règle sur les
données, et savoir que la règle sur les appels n'est pas respectée.

### P4. Les données sont rangées par trimestre

**Énoncé.** Les données d'un trimestre sont préfixées par son identifiant (`a2025_…`,
`h2026_…`), par la fonction `cle()`. Certaines données sont communes à tous les trimestres (la
liste des trimestres, les cours, les enseignants, les préférences). Le document 8 donnera le
registre exact.

**Pourquoi.** Avant ce rangement (décembre 2025), changer de trimestre écrasait les données du
précédent.

### P5. Aucune donnée d'élève réelle hors de l'application

**Énoncé.** Aucun nom, aucun DA, aucune copie d'élève réel dans le code, les tests, la
documentation, les exemples, ni dans une conversation avec un outil d'IA. Seulement des données
fictives. (`CLAUDE.md`, règle 6, 22 sept. 2026 ; ADR-010)

**Pourquoi.** Le dépôt et les outils de développement sortent de la machine de l'enseignant ;
les données des élèves, jamais.

**État réel.** Des noms et un DA réels ont été trouvés dans le dépôt le 22 septembre 2026 et
remplacés dans les fichiers actuels. **Ils restent dans l'historique git.** Une purge est
préparée (fiche #781) et attend la décision de l'auteur. **Elle doit précéder tout accès d'une
personne extérieure au dépôt.**

---

## 2.2 La pédagogie

### P6. L'application accueille plusieurs façons d'évaluer

**Énoncé.** Labo Codex ne prescrit pas une pédagogie. Elle accueille quatre familles de
pratiques de notation, **sans hiérarchie entre elles** : sommative traditionnelle (SOM), et trois
variantes de la notation par standards regroupées sous le nom PAN : standards (STD),
spécifications (SPE) et dénotation (DEN). Chaque enseignant configure la sienne. Le modèle de
l'auteur (ELLAC, critères SRPNF, cours de littérature) est **un exemple documenté**, pas la norme.

**Neutralité disciplinaire.** Une rétroaction ne parle que de la discipline de celui qui l'écrit.
Aucun enseignant ne doit lire dans son interface le vocabulaire d'une discipline qui n'est pas la
sienne, ni un élève recevoir un PDF où son critère est rebaptisé. (`OBJECTIF-COHORTE-1.md`,
énoncé 4)

**Pourquoi.** L'application sert des enseignants de chimie, de philosophie, d'histoire, de
biologie et des orthopédagogues, pas seulement l'auteur. Une pondération ou un critère imposé est
une position pédagogique : ce n'est pas au logiciel de la prendre.

**C'est la position du répondant pédagogique** (décision de l'auteur, 12 oct. 2026) : il défend
cette pluralité, pas un modèle particulier.

**[À valider] Une question ouverte, que seul l'auteur peut trancher.** Une partie du socle
présenté comme commun est elle-même un choix de l'auteur :
- la taxonomie **SOLO** et l'échelle **IDME** (quatre niveaux), décrite comme « l'unité de mesure
  de référence » (ADR-005) ;
- le modèle **RàI** pour le dépistage ;
- les indices **A-C-P** et la règle des **trois dernières productions** pour la performance
  (ADR-006), « même règle partout » ;
- la pratique par défaut, `standards`, dans le code.

Ces éléments sont-ils le socle **assumé** de l'application, que tout utilisateur accepte en la
choisissant ? Ou des choix de l'auteur qui devraient devenir configurables comme les pratiques ?
La réponse décide de ce qu'un répondant pédagogique peut changer, et de ce qu'il doit défendre.

### P7. Un vocabulaire qui décrit, ne prédit pas, ne pathologise pas

**Énoncé.** L'application décrit ce qu'elle observe (« difficulté émergente », « niveau
d'attention ») ; elle ne prédit pas l'échec et ne pose pas d'étiquette. Le principe s'applique à
l'interface, aux noms dans le code et à la documentation. (ADR-007)

**Pourquoi.** Une étiquette agit sur celui qui la reçoit et sur celui qui la lit (effet
Pygmalion). L'application est un outil de recherche-action, pas de classement.

**État réel.** L'interface est nettoyée, mais l'Aide intégrée et le README emploient encore
« risque d'échec », « échec probable », « blocage critique ». Leur correction relève de l'auteur :
ce sont des textes lus par les utilisateurs.

---

## 2.3 La technique

### P8. Une pile technique qu'une personne seule peut tenir dix ans

**Énoncé.** HTML, CSS et JavaScript, sans framework, sans étape de construction, sans dépendance
téléchargée à l'exécution. Les quelques bibliothèques nécessaires (graphiques, PDF, fichiers ZIP,
photos HEIC) sont copiées dans `libs/`. (ADR-001)

**Pourquoi.** Le projet a été conçu pour un mainteneur seul, qui n'est pas développeur de
métier : ce qui n'a pas de chaîne de construction ne casse pas quand elle vieillit.

**À savoir pour un repreneur.** L'ADR-001 prévoit lui-même d'être **réexaminé si un mainteneur
professionnel arrive**. Un repreneur peut donc légitimement rouvrir cette décision. Ce qu'il ne
peut pas rouvrir sans l'accord du responsable, ce sont les contraintes qu'elle sert : le hors
ligne, l'ouverture depuis un fichier local, et l'iPad (P9).

**État réel.** Plusieurs textes disent « aucune dépendance sauf Chart.js » : `libs/` en contient
davantage, et son inventaire (`libs/VERSIONS.md`) en oublie une.

### P9. Hors ligne, depuis un fichier local, sur iPad

**Énoncé.** L'application doit fonctionner sans réseau, ouverte depuis un serveur ou depuis un
fichier local (`file://`), sous Safari sur Mac **et sur iPad**. (ADR-003)

**Conséquences dans le code.** Aucun module JavaScript moderne (`import`) : des scripts chargés
dans un ordre précis par `index.html`. Des numéros de version accolés aux fichiers pour déjouer
le cache de Safari. Un stockage local plafonné, d'où le partage entre stockage simple et base
locale (ADR-002). Le document 8 détaillera.

### P10. La sécurité est non négociable

**Énoncé.** Six règles, issues de l'audit de sécurité du 26 mars 2026 (`CLAUDE.md`) :
1. toute donnée d'utilisateur insérée dans la page passe par `echapperHtml()` ;
2. aucun gestionnaire d'événement écrit dans le HTML (`onclick=`…) : un attribut `data-action`
   et un aiguilleur central ;
3. tout fichier ZIP importé passe par `validerZipSecurite()`, toute image ou PDF par
   `validerMagicBytes()` ;
4. aucun `console.log` dans le code livré ;
5. toute défense livrée vient avec au moins un test ;
6. aucune donnée d'élève réelle (P5).

S'y ajoute une politique de sécurité du contenu stricte (CSP) : aucun script qui ne vienne de
l'application elle-même, aucun `eval()`.

**Pourquoi.** L'application manipule des fichiers reçus d'élèves et de collègues : c'est sa
surface d'attaque principale.

**État réel.** Les règles 1, 2 et 3 sont tenues et surveillées par des tests. La règle 4 ne l'est
pas entièrement. La CSP admet une exception documentée pour les styles. Aucun en-tête de sécurité
HTTP n'est posé par l'hébergement, contrairement à ce qu'affirme `SECURITY.md`.

### P11. Ce qu'on remplace, on le retire

**Énoncé.** Un chantier n'est pas fini tant que l'ancien système n'est pas retiré : pas d'alias
« au cas où », pas de code mort « pour plus tard ». Avant de changer un défaut ou une signature,
on vérifie tous les appelants. (`CLAUDE.md`, « zéro dette », 21 avril 2026)

**Révision du 1er septembre 2026.** Avec de vrais utilisateurs, élargir la portée d'un chantier
n'est plus gratuit : on refactorise à l'intérieur d'un lot, pas au passage.

**Pourquoi.** Dans un projet de cette taille, mené seul, ce qu'on empile à côté devient
invisible, puis se réveille.

**État réel.** Imparfaitement tenu : du code ancien cohabite encore avec son remplaçant, et des
fonctions publiques ne sont plus appelées (mesure au §00 d'`ETAT-PROJET.md`).

### P12. Des noms qu'on ne change pas

**Énoncé.** `js/config.js`, `js/navigation.js` et le registre `noms_stables.json` ne se modifient
qu'avec l'accord du responsable.

**Pourquoi.** Les modules s'appellent par leurs noms (P3, état réel) : renommer une fonction ou
une constante de ces fichiers casse la navigation, l'affichage des productions ou les grilles,
sans erreur visible au chargement.

### P13. Un test ne vaut que s'il peut échouer

**Énoncé.** On ne croit pas un test vert qu'on n'a pas vu échouer : avant de s'y fier, on casse
volontairement le code qu'il protège et on vérifie qu'il rougit. Une affirmation (« c'est
réparé », « les tests passent ») n'est pas une preuve. Ce qu'aucune machine ne peut éprouver
(Safari, iPad, données réelles) passe par une liste de vérifications manuelles. (skills
`verification-adverse` et `portes-terrain`)

**Pourquoi.** Le projet a appris à ses dépens qu'un test peut passer sans rien vérifier, et
qu'une absence de signal n'est pas un signal d'absence : « non mesuré » n'est pas « vert ».

---

## 2.4 La politique

### Licences

- **Le code** est sous **AGPL v3** : libre, et quiconque héberge une version modifiée doit en
  offrir le code source à ses utilisateurs.
- **Le contenu pédagogique** (grilles, cartouches, guides) est sous **CC BY-NC-SA 4.0** :
  partage permis, usage commercial interdit, mêmes conditions pour les dérivés.
- **Pourquoi** : faire de Labo Codex un commun éducatif, que personne ne peut s'approprier
  commercialement, y compris en le revendant comme service en ligne. (ADR-009)

**Questions à soumettre à un juriste** (hors de la compétence de ce guide) :
- à qui appartient le code : l'auteur, ou son employeur ;
- le dépôt est privé depuis le 23 juin 2026 : quelles obligations l'AGPL crée-t-elle envers les
  utilisateurs de la version en ligne ;
- `LICENSE.md` exige une autorisation écrite pour l'usage commercial, ce qui semble contredire
  l'AGPL, qui interdit d'ajouter des restrictions ;
- une maintenance rémunérée par un tiers est-elle compatible avec la clause « non commerciale »
  du contenu.

### Confidentialité

- **Régime retenu** (`PRIVACY.md`) : projet personnel, sans exploitation d'entreprise ; la loi
  sur le secteur privé modifiée par la Loi 25 ne s'appliquerait **vraisemblablement** pas, ce
  qui reste à confirmer par un juriste. L'esprit de la Loi 25 est suivi volontairement.
- **Ce régime est à reprendre** si le projet est porté par une organisation. **Un hébergement par
  le cégep est exactement ce cas.**
- **En attente** : l'avis du responsable de la protection des renseignements personnels du cégep,
  et une évaluation des facteurs relatifs à la vie privée (ÉFVP).
- **Accès en ligne** : depuis le 1er septembre 2026, l'application en ligne est derrière une
  porte qui demande une adresse courriel (Cloudflare Access), ouverte à tous. Le motif est de
  savoir qui l'utilise et de pouvoir joindre ces personnes, pas de filtrer l'entrée. Les adresses
  sont conservées et exportées périodiquement ; aucun fichier d'élève ne passe par cette porte.
  (ADR-008)

### Gouvernance aujourd'hui

- **Un seul mainteneur humain**, l'auteur. Aucun co-mainteneur. (`DEPLOY.md` §6.4, `AUDIT.md`)
- **Le développement se fait avec des assistants d'IA** (ADR-010) : Claude Code écrit et teste le
  code, Cowork relit et prépare les consignes, **l'auteur décide** et est le seul canal entre les
  deux. (`PROTOCOLE.md`)
- **Ce que l'auteur se réserve** (`CLAUDE.md`) ; tout le reste, l'assistant le décide et le dit :
  1. la pédagogie : ce qu'une note veut dire, ce qu'un critère mesure ;
  2. les données réelles des utilisateurs : tout geste irréversible, y compris renommer ;
  3. les mots que les élèves liront : rétroactions, et le nom d'une grille, qui s'imprime sur leur
     PDF ;
  4. ce qui engage publiquement le projet : version majeure, partage, communication.

### Gouvernance après l'auteur [À décider]

Les quatre catégories ci-dessus doivent trouver un titulaire. Proposition, à valider :

| Catégorie | Titulaire proposé |
|---|---|
| 1. La pédagogie | le répondant pédagogique |
| 2. Les données réelles des utilisateurs | **à décider** : le répondant pédagogique, le cégep, ou les deux |
| 3. Les mots que les élèves liront | le répondant pédagogique |
| 4. Ce qui engage publiquement le projet | le cégep |

Le développeur, lui, décide de tout le reste et le dit.

---

## 2.5 Ce qui a été décidé depuis mai sans ADR

La règle des ADR (`docs/adr/README.md`) veut que toute décision structurante en produise un. Un
seul a été écrit depuis le 14 mai 2026. Les décisions ci-dessous, qui engagent un repreneur,
devront devenir des ADR (document 6). Les décisions sur la façon de travailler avec les
assistants iront au document 14.

| Date | Décision | Motif |
|---|---|---|
| 24 mai 2026 | Grilles, échelles et pratiques sont rangées par trimestre | Les données de démonstration polluaient les modèles communs |
| 31 mai 2026 | Numérotation des versions en SemVer, écrite par `scripts/release.mjs` en un seul geste | Quatre copies du numéro tenues à la main divergeaient |
| 23 juin 2026 | Le dépôt GitHub devient privé | **Aucun motif écrit trouvé** [À valider] |
| 1er sept. 2026 | Les adresses secondaires de Netlify redirigent vers `app.codexnumeris.org` | Elles servaient l'application sans passer par la porte d'accès |
| 8 sept. 2026 | Une seule adresse porte les données réelles de l'auteur | Deux instances de l'application avaient fait chercher un faux bogue |
| 21 sept. 2026 | Retrait des outils de mesure de Netlify | Un script qui tente d'envoyer des données n'a pas sa place (P1) |
| 21 sept. 2026 | Sans pratique de notation assignée, aucune note n'est calculée | Plusieurs replis contraires donnaient des notes différentes selon l'écran |
| 30 sept. 2026 | Un seul terme pour la sauvegarde : le codex ; supprimer un trimestre exige un codex à jour | Deux mots pour deux fichiers semaient la confusion |
| 10 oct. 2026 | Les tests au navigateur (Playwright) ne tournent plus sur GitHub qu'à la demande ; le verdict qui fait foi se prend sur le Mac de l'auteur | Les passages sur GitHub dépassaient leur durée maximale |

**Conséquence de la dernière décision pour un repreneur** : la vérification au navigateur dépend
aujourd'hui d'une machine précise. Le document 7 devra dire comment la reprendre ailleurs.

---

## 2.6 Écarts entre ce qui est publié et la réalité [À décider]

Des textes publics ou destinés aux utilisateurs affirment des choses que le code ou les faits
démentent. Leur correction **relève de l'auteur** (catégorie 4). Un repreneur doit les connaître,
pour ne pas les prendre pour vrais :

| Texte | Il affirme | La réalité |
|---|---|---|
| `PRIVACY.md`, `README.md`, `INFO-ELEVES.md` | Le codex data est anonymisé | L'anonymisation n'est pas écrite : il porte des noms |
| `INFO-ELEVES.md` | Les outils d'IA ne voient que du code et des données fictives | Des noms réels ont été trouvés dans le dépôt ; ils restent dans l'historique (P5) |
| `PRIVACY.md`, `SECURITY.md`, `AUDIT.md` | Le dépôt est public | Il est privé depuis le 23 juin 2026 |
| `SECURITY.md` | Des en-têtes de sécurité sont posés par l'hébergement | Seuls des en-têtes de cache le sont |
| `PRIVACY.md`, `INFO-ELEVES.md` | Le code est sous CC BY-NC-SA | Le code est sous AGPL v3 ; c'est le contenu qui est sous CC BY-NC-SA |
| `LICENSE.md` | Titre « CC BY-SA 4.0 » pour le contenu | Le texte, lui, dit NC-SA |
| `INCIDENTS.md` | Aucun incident | Sa propre définition range parmi les incidents la présence de données identifiantes dans le dépôt (P5) |

**[À valider]** Faut-il garder ce tableau dans le guide une fois les textes corrigés ? Proposition :
non. Il disparaît ligne par ligne, à mesure que chaque texte est corrigé.

---

**Sources principales** : `docs/adr/001` à `013`, `CLAUDE.md`, `PROTOCOLE.md`,
`OBJECTIF-COHORTE-1.md`, skills `pratiques-notation`, `ecosysteme-classe`, `labo-codex`,
`depistage-rai`, `securite-donnees`, `verification-adverse`, `portes-terrain` ; `PRIVACY.md`,
`SECURITY.md`, `INFO-ELEVES.md`, `INCIDENTS.md`, `LICENSE.md`, `DEPLOY.md`, `ETAT-PROJET.md` §00 ;
`js/codex-data.js`, `netlify.toml`. Relevé du 12 octobre 2026.

# ADR-008 : Cloudflare Access pour authentification

**Statut** : **Révisé — réactivation planifiée au 1er septembre 2026, policy ouverte (`Everyone`) + OTP** (cf. Notes de révision du 27 août 2026 ci-dessous)
**Date de décision originale** : décembre 2025 - janvier 2026 (déploiement initial avec Beta 95 pour une première phase d'invitations alpha)
**Formalisation ADR** : 14 mai 2026 (corrigé après le sous-audit 4.4 qui a confirmé que l'implémentation est en production, contrairement à la rédaction initiale de cet ADR qui supposait à tort un déploiement à venir)
**Date de bascule** : réactivation au 1er septembre 2026 avec policy ouverte (révision du 27 août 2026) ; auparavant : 28 mai 2026 PM (décision initiale d'une fenêtre d'ouverture publique 3-30 juin avec refermage planifié au 1er juillet), reprise le 2 juin 2026 (retrait du refermage ; ouverture publique par défaut sans calendrier de réactivation)
**Auteur** : Grégoire Bédard

---

## Contexte

Labo Codex est conçu en mode 100 % hors-ligne (cf. ADR-003) — aucune authentification côté client n'est techniquement possible (aucun secret ne peut être stocké en sécurité dans le navigateur). Tant que l'application reste utilisée en local (ouverture de `index.html` depuis le disque ou via `http://localhost`), la question d'authentification ne se pose pas.

Dès l'ouverture d'une première phase d'invitations alpha (Beta 95, janvier 2026), l'app a été déployée sur `https://app.codexnumeris.org` — c'est-à-dire qu'elle est devenue accessible via une URL publique. À ce moment :
- Sans contrôle d'accès, n'importe qui peut atteindre l'app, créer un compte local, importer des données — bénin pour Labo Codex en mode local (chaque utilisateur a ses propres données), mais ouvre la voie à des usages non maîtrisés (bots, scraping, déni de service).
- Les collègues enseignants invités à tester doivent pouvoir entrer sans procédure complexe (pas de mot de passe à gérer).
- La future **Voûte** (bibliothèque partagée, décision D1 en attente, cf. sous-audit 5.1 OWASP §3) nécessitera un contrôle d'accès **fort** parce qu'elle stockera du contenu collectif modifiable.

Plusieurs options ont été envisagées : authentification Netlify Identity, hébergement Cloudflare Pages + Cloudflare Access, IdP institutionnel (CAS du cégep), authentification maison (déconseillé), ou simple « lien obscur » (security through obscurity).

---

## Décision

**L'accès à l'application web publique est contrôlé par Cloudflare Access** (couche d'identité gérée par Cloudflare, en frontal de l'hébergement Netlify pour le domaine `app.codexnumeris.org`).

Caractéristiques :
- **Authentification par One-Time Pin par e-mail** : l'utilisateur entre son adresse, reçoit un code à 6 chiffres, le saisit, et accède à l'app. Pas de mot de passe à gérer côté projet.
- **Politique d'accès** : `Include → Everyone`, c'est-à-dire toute adresse capable de recevoir le code OTP. *Correction du 27 août 2026 : cette ligne décrivait une liste blanche d'adresses e-mail. C'était l'état de janvier 2026 seulement, présenté à tort comme la configuration de toute la période. Grégoire a abandonné la liste blanche en cours d'hiver et élargi la règle à `Everyone` — l'application était en réalité en alpha, avec très peu de testeurs, et la restriction n'avait plus d'objet. C'est cet état ouvert, et non une liste blanche, qui a produit les 51 identités du CSV du 20 mai 2026.*
- **Quota** : plan Cloudflare gratuit, **maximum 50 utilisateurs actifs**.
- **Aucun changement de code applicatif requis** : Cloudflare Access intercepte les requêtes HTTP avant qu'elles n'atteignent l'app. L'app reste 100 % hors-ligne au sens de son fonctionnement (cf. ADR-003) une fois la page chargée.

**Statut au 14 mai 2026** : **en production** depuis janvier 2026 (Beta 95). Une première phase d'invitations alpha a été ouverte en janvier 2026 — le brouillon `docs/MESSAGES_ENSEIGNANTS_H2026.md` (supprimé du dépôt depuis) visait initialement ~10 collègues. La configuration a changé plusieurs fois pendant l'hiver : liste blanche et session d'une semaine au démarrage en janvier 2026, puis abandon de la liste blanche au profit d'une règle ouverte (`Everyone`) en cours d'hiver, l'application étant en alpha avec très peu de testeurs. Une cinquantaine d'identités se sont enregistrées de cette manière entre décembre 2025 et avril 2026, en plus de l'auteur (la plus ancienne date du 7 décembre 2025, la plus récente du 28 avril 2026 ; l'export lui-même est du 20 mai). *Reformulé le 27 août 2026 : la rédaction antérieure décrivait un élargissement progressif de la liste blanche, ce qui était une reconstruction — la liste n'a pas grandi, elle a été retirée.* Aucune n'a renvoyé de feedback ni de rapport de bogue. Cette absence de retours est elle-même un signal — l'invitation alpha seule, sans matériel d'accompagnement structuré, n'a pas suffi à enclencher un engagement. *Corrigé le 27 août 2026 : cette phrase affirmait que « l'auteur reste l'unique utilisateur actif depuis fin février 2026 », et la précédente ajoutait qu'« aucune n'est revenue après l'expiration de son accès » (membre retiré le 27 août). L'export du 20 mai 2026 les contredit — **15 identités y portent une dernière connexion réussie postérieure au 28 février** (9 en mars, 5 en avril, 1 en mai ; une 16e est datée du 28 février même). Ce qui reste établi, et qui est un constat différent : aucun retour, aucun rapport de bogue n'est parvenu par cette voie. Il n'a jamais été possible de savoir si ces connexions correspondaient à un usage réel — c'est précisément la limite qui motive la réactivation du 1er septembre 2026.* La présentation AQPC du 3 juin 2026 (Cégep de Drummondville) vise à amorcer la première vague significative d'expérimentateurs accompagnés, en vue d'une phase plus structurée à l'automne 2026 (allocation cégep). *Correction du 27 août 2026 : cette phrase affirmait que le quota de 50 utilisateurs était « actuellement saturé ». C'est faux, et Grégoire l'a démenti — le quota n'a jamais été saturé cet hiver. L'export `User_Seats_Log_2026-05-20T20_03_38Z.csv` recense 51 identités enregistrées mais seulement 4 sièges Access actifs. L'affirmation de saturation était une inférence tirée du nombre d'identités, en confondant identités enregistrées et sièges occupés. Elle a servi d'appui à l'arbitrage « sélection plutôt qu'ouverture » de la révision du 26 août, qui tombe avec elle.*

---

## Conséquences

### Positives

- **Délégation complète de l'authentification** à un fournisseur spécialisé. Pas de schéma de mots de passe à concevoir et maintenir.
- **Coût zéro** sur la formule Cloudflare gratuite tant qu'on reste en deçà des limites (50 utilisateurs actifs).
- **Identification des utilisateurs** centralisée. *Précisé le 27 août 2026 : cette ligne disait « logs d'accès centralisés (utiles pour la phase expérimentateurs) », ce qui vise le mauvais objet — les journaux sont purgés à 24 h sur le plan gratuit. C'est la page `My Team → Users`, persistante et exportable en CSV, qui rend service.*
- **Pas d'impact sur le code applicatif** : l'app continue de fonctionner localement en `file://` sans aucune adaptation.
- **Compatible avec la posture de protection des renseignements personnels** : l'identité de l'utilisateur reste chez Cloudflare ; les données pédagogiques restent côté navigateur. Aucune corrélation identité ↔ contenu pédagogique côté serveur. *Note 28 mai 2026 PM* : la formulation initiale de cette conséquence était «Compatible avec la posture Loi 25». Cette qualification était disproportionnée (cf. DEPLOY.md §1.4) – le cadre Loi 25 ne semble pas s'appliquer à la configuration actuelle. La conséquence elle-même reste juste, c'est le cadre invoqué qui était trop fort.

### Négatives

- **Dépendance à Cloudflare** : si Cloudflare suspend le compte ou impose une politique incompatible, l'accès est rompu. Mitigation : le code reste téléchargeable et utilisable en local — Cloudflare Access ne contrôle que l'accès à la version hébergée.
- **Friction d'inscription** pour les expérimentateurs : doivent passer par un flow d'auth fédéré.
- **Pas de Single Sign-On avec les IdP cégep** sauf configuration spécifique (peut-être à étudier en 2027 si l'adoption institutionnelle progresse).
- **Identifiant Cloudflare leaké en logs** : à documenter dans `PRIVACY.md` (cf. sous-audit 5.4).

### Neutres

- **Cloudflare Workers / pages functions** restent une option si l'app a besoin de logique serveur très ponctuelle (signature de hash, validation de Voûte). Hors scope actuel.

---

## Alternatives considérées

### Option A : Netlify Identity

Aurait été cohérent avec l'hébergement Netlify déjà utilisé. **Écartée provisoirement** parce que Cloudflare Access offre une meilleure granularité de politiques et un meilleur support de l'auth fédérée hors-Netlify.

### Option B : Authentification maison

**Écartée** parce qu'incompatible avec le mode hors-ligne côté client et hors périmètre du mainteneur unique.

### Option C : Lien obscur (security through obscurity)

URL non publiée avec slug aléatoire. **Écartée** parce qu'inadmissible dès que la Voûte sera implémentée.

### Option D : IdP institutionnel CAS (Cégep de Drummondville)

Aurait été pertinent si le projet restait limité au cégep. **Écartée** parce que la phase expérimentateurs vise des enseignants hors cégep.

---

## Références

- `docs/CALENDRIER.md` §"Avant fin juin" et §"Juillet 2026" — calendrier de déploiement.
- Audit annuel 2026, sous-audit 5.1 OWASP §3 — risque d'accès non contrôlé à la Voûte future.
- `docs/securite/AUDIT-ETAT-REFLEXION-2026-05-11.md` (untracked) — état de réflexion en amont de la phase expérimentateurs.

---

## Notes de révision

**Révision 27 août 2026 — policy ouverte (`Everyone`) au 1er septembre, et correction de quatre inférences**

Décision de Grégoire, 27 août 2026, après relecture du dossier. Elle **corrige la
révision du 26 août** sur deux points de fond et rétablit quatre faits que les
rédactions antérieures avaient déformés.

**La configuration retenue pour le 1er septembre 2026**

| Paramètre | Valeur | Écart avec l'hiver |
|---|---|---|
| Action | `Allow` | — |
| Règle `Include` | **`Everyone`** | aucun (état de la fin de l'hiver) |
| Authentification | One-time PIN par courriel | aucun |
| Durée de session | **1 mois** | **changement assumé** (une semaine en janvier) |
| Liste blanche | **aucune** | aucun (abandonnée en cours d'hiver) |

La durée d'un mois est un **changement délibéré**, pas un retour à l'état
antérieur. `DEPLOY.md` §3.2 documente « 1 semaine (confirmé 22 mai 2026) » et
Grégoire l'a confirmé de mémoire. Le passage à un mois vise à réduire la
fréquence de réauthentification pour des enseignants qui ouvrent l'application
de façon irrégulière. La valeur reste dans la plage offerte par Cloudflare pour
une application self-hosted (« immediate timeout to one month »).

**Le motif, corrigé**

La révision du 26 août inscrivait un cinquième motif — « le contrôle d'accès
voulu par le porteur du projet » — et déclarait le besoin de mesure « hors
sujet, acté ». **Ce n'est pas le motif de Grégoire, et l'inverse est vrai.**

> **Motif réel : savoir qui utilise l'application.** Grégoire ne cherche pas à
> filtrer l'entrée ; il l'a dit explicitement le 27 août. Il veut constituer
> progressivement une liste de personnes joignables, pour les inviter à
> contribuer au développement, à signaler des bogues et à rejoindre la
> communauté de pratique. Le contrôle d'entrée est le moyen, pas la fin — et
> c'est pourquoi la porte reste ouverte.

**Pourquoi la traçabilité est possible, contrairement à ce qui était écrit**

La révision du 26 août concluait à l'impossibilité de mesurer, en s'appuyant sur
le fait que les journaux Cloudflare sont purgés à 24 h sur le plan gratuit. Le
constat est juste ; **son extension à toute forme de traçabilité ne l'est pas.**
Deux objets distincts ont été confondus :

- les **journaux d'authentification** (`Logs → Access`) : volatils, purgés à 24 h
  sur le plan gratuit, effectivement inexploitables pour cet usage ;
- la **liste des identités et des sièges** (`My Team → Users`) : **persistante**,
  affichant pour chaque adresse la date de création et la dernière connexion
  réussie, et **exportable en CSV** depuis le tableau de bord.

C'est le second objet qui répond au besoin, et il a déjà servi : l'export
`User_Seats_Log_2026-05-20T20_03_38Z.csv` (51 identités, colonne `Last Successful
Login`) est exactement le livrable recherché. Il est conservé dans
`Cowork H26 App Labo Codex/Essais sur Cloudflare/`.

⚠ **Ce que la mesure ne donnera toujours pas.** La page `Users` enregistre qui
franchit la porte, jamais ce qui se passe ensuite : l'application est locale et
hors ligne (ADR-003), et l'usage réel n'est observable par personne. Cette limite
de la révision du 26 août reste entière et reste assumée. Ce qui change, c'est
qu'elle ne s'étend pas à l'identification des utilisateurs, laquelle est
possible.

**Le quota, corrigé**

L'arbitrage « sélection plutôt qu'ouverture » du 26 août reposait sur une
saturation du quota qui n'a jamais eu lieu (cf. correction au §Décision). Sans
cet appui, il tombe. Grégoire estime le potentiel à « une vingtaine d'utilisateurs » (27 août 2026) ;
sur 50 sièges, la marge est donc confortable. **À surveiller malgré tout** : la porte étant ouverte,
le nombre d'identités n'est plus borné par une liste, et le comportement du
quota (recyclage ou non des sièges inactifs) n'a pas été vérifié — c'est
précisément l'écart entre 51 identités et 4 sièges actifs du CSV de mai, dont la
cause reste inconnue.

**Conséquence de confidentialité**

Conserver et exporter la liste des identités est une opération sur des
renseignements personnels que `PRIVACY.md` ne déclare pas : ce document ne
mentionne que les journaux d'accès purgés à 24 h. À corriger dans la même passe.

**Statut applicatif** : aucun changement de code, comme aux révisions
précédentes. Seul l'état de la policy change.

**Fiche opératoire** : `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`,
réécrite le 27 août pour la policy ouverte.

✅ **GESTE POSÉ LE 31 AOÛT 2026, vers 08 h 36** (la veille de la date annoncée,
pour être en place avant le cours de 8 h du 1er septembre). Consignation :

| | Relevé avant | Après |
|---|---|---|
| Équipe Zero Trust | `labo-codex` (offre Zero Trust Free) | inchangé |
| Application | `Codex Numeris beta`, auto-hébergée, `app.codexnumeris.org` | renommée **`Labo Codex`** — l'ancienne portait le nom du blog, pas celui du projet |
| Stratégie (unique) | `Test Labo Codex`, créée le 6 décembre 2025 | nom inchangé (renomination en « CoP Labo Codex » envisagée puis écartée) |
| **Action** | **`Bypass` (Contourner)** | **`Allow` (Autoriser)** |
| Règle `Include` | `Everyone` | inchangée |
| Durée de session de la **policy** | **6 hours** | **1 month** |
| Durée de session de l'application | 1 semaine | 1 month (sans effet : la policy prime) |
| Fournisseur d'identité | One-time PIN, unique | inchangé |

⚠️ **La découverte du geste, à ne pas perdre.** Ce document, `DEPLOY.md` et
`PRIVACY.md` affirmaient tous trois que « seule la policy est désactivée ».
C'était faux : la policy n'a jamais été désactivée, son **action** était
`Bypass`. Access était donc en place et actif depuis juin, laissant simplement
tout passer. La réactivation n'a pas consisté à rallumer un dispositif éteint,
mais à faire passer une action de `Bypass` à `Allow`.

⚠️ **Le piège de la durée, à ne pas perdre non plus.** Cloudflare applique la
durée de session de la POLICY, qui écrase celle de l'application et la globale
(le tableau de bord l'écrit sous le champ). La fiche opératoire et `DEPLOY.md`
§3.2 désignaient la durée de l'application : régler celle-là seule aurait laissé
les utilisateurs se réauthentifier toutes les six heures, contre le mois annoncé
partout ailleurs.

⏳ **Reste à faire** : le test de bout en bout en navigation privée, et #508
(réécrire au présent le paragraphe d'accueil, le bandeau daté s'éteignant dans
la nuit du 31 août au 1er septembre).

---


**Révision 26 août 2026 — refermage décidé pour le 1er septembre 2026, et un cinquième motif**

> ⚠️ *Note du 27 août 2026* : **cette révision est remplacée par celle du 27 août
> 2026** (ci-dessus). Elle organisait un refermage par **liste blanche** sur la
> foi de deux affirmations fausses — un quota saturé qui ne l'a jamais été, et un
> besoin de mesure déclaré impossible alors qu'il ne l'est pas — et elle
> attribuait à Grégoire un motif de gouvernance qui n'était pas le sien. Le bloc
> est conservé tel quel pour la traçabilité de la chronologie ; **ne pas s'y
> fier pour l'état de la décision.**

Décision de Grégoire, 26 août 2026 : l'accès public est refermé le 1er septembre.

⚠ **Le motif ne figure dans aucune des quatre conditions du §3.6 de `DEPLOY.md`**
(risque opérationnel concret · création de la Voûte · bascule institutionnelle ·
croissance qualitative inattendue). Il faut donc l'énoncer plutôt que de l'y faire
rentrer de force :

> **Cinquième motif — le contrôle d'accès voulu par le porteur du projet.** Grégoire
> veut savoir qui a accès à Labo Codex et reprendre la main sur les cinquante sièges.
> Ce n'est ni un incident, ni une contrainte externe : c'est une préférence de
> gouvernance, et elle se suffit à elle-même. La faire passer pour un « risque
> opérationnel » aurait été plus commode et malhonnête.

**Ce que ce refermage NE donne PAS, et qui est accepté.** La liste blanche contrôle
l'ENTRÉE, jamais l'usage. Trois faits, déjà au dossier :

1. Phase janvier-mai 2026 : ~50 personnes invitées, « aucune n'a renvoyé de feedback
   ou de rapport de bug, et aucune n'est revenue après l'expiration de son accès ».
   La liste était pleine et l'usage nul.
2. `DEPLOY.md` : les logs Cloudflare sont « purgés à 24 h sur plan gratuit » et « ne
   produisent rien d'actionnable ».
3. L'application est **locale et hors ligne** : l'usage réel n'est observable par
   personne, et le rendre observable contredirait la posture de confidentialité.

⮕ Décision du 26 août : **le filtrage de l'entrée suffit**, le besoin de mesure n'est
pas poursuivi. Écrit ici pour qu'une session future ne prenne pas cette limite pour un
défaut à corriger.

**Arbitrage du quota** : le plan gratuit s'arrête à 50 sièges, et la liste du printemps
les saturait déjà. Retenu : **sélection** — la communauté de pratique et les personnes
actives d'abord, les autres sur demande. Pas d'upgrade payant. Le précédent de
janvier-mai pèse dans ce sens : une liste pleine n'a pas produit d'usage, et payer
pour des sièges vides serait acheter un chiffre.

**Statut applicatif** : aucun changement de code, comme aux révisions précédentes. Le
contrat reste « app servie telle quelle depuis Netlify, derrière DNS Cloudflare proxy
orange ». Seule la policy change d'état.

**Fiche opératoire** : `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`
(gestes, liste, courriel d'invitation, vérifications et consignation).

⏳ **À compléter le jour du geste** : date effective, taille de la liste reconstituée,
et les trois placeholders Cloudflare de `DEPLOY.md`.

---



**Révision 2 juin 2026 — retrait du refermage planifié au 1er juillet, ouverture publique par défaut**

Décision actée par Grégoire le 2 juin 2026 matin (J−1 avant AQPC),
après réexamen à froid des justifications qui restaient pour fonder
le refermage prévu au 1er juillet.

**Constat** : une fois retirées les justifications qui ne tiennent
plus l'examen, il ne reste pratiquement rien pour fonder un refermage
actif.

- **Loi 25** : retirée par la révision 28 mai 2026 PM (cf. §1.4 de
  DEPLOY.md). Plus pertinente comme contrainte.
- **Anti-scraping / anti-DDoS** : la protection de base de Cloudflare
  fonctionne indépendamment d'Access. Les assets statiques de l'app
  n'ont rien de sensible à voler (code public sur GitHub).
- **Traçabilité des accès** : la phase alpha janvier-mai 2026 a
  démontré que les logs Cloudflare ne produisent rien d'actionnable
  (purgés à 24 h sur plan gratuit ; aucun retour utilisateur n'est
  passé par cette voie). Les vrais canaux d'engagement passent par
  la CoP et `labo@codexnumeris.org`.
- **Voûte future** : aura son propre contrôle d'accès applicatif
  quand elle existera. Maintenir Access actif sur l'app principale
  ne sert pas la préparation de la Voûte.
- **Quota 50 sièges gratuits** : c'est une conséquence opérationnelle
  du choix de maintenir Access, pas une raison de le maintenir.

**Argument additionnel — calendrier académique** : refermer le 1er
juillet couperait l'accès précisément pendant la fenêtre
d'appropriation et de préparation des cours d'automne (mi-juillet à
mi-août), en contradiction avec la finalité de l'AQPC du 3 juin telle
que documentée dans cet ADR (« la première vraie amorce d'une vague
significative d'expérimentateurs accompagnés, en vue d'une phase
structurée à l'automne 2026 »). Un refermage à J+27 contredit cette
finalité.

**Décision** :

- Cloudflare Access reste désactivé sur `app.codexnumeris.org`. Aucune
  date de réactivation n'est planifiée.
- La configuration DNS / proxy orange reste en place ; seule la policy
  Access est désactivée. La réactivation reste une opération de
  quelques minutes si une raison concrète apparaît un jour.
- La CoP devient le seul vecteur d'engagement et de recrutement — ce
  qui correspond à son rôle conçu, plutôt que de partager cette
  fonction avec une liste blanche Cloudflare.
- Les **conditions** qui pourraient justifier une réactivation future
  sont documentées dans DEPLOY.md §3.6 : émergence d'un risque
  opérationnel concret, création de la Voûte, bascule institutionnelle,
  croissance qualitative inattendue rendant utile une traçabilité.

**Documents alignés dans la foulée** :

- DEPLOY.md v1.4 (2 juin 2026) — §3, §3.5, §3.6, §4.1, historique.
- BACKLOG.md item `#298` — à refondre une seconde fois pour retirer
  les références à la fenêtre 3-30 juin et au refermage.
- `Note accès web app - communication CoP.md` — les trois versions
  (infolettre, SharePoint, courriel) à amender.
- Message d'accueil dans l'app (`js/accueil.js`) — paragraphe
  d'accès cadré livré par Claude Code le 1er juin à amender.

**Statut applicatif** : aucun changement de code. Le contrat reste
«app servie telle quelle depuis Netlify, derrière DNS Cloudflare
proxy orange». Seule la policy Access est désactivée.

---

**Révision 28 mai 2026 — ouverture publique cadrée du 3 juin au 30 juin 2026, refermage planifié au 1er juillet**

> *Note 2 juin 2026* : cette révision a été partiellement remplacée
> par la révision du 2 juin 2026 (ci-dessus). Le refermage planifié
> au 1er juillet est abandonné. Le cadrage de fond (recadrage Loi 25,
> articulation aux portes d'entrée CoP, lecture du précédent alpha)
> reste valable et est repris dans la révision du 2 juin. Le présent
> bloc est conservé tel quel pour la traçabilité de la chronologie.

Décision actée par Grégoire le 28 mai 2026, précisée en cours de
journée après consultation Cowork sur le cadrage juridique et la
stratégie d'accès. Le Cloudflare Access est suspendu pendant une
fenêtre d'ouverture publique cadrée du 3 juin au 30 juin 2026 ;
l'application `app.codexnumeris.org` devient publiquement accessible
sans authentification pendant cette fenêtre. Le contrôle d'accès est
rétabli au 1er juillet 2026 avec une liste blanche reconstituée.

**Motivations** :

- **Préparation AQPC** : permettre aux visiteurs de la conférence du
  3 juin 2026 de tester l'application sans procédure d'inscription
  préalable.
- **Friction technique observée** : le challenge bot Cloudflare Bot
  Management bloquait certains clients non-browser et risquait de
  bloquer des appareils anciens ou des réseaux institutionnels stricts.
- **Découplage découverte/recrutement** : dépendre du quota gratuit
  de 50 sièges pour gérer la première vague d'expérimentateurs serait
  limitant ; la libération temporaire permet de séparer la découverte
  (large, immédiate) du recrutement (sélectif, post-fenêtre).
- **Constat d'usage alpha (janvier-février 2026) recadré** : la phase
  janvier-mai 2026 a confirmé que la liste blanche seule, sans
  accompagnement structuré, ne suffit pas à enclencher un engagement.
  Deux paramètres défavorables expliquent l'échec : application en
  phase alpha plutôt que beta (pas assez stable pour un usage
  soutenu) et début de trimestre (bande passante mentale des
  enseignants saturée). Ces deux paramètres sont aujourd'hui levés
  (beta stable, fin de session) ; le précédent ne disqualifie pas le
  modèle.
- **Articulation aux trois portes d'entrée** : l'app publique (porte
  large, temporaire), la Communauté Labo Codex hébergée par l'AQPC
  (porte d'engagement intermédiaire, durable), la Cohorte 1 pilote
  2026-2027 (porte d'engagement maximal, accompagnée). Le dispositif
  CoP absorbe désormais l'engagement que la liste blanche seule ne
  pouvait pas produire en janvier 2026.

**Conséquences acceptées (pour la fenêtre 3 juin - 30 juin 2026)** :

- **Perte des logs d'accès individuels** par identité courriel. Les
  logs de janvier-mai 2026 avaient déjà été purgés automatiquement
  par Cloudflare (rétention 24 h sur plan gratuit) — la perte
  prospective est l'élément nouveau, et limitée à la durée de la
  fenêtre.
- **Voûte future** (cf. §Contexte) devra avoir son propre contrôle
  d'accès au niveau applicatif si elle est implémentée — ce qui
  était déjà la posture initiale (l'ADR-008 ne couvrait pas la Voûte
  par sa politique).
- **Reposture de sécurité** : l'application reste 100 % hors-ligne par
  conception (ADR-003). Aucune donnée pédagogique ne transite par
  Cloudflare ni Netlify. Le risque résiduel est limité à : (i) scraping
  des assets statiques publics, (ii) DoS absorbable par le CDN
  Cloudflare, (iii) image / réputation (n'importe qui peut prendre
  des captures d'écran et publier pendant la fenêtre).
- **Usage hors-ligne préservé** : l'application reste téléchargeable
  depuis GitHub et utilisable en local (`file://`) en tout temps,
  indépendamment du statut de l'accès web hébergé. Le refermage du
  1er juillet ne coupe l'accès web qu'aux personnes hors de la liste
  blanche reconstituée – il ne coupe l'accès à l'application à
  personne.

**Recadrage du référentiel Loi 25 (28 mai 2026 PM)** : la formulation
initiale de cette révision inscrivait parmi les conséquences acceptées
la perte d'une «base de consentement explicite Loi 25 par liste
blanche». Cette qualification était disproportionnée et a été retirée
après consultation Cowork. Cadrage révisé : Labo Codex, en
configuration actuelle (mainteneur individuel, pas d'activité
économique organisée au sens de l'article 1525 C.c.Q., application
100 % hors-ligne), n'engage vraisemblablement pas la *Loi sur la
protection des renseignements personnels dans le secteur privé* (cf.
DEPLOY.md §1.4 pour le cadrage complet). Le BACKLOG `#298` (révision
PRIVACY.md) reste ouvert et doit être reformulé : pas «mettre à jour
la posture Loi 25 après retrait Access», mais «clarifier que le cadre
Loi 25 a été surinvoqué et préciser le régime réel».

**Plan de refermage — 1er juillet 2026** :

Liste blanche reconstituée à partir de trois sources :

1. **Membres de la Cohorte 1 pilote 2026-2027** de la Communauté Labo
   Codex (priorité — c'est le noyau d'expérimentateurs accompagnés ;
   modalités de recrutement à finaliser comme chantier 5 du doc
   «6 questions» de la CoP).
2. **Membres de la CoP** qui ont demandé explicitement l'accès web
   entre le 3 juin et le 30 juin 2026 en écrivant à
   `labo@codexnumeris.org`. Une note dans la communication CoP de
   l'AQPC signalera cette modalité (cf. dossier compagnon
   `communauté/.../Note accès web app - communication CoP.md`).
3. **Mainteneur** et co-mainteneur éventuel.

*Inférence* : la somme de ces sources restera vraisemblablement sous
le quota gratuit Cloudflare de 50 sièges (Cohorte 1 dimensionnée par
contrainte pédagogique pour des ateliers de 90 min mensuels, donc
probablement 15-25 personnes ; demandeurs CoP additionnels modestes
à court terme). Si dépassement, l'arbitrage upgrade Cloudflare payant
vs sélection sera posé à ce moment-là, pas en anticipation.

Procédure technique : suivre DEPLOY.md §3.6. La configuration DNS /
proxy orange reste en place pendant toute la fenêtre ; seule la
policy Access est désactivée puis réactivée avec la nouvelle liste
blanche.

**Décision réversible** : la procédure documentée dans DEPLOY.md §3
reste valide pour remettre Cloudflare Access en place avant le 1er
juillet 2026 si une des conséquences acceptées devient bloquante
pendant la fenêtre d'ouverture publique.

**Statut applicatif** : aucun changement de code. Le contrat reste
«app servie telle quelle depuis Netlify, derrière DNS Cloudflare
proxy orange» ; seule la couche Access intermédiaire est désactivée
pour la durée de la fenêtre.

**Cohérence documentaire** : cette révision a été stabilisée en
consultation avec DEPLOY.md v1.3 (28 mai 2026 PM). Les itérations
intermédiaires côté DEPLOY.md (v1.1 «retrait» et v1.2 «recadrage Loi
25») sont tracées dans son historique des révisions.

---

**Révision 14 mai 2026** (initiale) : la première rédaction de cet ADR (commit `d571d90`) supposait à tort que Cloudflare Access était au statut « Proposé, implémentation à venir juin 2026 ». Le sous-audit 4.4 Reproductibilité du déploiement (commit suivant) a confirmé que Cloudflare Access est en production depuis janvier 2026 (Beta 95). Le statut, la date originale et les caractéristiques ont été corrigés. Le « juin 2026 » du `docs/CALENDRIER.md` désigne **l'ouverture à un public plus large**, pas le démarrage du déploiement.

**Révision post-audit (mai 2026)** : la description de l'usage en production présentait initialement le brouillon d'invitations `docs/MESSAGES_ENSEIGNANTS_H2026.md` (supprimé du dépôt depuis) comme une cohorte active de testeurs (« Bruno V., Olivier L., autres l'utilisent activement »). En réalité, ce brouillon de janvier 2026 visait environ 10 collègues ; l'usage effectif a été limité à quelques contacts alpha entre janvier et fin février 2026. Depuis fin février 2026, l'application n'a qu'un seul utilisateur actif : son auteur. La phase visée par l'AQPC du 3 juin 2026 est la **première** vague significative d'expérimentateurs, pas une seconde. Les sections « Contexte », « Décision » et « Statut » ont été reformulées en conséquence.

À réviser si :
- Émergence d'un risque opérationnel concret sur l'app publique : abus mesurable, DoS persistant non absorbé par Cloudflare, scraping intensif identifié, dérive d'usage.
- Création de la Voûte (cf. §Contexte) imposant un contrôle d'accès applicatif fort — décision à prendre au moment d'implémenter la Voûte sur la nécessité (ou non) de réactiver Access sur l'app principale comme première barrière.
- Bascule institutionnelle : si Labo Codex est porté un jour par une organisation (cégep, OBNL, entreprise), reprise complète de l'analyse Loi 25 + contrôle d'accès.
- Le cégep officialise une politique d'accès institutionnelle (réviser pour intégrer CAS).
- ~~Croissance qualitative inattendue rendant utile une traçabilité dont l'absence ne pose actuellement aucun problème.~~ *Survenu autrement le 27 août 2026 : la traçabilité est devenue le motif principal, sans qu'aucune croissance ne l'ait provoquée.*
- ~~Si Access est un jour réactivé~~ **Access étant réactivé le 1er septembre 2026** : le quota de 50 sièges gratuits redevient une contrainte à surveiller, d'autant que la porte est ouverte et que le nombre d'identités n'est plus borné par une liste (arbitrage upgrade payant vs politique de domaine vs sélection, à poser si le plafond approche).

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).

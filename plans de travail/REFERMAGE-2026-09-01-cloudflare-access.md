# Réactivation de Cloudflare Access — fiche opératoire du 1er septembre 2026

**Item** : #427 · **Dépendance** : #508 (l'avis d'accueil, daté du 1er septembre)
**Préparée le** : 26 août 2026 · **Réécrite le** : 27 août 2026, après correction du dossier (§1)
**Sources** : `docs/adr/008-cloudflare-access.md` (révision du 27 août), `DEPLOY.md` §3 et §4, `SECURITY.md`

> **Rien à construire.** La configuration Cloudflare Access n'a jamais été défaite : le DNS reste en
> proxy orange, seule la *policy* est désactivée. L'opération est de quelques minutes dans le
> tableau de bord Zero Trust — la révision documentaire est le vrai travail, et elle est faite.

> ⚠ **Cette fiche remplace la version du 26 août**, qui décrivait un refermage par liste blanche.
> Ce n'était pas ce que Grégoire voulait, et elle s'appuyait sur des faits inexacts. Voir §1.

---

## §1 · Ce qui a changé depuis la version du 26 août

La version précédente organisait une **sélection** : liste blanche nominative, invitations
individuelles, test de refus. Elle se fondait sur trois affirmations, toutes fausses ou
déformées, corrigées à l'ADR-008 le 27 août.

| Affirmation du 26 août | Ce qu'il en est |
|---|---|
| « Le quota de 50 sièges était déjà saturé au printemps » | **Faux.** Il ne l'a jamais été. Le CSV du 20 mai donne 51 identités mais **4 sièges Access actifs** |
| « La politique d'hiver était une liste blanche » | **Périmé.** Vrai en janvier seulement ; la liste a été abandonnée en cours d'hiver au profit de `Everyone` |
| « Mesure d'usage : hors sujet, acté » | **Renversé.** C'est le motif principal. La confusion portait sur l'objet à consulter (voir §6) |

**Le motif réel** : Grégoire veut savoir qui utilise l'application, pour constituer
progressivement une liste de personnes joignables — contribution au développement, signalement
de bogues, invitation à la communauté de pratique. **Il ne cherche pas à filtrer l'entrée.** La
porte reste donc ouverte ; l'authentification sert à nommer, pas à trier.

---

## §2 · La configuration visée

| Paramètre | Valeur | Écart avec l'hiver |
|---|---|---|
| **Action** | `Allow` | — |
| **Règle `Include`** | **`Everyone`** | aucun |
| **Authentification** | One-time PIN par courriel | aucun |
| **Durée de session** | **1 mois** | **changement assumé** (une semaine en janvier) |
| **Liste blanche** | aucune | aucun |

⚠ **La durée d'un mois est un changement, pas une restauration.** `DEPLOY.md` §3.2 documente
« 1 semaine (confirmé 22 mai 2026) ». Un mois reste dans la plage offerte par Cloudflare pour une
application self-hosted (documentation Cloudflare consultée le 27 août 2026,
`developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/` :
« immediate timeout to one month »). À inscrire comme changement assumé dans la consignation du §7.

---

## §3 · Avant le 1er septembre — ce que Grégoire seul peut faire

| | Geste | Où |
|---|---|---|
| 3.1 | Relever le **nom de la team Zero Trust**, le **nom de l'application**, le **nom de la policy** | `one.dash.cloudflare.com` |
| 3.2 | Relever la **durée de session actuelle** avant de la modifier (pour la consignation) | `Access → Applications → [app]` |
| 3.3 | Relever la **règle `Include` réelle** de la policy dormante | `Access → Applications → [app] → Policies` |
| 3.3 bis | **Décider quoi faire de l'URL Netlify directe** (voir l'encadré ci-dessous) | Tableau de bord Netlify |
| 3.4 | Me transmettre ces relevés : ils remplacent les `[À COMPLÉTER]` de `DEPLOY.md` §3.1, §3.2 et §3.3 | — |

> **Pourquoi relever avant de modifier.** Le dossier a déjà affirmé trois fois des valeurs qui ne
> correspondaient à rien de vérifié. Un relevé de trente secondes coûte moins cher qu'une
> quatrième inférence.

⚠ **La porte de service.** `DEPLOY.md` §1.2 documente que
`main--codexnumeris-051225.netlify.app` sert la production **sans passer par le proxy
Cloudflare**. Cette URL contourne donc Access : quiconque la connaît entre sans laisser
d'identité. C'était sans conséquence tant que l'application était ouverte à tous ; à partir du
1er septembre, c'est un trou dans la mesure. Trois options, à trancher avant le geste : la
laisser (le risque est faible, l'URL n'est publiée nulle part), la rediriger vers
`app.codexnumeris.org` depuis `netlify.toml`, ou désactiver le sous-domaine Netlify par défaut.
⚠ **Ce n'est pas un constat, c'est une hypothèse.** Elle se déduit de la configuration décrite
en `DEPLOY.md` §1.2 ; **aucun test n'a été fait**. Un `curl -I` sur cette URL tranche en dix
secondes, et c'est le geste 3.3 bis.

---

## §4 · Le 1er septembre — la séquence

| | Geste | Attendu |
|---|---|---|
| 4.1 | `Access → Applications → [app] → Policies → [policy]` : **réactiver** la policy | La policy passe à l'état actif |
| 4.2 | Vérifier que la règle `Include` est bien **`Everyone`** — la corriger si la policy dormante a gardé une liste d'`Emails` | La règle affiche `Everyone` |
| 4.3 | `Access → Applications → [app]` : porter **Session duration** à **1 month** | La valeur est enregistrée |
| 4.4 | Vérifier que le fournisseur **One-time PIN** est actif : `Integrations → Identity providers` | OTP présent et actif |
| 4.5 | **Se déconnecter, ouvrir `app.codexnumeris.org` en fenêtre privée** | Un code OTP est demandé par courriel |
| 4.6 | Entrer le code reçu | L'application s'ouvre |
| 4.7 | Recommencer avec une **adresse quelconque hors du réseau collégial** (une adresse personnelle suffit) | **L'accès est accordé** — c'est le test que la porte est bien ouverte |
| 4.8 | `curl -I https://app.codexnumeris.org` | **HTTP/2 302** vers le login Access (cf. `DEPLOY.md` §3.5) |

⚠ **4.5, 4.7 et 4.8 ne sont pas facultatives.** Le sens du test a changé : il ne s'agit plus de
vérifier qu'on bloque, mais qu'on **laisse passer tout en identifiant**. Une policy dormante
depuis trois mois peut se réveiller avec la règle `Emails` de janvier, ce qui refermerait la
porte sans que rien ne le signale. Le §4.7 est le seul geste qui l'attrape.

⚠ **Vérifier le fournisseur OTP, plutôt que le supposer présent.** La documentation Cloudflare
(`developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/`,
consultée le 27 août 2026) indique que le One-time PIN « n'est plus ajouté automatiquement » aux
comptes, sans préciser à partir de quand ni ce qu'il advient des comptes existants. Ce que cela
implique pour ce compte-ci n'est **pas connu** : d'où le §4.4. Sans fournisseur OTP actif, la
policy n'a aucun moyen d'authentifier et personne n'entre.

---

## §5 · L'annonce

La porte étant ouverte, il n'y a **personne à inviter nominativement** : il y a un changement à
annoncer. Deux canaux, dans cet ordre d'efficacité.

**1. Le message de rentrée à la CoP** (`Cowork A26 CoP Labo Codex/message-cop-rentree-2026.md`,
non encore envoyé). C'est le meilleur véhicule : il part vers des gens qui liront, il est déjà
rédigé, et il annonce déjà un sondage. Un paragraphe à y insérer :

> **Une petite chose à savoir.** À partir du 1er septembre, Labo Codex demande une identification
> à l'entrée : tu donnes ton courriel, tu reçois un code, tu le colles, et tu n'y repenses plus
> pendant un mois. Passé ce délai, tu redonnes ton courriel et c'est reparti pour un mois. **Rien
> ne se ferme** : il n'y a ni compte à créer, ni mot de passe à retenir, ni accès à redemander.
> Tes données ne bougent pas non plus, elles n'ont jamais quitté ton appareil. Ce que ça me donne,
> c'est de savoir qui utilise l'outil, pour pouvoir vous écrire quand j'ai besoin de retours.

⚠ **Le mois est un renouvellement, pas une échéance.** C'est le point sur lequel un lecteur pressé
se trompe, et la formulation « l'accès reste ouvert un mois » l'y invitait franchement (retour de
Grégoire, 27 août). Partout où la durée est mentionnée — bandeau, accueil, courriel, `PRIVACY.md` —
la phrase qui suit doit dire ce qui se passe au bout du mois. Sans elle, la durée se lit comme une
date de péremption et transforme une commodité en menace.

**2. Le paragraphe d'accueil dans l'application** (#508, voir §8). Grégoire doute qu'il soit lu, et
ce doute est fondé : un avis en page d'accueil est vu par ceux qui entrent déjà, c'est-à-dire trop
tard pour préparer qui que ce soit. Il reste utile comme **rappel après coup**, pas comme préavis.

⚠ **Ce qu'aucun de ces canaux ne couvre.** Des textes rédigés le 2 juin décrivent l'application
comme « **librement accessible**, sans création de compte, sans procédure d'inscription » et
étaient destinés à la page CoP du portail AQPC (`aqpc.qc.ca/fr/cop-labocodex`) et à l'infolettre.
**Leur publication n'est pas établie** : la note qui les porte les range sous « points à
coordonner » et demandait encore à **Fanny Joussemet** de confirmer l'insertion. Premier geste
donc : vérifier ce qui a effectivement été publié. Si ces textes sont en ligne, leur correction
passe par l'AQPC, avec un délai hors du contrôle de Grégoire. Source :
`Cowork H26 App Labo Codex/communauté/OneDrive_1_2026-04-30/Lancement CoP - Documentation essentielle à fournir 2/Nécessaire pour un lancement réussi/Note accès web app - communication CoP.md`.

---

## §6 · Ce que la mesure donne, et ce qu'elle ne donne pas

C'est le point que la version du 26 août avait manqué. **Deux objets distincts** dans Cloudflare
Zero Trust, et un seul répond au besoin.

| Objet | Où | Rétention | Utile ? |
|---|---|---|---|
| Journaux d'authentification | `Logs → Access` | **24 h** sur plan gratuit | Non |
| **Liste des identités et sièges** | **`My Team → Users`** | **persistante** | **Oui** |

La page `Users` donne, par adresse : date de création, **dernière connexion réussie**, état du
siège Access. Elle s'exporte en CSV depuis le tableau de bord. **Le précédent existe** :
`Cowork H26 App Labo Codex/Essais sur Cloudflare/User_Seats_Log_2026-05-20T20_03_38Z.csv`, produit
le 20 mai 2026, 51 identités. C'est exactement le livrable recherché.

**Cadence suggérée** : un export à la fin de chaque mois, déposé dans
`Cowork A26 CoP Labo Codex/`. Les exports se comparent d'un mois à l'autre : les nouvelles
adresses sont les nouveaux venus, les dates de dernière connexion distinguent les actifs des
passants.

⚠ **La limite, qui reste entière.** La page `Users` enregistre qui franchit la porte, jamais ce
qui se passe ensuite. L'application est locale et hors ligne (ADR-003) : l'usage réel n'est
observable par personne, et le rendre observable contredirait la posture de confidentialité.
Une adresse dans la liste dit « cette personne est entrée », pas « cette personne s'en sert ».
Ce constat de la version du 26 août est le seul qui survit intact.

⚠ **Le quota, à surveiller sans dramatiser.** 50 sièges, et un potentiel estimé par Grégoire à
« une vingtaine d'utilisateurs » (27 août 2026) : la marge est confortable. Mais la porte étant ouverte, le nombre d'identités n'est plus borné par
une liste. Et l'écart du CSV de mai (51 identités, 4 sièges actifs) reste **inexpliqué** : on ne
sait pas si Cloudflare recycle les sièges inactifs. À regarder au premier export.

---

## §7 · Après le geste — à consigner le jour même

- [ ] **date effective** de la réactivation ;
- [ ] **motif** (savoir qui utilise, désormais inscrit à l'ADR) ;
- [ ] **durée de session relevée avant modification**, et la nouvelle valeur ;
- [ ] **règle `Include` trouvée** dans la policy dormante (`Everyone` ou résidu d'`Emails`) ;
- [ ] les **trois placeholders** de `DEPLOY.md` remplis ;
- [x] `ADR-008`, `DEPLOY.md` (v1.6), `SECURITY.md` et `PRIVACY.md` (v1.2) révisés le 27 août 2026 ;
- [ ] `BACKLOG.md` (#427, #508), `RELAIS.md` et `ETAT-PROJET.md` alignés — **non faits**, voir §10 ;
- [ ] **#508** : le paragraphe d'accueil posé (§8).

---

## §8 · #508 — le paragraphe d'accueil

**Si la réactivation a lieu le 1er** (à poser dans `js/accueil.js`) :

> L'identification est requise pour accéder à Labo Codex. Tu donnes ton courriel, tu reçois un
> code, et tu n'y repenses plus pendant un mois — après quoi tu redonnes ton courriel et c'est
> reparti. Rien ne se ferme, et tes données restent sur ton appareil.

**Si elle n'a PAS lieu le 1er** : retirer le paragraphe, purement et simplement. Le reposer quand
la date sera tenable. ⚠ **Reporter la phrase sans reporter le dispositif est la seule issue à
éviter** : elle apprendrait au lecteur à ne plus lire cette zone de la page — celle où vivent
« Par où commencer ? » et l'invitation à la CoP.

---

## §9 · La dette de confidentialité créée par ce geste

`PRIVACY.md` déclarait aux utilisateurs (§3.3 et §8.2) que les journaux d'accès sont purgés
après 24 heures. C'est vrai, et c'est **incomplet** dès lors que la liste des identités est
conservée sans limite et exportée périodiquement pour constituer une liste de contacts.

**Réglé le 27 août 2026** : `PRIVACY.md` v1.2 déclare désormais, dans les mêmes termes simples
que le reste du document, que l'adresse courriel et la date de dernière connexion sont conservées
sans limite chez Cloudflare, à quoi elles servent, et comment demander leur retrait (§3.3, §6.1,
§8.2 et §9). Le délai de retrait annoncé aux utilisateurs est aligné sur `DEPLOY.md` §4.3
(quelques jours ouvrables).

---

## §10 · Ce qui n'a pas été vérifié

1. **Rien de tout ceci n'a été essayé.** Aucun accès au tableau de bord Cloudflare depuis cette
   session. Que la policy dormante soit intacte et le DNS en proxy orange, le dossier l'affirme ;
   les §4.5, §4.7 et §4.8 sont là pour le vérifier avant d'y croire.
2. **Le quota de 50** et le **recyclage des sièges** n'ont pas été confirmés sur le plan gratuit
   dans son état d'août 2026.
3. **L'export CSV de la page `Users`** est attesté par le fichier de mai 2026. Que le bouton
   d'export soit toujours au même endroit dans le tableau de bord actuel n'a pas été vérifié.
4. **Le comportement du fournisseur OTP** sur un compte existant (§4.4) : la documentation
   Cloudflare est muette sur ce cas.
5. **L'URL Netlify directe** (§3) : son accessibilité vient de `DEPLOY.md` §1.2, elle n'a pas été
   testée.
6. ~~**Les documents de pilotage ne sont pas alignés.**~~ **Fait le 27 août 2026** :
   `BACKLOG.md` (#427, #508), `RELAIS.md` et `ETAT-PROJET.md` alignés dans une première passe ;
   `INCIDENTS.md`, `AUDIT.md`, `README.md`, `docs/adr/README.md`, `docs/CALENDRIER.md`, le
   commentaire d'en-tête de `js/accueil.js`, la checklist de levée (marquée périmée), les trois
   plans d'audit de mai (démentis datés sur la saturation) et `owasp-checklist.md` dans une
   seconde. Reste hors périmètre, volontairement : `SESSION.md`, `BACKLOG-ARCHIVE.md` et les
   changelogs archivés, qui sont des journaux.
7. **Trois dates coexistent pour l'ouverture publique** : `DEPLOY.md` §1.2 dit « depuis le
   28 mai », `PRIVACY.md` §2 « depuis le 2 juin », et plusieurs autres passages « depuis le
   3 juin ». Elles désignent probablement des faits différents (décision, révision de la décision,
   lancement AQPC), mais **aucun document ne l'arbitre**. À trancher par Grégoire — c'est lui qui
   sait quand la policy a effectivement été désactivée.

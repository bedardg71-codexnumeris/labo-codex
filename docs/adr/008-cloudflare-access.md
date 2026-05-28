# ADR-008 : Cloudflare Access pour authentification

**Statut** : **Révisé — retiré le 28 mai 2026** (cf. Notes de révision §28 mai 2026 ci-dessous)
**Date de décision originale** : décembre 2025 - janvier 2026 (déploiement initial avec Beta 95 pour une première phase d'invitations alpha)
**Formalisation ADR** : 14 mai 2026 (corrigé après le sous-audit 4.4 qui a confirmé que l'implémentation est en production, contrairement à la rédaction initiale de cet ADR qui supposait à tort un déploiement à venir)
**Date de retrait** : 28 mai 2026 (préparation AQPC du 3 juin)
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
- **Politique d'accès** : liste blanche d'adresses e-mail (initialement les ~10 collègues invités via le brouillon `docs/MESSAGES_ENSEIGNANTS_H2026.md` rédigé en janvier 2026 ; usage effectif limité à quelques contacts alpha entre janvier et fin février 2026).
- **Quota** : plan Cloudflare gratuit, **maximum 50 utilisateurs actifs**.
- **Aucun changement de code applicatif requis** : Cloudflare Access intercepte les requêtes HTTP avant qu'elles n'atteignent l'app. L'app reste 100 % hors-ligne au sens de son fonctionnement (cf. ADR-003) une fois la page chargée.

**Statut au 14 mai 2026** : **en production** depuis janvier 2026 (Beta 95). Une première phase d'invitations alpha a été ouverte en janvier 2026 — le brouillon `docs/MESSAGES_ENSEIGNANTS_H2026.md` visait initialement ~10 collègues. La liste blanche Cloudflare Access s'est élargie progressivement entre janvier et mai 2026 jusqu'à environ 50 personnes (en plus de l'auteur), chacune disposant d'un accès individuel d'une semaine via OTP par email. Aucune n'a renvoyé de feedback ou de rapport de bug, et aucune n'est revenue après l'expiration de son accès. Cette absence de retours est elle-même un signal — l'invitation alpha seule, sans matériel d'accompagnement structuré, n'a pas suffi à enclencher un engagement. L'auteur reste l'unique utilisateur actif depuis fin février 2026. La présentation AQPC du 3 juin 2026 (Cégep de Drummondville) vise à amorcer la première vague significative d'expérimentateurs accompagnés, en vue d'une phase plus structurée à l'automne 2026 (allocation cégep). Le quota Cloudflare de 50 utilisateurs est actuellement saturé ; il devra être surveillé pour la prochaine vague (options : upgrade payant Cloudflare, ou basculement vers une politique « domaine de confiance »).

---

## Conséquences

### Positives

- **Délégation complète de l'authentification** à un fournisseur spécialisé. Pas de schéma de mots de passe à concevoir et maintenir.
- **Coût zéro** sur la formule Cloudflare gratuite tant qu'on reste en deçà des limites (50 utilisateurs actifs).
- **Logs d'accès** centralisés (utiles pour la phase expérimentateurs).
- **Pas d'impact sur le code applicatif** : l'app continue de fonctionner localement en `file://` sans aucune adaptation.
- **Compatible avec la posture Loi 25** : l'identité de l'utilisateur reste chez Cloudflare ; les données pédagogiques restent côté navigateur. Aucune corrélation identité ↔ contenu pédagogique côté serveur.

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

**Révision 28 mai 2026 — retrait du Cloudflare Access**

Décision actée par Grégoire le 28 mai 2026 PM (J−6 avant AQPC) : le
Cloudflare Access est retiré, l'application `app.codexnumeris.org`
devient publiquement accessible sans authentification.

**Motivations** :
- **Préparation AQPC** : permettre aux visiteurs de la conférence du
  3 juin 2026 de tester l'application sans procédure d'inscription
  préalable.
- **Friction technique observée** : le challenge bot Cloudflare Bot
  Management bloquait certains clients non-browser et risquait de
  bloquer des appareils anciens / réseaux institutionnels stricts.
- **Saturation du quota gratuit** : 50 utilisateurs maximum, dont 47
  postes encore disponibles, mais Grégoire choisit de libérer toute
  la liste plutôt que de la gérer.
- **Constat d'usage alpha** : la phase janvier-mai 2026 a confirmé que
  la liste blanche seule, sans accompagnement structuré, ne suffit pas
  à enclencher un engagement. L'AQPC du 3 juin est la première vraie
  amorce d'une vague significative.

**Conséquences acceptées** :
- **Perte des logs d'accès individuels** par identité courriel. Les
  logs de janvier-mai 2026 avaient déjà été purgés automatiquement
  par Cloudflare (rétention 24 h sur plan gratuit) — la perte
  prospective est l'élément nouveau.
- **Plus de base de consentement explicite Loi 25** par liste blanche.
  `PRIVACY.md` (§3.3, §6, §7) doit être révisé séparément — inscrit
  au BACKLOG comme `#298`.
- **Voûte future** (cf. §Contexte) devra avoir son propre contrôle
  d'accès au niveau applicatif si elle est implémentée — ce qui
  était déjà la posture initiale (l'ADR-008 ne couvrait pas la Voûte
  par sa politique).
- **Reposture de sécurité** : l'application reste 100 % hors-ligne par
  conception (ADR-003). Aucune donnée pédagogique ne transite par
  Cloudflare ni Netlify. Le risque résiduel est limité à : (i) scraping
  des assets statiques publics, (ii) DoS absorbable par le CDN
  Cloudflare, (iii) image / réputation (n'importe qui peut maintenant
  prendre des captures d'écran et publier).

**Décision réversible** : la procédure documentée dans DEPLOY.md §3 (en
version 1.0 puis conservée en historique en version 1.1) reste valide
pour remettre Cloudflare Access en place en quelques minutes si une
des conséquences acceptées devient bloquante.

**Statut applicatif** : aucun changement de code. Le contrat reste « app
servie telle quelle depuis Netlify, derrière DNS Cloudflare proxy
orange » ; seule la couche Access intermédiaire est retirée.

---

**Révision 14 mai 2026** (initiale) : la première rédaction de cet ADR (commit `d571d90`) supposait à tort que Cloudflare Access était au statut « Proposé, implémentation à venir juin 2026 ». Le sous-audit 4.4 Reproductibilité du déploiement (commit suivant) a confirmé que Cloudflare Access est en production depuis janvier 2026 (Beta 95). Le statut, la date originale et les caractéristiques ont été corrigés. Le « juin 2026 » du `docs/CALENDRIER.md` désigne **l'ouverture à un public plus large**, pas le démarrage du déploiement.

**Révision post-audit (mai 2026)** : la description de l'usage en production présentait initialement le brouillon d'invitations `docs/MESSAGES_ENSEIGNANTS_H2026.md` comme une cohorte active de testeurs (« Bruno V., Olivier L., autres l'utilisent activement »). En réalité, ce brouillon de janvier 2026 visait environ 10 collègues ; l'usage effectif a été limité à quelques contacts alpha entre janvier et fin février 2026. Depuis fin février 2026, l'application n'a qu'un seul utilisateur actif : son auteur. La phase visée par l'AQPC du 3 juin 2026 est la **première** vague significative d'expérimentateurs, pas une seconde. Les sections « Contexte », « Décision » et « Statut » ont été reformulées en conséquence.

À réviser si :
- Le quota de 50 utilisateurs Cloudflare gratuit est atteint (upgrade payant ou changement de politique).
- La Voûte impose des contraintes d'identité plus fortes (revenir sur les politiques d'accès).
- Le cégep officialise une politique d'accès institutionnelle (réviser pour intégrer CAS).

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).

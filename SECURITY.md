# Politique de sécurité — Labo Codex

> **Version** : 1.0 (25 mai 2026)
> **Responsable** : Grégoire Bédard, Cégep de Drummondville
> **Documents apparentés** : [`PRIVACY.md`](PRIVACY.md) (confidentialité Loi 25),
> [`INCIDENTS.md`](INCIDENTS.md) (registre des incidents survenus),
> [`DEPLOY.md`](DEPLOY.md) (chaîne de déploiement)

---

## 1. Portée

Cette politique couvre la **divulgation responsable de vulnérabilités techniques**
dans le code source et l'infrastructure publique de Labo Codex.

Sont concernés :

- Le code de l'application web : `index.html`, `js/**`, `css/**`, `styles.css`,
  `libs/**` (8 librairies vendored).
- L'instance publique hébergée à `https://app.codexnumeris.org` (Netlify +
  Cloudflare Access).
- La chaîne de déploiement documentée dans [`DEPLOY.md`](DEPLOY.md).
- Les rapports de bug archivés (`localStorage` côté client) si une vulnérabilité
  permet leur exfiltration sans consentement.

Ne sont **pas** couverts ici :

| Hors scope | À signaler ailleurs |
|---|---|
| Bug fonctionnel sans impact sécurité | [GitHub Issues](https://github.com/bedardg71-codexnumeris/Monitorage_v6/issues) |
| Incident de confidentialité survenu (atteinte réelle) | Procédure dans [`INCIDENTS.md`](INCIDENTS.md) §3 |
| Question sur la confidentialité des données | Voir [`PRIVACY.md`](PRIVACY.md) ou écrire à <labo@codexnumeris.org> |
| Vulnérabilité dans une dépendance tierce (Chart.js, jsPDF, etc.) | Signaler en amont à l'éditeur, m'informer en parallèle |

---

## 2. Versions supportées

Labo Codex est en développement actif. La **version courante** (Beta affichée
dans `version.json`) est seule supportée pour les correctifs de sécurité.

| Version | Statut sécurité |
|---|---|
| Beta courante (≥ 99.50) | ✅ Correctifs appliqués |
| Beta < 99.50 | ❌ Mettre à jour vers la version courante |

Aucune branche de maintenance n'est tenue pour les versions antérieures —
les correctifs sont apportés sur `main` et publiés via la release suivante.

---

## 3. Comment signaler une vulnérabilité

**Canal privé attendu pour toute divulgation initiale.** Ne pas ouvrir d'issue
publique GitHub tant que le correctif n'est pas publié.

### 3.1 Canal recommandé — GitHub Security Advisories

Utilisez le formulaire « Report a vulnerability » de l'onglet **Security** du
dépôt : <https://github.com/bedardg71-codexnumeris/Monitorage_v6/security/advisories/new>.

C'est le canal préférentiel : le signalement reste privé, le suivi est traçable,
et un éventuel CVE peut être attribué automatiquement.

### 3.2 Canal de secours — courriel

Si GitHub Security Advisories n'est pas accessible, écrivez à
<labo@codexnumeris.org> avec le sujet `[SECURITY] <résumé court>`.

### 3.3 Informations à fournir

- Description technique de la vulnérabilité (composant, fichier, ligne si possible).
- Étapes de reproduction (idéalement un *proof of concept* minimal).
- Impact estimé : confidentialité, intégrité, disponibilité — qui est affecté
  (auteur seul, utilisateurs invités, étudiants dont les données transitent
  par un poste compromis, etc.).
- Conditions de déclenchement (configuration, navigateur, accès requis).
- Votre nom ou pseudonyme pour les remerciements éventuels (optionnel).

---

## 4. Délais de réponse

Labo Codex est maintenu par **une seule personne** à temps partiel. Les délais
indiqués ci-dessous sont des engagements de moyens, pas de résultat.

| Étape | Délai cible |
|---|---|
| Accusé de réception | **72 h** (jours ouvrables) |
| Évaluation initiale (criticité, scope, plan d'action) | **7 jours** |
| Correctif disponible (Critique / Élevée) | **30 jours** |
| Correctif disponible (Moyenne / Faible) | Prochaine release majeure |
| Divulgation publique coordonnée | Après publication du correctif, en concertation |

Si un délai ne peut être tenu, vous serez informé de l'écart et de l'échéance
révisée. Les périodes de congés scolaires (été, hiver) peuvent allonger les
délais — j'en avertirai en accusé de réception.

---

## 5. Processus de divulgation responsable

1. Vous signalez la vulnérabilité par un des canaux du §3.
2. Je confirme la réception, qualifie la criticité, et propose un plan d'action.
3. Je développe le correctif sur une branche privée si la vulnérabilité est
   exploitable. Sinon, en clair sur `main` avec mention dans le message de commit.
4. Le correctif est publié dans la release suivante avec une note dans le
   changelog (`js/changelog-data.js`) sans détails exploitables.
5. Après un délai raisonnable (typiquement 30 jours post-publication),
   les détails techniques peuvent être publiés via GitHub Security Advisory.
6. Si l'incident a touché des données personnelles, la procédure
   [`INCIDENTS.md`](INCIDENTS.md) §3 prend le relais en parallèle (notification
   CAI le cas échéant, communication aux personnes affectées).

---

## 6. Modèle de menace — résumé

Labo Codex tourne **100 % côté client** (navigateur), aucun serveur applicatif
n'est exposé. La surface d'attaque visible publiquement se limite à :

| Surface | Mécanisme de protection |
|---|---|
| Site statique sur Netlify | HTTPS forcé, CSP `script-src 'self'`, en-têtes durcis via `netlify.toml` |
| Contrôle d'accès | Cloudflare Access (Zero Trust, OTP par email) |
| Données locales | Reste sur la machine de l'utilisateur (IndexedDB + localStorage + FileVault au repos pour macOS) |
| Imports utilisateur (ZIP, images, PDF) | Validation magic bytes + `validerZipSecurite` (taille, path traversal) |
| Données utilisateur dans le DOM | `echapperHtml()` obligatoire avant `innerHTML` — vérifié par `tests/unit/lint-securite.test.js` |
| Pas d'exécution dynamique | `eval()` et `new Function()` interdits ; CSP les bloque |

Les vecteurs principaux à examiner en priorité :

- **XSS stockée** : noms d'étudiants, titres de productions, rétroactions
  textuelles affichées sans échappement.
- **Path traversal** dans les imports ZIP (codex data, réserve).
- **Compromission du pipeline de déploiement** (GitHub → Netlify → Cloudflare) —
  voir [`DEPLOY.md`](DEPLOY.md) §6.
- **Fuite de données via rapports de bug archivés** (`rapportsBugArchives`,
  audit PII fait le 22 mai 2026, seuil 50 → 20 entrées).

Les détails complets du modèle de menace figurent dans
`audit/05-security/owasp-checklist.md` (sur la branche `audit/2026-mai`) et
dans `audit/reports/05-summary.md`.

---

## 7. Crédits et remerciements

Les contributeurs ayant signalé des vulnérabilités de manière responsable sont
listés ici par ordre chronologique (sauf demande de retrait).

| Date | Contributeur | Vulnérabilité (résumé) |
|---|---|---|
| *(aucune divulgation à ce jour)* | — | — |

---

## 8. Hors scope explicite

Les éléments suivants ne donnent **pas** lieu à divulgation responsable car ils
relèvent d'un fonctionnement attendu ou documenté :

- L'accès à la page d'accueil de l'instance publique : Cloudflare Access est le
  contrôle, pas la page elle-même.
- La présence du code source sur GitHub : le dépôt est volontairement public
  (transparence, double licence AGPL + CC BY-NC-SA).
- L'absence de chiffrement applicatif des données locales : la protection
  s'appuie sur le chiffrement au repos du système (FileVault macOS). Voir
  [`PRIVACY.md`](PRIVACY.md) §4 et `docs/securite/PROTECTION-DONNEES-CHIFFREMENT-REPOS.md`.
- Les en-têtes de sécurité documentés dans `netlify.toml` (CSP, HSTS,
  X-Content-Type-Options, etc.) — leur configuration est intentionnelle et auditée.

---

**Fin de la politique de sécurité.** Document à réviser annuellement ou à
chaque modification significative de la chaîne de déploiement.

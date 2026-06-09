# Modèle économique de la Voûte — analyse exploratoire

> **Date** : 9 mai 2026
> **Demandeur** : Grégoire
> **Cadre fourni** :
> - Ambition 2027-2028 : service centralisé multi-institutions (tu opères)
> - Capacité : avec partenaire institutionnel (cégep, AQPC)
> - Axe prioritaire : modèle économique freemium
> **Avertissement** : ce document est une analyse argumentée à partir d'informations limitées. Plusieurs chiffres sont des **ordres de grandeur**, pas des estimations vérifiées. Je signale au fil du texte ce qui est fait vs inférence.

---

## 1. Tension à résoudre d'abord

Tu as choisi trois choses qui, prises ensemble, créent une difficulté :

1. **« Service centralisé multi-institutions »** — tu opères, tu héberges, tu prends la responsabilité légale.
2. **« Avec partenaire institutionnel »** — un cégep ou l'AQPC entre dans la gouvernance. Ils cherchent stabilité, conformité, légitimité — pas un produit grand public en bêta.
3. **« Freemium »** — modèle d'acquisition qui suppose un volume d'utilisateurs final élevé pour rentabiliser, et une conversion gratuit→payant de l'ordre de 2 à 5%.

**Le freemium est un modèle B2C** (business-to-consumer). Il marche bien quand : (a) le marché est large, (b) la décision d'achat est individuelle, (c) le coût marginal par utilisateur est faible. Obsidian coche les trois cases — marché mondial du knowledge worker, achat à 4-8 USD/mois sur carte personnelle, infra de stockage qui scale linéairement.

**Ton contexte est un B2B institutionnel** (business-to-business). Le marché est étroit (enseignants québécois en cégep), la décision d'achat passe par des comités, le partenaire institutionnel est ton premier client et veut un cadre formel. Le freemium pur ne s'aligne pas.

**Ce qui ne veut pas dire** que tu ne peux pas avoir une couche gratuite. Mais le moteur économique principal, dans ton cas, ne sera probablement pas la conversion individuelle. Voyons les options.

---

## 2. Le marché québécois — ordres de grandeur

> **Source** : ce qui suit est estimé à partir de connaissances générales. À vérifier auprès de Statistique Québec, du MEQ, de la FNEEQ-CSN, de la FEC-CSQ ou de l'AQPC.

- **Cégeps publics au Québec** : ~48 cégeps + écoles spécialisées.
- **Enseignants au cégep** : ~20 000–22 000 (toutes disciplines).
- **Enseignants en philosophie / formation générale** (cible directe vu ton profil) : peut-être 1 500–2 500.
- **Enseignants au secondaire qui pourraient être intéressés** (si tu élargis) : ~50 000.
- **Marché francophone hors Québec** (France, Belgique, Suisse) : intéressant en théorie, mais le système éducatif et les pratiques d'évaluation diffèrent. Adoption moins évidente sans adaptation.

**Ce que ça implique** : si tu vises ~5% d'adoption sur le marché cégep avec 2-3% de conversion freemium, tu obtiens **20-30 utilisateurs payants**. Avec 100 USD/an chacun, ça fait **2 000–3 000 USD/an** de revenu. Insuffisant pour couvrir tes coûts.

Pour que le freemium B2C fonctionne, il faudrait soit un marché beaucoup plus large (élargissement secondaire + francophonie), soit une prise institutionnelle qui paye pour ses enseignants.

---

## 3. Trois modèles à comparer

### Modèle A — Freemium B2C pur (Obsidian-style)

**Comment ça marche** : tout le monde télécharge l'app gratuitement. Utilisation locale gratuite à vie. Sync entre appareils + accès Voûte = abonnement individuel à 4-8 USD/mois.

**Pour Codex, le tier gratuit serait** :
- App complète, stockage local, import-export par fichier
- Lecture seule de la Voûte publique (consultation des configurations CC BY-NC-SA partagées)

**Le tier payant ajouterait** :
- Sync E2EE Mac ↔ iPad
- Dépôt dans la Voûte (partage)
- Backups cloud automatiques
- Support prioritaire

**Tarification de référence** :
- Obsidian Sync : 4 USD/mois (5 Go) ou 8 USD/mois (50 Go, E2EE)
- Notion : 8-15 USD/mois pro
- Roam Research : 13.75 USD/mois
- iCloud+ (référence québécoise) : 1.29 CAD à 12.99 CAD/mois

Pour Codex, je proposerais 5-7 CAD/mois ou 50-70 CAD/an. Plus bas que Notion/Roam (Codex est plus spécialisé), pas trop bas pour ne pas signaler « gratuit déguisé ».

**Avantages** : prévisibilité du revenu, autonomie (pas dépendant d'un cégep), modèle prouvé.

**Inconvénients dans ton cas** :
- Marché trop étroit pour que le volume rende l'opération viable (cf. section 2).
- Cycle de revenu lent (chaque utilisateur = 5 USD/mois, il faut convaincre individuellement).
- Le partenaire institutionnel n'a pas de rôle clair dans ce modèle. Il peut endosser, mais pourquoi ?
- Adoption B2C dans l'éducation québécoise est historiquement difficile (beaucoup de profs paient peu pour leurs outils, attendent que l'institution paye).

**Volume seuil de viabilité** (très grossier) : 500–1 000 utilisateurs payants à 50 CAD/an = 25 000–50 000 CAD/an. Couvre l'infra (~6 000 CAD/an) + un peu de support, mais pas un développeur à temps plein.

### Modèle B — Licence institutionnelle (B2B classique)

**Comment ça marche** : un cégep ou un département paye une licence pour ses enseignants. Tarification par poste ou forfait département. Les enseignants utilisent gratuitement parce que leur employeur a payé.

**Pour Codex, ça pourrait être** :
- 500–2 000 CAD/an par département de philosophie (~5-15 enseignants)
- 5 000–15 000 CAD/an par cégep (toutes disciplines, ~50-150 enseignants)
- Ou « par siège actif » : 30-50 CAD/an/poste

**Avantages** :
- Cycle d'achat plus stable (contrats annuels).
- Le partenaire institutionnel devient ton premier client et ton sponsor. Le cégep partenaire (ex. Cégep Édouard-Montpetit, Vieux-Montréal, etc.) achète, devient référence, ouvre la porte aux autres.
- Plus haut revenu unitaire (un cégep = 50-150 enseignants).
- Conformité Loi 25 plus claire (un contrat institutionnel, pas une floraison de comptes individuels).

**Inconvénients** :
- Cycle de vente long : 6-18 mois entre premier contact et signature. Procédures d'achat institutionnel.
- Hétérogénéité : chaque cégep a sa propre IT, sa propre négociation. Pas scalable comme une carte de crédit.
- Tu deviens dépendant de quelques gros clients. Si un cégep résilie, tu perds 10-20% du revenu.
- Saisonnalité : les renouvellements et budgets se concentrent en juin-août. Risque de creux de trésorerie.

**Volume seuil de viabilité** : 5 cégeps clients à 8 000 CAD/an = 40 000 CAD/an. Plus rapide à atteindre que 500 utilisateurs B2C, mais plus risqué (concentration).

### Modèle C — Hybride (recommandé pour ton cas)

**Comment ça marche** : tier gratuit B2C + tier payant individuel + licences institutionnelles + dépôts publics dans la Voûte.

**Structure proposée** :

| Tier | Public | Tarif | Contenu |
|------|--------|-------|---------|
| **Local libre** | Tout enseignant | Gratuit | App complète, stockage local, import-export, consultation Voûte publique (configs CC BY-NC-SA) |
| **Compte personnel** | Enseignant individuel | 5-7 CAD/mois ou 50 CAD/an | Sync E2EE Mac/iPad, dépôt Voûte, backups cloud, support |
| **Licence département** | Département (5-15 prof.) | 600-1 500 CAD/an | Tout le tier personnel + Voûte privée du département + admin léger |
| **Licence cégep** | Cégep complet | 4 000-12 000 CAD/an | Tout + intégration Office 365 / Microsoft Entra (ex-Azure AD) ou Omnivox + responsabilité Loi 25 partagée |

**Voûte publique vs Voûte privée institutionnelle** :
- **Voûte publique** : ressources sous CC BY-NC-SA, consultables par tous, dépôt réservé aux comptes payants ou aux institutions. C'est le commun pédagogique.
- **Voûte privée institutionnelle** : un département peut avoir un espace fermé pour partager ses grilles internes (qui ne sont pas encore prêtes pour la diffusion publique).

**Pourquoi je recommande ce modèle pour ton cas** :

1. Tu n'es pas obligé de choisir tout de suite. Tu peux démarrer en mode B2C (modèle A), et ajouter les licences institutionnelles quand le partenaire est prêt à payer. C'est ce qu'a fait Notion (B2C → B2B Enterprise).
2. Le partenaire institutionnel peut d'abord utiliser le tier gratuit pour tester, puis basculer en licence département quand la valeur est démontrée. Ça limite ton risque commercial.
3. Tu gardes une couche communautaire vivante (Voûte publique CC) qui fait du marketing organique.
4. Les enseignants en transition (de leur cégep non-client vers leur cégep client) ne perdent pas leurs données — leur compte personnel persiste.

**Inconvénients du modèle hybride** :
- Plus complexe à expliquer et à facturer (3 tiers + variantes).
- Plus complexe à coder (gestion des comptes, des organisations, des ressources publiques vs privées).
- Risque de cannibalisation (un cégep peut refuser de payer en disant « nos profs achètent individuellement »). À mitiger par des fonctionnalités vraiment utiles seulement au tier institutionnel (admin, audit, conformité Loi 25).

---

## 4. Coûts d'opération — ordres de grandeur

> Tous ces chiffres sont des estimations à valider. Devis réels nécessaires avant d'engager quoi que ce soit.

**Infrastructure technique** :
- Stockage S3-class (AWS / Wasabi / Backblaze B2 / OVH) : 0.005-0.025 USD/Go/mois. Pour 1 000 utilisateurs avec 1 Go chacun = 5-25 USD/mois.
- Bande passante egress : 0.01-0.09 USD/Go. Pour 1 000 utilisateurs synchronisant 100 Mo/semaine = 4-40 USD/mois.
- Compute (serveur API minimal) : 20-100 USD/mois (DigitalOcean, Hetzner, OVH).
- Base de données managée : 15-50 USD/mois.
- Monitoring (Sentry, BetterStack) : 25-50 USD/mois.
- Authentification (Clerk, Auth0, ou self-host avec Authelia) : 0-99 USD/mois selon volume.
- Domaine, certificats, courriel transactionnel : 20-50 USD/mois.
- **Total infra mensuelle** : 100-400 USD/mois selon échelle, soit 1 200-5 000 USD/an.

**Coûts non-techniques** :
- Comptabilité : ~1 500-3 000 CAD/an (comptable québécois, OBNL ou société par actions).
- Juridique de base : ~1 000-3 000 CAD au démarrage (CGU, politique de confidentialité, conformité Loi 25), puis ~500 CAD/an.
- Assurance responsabilité civile professionnelle : 500-1 500 CAD/an.
- TVQ + TPS si tu vends en ton nom (inscription obligatoire au-dessus de 30 000 CAD/an).
- Si OBNL : frais d'incorporation (~250 CAD), assemblées annuelles, vérification (ou mission d'examen) si exigée.
- Marketing : conférences AQPC (frais d'inscription + déplacement) ~500-1 500 CAD/an.

**Coût caché majeur : ton temps**.
- Support utilisateur : 2-5 heures/semaine au démarrage, qui peut passer à 10-20 heures/semaine si la base grossit. Sans personne pour relayer, ça mange ton temps de dev.
- Conformité Loi 25 : audit annuel, gestion des demandes d'accès des étudiants/enseignants, réponse à incidents. C'est non négociable, ça prend du temps.

**Total annuel ordre de grandeur** : 5 000-15 000 CAD/an de coûts directs, plus ton temps. À couvrir avant de te verser un salaire.

---

## 5. Le rôle du partenaire institutionnel

C'est probablement le levier le plus important de ton modèle, et il est sous-discuté.

### Ce qu'un partenaire cégep peut t'apporter (bien plus qu'un client)

- **Légitimité** : « projet endossé par le Cégep X » fait toute la différence dans une vente à un autre cégep.
- **Hébergement physique ou logique** : si le cégep accepte d'héberger ou de cosigner sur le Cloud institutionnel (ex. infrastructure du Cegep@Distance, ou via la Société GRICS), tu résous une partie du problème Loi 25 et tu sors d'une dépendance AWS/OVH.
- **Validation pédagogique** : un département de philosophie qui utilise Codex en pilote te donne un cas d'usage publiable.
- **Subventions** : le Programme d'aide à la recherche sur l'enseignement et l'apprentissage (PAREA, ministère), le Fonds de recherche du Québec, ou Mitacs (si université dans le portrait). Le partenaire institutionnel est souvent éligible à ces fonds, toi pas seul.
- **Conformité partagée** : le cégep partenaire peut prendre la responsabilité légale de la conformité Loi 25 sur sa propre instance, te déchargeant du risque le plus lourd.
- **Distribution** : un cégep partenaire peut faire connaître Codex à ses 47 collègues du réseau via la commission des affaires pédagogiques de la Fédération des cégeps.

### Ce que le partenaire voudra en retour

Probablement (à valider) :
- Un siège dans la gouvernance (conseil d'administration si OBNL, ou comité consultatif).
- L'accès au code (clause de continuité — si tu arrêtes, le code reste utilisable, idéalement open source ou en escrow).
- Une licence pour ses enseignants à coût réduit ou gratuite.
- La reconnaissance de son rôle dans toute communication publique.
- Un alignement avec ses propres priorités stratégiques (innovation pédagogique, intégrité académique, FGC, etc.).

### Forme juridique à considérer

- **Société par actions** : tu gardes le contrôle, mais le partenaire est juste un client. Modèle SaaS classique.
- **OBNL** : structure adaptée à l'éducation, accès aux subventions, gouvernance partagée avec le partenaire. Tu n'es plus propriétaire mais salarié/contracté.
- **Coopérative de solidarité** : modèle très québécois où enseignants utilisateurs, institutions partenaires et toi êtes tous membres. Plus complexe à monter mais aligné avec l'éthique CC BY-NC-SA.
- **Statut de pigiste / consultant** : tu factures à l'heure le partenaire pour développer Codex à sa demande. Pas de modèle freemium dans ce cas, mais cycle de financement plus simple. Modèle « code de service ».

> **Je signale** : choisir la bonne structure est une décision majeure qui mérite l'avis d'un comptable et d'un avocat québécois. Mes notes ci-dessus ne sont qu'un point de départ.

---

## 6. Recommandation préliminaire

Compte tenu de ton contexte (marché québécois étroit, partenaire institutionnel, un seul développeur, ambition multi-institutions, sensibilité Loi 25), voici ce que j'ai à proposer en hiérarchie :

**1. Phase 0 (maintenant — fin 2026)** : reste en mode local, fais évoluer la Voûte version « échange de fichiers » entre testeurs. Pas de serveur. Continue à tester l'écosystème Voûte sur la base actuelle. Identifie ton partenaire institutionnel formellement (Cégep X, AQPC, ou les deux).

**2. Phase 1 (2027)** : pilote payant avec ton partenaire institutionnel — licence département à 1 000-2 000 CAD/an pour 5-15 enseignants. Pas de freemium grand public encore. Tu construis la sync (E2EE), tu codes l'admin minimal, tu valides la conformité Loi 25 sur un seul client. Subvention PAREA ou Mitacs en parallèle si possible.

**3. Phase 2 (2028)** : ouverture freemium B2C en parallèle. Le tier gratuit local est déjà au point. Ajout du tier payant individuel (5-7 CAD/mois). Le pilote institutionnel devient référence. Démarchage d'autres cégeps avec licences département/cégep.

**4. Phase 3 (2029+)** : si la traction le justifie, structure formelle (OBNL ou coopérative), équipe minimale (toi + 1 personne support / 1 personne dev), élargissement au secondaire ou à la francophonie.

**Ce que je ne te recommande pas** : démarrer directement en freemium B2C ouvert. Le marché québécois ne supportera pas le volume nécessaire pour rentabiliser l'infra et ton temps. Tu vas brûler de l'énergie sur le support de centaines d'utilisateurs gratuits pour 20 conversions à 50 CAD/an.

**Le pivot conceptuel** : pense à la Voûte comme **un bien commun pédagogique financé par les institutions**, plutôt que comme un produit SaaS B2C. Le freemium est un complément, pas le moteur.

---

## 7. Ce que je ne sais pas / à valider

- Volume exact d'enseignants par discipline et par cégep (chiffres MEQ, FNEEQ-CSN, FEC-CSQ).
- Pratiques d'achat IT actuelles dans les cégeps : qui décide, sur quel budget, à quels cycles.
- Solutions concurrentes effectivement utilisées : Léa, Omnivox, Moodle, ColNet, Studyo, Plickers, et leur tarification.
- Programmes de subvention disponibles pour ce type d'outil (PAREA, FRQ, Mitacs, Programme NovaScience).
- Cadre légal exact de la Loi 25 pour un service éducatif tiers (le Commissariat à l'accès à l'information du Québec a publié des guides — à consulter).
- Existence de cadres de collaboration formels au sein de la Fédération des cégeps pour des outils logiciels mutualisés.
- Modèles québécois précédents qui ont marché ou échoué (ex : Carnet TIC, Profweb / Eductive, plateformes du Centre collégial de développement de matériel didactique — CCDMD).

> Plusieurs de ces points peuvent se documenter rapidement par recherche. Je peux les creuser si tu veux qu'on continue.

---

## 8. Décisions à prendre

Avant d'aller plus loin :

1. **Confirmer ou infirmer le pivot vers B2B institutionnel** comme moteur principal (avec freemium en complément).
2. **Identifier le partenaire institutionnel formel**. Cégep ? Association (AQPC, Fédération des cégeps) ? Centre de recherche ?
3. **Choisir une forme juridique cible** : société par actions, OBNL, coopérative, contrat de service. Avis comptable + juridique requis.
4. **Cadrer Phase 1** : qu'est-ce qui doit être livré pour que le pilote institutionnel signe ? Sync E2EE + admin + conformité Loi 25 sont probablement le minimum.
5. **Explorer les sources de financement non-clientes** : PAREA, FRQ, Mitacs, subventions pour innovation pédagogique. Ça peut couvrir Phase 1 sans dépendre des revenus.

# Refermage de l'accès public — fiche opératoire du 1er septembre 2026

**Item** : #427 · **Dépendance** : #508 (l'avis d'accueil, daté du 1er septembre)
**Préparée le** : 26 août 2026 · **Décisions de Grégoire** : ce même jour (voir §1)
**Sources** : `docs/adr/008-cloudflare-access.md`, `DEPLOY.md` §3.6 et §4, `SECURITY.md`

> **Rien à construire.** La configuration Cloudflare Access n'a jamais été défaite : le DNS reste en
> proxy orange, seule la *policy* est désactivée. Le refermage est une opération de quelques minutes
> dans le tableau de bord Zero Trust — plus une révision d'ADR, qui est le vrai travail.

---

## §1 · Ce qui est décidé, et ce qui ne l'est pas

| | Décision | Verdict du 26 août |
|---|---|---|
| Motif | Pourquoi refermer, alors que le §3.6 n'a pas prévu ce cas | **Contrôle d'accès voulu par Grégoire** — un cinquième motif, à inscrire dans l'ADR |
| Quota | 50 sièges gratuits, déjà saturés au printemps | **Sélection** : la CoP et les personnes actives d'abord ; les autres sur demande |
| Mesure d'usage | Access ne dit pas qui travaille | **Hors sujet, acté** : filtrer l'entrée suffit. Le second besoin n'est pas poursuivi |
| Liste nominale | Qui exactement | ⏳ **À REMPLIR PAR GRÉGOIRE** (§3) |

⚠ **Ce que ce refermage ne donnera pas, et qui est assumé.** La liste blanche contrôle l'ENTRÉE.
Deux faits du dossier : la phase janvier-mai a vu ~50 personnes invitées dont « aucune n'a renvoyé de
feedback ou de rapport de bug, et aucune n'est revenue après l'expiration de son accès » ; et les
logs Cloudflare sont « purgés à 24 h sur plan gratuit » et « ne produisent rien d'actionnable ».
S'ajoute une contrainte d'architecture : l'application est locale et hors-ligne, donc l'usage réel
n'est observable par personne. **Décision du 26 août : c'est accepté, le filtrage suffit.** Écrit ici
pour qu'on ne redécouvre pas la limite après coup en la prenant pour un défaut.

---

## §2 · Avant le 1er septembre — ce que Grégoire seul peut faire

| | Geste | Où |
|---|---|---|
| 2.1 | **Dresser la liste** des personnes à inviter (§3), en visant **moins de 50** | — |
| 2.2 | Relever le **nom de la team Zero Trust**, le **nom de l'application** et le **nom de la policy** | Tableau de bord Cloudflare Zero Trust |
| 2.3 | Me transmettre ces trois noms : ils remplacent les `[À COMPLÉTER]` de `DEPLOY.md` (lignes 269, 277, 293) | — |

---

## §3 · La liste blanche — à remplir

**Règle retenue** : la CoP et les personnes actives d'abord. Les autres obtiennent l'accès sur
demande, ce qui est un geste d'une minute (§4.1 de `DEPLOY.md`) et remplace utilement une invitation
massive dont le printemps a montré le rendement.

```
# Une adresse par ligne. Viser < 50.
# Communauté de pratique :

# Personnes actives (retours, bugs signalés, usage constaté) :

# Institutionnel / partenaires :

```

⚠ **Compter avant de coller.** Le plan gratuit s'arrête à 50 ; au-delà, Cloudflare refuse l'ajout
sans prévenir en amont de la liste.

---

## §4 · Le 1er septembre — la séquence

| | Geste | Attendu |
|---|---|---|
| 4.1 | `Access → Applications → [app] → Policies → [policy]` : **réactiver** la policy | La policy passe à l'état actif |
| 4.2 | Règle `Include → Emails` : coller la liste du §3 | Le compte affiché est celui de ta liste |
| 4.3 | **Se déconnecter et ouvrir `app.codexnumeris.org` dans une fenêtre privée** | Un code OTP est demandé par courriel |
| 4.4 | Entrer le code reçu | L'application s'ouvre |
| 4.5 | Essayer avec une adresse **absente** de la liste | L'accès est refusé |
| 4.6 | Envoyer le courriel d'invitation (§5) aux personnes de la liste | — |

⚠ **4.3 et 4.5 ne sont pas facultatives.** Réactiver une policy sans vérifier qu'elle laisse passer
ET qu'elle bloque, c'est croire un tableau de bord sur parole. Le refermage de janvier a fonctionné ;
rien ne garantit qu'une policy dormante depuis trois mois se réveille intacte.

---

## §5 · Le courriel d'invitation

> **Objet** : Ton accès à Labo Codex
>
> Bonjour,
>
> Labo Codex demande de nouveau une identification pour y accéder. Rien ne change dans
> l'application elle-même — c'est la porte d'entrée qui redevient nominative.
>
> **L'adresse** : app.codexnumeris.org
>
> **Comment ça marche** : tu entres ton courriel, tu reçois un code à usage unique, tu le colles.
> C'est à refaire à chaque session, et il n'y a pas de mot de passe à retenir.
>
> **Tes données ne bougent pas.** Elles restent sur ton appareil, comme avant : Labo Codex
> fonctionne hors ligne et ne transmet rien. L'identification protège l'accès au site, pas
> tes contenus — ceux-là ne sont jamais partis de chez toi.
> La politique de confidentialité est ici : [lien vers PRIVACY.md]
>
> Si le code n'arrive pas, regarde dans les indésirables — et écris-moi, je vérifie la liste.
>
> Grégoire

⚠ **Le paragraphe sur les données n'est pas une formule de politesse** : c'est la question que
posera la moitié des destinataires, et y répondre avant qu'elle soit posée évite une inquiétude
qu'un silence installerait.

---

## §6 · Après le geste — à consigner le jour même

Le §3.6 de `DEPLOY.md` l'exige, et c'est ce qui manquait aux refermages précédents :

- [ ] **date effective** du refermage ;
- [ ] **raison déclenchante** (le motif de Grégoire, désormais inscrit à l'ADR) ;
- [ ] **taille de la liste** blanche reconstituée ;
- [ ] **arbitrage sur le quota** (sélection retenue, pas d'upgrade) ;
- [ ] les **trois placeholders** de `DEPLOY.md` remplis ;
- [ ] `ADR-008`, `DEPLOY.md` et `SECURITY.md` révisés ;
- [ ] **#508** : le paragraphe d'accueil réécrit au présent (le texte est prêt, cf. §7).

---

## §7 · #508 — le paragraphe d'accueil, dans les deux cas

**Si le refermage a lieu le 1er** (texte prêt à poser dans `js/accueil.js`) :

> L'identification est requise pour accéder à Labo Codex. Tu reçois un code par courriel à chaque
> session ; tes données, elles, restent sur ton appareil.

**Si le refermage n'a PAS lieu le 1er** : retirer le paragraphe, purement et simplement. Le reposer
quand la date sera tenable. ⚠ **Reporter la phrase sans reporter le dispositif est la seule issue à
éviter** : elle apprendrait au lecteur à ne plus lire cette zone de la page — celle où vivent « Par
où commencer ? » et l'invitation à la CoP.

---

## §8 · Ce que je n'ai pas pu vérifier

1. **Rien de tout ceci n'a été essayé.** Je n'ai pas accès à ton tableau de bord Cloudflare, et je
   n'ai donc pas pu confirmer que la policy dormante est intacte ni que le DNS est bien en proxy
   orange. Le dossier l'affirme ; le §4.3 et le §4.5 sont là pour le vérifier avant d'y croire.
2. **Le quota de 50** est un chiffre de `DEPLOY.md` daté du 2 juin 2026. Les conditions du plan
   gratuit Cloudflare ont pu changer depuis — à confirmer sur place au moment du geste.
3. **La liste de la CoP** ne m'est pas connue. Le §3 est un cadre vide, et il le restera tant que tu
   ne l'auras pas rempli : c'est le seul point de ce dossier que personne ne peut préparer à ta place.

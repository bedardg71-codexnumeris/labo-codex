# Portes terrain — 12 septembre 2026 (Suivi › Interventions : rien n'est écrit avant « Enregistrer », lot 5 du cadrage 11, 1.139.0)

> **Version à l'écran attendue : `1.139.0`**, build `0912-1259` (lis-le en bas de page ; il n'est en ligne qu'une fois poussé).
> Couvre : « Planifier une intervention » (et « + Nouvelle rencontre », même formulaire) qui n'écrit plus rien avant
> « Enregistrer » ; la note d'un élève qui n'est plus dans le groupe, qui reste visible, grisée.
> **Sans porte, parce qu'une machine y répond** (règle 1 du skill, ta règle du 24 août) : les lettres du bilan avant / après
> (un 64,5 % est « D » dans le bilan comme dans la suggestion d'objectif, et bouger un seuil bouge les deux), « Annuler »
> qui ne demande rien et n'écrit rien, le code retiré — douze essais, treize fois cassés exprès, treize rouges.
> ⚠ La consigne de Cowork comptait cinq rangées, dont le bilan : il sort d'ici pour ce motif, et la rangée Rencontres
> entre, parce que l'orthopédagogue ouvre ce formulaire lundi.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.
>
> ✅ **RELEVÉE le 12 septembre 2026 à 15 h 03 (Toronto, `TZ=America/Toronto date`) — 6 sur 6, zéro échec, deux rangées sautées**, sur `1.139.0`
> (`origin/main` = `e29f734c`, en ligne). Les six vérifiées : le préalable, « Planifier » qui ne laisse rien (2.1a-b),
> « Enregistrer » qui écrit une fois et tient au rechargement (2.2a-b), la suppression de l'essai (2.3) — donc le
> parcours complet d'écriture, sur son groupe-cours réel, dans son navigateur. **Sautées, faute du cas** : 2.4 (le
> même geste côté Rencontres, sur un service) et 2.5 (la note d'un élève parti du groupe). Artefact « Porte terrain
> des Interventions » publié par Cowork à 14 h 55 ; relevé collé dans la conversation Cowork. Noté par Cowork à 15 h 05.
>
> ⚠ **Ce que cette porte ne prouve donc PAS, et qui reste dû** : le volet C (`#748`, la note grisée d'un élève parti)
> n'a été éprouvé que par la sentinelle — aucun écran réel ne l'a vu. Idem pour le formulaire de Rencontres sur un
> service, que **l'orthopédagogue ouvre lundi**. Les deux cas manquent chez Grégoire aujourd'hui ; sa règle du
> 6 septembre s'applique (pas de données fictives pour éprouver un geste à l'écran) : ils attendent un cas réel.
>
> ⚠ **À passer avant lundi** (réserve de Cowork, consigne § en-tête) : le lot change le moment où une intervention est
> écrite, dans le module que l'orthopédagogue ouvre lundi et la communauté de pratique mardi. Sinon, la livraison attend.

**Pourquoi cette liste est courte.** Le banc rejoue chaque geste sur un faux navigateur. Ce qu'il ne voit pas : ta vraie
base, dans ton vrai navigateur, au rechargement. C'est tout ce qui reste ici.

---

## §0 · Préalable — un geste

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** dans un **nouvel onglet** (pas un rechargement) et lis le numéro en bas de page | `1.139.0` — s'il dit `1.138.0`, la version n'est pas encore en ligne : attends une minute et rouvre |

---

## §1 · ⚠ Tes données — une intervention d'essai, créée puis supprimée de ta main

Les rangées 2.2 et 2.3 **écrivent une intervention nommée « Essai porte » dans ton groupe-cours, puis la suppriment**.
Rien d'autre n'est touché. Si tu ne veux rien écrire dans ton trimestre réel aujourd'hui, saute 2.2 et 2.3 : la rangée
2.1 n'écrit rien.

---

## §2 · Interface

### 2.1 · Planifier sans enregistrer ne laisse rien

**POURQUOI** — Avant, un clic sur « Planifier une intervention » inscrivait déjà l'intervention dans tes données ; si tu
changeais d'onglet sans enregistrer, elle disparaissait sans un mot, et une sauvegarde prise entre-temps la contenait.

| | Geste | Attendu |
|---|---|---|
| **2.1a** | `Suivi › Interventions` → « Planifier une intervention » → tape le titre « Essai porte » | le formulaire est ouvert, le titre tapé |
| **2.1b** | Sans cliquer « Enregistrer », va sur `Suivi › Liste des étudiant·es`, puis reviens sur `Suivi › Interventions` | **aucune** « Essai porte » dans la liste |

### 2.2 · Enregistrer écrit, une fois, et ça tient au rechargement  `⚠ Données`

| | Geste | Attendu |
|---|---|---|
| **2.2a** | « Planifier une intervention » → titre « Essai porte » → « Enregistrer » | la liste revient, « Essai porte » y est **une** fois |
| **2.2b** | Recharge la page (Cmd+R), reviens sur `Suivi › Interventions` | « Essai porte » est toujours là, **une** fois |

### 2.3 · Nettoyer l'essai  `⚠ Données`

| | Geste | Attendu |
|---|---|---|
| **2.3** | Sur « Essai porte » : le bouton de suppression → confirme | « Essai porte » a disparu de la liste |

### 2.4 · La même chose côté Rencontres — seulement si tu as un service d'orthopédagogie

**POURQUOI** — « + Nouvelle rencontre » ouvre le même formulaire ; c'est ce que l'orthopédagogue fera lundi.

| | Geste | Attendu |
|---|---|---|
| **2.4** | Sur ton service : `Suivi › Rencontres` → « + Nouvelle rencontre » → un titre → va sur un autre onglet de Suivi sans enregistrer → reviens sur `Rencontres` | **aucune** rencontre de ce titre dans la liste. Sans service : saute la rangée |

### 2.5 · La note d'un élève parti du groupe — seulement si tu as ce cas

**POURQUOI** — Avant, la note écrite pour un élève qui a quitté le groupe ne s'affichait plus, et le compteur « Notes
individuelles » la comptait quand même (#748). Ta décision du 11 septembre : elle reste, grisée.

| | Geste | Attendu |
|---|---|---|
| **2.5** | Dans `Suivi › Interventions`, une intervention qui porte une note pour un élève qui n'est plus dans ce groupe | sa note est là, en gris, avec son nom (ou son DA s'il n'est plus au trimestre) suivi de « (n'est plus dans le groupe) » ; le nombre à côté de « Notes individuelles » est le nombre de lignes affichées. Sans ce cas : saute la rangée |

---

## §3 · Décisions — ce ne sont pas des vérifications

| | Question | Ta réponse (écris-la) |
|---|---|---|
| **3.1** | Le titre de l'entrée 1.139 dans « Nouvelles » (tes collègues le liront). **Livré** : « Interventions : rien n'est écrit avant « Enregistrer » » (de Claude Code ; la consigne ne donnait que la phrase de l'item). ⚠ Relecture de Cowork (13 h 10) : sur un service, l'onglet « Interventions » n'existe plus depuis 1.138.0 — l'orthopédagogue lirait le nom d'un écran qu'elle n'a pas. **Proposition de Cowork** : « Planifier n'enregistre plus rien avant que tu cliques ». Tel quel, la proposition de Cowork, ou autre ? (Un autre titre part dans une version corrective.) | _______ |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Un vrai navigateur.** Tout est prouvé sur un faux navigateur (Vitest). Le verdict Playwright local, pris avant le push,
  ouvre le vrai `index.html` ; Safari et l'iPad, rien — mais ce lot ne touche ni mise en page ni style (la classe grise est
  celle de la Liste depuis le lot 2).
- **Labo › Données compte encore un vieux brouillon**, s'il en reste un en base d'avant ce lot : cet écran lit le tableau
  brut, alors que Suivi l'ignore. Aucun effacement d'office (écrire chez les gens remonte à toi) ; la consigne n'en
  demandait pas.
- **La pré-coche des critères en défi** à l'ouverture d'un brouillon : même condition qu'avant, pas d'essai qui la casse.
- **Ce que la mesure a corrigé de la consigne** : elle nommait un seuil `idme.etendu` qui n'existe pas ; la fonction qui
  convertit un pourcentage en lettre existait déjà, c'est elle que le bilan lit.

---

## §5 · Relevé

| Rangée | ✅ / ❌ / sautée | Note |
|---|---|---|
| 0.1 | ✅ | |
| 2.1a | ✅ | |
| 2.1b | ✅ | aucune « Essai porte » dans la liste — le défaut I-1 est clos à l'écran |
| 2.2a | ✅ | une seule fois |
| 2.2b | ✅ | tient au rechargement |
| 2.3 | ✅ | essai nettoyé, rien ne reste dans son trimestre |
| 2.4 | sautée | pas de service d'orthopédagogie chez lui aujourd'hui |
| 2.5 | sautée | pas d'élève parti du groupe avec une note |
| 3.1 | — | **tranché** : le titre livré reste. Grégoire, 15 h 10 : « c'est un choix » — un choix explicite, pas un silence. La réserve de Cowork (l'onglet « Interventions » n'existe plus sur un service) est donc vue et écartée. Close |

**Relevée le** : 12 septembre 2026, 15 h 03 (Toronto) · **Version lue en bas de page** : `1.139.0` · **Échecs → BACKLOG** : aucun

⮕ **Porte close, 6 sur 6, zéro échec.** Rien n'en sort vers le BACKLOG. Deux rangées sautées faute du cas — voir la
réserve de l'en-tête : le volet C et le formulaire de Rencontres sur un service n'ont pas été vus sur un écran réel.

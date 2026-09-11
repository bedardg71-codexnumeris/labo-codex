# Portes terrain — 11 septembre 2026 (l'ouverture de l'application, #825 temps 1, 1.130.2)

> **Version à l'écran attendue après déploiement : `1.130.2`** (le build est écrit par la release ; lis-le en bas de page).
> Couvre : le serveur ne demande plus au navigateur de revalider les deux cents scripts (`js/`) ni la feuille
> `css/accompagnement.css` à chaque ouverture (`netlify.toml`) ; trois fichiers qui échappaient aux jetons
> anti-cache en ont reçu un. `styles.css`, `index.html` et `version.json` restent redemandés (trois requêtes).
> **Rien ne change à l'écran. Rien n'écrit dans tes données.**
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.
>
> ↻ **12 h 08 (Cowork) — VUE par Grégoire sur 1.130.2 (« ça va, c'est plus rapide »), porte NON CHIFFRÉE** : aucune rangée cochée, aucun
> relevé collé. Le lot est clos à son verdict ; les trois rangées restent ouvertes dans l'artefact s'il veut les chiffrer. Le
> 30-45 s du matin reste sans cause établie (§ 3.1).
>
> ⚠ **Aucun banc ne peut mesurer ceci** : les en-têtes de cache n'existent qu'une fois déployés, derrière Cloudflare
> Access, et un fichier ouvert en `file://` n'a pas d'en-têtes.
>
> ✅ **Rangée 2.1 RELEVÉE par Grégoire le 11 septembre à 11 h 58, sur `1.130.1`, nouvel onglet : Load 527 ms, 302 lignes
> en 304.** Elle **réfute** l'hypothèse de départ : trois cents revalidations coûtent une demi-seconde, pas 30 à 45 s ;
> les 34-51 s du matin étaient des rechargements forcés. **La cause des 30-45 s n'est pas établie.** Le lot reste
> livré (moins de requêtes, sain) ; les rangées 2.2 à 2.4 ne jugent plus une vitesse, elles vérifient que
> l'immuable est arrivé et n'a rien figé. Les seuils en secondes sont des notes, pas des critères d'échec.

**Pourquoi cette liste est courte.** Quatre rangées, fixées par la consigne. Le reste est mesuré par une sentinelle
(chaque script d'`index.html` porte un jeton ; les deux chargements dynamiques aussi ; `/js/*` immuable, `index.html`
jamais). Le chiffre, lui, n'existe que dans ton navigateur.

⚠⚠ **Tout se fait dans un NOUVEL ONGLET, jamais par un rechargement.** Un rechargement ne revalide que la page
elle-même : c'est ce qui a caché la cause ce matin (0,92 s au rechargement, 34 à 51 s à l'ouverture).

---

## §0 · Préalable — la rangée 1 se fait AVANT le déploiement

| | Geste | Attendu |
|---|---|---|
| **0.1** | Sur le Mac, dans Chrome : **ferme tous les onglets** de `app.codexnumeris.org` | — |
| **0.2** | Pour les rangées 2 à 4 seulement : lis le **numéro de version en bas de page** | **`1.130.2`**. Sinon, arrête-toi : le serveur sert encore la version d'avant, attends une minute et rouvre un onglet neuf. |

---

## §1 · ⚠⚠ Tes données

> **Aucune porte.** Ce lot n'écrit rien dans ton codex — des en-têtes de serveur et trois adresses de fichiers.

---

## §2 · Ce que seul ton navigateur peut mesurer

### 2.1 · Le chiffre de référence — AVANT que la version 1.130.2 soit en ligne

> **Pourquoi.** C'est le seul « avant » qui existera. Sans lui, la rangée 2 n'a rien à quoi se comparer.
> *Mesure d'entrée : aucun chiffre n'est un échec ici.*

| | Geste | À noter |
|---|---|---|
| **2.1a** ✅ | Chrome, Mac. **Nouvel onglet** ; ouvre les outils de développement (**Cmd + Option + I**), onglet **Network** ; puis tape `app.codexnumeris.org` et Entrée. Attends la fin du chargement. | **Relevé 11 h 58 : Load 527 ms, 302 lignes en 304**, sur `1.130.1`. |

### 2.2 · Après le déploiement — la seconde ouverture est courte

> **Pourquoi.** La première ouverture reçoit ce qui a changé ; la seconde ne doit plus rien redemander au serveur
> pour `js/`. (Ce n'est pas ce qui expliquait tes 30-45 s — voir l'en-tête — mais c'est ce que le lot promet.)

| | Geste | Attendu |
|---|---|---|
| **2.2a** | Chrome, Mac. **Nouvel onglet**, Network ouvert, tape l'adresse. C'est la **première** ouverture depuis la mise à jour : elle peut être longue. Lis le bas de page. | `1.130.2`. Load noté pour mémoire : _____ s (aucun attendu sur cette rangée). |
| **2.2b** | **Ferme cet onglet.** **Nouvel onglet**, Network ouvert, tape l'adresse. | **Zéro ligne `js/…` en 304** (filtre `304`) : dans la colonne **Size**, les lignes `js/…` disent **« (memory cache) »** ou **« (disk cache) »**. Load noté pour mémoire : _____ ms (la référence était 527 ms ; ce n'est pas un critère). |

### 2.3 · L'en-tête est bien arrivé jusqu'à Chrome

> **Pourquoi.** Cloudflare est entre Netlify et toi. S'il réécrit l'en-tête, la rangée 2.2b échoue pour une autre
> raison que le lot — et c'est cette rangée qui le dit.

| | Geste | Attendu |
|---|---|---|
| **2.3a** | Dans le panneau Network de la rangée 2.2b, clique une ligne `js/…` (n'importe laquelle — pas `styles.css`, qui reste revalidée exprès), onglet **Headers**, section **Response Headers**, ligne `cache-control` | **`public, max-age=31536000, immutable`**. Note ce qui est écrit si c'est autre chose : _____ |

### 2.4 · Sur l'iPad — et la version est la bonne

> **Pourquoi.** Le témoin que « immuable » n'a pas figé l'ancienne version chez toi : la page d'entrée, elle, est
> toujours redemandée, et c'est elle qui donne la liste des fichiers à jour.

| | Geste | Attendu |
|---|---|---|
| **2.4a** | Safari, iPad. Ouvre l'application ; **ferme-la complètement** (balaie-la hors de la liste des apps) ; rouvre-la | **Le bas de page dit `1.130.2`** — c'est le critère. Secondes à la montre, pour mémoire seulement : _____ s. |

---

## §3 · Décisions — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Aucune décision n'attend ici : les deux suites prévues de #825 (`defer`,
> écran d'attente) sont **retirées** — elles répondaient à une cause que ta mesure de 11 h 58 a écartée.

| | Ce qui reste dû | Quand |
|---|---|---|
| **3.1** | **La prochaine fois que l'ouverture prend 30 s ou plus** : Chrome, **Cmd + Option + I**, onglet **Network**, et regarde la **barre la plus longue** dans la cascade (colonne Waterfall). Note son nom (une requête ? `index.html` lui-même ? une police ? un appel à Cloudflare Access ?) et sa durée, dans un rapport de bug (le bouton de retour de l'application) — une capture d'écran de cette ligne suffit. | Au moment où ça se reproduit, pas avant. Sans reproduction, rien à coder. |

---

## §4 · Ce que je n'ai pas pu vérifier

- **La cause des 30-45 s.** L'inférence de départ (revalidation de 199 scripts à chaque ouverture) est réfutée par ta
  référence de 11 h 58 (527 ms pour 302 revalidations). Ce que tu as vécu à 7 h 08 n'a pas été reproduit en mesure ;
  les trois captures de 7 h 17-7 h 20 étaient des rechargements forcés. La cause reste à saisir (§ 3.1).
- **Cloudflare.** Il peut réécrire ou ajouter des en-têtes de cache ; seule la rangée 2.3a le dit.
- **Le pack de démonstration (1,1 Mo) et le décodeur HEIC** portent désormais le numéro de build comme jeton : ils
  seront retéléchargés une fois par version, seulement chez qui active la démo ou remet un HEIC. Assumé, pas mesuré.
- **`libs/`** (quatre bibliothèques sans jeton : Chart.js, son plugin d'annotation, jsPDF, autotable) reste
  revalidé à chaque ouverture — quatre requêtes, pas deux cents. Hors périmètre, volontairement.
- **Safari** : la sentinelle et la relecture tournent sous Node ; aucun navigateur n'a été ouvert en session.

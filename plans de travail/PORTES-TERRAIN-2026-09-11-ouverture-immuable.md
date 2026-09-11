# Portes terrain — 11 septembre 2026 (l'ouverture de l'application, #825 temps 1, 1.130.2)

> **Version à l'écran attendue après déploiement : `1.130.2`** (le build est écrit par la release ; lis-le en bas de page).
> Couvre : le serveur ne demande plus au navigateur de revalider les deux cents scripts et les deux feuilles de
> style à chaque ouverture (`netlify.toml`) ; trois fichiers qui échappaient aux jetons anti-cache en ont reçu un.
> **Rien ne change à l'écran. Rien n'écrit dans tes données.**
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.
>
> ⚠ **Aucun banc ne peut mesurer ceci** : les en-têtes de cache n'existent qu'une fois déployés, derrière Cloudflare
> Access, et un fichier ouvert en `file://` n'a pas d'en-têtes. **C'est cette porte qui juge le lot** — si la rangée 2
> reste au-dessus de quelques secondes, la cause est ailleurs et on remesure avant de toucher à autre chose.

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
| **2.1a** | Chrome, Mac. **Nouvel onglet** ; ouvre les outils de développement (**Cmd + Option + I**), onglet **Network** ; puis tape `app.codexnumeris.org` et Entrée. Attends la fin du chargement. | En bas du panneau Network : **Load = _____ s** ; et le nombre de lignes dont la colonne Status dit **304** : _____ (tape `304` dans le filtre du panneau pour les compter). Le bas de page doit dire `1.130.1`. |

### 2.2 · Après le déploiement — la seconde ouverture est courte

> **Pourquoi.** C'est ce que tu as vécu ce matin : 30 à 45 s à chaque ouverture. Attendu après le lot : la
> première ouverture reçoit ce qui a changé ; la seconde ne redemande plus rien au serveur.

| | Geste | Attendu |
|---|---|---|
| **2.2a** | Chrome, Mac. **Nouvel onglet**, Network ouvert, tape l'adresse. C'est la **première** ouverture depuis la mise à jour : elle peut être longue. Lis le bas de page. | `1.130.2`. Load noté pour mémoire : _____ s (aucun attendu sur cette rangée). |
| **2.2b** | **Ferme cet onglet.** **Nouvel onglet**, Network ouvert, tape l'adresse. | **Load sous 3 s** : _____ s. Dans la colonne **Size**, les lignes `js/…` disent **« (memory cache) »** ou **« (disk cache) »** ; **zéro ligne `js/…` en 304** (filtre `304`). |

### 2.3 · L'en-tête est bien arrivé jusqu'à Chrome

> **Pourquoi.** Cloudflare est entre Netlify et toi. S'il réécrit l'en-tête, la rangée 2.2b échoue pour une autre
> raison que le lot — et c'est cette rangée qui le dit.

| | Geste | Attendu |
|---|---|---|
| **2.3a** | Dans le panneau Network de la rangée 2.2b, clique une ligne `js/…` (n'importe laquelle), onglet **Headers**, section **Response Headers**, ligne `cache-control` | **`public, max-age=31536000, immutable`**. Note ce qui est écrit si c'est autre chose : _____ |

### 2.4 · Sur l'iPad — et la version est la bonne

> **Pourquoi.** Le témoin que « immuable » n'a pas figé l'ancienne version chez toi : la page d'entrée, elle, est
> toujours redemandée, et c'est elle qui donne la liste des fichiers à jour.

| | Geste | Attendu |
|---|---|---|
| **2.4a** | Safari, iPad. Ouvre l'application ; **ferme-la complètement** (balaie-la hors de la liste des apps) ; rouvre-la en comptant les secondes à la montre | **Seconde ouverture sous 5 s** : _____ s. Et **le bas de page dit `1.130.2`**. |

---

## §3 · Décisions — ce qui attend ton verdict

> **Ce ne sont pas des vérifications.** Une seule, et seulement si la rangée 2.2b est au-dessus de quelques secondes.

| | Question | Ton verdict |
|---|---|---|
| **3.1** | **Si 2.2b reste au-dessus de 3 s** : la cause n'est pas la revalidation. Les deux suites de #825 (charger les scripts en parallèle avec `defer` — temps 2 ; un écran d'attente — temps 3) ne se font **que sur ce chiffre**, à froid. Si 2.2b est sous 3 s, elles n'ont plus d'objet. Ton chiffre, et ce que tu veux : _____ | _______ |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Le chiffre.** Rien ici n'a été mesuré en ligne : le lot est jugé par cette porte, pas par un banc. L'inférence
  (revalidation de 199 scripts à chaque ouverture) vient de tes trois captures de ce matin ; elle explique le
  rechargement simple à 0,92 s, mais elle n'est prouvée que si 2.2b descend.
- **Cloudflare.** Il peut réécrire ou ajouter des en-têtes de cache ; seule la rangée 2.3a le dit.
- **Le pack de démonstration (1,1 Mo) et le décodeur HEIC** portent désormais le numéro de build comme jeton : ils
  seront retéléchargés une fois par version, seulement chez qui active la démo ou remet un HEIC. Assumé, pas mesuré.
- **`libs/`** (quatre bibliothèques sans jeton : Chart.js, son plugin d'annotation, jsPDF, autotable) reste
  revalidé à chaque ouverture — quatre requêtes, pas deux cents. Hors périmètre, volontairement.
- **Safari** : la sentinelle et la relecture tournent sous Node ; aucun navigateur n'a été ouvert en session.

# AUDIT — la collision de vocabulaire « séance »

> **7 août 2026.** Lecture seule, aucun renommage exécuté.
> Demandé par `docs/utilisateur/METHODE-ALIGNEMENT.md` §5.3, point 5 :
> *« Renommage inter-modules → audit des call-sites AVANT d'annoncer un
> périmètre »*. Le document proposait une piste — renommer l'objet de
> l'horaire en **créneau**. Cet audit la mesure et, sur un point, la corrige.

---

## 1. En une phrase

Le mot « séance » ne désigne pas **une** chose à renommer mais **deux choses
déjà distinctes** dans le code — le créneau récurrent et son occurrence datée —
et le §5.3 propose d'en ajouter une **troisième**. La piste « renommer
l'horaire en créneau » ne referme donc que le tiers du problème.

---

## 2. Les deux concepts qui coexistent déjà

Vérifié au code (`js/horaire.js`, `confirmerSeances()` et
`genererSeancesCompletes()`).

| | **A — le créneau récurrent** | **B — l'occurrence datée** |
|---|---|---|
| Clé | `seancesHoraire` | `seancesCompletes` |
| Forme | `{ id, lettre, groupe, jour, debut, nombrePeriodes, duree, local, verrouille }` | `{ id: 'SEANCE-<date>-<nom>', date, numeroSemaine, … }` |
| Porte une date ? | **non** — « le lundi 10 h, local 2309 » | **oui** — « le lundi 8 septembre » |
| Origine | saisi par l'enseignant | **dérivé** : horaire × `calendrierComplet` |
| Cardinalité | ~2 à 6 par groupe-cours | ~30 à 90 par trimestre |

**C — la séance pédagogique** du §5.3 (théorie vs labo, hétérogène, porteuse de
ses propres activités) serait un troisième objet, distinct des deux.

**Conséquence sur la piste du §5.3.** Renommer A en « créneau » laisse B
s'appeler « séance » — et B est justement ce qui ressemble le plus à C (les
deux sont datés, les deux sont ce qui « a lieu »). La collision se déplacerait
au lieu de disparaître.

---

## 3. Volumétrie mesurée

| Surface | Occurrences | Fichiers |
|---|---|---|
| `js/*.js` | **1827** | 25 |
| `index.html` | 64 | 1 |
| `tests/` | 110 | 20 |
| `docs/` + `Skills pour Claude Code/` | 471 | — |
| **Total** | **≈ 2470** | |

- **113 identifiants distincts** contiennent `seance` / `Seance`.
- Les 5 fichiers les plus chargés : `horaire.js` (355), `trimestre-v2-horaires.js`
  (163), `saisie-presences.js` (157), `organisateur.js` (83), `snapshots.js` (69).

> Repère : le chantier du 6 août annonçait « ~12 sites » et en a trouvé 26.
> Ici l'ordre de grandeur est **cent fois** celui-là.

### Bonne nouvelle : l'interface est presque épargnée

Les 64 occurrences d'`index.html` sont **toutes des identifiants** (`id=`,
`class=`, `data-on-change`) — **aucun libellé visible**. Le vocabulaire affiché
à l'enseignant est généré en JS, et il y est nettement plus rare que le total
brut ne le laisse craindre : « Séance A : », « séances existantes », « séances
configurées », « séance vide ».

**Ce qui compte pour l'utilisateur peut donc être traité SANS toucher au code
interne.** C'est le levier le moins cher de tout cet audit.

---

## 4. Le point dur : trois clés de stockage

```
seancesHoraire        (17 sites de lecture/écriture, + variantes _<coursId>)
seancesCompletes      ( 6 sites,                    + variantes _gc_<id>)
planification_seances ( 2 sites)
```

Renommer une clé = **migration sur les données réelles de Grégoire** (trimestres
h2026 et a2025). C'est la seule contrainte dure de `CLAUDE.md` — la
rétro-compatibilité des données personnelles — et l'histoire du projet est
explicite sur le risque : #352 (écrasement `a2025_productions`), #362 (grilles
désappariées, réparé le 5 août en séance guidée), #358 (migration des modèles,
« risque maximal »).

**Rien n'oblige à renommer les clés pour renommer les concepts.** Le nom d'une
clé de stockage n'est pas lu par l'enseignant.

---

## 5. Les 8 fichiers qui touchent les DEUX chaînes

C'est là que la confusion coûte réellement quelque chose aujourd'hui — un
lecteur du code doit deviner, à chaque occurrence, duquel des deux on parle :

`horaire.js` · `migrations.js` · `presences-apercu.js` ·
`profil-etudiant-sections-affichage.js` · `reserve.js` · `saisie-presences.js` ·
`snapshots.js` · `trimestres.js`

---

## 6. Trois options, avec leur coût

### Option 1 — Vocabulaire d'interface seulement *(S)*

Fixer les mots que l'enseignant voit : **créneau** (A), **séance** (B, ce qui a
lieu), et le mot que C recevra. Rien d'autre ne bouge : ni identifiants, ni
clés, ni structures.

- **Coût** : quelques dizaines de libellés, plus le glossaire du skill.
- **Gain** : la collision disparaît là où elle se voit. C au §5.3 devient
  nommable sans ambiguïté pour l'utilisateur.
- **Reste** : le code garde deux « séance » — dette de lisibilité, pas de
  correction.

### Option 2 — Option 1 + renommage des identifiants de la chaîne A *(L)*

Les 113 identifiants, dont ceux d'`index.html`, passent à `creneau*`. Les
**clés de stockage restent inchangées** (aucune migration).

- **Coût** : 25 fichiers, ~1800 occurrences à trier une par une — la moitié
  environ appartient à B et ne doit surtout pas bouger. Les 8 fichiers mixtes
  demandent une lecture, pas un `sed`.
- **Risque** : exactement celui des trois régressions du 6 août — une structure
  partagée modifiée sans auditer ses consommateurs.
- **Gain** : le code dit enfin ce qu'il manipule.

### Option 3 — Option 2 + renommage des clés de stockage *(XL)*

- **Coût** : tout ce qui précède, **plus** une migration sur données réelles,
  avec backup, oracle avant/après et séance guidée — le protocole #362.
- **Gain** : nul pour l'utilisateur. Cohérence interne seulement.

---

## 7. Recommandation

**Option 1 maintenant, Option 2 plus tard et par tranches, Option 3 jamais —
sauf raison qui n'existe pas encore.**

Trois raisons :

1. **C'est C qui presse, pas A.** Le §5.3 a besoin d'un mot libre pour la séance
   pédagogique. L'option 1 le libère en une session.
2. **Le coût de l'option 2 est immédiat, son bénéfice est différé** — il profite
   au prochain lecteur du code, pas à l'enseignant. Il peut donc attendre, et se
   faire fichier par fichier, en commençant par les 8 mixtes.
3. **L'option 3 fait courir un risque de données pour un gain cosmétique.** La
   doctrine zéro-dette veut qu'on retire ce qu'on remplace ; elle ne demande
   nulle part de renommer ce qui fonctionne et que personne ne lit.

### ⚠ Ce que l'audit ne tranche pas — c'est à Grégoire

Quel mot pour **C** ? Trois candidats, et le choix change la suite :

- **« Séance »** pour C, et A+B deviennent *créneau* et *occurrence* — le mot le
  plus naturel pour l'enseignant va au concept pédagogique, mais c'est l'option
  la plus coûteuse (elle force au moins l'option 2 sur B).
- **« Moment »** ou **« Temps »** pour C — laisse A et B tranquilles, mais
  impose un mot que personne n'emploie en salle des profs.
- **Renommage libre par l'enseignant** (§5.2 : les types sont renommables) — le
  problème disparaît de l'outil et se déplace chez l'utilisateur. À vérifier :
  la piste « renommer Leçon en Séance » du §5.2 devient incohérente si C existe.

---

## 8. Ce que cet audit n'a PAS fait

- Aucun renommage, aucune modification de fichier hors ce rapport.
- Le tri occurrence par occurrence entre A et B n'a pas été fait — seule la
  répartition **par fichier** l'a été (§5). Un chiffrage fin de l'option 2
  demande ce tri, qui est lui-même une demi-journée.
- Les 471 occurrences de `docs/` et des skills n'ont pas été qualifiées : une
  part documente A, une part documente B, une part est du cadre pédagogique
  général où le mot est employé au sens courant.

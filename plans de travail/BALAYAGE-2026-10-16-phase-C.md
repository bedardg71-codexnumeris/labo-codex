# Balayage de la phase C – le dépôt `labo-codex` avant de le rendre public

> Claude Code, 16 octobre 2026, de 8 h 45 à 9 h 35 (Toronto). Lecture seule : aucun commit, aucune correction.
> Ce rapport ne recopie aucune valeur sensible (ni DA, ni nom, ni secret, ni courriel). Les collègues sont désignés par leur rang dans la liste hors dépôt de la purge (`~/purge-travail/outils/collegues.py`, rang compté à partir de 0).
> Consigne : `plans de travail/CONSIGNE-DU-JOUR.md`, partie 2. Plan : `PLAN-2026-10-15-nouveau-depot-labo-codex.md`, phase C.

## Verdict en une ligne

**Aucun secret, aucun DA, aucune paire prénom-nom d'élève sur tout l'historique. Trois fuites de noms de collègues ont échappé à la purge, toutes dans des formes que la règle des collègues ne voyait pas.** Si Grégoire veut les retirer, il faut une réécriture de l'historique, et la partie 3 attend.

## Ce qui a été balayé

| Périmètre | Mesure |
|---|---|
| Références | `main`, les 22 étiquettes, et les 11 références distantes (dont 9 branches Dependabot, publiques elles aussi une fois le dépôt ouvert) |
| Blobs | 25 219, tous ; dont 223 binaires ou compressés |
| Messages | 6 072 messages de commit et d'étiquette |
| Chemins | 4 944 chemins distincts de l'historique |
| Identités | auteurs et committeurs de chaque commit |

Les DA et les paires passent par le détecteur de la purge (`detecteur.py`), avec la même tolérance : casse, accents, formes décomposées (NFD), entités HTML, ordre « Prénom Nom » comme « Nom, Prénom », séparateurs quelconques. La liste est la même : 265 élèves, hors dépôt.

**Témoins.** Chaque détecteur a d'abord été éprouvé sur des cas synthétiques (`scratchpad/temoin.py`). Résultat : 14 sur 14 verts. Les cas couvraient un DA de la liste, une paire sous trois formes (dont NFD et « NOM, Prénom »), chacun des motifs de secret, un courriel, et l'exclusion des adresses `noreply`. Le détecteur de DA et de paires avait déjà son témoin sur le dépôt original : 1 058 et 1 002 blobs trouvés (`~/purge-travail/verification-2026-10-16.txt`).

## 1. Secrets – rien à faire

- **Motifs à préfixe : 0 blob.** Les motifs cherchés étaient `ghp_`/`gho_`/`ghs_`, `github_pat_`, `sk-` (dont `sk-ant-`), `AKIA`, `-----BEGIN` (clé privée et autres), `nfp_`, `xox`, `AIza`, `glpat-`, et l'en-tête `Authorization: Bearer|Basic|token` suivi d'une valeur.
- **Mots-clés suivis d'une valeur littérale d'au moins 8 signes : 0.** Les mots-clés étaient `password`, `token`, `secret`, `api_key`, `access_key` et `client_secret`. Ces mots apparaissent bien dans l'arbre (7, 22 et 6 fichiers pour les trois premiers), mais toujours dans de la prose ou du code sans valeur.
- **Fichiers de type secret : 0.** Aucun `.env`, `id_rsa`, `.pem`, `.p12`, `.npmrc` ni `credentials`.
- **Messages de commit : 0.**

## 2. DA – rien à faire

0 blob texte, 0 message, 0 chemin. Le résultat est le même dans le contenu des binaires : PDF, entrées de zip et texte OCR des images.

## 3. Paires prénom-nom d'élèves – rien à faire

Le compte est de 0 partout, sur le même périmètre que les DA.

## 4. Courriels

Il y a 63 adresses distinctes sur 26 domaines, hors `noreply`. Les identités de commit sont toutes des `noreply` (Anthropic, GitHub, `users.noreply.github.com`).

| Adresse (décrite) | Où | Disposition proposée |
|---|---|---|
| **Une adresse Gmail personnelle**, champ `email` de `.claude-plugin/marketplace.json` | 1 fichier, 1 seule version, entrée au commit `27d34d1b` du 26 juin 2026, jamais modifiée depuis ; dans l'arbre | **Décision de Grégoire.** Corriger dans l'arbre (par exemple vers l'adresse du projet) laisse la version de juin dans l'historique. Si une réécriture a lieu pour les points 7 et 8, elle peut l'emporter en même temps. |
| Adresse institutionnelle de Grégoire | 24 chemins de l'historique (exports JSON de janvier 2026 sous `Archives/Tests/`, champ `email_auteur`) et 1 image d'aide (texte OCR) ; aucune dans l'arbre | Rien à faire, proposé : c'est l'adresse professionnelle de l'auteur, comme attribution. Décision de Grégoire. |
| **Adresse professionnelle du collègue n° 9** | Voir le point 7 | Réécrire l'historique |
| Adresse de service du centre d'aide en français du collège | 1 fichier de l'historique | Rien à faire : c'est une adresse institutionnelle publique |
| Adresse du projet (`labo@…`) et une coquille de son domaine | 182 et 30 chemins | Rien à faire |
| 9 adresses d'auteurs de bibliothèque | `libs/jspdf.umd.min.js` (en-têtes de la bibliothèque tierce) | Rien à faire |
| 2 adresses de presse d'un ministère | `CSEN_Synthese_19_…pdf` (historique) | Rien à faire |
| Adresses de démonstration ou d'exemple (`exemple.*`, `example.*`, `demo.qc.ca`, `cegep.qc.ca`, `college.qc.ca`, `test.zz`, `x.ca`…) | bancs, pack de démarrage, CSV de démonstration, plans | Rien à faire : ce sont des adresses fictives, et le compte de paires est nul |

## 5. Binaires et compressés

Il y a 223 blobs : 172 images, 7 PDF, 18 zip, un zip tronqué et 25 autres.

| Genre | Ce qui a été lu | Résultat |
|---|---|---|
| Images (172, plus 6 dans des zip) | Texte OCR Vision : 177 images lues dans le cache de la purge, sur le même SHA | 0 DA, 0 paire, 0 collègue. Une image d'aide de l'historique montre l'adresse institutionnelle de Grégoire (point 4). |
| Images non lues (2) | 1 PNG de 1 × 1 pixel et 1 fichier AppleDouble nommé `.png` | Rien à lire |
| PDF (7) | Tous ont une couche texte, lue par `pypdf` | Rien d'identifiant. Seules s'y trouvent les adresses de presse d'un ministère (point 4). |
| Zip (18) | Chaque entrée décompressée, récursivement | **8 blobs porteurs** (point 8). Les autres ne contiennent que l'adresse du projet. |
| Zip tronqué `ziFuSuKN` (historique, décembre 2025) | Lu entrée par entrée (7 entrées : HTML et JS de la bêta 90) | Rien d'identifiant |
| `.DS_Store` (20) | Décodés en UTF-16 et en Latin-1 : ils listent des noms de fichiers | Rien d'identifiant |
| Fichiers texte à octet nul (5 : `js/travaux-archivage.js` ×3, un script, une archive d'observation) | Lus comme du texte | Rien |

## 6. Fichiers d'accueil

**`README.md`** présente le projet à un inconnu : ce qu'il fait, comment l'ouvrir, son architecture, ses licences. Il ne contient aucune donnée personnelle, hormis l'identité de l'auteur, voulue. Les 15 liens locaux mènent tous à un fichier présent. Trois défauts relèvent de « corriger dans l'arbre » :
- **4 liens pointent vers l'ancien dépôt `Monitorage_v6`** : les releases, la commande `git clone` et son `cd`, la branche `audit/2026-mai` et les issues. Pour un inconnu, ils sont morts dès aujourd'hui, puisque l'ancien dépôt est privé, et ils le seront pour tout le monde après la phase D.
- Les statistiques datent du 22 mai et annoncent « ~2 886 commits », alors que l'historique en compte 6 041.
- « 97/97 attendus » : les tests sont aujourd'hui 8 917.

**`LICENSE.md`** – un écart avec la prémisse de la consigne, à trancher par Grégoire :
- **La consigne attend CC BY-SA 4.0 pour les ressources. Le dépôt dit CC BY-NC-SA 4.0**, depuis le 26 novembre 2025 selon son propre historique des versions. L'application le dit aussi (`js/cc-license.js`, `licence: "CC BY-NC-SA 4.0"`), tout comme le README. Le titre de la section 2 (ligne 34) dit « BY-SA », alors que tout le reste dit « BY-NC-SA » : cette incohérence interne relève de « corriger dans l'arbre ». **Le choix de la licence revient à Grégoire** : c'est un engagement public, et je n'ai rien supposé.
- **Le fichier ne dit pas quels dossiers relèvent de quelle licence.** Il raisonne par types de fichiers (« HTML, `js/*.js`, `styles.css` », « documentation, aide intégrée »). Il ne dit rien de `css/`, `docs/`, `autocollants/`, `Design system - Modules/`, `plans de travail/`, `.claude/skills/`, ni de `libs/`. Ce dernier dossier contient des bibliothèques tierces sous leurs propres licences (`libs/VERSIONS.md`), et le fichier ne le mentionne pas. Disposition : corriger dans l'arbre.
- **Aucun texte complet de licence n'est dans le dépôt.** Il n'y a que des liens. GitHub ne détectera donc aucune licence : la page du dépôt affichera « No license ». Disposition : corriger dans l'arbre, en ajoutant le texte AGPL v3.

## 7. Le nom d'un collègue collé dans une adresse et dans un identifiant – trouvaille

La règle des collègues de la purge cherche les noms comme mots entiers. Elle ne voit donc pas un nom collé à d'autres lettres. J'ai cherché la forme collée (lettres seules, sans frontière de mot) sur tous les blobs texte et sur tous les chemins, hors chemins épargnés le 15 octobre. Après tri à la main, il reste deux cas réels. Les autres touches sont des chevauchements de mots, comme un fragment qui naît de « l'éducation ».

- **Collègue n° 9 : son nom de famille entier figure dans son adresse courriel professionnelle**, dans l'en-tête de `js/pratiques/pratique-pan-objectifs.js` et de ses deux copies d'`Archives/`. Le nom en clair à côté a, lui, bien été réduit à l'initiale. Ces fichiers comptent 13 révisions, entre le 9 décembre 2025 et le 16 mars 2026, date à laquelle l'adresse a quitté l'arbre. Elle est donc dans l'historique seulement. **Disposition proposée : réécrire l'historique.**
- **Collègue n° 3 : un identifiant de fonction en camelCase porte son prénom et son nom** (`creerEnsemble‹Prénom›‹Nom›`). Il est **dans l'arbre** (2 fichiers : un plan archivé sous `docs/archive/` et un banc de `tests/unit/`) et dans l'historique (15 chemins selon `git log -G`, dont `js/objectifs.js`). **Disposition proposée : corriger dans l'arbre et réécrire l'historique.**

Ce qui reste, et qui est voulu : les noms entiers des auteurs publiés, dans leurs contextes de citation. Les collègues n° 0 et n° 1 apparaissent ainsi dans `BACKLOG.md`, `OU-EN-EST-ON.md` et la page des remerciements. Ces contextes ont été décidés le 15 octobre (« 57 contextes survivants, tous publiés »). Rien à faire.

## 8. Les zip de `dist/` – trouvaille

**8 blobs, sur 7 chemins de `dist/*.zip` (bêtas 91.2 à 92, octobre et novembre 2025, historique seulement), contiennent les noms entiers de collègues** dans 6 à 10 fichiers chacun. Ils contiennent aussi une copie de la configuration de pratique nommée d'après un collègue. Or ce chemin a été retiré partout ailleurs le 15 octobre, mais pas à l'intérieur des archives. La purge a vérifié ces zip pour les DA et les paires d'élèves, pas pour les noms de collègues. **Disposition proposée : réécrire l'historique**, en ajoutant ces 7 chemins à `chemins-a-retirer.txt`, comme les autres zip de bêtas l'ont été le 15 octobre.

## Ce que ça change pour la suite

| Si Grégoire… | Alors |
|---|---|
| retient la réécriture pour les points 7 et 8 (et, à son choix, le Gmail du point 4) | Aucun commit tant qu'elle n'est pas faite. La partie 3 attend. L'outillage de la purge se rejoue tel quel, avec deux ajouts : 7 chemins de zip, et une règle pour les deux formes collées. Il faudra ensuite pousser de force vers `labo-codex` (dépôt privé, aucun autre clone que le sien). |
| accepte ces restes dans l'historique | Corriger dans l'arbre l'identifiant du point 7, le Gmail, le README et `LICENSE.md`, puis ouvrir le dépôt. La partie 3 peut commencer. |

## Ce que ce balayage ne voit pas

- **Un élève absent des 265 de la liste** : c'est le même angle mort que la purge.
- **Un DA hors de la liste.** Les nombres à 7 chiffres inconnus ne sont pas cherchés, car ils produiraient trop de faux positifs.
- **Les noms d'élèves seuls**, sans prénom voisin (décision de la purge : un nom seul n'identifie pas).
- **Le texte des images que l'OCR lit mal.**

## Outils (hors dépôt, dans le scratchpad de la session)

- `balayage.py` : blobs, messages, identités et chemins.
- `binaires.py` : PDF, zip et OCR.
- `colles.py` : formes collées des noms de collègues.
- `temoin.py` : témoins synthétiques.

Tous importent les modules de `~/purge-travail/outils/`. Aucun n'imprime de valeur.


## Relecture de Cowork (9 h 16, 16 octobre 2026)

Relu en entier. Remesuré de mon côté, sans la liste hors dépôt : l'identifiant collé du collègue n° 3 est bien dans 2 fichiers de l'arbre ; l'historique compte 8 chemins `dist/*.zip` ; 9 références distantes Dependabot. Accord avec les dispositions proposées, avec trois précisions.

1. **Licence : pas de décision à rendre.** La « CC BY-SA » de la consigne venait du plan, écrit par Cowork le 15 : erreur de transcription, corrigée dans le plan. Le dépôt, le README et `js/cc-license.js` disent CC BY-NC-SA 4.0 ; aucune décision de Grégoire ne l'a changé. Reste à corriger dans l'arbre le titre de la section 2 (`LICENSE.md`, lignes 34 et 184-185) qui dit « BY-SA ».
2. **Si la réécriture a lieu, les branches et les demandes de fusion de Dependabot.** Un poussé forcé ne retire pas les anciens commits que GitHub garde pour une demande de fusion (`refs/pull/*`) : seuls le soutien de GitHub ou un dépôt recréé les effacent. Les 9 branches Dependabot laissent supposer des demandes de fusion ouvertes (inférence : je n'ai pas d'accès à l'API du dépôt). La réécriture doit donc mesurer d'abord (`gh pr list --state all`) : s'il y en a, recréer `labo-codex` vide (privé) et y pousser l'historique réécrit, puis relier Netlify ; sinon, poussé forcé et suppression des 9 branches.
3. **L'adresse institutionnelle de Grégoire** (exports de janvier, image d'aide) : je propose de la laisser, comme attribution d'auteur ; elle n'est pas dans l'arbre.

## Dispositions faites (Claude Code, 16 octobre 2026, 10 h 50)

Décision de Grégoire à 9 h 19 : « il faut retirer les noms en effet ». Consigne : `CONSIGNE-2026-10-16-reecriture-noms-collegues.md`. Rapport détaillé et relecture de Cowork : `RAPPORT-2026-10-16-reecriture-noms-collegues.md`.

| Point | Disposition |
|---|---|
| 4. Gmail personnel | **Fait** : remplacé par l'adresse du projet dans tout l'historique. |
| 4. Adresse du collègue n° 9 | **Faite** : le nom collé est réduit à l'initiale dans tout l'historique. |
| 4. Adresse institutionnelle de Grégoire | **Gardée**, comme attribution d'auteur (décision de la consigne). |
| 6. README, `LICENSE.md` | À faire par des commits ordinaires dans l'arbre, avant le passage en public. |
| 7. Identifiant du collègue n° 3 | **Fait** : un identifiant neutre partout, arbre compris. |
| 8. Zip de `dist/` | **Faits** : les 8 chemins sont retirés de l'historique et ajoutés à `chemins-a-retirer.txt`. |
| Recherche élargie à tous les rangs | Elle ne trouve rien d'autre, sauf une citation d'auteur publié (rang 0), gardée. |

Le poussé a eu lieu le 16 oct. vers 10 h 40, vers `labo-codex` recréé vide et privé. Les 9 demandes de fusion Dependabot ouvertes imposaient de recréer le dépôt. Le distant porte `main` et les 22 étiquettes, identiques à la copie vérifiée, et aucun `refs/pull/`. Les 17 vérifications de la purge sont vertes, chacune avec son témoin, et le balayage relancé rend 0 pour chaque point.

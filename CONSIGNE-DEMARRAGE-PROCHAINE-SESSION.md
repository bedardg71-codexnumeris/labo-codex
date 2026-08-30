Ouvre le dépôt Monitorage_v6. Rituel d'abord : délègue l'audit de début de session
au subagent `audit-debut-session`, puis lis la section « POUR LA SESSION QUI PREND
LE RELAIS — 30 AOÛT 2026, 12 h 30 (SESSION HEIC, TROISIÈME) » en tête de RELAIS.md.
On est à la 1.106.4 (build 0830-0948), et **rien n'est poussé depuis** : trois
commits de code attendent une version — `20e4feaf` (#597), `5ccef560` (#599),
`b96a7cd7` (#522 lots 2-3).

PRIORITÉ DATÉE — À TRAITER AVANT TOUT AUTRE CHANTIER
#427 + #508, échéance le 1er septembre, décision déjà prise (option A, je tiens la
date). Deux versants : ce qui est dû par moi dans la console Cloudflare (les trois
noms, la durée de session, la règle Include), et ce qui est dû côté code le jour
même — réécrire le paragraphe d'accueil au présent dans js/accueil.js. Les deux
textes sont écrits d'avance au §7 de
`plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md` ; le choix se fait le
jour même. Le bandeau s'éteint seul, il n'y a rien à retirer à la main.

ENSUITE — propose-moi un choix fermé entre :
(a) LE LANCEUR LOCAL — c'est une décision, pas un chantier, et elle m'appartient.
    Le décodeur HEIC livré le 30 août fonctionne, mais un Web Worker est refusé
    quand j'ouvre l'application par double-clic : le format est donc illisible chez
    moi, et l'application le DIT maintenant au lieu de le cacher. Servir
    l'application le ferait marcher tel quel et lèverait aussi le plafond de
    localStorage. Mais ça change mon geste de lancement et ça emporte l'usage
    tablette et la clé Codex. Pose-moi la question fermée, ne décide pas seul.
(b) #522 lot 5 — ENGAGÉ, PAS un chantier vierge : les étudiants sont FAITS
    (7 sites convertis, 1 faux positif nommé). Restent 22 sites en course — les cours,
    la copie de cartouche entre trimestres, les métadonnées CC, les instantanés, et
    neuf drapeaux de migration au démarrage dont la course est THÉORIQUE : les mesurer
    un par un, ne pas les convertir en bloc. La moitié du travail de mesure est déjà
    faite et vit dans `scripts/mesurer-522.py`. Restent aussi #600 et #601.
(c) #598 volet B — le réglage global de la balance des blancs dans l'écran
    Optimisation. Le volet A est livré (l'aperçu reflète le traitement). Les pièges
    sont déjà écrits dans l'entrée : SSOT persistant et non état de DOM, `cle()` dès
    le départ, sémantique global/par-fichier à trancher.
(d) #595 — les 78 variables CSS fantômes, par familles de nom. Chantier de rendu :
    Playwright est la seule suite qui voit.

DEUX ITEMS À NE PAS OUVRIR SANS MESURER D'ABORD
#596 : l'énoncé dit « 6 clés, 5 fichiers » ; la mesure du 30 août donne 11 fichiers
et ~17 clés. Tranche le périmètre avant de commencer.
#520 : le bouton de sauvegarderNiveaux() vit dans le bloc caché à retirer
(js/echelles.js:3589). Audite les appelants avant toute ablation.

NE RECOMPTE JAMAIS #522 À LA MAIN — L'OUTIL EST DANS LE DÉPÔT
L'audit #522 a SOUS-COMPTÉ tous ses lots : lot 2 +38 %, lot 3 +48 %, lot 5 +93 %, et
#599 pas compté du tout. Ne pars jamais de son chiffre. Sers-toi de :

    python3 scripts/mesurer-522.py                 # tout le dépôt
    python3 scripts/mesurer-522.py cartouches_     # les clés contenant ce motif

Il apparie sur l'EXPRESSION de clé et non sur une chaîne — sinon les gabarits
(`cartouches_${grilleId}`) et les appels (`getCleProductions()`) sont invisibles — et
il canonise les alias, faute de quoi une lecture par l'un et une écriture par l'autre
passent pour deux clés distinctes.
⚠ **Il a des faux positifs, et il faut les LIRE.** Une fonction qui lit une clé puis y
écrit une CONSTANTE est signalée à tort : la valeur écrite ne dérive pas de la lecture.
Cas connu et nommé dans le code, `reinitialiserEtudiantsV2`, qui écrit `[]`. Le script
dit où regarder, pas quoi faire. Son en-tête porte les trois pièges et les quatre
écarts mesurés.

PIÈGES DÉJÀ PAYÉS — ne les réapprends pas
· Mesurer dans `file://`, pas seulement sous serveur. Le 30 août, « converties en
  3024x4032 » était EXACT sous serveur, et le bug était entier : personne n'avait
  écrit dans quel mode la mesure avait été faite. Tout ce qui dépend d'un Worker,
  d'un WASM ou d'un fetch se mesure par double-clic avant d'être dit livré.
· Un `blob:` worker HÉRITE de la CSP du document ; un worker chargé par URL
  same-origin non. Corollaire : en `file://`, aucun Web Worker n'est disponible du
  tout — ça vaut pour toute fonctionnalité future qui en voudrait un.
· Le hook anti-cache compte un COMMENTAIRE comme une modification, et son conseil
  (« incrémenter la lettre ») ne s'applique pas à un vieux jeton sans lettre. Le
  suffixe porte le jour du BUILD : 0830-0948 → 20260830a.
· Un total de tests lu AVANT le dernier changement ne vaut rien. Lire aussi le CODE
  DE SORTIE, pas le compte : vitest sort en 1 sur une erreur non gérée même avec
  tous les tests verts.
· getSync ne protège d'aucune course : dans db.set, l'écriture IndexedDB est
  attendue AVANT le rafraîchissement de localStorage.
· Un banc Vitest ne voit pas une course d'écriture : Node n'a pas d'IndexedDB.
  Force db.useIndexedDB avec une fausse connexion, sinon le test est vert sur du
  code cassé. Patron dans sentinelle-522-pratiques-serialisees.
· Vitest se lance depuis tests/. Ferme GitHub Desktop avant Playwright.
· Ordre de release : release.mjs → changelog → commit → sentinelle anti-cache.
  Touche au changelog AVANT de lancer le script, sinon son jeton est oublié.
· Et release.mjs bumpe les jetons de TOUT ce qui est modifié, y compris ce qui
  appartient à une autre session ouverte : vérifier l'index dans les deux sens.

SI PLUSIEURS SESSIONS TRAVAILLENT DANS L'ARBRE
Le 30 août, trois s'y sont croisées sans collision — par messages, pas par chance.
Annonce tes fichiers AVANT d'écrire, demande aux autres les leurs, et sur les
fichiers partagés (index.html, BACKLOG.md, RELAIS.md) stage par reconstruction
depuis HEAD. Vérifie `git diff --cached --stat` dans les deux sens avant CHAQUE
commit. Et ne conclus jamais d'un seul run de la suite sur un arbre partagé : trois
runs verts consécutifs après stabilisation, PLUS une passe ciblée sur tes seules
sentinelles.

DÉPANNER UNE REMISE HEIC EN ATTENDANT (macOS, rien à installer)
    sips -s format jpeg -s formatOptions 90 photo.HEIC --out photo.jpg
    sips -r 90 photo.jpg
Le second geste est OBLIGATOIRE : sips ne reporte pas la rotation du conteneur HEIF
et sort la page couchée. `sips -g orientation` répond <nil> et ment. Vérifie à l'œil.

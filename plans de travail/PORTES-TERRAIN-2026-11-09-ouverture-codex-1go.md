# Portes terrain – ouvrir un codex d'environ 1 Go, sur le Mac puis sur l'iPad (#992, 9 novembre 2026)

> **La trace.** L'opération est l'artefact « Portes terrain #992 · codex de 1 Go ». Cowork le publie à partir de ce fichier, avec le bouton « Copier mes résultats ». Les rangées qui rendent un chiffre, un titre ou un message portent un **champ de saisie**, pas une case.
> **Pourquoi cette porte.** Pour changer le nom et l'adresse de l'application, tes données passeront par le codex : « Mettre à jour le codex » à l'ancienne adresse, puis « Ouvrir un codex… » à la nouvelle. Cette ouverture n'a jamais été essayée sur un gros fichier, ni sur le Mac ni sur l'iPad. Cette porte l'essaie avec un codex **inventé** d'environ 1 Go, à une **adresse de test**, pour savoir avant le jour J si elle tient.
> **Ce qu'elle ne touche pas.** Ni tes données ni l'adresse app.codexnumeris.org. Le codex de test ne contient que des élèves inventés (« Élève FICTIF-001 » à « FICTIF-070 »), un trimestre inventé (« a2099 ») et 407 copies qui affichent « COPIE FICTIVE ».
> **Mesure d'entrée : aucune durée n'est un échec.** Ce qui compte : la fenêtre qui apparaît à la fin, et si l'onglet tient.
> **Une machine a déjà répondu pour Chromium** (le moteur de Chrome, dans le conteneur de Claude Code, sous Linux) : voir § 4. Elle ne peut pas trancher Safari, ni l'iPad, ni la mémoire de ton Mac.
> Un échec devient une ligne de #992 au BACKLOG, pas une note mentale.

## L'adresse de test

**`https://deploy-preview-<N>--codexnumeris-051225.netlify.app/`**

⚠ **`<N>` est à remplir** : c'est le numéro de la demande de fusion (PR) de la branche `claude/gifted-ritchie-prar2f`. Elle n'existe que tant que cette PR est ouverte. Claude Code remplace `<N>` ici dès qu'elle l'est.

C'est une copie de l'application, à une adresse à part (DEPLOY.md, « Les aperçus de PR »). Le navigateur range les données **par adresse** : ce qui s'ouvre là ne peut ni lire ni toucher ce que tu as à app.codexnumeris.org, même dans le même navigateur, sur le même appareil.

**Trois signes que tu es à la bonne adresse**, avant d'ouvrir quoi que ce soit :
1. l'adresse commence par `deploy-preview-` ;
2. le sélecteur de trimestre, sous le menu, dit « -- Sélectionne un trimestre -- » ;
3. le menu « Codex » (en haut à droite) commence par « Aucun codex actif — ouvre ou crée un codex pour commencer. »

**Si tu vois tes groupes, tes trimestres ou le nom de ton codex : arrête-toi.** Tu es à ta vraie adresse.

⛔ **Le fichier fictif ne s'ouvre JAMAIS à app.codexnumeris.org.** S'il y était ouvert par erreur, il n'effacerait ni ne remplacerait aucune de tes données : il y **ajouterait** un trimestre inventé et 1 Go de copies, et ton menu Codex prendrait son nom. Dans ce cas, n'y touche plus et dis-le : on retirera ce qu'il a ajouté.

## §0 · Préalable

- [ ] 0.1 · Mac · Demande à Claude Code, sur ton Mac : « Fabrique le codex fictif de la porte #992 » (il trouve la commande en bas de ce fichier). ⮕ Dans Téléchargements : « CODEX-FICTIF-mesure-992-1000Mo.zip », 997,5 Mo. Claude Code te rapporte « Copies : 407 ».
- [ ] 0.2 · iPad · À app.codexnumeris.org, fais ta sauvegarde habituelle : menu « Codex » › « Mettre à jour le codex ». ⮕ « Ton codex est à jour ».
  Pourquoi : l'iPad partage son espace entre les deux adresses. Si l'essai le remplissait, Safari pourrait effacer de lui-même des données de sites, et c'est la seule perte qui ne se rattraperait pas sans copie à jour. *(Inféré du fonctionnement de Safari, pas observé.)*
- [ ] 0.3 · iPad · Réglages › Général › Stockage iPad : note l'espace libre. ⮕ Au moins 4 Go. En dessous, note le chiffre et arrête-toi là : l'essai remplirait l'iPad. **[champ : espace libre, en Go]**
- [ ] 0.4 · iPad · Apporte le fichier sur l'iPad comme ton codex d'habitude (AirDrop ou clé USB), puis, dans l'app Fichiers, range-le dans « Sur mon iPad ». ⮕ Le fichier y est, 997,5 Mo, **sans petit nuage** à côté du nom (un nuage voudrait dire qu'il n'est pas encore sur l'iPad, et le téléchargement fausserait la durée).

## §1 · Sur le Mac, dans Chrome

Pourquoi : c'est sur le Mac que tu feras la migration en premier. S'il ne tient pas ici, inutile d'aller à l'iPad.

- [ ] 1.1 · Mac · Ouvre un nouvel onglet de Chrome à l'adresse de test. ⮕ L'adresse commence par `deploy-preview-` ; en bas de page, « Bêta publique 1.239.0 ».
- [ ] 1.2 · Mac · Clique « Codex », en haut à droite. ⮕ « Aucun codex actif — ouvre ou crée un codex pour commencer. » Sinon : **arrête-toi**.
- [ ] 1.3 · Mac · Clique « Ouvrir un codex… », choisis « CODEX-FICTIF-mesure-992-1000Mo.zip » dans Téléchargements, et lance un chronomètre au clic sur « Ouvrir ». ⮕ Un cadre « Ouverture du codex » avec une barre qui avance.
- [ ] 1.4 · Mac · Arrête le chronomètre à l'apparition d'une fenêtre, et note son titre. ⮕ Attendu : « Recharger la page », avec « Codex chargé depuis « CODEX-FICTIF-mesure-992-1000Mo.zip » (997,5 Mo) ». **[champ : titre de la fenêtre] [champ : durée, en secondes]**
  Les autres fins possibles, à noter telles quelles (ce sont des échecs) : « Codex ouvert, mais incomplet » ; « Espace insuffisant pour ouvrir ce codex… » ; « Le codex n'a pas pu être ouvert » ; une page d'erreur de Chrome à la place de l'application.
- [ ] 1.5 · Mac · L'onglet a-t-il tenu ? ⮕ Oui : l'application est restée à l'écran jusqu'à la fenêtre. Non : une page d'erreur de Chrome a remplacé l'application. **[champ : oui ou non, et le texte de la page d'erreur]**
- [ ] 1.6 · Mac · Un message d'espace est-il apparu ? ⮕ Attendu : non. S'il est là, recopie ses deux tailles (« Il a besoin d'environ … », « n'accorde que … »). **[champ]**
- [ ] 1.7 · Mac · Clique « Recharger », puis rouvre le menu « Codex ». ⮕ En tête du menu : « FICTIF mesure 992 (1000 Mo) » et « Ton codex est à jour ».
- [ ] 1.8 · Mac · Ferme l'onglet de test. Le fichier reste dans Téléchargements jusqu'à la fin du § 2.

## §2 · Sur l'iPad, dans Safari

Pourquoi : c'est sur l'iPad que la fabrication du codex faisait mourir la page à 1,33 Go, avant le correctif de septembre. L'ouverture, elle, lit encore le fichier entier en mémoire.

- [ ] 2.1 · iPad · Dans Safari, ferme l'onglet d'app.codexnumeris.org. ⮕ Plus aucun onglet de Labo Codex. Tes données n'en souffrent pas : elles restent dans Safari. Pourquoi : deux onglets de l'application se ressemblent trait pour trait, et ils se partagent la mémoire de l'iPad.
- [ ] 2.2 · iPad · Ouvre un nouvel onglet à l'adresse de test. ⮕ L'adresse commence par `deploy-preview-` ; en bas de page, « Bêta publique 1.239.0 ».
- [ ] 2.3 · iPad · Touche « Codex », en haut à droite. ⮕ « Aucun codex actif — ouvre ou crée un codex pour commencer. » Sinon : **arrête-toi**.
- [ ] 2.4 · iPad · Touche « Ouvrir un codex… », va dans « Sur mon iPad », touche le fichier (puis « Ouvrir » si l'iPad le demande), et lance le chronomètre à ce moment. ⮕ Le cadre « Ouverture du codex » avec sa barre.
- [ ] 2.5 · iPad · Arrête le chronomètre à l'apparition d'une fenêtre, et note son titre. ⮕ Attendu : « Recharger la page ». Les autres fins : comme en 1.4. **[champ : titre de la fenêtre] [champ : durée, en secondes]**
- [ ] 2.6 · iPad · L'onglet a-t-il tenu ? ⮕ Non si la page s'est rechargée d'elle-même : l'application revient à son accueil, souvent avec un bandeau de Safari en haut qui parle d'un problème survenu sur la page. Recopie ce bandeau mot pour mot. **[champ : oui ou non, et le texte du bandeau]**
- [ ] 2.7 · iPad · Un message d'espace est-il apparu ? ⮕ Attendu : non. S'il est là, recopie ses deux tailles. **[champ]**
- [ ] 2.8 · iPad · Touche « Recharger », puis « Codex ». ⮕ En tête du menu : « FICTIF mesure 992 (1000 Mo) » et « Ton codex est à jour ».
- [ ] 2.9 · iPad · Rends l'espace : Réglages › Apps › Safari › Avancé › Données des sites web, cherche « netlify », et supprime **la ligne qui contient « netlify »**. ⮕ Elle disparaît. ⛔ Ne touche pas à la ligne de « codexnumeris.org » : ce sont tes vraies données.
- [ ] 2.10 · iPad · Dans Fichiers, supprime « CODEX-FICTIF-mesure-992-1000Mo.zip » de « Sur mon iPad » ; sur le Mac, supprime-le de Téléchargements. ⮕ 1 Go rendu sur chaque appareil.

## §3 · Décisions

Aucune dans cette porte. La question de #992, ce que ton codex doit emporter quand il grossit, attend ce relevé.

## §4 · Ce qu'une machine a mesuré, et ce que je n'ai pas pu vérifier

**Mesuré par Claude Code le 9 nov. 2026** (conteneur Linux, 4 cœurs, 15 Go ; Chromium de Playwright, profil neuf à chaque passe ; application servie en local ; le vrai menu « Ouvrir un codex… », par le champ de fichier qu'emploie l'iPad), sur le fichier même de cette porte :

| | Passe 1 | Passe 2 |
|---|---|---|
| Fin | « Recharger la page » | « Recharger la page » |
| Durée (du choix du fichier à la fenêtre) | 12,9 s | 12,7 s |
| Copies écrites | 407 sur 407 | 407 sur 407 |
| Mémoire de la page au repos | non relevée | 307 Mo |
| Pic de la page | 1 790 Mo | 1 761 Mo |
| Pic, tous les processus de Chromium | 2 456 Mo | 2 372 Mo |
| Erreurs de page | aucune | aucune |

Après « Recharger » : l'application redémarre, les 407 copies sont là, le menu dit « FICTIF mesure 992 (1000 Mo) » et « Ton codex est à jour ».

**Ce que ça dit (fait)** : dans Chromium, ouvrir 1 Go fait monter la page d'environ 1,45 Go au-dessus de son repos, soit à peu près une fois et demie le fichier. C'est la trace de la lecture du fichier entier en mémoire.
**Ce que ça ne dit pas** : Safari ni l'iPad, dont la limite de mémoire par onglet est inconnue ; ni Chrome sur ton Mac, réglé autrement. *(Inféré : un Mac de 16 Go devrait tenir ; l'iPad est le vrai doute.)* Instrument : la mémoire résidente des processus relevée toutes les 200 ms, et leur pic noté par Linux. Pas le compteur que l'iPad juge (`phys_footprint`, celui de la mesure du lot J0).

**Non vérifié** :
- **L'adresse de test** : elle n'existe qu'une fois la PR ouverte.
- **WebKit** : absent du conteneur. Tout le § 2 en dépend.
- **Les chemins écrits de mémoire, non éprouvés** : Réglages › Apps › Safari › Avancé › Données des sites web (iPadOS 18 et suivants) ; l'arrivée d'un fichier AirDrop dans Fichiers ; le texte du bandeau de Safari après un rechargement forcé.
- **Le codex fictif ressemble au tien sans l'être** : rien que des PDF (ton codex du 29 sept. avait aussi 132 images JPEG, HEIC et PNG, 3 % de son poids) ; un `donnees.json` de 20 Mo fait de remplissage, contre 26 Mo au réel ; 407 copies, contre 500 pour 1,33 Go au réel. Composition reprise de `plans de travail/MESURE-2026-09-30-lot-J0-codex-memoire.md` § 2.
- **« Dernier fichier »** : après l'ouverture, le menu Codex nomme un fichier qui n'est pas celui que tu as ouvert (mesuré ici : « codex-FICTIF-mesure-992-1000-Mo-2026-11-09-20h43.zip »). Sans conséquence pour cette mesure ; observé, non inscrit.
- **Au-delà de 1 Go** : les essais à 1,3 puis 1,9 Go de `DECISIONS-A-PRENDRE-2026-10-11.md` restent possibles avec le même fabricant (`--taille 1300`, `--taille 1900`). La limite de 2 Go une fois décompressé reste en place.

## §5 · Le relevé : ce que tu rapportes

Pour **chaque appareil** :
1. **La fin** : le titre de la fenêtre (ou « page rechargée d'elle-même », ou « rien »).
2. **La durée**, en secondes.
3. **L'onglet a-t-il tenu ?** Oui ou non, et le texte de la page d'erreur ou du bandeau, s'il y en a un.
4. **Un message d'espace ?** Oui ou non, et ses deux tailles.

Pour l'**iPad**, en plus : l'espace libre noté en 0.3.

*(Relevé à verser ici au retour.)*

## Pour Claude Code, sur le Mac de Grégoire (rangée 0.1)

Sans toucher à l'arbre de travail ni à la branche courante, depuis le clone (`~/Documents/GitHub/Monitorage_v6`) :

```
git fetch origin claude/gifted-ritchie-prar2f
git show FETCH_HEAD:scripts/fabriquer-codex-fictif.mjs > "$TMPDIR/fabriquer-codex-fictif.mjs"
node "$TMPDIR/fabriquer-codex-fictif.mjs"
```

Une fois la branche fusionnée sur `main` : `node scripts/fabriquer-codex-fictif.mjs`. Le script n'a aucune dépendance, ne lit rien de l'application et écrit dans `~/Downloads`. Attendu à la fin : `==== CODEX FICTIF #992 : FABRIQUÉ ====`, puis `Copies : 407`, `Taille : 997.5 Mo`. Durée ici : 2 s.

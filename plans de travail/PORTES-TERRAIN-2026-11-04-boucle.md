# Portes terrain – la 1.232.1, boucle sans relais, passage du matin (4 novembre 2026)

> **La trace.** L'opération est l'artefact « Portes terrain 1.232.1 ». Cowork le publie à partir de ce fichier, avec le bouton « Copier mes résultats ».
> **Contexte.** Troisième passage de la boucle sans relais, le 4 nov. au matin : sept entrées faites (10 ter, 10 quinquies, 12, 13, 18, 20, 26). Version 1.232.1, build 1104-1030, commit `7cef633f`.
> **Le contenu.** Aucun geste sur tes données : ce passage n'écrit rien chez toi. Deux gestes à faire au prochain usage normal, sans rien préparer. Tout le reste est mesuré par les essais, ou relève de l'usage normal (§4).
> **Elle ne vaut qu'une fois la version en ligne** : tant que le bas de page n'affiche pas 1.232.1, elle juge la version d'avant.
> Un échec devient un item de `Retours des testeurs/SUIVI-BUGS.md`, pas une note mentale.

## §0 · Préalable
- [ ] 0.1 · Mac · Ouvre app.codexnumeris.org, recharge en vidant le cache (Cmd+Maj+R), puis lis le numéro en bas de page. ⮕ 1.232.1.

## §2 · Interface · Au prochain usage normal, sur l'iPad
Pourquoi : le 3 nov., après l'import des reprises, le vert « 13 fichier(s) importé(s) » s'est posé sur le rouge « Jetons non appliqués », et tu n'as pas eu le temps de le lire. Désormais, un rouge ou un orange reste jusqu'à « OK », et les messages s'empilent en haut à droite.
- [ ] 2.1 · iPad · La prochaine fois qu'un message rouge ou orange s'affiche, attends quelques secondes. ⮕ Il reste là ; un vert qui arrive se range dessous, sans le couvrir.
- [ ] 2.2 · iPad · Touche « OK » du doigt. ⮕ Le message part du premier coup.
- [ ] 2.3 · iPad · Si une fenêtre était ouverte sous le message (bibliothèque, aperçu), regarde son coin haut droit. ⮕ Le « × » de la fenêtre reste visible et se touche ; s'il est caché, ferme d'abord le message et note-le en échec.

## §3 · Décisions
Aucune : tes deux réponses du matin (10 sexies, 11 bis) sont versées dans la file pour le prochain passage.

## §4 · Ce que je n'ai pas pu vérifier
- **La version en ligne.** L'adresse demande l'identification Cloudflare : d'où la rangée 0.1.
- **Les messages au doigt (§2).** La pile, le « OK » et le défilement d'une longue pile (quinze rouges et un vert, à 820 × 1180) sont mesurés dans WebKit sur le Mac, avec break-tests. Le vrai Safari de l'iPad et ses fenêtres ouvertes n'y sont pas.
- **Le menu des productions (13).** « (rangée sous 203-GM6-DM) » n'apparaît que pour une production rangée sous un autre cours que le cours actif ; mesuré par Vitest sur une liste de cours fictive. Je n'ai pas vu la largeur du menu sur l'iPad avec un vrai titre long. Pas de porte (règle 2, apparence) : si le menu déborde, dis-le.
- **Les couleurs (12, 26).** Les pastilles « À réévaluer », « Non verrouillée », « Incomplet » : 7,2 pour 1 en sombre, 6,3 en clair, mesurés au navigateur. Le vert du « Total » des pratiques et du signal de la rétroaction : calculé depuis les couleurs, pas vu à l'écran. La pastille « Confidentiel » du profil garde le blanc de son bouton (une première version la rendait illisible en clair ; la relecture neuve l'a vue, corrigée avant la release).
- **Les trajectoires (10 quinquies).** Une copie plagiée ou « IA » se trace à 0 en mode Note finale, mesuré par Vitest. Le mode Habiletés trace encore ses niveaux : c'est 10 sexies, au prochain passage (ta réponse : un point vide).
- **Les erreurs de la session.** Une première version de la pile rendait aveugles neuf relevés de messages dans les essais Playwright (six rouges) ; la relecture neuve l'a vu, corrigé avant la release. Un premier passage de Vitest a croisé le break-test d'un relecteur qui travaillait dans le même dossier ; les relectures suivantes ont travaillé dans des copies isolées.

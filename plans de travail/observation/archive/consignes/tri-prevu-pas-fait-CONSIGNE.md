# Consigne commune : tri au code des entrées « prévu mais pas fait »

Contexte. Labo Codex est une application web en JavaScript pur, sans serveur. Un audit a comparé ce que l'application est censée faire (les intentions, `/home/user/Monitorage_v6/plans de travail/observation/1-intentions-scellees.md`) à ce qu'une observation à l'aveugle en a vu. Les entrées de ton lot sont des intentions que l'observation n'a pas vues (« prévu mais pas fait ») ; la plupart portent la mention « aucune mention », c'est-à-dire que l'observation n'en parle pas, ce qui ne prouve pas que la chose manque.

Ta tâche. Pour chaque entrée de ton lot, détermine en lisant le CODE de la version observée, 1.199.0, situé dans `/home/user/ref-1.199.0` (fichiers `index.html`, `js/`, `styles.css`, `css/`), si l'application fait ce que dit l'intention.

Règles.
- Lecture seule : ne modifie, ne crée, ne supprime aucun fichier, sauf ton fichier de résultat. Ne commite rien. Ne lance pas l'application.
- Le code de référence est `/home/user/ref-1.199.0`, et non `/home/user/Monitorage_v6` (version plus récente). Pour comprendre une intention, tu peux lire les lignes voisines de la ligne citée dans `1-intentions-scellees.md` (chemin ci-dessus) ; ne lis ni BACKLOG.md, ni SESSION.md, ni RELAIS.md.
- Quatre verdicts, un seul par entrée :
  - « fait » : le code fait ce que dit l'intention. Donne au moins une localisation `fichier:ligne` qui l'implémente et dis en une phrase ce qu'elle fait.
  - « en partie » : une partie est faite et une autre non, ou c'est fait autrement (autre libellé, autre règle, autre place). Dis ce qui manque ou diffère, avec `fichier:ligne`.
  - « pas fait » : rien dans le code ne le fait. Donne les termes et les fichiers cherchés (au moins trois recherches différentes).
  - « indécidable » : seul un essai réel peut trancher (rendu à l'écran, mise en page, iPad ou Safari, clavier, durée), ou l'intention est trop vague pour être cherchée. Dis pourquoi.
- Charge de la preuve. « fait » exige du code qui produit le comportement. Un nom de fonction, un commentaire, un texte d'aide ou un texte d'écran qui annonce le comportement ne prouvent pas qu'il est fait. Un message dont le texte exact diffère de celui de l'intention est « en partie ». Dans le doute entre « fait » et « en partie », choisis « en partie ».
- N'écris aucun nom d'élève réel (seulement des noms fictifs, s'il le faut). Pas de tiret cadratin (—) dans tes textes ; utilise « : » ou « ; ».

Résultat. Écris un tableau JSON dans le fichier indiqué par ta consigne de lot, un objet par entrée, dans l'ordre du lot, toutes les entrées sans exception :
`[{"id": "1.6", "verdict": "fait", "preuve": "js/accueil.js:120 : propose la démo quand aucun trimestre n'existe", "explication": "une ou deux phrases", "recherches": "termes et fichiers cherchés (obligatoire pour « pas fait » et « indécidable », facultatif sinon)"}]`
Vérifie avant de finir que ton fichier se lit avec `python3 -c "import json,sys; print(len(json.load(open(sys.argv[1]))))" <fichier>` et que le nombre d'objets égale le nombre d'entrées du lot.

Réponse finale : seulement le nombre d'entrées par verdict, en une ligne.

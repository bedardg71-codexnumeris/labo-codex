# Rapport : lot « Les deux parcours », partie 2 — « Mettre ta classe en place » (session H, nuit du 8 au 9 nov. 2026)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-1-et-2.md`, partie 2 (sur cette branche depuis la partie 1).
Plan de la nuit : `plans de travail/NUIT-2026-11-08-TRAVAIL-DANS-LE-CLOUD.md` (sur `main`, `98c04bf`), section H, étape 1.
Branche `lot/parcours-2-ma-classe`, partie de `origin/lot/parcours-1-et-2` (`a328bb9`). Non fusionnée, non publiée,
rien au changelog, pas de release. Écrit par Claude Code, session dans le nuage, sans Grégoire (il dormait).
**Tout ce qui suit a tourné sous Chromium** : WebKit n'existe pas ici. Le verdict WebKit et les captures WebKit se
prennent sur le Mac. Captures Chromium : `plans de travail/captures-2026-11-09-parcours-2-ma-classe/`.

## En tête, en gestes

### Ce qui est fait

- **« Commencer avec ma classe »**, à la fin de « Découvrir », et **« Commencer »** sur la carte « Tu enseignes ? » de
  l'accueil lancent le deuxième parcours. Il ne démarre jamais de lui-même. Si la démo est ouverte, il la referme d'abord.
- **Le Cadre bloc par bloc** (trimestre, cours, profil, étudiant·es, horaire, groupe-cours) : chaque étape ouvre son
  bloc et, s'il n'existe encore rien, son formulaire « + Nouveau… » ; elle éclaire le formulaire, pose le contour orange
  sur « Créer… », et n'avance que quand la donnée est **enregistrée**. Un « Créer le trimestre » refusé (session et
  année manquantes) laisse la bulle à l'étape 1 : mesuré.
- **La première étape non faite** : quelqu'un qui a déjà son trimestre commence au cours. Le parcours lit ce que montre
  la barre du Cadre (la même fonction, `etapesDuCadre`).
- **« Plus tard »** sur chaque bulle sauf la dernière (et Échap) : la bulle se ferme, le panneau dit « Étape n sur 8 » et
  « Reprendre », le menu montre « 2 sur 2 ». Ni un changement de section ni un rechargement ne rouvrent la bulle.
  « Reprendre » repart à la même étape.
- **Étape 7, la première saisie** : Suivi › Présences s'ouvre avec la date du cours le plus récent **dès l'arrivée**
  (le défaut de la consigne, corrigé, voir § 3) ; deux contours, sur la date et sur « Verrouiller la saisie » ; le
  tableau des étudiant·es est éclairé (on y note les absences). L'étape avance quand la saisie est verrouillée.
- **Avant le premier cours**, l'étape 7 affiche le texte prévu et « D'accord » : la bulle se ferme, le parcours attend à
  l'étape 7 ; « Reprendre » rouvre cette même bulle tant qu'aucun cours du groupe n'a eu lieu.
- **Étape 8** : la bande d'assiduité de ton groupe, éclairée ; « Terminer » fait passer le parcours à « Fait ».
- Les huit textes, la variante et les boutons sont posés **mot pour mot** ; une sentinelle les confronte à la consigne.
- Le lancement provisoire de la partie 1 est retiré.

### Ce qui attend Grégoire (une question par ligne, avec ma recommandation)

1. **Les captures Chromium** de chaque étape (1180 px, sombre) et des étapes 1, 7 et 8 à 390 px, du menu et du panneau :
   à juger. *Recommandation : les juger après celles de la partie 1, puisque la partie 2 se remettra sur elle.*
2. **Sur l'iPhone, les formulaires du Cadre sont plus hauts que l'écran** : la bulle se range au bord et couvre une
   partie du formulaire (étape 3 : elle touche l'anneau du contour ; étape 7 : la date sort de l'écran, la bulle couvre
   le tableau). C'est la règle du moteur de la partie 1 (« si rien ne tient, le côté le plus libre »), que je n'ai pas le
   droit de refondre cette nuit. *Recommandation : au moteur, sous ~500 px de large, une bulle rangée en bas et
   repliable (titre + « n sur 8 » seulement), qu'on déplie d'un toucher.*
3. **Le témoin « Enregistré » recouvre le lien « Plus tard »** de la bulle quand elle est rangée en bas à gauche (390 px,
   étapes 3 et 7 vues sur capture). Le lien est inatteignable au doigt. *Recommandation : poser la bulle au-dessus du
   témoin (moteur ou témoin, partie 1) ; à mesurer aussi sur « Découvrir ».*
4. **Les éléments de la démo dans un Cadre neuf** (mesuré, § 4) : on ne peut pas les choisir (options grisées) et la
   création d'un groupe-cours qui en forcerait un est refusée ; mais le refus et l'Aide demandent de les « Dupliquer »,
   un geste qui n'existe pas dans le Cadre. *Recommandation : les retirer des menus du Cadre hors de la démo (option (a)
   du § 4), comme Conception le fait déjà ; rien n'est écrit dans tes données.*
5. **Étape 7, la phrase « verrouille la saisie : c'est ce qui dit à l'application que ce cours a eu lieu »** tient (une
   séance laissée sans verrou et sans absence ne compte pas : mesuré), mais le verrou n'est pas le seul geste qui la
   fait compter : une absence saisie, « Confirmer la séance » ou une note la font compter aussi. Le parcours, lui,
   n'avance qu'au verrou (la consigne le dit). *Recommandation : garder la phrase ; elle guide vers un seul geste, et elle
   est vraie de ce geste.*

### Ce que j'ai supposé (une supposition nommée se corrige en dix secondes)

- **Étape 4** : le contour passe de « Prévisualiser » à « Confirmer » quand l'aperçu paraît : c'est « Confirmer » qui
  importe. La consigne ne nomme que « Prévisualiser ».
- **La variante d'avant le premier cours n'a pas de « Plus tard »** : « D'accord » fait la même chose. Échap vaut
  « D'accord ».
- **Échap sur la dernière bulle vaut « Terminer »** (comme Échap vaut « Continuer d'explorer la démo » à la fin de
  « Découvrir »).
- **« Refaire » repart à la première étape non faite** : chez quelqu'un dont tout est en place, c'est l'étape 8.
- **« Premier cours passé »** : une séance du groupe-cours actif tombe aujourd'hui ou avant (séances tirées des dates
  du trimestre et de l'horaire, lues sans rien écrire). Un trimestre sans dates n'a aucune séance : la variante dit
  alors « pas encore eu lieu », ce qui n'est pas la vraie raison. Les dates sont demandées à l'étape 1 ; le formulaire
  ne les exige pas.
- **« Plus tard » ne montre aucun message.** « Découvrir » en montre un (« Tu pourras reprendre ce parcours depuis
  « Assistance », dans le menu. ») ; le poser ici serait un texte de plus, que la consigne ne demande pas.

### Ce que je n'ai pas pu vérifier ici

- WebKit (Safari, iPad) : rien n'a tourné sous WebKit. À refaire sur le Mac : `parcours-2-ma-classe`, `parcours-1-et-2`
  et les specs listées au § 6.
- La suite Playwright complète : seulement les specs touchées (§ 6), sous Chromium.
- Les données réelles de Grégoire : rien n'a été lu ni écrit. *À mesurer sur le Mac* : sur ton poste, le parcours
  commencerait à l'étape 8 si ton trimestre d'automne, ton groupe-cours et une séance verrouillée sont en place.

## 1. Ce qui change, par fichier

(à compléter)

## 2. Les deux affirmations à vérifier avant de poser les textes

(à compléter)

## 3. Le défaut de la consigne : la date vide de Présences

(à compléter)

## 4. Les éléments de la démo dans un Cadre neuf (mesuré, rien d'écrit)

(à compléter)

## 5. Trouvailles, et leur issue

(à compléter)

## 6. Tests

(à compléter)

## 7. Relecture par un agent neuf

(à compléter)

## À inscrire au BACKLOG

(à compléter)

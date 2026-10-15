# Décisions du 15 octobre 2026 – « Ton codex dit vrai » (#994, #993, #1020)

> Écrit par Cowork au fil des réponses de Grégoire. Dernière écriture : 15 octobre 2026, 9 h 24 (Toronto).
> Les mots entre guillemets sont des mots d'écran acceptés par Grégoire : à recopier tels quels.

## Question 1 – Le message quand le codex ne s'écrit pas (#994) – décidée à 9 h 18

**Décision de Grégoire (« ça convient ») :** le message ne devine plus la cause.

- Fenêtre « Codex non mis à jour », toute issue sans fichier écrit (fenêtre de choix, partage, téléchargement dit absent) :
  « Le fichier (<taille>) n'a pas été enregistré. Tes données restent dans l'application. Si ça se répète, utilise « Signaler un bug » : le détail y sera. »
- Seulement quand le navigateur signale lui-même un manque d'espace (`QuotaExceededError`), la phrase d'espace s'ajoute, sans le « si » :
  « Ton appareil manque d'espace : libères-en, puis réessaie. »
  Non mesuré : que Safari et Chrome rendent bien `QuotaExceededError` sur un disque plein. S'ils ne le font pas, le message neutre s'affiche, et il reste vrai.
- Fenêtre « Codex à part non écrit » (avant une suppression) : même règle, avec « rien n'a été supprimé » à la place de « Tes données restent dans l'application » :
  « Le fichier (<taille>) n'a pas été enregistré : rien n'a été supprimé. Si ça se répète, utilise « Signaler un bug » : le détail y sera. »
- Les boutons « Réessayer » et « Télécharger à la place » ne changent pas.

## Question 2 – Les tailles affichées (#993) – décidée à 9 h 22

**Décision de Grégoire (« oui ») :** l'application compte les tailles comme le système de la personne : base 1000 sur Mac et iPad, base 1024 sur Windows. Chacun lit dans l'application le nombre que son appareil lui montre.

- Faits sur lesquels la décision repose : le Finder (macOS) et iPadOS divisent par 1000 ; l'Explorateur de Windows divise par 1024 et écrit « Ko », « Mo », « Go ». Sous Linux, l'environnement de bureau décide.
- Prix assumé : un même codex n'affiche pas le même nombre sur un Mac et sur un PC sous Windows.
- Les unités restent « Ko », « Mo », « Go ».
- Partout où l'application dit une taille de fichier à l'usager : une seule fonction, tous les écrans (une douzaine d'endroits calculent aujourd'hui une taille chacun à leur façon : `codex.js`, `codex-data.js`, `codex-data-ui.js`, `fichier-sortant.js`, `reserve.js`, `securite-export-preview.js`, `travaux-stockage.js`, `travaux-ui.js`, `import-export.js`, `partage-import.js`, `tampons-bibliotheque.js`, `registre-longitudinal.js`, `trimestres.js` ; inventaire à remesurer à l'ouverture du lot).
- Décidé par Cowork, technique : les limites de taille gardent leur valeur réelle en octets (ex. 2 × 1024³ pour un codex décompressé) ; seul leur affichage suit la règle. Tout système qui n'est pas Windows compte en base 1000. Hors champ : les « K car. » de `db.js`, qui comptent des caractères, pas des octets.

## Question 3 – La fenêtre du codex à part (#1020) – décidée à 9 h 23

**Décision de Grégoire (« ça convient ») :** la fenêtre dit ce que fera vraiment la réouverture du codex à part.

- Fenêtre « Avant de supprimer, un codex à part » (`ecrireCodexAPartAvantSuppression`, `js/codex.js`), la phrase qui suit la première (la première, propre à chaque geste, ne change pas) :
  « L'application va d'abord écrire un codex à part, sous un autre nom. Tes prochaines mises à jour n'y toucheront pas. Le rouvrir ramènerait ce que tu supprimes, mais remettrait aussi le reste de tes données dans leur état d'aujourd'hui : des changements faits entre-temps pourraient être perdus. »
- Remplace : « … Tes prochaines mises à jour n'y toucheront pas : il te permettra de revenir en arrière. » (mots du 2 oct. 2026, 20 h 28).
- « pourraient » est voulu : mesuré au banc le 4 oct., une clé née après le codex n'est pas touchée (une évaluation survit).
- Écartée pour ce lot : faire que le codex à part ne ramène que ce qui a été supprimé (un chantier, pas des mots).
- Reste ouvert sous #1020, hors de ce lot : après la réouverture, les mises à jour s'écriraient sous le nom « … avant-suppression ».

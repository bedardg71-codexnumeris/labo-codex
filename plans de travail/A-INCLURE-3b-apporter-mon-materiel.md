# À inclure dans la consigne du lot 3b – « Apporter mon matériel »

> Tenu par Cowork, ouvert le 17 octobre 2026 à 8 h 51 (Toronto). Ce que la consigne de 3b devra porter, noté au fil de la journée pour ne pas le perdre. Pas une consigne : Claude Code n'exécute rien d'ici.

## 1. Dire à l'utilisateur de partir du fichier d'origine, pas d'un PDF

Demande de Grégoire (17 oct., 8 h 51) : informer l'utilisateur qu'il obtiendra de meilleurs résultats en copiant sa grille depuis Word, Pages ou un autre traitement de texte, parce qu'un PDF ne transmet le texte que comme un bloc désordonné, sans ses cases ; le motiver à reprendre sa grille originale. Mesuré : `lireHtml` exige un `<table>`, `lireTexte` des tabulations ; un collage depuis un PDF n'apporte en général ni l'un ni l'autre.

Textes proposés par Cowork (8 h 53), **validés par Grégoire à 8 h 53**, la première précisée à sa demande (sélectionner le tableau lui-même, pas seulement le texte des cases) :

- Accueil, étape 1 « Copie ton tableau » (`index.html` ~4180), remplace « Dans Word ou Pages, sélectionne la grille en entier, puis copie-la. » :
  > Ouvre ta grille dans son fichier d'origine (Word, Pages ou un autre traitement de texte), sélectionne le tableau entier, et non seulement le texte de ses cases, puis copie-le. Copié depuis un PDF, il arriverait sans ses cases, en texte désordonné.
- Message quand aucun tableau n'est trouvé (`L.MESSAGE_SANS_TABLEAU`, `materiel-lecture.js` ~370) :
  > L'application n'a pas trouvé de tableau dans ce que tu as collé. Si ta grille vient d'un PDF, ce serait la cause : un PDF ne transmet que du texte, sans ses cases. Tu pourrais la copier depuis son fichier d'origine (Word, Pages ou un autre traitement de texte), en sélectionnant le tableau entier, ou la taper à la main.

## 2. Les mises en page essayées par Grégoire

Proposé à 8 h 48 : chaque modèle de grille qu'il essaie (capture de l'original et de la lecture) devient une grille fictive de même forme dans les bancs, textes inventés. À verser au lot 3b au fur et à mesure.

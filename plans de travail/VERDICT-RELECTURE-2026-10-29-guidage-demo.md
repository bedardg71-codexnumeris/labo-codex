# Verdict de relecture – Le guidage de la démo et la fenêtre « Données démo » (#1152)

> Cowork, jeudi 29 octobre 2026, 8 h 52 (Toronto, mesuré par `date`), sur `main` = `ef36494b`. Lu : le rapport de Claude Code, la liste des fichiers de `433cd2da` (`js/navigation.js` et `js/config.js` non touchés). Comparaison indépendante : chacun des 17 textes « APRÈS » du fichier TEXTES, espaces et apostrophes normalisés, retrouvé dans `js/guidage-demo.js` ; la clé `suivi-groupe` présente. Vitest et Playwright non rejoués.

## Verdict

**Accepté sans retouche.** La bulle de Suivi du groupe s'affiche par l'appel existant, vu à l'écran (WebKit) ; la bulle morte est retirée ; la typographie suit la consigne.

**Le rouge de Vitest n'est pas de ce lot** : le garde-fou #825 refuse un `pack-demo-10.js` changé sans release (`68ce070a`, les totems, une autre instance). Il passe au vert avec la release du soir ; d'ici là, le crochet avant push le retiendrait, ce qui est voulu.

La trouvaille du glossaire (« Cartouche de rétroaction », « Niveau RàI ») : *inscrite et continuer*, juste.

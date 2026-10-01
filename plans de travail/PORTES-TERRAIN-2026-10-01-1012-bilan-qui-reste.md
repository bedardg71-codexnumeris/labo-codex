# Portes terrain – chantier du codex, #1012, premier lot : le bilan qui reste

> Écrites le 1er octobre 2026, à 13 h 47 (Toronto, mesurée par `date`), par Claude Code (ce markdown : la trace). **Cowork publie l'artefact jumeau** (cases, champs de saisie, bouton « Copier mes résultats »).
> **Le numéro à lire : 1.173.3** (build `1001-1346`). **En ligne depuis 14 h 41, le 1er octobre 2026** (mesuré chez Netlify : déploiement de production prêt sur `56a94cd8`, publié à 14 h 41 min 37 s ; le fichier servi lui-même n'a pas été lu). La porte peut se faire.
> Un seul appareil : **Mac, dans Chrome**. Adresse : `https://app.codexnumeris.org`. L'iPad n'est pas concerné : dans Safari, « Mettre à jour le codex » télécharge toujours un nouveau fichier.
> **Pourquoi trois rangées seulement** : les mots de la fenêtre, le bandeau retiré, et le fichier dans lequel le codex est écrit après chaque fin d'ouverture sont jugés par les bancs (WebKit). Seul ton Chrome, avec ton vrai codex, peut dire que la fenêtre reste à l'écran chez toi et que le menu ne propose plus d'écrire dans le même fichier.
> **Tes données** : ⛔ **aucune rangée n'écrit dans ton fichier de codex, et tu ne cliques nulle part « Mettre à jour le codex ».** Tout se passe dans une fenêtre de navigation privée : elle a son propre espace, vide, et l'oublie à sa fermeture. Ta fenêtre normale et tes données de travail ne sont pas touchées.
> Ce qui échoue devient un item du BACKLOG, pas une note.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 `Mac · Chrome` | Ouvre l'application et recharge de force (⌘ + Maj + R). Lis le numéro en bas de page. | **1.173.3** (champ : le numéro lu). Si tu lis 1.173.2 ou moins : arrête-toi, le lot n'est pas en ligne. |

## §1 · Ton vrai codex, en fenêtre privée `Données réelles, en lecture`

À la porte de midi, le bilan « Import incomplet… » était un bandeau jaune qui partait trop vite, et son conseil (« Libère de l'espace ») ne disait pas comment, ni qu'en fenêtre privée il n'y a rien à libérer. Maintenant, le bilan est dans une fenêtre qui attend ta réponse, avec tes mots de 12 h 40.

| | Geste | Attendu |
|---|---|---|
| 1.1 `Mac · Chrome` `fenêtre privée` | Ouvre une fenêtre de navigation privée (⌘ + Maj + N), et l'application dedans. Menu Codex, en haut de l'écran → « Ouvrir un codex… », puis choisis le fichier de ton codex. Laisse l'ouverture se terminer, **et ne réponds pas tout de suite** : attends une bonne minute devant l'écran. | Une fenêtre de l'application, titre « **Codex ouvert, mais incomplet** ». Son texte : « … copies sur … n'ont pas pu revenir, faute d'espace. Tes données, elles, sont complètes, et ton fichier de codex n'a pas changé. » ; puis « Pour retrouver ces copies : si tu es en navigation privée, rouvre l'application dans une fenêtre normale. Sinon, libère de l'espace sur le disque de l'appareil (vide la corbeille, retire de gros fichiers), puis rouvre le même codex. » ; puis « Recharger la page pour appliquer les données ? ». Boutons « Annuler » et « Recharger ». **La fenêtre est encore là après la minute. Aucun bandeau jaune « Import incomplet… » ne passe.** (champs : les deux nombres lus ; ce qui diffère, s'il y a lieu : un mot, la fenêtre partie seule, un bandeau jaune) |
| 1.2 `Mac · Chrome` `fenêtre privée` | Clique « **Annuler** » dans cette fenêtre. Ouvre le menu Codex et **regarde** la ligne « Mettre à jour le codex ». ⛔ Tu regardes, tu ne cliques pas. | Sous « Mettre à jour le codex », **aucun** sous-texte « Dans le même fichier ». (champ : ce qui est écrit sous la ligne, s'il y a quelque chose) |
| Si 1.1 finit autrement | Note la fin que tu vois, puis ferme la fenêtre privée. | (champ) « Espace insuffisant pour ouvrir ce codex » : le refus est venu avant l'ouverture. « Recharger la page », sans le mot « incomplet » : toutes tes copies sont entrées. Dans les deux cas la porte n'a pas échoué, mais elle n'a pas vu la fenêtre du bilan. |

Quand c'est fini, ferme la fenêtre privée : rien n'a changé dans ta fenêtre normale.

Les nombres de 1.1 ne sont pas un attendu : à midi, c'était 67 sur 397 ; l'espace qu'accorde une fenêtre privée peut varier.

## §3 · Décisions

Aucune dans cette porte. Ce qui attend tes mots (l'avertissement à la mise à jour, les trois autres causes d'une ouverture incomplète) aura sa propre consigne.

## §4 · Ce qui n'a pas pu être vérifié

- **Le fichier d'avant, gardé après un refus, dans le vrai Chrome** : quand tu choisis un fichier et que son ouverture est refusée avant toute écriture (une annulation à la garde, un refus faute d'espace avant de commencer, un fichier qui n'est pas un codex), l'application doit continuer de tenir ton fichier d'avant, et non celui que tu viens de refuser. **Cette porte ne le lève pas** : le voir demanderait d'écrire dans ton vrai codex par « Mettre à jour le codex ». Les bancs le jugent dans WebKit, avec une fausse poignée de fichier et une fausse fenêtre de destination ; pour Chrome, cela reste une inférence.
- **Chrome lui-même** : tous les bancs tournent dans WebKit. La rangée 1.2 est la seule vue du vrai Chrome sur le fichier tenu, et elle ne regarde que le cas « ouverture incomplète ».
- **Les autres causes d'une ouverture incomplète** (copie absente du fichier, copie illisible, mélange de causes) : la fenêtre porte encore les phrases d'avant, sous le titre « Recharger la page ». Leur conseil « rouvre le même ZIP » y reste : leurs mots ne sont pas tranchés.
- **Après « Recharger »** : rien ne se souvient que l'ouverture était incomplète. C'est le lot de l'avertissement, non codé.
- **La suite complète au navigateur** : prise après l'écriture de cette porte, sur `56a94cd8` : verte, 0 échec, aucune spec instable (rendue à 14 h 39). Elle tourne dans WebKit, pas dans Chrome.

## §5 · Relevé de Grégoire (1er oct. 2026, 16 h 55 ; reçu par Cowork, rapporté par sa consigne de 16 h 56)

**PORTE PASSÉE : trois rangées sur trois.** Dans Chrome, en fenêtre privée, avec son vrai codex. Aucun constat écrit.

| Rangées | Relevé |
|---|---|
| 0.1, 1.1, 1.2 | **Passées.** |

**Non relevé** : les deux nombres de la fenêtre (rangée 1.1) ; ce n'était pas un attendu. Les quatre points du §4 restent tels quels : cette porte ne les levait pas.

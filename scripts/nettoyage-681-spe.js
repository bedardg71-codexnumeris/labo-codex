/* ============================================================================
   #681 — CE QUE LE MODULE SPE A SEMÉ DANS TES DONNÉES, ET QUI Y EST ENCORE
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, NE SUPPRIME RIEN.

   POURQUOI CE SCRIPT EXISTE. `js/spe-specifications.js` (1009 lignes, 2 janvier
   2026) a été retiré le 1er septembre 2026 : 24 symboles exposés, zéro
   consommateur vivant, et trois auto-déclencheurs de fin de fichier qui
   l'allumaient tout seul à chaque chargement. Retirer le code tarit la SOURCE ;
   il ne touche à AUCUNE donnée. Les cinq objets qu'il semait vivent maintenant
   dans les bases, signés « Labo Codex », dans les listes d'un nouvel enseignant.

   ⚠⚠ EN DEUX TEMPS, ET JAMAIS EN UN SEUL. Ce script est le PREMIER temps : il
   COMPTE et il AFFICHE. Le second — décider quoi faire — appartient à Grégoire,
   sur le corpus réel. Un script qui compte et supprime dans le même passage ne
   laisse pas le temps de lire ce qu'il s'apprête à détruire.

   ⚠ LA RÈGLE QUI PRIME SUR TOUTES LES AUTRES : **un objet référencé par une
   évaluation n'est pas supprimé, il est NOMMÉ.** Une grille qui a servi à noter
   quelqu'un n'est plus du matériel de démarrage : c'est la trace d'un jugement
   posé. La perdre rendrait l'évaluation illisible.

   ── CE QU'IL RÉPOND ─────────────────────────────────────────────────────────
     Q1 — lesquels des cinq objets sont encore présents, et OÙ exactement ?
     Q2 — combien d'évaluations et de productions les référencent ?
     Q3 — lesquels sont donc LIBRES (aucune référence), et lesquels sont RETENUS ?

   ⚠ Un zéro rendu par ce script ne vaut que par ce qu'il a lu : le rapport dit
   toujours combien de trimestres et combien de clés ont été RÉELLEMENT ouverts.
   « Zéro » et « je n'ai rien regardé » ne doivent pas se ressembler.

   ── USAGE ───────────────────────────────────────────────────────────────────
   ⚠ CE SCRIPT N'EST PAS CHARGÉ PAR L'APPLICATION. Il vit dans `scripts/`, qu'aucune
   balise d'`index.html` ne réclame : dans la console, `nettoyage681` n'existe pas
   tant que le fichier n'y a pas été collé. Appeler la fonction en premier rend
   `ReferenceError: Can't find variable` — c'est arrivé le 1er septembre 2026,
   parce que l'invitation avait voyagé sans son étape 1.

   ⮕ LES TROIS GESTES, dans l'ordre. Le premier est au TERMINAL, les deux autres
   dans la console du navigateur, sur l'onglet de l'app :

       pbcopy < ~/Documents/GitHub/Monitorage_v6/scripts/nettoyage-681-spe.js

   puis Cmd+V dans la console, Entrée, puis :

       await nettoyage681()

   Repère : le rapport commence par « ==== #681 · ce que SPE a laissé ».

   ⚠ NE PAS CONFONDRE AVEC `_sonderEchellesDisciplinaires()`, l'autre sonde de ce
   chantier : celle-là vit dans `js/echelles-bibliotheque.js`, qu'`index.html`
   CHARGE — elle est donc déjà en mémoire, et un appel suffit, sans rien coller.
   Deux sondes du même jour, deux gestes différents : c'est ce qui rend l'erreur
   facile, et c'est pourquoi c'est écrit ici.
   ========================================================================== */

async function nettoyage681() {
    'use strict';

    // Les cinq objets, avec la collection où le module les écrivait.
    const CIBLES = [
        { id: 'ECHELLE_SPE_BINAIRE',               famille: 'échelle',    biblio: 'bibliothequeEchelles',    trimestre: 'echellesTemplates' },
        { id: 'GRILLE_SPE_GABARIT_PRISE_POSITION', famille: 'grille',     biblio: 'bibliothequeGrilles',     trimestre: 'grillesTemplates' },
        { id: 'GRILLE_SPE_GABARIT_PORTFOLIO',      famille: 'grille',     biblio: 'bibliothequeGrilles',     trimestre: 'grillesTemplates' },
        { id: 'GRILLE_SPE_GABARIT_ORAL',           famille: 'grille',     biblio: 'bibliothequeGrilles',     trimestre: 'grillesTemplates' },
        { id: 'PROD_SPE_GABARIT_PRISE_POSITION',   famille: 'production', biblio: 'bibliothequeProductions', trimestre: 'productions' }
    ];

    const trimestres = (db.getSync('trimestres', []) || []).filter(t => t && t.id);
    const clesLues = [];

    const lireListe = async (cleNom) => {
        const v = await db.get(cleNom);
        if (Array.isArray(v)) { clesLues.push(cleNom); return v; }
        return null;
    };

    // ── Q1 · où sont-ils ? ───────────────────────────────────────────────────
    const presences = [];
    const biblios = [...new Set(CIBLES.map(c => c.biblio))];
    for (const cleBiblio of biblios) {
        const liste = await lireListe(cleBiblio);
        if (!liste) continue;
        for (const c of CIBLES) {
            if (c.biblio !== cleBiblio) continue;
            const trouve = liste.find(o => o && (o.id === c.id || o.idOriginal === c.id));
            if (trouve) presences.push({ id: c.id, famille: c.famille, ou: cleBiblio, nom: trouve.nom || '' });
        }
    }
    for (const t of trimestres) {
        for (const c of CIBLES) {
            const liste = await lireListe(t.id + '_' + c.trimestre);
            if (!liste) continue;
            const trouve = liste.find(o => o && (o.id === c.id || o.idOriginal === c.id));
            if (trouve) presences.push({ id: c.id, famille: c.famille, ou: t.id + '_' + c.trimestre, nom: trouve.nom || '' });
        }
    }

    // ── Q2 · qui les référence ? ─────────────────────────────────────────────
    // ⚠ Les trois champs sont cherchés séparément : une grille est désignée par
    // `grilleId`, une échelle par `echelleId`, une production par `productionId`.
    // Chercher un seul champ rendrait un zéro qui ne veut rien dire.
    const references = [];
    for (const t of trimestres) {
        for (const [suffixe, type] of [['_evaluationsSauvegardees', 'évaluation'], ['_productions', 'production']]) {
            const liste = await lireListe(t.id + suffixe);
            if (!liste) continue;
            for (const item of liste) {
                if (!item) continue;
                for (const champ of ['grilleId', 'echelleId', 'productionId']) {
                    const v = item[champ];
                    if (v && CIBLES.some(c => c.id === v)) {
                        references.push({ type, ou: t.id + suffixe, champ, cible: v, itemId: item.id || '(sans id)' });
                    }
                }
            }
        }
    }

    // ── Q3 · libres ou retenus ───────────────────────────────────────────────
    const retenus = [...new Set(references.map(r => r.cible))];
    const presentsIds = [...new Set(presences.map(p => p.id))];
    const libres = presentsIds.filter(id => !retenus.includes(id));

    console.log('==== #681 · ce que SPE a laissé ====');
    console.log('Lu pour de vrai : ' + trimestres.length + ' trimestre(s), '
        + [...new Set(clesLues)].length + ' clé(s) ouverte(s).');

    if (!presences.length) {
        console.log('AUCUN des cinq objets n’est présent. Rien à décider — et ce zéro porte son témoin (voir la ligne ci-dessus).');
        return { presences, references, libres, retenus, clesLues: [...new Set(clesLues)] };
    }

    console.log('\nQ1 — PRÉSENTS (' + presences.length + ' emplacement(s)) :');
    if (console.table) console.table(presences);

    console.log('\nQ2 — RÉFÉRENCES par des évaluations ou des productions : ' + references.length);
    if (references.length && console.table) console.table(references);

    console.log('\nQ3 — LE PARTAGE :');
    console.log('  · RETENUS (référencés — NE PAS SUPPRIMER, ce sont des traces de jugements posés) : '
        + (retenus.length ? retenus.join(', ') : 'aucun'));
    console.log('  · LIBRES (aucune référence trouvée) : ' + (libres.length ? libres.join(', ') : 'aucun'));
    console.log('\n⮕ Second temps : la décision t’appartient. Ce script ne supprime rien, et il ne sait');
    console.log('   pas si un objet LIBRE t’est devenu utile — il sait seulement que rien ne le désigne.');

    return { presences, references, libres, retenus, clesLues: [...new Set(clesLues)] };
}

if (typeof window !== 'undefined') window.nettoyage681 = nettoyage681;

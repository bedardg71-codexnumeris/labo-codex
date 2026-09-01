/* ============================================================================
   #682 — LE MATÉRIEL SEMÉ CHEZ TOI : PRÉSENT ? SOUS QUEL NOM ? ET POURQUOI PAS ?
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, NE RENOMME RIEN.

   POURQUOI CETTE SONDE EXISTE. Le §3 du 1er septembre 2026 a renommé les trois
   pièces semées — « Grille de départ », « Cartouche de départ », « Échelle de
   départ (IDME) » — pour qu'elles cessent de se dire « générique (exemple) ».
   Mesuré le soir même : **le renommage n'atteint QUE les espaces neufs.**

   Le semis est idempotent par identifiant. `assurerGrilleGenerique` et
   `assurerEchelleIdmeDeDepart` vérifient la présence de l'id AVANT d'écrire et
   sortent sans rien faire si l'objet est là : ils ne recréent pas, donc ils ne
   renomment jamais. Témoin WebKit du 1er septembre, deux passages sur la même
   base : un espace vide reçoit « Grille de départ » ; une base portant déjà
   « Grille générique (exemple) » la GARDE, telle quelle.

   ⮕ Un lot de libellés qui n'atteint que les espaces neufs n'est pas livré, il
   est semé. Cette sonde mesure l'écart ; elle ne le corrige pas.

   ⚠⚠ POURQUOI ELLE NE CORRIGE PAS, ET NE DOIT PAS. Renommer une copie en base,
   c'est ÉCRIRE DANS LES DONNÉES DE QUELQU'UN. Et les deux cas n'ont rien à voir :

     · un nom que l'utilisateur N'A JAMAIS TOUCHÉ porte encore, mot pour mot, un
       libellé posé par le code. Le renommer ne lui prend rien ;
     · un nom qu'il a CHOISI lui-même est son travail. L'écraser serait le perdre
       sans qu'il l'ait demandé — et ce serait un geste irréversible.

   Cette sonde SÉPARE les deux cas et rend le compte. La décision — renommer les
   premiers, ne jamais toucher aux seconds, ou ne rien faire du tout —
   appartient à Grégoire.

   ── UNE ABSENCE N'EST PAS UN BUG ────────────────────────────────────────────
   Si une pièce manque, la sonde regarde `ressourcesSupprimees` AVANT de conclure.
   Un identifiant qui s'y trouve veut dire que l'utilisateur l'a supprimé et que
   le tombstone tient : **c'est la durabilité qui FONCTIONNE**, pas un défaut.
   Vérifié au navigateur : avec le tombstone posé, le semis ne repose rien.
   Sans lui, une absence est un fait qu'on ne sait pas encore expliquer — et la
   sonde le dit ainsi, plutôt que d'inventer une cause.

   ── USAGE ───────────────────────────────────────────────────────────────────
   ⚠ CE SCRIPT N'EST PAS CHARGÉ PAR L'APPLICATION (il vit dans `scripts/`) :
   appeler la fonction sans avoir collé le fichier rend `ReferenceError`.

   LES TROIS GESTES. Le premier au TERMINAL :

       pbcopy < ~/Documents/GitHub/Monitorage_v6/scripts/sonde-682-materiel-seme-noms.js

   puis Cmd+V dans la console du navigateur, Entrée, puis :

       await sonde682()

   Repère : le rapport commence par « ==== #682 · le matériel semé chez toi ».
   ========================================================================== */

async function sonde682() {
    'use strict';

    // Les noms QUE LE CODE A POSÉS, d'hier et d'aujourd'hui. Un nom hors de
    // cette liste a été choisi par l'utilisateur — c'est toute la distinction.
    const PIECES = [
        { id: 'GRILLE_GENERIQUE', famille: 'grille', collection: 'grillesTemplates',
          nomActuel: 'Grille de départ',
          nomsDuCode: ['Grille de départ', 'Grille générique (exemple)'] },
        { id: 'ECHELLE_IDME_DEPART', famille: 'échelle', collection: 'echellesTemplates',
          nomActuel: 'Échelle de départ (IDME)',
          nomsDuCode: ['Échelle de départ (IDME)', 'Échelle IDME (point de départ)'] },
        { id: 'CART_GENERIQUE', famille: 'cartouche', collection: null,
          nomActuel: 'Cartouche de départ',
          nomsDuCode: ['Cartouche de départ', 'Cartouche générique (exemple)'] }
    ];

    const trimestres = (db.getSync('trimestres', []) || []).filter(t => t && t.id);
    const supprimees = (await db.get('ressourcesSupprimees')) || [];
    const clesLues = [];

    const lire = async (nomCle) => {
        const v = await db.get(nomCle);
        if (Array.isArray(v)) { clesLues.push(nomCle); return v; }
        return null;
    };

    // Les cartouches vivent sur des clés `<trim>_cartouches_<grilleId>` (S5/#623).
    const clesCartouches = [];
    try {
        const toutes = await db.keys();
        (toutes || []).forEach(c => { if (typeof c === 'string' && c.indexOf('cartouches_') >= 0) clesCartouches.push(c); });
    } catch (e) { /* db.keys indisponible : les cartouches ne seront pas vues, et c'est DIT plus bas */ }

    const lignes = [];
    const absents = [];

    for (const p of PIECES) {
        const emplacements = [];
        if (p.collection) {
            for (const t of trimestres) {
                for (const essai of [t.id + '_' + p.collection, p.collection]) {
                    const liste = await lire(essai);
                    if (!liste) continue;
                    const trouve = liste.find(o => o && o.id === p.id);
                    if (trouve) emplacements.push({ cle: essai, nom: trouve.nom || '' });
                    break;
                }
            }
        } else {
            for (const c of clesCartouches) {
                const liste = await lire(c);
                if (!liste) continue;
                const trouve = liste.find(o => o && o.id === p.id);
                if (trouve) emplacements.push({ cle: c, nom: trouve.nom || '' });
            }
        }

        if (!emplacements.length) {
            absents.push({
                id: p.id, famille: p.famille,
                // ⚠ On ne dit « supprimé » que si le tombstone le dit. Sinon
                // l'absence reste une absence : un fait, pas une explication.
                cause: supprimees.indexOf(p.id) >= 0
                    ? 'SUPPRIMÉ par toi — le tombstone tient, le semis ne repose rien. La durabilité FONCTIONNE.'
                    : 'absent, et AUCUN tombstone ne l’explique — cause inconnue, à instruire.'
            });
            continue;
        }

        for (const e of emplacements) {
            const duCode = p.nomsDuCode.indexOf(e.nom) >= 0;
            lignes.push({
                id: p.id, famille: p.famille, ou: e.cle, nomEnBase: e.nom,
                statut: !duCode ? 'NOM CHOISI PAR TOI — ne jamais écraser'
                    : (e.nom === p.nomActuel ? 'à jour' : 'ancien nom du code — renommable sans rien te prendre'),
                nomActuelDuCode: p.nomActuel
            });
        }
    }

    const aRenommer = lignes.filter(l => l.statut.indexOf('renommable') >= 0);
    const aToi = lignes.filter(l => l.statut.indexOf('CHOISI PAR TOI') >= 0);

    // ⚠ `console` assumé et nommé : la sortie EST le produit de cette sonde.
    console.log('==== #682 · le matériel semé chez toi ====');
    console.log('Lu pour de vrai : ' + trimestres.length + ' trimestre(s), '
        + clesLues.length + ' clé(s) ouverte(s), ' + clesCartouches.length + ' clé(s) de cartouches repérée(s).');
    if (!clesCartouches.length) {
        console.log('⚠ Aucune clé de cartouches repérée : la cartouche de départ n’a PAS été cherchée.');
    }

    if (lignes.length && console.table) console.table(lignes);
    if (absents.length && console.table) console.table(absents);

    console.log('\nCE QUE ÇA DONNE :');
    console.log('  · à jour ....................... ' + lignes.filter(l => l.statut === 'à jour').length);
    console.log('  · ancien nom du code ........... ' + aRenommer.length + (aRenommer.length ? '  ⮕ renommables sans rien t’enlever' : ''));
    console.log('  · noms que TU as choisis ....... ' + aToi.length + (aToi.length ? '  ⛔ à ne jamais écraser' : ''));
    console.log('  · absents ...................... ' + absents.length);
    if (!lignes.length && !absents.length) {
        console.log('  ZÉRO ligne — et ce zéro porte son témoin : voir le compte de clés ouvertes ci-dessus.');
    }
    console.log('\n⮕ Cette sonde ne renomme rien. La décision t’appartient, et elle a trois formes :');
    console.log('   (a) ne rien faire — les anciens noms restent, le §3 ne vaut que pour les nouveaux espaces ;');
    console.log('   (b) renommer UNIQUEMENT les « ancien nom du code » — aucun de tes choix n’est touché ;');
    console.log('   (c) autre chose, que tu diras.');

    return { lignes: lignes, absents: absents, aRenommer: aRenommer, aToi: aToi, clesLues: clesLues };
}

if (typeof window !== 'undefined') window.sonde682 = sonde682;

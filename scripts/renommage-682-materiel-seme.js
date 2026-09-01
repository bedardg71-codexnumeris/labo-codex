/* ============================================================================
   #682 — RENOMMER LES LIBELLÉS DU MATÉRIEL SEMÉ (option (b) de Grégoire)
   ----------------------------------------------------------------------------
   DEUX MODES. Par défaut il COMPTE et n'écrit rien. Il n'écrit que si on le lui
   demande explicitement, et il publie alors un compte AVANT / APRÈS.

   POURQUOI. Le §3 du 1er septembre 2026 a renommé les trois pièces semées. Mais
   le semis est idempotent par identifiant : il ne recrée pas, DONC IL NE RENOMME
   JAMAIS ce qui est déjà en base (#682). Le renommage n'atteignait que les
   espaces neufs.

   ⚠⚠ LA CONDITION D'ÉCRITURE, ET ELLE N'EST PAS UNE PRÉCAUTION.
   Un nom n'est réécrit QUE s'il est STRICTEMENT ÉGAL, caractère pour caractère,
   à un libellé que le code a écrit — présent ou passé. Tout autre nom appartient
   à l'utilisateur, et n'est JAMAIS touché : pas d'approximation, pas de
   « commence par », pas de comparaison insensible à la casse ou aux accents.

   ⮕ Cette règle vaut aussi le jour où ce script tournera chez QUELQU'UN D'AUTRE
   que Grégoire, dont on ne connaît ni les habitudes ni les renommages. C'est
   pour ce cas-là qu'elle est écrite ainsi, pas pour aujourd'hui.

   ── USAGE ───────────────────────────────────────────────────────────────────
   ⚠ Ce script n'est PAS chargé par l'application : sans l'étape 1, l'appel rend
   `ReferenceError`.

       pbcopy < ~/Documents/GitHub/Monitorage_v6/scripts/renommage-682-materiel-seme.js

   puis Cmd+V dans la console, Entrée, puis — DANS CET ORDRE :

       await renommage682()                    // compte, n'écrit RIEN
       await renommage682({ executer: true })  // écrit, et publie avant/après

   ⛔ NE JAMAIS lancer le second sans avoir LU la sortie du premier.
   Repère : le rapport commence par « ==== #682 · renommage du matériel semé ».
   ========================================================================== */

async function renommage682(options) {
    'use strict';
    const executer = !!(options && options.executer === true);

    // Les libellés QUE LE CODE A ÉCRITS, d'hier et d'aujourd'hui. Cette liste est
    // la CONDITION d'écriture : hors d'elle, on ne touche à rien.
    const PIECES = [
        { id: 'GRILLE_GENERIQUE', famille: 'grille', collection: 'grillesTemplates',
          cible: 'Grille de départ', duCode: ['Grille de départ', 'Grille générique (exemple)'] },
        { id: 'ECHELLE_IDME_DEPART', famille: 'échelle', collection: 'echellesTemplates',
          cible: 'Échelle de départ (IDME)', duCode: ['Échelle de départ (IDME)', 'Échelle IDME (point de départ)'] },
        { id: 'CART_GENERIQUE', famille: 'cartouche', collection: null,
          cible: 'Cartouche de départ', duCode: ['Cartouche de départ', 'Cartouche générique (exemple)'] }
    ];

    const trimestres = (db.getSync('trimestres', []) || []).filter(t => t && t.id);
    const supprimees = (await db.get('ressourcesSupprimees')) || [];
    const clesLues = [];

    // Toutes les clés porteuses, par famille. Les cartouches vivent sur
    // `<trim>_cartouches_<grilleId>` (S5/#623), d'où le balayage par `db.keys()`.
    let toutesCles = [];
    try { toutesCles = (await db.keys()) || []; } catch (e) { toutesCles = []; }

    const clesPour = (p) => {
        if (p.collection) return trimestres.map(t => t.id + '_' + p.collection);
        return toutesCles.filter(c => typeof c === 'string' && c.indexOf('cartouches_') >= 0);
    };

    const aFaire = [];      // strictement égal à un libellé du code, et pas déjà à jour
    const aJour = [];
    const intouchables = [];  // noms choisis par l'utilisateur
    const absencesParTrimestre = [];

    for (const p of PIECES) {
        const clesVues = {};
        let trouveQuelquePart = false;
        for (const c of clesPour(p)) {
            if (clesVues[c]) continue;
            const liste = await db.get(c);
            if (!Array.isArray(liste)) continue;
            clesVues[c] = true;
            clesLues.push(c);
            const item = liste.find(o => o && o.id === p.id);
            if (!item) continue;
            trouveQuelquePart = true;
            const nom = item.nom || '';
            // ⚠ ÉGALITÉ STRICTE. Aucune normalisation : c'est la condition.
            const ecritParLeCode = p.duCode.indexOf(nom) >= 0;
            if (!ecritParLeCode) intouchables.push({ id: p.id, ou: c, nom: nom });
            else if (nom === p.cible) aJour.push({ id: p.id, ou: c, nom: nom });
            else aFaire.push({ id: p.id, ou: c, avant: nom, apres: p.cible, collection: p.collection });
        }
        // Le détail par TRIMESTRE : c'est lui qui a manqué à la sonde précédente,
        // qui ne disait « absent » que si l'objet manquait PARTOUT.
        if (p.collection) {
            for (const t of trimestres) {
                const liste = await db.get(t.id + '_' + p.collection);
                const present = Array.isArray(liste) && liste.some(o => o && o.id === p.id);
                if (!present) {
                    absencesParTrimestre.push({
                        id: p.id, trimestre: t.id,
                        tombstone: supprimees.indexOf(p.id) >= 0 ? 'OUI' : 'non',
                        ailleurs: trouveQuelquePart ? 'oui' : 'nulle part'
                    });
                }
            }
        }
    }

    console.log('==== #682 · renommage du matériel semé ====');
    console.log('Mode : ' + (executer ? '⚠ ÉCRITURE' : 'lecture seule (aucune écriture)'));
    console.log('Lu pour de vrai : ' + trimestres.length + ' trimestre(s), ' + clesLues.length + ' clé(s) ouverte(s).');
    console.log('  · à renommer .............. ' + aFaire.length);
    console.log('  · déjà à jour ............. ' + aJour.length);
    console.log('  · noms que TU as choisis .. ' + intouchables.length + '  ⛔ jamais touchés');
    if (intouchables.length && console.table) console.table(intouchables);
    if (aFaire.length && console.table) console.table(aFaire);

    if (absencesParTrimestre.length) {
        console.log('\n⚠ ABSENCES PAR TRIMESTRE — ce que la sonde précédente ne disait pas :');
        if (console.table) console.table(absencesParTrimestre);
        console.log('  « tombstone=OUI » ⮕ tu l’as supprimé, et le tombstone est GLOBAL : plus aucun');
        console.log('  trimestre ne le recevra, même créé demain. C’est #683.');
        console.log('  « tombstone=non, ailleurs=oui » ⮕ le semis n’a simplement jamais tourné dans');
        console.log('  ce trimestre-là : il ne tourne qu’au CHARGEMENT de la page, jamais à la bascule.');
    }

    if (!executer) {
        console.log('\n⮕ Rien n’a été écrit. Pour écrire : await renommage682({ executer: true })');
        return { aFaire: aFaire, aJour: aJour, intouchables: intouchables, absencesParTrimestre: absencesParTrimestre, ecrit: 0 };
    }

    if (!aFaire.length) {
        console.log('\nRien à renommer. Aucune écriture.');
        return { aFaire: aFaire, aJour: aJour, intouchables: intouchables, absencesParTrimestre: absencesParTrimestre, ecrit: 0 };
    }

    // ── ÉCRITURE ────────────────────────────────────────────────────────────
    // Par la file, une clé à la fois, et la condition est REVÉRIFIÉE À L'INSTANT
    // de l'écriture : entre la lecture et ici, l'utilisateur a pu renommer.
    const avantApres = [];
    let ecrit = 0;
    for (const t of aFaire) {
        const p = PIECES.find(x => x.id === t.id);
        await db.modifier(t.ou, (lues) => {
            const liste = lues || [];
            const item = liste.find(o => o && o.id === t.id);
            if (!item) return undefined;
            if (p.duCode.indexOf(item.nom) < 0) return undefined;   // ⛔ plus du code : on ne touche pas
            if (item.nom === p.cible) return undefined;             // déjà à jour
            avantApres.push({ id: t.id, ou: t.ou, avant: item.nom, apres: p.cible });
            item.nom = p.cible;
            ecrit++;
            return liste;
        }, []);
    }

    console.log('\n==== ÉCRITURE FAITE — le compte AVANT / APRÈS ====');
    if (console.table) console.table(avantApres);
    console.log('  · renommés ................ ' + ecrit);
    console.log('  · autres écritures ........ 0  (aucune autre clé n’a été modifiée)');
    console.log('  · noms personnels touchés . 0  (la condition d’égalité stricte les exclut)');
    console.log('\n⮕ Relance `await renommage682()` : « à renommer » doit rendre 0.');
    return { aFaire: aFaire, aJour: aJour, intouchables: intouchables,
             absencesParTrimestre: absencesParTrimestre, ecrit: ecrit, avantApres: avantApres };
}

if (typeof window !== 'undefined') window.renommage682 = renommage682;

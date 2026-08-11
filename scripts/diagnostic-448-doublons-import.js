/* ============================================================================
   #448 — Les collections ont-elles doublé à l'import ?
   ----------------------------------------------------------------------------
   LECTURE SEULE. Ce fichier n'écrit rien, ne supprime rien, ne répare rien.
   Il compte, il compare, il rapporte.

   POURQUOI IL EXISTE
   Le 11 août 2026, Grégoire a exporté son codex depuis Chrome et l'a importé
   dans Safari, pour que le trimestre a2026 (sa rentrée) existe des deux côtés.
   Sa mesure de l'occupation du localStorage était AVEUGLE à ce qu'on cherche :
     · elle ne voit QUE localStorage — tout ce qui dépasse 25 Ki caractères
       part en IndexedDB et lui est invisible ;
     · un total qui BAISSE ne veut pas dire « rien n'est entré » : des clés
       peuvent avoir été remplacées, ou déplacées vers IndexedDB.
   Le doublement de #448 ne se voit pas en octets. Il se voit en COMPTANT les
   éléments d'une collection et en cherchant ceux qui portent le même nom.

   CE QU'IL FAUT SAVOIR POUR LIRE LE RAPPORT
   Deux éléments de même nom ne sont PAS forcément un défaut : Grégoire a
   deux échelles « IDME et niv 0 » qui sont réellement utilisées toutes les
   deux (item #450). Ce qui accuse #448, c'est un GROUPE DE MÊME NOM dont les
   copies ne sont citées NULLE PART — l'import a fabriqué un jumeau que rien
   ne référence. Le rapport distingue les deux.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. taper :  await diag448()
   Repère : le rapport commence par « ==== #448 · doublons d'import · LECTURE
   SEULE ». S'il ne s'affiche pas, le fichier n'est pas passé.
   ========================================================================= */

(function () {
    'use strict';

    // Familles à examiner. Les clés namespacées sont préfixées par trimestre
    // (h2026_, a2026_…) ; `cartouches_<grilleId>` ne l'est pas et se découvre
    // par balayage.
    var FAMILLES_NAMESPACEES = [
        { cle: 'grillesTemplates', nom: 'Grilles' },
        { cle: 'echellesTemplates', nom: 'Échelles' },
        { cle: 'productionsCours', nom: 'Productions' },
        { cle: 'pratiquesConfigurables', nom: 'Pratiques' }
    ];

    function nomDe(item) {
        if (!item || typeof item !== 'object') return '(sans objet)';
        return String(item.nom || item.titre || item.libelle || item.name || '(sans nom)');
    }

    async function toutesLesCles() {
        // db.keys() rend les clés d'IndexedDB quand il est disponible ; on y
        // ajoute localStorage pour ne rien manquer si le repli est actif.
        var vues = new Set();
        try {
            var k = await db.keys();
            for (var i = 0; i < k.length; i++) vues.add(k[i]);
        } catch (e) { /* IDB indisponible : localStorage suffira */ }
        for (var j = 0; j < localStorage.length; j++) vues.add(localStorage.key(j));
        return Array.from(vues);
    }

    /**
     * Combien de fois cet identifiant est-il cité AILLEURS que dans sa propre
     * collection ? Un élément cité 0 fois est un candidat de copie morte.
     */
    function compterCitations(id, corpusParCle, cleSource) {
        var n = 0;
        for (var cle in corpusParCle) {
            if (cle === cleSource) continue;
            var texte = corpusParCle[cle];
            if (!texte) continue;
            var depuis = 0, pos;
            while ((pos = texte.indexOf(id, depuis)) !== -1) { n++; depuis = pos + id.length; }
        }
        return n;
    }

    async function diag448() {
        console.log('==== #448 · doublons d\'import · LECTURE SEULE ====');

        var cles = await toutesLesCles();

        // Corpus textuel de TOUTES les clés, pour compter les citations.
        var corpus = {};
        for (var c = 0; c < cles.length; c++) {
            try {
                var v = await db.get(cles[c]);
                corpus[cles[c]] = (v === null || v === undefined) ? '' : JSON.stringify(v);
            } catch (e) { corpus[cles[c]] = ''; }
        }

        // Quels trimestres existent ici ?
        var trimestres = [];
        try {
            var reg = await db.get('trimestres');
            if (Array.isArray(reg)) trimestres = reg.map(function (t) { return t && (t.id || t.cle); }).filter(Boolean);
        } catch (e) { /* laissé vide */ }
        console.log('Trimestres déclarés : ' + (trimestres.length ? trimestres.join(', ') : '(aucun)'));

        var aExaminer = [];
        for (var f = 0; f < FAMILLES_NAMESPACEES.length; f++) {
            var fam = FAMILLES_NAMESPACEES[f];
            for (var t = 0; t < cles.length; t++) {
                if (cles[t] === fam.cle || cles[t].endsWith('_' + fam.cle)) {
                    aExaminer.push({ nom: fam.nom, cle: cles[t] });
                }
            }
        }
        for (var g = 0; g < cles.length; g++) {
            if (cles[g].indexOf('cartouches_') === 0) {
                aExaminer.push({ nom: 'Cartouches', cle: cles[g] });
            }
        }

        var totalElements = 0;
        var totalSuspects = 0;
        var totalHomonymesVivants = 0;

        for (var a = 0; a < aExaminer.length; a++) {
            var cible = aExaminer[a];
            var liste = null;
            try { liste = await db.get(cible.cle); } catch (e) { continue; }
            if (!Array.isArray(liste) || liste.length === 0) continue;

            totalElements += liste.length;

            // Regrouper par nom : c'est la seule identité qui survit à une
            // régénération d'identifiant.
            var parNom = {};
            for (var i2 = 0; i2 < liste.length; i2++) {
                var n2 = nomDe(liste[i2]);
                (parNom[n2] = parNom[n2] || []).push(liste[i2]);
            }

            var lignes = [];
            for (var nom in parNom) {
                var groupe = parNom[nom];
                if (groupe.length < 2) continue;

                var details = groupe.map(function (item) {
                    var id = item && item.id ? String(item.id) : '(sans id)';
                    return { id: id, citations: compterCitations(id, corpus, cible.cle) };
                });
                var muets = details.filter(function (d) { return d.citations === 0; }).length;

                // ⚠ Le verdict, et il n'est PAS automatique : si toutes les
                // copies sont citées, ce sont des homonymes légitimes (cas des
                // deux « IDME et niv 0 »). Si certaines ne le sont jamais,
                // c'est la signature de #448.
                var verdict;
                if (muets === 0) { verdict = 'homonymes VIVANTS (tous cités) — pas #448'; totalHomonymesVivants++; }
                else if (muets === groupe.length) { verdict = '⚠ TOUS muets — à regarder de près'; totalSuspects++; }
                else { verdict = '⚠ SUSPECT #448 : ' + muets + ' copie(s) citée(s) 0 fois'; totalSuspects++; }

                lignes.push({
                    nom: nom,
                    exemplaires: groupe.length,
                    citations: details.map(function (d) { return d.citations; }).join(' / '),
                    verdict: verdict
                });
            }

            if (lignes.length > 0) {
                console.log('\n— ' + cible.nom + '  (' + cible.cle + ')  · ' + liste.length + ' éléments');
                console.table(lignes);
            }
        }

        console.log('\n==== BILAN ====');
        console.log('Éléments examinés          : ' + totalElements);
        console.log('Groupes d\'homonymes VIVANTS : ' + totalHomonymesVivants + '  (normaux — deux ressources réellement utilisées)');
        console.log('Groupes SUSPECTS #448       : ' + totalSuspects);
        if (totalSuspects === 0) {
            console.log('⮕ Aucune signature de doublement d\'import sur ces données.');
        } else {
            console.log('⮕ Copie ce rapport ENTIER avant toute décision. Rien n\'a été modifié.');
        }
        return { elements: totalElements, suspects: totalSuspects, homonymesVivants: totalHomonymesVivants };
    }

    window.diag448 = diag448;
    console.log('diag448 chargé. Tape :  await diag448()');
})();

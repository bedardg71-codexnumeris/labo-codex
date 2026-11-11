/* ===============================================================
   SUIVI LONGITUDINAL — L'ONGLET « TENDANCES », LOT 1 : LE NUAGE DE POINTS (11 nov. 2026)
   ===============================================================
   Décidé par Grégoire le 11 nov. 2026 : dans Labo › Suivi longitudinal, à côté du registre, un onglet
   pose deux mesures face à face pour les inscrit·es du registre. Une bille par inscrit·e.

   RÉVISÉ LE 11 NOV. AU SOIR, À L'APERÇU (décisions de Grégoire) :
     · RIEN DE PROPRE À UNE DISCIPLINE N'EST ÉCRIT ICI. Ni « 101 », ni « 102 », ni l'idée qu'une
       saison est « hors séquence » : la séquence de cours est DÉCLARÉE par l'enseignant·e, dans
       l'onglet (un cours d'origine, un ou plusieurs cours suivants), et les mots de l'écran
       prennent les noms des cours déclarés ;
     · L'ÉCRAN NE COMMENTE NI LA QUALITÉ DES DONNÉES NI CELLE DE L'ÉCHANTILLON. « Ce que ça dit »
       donne des comptes, et rien d'autre : pas de lien calculé entre les deux notes (le r de Pearson
       et ses seuils sont partis), pas de « c'est peu », pas de remarque sur qui a noté ;
     · LA PORTE RESTE OUVERTE : ce qu'on compare ne sera pas toujours « la note d'un cours contre la
       note du suivant ». Le nuage reçoit donc une COMPARAISON — une mesure en abscisse, une mesure
       en ordonnée, un groupe par bille (`comparaisonDeCours`) — et ne sait rien des cours. Ce lot
       n'en offre qu'une ; les autres ne sont PAS construites.

   CE QUE CE FICHIER ÉCRIT : une seule clé, `tendancesSequence` (GLOBALE, inscrite à CLES_GLOBALES
   dans trimestres.js) — la séquence déclarée, { version: 1, origine, suivants: [] }, par `db.set`,
   au GESTE seulement. Il n'écrit NI le registre NI aucun trimestre : il lit `registreLongitudinal`
   par les lecteurs de son propriétaire (js/registre-longitudinal.js : `lire`, `resultatsDe`,
   `pseudonymes`, `nomAffiche`). Les filtres et la bille ouverte sont une mémoire de SÉANCE.

   CE QUI EST TRANCHÉ ICI (suppositions nommées, corrigeables) :
     · les cours offerts à la déclaration sont ceux que le registre CONNAÎT : le code de cours des
       dossiers pour l'origine, le cours des résultats ultérieurs (texte libre) pour les suivants.
       Deux écritures d'un même cours (« 601-102 », « 601-102-MQ ») sont deux cours : le texte saisi
       fait foi, à la casse, aux accents et aux espaces près ;
     · la note d'origine est `indices.cp.actuel.P` (0-100) du dossier, TELLE QUE COPIÉE, lue
       seulement si elle est constructible, par la règle même du dossier déplié ;
     · deux dossiers du cours d'origine : le plus RÉCENT (année, puis hiver < été < automne), et la
       bulle le dit ; deux résultats pour le même cours : le plus récent, lu dans le trimestre en
       texte libre ; un trimestre illisible passe pour le plus ancien, et à égalité c'est le dernier saisi ;
     · le groupe d'une bille est sa cohorte : le trimestre du dossier d'origine retenu ;
     · sans dossier du cours d'origine, un·e inscrit·e n'est d'aucune cohorte : ni placé·e, ni compté·e ;
     · une note hors de l'échelle du nuage se pose au bord, et la bulle donne la vraie note.
   LIMITE CONNUE, NON CORRIGÉE : pour l'A2024, P n'est pas toujours la note transmise.

   LES MOTS — proposés, lus par l'enseignant·e seulement, corrigeables : tous dans MOTS.
   Lot 2 (à venir) : les graphiques par critère, les mentions « échec » et « abandon ».
   =============================================================== */

(function () {
    'use strict';

    const NOM_CLE = 'tendancesSequence';
    const VERSION = 1;
    const AXE_X = Object.freeze({ min: 50, max: 100 });
    const AXE_Y = Object.freeze({ min: 40, max: 100 });
    const PAS_GRADUATION = 10;
    const NB_TEINTES = 8;   // autant que de classes .tend-teinte-N dans styles.css
    const RANG_SAISON = Object.freeze({ hiver: 1, ete: 2, automne: 3 });
    const SAISONS = Object.freeze(['automne', 'hiver']);   // les raccourcis de sélection offerts, quand la saison existe
    const MARGE_BULLE = 4;

    /** Le seuil de réussite, sur 100 : la note de passage de l'application (js/interpretation-config.js), sa seule définition. */
    function seuilReussite() {
        return Math.round(window.NOTE_DE_PASSAGE * 100);
    }

    const MOTS = Object.freeze({
        ongletRegistre: 'Registre',
        ongletTendances: 'Tendances',
        enTete: 'D\'un cours au suivant',   // provisoire : Grégoire choisit entre trois titres (11 nov. au soir)
        intro: 'Chaque bille est un·e étudiant·e inscrit·e au registre. Touche une bille pour savoir qui c\'est.',
        videSansInscrit: 'Aucun·e étudiant·e inscrit·e au registre. Inscris d\'abord des étudiant·es dans l\'onglet « Registre », puis saisis-y les notes qu\'ils et elles obtiennent ensuite.',
        sequenceTitre: 'Ta séquence de cours',
        sequenceAide: 'Choisis le cours d\'origine, puis le ou les cours qui le suivent : le nuage place la note du premier face à celle du suivant.',
        origine: 'Cours d\'origine',
        origineAChoisir: 'Choisir…',
        suivants: 'Cours suivants',
        aucunSuivant: 'Aucune note ultérieure au registre. Saisis-les dans l\'onglet « Registre » : les cours apparaîtront ici.',
        sequenceIncomplete: 'Choisis un cours d\'origine et au moins un cours suivant pour voir le nuage.',
        filtreSuivant: 'Cours suivant',
        filtreCohortes: 'Cohortes',
        toutes: 'Toutes',
        automne: 'Automne',
        hiver: 'Hiver',
        pasEncoreDeNote: 'pas encore de note',
        axeX: (origine) => 'Note finale en ' + origine,
        axeY: (suivant) => 'Note en ' + suivant,
        zoneReussite: (origine, suivant) => 'Réussite en ' + origine + ' et en ' + suivant,
        zoneEchecSuite: (origine, suivant) => 'Réussite en ' + origine + ', échec en ' + suivant,
        zoneSousLeSeuil: (seuil, origine) => 'Sous ' + seuil + ' en ' + origine,
        nuageVide: (suivant) => 'Aucune note de ' + suivant + ' pour les cohortes cochées.',
        nuageNom: (origine, suivant, n) => 'Nuage de points : la note de ' + origine + ' et la note de ' + suivant + ', ' + accorderEtudiants(n) + '.',
        ceQueCaDit: 'Ce que ça dit',
        legende: 'Légende',
        legendeAnneau: 'Anneau blanc : la bille touchée',
        legendeSeuil: (seuil) => 'Pointillé : le seuil de réussite, ' + seuil,
        billes: ['bille', 'billes'],
        note: (cours, valeur) => cours + ' : ' + valeur,
        notes: (origine, noteX, suivant, noteY) => origine + ' : ' + noteX + ' · ' + suivant + ' : ' + noteY,
        plusieursDossiers: (origine, n) => 'Son ' + origine + ' le plus récent (' + n + ' dossiers de ce cours au registre).',
        plusieursResultats: (suivant, n) => 'Sa note de ' + suivant + ' la plus récente (' + n + ' au registre).',
        horsEchelle: 'Bille posée au bord : sa note sort de l\'échelle du nuage.',
        voirDossier: 'Voir son dossier',
        fermer: 'Fermer',
        // « Ce que ça dit » : des comptes, et rien d'autre.
        vuAucunReussi: (origine) => 'Aucun·e des étudiant·es affiché·es n\'a réussi le ' + origine + '.',
        vuUnSeul: (reussi, origine, suivant) => 'L\'étudiant·e qui a réussi le ' + origine + ' ' + (reussi ? 'a aussi réussi' : 'n\'a pas réussi') + ' le ' + suivant + '.',
        vu: (k, m, origine, suivant) => (k === 0
            ? 'Aucun·e des ' + m + ' étudiant·es qui ont réussi le ' + origine + ' n\'a réussi le ' + suivant + '.'
            : k + ' des ' + m + ' étudiant·es qui ont réussi le ' + origine + ' ' + (k === 1 ? 'a' : 'ont') + ' aussi réussi le ' + suivant + '.'),
        nonPlaces: (x, origine) => (x === 1
            ? '1 inscrit·e n\'a pas de note de ' + origine + ' calculable et n\'est pas placé·e.'
            : x + ' inscrit·es n\'ont pas de note de ' + origine + ' calculable et ne sont pas placé·es.')
    });

    /** « 1 étudiant·e », « 12 étudiant·es » (0 ou 1 : singulier, comme `accorder` du registre). */
    function accorderEtudiants(n) {
        return n + ' étudiant·e' + (Math.abs(Number(n)) >= 2 ? 's' : '');
    }

    /* ---------- Le calcul : fonctions pures, sans DOM ni stockage ---------- */

    function sansAccents(texte) {
        return String(texte == null ? '' : texte).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    /** Le nom d'un cours tel qu'on le COMPARE : à la casse, aux accents et aux espaces près. Le texte saisi, lui, reste ce qu'on affiche. */
    function cleDeCours(nom) {
        return sansAccents(nom).replace(/\s+/g, ' ').trim();
    }

    /**
     * Lit un trimestre écrit en texte libre : « H2026 », « Hiver 2026 », « a2025 », « A25 ».
     * Rend { annee, saison, rang } ; `rang` ordonne dans le temps (hiver < été < automne d'une même année),
     * et vaut -1 quand l'année ne se lit pas.
     */
    function lireTrimestre(texte) {
        const brut = sansAccents(texte);
        const quatre = brut.match(/(?:19|20)\d{2}/);
        const deux = quatre ? null : brut.match(/(?:^|\D)(\d{2})(?!\d)/);
        const annee = quatre ? Number(quatre[0]) : (deux ? 2000 + Number(deux[1]) : null);
        const lettres = brut.replace(/[^a-z]/g, '');
        const saison = lettres.startsWith('a') ? 'automne' : lettres.startsWith('h') ? 'hiver' : lettres.startsWith('e') ? 'ete' : null;
        return { annee, saison, rang: annee === null ? -1 : annee * 10 + (saison ? RANG_SAISON[saison] : 0) };
    }

    /** Le trimestre d'un dossier : son nom (« Automne 2025 ») d'abord, son id (« a2025 ») s'il ne dit pas tout. */
    function trimestreDuDossier(dossier) {
        const parNom = lireTrimestre(dossier && dossier.trimestreNom);
        if (parNom.annee !== null && parNom.saison) return parNom;
        const parId = lireTrimestre(dossier && dossier.trimestre);
        if (parId.annee !== null && parId.saison) return parId;
        return parNom.rang >= parId.rang ? parNom : parId;
    }

    /** Le dernier des plus récents : à rang égal, celui qui vient après dans la liste l'emporte. */
    function lePlusRecent(liste, rangDe) {
        let choisi = null, rangChoisi = -Infinity;
        liste.forEach((item) => {
            const rang = rangDe(item);
            if (rang >= rangChoisi) { choisi = item; rangChoisi = rang; }
        });
        return choisi;
    }

    /** Le dossier d'un·e inscrit·e dans le cours d'origine déclaré : le plus récent, et combien il y en a. */
    function dossierDuCours(eleve, origine) {
        const cherche = cleDeCours(origine);
        const dossiers = (eleve && Array.isArray(eleve.dossiers) ? eleve.dossiers : [])
            .filter((d) => d && cherche && cleDeCours(d.coursCode) === cherche);
        return { dossier: lePlusRecent(dossiers, (d) => trimestreDuDossier(d).rang), nb: dossiers.length };
    }

    /** La note finale telle que copiée dans un dossier (P, 0-100), ou null si elle n'est pas constructible ou pas chiffrée. */
    function noteDuDossier(dossier) {
        const actuel = dossier && dossier.indices && dossier.indices.cp && dossier.indices.cp.actuel;
        if (!actuel) return null;
        // La règle du dossier déplié (lignesIndices, registre-longitudinal.js) : absent = constructible.
        if (actuel.noteConstructible === false || (actuel.details && actuel.details.noteConstructible === false)) return null;
        return typeof actuel.P === 'number' && isFinite(actuel.P) ? actuel.P : null;
    }

    /** La note chiffrée d'un·e inscrit·e dans un cours suivant déclaré : la plus récente. */
    function resultatDuCours(resultats, suivant) {
        const cherche = cleDeCours(suivant);
        const retenus = (Array.isArray(resultats) ? resultats : [])
            .filter((r) => r && cherche && cleDeCours(r.cours) === cherche && typeof r.note === 'number' && isFinite(r.note));
        const choisi = lePlusRecent(retenus, (r) => lireTrimestre(r.trimestre).rang);
        return choisi ? { note: choisi.note, trimestre: String(choisi.trimestre == null ? '' : choisi.trimestre), nb: retenus.length } : null;
    }

    /** Les noms distincts d'une liste de cours, dans l'écriture où on les a d'abord vus, en ordre alphabétique. */
    function nomsDistincts(noms) {
        const vus = new Map();
        noms.forEach((nom) => {
            const propre = String(nom == null ? '' : nom).replace(/\s+/g, ' ').trim();
            if (propre && !vus.has(cleDeCours(propre))) vus.set(cleDeCours(propre), propre);
        });
        return Array.from(vus.values()).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
    }

    function elevesDe(registre) {
        const eleves = registre && registre.eleves && typeof registre.eleves === 'object' ? registre.eleves : {};
        return Object.keys(eleves).map((da) => eleves[da]).filter((e) => e && typeof e === 'object');
    }

    /** Les cours que le registre CONNAÎT : ceux des dossiers (une origine possible), ceux des résultats ultérieurs (des suivants possibles). */
    function coursConnus(registre, resultatsDe) {
        const lire = typeof resultatsDe === 'function' ? resultatsDe : (e) => (Array.isArray(e.resultatsUlterieurs) ? e.resultatsUlterieurs : []);
        const origines = [], suivants = [];
        elevesDe(registre).forEach((eleve) => {
            (Array.isArray(eleve.dossiers) ? eleve.dossiers : []).forEach((d) => { if (d) origines.push(d.coursCode); });
            (lire(eleve) || []).forEach((r) => { if (r) suivants.push(r.cours); });
        });
        return { origines: nomsDistincts(origines), suivants: nomsDistincts(suivants) };
    }

    /** Une séquence lue au stockage, ou reçue d'un geste : toujours { version, origine, suivants } propres, sans doublon. */
    function sequencePropre(brut) {
        const source = brut && typeof brut === 'object' && !Array.isArray(brut) ? brut : {};
        const origine = typeof source.origine === 'string' ? source.origine.replace(/\s+/g, ' ').trim() : '';
        const suivants = nomsDistincts(Array.isArray(source.suivants) ? source.suivants.filter((s) => typeof s === 'string') : [])
            .filter((s) => cleDeCours(s) !== cleDeCours(origine));
        return { version: VERSION, origine, suivants };
    }

    function sequenceComplete(sequence) {
        return !!sequence.origine && sequence.suivants.length > 0;
    }

    /**
     * LA COMPARAISON que ce lot offre : la note d'un cours d'origine face à la note d'un cours suivant, par cohorte.
     * Une comparaison dit au nuage, sans qu'il sache ce qu'est un cours : le nom de ses deux mesures, comment lire
     * chacune pour un·e inscrit·e (`lireX`, `lireY` : { valeur, ... } ou null), et son groupe (`groupeDe`, ou null si
     * l'inscrit·e n'en a pas). D'autres comparaisons se brancheront ici ; aucune autre n'est construite.
     */
    function comparaisonDeCours(origine, suivant, resultatsDe) {
        const lire = typeof resultatsDe === 'function' ? resultatsDe : (e) => (e && Array.isArray(e.resultatsUlterieurs) ? e.resultatsUlterieurs : []);
        return {
            nomX: origine,
            nomY: suivant,
            groupeDe(eleve) {
                const trouve = dossierDuCours(eleve, origine);
                if (!trouve.dossier) return null;
                const trimestre = trimestreDuDossier(trouve.dossier);
                return { id: String(trouve.dossier.trimestre || trouve.dossier.trimestreNom || ''),
                    nom: String(trouve.dossier.trimestreNom || trouve.dossier.trimestre || ''), saison: trimestre.saison, rang: trimestre.rang };
            },
            lireX(eleve) {
                const trouve = dossierDuCours(eleve, origine);
                const note = noteDuDossier(trouve.dossier);
                return note === null ? null : { valeur: note, nb: trouve.nb };
            },
            lireY(eleve) {
                const resultat = resultatDuCours(lire(eleve), suivant);
                return resultat ? { valeur: resultat.note, nb: resultat.nb } : null;
            }
        };
    }

    /**
     * Tout ce que l'écran montre pour une comparaison, avant le filtre des groupes :
     *   cohortes   — les groupes, du plus ancien au plus récent, chacun avec sa teinte ;
     *   points     — une bille par inscrit·e qui a ses DEUX mesures ;
     *   nonPlaces  — les inscrit·es qui ont la mesure en ordonnée, mais pas celle en abscisse.
     */
    function preparer(registre, comparaison) {
        const cohortes = new Map();
        const points = [], nonPlaces = [];
        elevesDe(registre).forEach((eleve) => {
            const groupe = comparaison.groupeDe(eleve);
            if (!groupe) return;
            if (!cohortes.has(groupe.id)) cohortes.set(groupe.id, Object.assign({ aDesNotes: false }, groupe));
            const y = comparaison.lireY(eleve);
            if (!y) return;
            cohortes.get(groupe.id).aDesNotes = true;
            const x = comparaison.lireX(eleve);
            const da = String(eleve.da);
            if (!x) { nonPlaces.push({ da, cohorte: groupe.id }); return; }
            points.push({ da, cohorte: groupe.id, x: x.valeur, y: y.valeur, nbX: x.nb, nbY: y.nb });
        });
        const liste = Array.from(cohortes.values()).sort((a, b) => a.rang - b.rang || a.nom.localeCompare(b.nom, 'fr'));
        liste.forEach((c, i) => { c.teinte = i % NB_TEINTES; });
        return { cohortes: liste, points, nonPlaces };
    }

    /** Les cohortes d'une saison (« automne », « hiver ») ou toutes (« toutes ») : leurs ids. */
    function cohortesDeSaison(cohortes, saison) {
        return cohortes.filter((c) => saison === 'toutes' || c.saison === saison).map((c) => c.id);
    }

    /** Un bouton de saison est enfoncé quand la sélection est EXACTEMENT la sienne (et qu'elle n'est pas vide). */
    function saisonEnfoncee(cohortes, selection, saison) {
        const siennes = cohortesDeSaison(cohortes, saison);
        const choisies = new Set(selection);
        return siennes.length > 0 && siennes.length === choisies.size && siennes.every((id) => choisies.has(id));
    }

    /** Ce qui reste une fois les cohortes cochées : les billes, et le compte des non placé·es. */
    function filtrer(donnees, selection) {
        const choisies = new Set(selection);
        return { points: donnees.points.filter((p) => choisies.has(p.cohorte)),
            nbNonPlaces: donnees.nonPlaces.filter((p) => choisies.has(p.cohorte)).length };
    }

    function compterZones(points) {
        const zones = { reussite: 0, echecSuite: 0, sousLeSeuil: 0 };
        const seuil = seuilReussite();
        points.forEach((p) => {
            if (p.x < seuil) zones.sousLeSeuil += 1;
            else if (p.y >= seuil) zones.reussite += 1;
            else zones.echecSuite += 1;
        });
        return zones;
    }

    /** « Ce que ça dit », sur les billes affichées : le compte de réussite, puis celui des non placé·es s'il y en a. Des comptes, aucun jugement. */
    function phrases(points, contexte) {
        const zones = compterZones(points);
        const m = zones.reussite + zones.echecSuite;
        const dites = [m === 0 ? MOTS.vuAucunReussi(contexte.origine)
            : m === 1 ? MOTS.vuUnSeul(zones.reussite === 1, contexte.origine, contexte.suivant)
                : MOTS.vu(zones.reussite, m, contexte.origine, contexte.suivant)];
        if (contexte.nbNonPlaces > 0) dites.push(MOTS.nonPlaces(contexte.nbNonPlaces, contexte.origine));
        return dites;
    }

    /** La place d'une note sur son axe, en pourcentage de l'axe (0 = le bas de l'échelle) ; une note hors de l'échelle se pose au bord. */
    function position(note, axe) {
        const brut = (note - axe.min) / (axe.max - axe.min) * 100;
        return { pourcent: Math.max(0, Math.min(100, brut)), horsEchelle: brut < 0 || brut > 100 };
    }

    /* ---------- La séquence déclarée : lue au stockage, écrite au GESTE ---------- */

    /** Lit la séquence déclarée ; une valeur absente ou étrangère se lit comme vide, sans rien écrire. */
    function lireSequence() {
        return sequencePropre(db.getSync(NOM_CLE, null));
    }

    /** Seule écriture de ce fichier : la séquence, sous sa clé à elle. Ni le registre ni un trimestre. */
    async function ecrireSequence(sequence) {
        await db.set(NOM_CLE, sequencePropre(sequence)); // security-ok: noms de cours déjà au registre, choisis dans une liste ; rendus par textContent
        if (window.annoncerEcritureUsager) window.annoncerEcritureUsager(NOM_CLE);
    }

    /* ---------- L'état de séance (jamais écrit) ---------- */

    let suivantChoisi = '';
    let selection = null;      // null : toutes les cohortes du moment
    let daOuvert = '';

    function api() {
        return window.registreLongitudinal || null;
    }

    function formater(note) {
        return formaterNombre(Math.round(Number(note) * 10) / 10);   // la virgule vit dans js/note-pourcentage.js (#1137)
    }

    /** Le cours suivant que le nuage montre : celui choisi, s'il est encore déclaré ; sinon le premier déclaré. */
    function suivantMontre(sequence) {
        const trouve = sequence.suivants.find((s) => cleDeCours(s) === cleDeCours(suivantChoisi));
        return trouve || sequence.suivants[0] || '';
    }

    /* ---------- Rendu (bâti par le DOM, textContent : aucun innerHTML, comme le registre) ---------- */

    function poser(parent, balise, classe, texte) {
        const el = document.createElement(balise);
        if (classe) el.className = classe;
        if (texte) el.textContent = texte;
        parent.appendChild(el);
        return el;
    }

    function bouton(parent, classe, texte, action) {
        const b = poser(parent, 'button', classe, texte);
        b.type = 'button';
        b.setAttribute('data-action', action);
        return b;
    }

    function bascule(parent, texte, action, enfonce) {
        const b = bouton(parent, 'tend-bascule', texte, action);
        b.setAttribute('aria-pressed', enfonce ? 'true' : 'false');
        return b;
    }

    function groupe(parent, nom) {
        const g = poser(parent, 'div', 'tend-filtre');
        g.setAttribute('role', 'group');
        g.setAttribute('aria-label', nom);
        poser(g, 'span', 'tend-filtre-nom', nom);
        return g;
    }

    /** La déclaration : un cours d'origine (liste), des cours suivants (bascules). Les champs portent `.rl-champ`, comme la saisie du registre. */
    function rendreSequence(zone, sequence, connus) {
        const bloc = poser(zone, 'section', 'tend-sequence');
        poser(bloc, 'h4', 'rl-sous-titre', MOTS.sequenceTitre);
        poser(bloc, 'p', 'texte-aide', MOTS.sequenceAide);

        const ligneOrigine = poser(bloc, 'label', 'tend-filtre');
        poser(ligneOrigine, 'span', 'tend-filtre-nom', MOTS.origine);
        const liste = poser(ligneOrigine, 'select', 'controle-form rl-champ tend-origine');
        liste.id = 'tend-origine';
        liste.setAttribute('data-on-change', 'declarerOrigineTendances');
        // Un cours déclaré que le registre ne connaît plus reste offert : on doit pouvoir le voir pour le changer.
        const origines = nomsDistincts(connus.origines.concat(sequence.origine ? [sequence.origine] : []));
        [''].concat(origines).forEach((nom) => {
            const option = poser(liste, 'option', '', nom || MOTS.origineAChoisir);
            option.value = nom;
            if (cleDeCours(nom) === cleDeCours(sequence.origine)) option.selected = true;
        });

        const ligneSuivants = groupe(bloc, MOTS.suivants);
        const offerts = nomsDistincts(connus.suivants.concat(sequence.suivants)).filter((s) => cleDeCours(s) !== cleDeCours(sequence.origine));
        if (!offerts.length) poser(ligneSuivants, 'span', 'tend-puce-note', MOTS.aucunSuivant);
        offerts.forEach((nom) => {
            const declare = sequence.suivants.some((s) => cleDeCours(s) === cleDeCours(nom));
            bascule(ligneSuivants, nom, 'declarerSuivantTendances', declare).dataset.cours = nom;
        });
    }

    function rendreFiltres(zone, sequence, suivant, donnees, choisies) {
        const filtres = poser(zone, 'div', 'tend-filtres');
        if (sequence.suivants.length > 1) {
            const choix = groupe(filtres, MOTS.filtreSuivant);
            sequence.suivants.forEach((nom) => { bascule(choix, nom, 'choisirSuivantTendances', nom === suivant).dataset.cours = nom; });
        }
        const cohortes = groupe(filtres, MOTS.filtreCohortes);
        bascule(cohortes, MOTS.toutes, 'choisirSaisonTendances', saisonEnfoncee(donnees.cohortes, choisies, 'toutes')).dataset.saison = 'toutes';
        // Les saisons : de simples raccourcis de sélection, offerts seulement quand une cohorte est de cette saison.
        SAISONS.filter((saison) => cohortesDeSaison(donnees.cohortes, saison).length > 0).forEach((saison) => {
            bascule(cohortes, MOTS[saison], 'choisirSaisonTendances', saisonEnfoncee(donnees.cohortes, choisies, saison)).dataset.saison = saison;
        });
        const puces = poser(cohortes, 'div', 'tend-puces');
        donnees.cohortes.forEach((c) => {
            const puce = bascule(puces, '', 'basculerCohorteTendances', choisies.includes(c.id));
            puce.className = 'tend-bascule tend-puce';
            puce.dataset.cohorte = c.id;
            poser(puce, 'span', 'barre-etudiant tend-bille tend-pastille tend-teinte-' + c.teinte).setAttribute('aria-hidden', 'true');
            poser(puce, 'span', '', c.nom);
            if (!c.aDesNotes) poser(puce, 'span', 'tend-puce-note', MOTS.pasEncoreDeNote);
        });
    }

    /** Une place sur l'axe horizontal (depuis la gauche) ou vertical (depuis le HAUT : une note haute est en haut), en centièmes du plan. */
    const depuisLaGauche = (note) => position(note, AXE_X).pourcent;
    const depuisLeHaut = (note) => 100 - position(note, AXE_Y).pourcent;

    function rendreZone(plan, classe, texte, compte) {
        const zone = poser(plan, 'div', 'tend-zone ' + classe);
        poser(zone, 'span', 'tend-zone-nom', texte);
        poser(zone, 'span', 'tend-zone-compte', String(compte));
        return zone;
    }

    function rendreGraduations(parent, axe, sens) {
        for (let v = axe.min; v <= axe.max; v += PAS_GRADUATION) {
            const g = poser(parent, 'span', 'tend-graduation tend-graduation-' + sens + (v === seuilReussite() ? ' tend-graduation-seuil' : ''), String(v));
            if (sens === 'x') g.style.left = depuisLaGauche(v) + '%';
            else g.style.top = depuisLeHaut(v) + '%';
        }
    }

    function rendreBulle(plan, point, cohorte, nom, comparaison) {
        // L'habit de la bulle du suivi des groupes (.barre-etudiant-info), posée ici dans le plan (.tend-bulle).
        const bulle = poser(plan, 'div', 'barre-etudiant-info tend-bulle');
        bulle.id = 'tend-bulle';
        bulle.setAttribute('role', 'group');
        bulle.setAttribute('aria-label', nom);
        const fermer = bouton(bulle, 'tend-bulle-fermer', '×', 'fermerBulleTendances');
        fermer.setAttribute('aria-label', MOTS.fermer);
        poser(bulle, 'p', 'tend-bulle-nom', nom);
        poser(bulle, 'p', 'tend-bulle-ligne', cohorte ? cohorte.nom : '');
        // Une ligne par mesure : un nom de cours est long, deux sur une ligne se coupent au milieu.
        poser(bulle, 'p', 'tend-bulle-notes', MOTS.note(comparaison.nomX, formater(point.x)));
        poser(bulle, 'p', 'tend-bulle-notes', MOTS.note(comparaison.nomY, formater(point.y)));
        if (point.nbX > 1) poser(bulle, 'p', 'tend-bulle-ligne', MOTS.plusieursDossiers(comparaison.nomX, point.nbX));
        if (point.nbY > 1) poser(bulle, 'p', 'tend-bulle-ligne', MOTS.plusieursResultats(comparaison.nomY, point.nbY));
        if (position(point.x, AXE_X).horsEchelle || position(point.y, AXE_Y).horsEchelle) poser(bulle, 'p', 'tend-bulle-ligne', MOTS.horsEchelle);
        bouton(bulle, 'btn btn-secondaire btn-sm tend-bulle-dossier', MOTS.voirDossier, 'voirDossierTendances').dataset.da = point.da;
        return bulle;
    }

    /** La bulle se pose au-dessus de sa bille (dessous si la place manque) et ne sort jamais du cadre du nuage. */
    function placerBulle() {
        const bulle = document.getElementById('tend-bulle');
        const plan = bulle && bulle.parentElement;
        const cible = plan && plan.querySelector ? plan.querySelector('.tend-cible[aria-expanded="true"]') : null;
        if (!bulle || !plan || !cible) return;
        const p = plan.getBoundingClientRect(), c = cible.getBoundingClientRect(), b = bulle.getBoundingClientRect();
        const borner = (v, max) => Math.max(MARGE_BULLE, Math.min(v, max));
        const gauche = borner(c.left + c.width / 2 - p.left - b.width / 2, p.width - b.width - MARGE_BULLE);
        let haut = c.top - p.top - b.height - MARGE_BULLE;
        if (haut < MARGE_BULLE) haut = c.bottom - p.top + MARGE_BULLE;
        bulle.style.left = gauche + 'px';
        bulle.style.top = borner(haut, p.height - b.height - MARGE_BULLE) + 'px';
    }

    function rendreNuage(zone, donnees, vue, comparaison, noms) {
        const figure = poser(zone, 'div', 'tend-nuage');
        poser(figure, 'p', 'tend-axe-nom tend-axe-nom-y', MOTS.axeY(comparaison.nomY));
        const cadre = poser(figure, 'div', 'tend-cadre');
        const graduationsY = poser(cadre, 'div', 'tend-graduations-y');
        graduationsY.setAttribute('aria-hidden', 'true');
        rendreGraduations(graduationsY, AXE_Y, 'y');

        const plan = poser(cadre, 'div', 'tend-plan');
        plan.id = 'tend-plan';
        plan.setAttribute('role', 'group');
        plan.setAttribute('aria-label', MOTS.nuageNom(comparaison.nomX, comparaison.nomY, vue.points.length));
        // Le seuil de réussite découpe le plan en trois zones ; les pointillés le tracent sur chaque axe.
        const seuilX = depuisLaGauche(seuilReussite());
        const seuilY = depuisLeHaut(seuilReussite());
        const zones = compterZones(vue.points);
        const reussite = rendreZone(plan, 'tend-zone-reussite', MOTS.zoneReussite(comparaison.nomX, comparaison.nomY), zones.reussite);
        reussite.style.left = seuilX + '%';
        reussite.style.height = seuilY + '%';
        const echec = rendreZone(plan, 'tend-zone-echec', MOTS.zoneEchecSuite(comparaison.nomX, comparaison.nomY), zones.echecSuite);
        echec.style.left = seuilX + '%';
        echec.style.top = seuilY + '%';
        rendreZone(plan, 'tend-zone-sous-seuil', MOTS.zoneSousLeSeuil(seuilReussite(), comparaison.nomX), zones.sousLeSeuil).style.width = seuilX + '%';
        const traitX = poser(plan, 'div', 'tend-seuil tend-seuil-x');
        traitX.setAttribute('aria-hidden', 'true');
        traitX.style.left = seuilX + '%';
        const traitY = poser(plan, 'div', 'tend-seuil tend-seuil-y');
        traitY.setAttribute('aria-hidden', 'true');
        traitY.style.top = seuilY + '%';
        if (!vue.points.length) poser(plan, 'p', 'tend-nuage-vide', MOTS.nuageVide(comparaison.nomY));

        let ouvert = null;
        vue.points.forEach((point) => {
            const cohorte = donnees.cohortes.find((c) => c.id === point.cohorte);
            const nom = noms(point.da);
            const estOuvert = point.da === daOuvert;
            const cible = bouton(plan, 'tend-cible' + (estOuvert ? ' tend-cible-ouverte' : ''), '', 'ouvrirBilleTendances');
            cible.dataset.da = point.da;
            cible.setAttribute('aria-expanded', estOuvert ? 'true' : 'false');
            cible.setAttribute('aria-label', nom + ', ' + (cohorte ? cohorte.nom + ', ' : '')
                + MOTS.notes(comparaison.nomX, formater(point.x), comparaison.nomY, formater(point.y)));
            cible.style.left = depuisLaGauche(point.x) + '%';
            cible.style.top = depuisLeHaut(point.y) + '%';
            // La sphère est celle du suivi des groupes (.barre-etudiant, styles.css) : une seule source ; la teinte vient de la cohorte.
            if (estOuvert) poser(cible, 'span', 'tend-anneau');
            poser(cible, 'span', 'barre-etudiant tend-bille tend-teinte-' + (cohorte ? cohorte.teinte : 0));
            if (estOuvert) ouvert = { point, cohorte, nom };
        });
        if (ouvert) rendreBulle(plan, ouvert.point, ouvert.cohorte, ouvert.nom, comparaison);

        const graduationsX = poser(cadre, 'div', 'tend-graduations-x');
        graduationsX.setAttribute('aria-hidden', 'true');
        rendreGraduations(graduationsX, AXE_X, 'x');
        poser(figure, 'p', 'tend-axe-nom tend-axe-nom-x', MOTS.axeX(comparaison.nomX));
    }

    function rendreLecture(zone, donnees, vue, comparaison) {
        const lecture = poser(zone, 'div', 'tend-lecture');
        poser(lecture, 'h4', 'rl-sous-titre', MOTS.ceQueCaDit);
        const liste = poser(lecture, 'ul', 'tend-phrases');
        liste.id = 'tend-phrases';
        if (vue.points.length) {
            phrases(vue.points, { origine: comparaison.nomX, suivant: comparaison.nomY, nbNonPlaces: vue.nbNonPlaces }).forEach((p) => poser(liste, 'li', '', p));
        } else {
            poser(liste, 'li', '', MOTS.nuageVide(comparaison.nomY));
            if (vue.nbNonPlaces > 0) poser(liste, 'li', '', MOTS.nonPlaces(vue.nbNonPlaces, comparaison.nomX));
        }
        poser(lecture, 'h4', 'rl-sous-titre', MOTS.legende);
        const legende = poser(lecture, 'ul', 'tend-legende');
        donnees.cohortes.filter((c) => vue.points.some((p) => p.cohorte === c.id)).forEach((c) => {
            const ligne = poser(legende, 'li', '');
            poser(ligne, 'span', 'barre-etudiant tend-bille tend-pastille tend-teinte-' + c.teinte).setAttribute('aria-hidden', 'true');
            const nb = vue.points.filter((p) => p.cohorte === c.id).length;
            poser(ligne, 'span', '', c.nom + ' (' + nb + ' ' + (nb >= 2 ? MOTS.billes[1] : MOTS.billes[0]) + ')');
        });
        const anneau = poser(legende, 'li', '');
        const temoin = poser(anneau, 'span', 'tend-legende-anneau');
        temoin.setAttribute('aria-hidden', 'true');
        poser(temoin, 'span', 'tend-anneau');
        poser(temoin, 'span', 'barre-etudiant tend-bille');
        poser(anneau, 'span', '', MOTS.legendeAnneau);
        const seuil = poser(legende, 'li', '');
        poser(seuil, 'span', 'tend-legende-seuil').setAttribute('aria-hidden', 'true');
        poser(seuil, 'span', '', MOTS.legendeSeuil(seuilReussite()));
    }

    /** Rend l'onglet « Tendances » dans `zone`. Lit, rend, n'écrit rien : seule une déclaration (un geste) écrit. */
    function afficherTendancesLongitudinal(zone) {
        const registre = api();
        if (!zone || !registre) return;
        zone.textContent = '';
        poser(zone, 'h3', 'rl-titre', MOTS.enTete);
        poser(zone, 'p', 'text-muted', MOTS.intro);

        const lu = registre.lire();
        if (!elevesDe(lu).length) { poser(zone, 'p', 'etat-vide-liste', MOTS.videSansInscrit); return; }
        const sequence = lireSequence();
        rendreSequence(zone, sequence, coursConnus(lu, registre.resultatsDe));
        if (!sequenceComplete(sequence)) { poser(zone, 'p', 'etat-vide-liste', MOTS.sequenceIncomplete); return; }

        const comparaison = comparaisonDeCours(sequence.origine, suivantMontre(sequence), registre.resultatsDe);
        const donnees = preparer(lu, comparaison);
        const connues = donnees.cohortes.map((c) => c.id);
        const choisies = selection === null ? connues : selection.filter((id) => connues.includes(id));
        const vue = filtrer(donnees, choisies);
        if (!vue.points.some((p) => p.da === daOuvert)) daOuvert = '';

        const pseudos = registre.pseudonymes();
        const noms = (da) => registre.nomAffiche(lu.eleves[da], pseudos);
        rendreFiltres(zone, sequence, comparaison.nomY, donnees, choisies);
        const corps = poser(zone, 'div', 'tend-corps');
        rendreNuage(corps, donnees, vue, comparaison, noms);
        rendreLecture(corps, donnees, vue, comparaison);
        placerBulle();
    }

    /** Après un geste : l'onglet se redessine, et le clavier retrouve le bouton qu'il venait de presser. */
    function redessiner(retrouver) {
        const zone = document.getElementById('rl-panneau');
        if (!zone) return;
        afficherTendancesLongitudinal(zone);
        const el = retrouver && zone.querySelector ? zone.querySelector(retrouver) : null;
        if (el && typeof el.focus === 'function') el.focus({ preventScroll: true });
    }

    const attr = (v) => String(v).replace(/["\\]/g, '\\$&');
    const donnee = (el, nom) => (el && el.dataset ? String(el.dataset[nom] || '') : '');

    /* ---------- Gestes (dispatchers data-action et data-on-change de main.js : fn(el)) ---------- */

    /** Déclarer le cours d'origine. Un cours suivant qui devient l'origine quitte les suivants. */
    async function declarerOrigineTendances(el) {
        const sequence = lireSequence();
        sequence.origine = el && el.value !== undefined ? String(el.value) : '';
        selection = null;
        daOuvert = '';
        await ecrireSequence(sequence);
        redessiner('#tend-origine');
    }

    /** Déclarer ou retirer un cours suivant. */
    async function declarerSuivantTendances(el) {
        const nom = donnee(el, 'cours');
        if (!nom) return;
        const sequence = lireSequence();
        const deja = sequence.suivants.some((s) => cleDeCours(s) === cleDeCours(nom));
        sequence.suivants = deja ? sequence.suivants.filter((s) => cleDeCours(s) !== cleDeCours(nom)) : sequence.suivants.concat([nom]);
        daOuvert = '';
        await ecrireSequence(sequence);
        redessiner('.tend-sequence [data-cours="' + attr(nom) + '"]');
    }

    function choisirSuivantTendances(el) {
        const nom = donnee(el, 'cours');
        if (!lireSequence().suivants.includes(nom)) return;
        suivantChoisi = nom;
        redessiner('.tend-filtres [data-cours="' + attr(nom) + '"]');
    }

    function cohortesDuMoment() {
        const registre = api();
        const sequence = lireSequence();
        if (!registre || !sequenceComplete(sequence)) return [];
        return preparer(registre.lire(), comparaisonDeCours(sequence.origine, suivantMontre(sequence), registre.resultatsDe)).cohortes;
    }

    function choisirSaisonTendances(el) {
        const saison = donnee(el, 'saison');
        if (saison !== 'toutes' && !SAISONS.includes(saison)) return;
        selection = cohortesDeSaison(cohortesDuMoment(), saison);
        redessiner('[data-saison="' + attr(saison) + '"]');
    }

    function basculerCohorteTendances(el) {
        const id = donnee(el, 'cohorte');
        const cohortes = cohortesDuMoment();
        if (!cohortes.some((c) => c.id === id)) return;
        const actuelle = selection === null ? cohortes.map((c) => c.id) : selection;
        selection = actuelle.includes(id) ? actuelle.filter((c) => c !== id) : actuelle.concat([id]);
        redessiner('[data-cohorte="' + attr(id) + '"]');
    }

    /** Toucher une bille ouvre sa bulle ; un second toucher la ferme. */
    function ouvrirBilleTendances(el) {
        const da = donnee(el, 'da');
        daOuvert = da === daOuvert ? '' : da;
        redessiner('.tend-cible[data-da="' + attr(da) + '"]');
    }

    function fermerBulleTendances() {
        const da = daOuvert;
        daOuvert = '';
        redessiner('.tend-cible[data-da="' + attr(da) + '"]');
    }

    /** « Voir son dossier » : retour à l'onglet « Registre », sur le dossier ouvert de cet·te étudiant·e. */
    function voirDossierTendances(el) {
        const da = donnee(el, 'da');
        if (da && typeof window.ouvrirDossierLongitudinal === 'function') window.ouvrirDossierLongitudinal(da);
    }

    if (typeof window.addEventListener === 'function') window.addEventListener('resize', placerBulle);

    window.MOTS_TENDANCES_LONGITUDINAL = MOTS;
    window.afficherTendancesLongitudinal = afficherTendancesLongitudinal;
    window.declarerOrigineTendances = declarerOrigineTendances;
    window.declarerSuivantTendances = declarerSuivantTendances;
    window.choisirSuivantTendances = choisirSuivantTendances;
    window.choisirSaisonTendances = choisirSaisonTendances;
    window.basculerCohorteTendances = basculerCohorteTendances;
    window.ouvrirBilleTendances = ouvrirBilleTendances;
    window.fermerBulleTendances = fermerBulleTendances;
    window.voirDossierTendances = voirDossierTendances;
    // Pour les bancs : le calcul, sans passer par le DOM.
    window.tendancesLongitudinal = {
        NOM_CLE, seuilReussite, AXE_X, AXE_Y, NB_TEINTES,
        cleDeCours, lireTrimestre, dossierDuCours, noteDuDossier, resultatDuCours, coursConnus, sequencePropre, sequenceComplete, lireSequence,
        comparaisonDeCours, preparer, cohortesDeSaison, saisonEnfoncee, filtrer, compterZones, phrases, position
    };
})();

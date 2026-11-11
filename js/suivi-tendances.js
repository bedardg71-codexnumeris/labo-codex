/* ===============================================================
   SUIVI LONGITUDINAL — L'ONGLET « TENDANCES », LOT 1 : LE NUAGE DE POINTS (11 nov. 2026)
   ===============================================================
   Décidé par Grégoire le 11 nov. 2026 : dans Labo › Suivi longitudinal, à côté du registre,
   un onglet montre si les étudiant·es de son 101 réussissent ensuite le 102, puis le 103.
   Une bille par inscrit·e : sa note de 101 à l'horizontale, sa note du cours suivant à la verticale.

   LECTURE SEULE. Ce fichier n'écrit RIEN : ni le registre, ni un trimestre, ni une préférence.
   Il lit la clé globale `registreLongitudinal` par les lecteurs de son propriétaire
   (js/registre-longitudinal.js : `lire`, `resultatsDe`, `pseudonymes`, `nomAffiche`), pour montrer
   exactement les résultats que l'onglet « Registre » montre. Les filtres et la bille ouverte sont
   une mémoire de SÉANCE.

   CE QUI EST TRANCHÉ ICI (suppositions nommées, corrigeables — consigne du 11 nov., point 2) :
     · la note de 101 est `indices.cp.actuel.P` (0-100) du dossier de 101, TELLE QUE COPIÉE. Elle
       n'est lue que si la note est constructible, par la règle même du dossier déplié
       (`noteConstructible` absent = constructible ; `false`, sur `actuel` ou sur `details`, = non) ;
     · deux dossiers de 101 : le plus RÉCENT (année, puis hiver < été < automne), et la bulle le dit ;
     · deux résultats pour le même cours : le plus récent, lu dans le trimestre en texte libre
       (« H2026 », « Hiver 2026 », « A25 ») ; un trimestre illisible passe pour le plus ancien, et à
       égalité c'est le dernier saisi ;
     · la cohorte est le trimestre du dossier de 101 retenu ; sa saison se lit dans son nom, puis son id ;
     · sans dossier de 101, un·e inscrit·e n'appartient à aucune cohorte : ni placé·e, ni compté·e ;
     · une note hors de l'échelle du nuage (101 sous 50, cours suivant sous 40) se pose au bord, et la
       bulle donne la vraie note.
   LIMITE CONNUE, NON CORRIGÉE : pour l'A2024, P n'est pas toujours la note transmise.

   LES MOTS — proposés, lus par l'enseignant·e seulement, corrigeables : tous dans MOTS.
   LES SEUILS — des conventions proposées : tous dans SEUILS.
   Lot 2 (à venir) : les graphiques par critère, les mentions « échec » et « abandon ».
   =============================================================== */

(function () {
    'use strict';

    /** Les conventions du lien entre les deux notes : proposées, corrigeables, toutes ici. */
    const SEUILS = Object.freeze({
        BILLES_MIN_POUR_DIRE_UN_LIEN: 15,   // sous ce nombre de billes, « trop tôt pour dire »
        R_LIEN_LEGER: 0.3,                  // r de Pearson : « annonce un peu » ; son opposé : « en sens inverse »
        R_LIEN_NET: 0.5                     // r de Pearson : « plus l'une est haute, plus l'autre l'est »
    });
    /** Le seuil de réussite, sur 100 : la note de passage de l'application (js/interpretation-config.js), sa seule définition. */
    function seuilReussite() {
        return Math.round(window.NOTE_DE_PASSAGE * 100);
    }
    const AXE_101 = Object.freeze({ min: 50, max: 100 });
    const AXE_SUITE = Object.freeze({ min: 40, max: 100 });
    const PAS_GRADUATION = 10;
    const COURS_ORIGINE = '101';
    const COURS_SUIVANTS = Object.freeze([
        Object.freeze({ id: '102', libelle: '601-102' }),
        Object.freeze({ id: '103', libelle: '601-103' })
    ]);
    const NB_TEINTES = 8;   // autant que de classes .tend-teinte-N dans styles.css
    const RANG_SAISON = Object.freeze({ hiver: 1, ete: 2, automne: 3 });
    const MARGE_BULLE = 4;

    const MOTS = Object.freeze({
        ongletRegistre: 'Registre',
        ongletTendances: 'Tendances',
        enTete: 'Le 101 et la suite',
        intro: 'Chaque bille est un·e étudiant·e inscrit·e au registre. Touche une bille pour savoir qui c\'est. '
            + 'L\'écran montre une tendance, pas une preuve : rien n\'y compare tes étudiant·es à ceux et celles d\'autres groupes.',
        videSansInscrit: 'Aucun·e étudiant·e inscrit·e au registre. Inscris d\'abord des étudiant·es dans l\'onglet « Registre », puis saisis-y leurs notes de 102 ou de 103.',
        videSansNote: 'Aucune note de 102 ou de 103 au registre. Saisis les notes de tes étudiant·es dans l\'onglet « Registre » : elles apparaîtront ici.',
        filtreCours: 'Cours suivant',
        filtreCohortes: 'Cohortes',
        toutes: 'Toutes',
        automne: 'Automne',
        hiver: 'Hiver',
        pasEncoreDeNote: 'pas encore de note',
        axe101: 'Note finale en 101',
        axeSuite: (cours) => 'Note en ' + cours,
        zoneReussite: (cours) => 'Réussite en 101 et en ' + cours,
        zoneEchecSuite: (cours) => 'Réussite en 101, échec en ' + cours,
        zoneSous60: 'Sous 60 en 101',
        nuageVide: (cours) => 'Aucune note de ' + cours + ' pour les cohortes cochées.',
        nuageNom: (cours, n) => 'Nuage de points : la note de 101 et la note de ' + cours + ', ' + accorderEtudiants(n) + '.',
        ceQueCaDit: 'Ce que ça dit',
        legende: 'Légende',
        legendeAnneau: 'Anneau blanc : la bille touchée',
        legendeSeuil: (seuil) => 'Pointillé : le seuil de réussite, ' + seuil,
        billes: ['bille', 'billes'],
        notes: (n101, cours, nSuite) => COURS_ORIGINE + ' : ' + n101 + ' · ' + cours + ' : ' + nSuite,
        plusieursDossiers: (n) => 'Son 101 le plus récent (' + n + ' dossiers de 101 au registre).',
        plusieursResultats: (cours, n) => 'Sa note de ' + cours + ' la plus récente (' + n + ' au registre).',
        horsEchelle: 'Bille posée au bord : sa note sort de l\'échelle du nuage.',
        voirDossier: 'Voir son dossier',
        fermer: 'Fermer',
        // « Ce que ça dit » : trois phrases, toujours dans cet ordre.
        vuAucunReussi101: 'Aucun·e des étudiant·es affiché·es n\'a réussi ton 101.',
        vuUnSeul: (reussi, cours) => 'L\'étudiant·e qui a réussi ton 101 ' + (reussi ? 'a aussi réussi' : 'n\'a pas réussi') + ' le ' + cours + '.',
        vu: (k, m, cours) => (k === 0
            ? 'Aucun·e des ' + m + ' étudiant·es qui ont réussi ton 101 n\'a réussi le ' + cours + '.'
            : k + ' des ' + m + ' étudiant·es qui ont réussi ton 101 ' + (k === 1 ? 'a' : 'ont') + ' aussi réussi le ' + cours + '.'),
        lienTropTot: (n, cours) => 'Avec ' + accorderEtudiants(n) + ', il est trop tôt pour dire si la note de 101 annonce celle de ' + cours + '.',
        lienNet: (cours) => 'En général, plus la note de 101 est haute, plus celle de ' + cours + ' l\'est aussi.',
        lienLeger: (cours) => 'La note de 101 annonce un peu celle de ' + cours + ', sans plus.',
        lienInverse: (cours) => 'Les notes de 101 et de ' + cours + ' vont plutôt en sens inverse : à regarder de près.',
        lienAbsent: (cours) => 'Les notes de 101 n\'annoncent pas clairement celles de ' + cours + '.',
        limite: (n, cours) => accorderEtudiants(n) + ', c\'est peu : c\'est une piste, pas une preuve. '
            + 'Les notes de ' + cours + ' viennent d\'un autre correcteur, avec une autre façon de noter.',
        limiteSaisons: 'Tu mêles des groupes d\'automne et d\'hiver ; ceux d\'hiver sont hors séquence.',
        limiteNonPlaces: (x) => (x === 1
            ? '1 inscrit·e n\'a pas de note de 101 calculable et n\'est pas placé·e.'
            : x + ' inscrit·es n\'ont pas de note de 101 calculable et ne sont pas placé·es.')
    });

    /** « 1 étudiant·e », « 12 étudiant·es » (0 ou 1 : singulier, comme `accorder` du registre). */
    function accorderEtudiants(n) {
        return n + ' étudiant·e' + (Math.abs(Number(n)) >= 2 ? 's' : '');
    }

    /* ---------- Le calcul : fonctions pures, sans DOM ni stockage ---------- */

    function sansAccents(texte) {
        return String(texte == null ? '' : texte).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
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

    /** Le dossier de 101 d'un·e inscrit·e (code de cours qui contient « 101 ») : le plus récent, et combien il y en a. */
    function dossierDe101(eleve) {
        const dossiers = (eleve && Array.isArray(eleve.dossiers) ? eleve.dossiers : [])
            .filter((d) => d && String(d.coursCode || '').includes(COURS_ORIGINE));
        return { dossier: lePlusRecent(dossiers, (d) => trimestreDuDossier(d).rang), nb: dossiers.length };
    }

    /** La note de 101 telle que copiée (P, 0-100), ou null si elle n'est pas constructible ou pas chiffrée. */
    function noteDe101(dossier) {
        const actuel = dossier && dossier.indices && dossier.indices.cp && dossier.indices.cp.actuel;
        if (!actuel) return null;
        // La règle du dossier déplié (lignesIndices, registre-longitudinal.js) : absent = constructible.
        if (actuel.noteConstructible === false || (actuel.details && actuel.details.noteConstructible === false)) return null;
        return typeof actuel.P === 'number' && isFinite(actuel.P) ? actuel.P : null;
    }

    /** La note chiffrée d'un·e inscrit·e dans le cours suivant (cours qui contient « 102 » ou « 103 ») : la plus récente. */
    function resultatDuCours(resultats, idCours) {
        const retenus = (Array.isArray(resultats) ? resultats : [])
            .filter((r) => r && String(r.cours == null ? '' : r.cours).includes(idCours) && typeof r.note === 'number' && isFinite(r.note));
        const choisi = lePlusRecent(retenus, (r) => lireTrimestre(r.trimestre).rang);
        return choisi ? { note: choisi.note, trimestre: String(choisi.trimestre == null ? '' : choisi.trimestre), nb: retenus.length } : null;
    }

    /**
     * Tout ce que l'écran montre pour un cours suivant, avant le filtre des cohortes :
     *   cohortes   — une par trimestre de 101, de la plus ancienne à la plus récente, avec sa teinte ;
     *   points     — une bille par inscrit·e qui a une note de 101 constructible ET une note chiffrée du cours ;
     *   nonPlaces  — les inscrit·es qui ont la note du cours, mais pas de note de 101 calculable.
     * `resultatsDe(eleve)` est le lecteur du registre (les résultats tels que l'écran « Registre » les montre).
     */
    function preparer(registre, idCours, resultatsDe) {
        const eleves = registre && registre.eleves && typeof registre.eleves === 'object' ? registre.eleves : {};
        const lire = typeof resultatsDe === 'function' ? resultatsDe : (e) => (e && Array.isArray(e.resultatsUlterieurs) ? e.resultatsUlterieurs : []);
        const cohortes = new Map();
        const points = [], nonPlaces = [];
        Object.keys(eleves).forEach((da) => {
            const eleve = eleves[da];
            if (!eleve || typeof eleve !== 'object') return;
            const origine = dossierDe101(eleve);
            if (!origine.dossier) return;
            const trimestre = trimestreDuDossier(origine.dossier);
            const idCohorte = String(origine.dossier.trimestre || origine.dossier.trimestreNom || '');
            if (!cohortes.has(idCohorte)) {
                cohortes.set(idCohorte, { id: idCohorte, nom: String(origine.dossier.trimestreNom || origine.dossier.trimestre || ''),
                    saison: trimestre.saison, rang: trimestre.rang, aDesNotes: false });
            }
            const resultat = resultatDuCours(lire(eleve), idCours);
            if (!resultat) return;
            cohortes.get(idCohorte).aDesNotes = true;
            const note101 = noteDe101(origine.dossier);
            if (note101 === null) { nonPlaces.push({ da: String(da), cohorte: idCohorte }); return; }
            points.push({ da: String(da), cohorte: idCohorte, x: note101, y: resultat.note,
                nbDossiers101: origine.nb, nbResultats: resultat.nb, trimestreResultat: resultat.trimestre });
        });
        const liste = Array.from(cohortes.values()).sort((a, b) => a.rang - b.rang || a.nom.localeCompare(b.nom, 'fr'));
        liste.forEach((c, i) => { c.teinte = i % NB_TEINTES; });
        return { cohortes: liste, points, nonPlaces };
    }

    /** Les cohortes d'une saison (« automne », « hiver ») ou toutes (« toutes ») : leurs ids. */
    function cohortesDeSaison(cohortes, saison) {
        return cohortes.filter((c) => saison === 'toutes' || c.saison === saison).map((c) => c.id);
    }

    /** À l'ouverture : les cohortes d'automne ; s'il n'y en a aucune, toutes. */
    function selectionParDefaut(cohortes) {
        const automne = cohortesDeSaison(cohortes, 'automne');
        return automne.length ? automne : cohortesDeSaison(cohortes, 'toutes');
    }

    /** Un bouton de saison est enfoncé quand la sélection est EXACTEMENT la sienne (et qu'elle n'est pas vide). */
    function saisonEnfoncee(cohortes, selection, saison) {
        const siennes = cohortesDeSaison(cohortes, saison);
        const choisies = new Set(selection);
        return siennes.length > 0 && siennes.length === choisies.size && siennes.every((id) => choisies.has(id));
    }

    /** Ce qui reste une fois les cohortes cochées : les billes, le compte des non placé·es, et si automne et hiver sont mêlés. */
    function filtrer(donnees, selection) {
        const choisies = new Set(selection);
        const points = donnees.points.filter((p) => choisies.has(p.cohorte));
        const saisons = new Set(points.map((p) => (donnees.cohortes.find((c) => c.id === p.cohorte) || {}).saison));
        return { points, nbNonPlaces: donnees.nonPlaces.filter((p) => choisies.has(p.cohorte)).length,
            saisonsMelees: saisons.has('automne') && saisons.has('hiver') };
    }

    function compterZones(points) {
        const zones = { reussite: 0, echecSuite: 0, sous60: 0 };
        const seuil = seuilReussite();
        points.forEach((p) => {
            if (p.x < seuil) zones.sous60 += 1;
            else if (p.y >= seuil) zones.reussite += 1;
            else zones.echecSuite += 1;
        });
        return zones;
    }

    /** Le r de Pearson entre les deux notes ; null quand il ne se calcule pas (moins de deux billes, ou une note qui ne varie pas). */
    function pearson(points) {
        const n = points.length;
        if (n < 2) return null;
        const mx = points.reduce((s, p) => s + p.x, 0) / n;
        const my = points.reduce((s, p) => s + p.y, 0) / n;
        let sxy = 0, sxx = 0, syy = 0;
        points.forEach((p) => { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) * (p.x - mx); syy += (p.y - my) * (p.y - my); });
        return sxx === 0 || syy === 0 ? null : sxy / Math.sqrt(sxx * syy);
    }

    /** Les trois phrases de « Ce que ça dit », calculées sur les billes affichées : ce qu'on voit, le lien, la limite. */
    function phrases(points, contexte) {
        const cours = contexte.cours;
        const n = points.length;
        const zones = compterZones(points);
        const m = zones.reussite + zones.echecSuite;
        const vu = m === 0 ? MOTS.vuAucunReussi101 : m === 1 ? MOTS.vuUnSeul(zones.reussite === 1, cours) : MOTS.vu(zones.reussite, m, cours);
        let lien;
        if (n < SEUILS.BILLES_MIN_POUR_DIRE_UN_LIEN) lien = MOTS.lienTropTot(n, cours);
        else {
            const r = pearson(points);
            if (r !== null && r >= SEUILS.R_LIEN_NET) lien = MOTS.lienNet(cours);
            else if (r !== null && r >= SEUILS.R_LIEN_LEGER) lien = MOTS.lienLeger(cours);
            else if (r !== null && r <= -SEUILS.R_LIEN_LEGER) lien = MOTS.lienInverse(cours);
            else lien = MOTS.lienAbsent(cours);
        }
        const limite = [MOTS.limite(n, cours)];
        if (contexte.saisonsMelees) limite.push(MOTS.limiteSaisons);
        if (contexte.nbNonPlaces > 0) limite.push(MOTS.limiteNonPlaces(contexte.nbNonPlaces));
        return [vu, lien, limite.join(' ')];
    }

    /** La place d'une note sur son axe, en pourcentage de l'axe (0 = le bas de l'échelle) ; une note hors de l'échelle se pose au bord. */
    function position(note, axe) {
        const brut = (note - axe.min) / (axe.max - axe.min) * 100;
        return { pourcent: Math.max(0, Math.min(100, brut)), horsEchelle: brut < 0 || brut > 100 };
    }

    /* ---------- L'état de séance (jamais écrit) ---------- */

    let coursChoisi = COURS_SUIVANTS[0].id;
    let selection = null;      // null : la sélection par défaut, recalculée sur les cohortes du moment
    let daOuvert = '';

    function api() {
        return window.registreLongitudinal || null;
    }

    function formater(note) {
        return formaterNombre(Math.round(Number(note) * 10) / 10);   // la virgule vit dans js/note-pourcentage.js (#1137)
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

    function rendreFiltres(zone, donnees, choisies) {
        const filtres = poser(zone, 'div', 'tend-filtres');

        const groupeCours = poser(filtres, 'div', 'tend-filtre');
        groupeCours.setAttribute('role', 'group');
        groupeCours.setAttribute('aria-label', MOTS.filtreCours);
        poser(groupeCours, 'span', 'tend-filtre-nom', MOTS.filtreCours);
        COURS_SUIVANTS.forEach((c) => {
            bascule(groupeCours, c.libelle, 'choisirCoursTendances', c.id === coursChoisi).dataset.cours = c.id;
        });

        const groupeCohortes = poser(filtres, 'div', 'tend-filtre');
        groupeCohortes.setAttribute('role', 'group');
        groupeCohortes.setAttribute('aria-label', MOTS.filtreCohortes);
        poser(groupeCohortes, 'span', 'tend-filtre-nom', MOTS.filtreCohortes);
        [['toutes', MOTS.toutes], ['automne', MOTS.automne], ['hiver', MOTS.hiver]].forEach(([saison, mot]) => {
            bascule(groupeCohortes, mot, 'choisirSaisonTendances', saisonEnfoncee(donnees.cohortes, choisies, saison)).dataset.saison = saison;
        });
        const puces = poser(groupeCohortes, 'div', 'tend-puces');
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
    const depuisLaGauche = (note) => position(note, AXE_101).pourcent;
    const depuisLeHaut = (note) => 100 - position(note, AXE_SUITE).pourcent;

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

    function rendreBulle(plan, point, cohorte, nom, cours) {
        // L'habit de la bulle du suivi des groupes (.barre-etudiant-info), posée ici dans le plan (.tend-bulle).
        const bulle = poser(plan, 'div', 'barre-etudiant-info tend-bulle');
        bulle.id = 'tend-bulle';
        bulle.setAttribute('role', 'group');
        bulle.setAttribute('aria-label', nom);
        const fermer = bouton(bulle, 'tend-bulle-fermer', '×', 'fermerBulleTendances');
        fermer.setAttribute('aria-label', MOTS.fermer);
        poser(bulle, 'p', 'tend-bulle-nom', nom);
        poser(bulle, 'p', 'tend-bulle-ligne', cohorte ? cohorte.nom : '');
        poser(bulle, 'p', 'tend-bulle-notes', MOTS.notes(formater(point.x), cours, formater(point.y)));
        if (point.nbDossiers101 > 1) poser(bulle, 'p', 'tend-bulle-ligne', MOTS.plusieursDossiers(point.nbDossiers101));
        if (point.nbResultats > 1) poser(bulle, 'p', 'tend-bulle-ligne', MOTS.plusieursResultats(cours, point.nbResultats));
        if (position(point.x, AXE_101).horsEchelle || position(point.y, AXE_SUITE).horsEchelle) poser(bulle, 'p', 'tend-bulle-ligne', MOTS.horsEchelle);
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

    function rendreNuage(zone, donnees, vue, cours, noms) {
        const figure = poser(zone, 'div', 'tend-nuage');
        poser(figure, 'p', 'tend-axe-nom tend-axe-nom-y', MOTS.axeSuite(cours));
        const cadre = poser(figure, 'div', 'tend-cadre');
        const graduationsY = poser(cadre, 'div', 'tend-graduations-y');
        graduationsY.setAttribute('aria-hidden', 'true');
        rendreGraduations(graduationsY, AXE_SUITE, 'y');

        const plan = poser(cadre, 'div', 'tend-plan');
        plan.id = 'tend-plan';
        plan.setAttribute('role', 'group');
        plan.setAttribute('aria-label', MOTS.nuageNom(cours, vue.points.length));
        // Le seuil de réussite découpe le plan en trois zones ; les pointillés le tracent sur chaque axe.
        const seuilX = depuisLaGauche(seuilReussite());
        const seuilY = depuisLeHaut(seuilReussite());
        const zones = compterZones(vue.points);
        const reussite = rendreZone(plan, 'tend-zone-reussite', MOTS.zoneReussite(cours), zones.reussite);
        reussite.style.left = seuilX + '%';
        reussite.style.height = seuilY + '%';
        const echec = rendreZone(plan, 'tend-zone-echec', MOTS.zoneEchecSuite(cours), zones.echecSuite);
        echec.style.left = seuilX + '%';
        echec.style.top = seuilY + '%';
        rendreZone(plan, 'tend-zone-sous60', MOTS.zoneSous60, zones.sous60).style.width = seuilX + '%';
        const traitX = poser(plan, 'div', 'tend-seuil tend-seuil-x');
        traitX.setAttribute('aria-hidden', 'true');
        traitX.style.left = seuilX + '%';
        const traitY = poser(plan, 'div', 'tend-seuil tend-seuil-y');
        traitY.setAttribute('aria-hidden', 'true');
        traitY.style.top = seuilY + '%';
        if (!vue.points.length) poser(plan, 'p', 'tend-nuage-vide', MOTS.nuageVide(cours));

        let ouvert = null;
        vue.points.forEach((point) => {
            const cohorte = donnees.cohortes.find((c) => c.id === point.cohorte);
            const nom = noms(point.da);
            const estOuvert = point.da === daOuvert;
            const cible = bouton(plan, 'tend-cible' + (estOuvert ? ' tend-cible-ouverte' : ''), '', 'ouvrirBilleTendances');
            cible.dataset.da = point.da;
            cible.setAttribute('aria-expanded', estOuvert ? 'true' : 'false');
            cible.setAttribute('aria-label', nom + ', ' + (cohorte ? cohorte.nom + ', ' : '') + MOTS.notes(formater(point.x), cours, formater(point.y)));
            cible.style.left = depuisLaGauche(point.x) + '%';
            cible.style.top = depuisLeHaut(point.y) + '%';
            // La sphère est celle du suivi des groupes (.barre-etudiant, styles.css) : une seule source ; la teinte vient de la cohorte.
            if (estOuvert) poser(cible, 'span', 'tend-anneau');
            poser(cible, 'span', 'barre-etudiant tend-bille tend-teinte-' + (cohorte ? cohorte.teinte : 0));
            if (estOuvert) ouvert = { point, cohorte, nom };
        });
        if (ouvert) rendreBulle(plan, ouvert.point, ouvert.cohorte, ouvert.nom, cours);

        const graduationsX = poser(cadre, 'div', 'tend-graduations-x');
        graduationsX.setAttribute('aria-hidden', 'true');
        rendreGraduations(graduationsX, AXE_101, 'x');
        poser(figure, 'p', 'tend-axe-nom tend-axe-nom-x', MOTS.axe101);
    }

    function rendreLecture(zone, donnees, vue, cours) {
        const lecture = poser(zone, 'div', 'tend-lecture');
        poser(lecture, 'h4', 'rl-sous-titre', MOTS.ceQueCaDit);
        const liste = poser(lecture, 'ul', 'tend-phrases');
        liste.id = 'tend-phrases';
        if (vue.points.length) {
            phrases(vue.points, { cours, nbNonPlaces: vue.nbNonPlaces, saisonsMelees: vue.saisonsMelees }).forEach((p) => poser(liste, 'li', '', p));
        } else {
            poser(liste, 'li', '', MOTS.nuageVide(cours));
            if (vue.nbNonPlaces > 0) poser(liste, 'li', '', MOTS.limiteNonPlaces(vue.nbNonPlaces));
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

    /** Rend l'onglet « Tendances » dans `zone`. Lit, rend, n'écrit rien. */
    function afficherTendancesLongitudinal(zone) {
        const registre = api();
        if (!zone || !registre) return;
        zone.textContent = '';
        poser(zone, 'h3', 'rl-titre', MOTS.enTete);
        poser(zone, 'p', 'text-muted', MOTS.intro);

        const lu = registre.lire();
        const inscrits = Object.keys(lu.eleves).map((da) => lu.eleves[da]).filter((e) => e && typeof e === 'object');
        if (!inscrits.length) { poser(zone, 'p', 'etat-vide-liste', MOTS.videSansInscrit); return; }
        const tous = COURS_SUIVANTS.map((c) => preparer(lu, c.id, registre.resultatsDe));
        if (!tous.some((d) => d.points.length || d.nonPlaces.length)) { poser(zone, 'p', 'etat-vide-liste', MOTS.videSansNote); return; }

        const donnees = tous[COURS_SUIVANTS.findIndex((c) => c.id === coursChoisi)] || tous[0];
        const connues = new Set(donnees.cohortes.map((c) => c.id));
        const choisies = (selection === null ? selectionParDefaut(donnees.cohortes) : selection).filter((id) => connues.has(id));
        const vue = filtrer(donnees, choisies);
        if (!vue.points.some((p) => p.da === daOuvert)) daOuvert = '';

        const pseudos = registre.pseudonymes();
        const noms = (da) => registre.nomAffiche(lu.eleves[da], pseudos);
        rendreFiltres(zone, donnees, choisies);
        const corps = poser(zone, 'div', 'tend-corps');
        rendreNuage(corps, donnees, vue, coursChoisi, noms);
        rendreLecture(corps, donnees, vue, coursChoisi);
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

    /* ---------- Gestes (dispatcher data-action de main.js : fn(el)) ---------- */

    function choisirCoursTendances(el) {
        const id = el && el.dataset ? String(el.dataset.cours || '') : '';
        if (!COURS_SUIVANTS.some((c) => c.id === id)) return;
        coursChoisi = id;
        redessiner('[data-cours="' + attr(id) + '"]');
    }

    function cohortesDuMoment() {
        const registre = api();
        return registre ? preparer(registre.lire(), coursChoisi, registre.resultatsDe).cohortes : [];
    }

    function choisirSaisonTendances(el) {
        const saison = el && el.dataset ? String(el.dataset.saison || '') : '';
        if (!['toutes', 'automne', 'hiver'].includes(saison)) return;
        selection = cohortesDeSaison(cohortesDuMoment(), saison);
        redessiner('[data-saison="' + attr(saison) + '"]');
    }

    function basculerCohorteTendances(el) {
        const id = el && el.dataset ? String(el.dataset.cohorte || '') : '';
        const cohortes = cohortesDuMoment();
        if (!cohortes.some((c) => c.id === id)) return;
        const actuelle = selection === null ? selectionParDefaut(cohortes) : selection;
        selection = actuelle.includes(id) ? actuelle.filter((c) => c !== id) : actuelle.concat([id]);
        redessiner('[data-cohorte="' + attr(id) + '"]');
    }

    /** Toucher une bille ouvre sa bulle ; un second toucher la ferme. */
    function ouvrirBilleTendances(el) {
        const da = el && el.dataset ? String(el.dataset.da || '') : '';
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
        const da = el && el.dataset ? String(el.dataset.da || '') : '';
        if (da && typeof window.ouvrirDossierLongitudinal === 'function') window.ouvrirDossierLongitudinal(da);
    }

    if (typeof window.addEventListener === 'function') window.addEventListener('resize', placerBulle);

    window.MOTS_TENDANCES_LONGITUDINAL = MOTS;
    window.afficherTendancesLongitudinal = afficherTendancesLongitudinal;
    window.choisirCoursTendances = choisirCoursTendances;
    window.choisirSaisonTendances = choisirSaisonTendances;
    window.basculerCohorteTendances = basculerCohorteTendances;
    window.ouvrirBilleTendances = ouvrirBilleTendances;
    window.fermerBulleTendances = fermerBulleTendances;
    window.voirDossierTendances = voirDossierTendances;
    // Pour les bancs : le calcul, sans passer par le DOM.
    window.tendancesLongitudinal = {
        SEUILS, seuilReussite, AXE_101, AXE_SUITE, COURS_SUIVANTS, NB_TEINTES,
        lireTrimestre, dossierDe101, noteDe101, resultatDuCours, preparer,
        cohortesDeSaison, selectionParDefaut, saisonEnfoncee, filtrer, compterZones, pearson, phrases, position
    };
})();

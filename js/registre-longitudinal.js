/* ===============================================================
   REGISTRE LONGITUDINAL (#915, 17 sept. 2026)
   ===============================================================
   Suivre un·e élève d'un trimestre à l'autre. Grégoire inscrit au registre les élèves
   qu'il veut suivre dans la durée ; chaque inscription fige une copie DATÉE de leur
   dossier d'évaluation (sans blobs), et accueille les notes obtenues ensuite dans les
   cours qui suivent. Cadrage : plans de travail/CADRAGE-2026-09-17-soir-registre-
   longitudinal.md (v2), relu et corrigé le même soir.

   RANGEMENT — `registreLongitudinal`, clé GLOBALE (inscrite à CLES_GLOBALES dans
   trimestres.js) : un élève traverse les trimestres, sa fiche ne peut pas vivre dans
   l'un d'eux. Forme :
     { format: 'registre-longitudinal', version: 1,
       eleves: { [da]: { da, nom, prenom, inscritLe, dossiers: [...], resultatsUlterieurs: [...] } },
       modeles: { grilles: { ['<trimestre>:<grilleId>']: copie }, echelles: { ... } } }
   Format DISTINCT de `codex-data` v1 (js/codex-data.js), qui est par groupe-cours archivé
   et lu depuis la Réserve ; celui-ci est par élève et lu depuis les trimestres vivants.
   Seul écrivain : ce fichier, par `db.set` (le seuil IndexedDB est automatique dans db.js).
   Sans semis : un registre absent ou illisible se LIT comme vide, il ne s'écrit pas.

   PÉRENNITÉ (mesurée au cadrage) : la clé figure dans l'export complet (db.keys()),
   survit à supprimerTrimestre, n'est PAS dans la Réserve (par trimestre). L'écran le dit.

   LA CAPTURE (lot 2) EST EN LECTURE SEULE SUR LES TRIMESTRES. Elle lit par
   `cleSource(nomCle, trimestreId)` (trimestres.js) — jamais en changeant le trimestre
   actif — et n'écrit que `registreLongitudinal`. Les indices sont LUS au stockage tels
   qu'ils y sont, jamais recalculés : `calculerEtStockerIndicesCP` ÉCRIT, et écrire dans un
   trimestre (archivé ou non) est exactement ce que ce module s'interdit. Un indice absent
   donne `null`, et l'écran le dira. Le mode archive de l'app garde les données du
   trimestre ; le registre n'en fait pas partie : la capture ne demande aucune permission.

   CE QU'UN DOSSIER EMPORTE (un par trimestre-cours où Grégoire a eu l'élève) : les
   évaluations de ce DA, les grilles et échelles qu'elles référencent (COPIE intégrale
   rangée UNE fois par trimestre dans `modeles`, plus une empreinte dans le dossier pour
   détecter la dérive future — MESURÉ le 18 sept. sur le pack démo : la copie par dossier
   pesait 15,5 Ko sur 58, répétée pour chaque élève), les présences de ce DA, les
   interventions où ce DA figure (notes individuelles réduites à ce DA), ses instantanés
   hebdomadaires et d'intervention, ses indices tels que stockés (C/P, assiduité, paliers
   RàI), sa sélection de portfolio. Il LAISSE les blobs (copies, PDF, annotations).

   ÉCRAN — Labo › Suivi longitudinal (config.js, navigation.js, index.html). Rendu bâti par
   le DOM (textContent) : les mots viennent de MOTS, les noms d'élèves du stock.
   =============================================================== */

(function () {
    'use strict';

    const NOM_CLE = 'registreLongitudinal';
    const FORMAT = 'registre-longitudinal';
    const VERSION = 1;
    const MAX_RESULTATS_RECHERCHE = 30;
    const CLES_BLOBS = ['fichiersTravaux', 'annotationsTravaux', 'corbeilleFichiers', 'archivesBundles'];

    // Les mots de l'écran, en UN seul endroit. Supposition nommée : proposés par Claude Code,
    // lus par l'enseignant·e seulement — aucun élève ne les voit. La phrase de pérennité est
    // celle du cadrage v2 § 3.
    const MOTS = Object.freeze({
        sousTitre: 'Les élèves que tu suis d\'un trimestre à l\'autre : une copie figée de leur dossier, et les notes qu\'ils obtiennent ensuite.',
        perennite: 'Le registre est sauvegardé par l\'export complet seulement (Réglages › Données), pas par l\'archive d\'un trimestre.',
        rechercheTitre: 'Inscrire un·e élève',
        rechercheAide: 'Cherche par nom, dans tous les trimestres de l\'application.',
        recherchePlaceholder: 'Nom ou prénom…',
        aucunResultat: 'Aucun·e élève ne porte ce nom.',
        tropDeResultats: 'Précise le nom : seuls les 30 premiers sont affichés.',
        aucunTrimestre: 'Aucun trimestre dans l\'application.',
        inscrire: 'Inscrire au registre',
        recapturer: 'Re-capturer',
        confirmerRecapture: 'La capture précédente de ce trimestre-cours sera remplacée par une copie d\'aujourd\'hui. Continuer ?',
        captureFaite: 'Capturé le',
        aucunInscrit: 'Aucun·e élève inscrit·e au registre.',
        inscritLe: 'Inscrit·e le',
        indiceAbsent: 'non calculé à la capture',
        refusInconnu: 'Cet·te élève n\'est dans aucun trimestre.',
        evaluations: 'évaluation·s',
        seances: 'séance·s',
        grilles: 'grille·s',
        dossiers: 'dossier·s'
    });

    // Mémoire de SÉANCE, jamais écrite : l'élève choisi dans la recherche.
    let daChoisi = '';
    let dernierResume = null;

    /* ---------- Lecture du registre ---------- */

    function registreVide() {
        return { format: FORMAT, version: VERSION, eleves: {}, modeles: { grilles: {}, echelles: {} } };
    }

    /** Lit le registre tel qu'il est rangé ; une valeur absente, étrangère ou d'un autre format se lit comme vide, sans rien écrire. */
    function lireRegistre() {
        const brut = db.getSync(NOM_CLE, null);
        if (!brut || typeof brut !== 'object' || brut.format !== FORMAT
            || !brut.eleves || typeof brut.eleves !== 'object' || Array.isArray(brut.eleves)) {
            return registreVide();
        }
        if (!brut.modeles || typeof brut.modeles !== 'object') brut.modeles = { grilles: {}, echelles: {} };
        if (!brut.modeles.grilles || typeof brut.modeles.grilles !== 'object') brut.modeles.grilles = {};
        if (!brut.modeles.echelles || typeof brut.modeles.echelles !== 'object') brut.modeles.echelles = {};
        return brut;
    }

    /** Les élèves inscrits, triés par nom puis prénom. */
    function elevesInscrits() {
        const eleves = lireRegistre().eleves;
        return Object.keys(eleves)
            .map((da) => eleves[da])
            .filter((e) => e && typeof e === 'object')
            .sort((a, b) => String(a.nom || '').localeCompare(String(b.nom || ''), 'fr')
                || String(a.prenom || '').localeCompare(String(b.prenom || ''), 'fr'));
    }

    /* ---------- Lecture des trimestres — LECTURE SEULE, par cleSource ---------- */

    function lireDe(trimestreId, nomCle, defaut) {
        const valeur = db.getSync(cleSource(nomCle, trimestreId), null);
        return valeur === null || valeur === undefined ? defaut : valeur;
    }

    /** Tous les trimestres répertoriés, SAUF la démo (élèves fictifs), du plus récent au plus ancien. */
    function trimestresRepertories() {
        const tous = typeof obtenirTrimestres === 'function' ? obtenirTrimestres() : db.getSync('trimestres', []);
        return (Array.isArray(tous) ? tous : [])
            .filter((t) => t && t.id && t.id !== 'demo')
            .sort((a, b) => (Number(b.annee) || 0) - (Number(a.annee) || 0)
                || String(b.session || '').localeCompare(String(a.session || '')));
    }

    function coursParId() {
        const cours = db.getSync('cours', []);
        const index = {};
        (Array.isArray(cours) ? cours : []).forEach((c) => { if (c && c.id) index[c.id] = c; });
        return index;
    }

    function codeDuCours(cours) {
        return cours ? String(cours.codeCours || cours.sigle || cours.id || '') : '';
    }

    /**
     * Les élèves de TOUS les trimestres, une entrée par DA : { da, nom, prenom, presences: [{ trimestreId, trimestreNom, coursId, coursCode, groupe }] }.
     * Un DA du collège présent dans deux trimestres donne UNE entrée à deux présences ; un DA fabriqué (#914) n'est
     * partagé par personne et donne la sienne.
     */
    function elevesDeTousLesTrimestres() {
        const cours = coursParId();
        const parDa = new Map();
        trimestresRepertories().forEach((t) => {
            const etudiants = lireDe(t.id, 'groupeEtudiants', []);
            (Array.isArray(etudiants) ? etudiants : []).forEach((e) => {
                if (!e || !e.da) return;
                const da = String(e.da);
                if (!parDa.has(da)) parDa.set(da, { da, nom: String(e.nom || ''), prenom: String(e.prenom || ''), presences: [] });
                const entree = parDa.get(da);
                const coursId = e.coursId || '';
                if (entree.presences.some((p) => p.trimestreId === t.id && p.coursId === coursId)) return;
                entree.presences.push({ trimestreId: t.id, trimestreNom: String(t.nom || t.id), coursId, coursCode: codeDuCours(cours[coursId]), groupe: String(e.groupe || '') });
            });
        });
        return Array.from(parDa.values())
            .sort((a, b) => a.nom.localeCompare(b.nom, 'fr') || a.prenom.localeCompare(b.prenom, 'fr'));
    }

    function normaliser(texte) {
        return String(texte == null ? '' : texte).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }

    /** Recherche par nom ou prénom, insensible à la casse et aux accents ; vide → tout le monde. */
    function rechercherEleves(texte) {
        const motif = normaliser(texte);
        return elevesDeTousLesTrimestres()
            .filter((e) => !motif || normaliser(e.nom + ' ' + e.prenom).includes(motif) || normaliser(e.prenom + ' ' + e.nom).includes(motif));
    }

    /* ---------- La capture (LECTURE SEULE sur les trimestres) ---------- */

    function copie(x) {
        return x === undefined ? null : JSON.parse(JSON.stringify(x));
    }

    function empreinteGrille(g) {
        const criteres = Array.isArray(g.criteres) ? g.criteres : [];
        return { id: g.id, nom: String(g.nom || ''), nbCriteres: criteres.length, criteres: criteres.map((c) => ({ id: c.id, nom: String(c.nom || '') })) };
    }

    function empreinteEchelle(ec) {
        const niveaux = Array.isArray(ec.niveaux) ? ec.niveaux : [];
        return { id: ec.id, nom: String(ec.nom || ''), niveaux: niveaux.map((n) => String(n && n.nom != null ? n.nom : n)) };
    }

    /** Un dossier : la copie figée de ce que le trimestre `t` sait de ce DA dans le cours `coursId`. Ne lit que par cleSource. */
    function capturerDossier(da, t, coursId, maintenant) {
        const cours = coursParId()[coursId] || null;
        const etudiants = lireDe(t.id, 'groupeEtudiants', []);
        const fiche = (Array.isArray(etudiants) ? etudiants : []).find((e) => e && String(e.da) === da && (e.coursId || '') === (coursId || '')) || {};

        const evaluations = (lireDe(t.id, 'evaluationsSauvegardees', []) || []).filter((ev) => ev && String(ev.etudiantDA) === da && (!coursId || !ev.coursId || ev.coursId === coursId));
        const grillesIds = new Set(evaluations.map((ev) => ev.grilleId).filter(Boolean));
        const echellesIds = new Set(evaluations.map((ev) => ev.echelleId).filter(Boolean));
        const grilles = (lireDe(t.id, 'grillesTemplates', []) || []).filter((g) => g && grillesIds.has(g.id));
        const echelles = (lireDe(t.id, 'echellesTemplates', []) || []).filter((ec) => ec && echellesIds.has(ec.id));

        const presences = (lireDe(t.id, 'presences', []) || []).filter((p) => p && String(p.da) === da && (!coursId || !p.coursId || p.coursId === coursId));

        const interventions = (lireDe(t.id, 'interventions', []) || [])
            .filter((i) => i && Array.isArray(i.etudiants) && i.etudiants.map(String).includes(da))
            .map((i) => {
                const c = copie(i);
                // Les notes individuelles des AUTRES élèves ne voyagent pas avec ce dossier.
                c.notesIndividuelles = i.notesIndividuelles && i.notesIndividuelles[da] !== undefined ? { [da]: i.notesIndividuelles[da] } : {};
                return c;
            });

        const snapshotsCours = coursId ? db.getSync(cleSource('snapshots', t.id) + '_' + coursId, null) : null;
        const hebdomadaires = (snapshotsCours && Array.isArray(snapshotsCours.hebdomadaires) ? snapshotsCours.hebdomadaires : [])
            .map((s) => {
                const entree = Array.isArray(s.etudiants) ? s.etudiants.find((e) => e && String(e.da) === da) : null;
                return entree ? Object.assign({ id: s.id, dateSeance: s.dateSeance, numSemaine: s.numSemaine != null ? s.numSemaine : s.numeroSemaine }, copie(entree)) : null;
            })
            .filter(Boolean);
        const snapshotsInterventions = (snapshotsCours && Array.isArray(snapshotsCours.interventions) ? snapshotsCours.interventions : [])
            .filter((s) => s && ((s.avant && s.avant[da]) || (s.apres && s.apres[da])))
            .map((s) => ({ id: s.id, date: s.date, type: s.type, titre: s.titre, avant: s.avant ? copie(s.avant[da]) : null, apres: s.apres ? copie(s.apres[da]) : null }));

        const indicesCP = lireDe(t.id, 'indicesCP', {}) || {};
        const indicesA = lireDe(t.id, 'indicesAssiduite', {}) || {};
        const patterns = lireDe(t.id, 'indicesPatternsRaI', {}) || {};
        const portfolios = lireDe(t.id, 'portfoliosEleves', {}) || {};

        return {
            capteLe: maintenant,
            trimestre: t.id,
            trimestreNom: String(t.nom || t.id),
            coursId: coursId || '',
            coursCode: codeDuCours(cours),
            coursNom: cours ? String(cours.nomCours || cours.titre || '') : '',
            groupe: String(fiche.groupe || ''),
            statut: fiche.statut === undefined ? null : fiche.statut,       // copié TEL QUEL (inactif, décrochage, abandon…)
            programme: String(fiche.programme || ''),
            empreinte: { grilles: grilles.map(empreinteGrille), echelles: echelles.map(empreinteEchelle) },
            grilles: copie(grilles),
            echelles: copie(echelles),
            evaluations: copie(evaluations),
            presences: copie(presences),
            interventions,
            snapshots: { hebdomadaires, interventions: snapshotsInterventions },
            // LUS au stockage, jamais recalculés ; null = absent à la capture (l'écran le dit).
            indices: {
                cp: copie(indicesCP[da]),
                assiduite: copie(indicesA.sommatif ? indicesA.sommatif[da] : undefined),
                patternsRaI: copie(patterns[da])
            },
            portfolio: copie(portfolios[da])
        };
    }

    function resumerDossiers(dossiers) {
        const grilles = new Set();
        let nbEvaluations = 0, nbSeances = 0;
        dossiers.forEach((d) => {
            nbEvaluations += d.evaluations.length;
            nbSeances += d.presences.length;
            d.empreinte.grilles.forEach((g) => grilles.add(g.nom || g.id));
        });
        return { nbDossiers: dossiers.length, nbEvaluations, nbSeances, grilles: Array.from(grilles), poidsOctets: JSON.stringify(dossiers).length };
    }

    /**
     * « Inscrire » / « Re-capturer » : capture, en un seul geste, tous les trimestres-cours où ce DA figure.
     * Re-capturer remplace le dossier du même trimestre + cours et garde les autres ; `inscritLe` ne bouge pas.
     * Seule écriture de ce module : `registreLongitudinal`, par db.set.
     */
    async function inscrire(da) {
        da = String(da || '');
        const eleve = elevesDeTousLesTrimestres().find((e) => e.da === da);
        if (!eleve) return { ok: false, refus: MOTS.refusInconnu };
        const maintenant = new Date(Date.now()).toISOString();
        const trimestres = trimestresRepertories();
        const dossiersNeufs = eleve.presences.map((p) => capturerDossier(da, trimestres.find((t) => t.id === p.trimestreId), p.coursId, maintenant));

        const registre = lireRegistre();
        // Les grilles et échelles sont rangées UNE fois par trimestre (modeles), le dossier garde leurs ids et son empreinte.
        let poidsModeles = 0;
        dossiersNeufs.forEach((d) => {
            d.grilles.forEach((g) => { registre.modeles.grilles[d.trimestre + ':' + g.id] = g; poidsModeles += JSON.stringify(g).length; });
            d.echelles.forEach((ec) => { registre.modeles.echelles[d.trimestre + ':' + ec.id] = ec; poidsModeles += JSON.stringify(ec).length; });
            d.grillesIds = d.grilles.map((g) => g.id);
            d.echellesIds = d.echelles.map((ec) => ec.id);
            delete d.grilles;
            delete d.echelles;
        });
        const existant = registre.eleves[da];
        const dossiersGardes = (existant && Array.isArray(existant.dossiers) ? existant.dossiers : [])
            .filter((d) => !dossiersNeufs.some((n) => n.trimestre === d.trimestre && n.coursId === d.coursId));
        registre.eleves[da] = {
            da,
            nom: eleve.nom,
            prenom: eleve.prenom,
            inscritLe: existant && existant.inscritLe ? existant.inscritLe : maintenant.slice(0, 10),
            dossiers: dossiersGardes.concat(dossiersNeufs),
            resultatsUlterieurs: existant && Array.isArray(existant.resultatsUlterieurs) ? existant.resultatsUlterieurs : []
        };
        await db.set(NOM_CLE, registre); // security-ok: copie de données déjà rangées par l'app, aucune source externe ; rendu par textContent
        const resume = resumerDossiers(dossiersNeufs);
        resume.poidsModelesOctets = poidsModeles;
        return { ok: true, resume, recapture: !!existant };
    }

    /** Mesure (pas une estimation) : le poids structuré et le poids des blobs d'un trimestre, en caractères JSON, pour le rapport du lot 2. */
    function mesurerPoidsTrimestre(trimestreId) {
        const prefixe = trimestreId + '_';
        let structure = 0, blobs = 0;
        const cles = typeof localStorage !== 'undefined' ? Object.keys(localStorage) : [];
        if (db.memoryCache && typeof db.memoryCache.keys === 'function') Array.from(db.memoryCache.keys()).forEach((k) => { if (!cles.includes(k)) cles.push(k); });
        cles.filter((k) => k.startsWith(prefixe)).forEach((k) => {
            const valeur = db.getSync(k, null);
            const taille = valeur === null ? 0 : JSON.stringify(valeur).length;
            if (CLES_BLOBS.some((b) => k.startsWith(prefixe + b))) blobs += taille; else structure += taille;
        });
        return { trimestreId, structure, blobs };
    }

    /* ---------- Rendu (bâti par le DOM : aucun innerHTML) ---------- */

    function poser(parent, balise, classe, texte) {
        const el = document.createElement(balise);
        if (classe) el.className = classe;
        if (texte) el.textContent = texte;
        parent.appendChild(el);
        return el;
    }

    function formaterDate(iso) {
        const texte = String(iso || '');
        return texte.length >= 10 ? texte.slice(0, 10) : texte;
    }

    function libellePresence(p) {
        return p.trimestreNom + (p.coursCode ? ' (' + p.coursCode + (p.groupe ? ', gr. ' + p.groupe : '') + ')' : '');
    }

    function formaterResume(resume) {
        const parts = [resume.nbEvaluations + ' ' + MOTS.evaluations, resume.nbSeances + ' ' + MOTS.seances];
        if (resume.grilles.length) parts.push(resume.grilles.length + ' ' + MOTS.grilles + ' : ' + resume.grilles.join(', '));
        parts.push(resume.nbDossiers + ' ' + MOTS.dossiers + ', ' + Math.round(resume.poidsOctets / 1024) + ' Ko');
        return parts.join(' · ');
    }

    function rendreRecherche(zone) {
        zone.textContent = '';
        poser(zone, 'h3', 'rl-titre', MOTS.rechercheTitre);
        poser(zone, 'p', 'texte-aide', MOTS.rechercheAide);
        if (!trimestresRepertories().length) {
            poser(zone, 'p', 'etat-vide-liste', MOTS.aucunTrimestre);
            return;
        }
        // type="search" : le seul type d'input que la garde CSS du mode archive laisse ouvert — et ce champ ne touche aucun trimestre.
        const champ = poser(zone, 'input', 'controle-form rl-recherche');
        champ.type = 'search';
        champ.id = 'rl-recherche';
        champ.setAttribute('placeholder', MOTS.recherchePlaceholder);
        champ.setAttribute('autocomplete', 'off');
        champ.setAttribute('data-on-input', 'rechercherEleveLongitudinal');
        poser(zone, 'ul', 'rl-resultats').id = 'rl-resultats';
        poser(zone, 'div', 'rl-choix').id = 'rl-choix';
        rendreResultats('');
        rendreChoix();
    }

    function rendreResultats(texte) {
        const liste = document.getElementById('rl-resultats');
        if (!liste) return;
        liste.textContent = '';
        const motif = normaliser(texte);
        if (!motif) return; // rien tapé : rien listé (200 noms n'ont pas à s'afficher d'un coup)
        const trouves = rechercherEleves(motif);
        if (!trouves.length) {
            poser(liste, 'li', 'rl-vide', MOTS.aucunResultat);
            return;
        }
        trouves.slice(0, MAX_RESULTATS_RECHERCHE).forEach((e) => {
            const li = poser(liste, 'li', 'rl-resultat');
            const bouton = poser(li, 'button', 'rl-cible rl-resultat-bouton');
            bouton.type = 'button';
            bouton.setAttribute('data-action', 'choisirEleveLongitudinal');
            bouton.dataset.da = e.da;
            poser(bouton, 'span', 'rl-nom', e.nom + ', ' + e.prenom);
            poser(bouton, 'span', 'rl-meta', e.presences.map(libellePresence).join(' · '));
        });
        if (trouves.length > MAX_RESULTATS_RECHERCHE) poser(liste, 'li', 'rl-vide', MOTS.tropDeResultats);
    }

    function rendreChoix() {
        const zone = document.getElementById('rl-choix');
        if (!zone) return;
        zone.textContent = '';
        if (!daChoisi) return;
        const eleve = elevesDeTousLesTrimestres().find((e) => e.da === daChoisi);
        if (!eleve) return;
        const dejaInscrit = !!lireRegistre().eleves[daChoisi];
        poser(zone, 'p', 'rl-nom', eleve.nom + ', ' + eleve.prenom);
        poser(zone, 'p', 'rl-meta', eleve.presences.map(libellePresence).join(' · '));
        const bouton = poser(zone, 'button', 'btn btn-principal rl-cible', dejaInscrit ? MOTS.recapturer : MOTS.inscrire);
        bouton.type = 'button';
        bouton.id = 'rl-inscrire';
        bouton.setAttribute('data-action', 'inscrireEleveLongitudinal');
        bouton.dataset.da = daChoisi;
        if (dejaInscrit) bouton.setAttribute('data-confirm', MOTS.confirmerRecapture);
        if (dernierResume && dernierResume.da === daChoisi) {
            poser(zone, 'p', 'rl-resume', formaterResume(dernierResume.resume) + ' — ' + MOTS.captureFaite + ' ' + formaterDate(dernierResume.quand));
        }
    }

    function rendreInscrits(zone) {
        zone.textContent = '';
        const inscrits = elevesInscrits();
        if (!inscrits.length) {
            poser(zone, 'p', 'etat-vide-liste', MOTS.aucunInscrit);
            return;
        }
        const liste = poser(zone, 'ul', 'rl-eleves');
        inscrits.forEach((e) => {
            const li = poser(liste, 'li', 'rl-eleve');
            li.dataset.da = String(e.da || '');
            poser(li, 'span', 'rl-nom', String(e.nom || '') + ', ' + String(e.prenom || ''));
            const dossiers = Array.isArray(e.dossiers) ? e.dossiers : [];
            const origines = dossiers.map((d) => d.trimestreNom || d.trimestre).filter(Boolean);
            const derniere = dossiers.map((d) => d.capteLe || '').sort().pop();
            const meta = [origines.join(' · '), derniere ? MOTS.captureFaite + ' ' + formaterDate(derniere) : MOTS.inscritLe + ' ' + formaterDate(e.inscritLe)].filter(Boolean).join(' — ');
            poser(li, 'span', 'rl-meta', meta);
        });
    }

    function afficherRegistreLongitudinal() {
        const conteneur = document.getElementById('registre-longitudinal-conteneur');
        if (!conteneur) return;
        conteneur.textContent = '';
        poser(conteneur, 'p', 'text-muted', MOTS.sousTitre);
        poser(conteneur, 'p', 'texte-aide', MOTS.perennite);
        const recherche = poser(conteneur, 'section', 'rl-zone-recherche');
        recherche.id = 'rl-zone-recherche';
        rendreRecherche(recherche);
        const inscrits = poser(conteneur, 'section', 'rl-zone-inscrits');
        inscrits.id = 'rl-zone-inscrits';
        rendreInscrits(inscrits);
    }

    /** Hook d'affichage du sous-onglet (navigation.js). Lit, rend, n'écrit rien. */
    function initialiserRegistreLongitudinal() {
        afficherRegistreLongitudinal();
    }

    /* ---------- Gestes (dispatchers data-on-input / data-action de main.js : fn(el)) ---------- */

    function rechercherEleveLongitudinal(el) {
        rendreResultats(el && el.value !== undefined ? el.value : '');
    }

    function choisirEleveLongitudinal(el) {
        daChoisi = el && el.dataset ? String(el.dataset.da || '') : '';
        rendreChoix();
    }

    async function inscrireEleveLongitudinal(el) {
        const da = el && el.dataset ? String(el.dataset.da || '') : '';
        const issue = await inscrire(da);
        if (issue.ok) dernierResume = { da, resume: issue.resume, quand: new Date(Date.now()).toISOString() };
        rendreChoix();
        const zone = document.getElementById('rl-zone-inscrits');
        if (zone) rendreInscrits(zone);
        return issue;
    }

    window.MOTS_REGISTRE_LONGITUDINAL = MOTS;
    window.initialiserRegistreLongitudinal = initialiserRegistreLongitudinal;
    window.afficherRegistreLongitudinal = afficherRegistreLongitudinal;
    window.rechercherEleveLongitudinal = rechercherEleveLongitudinal;
    window.choisirEleveLongitudinal = choisirEleveLongitudinal;
    window.inscrireEleveLongitudinal = inscrireEleveLongitudinal;
    // Pour les bancs et les lecteurs (export de recherche au lot 3) : tout sans passer par le DOM.
    window.registreLongitudinal = {
        NOM_CLE, FORMAT, VERSION,
        lire: lireRegistre, inscrits: elevesInscrits,
        trimestres: trimestresRepertories, eleves: elevesDeTousLesTrimestres, rechercher: rechercherEleves,
        capturerDossier, inscrire, mesurerPoidsTrimestre
    };
})();

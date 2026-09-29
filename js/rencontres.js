/* ===============================
   RENCONTRES.JS — Suivi › Rencontres (cadrage « Rencontres », 12 septembre 2026)

   L'objet d'une rencontre est l'INTERVENTION (js/interventions.js) : même module, même
   donnée, un vocabulaire « rencontre » (mots tranchés par Grégoire le 11 sept., 19 h 35).
   Ce fichier ne fait que deux choses :

   1. décider ce que montre le sous-onglet — LES TROIS QUESTIONS quand rien ne permet
      encore de tenir une rencontre (aucun trimestre, ou aucun contexte actif) ; LA PORTE
      vers un service (créer, ou activer celui du trimestre) quand le contexte actif est un
      cours ordinaire (tranché par Grégoire le 12 sept. : « Rencontres » ne liste que les
      services, « Interventions » reste ce qu'il est) ; sinon LA LISTE des rencontres du
      service actif ;
   2. créer, depuis les trois questions, ce que le magasin exige et rien d'autre : un
      trimestre s'il n'en existe aucun, un cours de nature « service », ses élèves, un
      groupe-cours sans horaire — le tout visible dans Cadre, tel quel. Aucun magasin à
      part, aucun troisième chemin de données : `obtenirEtudiantsCoursActif()` rend la
      liste du service par le chemin commun.

   Les mots qui nomment le service (« service d'orthopédagogie », « Orthopédagogie ») viennent
   du point unique js/mots-nature.js — tranché par Grégoire le 12 sept. (7 h 35) : « il s'agit
   d'un type d'utilisateur complètement différent d'un enseignant », l'orthopédagogie se nomme.
   Le jour où d'autres services existent, le mot change LÀ, pas ici.

   ⚠ Mots à l'écran : ceux du § 2 B de la consigne du 12 sept. (relevé de la porte) ; la carte
   sur un groupe-cours ordinaire est proposée par cette session, à corriger par Grégoire.
   =============================== */

(function() {
'use strict';

/* ===============================
   AFFICHAGE
   =============================== */

function _trimestreActifOuNull() {
    if (typeof obtenirTrimestreActif === 'function') {
        const t = obtenirTrimestreActif();
        if (t) return t;
    }
    const trimestres = db.getSync('trimestres', []) || [];
    return trimestres.find(t => t && t.actif) || null;
}

function _contexteActifOuNull() {
    const infoCours = db.getSync('infoCours', null);
    if (infoCours && infoCours.id) return infoCours;
    return null;
}

/**
 * Point d'entrée du sous-onglet (appelé par navigation.js à chaque affichage).
 * Trois questions si rien ne permet de tenir une rencontre ; la liste sinon.
 */
function afficherRencontres() {
    const conteneur = document.getElementById('conteneurRencontres');
    if (!conteneur) return;

    // Lot E3 (D3) : une rencontre en cours de création reste à l'écran au retour sur le sous-onglet
    // (elle était perdue en silence) ; la question de sortie ne peut pas être posée en partant,
    // `navigation.js` étant une zone protégée.
    if (typeof interventionEnCreationAffichee === 'function' && interventionEnCreationAffichee()
        && conteneur.querySelector('[data-fiche-intervention]')) {
        if (typeof definirVocabulaireInterventions === 'function') definirVocabulaireInterventions('rencontres');
        return;
    }

    const trimestre = _trimestreActifOuNull();
    const contexte = trimestre ? _contexteActifOuNull() : null;

    if (!trimestre || !contexte) {
        afficherTroisQuestions(conteneur, { sansTrimestre: !trimestre });
        return;
    }

    // ▣ Tranché par Grégoire le 12 sept. (21 h 02) : « Rencontres » ne liste que les SERVICES.
    // Sur un groupe-cours ordinaire, pas de liste (fini le doublon à deux vocabulaires avec
    // « Interventions », qui reste ce qu'il est) : seulement la porte « Créer un service » et,
    // s'il existe déjà un service dans le trimestre, le lien pour l'activer. La fusion des deux
    // sous-onglets se rejuge après le mois d'usage, pas avant.
    const estService = typeof contexteActifEstService === 'function' && contexteActifEstService();
    if (!estService) {
        afficherPorteVersUnService(conteneur, trimestre);
        return;
    }

    // Un service est actif : la liste des rencontres de CE contexte, vocabulaire « rencontre »
    // (filtrée par le lot D — une rencontre née ailleurs n'apparaît pas ici).
    if (typeof definirVocabulaireInterventions === 'function') definirVocabulaireInterventions('rencontres');
    conteneur.innerHTML = '<div id="listeRencontres"></div>'; // security-ok: chaîne littérale, sans donnée
    if (typeof afficherListeInterventions === 'function') afficherListeInterventions();
}

/** Les groupes-cours de service du trimestre (un cours de nature « service »), lecture seule. */
function _servicesDuTrimestre(trimestre) {
    const cours = db.getSync('cours', []) || [];
    const estService = (id) => cours.some(c => c && c.id === id && (typeof estCoursService === 'function' ? estCoursService(c) : c.nature === 'service'));
    return (db.getSync(cle('groupesCours'), []) || [])
        .filter(gc => gc && gc.id && (!gc.trimestreId || gc.trimestreId === trimestre.id) && estService(gc.coursId))
        .map(gc => ({ id: gc.id, nom: (cours.find(c => c && c.id === gc.coursId) || {}).nomCours || gc.nom || gc.id }));
}

/**
 * Sur un groupe-cours ordinaire : la porte vers un service — créer, ou activer celui qui existe.
 * Aucune liste ici (décision du 12 sept.). Mots à valider par Grégoire.
 */
function afficherPorteVersUnService(conteneur, trimestre) {
    const services = _servicesDuTrimestre(trimestre);
    const liens = services.map(s =>
        '<li><button type="button" class="lien-reglages" data-action="activerServiceRencontres" data-param="' + echapperHtml(s.id) + '">'
        + echapperHtml(s.nom) + '</button></li>').join('');
    const mots = motsNature('service');
    conteneur.innerHTML = `
        <div class="carte">
            <p class="text-muted">Les rencontres d'orthopédagogie se tiennent dans un <strong>${mots.objetLong}</strong> — dans Cadre, un cours de nature « ${mots.nature} », sans code ni horaire. Le groupe-cours actif est un cours d'enseignement : ses interventions sont sous <strong>Suivi › Interventions</strong>.</p>
            ${services.length > 0 ? `
            <p class="u-mb-10">Un ${mots.objetLong} existe déjà dans ce trimestre. Active-le pour tenir tes rencontres :</p>
            <ul class="u-mb-15">${liens}</ul>` : ''}
            <p class="text-muted u-texte-09 u-mb-10">Tu es orthopédagogue et tu reçois des élèves hors d'un groupe-cours ?
                <button type="button" class="lien-reglages" data-action="afficherTroisQuestionsRencontres">Créer un ${mots.objetLong}</button></p>
        </div>`;
}

/** Depuis la porte : activer un service existant, puis revenir au sous-onglet (la liste, cette fois). */
async function activerServiceRencontres(gcId) {
    if (!gcId) return;
    if (typeof changerGroupeCoursActifV2 === 'function') await changerGroupeCoursActifV2(gcId);
    if (typeof peuplerDropdownGroupeCoursActif === 'function') { try { await peuplerDropdownGroupeCoursActif(); } catch (e) { console.warn('[Rencontres] en-tête non rafraîchi :', e); } }
    afficherRencontres();
}

/** Depuis la liste d'un groupe-cours ordinaire : revenir aux trois questions pour créer un service. */
function afficherTroisQuestionsRencontres() {
    const conteneur = document.getElementById('conteneurRencontres');
    if (!conteneur) return;
    afficherTroisQuestions(conteneur, { sansTrimestre: !_trimestreActifOuNull(), retourPossible: true });
}

/**
 * Les trois questions, sur un seul écran : les dates du trimestre (seulement s'il n'en
 * existe aucun), le nom du service, la liste des élèves — puis « Créer mon service ».
 */
function afficherTroisQuestions(conteneur, options) {
    options = options || {};
    const mots = motsNature('service');
    const trimestre = _trimestreActifOuNull();
    const questionTrimestre = options.sansTrimestre
        ? `
            <div class="carte u-mb-15">
                <h4 class="intervention-mt-0">1. Les dates de ton trimestre</h4>
                <p class="text-muted u-texte-09">L'application range tout par trimestre. Deux dates suffisent pour commencer.</p>
                <div class="intervention-grid-3col">
                    <div class="champ-formulaire u-m-0">
                        <label for="rencontres-dateDebut" class="label-formulaire">Début :</label>
                        <input type="date" id="rencontres-dateDebut" class="controle-form" required>
                    </div>
                    <div class="champ-formulaire u-m-0">
                        <label for="rencontres-dateFin" class="label-formulaire">Fin :</label>
                        <input type="date" id="rencontres-dateFin" class="controle-form" required>
                    </div>
                </div>
            </div>`
        : `
            <div class="carte u-mb-15">
                <h4 class="intervention-mt-0">1. Ton trimestre</h4>
                <p class="text-muted u-texte-09">Le ${mots.objet} sera créé dans le trimestre actif : <strong>${echapperHtml(trimestre.nom || trimestre.id)}</strong>.</p>
            </div>`;

    conteneur.innerHTML = `
        <div class="carte">
            <p class="text-muted">Pour tenir tes rencontres ici, l'application a besoin de trois choses. Elle crée ensuite ton ${mots.objetLong}, visible dans Cadre, tel quel.</p>
            ${questionTrimestre}
            <div class="carte u-mb-15">
                <h4 class="intervention-mt-0">2. Le nom de ton ${mots.objet}</h4>
                <p class="text-muted u-texte-09">C'est le seul nom qu'on te demandera : ni code de cours, ni discipline, ni compétence.</p>
                <div class="champ-formulaire u-m-0">
                    <label for="rencontres-nomService" class="label-formulaire">Nom du ${mots.objet} :</label>
                    <input type="text" id="rencontres-nomService" class="controle-form" required placeholder="Ex. Aide à la réussite en français">
                </div>
            </div>
            <div class="carte u-mb-15">
                <h4 class="intervention-mt-0">3. Tes élèves</h4>
                <p class="text-muted u-texte-09">Une ligne par élève : <em>Prénom Nom</em>, ou <em>DA ; Nom ; Prénom</em>, ou la liste Omnivox collée telle quelle (DA, groupe, nom, prénom…). Sans numéro de DA, un numéro provisoire est attribué. Tu pourras compléter la liste plus tard dans Cadre › Trimestre.</p>
                <div class="champ-formulaire u-m-0">
                    <label for="rencontres-eleves" class="label-formulaire">Liste des élèves :</label>
                    <textarea id="rencontres-eleves" class="controle-form" rows="8" placeholder="Léa Tremblay&#10;1234567 ; Gagnon ; Noah&#10;…"></textarea>
                </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                ${options.retourPossible ? '<button type="button" data-action="afficherRencontres" class="btn btn-secondaire">Annuler</button>' : ''}
                <button type="button" data-action="creerMonService" class="btn btn-principal">Créer mon ${mots.objetLong}</button>
            </div>
        </div>`;
}

/* ===============================
   LECTURE DE LA LISTE D'ÉLÈVES
   =============================== */

const _DA_RE = /^\d{5,}$/;
/**
 * Le numéro de groupe d'un service — le seul. Un service n'a qu'un groupe-cours ; le numéro
 * d'origine d'une ligne Omnivox (« 00007 », le groupe du collège) n'y départage rien, et
 * afficherait dans Suivi › Liste un chiffre différent par élève (lot A du 12 sept. 2026).
 * Écrit sur chaque fiche ET sur le groupe-cours ; la lecture (modes.js) n'en dépend plus.
 */
const GROUPE_SERVICE = '00001';
let _compteurDaProvisoire = 0;

/** Un DA provisoire, à sept chiffres, reconnaissable à son « 9 » de tête — quand la liste n'en donne pas. */
function _daProvisoire() {
    _compteurDaProvisoire++;
    return '9' + String((Date.now() + _compteurDaProvisoire) % 1000000).padStart(6, '0');
}

/**
 * Lit une liste tapée ou collée. Les lignes de quatre colonnes ou plus passent par la
 * lecture Omnivox partagée (`analyserListeEtudiantsCollee`, trimestre-v2-etudiants.js) ;
 * les lignes plus courtes sont lues ici : « Prénom Nom », « Nom ; Prénom », « DA ; Nom ; Prénom »,
 * « DA Prénom Nom ». Pure. Le groupe de chaque fiche est `GROUPE_SERVICE`, quel que soit le
 * numéro lu dans une ligne Omnivox (lot A, 12 sept. 2026).
 *
 * Lot B (12 sept. 2026) — mesuré sur la porte : trois lignes collées EN UNE avaient donné un
 * élève fantôme (DA « Léa Tremblay, 1234567 », groupe « Gagnon », prénom « 00007 »), sans un
 * mot : toute ligne de quatre colonnes ou plus partait au lecteur Omnivox, qui prend la
 * première colonne pour le DA sans en vérifier la forme. Désormais une telle ligne dont la
 * première colonne n'a pas la forme d'un DA, ou dont aucun nom ne se lit, est REFUSÉE et
 * NOMMÉE (`refusees`) ; l'appelant décide quoi en dire. Jamais une fiche inventée en silence.
 * @param {string} contenu
 * @returns {{fiches: Array<{da:string, nom:string, prenom:string, groupe:string, programme:string, sa:string, daProvisoire:boolean}>,
 *            refusees: Array<{numero:number, texte:string, motif:string}>}}
 */
function analyserListeEleves(contenu) {
    const fiches = [];
    const refusees = [];
    String(contenu || '').split('\n').forEach((ligneBrute, index) => {
        const ligne = ligneBrute.trim();
        if (!ligne) return;
        const colonnes = (typeof decouperLigneCollee === 'function') ? decouperLigneCollee(ligne) : ligne.split(/[\t;,]/).map(c => c.trim());
        if (colonnes.length >= 4 && typeof analyserListeEtudiantsCollee === 'function') {
            if (!_DA_RE.test(colonnes[0])) {
                refusees.push({ numero: index + 1, texte: ligne, motif: 'ne commence pas par un numéro de DA' });
                return;
            }
            const lues = analyserListeEtudiantsCollee(ligne).filter(f => f.nom || f.prenom);
            if (lues.length === 0) {
                refusees.push({ numero: index + 1, texte: ligne, motif: 'aucun nom après le numéro de DA' });
                return;
            }
            lues.forEach(f => fiches.push(Object.assign({ daProvisoire: false }, f, { groupe: GROUPE_SERVICE })));
            return;
        }
        let da = '', nom = '', prenom = '';
        const cols = colonnes.filter(c => c !== '');
        if (cols.length >= 3) {
            if (_DA_RE.test(cols[0])) { da = cols[0]; nom = cols[1]; prenom = cols[2]; }
            else { nom = cols[0]; prenom = cols[1]; }
        } else if (cols.length === 2) {
            if (_DA_RE.test(cols[0])) {
                // « DA ; Prénom Nom »
                da = cols[0];
                const mots = cols[1].split(/\s+/);
                nom = mots.length > 1 ? mots.pop() : mots[0]; prenom = mots.join(' ');
            } else { nom = cols[0]; prenom = cols[1]; }   // « Prénom Nom ; DA » (DA en second) se lit nom / prénom : vrai, pas vécu, laissé (12 sept. 2026)
        } else if (cols.length === 1) {
            const mots = cols[0].split(/\s+/);
            if (_DA_RE.test(mots[0])) da = mots.shift();
            nom = mots.length > 1 ? mots.pop() : (mots[0] || '');
            prenom = mots.join(' ');
        }
        if (!nom && !prenom) return;
        const provisoire = !da;
        fiches.push({ da: da || _daProvisoire(), nom, prenom, groupe: GROUPE_SERVICE, programme: '', sa: '', daProvisoire: provisoire });
    });
    return { fiches, refusees };
}

/**
 * Le mot du refus (lot B) — titre et message d'une notification, en `textContent`.
 * Proposé à Grégoire le 12 sept. 2026 (consigne § 4) ; livré tel quel, il corrigera.
 */
function _motDuRefus(refusees) {
    const n = refusees.length;
    const titre = n > 1 ? `${n} lignes n'ont pas pu être lues` : 'Une ligne n\'a pas pu être lue';
    const detail = refusees.slice(0, 3).map(r => {
        const extrait = r.texte.length > 40 ? r.texte.slice(0, 40) + '…' : r.texte;
        return `Ligne ${r.numero} (« ${extrait} ») : ${r.motif}.`;
    }).join(' ');
    return { titre, message: detail + ' Une ligne par élève : Prénom Nom, ou DA ; Nom ; Prénom, ou la ligne Omnivox telle quelle.' };
}

/* ===============================
   CRÉATION — ce que le magasin exige, rien d'autre
   =============================== */

function _sessionDepuisDate(dateYMD) {
    const mois = parseInt(String(dateYMD).slice(5, 7), 10);
    if (mois >= 1 && mois <= 5) return 'H';
    if (mois >= 6 && mois <= 7) return 'E';
    return 'A';
}

/**
 * Crée le trimestre (au besoin), le service, ses élèves et son groupe-cours, puis active le
 * groupe-cours et revient à la liste. Chaque geste passe par le chemin existant du Cadre :
 * `creerTrimestre` / `changerTrimestreActif` (trimestres.js), `cle('cadreCalendrier')` +
 * `genererCalendrierComplet`, `CoursEntite.creer`, `db.modifier(cle('groupeEtudiants'))`,
 * la liste `cle('groupesCours')`, `changerGroupeCoursActifV2`.
 */
async function creerMonService() {
    const nomService = (document.getElementById('rencontres-nomService')?.value || '').trim();
    const contenuEleves = document.getElementById('rencontres-eleves')?.value || '';
    const mots = motsNature('service');
    if (!nomService) {
        notifications.erreur('Nom du ' + mots.objet + ' requis', 'Un nom suffit : il s\'affiche partout où un cours montre son code.');
        document.getElementById('rencontres-nomService')?.focus();
        return;
    }
    const lecture = analyserListeEleves(contenuEleves);
    const fiches = lecture.fiches;
    if (fiches.length === 0) {
        // Lot B : rien de valide — le service ne se crée pas, et la ligne refusée est nommée.
        if (lecture.refusees.length > 0) {
            const mot = _motDuRefus(lecture.refusees);
            notifications.erreur(mot.titre, mot.message);
        } else {
            notifications.erreur('Aucun élève lu', 'Une ligne par élève : Prénom Nom, ou DA ; Nom ; Prénom.');
        }
        document.getElementById('rencontres-eleves')?.focus();
        return;
    }

    // 1. Le trimestre, s'il n'en existe aucun.
    let trimestre = _trimestreActifOuNull();
    if (!trimestre) {
        const dateDebut = document.getElementById('rencontres-dateDebut')?.value || '';
        const dateFin = document.getElementById('rencontres-dateFin')?.value || '';
        if (!dateDebut || !dateFin || dateFin < dateDebut) {
            notifications.erreur('Dates du trimestre requises', 'Un début et une fin, la fin après le début.');
            return;
        }
        const session = _sessionDepuisDate(dateDebut);
        const annee = String(dateDebut).slice(0, 4);
        const idTrimestre = session.toLowerCase() + annee;
        const existants = db.getSync('trimestres', []) || [];
        let cree = existants.find(t => t && t.id === idTrimestre) || null;
        if (!cree && typeof creerTrimestre === 'function') cree = creerTrimestre(session, annee, true);
        if (!cree) {
            notifications.erreur('Trimestre non créé', 'Crée-le dans Cadre › Trimestre, puis reviens ici.');
            return;
        }
        if (typeof changerTrimestreActif === 'function') changerTrimestreActif(idTrimestre);
        // security-ok: deux valeurs d'<input type="date"> (AAAA-MM-JJ), lues par genererCalendrierComplet comme des dates ; même forme que sauvegarderCadreCalendrierV2
        db.setSync(cle('cadreCalendrier'), {
            dateDebut: dateDebut, finCours: dateFin, finTrimestre: dateFin, remiseNotes: '',
            semainePlanificationDebut: '', semainePlanificationFin: '', semaineExamensDebut: '', semaineExamensFin: ''
        });
        if (typeof genererCalendrierComplet === 'function') genererCalendrierComplet();
        trimestre = _trimestreActifOuNull();
        if (!trimestre) {
            notifications.erreur('Trimestre non activé', 'Active-le dans Cadre › Trimestre, puis reviens ici.');
            return;
        }
    }

    // 2. Le service : un cours de nature « service » (lot A).
    const service = await CoursEntite.creer({ nature: 'service', nomCours: nomService });
    if (!service) {
        notifications.erreur(mots.ObjetLong + ' non créé', 'La fiche n\'a pas pu être enregistrée.');
        return;
    }
    // ⚠ `cours` est une clé GLOBALE, pas namespacée (mesuré le 11 sept. au soir) : un service créé
    // PENDANT la démonstration resterait dans la vraie liste de cours de l'enseignant après la
    // démo — la désactivation ne retire que les items du pack. On le marque ici, et
    // `retirerItemsDemoDesGlobaux` (demo-activation.js) retire ce marqueur-là aussi.
    if (typeof estEnModeDemo === 'function' && estEnModeDemo()) {
        await db.modifier('cours', (lus) => (lus || []).map(c => (c && c.id === service.id) ? Object.assign({}, c, { isDemo: true, creeEnDemonstration: true }) : c), []);
    }

    // 3. Les élèves, dans la liste du trimestre ; un DA déjà présent n'est pas dupliqué.
    let nbAjoutes = 0, nbDejaPresents = 0;
    await db.modifier(cle('groupeEtudiants'), (lus) => {
        const etudiants = lus || [];
        const dasPresents = new Set(etudiants.map(e => e && String(e.da)));
        fiches.forEach(f => {
            if (dasPresents.has(String(f.da))) { nbDejaPresents++; return; }
            dasPresents.add(String(f.da));
            etudiants.push({ da: f.da, nom: f.nom, prenom: f.prenom, groupe: GROUPE_SERVICE, programme: f.programme || '', sa: f.sa || '', coursId: service.id });
            nbAjoutes++;
        });
        return etudiants;
    }, []);

    // 4. Le groupe-cours, sans horaire (lot B). L'enseignant·e : le premier profil connu, sinon « profil ».
    const enseignants = db.getSync('enseignants', []) || [];
    const enseignantId = (enseignants[0] && enseignants[0].id) || 'profil';
    const cleGC = cle('groupesCours');
    const groupesCours = db.getSync(cleGC, []) || [];
    const nomTrimestre = trimestre.nom || trimestre.id;
    const gc = {
        id: genererIdUnique('GC_'),
        nom: `${nomTrimestre} - ${nomService} - ${GROUPE_SERVICE}`,
        trimestreId: trimestre.id,
        coursId: service.id,
        groupeNum: GROUPE_SERVICE,
        horaireId: null,
        enseignantId: enseignantId,
        pratiqueId: null,
        dateCreation: new Date().toISOString(),
        actif: false
    };
    groupesCours.push(gc);
    db.setSync(cleGC, groupesCours);
    if (window.signalerEcritureUsager) window.signalerEcritureUsager(cleGC);   // lot F : geste hors témoin (créer mon service)

    // 5. Le service devient le contexte actif ; l'en-tête et le Cadre le montrent.
    if (typeof changerGroupeCoursActifV2 === 'function') await changerGroupeCoursActifV2(gc.id);
    if (typeof peuplerDropdownGroupeCoursActif === 'function') { try { await peuplerDropdownGroupeCoursActif(); } catch (e) { console.warn('[Rencontres] en-tête non rafraîchi :', e); } }

    const nbProvisoires = fiches.filter(f => f.daProvisoire).length;
    notifications.succes(mots.ObjetLong + ' créé',
        `${nbAjoutes} élève${nbAjoutes > 1 ? 's' : ''} ajouté${nbAjoutes > 1 ? 's' : ''}`
        + (nbDejaPresents > 0 ? `, ${nbDejaPresents} déjà présent${nbDejaPresents > 1 ? 's' : ''}` : '')
        + (nbProvisoires > 0 ? ` (${nbProvisoires} sans DA : numéro provisoire)` : '')
        + '. Tes rencontres d\'orthopédagogie se tiennent ici ; Cadre montre le ' + mots.objet + ' tel quel.');
    // Lot B : le service est créé avec les lignes valides ; celles qui ne l'étaient pas sont nommées.
    if (lecture.refusees.length > 0) {
        const mot = _motDuRefus(lecture.refusees);
        notifications.warning(mot.titre, mot.message);
    }

    afficherRencontres();
}

/* ===============================
   EXPORTS
   =============================== */
window.afficherRencontres = afficherRencontres;
window.afficherTroisQuestionsRencontres = afficherTroisQuestionsRencontres;
window.activerServiceRencontres = activerServiceRencontres;
window.creerMonService = creerMonService;
window.analyserListeEleves = analyserListeEleves;

})();

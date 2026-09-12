/* ===============================
   RENCONTRES.JS — Suivi › Rencontres (cadrage « Rencontres », 12 septembre 2026)

   L'objet d'une rencontre est l'INTERVENTION (js/interventions.js) : même module, même
   donnée, un vocabulaire « rencontre » (mots tranchés par Grégoire le 11 sept., 19 h 35).
   Ce fichier ne fait que deux choses :

   1. décider ce que montre le sous-onglet — LES TROIS QUESTIONS quand rien ne permet
      encore de tenir une rencontre (aucun trimestre, ou aucun contexte actif), sinon LA
      LISTE des rencontres du contexte actif (service ou groupe-cours ordinaire) ;
   2. créer, depuis les trois questions, ce que le magasin exige et rien d'autre : un
      trimestre s'il n'en existe aucun, un cours de nature « service », ses élèves, un
      groupe-cours sans horaire — le tout visible dans Cadre, tel quel. Aucun magasin à
      part, aucun troisième chemin de données : `obtenirEtudiantsCoursActif()` rend la
      liste du service par le chemin commun.

   Le mot « orthopédagogie » n'apparaît nulle part : un enseignant qui reçoit des élèves
   à son bureau a le même sous-onglet.

   ⚠ Mots à l'écran : proposés par la session du 11 sept. au soir, à valider par
   Grégoire (règle 3 de CLAUDE.md — ce que ses collègues et leurs élèves liront).
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

    const trimestre = _trimestreActifOuNull();
    const contexte = trimestre ? _contexteActifOuNull() : null;

    if (!trimestre || !contexte) {
        afficherTroisQuestions(conteneur, { sansTrimestre: !trimestre });
        return;
    }

    // Un contexte existe : la liste des rencontres de CE contexte, vocabulaire « rencontre »
    // (filtrée par le lot D — une rencontre née ailleurs n'apparaît pas ici).
    if (typeof definirVocabulaireInterventions === 'function') definirVocabulaireInterventions('rencontres');
    const estService = typeof contexteActifEstService === 'function' && contexteActifEstService();
    let html = '';
    if (!estService) {
        // Groupe-cours ordinaire : la même liste, et une porte discrète vers un service —
        // suivre des élèves hors d'un groupe-cours (mots à valider).
        html += '<p class="text-muted u-texte-09 u-mb-10">Tu reçois des élèves hors d\'un groupe-cours ? '
            + '<button type="button" class="lien-reglages" data-action="afficherTroisQuestionsRencontres">Créer un service</button></p>';
    }
    conteneur.innerHTML = html + '<div id="listeRencontres"></div>'; // security-ok: `html` est une chaîne littérale de ce fichier, sans donnée
    if (typeof afficherListeInterventions === 'function') afficherListeInterventions();
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
                <p class="text-muted u-texte-09">Le service sera créé dans le trimestre actif : <strong>${echapperHtml(trimestre.nom || trimestre.id)}</strong>.</p>
            </div>`;

    conteneur.innerHTML = `
        <div class="carte">
            <p class="text-muted">Pour tenir tes rencontres ici, l'application a besoin de trois choses. Elle crée ensuite ton service, visible dans Cadre, tel quel.</p>
            ${questionTrimestre}
            <div class="carte u-mb-15">
                <h4 class="intervention-mt-0">2. Le nom de ton service</h4>
                <p class="text-muted u-texte-09">C'est le seul nom qu'on te demandera : ni code de cours, ni discipline, ni compétence.</p>
                <div class="champ-formulaire u-m-0">
                    <label for="rencontres-nomService" class="label-formulaire">Nom du service :</label>
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
                <button type="button" data-action="creerMonService" class="btn btn-principal">Créer mon service</button>
            </div>
        </div>`;
}

/* ===============================
   LECTURE DE LA LISTE D'ÉLÈVES
   =============================== */

const _DA_RE = /^\d{5,}$/;
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
 * « DA Prénom Nom ». Pure.
 * @param {string} contenu
 * @returns {Array<{da:string, nom:string, prenom:string, groupe:string, programme:string, sa:string, daProvisoire:boolean}>}
 */
function analyserListeEleves(contenu) {
    const fiches = [];
    String(contenu || '').split('\n').forEach(ligneBrute => {
        const ligne = ligneBrute.trim();
        if (!ligne) return;
        const colonnes = (typeof decouperLigneCollee === 'function') ? decouperLigneCollee(ligne) : ligne.split(/[\t;,]/).map(c => c.trim());
        if (colonnes.length >= 4 && typeof analyserListeEtudiantsCollee === 'function') {
            analyserListeEtudiantsCollee(ligne).forEach(f => fiches.push(Object.assign({ daProvisoire: false }, f)));
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
            } else { nom = cols[0]; prenom = cols[1]; }
        } else if (cols.length === 1) {
            const mots = cols[0].split(/\s+/);
            if (_DA_RE.test(mots[0])) da = mots.shift();
            nom = mots.length > 1 ? mots.pop() : (mots[0] || '');
            prenom = mots.join(' ');
        }
        if (!nom && !prenom) return;
        const provisoire = !da;
        fiches.push({ da: da || _daProvisoire(), nom, prenom, groupe: '00001', programme: '', sa: '', daProvisoire: provisoire });
    });
    return fiches;
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
    if (!nomService) {
        notifications.erreur('Nom du service requis', 'Un nom suffit : il s\'affiche partout où un cours montre son code.');
        document.getElementById('rencontres-nomService')?.focus();
        return;
    }
    const fiches = analyserListeEleves(contenuEleves);
    if (fiches.length === 0) {
        notifications.erreur('Aucun élève lu', 'Une ligne par élève : Prénom Nom, ou DA ; Nom ; Prénom.');
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
        notifications.erreur('Service non créé', 'La fiche n\'a pas pu être enregistrée.');
        return;
    }

    // 3. Les élèves, dans la liste du trimestre ; un DA déjà présent n'est pas dupliqué.
    let nbAjoutes = 0, nbDejaPresents = 0;
    await db.modifier(cle('groupeEtudiants'), (lus) => {
        const etudiants = lus || [];
        const dasPresents = new Set(etudiants.map(e => e && String(e.da)));
        fiches.forEach(f => {
            if (dasPresents.has(String(f.da))) { nbDejaPresents++; return; }
            dasPresents.add(String(f.da));
            etudiants.push({ da: f.da, nom: f.nom, prenom: f.prenom, groupe: f.groupe || '00001', programme: f.programme || '', sa: f.sa || '', coursId: service.id });
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
        nom: `${nomTrimestre} - ${nomService} - 00001`,
        trimestreId: trimestre.id,
        coursId: service.id,
        groupeNum: '00001',
        horaireId: null,
        enseignantId: enseignantId,
        pratiqueId: null,
        dateCreation: new Date().toISOString(),
        actif: false
    };
    groupesCours.push(gc);
    db.setSync(cleGC, groupesCours);

    // 5. Le service devient le contexte actif ; l'en-tête et le Cadre le montrent.
    if (typeof changerGroupeCoursActifV2 === 'function') await changerGroupeCoursActifV2(gc.id);
    if (typeof peuplerDropdownGroupeCoursActif === 'function') { try { await peuplerDropdownGroupeCoursActif(); } catch (e) { console.warn('[Rencontres] en-tête non rafraîchi :', e); } }

    const nbProvisoires = fiches.filter(f => f.daProvisoire).length;
    notifications.succes('Service créé',
        `${nbAjoutes} élève${nbAjoutes > 1 ? 's' : ''} ajouté${nbAjoutes > 1 ? 's' : ''}`
        + (nbDejaPresents > 0 ? `, ${nbDejaPresents} déjà présent${nbDejaPresents > 1 ? 's' : ''}` : '')
        + (nbProvisoires > 0 ? ` (${nbProvisoires} sans DA : numéro provisoire)` : '')
        + '. Tes rencontres se tiennent ici ; Cadre montre le service tel quel.');

    afficherRencontres();
}

/* ===============================
   EXPORTS
   =============================== */
window.afficherRencontres = afficherRencontres;
window.afficherTroisQuestionsRencontres = afficherTroisQuestionsRencontres;
window.creerMonService = creerMonService;
window.analyserListeEleves = analyserListeEleves;

})();

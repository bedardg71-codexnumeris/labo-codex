/* ===============================
   MODULE: ÉQUIPES (Suivi › Animation)
   #1039 (7 oct. 2026) — besoin de Mathieu : « un générateur d'équipe aléatoire,
   par groupe, au choix, de 2, 3 ou 4 élèves ».

   Décisions de Grégoire (7 oct. 2026) :
   1. le reste de la division est DEMANDÉ à l'utilisateur (une équipe plus petite,
      ou quelques équipes d'un élève de plus) ;
   2. les absents sont écartés d'après les présences du jour ;
   3. retenir ou non les équipes (pour ne pas refaire les mêmes) est DEMANDÉ.

   Lecteur seul des présences (écrivain : saisie-presences.js). Clé propre :
   `equipesAnimation_<coursId>` (registre : docs/DATA-OWNERSHIP.md).
   =============================== */

(function() {
'use strict';

/* ===============================
   LOGIQUE PURE (testée par tests/unit/equipes-1039.test.js)
   =============================== */

/**
 * Sépare les élèves présents des absents du jour.
 * Absent = une fiche de la date à 0 période. Un retard (périodes > 0) est présent ;
 * sans fiche (présences pas encore prises), l'élève reste : on ne sait pas.
 * @returns {{ retenus: Array, absents: Array, fichesDuJour: number }}
 */
function separerAbsentsDuJour(eleves, presences, date) {
    const fiches = (Array.isArray(presences) ? presences : []).filter(p => p && p.date === date);
    const absentsDa = new Set();
    fiches.forEach(p => {
        const periodes = p.periodesPresentes !== undefined ? p.periodesPresentes : p.heures;
        if (Number(periodes) === 0) absentsDa.add(p.da);
    });
    const retenus = [];
    const absents = [];
    (eleves || []).forEach(e => (absentsDa.has(e.da) ? absents : retenus).push(e));
    return { retenus, absents, fichesDuJour: fiches.length };
}

/**
 * Nombre d'équipes complètes et reste, pour n élèves en équipes de `taille`.
 */
function analyserReste(n, taille) {
    return { completes: Math.floor(n / taille), reste: n % taille };
}

/**
 * Tailles des équipes selon le choix du reste.
 * 'petite'   : les équipes complètes, plus une équipe du reste ;
 * 'agrandir' : le reste réparti, un élève de plus par équipe (en boucle si besoin).
 * Moins d'élèves qu'une équipe : une seule équipe.
 */
function taillesEquipes(n, taille, modeReste) {
    if (n <= 0) return [];
    const { completes, reste } = analyserReste(n, taille);
    if (completes === 0) return [n];
    const tailles = new Array(completes).fill(taille);
    if (reste === 0) return tailles;
    if (modeReste === 'agrandir') {
        for (let i = 0; i < reste; i++) tailles[i % completes] += 1;
        return tailles;
    }
    tailles.push(reste);
    return tailles;
}

function clePaire(a, b) {
    return a < b ? a + '|' + b : b + '|' + a;
}

/**
 * Paires (« da1|da2 ») d'une liste d'équipes de DA.
 */
function pairesDe(equipes) {
    const paires = [];
    (equipes || []).forEach(eq => {
        for (let i = 0; i < eq.length; i++) {
            for (let j = i + 1; j < eq.length; j++) paires.push(clePaire(eq[i], eq[j]));
        }
    });
    return paires;
}

function melanger(liste, rng) {
    const copie = liste.slice();
    for (let i = copie.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = copie[i]; copie[i] = copie[j]; copie[j] = tmp;
    }
    return copie;
}

/**
 * Forme les équipes (listes de DA). Avec des paires déjà faites, tire plusieurs
 * fois et garde le tirage qui en refait le moins.
 * @param {Array<string>} das
 * @param {number} taille
 * @param {'petite'|'agrandir'} modeReste
 * @param {Array<string>} pairesDejaFaites - clés « da1|da2 »
 * @param {Function} rng - Math.random par défaut
 * @returns {{ equipes: Array<Array<string>>, pairesRefaites: number }}
 */
function formerEquipes(das, taille, modeReste, pairesDejaFaites, rng) {
    rng = rng || Math.random;
    const tailles = taillesEquipes(das.length, taille, modeReste);
    const deja = new Set(pairesDejaFaites || []);
    const essais = deja.size > 0 ? 200 : 1;
    let meilleur = null;
    for (let k = 0; k < essais; k++) {
        const ordre = melanger(das, rng);
        const equipes = [];
        let i = 0;
        tailles.forEach(t => { equipes.push(ordre.slice(i, i + t)); i += t; });
        const refaites = pairesDe(equipes).filter(p => deja.has(p)).length;
        if (!meilleur || refaites < meilleur.pairesRefaites) meilleur = { equipes, pairesRefaites: refaites };
        if (refaites === 0) break;
    }
    return meilleur;
}

window.EquipesLogique = { separerAbsentsDuJour, analyserReste, taillesEquipes, pairesDe, formerEquipes };

/* ===============================
   ÉCRAN (panneau « Équipes » de l'Animation)
   =============================== */

// État d'écran : ne voyage pas. Seules les paires RETENUES sont écrites (clé par cours).
let etatEquipes = { coursId: null, taille: null, modeReste: null, equipes: null, pairesRefaites: 0, retenues: false };

// Mots arrêtés par Grégoire le 7 oct. 2026 (plans de travail/MOTS-2026-10-07-1039-equipes.md) :
// « étudiant·es », accordé selon le nombre.
function etudiants(n) { return n > 1 ? n + ' étudiant·es' : n + ' étudiant·e'; }
function presents(n) { return n > 1 ? 'présent·es' : 'présent·e'; }
function absences(n) { return n > 1 ? n + ' absences écartées' : n + ' absence écartée'; }

function coursActifId() {
    const infoCours = db.getSync('infoCours', null);
    return infoCours?.id || 'global';
}

function cleEquipes() {
    return 'equipesAnimation_' + coursActifId();
}

function lirePairesRetenues() {
    const sauvegarde = db.getSync(cleEquipes(), null);
    return sauvegarde && Array.isArray(sauvegarde.paires) ? sauvegarde : { paires: [], formations: 0 };
}

function elevesDuJour() {
    let eleves = typeof obtenirEtudiantsCoursActif === 'function' ? obtenirEtudiantsCoursActif() : [];
    eleves = (eleves || []).filter(e => !(typeof estEtudiantExclu === 'function' && estEtudiantExclu(e)));
    const presences = typeof obtenirDonneesSelonMode === 'function' ? (obtenirDonneesSelonMode('presences') || []) : [];
    const date = typeof window.dateLocaleYMD === 'function' ? window.dateLocaleYMD() : new Date().toISOString().slice(0, 10);
    return separerAbsentsDuJour(eleves, presences, date);
}

// « 6 de 4, 1 de 3 » : décompte lisible d'une liste de tailles.
function decrireTailles(tailles) {
    const compte = new Map();
    tailles.forEach(t => compte.set(t, (compte.get(t) || 0) + 1));
    return Array.from(compte.entries()).sort((a, b) => b[0] - a[0])
        .map(([t, k]) => k + ' de ' + t).join(', ');
}

function nomAffiche(e) {
    return [e.prenom, e.nom].filter(Boolean).join(' ') || e.da;
}

function rendreEquipes() {
    const conteneur = document.getElementById('equipes-contenu');
    if (!conteneur) return;

    // Changement de groupe-cours : on repart à neuf (les équipes d'un autre groupe n'ont pas de sens ici).
    const coursId = coursActifId();
    if (etatEquipes.coursId !== coursId) {
        etatEquipes = { coursId, taille: null, modeReste: null, equipes: null, pairesRefaites: 0, retenues: false };
    }

    const { retenus, absents, fichesDuJour } = elevesDuJour();
    const n = retenus.length;
    const memoire = lirePairesRetenues();

    if (n === 0 && absents.length === 0) {
        conteneur.innerHTML = '<p class="outil-placeholder">Aucun·e étudiant·e dans le groupe actif.</p>'; // security-ok: constante
        return;
    }

    const constat = fichesDuJour === 0
        ? (n > 1 ? `Présences du jour non prises : les ${n} étudiant·es du groupe sont compté·es.` : 'Présences du jour non prises : l\'étudiant·e du groupe est compté·e.')
        : (absents.length === 0
            ? `${etudiants(n)} ${presents(n)} aujourd'hui.`
            : `${etudiants(n)} ${presents(n)} aujourd'hui ; ${absences(absents.length)} d'après les présences.`);

    const taille = etatEquipes.taille;
    const tailleRadios = [2, 3, 4].map(t => `
        <label class="equipes-choix">
            <input type="radio" name="equipes-taille" value="${t}" data-on-change="choisirTailleEquipes" ${taille === t ? 'checked' : ''}>
            <span>${t}</span>
        </label>`).join('');

    // Le reste : demandé seulement s'il y en a un ET s'il y a au moins une équipe complète.
    let blocReste = '';
    let resteAChoisir = false;
    if (taille) {
        const { completes, reste } = analyserReste(n, taille);
        if (reste > 0 && completes > 0) {
            resteAChoisir = !etatEquipes.modeReste;
            const petite = decrireTailles(taillesEquipes(n, taille, 'petite'));
            const grandes = decrireTailles(taillesEquipes(n, taille, 'agrandir'));
            blocReste = `
            <fieldset class="equipes-groupe">
                <legend>${etudiants(n)} en équipes de ${taille} : il en reste ${reste}.</legend>
                <label class="equipes-choix-ligne">
                    <input type="radio" name="equipes-reste" value="petite" data-on-change="choisirResteEquipes" ${etatEquipes.modeReste === 'petite' ? 'checked' : ''}>
                    <span>Une équipe plus petite <span class="text-muted">(${petite})</span></span>
                </label>
                <label class="equipes-choix-ligne">
                    <input type="radio" name="equipes-reste" value="agrandir" data-on-change="choisirResteEquipes" ${etatEquipes.modeReste === 'agrandir' ? 'checked' : ''}>
                    <span>Des équipes plus grandes <span class="text-muted">(${grandes})</span></span>
                </label>
            </fieldset>`;
        }
    }

    const peutFormer = !!taille && !resteAChoisir && n > 0;

    let blocResultat = '';
    if (etatEquipes.equipes) {
        const parDa = new Map(retenus.concat(absents).map(e => [e.da, e]));
        const cartes = etatEquipes.equipes.map((eq, i) => `
            <div class="equipes-carte">
                <div class="equipes-carte-titre">Équipe ${i + 1}</div>
                <ul>${eq.map(da => `<li>${echapperHtml(nomAffiche(parDa.get(da) || { da }))}</li>`).join('')}</ul>
            </div>`).join('');
        const avertissement = etatEquipes.pairesRefaites > 0
            ? `<p class="equipes-note">Impossible d'éviter toutes les équipes retenues : ${etatEquipes.pairesRefaites > 1 ? etatEquipes.pairesRefaites + ' paires d\'étudiant·es se retrouvent' : '1 paire d\'étudiant·es se retrouve'} ensemble.</p>`
            : '';
        const retenir = etatEquipes.retenues
            ? '<p class="equipes-note">Équipes retenues : les prochains tirages éviteront de remettre ensemble les mêmes étudiant·es.</p>'
            : '<button type="button" class="btn btn-secondaire" data-action="retenirEquipes">Retenir ces équipes</button>';
        blocResultat = `
            <div class="equipes-resultat">${cartes}</div>
            ${avertissement}
            <div class="equipes-actions">${retenir}</div>`;
    }

    const blocMemoire = memoire.formations > 0
        ? `<p class="equipes-memoire text-muted">Ce groupe a des équipes retenues.
               <button type="button" class="btn-lien" data-action="oublierEquipesRetenues">Oublier les équipes retenues</button></p>`
        : '';

    conteneur.innerHTML = `
        <p class="equipes-constat">${constat}</p>
        <fieldset class="equipes-groupe">
            <legend>Étudiant·es par équipe</legend>
            <div class="equipes-choix-rangee">${tailleRadios}</div>
        </fieldset>
        ${blocReste}
        <button type="button" class="btn btn-principal" data-action="formerEquipesAnimation" ${peutFormer ? '' : 'disabled'}>
            ${etatEquipes.equipes ? 'Refaire les équipes' : 'Former les équipes'}
        </button>
        ${blocResultat}
        ${blocMemoire}`;
}

function choisirTailleEquipes(el) {
    etatEquipes.taille = Number(el.value);
    etatEquipes.modeReste = null;   // le reste change avec la taille : on redemande
    etatEquipes.equipes = null;
    etatEquipes.retenues = false;
    rendreEquipes();
}

function choisirResteEquipes(el) {
    etatEquipes.modeReste = el.value === 'agrandir' ? 'agrandir' : 'petite';
    etatEquipes.equipes = null;
    etatEquipes.retenues = false;
    rendreEquipes();
}

function formerEquipesAnimation() {
    const { retenus } = elevesDuJour();
    if (!etatEquipes.taille || retenus.length === 0) return;
    const resultat = formerEquipes(retenus.map(e => e.da), etatEquipes.taille, etatEquipes.modeReste || 'petite', lirePairesRetenues().paires);
    etatEquipes.equipes = resultat.equipes;
    etatEquipes.pairesRefaites = resultat.pairesRefaites;
    etatEquipes.retenues = false;
    rendreEquipes();
}

function retenirEquipes() {
    if (!etatEquipes.equipes) return;
    const memoire = lirePairesRetenues();
    const paires = Array.from(new Set(memoire.paires.concat(pairesDe(etatEquipes.equipes))));
    db.setSync(cleEquipes(), { paires, formations: (memoire.formations || 0) + 1 });
    etatEquipes.retenues = true;
    rendreEquipes();
}

function oublierEquipesRetenues() {
    db.removeSync(cleEquipes());
    etatEquipes.retenues = false;
    rendreEquipes();
}

window.initialiserEquipes = rendreEquipes;
window.choisirTailleEquipes = choisirTailleEquipes;
window.choisirResteEquipes = choisirResteEquipes;
window.formerEquipesAnimation = formerEquipesAnimation;
window.retenirEquipes = retenirEquipes;
window.oublierEquipesRetenues = oublierEquipesRetenues;

})();

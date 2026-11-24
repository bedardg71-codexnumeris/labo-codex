// BANC « OBSERVER » AVEC DES TAMPONS D'OBSERVATION (24 nov. 2026, « Tampons d'observation », lot 2).
// Un groupe fictif sous une pratique par cibles fictive, et des tampons créés ici : rien n'est nommé d'après
// l'application (ni tampon, ni catégorie, ni critère fournis). Sert au banc du lot et à ses captures.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..', '..'), 'index.html');

export const T = 'a2031';
export const GC = 'GC_OBS2';
export const ENSEMBLE = 'ENSC_OBS2';
export const CIBLE = 'cible_obs2';
export const CAT = 'cat-banc-obs2';
export const eleves = (n = 5) => Array.from({ length: n }, (_, i) => ({ da: '31000' + (i + 1), nom: 'Fictif' + (i + 1), prenom: ['Zoé', 'Yan', 'Lou', 'Max', 'Noa', 'Kim', 'Sam'][i % 7] }));
export const criteres = (n = 4) => Array.from({ length: n }, (_, i) => ({ id: 'crit_obs2_' + (i + 1), texte: 'Critère fictif ' + (i + 1), essentiel: i < 3 }));
export const attendre = (page, ms) => page.evaluate((d) => new Promise((r) => setTimeout(r, d)), ms);

/**
 * Ouvre le tableau des cibles d'un groupe fictif.
 * @param {{nTampons?: number, avecCritere?: number, nCriteres?: number, nEleves?: number, observation?: boolean, inscriptions?: Array}} o
 *   nTampons : tampons créés dans une catégorie à soi ; les `avecCritere` premiers déclarent chacun un critère de la cible
 *   (le premier, le deuxième…) ; observation : la catégorie est cochée « d'observation » (vrai d'office s'il y a des tampons).
 */
export async function ouvrirTableau(page, o = {}) {
    const { nTampons = 0, avecCritere = 0, nCriteres = 4, nEleves = 5, inscriptions = [] } = o;
    const observation = o.observation === undefined ? nTampons > 0 : o.observation;
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && window.TableauCibles && window.InscriptionsCibles && window.ObservationCibles && window.travauxOutils, null, { timeout: 20000 });
    await page.evaluate(({ T, GC, ENSEMBLE, CIBLE, CAT, eleves, criteres, nTampons, avecCritere, observation, inscriptions }) => {
        // security-ok: fixtures littérales du banc, aucune source externe.
        const coursId = 'cours-obs2';
        const niveaux = [['0', 'Données insuffisantes', 0], ['1', 'En apprentissage', 50], ['2', 'Acquis', 100]]
            .map(([code, nom, v], i) => ({ code, nom, valeurCalcul: v, min: i * 33, max: i * 33 + 32, couleur: 'var(--gris-moyen)' }));
        const ensemble = { id: ENSEMBLE, coursId, cibles: [
            { id: CIBLE, etiquette: 'Cible fictive', enonce: '', poids: 1, terminale: false, criteres },
            { id: CIBLE + '_nue', etiquette: 'Cible fictive sans critère', enonce: '', poids: 1, terminale: false, criteres: [] }] };
        window.db.setSync('trimestres', [{ id: T, nom: 'Trimestre fictif', annee: 2031, session: 'A', actif: true }]);
        window.db.setSync('cours', [{ id: coursId, codeCours: 'FRA101', titre: 'Cours fictif' }]);
        window.db.setSync(T + '_groupesCours', [{ id: GC, trimestreId: T, coursId, groupeNum: '01', pratiqueId: 'cib-obs2', actif: true }]);
        window.db.setSync(T + '_groupeEtudiants', eleves.map((e) => Object.assign({ groupe: '01', coursId, groupeCoursId: GC }, e)));
        window.db.setSync(T + '_echellesTemplates', [{ id: 'ECH_OBS2', nom: 'Échelle fictive', niveaux }]);
        window.db.setSync(T + '_ensemblesCibles', [ensemble]);
        window.db.setSync(T + '_pratiquesConfigurables', [{ id: 'cib-obs2', nom: 'Par standards fictive', calcul_note: { methode: 'niveaux_par_cible' }, dansBibliotheque: true,
            configuration: { type: 'cibles', ensembleCiblesId: ensemble.id, echelleId: 'ECH_OBS2', niveauSansDonnee: '0' } }]);
        window.db.setSync(T + '_inscriptionsCibles', inscriptions);
        if (nTampons > 0) {
            // Des tampons à soi, chacun avec une image dessinée ici (un disque et un chiffre).
            const image = (i) => {
                const c = document.createElement('canvas'); c.width = 64; c.height = 64;
                const x = c.getContext('2d'); x.fillStyle = '#000'; x.beginPath(); x.arc(32, 32, 28, 0, 7); x.fill();
                x.fillStyle = '#fff'; x.font = 'bold 30px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(i + 1), 32, 34);
                return c.toDataURL('image/png');
            };
            const tampons = Array.from({ length: nTampons }, (_, i) => ({ id: 'custom-obs2-' + (i + 1), nom: 'Tampon fictif ' + (i + 1), categorie: CAT }));
            const pers = {};
            tampons.forEach((t, i) => { pers[t.id] = { nom: t.nom, imageBase64: image(i) }; if (i < avecCritere && criteres[i]) pers[t.id].critere = criteres[i].texte; });
            window.db.setSync('categoriesPerso', [{ id: CAT, nom: 'Catégorie fictive' }]);
            window.db.setSync('nomsCategoriesTampons', Object.assign({}, window.db.getSync('nomsCategoriesTampons', null) || {}, { [CAT]: 'Catégorie fictive' }));
            window.db.setSync('tamponsPersonnalises', tampons);
            window.db.setSync('personnalisationObservations', pers);
            if (observation) window.db.setSync('categoriesObservation', [CAT]);
            window.travauxOutils.rechargerTamponsPersonnalises();
        }
        window.trimestreActif = T;
        window.db.setSync('trimestreActif', T);
        window.db.setSync('infoCours', { id: coursId, codeCours: 'FRA101', groupe: '01', _groupeCoursId: GC });
        window.db.setSync('groupeCoursActif', { id: GC, trimestreId: T });
        window.afficherSection('evaluations');
        window.afficherSousSection('evaluations-liste');
        window.TableauNotation.afficher();
    }, { T, GC, ENSEMBLE, CIBLE, CAT, eleves: eleves(nEleves), criteres: criteres(nCriteres), nTampons, avecCritere, observation, inscriptions });
    await page.locator('.tc-tableau').waitFor();
}

/** « Observer », la cible aux critères, tout le groupe : l'écran est sur le ou la première étudiant·e. */
export async function ouvrirObserver(page, cible = CIBLE) {
    await page.locator('[data-tc="observer"]').click();
    await page.locator(`.oc-tuile[data-cible="${cible}"]`).click();
    await page.locator('[data-oc="commencer"]').click();
    await page.locator('#oc-nom').waitFor();
    await attendre(page, 150);   // les images des tampons
}

export const stock = (page) => page.evaluate((T) => window.db.getSync(T + '_inscriptionsCibles', []), T);

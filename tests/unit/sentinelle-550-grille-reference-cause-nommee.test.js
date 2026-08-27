import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #550 — SANS GRILLE DE RÉFÉRENCE, LE DÉPISTAGE NOMME LA CAUSE AU
// LIEU DE RENDRE UN VERDICT RASSURANT.
//
// LE SYMPTÔME, VÉCU PAR GRÉGOIRE LE 27 AOÛT 2026 AU MATIN, sur ses données
// réelles : sa carte « Observation de la structure des résultats
// d'apprentissage » affichait « Aucune force ni défi identifié selon la
// taxonomie SOLO », et « Progression par critère » était vide. Cause :
// AUCUNE GRILLE DE RÉFÉRENCE n'était désignée — `obtenirCriteresAvecValeurs`
// rendait donc un tableau vide.
//
// ⮕ LE DÉFAUT N'EST PAS LE VIDE, C'EST LA PHRASE. « Aucune force ni défi
// identifié » se lit comme un verdict rassurant SUR L'ÉLÈVE ; ça voulait dire
// « je n'ai aucun critère à quoi comparer ». Et la liste vide ne disait rien du
// tout — une liste vide se lit comme « rien à signaler ».
//
// ⮕ C'est exactement le patron A2/A3 de #542, refermé par le lot 1 pour les
// conversions d'échelle et par le lot 3 pour les échelles absentes : NOMMER LA
// CAUSE, parce qu'une cause nommée se répare et qu'un silence ne se répare pas.

const racine = path.resolve(process.cwd(), '..');

function lireCodeSansCommentaires(chemin) {
    const brut = fs.readFileSync(path.join(racine, chemin), 'utf8');
    const sansBlocs = brut.replace(/\/\*[\s\S]*?\*\//g, '');
    return sansBlocs
        .split('\n')
        .filter((ligne) => !/^\s*\/\//.test(ligne))
        .join('\n');
}

function charger(preference, grilles) {
    return chargerScript('js/profil-etudiant-helpers.js', {
        db: {
            get: async () => null,
            getSync: (k, d) => (String(k).indexOf('grillesTemplates') !== -1 ? grilles : (d !== undefined ? d : null)),
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirPreference: (nom) => (nom === 'grilleReferenceDepistage' ? preference : null),
        definirPreference: () => {},
        obtenirDonneesSelonMode: () => [],
        obtenirEtudiantsCoursActif: () => [],
        afficherNotificationCopiee: () => {}, afficherSection: () => {}, afficherSousSection: () => {},
        calculerTousLesIndices: () => ({ A: 0, C: 0, P: 0, M: 0, E: 0 }),
        obtenirSeuil: () => 0.70, chargerSeuilsInterpretation: () => ({}),
        estEtudiantExclu: () => false, filtrerEtudiantsParMode: (a) => a,
        estModeeLectureSeule: () => false, genererSeancesCompletes: () => {},
        calculerEtSauvegarderIndicesAssiduite: () => {}, calculerEtStockerIndicesCP: () => {}
    });
}

const GRILLE_OK = { id: 'GR1', nom: 'Analyse littéraire', criteres: [{ id: 'c1', nom: 'Structure' }] };
const GRILLE_VIDE = { id: 'GR2', nom: 'Grille en chantier', criteres: [] };

describe('#550 · le dépistage sans grille NOMME sa cause', () => {

    it('1. aucune grille désignée — la cause est nommée, pas le vide', () => {
        const win = charger('', [GRILLE_OK]);
        const r = win.diagnostiquerGrilleReferenceDepistage();

        expect(r.grille).toBeNull();
        expect(r.raison).toBe('aucune-grille-designee');
        // ⮕ L'ASSERTION QUI PORTE LE SENS : le message doit dire ce qui manque
        // ET où le régler. Un message qui nomme la cause sans donner le chemin
        // laisse chercher — c'est un demi-silence.
        expect(r.message).toMatch(/grille/i);
        expect(r.message, 'le chemin de réglage doit être dans le message')
            .toContain('Outils d\'observation');
    });

    it('2. grille supprimée — cause DIFFÉRENTE, et elle le dit', () => {
        // La préférence désigne une grille qui n'existe plus.
        const win = charger('GR_DISPARUE', [GRILLE_OK]);
        const r = win.diagnostiquerGrilleReferenceDepistage();

        expect(r.grille).toBeNull();
        expect(r.raison).toBe('grille-introuvable');
        expect(r.message, 'la suppression doit être dite, pas confondue avec « jamais choisie »')
            .toMatch(/supprim/i);
    });

    it('3. grille désignée mais VIDE — troisième cause, et le geste n\'est pas le même', () => {
        // ⮕ Celle-ci mérite son propre cas : l'écran est tout aussi muet, mais
        // il faut REMPLIR la grille, pas en désigner une autre. Les confondre
        // enverrait l'utilisateur au mauvais endroit.
        const win = charger('GR2', [GRILLE_VIDE]);
        const r = win.diagnostiquerGrilleReferenceDepistage();

        expect(r.raison).toBe('grille-sans-criteres');
        expect(r.message, 'le nom de la grille concernée doit apparaître')
            .toContain('Grille en chantier');
    });

    it('4. NON-RÉGRESSION — le contrat d\'obtenirGrilleReferenceDepistage est inchangé', () => {
        // ⮕ LE TEST QUI PROTÈGE LES TREIZE AUTRES SITES. `diagnostiquer…` est
        // neuve, mais `obtenirGrilleReferenceDepistage` est appelée depuis treize
        // endroits qui attendent « la grille, ou null ». Une grille SANS CRITÈRES
        // était rendue telle quelle avant #550 — un appelant qui lit son `nom` le
        // perdrait si le correctif d'affichage la faisait passer à `null`.
        const avecCriteres = charger('GR1', [GRILLE_OK]);
        expect(avecCriteres.obtenirGrilleReferenceDepistage()).toEqual(GRILLE_OK);

        const sansCriteres = charger('GR2', [GRILLE_VIDE]);
        expect(sansCriteres.obtenirGrilleReferenceDepistage(),
            'une grille vide doit rester rendue — treize appelants comptent dessus')
            .toEqual(GRILLE_VIDE);

        const aucune = charger('', [GRILLE_OK]);
        expect(aucune.obtenirGrilleReferenceDepistage()).toBeNull();
    });

    it('5. la phrase rassurante n\'est plus écrite dans le code', () => {
        // Les commentaires sont retirés : le correctif CITE la phrase fautive
        // comme trace, et un grep naïf rougirait sur sa propre documentation.
        const code = lireCodeSansCommentaires('js/profil-etudiant-sections-affichage.js');
        expect(code, 'le verdict rassurant est revenu')
            .not.toContain('Aucune force ni défi identifié');
        // Et les deux blocs qui souffraient du silence lisent bien le diagnostic.
        expect(code, 'la carte ne lit plus la cause')
            .toMatch(/lectureGrille\.message/);
        expect(code, 'le diagnostic n\'est plus appelé')
            .toMatch(/diagnostiquerGrilleReferenceDepistage\(\)/);
    });
});

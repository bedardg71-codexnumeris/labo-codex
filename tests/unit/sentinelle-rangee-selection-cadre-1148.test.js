import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { tranche, position } from './_helpers/tranche.js';

const lire = (f) => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf-8');

// #1148 (24 oct. 2026) — LE CADRE : LA RANGÉE DE SÉLECTION EN TÊTE DES SIX ACCORDÉONS DU TRIMESTRE.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-bibliotheques-menu-cadre.md (lot 2 sur 4).
//
// Remplace la sentinelle du 16 sept. 2026 (`sentinelle-position-bouton-nouvelle-entite`), qui verrouillait la
// place de « + Nouveau… » DANS la colonne de gauche : la colonne est partie. Ce qui reste à verrouiller est la
// rangée du lot 1 (#1147) : « Consulter la bibliothèque » (là où l'accordéon en a une), le menu, puis
// « + Nouveau… » poussé à droite ; dessous, ce que la fiche ne dit pas ; puis la fiche, sur toute la largeur.
//
// Les menus gardent leur identifiant et leur gestionnaire (consigne, § 2.1 et § 4.2) : aucun n'emploie
// `MenuSelection`, parce que chacun a des lecteurs ailleurs (la valeur du profil lue par cc-license.js et
// export-pdf.js, l'option vide réécrite par l'orchestre, le trimestre qui recharge l'app).
// Le libellé reste visible là où choisir fait autre chose qu'ouvrir une fiche : activer (Trimestre), filtrer
// (Groupe) ; ailleurs, il passe au lecteur d'écran (§ 2.2).
//
// Les tranches vont d'un accordéon au suivant : si un marqueur manque, `tranche()` jette en le nommant au
// lieu de rendre une tranche vide qui laisserait les `not.toContain` vrais par construction (#858).

const ACCORDEONS = [
    { nom: 'Trimestre', id: 'accordeon-gestion-trimestres', suivant: 'accordeon-cours', menu: 'selectTrimestreActif',
      biblio: 'ouvrirBibliothequeTrimestreV2', action: 'ouvrirCreationTrimestreV2', libelle: 'visible', resume: 'id="v2-apercuTrimestreSidebar"' },
    { nom: 'Cours', id: 'accordeon-cours', suivant: 'accordeon-enseignant', menu: 'v2-selectCours',
      biblio: 'ouvrirModalBibliothequeCours', action: 'nouveauCoursV2', libelle: 'lecteur' },
    { nom: 'Enseignant·e', id: 'accordeon-enseignant', suivant: 'accordeon-groupe-etudiants', menu: 'v2-selectEnseignant',
      biblio: null, action: 'nouveauProfilEnseignantV2', libelle: 'lecteur' },
    { nom: 'Étudiant·es', id: 'accordeon-groupe-etudiants', suivant: 'accordeon-horaire', menu: 'v2-selectGroupe',
      biblio: null, action: 'creerNouveauGroupeV2', libelle: 'visible', resume: 'class="carte-resume-etudiants rangee-selection-resume"' },
    { nom: 'Horaire', id: 'accordeon-horaire', suivant: 'accordeon-groupe-cours', menu: 'v2-selectHoraire',
      biblio: null, action: 'nouveauHoraireV2', libelle: 'lecteur' },
    { nom: 'Groupe-cours', id: 'accordeon-groupe-cours', suivant: 'accordeon-reserve', menu: 'v2-selectGroupeCours',
      biblio: 'ouvrirModalBibliothequeGroupeCours', action: 'nouveauGroupeCoursV2', libelle: 'lecteur', resume: 'id="v2-carteResumeGroupeCours"' }
];

const html = lire('index.html');
const css = lire('styles.css');
const section = (a) => tranche(html, `id="${a.id}"`, `id="${a.suivant}"`, { longueurMin: 400 });

describe('#1148 · A — la rangée en tête de chacun des six accordéons', () => {
    for (const a of ACCORDEONS) {
        it(`${a.nom} : une rangée, dans l'ordre ${a.biblio ? '« Consulter la bibliothèque », ' : ''}le menu, « + Nouveau… » à droite ; puis la fiche`, () => {
            const s = section(a);
            expect((s.match(/class="rangee-selection"/g) || []).length, 'une seule rangée').toBe(1);
            const rangee = tranche(s, 'class="rangee-selection"', 'class="panneau-formulaire', { longueurMin: 100 });
            const iMenu = position(rangee, `<select id="${a.menu}" class="controle-form rangee-selection-menu"`);
            const iNouveau = position(rangee, `rangee-selection-nouveau" data-action="${a.action}"`);
            expect(iNouveau, '« + Nouveau… » après le menu').toBeGreaterThan(iMenu);
            if (a.biblio) {
                const iBiblio = position(rangee, `data-action="${a.biblio}"`);
                expect(iBiblio, '« Consulter la bibliothèque » avant le menu').toBeLessThan(iMenu);
                expect(rangee.slice(iBiblio, iBiblio + 160)).toContain('>Consulter la biblioth&egrave;que</button>');
            }
            // Ce que la fiche ne dit pas passe SOUS la rangée, avant la fiche ; rien d'autre ne s'y glisse.
            if (a.resume) expect(rangee.indexOf(a.resume), 'le résumé, sous la rangée').toBeGreaterThan(iNouveau);
        });
    }

    it('la colonne de gauche est partie : ni sa disposition, ni son panneau, ni sa marque, au HTML comme au CSS', () => {
        for (const c of ['disposition-bibliotheque-formulaire', 'panneau-bibliotheque', 'btn-nouvelle-entite']) {
            expect(html, c).not.toContain(c);
        }
        // `planif-btn-bibliotheque` (la Carte d'alignement) n'est pas visé : seule la classe nue est partie.
        expect(html).not.toMatch(/class="[^"]*(?<![\w-])btn-bibliotheque(?![\w-])/);
        for (const c of ['.disposition-bibliotheque-formulaire', '.panneau-bibliotheque', '.btn-nouvelle-entite', '.btn-bibliotheque {']) {
            expect(css, c).not.toContain(c);
        }
    });
});

describe('#1148 · B — le libellé dit ce que fait le menu', () => {
    for (const a of ACCORDEONS) {
        it(`${a.nom} : libellé ${a.libelle === 'visible' ? 'visible (le menu active ou filtre)' : 'au lecteur d\'écran (le menu ouvre une fiche)'}`, () => {
            const s = section(a);
            const classe = a.libelle === 'visible' ? 'rangee-selection-libelle' : 'u-lecteur-ecran';
            expect(s).toMatch(new RegExp(`<label class="${classe}" for="${a.menu}"`));
        });
    }
});

describe('#1148 · C — les cartes que la fiche montrait déjà sont parties, avec leur code', () => {
    const js = ['js/trimestre-v2-cours.js', 'js/trimestre-v2-enseignants.js', 'js/trimestre-v2-horaires.js'].map(lire).join('\n');
    it('l\'aperçu du cours, la carte du profil et la carte de l\'horaire n\'existent plus, ni leur écrivain', () => {
        for (const id of ['v2-apercuCoursSidebar', 'enseignant-carte-resume', 'enseignant-resume-nom', 'v2-carteResumeHoraire']) {
            expect(html, id).not.toContain(id);
            expect(js, id).not.toContain(id);
        }
        for (const f of ['afficherSyntheseCours', 'afficherSyntheseEnseignant', 'mettreAJourCarteEnseignant',
            'mettreAJourCarteResumeHoraireV2', 'afficherSyntheseHoraire', 'afficherSyntheseGroupeCours']) {
            expect(js, f).not.toMatch(new RegExp(`\\b${f}\\b`));
        }
    });
    it('TÉMOIN : les écrivains des résumés qui restent sont toujours là', () => {
        expect(lire('js/trimestre-v2-groupes-cours.js')).toContain('function mettreAJourCarteResumeGroupeCoursV2(');
        expect(lire('js/trimestre-v2.js')).toContain("getElementById('v2-nombreSemainesSidebar')");
    });
});

describe('#1148 · D — les actions sur la liste des élèves, en tête de la liste, à droite', () => {
    it('Exporter, Supprimer un groupe…, Vider la liste : dans la liste, avant le tableau, mêmes gestes', () => {
        const liste = tranche(html, 'class="panneau-formulaire panneau-liste-etudiants"', 'id="v2-listeEtudiants"', { longueurMin: 200 });
        expect(liste).toContain('<div class="section-actions-liste u-hide" id="v2-actionsEtudiants">');
        for (const action of ['exporterEtudiantsV2', 'supprimerGroupeSelectionneV2', 'viderListeEtudiantsV2']) {
            expect(liste, action).toContain(`data-action="${action}"`);
        }
        expect(css).toMatch(/\.section-actions-liste\s*\{[^}]*justify-content:\s*flex-end/);
    });
});

describe('#1148 · E — l\'apparence de la rangée tient dans le Cadre', () => {
    it('le menu garde la place de son chevron : `#calendrier-trimestre select` (6 px 10 px) ne l\'emporte pas', () => {
        const regle = tranche(css, '#calendrier-trimestre .rangee-selection select.rangee-selection-menu {', '}', { longueurMin: 20 });
        expect(regle).toMatch(/padding:\s*0 32px 0 12px/);
        // À spécificité plus haute (1,2,1 contre 1,0,1), la règle gagne où qu'elle soit dans la feuille.
        expect(css).toContain('#calendrier-trimestre select,');
    });
    it('le sous-titre de la bibliothèque des groupes-cours tutoie et dit « menu »', () => {
        const gc = lire('js/trimestre-v2-groupes-cours.js');
        // #1159 (lot 6) : la phrase validée par Grégoire (25 oct., 19 h 06) remplace celle du #1148.
        expect(gc).toContain("phrase: 'Les groupes-cours que le menu de l\\'en-tête te propose.'");
        expect(gc).not.toMatch(/Gérez|dropdown de l/);
    });
});

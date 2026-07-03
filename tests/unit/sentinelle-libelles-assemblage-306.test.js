import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle — #306 Lot 1 (3 juillet 2026, vague 3) : uniformisation des
// libellés « Créer / Enregistrer » sur la page d'assemblage du groupe-cours
// (décision Grégoire du 29 mai 2026, plan
// `plans de travail/PLAN-UNIFORMISATION-ASSEMBLAGE-GROUPE-COURS.md`).
//
// Verrouille :
//   1. (comportemental) la bascule RÉELLE du libellé Enseignant·e —
//      trimestre-v2-enseignants.js chargé dans un sandbox avec un document
//      capturant le span #v2-btnTexteEnseignant : « Créer » au nouveau
//      profil / à la désélection, « Enregistrer » quand un profil est chargé.
//      C'était la section au bouton FIGÉ (« Enregistrer » statique, sans span).
//   2. (statique) les libellés de création des 3 autres sections à entité
//      unique : Cours « Créer » (était « Enregistrer » même en création),
//      Horaire « Créer » (était « Ajouter »), Groupe-cours « Créer » (déjà
//      conforme) — édition = « Enregistrer » partout.
//   3. (zéro-dette) les fonctions mortes de l'orchestre
//      (afficherFormEnseignantV2 / modifierEnseignantSelectionneV2, qui
//      manipulaient des ids absents du HTML actif) sont RETIRÉES.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Faux document ciblé : sert le span du bouton + le select + les champs du
// formulaire enseignant ; renvoie null ailleurs (les fonctions sont tolérantes).
function creerFauxDom() {
    const noeud = () => ({ value: '', textContent: '', focus() {}, classList: { add() {}, remove() {}, contains: () => false } });
    const elements = {
        'v2-btnTexteEnseignant': noeud(),
        'v2-selectEnseignant': noeud(),
        'v2-titreFormEnseignant': noeud(),
    };
    ['prenom', 'nom', 'courriel', 'institution', 'departement', 'discipline', 'siteWeb']
        .forEach(c => { elements['v2-ens-' + c] = noeud(); });
    return {
        elements,
        document: {
            getElementById: (id) => elements[id] || null,
            addEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
        },
    };
}

describe('sentinelle · libellés Créer/Enregistrer de l\'assemblage (#306 Lot 1)', () => {
    let dom, fenetre, dbStub;

    beforeEach(() => {
        dom = creerFauxDom();
        dbStub = {
            _donnees: { enseignants: [{ id: 'ENS1', prenom: 'Ada', nom: 'Lovelace', courriel: 'ada@exemple.qc.ca' }] },
            getSync(cle, defaut) { return this._donnees[cle] !== undefined ? this._donnees[cle] : defaut; },
            setSync(cle, valeur) { this._donnees[cle] = valeur; },
        };
        fenetre = chargerScript('js/trimestre-v2-enseignants.js', { document: dom.document, db: dbStub });
    });

    it('nouveau profil → le bouton affiche « Créer »', () => {
        dom.elements['v2-btnTexteEnseignant'].textContent = 'Enregistrer'; // état sale volontaire
        fenetre.nouveauProfilEnseignantV2();
        expect(dom.elements['v2-btnTexteEnseignant'].textContent).toBe('Créer');
        expect(dom.elements['v2-titreFormEnseignant'].textContent).toBe('Nouveau profil');
    });

    it('profil existant sélectionné → le bouton affiche « Enregistrer »', () => {
        dom.elements['v2-selectEnseignant'].value = 'ENS1';
        fenetre.chargerEnseignantSelectionneV2();
        expect(dom.elements['v2-btnTexteEnseignant'].textContent).toBe('Enregistrer');
        expect(dom.elements['v2-ens-prenom'].value).toBe('Ada');
    });

    it('désélection (ou id introuvable) → retour en mode création, bouton « Créer »', () => {
        // Cas 1 : aucune sélection
        dom.elements['v2-selectEnseignant'].value = '';
        dom.elements['v2-btnTexteEnseignant'].textContent = 'Enregistrer';
        fenetre.chargerEnseignantSelectionneV2();
        expect(dom.elements['v2-btnTexteEnseignant'].textContent).toBe('Créer');
        // Cas 2 : id qui ne correspond à aucun profil
        dom.elements['v2-selectEnseignant'].value = 'FANTOME';
        dom.elements['v2-btnTexteEnseignant'].textContent = 'Enregistrer';
        fenetre.chargerEnseignantSelectionneV2();
        expect(dom.elements['v2-btnTexteEnseignant'].textContent).toBe('Créer');
    });

    it('le HTML porte le span dynamique (plus de bouton figé)', () => {
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html).toContain('<span id="v2-btnTexteEnseignant">Créer</span>');
    });

    it('statique — création = « Créer » dans Cours, Horaire et Groupe-cours ; édition = « Enregistrer »', () => {
        const cours = readFileSync(path.join(racine, 'js', 'trimestre-v2-cours.js'), 'utf8');
        const horaires = readFileSync(path.join(racine, 'js', 'trimestre-v2-horaires.js'), 'utf8');
        const gc = readFileSync(path.join(racine, 'js', 'trimestre-v2-groupes-cours.js'), 'utf8');

        // Cours : « Nouveau cours » doit être suivi du libellé « Créer » (était « Enregistrer »)
        expect(cours).toMatch(/titre\.textContent = 'Nouveau cours';[\s\S]{0,200}btnTexte\.textContent = 'Créer';/);
        expect(cours).toMatch(/titre\.textContent = 'Modifier le cours';[\s\S]{0,120}btnTexte\.textContent = 'Enregistrer';/);
        // Horaire (ENTITÉ) : « Nouvel horaire » → « Créer » (était « Ajouter »).
        // NB : le sous-formulaire de SÉANCE (v2-btnConfirmerSeance) garde « Ajouter »
        // à dessein — c'est un ajout à une collection, comme le Groupe d'étudiants
        // (décision du 29 mai : modèle « ajout immédiat » conservé).
        expect(horaires).toMatch(/titre\.textContent = 'Nouvel horaire';[\s\S]{0,200}btnTexte\.textContent = 'Créer';/);
        expect(horaires).not.toMatch(/titre\.textContent = 'Nouvel horaire';[\s\S]{0,200}btnTexte\.textContent = 'Ajouter';/);
        // Groupe-cours : conformité conservée
        expect(gc).toMatch(/titre\.textContent = 'Nouveau groupe-cours';[\s\S]{0,120}btnTexte\.textContent = 'Créer';/);
    });

    it('zéro-dette — les fonctions mortes de l\'orchestre sont retirées', () => {
        const orchestre = readFileSync(path.join(racine, 'js', 'trimestre-v2-orchestre.js'), 'utf8');
        expect(orchestre).not.toContain('afficherFormEnseignantV2');
        expect(orchestre).not.toContain('modifierEnseignantSelectionneV2');
        expect(orchestre).not.toContain('enseignantEnEditionUI');
    });
});

/* ===============================
   MODULE: TRIMESTRE (REFONTE - INDEX 70)
   
   ⚠️ CHANGEMENT MAJEUR ⚠️
   Ce module devient la SOURCE UNIQUE DE VÉRITÉ pour le calendrier.
   
   PRINCIPE:
   - Collecte les données de l'utilisateur (dates, congés, etc.)
   - TRAITE ces données pour générer un calendrier COMPLET jour par jour
   - STOCKE le calendrier complet dans localStorage
   - Les autres modules LISENT ce calendrier, sans jamais recalculer
   
   CONTENU:
   1. Interface utilisateur (formulaires) - INCHANGÉE
   2. Collecte et sauvegarde des données brutes - INCHANGÉE  
   3. NOUVEAU: Génération du calendrier complet (calendrierComplet)
   4. Affichage des statistiques - AMÉLIORÉ (basé sur calendrierComplet)
   =============================== */

/* ===============================
   DÉPENDANCES
   =============================== */
// Modules requis (chargés AVANT):
// - 01-config.js : Variables globales

/* ===============================
   STRUCTURE DES DONNÉES
   =============================== */

/**
 * calendrierComplet (localStorage) - LA SOURCE UNIQUE
 * Structure: Object avec une clé par date
 * 
 * Exemple:
 * {
 *   "2025-08-21": { 
 *     statut: "cours", 
 *     numeroSemaine: 1, 
 *     numeroJour: 1,
 *     jourSemaine: "Jeudi"
 *   },
 *   "2025-08-22": { 
 *     statut: "cours", 
 *     numeroSemaine: 1, 
 *     numeroJour: 2,
 *     jourSemaine: "Vendredi"
 *   },
 *   "2025-08-23": { 
 *     statut: "weekend",
 *     jourSemaine: "Samedi"
 *   },
 *   "2025-09-01": { 
 *     statut: "conge", 
 *     motif: "Fête du travail",
 *     jourSemaine: "Lundi"
 *   },
 *   "2025-09-04": { 
 *     statut: "reprise", 
 *     numeroSemaine: 3, 
 *     numeroJour: 12,
 *     jourSemaine: "Jeudi"
 *   },
 *   "2025-10-13": { 
 *     statut: "semaine-planification",
 *     jourSemaine: "Lundi"
 *   },
 *   "2025-12-15": { 
 *     statut: "semaine-examens",
 *     jourSemaine: "Lundi"
 *   }
 * }
 * 
 * STATUTS POSSIBLES:
 * - "cours" : jour de cours normal
 * - "reprise" : jour de reprise d'un congé
 * - "conge" : congé (avec motif)
 * - "weekend" : samedi ou dimanche
 * - "semaine-planification" : semaine de planification
 * - "semaine-examens" : semaine d'examens
 */

/* ===============================
   🚀 INITIALISATION DU MODULE
   =============================== */

function initialiserModuleTrimestre() {
    console.log('📅 Initialisation du module Trimestre (refonte)');

    const elementDebut = document.getElementById('debutTrimestre');
    if (!elementDebut) {
        console.log('   ⚠️  Section trimestre non active, initialisation reportée');
        return;
    }

    // Charger les données existantes
    chargerCadreCalendrier();
    chargerEvenementsPrevus();
    chargerEvenementsImprevus();

    // Générer le calendrier complet
    genererCalendrierComplet();

    // Afficher les statistiques
    afficherStatistiquesTrimestre();

    console.log('   ✅ Module Trimestre initialisé avec calendrier complet');
}

/* ===============================
   📅 GESTION DU CADRE CALENDRIER
   =============================== */

function chargerCadreCalendrier() {
    const cadre = JSON.parse(localStorage.getItem('cadreCalendrier') || 'null');
    if (!cadre) return;

    // Remplir les champs du formulaire
    const champs = {
        'debutTrimestre': 'dateDebut',
        'finCours': 'finCours',
        'finTrimestre': 'finTrimestre',
        'remiseNotes': 'remiseNotes',
        'semainePlanificationDebut': 'semainePlanificationDebut',
        'semainePlanificationFin': 'semainePlanificationFin',
        'semaineExamensDebut': 'semaineExamensDebut',
        'semaineExamensFin': 'semaineExamensFin'
    };

    for (const [idElement, cleCadre] of Object.entries(champs)) {
        const element = document.getElementById(idElement);
        if (element && cadre[cleCadre]) {
            element.value = cadre[cleCadre];
        }
    }
}

function sauvegarderCadreCalendrier() {
    const cadre = {
        dateDebut: document.getElementById('debutTrimestre')?.value || '',
        finCours: document.getElementById('finCours')?.value || '',
        finTrimestre: document.getElementById('finTrimestre')?.value || '',
        remiseNotes: document.getElementById('remiseNotes')?.value || '',
        semainePlanificationDebut: document.getElementById('semainePlanificationDebut')?.value || '',
        semainePlanificationFin: document.getElementById('semainePlanificationFin')?.value || '',
        semaineExamensDebut: document.getElementById('semaineExamensDebut')?.value || '',
        semaineExamensFin: document.getElementById('semaineExamensFin')?.value || ''
    };

    // VALIDATION : vérifier que les dates essentielles sont présentes
    if (!cadre.dateDebut || !cadre.finCours || !cadre.finTrimestre) {
        alert('Veuillez renseigner au minimum : début du trimestre, fin des cours et fin du trimestre');
        return;
    }

    localStorage.setItem('cadreCalendrier', JSON.stringify(cadre));

    // CRITIQUE: Régénérer le calendrier complet après modification
    genererCalendrierComplet();
    afficherStatistiquesTrimestre();

    afficherNotification('Bornes du trimestre sauvegardées');
}

/* ===============================
   GESTION DES ÉVÉNEMENTS PRÉVUS
   =============================== */

function chargerEvenementsPrevus() {
    const evenements = JSON.parse(localStorage.getItem('evenementsPrevus') || '[]');
    const conteneur = document.getElementById('congesPrevusContainer');

    if (!conteneur) return;

    if (evenements.length === 0) {
        conteneur.innerHTML = '<p style="color: var(--bleu-moyen); font-style: italic;">Aucun événement prévu déclaré.</p>';
        return;
    }

    let html = '';
    evenements.forEach((evt, index) => {
        const verrouille = evt.verrouille ? 'checked' : '';
        const disabled = evt.verrouille ? 'disabled' : '';
        const bgColor = 'var(--bleu-tres-pale)';
        const borderColor = 'var(--bleu-leger)';

        html += `
<div class="item-carte">
    <div class="item-carte-header">
        <strong class="item-carte-titre">📅 ${evt.description}</strong>
        <div class="item-carte-actions">
            <button onclick="modifierEvenement('${evt.id}', 'prevus')" 
                    class="btn btn-modifier" ${disabled}>Modifier</button>
            <button onclick="supprimerEvenement('${evt.id}', 'prevus')" 
                    class="btn btn-supprimer" ${disabled}>Supprimer</button>
            <label class="item-carte-checkbox">
                <input type="checkbox" ${verrouille} 
                       onchange="basculerVerrouillageEvenement('${evt.id}', 'prevus')">
                <span>Verrouiller</span>
            </label>
        </div>
    </div>
    <div class="item-carte-grille ${evt.dateReprise ? 'item-carte-grille-custom' : ''}">
        <div class="item-carte-champ">
            <label class="item-carte-label">Date de l'événement</label>
            <div class="item-carte-valeur">${evt.dateEvenement}</div>
        </div>
        ${evt.dateReprise ? `
        <div class="item-carte-champ">
            <label class="item-carte-label">Horaire remplacé</label>
            <div class="item-carte-valeur ${!evt.horaireReprise ? 'manquant' : ''}">
                ${evt.horaireReprise || 'Non spécifié'}
            </div>
        </div>
        <div class="item-carte-champ">
            <label class="item-carte-label">Date de reprise</label>
            <div class="item-carte-valeur important">${evt.dateReprise}</div>
        </div>
        ` : ''}
    </div>
</div>
`;
    });

    conteneur.innerHTML = html;
}

function confirmerAjoutEvenement() {
    const dateEvenement = document.getElementById('dateEvenementPrevu')?.value;
    const description = document.getElementById('descriptionEvenementPrevu')?.value;
    const horaireReprise = document.getElementById('horaireReprisePrevu')?.value;
    const dateReprise = document.getElementById('dateReprisePrevu')?.value;

    const form = document.getElementById('formEvenementPrevu');
    const editId = form.getAttribute('data-edit-id');

    if (!dateEvenement || !description) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    if (dateReprise && !horaireReprise) {
        alert('Veuillez indiquer quel jour de cours est remplacé (ex: Horaire du lundi)');
        return;
    }

    const evenements = JSON.parse(localStorage.getItem('evenementsPrevus') || '[]');

    if (editId) {
        // MODE ÉDITION : Remplacer l'événement existant
        const index = evenements.findIndex(e => e.id === editId);
        if (index !== -1) {
            evenements[index] = {
                id: editId,
                dateEvenement,
                description,
                horaireReprise: horaireReprise || '',
                dateReprise: dateReprise || '',
                verrouille: evenements[index].verrouille || false
            };
        }
        form.removeAttribute('data-edit-id');
    } else {
        // MODE AJOUT : Créer un nouvel événement
        evenements.push({
            id: Date.now().toString(),
            dateEvenement,
            description,
            horaireReprise: horaireReprise || '',
            dateReprise: dateReprise || '',
            verrouille: false
        });
    }

    localStorage.setItem('evenementsPrevus', JSON.stringify(evenements));

    // Régénérer tout
    genererCalendrierComplet();
    if (typeof genererSeancesCompletes === 'function') {
        genererSeancesCompletes();
    }

    chargerEvenementsPrevus();
    afficherStatistiquesTrimestre();
    annulerFormEvenement();
    afficherNotification(editId ? 'Événement modifié' : 'Événement ajouté');
}

function supprimerEvenement(id, type) {
    if (!confirm('Supprimer cet événement ?')) return;

    const cle = type === 'prevus' ? 'evenementsPrevus' : 'evenementsImprevus';
    let evenements = JSON.parse(localStorage.getItem(cle) || '[]');
    evenements = evenements.filter(e => e.id !== id);
    localStorage.setItem(cle, JSON.stringify(evenements));

    // CRITIQUE: Régénérer le calendrier complet
    genererCalendrierComplet();

    if (type === 'prevus') {
        chargerEvenementsPrevus();
    } else {
        chargerEvenementsImprevus();
    }
    afficherStatistiquesTrimestre();
    afficherNotification('Événement supprimé');
}

function basculerVerrouillageEvenement(id, type) {
    const cle = type === 'prevus' ? 'evenementsPrevus' : 'evenementsImprevus';
    const evenements = JSON.parse(localStorage.getItem(cle) || '[]');
    const evt = evenements.find(e => e.id === id);

    if (evt) {
        evt.verrouille = !evt.verrouille;
        localStorage.setItem(cle, JSON.stringify(evenements));

        if (type === 'prevus') {
            chargerEvenementsPrevus();
        } else {
            chargerEvenementsImprevus();
        }
    }
}

/* ===============================
   GESTION DES ÉVÉNEMENTS IMPRÉVUS
   =============================== */

function chargerEvenementsImprevus() {
    const evenements = JSON.parse(localStorage.getItem('evenementsImprevus') || '[]');
    const conteneur = document.getElementById('congesImprevusContainer');

    if (!conteneur) return;

    if (evenements.length === 0) {
        conteneur.innerHTML = '<p style="color: var(--bleu-moyen); font-style: italic;">Aucun événement imprévu déclaré.</p>';
        return;
    }

    let html = '';
    evenements.forEach((evt, index) => {
        const verrouille = evt.verrouille ? 'checked' : '';
        const disabled = evt.verrouille ? 'disabled' : '';
        const bgColor = 'var(--bleu-tres-pale)';
        const borderColor = 'var(--bleu-leger)';

        html += `
        <div class="item-carte">
            <div class="item-carte-header">
                <strong class="item-carte-titre">📅 ${evt.description}</strong>
                <div class="item-carte-actions">
                    <button onclick="modifierEvenement('${evt.id}', 'imprevus')" 
                            class="btn btn-modifier" ${disabled}>Modifier</button>
                    <button onclick="supprimerEvenement('${evt.id}', 'imprevus')" 
                            class="btn btn-supprimer" ${disabled}>Supprimer</button>
                    <label class="item-carte-checkbox">
                        <input type="checkbox" ${verrouille} 
                               onchange="basculerVerrouillageEvenement('${evt.id}', 'imprevus')">
                        <span>Verrouiller</span>
                    </label>
                </div>
            </div>
            <div class="item-carte-grille ${evt.dateReprise ? 'item-carte-grille-custom' : ''}">
                <div class="item-carte-champ">
                    <label class="item-carte-label">Date de l'événement</label>
                    <div class="item-carte-valeur">${evt.dateEvenement}</div>
                </div>
                ${evt.dateReprise ? `
                <div class="item-carte-champ">
                    <label class="item-carte-label">Horaire remplacé</label>
                    <div class="item-carte-valeur ${!evt.horaireReprise ? 'manquant' : ''}">
                        ${evt.horaireReprise || 'Non spécifié'}
                    </div>
                </div>
                <div class="item-carte-champ">
                    <label class="item-carte-label">Date de reprise</label>
                    <div class="item-carte-valeur important">${evt.dateReprise}</div>
                </div>
                ` : ''}
            </div>
        </div>
        `;
    });

    conteneur.innerHTML = html;
}

function confirmerAjoutEvenementImprevu() {
    const dateEvenement = document.getElementById('dateEvenementImprevu')?.value;
    const description = document.getElementById('descriptionEvenementImprevu')?.value;
    const dateReprise = document.getElementById('dateRepriseImprevu')?.value;

    if (!dateEvenement || !description) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    const evenements = JSON.parse(localStorage.getItem('evenementsImprevus') || '[]');

    evenements.push({
        id: Date.now().toString(),
        dateEvenement,
        description,
        dateReprise: dateReprise || null,
        verrouille: false
    });

    localStorage.setItem('evenementsImprevus', JSON.stringify(evenements));

    // CRITIQUE: Régénérer le calendrier complet
    genererCalendrierComplet();

    chargerEvenementsImprevus();
    afficherStatistiquesTrimestre();
    annulerFormEvenementImprevu();
    afficherNotification('Événement imprévu ajouté');
}

/* ===============================
   🏭 GÉNÉRATION DU CALENDRIER COMPLET
   ⚠️ COEUR DU MODULE - SOURCE UNIQUE ⚠️
   =============================== */

/**
 * Génère le calendrier complet jour par jour
 * C'est LA fonction centrale qui crée la source unique de vérité
 * 
 * APPELÉE:
 * - À l'initialisation
 * - Après chaque modification des réglages
 * - Après ajout/suppression de congés
 */
function genererCalendrierComplet() {
    console.log('🏭 Génération du calendrier complet (source unique)...');

    const cadre = JSON.parse(localStorage.getItem('cadreCalendrier') || '{}');
    const evenementsPrevus = JSON.parse(localStorage.getItem('evenementsPrevus') || '[]');
    const evenementsImprevus = JSON.parse(localStorage.getItem('evenementsImprevus') || '[]');

    // Valeurs par défaut si rien n'est configuré
    const dateDebut = cadre.dateDebut || cadre.debutTrimestre || '2025-08-21';
    const finCours = cadre.finCours || '2025-12-12';
    const finTrimestre = cadre.finTrimestre || '2025-12-22';

    // VALIDATION : vérifier que les dates sont valides
    if (!dateDebut || !finCours || !finTrimestre) {
        console.warn('⚠️ Dates du trimestre manquantes, calendrier non généré');
        return {};
    }

    // Fusionner tous les événements
    const tousEvenements = [...evenementsPrevus, ...evenementsImprevus];

    // Créer un dictionnaire date -> événement
    const mapConges = {};
    const mapReprises = {};

    tousEvenements.forEach(evt => {
        mapConges[evt.dateEvenement] = evt;
        if (evt.dateReprise) {
            mapReprises[evt.dateReprise] = evt;
        }
    });

    // Générer le calendrier complet
    const calendrier = {};
    let dateActuelle = creerDateLocale(dateDebut);
    const dateFin = creerDateLocale(finTrimestre);

    let compteurJoursCours = 0;
    let numeroSemaine = 0;
    let joursDeCoursMemeSemaine = 0;
    let compteurBoucle = 0; // Pour éviter boucle infinie

    while (dateActuelle <= dateFin && compteurBoucle < 200) {
        compteurBoucle++;
        const dateStr = formaterDateTrimestreYMD(dateActuelle);
        const jourSemaine = obtenirNomJour(dateActuelle);

        // Déterminer le statut du jour
        let infosJour = { jourSemaine };

        // 1. Weekend
        if (estWeekend(dateActuelle)) {
            infosJour.statut = 'weekend';
        }
        // 2. Semaine de planification
        else if (estDansPlage(dateStr, cadre.semainePlanificationDebut, cadre.semainePlanificationFin)) {
            infosJour.statut = 'semaine-planification';
        }
        // 3. Semaine d'examens
        else if (estDansPlage(dateStr, cadre.semaineExamensDebut, cadre.semaineExamensFin)) {
            infosJour.statut = 'semaine-examens';
        }
        // 4. Congé
        else if (mapConges[dateStr]) {
            infosJour.statut = 'conge';
            infosJour.motif = mapConges[dateStr].description;
        }
        // 5. Reprise
        else if (mapReprises[dateStr]) {
            infosJour.statut = 'reprise';
            compteurJoursCours++;
            joursDeCoursMemeSemaine++;

            // Nouvelle semaine tous les 5 jours de cours
            if (joursDeCoursMemeSemaine === 1) {
                numeroSemaine++;
            }

            infosJour.numeroJour = compteurJoursCours;
            infosJour.numeroSemaine = numeroSemaine;

            // Ajouter l'info du jour remplacé (ex: "Horaire du lundi")
            const evenementRepris = mapReprises[dateStr];
            if (evenementRepris && evenementRepris.horaireReprise) {
                // Extraire le jour depuis "Horaire du lundi" → "Lundi"
                const jourRemplace = evenementRepris.horaireReprise.replace('Horaire du ', '');
                const jourCapitalise = jourRemplace.charAt(0).toUpperCase() + jourRemplace.slice(1);
                infosJour.jourRemplace = jourCapitalise;
            }

            // Réinitialiser après 5 jours de cours
            if (joursDeCoursMemeSemaine >= 5) {
                joursDeCoursMemeSemaine = 0;
            }
        }
        // 6. Jour de cours normal (avant fin des cours seulement)
        else if (dateStr <= finCours) {
            infosJour.statut = 'cours';
            compteurJoursCours++;
            joursDeCoursMemeSemaine++;

            // Nouvelle semaine tous les 5 jours de cours
            if (joursDeCoursMemeSemaine === 1) {
                numeroSemaine++;
            }

            infosJour.numeroJour = compteurJoursCours;
            infosJour.numeroSemaine = numeroSemaine;

            // Réinitialiser après 5 jours de cours
            if (joursDeCoursMemeSemaine >= 5) {
                joursDeCoursMemeSemaine = 0;
            }
        }
        // 7. Après fin des cours (avant fin trimestre)
        else {
            infosJour.statut = 'hors-cours';
        }

        calendrier[dateStr] = infosJour;
        dateActuelle.setDate(dateActuelle.getDate() + 1);
    }

    // STOCKER dans localStorage - LA SOURCE UNIQUE
    localStorage.setItem('calendrierComplet', JSON.stringify(calendrier));

    console.log(`✅ Calendrier complet généré: ${Object.keys(calendrier).length} jours`);
    console.log(`   - ${compteurJoursCours} jours de cours`);
    console.log(`   - ${numeroSemaine} semaines`);

    return calendrier;
}

/* ===============================
   STATISTIQUES DU TRIMESTRE
   =============================== */

function afficherStatistiquesTrimestre() {
    const calendrier = JSON.parse(localStorage.getItem('calendrierComplet') || '{}');

    if (Object.keys(calendrier).length === 0) {
        console.warn('⚠️ Calendrier complet non généré');
        return;
    }

    // Calculer les statistiques à partir du calendrier complet
    let nbSemaines = 0;
    let nbJoursCours = 0;
    let nbConges = 0;

    const semainesVues = new Set();

    for (const [date, infos] of Object.entries(calendrier)) {
        if (infos.statut === 'cours' || infos.statut === 'reprise') {
            nbJoursCours++;
            if (infos.numeroSemaine) {
                semainesVues.add(infos.numeroSemaine);
            }
        }
        if (infos.statut === 'conge') {
            nbConges++;
        }
    }

    nbSemaines = semainesVues.size;

    // Afficher dans les cartes
    const elemSemaines = document.getElementById('nombreSemaines');
    const elemJours = document.getElementById('nombreJoursCours');
    const elemConges = document.getElementById('totalConges');

    if (elemSemaines) elemSemaines.textContent = nbSemaines;
    if (elemJours) elemJours.textContent = nbJoursCours;
    if (elemConges) elemConges.textContent = nbConges;

    console.log(`Statistiques: ${nbSemaines} sem. | ${nbJoursCours} jours | ${nbConges} congés`);
}

/* ===============================
   FONCTIONS UTILITAIRES
   =============================== */

function creerDateLocale(dateStr) {
    const [annee, mois, jour] = dateStr.split('-').map(Number);
    return new Date(annee, mois - 1, jour);
}

function formaterDateTrimestreYMD(date) {
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    return `${annee}-${mois}-${jour}`;
}

function estWeekend(date) {
    const jour = date.getDay();
    return jour === 0 || jour === 6;
}

function obtenirNomJour(date) {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[date.getDay()];
}

function estDansPlage(date, debut, fin) {
    if (!debut || !fin) return false;
    return date >= debut && date <= fin;
}

function afficherNotification(message, details = '') {
    console.log('📢', message);

    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = 'notification-succes';
    notification.innerHTML = `
        <div>${message}</div>
        ${details ? `<div class="notification-details">${details}</div>` : ''}
    `;

    // Ajouter au body
    document.body.appendChild(notification);

    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* ===============================
   FONCTIONS UI (formulaires)
   =============================== */

function afficherFormEvenement() {
    const form = document.getElementById('formEvenementPrevu');
    if (form) form.style.display = 'block';
}

function annulerFormEvenement() {
    const form = document.getElementById('formEvenementPrevu');
    if (form) {
        form.style.display = 'none';
        document.getElementById('dateEvenementPrevu').value = '';
        document.getElementById('descriptionEvenementPrevu').value = '';
        document.getElementById('dateReprisePrevu').value = '';
    }
}

function afficherFormEvenementImprevu() {
    const form = document.getElementById('formEvenementImprevu');
    if (form) form.style.display = 'block';
}

function annulerFormEvenementImprevu() {
    const form = document.getElementById('formEvenementImprevu');
    if (form) {
        form.style.display = 'none';
        document.getElementById('dateEvenementImprevu').value = '';
        document.getElementById('descriptionEvenementImprevu').value = '';
        document.getElementById('dateRepriseImprevu').value = '';
    }
}

function modifierEvenement(id, type) {
    const cle = type === 'prevus' ? 'evenementsPrevus' : 'evenementsImprevus';
    const evenements = JSON.parse(localStorage.getItem(cle) || '[]');
    const evt = evenements.find(e => e.id === id);

    if (!evt) {
        alert('Événement introuvable');
        return;
    }

    // Afficher le formulaire approprié avec les données
    if (type === 'prevus') {
        // Pré-remplir le formulaire
        document.getElementById('dateEvenementPrevu').value = evt.dateEvenement;
        document.getElementById('descriptionEvenementPrevu').value = evt.description;
        document.getElementById('horaireReprisePrevu').value = evt.horaireReprise || '';
        document.getElementById('dateReprisePrevu').value = evt.dateReprise || '';

        // Stocker l'ID en mode édition
        const form = document.getElementById('formEvenementPrevu');
        form.setAttribute('data-edit-id', id);

        // Afficher le formulaire
        afficherFormEvenement();
    } else {
        // Pré-remplir le formulaire
        document.getElementById('dateEvenementImprevu').value = evt.dateEvenement;
        document.getElementById('descriptionEvenementImprevu').value = evt.description;
        document.getElementById('horaireRepriseImprevu').value = evt.horaireReprise || '';
        document.getElementById('dateRepriseImprevu').value = evt.dateReprise || '';

        // Stocker l'ID en mode édition
        const form = document.getElementById('formEvenementImprevu');
        form.setAttribute('data-edit-id', id);

        // Afficher le formulaire
        afficherFormEvenementImprevu();
    }
}

/* ===============================
   📌 EXPORTS / API PUBLIQUE
   =============================== */

/**
 * Fonction d'accès au calendrier complet
 * TOUTES LES AUTRES MODULES doivent utiliser cette fonction
 * 
 * @returns {Object} Le calendrier complet (dictionnaire date -> infos)
 */
function obtenirCalendrierComplet() {
    return JSON.parse(localStorage.getItem('calendrierComplet') || '{}');
}

/**
 * Obtient les infos d'une date spécifique
 * 
 * @param {string} date - Date au format YYYY-MM-DD
 * @returns {Object|null} Infos du jour ou null
 */
function obtenirInfosJour(date) {
    const calendrier = obtenirCalendrierComplet();
    return calendrier[date] || null;
}
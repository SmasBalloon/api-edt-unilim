import { Injectable } from '@nestjs/common';
import PDFParser from 'pdf2json';

const pdfParser = new PDFParser();

@Injectable()
export class EdtService {
  GetEdt(annee: number, desk: string) {
    const dataColor: Array<{
      x: number;
      y: number;
      xmax: number;
      ymax: number;
      w: number;
      oc: string;
    }> = [];
    const dataCour: Array<{
      x: number;
      y: number;
      text: string;
      ressource: string | null;
      prof: string | null;
      salle: string | null;
      color: string;
      heureDebut: string | null;
      heureFin: string | null;
      matchJour: { x: number; y: number; jour: string };
      matchGroupe: { x: number; y: number; group: string };
    }> = [];
    const dataHoraires: Array<{ x: number; y: number; heure: string }> = [];
    const dataJour: Array<{ x: number; y: number; jour: string }> = [];
    const dataGroupe: Array<{ x: number; y: number; group: string }> = [];

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const firstPage = pdfData?.Pages?.[0];
      if (!firstPage) {
        console.error('Aucune page trouvée dans le PDF.');
        return;
      }
      const tableCouleur = [
        '#b3ffff', // TP
        '#9fff9f', // SAE
        '#ffbab3', // TD
        '#ffff0c', // Amphi
        '#f23ea7', // Controle
      ];

      const Fills = firstPage?.Fills || [];
      const Texts = firstPage?.Texts || [];

      // --- Récupération des zones colorées ---
      for (const { x, y, h, w, oc } of Fills) {
        if (tableCouleur.includes(oc)) {
          dataColor.push({ x, y, xmax: x + w, ymax: y + h, w, oc });
        }
      }

      for (const { x, y, R } of Texts) {
        let text = R?.[0]?.T;
        if (!text) continue;

        // Décoder le texte (pdf2json encode les caractères spéciaux en URI)
        text = decodeURIComponent(text);

        if (/^\s?\d{1,2}:\d{2}$/.test(text)) {
          // filtre les heures
          const heure = text.trim();
          dataHoraires.push({ x, y, heure });
        } else if (
          /^(LUNDI|MARDI|MERCREDI|JEUDI|VENDREDI|SAMEDI)$/i.test(text)
        ) {
          // filtre les jours
          dataJour.push({ x, y, jour: text });
        } else if (/^G[0-9]$/.test(text)) {
          // filtre les groupes
          dataGroupe.push({ x, y, group: text });
        }
      }

      // --- Association des textes à leurs couleurs ET horaires ---
      for (const { x, y, R } of Texts) {
        let text = R?.[0]?.T;
        if (!text) continue;

        // Décoder le texte (pdf2json encode les caractères spéciaux en URI)
        text = decodeURIComponent(text);

        // Filtre uniquement les blocs type "R1.01 - CE - 105"
        if (
          /^[RS]\d+\.\d+ - ([A-Za-z0-9]+|\.) - ([A-Za-z0-9]+|\.)$/.test(text)
        ) {
          const matchJour = dataJour.reduce((prev, curr) =>
            Math.abs(curr.y - y) < Math.abs(prev.y - y) ? curr : prev,
          );

          const matchGroupe = dataGroupe.reduce((prev, curr) =>
            Math.abs(curr.y - y) < Math.abs(prev.y - y) ? curr : prev,
          );

          // On cherche la couleur la plus proche en x (tolérance de 0.25)
          const tolerance = 0.25;
          const matchedColors = dataColor.filter(
            (c) =>
              Math.abs(c.x - x) <= tolerance && // tolérance horizontale
              y >= c.y - 0.5 && // marge verticale
              y <= c.ymax + 0.5,
          );

          // --- Recherche de l'heure de début correspondante ---
          // L'heure a le même x que le bloc coloré (color.x)
          let heureDebut: string | null = null;
          if (matchedColors.length > 0) {
            matchedColors.sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y));
            const color = matchedColors[0];
            // Cherche l'horaire avec x = color.x et y = 3.9779999999999998 (ligne des horaires)
            const matchedHoraire = dataHoraires.find(
              (h) =>
                Math.abs(h.x - color.x) <= tolerance &&
                Math.abs(h.y - 3.978) <= 0.01,
            );
            // console.log(matchedHoraire);
            heureDebut = matchedHoraire ? matchedHoraire.heure : null;

            const nombreHeure = Math.trunc(color.w / 0.0610333333) / 60;

            // Calcul de l'heure de fin
            let heureFin: string | null = null;
            if (heureDebut) {
              const parts = heureDebut.split(':');
              const heures = Number(parts[0]);
              const minutes = Number(parts[1]);
              const totalMinutes = heures * 60 + minutes + nombreHeure * 60;
              const heureFinH = Math.floor(totalMinutes / 60);
              const heureFinM = Math.round(totalMinutes % 60);
              heureFin = `${heureFinH}:${heureFinM.toString().padStart(2, '0')}`;
            }

            // Ajouter "A" au groupe si la couleur est #b3ffff (TP)
            let finalGroupe = matchGroupe.group;
            if (color.oc === '#b3ffff') {
              if (y > matchGroupe.y) {
                finalGroupe = matchGroupe.group + 'A';
              } else {
                finalGroupe = matchGroupe.group + 'A';
              }
            }

            // Extraire ressource, prof et salle du texte "R1.11 - JL - 112"
            const parts = text.split(' - ');
            const ressource = parts[0] || null;
            const prof = parts[1] || null;
            const salle = parts[2] || null;

            dataCour.push({
              x,
              y,
              text,
              ressource,
              prof,
              salle,
              color: color.oc,
              heureDebut,
              heureFin,
              matchJour,
              matchGroupe: { ...matchGroupe, group: finalGroupe },
            });
          }
        } else {
          // Recherche de la couleur de fond même pour les textes non-cours
          const tolerance = 0.25;
          const matchedColors = dataColor.filter(
            (c) =>
              Math.abs(c.x - x) <= tolerance &&
              y >= c.y - 0.5 &&
              y <= c.ymax + 0.5,
          );

          let colorFound: string | null = null;
          let color: {
            x: number;
            y: number;
            xmax: number;
            ymax: number;
            w: number;
            oc: string;
          } | null = null;
          let heureDebut: string | null = null;
          let heureFin: string | null = null;

          if (matchedColors.length > 0) {
            matchedColors.sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y));
            color = matchedColors[0];
            colorFound = color.oc;

            // Cherche l'horaire avec x = color.x et y = 3.9779999999999998 (ligne des horaires)
            const matchedHoraire = dataHoraires.find(
              (h) =>
                Math.abs(h.x - color.x) <= tolerance &&
                Math.abs(h.y - 3.978) <= 0.01,
            );
            heureDebut = matchedHoraire ? matchedHoraire.heure : null;

            const nombreHeure = Math.trunc(color.w / 0.0610333333) / 60;

            // Calcul de l'heure de fin
            if (heureDebut) {
              const parts = heureDebut.split(':');
              const heures = Number(parts[0]);
              const minutes = Number(parts[1]);
              const totalMinutes = heures * 60 + minutes + nombreHeure * 60;
              const heureFinH = Math.floor(totalMinutes / 60);
              const heureFinM = Math.round(totalMinutes % 60);
              heureFin = `${heureFinH}:${heureFinM.toString().padStart(2, '0')}`;
            }
          }

          if (colorFound === '#ffff0c' && color) {
            // Utiliser le jour le plus proche de la zone colorée, pas du texte
            const matchJour = dataJour.reduce((prev, curr) =>
              Math.abs(curr.y - color.y) < Math.abs(prev.y - color.y) ? curr : prev,
            );

            const matchGroupe = {
              x: color.x,
              y: color.y,
              group: 'All',
            };
            // Identifier le type de texte
            let ressource: string | null = null;
            let prof: string | null = null;
            let salle: string | null = null;

            // Regex pour ressource : R1.04, R1.04 -, R1.04 R1.04 -, S1.01, etc.
            if (/^[RS]\d+\.\d+(\s+[RS]\d+\.\d+)?\s*-?\s*$/.test(text.trim())) {
              ressource = text.replace(/\s*-?\s*$/, '').trim();
            }
            // Regex pour salle : AmpC, AC, R47, R46, AmpA, AmpB, etc.
            else if (/^(Amp[A-Z]|AC|R\d+|[A-Z]\d+)$/.test(text.trim())) {
              salle = text.trim();
            }
            // Regex pour prof : contient un point ou une virgule (ex: Monédière T., AC)
            else if (/[A-Z][a-z]+\s+[A-Z]\.?|^[A-Z]{2,}$/.test(text.trim())) {
              prof = text.trim();
            }
            // Sinon, c'est probablement une matière (on l'ignore pour l'instant)

            // Chercher si un cours existe déjà avec les mêmes horaires, jour et zone colorée proche
            const existingCours = dataCour.find(
              (cours) =>
                cours.heureDebut === heureDebut &&
                cours.heureFin === heureFin &&
                cours.matchJour.jour === matchJour.jour &&
                cours.color === colorFound &&
                Math.abs(cours.matchGroupe.x - color.x) <= tolerance &&
                y >= color.y - 0.5 &&
                y <= color.ymax + 0.5,
            );

            if (existingCours) {
              // Mettre à jour les valeurs null avec les nouvelles valeurs
              if (ressource && !existingCours.ressource) {
                existingCours.ressource = ressource;
              }
              if (prof && !existingCours.prof) {
                existingCours.prof = prof;
              }
              if (salle && !existingCours.salle) {
                existingCours.salle = salle;
              }
              // Ajouter le texte au texte existant s'il contient des infos utiles
              if (!existingCours.text.includes(text)) {
                existingCours.text += ' ' + text;
              }
            } else {
              // Créer une nouvelle entrée si aucun cours correspondant n'existe
              dataCour.push({
                x,
                y,
                text,
                ressource,
                prof,
                salle,
                color: colorFound,
                heureDebut,
                heureFin,
                matchJour,
                matchGroupe: matchGroupe,
              });
            }
          }
        }
      }

      for (const {
        x,
        y,
        ressource,
        prof,
        salle,
        color,
        heureDebut,
        heureFin,
        matchJour,
        matchGroupe,
      } of dataCour) {
        console.log('─────────────────────────────────────────');
        console.log('📚 Ressource:', ressource);
        console.log('👨‍🏫 Prof:', prof);
        console.log('🚪 Salle:', salle);
        console.log('🎨 Couleur:', color);
        console.log('🕐 Horaires:', heureDebut, '→', heureFin);
        console.log('📅 Jour:', matchJour.jour);
        console.log('👥 Groupe:', matchGroupe.group);
        console.log('📍 Position: x=', x.toFixed(2), 'y=', y.toFixed(2));
      }
    });

    void pdfParser.loadPDF(desk);
  }

  BonneUrl(): string {
    return '/edt/{année}/{groupe}';
  }
}

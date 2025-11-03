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
    const dataText: Array<{
      x: number;
      y: number;
      text: string;
      color: string | null;
      heureDebut: string | null;
      heureFin: string | null;
    }> = [];
    const dataHoraires: Array<{ x: number; y: number; heure: string }> = [];
    const dataJour: Array<{ x: number; y: number; jour: string }> = [];
    const dataGroupe : Array<{ x: number; y:number; group: string }> = [];

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
        const text = R?.[0]?.T;
        if (!text) continue;
        if (/^\s?\d{1,2}:\d{2}$/.test(text)) {
          // filtre les heures
          const heure = text.trim();
          dataHoraires.push({ x, y, heure });
        } else if (/^(LUNDI|MARDI|MERCREDI|JEUDI|VENDREDI|SAMEDI)$/i.test(text)) {
          // filtre les jours
          dataJour.push({ x, y, jour: text });
        } else if (/^G[0-9]$/.test(text)) {
          // filtre les groupes
          dataGroupe.push({ x, y, group: text });
        }
      }
      // --- Association des textes à leurs couleurs ET horaires ---
      for (const { x, y, R } of Texts) {
        const text = R?.[0]?.T;
        if (!text) continue;

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

            console.log(
              text,
              ' : ',
              color.oc,
              ' | x=',
              color.x,
              ' y=',
              color.y,
              ' | Heure:',
              heureDebut,
              " | nombre d'heure:",
              nombreHeure,
              ' | Heure fin:',
              heureFin,
              ' | jour du cour:',
              matchJour.jour,
              ' | groupe:',
              matchGroupe.group,
            );

            dataText.push({
              x,
              y,
              text,
              color: color.oc,
              heureDebut,
              heureFin,
            });
          } else {
            console.log('Aucune couleur trouvée pour :', text);
            dataText.push({
              x,
              y,
              text,
              color: null,
              heureDebut: null,
              heureFin: null,
            });
          }
        } else {
          console.log('Aucune couleur trouvée pour :', text);
          continue;
        }
      }
    });

    void pdfParser.loadPDF(desk);
  }

  BonneUrl(): string {
    return '/edt/{année}/{groupe}';
  }
}

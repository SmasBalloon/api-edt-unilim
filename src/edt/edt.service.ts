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

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const firstPage = pdfData?.Pages?.[0];
      if (!firstPage) {
        console.error('Aucune page trouvée dans le PDF.');
        return;
      }

      const Fills = firstPage?.Fills || [];
      const Texts = firstPage?.Texts || [];

      const tableCouleur = [
        '#b3ffff', // TD
        '#9fff9f', // TP
        '#ffbab3', // CM
        '#ffff0c', // Amphi
        '#f23ea7', // Autre
      ];

      // --- Récupération des zones colorées ---
      for (const { x, y, h, w, oc } of Fills) {
        if (tableCouleur.includes(oc)) {
          dataColor.push({ x, y, xmax: x + w, ymax: y + h, w, oc });
        }
      }

      // --- Récupération des horaires (format HH:MM ou H:MM) ---
      for (const { x, y, R } of Texts) {
        const text = R?.[0]?.T;
        if (!text) continue;

        // Détecte les horaires : format "15:30", " 9:30", etc.
        if (/^\s?\d{1,2}:\d{2}$/.test(text)) {
          const heure = text.trim();
          dataHoraires.push({ x, y, heure });
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
        }
      }

      // Affichage final des résultats
      console.log('\n=== Résultats finaux ===');
      dataText.forEach((item) => {
        console.log(
          `${item.text} | Couleur: ${item.color} | Heure début: ${item.heureDebut} | Heure fin: ${item.heureFin}`,
        );
      });
    });

    void pdfParser.loadPDF(desk);
  }

  BonneUrl(): string {
    return '/edt/{année}/{groupe}';
  }
}

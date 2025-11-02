import { Injectable } from '@nestjs/common';
import PDFParser from 'pdf2json';
const pdfParser = new PDFParser();

@Injectable()
export class EdtService {
  GetEdt(annee: number, desk: string) {
    const dataColor = [];
    const dataText = [];

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
          dataColor.push({ x, y, w, h, oc });
        }
      }

      // --- Association des textes à leurs couleurs ---
      for (const { x, y, R } of Texts) {
        const text = R?.[0]?.T;
        if (!text) continue;

        // Filtre uniquement les blocs type "R1.01 - CE - 105"
        if (/^[RS]\d+\.\d+ - ([A-Za-z0-9]+|\.) - ([A-Za-z0-9]+|\.)$/.test(text)) {
          // On cherche la couleur la plus proche en x (tolérance de 0.26)
          const tolerance = 0.26;
          const matchedColors = dataColor.filter(
            (c) =>
              Math.abs(c.x - x) <= tolerance && // tolérance horizontale
              y >= c.y - 0.5 && // marge verticale
              y <= c.ymax + 0.5
          );

          if (matchedColors.length === 0) {
            console.log('Debug pour', text, '- x:', x, 'y:', y);
            console.log('Colors proches:', dataColor.filter(c => Math.abs(c.x - x) <= tolerance));
          }

          if (matchedColors.length > 0) {
            // Choisit la plus proche en Y si plusieurs sont valides
            matchedColors.sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y));
            const color = matchedColors[0];

            // Cherche l'heure de début dans les Texts
            const matchedHeureDebut = Texts.filter(
              (t) =>
                Math.abs(t.x - color.x) <= 0.26 && // même position x que color (avec tolérance)
                Math.abs(t.y - 3.9779999999999998) <= 0.1 // y fixe (avec petite tolérance)
            );
            matchedHeureDebut.sort((a, b) => a.x - b.x);
            const heureDebut = matchedHeureDebut[0]?.R?.[0]?.T;
            const heureFin = color.w * 1 / 0.06103333
            console.log(heureFin)
            // console.log(text, ' : ', color.oc, " et ", color.x , " ", color.y, " heure : ", heureDebut, " ", )
            dataText.push({ x, y, text, color: color.oc, heureDebut });
          } else {
            console.log('Aucune couleur trouvée pour :', text);
            dataText.push({ x, y, text, color: null });
            continue;
          }
        }
      }
      // fs.writeFileSync("./debug_page.json", JSON.stringify(firstPage, null, 2), "utf8");
    });

    pdfParser.loadPDF(desk);
  }

  BonneUrl(): string {
    return '/edt/{année}/{groupe}';
  }
}

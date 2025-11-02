import { Injectable } from '@nestjs/common';
import fs from "fs";
import { TextR } from "../../utils/interfaces.js"
import PDFParser from "pdf2json";
import { filter } from 'rxjs';
const pdfParser = new PDFParser();

@Injectable()
export class EdtService {
  async GetEdt(annee: number, desk: string) {
    let dataColor = [];
    let dataText = [];
    pdfParser.on("pdfParser_dataReady", pdfData => {
      const pages = pdfData?.Pages;
      const firstPage = pages[0];

      const width = firstPage?.Width;

      const height = firstPage?.Height;

      const Hlines = firstPage?.HLines;

      const VLines = firstPage?.VLines;

      const Fills = firstPage?.Fills;

      const tableCouleur = [
        "#b3ffff",
        "#9fff9f",
        "#ffbab3",
        "#ffff0c",
        "#f23ea7"
      ]

      for (let i = 0; i < Fills.length; i++) {
        const { x, y, oc } = Fills[i];
        if (oc in tableCouleur){
          dataColor.push({ x, y, oc });
        }
      }

      // console.log("nombre de couleur : ",dataColor.length);

      const Texts = firstPage?.Texts;
      for (let i = 0; i < Texts.length; i++) {
        const { x, y, R } = Texts[i];
        const text = R[0].T

        if (/^[RS]\d+\.\d+ - ([a-zA-Z0-9]+|\.) - ([a-zA-Z0-9]+|\.)$/.test(text)) {
          const color = dataColor.filter((data) => data.x <= x - 0.204 && data.x >= x - 0.200)
            /*
            couleur ~ 0.202 de dif +
            * */

          if (color != null) {
            dataText.push({ x, y, text });
            console.log(text, " : ", color)
          } else {
            console.log("je ne trouve pas pour : ", text);
          }
        } else {
          // console.log("ça passe pas ", text);
        }
      }
      dataText.sort((a, b) => a.x - b.x);
      dataText.sort((a, b) => a.y - b.y);
      // console.log("nombre de text : ", dataText.length);

      // fs.writeFileSync("./regarde.json", JSON.stringify(firstPage), "utf8");
    })

    pdfParser.loadPDF(desk);
  }

  BonneUrl(): string {
    return '/edt/{année}/{groupe}';
  }
}
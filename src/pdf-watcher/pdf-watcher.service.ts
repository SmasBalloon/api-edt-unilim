import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfWatcherService {
  async getPagesA1(): Promise<void> {
    const response = await fetch('https://edt-iut-info.unilim.fr/edt/A1/');
    const html = await response.text();

    // Extraire toutes les balises <a> avec une regex
    const linkRegex = /<a[^>]*>.*?<\/a>/gi;
    const links = html.match(linkRegex);

    if (links) {
      console.log('Balises <a> trouvées:', links);
    } else {
      console.log('Aucune balise <a> trouvée');
    }
  }

  async getPagesA2(): Promise<void> {
    const response = await fetch('https://edt-iut-info.unilim.fr/edt/A2/');
    const html = await response.text();

    // Extraire toutes les balises <a> avec une regex
    const linkRegex = /<a[^>]*>.*?<\/a>/gi;
    const links = html.match(linkRegex);

    if (links) {
      console.log('Balises <a> trouvées:', links);
    } else {
      console.log('Aucune balise <a> trouvée');
    }
  }

  async getPagesA3(): Promise<void> {
    const response = await fetch('https://edt-iut-info.unilim.fr/edt/A3/');
    const html = await response.text();

    // Extraire toutes les balises <a> avec une regex
    const linkRegex = /<a[^>]*>.*?<\/a>/gi;
    const links = html.match(linkRegex);

    if (links) {
      console.log('Balises <a> trouvées:', links);
    } else {
      console.log('Aucune balise <a> trouvée');
    }
  }
}

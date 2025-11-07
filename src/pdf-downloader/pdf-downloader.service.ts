import { Injectable } from '@nestjs/common';
import fs from 'fs';

@Injectable()
export class PdfDownloaderService {
  public async downloadPdf(url: string, dest: string): Promise<void> {
    const rep = await fetch(url, {
      method: 'GET',
    });

    if (!rep.ok) throw new Error(`${url} not ok`);

    const buffer = await rep.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));

    console.log(`${dest} downloaded pdf`);
  }

  public deletePdf(dest: string): void {
    fs.rmSync(dest);
  }
}

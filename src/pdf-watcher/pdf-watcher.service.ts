import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PdfDownloaderService } from '../pdf-downloader/pdf-downloader.service.js';
import fs from 'fs';

@Injectable()
export class PdfWatcherService {
  private previousHtmlA1: string;
  private previousHtmlA2: string;
  private previousHtmlA3: string;

  constructor(private readonly pdfDownloaderService: PdfDownloaderService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async getPagesA1(): Promise<string[]> {
    const url = 'https://edt-iut-info.unilim.fr/edt/A1/';
    const response = await fetch(url);
    const html = await response.text();

    const linkRegex = /<a[^>]*href="(A[^"]*)"[^>]*>.*?<\/a>/gi;
    const links: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }

    if (!this.previousHtmlA1) {
      this.previousHtmlA1 = html;
    } else {
      if (html != this.previousHtmlA1) {
        for (const href of links) {
          const dest = `./pdf/A1/${href}`;
          if (!fs.existsSync(dest)) {
            const pdfUrl = `https://edt-iut-info.unilim.fr/edt/A1/${href}`;
            await this.pdfDownloaderService.downloadPdf(pdfUrl, dest);
          }
        }
        this.previousHtmlA1 = html;
      }
    }

    return links;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async getPagesA2(): Promise<string[]> {
    const url = 'https://edt-iut-info.unilim.fr/edt/A2/';
    const response = await fetch(url);
    const html = await response.text();

    const linkRegex = /<a[^>]*href="(A[^"]*)"[^>]*>.*?<\/a>/gi;
    const links: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }

    if (!this.previousHtmlA2) {
      this.previousHtmlA2 = html;
    } else {
      if (html != this.previousHtmlA2) {
        for (const href of links) {
          const dest = `./pdf/A2/${href}`;
          if (!fs.existsSync(dest)) {
            const pdfUrl = `https://edt-iut-info.unilim.fr/edt/A2/${href}`;
            await this.pdfDownloaderService.downloadPdf(pdfUrl, dest);
          }
        }
        this.previousHtmlA2 = html;
      }
    }

    return links;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async getPagesA3(): Promise<string[]> {
    const url = 'https://edt-iut-info.unilim.fr/edt/A3/';
    const response = await fetch(url);
    const html = await response.text();

    const linkRegex = /<a[^>]*href="(A[^"]*)"[^>]*>.*?<\/a>/gi;
    const links: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }

    if (!this.previousHtmlA3) {
      this.previousHtmlA3 = html;
    } else {
      if (html != this.previousHtmlA3) {
        for (const href of links) {
          const dest = `./pdf/A3/${href}`;
          if (!fs.existsSync(dest)) {
            const pdfUrl = `https://edt-iut-info.unilim.fr/edt/A3/${href}`;
            await this.pdfDownloaderService.downloadPdf(pdfUrl, dest);
          }
        }
        this.previousHtmlA3 = html;
      }
    }
    return links;
  }
}

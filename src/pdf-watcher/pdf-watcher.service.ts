import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PdfWatcherService {
  private previousHtmlA1: string;
  private previousHtmlA2: string;
  private previousHtmlA3: string;

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
      console.log('first time');
      this.previousHtmlA1 = html;
    } else {
      if (html != this.previousHtmlA1) {
        console.log('Changed, new links:', links);
        for (const href of links) {
          await fetch(`http://localhost:3000/pdf-downloader/${href}`);
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
      console.log('first time');
      this.previousHtmlA2 = html;
    } else {
      if (html != this.previousHtmlA2) {
        console.log('Changed, new links:', links);
        for (const href of links) {
          await fetch(`http://localhost:3000/pdf-downloader/A2/${href}`);
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
      console.log('first time');
      this.previousHtmlA3 = html;
    } else {
      if (html != this.previousHtmlA3) {
        console.log('Changed, new links:', links);
        for (const href of links) {
          await fetch(`http://localhost:3000/pdf-downloader/A3/${href}`);
        }
        this.previousHtmlA3 = html;
      }
    }
    return links;
  }
}

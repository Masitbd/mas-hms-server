import handlebars from 'handlebars';
import { PDFOptions } from 'puppeteer';

export const PDFGeneratorV2 = async <T>({
  templateHtml,
  data,
  options,
}: {
  templateHtml: string;
  data: T;
  options: PDFOptions;
}) => {
  const htmlTemplate = handlebars.compile(templateHtml);
  const finalHtml = encodeURIComponent(htmlTemplate(data));
  return finalHtml;
};

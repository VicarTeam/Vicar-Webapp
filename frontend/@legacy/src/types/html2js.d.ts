declare module 'html2pdf.js' {
  declare interface Html2PdfBuilder {
    from(element: HTMLElement): Html2PdfBuilder;
    save(filename: string): void;
  }

  export default function (): Html2PdfBuilder;
}

export interface ICustomLexicon {
  prepend: ILexiconItem[];
  append: ILexiconItem[];
}

export interface ILexiconItem {
  type: "title"|"subtitle"|"paragraph"|"list";
}

export interface ILexiconTextItem extends ILexiconItem {
  type: "title"|"subtitle"|"paragraph";
  text: string;
}

export interface ILexiconList extends ILexiconItem {
  type: "list";
  items: string[];
}

export interface ISectionatedCustomLexicon {
  prepend: {
    sections: ILexiconSection[];
    toc: ICustomLexiconTOC[];
  };
  append: {
    sections: ILexiconSection[];
    toc: ICustomLexiconTOC[];
  };
}

export interface ILexiconSection {
  title: string;
  paragraph: string;
  items: ILexiconItem[];
  sections: ILexiconSubsection[];
}

export interface ILexiconSubsection {
  title: string;
  paragraph: string;
  items: ILexiconItem[];
}

export interface ICustomLexiconTOC {
  title: {
    paragraph: string;
    text: string;
  };
  subtitles: {
    paragraph: string;
    text: string;
  }[];
}
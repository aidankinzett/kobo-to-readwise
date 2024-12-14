import { useProcessDatabase } from "@/hooks/use-process-database";
import * as xmljs from "xml-js";

interface Annotation {
  target: {
    fragment: {
      _attributes: {
        progress: string;
      };
      text?: {
        _text: string;
      };
    };
  };
  content?: {
    text: {
      _text: string;
    };
  };
  "dc:date": {
    _text: string;
  };
}

interface AnnotationDocument {
  annotationSet: {
    publication: {
      "dc:title": { _text: string };
      "dc:creator": { _text: string };
    };
    annotation?: Annotation | Annotation[];
  };
}

export const useProcessAnnotations = () => {
  const { formatCsv, makeId, formatDate } = useProcessDatabase();

  const processAnnotationFile = async (
    file: File
  ): Promise<{
    bookId: string;
    entries: string[][];
  }> => {
    const text = await file.text();
    const document = xmljs.xml2js(text, {
      compact: true,
    }) as AnnotationDocument;
    const info = document.annotationSet.publication;

    const title = info["dc:title"]._text;
    const author = info["dc:creator"]._text;
    const entries: string[][] = [];

    let annotations = document.annotationSet.annotation || [];
    if (!Array.isArray(annotations)) {
      annotations = [annotations];
    }

    annotations.forEach((annotation: Annotation) => {
      const target = annotation.target.fragment;
      const content = annotation.content;
      const date = formatDate(annotation["dc:date"]._text);
      const location = Math.round(
        parseFloat(target._attributes.progress) * 1000000000
      );
      const text = target.text ? target.text._text : "";
      const comment = content ? content.text._text : "";

      if (text) {
        const row: string[] = [];
        row.push(formatCsv(text));
        row.push(formatCsv(title));
        row.push(formatCsv(author));
        row.push(formatCsv(comment));
        row.push(formatCsv(date));
        row.push(formatCsv(location.toString()));

        entries.push(row);
      }
    });

    return {
      bookId: makeId(title, author),
      entries,
    };
  };

  return { processAnnotationFile };
};

import sqlite3 from "better-sqlite3";
import * as fs from "fs";
import moment from "moment";
import * as os from "os";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as xmljs from "xml-js";

interface Bookmark {
  highlight: string;
  startContainerPath: string;
  date: string;
  note: string | null;
  title: string;
  author: string;
}

interface DbEntry {
  bookId: string;
  row: string;
}

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
    annotation?: Array<Annotation> | Annotation;
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// if necessary, change this to the path to your Kobo device. Do not use a trailing slash.
const koboPath = "/Volumes/KOBOeReader";

// First, grab highlights from the sqlite DB
const db = new sqlite3(path.join(koboPath, ".kobo", "KoboReader.sqlite"));

const bookmarks = db
  .prepare<unknown[], Bookmark>(
    `
    SELECT b.Text as highlight, b.startContainerPath, b.DateCreated as date, 
           b.Annotation as note, book.Title as title, book.Attribution as author 
    FROM Bookmark b 
    INNER JOIN content book ON book.ContentID = b.VolumeID
    WHERE highlight IS NOT NULL
    ORDER BY title, date
`,
  )
  .all();

function formatCsv(string: string | null): string {
  if (typeof string === "string") {
    return `"${string.replace(/"/g, '""')}"`;
  }
  return "";
}

function makeId(title: string, author: string): string {
  return `${title} ${author}`;
}

function formatDate(string: string): string {
  return moment(string).format("YYYY-MM-DD hh:MM:ss");
}

const dbEntries: DbEntry[] = [];

bookmarks.forEach((bookmark) => {
  const row: string[] = [];
  row.push(formatCsv(bookmark.highlight));
  row.push(formatCsv(bookmark.title));
  row.push(formatCsv(bookmark.author));
  row.push(formatCsv(bookmark.note));
  row.push(formatCsv(formatDate(bookmark.date)));
  row.push("");
  dbEntries.push({
    bookId: makeId(bookmark.title, bookmark.author),
    row: row.join(","),
  });
});

const getAllFiles = function (
  dirPath: string,
  arrayOfFiles: string[] = [],
): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
};

const annotationFiles = getAllFiles(
  path.join(koboPath, "Digital Editions"),
).filter((file) => path.extname(file) === ".annot");

const annotationFileBookIds: string[] = [];
const annotationFileEntries: string[][] = [];

annotationFiles.forEach((annotationFile) => {
  const xml = fs.readFileSync(path.resolve(annotationFile), "utf8");
  const document = xmljs.xml2js(xml, { compact: true }) as AnnotationDocument;
  const info = document.annotationSet.publication;

  const title = info["dc:title"]._text;
  const author = info["dc:creator"]._text;

  annotationFileBookIds.push(makeId(title, author));

  let annotations = document.annotationSet.annotation || [];
  if (!Array.isArray(annotations)) {
    annotations = [annotations];
  }

  annotations.forEach((annotation) => {
    const target = annotation.target.fragment;
    const content = annotation.content;
    const date = formatDate(annotation["dc:date"]._text);
    const location = Math.round(
      parseFloat(target._attributes.progress) * 1000000000,
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

      annotationFileEntries.push(row);
    }
  });
});

const filename = path.join(__dirname, "output.csv");
const output: string[] = [];

output.push(
  ["Highlight", "Title", "Author", "Note", "Date", "Location"].join(","),
);

dbEntries.forEach((entry) => {
  if (!annotationFileBookIds.includes(entry.bookId)) {
    output.push(entry.row);
  }
});

annotationFileEntries.forEach((entry) => {
  output.push(entry.join(","));
});

fs.writeFileSync(filename, output.join(os.EOL));

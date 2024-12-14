import moment from "moment";
import initSqlJs from "sql.js";

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

export const useProcessDatabase = () => {
  const formatCsv = (string: string | null): string => {
    if (typeof string === "string") {
      return `"${string.replace(/"/g, '""')}"`;
    }
    return "";
  };

  const makeId = (title: string, author: string): string => {
    return `${title} ${author}`;
  };

  const formatDate = (string: string): string => {
    return moment(string).format("YYYY-MM-DD HH:mm:ss");
  };

  const processDatabase = async (dbFile: File): Promise<DbEntry[]> => {
    try {
      const wasmBinary = await fetch("/sql.js/sql-wasm.wasm").then((response) =>
        response.arrayBuffer()
      );

      const SQL = await initSqlJs({
        wasmBinary,
        locateFile: () => "/sql.js/sql-wasm.wasm",
      });

      const buf = await dbFile.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(buf));

      const result = db.exec(`
        SELECT b.Text as highlight, b.startContainerPath, b.DateCreated as date, 
               b.Annotation as note, book.Title as title, book.Attribution as author 
        FROM Bookmark b 
        INNER JOIN content book ON book.ContentID = b.VolumeID
        WHERE highlight IS NOT NULL
        ORDER BY title, date
      `);

      db.close();

      if (!result.length) return [];

      const bookmarks: Bookmark[] = result[0].values.map((row) => ({
        highlight: row[0] as string,
        startContainerPath: row[1] as string,
        date: row[2] as string,
        note: row[3] as string | null,
        title: row[4] as string,
        author: row[5] as string,
      }));

      return bookmarks.map((bookmark) => {
        const row: string[] = [];
        row.push(formatCsv(bookmark.highlight));
        row.push(formatCsv(bookmark.title));
        row.push(formatCsv(bookmark.author));
        row.push(formatCsv(bookmark.note));
        row.push(formatCsv(formatDate(bookmark.date)));
        row.push("");

        return {
          bookId: makeId(bookmark.title, bookmark.author),
          row: row.join(","),
        };
      });
    } catch (err) {
      console.error("Error initializing SQL.js:", err);
      throw err;
    }
  };

  return { processDatabase, formatCsv, makeId, formatDate };
};

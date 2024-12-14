import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RequiredFilesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Files</CardTitle>
        <CardDescription>
          Files needed to extract your Kobo highlights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium">1. KoboReader.sqlite file</h3>
          <p className="text-gray-600">Located at:</p>
          <ul className="list-disc ml-5 text-sm text-gray-600">
            <li>
              <code>.kobo/KoboReader.sqlite</code> on your Kobo device
            </li>
            <li>
              macOS: <code>/Volumes/KOBOeReader/.kobo/KoboReader.sqlite</code>
            </li>
            <li>
              Windows: <code>E:\.kobo\KoboReader.sqlite</code> (where E: is your
              Kobo drive)
            </li>
          </ul>
          <div className="mt-3 bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-900">
              How to view hidden folders:
            </p>
            <ul className="list-disc ml-5 text-sm text-gray-600 mt-1">
              <li>
                <strong>macOS:</strong> Press <code>Command + Shift + .</code>{" "}
                (dot) in Finder
              </li>
              <li>
                <strong>Windows:</strong> In File Explorer, click View → Show →
                Hidden items
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-medium">2. Annotation Files (Optional)</h3>
          <p className="text-gray-600">Located at:</p>
          <ul className="list-disc ml-5 text-sm text-gray-600">
            <li>
              <code>Digital Editions/*.annot</code> on your Kobo device
            </li>
            <li>
              macOS: <code>/Volumes/KOBOeReader/Digital Editions/*.annot</code>
            </li>
            <li>
              Windows: <code>E:\Digital Editions\*.annot</code>
            </li>
          </ul>
          <p className="text-sm text-gray-600 mt-2">
            Note: .annot files are only present for books read through Adobe
            Digital Editions or similar DRM-protected content.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

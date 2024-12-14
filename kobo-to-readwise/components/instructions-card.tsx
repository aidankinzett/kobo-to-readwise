import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InstructionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
        <CardDescription>
          Follow these steps to extract your highlights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal ml-5 space-y-2 text-gray-600">
          <li>Connect your Kobo device to your computer</li>
          <li>Enable hidden folders using the instructions above if needed</li>
          <li>Locate and select the KoboReader.sqlite file</li>
          <li>
            Optionally, select any .annot files from the Digital Editions folder
          </li>
          <li>The highlights will be automatically exported to a CSV file</li>
        </ol>
      </CardContent>
    </Card>
  );
}

import DBChangeLogs from "./DBChanges";
import DBCView from "./DBView";
export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <DBCView />
      <DBChangeLogs />
    </main>
  );
}

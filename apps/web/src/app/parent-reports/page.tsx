import { prisma } from "@eduos/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";

export default async function ParentReportsPage() {
  const reports = await prisma.weeklyParentReport.findMany({
    include: {
      student: true,
      class: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Weekly Parent Reports</h1>
      <p className="text-gray-500 mb-6">Review AI-generated summaries and risk alerts before sending to parents via Zalo.</p>

      <div className="bg-white rounded shadow p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risks</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => {
              let risks: any[] = [];
              try { risks = JSON.parse(r.riskFlagsJson || "[]"); } catch(e) {}
              const riskTags = risks.map((rk) => `[${rk.severity}] ${rk.type}`).join(", ");

              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.student.name}</TableCell>
                  <TableCell>{r.class ? r.class.classCode : "N/A"}</TableCell>
                  <TableCell>{`${r.weekStart.toLocaleDateString()} - ${r.weekEnd.toLocaleDateString()}`}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell className="text-red-600">{riskTags || "None"}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View/Approve</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

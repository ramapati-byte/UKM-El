"use client";

import AppShell from "@/components/shell/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import { getPermissions } from "@/lib/permissions";
import Badge from "@/components/ui/Badge";

export default function RolesPage() {
  const roles = ["superadmin", "penyelenggara", "mahasiswa"];
  const permissions = [
    "event.view", "event.create", "event.edit", "event.delete",
    "ukm.view", "ukm.create", "ukm.edit", "ukm.verify",
    "letter.view", "letter.create", "letter.edit",
    "finance.view", "finance.create", "finance.approve",
    "inventory.view", "inventory.create", "inventory.edit",
    "loan.view", "loan.create", "loan.approve",
    "program.view", "program.create", "program.edit",
    "document.view", "document.create", "document.edit",
    "announcement.view", "announcement.create", "announcement.edit",
    "ranking.view", "role.view", "audit.view",
  ];

  const matrix = roles.map(role => ({
    role,
    permissions: permissions.map(p => ({
      key: p,
      allowed: getPermissions(role as any).includes(p as any),
    })),
  }));

  return (
    <AppShell title="Roles & Permission" subtitle="Matriks role dan izin akses">
      <PageHeader title="Manajemen Role & Permission" />
      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-700">
              <th className="p-3 text-left text-slate-600 dark:text-slate-300 font-medium">Role</th>
              {permissions.map(p => (
                <th key={p} className="p-3 text-center text-slate-600 dark:text-slate-300 font-medium text-xs">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(row => (
              <tr key={row.role} className="border-b border-slate-100 dark:border-slate-700">
                <td className="p-3 text-slate-900 dark:text-white font-medium">{row.role}</td>
                {row.permissions.map(perm => (
                  <td key={perm.key} className="p-3 text-center">
                    <Badge variant={perm.allowed ? "success" : "secondary"} className="text-xs">
                      {perm.allowed ? "Ya" : "Tidak"}
                    </Badge>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
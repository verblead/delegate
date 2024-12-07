import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Interface representing a member.
 */
export interface Member {
  /**
   * The username of the member.
   */
  username: string;
  /**
   * The email of the member.
   */
  email: string;
  /**
   * The phone number of the member.
   */
  phone: string;
  /**
   * The role of the member.
   */
  role: string;
  /**
   * The status of the member.
   */
  status: string;
  /**
   * The points of the member.
   */
  points: number;
  /**
   * The city of the member (optional).
   */
  city?: string;
  /**
   * The state of the member (optional).
   */
  state?: string;
  /**
   * The date the member was created.
   */
  created_at: string;
}

/**
 * Exports members to a PDF file.
 * 
 * @param members The members to export.
 */
export const exportToPDF = (members: Member[]) => {
  try {
    const doc = new jsPDF();
    const tableColumn = ["Username", "Email", "Phone", "Role", "Status", "Points", "Location", "Joined"];
    const tableRows = members.map(member => [
      member.username,
      member.email || 'Not provided',
      member.phone || 'Not provided',
      member.role,
      member.status,
      member.points.toString(),
      member.city && member.state ? `${member.city}, ${member.state}` : 'Not specified',
      new Date(member.created_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save('members.pdf');
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
};

/**
 * Exports members to a CSV file.
 * 
 * @param members The members to export.
 */
export const exportToCSV = (members: Member[]) => {
  try {
    const csvContent = members.map(member => {
      return [
        member.username,
        member.email || 'Not provided',
        member.phone || 'Not provided',
        member.role,
        member.status,
        member.points,
        member.city && member.state ? `${member.city}, ${member.state}` : 'Not specified',
        new Date(member.created_at).toLocaleDateString()
      ].join(',');
    });

    csvContent.unshift("Username,Email,Phone,Role,Status,Points,Location,Joined");
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'members.csv');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

/**
 * Exports members to an XLS file.
 * 
 * @param members The members to export.
 */
export const exportToXLS = (members: Member[]) => {
  try {
    const data = members.map(member => ({
      Username: member.username,
      Email: member.email || 'Not provided',
      Phone: member.phone || 'Not provided',
      Role: member.role,
      Status: member.status,
      Points: member.points,
      Location: member.city && member.state ? `${member.city}, ${member.state}` : 'Not specified',
      Joined: new Date(member.created_at).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, 'members.xlsx');
  } catch (error) {
    console.error('Error exporting to XLS:', error);
  }
};

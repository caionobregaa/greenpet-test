import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Orcamento } from "@/lib/types/orcamento";
import type { Cliente } from "@/lib/types/cliente";
import type { Animal } from "@/lib/types/animal";

function brl(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

const GREEN: [number, number, number] = [45, 122, 45];
const DARK:  [number, number, number] = [30,  30,  30];
const GRAY:  [number, number, number] = [100, 100, 100];
const LIGHT: [number, number, number] = [245, 248, 245];

export function gerarOrcamentoPDF(
  orcamento: Orcamento,
  cliente: Cliente,
  animal: Animal | null,
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // ── Cabeçalho verde ────────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("GreenPET", 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestão para Pet Shop", 14, 18);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`ORÇAMENTO Nº ${orcamento.id.slice(-6).toUpperCase()}`, W - 14, 12, { align: "right" });

  const statusLabel: Record<string, string> = {
    pendente: "Pendente",
    aprovado: "Aprovado",
    recusado: "Recusado",
  };
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Status: ${statusLabel[orcamento.status] ?? orcamento.status}`, W - 14, 19, { align: "right" });

  y = 36;

  // ── Datas ───────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Data de emissão: ${fmtDate(orcamento.data)}`, 14, y);
  doc.text(`Validade: ${fmtDate(orcamento.validade)}`, W - 14, y, { align: "right" });

  y += 8;
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, W - 14, y);
  y += 7;

  // ── Seção: Dados do Cliente ─────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GREEN);
  doc.text("DADOS DO CLIENTE", 14, y);
  y += 5;

  const clienteRows: [string, string][] = [
    ["Nome", cliente.nome],
    ["Telefone", cliente.telefone ?? "—"],
    ["E-mail", cliente.email ?? "—"],
    ["CPF", cliente.cpf ?? "—"],
    ["Endereço", [cliente.endereco, cliente.bairro].filter(Boolean).join(", ") || "—"],
    ["Cidade", cliente.cidade ?? "—"],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: clienteRows,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 } },
    columnStyles: {
      0: { fontStyle: "bold", textColor: DARK, cellWidth: 28 },
      1: { textColor: DARK },
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [230, 230, 230],
    tableLineWidth: 0.1,
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ── Seção: Dados do Animal ──────────────────────────────────────────
  if (animal) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...GREEN);
    doc.text("DADOS DO ANIMAL", 14, y);
    y += 5;

    const sexoLabel: Record<string, string> = { M: "Macho", F: "Fêmea", Indefinido: "Indefinido" };
    const animalRows: [string, string][] = [
      ["Nome", animal.nome],
      ["Espécie", animal.especie ?? "—"],
      ["Raça", animal.raca ?? "—"],
      ["Sexo", sexoLabel[animal.sexo] ?? animal.sexo ?? "—"],
      ["Peso", animal.peso != null ? `${animal.peso} kg` : "—"],
    ];

    autoTable(doc, {
      startY: y,
      head: [],
      body: animalRows,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 } },
      columnStyles: {
        0: { fontStyle: "bold", textColor: DARK, cellWidth: 28 },
        1: { textColor: DARK },
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [230, 230, 230],
      tableLineWidth: 0.1,
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // ── Seção: Itens do Orçamento ───────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GREEN);
  doc.text("ITENS DO ORÇAMENTO", 14, y);
  y += 5;

  const itemRows = orcamento.itens.map((item) => [
    item.nome,
    String(item.qtd),
    brl(item.valorUnitario),
    brl(item.total),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Produto / Serviço", "Qtd", "Valor Unit.", "Total"]],
    body: itemRows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 } },
    headStyles: {
      fillColor: GREEN,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "center", cellWidth: 16 },
      2: { halign: "right", cellWidth: 32 },
      3: { halign: "right", cellWidth: 32, fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // ── Linha de total ──────────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(14, y, W - 28, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", 18, y + 6);
  doc.text(brl(orcamento.total), W - 18, y + 6, { align: "right" });

  y += 18;

  // ── Observações ─────────────────────────────────────────────────────
  if (orcamento.obs) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GREEN);
    doc.text("OBSERVAÇÕES", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(orcamento.obs, W - 28) as string[];
    doc.text(lines, 14, y);
  }

  // ── Rodapé ──────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(220, 220, 220);
  doc.line(14, pageH - 16, W - 14, pageH - 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("GreenPET — Sistema de Gestão para Pet Shop", 14, pageH - 10);
  doc.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, W - 14, pageH - 10, { align: "right" });

  // ── Salvar ──────────────────────────────────────────────────────────
  doc.save(`orcamento-${orcamento.id.slice(-6).toUpperCase()}.pdf`);
}

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
const GRAY:  [number, number, number] = [110, 110, 110];
const LIGHT: [number, number, number] = [245, 249, 245];
const WHITE: [number, number, number] = [255, 255, 255];

const EMPRESA = {
  nome:     "GreenPet",
  razao:    "L C DO N AMORIM NETA",
  cnpj:     "65.788.498/0001-44",
  endereco: "Avenida Duque de Caxias, 1225",
  bairro:   "Praça 14 de Janeiro, Manaus-AM",
  cep:      "CEP 69020-141",
  email:    "greenpet.am@gmail.com",
  telefone: "+55 (92) 9458-5478",
  pix:      "65788498000144",
};

export function gerarOrcamentoPDF(
  orcamento: Orcamento,
  cliente: Cliente,
  animal: Animal | null,
  produtoImages?: Record<string, string>,
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 14; // margin
  let y = M;

  // ── 1. Cabeçalho: Empresa (esquerda) + Contato (direita) ────────────

  // Nome da empresa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...GREEN);
  doc.text(EMPRESA.nome, M, y);
  y += 5.5;

  // Dados da empresa
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(EMPRESA.razao, M, y);          y += 4;
  doc.text(`CNPJ: ${EMPRESA.cnpj}`, M, y); y += 4;
  doc.text(EMPRESA.endereco, M, y);        y += 4;
  doc.text(EMPRESA.bairro, M, y);          y += 4;
  doc.text(EMPRESA.cep, M, y);

  // Contato (direita)
  const colR = W - M;
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`✉  ${EMPRESA.email}`, colR, M + 6, { align: "right" });
  doc.text(`☎  ${EMPRESA.telefone}`, colR, M + 11, { align: "right" });

  y += 9;

  // ── 2. Linha separadora verde ────────────────────────────────────────
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(M, y, W - M, y);
  y += 7;

  // ── 3. Número do pedido (destaque) ──────────────────────────────────
  const pedidoNum = orcamento.id.slice(-6).toUpperCase();
  doc.setFillColor(...GREEN);
  doc.roundedRect(M, y, W - M * 2, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...WHITE);
  doc.text(`Pedido ${pedidoNum}`, W / 2, y + 7.5, { align: "center" });
  y += 17;

  // ── 4. Dados do cliente ──────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  doc.text(`Cliente: ${cliente.nome}`, M, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);

  if (cliente.telefone) {
    doc.text(`☎  ${cliente.telefone}`, M, y);
    y += 4;
  }
  if (animal) {
    doc.text(
      `Animal: ${animal.nome} — ${animal.especie ?? ""}${animal.raca ? ` · ${animal.raca}` : ""}`,
      M, y,
    );
    y += 4;
  }

  // Datas na direita
  doc.setFontSize(8);
  doc.text(
    `Emissão: ${fmtDate(orcamento.data)}     Validade: ${fmtDate(orcamento.validade)}`,
    W - M,
    y - (animal ? 9 : cliente.telefone ? 5 : 1),
    { align: "right" },
  );

  y += 4;

  // ── 5. Separador sutil ───────────────────────────────────────────────
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;

  // ── 6. Tabela de produtos ────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Produtos", M, y);
  y += 5;

  const hasImages =
    !!produtoImages &&
    orcamento.itens.some(
      (i) => i.produtoId && produtoImages[i.produtoId]?.startsWith("data:image"),
    );

  const IMG_W = 18; // largura da coluna de imagem (mm)

  const tableHead = hasImages
    ? [["", "Descrição", "Unidade", "Preço unitário", "Qtd.", "Preço"]]
    : [["Descrição", "Unidade", "Preço unitário", "Qtd.", "Preço"]];

  const tableBody = orcamento.itens.map((item) =>
    hasImages
      ? ["", item.nome, "un.", brl(item.valorUnitario), String(item.qtd), brl(item.total)]
      : [item.nome, "un.", brl(item.valorUnitario), String(item.qtd), brl(item.total)],
  );

  const colStylesWithImg = {
    0: { cellWidth: IMG_W, halign: "center" as const },
    1: { cellWidth: "auto" as const },
    2: { cellWidth: 16, halign: "center" as const },
    3: { cellWidth: 30, halign: "right" as const },
    4: { cellWidth: 14, halign: "center" as const },
    5: { cellWidth: 30, halign: "right" as const, fontStyle: "bold" as const },
  };

  const colStylesNoImg = {
    0: { cellWidth: "auto" as const },
    1: { cellWidth: 16, halign: "center" as const },
    2: { cellWidth: 30, halign: "right" as const },
    3: { cellWidth: 14, halign: "center" as const },
    4: { cellWidth: 30, halign: "right" as const, fontStyle: "bold" as const },
  };

  autoTable(doc, {
    startY: y,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      valign: "middle",
      textColor: DARK,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
      minCellHeight: hasImages ? IMG_W : undefined,
    },
    headStyles: {
      fillColor: GREEN,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8.5,
      minCellHeight: 8,
    },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: hasImages ? colStylesWithImg : colStylesNoImg,
    margin: { left: M, right: M },
    rowPageBreak: "avoid",
    didDrawCell: (data) => {
      if (!hasImages || data.column.index !== 0 || data.section !== "body") return;
      const item = orcamento.itens[data.row.index];
      if (!item?.produtoId) return;
      const imgUrl = produtoImages?.[item.produtoId];
      if (!imgUrl?.startsWith("data:image")) return;
      const pad = 2;
      const size = Math.min(data.cell.width - pad * 2, data.cell.height - pad * 2);
      const imgX = data.cell.x + (data.cell.width - size) / 2;
      const imgY = data.cell.y + (data.cell.height - size) / 2;
      try {
        doc.addImage(imgUrl, "JPEG", imgX, imgY, size, size);
      } catch {
        // formato não suportado — ignora
      }
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // ── 7. Linha de total ────────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(M, y, W - M * 2, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text("Total", M + 4, y + 6.8);
  doc.text(brl(orcamento.total), W - M - 4, y + 6.8, { align: "right" });
  y += 16;

  // ── 8. Pagamento ─────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Pagamento", M, y);
  y += 5;

  const midX = M + (W - M * 2) / 2 + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text("Meios de pagamento", M, y);
  doc.text("PIX", midX, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  const metodos =
    "Boleto, transferência bancária, dinheiro, cheque,\n" +
    "cartão de crédito, cartão de débito, pix,\n" +
    "picpay ou link de pagamento.";
  const metodoLines = doc.splitTextToSize(metodos, midX - M - 4) as string[];
  doc.text(metodoLines, M, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(EMPRESA.pix, midX, y);

  y += metodoLines.length * 4 + 8;

  // ── 9. Observações ────────────────────────────────────────────────────
  if (orcamento.obs) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text("Observações", M, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    const lines = doc.splitTextToSize(orcamento.obs, W - M * 2) as string[];
    doc.text(lines, M, y);
    y += lines.length * 4 + 8;
  }

  // ── 10. Assinatura ────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  const sigY = Math.max(y + 10, pageH - 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(`Manaus, ${new Date().toLocaleDateString("pt-BR")}`, W / 2, sigY, { align: "center" });

  // Linha de assinatura
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  const lineW = 72;
  doc.line((W - lineW) / 2, sigY + 13, (W + lineW) / 2, sigY + 13);

  // Nome da empresa sob a linha
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(EMPRESA.nome, W / 2, sigY + 19, { align: "center" });

  // ── 11. Rodapé ────────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(M, pageH - 8, W - M, pageH - 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("GreenPET — Sistema de Gestão para Pet Shop", M, pageH - 4);
  doc.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, W - M, pageH - 4, { align: "right" });

  // ── 12. Salvar ────────────────────────────────────────────────────────
  doc.save(`orcamento-${pedidoNum}.pdf`);
}

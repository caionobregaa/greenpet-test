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
  telefone: "(92) 98127-7831",
  pix:      "(92) 98127-7831",
};

// Margens padrão para impressão A4 (20mm = ~0.79in — compatível com todas as impressoras)
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;         // margem lateral e superior
const FOOTER_H = 14;       // altura reservada para o rodapé
const SAFE_BOTTOM = PAGE_H - MARGIN - FOOTER_H; // limite inferior do conteúdo
const SIG_H = 32;          // altura do bloco de assinatura

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number): void {
  const y = PAGE_H - MARGIN + 4;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, PAGE_H - MARGIN + 1, PAGE_W - MARGIN, PAGE_H - MARGIN + 1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text("GreenPET — Sistema de Gestão para Pet Shop", MARGIN, y);
  doc.text(`Página ${pageNum}/${totalPages}`, PAGE_W / 2, y, { align: "center" });
  doc.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, PAGE_W - MARGIN, y, { align: "right" });
}

export function gerarOrcamentoPDF(
  orcamento: Orcamento,
  cliente: Cliente | null,
  animal: Animal | null,
  produtoImages?: Record<string, string>,
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = PAGE_W;
  const M = MARGIN;
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
  doc.setTextColor(37, 211, 102); // WhatsApp green
  doc.text(`WhatsApp  ${EMPRESA.telefone}`, colR, M + 11, { align: "right" });
  doc.setTextColor(...GRAY);

  y += 9;

  // ── 2. Linha separadora verde ────────────────────────────────────────
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(M, y, W - M, y);
  y += 7;

  // ── 3. Número do pedido (destaque) ──────────────────────────────────
  const pedidoNum = orcamento.numero
    ? orcamento.numero.toString().padStart(3, "0")
    : orcamento.id.slice(-6).toUpperCase();
  doc.setFillColor(...GREEN);
  doc.roundedRect(M, y, W - M * 2, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...WHITE);
  doc.text(`Pedido ${pedidoNum}`, W / 2, y + 7.5, { align: "center" });
  y += 17;

  // ── 4. Dados do cliente ──────────────────────────────────────────────
  if (cliente) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    doc.text(`Cliente: ${cliente.nome}`, M, y);
    y += 5;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);

  if (animal) {
    doc.text(
      `Animal: ${animal.nome} — ${animal.especie ?? ""}${animal.raca ? ` · ${animal.raca}` : ""}`,
      M, y,
    );
    y += 4;
  }

  // Datas na direita
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(
    `Emissão: ${fmtDate(orcamento.data)}     Validade: ${fmtDate(orcamento.validade)}`,
    W - M,
    cliente ? y - (animal ? 9 : 1) : y,
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
  // Se não cabe na página atual, adiciona nova página
  if (y + 10 > SAFE_BOTTOM) { doc.addPage(); y = M; }

  doc.setFillColor(...GREEN);
  doc.rect(M, y, W - M * 2, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text("Total", M + 4, y + 6.8);
  doc.text(brl(orcamento.total), W - M - 4, y + 6.8, { align: "right" });
  y += 16;

  // ── 8. Pagamento ─────────────────────────────────────────────────────
  if (y + 30 > SAFE_BOTTOM) { doc.addPage(); y = M; }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Pagamento", M, y);
  y += 5;

  const midX = M + (W - M * 2) / 2 + 4;

  // Determine which payment methods to show
  const formasPag = orcamento.formasPag && orcamento.formasPag.length > 0
    ? orcamento.formasPag
    : ["Cartão de Crédito", "Cartão de Débito", "PIX", "Dinheiro"];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text("Formas de pagamento aceitas", M, y);
  doc.text("PIX", midX, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  const metodoLines = doc.splitTextToSize(formasPag.join(", "), midX - M - 4) as string[];
  doc.text(metodoLines, M, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(EMPRESA.pix, midX, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("(mesmo número do WhatsApp)", midX, y);

  y += metodoLines.length * 4 + 8;

  // ── 9. Observações ────────────────────────────────────────────────────
  if (orcamento.obs) {
    if (y + 20 > SAFE_BOTTOM) { doc.addPage(); y = M; }
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
    y += lines.length * 4 + 6;
  }

  // ── 10. Assinatura — sempre na última página, dentro das margens ──────
  // Se a assinatura não cabe com margem segura, adiciona nova página
  if (y + SIG_H > SAFE_BOTTOM) { doc.addPage(); y = M; }

  // Centraliza a assinatura na área restante da página
  const sigY = Math.max(y + 6, SAFE_BOTTOM - SIG_H);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(`Manaus, ${new Date().toLocaleDateString("pt-BR")}`, W / 2, sigY, { align: "center" });

  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  const lineW = 72;
  doc.line((W - lineW) / 2, sigY + 13, (W + lineW) / 2, sigY + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(EMPRESA.nome, W / 2, sigY + 19, { align: "center" });

  // ── 11. Rodapé em todas as páginas ────────────────────────────────────
  const totalPages = (doc as jsPDF & { internal: { pages: unknown[] } }).internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages);
  }

  // ── 12. Salvar ────────────────────────────────────────────────────────
  doc.save(`orcamento-${pedidoNum}.pdf`);
}

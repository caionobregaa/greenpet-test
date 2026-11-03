import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/api";

/** Serve a foto do produto pelo domínio do site, sem expor o endereço do backend. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await fetch(`${backendUrl()}/api/v1/catalogo/produtos/${encodeURIComponent(id)}/imagem`, {
      redirect: "manual",
      cache: "no-store",
    });
    const destino = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && destino) return NextResponse.redirect(destino, 302);
    if (!res.ok) return new NextResponse(null, { status: 404 });
    return new NextResponse(await res.arrayBuffer(), {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": res.headers.get("cache-control") ?? "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}

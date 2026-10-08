"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, PawPrint } from "lucide-react";
import Image from "next/image";
import { LoginSchema, type LoginInput } from "@/lib/schemas/auth.schema";
import { apiAuth } from "@/lib/api/auth";
import { getAccessToken, setTokens } from "@/lib/utils/auth-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FEATURES = [
  "Clientes e seus pets",
  "Vendas e orçamentos",
  "Estoque e recompra",
  "Relatórios e BI",
];

// "Manchas" do mascote espalhadas pelo painel vinho (posição, tamanho, rotação).
const MANCHAS = [
  { top: "8%",  left: "78%", w: 120, h: 84,  rot: -18 },
  { top: "34%", left: "-4%", w: 170, h: 118, rot: 24 },
  { top: "62%", left: "86%", w: 96,  h: 66,  rot: 12 },
];

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (getAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await apiAuth.login(data.email, data.senha);
      setTokens(result.token, result.refreshToken, result.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status;
      if (status === 403) {
        toast.error("Conta bloqueada", {
          description: "Muitas tentativas incorretas. Tente novamente em 15 minutos.",
        });
      } else {
        toast.error("Credenciais inválidas", {
          description: "Verifique seu e-mail e senha e tente novamente.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">

      {/* ── Painel da marca: banner no mobile, coluna no desktop ── */}
      <section className="bz-grain relative overflow-hidden bg-[#641d3f] text-[#fffefd] lg:w-[54%] shrink-0">
        {MANCHAS.map((m, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute rounded-[50%] bg-[#ffc9d0]/[0.07]"
            style={{ top: m.top, left: m.left, width: m.w, height: m.h, transform: `rotate(${m.rot}deg)` }}
          />
        ))}

        <div className="relative z-10 flex flex-col h-full px-6 pt-6 pb-4 lg:px-14 lg:pt-12 lg:pb-10">
          <Image
            src="/brand/wordmark-amarelo.png"
            alt="beezpet"
            width={720}
            height={190}
            priority
            className="bz-rise h-9 lg:h-12 w-auto self-start"
          />

          <div className="hidden lg:block mt-12 max-w-[30rem]">
            <h1
              className="bz-rise text-[44px] leading-[1.05] text-[#ffed8e]"
              style={{ animationDelay: "120ms", fontStyle: "italic", fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 72' }}
            >
              Cada patinha,<br />bem cuidada.
            </h1>
            <p className="bz-rise mt-4 text-[15px] leading-relaxed text-[#fbe6ec]/80" style={{ animationDelay: "220ms" }}>
              O sistema da beezpet para cuidar dos clientes, dos pets e do negócio, tudo num lugar só.
            </p>
            <ul className="bz-rise mt-6 flex flex-wrap gap-2" style={{ animationDelay: "320ms" }}>
              {FEATURES.map((feat) => (
                <li
                  key={feat}
                  className="flex items-center gap-2 rounded-full border border-[#ffc9d0]/25 bg-[#ffc9d0]/[0.08] px-3 py-1.5 text-[12.5px] text-[#ffe3e7]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ffed8e]" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          <div className="bz-rise mt-4 lg:mt-auto flex justify-center lg:justify-start" style={{ animationDelay: "380ms" }}>
            <Image
              src="/brand/mascote-caixas.webp"
              alt="Mascote da beezpet ao lado de caixas de entrega"
              width={900}
              height={602}
              priority
              className="bz-float w-[230px] sm:w-[280px] lg:w-[min(100%,520px)] h-auto select-none [mask-image:radial-gradient(ellipse_at_center,black_74%,transparent_96%)]"
            />
          </div>

          <p className="hidden lg:block mt-6 text-[10.5px] tracking-[0.2em] uppercase text-[#ffc9d0]/45">
            beezpet © {new Date().getFullYear()} · Manaus, AM
          </p>
        </div>
      </section>

      {/* ── Formulário ── */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[360px]">
          <div className="bz-rise mb-9 flex flex-col items-start" style={{ animationDelay: "150ms" }}>
            <Image
              src="/brand/mascote.png"
              alt=""
              width={320}
              height={320}
              className="h-14 w-14 mb-6 rounded-full shadow-[0_8px_24px_-8px_rgba(100,29,63,0.55)]"
            />
            <h2
              className="text-[34px] leading-[1.05] text-[#641d3f]"
              style={{ fontVariationSettings: '"SOFT" 100, "WONK" 0, "opsz" 48' }}
            >
              Bem-vindo<br />de volta!
            </h2>
            <p className="mt-2.5 text-[13.5px] text-muted-foreground">
              Entre com seu e-mail e senha para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="bz-rise space-y-5" style={{ animationDelay: "260ms" }}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#641d3f]">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register("email")}
                className={cn(
                  "h-11 rounded-xl bg-card px-3.5 focus-visible:border-[#b5476f] focus-visible:ring-[#ffc9d0]/60",
                  errors.email && "border-destructive",
                )}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha" className="text-[#641d3f]">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("senha")}
                className={cn(
                  "h-11 rounded-xl bg-card px-3.5 focus-visible:border-[#b5476f] focus-visible:ring-[#ffc9d0]/60",
                  errors.senha && "border-destructive",
                )}
              />
              {errors.senha && (
                <p className="text-xs text-destructive">{errors.senha.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="group h-11 w-full rounded-xl bg-[#641d3f] text-[15px] font-semibold text-[#ffed8e] shadow-[0_10px_24px_-10px_rgba(100,29,63,0.8)] transition-all hover:-translate-y-0.5 hover:bg-[#561735] active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <PawPrint className="bz-wag ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-[10.5px] text-muted-foreground/60 mt-10 tracking-[0.2em] uppercase lg:hidden">
            beezpet © {new Date().getFullYear()} · Manaus, AM
          </p>
        </div>
      </section>

    </div>
  );
}

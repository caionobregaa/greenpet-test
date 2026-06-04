"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { LoginSchema, type LoginInput } from "@/lib/schemas/auth.schema";
import { apiAuth } from "@/lib/api/auth";
import { getAccessToken, setTokens } from "@/lib/utils/auth-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FEATURES = [
  "Cadastro completo de clientes e seus pets",
  "Registro de vendas e orçamentos",
  "Controle de estoque e alertas de recompra",
  "Dashboard com relatórios e indicadores",
  "Gestão de pedidos de compra",
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
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Painel da imagem: banner no mobile, coluna no desktop ── */}
      <div className="relative h-56 lg:h-auto lg:w-1/2 shrink-0">
        <Image
          src="/joij-login.jpg"
          alt="GreenPET — um pet feliz"
          fill
          className="object-cover object-[center_25%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />

        <div className="relative z-10 flex flex-col justify-between h-full p-6 lg:p-10">
          {/* Logo — sempre visível */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-md flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: "linear-gradient(135deg, #5cbf7a 0%, #1a9688 100%)" }}
            >
              <span className="text-[15px]">🐾</span>
            </div>
            <span className="text-white/90 text-[15px] lg:text-base font-semibold tracking-tight">GreenPET</span>
          </div>

          {/* Mobile: tagline simples na base do banner */}
          <p className="lg:hidden text-white/80 text-sm font-light tracking-wide">
            Sistema de Gestão para Pet Shops
          </p>

          {/* Desktop: título completo + lista de funcionalidades */}
          <div className="hidden lg:block">
            <h1
              className="text-[38px] text-white leading-[1.15] mb-4"
              style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic" }}
            >
              Gestão inteligente<br />para o seu Pet Shop
            </h1>
            <p className="text-white/60 text-sm font-light mb-8 tracking-wide">
              Tudo que você precisa em um só lugar.
            </p>
            <ul className="space-y-2.5">
              {FEATURES.map((feat) => (
                <li key={feat} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span className="text-white/80 text-[13px]">{feat}</span>
                </li>
              ))}
            </ul>
            <p className="text-white/30 text-[11px] mt-10 tracking-wider uppercase">
              GreenPET © {new Date().getFullYear()} · Manaus, AM
            </p>
          </div>
        </div>
      </div>

      {/* ── Painel do formulário ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 lg:p-10">
        <div className="w-full max-w-[340px]">
          <div className="mb-9">
            <h2
              className="text-[28px] text-foreground leading-tight mb-1.5"
              style={{ fontFamily: "var(--font-dm-serif)" }}
            >
              Bem-vindo de volta
            </h2>
            <p className="text-[13px] text-muted-foreground font-light">
              Entre com suas credenciais para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("senha")}
                className={errors.senha ? "border-destructive" : ""}
              />
              {errors.senha && (
                <p className="text-xs text-destructive">{errors.senha.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="text-center text-[11px] text-muted-foreground/50 mt-8 tracking-wider uppercase">
            GreenPET © {new Date().getFullYear()} · Manaus, AM
          </p>
        </div>
      </div>

    </div>
  );
}

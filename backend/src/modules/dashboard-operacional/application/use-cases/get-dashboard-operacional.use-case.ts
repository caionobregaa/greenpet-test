import type { PrismaRecompraRepository, RecompraAlerta } from '@/modules/recompra/infrastructure/repositories/prisma-recompra.repository.js'
import type { GetDashboardOverviewUseCase } from '@/modules/dashboard/application/use-cases/get-dashboard-overview.use-case.js'
import type { ComparativoItem } from '@/modules/dashboard/application/use-cases/get-dashboard-overview.use-case.js'
import type {
  PrismaDashboardOperacionalRepository,
  VendaMargemNegativa,
  ProdutoEstoqueBaixo,
} from '../../infrastructure/repositories/prisma-dashboard-operacional.repository.js'

export interface ClienteSumido {
  clienteId: string
  nome: string
  produtoNome: string
  diasAtraso: number
}

export interface DashboardOperacional {
  recompraSemana: { total: number; itens: RecompraAlerta[] }
  recompraAtrasada: { total: number; itens: RecompraAlerta[] }
  clientesSumidos: { total: number; itens: ClienteSumido[] }
  faturamento: { hoje: number; periodoAtual: ComparativoItem }
  vendasMargemNegativa: VendaMargemNegativa[]
  estoqueBaixo: ProdutoEstoqueBaixo[]
}

// Cliente "sumido": alerta vencido (já deveria ter recomprado) há mais desse
// tanto de dias. Confirmado com o usuário — corte de 30 dias.
const DIAS_ATRASO_SUMIDO = 30

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

export class GetDashboardOperacionalUseCase {
  constructor(
    private readonly recompraRepo: PrismaRecompraRepository,
    private readonly dashboardOverviewUseCase: GetDashboardOverviewUseCase,
    private readonly operacionalRepo: PrismaDashboardOperacionalRepository,
  ) {}

  async execute(params: { inicio: Date; fim: Date }): Promise<DashboardOperacional> {
    const hoje = new Date()

    const [alertasResult, overviewHoje, overviewPeriodo, vendasMargemNegativa, estoqueBaixo] = await Promise.all([
      // Sem filtro de urgência: precisamos separar em 3 baldes (semana/atrasada/sumido)
      // a partir do mesmo cálculo de diasRestantes já existente em findAlertas.
      this.recompraRepo.findAlertas({ page: 1, limit: 10_000 }),
      this.dashboardOverviewUseCase.execute({ inicio: startOfDay(hoje), fim: endOfDay(hoje) }),
      this.dashboardOverviewUseCase.execute({ inicio: params.inicio, fim: params.fim }),
      this.operacionalRepo.findVendasMargemNegativa(params.inicio, params.fim),
      this.operacionalRepo.findEstoqueBaixo(),
    ])

    const alertas = alertasResult.alertas
    const recompraSemanaItens = alertas.filter((a) => a.urgencia === 'proximo' || a.urgencia === 'urgente')
    const recompraAtrasadaItens = alertas.filter((a) => a.urgencia === 'vencido')
    const clientesSumidosItens: ClienteSumido[] = recompraAtrasadaItens
      .filter((a) => Math.abs(a.diasRestantes) > DIAS_ATRASO_SUMIDO)
      .map((a) => ({
        clienteId: a.clienteId,
        nome: a.clienteNome,
        produtoNome: a.produtoNome,
        diasAtraso: Math.abs(a.diasRestantes),
      }))

    return {
      recompraSemana: { total: recompraSemanaItens.length, itens: recompraSemanaItens },
      recompraAtrasada: { total: recompraAtrasadaItens.length, itens: recompraAtrasadaItens },
      clientesSumidos: { total: clientesSumidosItens.length, itens: clientesSumidosItens },
      faturamento: {
        hoje: overviewHoje.totalReceita,
        periodoAtual: overviewPeriodo.comparativoPeriodoAnterior.totalReceita,
      },
      vendasMargemNegativa,
      estoqueBaixo,
    }
  }
}

import { describe, it, expect } from 'vitest'
import {
  isAlertaAviso,
  isSumido,
  validarMotivosSumido,
  MOTIVOS_SUMIDO,
} from '@/modules/recompra/domain/services/recompra-alert.service'

describe('recompra — avisos e sumidos (spec-v2)', () => {
  it('alerta de aviso: faltam até 10 dias ou já venceu', () => {
    expect(isAlertaAviso(10)).toBe(true)
    expect(isAlertaAviso(-50)).toBe(true)
    expect(isAlertaAviso(11)).toBe(false)
  })

  it('sumido: vencido há mais de 30 dias', () => {
    expect(isSumido(-31)).toBe(true)
    expect(isSumido(-30)).toBe(false)
    expect(isSumido(5)).toBe(false)
  })
})

describe('validarMotivosSumido', () => {
  it('aceita um ou vários motivos da lista', () => {
    expect(validarMotivosSumido(['Preço'])).toBeNull()
    expect(validarMotivosSumido(['Preço', 'Mudou de cidade'])).toBeNull()
  })

  it('exige pelo menos um motivo', () => {
    expect(validarMotivosSumido([])).toBe('Selecione pelo menos um motivo')
  })

  it('rejeita motivo fora da lista e repetido', () => {
    expect(validarMotivosSumido(['Chuva'])).toBe('Motivo inválido: Chuva')
    expect(validarMotivosSumido(['Preço', 'Preço'])).toBe('Motivo repetido')
  })

  it('Outro exige texto', () => {
    expect(validarMotivosSumido(['Outro'])).toBe('Descreva o motivo em "Outro"')
    expect(validarMotivosSumido(['Outro'], '   ')).toBe('Descreva o motivo em "Outro"')
    expect(validarMotivosSumido(['Outro'], 'achou no atacado')).toBeNull()
  })

  it('a lista tem os 9 motivos combinados, terminando em Outro', () => {
    expect(MOTIVOS_SUMIDO).toHaveLength(9)
    expect(MOTIVOS_SUMIDO[MOTIVOS_SUMIDO.length - 1]).toBe('Outro')
  })
})

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Network, Server, Cpu, Layers, HelpCircle, ArrowRight, Activity, Terminal } from 'lucide-react';
import { SNMP_COMMANDS } from '../data';

interface IntroductionPanelProps {
  onSelectCommand: (cmdId: string) => void;
  networkImage: string;
}

export default function IntroductionPanel({ onSelectCommand, networkImage }: IntroductionPanelProps) {
  const [activeConcept, setActiveConcept] = useState<'manager' | 'agent' | 'protocol' | null>(null);

  return (
    <div className="space-y-12">
      {/* Intro Header Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-50/40 blur-3xl" />
        
        <div className="grid gap-8 lg:grid-cols-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wider text-blue-700 uppercase">
              O que é SNMP?
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Arquitetura Manager-Agent
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
              O <strong>Simple Network Management Protocol (SNMP)</strong> é o padrão da indústria de redes IP para coletar métricas, monitorar performance e alterar configurações remotamente. A comunicação ocorre em um modelo síncrono ou assíncrono entre um gerente central e múltiplos dispositivos chamados de agentes.
            </p>

            {/* Concept selectors */}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                id="btn-concept-manager"
                onClick={() => setActiveConcept(activeConcept === 'manager' ? null : 'manager')}
                className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                  activeConcept === 'manager'
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                  <Server className="h-4 w-4 text-blue-600" />
                  NMS (Manager / Gerente)
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Central que gerencia as requisições, faz pooling e centraliza as estatísticas e logs da empresa.
                </p>
              </button>

              <button
                id="btn-concept-agent"
                onClick={() => setActiveConcept(activeConcept === 'agent' ? null : 'agent')}
                className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                  activeConcept === 'agent'
                    ? 'border-cyan-600 bg-cyan-50/30'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center gap-2 text-cyan-800 font-semibold text-sm">
                  <Cpu className="h-4 w-4 text-cyan-600" />
                  Agente SNMP
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Software interno no roteador, switch ou servidor que armazena os valores em variáveis da MIB.
                </p>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 to-transparent pointer-events-none" />
              <img
                src={networkImage}
                alt="Diagrama de Rede SNMP"
                referrerPolicy="no-referrer"
                className="w-full h-48 md:h-64 object-cover rounded-xl shadow-inner border border-slate-100 mix-blend-multiply filter contrast-105"
              />
              <div className="mt-3 text-center">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block font-medium">
                  Estrutura de Subnet IP Gerenciada (192.168.1.0/24)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info drawer on select */}
      {activeConcept && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-5 rounded-xl border border-blue-100 bg-blue-50 text-slate-800"
        >
          {activeConcept === 'manager' ? (
            <div className="space-y-2">
              <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                <Server className="h-4 w-4" /> Solicitante Central de Monitoramento (NMS)
              </h4>
              <p className="text-sm leading-relaxed">
                O <strong>Network Management Station (NMS)</strong> é a central de TI. Ele executa softwares como Zabbix, Nagios ou PRTG. Ele faz requisições ativas ao Agente usando portas UDP (porta padrão 161) e escuta alertas de eventos assíncronos enviados pelos Agentes (conhecidos como <em>Traps</em>, na porta UDP 162).
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="font-bold text-cyan-900 text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4" /> O Respondente em Hardware (Agente)
              </h4>
              <p className="text-sm leading-relaxed">
                Qualquer elemento de rede ativo pode atuar como <strong>Agente SNMP</strong>. Ele possui um daemon local (<code>snmpd</code>) que lê e edita tabelas de registros locais (interfaces de rede, uso de CPU, espaço em disco) e formata esses dados na estrutura hierárquica universal das MIBs.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Interactive Protocol Visualizer */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Como as mensagens trafegam na rede?
        </h3>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="relative flex flex-col p-5 bg-white border border-slate-200 rounded-xl leading-relaxed">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Polling (GET/GETNEXT)</h4>
            <p className="text-xs text-slate-500">
              O Manager envia um pacote contendo uma lista de OIDs que deseja ler, acompanhado da "Community String" (senha em texto simples) do Agente.
            </p>
          </div>

          <div className="relative flex flex-col p-5 bg-white border border-slate-200 rounded-xl leading-relaxed">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Processamento e Resposta</h4>
            <p className="text-xs text-slate-500">
              O Agente valida a Community String. Se correta, consulta os registradores de hardware locais correspondentes aos OIDs solicitados e retorna.
            </p>
          </div>

          <div className="relative flex flex-col p-5 bg-white border border-slate-200 rounded-xl leading-relaxed">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Notificação Indevida (TRAP)</h4>
            <p className="text-xs text-slate-500">
              Em situações de emergência (ex: queda física de interface, temperatura elevada), o Agente envia um pacote assíncrono proativo ao Manager na porta 162.
            </p>
          </div>
        </div>
      </section>

      {/* Command Reference Section */}
      <section id="snmp-commands-reference" className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Referência de Comandos
          </h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SNMP_COMMANDS.map((cmd) => {
            const isBlue = cmd.id === 'snmpget' || cmd.id === 'snmpset' || cmd.id === 'snmpbulkget';
            return (
              <div
                key={cmd.id}
                className={`relative group flex flex-col justify-between p-5 rounded-2xl bg-white border-l-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                  isBlue ? 'border-l-blue-600' : 'border-l-cyan-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {cmd.name}
                    </span>
                    <Terminal className={`h-4 w-4 ${isBlue ? 'text-blue-500' : 'text-cyan-500'}`} />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {cmd.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">
                    Sugerido: <span className="text-slate-600 font-medium">{cmd.suggestedOid}</span>
                  </span>
                  <button
                    onClick={() => onSelectCommand(cmd.id)}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold tracking-wide transition-all ${
                      isBlue ? 'text-blue-600 hover:text-blue-700' : 'text-cyan-600 hover:text-cyan-700'
                    }`}
                  >
                    Simular
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

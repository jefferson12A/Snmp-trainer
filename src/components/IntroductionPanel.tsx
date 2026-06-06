/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Network, Server, Cpu, Layers, HelpCircle, ArrowRight, Activity, Terminal, Map, Navigation, ChevronRight, Home, Compass, MapPin, Building } from 'lucide-react';
import { SNMP_COMMANDS } from '../data';

const citySteps = [
  { oid: '.1', name: 'iso', num: '1', role: 'Entrada da Cidade (iso)', detail: 'O portão monumental de entrada da Cidade com o Arco Monumental “ISO”. Todo visitante de fora entra por aqui.', color: 'from-blue-500 to-indigo-500', icon: 'Compass', mapX: 55, mapY: 70 },
  { oid: '.1.3', name: 'org', num: '3', role: 'Bairro das Organizações (org)', detail: 'O distrito dos prédios corporativos e escritórios que representam as subdivisões globais de governança.', color: 'from-indigo-500 to-violet-500', icon: 'Map', mapX: 165, mapY: 60 },
  { oid: '.1.3.6', name: 'dod', num: '6', role: 'Setor de Segurança (dod)', detail: 'Uma área operacional fortificada repleta de antenas de rádio e radares que monitoram o tráfego do local.', color: 'from-violet-500 to-purple-500', icon: 'Navigation', mapX: 275, mapY: 70 },
  { oid: '.1.3.6.1', name: 'internet', num: '1', role: 'Super Avenida Principal (internet)', detail: 'A grande rodovia ou avenida iluminada de alta velocidade que transporta toda a comunicação pública.', color: 'from-purple-500 to-fuchsia-500', icon: 'Network', mapX: 385, mapY: 110 },
  { oid: '.1.3.6.1.2', name: 'mgmt', num: '2', role: 'Bairro do Gerenciamento (mgmt)', detail: 'O distrito administrativo da cidade, provido de armários de servidores, controladoras e painéis.', color: 'from-fuchsia-100 to-pink-500', icon: 'Building', mapX: 495, mapY: 150 },
  { oid: '.1.3.6.1.2.1', name: 'mib-2', num: '1', role: 'Rua do Monitoramento Padrão (mib-2)', detail: 'A rua que concentra equipamentos de controle público e indicadores de monitoramento operacional padronizados.', color: 'from-pink-500 to-rose-500', icon: 'Layers', mapX: 605, mapY: 190 },
  { oid: '.1.3.6.1.2.1.1', name: 'system', num: '1', role: 'Prédio da Prefeitura (system)', detail: 'O majestoso edifício da prefeitura que conta com uma imponente torre de relógio e dados centrais da rede.', color: 'from-rose-500 to-amber-500', icon: 'Home', mapX: 495, mapY: 270 },
  { oid: '.1.3.6.1.2.1.1.1', name: 'sysDescr', num: '1', role: 'Prateleira de Arquivos (sysDescr)', detail: 'A prateleira ou estante dentro do arquivo municipal que organiza as pastas com a descrição do sistema.', color: 'from-amber-500 to-orange-500', icon: 'Cpu', mapX: 320, mapY: 290 },
  { oid: '.1.3.6.1.2.1.1.1.0', name: '0', num: '0', role: 'Gaveta 0 Aberta (sysDescr.0)', detail: 'A gaveta número zero que se encontra aberta, revelando o documento oficial das especificações de hardware.', color: 'from-orange-500 to-emerald-500', icon: 'MapPin', mapX: 110, mapY: 300 },
];

interface IntroductionPanelProps {
  onSelectCommand: (cmdId: string) => void;
  networkImage: string;
}

export default function IntroductionPanel({ onSelectCommand, networkImage }: IntroductionPanelProps) {
  const [activeConcept, setActiveConcept] = useState<'manager' | 'agent' | 'protocol' | null>(null);
  const [selectedCityStep, setSelectedCityStep] = useState<number>(8); // Defaults to sysDescr.0 (index 8)
  const [analogTab, setAnalogTab] = useState<'map' | 'list'>('map');

  const getPathIndices = (currentStep: number) => {
    return Array.from({ length: Math.min(currentStep + 1, citySteps.length) }, (_, i) => i);
  };

  const activeIndices = getPathIndices(selectedCityStep);
  const isSideBranchActive = false;

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

      {/* MIB vs OID Explanation & Analogy Section */}
      <section className="space-y-6 p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            Entendendo de vez: MIBs, OIDs e a Analogia da Cidade
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Para gerenciar qualquer dispositivo de rede, o SNMP precisa de um sistema onde cada informação tenha um lugar único, padronizado e inequívoco. É aqui que entram a <strong>MIB</strong> e o <strong>OID</strong>.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* MIB definition */}
          <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/60 flex gap-4">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-blue-100 text-blue-700 mt-0.5">
              <Network className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">A MIB (Management Information Base)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                É a gigantesca árvore de opções ou estrutura hierárquica universal contendo tudo o que o dispositivo pode expor. Ela serve como o mapa estrutural que traduz nomes amigáveis em caminhos numéricos.
              </p>
            </div>
          </div>

          {/* OID definition */}
          <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/60 flex gap-4">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 mt-0.5">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">O OID (Object Identifier)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                É o endereço numérico exato de uma folha (ou variável) dentro da árvore! Exemplo: <code>.1.3.6.1.2.1.1.5.0</code> identifica unicamente o nome de host do roteador em qualquer lugar do mundo.
              </p>
            </div>
          </div>
        </div>

        {/* Analogy Box */}
        <div className="bg-gradient-to-r from-blue-50/35 to-cyan-50/35 p-5 rounded-xl border border-blue-100/50 flex flex-col md:flex-row gap-4 items-start">
          <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-serif text-lg font-extrabold shadow-sm">
            A
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider">A Analogia da Grande Cidade</h4>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Imagine que o dispositivo gerenciado (roteador, servidor) é uma <strong>Grande Cidade</strong>.
              </p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>
                  A <strong>MIB</strong> é a própria <strong>Cidade</strong> inteira com seu plano de zoneamento urbano. Ela delimita quais bairros e distritos existem, organizando todo o espaço disponível.
                </li>
                <li>
                  As <strong>folhas e subramos da MIB</strong> são as <strong>Avenidas e Ruas</strong> mapeadas. Elas dividem a cidade de forma planejada por funções específicos (ex: Bairro do Gerenciamento padrão, Bairro Particular/Privado).
                </li>
                <li>
                  O <strong>OID</strong> é a <strong>Casa ou Lote exato</strong>, traduzindo o caminho exato e estruturado para alcançar aquela informação, por exemplo: <code>Cidade . Bairro_Gerenciamento . Rua_Mib2 . Casa_Sistema . Nome_Dispositivo</code>.
                </li>
                <li>
                  O <strong>Agente SNMP</strong> é o <strong>Zelador ou Mensageiro local</strong> da cidade que conhece cada centímetro dessas ruas e sabe exatamente em qual casa buscar o valor do medidor residencial de tráfego quando o Gerente solicita.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interactive City Analogy Roadmap */}
        <div className="bg-slate-50/70 p-3 sm:p-5 rounded-xl border border-slate-200/80 mt-6 space-y-5">
          <div className="border-b border-slate-200/60 pb-4">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                <Map className="h-4 w-4 text-emerald-600 shrink-0 animate-pulse" />
                Caminho Urbano do SNMP (Plano Diretor de SNMP-ville)
              </h4>
              <p className="text-xs text-slate-500">
                Acompanhe o caminho exato pela cidade MIB clicando nos marcos ou nos números da rota do GPS. O destino final é a casa exata <code>sysDescr.0</code>.
              </p>
            </div>
          </div>

          {/* Abas de Visualização */}
          <div className="flex border-b border-slate-200/80 gap-2">
            <button
              id="tab-view-map"
              onClick={() => setAnalogTab('map')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase border-b-2 -mb-px transition-all cursor-pointer ${
                analogTab === 'map'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Map className="h-4 w-4" />
              Ver Mapa Interativo
            </button>
            <button
              id="tab-view-list"
              onClick={() => setAnalogTab('list')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wide uppercase border-b-2 -mb-px transition-all cursor-pointer ${
                analogTab === 'list'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="h-4 w-4" />
              Ver Lista de Passos
            </button>
          </div>

          {/* Main Interactive Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-12 items-start pt-2">
            
            {/* Left display column (Map OR List Timeline based on selected tab) */}
            <div className="lg:col-span-8 w-full">
              {analogTab === 'map' ? (
                <>
                  {/* Master Cadastral Map Canvas Section */}
                <div className="hidden lg:block w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-emerald-50/20 to-teal-50/10 p-4 shadow-inner relative z-10" style={{ backgroundImage: 'radial-gradient(#10b981 1.2px, transparent 1.2px)', backgroundSize: '32px 32px' }}>

            {/* Decorative Compass (Bússola) in top-right corner */}
            <div className="absolute right-4 top-4 h-14 w-14 border border-slate-350 bg-white/95 rounded-xl flex flex-col items-center justify-center shadow-md group hover:scale-105 hover:rotate-6 transition-all duration-350 z-20 cursor-help" title="Rosa dos Ventos MIB">
              <Compass className="h-6 w-6 text-amber-500 animate-spin-slow" />
              <span className="text-[7px] font-bold tracking-widest text-slate-500 font-mono mt-0.5">MIB v2</span>
            </div>

            {/* Map Landscape Layout Container - Fixed Width for scrollproofing */}
            <div className="w-[680px] h-[360px] relative select-none mx-auto shrink-0">
              
              {/* Dynamic Grass Clusters & Lakes Landscape Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#bae6fd" />
                    <stop offset="100%" stopColor="#7dd3fc" />
                  </linearGradient>
                </defs>
                
                {/* Visual Scenic Pond / Ecological Lake */}
                <ellipse cx="230" cy="210" rx="45" ry="18" fill="url(#lakeGrad)" opacity="0.8" />
                <ellipse cx="560" cy="115" rx="35" ry="15" fill="url(#lakeGrad)" opacity="0.65" />
                
                {/* Broad Town Boulevard Road Bed (Thick Core Asphalt with light shoulders) */}
                {/* Main Curve Route */}
                <path 
                  d="M 55,70 Q 110,65 165,60 Q 220,65 275,70 Q 330,90 385,110 Q 440,130 495,150 Q 550,170 605,190 Q 550,230 495,270 Q 408,280 320,290 Q 215,295 110,300" 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="28" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 55,70 Q 110,65 165,60 Q 220,65 275,70 Q 330,90 385,110 Q 440,130 495,150 Q 550,170 605,190 Q 550,230 495,270 Q 408,280 320,290 Q 215,295 110,300" 
                  fill="none" 
                  stroke="#475569" 
                  strokeWidth="22" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 55,70 Q 110,65 165,60 Q 220,65 275,70 Q 330,90 385,110 Q 440,130 495,150 Q 550,170 605,190 Q 550,230 495,270 Q 408,280 320,290 Q 215,295 110,300" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth="1.5" 
                  strokeDasharray="5 5" 
                  strokeLinecap="round" 
                />

                {/* DYNAMIC GPS ACTIVE SEGMENT PATHS (Colored Yellow / Gold based on visited state) */}
                {/* Segment 0: 0 -> 1 (iso -> org) */}
                <path 
                  d="M 55,70 Q 110,65 165,60" 
                  fill="none" 
                  stroke={activeIndices.includes(1) ? "#f59e0b" : "#94a3b8"} 
                  strokeWidth={activeIndices.includes(1) ? "6" : "2"} 
                  strokeDasharray={activeIndices.includes(1) ? "4 4" : "none"} 
                  className={activeIndices.includes(1) ? "animate-pulse" : ""} 
                  opacity={activeIndices.includes(1) ? "1" : "0.2"}
                />
                {/* Segment 1: 1 -> 2 (org -> dod) */}
                <path 
                  d="M 165,60 Q 220,65 275,70" 
                  fill="none" 
                  stroke={activeIndices.includes(2) ? "#f59e0b" : "#94a3b8"} 
                  strokeWidth={activeIndices.includes(2) ? "6" : "2"} 
                  strokeDasharray={activeIndices.includes(2) ? "4 4" : "none"} 
                  className={activeIndices.includes(2) ? "animate-pulse" : ""} 
                  opacity={activeIndices.includes(2) ? "1" : "0.2"}
                />
                {/* Segment 2: 2 -> 3 (dod -> internet) */}
                <path 
                  d="M 275,70 Q 330,90 385,110" 
                  fill="none" 
                  stroke={activeIndices.includes(3) ? "#f59e0b" : "#94a3b8"} 
                  strokeWidth={activeIndices.includes(3) ? "6" : "2"} 
                  strokeDasharray={activeIndices.includes(3) ? "4 4" : "none"} 
                  className={activeIndices.includes(3) ? "animate-pulse" : ""} 
                  opacity={activeIndices.includes(3) ? "1" : "0.2"}
                />
                {/* Segment 3: 3 -> 4 (internet -> mgmt) */}
                <path 
                  d="M 385,110 Q 440,130 495,150" 
                  fill="none" 
                  stroke={activeIndices.includes(4) ? "#f59e0b" : "#94a3b8"} 
                  strokeWidth={activeIndices.includes(4) ? "6" : "2"} 
                  strokeDasharray={activeIndices.includes(4) ? "4 4" : "none"} 
                  className={activeIndices.includes(4) ? "animate-pulse" : ""} 
                  opacity={activeIndices.includes(4) ? "1" : "0.2"}
                />
                {/* Segment 4: 4 -> 5 (mgmt -> mib-2) */}
                <path 
                  d="M 495,150 Q 550,170 605,190" 
                  fill="none" 
                  stroke={activeIndices.includes(5) ? "#f59e0b" : "#94a3b8"} 
                  strokeWidth={activeIndices.includes(5) ? "6" : "2"} 
                  strokeDasharray={activeIndices.includes(5) ? "4 4" : "none"} 
                  className={activeIndices.includes(5) ? "animate-pulse" : ""} 
                  opacity={activeIndices.includes(5) ? "1" : "0.2"}
                />
                {/* Segment 5: 5 -> 6 (mib-2 -> system) */}
                <path 
                  d="M 605,190 Q 550,230 495,270" 
                  fill="none" 
                  stroke={activeIndices.includes(6) ? "#f59e0b" : "#94a3b8"} 
                  strokeWidth={activeIndices.includes(6) ? "6" : "2"} 
                  strokeDasharray={activeIndices.includes(6) ? "4 4" : "none"} 
                  className={activeIndices.includes(6) ? "animate-pulse" : ""} 
                  opacity={activeIndices.includes(6) ? "1" : "0.2"}
                />

                {/* Main Branch A Segments */}
                {/* Segment 6A: 6 -> 7 (system -> sysDescr) */}
                <path 
                  d="M 495,270 Q 408,280 320,290" 
                  fill="none" 
                  stroke={activeIndices.includes(7) ? "#f59e0b" : "#94a3b8"} 
                  strokeWidth={activeIndices.includes(7) ? "6" : "2"} 
                  strokeDasharray={activeIndices.includes(7) ? "4 4" : "none"} 
                  className={activeIndices.includes(7) ? "animate-pulse" : ""} 
                  opacity={activeIndices.includes(7) ? "1" : "0.2"}
                />
                {/* Segment 7A: 7 -> 8 (sysDescr -> Gaveta 0) */}
                <path 
                  d="M 320,290 Q 215,295 110,300" 
                  fill="none" 
                  stroke={activeIndices.includes(8) ? "#f59e0b" : "#94a3b8"} 
                  strokeWidth={activeIndices.includes(8) ? "6" : "2"} 
                  strokeDasharray={activeIndices.includes(8) ? "4 4" : "none"} 
                  className={activeIndices.includes(8) ? "animate-pulse" : ""} 
                  opacity={activeIndices.includes(8) ? "1" : "0.2"}
                />

                {/* Soft Scenic Deciduous and Pine Tree Patches */}
                <g fill="#15803d" opacity="0.4">
                  <circle cx="280" cy="150" r="10" />
                  <circle cx="295" cy="144" r="13" />
                  <circle cx="310" cy="152" r="9" />
                  <circle cx="580" cy="80" r="12" />
                  <circle cx="470" cy="230" r="11" />
                  <circle cx="452" cy="225" r="9" />
                </g>
              </svg>

              {/* HAND-CRAFTED RICH INFOGRAPHIC landmark illustrations */}
              
              {/* Landmark 0: Entrada da Cidade con Arco ISO */}
              <div className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none" style={{ left: 55, top: 70 }}>
                <div className="bg-slate-900 text-teal-300 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm tracking-wider mb-1 z-20">
                  🏛️ GUARITA: ISO PORTAL
                </div>
                <div className="w-12 h-9 border-t-4 border-x-[5px] border-amber-500 bg-amber-400/15 rounded-t-sm flex items-end justify-center">
                  <span className="text-[5px] font-black text-amber-600 mb-0.5 tracking-tighter">ROOT (.1)</span>
                </div>
              </div>

              {/* Landmark 1: Bairro das Organizações con prédios corporativos */}
              <div className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none" style={{ left: 165, top: 60 }}>
                <div className="bg-indigo-900 text-indigo-200 border border-indigo-750 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm tracking-wider mb-1 z-20">
                  🏢 BAIRRO .ORG
                </div>
                <div className="flex gap-1 items-end h-9">
                  <div className="w-3.5 h-7 bg-indigo-500/80 rounded-t border-t border-x border-indigo-700 relative shadow-sm">
                    <div className="absolute top-1 left-0.5 w-1 h-0.5 bg-yellow-105" />
                    <div className="absolute top-2.5 left-0.5 w-1 h-0.5 bg-yellow-105" />
                    <div className="absolute top-4 left-0.5 w-1 h-0.5 bg-yellow-105" />
                  </div>
                  <div className="w-4.5 h-9 bg-indigo-650 rounded-t border-t border-x border-indigo-800 relative shadow-md">
                    <div className="absolute top-1.5 left-1 w-2.5 h-0.5 bg-sky-205" />
                    <div className="absolute top-3.5 left-1 w-2.5 h-0.5 bg-sky-205" />
                    <div className="absolute top-5.5 left-1 w-2.5 h-0.5 bg-sky-205" />
                  </div>
                </div>
              </div>

              {/* Landmark 2: Setor de Segurança (.dod) com antenas e radares */}
              <div className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none" style={{ left: 275, top: 70 }}>
                <div className="bg-purple-900 text-purple-200 border border-purple-750 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm tracking-wider mb-1 z-20">
                  🛰️ SEGURANÇA .DOD
                </div>
                <div className="flex items-end gap-1.5 h-9">
                  {/* Rotating radar effect */}
                  <div className="relative w-8 h-8 rounded-full border border-purple-400 bg-purple-500/10 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-ping" />
                    <div className="absolute top-0.5 left-[45%] w-1 h-3.5 bg-slate-500 rounded-t-full origin-bottom rotate-45" />
                  </div>
                  <div className="w-1.5 h-7 bg-slate-400 border border-slate-600 rounded-t relative flex items-start justify-center">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 animate-ping absolute -top-1.5" />
                  </div>
                </div>
              </div>

              {/* Landmark 3: Super Avenida Principal como rodovia larga e movimentada */}
              <div className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none" style={{ left: 385, top: 110 }}>
                <div className="bg-blue-900 text-blue-200 border border-blue-750 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm tracking-wider mb-1 z-20">
                  ⚡ SUPER AVENIDA INTERNET
                </div>
                <div className="h-6 w-24 flex items-center justify-between border-y-2 border-dashed border-sky-400/85 bg-slate-800/90 px-1 relative overflow-hidden rounded shadow-inner">
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-sm animate-bounce" style={{ animationDuration: '0.9s' }} />
                  <div className="text-[6.5px] font-mono text-zinc-350 tracking-normal leading-none font-bold">WAN BACKBONE</div>
                  <div className="w-2.5 h-2 bg-rose-400 rounded-sm animate-bounce" style={{ animationDuration: '1.4s' }} />
                </div>
              </div>

              {/* Landmark 4: Bairro do Gerenciamento (.mgmt) com servidores e painéis */}
              <div className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none" style={{ left: 495, top: 150 }}>
                <div className="bg-fuchsia-900 text-fuchsia-200 border border-fuchsia-750 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm tracking-wider mb-1 z-20">
                  🎛️ GERÊNCIA .MGMT
                </div>
                <div className="w-12 h-9 bg-slate-850 border border-slate-950 rounded flex flex-col justify-around p-1 shadow-md relative">
                  <div className="flex justify-between w-full px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  </div>
                  <div className="w-full h-[3px] bg-slate-950 rounded" />
                  <div className="flex justify-between w-full px-1">
                    <span className="h-0.5 w-3.5 bg-rose-500 rounded" />
                    <span className="h-0.5 w-3.5 bg-emerald-400 rounded" />
                  </div>
                </div>
              </div>

              {/* Landmark 5: Rua do Monitoramento Padrão (.mib-2) com equipamentos de controle */}
              <div className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none" style={{ left: 605, top: 190 }}>
                <div className="bg-pink-900 text-pink-200 border border-pink-750 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm tracking-wider mb-1 z-20">
                  🏁 RUA .MIB-2
                </div>
                <div className="flex flex-col items-center justify-end h-9">
                  <div className="w-10 h-6 bg-rose-100 border border-rose-300 rounded shadow-sm text-[8px] font-mono p-0.5 text-rose-700 flex flex-col justify-center gap-0.5">
                    <div className="flex justify-between text-[5.5px] leading-none text-rose-500">
                      <span>IFIN: 13k</span>
                      <span>IFOUT: 10k</span>
                    </div>
                    <div className="w-full h-1 bg-emerald-500 rounded-sm overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-2/3 h-full bg-emerald-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="w-1 h-3.5 bg-slate-400" />
                </div>
              </div>

              {/* Landmark 6: Prédio da Prefeitura (system) com torre de relógio */}
              <div className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none" style={{ left: 495, top: 270 }}>
                <div className="bg-rose-900 text-rose-200 border border-rose-750 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm tracking-wider mb-1 z-20">
                  🏛️ PREFEITURA: .SYSTEM
                </div>
                <div className="relative w-14 h-15 bg-stone-100 border-2 border-stone-800 rounded shadow-md flex flex-col justify-between">
                  {/* Clock Spires Tower */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-6 h-8 bg-stone-200 border border-stone-800 rounded-t-md flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-white border border-stone-800 flex items-center justify-center mt-1 relative">
                       {/* Hour hands */}
                      <div className="w-1.5 h-1.5 rounded-full border border-red-500 relative flex items-center justify-center">
                        <div className="absolute w-[0.5px] h-1 bg-slate-900 rotate-45 transform origin-bottom" />
                      </div>
                    </div>
                  </div>
                  <div className="h-4.5 bg-stone-850 text-white flex items-center justify-center text-[7px] font-bold font-mono tracking-widest leading-none border-b border-stone-700">
                    MUNICIPAL
                  </div>
                  <div className="flex justify-around items-end grow p-1">
                    <div className="w-2.5 h-4.5 border border-stone-400 rounded-t" />
                    <div className="w-4 h-6 border border-stone-850 bg-stone-900/10 rounded-t flex items-center justify-center">
                      <span className="text-[6px]">🚪</span>
                    </div>
                    <div className="w-2.5 h-4.5 border border-stone-400 rounded-t" />
                  </div>
                </div>
              </div>

              {/* Landmark 7: Prateleira de Arquivos (sysDescr) com estantes de pastas */}
              <div className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none" style={{ left: 320, top: 290 }}>
                <div className="bg-amber-900 text-amber-200 border border-amber-700 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm tracking-wider mb-1 z-20">
                  📚 ESTANTE .SYSDESCR
                </div>
                <div className="w-12 h-9 bg-amber-50 border border-amber-800 rounded shadow-md flex flex-col justify-around p-0.5">
                  <div className="h-3.5 w-full bg-amber-200/50 flex gap-0.5 px-0.5 border border-amber-300 rounded-sm">
                    <div className="w-1.5 h-2.5 bg-rose-500 border border-rose-600 rounded-sm shrink-0" />
                    <div className="w-1.5 h-2.5 bg-indigo-500 border border-indigo-600 rounded-sm shrink-0" />
                    <div className="w-1.5 h-2.5 bg-emerald-500 border border-emerald-600 rounded-sm shrink-0" />
                  </div>
                  <div className="h-3.5 w-full bg-amber-200/50 flex gap-0.5 px-0.5 border border-amber-300 rounded-sm">
                    <div className="w-1.5 h-2.5 bg-blue-500 border border-blue-600 rounded-sm shrink-0" />
                    <div className="w-1.5 h-2.5 bg-yellow-500 border border-yellow-600 rounded-sm shrink-0" />
                    <div className="w-1.5 h-2.5 bg-stone-500 border border-stone-600 rounded-sm shrink-0" />
                  </div>
                </div>
              </div>

              {/* Landmark 8: Gaveta 0 aberta com documento dentro */}
              <div className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none" style={{ left: 110, top: 300 }}>
                <div className="bg-orange-900 text-orange-200 border border-orange-750 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm tracking-wider mb-1 z-20">
                  📂 GAVETA .0 (ABERTA!)
                </div>
                <div className="relative w-12 h-9">
                  {/* Pull-out drawer box */}
                  <div className="absolute inset-0 bg-stone-700 border border-stone-850 rounded shadow-md flex items-center justify-center">
                    <div className="w-8 h-2.5 bg-stone-900/10 border border-stone-500 rounded-sm shadow-inner relative flex justify-center">
                      <div className="w-2 h-1 bg-stone-400 rounded-full mt-0.5" />
                    </div>
                  </div>
                  {/* Glowing document file popping out */}
                  <div className="absolute top-[-11px] left-[15%] w-9 h-7 bg-amber-50 border border-amber-350 rounded shadow-md flex flex-col justify-between p-0.5 rotate-[5deg] animate-pulse">
                    <span className="text-[3px] font-mono text-stone-800 leading-none font-bold">sysDescr.0</span>
                    <div className="h-1 w-full bg-sky-500/30 rounded-full" />
                    <span className="text-[3px] font-sans text-emerald-600 font-extrabold overflow-hidden truncate">"OS Linux v5"</span>
                  </div>
                </div>
              </div>

              {/* ROAD LINK NUMBERED GPS BADGES (1 to 8, highlighted if active) */}
              {[
                { left: 110, top: 65, num: '1', active: activeIndices.includes(1), stepIdx: 1 },
                { left: 220, top: 65, num: '2', active: activeIndices.includes(2), stepIdx: 2 },
                { left: 330, top: 90, num: '3', active: activeIndices.includes(3), stepIdx: 3 },
                { left: 440, top: 130, num: '4', active: activeIndices.includes(4), stepIdx: 4 },
                { left: 550, top: 170, num: '5', active: activeIndices.includes(5), stepIdx: 5 },
                { left: 550, top: 230, num: '6', active: activeIndices.includes(6), stepIdx: 6 },
                { left: 408, top: 280, num: '7', active: activeIndices.includes(7), stepIdx: 7 },
                { left: 215, top: 295, num: '8', active: activeIndices.includes(8), stepIdx: 8 },
              ].map(({ left, top, num, active, stepIdx }) => (
                <button
                  key={`gps-badge-${stepIdx}-${num}`}
                  onClick={() => setSelectedCityStep(stepIdx)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-[9px] font-mono border shadow-md transition-all duration-300 z-30 cursor-pointer ${
                    active 
                      ? 'bg-amber-400 border-amber-600 text-slate-950 scale-110 shadow-amber-300 ring-2 ring-amber-300/40 animate-pulse' 
                      : 'bg-slate-200 border-slate-350 text-slate-500 opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                  title={`Passo de Rota GPS Num. ${num}`}
                >
                  {num}
                </button>
              ))}

              {/* CADASTRAL INTERACTIVE LANDMARK PINS overlaying the coordinate grid */}
              {citySteps.map((step, stepIdx) => {
                const isSelected = selectedCityStep === stepIdx;
                const isPassed = activeIndices.includes(stepIdx);
                
                return (
                  <div 
                    key={`pin-${step.oid}`}
                    style={{ left: step.mapX, top: step.mapY }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-40 group"
                  >
                    {/* Pulsing beacon behind selected pin */}
                    {isSelected && (
                      <span className="absolute inset-[-14px] rounded-full bg-blue-400/30 animate-ping pointer-events-none duration-1000" />
                    )}

                    <button
                      onClick={() => setSelectedCityStep(stepIdx)}
                      className={`relative h-11 w-11 rounded-xl flex items-center justify-center border-2 transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-800 text-white shadow-lg scale-115 ring-4 ring-blue-400/30' 
                          : isPassed 
                            ? 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-600 hover:scale-105' 
                            : 'bg-white border-slate-400 text-slate-500 hover:bg-slate-100 hover:border-slate-600'
                      }`}
                    >
                      {/* Node Icon */}
                      {(() => {
                        switch (step.icon) {
                          case 'Compass': return <Compass className="h-4.5 w-4.5" />;
                          case 'Map': return <Map className="h-4.5 w-4.5" />;
                          case 'Navigation': return <Navigation className="h-4.5 w-4.5" />;
                          case 'Network': return <Network className="h-4.5 w-4.5" />;
                          case 'Building': return <Building className="h-4.5 w-4.5" />;
                          case 'Layers': return <Layers className="h-4.5 w-4.5" />;
                          case 'Home': return <Home className="h-4.5 w-4.5" />;
                          case 'Cpu': return <Cpu className="h-4.5 w-4.5" />;
                          case 'MapPin': return <MapPin className={`h-4.5 w-4.5 ${isSelected ? 'animate-bounce text-amber-250' : ''}`} />;
                          default: return <HelpCircle className="h-4.5 w-4.5" />;
                        }
                      })()}

                      {/* Small floating sub-OID value badge */}
                      <span className={`absolute -bottom-2 -right-1.5 h-5 w-5 font-mono text-[9px] font-bold rounded-md flex items-center justify-center border ${
                        isSelected 
                          ? 'bg-amber-400 border-amber-600 text-slate-950 shadow-sm' 
                          : isPassed 
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-800' 
                            : 'bg-slate-200 border-slate-350 text-slate-600'
                      }`}>
                        .{step.num}
                      </span>
                    </button>
                    
                    {/* Node floating tooltips */}
                    <div className="absolute top-[48px] left-[50%] -translate-x-[50%] bg-stone-900/90 text-[8.5px] font-bold text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-[50]">
                      {step.name} {step.oid}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* MOBILE PORTRAIT VERTICAL MAP (Centered, responsive width max-w-[280px]-320px) */}
          <div className="block lg:hidden w-full max-w-[305px] aspect-square mx-auto rounded-2xl border border-slate-200/80 bg-gradient-to-b from-emerald-50/20 to-teal-50/10 p-2 shadow-inner relative z-10 overflow-y-auto overflow-x-hidden touch-pan-y" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            {/* Floating Instruction */}
            <div className="bg-white/95 border border-emerald-300 rounded px-2 py-1 text-[9px] font-bold text-emerald-800 text-center sticky top-0 z-30 shadow-sm leading-tight">
              📍 Arraste para baixo para explorar a rota (.1 a .0)
            </div>

            <div className="w-[240px] h-[860px] relative select-none mx-auto shrink-0 mt-3">
              {/* Vertical road SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2050/svg">
                <line x1="50%" y1="30" x2="50%" y2="810" stroke="#e2e8f0" strokeWidth="24" strokeLinecap="round" />
                <line x1="50%" y1="30" x2="50%" y2="810" stroke="#475569" strokeWidth="18" strokeLinecap="round" />
                <line x1="50%" y1="30" x2="50%" y2="810" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" strokeLinecap="round" />

                {/* Gold highlighted paths for visited segments */}
                {Array.from({ length: 8 }).map((_, segmentIdx) => {
                  const isSegmentActive = activeIndices.includes(segmentIdx + 1);
                  const startY = 45 + segmentIdx * 90;
                  const endY = 45 + (segmentIdx + 1) * 90;
                  return (
                    <line
                      key={`mobile-seg-${segmentIdx}`}
                      x1="50%"
                      y1={startY}
                      x2="50%"
                      y2={endY}
                      stroke={isSegmentActive ? "#f59e0b" : "#94a3b8"}
                      strokeWidth={isSegmentActive ? "5" : "1.5"}
                      strokeDasharray={isSegmentActive ? "3 3" : "none"}
                      className={isSegmentActive ? "animate-pulse" : ""}
                      opacity={isSegmentActive ? "1" : "0.2"}
                    />
                  );
                })}
              </svg>

              {/* GPS Route Milestones in mobile */}
              {[
                { top: 90, num: '1', active: activeIndices.includes(1), stepIdx: 1 },
                { top: 180, num: '2', active: activeIndices.includes(2), stepIdx: 2 },
                { top: 270, num: '3', active: activeIndices.includes(3), stepIdx: 3 },
                { top: 360, num: '4', active: activeIndices.includes(4), stepIdx: 4 },
                { top: 450, num: '5', active: activeIndices.includes(5), stepIdx: 5 },
                { top: 540, num: '6', active: activeIndices.includes(6), stepIdx: 6 },
                { top: 630, num: '7', active: activeIndices.includes(7), stepIdx: 7 },
                { top: 720, num: '8', active: activeIndices.includes(8), stepIdx: 8 },
              ].map(({ top, num, active, stepIdx }) => (
                <button
                  key={`gps-badge-mobile-${stepIdx}`}
                  onClick={() => setSelectedCityStep(stepIdx)}
                  className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-[8.5px] font-mono border shadow-md transition-all duration-300 z-30 cursor-pointer ${
                    active 
                      ? 'bg-amber-400 border-amber-600 text-slate-950 scale-110 shadow-amber-300 ring-2 ring-amber-300/40' 
                      : 'bg-slate-200 border-slate-350 text-slate-500 opacity-60 hover:opacity-100'
                  }`}
                >
                  {num}
                </button>
              ))}

              {/* City Landmarks Overlay for Mobile Map */}
              {citySteps.map((step, idx) => {
                const isSelected = selectedCityStep === idx;
                const isPassed = activeIndices.includes(idx);
                const yPos = 45 + idx * 90;
                const isLeft = idx % 2 === 0;

                return (
                  <div 
                    key={`mobile-pin-wrapper-${step.oid}`}
                    style={{ top: yPos }}
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center animate-fade-in"
                  >
                    {/* Pulsing beacon behind selected pin */}
                    {isSelected && (
                      <span className="absolute h-10 w-10 rounded-full bg-blue-400/35 animate-ping pointer-events-none" />
                    )}

                    <button
                      onClick={() => setSelectedCityStep(idx)}
                      className={`relative h-9 w-9 rounded-xl flex items-center justify-center border-2 transition-all duration-200 cursor-pointer h-9 w-9 ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-800 text-white shadow-md scale-110 ring-2 ring-blue-400/20' 
                          : isPassed 
                            ? 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-600' 
                            : 'bg-white border-slate-400 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {(() => {
                        switch (step.icon) {
                          case 'Compass': return <Compass className="h-4 w-4" />;
                          case 'Map': return <Map className="h-4 w-4" />;
                          case 'Navigation': return <Navigation className="h-4 w-4" />;
                          case 'Network': return <Network className="h-4 w-4" />;
                          case 'Building': return <Building className="h-4 w-4" />;
                          case 'Layers': return <Layers className="h-4 w-4" />;
                          case 'Home': return <Home className="h-4 w-4" />;
                          case 'Cpu': return <Cpu className="h-4 w-4" />;
                          case 'MapPin': return <MapPin className={`h-4 w-4 ${isSelected ? 'animate-bounce' : ''}`} />;
                          default: return <HelpCircle className="h-4 w-4" />;
                        }
                      })()}

                      {/* Floating badge */}
                      <span className={`absolute -bottom-1.5 -right-1.5 h-4 w-4 font-mono text-[8.5px] font-bold rounded flex items-center justify-center border ${
                        isSelected 
                          ? 'bg-amber-400 border-amber-600 text-slate-950' 
                          : isPassed 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                            : 'bg-slate-200 border-slate-350 text-slate-600'
                      }`}>
                        .{step.num}
                      </span>
                    </button>

                    {/* Beautiful labels positioned nicely beside the nodes - strict max-width to avoid overflow */}
                    <div 
                      className={`absolute text-[8px] font-bold bg-stone-900/95 text-white py-0.5 px-1.5 rounded-md shadow-sm pointer-events-none tracking-tight max-w-[72px] truncate whitespace-nowrap ${
                        isLeft 
                          ? 'right-10 text-right' 
                          : 'left-10 text-left'
                      }`}
                      title={step.name}
                    >
                      {step.name.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
                </>
              ) : (
                /* Steps Timeline (Vertical List with responsive size) */
                <div className="space-y-4 max-h-[410px] min-h-[410px] overflow-y-auto pr-1 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    {citySteps.map((step, idx) => {
                      const isSelected = selectedCityStep === idx;
                      const isVisited = activeIndices.includes(idx);
                      return (
                        <button
                          key={step.oid}
                          onClick={() => setSelectedCityStep(idx)}
                          className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-700'
                          }`}
                        >
                          {/* Circle step number indicator */}
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                            isSelected 
                              ? 'bg-white text-blue-700' 
                              : isVisited 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                : 'bg-slate-100 text-slate-400'
                          }`}>
                            .{step.num}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-mono text-xs font-bold truncate">
                                {step.name}
                              </span>
                              <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                isSelected 
                                  ? 'bg-blue-500 text-white' 
                                  : isVisited
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500'
                              }`}>
                                {idx + 1}º Marco
                              </span>
                            </div>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {step.role}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right column: GPS Tracker + Simulated Live GPS Monitor details */}
            <div className="lg:col-span-4 flex flex-col gap-4 w-full min-w-0 overflow-hidden">
              
              {/* OID Visual Tracer */}
              <div className="bg-slate-950 text-slate-100 font-mono text-[10px] sm:text-[11px] px-3 py-2 rounded-lg flex flex-col items-start gap-1 border border-slate-800 shadow-inner w-full min-w-0 overflow-hidden">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[8px] shrink-0">Rastro de Rota GPS (O.I.D):</span>
                <span className="tracking-wide text-emerald-350 flex flex-wrap items-center gap-0.5 break-all max-w-full">
                  {activeIndices.map((stepIdx, idx) => {
                    const step = citySteps[stepIdx];
                    return (
                      <span 
                        key={step.oid} 
                        className="text-emerald-300 font-bold transition-all duration-200"
                      >
                        {idx === 0 ? '' : '.'}
                        <span className={`inline-block px-0.5 rounded transition-all ${
                          stepIdx === selectedCityStep ? 'bg-emerald-900 text-emerald-200 outline outline-1 outline-emerald-400/50 scale-105 px-1' : ''
                        }`}>
                          {step.num}
                        </span>
                      </span>
                    );
                  })}
                </span>
              </div>

              {/* Simulated Live GPS Monitor details on the selected path element */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 w-full min-w-0 overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${citySteps[selectedCityStep].color} text-white shadow-sm shrink-0`}>
                    {(() => {
                      switch (citySteps[selectedCityStep].icon) {
                        case 'Compass': return <Compass className="h-4 w-4" />;
                        case 'Map': return <Map className="h-4 w-4" />;
                        case 'Navigation': return <Navigation className="h-4 w-4" />;
                        case 'Network': return <Network className="h-4 w-4" />;
                        case 'Building': return <Building className="h-4 w-4" />;
                        case 'Layers': return <Layers className="h-4 w-4" />;
                        case 'Home': return <Home className="h-4 w-4" />;
                        case 'Cpu': return <Cpu className="h-4 w-4" />;
                        case 'MapPin': return <MapPin className="h-4 w-4 animate-bounce text-emerald-100" />;
                        default: return <HelpCircle className="h-4 w-4" />;
                      }
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Marcador Urbano</span>
                    <h5 className="font-bold text-slate-800 text-xs leading-none truncate">
                      {citySteps[selectedCityStep].role}
                    </h5>
                  </div>
                </div>

                <div className="border-t border-slate-150 pt-2 space-y-1.5">
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded border border-slate-100 font-mono text-[10px] gap-2">
                    <span className="text-slate-400 shrink-0">Rótulo (Nome):</span>
                    <span className="font-semibold text-slate-700 truncate">{citySteps[selectedCityStep].name}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded border border-slate-100 font-mono text-[10px] gap-2">
                    <span className="text-slate-400 shrink-0">Sub-Identificador:</span>
                    <span className="font-bold text-blue-600 shrink-0">.{citySteps[selectedCityStep].num}</span>
                  </div>

                  <div className="flex flex-col gap-0.5 bg-slate-50 px-2 py-1.5 bg-slate-50/50 rounded border border-slate-100 font-mono text-[10px] min-w-0 w-full overflow-hidden">
                    <span className="text-slate-400 shrink-0">Caminho acumulado:</span>
                    <span className="font-bold text-emerald-600 break-all font-mono">
                      {activeIndices.map(idx => `.${citySteps[idx].num}`).join('')}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100 text-[11px] text-slate-600 leading-relaxed space-y-1">
                  <span className="font-semibold text-blue-900 block text-[9px] uppercase tracking-wider">Significado na Cidade:</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{citySteps[selectedCityStep].detail}</p>
                </div>
              </div>

              {/* Action trigger info */}
              <div className="text-[9px] text-slate-400 text-center border-t border-slate-100 pt-2.5 flex flex-col gap-1 justify-center items-center w-full min-w-0 overflow-hidden">
                <span>Caminho de Navegação ({activeIndices.length} {activeIndices.length === 1 ? 'nó' : 'nós'}):</span>
                <code className="text-slate-600 font-bold bg-slate-100 px-1.5 py-1 rounded font-mono text-[8px] sm:text-[9px] break-all max-w-full text-center">
                  {activeIndices.map(idx => citySteps[idx].name).join('.')}
                </code>
              </div>
            </div>
          </div>
        </div>

      </div>
      </section>

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
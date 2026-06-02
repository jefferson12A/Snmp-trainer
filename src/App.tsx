/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Network, Play, BookOpen, Layers, Terminal, Server, Key, Shield,
  HelpCircle, Settings, Sliders, RefreshCw, Sparkles, X, ChevronRight, HelpCircle as HelpIcon
} from 'lucide-react';

import { INITIAL_DEVICES, SNMP_COMMANDS } from './data';
import { SNMPDevice } from './types';

// Importing sub-panels
import IntroductionPanel from './components/IntroductionPanel';
import MIBTreePanel from './components/MIBTreePanel';
import InteractiveSimulator from './components/InteractiveSimulator';

export default function App() {
  // Navigation Screens Scroll state for visual highlights
  const [activeSection, setActiveSection] = useState<'introduction' | 'architecture' | 'simulator'>('introduction');

  // Multi-panel state sync
  const [selectedCommandId, setSelectedCommandId] = useState<string>('snmpget');
  const [selectedOid, setSelectedOid] = useState<string>('.1.3.6.1.2.1.1.1.0');

  // Persisting virtual devices values in state
  const [devicesState, setDevicesState] = useState<SNMPDevice[]>(INITIAL_DEVICES);

  // UI Utilities states (modals, toasts)
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Asset URLs from original HTML source
  const networkImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuB40CDAe4ThEnsqxOBa_w7r9wM4LVyWq8Owrp7fGRkdUD70nRD1VtQDLJZfAJcesId6cYSZO-ZOcsE47_OJ5tbasCYFD0MFJb-W7t67S-od8aZ3XYpkrLQVm1tVGi7SoDbpIIYPySUdRE8Hq-FWDLBTUjwm61P2z5tuGOX2huzv4B9YTpP7eVHFcPJLkc3Zywslvi_OTXpVayFNf-sBJkkWYqaw9PJkR62w4CNUnO022Q7TTwaInNP_NuufD826p4-twRZwkL-CyfI";
  const userProfileImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuB4WrvL76ZyT00DCQD1boauXFvBZnc7aayK-XpbAs00EvIFKjpcmR--riAnkltyKdqCgEyorYJ2gPE9yhhUxVibb3pdbIn3hVXSacKP2BBpYiHptVFjmWrDf-wkrlcnU1Y9jvsdDL9mCmTGLe37IppwtQFovbcxTFgDulwZ7uZsNRI4-F8Q2rwgi7hk-VE2bPb_9s5T3BQTm-Lf4l3kcmwhOdN46p0J3S6AreqK6h4To-loG4i31GRiLDrY9Pi6fRl9FFNTPYPEuqY";

  // Smooth Scroll Helper
  const scrollToSection = (id: string, sectionKey: 'introduction' | 'architecture' | 'simulator') => {
    setActiveSection(sectionKey);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Sidebar command click redirect with scroll down to simulator button
  const handleSidebarCommandClick = (cmdId: string) => {
    setSelectedCommandId(cmdId);
    const cmd = SNMP_COMMANDS.find(c => c.id === cmdId);
    if (cmd) {
      setSelectedOid(cmd.suggestedOid);
    }
    setActiveSection('simulator');
    setTimeout(() => {
      const executeBtn = document.getElementById('btn-execute-simulation');
      if (executeBtn) {
        executeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        scrollToSection('section-simulator', 'simulator');
      }
    }, 100);
  };

  // MIB Browser load trigger with scroll down to simulator button
  const handleOidLoadInSimulator = (oid: string, commandType?: string) => {
    setSelectedOid(oid);
    if (commandType) {
      setSelectedCommandId(commandType);
    }
    setActiveSection('simulator');
    setTimeout(() => {
      const executeBtn = document.getElementById('btn-execute-simulation');
      if (executeBtn) {
        executeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        scrollToSection('section-simulator', 'simulator');
      }
    }, 100);
  };

  // Device mutations (persistence in current session)
  const handleUpdateDeviceContact = (ip: string, contact: string) => {
    setDevicesState(prev => prev.map(d => d.ip === ip ? { ...d, sysContact: contact } : d));
  };

  const handleUpdateDeviceLocation = (ip: string, location: string) => {
    setDevicesState(prev => prev.map(d => d.ip === ip ? { ...d, sysLocation: location } : d));
  };

  const handleUpdateDeviceName = (ip: string, hostName: string) => {
    setDevicesState(prev => prev.map(d => d.ip === ip ? { ...d, sysName: hostName } : d));
  };

  // Reset all state to defaults
  const handleResetApplication = () => {
    setDevicesState(INITIAL_DEVICES);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-slate-800 antialiased">
      
      {/* Top Navigation Bar Component */}
      <header className="bg-white border-b border-slate-200/80 h-16 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 shadow-sm">
        <div 
          onClick={() => scrollToSection('section-introduction', 'introduction')}
          className="flex items-center gap-2 cursor-pointer group active:scale-[0.98] transition-all"
        >
          <div className="h-9 w-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:brightness-110 transition-all">
            <Network className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg text-blue-900 tracking-tight select-none">
            SNMP Trainer
          </span>
        </div>

        {/* Navigation scroll-shortcuts */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            id="nav-btn-introduction"
            onClick={() => scrollToSection('section-introduction', 'introduction')}
            className={`px-4 py-2 text-xs font-bold tracking-wide rounded-xl transition-all ${
              activeSection === 'introduction'
                ? 'bg-blue-50 text-blue-800 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            Apresentação
          </button>

          <button
            id="nav-btn-simulator"
            onClick={() => scrollToSection('section-simulator', 'simulator')}
            className={`px-4 py-2 text-xs font-bold tracking-wide rounded-xl transition-all ${
              activeSection === 'simulator'
                ? 'bg-blue-50 text-blue-800 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            Simulador Terminal
          </button>

          <button
            id="nav-btn-architecture"
            onClick={() => scrollToSection('section-architecture', 'architecture')}
            className={`px-4 py-2 text-xs font-bold tracking-wide rounded-xl transition-all ${
              activeSection === 'architecture'
                ? 'bg-blue-50 text-blue-800 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            Árvore MIB
          </button>
        </nav>

        {/* Action utility bar (right) */}
        <div className="flex items-center gap-3">
          <button
            id="header-btn-help"
            onClick={() => setShowHelp(true)}
            className="p-2 border border-slate-200/80 hover:bg-slate-50 rounded-xl transition-all text-slate-500 hover:text-blue-800"
            title="Cheat Sheet SNMP"
          >
            <HelpCircle className="h-4.5 w-4.5" />
          </button>

          <button
            id="header-btn-settings"
            onClick={() => setShowSettings(true)}
            className="p-2 border border-slate-200/80 hover:bg-slate-50 rounded-xl transition-all text-slate-500 hover:text-blue-800"
            title="Configurações de Simulação"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>

          {/* User profile avatar card */}
          <div className="h-9 w-9 rounded-full bg-slate-100 overflow-hidden border-2 border-slate-200/80 relative group select-all">
            <img
              src={userProfileImage}
              alt="Avatar do Usuário"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-col md:flex-row pt-16 flex-1 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Navigation scroll mobile view */}
        <div className="md:hidden bg-white border-b flex p-2 shrink-0 overflow-x-auto gap-1">
          <button
            onClick={() => scrollToSection('section-introduction', 'introduction')}
            className={`text-xs px-3 py-2 rounded-lg font-bold shrink-0 ${
              activeSection === 'introduction' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Apresentação
          </button>
          <button
            onClick={() => scrollToSection('section-simulator', 'simulator')}
            className={`text-xs px-3 py-2 rounded-lg font-bold shrink-0 ${
              activeSection === 'simulator' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Simulador
          </button>
          <button
            onClick={() => scrollToSection('section-architecture', 'architecture')}
            className={`text-xs px-3 py-2 rounded-lg font-bold shrink-0 ${
              activeSection === 'architecture' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Árvore MIB
          </button>
        </div>

        {/* Main content display pane - Single scrollable container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 h-full scroll-smooth">
          <div className="max-w-6xl mx-auto w-full pb-24 space-y-16">
            
            {/* Section 1: Intro */}
            <section id="section-introduction" className="scroll-mt-6">
              <IntroductionPanel
                onSelectCommand={handleSidebarCommandClick}
                networkImage={networkImage}
              />
            </section>

            {/* Divider line style */}
            <div className="h-px bg-slate-200" />

            {/* Section 2: Simulator */}
            <section id="section-simulator" className="scroll-mt-6">
              <InteractiveSimulator
                selectedCommandId={selectedCommandId}
                onSelectCommand={setSelectedCommandId}
                selectedOid={selectedOid}
                onOidChange={setSelectedOid}
                devices={devicesState}
                onUpdateDeviceContact={handleUpdateDeviceContact}
                onUpdateDeviceLocation={handleUpdateDeviceLocation}
                onUpdateDeviceName={handleUpdateDeviceName}
              />
            </section>

            {/* Divider line style */}
            <div className="h-px bg-slate-200" />

            {/* Section 3: MIB Tree Browser */}
            <section id="section-architecture" className="scroll-mt-6">
              <MIBTreePanel
                onLoadOid={handleOidLoadInSimulator}
              />
            </section>

          </div>
        </main>
      </div>

      {/* Modal Tool: Settings panel (Reset system to clean states) */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sliders className="h-4.5 w-4.5 text-blue-600" />
                  Painel de Configurações
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed space-y-3">
                <p>
                  Esta aplicação simula de forma isolada as modificações efetuadas via comandos SNMP.
                </p>
                <p>
                  Se você alterou hosts lógicos (sysName), contatos de suporte (sysContact) ou localizações físicas (sysLocation) e deseja resetar todos os dados, utilize o botão de reset abaixo.
                </p>
              </div>

              <button
                id="btn-reset-application-states"
                onClick={handleResetApplication}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="h-4 w-4" />
                Reiniciar Todos os Dados
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Tool: Cheat Sheet / Help overlay */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border p-6 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <HelpIcon className="h-4.5 w-4.5 text-blue-600" />
                  Guia Rápido & Cheat Sheet SNMP
                </h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto terminal-scroll pr-1 text-xs">
                
                {/* Ports */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border">
                  <h4 className="font-bold text-slate-900 leading-none">Portas e Protocolo UDP</h4>
                  <p className="text-slate-500 leading-relaxed">
                    O SNMP é implementado sob o protocolo rápido sem conexão UDP:
                  </p>
                  <ul className="list-disc leading-relaxed pl-4 text-slate-650 space-y-1 mt-1">
                    <li><strong>UDP Porta 161:</strong> Usada para Polling (Manager para Agente).</li>
                    <li><strong>UDP Porta 162:</strong> Usada para escuta de notificações espontâneas (Traps).</li>
                  </ul>
                </div>

                {/* Versions */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border">
                  <h4 className="font-bold text-slate-900 leading-none">Categorias de Segurança</h4>
                  <ul className="list-disc leading-relaxed pl-4 text-slate-650 space-y-1 mt-1">
                    <li><strong>v1 / v2c:</strong> Community String em texto puro na rede. Vulnerável a escuta (Wiretapping).</li>
                    <li><strong>v3 (USM):</strong> Adiciona segurança e confiabilidade criptográfica de alto nível:
                      <ul className="list-circle pl-4 space-y-0.5 mt-0.5">
                        <li><code>noAuthNoPriv:</code> Sem criptografia, apenas Usuário estrutural.</li>
                        <li><code>authNoPriv:</code> Autenticação por SHA/MD5 (Verifica autoria das mensagens).</li>
                        <li><code>authPriv:</code> Autenticação por SHA/MD5 com Criptografia AES/DES (Perfeita confidencialidade).</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                {/* RFC cheat sheet */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border font-mono text-[11px]">
                  <h4 className="font-bold text-slate-950 font-sans leading-none">OIDs Sistemáticos Padrão</h4>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <div>
                      <span className="text-slate-400 font-bold">.1.3.6.1.2.1.1.1.0</span> <br />
                      <span className="text-slate-700 font-semibold">sysDescr.0</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">.1.3.6.1.2.1.1.3.0</span> <br />
                      <span className="text-slate-700 font-semibold">sysUpTime.0</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">.1.3.6.1.2.1.1.4.0</span> <br />
                      <span className="text-slate-700 font-semibold">sysContact.0</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">.1.3.6.1.2.1.1.5.0</span> <br />
                      <span className="text-slate-700 font-semibold">sysName.0</span>
                    </div>
                  </div>
                </div>

              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Entendi, Fechar Guia
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Soft Footer Bar */}
      <footer className="bg-slate-100 border-t border-slate-250 py-4 px-6 mt-auto text-center md:text-left">
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <div>© 2026 Network Academy - SNMP Learning Trainer System</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-750 transition-colors">Documentação</a>
            <a href="https://datatracker.ietf.org/doc/html/rfc1157" target="_blank" rel="noreferrer" className="hover:text-blue-750 transition-colors">RFC 1157</a>
            <a href="#" className="hover:text-blue-750 transition-colors">Estrutura das MIBs</a>
            <a href="#" className="hover:text-blue-750 transition-colors">Manual de Segurança</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

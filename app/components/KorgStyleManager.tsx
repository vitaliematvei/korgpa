'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  KORG_SET_DATA,
  KORG_PERFORMANCE_DATA,
  KORG_PAD_DATA,
  KORG_SOUND_DATA,
  type KorgStyle,
  type KorgBank,
  type KorgPerformanceBank,
  type KorgPadBank,
  type KorgSoundBank,
} from '@/app/context/korgSet';

// Constants
const SLOTS_PER_COLUMN = 4;
const SLOTS_PER_PAGE = 8;
const DEFAULT_TOTAL_PAGES = 5;
const PAD_TOTAL_PAGES = 4;
const SOUND_TOTAL_PAGES = 16;
const SLOT_ROWS = Array.from({ length: SLOTS_PER_COLUMN }, (_, i) => i);
const TABS = ['STYLE', 'PERF', 'PAD', 'SOUND'] as const;
type ActiveTab = (typeof TABS)[number];
type SlotItem = KorgStyle | null;

const SLOT_CARD_CLASSES = {
  base: 'relative border p-6 flex flex-col justify-center items-center cursor-pointer group bg-linear-to-br shadow-md',
  filled:
    'from-[#3d3d3d] to-[#252525] border-black hover:bg-linear-to-b hover:from-transparent hover:to-white/30',
  empty: 'from-[#1f1f1f] to-[#181818] border-[#2a2a2a] opacity-70',
};

const SIDEBAR_BUTTON_CLASSES = {
  base: 'w-[105px] min-h-[43px] py-1.5 px-1 text-[11px] leading-tight text-center border-l-4 transition-all whitespace-normal break-words',
  active: 'bg-[#404040] border-orange-500 text-[#FF792C] shadow-lg',
  inactive: 'bg-[#1e1e1e] text-white hover:bg-[#333]',
};

type SidebarItem = {
  id: string;
  label: string;
  color: 'green' | 'red';
};

type KorgStyleManagerProps = {
  deviceModel: string;
  setData?: Record<string, KorgBank>;
  performanceData?: Record<string, KorgPerformanceBank>;
  soundData?: Record<string, KorgSoundBank>;
  initialBankId?: string;
  initialTab?: ActiveTab;
  wrapperClassName?: string;
  panelClassName?: string;
  padData?: Record<string, KorgPadBank>;
};

const getDefaultBankId = (
  setData: Record<string, KorgBank>,
  performanceData: Record<string, KorgPerformanceBank>,
  padData: Record<string, KorgPadBank>,
  soundData: Record<string, KorgSoundBank>,
) => {
  if (setData.FAVORITE01 || performanceData.FAVORITE01) {
    return 'FAVORITE01';
  }

  if (padData.USER01) {
    return 'USER01';
  }

  if (soundData.USER01) {
    return 'USER01';
  }

  const firstStyleBankId = Object.keys(setData)[0];
  if (firstStyleBankId) {
    return firstStyleBankId;
  }

  const firstPerfBankId = Object.keys(performanceData)[0];
  return firstPerfBankId ?? 'FAVORITE01';
};

const getDefaultPadBankId = (padData: Record<string, KorgPadBank>) => {
  return padData.USER01 ? 'USER01' : (Object.keys(padData)[0] ?? 'USER01');
};

const getDefaultSoundBankId = (soundData: Record<string, KorgSoundBank>) => {
  return soundData.USER01 ? 'USER01' : (Object.keys(soundData)[0] ?? 'USER01');
};

// SlotCard Component
const SlotCard = memo(
  ({
    style,
    slotNumber,
    deviceModel,
  }: {
    style?: KorgStyle;
    slotNumber: number;
    deviceModel: string;
  }) => (
    <div
      className={`${SLOT_CARD_CLASSES.base} ${style ? SLOT_CARD_CLASSES.filled : SLOT_CARD_CLASSES.empty}`}
    >
      <span className="absolute bottom-1 left-2 text-[10px] text-orange-500 ">
        {deviceModel}
      </span>
      <span className="absolute bottom-1 right-2 text-[10px] text-white">
        {slotNumber}
      </span>

      {style ? (
        <h3 className="text-[15px] font-sans font-semibold group-hover:text-white tracking-tight">
          {style.name}
        </h3>
      ) : (
        <span className="text-[16px] text-white tracking-wider">---</span>
      )}
    </div>
  ),
);

// SidebarButton Component
const SidebarButton = memo(
  ({
    bank,
    isActive,
    onSelect,
  }: {
    bank: SidebarItem;
    isActive: boolean;
    onSelect: () => void;
  }) => (
    <button
      onClick={onSelect}
      className={`${SIDEBAR_BUTTON_CLASSES.base} ${
        isActive
          ? SIDEBAR_BUTTON_CLASSES.active
          : `${SIDEBAR_BUTTON_CLASSES.inactive} border-${bank.color === 'red' ? 'red' : 'green'}-600`
      }`}
      aria-pressed={isActive}
    >
      {bank.label}
    </button>
  ),
);

// SlotColumn Component
const SlotColumn = memo(
  ({
    startIndex,
    displayStyles,
    currentPage,
    deviceModel,
  }: {
    startIndex: number;
    displayStyles: SlotItem[];
    currentPage: number;
    deviceModel: string;
  }) => (
    <div className="flex flex-col gap-3 flex-1">
      {SLOT_ROWS.map((i) => {
        const style = displayStyles[startIndex + i];
        const slotNumber = currentPage * SLOTS_PER_PAGE + startIndex + i + 1;
        return (
          <SlotCard
            key={slotNumber}
            style={style ?? undefined}
            slotNumber={slotNumber}
            deviceModel={deviceModel}
          />
        );
      })}
    </div>
  ),
);

const TopBar = memo(
  ({
    activeTab,
    activeBankId,
    searchQuery,
    onTabChange,
    onSearchChange,
  }: {
    activeTab: ActiveTab;
    activeBankId: string;
    searchQuery: string;
    onTabChange: (tab: ActiveTab, activeBankId: string) => void;
    onSearchChange: (value: string) => void;
  }) => (
    <div className="flex bg-[#1a1a1a] border-b border-black shrink-0">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab, activeBankId)}
          className={`px-3 md:px-5 py-2 md:py-3 text-[12px] md:text-[14px] font-black tracking-tighter cursor-pointer border-r border-black/50 ${
            tab === activeTab
              ? 'bg-linear-to-b from-orange-400 to-orange-600 text-black shadow-inner'
              : 'text-slate-500 hover:bg-[#252525]'
          }`}
          role="tab"
          aria-selected={tab === activeTab}
        >
          {tab}
        </button>
      ))}

      <div className="flex-1 flex justify-end items-center px-1 md:px-3">
        <div className="relative group w-24 md:w-40 lg:w-50">
          <label htmlFor="search-style" className="sr-only">
            {activeTab === 'PERF'
              ? 'Search Performance'
              : activeTab === 'PAD'
                ? 'Search Pad'
                : activeTab === 'SOUND'
                  ? 'Search Sound'
                  : 'Search Style'}
          </label>
          <input
            id="search-style"
            type="text"
            placeholder={
              activeTab === 'PERF'
                ? 'Search performance...'
                : activeTab === 'PAD'
                  ? 'Search pad...'
                  : activeTab === 'SOUND'
                    ? 'Search sound...'
                    : 'Search...'
            }
            className="bg-[#0f0f0f] border border-[#3d3d3d] rounded px-3 py-2 text-[13px] w-full focus:border-orange-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={
              activeTab === 'PERF'
                ? 'Search performances'
                : activeTab === 'PAD'
                  ? 'Search pads'
                  : activeTab === 'SOUND'
                    ? 'Search sounds'
                    : 'Search styles'
            }
          />
          <span className="absolute right-1 top-0.5 text-[13px] text-orange-500/50 group-focus-within:text-orange-500">
            🔍
          </span>
        </div>
      </div>
    </div>
  ),
);

const MobileBankSelector = memo(
  ({
    activeTab,
    activeBankId,
    leftSidebarBanks,
    rightSidebarBanks,
    onBankSelect,
  }: {
    activeTab: ActiveTab;
    activeBankId: string;
    leftSidebarBanks: SidebarItem[];
    rightSidebarBanks: SidebarItem[];
    onBankSelect: (bankId: string) => void;
  }) => (
    <div className="lg:hidden bg-[#1a1a1a] border-b border-black p-2 shrink-0">
      <label
        htmlFor="bank-selector"
        className="block text-[11px] text-slate-400 mb-1 uppercase tracking-wide"
      >
        Select{' '}
        {activeTab === 'PAD'
          ? 'Pad Bank'
          : activeTab === 'PERF'
            ? 'Performance Bank'
            : activeTab === 'SOUND'
              ? 'Sound Bank'
              : 'Favorite'}
      </label>
      <select
        id="bank-selector"
        value={activeBankId}
        onChange={(e) => onBankSelect(e.target.value)}
        className="w-full bg-[#2a2a2a] border-2 border-orange-500/50 text-white px-3 py-2.5 text-[14px] font-semibold rounded focus:border-orange-500 outline-none cursor-pointer"
      >
        <optgroup
          label={
            activeTab === 'PAD'
              ? '━━━ USER 01-05 ━━━'
              : activeTab === 'PERF'
                ? '━━━ PERF 01-08 ━━━'
                : activeTab === 'SOUND'
                  ? '━━━ USER 01-03 ━━━'
                  : '━━━ FAVORITES ━━━'
          }
          className="bg-[#1a1a1a] font-bold"
        >
          {leftSidebarBanks.map((bank) => (
            <option key={bank.id} value={bank.id} className="bg-[#2a2a2a] py-2">
              {bank.label}
            </option>
          ))}
        </optgroup>
        <optgroup
          label={
            activeTab === 'PAD'
              ? '━━━ USER 06-10 ━━━'
              : activeTab === 'PERF'
                ? '━━━ PERF 09-16 ━━━'
                : activeTab === 'SOUND'
                  ? '━━━ USER 04-06 ━━━'
                  : '━━━ FAVORITES & USER ━━━'
          }
          className="bg-[#1a1a1a] font-bold"
        >
          {rightSidebarBanks.map((bank) => (
            <option key={bank.id} value={bank.id} className="bg-[#2a2a2a] py-2">
              {bank.label}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  ),
);

const SidebarColumn = memo(
  ({
    banks,
    activeBankId,
    onBankSelect,
  }: {
    banks: SidebarItem[];
    activeBankId: string;
    onBankSelect: (bankId: string) => void;
  }) => (
    <div className="hidden lg:flex flex-col gap-1 w-31.25 overflow-y-auto shrink-0">
      {banks.map((bank) => (
        <SidebarButton
          key={bank.id}
          bank={bank}
          isActive={activeBankId === bank.id}
          onSelect={() => onBankSelect(bank.id)}
        />
      ))}
    </div>
  ),
);

const CenterGrid = memo(
  ({
    activeTab,
    activeBankId,
    displayStyles,
    currentPage,
    totalPages,
    onPageChange,
    deviceModel,
  }: {
    activeTab: ActiveTab;
    activeBankId: string;
    displayStyles: SlotItem[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    deviceModel: string;
  }) => (
    <div
      key={`${activeTab}-${activeBankId}`}
      className="flex-1 flex flex-col overflow-auto"
    >
      <div className="flex gap-2 flex-1 overflow-hidden">
        <SlotColumn
          startIndex={0}
          displayStyles={displayStyles}
          currentPage={currentPage}
          deviceModel={deviceModel}
        />
        <SlotColumn
          startIndex={SLOTS_PER_COLUMN}
          displayStyles={displayStyles}
          currentPage={currentPage}
          deviceModel={deviceModel}
        />
      </div>

      <div className="bg-[#1a1a1a] p-1 md:p-2 flex flex-wrap justify-center gap-1 md:gap-2 border border-black shrink-0">
        {activeTab === 'SOUND' ? (
          <>
            {/* Display 4 page buttons starting from current page */}
            {[...Array(Math.min(4, totalPages))].map((_, idx) => {
              const pageNum = currentPage + idx;
              if (pageNum >= totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 md:px-6 py-2 md:py-3 text-[12px] md:text-[14px] font-black transition-all border border-black whitespace-nowrap ${
                    currentPage === pageNum
                      ? 'bg-linear-to-b from-transparent to-white/30 text-white shadow-[0_0_1px_rgba(249,115,22,0.6)]'
                      : 'bg-near-to-br from-[#333] to-[#222] text-slate-500 hover:bg-linear-to-b hover:from-transparent hover:to-white/30 hover:text-white'
                  }`}
                  aria-pressed={currentPage === pageNum}
                >
                  P{pageNum + 1}
                </button>
              );
            })}

            {/* Navigation arrows - on next line */}
            <div className="w-full flex justify-center gap-1 md:gap-2">
              <button
                onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`px-6 md:px-10 py-2 md:py-3 text-[12px] md:text-[14px] font-black transition-all border border-black whitespace-nowrap ${
                  currentPage === 0
                    ? 'bg-[#1a1a1a] text-slate-700 cursor-not-allowed'
                    : 'bg-near-to-br from-[#333] to-[#222] text-slate-500 hover:bg-linear-to-b hover:from-transparent hover:to-white/30 hover:text-white'
                }`}
                aria-label="Previous page"
              >
                ◀
              </button>
              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                className={`px-6 md:px-10 py-2 md:py-3 text-[12px] md:text-[14px] font-black transition-all border border-black whitespace-nowrap ${
                  currentPage === totalPages - 1
                    ? 'bg-[#1a1a1a] text-slate-700 cursor-not-allowed'
                    : 'bg-near-to-br from-[#333] to-[#222] text-slate-500 hover:bg-linear-to-b hover:from-transparent hover:to-white/30 hover:text-white'
                }`}
                aria-label="Next page"
              >
                ▶
              </button>
            </div>
          </>
        ) : (
          // Default pagination for other tabs
          [...Array(totalPages)].map((_, p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 md:px-6 py-2 md:py-3 text-[12px] md:text-[14px] font-black transition-all border border-black whitespace-nowrap ${
                currentPage === p
                  ? 'bg-linear-to-b from-transparent to-white/30 text-white shadow-[0_0_1px_rgba(249,115,22,0.6)]'
                  : 'bg-near-to-br from-[#333] to-[#222] text-slate-500 hover:bg-linear-to-b hover:from-transparent hover:to-white/30 hover:text-white'
              }`}
              aria-pressed={currentPage === p}
            >
              P{p + 1}
            </button>
          ))
        )}
      </div>
    </div>
  ),
);

const StatusBar = memo(
  ({ label, currentPage }: { label: string; currentPage: number }) => (
    <div className="bg-[#111] px-3 py-1.5 border-t border-black flex justify-between items-center text-[13px] shrink-0">
      <span className="text-slate-500 uppercase">{label}</span>
      <span className="text-slate-500">P{currentPage + 1}</span>
    </div>
  ),
);

export default function KorgStyleManager({
  deviceModel,
  setData = KORG_SET_DATA,
  performanceData = KORG_PERFORMANCE_DATA,
  soundData = KORG_SOUND_DATA,
  padData = KORG_PAD_DATA,
  initialBankId,
  initialTab = 'STYLE',
  wrapperClassName,
  panelClassName,
}: KorgStyleManagerProps) {
  const resolvedInitialBankId = useMemo(
    () =>
      initialBankId ??
      (initialTab === 'SOUND'
        ? getDefaultSoundBankId(soundData)
        : initialTab === 'PAD'
          ? getDefaultPadBankId(padData)
          : getDefaultBankId(setData, performanceData, padData, soundData)),
    [initialBankId, initialTab, padData, performanceData, setData, soundData],
  );

  const [activeBankId, setActiveBankId] = useState(resolvedInitialBankId);
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const currentStyleBank = setData[activeBankId] ??
    setData.FAVORITE01 ??
    Object.values(setData)[0] ?? {
      id: 'FAVORITE01',
      label: 'Favorite',
      color: 'green' as const,
      styles: [],
    };
  const currentPerfBank = performanceData[activeBankId];
  const currentPerfList = currentPerfBank?.items ?? [];
  const currentPadBank = padData[activeBankId];
  const currentPadList = currentPadBank?.items ?? [];
  const currentSoundBank = soundData[activeBankId];
  const currentSoundList = currentSoundBank?.items ?? [];

  // Memoized display items with filtering and pagination
  const displayStyles = useMemo(() => {
    let list: SlotItem[] =
      activeTab === 'PERF'
        ? currentPerfList
        : activeTab === 'PAD'
          ? currentPadList
          : activeTab === 'SOUND'
            ? currentSoundList
            : activeTab === 'STYLE'
              ? currentStyleBank.styles
              : [];

    if (searchQuery) {
      list = list.filter(
        (s): s is KorgStyle =>
          s !== null &&
          s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    const start = currentPage * SLOTS_PER_PAGE;
    return list.slice(start, start + SLOTS_PER_PAGE);
  }, [
    activeTab,
    currentPage,
    currentPadList,
    currentPerfList,
    currentSoundList,
    currentStyleBank,
    searchQuery,
  ]);

  const totalCurrentItems =
    activeTab === 'PERF'
      ? currentPerfList.length
      : activeTab === 'PAD'
        ? currentPadList.length
        : activeTab === 'SOUND'
          ? currentSoundList.filter((item) => item !== null).length
          : activeTab === 'STYLE'
            ? currentStyleBank.styles.length
            : 0;

  const handleBankSelect = useCallback((bankId: string) => {
    setActiveBankId(bankId);
    setCurrentPage(0);
    setSearchQuery('');
  }, []);

  const handleTabChange = useCallback(
    (tab: ActiveTab, bankId: string) => {
      setActiveTab(tab);
      if (tab === 'STYLE' && !setData[bankId]) {
        setActiveBankId(
          getDefaultBankId(setData, performanceData, padData, soundData),
        );
      }
      if (tab === 'PERF' && !performanceData[bankId]) {
        setActiveBankId(
          getDefaultBankId(setData, performanceData, padData, soundData),
        );
      }
      if (tab === 'PAD' && !padData[bankId]) {
        setActiveBankId(getDefaultPadBankId(padData));
      }
      if (tab === 'SOUND' && !soundData[bankId]) {
        setActiveBankId(getDefaultSoundBankId(soundData));
      }
      setCurrentPage(0);
      setSearchQuery('');
    },
    [padData, performanceData, setData, soundData],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const maxSlotsForActiveTab =
    (activeTab === 'SOUND'
      ? SOUND_TOTAL_PAGES
      : activeTab === 'PAD'
        ? PAD_TOTAL_PAGES
        : DEFAULT_TOTAL_PAGES) * SLOTS_PER_PAGE;

  const statusLabel =
    (activeTab === 'PERF'
      ? (currentPerfBank?.bankName ?? activeBankId)
      : activeTab === 'PAD'
        ? (currentPadBank?.bankName ?? activeBankId)
        : activeTab === 'SOUND'
          ? activeBankId === 'USER06'
            ? 'User DK'
            : `User ${parseInt(activeBankId.slice(-2), 10)}`
          : currentStyleBank.label) +
    ` • ${totalCurrentItems}/${maxSlotsForActiveTab} ${activeTab}`;

  const leftStyleSidebarBanks = useMemo(
    () =>
      Object.values(setData)
        .filter(
          (bank) =>
            bank.id.startsWith('FAVORITE') &&
            parseInt(bank.id.slice(-2), 10) <= 8,
        )
        .map((bank) => ({ id: bank.id, label: bank.label, color: bank.color })),
    [setData],
  );

  const rightStyleSidebarBanks = useMemo(
    () =>
      Object.values(setData)
        .filter(
          (bank) =>
            (bank.id.startsWith('FAVORITE') &&
              parseInt(bank.id.slice(-2), 10) >= 9) ||
            bank.id.startsWith('USER'),
        )
        .map((bank) => ({ id: bank.id, label: bank.label, color: bank.color })),
    [setData],
  );

  const performanceSidebarBanks = useMemo(
    () =>
      Object.entries(performanceData)
        .filter(([id]) => id.startsWith('FAVORITE'))
        .sort(
          (a, b) => parseInt(a[0].slice(-2), 10) - parseInt(b[0].slice(-2), 10),
        )
        .map(([id, perfBank]) => ({
          id,
          label: perfBank.bankName,
          color: 'green' as const,
        })),
    [performanceData],
  );

  const perfLeftSidebarBanks = useMemo(
    () => performanceSidebarBanks.slice(0, 8),
    [performanceSidebarBanks],
  );

  const perfRightSidebarBanks = useMemo(
    () => performanceSidebarBanks.slice(8, 16),
    [performanceSidebarBanks],
  );

  const padSidebarBanks = useMemo(
    () =>
      Object.entries(padData)
        .filter(([id]) => id.startsWith('USER'))
        .sort(
          (a, b) => parseInt(a[0].slice(-2), 10) - parseInt(b[0].slice(-2), 10),
        )
        .map(([id, bank]) => ({
          id,
          label: bank.bankName,
          color: 'red' as const,
        })),
    [padData],
  );

  const padLeftSidebarBanks = useMemo(
    () => padSidebarBanks.slice(0, 5),
    [padSidebarBanks],
  );

  const padRightSidebarBanks = useMemo(
    () => padSidebarBanks.slice(5, 10),
    [padSidebarBanks],
  );

  const soundSidebarBanks = useMemo(
    () =>
      Object.entries(soundData)
        .filter(([id]) => id.startsWith('USER'))
        .sort(
          (a, b) => parseInt(a[0].slice(-2), 10) - parseInt(b[0].slice(-2), 10),
        )
        .map(([id, _bank]) => {
          const label =
            id === 'USER06' ? 'User DK' : `User ${parseInt(id.slice(-2), 10)}`;
          return {
            id,
            label,
            color: 'red' as const,
          };
        }),
    [soundData],
  );

  const soundLeftSidebarBanks = useMemo(
    () => soundSidebarBanks.slice(0, 3),
    [soundSidebarBanks],
  );

  const soundRightSidebarBanks = useMemo(
    () => [soundSidebarBanks[3], soundSidebarBanks[5]],
    [soundSidebarBanks],
  );

  const leftSidebarBanks: SidebarItem[] =
    activeTab === 'PERF'
      ? perfLeftSidebarBanks
      : activeTab === 'PAD'
        ? padLeftSidebarBanks
        : activeTab === 'SOUND'
          ? soundLeftSidebarBanks
          : leftStyleSidebarBanks;

  const rightSidebarBanks: SidebarItem[] =
    activeTab === 'PERF'
      ? perfRightSidebarBanks
      : activeTab === 'PAD'
        ? padRightSidebarBanks
        : activeTab === 'SOUND'
          ? soundRightSidebarBanks
          : rightStyleSidebarBanks;

  const totalPages =
    activeTab === 'SOUND'
      ? SOUND_TOTAL_PAGES
      : activeTab === 'PAD'
        ? PAD_TOTAL_PAGES
        : DEFAULT_TOTAL_PAGES;

  return (
    <div
      className={`w-fit mx-auto bg-[#121212] p-2 md:p-4 flex items-center justify-center font-sans text-slate-200 ${wrapperClassName ?? ''}`}
    >
      <div
        className={`w-full max-w-[90vw] h-auto md:w-173 md:h-140 bg-[#2a2a2a] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-t-4 border-[#444] overflow-auto flex flex-col scale-[0.5] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.85] xl:scale-100 origin-center ${panelClassName ?? ''}`}
      >
        <TopBar
          activeTab={activeTab}
          activeBankId={activeBankId}
          searchQuery={searchQuery}
          onTabChange={handleTabChange}
          onSearchChange={handleSearchChange}
        />

        <MobileBankSelector
          activeTab={activeTab}
          activeBankId={activeBankId}
          leftSidebarBanks={leftSidebarBanks}
          rightSidebarBanks={rightSidebarBanks}
          onBankSelect={handleBankSelect}
        />

        <div className="flex flex-1 p-2 md:p-3 gap-1 md:gap-2 overflow-hidden">
          <SidebarColumn
            banks={leftSidebarBanks}
            activeBankId={activeBankId}
            onBankSelect={handleBankSelect}
          />

          <CenterGrid
            activeTab={activeTab}
            activeBankId={activeBankId}
            displayStyles={displayStyles}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            deviceModel={deviceModel}
          />

          <div className="hidden lg:flex flex-col gap-1 w-31.25 overflow-y-auto shrink-0">
            {rightSidebarBanks.map((bank) => (
              <SidebarButton
                key={bank.id}
                bank={bank}
                isActive={activeBankId === bank.id}
                onSelect={() => handleBankSelect(bank.id)}
              />
            ))}
            <div className="mt-auto p-2 bg-black/20 rounded border border-white/5 shrink-0">
              <p className="text-[10px] text-slate-500 leading-tight">
                mVI
                <br />
                v1.0
              </p>
            </div>
          </div>
        </div>

        <StatusBar label={statusLabel} currentPage={currentPage} />
      </div>
    </div>
  );
}

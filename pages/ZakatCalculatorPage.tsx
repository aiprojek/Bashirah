import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { showToast } from '../services/quranService';

const ZakatCalculatorPage: React.FC = () => {
  const { language } = useLanguage();

  const [zakatSubTab, setZakatSubTab] = useState<'maal' | 'fitrah'>('maal');
  const [goldPrice, setGoldPrice] = useState<number>(1450000); // Rp per gram

  // Zakat Maal Inputs
  const [cashSavings, setCashSavings] = useState<string>('50000000');
  const [goldAssets, setGoldAssets] = useState<string>('30000000');
  const [investments, setInvestments] = useState<string>('50000000');
  const [debtsDue, setDebtsDue] = useState<string>('5000000');

  // Zakat Fitrah Inputs
  const [familyMembers, setFamilyMembers] = useState<number>(4);
  const [ricePricePerKg, setRicePricePerKg] = useState<number>(16000);

  const [copiedZakat, setCopiedZakat] = useState(false);

  // Calculations
  const nisabMaalValue = useMemo(() => 85 * goldPrice, [goldPrice]);

  // 1. Zakat Maal (Nisab 85g Emas & Syarat Haul 1 Tahun)
  const totalHartaMaal = useMemo(() => {
    const cash = parseFloat(cashSavings) || 0;
    const gold = parseFloat(goldAssets) || 0;
    const inv = parseFloat(investments) || 0;
    const debt = parseFloat(debtsDue) || 0;
    return Math.max(0, cash + gold + inv - debt);
  }, [cashSavings, goldAssets, investments, debtsDue]);

  const isNisabMaalReached = totalHartaMaal >= nisabMaalValue;
  const zakatMaalDue = isNisabMaalReached ? Math.round(totalHartaMaal * 0.025) : 0;

  // 2. Zakat Fitrah
  const totalRiceKg = familyMembers * 2.5;
  const totalFitrahCash = familyMembers * 2.5 * ricePricePerKg;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopyZakatSummary = () => {
    let summary = '';
    if (zakatSubTab === 'maal') {
      summary = [
        '📋 RINCIAN ZAKAT MAAL (HARTA SIMPANAN)',
        `Total Harta Bersih: ${formatCurrency(totalHartaMaal)}`,
        `Nisab (85g Emas): ${formatCurrency(nisabMaalValue)}`,
        `Status Nisab: ${isNisabMaalReached ? 'Mencapai Nisab (Wajib Zakat jika telah mengendap 1 Haul)' : 'Belum Mencapai Nisab'}`,
        `Kewajiban Zakat (2.5%): ${formatCurrency(zakatMaalDue)}`,
        '',
        'Catatan: Zakat Maal wajib dikeluarkan jika harta mencapai nisab dan telah dimiliki genap 1 tahun (haul).',
        'Dihitung via Bashirah - Al-Qur\'an Digital',
      ].join('\n');
    } else {
      summary = [
        '📋 RINCIAN ZAKAT FITRAH',
        `Jumlah Jiwa: ${familyMembers} orang`,
        `Kewajiban Makanan Pokok: ${totalRiceKg} kg beras (2.5 kg / jiwa)`,
        `Setara Uang Tunai: ${formatCurrency(totalFitrahCash)} (@ ${formatCurrency(ricePricePerKg)}/kg)`,
        '',
        'Dihitung via Bashirah - Al-Qur\'an Digital',
      ].join('\n');
    }

    navigator.clipboard.writeText(summary);
    setCopiedZakat(true);
    showToast(
      language === 'en' ? 'Zakat summary copied!' : 'Ringkasan zakat berhasil disalin!',
      'success'
    );
    setTimeout(() => setCopiedZakat(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-28">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-500/20">
          <Calculator className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Islamic Wealth Purification' : 'Kewajiban Pensucian Harta'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-quran-dark dark:text-gray-100 mb-2">
          {language === 'en' ? 'Zakat Calculator' : 'Kalkulator Zakat'}
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm max-w-lg mx-auto">
          {language === 'en'
            ? 'Accurately calculate Zakat Maal (wealth & savings with 85g gold nisab & 1-year haul) and Zakat Fitrah according to Islamic jurisprudence.'
            : 'Hitung kewajiban Zakat Maal (harta simpanan/emas/tabungan dengan syarat nisab 85g & haul 1 tahun) dan Zakat Fitrah secara akurat sesuai syariat Islam.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Sub-tabs for Zakat Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'maal', label: 'Zakat Maal (Tabungan, Emas & Investasi)' },
            { id: 'fitrah', label: 'Zakat Fitrah (Jiwa / Makanan Pokok)' },
          ].map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setZakatSubTab(sub.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                zakatSubTab === sub.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-700'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        {/* Gold Price Config Bar */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <Coins className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Harga Emas Acuan Nisab (85g Emas Murni):</strong>{' '}
              {formatCurrency(goldPrice)} / gram
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-500 dark:text-stone-400 text-[11px]">Ubah Harga:</span>
            <input
              type="number"
              value={goldPrice}
              onChange={(e) => setGoldPrice(Math.max(100000, Number(e.target.value) || 0))}
              className="w-32 px-2.5 py-1 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* 1. ZAKAT MAAL CALCULATOR */}
        {zakatSubTab === 'maal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Input */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/95 border border-stone-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 pb-2 border-b border-stone-100 dark:border-slate-700">
                Komponen Harta Simpanan (Haul 1 Tahun)
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Uang Tunai, Tabungan & Giro (Rp)
                </label>
                <input
                  type="number"
                  value={cashSavings}
                  onChange={(e) => setCashSavings(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700/60 border border-stone-200 dark:border-slate-600 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Emas, Logam Mulia, atau Perhiasan Simpanan (Rp)
                </label>
                <input
                  type="number"
                  value={goldAssets}
                  onChange={(e) => setGoldAssets(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700/60 border border-stone-200 dark:border-slate-600 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Saham, Reksa Dana, Deposito & Aset Likuid (Rp)
                </label>
                <input
                  type="number"
                  value={investments}
                  onChange={(e) => setInvestments(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700/60 border border-stone-200 dark:border-slate-600 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Hutang / Kewajiban Jatuh Tempo Tahun Ini (Rp)
                </label>
                <input
                  type="number"
                  value={debtsDue}
                  onChange={(e) => setDebtsDue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700/60 border border-stone-200 dark:border-slate-600 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-slate-700/40 border border-stone-200/80 dark:border-slate-600/80 text-xs text-stone-600 dark:text-stone-300 space-y-1.5">
                <span className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Kaidah Gaji & Penghasilan Bulanan (Jumhur 4 Mazhab):
                </span>
                <p className="leading-relaxed text-[11px] text-stone-500 dark:text-stone-400">
                  Gaji bulanan tidak dipotong zakat saat diterima. Sisa gaji yang berhasil Anda tabung, apabila telah mencapai nilai setara 85g emas dan bertahan mengendap selama 1 tahun penuh (haul), dimasukkan ke kolom tabungan di atas untuk dikeluarkan zakatnya sebesar 2,5%.
                </p>
              </div>
            </div>

            {/* Result Summary */}
            <div className="space-y-4">
              <div
                className={`p-6 rounded-2xl border transition-all ${
                  isNisabMaalReached
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30'
                    : 'bg-stone-50 dark:bg-slate-800/90 border-stone-200/80 dark:border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Hasil Perhitungan Zakat Maal
                  </span>
                  {isNisabMaalReached ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Wajib Zakat (Bila 1 Haul)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" /> Belum Mencapai Nisab
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 mb-6 text-sm">
                  <div className="flex justify-between items-center text-stone-600 dark:text-stone-300">
                    <span>Total Harta Bersih:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalHartaMaal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-stone-500 dark:text-stone-400 text-xs">
                    <span>Nisab 85g Emas:</span>
                    <span className="font-mono">{formatCurrency(nisabMaalValue)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-stone-200/80 dark:border-slate-700/80 text-center">
                  <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-1">
                    Kewajiban Zakat yang Harus Dikeluarkan (2.5%)
                  </span>
                  <span className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 block">
                    {formatCurrency(zakatMaalDue)}
                  </span>
                  {!isNisabMaalReached ? (
                    <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 block">
                      Kurang {formatCurrency(nisabMaalValue - totalHartaMaal)} untuk mencapai nisab.
                    </span>
                  ) : (
                    <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 block">
                      Wajib ditunaikan bila telah genap tersimpan 1 tahun hijriyah (haul).
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyZakatSummary}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedZakat ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedZakat ? 'Berhasil Disalin!' : 'Salin Rincian Zakat'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. ZAKAT FITRAH CALCULATOR */}
        {zakatSubTab === 'fitrah' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/95 border border-stone-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 pb-2 border-b border-stone-100 dark:border-slate-700">
                Data Jiwa & Harga Makanan Pokok
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Jumlah Anggota Keluarga / Jiwa yang Ditanggung
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={familyMembers}
                    onChange={(e) => setFamilyMembers(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700/60 border border-stone-200 dark:border-slate-600 rounded-xl text-sm font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-stone-500">Jiwa</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Harga Beras Makanan Pokok per Kilogram (Rp)
                </label>
                <input
                  type="number"
                  value={ricePricePerKg}
                  onChange={(e) => setRicePricePerKg(Math.max(1000, Number(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700/60 border border-stone-200 dark:border-slate-600 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="16000"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Standar BAZNAS: 2,5 kg atau 3,5 liter beras berkualitas baik per jiwa.
                </span>
              </div>
            </div>

            {/* Result Summary */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-4">
                  Kewajiban Zakat Fitrah ({familyMembers} Jiwa)
                </span>

                <div className="space-y-3 mb-6">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-stone-200/80 dark:border-slate-700/80 text-center">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Bila Dibayarkan dalam Bentuk Beras
                    </span>
                    <span className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 block">
                      {totalRiceKg} kg
                    </span>
                    <span className="text-[11px] text-stone-500 mt-0.5 block">
                      (setara {familyMembers * 3.5} liter beras)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-stone-200/80 dark:border-slate-700/80 text-center">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Bila Dibayarkan dalam Bentuk Uang Tunai
                    </span>
                    <span className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 block">
                      {formatCurrency(totalFitrahCash)}
                    </span>
                    <span className="text-[11px] text-stone-500 mt-0.5 block">
                      (@ {formatCurrency(2.5 * ricePricePerKg)} per jiwa)
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyZakatSummary}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedZakat ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedZakat ? 'Berhasil Disalin!' : 'Salin Rincian Zakat'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Dalil & 8 Asnaf Info */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/95 border border-stone-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
          <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Dalil Zakat & 8 Golongan Penerima (Asnaf)</span>
          </h4>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic bg-stone-50 dark:bg-slate-900/50 p-3 rounded-xl border border-stone-100 dark:border-slate-700">
            "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan
            mensucikan mereka dan mendoalah untuk mereka. Sesungguhnya doa kamu itu (menjadi)
            ketenteraman jiwa bagi mereka." (QS. At-Taubah: 103)
          </p>
          <div className="text-xs text-stone-500 dark:text-stone-400 space-y-1">
            <span className="font-bold text-stone-700 dark:text-stone-200 block">
              8 Golongan yang Berhak Menerima Zakat (QS. At-Taubah: 60):
            </span>
            <p className="leading-relaxed">
              1. Fakir • 2. Miskin • 3. Amil Zakat • 4. Mualaf • 5. Riqab (Hamba Sahaya/Teraniaya) • 6.
              Gharimin (Orang Terlilit Hutang) • 7. Fisabilillah (Pejuang Agama) • 8. Ibnu Sabil
              (Musafir Kehabisan Bekal).
            </p>
          </div>
        </div>

        {/* Quick Link to Prayer Times */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/70 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                {language === 'en' ? 'Check Prayer Schedule?' : 'Ingin Cek Waktu Salat Terkini?'}
              </h4>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
                {language === 'en'
                  ? 'View automatic prayer schedule with countdown & GPS'
                  : 'Lihat jadwal salat otomatis dengan hitung mundur & GPS'}
              </p>
            </div>
          </div>
          <Link
            to="/prayer-times"
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs active:scale-95 text-center"
          >
            <span>{language === 'en' ? 'Open Prayer Times' : 'Jadwal Salat'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ZakatCalculatorPage;

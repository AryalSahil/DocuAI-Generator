import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight, Award, FileText, FileSpreadsheet } from 'lucide-react';
import { DOCUMENT_TEMPLATES, DocumentTemplate } from '../data/mockTemplates';

interface TemplatesViewProps {
  onNavigate: (path: string, state?: any) => void;
}

export default function TemplatesView({ onNavigate }: TemplatesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'certificate' | 'offer-letter' | 'internship-letter'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering templates
  const filteredTemplates = DOCUMENT_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'all' || tpl.type === selectedCategory;
    const matchesSearch = 
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Editorial Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">Curated Presets</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Document Blueprint Library
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Select a verified administrative layout to begin. Each template is pre-configured with precise padding ratios, optimal text balance, and appropriate structural sections ready for AI-guided detail expansions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        {/* Category Tabs (Interactive Filter Controls - Buttons with State) */}
        <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-lg">
          {(['all', 'certificate', 'offer-letter', 'internship-letter'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap capitalize ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Layouts' : cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Grid List */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => onNavigate('/create', { presetId: tpl.id })}
              className="group bg-white rounded-xl border border-slate-200/60 overflow-hidden hover:border-indigo-400 hover:shadow-md cursor-pointer flex flex-col justify-between transition-all"
            >
              <div className="p-6 space-y-4">
                {/* Visual Icon Header depending on type */}
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-lg ${
                    tpl.type === 'certificate' ? 'bg-amber-50 text-amber-600' :
                    tpl.type === 'offer-letter' ? 'bg-indigo-50 text-indigo-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {tpl.type === 'certificate' ? <Award className="w-5 h-5" /> :
                     tpl.type === 'offer-letter' ? <FileText className="w-5 h-5" /> :
                     <FileSpreadsheet className="w-5 h-5" />}
                  </div>
                  
                  {/* Zero-Pill Clean Metadata */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium font-mono">
                    <span>{tpl.category}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {tpl.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs">
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <span className="capitalize">{tpl.type.replace('-', ' ')}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>Print Scale 1:1</span>
                </div>
                
                <span className="font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Draft document <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-100 space-y-3">
          <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No template matches</h3>
          <p className="text-slate-500 text-sm">Try adjusting your search keywords or clearing active filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

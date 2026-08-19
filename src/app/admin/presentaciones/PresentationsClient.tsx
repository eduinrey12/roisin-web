'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  adminCreatePresentationOptionAction,
  adminUpdatePresentationOptionAction,
  adminDeletePresentationOptionAction,
} from '@/lib/actions/admin.actions';
import {
  Gift,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Image as ImageIcon,
  Save,
  CheckCircle2,
} from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface PresentationOptionItem {
  id: string;
  name: string;
  description: string | null;
  priceModifier: any;
  imageUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

const PRESET_PACKAGING_IMAGES = [
  {
    name: 'Caja Joyera Clásica con Lazo Morado',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Empaque de Lujo + Bolsa & Tarjeta',
    url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Funda de Terciopelo Púrpura',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Estuche de Alta Joyería Aterciopelado',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
  },
];

export default function PresentationsClient({
  initialOptions,
}: {
  initialOptions: PresentationOptionItem[];
}) {
  const [options, setOptions] = useState<PresentationOptionItem[]>(initialOptions);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceModifier: '0.00',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
    isDefault: false,
    sortOrder: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priceModifier: '0.00',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      isDefault: false,
      sortOrder: options.length,
    });
    setEditingId(null);
    setIsCreating(false);
    setError('');
  };

  const handleStartEdit = (opt: PresentationOptionItem) => {
    setEditingId(opt.id);
    setIsCreating(false);
    setFormData({
      name: opt.name,
      description: opt.description || '',
      priceModifier: String(Number(opt.priceModifier)),
      imageUrl:
        opt.imageUrl ||
        'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      isDefault: opt.isDefault,
      sortOrder: opt.sortOrder,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('El nombre de la presentación es obligatorio');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingId) {
        // Update
        const res = await adminUpdatePresentationOptionAction(editingId, {
          name: formData.name,
          description: formData.description || undefined,
          priceModifier: Number(formData.priceModifier) || 0,
          imageUrl: formData.imageUrl,
          isDefault: formData.isDefault,
          sortOrder: Number(formData.sortOrder) || 0,
        });

        if (res.success && res.option) {
          setOptions(
            options.map((o) =>
              o.id === editingId
                ? (res.option as any)
                : formData.isDefault
                ? { ...o, isDefault: false }
                : o
            )
          );
          setSuccessMsg('¡Presentación actualizada correctamente!');
          setTimeout(() => setSuccessMsg(''), 3000);
          resetForm();
        } else {
          setError(res.error || 'Error al actualizar');
        }
      } else {
        // Create
        const res = await adminCreatePresentationOptionAction({
          name: formData.name,
          description: formData.description || undefined,
          priceModifier: Number(formData.priceModifier) || 0,
          imageUrl: formData.imageUrl,
          isDefault: formData.isDefault,
          sortOrder: Number(formData.sortOrder) || 0,
        });

        if (res.success && res.option) {
          const newOpt = res.option as any;
          setOptions(
            formData.isDefault
              ? [...options.map((o) => ({ ...o, isDefault: false })), newOpt]
              : [...options, newOpt]
          );
          setSuccessMsg('¡Nueva presentación creada con éxito!');
          setTimeout(() => setSuccessMsg(''), 3000);
          resetForm();
        } else {
          setError(res.error || 'Error al crear');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas dar de baja esta opción de presentación?')) return;
    try {
      const res = await adminDeletePresentationOptionAction(id);
      if (res.success) {
        setOptions(options.filter((o) => o.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-zinc-900 flex items-center gap-2.5">
            <Gift className="text-[#7043A0]" size={26} />
            Presentaciones & Empaques de Regalo
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-light">
            Gestiona las cajitas, estuches y fundas que los clientes pueden elegir en cada joya, con fotografía real y precio adicional.
          </p>
        </div>

        {!isCreating && !editingId && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="btn-purple-diamond px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus size={16} /> Nueva Presentación
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200 flex items-center gap-2 animate-fade-in font-bold">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 animate-fade-in font-bold">
          {error}
        </div>
      )}

      {/* 2. Create / Edit Form Card */}
      {(isCreating || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-sm space-y-6 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#DFD0EC] pb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#7043A0]" />
              <h2 className="font-sans text-base font-bold text-zinc-900">
                {editingId ? 'Editar Presentación de Regalo' : 'Crear Nueva Presentación'}
              </h2>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 hover:bg-[#F8F5FA] rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Nombre de la Presentación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Caja Joyera Roisin con Lazo Morado"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-[#7043A0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Descripción Corta
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Estuche rígido protector con cinta amatista de raso y esponja aterciopelada."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl text-xs font-medium text-zinc-900 focus:outline-none focus:border-[#7043A0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Precio Adicional ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={formData.priceModifier}
                      onChange={(e) => setFormData({ ...formData, priceModifier: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#7043A0]"
                      placeholder="0.00"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-1">
                    (Coloca 0.00 si viene incluida sin costo extra)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: Number(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#7043A0]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-[#3F235F] accent-[#3F235F] rounded"
                  />
                  <span className="text-xs font-bold text-zinc-800">
                    Establecer como opción preseleccionada por defecto
                  </span>
                </label>
              </div>
            </div>

            {/* Right: Packaging Image & Presets */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  URL de la Fotografía del Empaque *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl text-xs font-mono text-zinc-800 focus:outline-none focus:border-[#7043A0]"
                />
              </div>

              {/* Photo Preview */}
              <div className="flex items-center gap-4 p-3 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC]">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#DFD0EC] bg-white shrink-0">
                  {formData.imageUrl ? (
                    <Image
                      src={formData.imageUrl}
                      alt="Vista previa"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-zinc-800 block">Vista Previa de la Foto</span>
                  <p className="text-[11px] text-zinc-500 font-light">
                    Esta imagen se mostrará en el selector visual de la página de productos.
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
                  O selecciona una foto de nuestra galería:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_PACKAGING_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        formData.imageUrl === preset.url
                          ? 'border-[#3F235F] ring-2 ring-[#7043A0]/30 shadow-xs scale-103'
                          : 'border-[#DFD0EC] hover:border-[#7043A0] opacity-80 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <Image src={preset.url} alt={preset.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DFD0EC]">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-2xl border border-[#DFD0EC] text-xs font-bold text-zinc-600 hover:bg-[#F8F5FA] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-purple-diamond px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save size={15} />
              {loading ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Presentación'}
            </button>
          </div>
        </form>
      )}

      {/* 3. Cards Grid of Presentations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt) => {
          const modifier = Number(opt.priceModifier || 0);

          return (
            <div
              key={opt.id}
              className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between ${
                opt.isDefault ? 'border-[#3F235F] ring-1 ring-[#7043A0]/40' : 'border-[#DFD0EC]'
              }`}
            >
              <div>
                {/* Photo */}
                <div className="relative aspect-[4/3] bg-[#F8F5FA] overflow-hidden">
                  <Image
                    src={
                      opt.imageUrl ||
                      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'
                    }
                    alt={opt.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    {opt.isDefault && (
                      <span className="bg-[#3F235F] text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-xs">
                        Por Defecto
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-white/95 text-[#3F235F] text-xs font-black px-3 py-1 rounded-full shadow-sm border border-[#DFD0EC]">
                      {modifier > 0 ? `+$${modifier.toFixed(2)}` : 'Sin Costo'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <RoisinDiamond size={13} color="#7043A0" />
                    <h3 className="font-sans text-sm font-bold text-zinc-900 leading-snug">
                      {opt.name}
                    </h3>
                  </div>

                  {opt.description && (
                    <p className="text-xs text-zinc-500 font-light leading-relaxed">
                      {opt.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-[#F8F5FA] mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Orden #{opt.sortOrder}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(opt)}
                    className="p-2 rounded-xl text-zinc-600 hover:text-[#3F235F] hover:bg-[#F0E9F5] transition cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(opt.id)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Dar de baja"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  Layers,
} from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface PresentationOptionItem {
  id: string;
  name: string;
  description: string | null;
  priceModifier: any;
  imageUrl: string | null;
  images?: { id?: string; url: string; altText?: string | null }[];
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
    additionalImages: [''],
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
      additionalImages: [''],
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

    const extraImgs = opt.images && opt.images.length > 1
      ? opt.images.slice(1).map((i) => i.url)
      : [''];

    setFormData({
      name: opt.name,
      description: opt.description || '',
      priceModifier: String(Number(opt.priceModifier)),
      imageUrl:
        opt.imageUrl ||
        opt.images?.[0]?.url ||
        'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
      additionalImages: extraImgs,
      isDefault: opt.isDefault,
      sortOrder: opt.sortOrder,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddImageField = () => {
    setFormData({
      ...formData,
      additionalImages: [...formData.additionalImages, ''],
    });
  };

  const handleRemoveImageField = (idx: number) => {
    const updated = formData.additionalImages.filter((_, i) => i !== idx);
    setFormData({
      ...formData,
      additionalImages: updated.length > 0 ? updated : [''],
    });
  };

  const handleAdditionalImageChange = (val: string, idx: number) => {
    const updated = [...formData.additionalImages];
    updated[idx] = val;
    setFormData({ ...formData, additionalImages: updated });
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

    const cleanImages = [
      formData.imageUrl.trim(),
      ...formData.additionalImages.map((s) => s.trim()).filter(Boolean),
    ].filter(Boolean);

    try {
      if (editingId) {
        // Update
        const res = await adminUpdatePresentationOptionAction(editingId, {
          name: formData.name,
          description: formData.description || undefined,
          priceModifier: Number(formData.priceModifier) || 0,
          imageUrl: cleanImages[0] || formData.imageUrl,
          images: cleanImages,
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
          imageUrl: cleanImages[0] || formData.imageUrl,
          images: cleanImages,
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
      } else {
        alert(res.error || 'Error al eliminar');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift className="text-[#7043A0]" size={22} />
            <h1 className="font-sans text-xl font-bold text-zinc-900">
              Presentaciones & Empaques de Joyas
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-light max-w-2xl">
            Gestiona los estuches, cajas de regalo, fundas y empaques disponibles en la tienda con fotos múltiples en alta definición.
          </p>
        </div>

        {!isCreating && !editingId && (
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="btn-purple-diamond px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Nueva Presentación</span>
          </button>
        )}
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <X size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Create / Edit Form */}
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

            {/* Right: Packaging Photos & Presets */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Fotografía Principal *
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

              {/* Additional Photos for Multi-Photo Gallery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Fotos Adicionales (Ángulos, Interior, Tarjeta)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="text-[11px] font-bold text-[#7043A0] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Añadir otra foto
                  </button>
                </div>

                {formData.additionalImages.map((extraUrl, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="url"
                      placeholder="https://... (Foto adicional)"
                      value={extraUrl}
                      onChange={(e) => handleAdditionalImageChange(e.target.value, idx)}
                      className="flex-1 px-4 py-1.5 bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl text-xs font-mono text-zinc-800 focus:outline-none focus:border-[#7043A0]"
                    />
                    {formData.additionalImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageField(idx)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
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
                  <span className="font-bold text-zinc-800 block">Galería Multi-Foto</span>
                  <p className="text-[11px] text-zinc-500 font-light">
                    Los clientes podrán ver todas las fotos en detalle mediante el botón de zoom en el carrusel de productos.
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
          const totalPhotos = opt.images && opt.images.length > 0 ? opt.images.length : 1;

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
                    {totalPhotos > 1 && (
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Layers size={10} /> {totalPhotos} fotos
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
                  <h3 className="font-sans text-sm font-bold text-zinc-900 leading-snug">
                    {opt.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-light line-clamp-2 leading-relaxed">
                    {opt.description || 'Sin descripción detallada.'}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-[#FAF8FC] border-t border-[#DFD0EC] flex items-center justify-between">
                <span className="text-[11px] font-medium text-zinc-400">
                  Orden: #{opt.sortOrder}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(opt)}
                    className="p-2 hover:bg-white text-zinc-600 hover:text-[#3F235F] rounded-xl border border-transparent hover:border-[#DFD0EC] transition cursor-pointer"
                    title="Editar presentación"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(opt.id)}
                    className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                    title="Eliminar presentación"
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

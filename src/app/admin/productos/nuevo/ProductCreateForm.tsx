'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { adminCreateProductAction } from '@/lib/actions/admin.actions';
import {
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  Image as ImageIcon,
  Layers,
  Palette,
  Ruler,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import CustomSelect from '@/components/ui/CustomSelect';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
}

interface MaterialItem {
  id?: string;
  name: string;
  description?: string | null;
}

interface CategorySizeItem {
  id?: string;
  categoryId: string;
  name: string;
  isAdjustable: boolean;
  sortOrder: number;
}

interface MaterialVariantState {
  id: string;
  materialName: string;
  description: string;
  basePrice: string;
  initialStock: string;
  selectedSizes: {
    sizeName: string;
    priceOverride: string;
    stock: string;
  }[];
  colors: {
    metalColor: string;
    gemColor: string;
  }[];
}

export default function ProductCreateForm({
  categories,
  collections = [],
  materials = [],
  categorySizes = [],
}: {
  categories: CategoryItem[];
  collections?: CollectionItem[];
  materials?: MaterialItem[];
  categorySizes?: CategorySizeItem[];
}) {
  const router = useRouter();

  // Basic Info Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    tag: '',
    categoryId: categories[0]?.id || '',
    collectionId: '',
    isFeatured: false,
  });

  // Image Upload Staging State
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string>('');
  const [pendingImageLabel, setPendingImageLabel] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Gallery of Uploaded Images
  const [imagesList, setImagesList] = useState<
    { url: string; label?: string; isPrimary: boolean }[]
  >([]);

  // Materials & Variants State
  const initialMaterial = materials[0]?.name || 'Plata de Ley 925';
  const initialDesc =
    materials[0]?.description ||
    'Plata fina de ley 925 con recubrimiento de rodio hipoalergénico y acabado brillante.';

  const [materialVariants, setMaterialVariants] = useState<MaterialVariantState[]>([
    {
      id: 'mat-1',
      materialName: initialMaterial,
      description: initialDesc,
      basePrice: '48.00',
      initialStock: '15',
      selectedSizes: [],
      colors: [
        {
          metalColor: 'Plateado Rodio',
          gemColor: 'Amatista Morada',
        },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter available sizes for currently selected category
  const currentCategorySizes = useMemo(() => {
    const matched = categorySizes.filter((s) => s.categoryId === formData.categoryId);
    if (matched.length > 0) return matched;

    const currentCat = categories.find((c) => c.id === formData.categoryId);
    const catName = currentCat?.name.toLowerCase() || '';

    if (catName.includes('anillo')) {
      return [
        { id: 's1', categoryId: formData.categoryId, name: 'Talla 5', isAdjustable: false, sortOrder: 1 },
        { id: 's2', categoryId: formData.categoryId, name: 'Talla 6', isAdjustable: false, sortOrder: 2 },
        { id: 's3', categoryId: formData.categoryId, name: 'Talla 7', isAdjustable: false, sortOrder: 3 },
        { id: 's4', categoryId: formData.categoryId, name: 'Talla 8', isAdjustable: false, sortOrder: 4 },
        { id: 's5', categoryId: formData.categoryId, name: 'Talla 9', isAdjustable: false, sortOrder: 5 },
        { id: 's6', categoryId: formData.categoryId, name: 'Talla 10', isAdjustable: false, sortOrder: 6 },
        { id: 's7', categoryId: formData.categoryId, name: 'Talla Ajustable', isAdjustable: true, sortOrder: 7 },
      ];
    } else if (catName.includes('collar') || catName.includes('dije')) {
      return [
        { id: 's1', categoryId: formData.categoryId, name: '40 cm (Choker)', isAdjustable: false, sortOrder: 1 },
        { id: 's2', categoryId: formData.categoryId, name: '45 cm (Princesa)', isAdjustable: false, sortOrder: 2 },
        { id: 's3', categoryId: formData.categoryId, name: '50 cm (Matinee)', isAdjustable: false, sortOrder: 3 },
        { id: 's4', categoryId: formData.categoryId, name: '55 cm', isAdjustable: false, sortOrder: 4 },
        { id: 's5', categoryId: formData.categoryId, name: '60 cm (Ópera)', isAdjustable: false, sortOrder: 5 },
        { id: 's6', categoryId: formData.categoryId, name: 'Ajustable 40-45 cm', isAdjustable: true, sortOrder: 6 },
      ];
    } else if (catName.includes('pulsera') || catName.includes('brazalete')) {
      return [
        { id: 's1', categoryId: formData.categoryId, name: '16 cm (Pequeña)', isAdjustable: false, sortOrder: 1 },
        { id: 's2', categoryId: formData.categoryId, name: '17 cm (Estándar)', isAdjustable: false, sortOrder: 2 },
        { id: 's3', categoryId: formData.categoryId, name: '18 cm (Mediana)', isAdjustable: false, sortOrder: 3 },
        { id: 's4', categoryId: formData.categoryId, name: '19 cm (Grande)', isAdjustable: false, sortOrder: 4 },
        { id: 's5', categoryId: formData.categoryId, name: 'Ajustable 16-19 cm', isAdjustable: true, sortOrder: 5 },
      ];
    }
    return [
      { id: 's1', categoryId: formData.categoryId, name: 'Talla Única / Estándar', isAdjustable: false, sortOrder: 1 },
    ];
  }, [categorySizes, formData.categoryId, categories]);

  // Auto slug generation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({ ...prev, title, slug }));
  };

  // Image Selection & Staging
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPendingPreviewUrl(objectUrl);
    setError('');
  };

  const handleUploadAndAddImage = async () => {
    if (!pendingFile) {
      setError('Por favor selecciona una imagen de tu equipo primero.');
      return;
    }

    setUploadingImage(true);
    setError('');

    const fd = new FormData();
    fd.append('file', pendingFile);

    try {
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setImagesList((prev) => [
          ...prev,
          {
            url: data.url,
            label: pendingImageLabel.trim() || undefined,
            isPrimary: prev.length === 0,
          },
        ]);
        setPendingFile(null);
        setPendingPreviewUrl('');
        setPendingImageLabel('');
      } else {
        setError(data.error || 'Error al subir la imagen al servidor');
      }
    } catch {
      setError('Error de conexión al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImagesList((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  // Material Variants Handlers
  const handleAddMaterial = () => {
    const nextIdx = materialVariants.length;
    const defaultMat = materials[nextIdx % Math.max(1, materials.length)]?.name || 'Baño de Oro 18k';
    const defaultDesc =
      materials[nextIdx % Math.max(1, materials.length)]?.description ||
      'Triple baño de oro de 18 quilates de alta durabilidad.';

    setMaterialVariants((prev) => [
      ...prev,
      {
        id: `mat-${Date.now()}`,
        materialName: defaultMat,
        description: defaultDesc,
        basePrice: '65.00',
        initialStock: '10',
        selectedSizes: [],
        colors: [
          {
            metalColor: 'Dorado Real',
            gemColor: 'Amatista Morada',
          },
        ],
      },
    ]);
  };

  const handleRemoveMaterial = (matId: string) => {
    if (materialVariants.length <= 1) return;
    setMaterialVariants((prev) => prev.filter((m) => m.id !== matId));
  };

  const handleUpdateMaterial = (matId: string, field: keyof MaterialVariantState, value: any) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        return { ...m, [field]: value };
      })
    );
  };

  // Size Selection for a specific material
  const handleToggleSize = (matId: string, sizeName: string) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        const exists = m.selectedSizes.some((s) => s.sizeName === sizeName);
        if (exists) {
          return {
            ...m,
            selectedSizes: m.selectedSizes.filter((s) => s.sizeName !== sizeName),
          };
        } else {
          return {
            ...m,
            selectedSizes: [
              ...m.selectedSizes,
              { sizeName, priceOverride: '', stock: m.initialStock || '10' },
            ],
          };
        }
      })
    );
  };

  const handleUpdateSizePrice = (matId: string, sizeName: string, priceOverride: string) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        return {
          ...m,
          selectedSizes: m.selectedSizes.map((s) =>
            s.sizeName === sizeName ? { ...s, priceOverride } : s
          ),
        };
      })
    );
  };

  // Color Combination Handlers
  const handleAddColor = (matId: string) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        return {
          ...m,
          colors: [
            ...m.colors,
            {
              metalColor: 'Plateado',
              gemColor: 'Circonia Blanca',
            },
          ],
        };
      })
    );
  };

  const handleRemoveColor = (matId: string, colorIdx: number) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        if (m.colors.length <= 1) return m;
        return {
          ...m,
          colors: m.colors.filter((_, idx) => idx !== colorIdx),
        };
      })
    );
  };

  const handleUpdateColor = (
    matId: string,
    colorIdx: number,
    field: 'metalColor' | 'gemColor',
    val: string
  ) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        const updatedColors = [...m.colors];
        updatedColors[colorIdx] = { ...updatedColors[colorIdx], [field]: val };
        return { ...m, colors: updatedColors };
      })
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imagesList.length === 0) {
      setError('Debes añadir al menos una imagen oficial para la joya.');
      return;
    }

    if (materialVariants.length === 0) {
      setError('Debes configurar al menos una variante de material y precio.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title: formData.title,
      slug: formData.slug,
      shortDescription: formData.shortDescription || undefined,
      description: formData.description,
      tag: formData.tag.trim() || undefined,
      categoryId: formData.categoryId,
      collectionId: formData.collectionId || undefined,
      isFeatured: formData.isFeatured,
      images: imagesList.map((img) => ({
        url: img.url,
        label: img.label || undefined,
        isPrimary: img.isPrimary,
      })),
      materials: materialVariants.map((mat) => ({
        materialName: mat.materialName,
        basePrice: Number(mat.basePrice) || 0,
        initialStock: Number(mat.initialStock) || 10,
        sizes:
          mat.selectedSizes.length > 0
            ? mat.selectedSizes.map((s) => ({
                sizeName: s.sizeName,
                price: s.priceOverride ? Number(s.priceOverride) : null,
                stock: Number(s.stock) || Number(mat.initialStock) || 10,
              }))
            : undefined,
        colors: mat.colors.map((c) => ({
          metalColor: c.metalColor,
          gemColor: c.gemColor,
        })),
      })),
    };

    const res = await adminCreateProductAction(payload);
    setLoading(false);

    if (res.success) {
      router.push('/admin/productos');
      router.refresh();
    } else {
      setError(res.error || 'Error al guardar la joya');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. INFORMACIÓN GENERAL */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#DFD0EC] pb-3.5">
          <RoisinDiamond size={15} color="#7043A0" />
          <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900">
            1. Información General de la Joya
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1.5">
              Título de la Joya *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Anillo Solitario Amatista Royal en Plata 925"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-3 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl focus:outline-none focus:border-[#7043A0] focus:bg-white text-zinc-900 transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1.5">
              Slug URL (Automático) *
            </label>
            <input
              type="text"
              required
              placeholder="anillo-solitario-amatista-royal-plata-925"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl font-mono focus:outline-none focus:border-[#7043A0] focus:bg-white text-zinc-900 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <CustomSelect
              label="Categoría *"
              value={formData.categoryId}
              onChange={(val) => setFormData({ ...formData, categoryId: val })}
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              placeholder="Seleccionar Categoría..."
            />
          </div>

          <div>
            <CustomSelect
              label="Colección Exclusiva (Opcional)"
              value={formData.collectionId}
              onChange={(val) => setFormData({ ...formData, collectionId: val })}
              options={[
                { value: '', label: 'Ninguna / Sin Colección' },
                ...collections.map((col) => ({
                  value: col.id,
                  label: col.name,
                })),
              ]}
              placeholder="Seleccionar Colección..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1.5">
              Badge / Etiqueta (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: MÁS VENDIDO, AMATISTA ROYAL"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              className="w-full px-4 py-3 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl focus:outline-none focus:border-[#7043A0] focus:bg-white text-zinc-900 font-bold transition"
            />
          </div>
        </div>

        {/* Checkbox Destacar en Portada con Explicación */}
        <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] flex items-start gap-3">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="w-4.5 h-4.5 mt-0.5 accent-[#3F235F] rounded-md cursor-pointer shrink-0"
          />
          <div>
            <label htmlFor="isFeatured" className="text-xs font-bold text-zinc-900 cursor-pointer block">
              Destacar en la Portada Principal (Bento Grid)
            </label>
            <p className="text-[11px] text-zinc-500 font-light mt-0.5">
              Si se marca, este producto aparecerá destacado con diseño visual especial en la sección principal de la página de inicio.
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-800 block mb-1.5">
            Descripción Corta (Mostrada bajo el título en la tienda)
          </label>
          <input
            type="text"
            placeholder="Joya fina elaborada a mano con gema amatista facetada y acabado de alta durabilidad."
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            className="w-full px-4 py-3 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl focus:outline-none focus:border-[#7043A0] focus:bg-white text-zinc-900 transition"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-800 block mb-1.5">
            Descripción Detallada *
          </label>
          <textarea
            rows={4}
            required
            placeholder="Detalla las características de la joya: pureza del metal, corte de gemas, recomendaciones de cuidado, garantía y detalles de empaque..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl focus:outline-none focus:border-[#7043A0] focus:bg-white text-zinc-900 font-light transition leading-relaxed"
          />
        </div>
      </div>

      {/* 2. SUBIDA DE FOTOGRAFÍAS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#DFD0EC] pb-3.5">
          <RoisinDiamond size={15} color="#7043A0" />
          <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900">
            2. Fotografías de la Joya
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card para seleccionar imagen desde el equipo */}
          <div className="p-5 bg-[#F8F5FA] border-2 border-dashed border-[#DFD0EC] hover:border-[#7043A0] rounded-3xl transition flex flex-col justify-center items-center text-center">
            <label className="cursor-pointer w-full flex flex-col items-center">
              <Upload size={28} className="text-[#7043A0] mb-2 hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-zinc-900">
                Seleccionar Fotografía desde el Equipo
              </span>
              <span className="text-[10px] text-zinc-400 mt-1 font-light">
                Formatos JPG, PNG, WEBP de alta calidad
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                className="hidden"
              />
            </label>
          </div>

          {/* Staging de la imagen seleccionada con confirmación */}
          <div className="p-5 bg-[#FAF7FC] border border-[#DFD0EC] rounded-3xl space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#3F235F] uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={14} /> Vista Previa
                </span>
                {pendingFile && (
                  <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">
                    {pendingFile.name}
                  </span>
                )}
              </div>

              {pendingPreviewUrl ? (
                <div className="flex gap-3 items-center">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#DFD0EC] shrink-0">
                    <Image src={pendingPreviewUrl} alt="Preview" fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Etiqueta opcional:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Frontal, Puesto, Plata 925"
                      value={pendingImageLabel}
                      onChange={(e) => setPendingImageLabel(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0] text-zinc-900"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 font-light italic py-2">
                  Selecciona una imagen a la izquierda para previsualizarla y añadirla a la galería.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleUploadAndAddImage}
              disabled={!pendingFile || uploadingImage}
              className="btn-purple-diamond w-full py-2.5 rounded-2xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploadingImage ? (
                <span>Subiendo al servidor...</span>
              ) : (
                <>
                  <Plus size={14} /> Añadir Fotografía a la Joya
                </>
              )}
            </button>
          </div>
        </div>

        {/* Galería de imágenes añadidas */}
        {imagesList.length > 0 && (
          <div className="pt-3 border-t border-[#DFD0EC]">
            <p className="text-xs font-bold text-zinc-800 mb-2.5">
              Fotografías Añadidas ({imagesList.length}):
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 shrink-0 group shadow-xs ${
                    img.isPrimary ? 'border-[#3F235F]' : 'border-[#DFD0EC]'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="bg-red-600 text-white rounded-full p-1 shadow-xs cursor-pointer"
                      title="Eliminar foto"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(idx)}
                    className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold cursor-pointer transition ${
                      img.isPrimary
                        ? 'bg-[#3F235F] text-white'
                        : 'bg-black/60 text-white hover:bg-[#3F235F]'
                    }`}
                  >
                    {img.isPrimary ? 'Principal' : 'Hacer Principal'}
                  </button>

                  {img.label && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[8px] uppercase font-bold text-center py-0.5 truncate px-1">
                      {img.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. MATERIALES & PRECIO DE VENTA (VARIANTE PRINCIPAL) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b border-[#DFD0EC] pb-3.5">
          <div className="flex items-center gap-2">
            <RoisinDiamond size={15} color="#7043A0" />
            <div>
              <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900">
                3. Materiales & Precio Base de Venta
              </h2>
              <p className="text-[11px] text-zinc-500 font-light">
                El material es la variante principal que define el precio de venta de la joya.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddMaterial}
            className="btn-purple-diamond text-xs font-bold px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus size={14} /> Añadir Otro Material
          </button>
        </div>

        <div className="space-y-6">
          {materialVariants.map((mat, mIdx) => (
            <div
              key={mat.id}
              className="p-5 sm:p-6 bg-[#F8F5FA] border border-[#DFD0EC] rounded-3xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-[#DFD0EC]/70 pb-3">
                <span className="text-xs font-bold text-[#3F235F] uppercase tracking-wider flex items-center gap-2">
                  <Layers size={15} /> Variante #{mIdx + 1}: {mat.materialName}
                </span>
                {materialVariants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(mat.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} /> Eliminar Material
                  </button>
                )}
              </div>

              {/* Material Selection & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                    Tipo de Material *
                  </label>
                  <input
                    type="text"
                    required
                    list={`mat-list-${mat.id}`}
                    value={mat.materialName}
                    onChange={(e) => handleUpdateMaterial(mat.id, 'materialName', e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-[#DFD0EC] rounded-2xl font-bold text-zinc-900 focus:outline-none focus:border-[#7043A0]"
                  />
                  <datalist id={`mat-list-${mat.id}`}>
                    {materials.map((m) => (
                      <option key={m.id} value={m.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                    Precio de Venta ($ USD) *
                  </label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3.5 top-3 text-zinc-400" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="48.00"
                      value={mat.basePrice}
                      onChange={(e) => handleUpdateMaterial(mat.id, 'basePrice', e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 text-xs bg-white border border-[#DFD0EC] rounded-2xl font-bold text-zinc-900 focus:outline-none focus:border-[#7043A0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={mat.initialStock}
                    onChange={(e) => handleUpdateMaterial(mat.id, 'initialStock', e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-[#DFD0EC] rounded-2xl font-bold text-zinc-900 focus:outline-none focus:border-[#7043A0]"
                  />
                </div>
              </div>

              {/* 4. TALLAS SEGÚN CATEGORÍA PARA ESTE MATERIAL */}
              <div className="pt-2 border-t border-[#DFD0EC]/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Ruler size={14} className="text-[#7043A0]" />
                    <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                      Tallas Disponibles para {mat.materialName}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-light">
                    (El precio se hereda automáticamente si no se especifica recargo)
                  </span>
                </div>

                {/* Grid de tallas disponibles según la categoría */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {currentCategorySizes.map((sz) => {
                    const isSelected = mat.selectedSizes.some((s) => s.sizeName === sz.name);
                    const currentSelected = mat.selectedSizes.find((s) => s.sizeName === sz.name);

                    return (
                      <div
                        key={sz.id || sz.name}
                        className={`p-3 rounded-2xl border transition ${
                          isSelected
                            ? 'border-[#7043A0] bg-white shadow-2xs'
                            : 'border-[#DFD0EC] bg-white/60 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-900">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSize(mat.id, sz.name)}
                              className="w-4 h-4 accent-[#3F235F] rounded cursor-pointer"
                            />
                            <span>{sz.name}</span>
                          </label>
                          {sz.isAdjustable && (
                            <span className="text-[9px] bg-[#F0E9F5] text-[#7043A0] font-bold px-1.5 py-0.5 rounded-full">
                              Ajustable
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-[#DFD0EC]">
                            <label className="text-[10px] font-bold text-zinc-500 block mb-1">
                              Precio de esta talla ($):
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder={`$${mat.basePrice || '0.00'}`}
                              value={currentSelected?.priceOverride || ''}
                              onChange={(e) =>
                                handleUpdateSizePrice(mat.id, sz.name, e.target.value)
                              }
                              className="w-full px-2.5 py-1 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0] font-bold text-zinc-900"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. COLORES (METAL + GEMA) PARA ESTE MATERIAL */}
              <div className="pt-2 border-t border-[#DFD0EC]/80 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Palette size={14} className="text-[#7043A0]" />
                    <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                      Colores de Acabado (Metal & Gema) para {mat.materialName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddColor(mat.id)}
                    className="text-xs font-bold text-[#3F235F] hover:text-[#7043A0] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Añadir Color
                  </button>
                </div>

                <div className="space-y-2.5">
                  {mat.colors.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex flex-wrap sm:flex-nowrap gap-3 items-center bg-white p-3 rounded-2xl border border-[#DFD0EC]"
                    >
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">
                          Color del Metal
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Plateado Rodio, Dorado, Oro Rosa"
                          value={c.metalColor}
                          onChange={(e) =>
                            handleUpdateColor(mat.id, cIdx, 'metalColor', e.target.value)
                          }
                          className="w-full px-3 py-1.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0] font-bold text-zinc-900"
                        />
                      </div>

                      <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">
                          Color de la Gema
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Amatista Morada, Circonia Blanca, Esmeralda, Sin Gema"
                          value={c.gemColor}
                          onChange={(e) =>
                            handleUpdateColor(mat.id, cIdx, 'gemColor', e.target.value)
                          }
                          className="w-full px-3 py-1.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0] font-bold text-zinc-900"
                        />
                      </div>

                      {mat.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(mat.id, cIdx)}
                          className="p-2 text-zinc-400 hover:text-red-600 transition cursor-pointer mt-4"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACCIONES DEL FORMULARIO */}
      <div className="flex gap-4 items-center justify-end pt-2">
        <Link
          href="/admin/productos"
          className="text-xs uppercase tracking-widest font-bold px-7 py-3.5 rounded-2xl border border-[#DFD0EC] bg-white hover:bg-[#F8F5FA] transition text-zinc-700 shadow-2xs"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="btn-purple-diamond text-xs uppercase tracking-widest font-bold px-9 py-3.5 rounded-2xl transition active:scale-[0.99] disabled:opacity-50 shadow-md cursor-pointer"
        >
          {loading ? 'Guardando Joya...' : 'Guardar y Publicar Joya'}
        </button>
      </div>
    </form>
  );
}


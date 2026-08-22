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
  Star,
  CheckCircle2,
  Eye,
  EyeOff,
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
  id: string;
  categoryId: string;
  name: string;
  isAdjustable?: boolean;
  sortOrder: number;
}

interface JewelryColorItem {
  id: string;
  name: string;
  hexCode?: string | null;
  type: 'METAL' | 'GEM';
}

interface ColorImageItem {
  url: string;
  label?: string;
  isPrimary?: boolean;
}

interface ColorFinishState {
  id: string;
  metalColor: string;
  gemColor: string;
  images: ColorImageItem[];
  pendingFile: File | null;
  pendingPreviewUrl: string;
  pendingImageLabel: string;
  uploadingImage: boolean;
}

interface MaterialVariantState {
  id: string;
  materialName: string;
  description: string;
  basePrice: string;
  initialStock: string;
  selectedSizes: { sizeName: string; priceOverride?: string; stock?: string }[];
  colors: ColorFinishState[];
}

export default function ProductCreateForm({
  categories,
  collections = [],
  materials = [],
  categorySizes = [],
  jewelryColors = [],
}: {
  categories: CategoryItem[];
  collections?: CollectionItem[];
  materials?: MaterialItem[];
  categorySizes?: CategorySizeItem[];
  jewelryColors?: JewelryColorItem[];
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
    isActive: true,
  });

  // Materials & Variants State
  const initialMaterial = materials[0]?.name || 'Plata de Ley 925';
  const initialDesc =
    materials[0]?.description ||
    'Plata fina de ley 925 con recubrimiento de rodio hipoalergénico y acabado espejo brillante.';

  const initialMetalColor =
    jewelryColors.find((c) => c.type === 'METAL')?.name || 'Plateado Rodio';
  const initialGemColor =
    jewelryColors.find((c) => c.type === 'GEM')?.name || 'Amatista Morada (Sello Roisin)';

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
          id: 'col-1-1',
          metalColor: initialMetalColor,
          gemColor: initialGemColor,
          images: [],
          pendingFile: null,
          pendingPreviewUrl: '',
          pendingImageLabel: '',
          uploadingImage: false,
        },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto slug generator
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: autoSlug,
    }));
  };

  // Get active category's sizes from DB
  const currentCategorySizes = useMemo(() => {
    return categorySizes.filter((s) => s.categoryId === formData.categoryId);
  }, [categorySizes, formData.categoryId]);

  // Options for Dropdowns
  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      value: c.id,
      label: c.name,
    }));
  }, [categories]);

  const collectionOptions = useMemo(() => {
    return [
      { value: '', label: 'Ninguna / Sin Colección Exclusiva' },
      ...collections.map((col) => ({
        value: col.id,
        label: col.name,
      })),
    ];
  }, [collections]);

  const getAvailableMaterialOptions = (currentMatId: string) => {
    const selectedInOtherCards = materialVariants
      .filter((m) => m.id !== currentMatId)
      .map((m) => m.materialName);

    if (materials.length > 0) {
      return materials
        .filter((m) => !selectedInOtherCards.includes(m.name))
        .map((m) => ({
          value: m.name,
          label: m.name,
        }));
    }
    return [
      { value: 'Plata de Ley 925', label: 'Plata de Ley 925' },
      { value: 'Baño de Oro 18k', label: 'Baño de Oro 18k' },
      { value: 'Oro Rosa 18k', label: 'Oro Rosa 18k' },
      { value: 'Acero Quirúrgico 316L', label: 'Acero Quirúrgico 316L' },
    ].filter((m) => !selectedInOtherCards.includes(m.value));
  };

// Color Hex Mapping and Split Swatch helper
const COLOR_HEX_MAP: Record<string, string> = {
  // Metals
  'plateado rodio': '#E5E7EB',
  'plateado': '#E5E7EB',
  'plata': '#E5E7EB',
  'plata 925': '#E5E7EB',
  'plata de ley 925': '#E5E7EB',
  'baño de oro 18k (dorado)': '#D4AF37',
  'baño oro 18k (dorado)': '#D4AF37',
  'baño de oro 18k': '#D4AF37',
  'baño oro 18k': '#D4AF37',
  'oro 18k': '#D4AF37',
  'dorado': '#D4AF37',
  'oro': '#D4AF37',
  'oro rosa': '#E8A598',
  'oro rosa 18k': '#E8A598',
  'oro rosa 14k': '#E8A598',
  'rose gold': '#E8A598',
  'acero titanio 316l': '#4B5563',
  'acero inoxidable plateado': '#9CA3AF',
  'acero': '#4B5563',
  'titanio': '#374151',
  'negro': '#1F2937',

  // Gems
  'amatista morada (sello roisin)': '#7043A0',
  'amatista morada': '#7043A0',
  'amatista': '#7043A0',
  'morada': '#7043A0',
  'circonia blanca brillante': '#FFFFFF',
  'circonia blanca': '#FFFFFF',
  'circonia': '#FFFFFF',
  'blanco': '#FFFFFF',
  'esmeralda verde': '#047857',
  'esmeralda': '#047857',
  'verde': '#047857',
  'rubí rojo pasión': '#B91C1C',
  'rubí rojo': '#B91C1C',
  'rubí': '#B91C1C',
  'rojo': '#B91C1C',
  'zafiro azul real': '#1D4ED8',
  'zafiro azul profundo': '#1E3A8A',
  'zafiro azul': '#1D4ED8',
  'zafiro': '#1D4ED8',
  'azul': '#1D4ED8',
};

function getColorHex(name: string | null | undefined): string | null {
  if (!name) return null;
  const lower = name.trim().toLowerCase();
  if (lower.includes('sin gema') || lower.includes('lisa') || lower.includes('solo metal')) {
    return null;
  }
  if (COLOR_HEX_MAP[lower]) return COLOR_HEX_MAP[lower];
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return hex;
  }
  return '#9CA3AF';
}

function getSplitColorStyle(colorString: string): {
  metalHex: string;
  gemHex: string | null;
  isSplit: boolean;
  background: string;
} {
  const parts = colorString.split('/').map((s) => s.trim());
  const metalName = parts[0] || '';
  const gemName = parts[1] || '';

  const metalHex = getColorHex(metalName) || '#E5E7EB';
  const gemHex = getColorHex(gemName);

  if (gemHex) {
    return {
      metalHex,
      gemHex,
      isSplit: true,
      background: `linear-gradient(135deg, ${metalHex} 50%, ${gemHex} 50%)`,
    };
  }

  return {
    metalHex,
    gemHex: null,
    isSplit: false,
    background: metalHex,
  };
}

  const metalColorOptions = useMemo(() => {
    const metals = jewelryColors.filter((c) => c.type === 'METAL');
    const baseList = metals.length > 0 ? metals.map((c) => c.name) : [
      'Plateado Rodio',
      'Baño de Oro 18k (Dorado)',
      'Oro Rosa 18k',
      'Acero Inoxidable Plateado',
    ];
    return baseList.map((name) => {
      const hex = getColorHex(name);
      return {
        value: name,
        label: `${name}${hex ? ` (${hex})` : ''}`,
      };
    });
  }, [jewelryColors]);

  const gemColorOptions = useMemo(() => {
    const gems = jewelryColors.filter((c) => c.type === 'GEM');
    const baseList = gems.length > 0 ? gems.map((c) => c.name) : [
      'Amatista Morada (Sello Roisin)',
      'Circonia Blanca Brillante',
      'Esmeralda Verde',
      'Rubí Rojo Pasión',
      'Zafiro Azul Profundo',
    ];
    return [
      { value: '', label: 'Sin Gema / Lisa (Solo Metal)' },
      ...baseList.map((name) => {
        const hex = getColorHex(name);
        return {
          value: name,
          label: `${name}${hex ? ` (${hex})` : ''}`,
        };
      }),
    ];
  }, [jewelryColors]);

  const canAddMoreMaterials = useMemo(() => {
    const maxAvailable = materials.length > 0 ? materials.length : 4;
    return materialVariants.length < maxAvailable;
  }, [materials.length, materialVariants.length]);

  // ==================== MATERIAL VARIANT HANDLERS ====================
  const handleAddMaterial = () => {
    const selectedNames = materialVariants.map((m) => m.materialName);
    const remaining = materials.filter((m) => !selectedNames.includes(m.name));

    if (remaining.length === 0 && materials.length > 0) {
      alert('Todos los materiales registrados en el catálogo ya han sido añadidos.');
      return;
    }

    const nextMat =
      remaining[0]?.name ||
      ['Plata de Ley 925', 'Baño de Oro 18k', 'Oro Rosa 18k', 'Acero Quirúrgico 316L'].find(
        (n) => !selectedNames.includes(n)
      ) ||
      'Otro Material';
    const nextDesc =
      materials.find((m) => m.name === nextMat)?.description ||
      'Estructura forjada con finos acabados de joyería artesanal.';

    setMaterialVariants((prev) => [
      ...prev,
      {
        id: `mat-${Date.now()}`,
        materialName: nextMat,
        description: nextDesc,
        basePrice: '58.00',
        initialStock: '10',
        selectedSizes: [],
        colors: [
          {
            id: `col-${Date.now()}-1`,
            metalColor: initialMetalColor,
            gemColor: initialGemColor,
            images: [],
            pendingFile: null,
            pendingPreviewUrl: '',
            pendingImageLabel: '',
            uploadingImage: false,
          },
        ],
      },
    ]);
  };

  const handleRemoveMaterial = (id: string) => {
    if (materialVariants.length <= 1) {
      alert('Debe existir al menos un material para el producto.');
      return;
    }
    setMaterialVariants((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMaterialChange = (matId: string, materialName: string) => {
    const found = materials.find((m) => m.name === materialName);
    setMaterialVariants((prev) =>
      prev.map((m) =>
        m.id === matId
          ? {
              ...m,
              materialName,
              description: found?.description || m.description,
            }
          : m
      )
    );
  };

  const handleMaterialFieldChange = (
    matId: string,
    field: keyof MaterialVariantState,
    value: string
  ) => {
    setMaterialVariants((prev) =>
      prev.map((m) => (m.id === matId ? { ...m, [field]: value } : m))
    );
  };

  // ==================== SIZE HANDLERS ====================
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
              {
                sizeName,
                priceOverride: '',
                stock: m.initialStock || '10',
              },
            ],
          };
        }
      })
    );
  };

  const handleSizePriceChange = (matId: string, sizeName: string, priceOverride: string) => {
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

  // Helper to parse image label
  const parseProductImageLabel = (label: string | null | undefined) => {
    if (!label) return { customLabel: '' };
    const trimmed = label.trim();
    if (trimmed.includes('|')) {
      const [matPart, rest] = trimmed.split('|').map((s) => s.trim());
      let finishPart = rest || '';
      let customLabel = '';
      if (finishPart.includes('-')) {
        const dashParts = finishPart.split('-');
        finishPart = dashParts[0].trim();
        customLabel = dashParts.slice(1).join('-').trim();
      }
      const slashParts = finishPart.split('/').map((s) => s.trim());
      return {
        material: matPart,
        metal: slashParts[0] || '',
        gem: slashParts[1] || '',
        customLabel,
      };
    }
    return { customLabel: trimmed };
  };

  // Helper to format image label cleanly without prefix recursion
  const formatImageLabel = (
    materialName: string,
    metalColor: string,
    gemColor: string | undefined,
    userLabel: string | undefined
  ) => {
    const parsed = parseProductImageLabel(userLabel);
    const cleanCustom = parsed.customLabel;
    const finish = `${metalColor || 'Estándar'}${gemColor ? ' / ' + gemColor : ''}`;
    return `${materialName} | ${finish}${cleanCustom ? ' - ' + cleanCustom : ''}`;
  };

  // ==================== COLOR & IMAGE FINISH HANDLERS ====================
  const handleAddColorFinish = (matId: string) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;

        // Find a unique metal + gem pair not already used in this material
        let chosenMetal = metalColorOptions[0]?.value || initialMetalColor;
        let chosenGem = gemColorOptions[0]?.value || initialGemColor;
        let foundUnique = false;

        for (const mOpt of metalColorOptions) {
          for (const gOpt of gemColorOptions) {
            const exists = m.colors.some(
              (c) => c.metalColor === mOpt.value && (c.gemColor || '') === (gOpt.value || '')
            );
            if (!exists) {
              chosenMetal = mOpt.value;
              chosenGem = gOpt.value;
              foundUnique = true;
              break;
            }
          }
          if (foundUnique) break;
        }

        if (!foundUnique) {
          setError(
            `⚠️ Ya has configurado todas las combinaciones de metal y gema posibles para "${m.materialName}".`
          );
          return m;
        }

        setError('');
        return {
          ...m,
          colors: [
            ...m.colors,
            {
              id: `col-${matId}-${Date.now()}`,
              metalColor: chosenMetal,
              gemColor: chosenGem,
              images: [],
              pendingFile: null,
              pendingPreviewUrl: '',
              pendingImageLabel: '',
              uploadingImage: false,
            },
          ],
        };
      })
    );
  };

  const handleRemoveColorFinish = (matId: string, colId: string) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        if (m.colors.length <= 1) {
          alert('Debe existir al menos un acabado/color para este material.');
          return m;
        }
        return {
          ...m,
          colors: m.colors.filter((c) => c.id !== colId),
        };
      })
    );
  };

  const handleColorChange = (
    matId: string,
    colId: string,
    field: 'metalColor' | 'gemColor',
    value: string
  ) => {
    const mat = materialVariants.find((m) => m.id === matId);
    const col = mat?.colors.find((c) => c.id === colId);
    if (mat && col) {
      const nextMetal = field === 'metalColor' ? value : col.metalColor;
      const nextGem = field === 'gemColor' ? value : col.gemColor || '';

      const isDuplicate = mat.colors.some(
        (c) =>
          c.id !== colId &&
          c.metalColor === nextMetal &&
          (c.gemColor || '') === nextGem
      );

      if (isDuplicate) {
        const finishName = `${nextMetal}${nextGem ? ' / ' + nextGem : ''}`;
        setError(
          `⚠️ La combinación "${finishName}" ya existe en este material. Elige una opción diferente.`
        );
        return;
      }
    }

    setError('');
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        return {
          ...m,
          colors: m.colors.map((c) => (c.id === colId ? { ...c, [field]: value } : c)),
        };
      })
    );
  };

  // File selection for a specific color finish
  const handleColorFileSelect = (
    matId: string,
    colId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    const preview = URL.createObjectURL(file);
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        return {
          ...m,
          colors: m.colors.map((c) =>
            c.id === colId
              ? {
                  ...c,
                  pendingFile: file,
                  pendingPreviewUrl: preview,
                  pendingImageLabel: '',
                }
              : c
          ),
        };
      })
    );
  };

  // Upload staged image for color finish
  const handleConfirmColorImageUpload = async (matId: string, colId: string) => {
    const targetMat = materialVariants.find((m) => m.id === matId);
    const targetCol = targetMat?.colors.find((c) => c.id === colId);
    if (!targetCol?.pendingFile) return;

    // Set uploading state
    setMaterialVariants((prev) =>
      prev.map((m) =>
        m.id === matId
          ? {
              ...m,
              colors: m.colors.map((c) => (c.id === colId ? { ...c, uploadingImage: true } : c)),
            }
          : m
      )
    );

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', targetCol.pendingFile);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        throw new Error('Error al subir la imagen al servidor');
      }

      const data = await res.json();
      const uploadedUrl = data.url;

      setMaterialVariants((prev) =>
        prev.map((m) => {
          if (m.id !== matId) return m;
          return {
            ...m,
            colors: m.colors.map((c) => {
              if (c.id !== colId) return c;
              const isFirstInProduct = !prev.some((pm) =>
                pm.colors.some((pc) => pc.images.length > 0)
              );
              const newImage: ColorImageItem = {
                url: uploadedUrl,
                label: targetCol.pendingImageLabel.trim() || undefined,
                isPrimary: isFirstInProduct && c.images.length === 0,
              };
              return {
                ...c,
                images: [...c.images, newImage],
                pendingFile: null,
                pendingPreviewUrl: '',
                pendingImageLabel: '',
                uploadingImage: false,
              };
            }),
          };
        })
      );
    } catch (err: any) {
      alert(err.message || 'Error al subir la fotografía.');
      setMaterialVariants((prev) =>
        prev.map((m) =>
          m.id === matId
            ? {
                ...m,
                colors: m.colors.map((c) =>
                  c.id === colId ? { ...c, uploadingImage: false } : c
                ),
              }
            : m
        )
      );
    }
  };

  const handleCancelColorPendingImage = (matId: string, colId: string) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        return {
          ...m,
          colors: m.colors.map((c) =>
            c.id === colId
              ? {
                  ...c,
                  pendingFile: null,
                  pendingPreviewUrl: '',
                  pendingImageLabel: '',
                }
              : c
          ),
        };
      })
    );
  };

  const handleRemoveColorImage = (matId: string, colId: string, imgIdx: number) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id !== matId) return m;
        return {
          ...m,
          colors: m.colors.map((c) => {
            if (c.id !== colId) return c;
            return {
              ...c,
              images: c.images.filter((_, idx) => idx !== imgIdx),
            };
          }),
        };
      })
    );
  };

  const handleSetPrimaryImage = (matId: string, colId: string, imgIdx: number) => {
    setMaterialVariants((prev) =>
      prev.map((m) => ({
        ...m,
        colors: m.colors.map((c) => ({
          ...c,
          images: c.images.map((img, idx) => ({
            ...img,
            isPrimary: m.id === matId && c.id === colId && idx === imgIdx,
          })),
        })),
      }))
    );
  };

  // ==================== SUBMIT FORM ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Mandatory photos & duplicate validation per finish
    for (const mat of materialVariants) {
      const comboSet = new Set<string>();

      for (const col of mat.colors) {
        const key = `${col.metalColor}|||${col.gemColor || ''}`;
        if (comboSet.has(key)) {
          const finishName = `${col.metalColor}${col.gemColor ? ' / ' + col.gemColor : ''}`;
          setError(
            `⚠️ La combinación "${finishName}" está repetida en "${mat.materialName}". Elimina o modifica la combinación duplicada.`
          );
          const el = document.getElementById(`color-finish-${col.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        comboSet.add(key);

        if (col.images.length === 0) {
          const finishName = col.metalColor
            ? `${col.metalColor}${col.gemColor ? ' / ' + col.gemColor : ''}`
            : 'Acabado Estándar';
          setError(
            `⚠️ La combinación de color "${finishName}" en "${mat.materialName}" debe tener al menos una fotografía subida.`
          );
          const el =
            document.getElementById(`color-finish-${col.id}`) ||
            document.getElementById(`material-colors-${mat.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
      }
    }

    // Collect all images across all color finishes with clean structured labels
    const allImages: { url: string; label?: string; isPrimary?: boolean; altText?: string }[] = [];
    materialVariants.forEach((m) => {
      m.colors.forEach((c) => {
        c.images.forEach((img) => {
          const formattedLabel = formatImageLabel(
            m.materialName,
            c.metalColor,
            c.gemColor,
            img.label
          );
          allImages.push({
            url: img.url,
            label: formattedLabel,
            isPrimary: img.isPrimary,
            altText: `${formData.title} - ${m.materialName} ${c.metalColor} ${c.gemColor || ''}`.trim(),
          });
        });
      });
    });

    if (allImages.length === 0) {
      setError('Debes subir al menos una fotografía para la joya en la sección de Colores y Fotografías.');
      return;
    }

    // Ensure at least one primary image
    if (!allImages.some((img) => img.isPrimary)) {
      allImages[0].isPrimary = true;
    }

    // Place primary image first
    allImages.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        shortDescription: formData.shortDescription || undefined,
        description: formData.description,
        tag: formData.tag.trim() || undefined,
        categoryId: formData.categoryId,
        collectionId: formData.collectionId ? formData.collectionId : undefined,
        isActive: formData.isActive,
        materials: materialVariants.map((m) => ({
          materialName: m.materialName,
          basePrice: parseFloat(m.basePrice) || 10,
          initialStock: parseInt(m.initialStock) || 10,
          sizes: m.selectedSizes.map((s) => ({
            sizeName: s.sizeName,
            price: s.priceOverride ? parseFloat(s.priceOverride) : null,
            stock: parseInt(s.stock || '10') || parseInt(m.initialStock) || 10,
          })),
          colors: m.colors.map((c) => ({
            metalColor: c.metalColor,
            gemColor: c.gemColor,
            imageUrls: c.images.map((img) => img.url),
          })),
        })),
        images: allImages,
      };

      const res = await adminCreateProductAction(payload);

      if (res.success) {
        router.push('/admin/productos');
        router.refresh();
      } else {
        setError(res.error || 'Error al guardar la joya.');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al crear el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl mx-auto pb-16">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3 shadow-xs animate-shake">
          <AlertCircle size={20} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#DFD0EC] pb-4">
          <div className="w-8 h-8 rounded-xl bg-[#F0E9F5] border border-[#DFD0EC] flex items-center justify-center text-[#3F235F] font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-zinc-900">
              Información General de la Joya
            </h3>
            <p className="text-xs text-zinc-500 font-light">
              Identidad de la pieza, categoría, colección y descripción oficial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Title */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold text-zinc-700 block">
              Nombre de la Joya <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Anillo Diamante Morado Royale"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-3 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-sm focus:outline-hidden focus:border-[#7043A0] focus:ring-1 focus:ring-[#7043A0] transition"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold text-zinc-700 block">
              Slug URL <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl px-4 py-2.5 text-xs text-zinc-500">
              <span className="shrink-0 text-zinc-400 font-mono">/productos/</span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-transparent border-none text-xs text-zinc-900 font-mono focus:outline-hidden pl-1"
              />
            </div>
          </div>

          {/* Category CustomSelect */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 block">
              Categoría de Joyería <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={formData.categoryId}
              onChange={(val) => setFormData({ ...formData, categoryId: val })}
              options={categoryOptions}
              triggerClassName="py-3 px-4 rounded-2xl bg-[#FAF8FC] border border-[#DFD0EC] text-xs font-semibold text-zinc-900 hover:border-[#7043A0]"
            />
          </div>

          {/* Collection CustomSelect */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 block">
              Colección Exclusiva <span className="text-zinc-400 font-normal">(Opcional)</span>
            </label>
            <CustomSelect
              value={formData.collectionId}
              onChange={(val) => setFormData({ ...formData, collectionId: val })}
              options={collectionOptions}
              triggerClassName="py-3 px-4 rounded-2xl bg-[#FAF8FC] border border-[#DFD0EC] text-xs font-semibold text-zinc-900 hover:border-[#7043A0]"
            />
          </div>

          {/* Badge / Tag */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold text-zinc-700 flex items-center justify-between">
              <span>Etiqueta / Badge Visual <span className="text-zinc-400 font-normal">(Opcional)</span></span>
              <span className="text-[11px] text-[#7043A0] font-normal">
                Ej: &ldquo;MÁS VENDIDO&rdquo;, &ldquo;AMATISTA ROYAL&rdquo;, &ldquo;EDICIÓN LIMITADA&rdquo;
              </span>
            </label>
            <input
              type="text"
              placeholder="Ej: MÁS VENDIDO"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-xs uppercase tracking-wider focus:outline-hidden focus:border-[#7043A0] transition"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold text-zinc-700 block">
              Descripción Breve <span className="text-zinc-400 font-normal">(Subtítulo en catálogo)</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Anillo de compromiso en plata 925 con gema amatista en corte diamante."
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-xs focus:outline-hidden focus:border-[#7043A0] transition"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold text-zinc-700 block">
              Descripción Detallada & Cuidados de la Joya <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe el significado, historia de la pieza, acabados finos y consejos para mantener su brillo intacto..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-xs leading-relaxed focus:outline-hidden focus:border-[#7043A0] transition"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: MATERIALES Y PRECIOS BASE (VARIANTE PRINCIPAL) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFD0EC] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F0E9F5] border border-[#DFD0EC] flex items-center justify-center text-[#3F235F] font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-sans text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Layers size={18} className="text-[#7043A0]" />
                Materiales & Precios Base (Variante Principal)
              </h3>
              <p className="text-xs text-zinc-500 font-light">
                Selecciona el tipo de material registrado en la base de datos y define su precio de venta en dólares.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddMaterial}
              disabled={!canAddMoreMaterials}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs border transition ${
                canAddMoreMaterials
                  ? 'bg-[#F0E9F5] hover:bg-[#E4D5EE] text-[#3F235F] border-[#DFD0EC] cursor-pointer'
                  : 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
              }`}
            >
              <Plus size={15} />
              <span>{canAddMoreMaterials ? 'Añadir Otro Material' : 'Todos los Materiales Añadidos'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {materialVariants.map((mat, mIdx) => {
            const officialMaterial = materials.find((m) => m.name === mat.materialName);
            const availableOptions = getAvailableMaterialOptions(mat.id);

            return (
              <div
                key={mat.id}
                id={`material-card-${mat.id}`}
                className="p-5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-3xl space-y-4 relative transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3F235F] flex items-center gap-2">
                    <RoisinDiamond size={13} color="#7043A0" /> Opción de Material #{mIdx + 1}
                  </span>
                  {materialVariants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(mat.id)}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-bold cursor-pointer transition p-1 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={13} /> Eliminar Material
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Material Select */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 block">Tipo de Material</label>
                    <CustomSelect
                      value={mat.materialName}
                      onChange={(val) => handleMaterialChange(mat.id, val)}
                      options={availableOptions}
                      triggerClassName="py-2.5 px-3.5 rounded-2xl bg-white border border-[#DFD0EC] text-xs font-semibold text-zinc-900"
                    />
                  </div>

                  {/* Base Price */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 block">
                      Precio de Venta ($ USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="48.00"
                        value={mat.basePrice}
                        onChange={(e) =>
                          handleMaterialFieldChange(mat.id, 'basePrice', e.target.value)
                        }
                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#DFD0EC] rounded-2xl text-sm font-bold text-[#3F235F] focus:outline-hidden focus:border-[#7043A0] transition"
                      />
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 block">Stock Inicial</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="15"
                      value={mat.initialStock}
                      onChange={(e) =>
                        handleMaterialFieldChange(mat.id, 'initialStock', e.target.value)
                      }
                      className="w-full px-4 py-2.5 bg-white border border-[#DFD0EC] rounded-2xl text-xs font-bold text-zinc-800 focus:outline-hidden focus:border-[#7043A0] transition"
                    />
                  </div>

                  {/* Official Description from DB (Read-only) */}
                  <div className="sm:col-span-3 p-3 bg-white border border-[#DFD0EC] rounded-2xl flex items-start gap-2.5">
                    <RoisinDiamond size={13} color="#7043A0" className="shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-zinc-800 block">
                        Descripción Oficial del Material (Catálogo):
                      </span>
                      <p className="text-zinc-500 font-light leading-relaxed">
                        {officialMaterial?.description ||
                          'Material certificado de joyería fina de alta durabilidad e hipoalergénico.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 3: TALLAS SEGÚN CATEGORÍA Y MATERIAL */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#DFD0EC] pb-4">
          <div className="w-8 h-8 rounded-xl bg-[#F0E9F5] border border-[#DFD0EC] flex items-center justify-center text-[#3F235F] font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Ruler size={18} className="text-[#7043A0]" />
              Tallas Disponibles por Categoría & Material
            </h3>
            <p className="text-xs text-zinc-500 font-light">
              Tallas registradas en base de datos para la categoría seleccionada. Si una talla tiene un costo diferente, ingresa su precio especial; de lo contrario se hereda automáticamente el precio del material.
            </p>
          </div>
        </div>

        {currentCategorySizes.length === 0 ? (
          <div className="p-6 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-center text-xs text-zinc-500">
            No hay tallas configuradas para esta categoría. Puedes gestionarlas en la sección de <strong>Tallas</strong> del panel.
          </div>
        ) : (
          <div className="space-y-6">
            {materialVariants.map((mat) => (
              <div
                key={`sizes-${mat.id}`}
                className="p-5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-3xl space-y-4"
              >
                <div className="flex items-center gap-2">
                  <RoisinDiamond size={13} color="#7043A0" />
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Tallas para: <span className="text-[#7043A0]">{mat.materialName}</span> (Precio Base: ${mat.basePrice})
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentCategorySizes.map((sz) => {
                    const isSelected = mat.selectedSizes.some((s) => s.sizeName === sz.name);
                    const currentSizeState = mat.selectedSizes.find((s) => s.sizeName === sz.name);

                    return (
                      <div
                        key={sz.id || sz.name}
                        className={`p-3.5 rounded-2xl border transition ${
                          isSelected
                            ? 'bg-white border-[#7043A0] shadow-xs'
                            : 'bg-white/60 border-[#DFD0EC] opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-zinc-800">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSize(mat.id, sz.name)}
                              className="w-4 h-4 rounded text-[#7043A0] focus:ring-[#7043A0] accent-[#7043A0] cursor-pointer"
                            />
                            <span>{sz.name}</span>
                            {sz.isAdjustable && (
                              <span className="text-[10px] bg-[#F0E9F5] text-[#3F235F] px-1.5 py-0.5 rounded-md font-medium">
                                Ajustable
                              </span>
                            )}
                          </label>
                        </div>

                        {isSelected && (
                          <div className="mt-2.5 pt-2.5 border-t border-[#DFD0EC] space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block">
                              Precio Especial ($) <span className="font-normal">(Opcional)</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder={`Hereda $${mat.basePrice}`}
                              value={currentSizeState?.priceOverride || ''}
                              onChange={(e) =>
                                handleSizePriceChange(mat.id, sz.name, e.target.value)
                              }
                              className="w-full px-3 py-1.5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-xl text-xs text-zinc-800 font-semibold focus:outline-hidden focus:border-[#7043A0]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 4: COLORES DE ACABADO (METAL + GEMA) Y FOTOGRAFÍAS ASOCIADAS */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#DFD0EC] pb-4">
          <div className="w-8 h-8 rounded-xl bg-[#F0E9F5] border border-[#DFD0EC] flex items-center justify-center text-[#3F235F] font-bold text-sm">
            4
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Palette size={18} className="text-[#7043A0]" />
              Colores & Fotografías Integradas
            </h3>
            <p className="text-xs text-zinc-500 font-light">
              Configura las combinaciones de color del metal y gema para cada material, y sube directamente las fotografías correspondientes desde tu ordenador.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {materialVariants.map((mat) => {
            const totalMatPhotos = mat.colors.reduce((sum, c) => sum + c.images.length, 0);
            const hasNoPhotos = totalMatPhotos === 0;

            return (
              <div
                key={`colors-${mat.id}`}
                id={`material-colors-${mat.id}`}
                className={`p-6 rounded-3xl space-y-6 transition-all border ${
                  hasNoPhotos
                    ? 'bg-[#FFF9F9] border-red-200 shadow-xs'
                    : 'bg-[#FAF8FC] border-[#DFD0EC]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFD0EC] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <RoisinDiamond size={15} color="#7043A0" />
                    <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                      Acabados y Fotos: <span className="text-[#7043A0]">{mat.materialName}</span>
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        hasNoPhotos
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {hasNoPhotos
                        ? '⚠️ Requiere al menos 1 fotografía'
                        : `✅ ${totalMatPhotos} fotografía(s) lista(s)`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddColorFinish(mat.id)}
                    className="inline-flex items-center gap-1 text-xs text-[#3F235F] font-bold hover:text-[#7043A0] bg-[#F0E9F5] px-3 py-1.5 rounded-xl border border-[#DFD0EC] cursor-pointer transition self-start sm:self-auto"
                  >
                    <Plus size={13} /> Añadir Otra Combinación de Color
                  </button>
                </div>

              <div className="space-y-6">
                {mat.colors.map((col, cIdx) => {
                  const colHasPhotos = col.images.length > 0;

                  return (
                    <div
                      key={col.id}
                      id={`color-finish-${col.id}`}
                      className={`p-5 rounded-2xl space-y-4 shadow-2xs border transition-all ${
                        !colHasPhotos
                          ? 'bg-[#FFFDF9] border-amber-300 ring-1 ring-amber-300/30'
                          : 'bg-white border-[#DFD0EC]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="w-5 h-5 rounded-full bg-[#F0E9F5] text-[#3F235F] text-[10px] font-bold flex items-center justify-center shrink-0">
                            {cIdx + 1}
                          </span>
                          {/* Visual Dual Color Swatch */}
                          {(() => {
                            const styleInfo = getSplitColorStyle(
                              `${col.metalColor}${col.gemColor ? ' / ' + col.gemColor : ''}`
                            );
                            return (
                              <div
                                className="w-5 h-5 rounded-full relative overflow-hidden border border-black/15 shadow-2xs shrink-0"
                                style={{ background: styleInfo.background }}
                                title={`${col.metalColor}${col.gemColor ? ' / ' + col.gemColor : ''}`}
                              >
                                {styleInfo.isSplit && (
                                  <div className="absolute inset-0 border-t border-black/25 -rotate-45 scale-150 origin-center pointer-events-none" />
                                )}
                              </div>
                            );
                          })()}
                          <span className="text-xs font-bold text-zinc-800">
                            Combinación de Color #{cIdx + 1}:
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400 font-normal">
                            ({getColorHex(col.metalColor) || '#E5E7EB'}
                            {col.gemColor && getColorHex(col.gemColor)
                              ? ` / ${getColorHex(col.gemColor)}`
                              : ''})
                          </span>
                          <span
                            className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                              !colHasPhotos
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {!colHasPhotos
                              ? '⚠️ Requiere al menos 1 fotografía'
                              : `✅ ${col.images.length} foto(s) lista(s)`}
                          </span>
                        </div>

                        {mat.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColorFinish(mat.id, col.id)}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-bold cursor-pointer self-start sm:self-auto"
                          >
                            <Trash2 size={12} /> Eliminar Color
                          </button>
                        )}
                      </div>

                    {/* Color Selects */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-bold text-zinc-700 block">Color del Metal</label>
                        <CustomSelect
                          value={col.metalColor}
                          onChange={(val) => handleColorChange(mat.id, col.id, 'metalColor', val)}
                          options={metalColorOptions}
                          triggerClassName="py-2.5 px-3.5 rounded-xl bg-[#FAF8FC] border border-[#DFD0EC] text-xs font-semibold text-zinc-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-zinc-700 block">Color / Tipo de Gema</label>
                        <CustomSelect
                          value={col.gemColor}
                          onChange={(val) => handleColorChange(mat.id, col.id, 'gemColor', val)}
                          options={gemColorOptions}
                          triggerClassName="py-2.5 px-3.5 rounded-xl bg-[#FAF8FC] border border-[#DFD0EC] text-xs font-semibold text-zinc-900"
                        />
                      </div>
                    </div>

                    {/* Subida de Fotografías para esta combinación */}
                    <div className="pt-3 border-t border-[#DFD0EC] space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
                        Fotografías de este acabado ({col.metalColor} + {col.gemColor})
                      </span>

                      {/* Staged Image Upload Box */}
                      {col.pendingPreviewUrl ? (
                        <div className="p-4 bg-[#F0E9F5] border border-[#DFD0EC] rounded-2xl space-y-3">
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#DFD0EC] bg-white shrink-0 shadow-xs">
                              <Image
                                src={col.pendingPreviewUrl}
                                alt="Vista Previa"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 w-full space-y-2 text-xs">
                              <p className="font-bold text-zinc-800 truncate">
                                {col.pendingFile?.name}
                              </p>
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-[#3F235F] block">
                                  Etiqueta de la Foto <span className="font-normal">(Opcional)</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Frontal, Puesto en modelo, Detalle amatista..."
                                  value={col.pendingImageLabel}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setMaterialVariants((prev) =>
                                      prev.map((pm) =>
                                        pm.id === mat.id
                                          ? {
                                              ...pm,
                                              colors: pm.colors.map((pc) =>
                                                pc.id === col.id
                                                  ? { ...pc, pendingImageLabel: val }
                                                  : pc
                                              ),
                                            }
                                          : pm
                                      )
                                    );
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-[#DFD0EC] rounded-xl text-xs focus:outline-hidden focus:border-[#7043A0]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-[#DFD0EC]/60">
                            <button
                              type="button"
                              onClick={() => handleCancelColorPendingImage(mat.id, col.id)}
                              className="text-xs px-3.5 py-1.5 rounded-xl border border-[#DFD0EC] bg-white text-zinc-600 font-bold hover:bg-[#FAF8FC] cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={col.uploadingImage}
                              onClick={() => handleConfirmColorImageUpload(mat.id, col.id)}
                              className="text-xs px-4 py-1.5 rounded-xl btn-purple-diamond font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              {col.uploadingImage ? (
                                'Subiendo...'
                              ) : (
                                <>
                                  <Upload size={13} /> Añadir Foto a este Color
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#DFD0EC] hover:border-[#7043A0] rounded-2xl bg-[#FAF8FC] hover:bg-[#F0E9F5]/40 transition cursor-pointer text-center group">
                            <Upload
                              size={22}
                              className="text-[#7043A0] group-hover:scale-110 transition-transform mb-1.5"
                            />
                            <span className="text-xs font-bold text-zinc-800">
                              Seleccionar fotografía desde el equipo
                            </span>
                            <span className="text-[10px] text-zinc-400 font-light mt-0.5">
                              Formatos JPG, PNG, WEBP de alta calidad
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleColorFileSelect(mat.id, col.id, e)}
                            />
                          </label>
                        </div>
                      )}

                      {/* Galería de fotos agregadas a este color */}
                      {col.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                          {col.images.map((img, imgIdx) => (
                            <div
                              key={img.url}
                              className={`relative rounded-2xl overflow-hidden border p-1 bg-[#FAF8FC] group ${
                                img.isPrimary
                                  ? 'border-[#7043A0] ring-2 ring-[#7043A0]/30'
                                  : 'border-[#DFD0EC]'
                              }`}
                            >
                              <div className="relative aspect-square rounded-xl overflow-hidden bg-white">
                                <Image
                                  src={img.url}
                                  alt={img.label || 'Foto de la joya'}
                                  fill
                                  className="object-cover"
                                />
                                {img.isPrimary && (
                                  <span className="absolute top-1 left-1 bg-[#7043A0] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                                    <Star size={9} fill="white" /> Principal
                                  </span>
                                )}
                              </div>
                              <div className="p-1.5 text-[10px] flex items-center justify-between">
                                <span className="font-bold text-zinc-700 truncate block max-w-[70px]">
                                  {img.label || `Foto #${imgIdx + 1}`}
                                </span>
                                <div className="flex items-center gap-1">
                                  {!img.isPrimary && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSetPrimaryImage(mat.id, col.id, imgIdx)
                                      }
                                      className="text-[9px] text-[#7043A0] font-bold hover:underline cursor-pointer"
                                      title="Marcar como foto principal"
                                    >
                                      Principal
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveColorImage(mat.id, col.id, imgIdx)
                                    }
                                    className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                                    title="Eliminar foto"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 5: ESTADO DE LA PUBLICACIÓN (TIENDA VS BORRADOR ADMIN) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#DFD0EC] pb-4">
          <div className="w-8 h-8 rounded-xl bg-[#F0E9F5] border border-[#DFD0EC] flex items-center justify-center text-[#3F235F] font-bold text-sm">
            5
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Eye size={18} className="text-[#7043A0]" />
              Estado de la Publicación & Visibilidad
            </h3>
            <p className="text-xs text-zinc-500 font-light">
              Define si la joya será visible inmediatamente para todos los clientes en la tienda o si se guardará como borrador oculto para revisión interna del administrador.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Opción 1: Publicar Inmediatamente */}
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, isActive: true }))}
            className={`p-5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
              formData.isActive
                ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-[#FAF8FC] border-[#DFD0EC] hover:border-emerald-300'
            }`}
          >
            <div
              className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                formData.isActive ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              <CheckCircle2 size={18} />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                Publicar en la Tienda
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Público
                </span>
              </span>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                La joya estará visible de inmediato en el catálogo, buscador y páginas para todos los clientes.
              </p>
            </div>
          </button>

          {/* Opción 2: Guardar como Borrador Oculto */}
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, isActive: false }))}
            className={`p-5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
              !formData.isActive
                ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-[#FAF8FC] border-[#DFD0EC] hover:border-amber-300'
            }`}
          >
            <div
              className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                !formData.isActive ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              <EyeOff size={18} />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                Guardar como Borrador Oculto
                <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Solo Admin
                </span>
              </span>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Solo el Administrador podrá ver y revisar la joya en el panel. No aparecerá en la tienda pública hasta que decidas publicarla.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACCIONES Y BOTÓN DE GUARDADO */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-[#DFD0EC]">
        <Link
          href="/admin/productos"
          className="w-full sm:w-auto text-center px-6 py-3 rounded-2xl border border-[#DFD0EC] bg-white hover:bg-[#FAF8FC] text-zinc-700 text-xs font-bold transition"
        >
          Cancelar y Volver al Catálogo
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl btn-purple-diamond text-sm font-bold shadow-lg transition cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Guardando Joya en Catálogo...' : 'Guardar y Publicar Joya'}
        </button>
      </div>
    </form>
  );
}

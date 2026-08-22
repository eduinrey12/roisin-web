'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { adminUpdateProductAction } from '@/lib/actions/admin.actions';
import {
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  Image as ImageIcon,
  Layers,
  Palette,
  Ruler,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
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

interface ProductEditFormProps {
  product: {
    id: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    description: string;
    tag?: string | null;
    basePrice: any;
    compareAtPrice?: any;
    discountPercent?: number | null;
    categoryId: string;
    isActive: boolean;
    collections?: { collectionId: string }[];
    images: { url: string; label?: string | null; altText?: string | null; isPrimary: boolean }[];
    variants: {
      id: string;
      sku: string;
      price: any;
      inventory?: { quantity: number } | null;
      attributes?: {
        attributeValue: { value: string; attribute: { name: string } };
      }[];
    }[];
  };
  categories: CategoryItem[];
  collections?: CollectionItem[];
  materials?: MaterialItem[];
  categorySizes?: CategorySizeItem[];
  jewelryColors?: JewelryColorItem[];
}

// Helper to parse image label and extract custom label, material, and finish
function parseProductImageLabel(label: string | null | undefined): {
  material?: string;
  metal?: string;
  gem?: string;
  customLabel: string;
} {
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
    const metal = slashParts[0] || '';
    const gem = slashParts[1] || '';

    return {
      material: matPart,
      metal,
      gem,
      customLabel,
    };
  }

  return { customLabel: trimmed };
}

// Helper to format image label cleanly without prefix duplication
function formatImageLabel(
  materialName: string,
  metalColor: string,
  gemColor: string | undefined,
  userLabel: string | undefined
): string {
  const parsed = parseProductImageLabel(userLabel);
  const cleanCustom = parsed.customLabel;
  const finish = `${metalColor || 'Estándar'}${gemColor ? ' / ' + gemColor : ''}`;
  return `${materialName} | ${finish}${cleanCustom ? ' - ' + cleanCustom : ''}`;
}

export default function ProductEditForm({
  product,
  categories,
  collections = [],
  materials = [],
  categorySizes = [],
  jewelryColors = [],
}: ProductEditFormProps) {
  const router = useRouter();

  // Basic Info Form State
  const [formData, setFormData] = useState({
    title: product.title || '',
    slug: product.slug || '',
    shortDescription: product.shortDescription || '',
    description: product.description || '',
    tag: product.tag || '',
    categoryId: product.categoryId || categories[0]?.id || '',
    collectionId: product.collections?.[0]?.collectionId || '',
    isActive: product.isActive !== undefined ? product.isActive : true,
  });

  // Reconstruct materialVariants accurately from existing product data
  const initialMaterialVariants = useMemo<MaterialVariantState[]>(() => {
    const matMap: Record<
      string,
      {
        prices: number[];
        stocks: number[];
        sizes: Map<string, { priceOverride?: string; stock?: string }>;
        colors: Map<string, { metal: string; gem: string }>;
      }
    > = {};

    product.variants.forEach((v) => {
      let mat = '';
      let colorVal = '';
      let sizeVal = '';

      v.attributes?.forEach((a) => {
        const attrName = a.attributeValue.attribute.name.toLowerCase();
        const val = a.attributeValue.value.trim();

        if (attrName.includes('material')) mat = val;
        else if (attrName.includes('color') || attrName.includes('acabado')) colorVal = val;
        else if (attrName.includes('talla') || attrName.includes('medida')) sizeVal = val;
      });

      if (!mat) mat = materials[0]?.name || 'Plata de Ley 925';

      if (!matMap[mat]) {
        matMap[mat] = {
          prices: [],
          stocks: [],
          sizes: new Map(),
          colors: new Map(),
        };
      }

      const pNum = Number(v.price) || Number(product.basePrice) || 48;
      const sNum = v.inventory?.quantity ?? 15;

      matMap[mat].prices.push(pNum);
      matMap[mat].stocks.push(sNum);

      if (sizeVal && !matMap[mat].sizes.has(sizeVal)) {
        matMap[mat].sizes.set(sizeVal, {
          priceOverride: pNum !== Number(product.basePrice) ? String(pNum) : '',
          stock: String(sNum),
        });
      }

      if (colorVal && !matMap[mat].colors.has(colorVal)) {
        const parts = colorVal.split('/').map((s) => s.trim());
        matMap[mat].colors.set(colorVal, {
          metal: parts[0] || 'Plateado Rodio',
          gem: parts[1] || '',
        });
      }
    });

    const entries = Object.entries(matMap);
    if (entries.length === 0) {
      const defaultMat = materials[0]?.name || 'Plata de Ley 925';
      const defaultDesc = materials[0]?.description || 'Plata fina de ley 925 certificada.';
      return [
        {
          id: 'mat-1',
          materialName: defaultMat,
          description: defaultDesc,
          basePrice: String(product.basePrice || '48.00'),
          initialStock: '15',
          selectedSizes: [],
          colors: [
            {
              id: 'col-1-1',
              metalColor: jewelryColors.find((c) => c.type === 'METAL')?.name || 'Plateado Rodio',
              gemColor: jewelryColors.find((c) => c.type === 'GEM')?.name || '',
              images: product.images.map((img) => ({
                url: img.url,
                label: parseProductImageLabel(img.label).customLabel,
                isPrimary: img.isPrimary,
              })),
              pendingFile: null,
              pendingPreviewUrl: '',
              pendingImageLabel: '',
              uploadingImage: false,
            },
          ],
        },
      ];
    }

    return entries.map(([matName, matData], mIdx) => {
      const officialMat = materials.find((m) => m.name === matName);
      const minPrice =
        matData.prices.length > 0 ? Math.min(...matData.prices) : Number(product.basePrice) || 48;
      const avgStock = matData.stocks.length > 0 ? matData.stocks[0] : 15;

      const reconstructedSizes = Array.from(matData.sizes.entries()).map(([szName, szData]) => ({
        sizeName: szName,
        priceOverride: szData.priceOverride || '',
        stock: szData.stock || String(avgStock),
      }));

      const reconstructedColors: ColorFinishState[] = [];
      const colorEntries = Array.from(matData.colors.entries());

      if (colorEntries.length === 0) {
        // Find images strictly matching this material
        const matImages = product.images.filter((img) => {
          const parsed = parseProductImageLabel(img.label);
          if (parsed.material) {
            return parsed.material.toLowerCase() === matName.toLowerCase();
          }
          const l = (img.label || '').toLowerCase();
          return l.includes(matName.toLowerCase());
        });

        reconstructedColors.push({
          id: `col-${mIdx + 1}-1`,
          metalColor: jewelryColors.find((c) => c.type === 'METAL')?.name || 'Plateado Rodio',
          gemColor: jewelryColors.find((c) => c.type === 'GEM')?.name || '',
          images: matImages.map((img) => ({
            url: img.url,
            label: parseProductImageLabel(img.label).customLabel,
            isPrimary: img.isPrimary,
          })),
          pendingFile: null,
          pendingPreviewUrl: '',
          pendingImageLabel: '',
          uploadingImage: false,
        });
      } else {
        colorEntries.forEach(([colKey, colObj], cIdx) => {
          // Find images strictly matching this material AND this specific finish
          const matchingImages = product.images.filter((img) => {
            const parsed = parseProductImageLabel(img.label);
            if (parsed.material) {
              const matMatch = parsed.material.toLowerCase() === matName.toLowerCase();
              const metalMatch =
                !parsed.metal || parsed.metal.toLowerCase() === colObj.metal.toLowerCase();
              const gemMatch =
                !parsed.gem || parsed.gem.toLowerCase() === (colObj.gem || '').toLowerCase();
              return matMatch && metalMatch && (gemMatch || !colObj.gem);
            }

            const rawLabel = (img.label || '').toLowerCase();
            const alt = (img.altText || '').toLowerCase();
            const combined = `${rawLabel} ${alt}`;

            const matchesMat = combined.includes(matName.toLowerCase());
            const matchesMetal = combined.includes(colObj.metal.toLowerCase());
            const matchesGem = colObj.gem ? combined.includes(colObj.gem.toLowerCase()) : true;
            return matchesMat && matchesMetal && matchesGem;
          });

          reconstructedColors.push({
            id: `col-${mIdx + 1}-${cIdx + 1}`,
            metalColor: colObj.metal,
            gemColor: colObj.gem,
            images: matchingImages.map((img) => ({
              url: img.url,
              label: parseProductImageLabel(img.label).customLabel,
              isPrimary: img.isPrimary,
            })),
            pendingFile: null,
            pendingPreviewUrl: '',
            pendingImageLabel: '',
            uploadingImage: false,
          });
        });
      }

      return {
        id: `mat-${mIdx + 1}`,
        materialName: matName,
        description:
          officialMat?.description ||
          'Material certificado de joyería fina de alta durabilidad e hipoalergénico.',
        basePrice: String(minPrice),
        initialStock: String(avgStock),
        selectedSizes: reconstructedSizes,
        colors: reconstructedColors,
      };
    });
  }, [product, materials, jewelryColors]);

  const [materialVariants, setMaterialVariants] =
    useState<MaterialVariantState[]>(initialMaterialVariants);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown options
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

  const currentCategorySizes = useMemo(() => {
    return categorySizes.filter((s) => s.categoryId === formData.categoryId);
  }, [categorySizes, formData.categoryId]);

  const metalColorOptions = useMemo(() => {
    const metals = jewelryColors.filter((c) => c.type === 'METAL');
    if (metals.length > 0) {
      return metals.map((c) => ({ value: c.name, label: c.name }));
    }
    return [
      { value: 'Plateado Rodio', label: 'Plateado Rodio' },
      { value: 'Baño Oro 18k (Dorado)', label: 'Baño Oro 18k (Dorado)' },
      { value: 'Oro Rosa', label: 'Oro Rosa' },
    ];
  }, [jewelryColors]);

  const gemColorOptions = useMemo(() => {
    const gems = jewelryColors.filter((c) => c.type === 'GEM');
    if (gems.length > 0) {
      return [
        { value: '', label: 'Sin Gema / Solo Metal Liso' },
        ...gems.map((c) => ({ value: c.name, label: c.name })),
      ];
    }
    return [
      { value: '', label: 'Sin Gema / Solo Metal Liso' },
      { value: 'Amatista Morada (Sello Roisin)', label: 'Amatista Morada (Sello Roisin)' },
      { value: 'Circonia Blanca Brillante', label: 'Circonia Blanca Brillante' },
      { value: 'Esmeralda Verde', label: 'Esmeralda Verde' },
      { value: 'Rubí Rojo Pasión', label: 'Rubí Rojo Pasión' },
      { value: 'Zafiro Azul Real', label: 'Zafiro Azul Real' },
    ];
  }, [jewelryColors]);

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
      { value: 'Oro Rosa 14k', label: 'Oro Rosa 14k' },
      { value: 'Acero Titanio 316L', label: 'Acero Titanio 316L' },
    ].filter((m) => !selectedInOtherCards.includes(m.value));
  };

  const canAddMoreMaterials = useMemo(() => {
    const maxAvailable = materials.length > 0 ? materials.length : 4;
    return materialVariants.length < maxAvailable;
  }, [materials, materialVariants.length]);

  // Handlers for Materials
  const handleAddMaterial = () => {
    if (!canAddMoreMaterials) return;
    const usedNames = new Set(materialVariants.map((m) => m.materialName));
    const nextMat = materials.find((m) => !usedNames.has(m.name)) || materials[0];
    const matName = nextMat?.name || 'Baño de Oro 18k';
    const matDesc = nextMat?.description || 'Material fino de joyería certificado.';

    setMaterialVariants((prev) => [
      ...prev,
      {
        id: `mat-${Date.now()}`,
        materialName: matName,
        description: matDesc,
        basePrice: '52.00',
        initialStock: '10',
        selectedSizes: [],
        colors: [
          {
            id: `col-${Date.now()}-1`,
            metalColor: metalColorOptions[0]?.value || 'Plateado Rodio',
            gemColor: gemColorOptions[0]?.value || '',
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
    if (materialVariants.length <= 1) return;
    setMaterialVariants((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMaterialChange = (matId: string, newMatName: string) => {
    const official = materials.find((m) => m.name === newMatName);
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id === matId) {
          return {
            ...m,
            materialName: newMatName,
            description:
              official?.description ||
              'Material certificado de joyería fina de alta durabilidad e hipoalergénico.',
          };
        }
        return m;
      })
    );
  };

  const handleMaterialFieldChange = (
    matId: string,
    field: 'basePrice' | 'initialStock',
    val: string
  ) => {
    setMaterialVariants((prev) =>
      prev.map((m) => (m.id === matId ? { ...m, [field]: val } : m))
    );
  };

  // Handlers for Sizes
  const handleToggleSize = (matId: string, sizeName: string) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id === matId) {
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
        }
        return m;
      })
    );
  };

  const handleSizeOverrideChange = (
    matId: string,
    sizeName: string,
    field: 'priceOverride' | 'stock',
    val: string
  ) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id === matId) {
          return {
            ...m,
            selectedSizes: m.selectedSizes.map((s) =>
              s.sizeName === sizeName ? { ...s, [field]: val } : s
            ),
          };
        }
        return m;
      })
    );
  };

  // Handlers for Colors & Images with Duplicate Combination Prevention
  const handleAddColorFinish = (matId: string) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id === matId) {
          // Find a unique metal + gem pair not already used in this material
          let chosenMetal = metalColorOptions[0]?.value || 'Plateado Rodio';
          let chosenGem = gemColorOptions[0]?.value || '';
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
              `⚠️ Ya has agregado todas las combinaciones de metal y gema posibles para "${m.materialName}".`
            );
            return m;
          }

          setError('');
          return {
            ...m,
            colors: [
              ...m.colors,
              {
                id: `col-${Date.now()}-${m.colors.length + 1}`,
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
        }
        return m;
      })
    );
  };

  const handleRemoveColorFinish = (matId: string, colId: string) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id === matId) {
          if (m.colors.length <= 1) return m;
          return {
            ...m,
            colors: m.colors.filter((c) => c.id !== colId),
          };
        }
        return m;
      })
    );
  };

  const handleColorChange = (
    matId: string,
    colId: string,
    field: 'metalColor' | 'gemColor',
    val: string
  ) => {
    const mat = materialVariants.find((m) => m.id === matId);
    const col = mat?.colors.find((c) => c.id === colId);
    if (mat && col) {
      const nextMetal = field === 'metalColor' ? val : col.metalColor;
      const nextGem = field === 'gemColor' ? val : col.gemColor || '';

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
        if (m.id === matId) {
          return {
            ...m,
            colors: m.colors.map((c) => (c.id === colId ? { ...c, [field]: val } : c)),
          };
        }
        return m;
      })
    );
  };

  // Staging & Uploading Photos
  const handleFileSelect = (matId: string, colId: string, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id === matId) {
          return {
            ...m,
            colors: m.colors.map((c) => {
              if (c.id === colId) {
                return {
                  ...c,
                  pendingFile: file,
                  pendingPreviewUrl: previewUrl,
                  pendingImageLabel: '',
                };
              }
              return c;
            }),
          };
        }
        return m;
      })
    );
  };

  const handleConfirmUpload = async (matId: string, colId: string) => {
    const mat = materialVariants.find((m) => m.id === matId);
    const col = mat?.colors.find((c) => c.id === colId);
    if (!col || !col.pendingFile) return;

    setMaterialVariants((prev) =>
      prev.map((m) =>
        m.id === matId
          ? {
              ...m,
              colors: m.colors.map((c) =>
                c.id === colId ? { ...c, uploadingImage: true } : c
              ),
            }
          : m
      )
    );

    try {
      const uploadData = new FormData();
      uploadData.append('file', col.pendingFile);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: uploadData,
      });

      if (!res.ok) {
        throw new Error('Error al subir el archivo al servidor');
      }

      const json = await res.json();
      const serverUrl = json.url;

      setMaterialVariants((prev) =>
        prev.map((m) => {
          if (m.id === matId) {
            return {
              ...m,
              colors: m.colors.map((c) => {
                if (c.id === colId) {
                  const isFirst = c.images.length === 0 && m.id === materialVariants[0]?.id;
                  return {
                    ...c,
                    images: [
                      ...c.images,
                      {
                        url: serverUrl,
                        label: c.pendingImageLabel || '',
                        isPrimary: isFirst,
                      },
                    ],
                    pendingFile: null,
                    pendingPreviewUrl: '',
                    pendingImageLabel: '',
                    uploadingImage: false,
                  };
                }
                return c;
              }),
            };
          }
          return m;
        })
      );
    } catch (err: any) {
      setError(err.message || 'Error en la subida de fotografía');
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

  const handleCancelPending = (matId: string, colId: string) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id === matId) {
          return {
            ...m,
            colors: m.colors.map((c) => {
              if (c.id === colId) {
                if (c.pendingPreviewUrl) URL.revokeObjectURL(c.pendingPreviewUrl);
                return {
                  ...c,
                  pendingFile: null,
                  pendingPreviewUrl: '',
                  pendingImageLabel: '',
                  uploadingImage: false,
                };
              }
              return c;
            }),
          };
        }
        return m;
      })
    );
  };

  const handleRemoveColorImage = (matId: string, colId: string, imgIdx: number) => {
    setMaterialVariants((prev) =>
      prev.map((m) => {
        if (m.id === matId) {
          return {
            ...m,
            colors: m.colors.map((c) => {
              if (c.id === colId) {
                const updated = c.images.filter((_, idx) => idx !== imgIdx);
                return { ...c, images: updated };
              }
              return c;
            }),
          };
        }
        return m;
      })
    );
  };

  const handleSetPrimaryImage = (matId: string, colId: string, imgIdx: number) => {
    setMaterialVariants((prev) =>
      prev.map((m) => ({
        ...m,
        colors: m.colors.map((c) => ({
          ...c,
          images: c.images.map((img, i) => ({
            ...img,
            isPrimary: m.id === matId && c.id === colId && i === imgIdx,
          })),
        })),
      }))
    );
  };

  // Submit Update Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

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

      const res = await adminUpdateProductAction(product.id, payload);

      if (!res.success) {
        setError(res.error || 'Error al actualizar la joya');
        setLoading(false);
        return;
      }

      setSuccessMsg('✅ Joya actualizada exitosamente.');
      setTimeout(() => {
        router.push('/admin/productos');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error inesperado al guardar');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFD0EC] pb-6">
        <div>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-1.5 text-xs text-[#7043A0] hover:text-[#3F235F] font-bold mb-2 transition"
          >
            <ArrowLeft size={14} /> Volver al Catálogo
          </Link>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F] block">
            <RoisinDiamond size={13} color="#7043A0" /> Edición de Catálogo
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
            Editar Joya: <span className="text-[#7043A0]">{product.title}</span>
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Modifica textos, materiales, precios, combinaciones de color, fotografías y estado de visibilidad.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="px-5 py-2.5 rounded-2xl border border-[#DFD0EC] bg-white hover:bg-[#FAF8FC] text-zinc-700 text-xs font-bold transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl btn-purple-diamond text-xs font-bold shadow-md transition cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Guardando Cambios...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-3 shadow-xs">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-3 shadow-xs">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span className="font-bold">{successMsg}</span>
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
            <h3 className="font-sans text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles size={18} className="text-[#7043A0]" />
              Información General de la Joya
            </h3>
            <p className="text-xs text-zinc-500 font-light">
              Datos descriptivos principales, categoría y colección.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Título */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold text-zinc-700 block">
              Nombre de la Joya <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-sm font-semibold text-zinc-900 focus:outline-hidden focus:border-[#7043A0] transition"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 block">
              Slug URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-3 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-xs font-mono text-zinc-600 focus:outline-hidden focus:border-[#7043A0] transition"
            />
          </div>

          {/* Badge / Etiqueta Opcional */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 block">
              Etiqueta / Badge <span className="text-zinc-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Nuevo, Edición Limitada..."
              value={formData.tag}
              onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
              className="w-full px-4 py-3 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-xs text-zinc-800 focus:outline-hidden focus:border-[#7043A0] transition"
            />
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 block">
              Categoría de Joyería <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={formData.categoryId}
              onChange={(val) => setFormData((prev) => ({ ...prev, categoryId: val }))}
              options={categoryOptions}
              triggerClassName="py-3 px-4 rounded-2xl bg-[#FAF8FC] border border-[#DFD0EC] text-xs font-semibold text-zinc-900"
            />
          </div>

          {/* Colección Exclusiva */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 block">
              Colección Exclusiva <span className="text-zinc-400 font-normal">(Opcional)</span>
            </label>
            <CustomSelect
              value={formData.collectionId}
              onChange={(val) => setFormData((prev) => ({ ...prev, collectionId: val }))}
              options={collectionOptions}
              triggerClassName="py-3 px-4 rounded-2xl bg-[#FAF8FC] border border-[#DFD0EC] text-xs font-semibold text-zinc-900"
            />
          </div>

          {/* Descripción Corta */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold text-zinc-700 block">
              Descripción Corta <span className="text-zinc-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))
              }
              className="w-full px-4 py-2.5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-xs focus:outline-hidden focus:border-[#7043A0] transition"
            />
          </div>

          {/* Descripción Completa */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="font-bold text-zinc-700 block">
              Descripción Detallada <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-4 py-3 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-xs focus:outline-hidden focus:border-[#7043A0] transition"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: MATERIALES & PRECIOS BASE */}
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
                Materiales & Precios Base
              </h3>
              <p className="text-xs text-zinc-500 font-light">
                Gestiona los tipos de material y sus precios de venta base.
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
                  {/* Tipo de Material */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-700 block">Tipo de Material</label>
                    <CustomSelect
                      value={mat.materialName}
                      onChange={(val) => handleMaterialChange(mat.id, val)}
                      options={availableOptions}
                      triggerClassName="py-2.5 px-3.5 rounded-2xl bg-white border border-[#DFD0EC] text-xs font-semibold text-zinc-900"
                    />
                  </div>

                  {/* Precio Base */}
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
                      value={mat.initialStock}
                      onChange={(e) =>
                        handleMaterialFieldChange(mat.id, 'initialStock', e.target.value)
                      }
                      className="w-full px-4 py-2.5 bg-white border border-[#DFD0EC] rounded-2xl text-xs font-bold text-zinc-800 focus:outline-hidden focus:border-[#7043A0] transition"
                    />
                  </div>

                  {/* Descripción Oficial */}
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
      {/* SECCIÓN 3: TALLAS & MEDIDAS POR MATERIAL */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#DFD0EC] pb-4">
          <div className="w-8 h-8 rounded-xl bg-[#F0E9F5] border border-[#DFD0EC] flex items-center justify-center text-[#3F235F] font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Ruler size={18} className="text-[#7043A0]" />
              Tallas & Medidas por Material
            </h3>
            <p className="text-xs text-zinc-500 font-light">
              Tallas registradas para la categoría seleccionada. Activa las disponibles y define precios especiales si aplica.
            </p>
          </div>
        </div>

        {currentCategorySizes.length === 0 ? (
          <div className="p-6 bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl text-center text-xs text-zinc-500">
            Esta categoría no tiene tallas registradas en la base de datos (o es de talla única / estándar).
          </div>
        ) : (
          <div className="space-y-6">
            {materialVariants.map((mat) => (
              <div
                key={`sizes-${mat.id}`}
                className="p-5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-3xl space-y-4"
              >
                <div className="flex items-center gap-2 border-b border-[#DFD0EC] pb-2">
                  <RoisinDiamond size={13} color="#7043A0" />
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Tallas para: <span className="text-[#7043A0]">{mat.materialName}</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {currentCategorySizes.map((size) => {
                    const isSelected = mat.selectedSizes.some((s) => s.sizeName === size.name);
                    const selectedData = mat.selectedSizes.find((s) => s.sizeName === size.name);

                    return (
                      <div
                        key={size.id}
                        className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                          isSelected
                            ? 'bg-white border-[#7043A0] shadow-xs'
                            : 'bg-white/60 border-[#DFD0EC] opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSize(mat.id, size.name)}
                              className="w-4 h-4 rounded text-[#7043A0] focus:ring-[#7043A0]"
                            />
                            <span>{size.name}</span>
                          </label>
                        </div>

                        {isSelected && (
                          <div className="pt-2 border-t border-[#DFD0EC]/60 grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-zinc-500 block text-[10px]">Precio ($)</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder={`$${mat.basePrice}`}
                                value={selectedData?.priceOverride || ''}
                                onChange={(e) =>
                                  handleSizeOverrideChange(
                                    mat.id,
                                    size.name,
                                    'priceOverride',
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 bg-[#FAF8FC] border border-[#DFD0EC] rounded-lg text-xs font-bold text-[#3F235F]"
                              />
                            </div>
                            <div>
                              <span className="text-zinc-500 block text-[10px]">Stock</span>
                              <input
                                type="number"
                                min="0"
                                placeholder={mat.initialStock}
                                value={selectedData?.stock || ''}
                                onChange={(e) =>
                                  handleSizeOverrideChange(
                                    mat.id,
                                    size.name,
                                    'stock',
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 bg-[#FAF8FC] border border-[#DFD0EC] rounded-lg text-xs font-bold text-zinc-800"
                              />
                            </div>
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
      {/* SECCIÓN 4: COLORES DE ACABADO & FOTOGRAFÍAS */}
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
              Cada combinación de color de metal y gema debe contar con al menos una fotografía subida.
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-5 h-5 rounded-full bg-[#F0E9F5] text-[#3F235F] text-[10px] font-bold flex items-center justify-center">
                              {cIdx + 1}
                            </span>
                            <span className="text-xs font-bold text-zinc-800">
                              Combinación de Color #{cIdx + 1}:
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

                        {/* Selects de Color */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-bold text-zinc-700 block">Color del Metal</label>
                            <CustomSelect
                              value={col.metalColor}
                              onChange={(val) =>
                                handleColorChange(mat.id, col.id, 'metalColor', val)
                              }
                              options={metalColorOptions}
                              triggerClassName="py-2.5 px-3.5 rounded-xl bg-[#FAF8FC] border border-[#DFD0EC] text-xs font-semibold text-zinc-900"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-zinc-700 block">Color / Tipo de Gema</label>
                            <CustomSelect
                              value={col.gemColor}
                              onChange={(val) =>
                                handleColorChange(mat.id, col.id, 'gemColor', val)
                              }
                              options={gemColorOptions}
                              triggerClassName="py-2.5 px-3.5 rounded-xl bg-[#FAF8FC] border border-[#DFD0EC] text-xs font-semibold text-zinc-900"
                            />
                          </div>
                        </div>

                        {/* Subida de Fotografías */}
                        <div className="space-y-3 pt-2 border-t border-[#DFD0EC]/60">
                          <span className="font-bold text-xs text-zinc-800 block">
                            Fotografías para este acabado:
                          </span>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8FC] hover:bg-[#F0E9F5] border border-[#DFD0EC] text-xs font-bold text-[#3F235F] cursor-pointer transition">
                              <Upload size={14} className="text-[#7043A0]" />
                              <span>Elegir Foto desde Ordenador</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileSelect(mat.id, col.id, file);
                                }}
                              />
                            </label>
                          </div>

                          {/* Previsualización antes de confirmar */}
                          {col.pendingPreviewUrl && (
                            <div className="p-3 bg-[#F0E9F5]/40 border border-[#DFD0EC] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden relative border border-[#DFD0EC] bg-white shrink-0">
                                  <Image
                                    src={col.pendingPreviewUrl}
                                    alt="Vista previa"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-xs font-bold text-zinc-800 block">
                                    {col.pendingFile?.name}
                                  </span>
                                  <input
                                    type="text"
                                    placeholder="Etiqueta opcional (ej: Ángulo frontal, En modelo...)"
                                    value={col.pendingImageLabel}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setMaterialVariants((prev) =>
                                        prev.map((m) =>
                                          m.id === mat.id
                                            ? {
                                                ...m,
                                                colors: m.colors.map((c) =>
                                                  c.id === col.id
                                                    ? { ...c, pendingImageLabel: val }
                                                    : c
                                                ),
                                              }
                                            : m
                                        )
                                      );
                                    }}
                                    className="px-3 py-1 bg-white border border-[#DFD0EC] rounded-lg text-xs w-full sm:w-64 focus:outline-hidden focus:border-[#7043A0]"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleCancelPending(mat.id, col.id)}
                                  className="px-3 py-1.5 rounded-xl border border-[#DFD0EC] bg-white text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  disabled={col.uploadingImage}
                                  onClick={() => handleConfirmUpload(mat.id, col.id)}
                                  className="px-4 py-1.5 rounded-xl btn-purple-diamond text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                  {col.uploadingImage ? 'Subiendo...' : 'Confirmar y Añadir'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Galería de fotos subidas */}
                          {col.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                              {col.images.map((img, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className="relative group bg-[#FAF8FC] border border-[#DFD0EC] rounded-2xl overflow-hidden p-1.5 space-y-1"
                                >
                                  <div className="aspect-square relative rounded-xl overflow-hidden bg-white">
                                    <Image
                                      src={img.url}
                                      alt=""
                                      fill
                                      className="object-cover"
                                    />
                                    {img.isPrimary && (
                                      <span className="absolute top-1 left-1 bg-[#3F235F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                                        Principal
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] px-1">
                                    {!img.isPrimary && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSetPrimaryImage(mat.id, col.id, imgIdx)
                                        }
                                        className="text-[#7043A0] hover:underline font-bold cursor-pointer"
                                      >
                                        Hacer Principal
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveColorImage(mat.id, col.id, imgIdx)
                                      }
                                      className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer ml-auto"
                                      title="Eliminar foto"
                                    >
                                      <Trash2 size={11} />
                                    </button>
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
      {/* SECCIÓN 5: ESTADO DE LA PUBLICACIÓN & VISIBILIDAD */}
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
              Define si la joya está visible para todos los clientes en la tienda o si se mantiene como borrador oculto para revisión interna del administrador.
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
                La joya está activa y visible en el catálogo, buscador y páginas para todos los clientes.
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
          {loading ? 'Guardando Cambios...' : 'Guardar y Actualizar Joya'}
        </button>
      </div>
    </form>
  );
}

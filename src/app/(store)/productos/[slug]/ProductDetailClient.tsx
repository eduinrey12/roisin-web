'use client';

import { useState, useMemo, useEffect } from 'react';
import ProductGallery from '@/components/storefront/ProductGallery';
import AddToCartSection from '@/components/storefront/AddToCartSection';

interface ProductDetailClientProps {
  product: {
    id: string;
    slug: string;
    title: string;
    tag?: string | null;
    shortDescription?: string | null;
    description: string;
    basePrice: any;
    compareAtPrice?: any;
    discountPercent?: number | null;
    images: {
      id?: string;
      url: string;
      label?: string | null;
      altText?: string | null;
      isPrimary: boolean;
      sortOrder?: number;
    }[];
    variants: {
      id: string;
      sku: string;
      price: any;
      compareAtPrice?: any;
      inventory?: { quantity: number } | null;
      attributes?: {
        attributeValue: {
          id?: string;
          value: string;
          attribute: { id?: string; name: string };
        };
      }[];
    }[];
    optionGroupLinks?: any[];
    category?: { id: string; name: string; slug: string } | null;
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  // 1. Extract and categorize all attribute values
  const {
    materialsList,
    materialToColorsMap,
    materialToSizesMap,
    colorToHexMap,
  } = useMemo(() => {
    const materialsSet = new Set<string>();
    const matColorsMap: Record<string, Set<string>> = {};
    const matSizesMap: Record<string, Set<string>> = {};
    const colorHex: Record<string, string> = {};

    product.variants.forEach((v) => {
      let variantMaterial = '';
      let variantColor = '';
      let variantSize = '';

      v.attributes?.forEach((a) => {
        const attrName = a.attributeValue.attribute.name.toLowerCase();
        const val = a.attributeValue.value.trim();

        if (attrName.includes('material')) {
          variantMaterial = val;
          materialsSet.add(val);
        } else if (
          attrName.includes('color') ||
          attrName.includes('acabado') ||
          attrName.includes('metal') ||
          attrName.includes('gema')
        ) {
          variantColor = val;
        } else if (
          attrName.includes('talla') ||
          attrName.includes('medida') ||
          attrName.includes('longitud') ||
          attrName.includes('tamaño')
        ) {
          variantSize = val;
        }
      });

      // If no explicit material attribute, check if color or variant has material info
      if (!variantMaterial && materialsSet.size === 0) {
        variantMaterial = 'Plata de Ley 925';
        materialsSet.add(variantMaterial);
      }

      if (variantMaterial) {
        if (!matColorsMap[variantMaterial]) matColorsMap[variantMaterial] = new Set();
        if (variantColor) matColorsMap[variantMaterial].add(variantColor);

        if (!matSizesMap[variantMaterial]) matSizesMap[variantMaterial] = new Set();
        if (variantSize) matSizesMap[variantMaterial].add(variantSize);
      }
    });

    const materialsArray = Array.from(materialsSet);

    // Color to HEX mapping heuristics
    product.images.forEach((img) => {
      const label = (img.label || '').toLowerCase();
      if (label.includes('dorado') || label.includes('oro 18k') || label.includes('amarillo')) {
        colorHex['dorado'] = '#D4AF37';
      }
      if (label.includes('plata') || label.includes('rodio') || label.includes('plateado')) {
        colorHex['plateado'] = '#E5E7EB';
      }
      if (label.includes('oro rosa') || label.includes('rose')) {
        colorHex['oro rosa'] = '#E8A598';
      }
      if (label.includes('morada') || label.includes('amatista')) {
        colorHex['amatista'] = '#7043A0';
      }
      if (label.includes('esmeralda') || label.includes('verde')) {
        colorHex['esmeralda'] = '#047857';
      }
      if (label.includes('rojo') || label.includes('rubí')) {
        colorHex['rubí'] = '#B91C1C';
      }
      if (label.includes('azul') || label.includes('zafiro')) {
        colorHex['zafiro'] = '#1D4ED8';
      }
    });

    return {
      materialsList: materialsArray.length > 0 ? materialsArray : ['Plata de Ley 925'],
      materialToColorsMap: Object.fromEntries(
        Object.entries(matColorsMap).map(([k, v]) => [k, Array.from(v)])
      ),
      materialToSizesMap: Object.fromEntries(
        Object.entries(matSizesMap).map(([k, v]) => [k, Array.from(v)])
      ),
      colorToHexMap: colorHex,
    };
  }, [product.variants, product.images]);

  // Initial State: Default active selections
  const defaultMaterial = materialsList[0] || 'Plata de Ley 925';
  const defaultColors = materialToColorsMap[defaultMaterial] || [];
  const defaultSizes = materialToSizesMap[defaultMaterial] || [];

  const [selectedMaterial, setSelectedMaterial] = useState<string>(defaultMaterial);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColors[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(defaultSizes[0] || '');

  // Keep colors and sizes synchronized when selectedMaterial changes
  const availableColorsForMaterial = useMemo(() => {
    const cols = materialToColorsMap[selectedMaterial] || [];
    return cols;
  }, [materialToColorsMap, selectedMaterial]);

  const availableSizesForMaterial = useMemo(() => {
    const sizes = materialToSizesMap[selectedMaterial] || [];
    return sizes;
  }, [materialToSizesMap, selectedMaterial]);

  const handleSelectMaterial = (mat: string) => {
    setSelectedMaterial(mat);
    const newColors = materialToColorsMap[mat] || [];
    if (!newColors.includes(selectedColor)) {
      setSelectedColor(newColors[0] || '');
    }
    const newSizes = materialToSizesMap[mat] || [];
    if (!newSizes.includes(selectedSize)) {
      setSelectedSize(newSizes[0] || '');
    }
  };

  // Find exact matching variant
  const activeVariant = useMemo(() => {
    // 1. Try match all 3 (Material + Color + Size)
    let match = product.variants.find((v) => {
      const attrs = v.attributes?.map((a) => a.attributeValue.value.toLowerCase()) || [];
      const hasMat = !selectedMaterial || attrs.includes(selectedMaterial.toLowerCase());
      const hasCol = !selectedColor || attrs.includes(selectedColor.toLowerCase());
      const hasSz = !selectedSize || attrs.includes(selectedSize.toLowerCase());
      return hasMat && hasCol && hasSz;
    });

    // 2. Try match Material + Color
    if (!match && selectedColor) {
      match = product.variants.find((v) => {
        const attrs = v.attributes?.map((a) => a.attributeValue.value.toLowerCase()) || [];
        const hasMat = !selectedMaterial || attrs.includes(selectedMaterial.toLowerCase());
        const hasCol = attrs.includes(selectedColor.toLowerCase());
        return hasMat && hasCol;
      });
    }

    // 3. Try match Material
    if (!match && selectedMaterial) {
      match = product.variants.find((v) => {
        const attrs = v.attributes?.map((a) => a.attributeValue.value.toLowerCase()) || [];
        return attrs.includes(selectedMaterial.toLowerCase());
      });
    }

    return match || product.variants[0];
  }, [product.variants, selectedMaterial, selectedColor, selectedSize]);

// Helper to parse image label and extract custom label, material, metal and gem
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

  // Dynamic Image Gallery: Filter photos strictly by selected finish/color and material
  const activeImages = useMemo(() => {
    if (!product.images || product.images.length === 0) {
      return [];
    }

    const matLower = (selectedMaterial || '').toLowerCase().trim();
    const slashParts = (selectedColor || '').split('/').map((s) => s.trim().toLowerCase());
    const metalLower = slashParts[0] || '';
    const gemLower = slashParts[1] || '';

    // 1. Exact match by structured label: (material + metal + gem)
    const exactMatches = product.images.filter((img) => {
      const parsed = parseProductImageLabel(img.label);
      if (parsed.material) {
        const matMatches = !matLower || parsed.material.toLowerCase() === matLower;
        const metalMatches = !metalLower || !parsed.metal || parsed.metal.toLowerCase() === metalLower;
        const gemMatches = !gemLower || !parsed.gem || parsed.gem.toLowerCase() === gemLower;
        return matMatches && metalMatches && (gemMatches || !gemLower);
      }
      return false;
    });

    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // 2. Strict text match for legacy or non-piped images
    if (selectedColor) {
      const textMatches = product.images.filter((img) => {
        const text = `${img.label || ''} ${img.altText || ''}`.toLowerCase();
        const matchesMat = !matLower || text.includes(matLower);
        const matchesMetal = !metalLower || text.includes(metalLower);
        const matchesGem = !gemLower || text.includes(gemLower);
        return matchesMat && matchesMetal && matchesGem;
      });

      if (textMatches.length > 0) {
        return textMatches;
      }
    }

    // 3. Fallback for material
    if (selectedMaterial) {
      const matMatches = product.images.filter((img) => {
        const parsed = parseProductImageLabel(img.label);
        if (parsed.material) {
          return parsed.material.toLowerCase() === matLower;
        }
        const text = `${img.label || ''} ${img.altText || ''}`.toLowerCase();
        return text.includes(matLower);
      });
      if (matMatches.length > 0) {
        return matMatches;
      }
    }

    // 4. Default: All images of the product
    return product.images;
  }, [product.images, selectedMaterial, selectedColor]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
      {/* Left Column: Sticky Gallery with Direct Navigation Arrows & Discount Badge */}
      <div className="lg:col-span-6 lg:sticky lg:top-24 self-start">
        <ProductGallery
          images={activeImages}
          title={product.title}
          discountPercent={product.discountPercent}
          compareAtPrice={activeVariant?.compareAtPrice || product.compareAtPrice}
          basePrice={activeVariant?.price || product.basePrice}
        />
      </div>

      {/* Right Column: Title -> Short Desc -> Long Desc -> Price -> Variants -> Presentations Carousel -> Dedication -> Add to Cart */}
      <div className="lg:col-span-6 flex flex-col">
        <AddToCartSection
          product={product}
          selectedMaterial={selectedMaterial}
          onSelectMaterial={handleSelectMaterial}
          materialsList={materialsList}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          availableColors={availableColorsForMaterial}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          availableSizes={availableSizesForMaterial}
          activeVariant={activeVariant}
        />
      </div>
    </div>
  );
}

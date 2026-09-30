/**
 * Utility to resolve and merge category attributes with parent-child inheritance.
 * Supports separating attributes into Specifications vs Variants.
 */

export function resolveCategoryAttributes(selectedCategorySlug, categories = []) {
  if (!selectedCategorySlug || !Array.isArray(categories)) {
    return {
      allAttributes: [],
      specifications: [],
      variants: [],
      parentCategory: null,
      childCategory: null,
    };
  }

  const categoryVal = typeof selectedCategorySlug === "object" && selectedCategorySlug !== null
    ? (selectedCategorySlug.slug || selectedCategorySlug.name || selectedCategorySlug._id || "")
    : String(selectedCategorySlug || "");
  const targetStr = categoryVal.trim().toLowerCase();

  let parentCategory = null;
  let childCategory = null;

  // Search categories tree with flexible case-insensitive matching (slug, name, _id)
  for (const parent of categories) {
    const parentSlug = parent.slug ? String(parent.slug).trim().toLowerCase() : "";
    const parentName = parent.name ? String(parent.name).trim().toLowerCase() : "";
    const parentId = parent._id ? String(parent._id).trim().toLowerCase() : "";

    if (targetStr && (parentSlug === targetStr || parentName === targetStr || parentId === targetStr)) {
      parentCategory = parent;
      break;
    }

    if (Array.isArray(parent.children)) {
      const foundChild = parent.children.find((child) => {
        const childSlug = child.slug ? String(child.slug).trim().toLowerCase() : "";
        const childName = child.name ? String(child.name).trim().toLowerCase() : "";
        const childId = child._id ? String(child._id).trim().toLowerCase() : "";
        return targetStr && (childSlug === targetStr || childName === targetStr || childId === targetStr);
      });

      if (foundChild) {
        parentCategory = parent;
        childCategory = foundChild;
        break;
      }
    }
  }

  if (!parentCategory) {
    return {
      allAttributes: [],
      specifications: [],
      variants: [],
      parentCategory: null,
      childCategory: null,
    };
  }

  const parentAttrs = Array.isArray(parentCategory.attributes) ? parentCategory.attributes : [];
  const childAttrs = childCategory && Array.isArray(childCategory.attributes) ? childCategory.attributes : [];

  // Map parent attributes by key
  const attributeMap = new Map();

  parentAttrs.forEach((attr) => {
    if (attr && attr.key) {
      attributeMap.set(attr.key, { ...attr, inheritedFromParent: false });
    }
  });

  // Merge child attributes (overriding parent attributes with same key, or adding new ones)
  if (childCategory) {
    // If parent attributes exist, mark them as inherited unless overridden
    attributeMap.forEach((attr) => {
      attr.inheritedFromParent = true;
    });

    childAttrs.forEach((childAttr) => {
      if (childAttr && childAttr.key) {
        attributeMap.set(childAttr.key, { ...childAttr, inheritedFromParent: false });
      }
    });
  }

  const allAttributes = Array.from(attributeMap.values());
  const specifications = allAttributes.filter((attr) => !attr.useAsVariant);
  const variants = allAttributes.filter((attr) => Boolean(attr.useAsVariant));

  return {
    allAttributes,
    specifications,
    variants,
    parentCategory,
    childCategory,
  };
}

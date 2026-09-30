"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Folder, FolderGit2, ChevronDown } from "lucide-react";

export default function CategorySelect({
  categories = [],
  value = "",
  onChange,
  error = "",
  className = "",
  disabled = false,
}) {
  const [selectedMainSlug, setSelectedMainSlug] = useState("");
  const [selectedSubSlug, setSelectedSubSlug] = useState("");

  // Sync internal state with external value prop
  useEffect(() => {
    if (!value) {
      setSelectedMainSlug("");
      setSelectedSubSlug("");
      return;
    }

    // 1. Check if value is a main category slug
    const matchedMain = categories.find((cat) => cat.slug === value);
    if (matchedMain) {
      setSelectedMainSlug(matchedMain.slug);
      setSelectedSubSlug("");
      return;
    }

    // 2. Check if value is a sub category slug under any parent
    for (const parent of categories) {
      if (Array.isArray(parent.children)) {
        for (const child of parent.children) {
          if (child.slug === value) {
            setSelectedMainSlug(parent.slug);
            setSelectedSubSlug(child.slug);
            return;
          }
          if (Array.isArray(child.categories)) {
            for (const subCat of child.categories) {
              const subSlug = typeof subCat === "object" ? subCat.slug : subCat;
              if (subSlug === value) {
                setSelectedMainSlug(parent.slug);
                setSelectedSubSlug(subSlug);
                return;
              }
            }
          }
        }
      }
    }

    // If value wasn't found in tree, fallback
    setSelectedMainSlug(value);
    setSelectedSubSlug("");
  }, [value, categories]);

  // Find currently selected parent category object
  const currentParent = useMemo(() => {
    return categories.find((cat) => cat.slug === selectedMainSlug);
  }, [categories, selectedMainSlug]);

  // Get list of subcategories for the current parent
  const subCategoriesList = useMemo(() => {
    if (!currentParent || !Array.isArray(currentParent.children)) return [];

    const list = [];
    currentParent.children.forEach((child) => {
      list.push({
        slug: child.slug,
        name: child.name,
      });

      if (Array.isArray(child.categories) && child.categories.length > 0) {
        child.categories.forEach((subCat) => {
          const subSlug = typeof subCat === "object" ? subCat.slug : subCat;
          const subName = typeof subCat === "object" ? subCat.name : subCat;
          if (subSlug && subSlug !== child.slug) {
            list.push({
              slug: subSlug,
              name: `${child.name} → ${subName}`,
            });
          }
        });
      }
    });
    return list;
  }, [currentParent]);

  // Handle Main Category selection change
  const handleMainChange = (e) => {
    const newMainSlug = e.target.value;
    setSelectedMainSlug(newMainSlug);
    setSelectedSubSlug("");
    onChange?.(newMainSlug);
  };

  // Handle Sub Category selection change
  const handleSubChange = (e) => {
    const newSubSlug = e.target.value;
    setSelectedSubSlug(newSubSlug);
    // If subcategory selected, pass subcategory slug, else fallback to main category slug
    onChange?.(newSubSlug || selectedMainSlug);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Main Category Input */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Folder className="size-3.5 text-primary" />
            <span>Main Category *</span>
          </label>
          <div className="relative">
            <select
              value={selectedMainSlug}
              onChange={handleMainChange}
              disabled={disabled}
              className={`w-full appearance-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
                error && !selectedMainSlug
                  ? "border-destructive focus:border-destructive"
                  : "border-border focus:border-primary"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <option value="">Select Main Category</option>
              {Array.isArray(categories) &&
                categories.map((parent) => (
                  <option key={parent._id || parent.slug} value={parent.slug}>
                    {parent.name}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <ChevronDown className="size-4" />
            </div>
          </div>
        </div>

        {/* Sub Category Input */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <FolderGit2 className="size-3.5 text-primary" />
            <span>Sub Category</span>
          </label>
          <div className="relative">
            <select
              value={selectedSubSlug}
              onChange={handleSubChange}
              disabled={disabled || !selectedMainSlug || subCategoriesList.length === 0}
              className={`w-full appearance-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
                error && selectedMainSlug && !selectedSubSlug && subCategoriesList.length > 0
                  ? "border-destructive focus:border-destructive font-normal"
                  : "border-border focus:border-primary"
              } ${
                disabled || !selectedMainSlug || subCategoriesList.length === 0
                  ? "opacity-60 cursor-not-allowed bg-muted/40"
                  : "cursor-pointer"
              }`}
            >
              {!selectedMainSlug ? (
                <option value="">Select Main Category first</option>
              ) : subCategoriesList.length === 0 ? (
                <option value="">No Subcategories available</option>
              ) : (
                <>
                  <option value="">Select Sub Category (Optional)</option>
                  {subCategoriesList.map((sub) => (
                    <option key={sub.slug} value={sub.slug}>
                      {sub.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <ChevronDown className="size-4" />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
}


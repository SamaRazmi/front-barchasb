// api/apiCategories.ts
const BASE_URL = "/api";

export interface Category {
  id: string;
  name: string;
}

export interface SubCategory extends Category {
  parent?: string;
}

export interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "date";
}

export interface CategoryAttributesResponse {
  categoryName: string;
  fields: Field[];
}

// ========== Job Categories ==========
export const fetchMainCategories = async (): Promise<{
  categories: Category[];
}> => {
  const res = await fetch(`${BASE_URL}/job-categories/main`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch main categories");
  return res.json();
};

export const fetchSubCategories = async (
  parentId: string,
): Promise<{ categories: Category[] }> => {
  const res = await fetch(
    `${BASE_URL}/job-categories/sub?parentId=${parentId}`,
    {
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch sub categories");
  return res.json();
};

export const fetchAllSubCategories = async (): Promise<{
  categories: SubCategory[];
}> => {
  const res = await fetch(`${BASE_URL}/job-categories/sub/all`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch all sub categories");
  return res.json();
};

export const fetchJobsByMainCategory = async (
  mainCategoryId: string,
): Promise<{ status: string; jobs: any[] }> => {
  const res = await fetch(
    `${BASE_URL}/job-categories/main/${mainCategoryId}/jobs`,
    {
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch jobs by main category");
  return res.json();
};

// ========== Ad Categories ==========
// ========== Ad Categories ==========
export const fetchAdMainCategories = async (): Promise<{
  categories: Category[];
}> => {
  const res = await fetch(`${BASE_URL}/ad-categories/main`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch ad main categories");
  const data = await res.json();
  // تبدیل _id به id برای سازگاری با اینترفیس Category
  const categories = (data.categories || []).map((cat: any) => ({
    id: cat._id,
    name: cat.name,
  }));
  return { categories };
};

export const fetchAdSubCategories = async (
  categoryId: string,
): Promise<{
  category: {
    id: string;
    name: string;
    subCategories: Category[];
  };
}> => {
  const res = await fetch(
    `${BASE_URL}/ad-categories/${categoryId}/subcategories`,
    {
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to fetch ad sub categories");
  return res.json();
};

// ========== Ad Category Attributes ==========
export const fetchCategoryAttributes = async (
  categoryName: string,
): Promise<CategoryAttributesResponse> => {
  const res = await fetch(
    `${BASE_URL}/ad-category-attributes/${encodeURIComponent(categoryName)}`,
    {
      credentials: "include",
    },
  );
  if (!res.ok) {
    throw new Error("خطا در دریافت مشخصات دسته");
  }
  return res.json();
};

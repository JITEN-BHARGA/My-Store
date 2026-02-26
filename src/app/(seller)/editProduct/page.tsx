"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

type Attribute = {
  key: string;
  value: string;
};

interface Product {
  id: string;
  name: string;
  currentPrice: number;
  discount: number;
  itemInfo: string;
  category: string;
  companyName: string;
  stock: number;
  imageURL: string[];
  attributes: Record<string, string>;
  finalPrice?: number;
  isActive?: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([
    { key: "", value: "" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    currentPrice: "",
    discount: "0",
    itemInfo: "",
    category: "",
    companyName: "",
    stock: "0",
  });

  // Fetch product data on mount
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const product: Product = await res.json();

          // Populate form data
          setFormData({
            name: product.name || "",
            currentPrice: product.currentPrice?.toString() || "",
            discount: product.discount?.toString() || "0",
            itemInfo: product.itemInfo || "",
            category: product.category || "",
            companyName: product.companyName || "",
            stock: product.stock?.toString() || "0",
          });

          setImages(product.imageURL || []);

          // Convert attributes object to array
          if (product.attributes) {
            const attrArray: Attribute[] = Object.entries(product.attributes).map(
              ([key, value]) => ({ key, value })
            );
            setAttributes(attrArray.length > 0 ? attrArray : [{ key: "", value: "" }]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formDataUpload = new FormData();
    Array.from(files).forEach((file) => formDataUpload.append("files", file));

    try {
      setUploading(true);

      const res = await fetch("/api/image-uploader", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok || !Array.isArray(data.images)) return;

      const urls: string[] = data.images.map((img: any) => img.url);
      setImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addAttribute = () => setAttributes([...attributes, { key: "", value: "" }]);
  const removeAttribute = (index: number) =>
    setAttributes(attributes.filter((_, i) => i !== index));
  const updateAttribute = (index: number, field: "key" | "value", value: string) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const attributeObject = attributes.reduce((acc, attr) => {
      if (attr.key) acc[attr.key] = attr.value;
      return acc;
    }, {} as Record<string, string>);

    const payload = {
      ...formData,
      currentPrice: Number(formData.currentPrice),
      discount: Number(formData.discount),
      stock: Number(formData.stock),
      imageURL: images,
      attributes: attributeObject,
      finalPrice: Number(formData.currentPrice) * (1 - Number(formData.discount) / 100),
      isActive: true,
    };

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) router.push("/my-products");
    } finally {
      setLoading(false);
    }
  };

  if (loading && images.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading product data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-8">
        <h1 className="text-3xl font-bold text-indigo-600 mb-10">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* 🔹 BASIC INFO */}
          <Section title="Basic Information">
            <Grid>
              <Field label="Product Name">
                <Input name="name" value={formData.name} onChange={handleChange} required />
              </Field>
              <Field label="Category">
                <Input name="category" value={formData.category} onChange={handleChange} />
              </Field>
              <Field label="Company Name">
                <Input name="companyName" value={formData.companyName} onChange={handleChange} required />
              </Field>
              <Field label="Stock Quantity">
                <Input name="stock" type="number" value={formData.stock} onChange={handleChange} required />
              </Field>
            </Grid>
          </Section>

          {/* 🔹 PRICING */}
          <Section title="Pricing">
            <Grid>
              <Field label="Price ($)">
                <Input name="currentPrice" type="number" value={formData.currentPrice} onChange={handleChange} required />
              </Field>
              <Field label="Discount (%)">
                <Input name="discount" type="number" value={formData.discount} onChange={handleChange} />
              </Field>
            </Grid>
          </Section>

          {/* 🔹 IMAGES */}
          <Section title="Product Images">
            <div className="grid grid-cols-[200px_1fr] items-start gap-6">
              <p className="text-sm text-gray-600 pt-2">Upload multiple product images</p>
              <div className="space-y-4">
                <input type="file" multiple onChange={handleImageUpload} className="border border-gray-300 p-2 rounded-lg w-full" />
                {uploading && <p className="text-sm text-indigo-600">Uploading images...</p>}
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <div key={i} className="w-20 overflow-hidden rounded-lg border">
                      <img src={img} className="w-full h-full object-cover" alt={`Product image ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* 🔹 ATTRIBUTES */}
          <Section title="Attributes">
            <div className="space-y-3">
              {attributes.map((attr, index) => (
                <div key={index} className="grid grid-cols-[200px_1fr_1fr_auto] gap-4 items-center">
                  <p className="text-sm text-gray-600">Variable</p>
                  <input placeholder="Key" value={attr.key} onChange={(e) => updateAttribute(index, "key", e.target.value)} className="h-11 border border-gray-300 px-3 rounded-lg" />
                  <input placeholder="Value" value={attr.value} onChange={(e) => updateAttribute(index, "value", e.target.value)} className="h-11 border border-gray-300 px-3 rounded-lg" />
                  <button type="button" onClick={() => removeAttribute(index)} className="text-red-500 text-sm">Remove</button>
                </div>
              ))}
              <button type="button" onClick={addAttribute} className="text-indigo-600 font-semibold text-sm ml-[200px]">+ Add Attribute</button>
            </div>
          </Section>

          {/* 🔹 DESCRIPTION */}
          <Section title="Description">
            <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
              <p className="text-sm text-gray-600 pt-2">Detailed product description</p>
              <textarea name="itemInfo" value={formData.itemInfo} onChange={handleChange} required className="border border-gray-300 p-3 rounded-lg h-36 w-full focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </Section>

          {/* 🔹 SUBMIT */}
          <button type="submit" disabled={loading || uploading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
            {loading ? "Updating Product..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* 🔧 HELPERS */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 pb-8">
      <h2 className="text-lg font-semibold mb-6">{title}</h2>
      {children}
    </div>
  );
}


function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr_200px_1fr] gap-x-6 gap-y-4 items-center">
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <label className="text-sm text-gray-600">{label}</label>
      {children}
    </>
  );
}

function Input({
  name,
  type = "text",
  value,
  onChange,
  required = false,
}: {
  name: string;
  type?: string;
  value?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      required={required}
      onChange={onChange}
      className="h-11 border border-gray-300 px-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none"
    />
  );
}

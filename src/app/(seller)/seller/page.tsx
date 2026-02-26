"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import SellerNavbar from "@/components/sellerNavbar";

type Attribute = {
  key: string;
  value: string;
};

export enum Category {
  Electronics = "Electronics",
  Fashion = "Fashion",
  HomeKitchen = "Home & Kitchen",
  Beauty = "Beauty",
  Sports = "Sports",
  Books = "Books",
  Toys = "Toys",
  Groceries = "Groceries",
  Mobiles = "Mobiles",
  Accessories = "Accessories",
}

const categories = Object.values(Category);

export default function CreateProductPage() {
  const [loading, setLoading] = useState(false);
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
    category: "" as Category | "",
    companyName: "",
    stock: "0",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* 🔹 IMAGE UPLOAD (MAX 3) */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 3 - images.length;

    if (remainingSlots <= 0) {
      alert("You can upload only 3 images.");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more image(s) allowed.`);
    }

    const fd = new FormData();
    filesToUpload.forEach((file) => fd.append("files", file));

    try {
      setUploading(true);

      const res = await fetch("/api/image-uploader", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (Array.isArray(data.images)) {
        const urls = data.images.map((img: any) => img.url);

        setImages((prev) => {
          const updated = [...prev, ...urls];
          return updated.slice(0, 3); // 🔒 hard limit
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* 🔹 ATTRIBUTES */
  const addAttribute = () =>
    setAttributes([...attributes, { key: "", value: "" }]);

  const removeAttribute = (index: number) =>
    setAttributes(attributes.filter((_, i) => i !== index));

  const updateAttribute = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  /* 🔹 SUBMIT */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    /* ✅ REQUIRE EXACTLY 3 IMAGES */
    if (images.length !== 3) {
      alert("Please upload exactly 3 images.");
      setLoading(false);
      return;
    }

    const attributeObject = attributes.reduce(
      (acc, attr) => {
        if (attr.key) acc[attr.key] = attr.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    const payload = {
      ...formData,
      currentPrice: Number(formData.currentPrice),
      discount: Number(formData.discount),
      stock: Number(formData.stock),
      imageURL: images,
      attributes: attributeObject,
      finalPrice:
        Number(formData.currentPrice) * (1 - Number(formData.discount) / 100),
      isActive: true,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) window.location.href = "/my-products";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <SellerNavbar />

      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 md:px-8">
        <h1 className="text-3xl font-bold text-indigo-600 mb-10">
          Create Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* 🔹 BASIC INFO */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Product Name">
                <Input name="name" onChange={handleChange} required />
              </Field>

              <Field label="Category">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="h-11 border border-gray-300 px-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Company Name">
                <Input name="companyName" onChange={handleChange} required />
              </Field>

              <Field label="Stock Quantity">
                <Input
                  name="stock"
                  type="number"
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>
          </Section>

          {/* 🔹 PRICING */}
          <Section title="Pricing">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Price">
                <Input
                  name="currentPrice"
                  type="number"
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Discount (%)">
                <Input name="discount" type="number" onChange={handleChange} />
              </Field>
            </div>
          </Section>

          {/* 🔹 IMAGES */}
          <Section title="Product Images">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="border border-gray-300 p-2 rounded-lg w-full"
              disabled={images.length >= 3}
            />

            <p className="text-sm text-gray-500 mt-2">
              {images.length} / 3 images uploaded
            </p>

            {uploading && (
              <p className="text-sm text-indigo-600">Uploading images...</p>
            )}

            <div className="flex gap-3 overflow-x-auto mt-4">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="w-20 flex-shrink-0 overflow-hidden rounded-lg border"
                >
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </Section>

          {/* 🔹 ATTRIBUTES */}
          <Section title="Attributes">
            <div className="space-y-3">
              {attributes.map((attr, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3"
                >
                  <input
                    placeholder="Key"
                    value={attr.key}
                    onChange={(e) =>
                      updateAttribute(index, "key", e.target.value)
                    }
                    className="h-11 border border-gray-300 px-3 rounded-lg w-full"
                  />

                  <input
                    placeholder="Value"
                    value={attr.value}
                    onChange={(e) =>
                      updateAttribute(index, "value", e.target.value)
                    }
                    className="h-11 border border-gray-300 px-3 rounded-lg w-full"
                  />

                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addAttribute}
                className="text-indigo-600 font-semibold text-sm"
              >
                + Add Attribute
              </button>
            </div>
          </Section>

          {/* 🔹 DESCRIPTION */}
          <Section title="Description">
            <textarea
              name="itemInfo"
              onChange={handleChange}
              required
              className="border border-gray-300 p-3 rounded-lg h-36 w-full focus:ring-2 focus:ring-indigo-500"
            />
          </Section>

          {/* 🔹 SUBMIT */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {loading ? "Creating Product..." : "Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* 🔧 HELPERS */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
  onChange,
  required = false,
}: {
  name: string;
  type?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      onChange={onChange}
      className="h-11 border border-gray-300 px-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500"
    />
  );
}

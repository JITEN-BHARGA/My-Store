"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SellerNavbar from "@/components/sellerNavbar";

type Attribute = { key: string; value: string };

interface Product {
  name: string;
  currentPrice: number;
  discount: number;
  itemInfo: string;
  category: string;
  companyName: string;
  stock: number;
  imageURL: string[];
  attributes: Record<string, string>;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  console.log(productId);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log(productId);
        const res = await fetch(`/api/my-products/${productId}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!data?.product) return;

        const product: Product = data.product;

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

        if (product.attributes) {
          const attrArray: Attribute[] = Object.entries(product.attributes).map(
            ([key, value]) => ({ key, value }),
          );

          setAttributes(
            attrArray.length > 0 ? attrArray : [{ key: "", value: "" }],
          );
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= IMAGE UPLOAD ================= */
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

      if (!res.ok || !Array.isArray(data.images)) {
        console.error("Upload failed");
        return;
      }

      const urls: string[] = data.images.map((img: any) => img.url);
      setImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleImageDelete = async (index: number) => {
    const imageToDelete = images[index];

    if (!imageToDelete) return;

    try {
      // Extract the public_id from the Cloudinary URL
      // Assuming your URLs are like: https://res.cloudinary.com/.../v123456/ecommerce/<public_id>.jpg
      const urlParts = imageToDelete.split("/");
      const fileName = urlParts[urlParts.length - 1]; // e.g. "abc123.jpg"
      const public_id = `ecommerce/${fileName.split(".")[0]}`; // remove extension and prepend folder

      const res = await fetch(
        `/api/image-uploader?public_id=${encodeURIComponent(public_id)}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Failed to delete image:", data.message);
        return;
      }

      // Remove image locally
      setImages((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  /* ================= ATTRIBUTES ================= */
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

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("HANDLE SUBMIT CALLED");

    setSubmitting(true);

    const attributeObject = attributes.reduce(
      (acc, attr) => {
        if (attr.key) acc[attr.key] = attr.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    const price = parseFloat(formData.currentPrice || "0");
    const discount = parseFloat(formData.discount || "0");
    const stock = parseInt(formData.stock || "0");

    const payload = {
      ...formData,
      currentPrice: price,
      discount,
      stock,
      imageURL: images,
      attributes: attributeObject,
      finalPrice: price * (1 - discount / 100),
      isActive: true,
    };

    try {
      const res = await fetch(`/api/my-products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("PATCH STATUS:", res.status, data);

      if (res.ok) {
        setFormData({
          name: "",
          currentPrice: "",
          discount: "0",
          itemInfo: "",
          category: "",
          companyName: "",
          stock: "0",
        });
        router.push("/my-products");
      } else {
        alert(data?.message || "Update failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading product data...
      </div>
    );
  }

  const finalPrice = (
    parseFloat(formData.currentPrice || "0") *
    (1 - parseFloat(formData.discount || "0") / 100)
  ).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <SellerNavbar />

      <div className="max-w-6xl w-full mx-auto py-10 px-4 sm:px-8">
        <h1 className="text-3xl font-bold text-indigo-600 mb-10">
          Edit Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* BASIC INFO */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Product Name">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Category">
                <Input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Company Name">
                <Input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Stock Quantity">
                <Input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>
          </Section>

          {/* PRICING */}
          <Section title="Pricing">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Price (₹)">
                <Input
                  name="currentPrice"
                  type="number"
                  value={formData.currentPrice}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Discount (%)">
                <Input
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Final Price: ₹{finalPrice}
            </p>
          </Section>

          {/* IMAGES */}
          <Section title="Product Images">
            <input type="file" multiple onChange={handleImageUpload} />
            {uploading && <p>Uploading images...</p>}

            <div className="flex flex-wrap gap-3 mt-4">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img
                    src={img}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(i)}
                    className="absolute top-0 right-0 bg-black text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* ATTRIBUTES */}
          <Section title="Attributes">
            <div className="flex flex-col gap-2">
              {attributes.map((attr, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={attr.key}
                    placeholder="Key"
                    onChange={(e) =>
                      updateAttribute(index, "key", e.target.value)
                    }
                    className="border px-2 py-1 flex-1"
                  />
                  <input
                    value={attr.value}
                    placeholder="Value"
                    onChange={(e) =>
                      updateAttribute(index, "value", e.target.value)
                    }
                    className="border px-2 py-1 flex-1"
                  />
                  <button type="button" onClick={() => removeAttribute(index)}>
                    ❌
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addAttribute} className="mt-2">
              + Add Attribute
            </button>
          </Section>

          {/* DESCRIPTION */}
          <Section title="Description">
            <textarea
              name="itemInfo"
              value={formData.itemInfo}
              onChange={handleChange}
              className="border p-3 w-full"
            />
          </Section>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full bg-indigo-600 text-white py-3 rounded"
          >
            {submitting ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* 🔧 Helpers */
function Section({ title, children }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: any) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, children }: any) {
  return (
    <div>
      <label className="block text-sm text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function Input({
  name,
  type = "text",
  value,
  onChange,
  required = false,
}: any) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      required={required}
      onChange={onChange}
      className="border px-3 py-2 w-full"
    />
  );
}

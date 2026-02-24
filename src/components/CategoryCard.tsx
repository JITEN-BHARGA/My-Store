const categoryIcons: Record<string, string> = {
  Electronics: "💻",
  Fashion: "👕",
  "Home & Kitchen": "🏠",
  Beauty: "💄",
  Sports: "⚽",
  Books: "📚",
  Toys: "🧸",
  Groceries: "🛒",
  Mobiles: "📱",
  Accessories: "🎧",
};

type Props = {
  title: string;
};

export function CategoryCard({ title }: Props) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow flex items-center justify-center text-2xl md:text-3xl cursor-pointer hover:scale-105 transition">
        {categoryIcons[title]}
      </div>
    </div>
  );
}